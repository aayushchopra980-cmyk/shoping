const API = window.location.origin;
let products = [];
const cartKey = "myshop_cart";
const wishlistKey = "myshop_wishlist";
const userKey = "myshop_user";
const themeKey = "myshop_theme";

const debounce = (fn, delay = 200) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeKey, theme);
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    }
}

function initTheme() {
    const stored = localStorage.getItem(themeKey);
    if (stored === "dark" || stored === "light") {
        setTheme(stored);
        return;
    }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
    const current = document.documentElement.dataset.theme || "light";
    setTheme(current === "dark" ? "light" : "dark");
}

function toggleMenu() {
    const toggle = document.getElementById("navToggle");
    document.body.classList.toggle("nav-open");
    toggle?.classList.toggle("open");
}

function closeMenu() {
    const toggle = document.getElementById("navToggle");
    document.body.classList.remove("nav-open");
    toggle?.classList.remove("open");
}

function saveToken(token) {
    localStorage.setItem("myshop_token", token);
}

function getToken() {
    return localStorage.getItem("myshop_token");
}

function saveUser(username) {
    localStorage.setItem(userKey, username);
}

function getUser() {
    return localStorage.getItem(userKey) || "";
}

function clearAuth() {
    localStorage.removeItem("myshop_token");
    localStorage.removeItem(userKey);
}

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem(cartKey)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

function loadWishlist() {
    try {
        return JSON.parse(localStorage.getItem(wishlistKey)) || [];
    } catch {
        return [];
    }
}

function saveWishlist(wishlist) {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}

function setAuthState() {
    const token = getToken();
    const authStatus = document.getElementById("authStatus");
    const logoutBtn = document.getElementById("logoutBtn");
    const username = getUser();

    if (token && username) {
        authStatus.textContent = `Logged in as ${username}`;
        logoutBtn.classList.remove("hidden");
    } else {
        authStatus.textContent = "Not logged in";
        logoutBtn.classList.add("hidden");
    }
    updateCounters();
}

function updateCounters() {
    document.getElementById("cartCount").textContent = loadCart().reduce((sum, item) => sum + (item.qty || 1), 0);
    document.getElementById("wishCount").textContent = loadWishlist().length;
}

function getProductIcon(item) {
    return `<div class="product-image">${item.name.charAt(0).toUpperCase()}</div>`;
}

function sortProducts(list) {
    const order = document.getElementById("sortSelect")?.value || "featured";
    return [...list].sort((a, b) => {
        if (order === "price-asc") return a.price - b.price;
        if (order === "price-desc") return b.price - a.price;
        if (order === "category") return a.category.localeCompare(b.category);
        return a.id - b.id;
    });
}

function renderSuggestions(list) {
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";
    const featured = sortProducts(list).slice(0, 4);
    if (!featured.length) {
        suggestions.innerHTML = `<div class="suggestion-card"><p>No suggestions available.</p></div>`;
        return;
    }
    featured.forEach(item => {
        const card = document.createElement("article");
        card.className = "suggestion-card";
        card.innerHTML = `
            <div class="suggestion-top">
              ${getProductIcon(item)}
              <div>
                <h3>${item.name}</h3>
                <p>${item.category}</p>
              </div>
            </div>
            <p>${item.description || "Explore this product now."}</p>
            <div class="meta"><span>₹${item.price}</span><span>${item.owner}</span></div>
            <div class="card-actions">
              <button class="pill" onclick='addToCart(${item.id})'>Add to cart</button>
              <button class="ghost" onclick='showProductDetails(${item.id})'>View</button>
            </div>
        `;
        suggestions.appendChild(card);
    });
}

function updateNavActive(section) {
    document.querySelectorAll("[data-section]").forEach(button => {
        button.classList.toggle("active", button.dataset.section === section);
    });
}

function showSection(section) {
    document.getElementById("productsSection").classList.toggle("hidden", section !== "products");
    document.getElementById("cartSection").classList.toggle("hidden", section !== "cart");
    document.getElementById("wishlistSection").classList.toggle("hidden", section !== "wishlist");
    updateNavActive(section);
    closeMenu();
}

