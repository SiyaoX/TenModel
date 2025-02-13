// Conditionally scroll to the top on page load
window.onload = () => {
    // let firstTab = document.querySelector('.tab');
    // firstTab.classList.add('active-tab');
    // let firstImg = firstTab.querySelector('.tab-icon');
    // firstImg.src = "./resources/img/icon/" + firstTab.getAttribute('data-icon-active');

    const params = new URLSearchParams(window.location.search);
    const shouldScroll = params.get("scroll") === "true";

    // Only scroll to top if ?scroll=true is NOT present
    if (!shouldScroll) {
        window.scrollTo(0, 0); // Scroll to top instantly
    }
};

// Default tab and load products after the page fully loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    activateTabFromURL();
});

// Function to handle tab switching and update URL
function openTab(evt, tabName, shouldScroll = true) {
    let tabs = document.querySelectorAll('.tab');

    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    tabs.forEach(tab => {
        tab.classList.remove("active-tab");
        let img = tab.querySelector('.tab-icon');
        img.src = "resources/img/icon/" + tab.getAttribute('data-icon');
    });

    const tabContent = document.getElementById(tabName);
    if (tabContent) tabContent.classList.add("active");

    if (evt && evt.currentTarget) evt.currentTarget.classList.add("active-tab");
    let activeImg = evt.currentTarget.querySelector('.tab-icon');
    activeImg.src = "resources/img/icon/" + evt.currentTarget.getAttribute('data-icon-active');

    // Update the URL without reloading the page
    const urlTab = Object.keys(tabMap).find(key => tabMap[key] === tabName);
    if (urlTab) {
        const newUrl = `${window.location.pathname}?tab=${urlTab}`;
        history.pushState(null, "", newUrl);
    }

    if (shouldScroll) {
        window.scrollTo({ top: 655, behavior: 'smooth' });
    }
}

// Function to Change Icon on Hover
function hoverTab(tab, isHovering) {
    let img = tab.querySelector('.tab-icon');

    // If it's active, do nothing (keep active icon)
    if (tab.classList.contains('active-tab')) return;

    // Change to hover color icon if hovering, otherwise revert
    img.src = isHovering ? "resources/img/icon/" + tab.getAttribute('data-icon-hover')
        : "resources/img/icon/" + tab.getAttribute('data-icon');
}

// Function to handle tab switching without scrolling
function openTabWithoutScroll(evt, tabName) {
    openTab(evt, tabName, false);
}

// Function to extract tab parameter from URL
function getTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab"); // Returns the value of "tab" parameter if present
}

// Map URL tab names to actual tab IDs used in the HTML
const tabMap = {
    'about_us': 'tab0',
    'gunpla': 'tab1',
    'rc_models': 'tab2',
    'tool_parts': 'tab3',
    'how_to_order': 'tab4',
    'contact_us': 'tab5'
};

// Function to activate the correct tab based on the URL parameter
function activateTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab"); // Extract ?tab= value
    const shouldScroll = params.get("scroll") === "true"; // Check if we should scroll

    console.log("activateTabFromURL called"); // Debugging
    console.log(`shouldScroll: ${shouldScroll}`); // Debugging

    if (tabParam && tabMap[tabParam]) {
        const tabId = tabMap[tabParam]; // Get the actual tab ID
        const tabToActivate = document.querySelector(`.tab[aria-controls="${tabId}"]`);

        if (tabToActivate) {
            console.log(`Activating tab: ${tabId}`); // Debugging
            openTab({ currentTarget: tabToActivate }, tabId, false);

            // Scroll after activating the tab if ?scroll=true
            if (shouldScroll) {
                console.log("Scrolling to 655"); // Debugging
                setTimeout(() => {
                    window.scrollTo({ top: 655, behavior: 'smooth' });

                    // Check if the scroll completed successfully
                    setTimeout(() => {
                        if (window.scrollY < 655) {
                            console.warn("Scroll interrupted, retrying...");
                            window.scrollTo({ top: 655, behavior: 'smooth' });
                        }
                    }, 1000); // Check after 1 second
                }, 500); // Initial delay
            }
        } else {
            console.error(`Tab '${tabId}' not found in the DOM.`);
        }
    } else {
        console.warn("No valid tab parameter found, using default tab.");
        // Fallback to the default active tab
        const defaultTab = document.querySelector('.tab.active-tab');
        if (defaultTab) {
            openTab({ currentTarget: defaultTab }, defaultTab.getAttribute('aria-controls'), false);
        }
    }
}

// Store original product order
let originalProducts = [];

