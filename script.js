/* =========================================================
   KS Nature Fruit Juices — app logic
   Product data is kept separate from rendering so the shop
   owner can add / edit / remove juices easily below.
   ========================================================= */

const SHOP_WHATSAPP_NUMBER = "919177299879"; // country code + number, no +/spaces
const DELIVERY_CHARGE = 20; // flat delivery charge in ₹
const FREE_DELIVERY_ABOVE = 300;

/* ---------------------------------------------------------
   PRODUCT DATA (admin-friendly: edit this array to update
   the shop's juice menu — name, description, category,
   image, price, sizes, availability)
   --------------------------------------------------------- */
const PRODUCTS = [
  {
    id: "orange",
    name: "Fresh Orange Juice",
    description: "Hand-squeezed oranges, no added sugar, served ice cold.",
    category: "citrus",
    image: "images/pexels-stephen-leonardi-587681991-30900665.jpg",
    price: 80,
    sizes: ["Regular", "Large (+₹20)"],
    popular: true,
    available: true
  },
  {
    id: "mango",
    name: "Mango Juice",
    description: "Ripe Alphonso mangoes blended into a thick, naturally sweet juice.",
    category: "tropical",
    image: "images/pexels-umarali07-28053286.jpg",
    price: 100,
    sizes: ["Regular", "Large (+₹20)"],
    popular: true,
    available: true
  },
  {
    id: "watermelon",
    name: "Watermelon Juice",
    description: "Chilled summer watermelon, light and refreshing.",
    category: "seasonal",
    image: "images/pexels-umarali07-28053225.jpg",
    price: 70,
    sizes: ["Regular", "Large (+₹20)"],
    popular: true,
    available: true
  },
  {
    id: "pineapple",
    name: "Pineapple Juice",
    description: "Tangy-sweet pineapple juiced fresh, no preservatives.",
    category: "tropical",
    image: "images/pexels-soc-nang-d-ng-2150345854-32751740.jpg",
    price: 90,
    sizes: ["Regular", "Large (+₹20)"],
    popular: false,
    available: true
  },
  {
    id: "pomegranate",
    name: "Pomegranate Juice",
    description: "Antioxidant-rich pomegranate, pressed fresh and unsweetened.",
    category: "healthy",
    image: "images/pexels-kindelmedia-8215136.jpg",
    price: 120,
    sizes: ["Regular", "Large (+₹25)"],
    popular: true,
    available: true
  },
  {
    id: "mosambi",
    name: "Mosambi Juice",
    description: "Sweet lime juice, gentle on the stomach and naturally cooling.",
    category: "citrus",
    image: "images/pexels-shameel-mukkath-3421394-17612823.jpg",
    price: 80,
    sizes: ["Regular", "Large (+₹20)"],
    popular: false,
    available: true
  },
  {
    id: "apple",
    name: "Apple Juice",
    description: "Crisp apples juiced fresh with a hint of natural sweetness.",
    category: "healthy",
    image: "images/pexels-shameel-mukkath-3421394-17612826.jpg",
    price: 100,
    sizes: ["Regular", "Large (+₹20)"],
    popular: false,
    available: true
  },
  {
    id: "mixed",
    name: "Mixed Fruit Juice",
    description: "A blend of seasonal fruits for a well-rounded, fresh taste.",
    category: "healthy",
    image: "images/pexels-stephen-leonardi-587681991-30900665.jpg",
    price: 120,
    sizes: ["Regular", "Large (+₹25)"],
    popular: true,
    available: true
  }
];

