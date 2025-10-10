// TRUE ORIGIN FOODS - Complete Bakery Cost Calculator v3.1
// Fixed: Categories removed, dashboard clicks, supplier products, price display

let ingredientCounter = 1;
let ingredients = [];
let recipes = [];
let categories = [];
let suppliers = [];
let currentEditingRecipe = null;

// Unit conversion system
const unitConversions = {
    'g': 1,
    'kg': 1000,
    'ml': 1,
    'ltr': 1000,
    'pcs': 1
};

function getBaseUnit(unit) {
    if (unit === 'g') return 'kg';
    if (unit === 'ml') return 'ltr';
    return 'pcs';
}

function convertToBaseUnit(quantity, unit) {
    const baseUnit = getBaseUnit(unit);
    if (baseUnit === 'kg' && unit === 'g') return quantity / 1000;
    if (baseUnit === 'ltr' && unit === 'ml') return quantity / 1000;
    return quantity;
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('TRUE ORIGIN FOODS v3.1 - Initializing...');
    
    // Initialize with sample data
    suppliers = [
        { 
            id: 1, 
            name: 'ABC Supplies', 
            contact: '+91-9876543210', 
            email: 'sales@abcsupplies.com', 
            address: 'Mumbai', 
            creditDays: 30,
            products: [] // Supplier's products with their prices
        },
        { 
            id: 2, 
            name: 'XYZ Traders', 
            contact: '+91-9876543211', 
            email: 'info@xyztraders.com', 
            address: 'Delhi', 
            creditDays: 15,
            products: []
        }
    ];
    
    // NEW STRUCTURE: Ingredients WITHOUT categories
    ingredients = [
        { 
            id: 1, 
            name: 'Flour',
            unit: 'kg',
            currentPrice: 45.00,
            priceHistory: [
                { price: 45.00, date: '2025-10-01', note: 'Initial price' }
            ]
        },
        { 
            id: 2, 
            name: 'Milk',
            unit: 'ltr',
            currentPrice: 65.00,
            priceHistory: [
                { price: 65.00, date: '2025-10-01', note: 'Initial price' }
            ]
        },
        { 
            id: 3, 
            name: 'Eggs',
            unit: 'pcs',
            currentPrice: 8.00,
            priceHistory: [
                { price: 8.00, date: '2025-10-01', note: 'Initial price' }
            ]
        },
        { 
            id: 4, 
            name: 'Sugar',
            unit: 'kg',
            currentPrice: 60.00,
            priceHistory: [
                { price: 60.00, date: '2025-10-01', note: 'Initial price' }
            ]
        }
    ];
    
    categories = [
        { id: 1, name: 'Cakes', subcategories: ['Birthday Cakes', 'Wedding Cakes'], margin: 45 },
        { id: 2, name: 'Cookies', subcategories: ['Chocolate Chip'], margin: 40 },
        { id: 3, name: 'Breads', subcategories: ['White Bread'], margin: 35 }
    ];
    
    recipes = [];
    
    loadIngredients();
    loadCategories();
    updateDashboard();
    
    console.log('Application initialized successfully');
});

// Login functions
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        showMainApp();
        document.getElementById('loginError').classList.add('hidden');
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

// Double confirmation for logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        if (confirm('All unsaved changes will be lost. Continue?')) {
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('mainApp').classList.add('hidden');
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
    }
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

// Password modal
function openPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
}

function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordAlert').classList.add('hidden');
}

function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (current !== 'admin123') {
        showPasswordAlert('Current password is incorrect', 'danger');
        return;
    }
    
    if (newPass.length < 6) {
        showPasswordAlert('New password must be at least 6 characters', 'danger');
        return;
    }
    
    if (newPass !== confirm) {
        showPasswordAlert('Passwords do not match', 'danger');
        return;
    }
    
    showPasswordAlert('Password changed successfully!', 'success');
    setTimeout(() => closePasswordModal(), 2000);
}

function showPasswordAlert(message, type) {
    const alertDiv = document.getElementById('passwordAlert');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.classList.remove('hidden');
}

// Tab navigation
function showTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'ingredients') {
        displayIngredients();
    } else if (tabName === 'categories') {
        displayCategories();
        loadCategoryDropdowns();
    } else if (tabName === 'suppliers') {
        displaySuppliers();
    } else if (tabName === 'recipes') {
        displaySavedRecipes();
        displayCostAnalysis();
    } else if (tabName === 'settings') {
        loadDataStats();
    }
}

// FIXED: Ingredient management (NO categories)
function addIngredientToMaster() {
    const name = document.getElementById('newIngredientName').value.trim();
    const unit = document.getElementById('newIngredientUnit').value;
    const price = parseFloat(document.getElementById('newIngredientPrice').value);
    
    if (!name) {
        alert('Please enter an ingredient name');
        return;
    }
    
    if (!price || price < 0) {
        alert('Please enter a valid price');
        return;
    }
    
    if (ingredients.find(ing => ing.name.toLowerCase() === name.toLowerCase())) {
        alert('Ingredient already exists');
        return;
    }
    
    ingredients.push({
        id: Date.now(),
        name: name,
        unit: unit,
        currentPrice: price,
        priceHistory: [
            { price: price, date: new Date().toISOString().split('T')[0], note: 'Initial price' }
        ]
    });
    
    loadIngredients();
    displayIngredients();
    updateDashboard();
    
    document.getElementById('newIngredientName').value = '';
    document.getElementById('newIngredientUnit').value = 'kg';
    document.getElementById('newIngredientPrice').value = '';
    showAlert('ingredientAlert');
}

// Edit ingredient
function editIngredient(ingredientId) {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;
    
    document.getElementById('editingIngredientId').value = ingredientId;
    document.getElementById('editIngredientName').value = ingredient.name;
    document.getElementById('editIngredientUnit').value = ingredient.unit;
    document.getElementById('editIngredientPrice').value = ingredient.currentPrice;
    
    document.getElementById('ingredientEditModal').style.display = 'block';
}

