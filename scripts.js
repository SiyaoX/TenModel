// Instantly scroll to the top on page load (no animation)
window.onload = () => {
    window.scrollTo(0, 0); // Scroll to top instantly
};

// Default tab and load products after the page fully loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    // Activate the default tab after a slight delay
    setTimeout(() => {
        const defaultTab = document.querySelector('.tab.active-tab');
        if (defaultTab) {
            openTab({ currentTarget: defaultTab }, defaultTab.getAttribute('aria-controls'), false); // Simulate a click on the default tab without smooth scroll
        }
    }, 0); // Execute after onload completes
});

// Function to handle tab switching
function openTab(evt, tabName, shouldScroll = true) {
    // Hide all tab content
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

    // Remove active class from all tabs
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active-tab"));

    // Show the clicked tab content and add active class to the clicked tab
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add("active");
    }
    evt.currentTarget.classList.add("active-tab");

    // Ensure smooth scroll only when clicking a tab manually
    if (shouldScroll) {
        window.scrollTo({ top: 655, behavior: 'smooth' }); // Smooth scroll on manual tab click
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
    const categoryMap = { 'sm': 1, 'gundam': 2, 'figure': 3 };
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