const COMBOS = [
  {
    id: "combo-summer",
    name: "Summer Combo",
    items: "Watermelon Juice + Pineapple Juice",
    image: "images/pexels-soc-nang-d-ng-2150345854-32751740.jpg",
    originalPrice: 160,
    price: 130
  },
  {
    id: "combo-family",
    name: "Family Combo",
    items: "2x Orange Juice + 2x Mango Juice",
    image: "images/pexels-stephen-leonardi-587681991-30900665.jpg",
    originalPrice: 360,
    price: 299
  },
  {
    id: "combo-healthy",
    name: "Healthy Mix",
    items: "Pomegranate Juice + Apple Juice + Mixed Fruit Juice",
    image: "images/pexels-kindelmedia-8215136.jpg",
    originalPrice: 340,
    price: 279
  },
  {
    id: "combo-kids",
    name: "Kids Combo",
    items: "Mango Juice + Apple Juice (small servings)",
    image: "images/pexels-umarali07-28053286.jpg",
    originalPrice: 180,
    price: 149
  }
];

/* ---------------------------------------------------------
   STATE
   --------------------------------------------------------- */
let cart = loadCart();
let modalState = { product: null, qty: 1, sizeIndex: 0 };
let activeCategory = "all";
let searchTerm = "";

/* ---------------------------------------------------------
   STORAGE
   --------------------------------------------------------- */
function loadCart() {
  try {
    const raw = localStorage.getItem("ksnf_cart");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Cart load failed", e);
    return [];
  }
}
function saveCart() {
  try {
    localStorage.setItem("ksnf_cart", JSON.stringify(cart));
  } catch (e) {
    console.error("Cart save failed", e);
  }
}

/* ---------------------------------------------------------
   HELPERS
   --------------------------------------------------------- */
function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}
function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}
function findCombo(id) {
  return COMBOS.find(c => c.id === id);
}
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------------------------------------------------
   CART OPERATIONS
   --------------------------------------------------------- */
