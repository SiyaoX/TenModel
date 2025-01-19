document.addEventListener('DOMContentLoaded', () => {
    // Default to the first tab
    document.querySelector('.tab').click();
    loadProducts();
});

// Function to handle tab switching
function openTab(event, tabId) {
    // Hide all tab content and remove 'active' classes
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-content'));
    document.querySelectorAll('.tab').forEach(button => button.classList.remove('active-tab'));

    // Show the selected tab content and highlight the selected tab
    document.getElementById(tabId).classList.add('active-content');
    event.currentTarget.classList.add('active-tab');
}

// Function to load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to load products JSON');
        
        const products = await response.json();
        console.log('Products loaded:', products); // Debugging

        products.forEach(product => {
            const category = product.Category.toLowerCase();
            const tabId = getTabIdForCategory(category);

            if (tabId) {
                appendProductToTab(tabId, product);
            } else {
                console.error(`Invalid category "${category}" in product data.`);
            }
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Get tab ID based on product category
function getTabIdForCategory(category) {
    switch (category) {
        case 'tank': return 1;
        case 'gundam': return 2;
        case 'figure': return 3;
        default: return null;
    }
}

// Append product to the appropriate tab content
function appendProductToTab(tabId, product) {
    const container = document.querySelector(`#tab${tabId} .item-list`);
    if (!container) {
        console.error(`Container for tab ${tabId} not found.`);
        return;
    }

    const listItem = document.createElement('li');
    listItem.classList.add('item');
    listItem.innerHTML = `
        <img src="${product.CoverImg}" alt="${product.Name}" onclick="openProductDetail('${product.ProductID}')">
        <div class="attributes">
            <h3>${product.Name}</h3>
            <p><strong>Price:</strong> ${product.Price}</p>
            <p><strong>Product ID:</strong> ${product.ProductID}</p>
            <p><strong>Release Date:</strong> ${product.ReleaseDate}</p>
            <p><strong>Model:</strong> ${product.Model}</p>
            <p><strong>Status:</strong> ${product.Status}</p>
        </div>
    `;
    container.appendChild(listItem);
}

// Function to open product detail page
function openProductDetail(productId) {
    const product = findProductById(productId);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product-detail.html';
    } else {
        console.error('Product not found:', productId);
    }
}

// Helper function to find a product by ID
function findProductById(productId) {
    // Assuming the products array is available globally or passed to this function
    return products.find(p => p.ProductID === productId);
}