// Function to load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to load products JSON');

        window.products = await response.json();
        originalProducts = [...window.products]; // Store original order
        console.log('Products loaded:', window.products);

        renderProducts(window.products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Function to render products based on sorting
function renderProducts(products) {
    // Clear existing product listings
    document.querySelectorAll('.container').forEach(container => container.innerHTML = '');

    products.forEach(product => {
        const tabId = getTabIdForCategory(product.Category.toLowerCase());
        if (tabId) appendProductToTab(tabId, product);
        else console.error(`Invalid category "${product.Category}" in product data.`);
    });
}

// Sorting logic
function sortProducts(sortOption) {
    if (sortOption === 'default') {
        renderProducts(originalProducts); // Restore original order
    } else {
        const sortedProducts = [...window.products];

        if (sortOption === 'price-low-to-high') {
            sortedProducts.sort((a, b) => a.Price - b.Price);
        } else if (sortOption === 'price-high-to-low') {
            sortedProducts.sort((a, b) => b.Price - a.Price);
        } else if (sortOption === 'name-a-to-z') {
            sortedProducts.sort((a, b) => a.Name.localeCompare(b.Name));
        } else if (sortOption === 'name-z-to-a') {
            sortedProducts.sort((a, b) => b.Name.localeCompare(a.Name));
        }

        renderProducts(sortedProducts);
    }
}

// Event listener for sorting
document.getElementById('sort-by').addEventListener('change', (event) => {
    sortProducts(event.target.value);
});

// Get tab ID based on product category
function getTabIdForCategory(category) {
    const categoryMap = { 'gunpla': 1, 'rc models': 2, 'tool parts': 3, 'contact us': 4 };
    return categoryMap[category] || null;
}

// Append product to the appropriate tab content
function appendProductToTab(tabId, product) {
    const container = document.querySelector(`#tab${tabId} .container`);
    if (!container) return console.error(`Container for tab ${tabId} not found.`);

    const listItem = document.createElement('li');
    listItem.classList.add('item');

    // Create the base structure
    listItem.innerHTML = `
        <div class="image-container" onclick="openProductDetail('${product.SKU}')">
            <img src="${product.CoverImg}" alt="${product.Name}">
            <div class="overlay"></div>
        </div>

        <div class="attributes">
            <h3>${product.Name}</h3>

            <ul class="feature-list"></ul> <!-- Empty list for features -->
            <!-- Wrapper to push date and status to bottom -->
            <div class="bottom-info">
                
                <p style="color: #F84242;">${product.Status}</p>
            </div>
        </div>
    `;

    const featureList = listItem.querySelector('.feature-list');

    // Append each feature as a separate <li> tag with a dot
    if (product.Features && product.Features.length) {
        product.Features.forEach(feature => {
            const featureElement = document.createElement('li');
            featureElement.textContent = `${feature}`; // Add dot before text
            featureList.appendChild(featureElement);
        });
    } else {
        const noFeature = document.createElement('li');
        noFeature.textContent = 'No features listed';
        featureList.appendChild(noFeature);
    }

    container.appendChild(listItem);
}

// Function to open product detail page
function openProductDetail(SKU) {
    const product = findProductById(SKU);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product-details.html';

        // Add the current tab as a parameter to return to the same section
        const activeTab = document.querySelector('.tab.active-tab');
        const tabParam = activeTab ? activeTab.getAttribute('aria-controls') : '';

        window.location.href = `product-details.html?returnTab=${tabParam}`;
    } else {
        console.error('Product not found:', SKU);
    }
}

// Helper function to find a product by SKU
function findProductById(SKU) {
    return window.products.find(product => product.SKU === SKU);
}

document.querySelector('.navigation-container a').addEventListener('click', function () {
    window.scrollTo({ top: 655, behavior: 'smooth' });
});

document.querySelector('.contact-form').addEventListener('submit', function (event) {
    event.preventDefault();
    // Handle form submission, e.g., send data to a server
    alert('Thank you for contacting us! We will get back to you soon.');
});

document.addEventListener("DOMContentLoaded", function () {
    function removeFocus(event) {
        event.target.blur();
    }

    // Handle filter dropdown
    document.querySelector(".filter-button").addEventListener("click", function () {
        setTimeout(() => this.blur(), 100); // Blur after clicking
    });

    // Handle select elements
    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", removeFocus);
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", function (event) {
        const filterDropdown = document.querySelector(".filter-dropdown");
        if (!filterDropdown.contains(event.target)) {
            document.querySelector(".filter-button").blur();
        }
    });
});