function addToCart(type, id, sizeLabel, qty) {
  const existing = cart.find(c => c.type === type && c.id === id && c.size === sizeLabel);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ type, id, size: sizeLabel, qty });
  }
  saveCart();
  renderCartBadge();
  renderDrawer();
  showToast("Added to cart");
}
function removeFromCart(type, id, size) {
  cart = cart.filter(c => !(c.type === type && c.id === id && c.size === size));
  saveCart();
  renderAllCartViews();
}
function changeQty(type, id, size, delta) {
  const item = cart.find(c => c.type === type && c.id === id && c.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(type, id, size);
    return;
  }
  saveCart();
  renderAllCartViews();
}
function cartLineInfo(line) {
  if (line.type === "product") {
    const p = findProduct(line.id);
    if (!p) return null;
    const sizeExtra = extractSizeExtra(line.size);
    return {
      name: p.name,
      image: p.image,
      unitPrice: p.price + sizeExtra,
      size: line.size
    };
  } else {
    const c = findCombo(line.id);
    if (!c) return null;
    return { name: c.name, image: c.image, unitPrice: c.price, size: "Combo" };
  }
}
function extractSizeExtra(sizeLabel) {
  if (!sizeLabel) return 0;
  const match = sizeLabel.match(/\+₹(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
function cartSubtotal() {
  return cart.reduce((sum, line) => {
    const info = cartLineInfo(line);
    return info ? sum + info.unitPrice * line.qty : sum;
  }, 0);
}
function cartCount() {
  return cart.reduce((sum, line) => sum + line.qty, 0);
}
function deliveryCharge() {
  const sub = cartSubtotal();
  if (sub === 0) return 0;
  return sub >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
}
function cartTotal() {
  return cartSubtotal() + deliveryCharge();
}

/* ---------------------------------------------------------
   RENDER: PRODUCT CARD
   --------------------------------------------------------- */
function productCardHTML(p) {
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-thumb" data-open-modal="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <span class="product-cat-tag">${p.category}</span>
      </div>
      <div class="product-body">
        <h3 data-open-modal="${p.id}">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-meta">
          <span class="product-price">${formatPrice(p.price)}</span>
          <span class="product-size-note">${p.sizes[0]}</span>
        </div>
        <div class="product-actions">
          <div class="qty-control" data-qty-widget="${p.id}">
            <button data-qty-minus="${p.id}" aria-label="Decrease">−</button>
            <span data-qty-value="${p.id}">1</span>
            <button data-qty-plus="${p.id}" aria-label="Increase">+</button>
          </div>
          <button class="add-cart-btn" data-quick-add="${p.id}">Add to Cart</button>
        </div>
      </div>
    </div>`;
}
function comboCardHTML(c) {
  const savePct = Math.round(100 - (c.price / c.originalPrice) * 100);
  return `
    <div class="combo-card">
      <div class="combo-thumb"><img src="${c.image}" alt="${c.name}" loading="lazy" /></div>
      <div class="combo-body">
        <h3>${c.name}</h3>
        <p class="combo-items">${c.items}</p>
        <div class="combo-price-row">
          <span class="combo-orig">${formatPrice(c.originalPrice)}</span>
          <span class="combo-price">${formatPrice(c.price)}</span>
          <span class="combo-save">Save ${savePct}%</span>
        </div>
        <button class="add-cart-btn" data-combo-add="${c.id}">Add to Cart</button>
      </div>
    </div>`;
}

const quickAddQty = {}; // per-card quantity selector state

function renderProductGrid(container, products) {
  container.innerHTML = products.map(productCardHTML).join("");
}
function renderComboGrid(container, combos) {
  container.innerHTML = combos.map(comboCardHTML).join("");
}

function renderHome() {
  renderProductGrid(document.getElementById("popularGrid"), PRODUCTS.filter(p => p.popular));
  renderComboGrid(document.getElementById("comboTeaserGrid"), COMBOS);
}
function renderJuicesPage() {
  let list = PRODUCTS.filter(p => p.available);
  if (activeCategory !== "all") list = list.filter(p => p.category === activeCategory);
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  const grid = document.getElementById("juicesGrid");
  const empty = document.getElementById("juicesEmpty");
  renderProductGrid(grid, list);
  empty.hidden = list.length !== 0;
  grid.hidden = list.length === 0;
}
function renderCombosPage() {
  renderComboGrid(document.getElementById("combosGrid"), COMBOS);
}

/* ---------------------------------------------------------
   RENDER: CART VIEW / DRAWER / CHECKOUT SUMMARY
   --------------------------------------------------------- */
function cartLineHTML(line, variant) {
  const info = cartLineInfo(line);
  if (!info) return "";
  const subtotal = info.unitPrice * line.qty;
  if (variant === "page") {
    return `
      <div class="cart-item">
        <img src="${info.image}" alt="${info.name}" />
        <div>
          <p class="cart-item-name">${info.name}</p>
          <span class="cart-item-size">${info.size}</span>
          <p class="cart-item-price">${formatPrice(subtotal)}</p>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button data-cart-minus="${line.type}|${line.id}|${info.size}">−</button>
            <span>${line.qty}</span>
            <button data-cart-plus="${line.type}|${line.id}|${info.size}">+</button>
          </div>
          <button class="remove-btn" data-cart-remove="${line.type}|${line.id}|${info.size}">Remove</button>
        </div>
      </div>`;
  }
  // drawer variant
  return `
    <div class="drawer-item">
      <img src="${info.image}" alt="${info.name}" />
      <div>
        <p class="drawer-item-name">${info.name}</p>
        <span class="drawer-item-meta">${info.size} · ${formatPrice(info.unitPrice)}</span>
      </div>
      <div class="drawer-item-actions">
        <div class="qty-control">
          <button data-cart-minus="${line.type}|${line.id}|${info.size}">−</button>
          <span>${line.qty}</span>
          <button data-cart-plus="${line.type}|${line.id}|${info.size}">+</button>
        </div>
        <button class="remove-btn" data-cart-remove="${line.type}|${line.id}|${info.size}">Remove</button>
      </div>
    </div>`;
}

function renderCartPage() {
  const list = document.getElementById("cartItemsList");
  const emptyEl = document.getElementById("cartEmpty");
  const layout = document.querySelector(".cart-layout");
  if (cart.length === 0) {
    layout.hidden = true;
    emptyEl.hidden = false;
    return;
  }
  layout.hidden = false;
  emptyEl.hidden = true;
  list.innerHTML = cart.map(l => cartLineHTML(l, "page")).join("");
  document.getElementById("sumSubtotal").textContent = formatPrice(cartSubtotal());
  document.getElementById("sumDelivery").textContent = deliveryCharge() === 0 ? "Free" : formatPrice(deliveryCharge());
  document.getElementById("sumTotal").textContent = formatPrice(cartTotal());
}

function renderDrawer() {
  const list = document.getElementById("drawerItemsList");
  const emptyEl = document.getElementById("drawerEmpty");
  const footer = document.getElementById("drawerFooter");
  if (cart.length === 0) {
    list.innerHTML = "";
    emptyEl.hidden = false;
    footer.hidden = true;
    return;
  }
  emptyEl.hidden = true;
  footer.hidden = false;
  list.innerHTML = cart.map(l => cartLineHTML(l, "drawer")).join("");
  document.getElementById("drawerTotal").textContent = formatPrice(cartTotal());
}

function renderCartBadge() {
  document.getElementById("cartCount").textContent = cartCount();
}

function renderCheckoutSummary() {
  const list = document.getElementById("checkoutItemsList");
  list.innerHTML = cart.map(line => {
    const info = cartLineInfo(line);
    if (!info) return "";
    return `<div class="checkout-mini-item"><span>${info.name} (${info.size}) × ${line.qty}</span><span>${formatPrice(info.unitPrice * line.qty)}</span></div>`;
  }).join("");
  document.getElementById("coSubtotal").textContent = formatPrice(cartSubtotal());
  document.getElementById("coDelivery").textContent = deliveryCharge() === 0 ? "Free" : formatPrice(deliveryCharge());
  document.getElementById("coTotal").textContent = formatPrice(cartTotal());
}

function renderAllCartViews() {
  renderCartBadge();
  renderDrawer();
  if (currentView === "cart") renderCartPage();
  if (currentView === "checkout") renderCheckoutSummary();
}

/* ---------------------------------------------------------
   VIEW / NAVIGATION
   --------------------------------------------------------- */
let currentView = "home";
const VIEWS = ["home", "juices", "combos", "about", "contact", "cart", "checkout", "confirmed"];

function goTo(view) {
  if (!VIEWS.includes(view)) view = "home";
  currentView = view;
  VIEWS.forEach(v => {
    const el = document.getElementById("view-" + v);
    if (el) el.hidden = v !== view;
  });
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.nav === view);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeDrawer();
  closeMobileNav();

  if (view === "juices") renderJuicesPage();
  if (view === "combos") renderCombosPage();
  if (view === "cart") renderCartPage();
  if (view === "checkout") renderCheckoutSummary();
  if (view === "home") renderHome();
}

/* ---------------------------------------------------------
   MODAL (Product Details)
   --------------------------------------------------------- */
function openModal(productId) {
  const p = findProduct(productId);
  if (!p) return;
  modalState = { product: p, qty: 1, sizeIndex: 0 };
  document.getElementById("modalImg").src = p.image;
  document.getElementById("modalImg").alt = p.name;
  document.getElementById("modalCategory").textContent = p.category;
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalDesc").textContent = p.description;
  document.getElementById("modalSizes").innerHTML = p.sizes.map((s, i) =>
    `<button data-size-index="${i}" class="${i === 0 ? "active" : ""}">${s}</button>`
  ).join("");
  updateModalPrice();
  document.getElementById("modalQty").textContent = "1";
  document.getElementById("productModal").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  document.getElementById("productModal").hidden = true;
  document.body.style.overflow = "";
}
function updateModalPrice() {
  const p = modalState.product;
  const sizeLabel = p.sizes[modalState.sizeIndex];
  const extra = extractSizeExtra(sizeLabel);
  const unit = p.price + extra;
  document.getElementById("modalPrice").textContent = formatPrice(unit * modalState.qty);
}

/* ---------------------------------------------------------
   CART DRAWER open/close
   --------------------------------------------------------- */
function openDrawer() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("drawerOverlay").hidden = false;
  renderDrawer();
}
function closeDrawer() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("drawerOverlay").hidden = true;
}

function closeMobileNav() {
  document.getElementById("mainNav").classList.remove("open");
}

/* ---------------------------------------------------------
   WHATSAPP ORDER MESSAGE
   --------------------------------------------------------- */
function buildWhatsAppMessage(customer) {
  let msg = `Hi KS Nature Fruit Juices! I'd like to place an order:%0A%0A`;
  cart.forEach(line => {
    const info = cartLineInfo(line);
    if (!info) return;
    msg += `• ${info.name} (${info.size}) x${line.qty} — ${formatPrice(info.unitPrice * line.qty)}%0A`;
  });
  msg += `%0ASubtotal: ${formatPrice(cartSubtotal())}%0ADelivery: ${deliveryCharge() === 0 ? "Free" : formatPrice(deliveryCharge())}%0ATotal: ${formatPrice(cartTotal())}%0A%0A`;
  if (customer) {
    msg += `Name: ${customer.name}%0APhone: ${customer.phone}%0AAddress: ${customer.address}%0A`;
    if (customer.notes) msg += `Notes: ${customer.notes}%0A`;
  }
  return `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${msg}`;
}

/* ---------------------------------------------------------
   EVENT WIRING
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderCartBadge();
  renderDrawer();

  // NAV: any element with data-nav
  document.body.addEventListener("click", (e) => {
    const navEl = e.target.closest("[data-nav]");
    if (navEl) {
      e.preventDefault();
      if (navEl.dataset.nav === "cart" && navEl.id === "cartToggle") {
        openDrawer();
        return;
      }
      goTo(navEl.dataset.nav);
    }
  });

  // Hamburger
  document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("mainNav").classList.toggle("open");
  });

  // Search toggle
  const searchBar = document.getElementById("searchBar");
  document.getElementById("searchToggle").addEventListener("click", () => {
    searchBar.classList.toggle("open");
    if (searchBar.classList.contains("open")) document.getElementById("searchInput").focus();
  });
  document.getElementById("searchClose").addEventListener("click", () => {
    searchBar.classList.remove("open");
  });
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    goTo("juices");
  });

  // Category filter chips
  document.getElementById("categoryFilter").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    activeCategory = chip.dataset.cat;
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
    renderJuicesPage();
  });

  // Delegate: product grid interactions (open modal, quick qty, quick add)
  document.body.addEventListener("click", (e) => {
    const openEl = e.target.closest("[data-open-modal]");
    if (openEl) { openModal(openEl.dataset.openModal); return; }

    const minusEl = e.target.closest("[data-qty-minus]");
    if (minusEl) {
      const id = minusEl.dataset.qtyMinus;
      quickAddQty[id] = Math.max(1, (quickAddQty[id] || 1) - 1);
      document.querySelectorAll(`[data-qty-value="${id}"]`).forEach(el => el.textContent = quickAddQty[id]);
      return;
    }
    const plusEl = e.target.closest("[data-qty-plus]");
    if (plusEl) {
      const id = plusEl.dataset.qtyPlus;
      quickAddQty[id] = (quickAddQty[id] || 1) + 1;
      document.querySelectorAll(`[data-qty-value="${id}"]`).forEach(el => el.textContent = quickAddQty[id]);
      return;
    }
    const quickAddEl = e.target.closest("[data-quick-add]");
    if (quickAddEl) {
      const id = quickAddEl.dataset.quickAdd;
      const p = findProduct(id);
      const qty = quickAddQty[id] || 1;
      addToCart("product", id, p.sizes[0], qty);
      quickAddQty[id] = 1;
      document.querySelectorAll(`[data-qty-value="${id}"]`).forEach(el => el.textContent = "1");
      return;
    }
    const comboAddEl = e.target.closest("[data-combo-add]");
    if (comboAddEl) {
      addToCart("combo", comboAddEl.dataset.comboAdd, "Combo", 1);
      return;
    }

    // Cart line qty / remove (works in both page + drawer)
    const cartMinus = e.target.closest("[data-cart-minus]");
    if (cartMinus) {
      const [type, id, size] = cartMinus.dataset.cartMinus.split("|");
      changeQty(type, id, size, -1);
      return;
    }
    const cartPlus = e.target.closest("[data-cart-plus]");
    if (cartPlus) {
      const [type, id, size] = cartPlus.dataset.cartPlus.split("|");
      changeQty(type, id, size, 1);
      return;
    }
    const cartRemove = e.target.closest("[data-cart-remove]");
    if (cartRemove) {
      const [type, id, size] = cartRemove.dataset.cartRemove.split("|");
      removeFromCart(type, id, size);
      return;
    }
  });

  // Modal controls
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("productModal").addEventListener("click", (e) => {
    if (e.target.id === "productModal") closeModal();
  });
  document.getElementById("modalSizes").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-size-index]");
    if (!btn) return;
    modalState.sizeIndex = parseInt(btn.dataset.sizeIndex, 10);
    document.querySelectorAll("#modalSizes button").forEach(b => b.classList.toggle("active", b === btn));
    updateModalPrice();
  });
  document.getElementById("modalQtyMinus").addEventListener("click", () => {
    modalState.qty = Math.max(1, modalState.qty - 1);
    document.getElementById("modalQty").textContent = modalState.qty;
    updateModalPrice();
  });
  document.getElementById("modalQtyPlus").addEventListener("click", () => {
    modalState.qty += 1;
    document.getElementById("modalQty").textContent = modalState.qty;
    updateModalPrice();
  });
  document.getElementById("modalAddToCart").addEventListener("click", () => {
    const p = modalState.product;
    const sizeLabel = p.sizes[modalState.sizeIndex];
    addToCart("product", p.id, sizeLabel, modalState.qty);
    closeModal();
  });

  // Drawer close
  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  document.getElementById("drawerOverlay").addEventListener("click", closeDrawer);
  document.getElementById("drawerCheckout").addEventListener("click", () => {
    if (cart.length === 0) { showToast("Your cart is empty"); return; }
    goTo("checkout");
  });

  // Proceed to order from cart page
  document.getElementById("proceedToOrder").addEventListener("click", () => {
    if (cart.length === 0) { showToast("Your cart is empty"); return; }
    goTo("checkout");
  });

  // Checkout form validation + WhatsApp submit
  document.getElementById("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.custName.value.trim();
    const phone = form.custPhone.value.trim();
    const address = form.custAddress.value.trim();
    const notes = form.custNotes.value.trim();
    let valid = true;

    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");

    if (name.length < 2) {
      document.querySelector('[data-error="custName"]').textContent = "Please enter your name.";
      valid = false;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      document.querySelector('[data-error="custPhone"]').textContent = "Enter a valid 10-digit mobile number.";
      valid = false;
    }
    if (address.length < 8) {
      document.querySelector('[data-error="custAddress"]').textContent = "Please enter a complete delivery address.";
      valid = false;
    }
    if (!valid) return;
    if (cart.length === 0) {
      showToast("Your cart is empty");
      goTo("juices");
      return;
    }

    const waUrl = buildWhatsAppMessage({ name, phone, address, notes });
    window.open(waUrl, "_blank");

    cart = [];
    saveCart();
    renderAllCartViews();
    form.reset();
    goTo("confirmed");
  });

  // Contact form (simple client-side only submission)
  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("contactSuccess").hidden = false;
    e.target.reset();
    setTimeout(() => document.getElementById("contactSuccess").hidden = true, 4000);
  });

  // Contact page WhatsApp button
  document.getElementById("contactWhatsapp").href =
    `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=Hi%20KS%20Nature%20Fruit%20Juices%2C%20I%20have%20a%20question.`;

  // Initial route
  goTo("home");
});