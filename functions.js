function openTab(event, tabId) {
    const allTabs = document.querySelectorAll('.tab-content');
    for (let tab of allTabs) {
        tab.classList.remove('active-content');
    }

    const allTabButtons = document.querySelectorAll('.tab');
    for (let button of allTabButtons) {
        button.classList.remove('active-tab');
    }

    document.getElementById(tabId).classList.add('active-content');
    event.currentTarget.classList.add('active-tab');
}

document.querySelector('.tab').click();

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();

        products.forEach(product => {
            const category = product.Category.toLowerCase();
            let tabContent;

            if (category === 'tank') {
                tabContent = document.querySelector('#tab1 .item-list');
            } else if (category === 'gundam') {
                tabContent = document.querySelector('#tab2 .item-list');
            } else if (category === 'figure') {
                tabContent = document.querySelector('#tab3 .item-list');
            }

            if (tabContent) {
                const listItem = document.createElement('li');
                listItem.className = 'item';
                listItem.innerHTML = `
                    <img src="${product.ImageUrl}" alt="${product.Name}">
                    <div class="attributes">
                        <h3>${product.Name}</h3>
                        <p><strong>Price:</strong> ${product.Price}</p>
                        <p><strong>Product ID:</strong> ${product.ProductID}</p>
                        <p><strong>Release Date:</strong> ${product.ReleaseDate}</p>
                        <p><strong>Model:</strong> ${product.Model}</p>
                        <p><strong>Status:</strong> ${product.Status}</p>
                    </div>
                `;
                tabContent.appendChild(listItem);
            }
        });
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Function to handle image resizing on window resize
function handleImageResize() {
    const images = document.querySelectorAll('.item img');
    images.forEach(img => {
        if (window.innerWidth < 768) {
            img.style.maxWidth = '100%'; // On mobile screens, make the image fully responsive
        } else {
            img.style.maxWidth = '500px'; // Set max-width on larger screens
        }
    });
}

// Add event listener for window resize to trigger image resizing
window.addEventListener('resize', handleImageResize);

// Call the function immediately to set initial image size when the page loads
document.addEventListener('DOMContentLoaded', handleImageResize);

loadProducts();