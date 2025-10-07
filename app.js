// TRUE ORIGIN FOODS - Complete Multi-Unit Bakery Cost Calculator
// Version 2.3 - Mobile Optimized & Responsive

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
    console.log('TRUE ORIGIN FOODS - Initializing...');

    suppliers = [
        { id: 1, name: 'ABC Supplies', contact: '+91-9876543210', email: 'sales@abcsupplies.com', address: 'Mumbai', creditDays: 30 },
        { id: 2, name: 'XYZ Traders', contact: '+91-9876543211', email: 'info@xyztraders.com', address: 'Delhi', creditDays: 15 },
        { id: 3, name: 'Sweet Co', contact: '+91-9876543212', email: 'orders@sweetco.com', address: 'Pune', creditDays: 45 },
        { id: 4, name: 'Dairy Best', contact: '+91-9876543213', email: 'supply@dairybest.com', address: 'Bangalore', creditDays: 30 }
    ];

    ingredients = [
        { 
            id: 1, 
            name: 'Flour',
            category: 'Grains',
            unit: 'kg',
            suppliers: [
                { supplierId: 1, currentPrice: 45.00, lastUpdated: '2025-09-20', priceHistory: [{ price: 45.00, date: '2025-09-20' }] },
                { supplierId: 2, currentPrice: 47.00, lastUpdated: '2025-09-20', priceHistory: [{ price: 47.00, date: '2025-09-20' }] }
            ]
        },
        { 
            id: 2, 
            name: 'Milk',
            category: 'Dairy',
            unit: 'ltr',
            suppliers: [
                { supplierId: 4, currentPrice: 65.00, lastUpdated: '2025-09-20', priceHistory: [{ price: 65.00, date: '2025-09-20' }] }
            ]
        },
        { 
            id: 3, 
            name: 'Eggs',
            category: 'Protein',
            unit: 'pcs',
            suppliers: [
                { supplierId: 3, currentPrice: 8.00, lastUpdated: '2025-09-20', priceHistory: [{ price: 8.00, date: '2025-09-20' }] }
            ]
        },
        { 
            id: 4, 
            name: 'Sugar',
            category: 'Sweeteners',
            unit: 'kg',
            suppliers: [
                { supplierId: 3, currentPrice: 60.00, lastUpdated: '2025-09-20', priceHistory: [{ price: 60.00, date: '2025-09-20' }] }
            ]
        },
        { 
            id: 5, 
            name: 'Butter',
            category: 'Dairy',
            unit: 'kg',
            suppliers: [
                { supplierId: 4, currentPrice: 450.00, lastUpdated: '2025-09-20', priceHistory: [{ price: 450.00, date: '2025-09-20' }] }
            ]
        }
    ];

    categories = [
        { id: 1, name: 'Cakes', subcategories: ['Birthday Cakes', 'Wedding Cakes'], margin: 45 },
        { id: 2, name: 'Cookies', subcategories: ['Chocolate Chip', 'Sugar Cookies'], margin: 40 },
        { id: 3, name: 'Breads', subcategories: ['White Bread', 'Whole Wheat'], margin: 35 }
    ];

    recipes = [];

    loadIngredients();
    loadCategories();
    loadSuppliers();
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

function logout() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
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

