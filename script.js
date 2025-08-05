document.addEventListener('DOMContentLoaded', () => {
    // Product data
    const products = [
        { id: 1, name: "Tie-Dye Lounge set", price: 150.00, image: "assets/product-1.jpg" },
        { id: 2, name: "Sunburst Tracksuit", price: 150.00, image: "assets/product-2.jpg" },
        { id: 3, name: "Retro Red Streetwear", price: 150.00, image: "assets/product-3.jpg" },
        { id: 4, name: "Urban Sportswear Combo", price: 150.00, image: "assets/product-4.jpg" },
        { id: 5, name: "Oversized Knit & Coat", price: 150.00, image: "assets/product-5.jpg" },
        { id: 6, name: "Chic Monochrome Blazer", price: 150.00, image: "assets/product-6.jpg" },
    ];

    // DOM Element selections
    const productGrid = document.getElementById('product-grid');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const selectedProductsList = document.getElementById('selectedProductsList');
    const subtotalPriceEl = document.getElementById('subtotalPrice');
    const discountItem = document.getElementById('discountItem');
    const discountPriceEl = document.getElementById('discountPrice');
    const finalTotalPriceEl = document.getElementById('finalTotalPrice');
    const addToCartButton = document.getElementById('addToCartButton');
    
    // Storing selected products as a Map to track quantity
    const selectedProducts = new Map();

    // Render product cards on page load
    function renderProducts() {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                </div>
                <button class="add-to-bundle-btn">
                    <img src="assets/icons/plus.svg" alt="Add" width="20" height="20" class="btn-icon plus-icon">
                    <img src="assets/icons/check.svg" alt="Added" width="20" height="20" class="btn-icon check-icon hidden">
                    <span>Add to Bundle</span>
                </button>
            </div>
        `).join('');
    }

    // Update the sidebar with selected products and prices
    function updateSidebar() {
        const totalItems = Array.from(selectedProducts.values()).reduce((sum, item) => sum + item.quantity, 0);

        // Update progress bar
        const progressPercentage = (totalItems / 3) * 100;
        progressBar.style.width = `${Math.min(progressPercentage, 100)}%`;
        progressText.textContent = `${totalItems}/3 items added`;

        // Render selected product list
        selectedProductsList.innerHTML = Array.from(selectedProducts.entries()).map(([productId, item]) => {
            const product = products.find(p => p.id === productId);
            return `
                <div class="selected-product-item" data-product-id="${product.id}">
                    <div class="product-item-header">
                        <div class="product-details">
                            <img src="${product.image}" alt="${product.name}">
                            <div class="product-details-text">
                                <h4>${product.name}</h4>
                                <div class="quantity-selector">
                                    <button class="quantity-btn minus-btn" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                    <button class="quantity-btn plus-btn">+</button>
                                </div>
                            </div>
                        </div>
                        <div class="price-and-remove">
                            <span>$${(product.price * item.quantity).toFixed(2)}</span>
                            <button class="remove-item-btn" title="Remove">&#x1F5D1;</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Calculate and update totals
        const subtotal = Array.from(selectedProducts.values()).reduce((total, item) => {
            return total + (products.find(p => p.id === item.id).price * item.quantity);
        }, 0);

        let discount = 0;
        let finalTotal = subtotal;

        if (totalItems >= 3) {
            discount = subtotal * 0.30;
            finalTotal = subtotal - discount;
            discountItem.classList.remove('hidden');
            discountPriceEl.textContent = `-$${discount.toFixed(2)} (30%)`;
        } else {
            discountItem.classList.add('hidden');
        }

        subtotalPriceEl.textContent = `$${subtotal.toFixed(2)}`;
        finalTotalPriceEl.textContent = `$${finalTotal.toFixed(2)}`;

        // Enable/disable CTA button
        if (totalItems >= 3) {
            addToCartButton.disabled = false;
        } else {
            addToCartButton.disabled = true;
        }
    }

    // Function to toggle a product's selection state
    function toggleProductSelection(productId, isSelected) {
        const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        const button = card.querySelector('.add-to-bundle-btn');
        const plusIcon = button.querySelector('.plus-icon');
        const checkIcon = button.querySelector('.check-icon');
        const buttonText = button.querySelector('span');
        const product = products.find(p => p.id === productId);

        if (isSelected) {
            selectedProducts.set(productId, { id: productId, quantity: 1, price: product.price });
            card.classList.add('selected');
            button.classList.add('selected');
            plusIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            buttonText.textContent = 'Added to Bundle';
        } else {
            selectedProducts.delete(productId);
            card.classList.remove('selected');
            button.classList.remove('selected');
            plusIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
            buttonText.textContent = 'Add to Bundle';
        }

        updateSidebar();
    }

    // Event listener for adding products from the grid
    productGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.add-to-bundle-btn');
        if (!button) return;

        const card = button.closest('.product-card');
        const productId = parseInt(card.dataset.productId);

        const isSelected = !selectedProducts.has(productId);
        toggleProductSelection(productId, isSelected);
    });

    // Event listener for removing products and changing quantity in the sidebar
    selectedProductsList.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.selected-product-item');
        if (!itemElement) return;

        const productId = parseInt(itemElement.dataset.productId);
        const item = selectedProducts.get(productId);

        if (e.target.classList.contains('remove-item-btn')) {
            // Remove the product from both the sidebar and the grid
            toggleProductSelection(productId, false);
        } else if (e.target.classList.contains('plus-btn')) {
            // Increment quantity
            item.quantity++;
            selectedProducts.set(productId, item);
            updateSidebar();
        } else if (e.target.classList.contains('minus-btn')) {
            // Decrement quantity (minimum of 1)
            if (item.quantity > 1) {
                item.quantity--;
                selectedProducts.set(productId, item);
                updateSidebar();
            }
        }
    });

    // Event listener for the CTA button
    addToCartButton.addEventListener('click', () => {
        const selectedBundle = Array.from(selectedProducts.values()).map(item => {
            const product = products.find(p => p.id === item.id);
            return {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            };
        });

        const subtotal = selectedBundle.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discount = subtotal * 0.30;
        const finalTotal = subtotal - discount;

        console.log('--- Bundle Added to Cart ---');
        console.log('Selected Items:', selectedBundle);
        console.log('Subtotal:', `$${subtotal.toFixed(2)}`);
        console.log('Discount (30%):', `$${discount.toFixed(2)}`);
        console.log('Final Total:', `$${finalTotal.toFixed(2)}`);
        console.log('---------------------------');

        alert('Bundle added to cart! Check the console for details.');
    });

    // Initial render
    renderProducts();
    updateSidebar();
});
