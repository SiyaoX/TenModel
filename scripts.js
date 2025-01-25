document.addEventListener('DOMContentLoaded', () => {
    // Default to the first tab
    document.querySelector('.tab').click();
    loadProducts();
});

// Function to handle tab switching
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active-tab", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active-tab";
}

// Set the default active tab
document.getElementById("tab1").style.display = "block";

// Function to load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to load products JSON');

        window.products = await response.json();
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
        case 'sm': return 1;
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

    const gradientColor = product.GradientColor || 'linear-gradient(90deg, #5141B0, #FFE500, #FF0031)';
    listItem.innerHTML = `
        <div style="width: 100%; position: relative; padding-top: 100%; max-width: 500px;">    
            <img src="${product.CoverImg}" alt="${product.Name}" onclick="openProductDetail('${product.SKU}')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="attributes">
            <h3 style="background: ${gradientColor};background-clip: text;-webkit-background-clip: text;-webkit-text-fill-color: transparent;">${product.Name}</h3>
            <p style="margin-top: 10px; font-family: 'Blinker-Regular', sans-serif;">US$ ${product.Price}</p>
            <p style="font-size: 20px; font-family: 'Blinker-Regular', sans-serif; color: #F84242;">${product.Status}</p>
        </div>
    `;
    container.appendChild(listItem);
}
// Function to open product detail page
function openProductDetail(SKU) {
    const product = findProductById(SKU);
    if (product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product-detail.html';
    } else {
        console.error('Product not found:', SKU);
    }
}

// Helper function to find a product by ID
function findProductById(SKU) {
    // Assuming the products array is available globally or passed to this function
    return products.find(p => p.SKU === SKU);
}