// Supplier management
function loadSuppliers() {
    const supplierSelects = document.querySelectorAll('select[id*="supplier"]:not([id*="Ingredient"])');
    supplierSelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select supplier</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            select.appendChild(option);
        });
        if (currentValue) select.value = currentValue;
    });
}

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
            <div class="sleek-content" id="suppliers-content">
                <div class="item-grid">
                    ${suppliers.map(supplier => {
                        const supplierProducts = getSupplierProducts(supplier.id);
                        return `
                            <div class="item-card">
                                <div class="item-header">
                                    <h4>${supplier.name}</h4>
                                    <span class="badge badge-primary">${supplier.creditDays} days</span>
                                </div>
                                <div class="item-info">
                                    <p><strong>Contact:</strong> ${supplier.contact}</p>
                                    <p><strong>Email:</strong> ${supplier.email}</p>
                                    <p><strong>Products:</strong> ${supplierProducts.length} items</p>
                                </div>
                                <div class="item-actions">
                                    <button class="btn btn-primary btn-small" onclick="viewSupplierProducts(${supplier.id})">View Products</button>
                                    <button class="btn btn-secondary btn-small" onclick="openEditSupplierModal(${supplier.id})">Edit</button>
                                    <button class="btn btn-success btn-small" onclick="addProductToSupplier(${supplier.id})">Add Product</button>
                                    <button class="btn btn-danger btn-small" onclick="deleteSupplierSafely(${supplier.id})">Delete</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
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

function getSupplierProducts(supplierId) {
    const products = [];
    ingredients.forEach(ingredient => {
        const supplierData = ingredient.suppliers.find(s => s.supplierId === supplierId);
        if (supplierData) {
            products.push({
                ...ingredient,
                price: supplierData.currentPrice,
                lastUpdated: supplierData.lastUpdated,
                priceHistory: supplierData.priceHistory
            });
        }
    });
    return products;
}

function viewSupplierProducts(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    const products = getSupplierProducts(supplierId);

    const content = document.getElementById('supplierDetailContent');
    content.innerHTML = `
        <div class="card">
            <h2>${supplier.name} - Product Catalog</h2>
            <p><strong>Contact:</strong> ${supplier.contact} | <strong>Email:</strong> ${supplier.email}</p>
            <p><strong>Credit Terms:</strong> ${supplier.creditDays} days</p>

            <div style="margin: 1.5rem 0;">
                <button class="btn btn-success" onclick="addProductToSupplier(${supplierId})">Add New Product</button>
            </div>

            ${products.length === 0 ? 
                '<p>No products for this supplier.</p>' :
                `<div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td><strong>${product.name}</strong></td>
                                    <td>${product.category}</td>
                                    <td class="rupee">₹${product.price.toFixed(2)}/${product.unit}</td>
                                    <td>${product.lastUpdated}</td>
                                    <td>
                                        <button class="btn btn-secondary btn-small" onclick="updateProductPrice(${product.id}, ${supplierId})">Update</button>
                                        <button class="btn btn-primary btn-small" onclick="showPriceHistory(${product.id})">History</button>
                                        <button class="btn btn-danger btn-small" onclick="removeProductFromSupplier(${product.id}, ${supplierId})">Remove</button>
                                    </td>
                                </tr>
                            `).join('')}
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
        creditDays: creditDays
    });

    document.getElementById('newSupplierName').value = '';
    document.getElementById('newSupplierContact').value = '';
    document.getElementById('newSupplierEmail').value = '';
    document.getElementById('newSupplierCreditDays').value = '';

    showAlert('supplierAlert');
    displaySuppliers();
    loadSuppliers();
    loadSupplierDropdowns();
    updateDashboard();
}

function openEditSupplierModal(supplierId) {
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
    loadSuppliers();
    showAlert('supplierAlert');
}

function deleteSupplierSafely(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const dependentRecipes = [];
    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            if (ingredient.supplierId === supplierId && !dependentRecipes.includes(recipe.name)) {
                dependentRecipes.push(recipe.name);
            }
        });
    });

    if (dependentRecipes.length > 0) {
        alert(`Cannot delete ${supplier.name}! Used in recipes: ${dependentRecipes.join(', ')}`);
        return;
    }

    const supplierProducts = getSupplierProducts(supplierId);
    if (supplierProducts.length > 0) {
        if (!confirm(`${supplier.name} has ${supplierProducts.length} products. Continue?`)) return;

        ingredients.forEach(ingredient => {
            ingredient.suppliers = ingredient.suppliers.filter(s => s.supplierId !== supplierId);
        });
    }

    if (confirm(`Delete ${supplier.name}?`)) {
        suppliers = suppliers.filter(s => s.id !== supplierId);
        displaySuppliers();
        loadSuppliers();
        loadSupplierDropdowns();
        updateDashboard();
        showAlert('supplierAlert');
    }
}