async function signup() {
    const username = document.getElementById("su_user").value.trim();
    const password = document.getElementById("su_pass").value.trim();
    if (!username || !password) {
        toast("Enter username and password.");
        return;
    }

    const res = await fetch(API + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
        toast(data.detail || "Signup failed.");
        return;
    }
    toast("Signup successful. Please login.");
}

async function login() {
    const username = document.getElementById("li_user").value.trim();
    const password = document.getElementById("li_pass").value.trim();
    if (!username || !password) {
        toast("Enter username and password.");
        return;
    }

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
        toast(data.detail || "Login failed.");
        return;
    }

    saveToken(data.access_token);
    saveUser(username);
    setAuthState();
    toast("Logged in successfully.");
}

function logout() {
    clearAuth();
    setAuthState();
    toast("Logged out.");
}

async function addProduct() {
    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!name || !category || !price || price <= 0) {
        toast("Fill in valid product details.");
        return;
    }

    const token = getToken();
    if (!token) {
        toast("Login before adding products.");
        return;
    }

    const res = await fetch(API + "/add-product", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ name, price, category, description }),
    });

    const data = await res.json();
    if (!res.ok) {
        toast(data.detail || "Could not add product.");
        return;
    }

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    toast("Product added.");
    loadProducts();
}

async function deleteProduct(productId) {
    const token = getToken();
    if (!token) {
        toast("Login to delete products.");
        return;
    }

    const res = await fetch(API + "/delete/" + productId, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (!res.ok) {
        toast(data.detail || "Delete failed.");
        return;
    }

    toast("Product deleted.");
    loadProducts();
}

async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();
    products = Array.isArray(data) ? data : [];
    renderProducts(products);
    renderSuggestions(products);
    populateCategoryFilter(products);
    updateCounters();
}

function renderProducts(list) {
    const container = document.getElementById("products");
    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = `<div class="product-card"><p>No products found.</p></div>`;
        return;
    }

    const username = getUser();
    const sortedList = sortProducts(list);

    sortedList.forEach(item => {
        const card = document.createElement("article");
        card.className = "product-card";
        const ownerBadge = item.owner === username
            ? '<span class="badge">Your product</span>'
            : `<span class="badge">Seller: ${item.owner}</span>`;
        const featuredBadge = item.id <= 2 ? '<span class="badge featured">Featured</span>' : '';
        card.innerHTML = `
            <div class="product-card-header">
              ${getProductIcon(item)}
              <div>
                <div class="product-title-row">
                  <h3>${item.name}</h3>
                  ${featuredBadge}
                </div>
                <p>${item.category}</p>
              </div>
            </div>
            <p>${item.description || "No description available."}</p>
            <div class="meta"><span>₹${item.price}</span>${ownerBadge}</div>
            <div class="card-actions">
              <button class="pill" onclick='addToCart(${item.id})'>Add to cart</button>
              <button class="ghost" onclick='addToWishlist(${item.id})'>Wishlist</button>
              <button class="ghost" onclick='showProductDetails(${item.id})'>Details</button>
              ${item.owner === username ? `<button class="secondary" onclick='deleteProduct(${item.id})'>Delete</button>` : ""}
            </div>
        `;
        container.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const cart = loadCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, category: product.category, qty: 1 });
    }
    saveCart(cart);
    renderCart();
    updateCounters();
    toast(`${product.name} added to cart.`);
}

function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const wishlist = loadWishlist();
    if (wishlist.some(item => item.id === productId)) {
        toast("Already in wishlist.");
        return;
    }
    wishlist.push({ id: product.id, name: product.name, price: product.price, category: product.category });
    saveWishlist(wishlist);
    renderWishlist();
    updateCounters();
    toast(`${product.name} added to wishlist.`);
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const modal = document.getElementById("productModal");
    const content = document.getElementById("modalContent");
    content.innerHTML = `
        <h2>${product.name}</h2>
        <p>${product.description || "No description available."}</p>
        <div class="meta"><span>Category: ${product.category}</span><span>Price: ₹${product.price}</span></div>
        <div class="meta"><span>Owner: ${product.owner}</span></div>
        <div class="card-actions" style="margin-top:16px;">
            <button class="pill" onclick='addToCart(${product.id})'>Add to cart</button>
            <button class="ghost" onclick='addToWishlist(${product.id})'>Wishlist</button>
        </div>
    `;
    modal.classList.remove("hidden");
}

function hideModal() {
    document.getElementById("productModal").classList.add("hidden");
}

