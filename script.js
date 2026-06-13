const API = window.location.origin;
let products = [];

function saveToken(token) {
  localStorage.setItem("myshop_token", token);
}

function getToken() {
  return localStorage.getItem("myshop_token");
}

function setAuthState() {
  const token = getToken();
  const status = document.getElementById("authStatus");
  const logoutBtn = document.getElementById("logoutBtn");
  if (token) {
    status.textContent = "Logged in";
    logoutBtn.style.display = "inline-flex";
  } else {
    status.textContent = "Not logged in";
    logoutBtn.style.display = "none";
  }
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
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const err = await res.json();
    toast(err.detail || "Signup failed.");
    return;
  }

  toast("Signup completed. You may now login.");
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
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) {
    toast(data.detail || "Login failed.");
    return;
  }

  saveToken(data.access_token);
  setAuthState();
  toast("Logged in successfully.");
}

function logout() {
  localStorage.removeItem("myshop_token");
  setAuthState();
  toast("Logged out.");
}

async function addProduct() {
  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const category = document.getElementById("category").value.trim();

  if (!name || !category || !price) {
    toast("Fill all product fields.");
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
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ name, price, category })
  });

  const data = await res.json();
  if (!res.ok) {
    toast(data.detail || "Could not add product.");
    return;
  }

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("category").value = "";
  toast("Product added.");
  loadProducts();
}

async function deleteProduct(id) {
  const token = getToken();
  if (!token) {
    toast("Login to delete products.");
    return;
  }

  const res = await fetch(API + "/delete/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) {
    const err = await res.json();
    toast(err.detail || "Delete failed.");
    return;
  }

  toast("Product removed.");
  loadProducts();
}

async function loadProducts() {
  const res = await fetch(API + "/products");
  const data = await res.json();
  products = Array.isArray(data) ? data : [];
  renderProducts(products);
  populateCategoryFilter(products);
}

function renderProducts(list) {
  const container = document.getElementById("products");
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = `<div style="padding:18px;color:#64748b">No products found.</div>`;
    return;
  }

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <div class="product-meta"><span>${item.category}</span><span>₹${item.price}</span></div>
      <div class="product-meta"><span>Owner: ${item.owner || "public"}</span><button onclick="deleteProduct(${item.id})">Delete</button></div>
    `;
    container.appendChild(card);
  });
}

function filterProducts() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const filtered = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
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
  toast.style.bottom = "22px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "rgba(15, 23, 42, 0.94)";
  toast.style.color = "#fff";
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
  setAuthState();
  loadProducts();
  document.getElementById("logoutBtn").addEventListener("click", logout);
});