// Ingredient management
function addIngredientToMaster() {
    const name = document.getElementById('newIngredientName').value.trim();
    const unit = document.getElementById('newIngredientUnit').value;

    if (!name) {
        alert('Please enter an ingredient name');
        return;
    }

    if (ingredients.find(ing => ing.name.toLowerCase() === name.toLowerCase())) {
        alert('Ingredient already exists');
        return;
    }

    ingredients.push({
        id: Date.now(),
        name: name,
        category: 'General',
        unit: unit,
        suppliers: []
    });

    loadIngredients();
    displayIngredients();
    updateDashboard();

    document.getElementById('newIngredientName').value = '';
    document.getElementById('newIngredientUnit').value = 'kg';
    showAlert('ingredientAlert');
}

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
            <div class="sleek-content" id="ingredients-content">
                <div class="item-grid">
                    ${ingredients.map(ingredient => {
                        const maxPrice = ingredient.suppliers.length > 0 ? 
                            Math.max(...ingredient.suppliers.map(s => s.currentPrice)) : 0;

                        return `
                            <div class="item-card">
                                <div class="item-header" onclick="toggleIngredientDetails(${ingredient.id})">
                                    <h4>${ingredient.name}</h4>
                                    <span class="badge badge-success">₹${maxPrice.toFixed(2)}/${ingredient.unit}</span>
                                </div>
                                <div class="item-info">
                                    <p><strong>Category:</strong> ${ingredient.category}</p>
                                    <p><strong>Unit:</strong> ${ingredient.unit}</p>
                                    <p><strong>Suppliers:</strong> ${ingredient.suppliers.length}</p>
                                </div>
                                <div id="ingredient-details-${ingredient.id}" class="ingredient-details" style="display: none;">
                                    ${ingredient.suppliers.length === 0 ? 
                                        '<p>No suppliers added</p>' : 
                                        ingredient.suppliers.map(supplierData => {
                                            const supplier = suppliers.find(s => s.id === supplierData.supplierId);
                                            return supplier ? `
                                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                                    <div>
                                                        <strong>${supplier.name}</strong><br>
                                                        <span class="rupee">₹${supplierData.currentPrice.toFixed(2)}/${ingredient.unit}</span>
                                                        <small> (${supplierData.lastUpdated})</small>
                                                    </div>
                                                    <div>
                                                        <button class="btn btn-secondary btn-small" onclick="editIngredientSupplier(${ingredient.id}, ${supplier.id})">Edit</button>
                                                        <button class="btn btn-danger btn-small" onclick="deleteIngredientSupplier(${ingredient.id}, ${supplier.id})">Remove</button>
                                                    </div>
                                                </div>
                                            ` : '';
                                        }).join('')
                                    }
                                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                                        <button class="btn btn-success btn-small" onclick="addSupplierToIngredient(${ingredient.id})">Add Supplier</button>
                                        <button class="btn btn-primary btn-small" onclick="showPriceHistory(${ingredient.id})">Price History</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
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

function toggleIngredientDetails(ingredientId) {
    const details = document.getElementById(`ingredient-details-${ingredientId}`);
    const isVisible = details.style.display !== 'none';

    document.querySelectorAll('[id^="ingredient-details-"]').forEach(el => {
        el.style.display = 'none';
    });

    details.style.display = isVisible ? 'none' : 'block';
}

function addSupplierToIngredient(ingredientId) {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    const availableSuppliers = suppliers.filter(supplier => 
        !ingredient.suppliers.some(s => s.supplierId === supplier.id)
    );

    if (availableSuppliers.length === 0) {
        alert('All suppliers already associated');
        return;
    }

    document.getElementById('supplierModal').style.display = 'block';
    document.getElementById('supplierIngredientId').value = ingredientId;
    document.getElementById('supplierEditId').value = '';
    document.getElementById('supplierModalTitle').textContent = 'Add Supplier';
    document.getElementById('supplierPriceUnit').textContent = ingredient.unit;

    const supplierSelect = document.getElementById('supplierNameSelect');
    supplierSelect.innerHTML = '<option value="">Select supplier</option>';
    availableSuppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        supplierSelect.appendChild(option);
    });

    document.getElementById('supplierPrice').value = '';
}

function editIngredientSupplier(ingredientId, supplierId) {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    const supplierData = ingredient.suppliers.find(s => s.supplierId === supplierId);
    const supplier = suppliers.find(s => s.id === supplierId);

    document.getElementById('supplierModal').style.display = 'block';
    document.getElementById('supplierIngredientId').value = ingredientId;
    document.getElementById('supplierEditId').value = supplierId;
    document.getElementById('supplierModalTitle').textContent = 'Edit Price';
    document.getElementById('supplierPriceUnit').textContent = ingredient.unit;

    const supplierSelect = document.getElementById('supplierNameSelect');
    supplierSelect.innerHTML = `<option value="${supplier.id}">${supplier.name}</option>`;
    supplierSelect.disabled = true;

    document.getElementById('supplierPrice').value = supplierData.currentPrice;
}

function saveSupplier() {
    const ingredientId = parseInt(document.getElementById('supplierIngredientId').value);
    const supplierId = document.getElementById('supplierEditId').value;
    const selectedSupplierId = document.getElementById('supplierNameSelect').value;
    const price = parseFloat(document.getElementById('supplierPrice').value);

    if (!selectedSupplierId || !price) {
        alert('Please fill all fields');
        return;
    }

    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;

    if (supplierId) {
        const supplierData = ingredient.suppliers.find(s => s.supplierId == supplierId);
        if (supplierData) {
            supplierData.priceHistory.push({
                price: supplierData.currentPrice,
                date: supplierData.lastUpdated
            });
            supplierData.currentPrice = price;
            supplierData.lastUpdated = new Date().toISOString().split('T')[0];
        }
    } else {
        ingredient.suppliers.push({
            supplierId: parseInt(selectedSupplierId),
            currentPrice: price,
            lastUpdated: new Date().toISOString().split('T')[0],
            priceHistory: [{ price: price, date: new Date().toISOString().split('T')[0] }]
        });
    }

    closeSupplierModal();
    displayIngredients();
    loadIngredients();
    showAlert('supplierModalAlert');
}

function deleteIngredientSupplier(ingredientId, supplierId) {
    if (confirm('Remove this supplier?')) {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        ingredient.suppliers = ingredient.suppliers.filter(s => s.supplierId !== supplierId);
        displayIngredients();
        loadIngredients();
    }
}

function closeSupplierModal() {
    document.getElementById('supplierModal').style.display = 'none';
    document.getElementById('supplierModalAlert').classList.add('hidden');
    document.getElementById('supplierNameSelect').disabled = false;
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
            <div class="sleek-content" id="categories-content">
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
    const selects = document.querySelectorAll('select[id^="ingredient"]:not([id$="Id"])');

    selects.forEach(select => {
        select.innerHTML = '<option value="">Select ingredient</option>';
        ingredients.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient.id;
            option.textContent = `${ingredient.name} (${ingredient.category})`;
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

// Update ingredient suppliers
function updateIngredientSuppliers(rowId) {
    const ingredientSelect = document.getElementById(`ingredient${rowId}`);
    const supplierSelect = document.getElementById(`supplier${rowId}`);
    const priceInput = document.getElementById(`price${rowId}`);
    const unitSelect = document.getElementById(`unit${rowId}`);

    if (!ingredientSelect || !supplierSelect || !priceInput || !unitSelect) return;

    supplierSelect.innerHTML = '<option value="">Select supplier</option>';
    priceInput.value = '';

    if (ingredientSelect.value) {
        const ingredient = ingredients.find(ing => ing.id == ingredientSelect.value);

        if (ingredient && ingredient.suppliers && ingredient.suppliers.length > 0) {
            ingredient.suppliers.forEach(supplierData => {
                const supplier = suppliers.find(s => s.id === supplierData.supplierId);
                if (supplier) {
                    const option = document.createElement('option');
                    option.value = supplier.id;
                    option.textContent = `${supplier.name} (₹${supplierData.currentPrice.toFixed(2)}/${ingredient.unit})`;
                    supplierSelect.appendChild(option);
                }
            });

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

function updateSupplierPrice(rowId) {
    const ingredientSelect = document.getElementById(`ingredient${rowId}`);
    const supplierSelect = document.getElementById(`supplier${rowId}`);
    const priceInput = document.getElementById(`price${rowId}`);

    if (!ingredientSelect || !supplierSelect || !priceInput) return;

    if (ingredientSelect.value && supplierSelect.value) {
        const ingredient = ingredients.find(ing => ing.id == ingredientSelect.value);
        if (ingredient) {
            const supplierData = ingredient.suppliers.find(s => s.supplierId == supplierSelect.value);
            if (supplierData) {
                priceInput.value = supplierData.currentPrice.toFixed(2);
                calculateRowCost(rowId);
                return;
            }
        }
    }

    priceInput.value = '';
    calculateRowCost(rowId);
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
            <select id="ingredient${ingredientCounter}" onchange="updateIngredientSuppliers(${ingredientCounter})">
                <option value="">Select</option>
                ${ingredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}
            </select>
        </td>
        <td>
            <select id="supplier${ingredientCounter}" onchange="updateSupplierPrice(${ingredientCounter})">
                <option value="">Select</option>
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
        const supplierSelect = document.getElementById(`supplier${id}`);
        const quantityInput = document.getElementById(`quantity${id}`);
        const unitSelect = document.getElementById(`unit${id}`);
        const priceInput = document.getElementById(`price${id}`);
        const costSpan = document.getElementById(`cost${id}`);

        if (ingredientSelect?.value && supplierSelect?.value && quantityInput?.value && priceInput?.value) {
            const ingredient = ingredients.find(ing => ing.id == ingredientSelect.value);
            const supplier = suppliers.find(sup => sup.id == supplierSelect.value);

            recipeIngredients.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                supplierId: supplier.id,
                supplierName: supplier.name,
                quantity: parseFloat(quantityInput.value),
                unit: unitSelect.value,
                pricePerBaseUnit: parseFloat(priceInput.value),
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
        updateIngredientSuppliers(rowId);

        setTimeout(() => {
            document.getElementById(`supplier${rowId}`).value = ingredient.supplierId;
            document.getElementById(`quantity${rowId}`).value = ingredient.quantity;
            document.getElementById(`unit${rowId}`).value = ingredient.unit;
            document.getElementById(`price${rowId}`).value = ingredient.pricePerBaseUnit;
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
            <td><select id="ingredient0" onchange="updateIngredientSuppliers(0)"><option value="">Select</option>${ingredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}</select></td>
            <td><select id="supplier0" onchange="updateSupplierPrice(0)"><option value="">Select</option></select></td>
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

function displayRecipesList() {
    const container = document.getElementById('recipesList');

    if (recipes.length === 0) {
        container.innerHTML = '<p>No recipes found. Create your first recipe in Recipe Costing.</p>';
        return;
    }

    container.innerHTML = recipes.map(recipe => 
        `<div class="card recipe-card" onclick="showRecipeDetail(${recipe.id})">
            <h4>${recipe.name}</h4>
            <p><strong>Category:</strong> ${recipe.category}${recipe.subcategory ? ` > ${recipe.subcategory}` : ''}</p>
            <p><strong>Cost/Unit:</strong> <span class="rupee">₹${(recipe.costPerUnit || recipe.totalCost / (recipe.batchSize || 1)).toFixed(2)}</span> | 
               <strong>Price:</strong> <span class="rupee">₹${recipe.suggestedPrice.toFixed(2)}</span> | 
               <strong>Margin:</strong> ${recipe.profitMargin}%</p>
            <p><small>Modified: ${recipe.dateModified || recipe.dateCreated}</small></p>
        </div>`
    ).join('');
}

function displaySavedRecipes() {
    const container = document.getElementById('savedRecipesList');

    if (recipes.length === 0) {
        container.innerHTML = '<p>No recipes saved yet.</p>';
        return;
    }

    container.innerHTML = recipes.map(recipe => {
        const costPerUnit = recipe.costPerUnit || (recipe.totalCost / (recipe.batchSize || 1));
        return `<div class="card recipe-card" onclick="showRecipeDetail(${recipe.id})">
            <h4>${recipe.name}</h4>
            <p><strong>Category:</strong> ${recipe.category} | <strong>Margin:</strong> ${recipe.profitMargin}%</p>
            <p><strong>Cost/Unit:</strong> <span class="rupee">₹${costPerUnit.toFixed(2)}</span> | <strong>Price:</strong> <span class="rupee">₹${recipe.suggestedPrice.toFixed(2)}</span></p>
        </div>`;
    }).join('');
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

function showRecipeDetail(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const costPerUnit = recipe.costPerUnit || (recipe.totalCost / (recipe.batchSize || 1));
    const overheadCostTotal = recipe.overheadPercentage ? 
        (recipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0) + ((recipe.bakingTime / 60) * recipe.laborRate)) * (recipe.overheadPercentage / 100) : 0;

    const content = document.getElementById('recipeDetailContent');
    content.innerHTML = `
        <div class="card">
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
                            <th>Supplier</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recipe.ingredients.map(ing => `
                            <tr>
                                <td>${ing.name}</td>
                                <td>${ing.supplierName}</td>
                                <td>${ing.quantity} ${ing.unit}</td>
                                <td class="rupee">₹${ing.pricePerBaseUnit.toFixed(2)}</td>
                                <td class="rupee">₹${ing.cost.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <h3>Production Details</h3>
            <p><strong>Time:</strong> ${recipe.bakingTime} min | <strong>Labor:</strong> ₹${recipe.laborRate}/hr${recipe.overheadPercentage ? ` | <strong>Overhead:</strong> ${recipe.overheadPercentage}%` : ''}</p>
        </div>
    `;

    document.getElementById('recipes').classList.remove('active');
    document.getElementById('recipeDetail').classList.add('active');
}

function backToDashboard() {
    document.getElementById('recipeDetail').classList.remove('active');

    if (document.getElementById('dashboard').classList.contains('active')) {
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

// Price history
function showPriceHistory(ingredientId) {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;

    const content = document.getElementById('priceHistoryContent');
    document.getElementById('priceHistoryTitle').textContent = `Price History - ${ingredient.name}`;

    let historyHtml = '';

    ingredient.suppliers.forEach(supplierData => {
        const supplier = suppliers.find(s => s.id === supplierData.supplierId);
        if (supplier) {
            historyHtml += `
                <div class="supplier-price-entry">
                    <div class="supplier-price-header">
                        <h4>${supplier.name}</h4>
                        <span class="badge badge-success">Current: ₹${supplierData.currentPrice.toFixed(2)}/${ingredient.unit}</span>
                    </div>
                    <div class="price-history">
                        <h5>Price History:</h5>
                        ${supplierData.priceHistory.map(entry => `
                            <div class="price-entry">
                                <span>${entry.date}</span>
                                <span class="rupee">₹${entry.price.toFixed(2)}/${ingredient.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    if (!historyHtml) {
        historyHtml = '<p>No price history available.</p>';
    }

    content.innerHTML = historyHtml;
    document.getElementById('priceHistoryModal').style.display = 'block';
}

function closePriceHistoryModal() {
    document.getElementById('priceHistoryModal').style.display = 'none';
}

function addProductToSupplier(supplierId) {
    const availableIngredients = ingredients.filter(ing => 
        !ing.suppliers.some(s => s.supplierId === supplierId)
    );

    if (availableIngredients.length === 0) {
        alert('All ingredients already associated');
        return;
    }

    document.getElementById('productSupplierModal').style.display = 'block';
    document.getElementById('modalSupplierId').value = supplierId;

    const ingredientSelect = document.getElementById('modalIngredientSelect');
    ingredientSelect.innerHTML = '<option value="">Select</option>';
    availableIngredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.id;
        option.textContent = ingredient.name;
        ingredientSelect.appendChild(option);
    });

    ingredientSelect.addEventListener('change', () => {
        const selectedIngredient = ingredients.find(ing => ing.id == ingredientSelect.value);
        if (selectedIngredient) {
            document.getElementById('modalPriceUnit').textContent = selectedIngredient.unit;
        }
    });
}

function saveProductToSupplier() {
    const supplierId = parseInt(document.getElementById('modalSupplierId').value);
    const ingredientId = parseInt(document.getElementById('modalIngredientSelect').value);
    const price = parseFloat(document.getElementById('modalProductPrice').value);

    if (!ingredientId || !price) {
        alert('Please fill all fields');
        return;
    }

    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (ingredient) {
        ingredient.suppliers.push({
            supplierId: supplierId,
            currentPrice: price,
            lastUpdated: new Date().toISOString().split('T')[0],
            priceHistory: [{ price: price, date: new Date().toISOString().split('T')[0] }]
        });

        closeModal('productSupplierModal');
        viewSupplierProducts(supplierId);
        loadIngredients();

        document.getElementById('modalIngredientSelect').value = '';
        document.getElementById('modalProductPrice').value = '';
    }
}

function updateProductPrice(ingredientId, supplierId) {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    const supplierData = ingredient.suppliers.find(s => s.supplierId === supplierId);

    document.getElementById('priceUpdateModal').style.display = 'block';
    document.getElementById('updateIngredientId').value = ingredientId;
    document.getElementById('updateSupplierId').value = supplierId;
    document.getElementById('updatePriceUnit').textContent = ingredient.unit;
    document.getElementById('currentPriceInput').value = supplierData.currentPrice;
}

function saveUpdatedPrice() {
    const ingredientId = parseInt(document.getElementById('updateIngredientId').value);
    const supplierId = parseInt(document.getElementById('updateSupplierId').value);
    const newPrice = parseFloat(document.getElementById('currentPriceInput').value);

    if (!newPrice) {
        alert('Please enter a valid price');
        return;
    }

    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    const supplierData = ingredient.suppliers.find(s => s.supplierId === supplierId);

    if (supplierData) {
        supplierData.priceHistory.push({
            price: supplierData.currentPrice,
            date: supplierData.lastUpdated
        });

        supplierData.currentPrice = newPrice;
        supplierData.lastUpdated = new Date().toISOString().split('T')[0];

        closeModal('priceUpdateModal');
        viewSupplierProducts(supplierId);
        loadIngredients();

        document.getElementById('currentPriceInput').value = '';
    }
}

function removeProductFromSupplier(ingredientId, supplierId) {
    if (confirm('Remove this product?')) {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        ingredient.suppliers = ingredient.suppliers.filter(s => s.supplierId !== supplierId);

        viewSupplierProducts(supplierId);
        loadIngredients();
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
        version: '2.3',
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
    link.download = `true-origin-foods-backup-${new Date().toISOString().split('T')[0]}.json`;
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

                    loadIngredients();
                    loadCategories();
                    loadCategoryDropdowns();
                    loadSuppliers();
                    loadSupplierDropdowns();
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

function loadSupplierDropdowns() {
    const supplierSelect = document.getElementById('supplierNameSelect');
    if (supplierSelect) {
        supplierSelect.innerHTML = '<option value="">Select supplier</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
    }
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

console.log('TRUE ORIGIN FOODS - v2.3 Loaded Successfully');
