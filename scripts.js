// Instantly scroll to the top on page load (no animation)
window.onload = () => {
    window.scrollTo(0, 0); // Scroll to top instantly
};

// Default tab and load products after the page fully loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    activateTabFromURL();
});

// Function to handle tab switching and update URL
function openTab(evt, tabName, shouldScroll = true) {
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active-tab"));

    const tabContent = document.getElementById(tabName);
    if (tabContent) tabContent.classList.add("active");

    if (evt && evt.currentTarget) evt.currentTarget.classList.add("active-tab");

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

// Function to extract tab parameter from URL
function getTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab"); // Returns the value of "tab" parameter if present
}

// Map URL tab names to actual tab IDs used in the HTML
const tabMap = {
    'static-models': 'tab1',
    'rc-models': 'tab2',
    'tool-parts': 'tab3',
    'contact-us': 'tab4'
};

// Function to activate the correct tab based on the URL parameter
function activateTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab"); // Extract ?tab= value

    if (tabParam && tabMap[tabParam]) {
        const tabId = tabMap[tabParam]; // Get the actual tab ID
        const tabToActivate = document.querySelector(`.tab[aria-controls="${tabId}"]`);
        
        if (tabToActivate) {
            openTab({ currentTarget: tabToActivate }, tabId, false);
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
    const categoryMap = { 'static-models': 1, 'rc-models': 2, 'tool-parts': 3, 'contact-us': 4 };
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
            <p style="margin-top: 10px;">US$ ${product.Price}</p>
            <p style="font-size: 20px; color: #F84242;">${product.Status}</p>
        </div>
    `;
    container.appendChild(listItem);
}

// Function to open product detail page
function openProductDetail(SKU) {
    const product = findProductById(SKU);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product-details.html';
    } else {
        console.error('Product not found:', SKU);
    }
}

// Helper function to find a product by SKU
function findProductById(SKU) {
    return window.products.find(product => product.SKU === SKU);
}
