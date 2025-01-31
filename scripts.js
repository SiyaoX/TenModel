// Smooth scroll to the top on page load
window.onload = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// Default tab and load products when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.tab').click();
    loadProducts();
});

// Function to handle tab switching
function openTab(evt, tabName) {
    // Hide all tab content
    document.querySelectorAll(".tab-content").forEach(content => content.style.display = "none");

    // Remove active class from all tabs
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active-tab"));

    // Show the clicked tab content and add active class to the clicked tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active-tab");

    window.scrollTo({top:  655 , behavior: 'smooth' });
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