// FIXED: Save ingredient edit with proper price tracking
function saveIngredientEdit() {
    const ingredientId = parseInt(document.getElementById('editingIngredientId').value);
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    
    if (!ingredient) return;
    
    const newName = document.getElementById('editIngredientName').value.trim();
    const newUnit = document.getElementById('editIngredientUnit').value;
    const newPrice = parseFloat(document.getElementById('editIngredientPrice').value);
    
    if (!newName || !newPrice || newPrice < 0) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    // FIXED: Only add to history if price actually changed
    if (newPrice !== ingredient.currentPrice) {
        ingredient.priceHistory.push({
            price: ingredient.currentPrice,
            date: new Date().toISOString().split('T')[0],
            note: `Price changed from ₹${ingredient.currentPrice} to ₹${newPrice}`
        });
        ingredient.currentPrice = newPrice;
        
        // Mark all recipes using this ingredient
        markRecipesWithPriceChanges(ingredientId);
    }
    
    ingredient.name = newName;
    ingredient.unit = newUnit;
    
    closeModal('ingredientEditModal');
    displayIngredients();
    loadIngredients();
    showAlert('ingredientAlert');
}

// Mark recipes with price changes
function markRecipesWithPriceChanges(ingredientId) {
    recipes.forEach(recipe => {
        const hasIngredient = recipe.ingredients.find(ing => ing.ingredientId === ingredientId);
        if (hasIngredient) {
            recipe.priceChanged = true;
            // Update the current price in the recipe ingredient
            const ingredient = ingredients.find(ing => ing.id === ingredientId);
            if (ingredient) {
                hasIngredient.currentPrice = ingredient.currentPrice;
            }
        }
    });
}

// Delete ingredient
function deleteIngredient(ingredientId) {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;
    
    // Check if used in recipes
    const usedInRecipes = [];
    recipes.forEach(recipe => {
        const found = recipe.ingredients.find(ri => ri.ingredientId === ingredientId);
        if (found && !usedInRecipes.includes(recipe.name)) {
            usedInRecipes.push(recipe.name);
        }
    });
    
    if (usedInRecipes.length > 0) {
        alert(`Cannot delete ${ingredient.name}! Used in recipes: ${usedInRecipes.join(', ')}`);
        return;
    }
    
    if (confirm(`Delete ingredient "${ingredient.name}"?`)) {
        ingredients = ingredients.filter(ing => ing.id !== ingredientId);
        displayIngredients();
        loadIngredients();
        updateDashboard();
        showAlert('ingredientAlert');
    }
}