function renderCart() {
    const cartItems = loadCart();
    const container = document.getElementById("cartItems");
    const summary = document.getElementById("cartSummary");
    container.innerHTML = "";

    if (!cartItems.length) {
        container.innerHTML = `<div class="bag-item"><p>Your cart is empty.</p></div>`;
        summary.innerHTML = "";
        updateCounters();
        return;
    }

    let total = 0;
    cartItems.forEach(item => {
        total += item.price * item.qty;
        const el = document.createElement("div");
        el.className = "bag-item";
        el.innerHTML = `
            <div><strong>${item.name}</strong><span>₹${item.price} x ${item.qty}</span></div>
            <div class="card-actions">
              <button class="ghost small" onclick='decreaseQty(${item.id})'>-</button>
              <button class="ghost small" onclick='increaseQty(${item.id})'>+</button>
              <button class="secondary small" onclick='removeCartItem(${item.id})'>Remove</button>
            </div>
        `;
        container.appendChild(el);
    });
    summary.innerHTML = `Total: ₹${total.toFixed(0)} <button class="pill" onclick="toast('Checkout demo: no payment taken.')">Checkout</button>`;
    updateCounters();
}

function renderWishlist() {
    const wishlist = loadWishlist();
    const container = document.getElementById("wishlistItems");
    container.innerHTML = "";

    if (!wishlist.length) {
        container.innerHTML = `<div class="bag-item"><p>Your wishlist is empty.</p></div>`;
        updateCounters();
        return;
    }

    wishlist.forEach(item => {
        const el = document.createElement("div");
        el.className = "bag-item";
        el.innerHTML = `
            <div><strong>${item.name}</strong><span>₹${item.price}</span></div>
            <div class="card-actions">
              <button class="pill" onclick='addToCart(${item.id})'>Add to cart</button>
              <button class="secondary small" onclick='removeWishlistItem(${item.id})'>Remove</button>
            </div>
        `;
        container.appendChild(el);
    });
    updateCounters();
}

function increaseQty(productId) {
    const cart = loadCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += 1;
    saveCart(cart);
    renderCart();
}

function decreaseQty(productId) {
    const cart = loadCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, item.qty - 1);
    saveCart(cart);
    renderCart();
}

function removeCartItem(productId) {
    const cart = loadCart().filter(item => item.id !== productId);
    saveCart(cart);
    renderCart();
}

function removeWishlistItem(productId) {
    const wishlist = loadWishlist().filter(item => item.id !== productId);
    saveWishlist(wishlist);
    renderWishlist();
}

function clearCart() {
    saveCart([]);
    renderCart();
    toast("Cart cleared.");
}

function clearWishlist() {
    saveWishlist([]);
    renderWishlist();
    toast("Wishlist cleared.");
}

function filterProducts() {
    const search = document.getElementById("searchInput").value.trim().toLowerCase();
    const category = document.getElementById("categoryFilter").value;
    const filtered = products.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) || item.description?.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
        const matchesCategory = !category || item.category === category;
        return matchesSearch && matchesCategory;
    });
    renderProducts(filtered);
}

function populateCategoryFilter(items) {
    const select = document.getElementById("categoryFilter");
    const categories = Array.from(new Set(items.map(item => item.category))).sort();
    select.innerHTML = `<option value="">All categories</option>`;
    categories.forEach(cat => {
        select.insertAdjacentHTML("beforeend", `<option value="${cat}">${cat}</option>`);
    });
}

function toast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "rgba(15, 23, 42, 0.95)";
    toast.style.color = "white";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "14px";
    toast.style.zIndex = 9999;
    toast.style.opacity = "0";
    toast.style.transition = "opacity 180ms ease, transform 180ms ease";
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(-6px)";
    });
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(6px)";
        setTimeout(() => toast.remove(), 220);
    }, 1800);
}

window.addEventListener("load", () => {
    initTheme();
    setAuthState();
    loadProducts();
    renderCart();
    renderWishlist();
    updateNavActive("products");
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("navToggle").addEventListener("click", toggleMenu);
    document.querySelectorAll("[data-section]").forEach(button => {
        button.addEventListener("click", () => showSection(button.dataset.section));
    });
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(filterProducts, 180));
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        hideModal();
        closeMenu();
    }
});
