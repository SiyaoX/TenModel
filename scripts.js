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
    'static_models': 'tab1',
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

// Function to load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to load products JSON');
        
        window.products = await response.json(); // Keeping this as is
        console.log('Products loaded:', window.products);

        window.products.forEach(product => {
            const tabId = getTabIdForCategory(product.Category.toLowerCase());
            if (tabId) appendProductToTab(tabId, product);
            else console.error(`Invalid category "${product.Category}" in product data.`);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Get tab ID based on product category
function getTabIdForCategory(category) {
    const categoryMap = { 'static models': 1, 'rc models': 2, 'tool parts': 3, 'contact us': 4 };
    return categoryMap[category] || null;
}

// Append product to the appropriate tab content
function appendProductToTab(tabId, product) {
    const container = document.querySelector(`#tab${tabId} .item-list`);
    if (!container) return console.error(`Container for tab ${tabId} not found.`);

    const listItem = document.createElement('li');
    listItem.classList.add('item');
    listItem.innerHTML = `
        <div style="width: 100%; position: relative; padding-top: 100%; max-width: 500px;">
            <img src="${product.CoverImg}" alt="${product.Name}" onclick="openProductDetail('${product.SKU}')"
                 style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="attributes">
            <h3>${product.Name}</h3>
            
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <p>${product.ModType}</p>
                <p>${product.Ratio}</p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <p>US$ ${product.Price}</p>
                <p class="status-link" style="font-size: 20px; color: #F84242; cursor: pointer;">
                    ${product.Status}
                </p>
            </div>

            <p style="margin-top: 10px;">${product.Date}</p>
        </div>
    `;
    container.appendChild(listItem);

    // Add event listener to status element to open the "Contact Us" tab
    listItem.querySelector('.status-link').addEventListener('click', function () {
        // Update the URL to reflect the new active tab
        history.pushState(null, "", `${window.location.pathname}?tab=contact&scroll=true`);

        // Find the correct tab button and activate it
        const tabToActivate = document.querySelector(`.tab[aria-controls="tab4"]`);
        if (tabToActivate) {
            openTab({ currentTarget: tabToActivate }, "tab4", true);
        }
    });
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

document.querySelector('.contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    // Handle form submission, e.g., send data to a server
    alert('Thank you for contacting us! We will get back to you soon.');
});