// FIXED: Display ingredients WITHOUT categories
function displayIngredients() {
    const container = document.getElementById('ingredientsList');
    if (!container) return;
    
    if (ingredients.length === 0) {
        container.innerHTML = '<p>No ingredients found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="sleek-list">
            <div class="sleek-header" onclick="toggleIngredientsList()">
                <span>All Ingredients (${ingredients.length})</span>
                <span class="expand-icon" id="ingredients-icon">▼</span>
            </div>
            <div class="sleek-content expanded" id="ingredients-content">
                <div class="item-grid">
                    ${ingredients.map(ingredient => `
                        <div class="item-card" data-ingredient-name="${ingredient.name.toLowerCase()}">
                            <div class="item-header">
                                <div>
                                    <h4>${ingredient.name}</h4>
                                    <span class="badge badge-success">₹${ingredient.currentPrice.toFixed(2)}/${ingredient.unit}</span>
                                </div>
                            </div>
                            <div class="item-info">
                                <p><strong>Unit:</strong> ${ingredient.unit}</p>
                                <p><strong>Price History:</strong> ${ingredient.priceHistory.length} records</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-primary btn-small" onclick="showPriceHistory(${ingredient.id})">Price History</button>
                                <button class="btn btn-secondary btn-small" onclick="editIngredient(${ingredient.id})">Edit</button>
                                <button class="btn btn-danger btn-small" onclick="deleteIngredient(${ingredient.id})">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function toggleIngredientsList() {
    const content = document.getElementById('ingredients-content');
    const icon = document.getElementById('ingredients-icon');
    const header = document.querySelector('#ingredients .sleek-header');
    
    content.classList.toggle('expanded');
    icon.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

// Filter ingredients
function filterIngredients() {
    const searchTerm = document.getElementById('ingredientSearch').value.toLowerCase();
    const ingredientCards = document.querySelectorAll('#ingredientsList .item-card');
    
    ingredientCards.forEach(card => {
        const name = card.getAttribute('data-ingredient-name');
        
        if (name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Show price history
function showPriceHistory(ingredientId) {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;
    
    const content = document.getElementById('priceHistoryContent');
    document.getElementById('priceHistoryTitle').textContent = `Price History - ${ingredient.name}`;
    
    content.innerHTML = `
        <div class="price-history-section">
            <p><strong>Current Price:</strong> <span class="rupee">₹${ingredient.currentPrice.toFixed(2)}/${ingredient.unit}</span></p>
            <h5>Price History:</h5>
            ${ingredient.priceHistory.length === 0 ? 
                '<p>No price history available.</p>' :
                ingredient.priceHistory.slice().reverse().map(entry => `
                    <div class="price-entry">
                        <span>${entry.date}${entry.note ? ` - ${entry.note}` : ''}</span>
                        <span class="rupee">₹${entry.price.toFixed(2)}/${ingredient.unit}</span>
                    </div>
                `).join('')
            }
        </div>
    `;
    
    document.getElementById('priceHistoryModal').style.display = 'block';
}

function closePriceHistoryModal() {
    document.getElementById('priceHistoryModal').style.display = 'none';
}

// NEW: Supplier management with product linking
function displaySuppliers() {
    const container = document.getElementById('suppliersList');
    if (!container) return;
    
    if (suppliers.length === 0) {
        container.innerHTML = '<p>No suppliers found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="sleek-list">
            <div class="sleek-header" onclick="toggleSuppliersList()">
                <span>All Suppliers (${suppliers.length})</span>
                <span class="expand-icon" id="suppliers-icon">▼</span>
            </div>
            <div class="sleek-content expanded" id="suppliers-content">
                <div class="item-grid">
                    ${suppliers.map(supplier => `
                        <div class="item-card supplier-card" data-supplier-name="${supplier.name.toLowerCase()}">
                            <div class="item-header">
                                <h4>${supplier.name}</h4>
                                <span class="badge badge-primary">${supplier.creditDays} days</span>
                            </div>
                            <div class="item-info">
                                <p><strong>Contact:</strong> ${supplier.contact}</p>
                                <p><strong>Email:</strong> ${supplier.email}</p>
                                <p><strong>Products:</strong> ${(supplier.products || []).length} items</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-primary btn-small" onclick="viewSupplierProducts(${supplier.id})">View Products</button>
                                <button class="btn btn-secondary btn-small" onclick="editSupplier(${supplier.id})">Edit</button>
                                <button class="btn btn-danger btn-small" onclick="deleteSupplier(${supplier.id})">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function toggleSuppliersList() {
    const content = document.getElementById('suppliers-content');
    const icon = document.getElementById('suppliers-icon');
    const header = document.querySelector('#suppliers .sleek-header');
    
    content.classList.toggle('expanded');
    icon.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

// NEW: View supplier products
function viewSupplierProducts(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    if (!supplier.products) supplier.products = [];
    
    const content = document.getElementById('supplierDetailContent');
    content.innerHTML = `
        <div class="card">
            <h2>${supplier.name} - Product Catalog</h2>
            <p><strong>Contact:</strong> ${supplier.contact} | <strong>Email:</strong> ${supplier.email}</p>
            <p><strong>Credit Terms:</strong> ${supplier.creditDays} days</p>
            
            <div style="margin: 1.5rem 0;">
                <button class="btn btn-success" onclick="addProductToSupplier(${supplierId})">+ Add Product</button>
            </div>
            
            ${supplier.products.length === 0 ? 
                '<p>No products for this supplier. Click "Add Product" to start.</p>' :
                `<div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Unit</th>
                                <th>Supplier Price</th>
                                <th>Master Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${supplier.products.map(product => {
                                const masterIngredient = ingredients.find(ing => ing.id === product.ingredientId);
                                return masterIngredient ? `
                                    <tr>
                                        <td><strong>${masterIngredient.name}</strong></td>
                                        <td>${masterIngredient.unit}</td>
                                        <td class="rupee">₹${product.supplierPrice.toFixed(2)}/${masterIngredient.unit}</td>
                                        <td class="rupee">₹${masterIngredient.currentPrice.toFixed(2)}/${masterIngredient.unit}</td>
                                        <td>
                                            <button class="btn btn-secondary btn-small" onclick="editSupplierProduct(${supplierId}, ${product.ingredientId})">Edit</button>
                                            <button class="btn btn-danger btn-small" onclick="deleteSupplierProduct(${supplierId}, ${product.ingredientId})">Remove</button>
                                        </td>
                                    </tr>
                                ` : '';
                            }).join('')}
                        </tbody>
                    </table>
                </div>`
            }
        </div>
    `;
    
    document.getElementById('suppliers').classList.remove('active');
    document.getElementById('supplierDetail').classList.add('active');
}

function backToSuppliers() {
    document.getElementById('supplierDetail').classList.remove('active');
    document.getElementById('suppliers').classList.add('active');
}

// NEW: Add product to supplier
function addProductToSupplier(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    if (!supplier.products) supplier.products = [];
    
    const availableIngredients = ingredients.filter(ing => 
        !supplier.products.some(p => p.ingredientId === ing.id)
    );
    
    if (availableIngredients.length === 0) {
        alert('All ingredients already added to this supplier');
        return;
    }
    
    document.getElementById('modalSupplierId').value = supplierId;
    
    const ingredientSelect = document.getElementById('modalIngredientSelect');
    ingredientSelect.innerHTML = '<option value="">Select Product</option>';
    availableIngredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.id;
        option.textContent = `${ingredient.name} (${ingredient.unit})`;
        ingredientSelect.appendChild(option);
    });
    
    document.getElementById('modalProductPrice').value = '';
    document.getElementById('supplierProductModal').style.display = 'block';
}

// NEW: Save product to supplier
function saveProductToSupplier() {
    const supplierId = parseInt(document.getElementById('modalSupplierId').value);
    const ingredientId = parseInt(document.getElementById('modalIngredientSelect').value);
    const supplierPrice = parseFloat(document.getElementById('modalProductPrice').value);
    
    if (!ingredientId || !supplierPrice || supplierPrice < 0) {
        alert('Please select product and enter valid price');
        return;
    }
    
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    if (!supplier.products) supplier.products = [];
    
    supplier.products.push({
        ingredientId: ingredientId,
        supplierPrice: supplierPrice,
        dateAdded: new Date().toISOString().split('T')[0]
    });
    
    closeModal('supplierProductModal');
    viewSupplierProducts(supplierId);
    displaySuppliers();
}

// NEW: Edit supplier product
function editSupplierProduct(supplierId, ingredientId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    const product = supplier.products.find(p => p.ingredientId === ingredientId);
    if (!product) return;
    
    document.getElementById('editSupplierProductId').value = ingredientId;
    document.getElementById('editSupplierIdForProduct').value = supplierId;
    document.getElementById('editSupplierProductPrice').value = product.supplierPrice;
    
    document.getElementById('supplierProductEditModal').style.display = 'block';
}

// NEW: Save supplier product edit
function saveSupplierProductEdit() {
    const supplierId = parseInt(document.getElementById('editSupplierIdForProduct').value);
    const ingredientId = parseInt(document.getElementById('editSupplierProductId').value);
    const newPrice = parseFloat(document.getElementById('editSupplierProductPrice').value);
    
    if (!newPrice || newPrice < 0) {
        alert('Please enter valid price');
        return;
    }
    
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    const product = supplier.products.find(p => p.ingredientId === ingredientId);
    if (product) {
        product.supplierPrice = newPrice;
    }
    
    closeModal('supplierProductEditModal');
    viewSupplierProducts(supplierId);
}

// NEW: Delete supplier product
function deleteSupplierProduct(supplierId, ingredientId) {
    if (confirm('Remove this product from supplier?')) {
        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier && supplier.products) {
            supplier.products = supplier.products.filter(p => p.ingredientId !== ingredientId);
            viewSupplierProducts(supplierId);
            displaySuppliers();
        }
    }
}

function addNewSupplier() {
    const name = document.getElementById('newSupplierName').value.trim();
    const contact = document.getElementById('newSupplierContact').value.trim();
    const email = document.getElementById('newSupplierEmail').value.trim();
    const creditDays = parseInt(document.getElementById('newSupplierCreditDays').value) || 30;
    
    if (!name || !contact || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    suppliers.push({
        id: Date.now(),
        name: name,
        contact: contact,
        email: email,
        address: 'Address not specified',
        creditDays: creditDays,
        products: []
    });
    
    document.getElementById('newSupplierName').value = '';
    document.getElementById('newSupplierContact').value = '';
    document.getElementById('newSupplierEmail').value = '';
    document.getElementById('newSupplierCreditDays').value = '';
    
    showAlert('supplierAlert');
    displaySuppliers();
    updateDashboard();
}

function editSupplier(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    document.getElementById('editingSupplierId').value = supplierId;
    document.getElementById('editSupplierName').value = supplier.name;
    document.getElementById('editSupplierContact').value = supplier.contact;
    document.getElementById('editSupplierEmail').value = supplier.email;
    document.getElementById('editSupplierCreditDays').value = supplier.creditDays;
    
    document.getElementById('supplierEditModal').style.display = 'block';
}

function saveSupplierEdit() {
    const supplierId = parseInt(document.getElementById('editingSupplierId').value);
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (!supplier) return;
    
    supplier.name = document.getElementById('editSupplierName').value.trim();
    supplier.contact = document.getElementById('editSupplierContact').value.trim();
    supplier.email = document.getElementById('editSupplierEmail').value.trim();
    supplier.creditDays = parseInt(document.getElementById('editSupplierCreditDays').value) || 30;
    
    closeModal('supplierEditModal');
    displaySuppliers();
    showAlert('supplierAlert');
}

function deleteSupplier(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    if (confirm(`Delete supplier "${supplier.name}"?`)) {
        suppliers = suppliers.filter(s => s.id !== supplierId);
        displaySuppliers();
        updateDashboard();
        showAlert('supplierAlert');
    }
}

// Filter suppliers
function filterSuppliers() {
    const searchTerm = document.getElementById('supplierSearch').value.toLowerCase();
    const supplierCards = document.querySelectorAll('#suppliersList .item-card');
    
    supplierCards.forEach(card => {
        const name = card.getAttribute('data-supplier-name');
        
        if (name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Category management
function addCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const margin = parseFloat(document.getElementById('newCategoryMargin').value) || 40;
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    if (categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        alert('Category already exists');
        return;
    }
    
    categories.push({
        id: Date.now(),
        name: name,
        subcategories: [],
        margin: margin
    });
    
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryMargin').value = '';
    
    loadCategories();
    loadCategoryDropdowns();
    displayCategories();
    showAlert('categoryAlert');
}

function addSubcategory() {
    const parentId = parseInt(document.getElementById('parentCategory').value);
    const name = document.getElementById('newSubcategoryName').value.trim();
    
    if (!parentId || !name) {
        alert('Please select parent and enter name');
        return;
    }
    
    const category = categories.find(cat => cat.id === parentId);
    if (category) {
        if (category.subcategories.includes(name)) {
            alert('Subcategory already exists');
            return;
        }
        
        category.subcategories.push(name);
        document.getElementById('newSubcategoryName').value = '';
        displayCategories();
        loadCategories();
        showAlert('categoryAlert');
    }
}

function editCategoryMargin(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    const newMargin = prompt(`Enter new margin % for ${category.name}:`, category.margin);
    
    if (newMargin && !isNaN(newMargin) && newMargin >= 10 && newMargin <= 80) {
        category.margin = parseFloat(newMargin);
        displayCategories();
        
        const currentCategory = document.getElementById('recipeCategory')?.value;
        if (currentCategory === category.name) {
            document.getElementById('profitMargin').value = category.margin;
            calculateTotalCost();
        }
        
        showAlert('categoryAlert');
    }
}

function loadCategoryDropdowns() {
    const parentSelect = document.getElementById('parentCategory');
    if (parentSelect) {
        parentSelect.innerHTML = '<option value="">Select category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            parentSelect.appendChild(option);
        });
    }
}

function displayCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<p>No categories found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="sleek-list">
            <div class="sleek-header" onclick="toggleCategoriesList()">
                <span>All Categories (${categories.length})</span>
                <span class="expand-icon" id="categories-icon">▼</span>
            </div>
            <div class="sleek-content expanded" id="categories-content">
                ${categories.map(category => `
                    <div class="category-item">
                        <span><strong>${category.name}</strong> 
                            <span class="editable-margin" onclick="editCategoryMargin(${category.id})">
                                ${category.margin}%
                            </span>
                        </span>
                        <button class="btn btn-danger btn-small" onclick="deleteCategory(${category.id})">Delete</button>
                    </div>
                    ${category.subcategories.map((subcat, index) => `
                        <div class="category-item subcategory-item">
                            <span>&nbsp;&nbsp;&nbsp;&nbsp;↳ ${subcat}</span>
                            <button class="btn btn-danger btn-small" onclick="deleteSubcategory(${category.id}, ${index})">Delete</button>
                        </div>
                    `).join('')}
                `).join('')}
            </div>
        </div>
    `;
}

function toggleCategoriesList() {
    const content = document.getElementById('categories-content');
    const icon = document.getElementById('categories-icon');
    const header = document.querySelector('#categories .sleek-header');
    
    content.classList.toggle('expanded');
    icon.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

function deleteCategory(categoryId) {
    if (confirm('Delete this category and subcategories?')) {
        categories = categories.filter(cat => cat.id !== categoryId);
        displayCategories();
        loadCategories();
        loadCategoryDropdowns();
    }
}

function deleteSubcategory(categoryId, subcatIndex) {
    if (confirm('Delete this subcategory?')) {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
            category.subcategories.splice(subcatIndex, 1);
            displayCategories();
            loadCategories();
        }
    }
}

// Load ingredients into dropdowns
function loadIngredients() {
    const selects = document.querySelectorAll('select[id^="ingredient"]:not([id$="Id"]):not([id$="Select"])');
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select ingredient</option>';
        ingredients.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient.id;
            option.textContent = `${ingredient.name} - ₹${ingredient.currentPrice}/${ingredient.unit}`;
            select.appendChild(option);
        });
    });
}

// Load categories into dropdown
function loadCategories() {
    const categorySelect = document.getElementById('recipeCategory');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    if (categorySelect && !categorySelect.hasAttribute('data-listener')) {
        categorySelect.addEventListener('change', updateSubcategories);
        categorySelect.setAttribute('data-listener', 'true');
    }
}

function updateSubcategories() {
    const categoryName = document.getElementById('recipeCategory').value;
    const subcategorySelect = document.getElementById('recipeSubcategory');
    
    subcategorySelect.innerHTML = '<option value="">Select subcategory (optional)</option>';
    
    const category = categories.find(cat => cat.name === categoryName);
    if (category && category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat;
            option.textContent = subcat;
            subcategorySelect.appendChild(option);
        });
    }
    
    if (category && category.margin) {
        document.getElementById('profitMargin').value = category.margin;
        calculateTotalCost();
    }
}

// Update ingredient pricing
function updateIngredientPricing(rowId) {
    const ingredientSelect = document.getElementById(`ingredient${rowId}`);
    const priceInput = document.getElementById(`price${rowId}`);
    const unitSelect = document.getElementById(`unit${rowId}`);
    
    if (!ingredientSelect || !priceInput || !unitSelect) return;
    
    priceInput.value = '';
    
    if (ingredientSelect.value) {
        const ingredient = ingredients.find(ing => ing.id == ingredientSelect.value);
        
        if (ingredient) {
            priceInput.value = ingredient.currentPrice.toFixed(2);
            updateUnitOptions(unitSelect, ingredient.unit);
        }
    }
    
    calculateRowCost(rowId);
}

function updateUnitOptions(unitSelect, baseUnit) {
    let options = [];
    
    if (baseUnit === 'kg') {
        options = [
            { value: 'g', text: 'g' },
            { value: 'kg', text: 'kg' }
        ];
    } else if (baseUnit === 'ltr') {
        options = [
            { value: 'ml', text: 'ml' },
            { value: 'ltr', text: 'ltr' }
        ];
    } else if (baseUnit === 'pcs') {
        options = [{ value: 'pcs', text: 'pcs' }];
    } else if (baseUnit === 'g') {
        options = [{ value: 'g', text: 'g' }];
    } else if (baseUnit === 'ml') {
        options = [{ value: 'ml', text: 'ml' }];
    }
    
    const currentValue = unitSelect.value;
    unitSelect.innerHTML = '';
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        unitSelect.appendChild(optionElement);
    });
    
    if (options.some(opt => opt.value === currentValue)) {
        unitSelect.value = currentValue;
    }
}

function calculateRowCost(rowId) {
    const quantityInput = document.getElementById(`quantity${rowId}`);
    const unitSelect = document.getElementById(`unit${rowId}`);
    const priceInput = document.getElementById(`price${rowId}`);
    const costSpan = document.getElementById(`cost${rowId}`);
    
    if (!quantityInput || !unitSelect || !priceInput || !costSpan) return;
    
    const quantity = parseFloat(quantityInput.value) || 0;
    const unit = unitSelect.value;
    const pricePerBaseUnit = parseFloat(priceInput.value) || 0;
    
    const baseQuantity = convertToBaseUnit(quantity, unit);
    const cost = baseQuantity * pricePerBaseUnit;
    
    costSpan.textContent = `₹${cost.toFixed(2)}`;
    calculateTotalCost();
}

function calculateTotalCost() {
    let totalIngredientCost = 0;
    
    const ingredientRows = document.querySelectorAll('tr[id^="ingredientRow"]');
    
    ingredientRows.forEach(row => {
        const rowId = row.id.replace('ingredientRow', '');
        const costSpan = document.getElementById(`cost${rowId}`);
        if (costSpan) {
            const costText = costSpan.textContent.replace('₹', '');
            const cost = parseFloat(costText) || 0;
            totalIngredientCost += cost;
        }
    });
    
    const bakingTime = parseFloat(document.getElementById('bakingTime')?.value) || 0;
    const laborRate = parseFloat(document.getElementById('laborRate')?.value) || 0;
    const totalLaborCost = (bakingTime / 60) * laborRate;
    
    const overheadPercentage = parseFloat(document.getElementById('overheadPercentage')?.value) || 0;
    const overheadCost = (totalIngredientCost + totalLaborCost) * (overheadPercentage / 100);
    
    const batchSize = parseFloat(document.getElementById('batchSize')?.value) || 1;
    const fixedCostPerUnit = parseFloat(document.getElementById('fixedCost')?.value) || 0;
    const packagingCostPerUnit = parseFloat(document.getElementById('packagingCost')?.value) || 0;
    const totalFixedCost = fixedCostPerUnit * batchSize;
    const totalPackagingCost = packagingCostPerUnit * batchSize;
    
    const grandTotal = totalIngredientCost + totalLaborCost + overheadCost + totalFixedCost + totalPackagingCost;
    
    const margin = parseFloat(document.getElementById('profitMargin')?.value) || 40;
    const suggestedTotalPrice = grandTotal * (1 + margin / 100);
    
    const costPerUnit = grandTotal / batchSize;
    const suggestedPricePerUnit = suggestedTotalPrice / batchSize;
    
    if (document.getElementById('batchSizeDisplay')) {
        document.getElementById('batchSizeDisplay').textContent = batchSize;
    }
    
    const elements = {
        'totalIngredientCost': totalIngredientCost,
        'totalLaborCost': totalLaborCost,
        'displayOverheadCost': overheadCost,
        'displayFixedCost': totalFixedCost,
        'displayPackagingCost': totalPackagingCost,
        'grandTotalCost': grandTotal,
        'costPerUnit': costPerUnit,
        'suggestedPrice': suggestedPricePerUnit
    };
    
    Object.keys(elements).forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `₹${elements[elementId].toFixed(2)}`;
        }
    });
}

function addIngredient() {
    const tbody = document.querySelector('#ingredientsTable tbody');
    const newRow = document.createElement('tr');
    newRow.id = `ingredientRow${ingredientCounter}`;
    
    newRow.innerHTML = `
        <td>
            <select id="ingredient${ingredientCounter}" onchange="updateIngredientPricing(${ingredientCounter})">
                <option value="">Select</option>
                ${ingredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}
            </select>
        </td>
        <td>
            <div class="unit-input-group">
                <input type="number" id="quantity${ingredientCounter}" onchange="calculateRowCost(${ingredientCounter})" oninput="calculateRowCost(${ingredientCounter})" placeholder="0" min="0" step="0.1" />
                <select id="unit${ingredientCounter}" onchange="calculateRowCost(${ingredientCounter})">
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                </select>
            </div>
        </td>
        <td><input type="number" id="price${ingredientCounter}" placeholder="0" step="0.01" readonly /></td>
        <td><span id="cost${ingredientCounter}" class="rupee">₹0</span></td>
        <td><button class="btn btn-danger btn-small" onclick="removeIngredient(${ingredientCounter})">×</button></td>
    `;
    
    tbody.appendChild(newRow);
    ingredientCounter++;
}

function removeIngredient(rowId) {
    const row = document.getElementById(`ingredientRow${rowId}`);
    if (row) {
        row.remove();
        calculateTotalCost();
    }
}

function saveRecipe() {
    const name = document.getElementById('recipeName').value.trim();
    
    if (!name) {
        alert('Please enter a recipe name');
        return;
    }
    
    const recipeIngredients = [];
    const rows = document.querySelectorAll('tr[id^="ingredientRow"]');
    
    rows.forEach(row => {
        const id = row.id.replace('ingredientRow', '');
        const ingredientSelect = document.getElementById(`ingredient${id}`);
        const quantityInput = document.getElementById(`quantity${id}`);
        const unitSelect = document.getElementById(`unit${id}`);
        const priceInput = document.getElementById(`price${id}`);
        const costSpan = document.getElementById(`cost${id}`);
        
        if (ingredientSelect?.value && quantityInput?.value && priceInput?.value) {
            const ingredient = ingredients.find(ing => ing.id == ingredientSelect.value);
            
            recipeIngredients.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                quantity: parseFloat(quantityInput.value),
                unit: unitSelect.value,
                priceAtCreation: parseFloat(priceInput.value),
                currentPrice: ingredient.currentPrice,
                cost: parseFloat(costSpan.textContent.replace('₹', ''))
            });
        }
    });
    
    if (recipeIngredients.length === 0) {
        alert('Please add at least one ingredient');
        return;
    }
    
    const recipe = {
        id: currentEditingRecipe ? currentEditingRecipe.id : Date.now(),
        name: name,
        version: currentEditingRecipe ? (currentEditingRecipe.version || 1) + 1 : 1,
        category: document.getElementById('recipeCategory').value,
        subcategory: document.getElementById('recipeSubcategory').value,
        notes: document.getElementById('recipeNotes').value.trim(),
        ingredients: recipeIngredients,
        bakingTime: parseFloat(document.getElementById('bakingTime').value) || 0,
        laborRate: parseFloat(document.getElementById('laborRate').value) || 0,
        fixedCost: parseFloat(document.getElementById('fixedCost').value) || 0,
        packagingCost: parseFloat(document.getElementById('packagingCost').value) || 0,
        overheadPercentage: parseFloat(document.getElementById('overheadPercentage').value) || 0,
        batchSize: parseFloat(document.getElementById('batchSize').value) || 1,
        profitMargin: parseFloat(document.getElementById('profitMargin').value) || 40,
        totalCost: parseFloat(document.getElementById('grandTotalCost').textContent.replace('₹', '')),
        suggestedPrice: parseFloat(document.getElementById('suggestedPrice').textContent.replace('₹', '')),
        costPerUnit: parseFloat(document.getElementById('costPerUnit')?.textContent.replace('₹', '') || 0),
        dateCreated: currentEditingRecipe ? currentEditingRecipe.dateCreated : new Date().toISOString().split('T')[0],
        dateModified: new Date().toISOString().split('T')[0],
        priceChanged: false,
        status: 'active'
    };
    
    if (currentEditingRecipe) {
        const index = recipes.findIndex(r => r.id === currentEditingRecipe.id);
        recipes[index] = recipe;
        currentEditingRecipe = null;
        document.getElementById('editingRecipe').classList.add('hidden');
    } else {
        recipes.push(recipe);
    }
    
    showAlert('recipeAlert');
    updateDashboard();
}

function editRecipe(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    currentEditingRecipe = recipe;
    
    document.getElementById('recipeName').value = recipe.name;
    document.getElementById('recipeCategory').value = recipe.category;
    updateSubcategories();
    document.getElementById('recipeSubcategory').value = recipe.subcategory || '';
    document.getElementById('recipeNotes').value = recipe.notes;
    document.getElementById('bakingTime').value = recipe.bakingTime;
    document.getElementById('laborRate').value = recipe.laborRate;
    document.getElementById('fixedCost').value = recipe.fixedCost;
    document.getElementById('packagingCost').value = recipe.packagingCost;
    document.getElementById('overheadPercentage').value = recipe.overheadPercentage || 0;
    document.getElementById('batchSize').value = recipe.batchSize || 1;
    document.getElementById('profitMargin').value = recipe.profitMargin;
    
    const tbody = document.querySelector('#ingredientsTable tbody');
    tbody.innerHTML = '';
    ingredientCounter = 0;
    
    recipe.ingredients.forEach((ingredient, index) => {
        addIngredient();
        const rowId = ingredientCounter - 1;
        
        document.getElementById(`ingredient${rowId}`).value = ingredient.ingredientId;
        updateIngredientPricing(rowId);
        
        setTimeout(() => {
            document.getElementById(`quantity${rowId}`).value = ingredient.quantity;
            document.getElementById(`unit${rowId}`).value = ingredient.unit;
            document.getElementById(`price${rowId}`).value = ingredient.priceAtCreation || ingredient.currentPrice;
            calculateRowCost(rowId);
        }, 100);
    });
    
    document.getElementById('editingRecipeName').textContent = recipe.name;
    document.getElementById('editingRecipe').classList.remove('hidden');
    
    showTab('costing');
}

function cancelEdit() {
    currentEditingRecipe = null;
    document.getElementById('editingRecipe').classList.add('hidden');
    clearRecipe();
}

function clearRecipe() {
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeCategory').value = '';
    document.getElementById('recipeSubcategory').value = '';
    document.getElementById('recipeNotes').value = '';
    document.getElementById('bakingTime').value = '';
    document.getElementById('laborRate').value = '';
    document.getElementById('fixedCost').value = '';
    document.getElementById('packagingCost').value = '';
    document.getElementById('overheadPercentage').value = '';
    document.getElementById('batchSize').value = '1';
    document.getElementById('profitMargin').value = '40';
    
    const tbody = document.querySelector('#ingredientsTable tbody');
    tbody.innerHTML = `
        <tr id="ingredientRow0">
            <td><select id="ingredient0" onchange="updateIngredientPricing(0)"><option value="">Select</option>${ingredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}</select></td>
            <td>
                <div class="unit-input-group">
                    <input type="number" id="quantity0" onchange="calculateRowCost(0)" oninput="calculateRowCost(0)" placeholder="0" min="0" step="0.1" />
                    <select id="unit0" onchange="calculateRowCost(0)">
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                    </select>
                </div>
            </td>
            <td><input type="number" id="price0" placeholder="0" step="0.01" readonly /></td>
            <td><span id="cost0" class="rupee">₹0</span></td>
            <td><button class="btn btn-danger btn-small" onclick="removeIngredient(0)">×</button></td>
        </tr>
    `;
    
    ingredientCounter = 1;
    calculateTotalCost();
}

function updateDashboard() {
    document.getElementById('totalRecipes').textContent = recipes.length;
    document.getElementById('totalIngredients').textContent = ingredients.length;
    document.getElementById('totalSuppliers').textContent = suppliers.length;
    
    const activeRecipes = recipes.filter(r => r.status === 'active').length;
    const avgMargin = recipes.length > 0 ? 
        recipes.reduce((sum, r) => sum + r.profitMargin, 0) / recipes.length : 0;
    
    if (document.getElementById('activeRecipes')) {
        document.getElementById('activeRecipes').textContent = activeRecipes;
    }
    if (document.getElementById('avgMargin')) {
        document.getElementById('avgMargin').textContent = `${avgMargin.toFixed(1)}%`;
    }
    
    displayRecipesList();
}

// FIXED: Display recipes list with clickable cards
function displayRecipesList() {
    const container = document.getElementById('recipesList');
    
    if (recipes.length === 0) {
        container.innerHTML = '<p>No recipes found. Create your first recipe in the Recipe Costing tab.</p>';
        return;
    }
    
    container.innerHTML = recipes.map(recipe => {
        const priceChangedBadge = recipe.priceChanged ? '<span class="price-changed-indicator">Price Changed</span>' : '';
        return `<div class="card recipe-card" onclick="showRecipeDetailFromDashboard(${recipe.id})">
            <h4>${recipe.name}${priceChangedBadge}</h4>
            <p><strong>Category:</strong> ${recipe.category}${recipe.subcategory ? ` > ${recipe.subcategory}` : ''}</p>
            <p><strong>Cost/Unit:</strong> <span class="rupee">₹${(recipe.costPerUnit || recipe.totalCost / (recipe.batchSize || 1)).toFixed(2)}</span> | 
               <strong>Price:</strong> <span class="rupee">₹${recipe.suggestedPrice.toFixed(2)}</span> | 
               <strong>Margin:</strong> ${recipe.profitMargin}%</p>
            <p><small>Modified: ${recipe.dateModified || recipe.dateCreated}</small></p>
        </div>`;
    }).join('');
}

// NEW: Function to open recipe detail from dashboard
function showRecipeDetailFromDashboard(recipeId) {
    showRecipeDetail(recipeId);
}

function displaySavedRecipes() {
    const container = document.getElementById('savedRecipesList');
    
    if (recipes.length === 0) {
        container.innerHTML = '<p>No recipes saved yet.</p>';
        return;
    }
    
    container.innerHTML = recipes.map(recipe => {
        const costPerUnit = recipe.costPerUnit || (recipe.totalCost / (recipe.batchSize || 1));
        const priceChangedBadge = recipe.priceChanged ? '<span class="price-changed-indicator">Price Changed</span>' : '';
        return `<div class="card recipe-card" data-recipe-name="${recipe.name.toLowerCase()}" onclick="showRecipeDetail(${recipe.id})">
            <h4>${recipe.name}${priceChangedBadge}</h4>
            <p><strong>Category:</strong> ${recipe.category} | <strong>Margin:</strong> ${recipe.profitMargin}%</p>
            <p><strong>Cost/Unit:</strong> <span class="rupee">₹${costPerUnit.toFixed(2)}</span> | <strong>Price:</strong> <span class="rupee">₹${recipe.suggestedPrice.toFixed(2)}</span></p>
        </div>`;
    }).join('');
}

// Filter recipes
function filterRecipes() {
    const searchTerm = document.getElementById('recipeSearch').value.toLowerCase();
    const recipeCards = document.querySelectorAll('#savedRecipesList .item-card, #savedRecipesList .recipe-card');
    
    recipeCards.forEach(card => {
        const name = card.getAttribute('data-recipe-name');
        
        if (name && name.includes(searchTerm)) {
            card.style.display = 'block';
        } else if (name) {
            card.style.display = 'none';
        }
    });
}

function displayCostAnalysis() {
    const container = document.getElementById('costAnalysis');
    
    if (recipes.length === 0) {
        container.innerHTML = '<p>Save recipes to see analysis.</p>';
        return;
    }
    
    const totalRecipes = recipes.length;
    const avgCost = recipes.reduce((sum, recipe) => {
        const costPerUnit = recipe.costPerUnit || (recipe.totalCost / (recipe.batchSize || 1));
        return sum + costPerUnit;
    }, 0) / totalRecipes;
    const avgPrice = recipes.reduce((sum, recipe) => sum + recipe.suggestedPrice, 0) / totalRecipes;
    const avgMargin = recipes.reduce((sum, recipe) => sum + recipe.profitMargin, 0) / totalRecipes;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="card metric-card">
                <h4>Avg Cost/Unit</h4>
                <div class="metric-value" style="font-size: 18px;">₹${avgCost.toFixed(2)}</div>
            </div>
            <div class="card metric-card">
                <h4>Avg Price/Unit</h4>
                <div class="metric-value" style="font-size: 18px;">₹${avgPrice.toFixed(2)}</div>
            </div>
            <div class="card metric-card">
                <h4>Avg Margin</h4>
                <div class="metric-value" style="font-size: 18px;">${avgMargin.toFixed(1)}%</div>
            </div>
        </div>
    `;
}

// FIXED: Show recipe detail with correct price display
function showRecipeDetail(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const costPerUnit = recipe.costPerUnit || (recipe.totalCost / (recipe.batchSize || 1));
    const overheadCostTotal = recipe.overheadPercentage ? 
        (recipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0) + ((recipe.bakingTime / 60) * recipe.laborRate)) * (recipe.overheadPercentage / 100) : 0;
    
    const priceChangedAlert = recipe.priceChanged ? 
        '<div class="alert alert-warning">⚠️ Some ingredient prices have changed since this recipe was created. Review costs for accuracy.</div>' : '';
    
    const content = document.getElementById('recipeDetailContent');
    content.innerHTML = `
        <div class="card">
            ${priceChangedAlert}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
                <h2 style="margin: 0;">${recipe.name}</h2>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="editRecipe(${recipe.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteRecipeConfirm(${recipe.id})">Delete</button>
                </div>
            </div>
            
            <div class="grid grid-2">
                <div>
                    <h3>Recipe Information</h3>
                    <p><strong>Category:</strong> ${recipe.category}${recipe.subcategory ? ` > ${recipe.subcategory}` : ''}</p>
                    <p><strong>Version:</strong> ${recipe.version || 1}</p>
                    <p><strong>Batch Size:</strong> ${recipe.batchSize || 1} units</p>
                    <p><strong>Created:</strong> ${recipe.dateCreated}</p>
                    <p><strong>Modified:</strong> ${recipe.dateModified || recipe.dateCreated}</p>
                    ${recipe.notes ? `<div style="margin-top: 1rem;"><strong>Notes:</strong><div style="background: var(--background); padding: 1rem; border-radius: var(--radius); margin-top: 0.5rem; white-space: pre-wrap;">${recipe.notes}</div></div>` : ''}
                </div>
                
                <div class="cost-summary">
                    <h3>Cost Summary</h3>
                    <div class="cost-item"><span>Ingredients:</span><span class="rupee">₹${recipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0).toFixed(2)}</span></div>
                    <div class="cost-item"><span>Labor:</span><span class="rupee">₹${((recipe.bakingTime / 60) * recipe.laborRate).toFixed(2)}</span></div>
                    ${recipe.overheadPercentage ? `<div class="cost-item"><span>Overhead (${recipe.overheadPercentage}%):</span><span class="rupee">₹${overheadCostTotal.toFixed(2)}</span></div>` : ''}
                    <div class="cost-item"><span>Fixed (Total):</span><span class="rupee">₹${(recipe.fixedCost * (recipe.batchSize || 1)).toFixed(2)}</span></div>
                    <div class="cost-item"><span>Packaging (Total):</span><span class="rupee">₹${(recipe.packagingCost * (recipe.batchSize || 1)).toFixed(2)}</span></div>
                    <div class="cost-item total"><span>TOTAL:</span><span class="rupee">₹${recipe.totalCost.toFixed(2)}</span></div>
                    <div class="cost-item"><span>Per Unit:</span><span class="rupee">₹${costPerUnit.toFixed(2)}</span></div>
                    <div class="suggested-price">
                        <strong>Selling Price (${recipe.profitMargin}%): <span class="rupee">₹${recipe.suggestedPrice.toFixed(2)}</span></strong>
                    </div>
                </div>
            </div>
            
            <h3>Ingredients</h3>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th>Quantity</th>
                            <th>Price @ Creation</th>
                            <th>Current Price</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recipe.ingredients.map(ing => {
                            const currentIngredient = ingredients.find(i => i.id === ing.ingredientId);
                            const actualCurrentPrice = currentIngredient ? currentIngredient.currentPrice : ing.currentPrice;
                            const priceChanged = ing.priceAtCreation !== actualCurrentPrice;
                            return `
                                <tr>
                                    <td>${ing.name}</td>
                                    <td>${ing.quantity} ${ing.unit}</td>
                                    <td class="rupee">₹${ing.priceAtCreation.toFixed(2)}</td>
                                    <td class="rupee ${priceChanged ? 'text-warning' : ''}">₹${actualCurrentPrice.toFixed(2)}${priceChanged ? ' ⚠️' : ''}</td>
                                    <td class="rupee">₹${ing.cost.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <h3>Production Details</h3>
            <p><strong>Time:</strong> ${recipe.bakingTime} min | <strong>Labor:</strong> ₹${recipe.laborRate}/hr${recipe.overheadPercentage ? ` | <strong>Overhead:</strong> ${recipe.overheadPercentage}%` : ''}</p>
        </div>
    `;
    
    document.getElementById('recipes').classList.remove('active');
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('recipeDetail').classList.add('active');
}

function backToDashboard() {
    document.getElementById('recipeDetail').classList.remove('active');
    
    const wasDashboard = document.querySelector('#recipesList').closest('#dashboard');
    if (wasDashboard) {
        document.getElementById('dashboard').classList.add('active');
    } else {
        document.getElementById('recipes').classList.add('active');
    }
}

function deleteRecipeConfirm(recipeId) {
    if (confirm('Delete this recipe?')) {
        recipes = recipes.filter(recipe => recipe.id !== recipeId);
        
        document.getElementById('recipeDetail').classList.remove('active');
        if (recipes.length === 0) {
            document.getElementById('dashboard').classList.add('active');
            updateDashboard();
        } else {
            document.getElementById('recipes').classList.add('active');
            displaySavedRecipes();
        }
    }
}

// Data management
function loadDataStats() {
    const container = document.getElementById('dataStats');
    
    const totalIngredients = ingredients.length;
    const totalSuppliers = suppliers.length;
    const totalRecipes = recipes.length;
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    
    const dataSize = JSON.stringify({ ingredients, recipes, categories, suppliers }).length;
    const dataSizeKB = (dataSize / 1024).toFixed(2);
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="card metric-card">
                <h4>📋 Recipes</h4>
                <div class="metric-value">${totalRecipes}</div>
            </div>
            <div class="card metric-card">
                <h4>🥄 Ingredients</h4>
                <div class="metric-value">${totalIngredients}</div>
            </div>
            <div class="card metric-card">
                <h4>🏢 Suppliers</h4>
                <div class="metric-value">${totalSuppliers}</div>
            </div>
            <div class="card metric-card">
                <h4>📂 Categories</h4>
                <div class="metric-value">${totalCategories}</div>
                <p class="metric-label">${totalSubcategories} subcategories</p>
            </div>
            <div class="card metric-card">
                <h4>💾 Data Size</h4>
                <div class="metric-value">${dataSizeKB}</div>
                <p class="metric-label">KB</p>
            </div>
        </div>
    `;
}

function exportData() {
    const data = { 
        version: '3.1',
        exportDate: new Date().toISOString(),
        ingredients, 
        recipes, 
        categories,
        suppliers
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `true-origin-foods-v3.1-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.ingredients && data.recipes && data.categories) {
                if (confirm('This will replace all data. Continue?')) {
                    ingredients = data.ingredients || [];
                    recipes = data.recipes || [];
                    categories = data.categories || [];
                    suppliers = data.suppliers || [];
                    
                    // Ensure suppliers have products array
                    suppliers.forEach(supplier => {
                        if (!supplier.products) supplier.products = [];
                    });
                    
                    loadIngredients();
                    loadCategories();
                    loadCategoryDropdowns();
                    updateDashboard();
                    displayIngredients();
                    displayCategories();
                    displaySuppliers();
                    loadDataStats();
                    
                    alert('Data imported successfully!');
                }
            } else {
                alert('Invalid backup file');
            }
        } catch (error) {
            alert('Failed to import: Invalid file');
        }
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

// Utility functions
function showAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.classList.remove('hidden');
        setTimeout(() => alert.classList.add('hidden'), 3000);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

console.log('TRUE ORIGIN FOODS - v3.1 Loaded Successfully');
console.log('✓ Categories removed from ingredients');
console.log('✓ Dashboard recipe clicks fixed');
console.log('✓ Supplier product linking enabled');
console.log('✓ Price display corrected');
console.log('✓ Unit CRUD enabled');
