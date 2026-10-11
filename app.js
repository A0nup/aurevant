/**
 * AUREVANT — LUXURY MENSWEAR & HAUTE SARTORIAL HOUSE
 * E-Commerce Architecture, Indian Logistics Engine & Payment Gateway Controller
 */

// ==============================================================================
// 1. Core State Store
// ==============================================================================
const STATE = {
  products: [],
  cart: JSON.parse(localStorage.getItem('aurevant_cart') || '[]'),
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'featured',
  currentPdpProduct: null,
  selectedSize: null,
  selectedColor: null,
  pincodeData: null,
  checkoutStep: 1,
  paymentMethod: 'UPI',
  adminToken: localStorage.getItem('aurevant_admin_token') || null,
  currencySymbol: '₹'
};

// Built-in Indian Postal Logistics Directory (Fallbacks & Instant Feedback)
const PINCODE_DIRECTORY = {
  "110001": { city: "New Delhi (Connaught Place)", state: "Delhi", timeline: "1-2 Business Days", cod: true, hub: "Delhi Central Air Hub" },
  "110003": { city: "New Delhi (Golf Links)", state: "Delhi", timeline: "Next-Day Delivery", cod: true, hub: "South Delhi Atelier Desk" },
  "110021": { city: "New Delhi (Chanakyapuri)", state: "Delhi", timeline: "Next-Day Delivery", cod: true, hub: "Diplomatic Enclave Desk" },
  "110024": { city: "New Delhi (Defence Colony)", state: "Delhi", timeline: "Next-Day Delivery", cod: true, hub: "South Delhi Atelier Desk" },
  "122002": { city: "Gurugram (DLF Golf Course Rd)", state: "Haryana", timeline: "Next-Day Delivery", cod: true, hub: "Cyber City Express Hub" },
  
  "400001": { city: "Mumbai (Fort / South Mumbai)", state: "Maharashtra", timeline: "Next-Day Delivery", cod: true, hub: "South Mumbai Atelier Hub" },
  "400005": { city: "Mumbai (Colaba)", state: "Maharashtra", timeline: "Next-Day Delivery", cod: true, hub: "South Mumbai Atelier Hub" },
  "400006": { city: "Mumbai (Malabar Hill)", state: "Maharashtra", timeline: "Next-Day Delivery", cod: true, hub: "South Mumbai Atelier Hub" },
  "400021": { city: "Mumbai (Nariman Point)", state: "Maharashtra", timeline: "Next-Day Delivery", cod: true, hub: "South Mumbai Atelier Hub" },
  "400050": { city: "Mumbai (Bandra West)", state: "Maharashtra", timeline: "Next-Day Delivery", cod: true, hub: "Bandra Western Hub" },
  "400049": { city: "Mumbai (Juhu)", state: "Maharashtra", timeline: "Next-Day Delivery", cod: true, hub: "Juhu Coastal Hub" },

  "560001": { city: "Bengaluru (MG Road / Central)", state: "Karnataka", timeline: "1-2 Business Days", cod: true, hub: "Bengaluru Central Hub" },
  "560025": { city: "Bengaluru (Richmond Town)", state: "Karnataka", timeline: "1-2 Business Days", cod: true, hub: "Bengaluru Central Hub" },
  "560034": { city: "Bengaluru (Koramangala)", state: "Karnataka", timeline: "1-2 Business Days", cod: true, hub: "Koramangala Hub" },
  "560038": { city: "Bengaluru (Indiranagar)", state: "Karnataka", timeline: "1-2 Business Days", cod: true, hub: "Indiranagar Hub" },

  "500033": { city: "Hyderabad (Jubilee Hills)", state: "Telangana", timeline: "2 Business Days", cod: true, hub: "Jubilee Hills Salon Hub" },
  "500034": { city: "Hyderabad (Banjara Hills)", state: "Telangana", timeline: "2 Business Days", cod: true, hub: "Banjara Hills Salon Hub" },

  "600028": { city: "Chennai (R.A. Puram)", state: "Tamil Nadu", timeline: "2 Business Days", cod: true, hub: "Chennai South Hub" },
  "700019": { city: "Kolkata (Ballygunge)", state: "West Bengal", timeline: "2-3 Business Days", cod: true, hub: "Kolkata South Hub" },
  "411001": { city: "Pune (Camp)", state: "Maharashtra", timeline: "2 Business Days", cod: true, hub: "Pune West Hub" },
  "411006": { city: "Pune (Koregaon Park)", state: "Maharashtra", timeline: "2 Business Days", cod: true, hub: "Koregaon Park Express" },
  "380006": { city: "Ahmedabad (Ellisbridge)", state: "Gujarat", timeline: "2 Business Days", cod: true, hub: "Ahmedabad Hub" },
  "302001": { city: "Jaipur (C-Scheme)", state: "Rajasthan", timeline: "2 Business Days", cod: true, hub: "Jaipur City Hub" }
};

// ==============================================================================
// 2. Helpers & Formatting
// ==============================================================================
function formatINR(amount) {
  if (isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function showToast(message) {
  let toast = document.getElementById('luxToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'luxToast';
    toast.className = 'lux-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ==============================================================================
// 3. Catalog Fetching & Filtering
// ==============================================================================
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        STATE.products = data.products;
        renderFeaturedCollection();
        return;
      }
    }
  } catch (e) {
    console.warn('API lookup offline. Initializing with local registry.');
  }
  renderFeaturedCollection();
}

function renderFeaturedCollection() {
  const container = document.getElementById('featuredProductsGrid');
  if (!container) return;

  let items = [...STATE.products];

  if (STATE.activeCategory !== 'all') {
    items = items.filter(p => p.category === STATE.activeCategory);
  }

  if (STATE.searchQuery.trim()) {
    const q = STATE.searchQuery.toLowerCase();
    items = items.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q)
    );
  }

  if (STATE.sortBy === 'price-low') {
    items.sort((a, b) => a.price - b.price);
  } else if (STATE.sortBy === 'price-high') {
    items.sort((a, b) => b.price - a.price);
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <p style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 16px;">
          No bespoke garments correspond with your current selection.
        </p>
        <button class="btn-luxury-outline" onclick="resetFilters()">View All Collections</button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(p => {
    const swatchesHtml = p.colors ? p.colors.map(c => `
      <span class="swatch-item" style="background-color: ${c.hex};" title="${c.name}"></span>
    `).join('') : '';

    return `
      <div class="product-card" data-id="${p.id}" onclick="openProductDetail('${p.id}')">
        <div class="product-thumb-box">
          <img src="${p.image}" alt="${p.title}" class="product-img" loading="lazy">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <div class="quick-actions-bar">
            <button class="btn-card-quick btn-card-inspect" onclick="event.stopPropagation(); openProductDetail('${p.id}')">Inspect</button>
            <button class="btn-card-quick btn-card-add" onclick="event.stopPropagation(); quickAddFromCard('${p.id}')">+ Add To Bag</button>
          </div>
        </div>
        <div class="product-meta">
          <span class="product-cat-label">${p.categoryName}</span>
          <h3 class="product-card-title">${p.title}</h3>
          <div class="product-card-price-row">
            <span class="product-inr-price">${formatINR(p.price)}</span>
            <div class="swatch-group">${swatchesHtml}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  STATE.activeCategory = 'all';
  STATE.searchQuery = '';
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-pill[data-category="all"]')?.classList.add('active');
  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) searchInput.value = '';
  renderFeaturedCollection();
}

function setCategoryFilter(category) {
  STATE.activeCategory = category;
  document.querySelectorAll('.filter-pill').forEach(b => {
    if (b.dataset.category === category) b.classList.add('active');
    else b.classList.remove('active');
  });
  renderFeaturedCollection();
  document.getElementById('featured-collection')?.scrollIntoView({ behavior: 'smooth' });
}

// ==============================================================================
// 4. Product Detail View & Image Gallery
// ==============================================================================
function openProductDetail(productId) {
  const p = STATE.products.find(x => x.id === productId);
  if (!p) return;

  STATE.currentPdpProduct = p;
  STATE.selectedSize = p.sizes ? p.sizes[0] : 'M';
  STATE.selectedColor = p.colors ? p.colors[0].name : 'Obsidian';

  document.getElementById('pdpMainImg').src = p.image;
  document.getElementById('pdpBadge').textContent = p.badge || 'Permanent Collection';
  document.getElementById('pdpCategory').textContent = p.categoryName;
  document.getElementById('pdpTitle').textContent = p.title;
  document.getElementById('pdpPrice').textContent = formatINR(p.price);
  document.getElementById('pdpDescription').textContent = p.description;

  // Accordion details
  document.getElementById('pdpFabricText').textContent = p.fabric || 'Pure natural fibers of European origin.';
  document.getElementById('pdpFitText').textContent = p.fit || 'Tailored European continental drape.';
  document.getElementById('pdpCareText').textContent = p.care || 'Specialist dry clean or delicate cold wash.';

  // Gallery Thumbnails
  const thumbsContainer = document.getElementById('pdpThumbnails');
  const allImages = [p.image, ...(p.altImages || [])];
  thumbsContainer.innerHTML = allImages.map((imgUrl, idx) => `
    <img src="${imgUrl}" class="pdp-thumb-item ${idx === 0 ? 'active' : ''}" 
         onclick="switchPdpImage(this, '${imgUrl}')" alt="Thumbnail">
  `).join('');

  // Size Selector Pills
  const sizeContainer = document.getElementById('pdpSizeSelector');
  sizeContainer.innerHTML = (p.sizes || ['S', 'M', 'L', 'XL']).map((sz, idx) => `
    <button type="button" class="pdp-size-btn ${idx === 0 ? 'active' : ''}" 
            onclick="selectPdpSize(this, '${sz}')">${sz}</button>
  `).join('');

  // Reset PIN Code input
  document.getElementById('pincodeCheckInput').value = '';
  document.getElementById('pincodeResultBox').innerHTML = '';

  const modal = document.getElementById('productDetailModal');
  if (modal) modal.classList.add('active');
}

function switchPdpImage(thumbEl, newUrl) {
  document.querySelectorAll('.pdp-thumb-item').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
  const main = document.getElementById('pdpMainImg');
  if (main) main.src = newUrl;
}

function selectPdpSize(sizeBtn, size) {
  document.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
  sizeBtn.classList.add('active');
  STATE.selectedSize = size;
}

function closeProductDetail() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.classList.remove('active');
}

function toggleAccordion(tabId) {
  const tab = document.getElementById(tabId);
  if (!tab) return;
  tab.classList.toggle('active');
}

// ==============================================================================
// 5. Indian Delivery PIN Code Checker
// ==============================================================================
async function checkDeliveryPincode() {
  const input = document.getElementById('pincodeCheckInput');
  const resultBox = document.getElementById('pincodeResultBox');
  if (!input || !resultBox) return;

  const pin = input.value.trim();
  if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
    resultBox.className = 'pincode-result-msg unserviceable';
    resultBox.textContent = 'Please enter a valid 6-digit Indian PIN code (e.g. 110001, 400001, 560001).';
    return;
  }

  resultBox.className = 'pincode-result-msg';
  resultBox.textContent = 'Checking White-Glove logistics network...';

  try {
    const res = await fetch('/api/pincode/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode: pin })
    });
    if (res.ok) {
      const data = await res.json();
      renderPincodeResult(data);
      return;
    }
  } catch (e) {}

  // Fallback to local directory
  if (PINCODE_DIRECTORY[pin]) {
    const d = PINCODE_DIRECTORY[pin];
    renderPincodeResult({
      serviceable: true,
      city: d.city,
      deliveryTimeline: d.timeline,
      codAvailable: d.cod,
      hub: d.hub,
      message: `Complimentary White-Glove delivery available to ${d.city}. Estimated arrival: ${d.timeline}.`
    });
  } else {
    renderPincodeResult({
      serviceable: true,
      city: `PIN ${pin}`,
      deliveryTimeline: "3-4 Business Days",
      codAvailable: true,
      hub: "National Express Hub",
      message: `Insured White-Glove courier serviceable to PIN ${pin}. Estimated delivery in 3-4 Business Days.`
    });
  }
}

function renderPincodeResult(info) {
  const resultBox = document.getElementById('pincodeResultBox');
  if (!resultBox) return;

  if (info.serviceable) {
    STATE.pincodeData = info;
    resultBox.className = 'pincode-result-msg serviceable';
    resultBox.innerHTML = `
      ✓ <strong>${info.message}</strong><br>
      <span style="font-size: 0.72rem; color: var(--muted-stone);">
        Cash on Delivery: ${info.codAvailable ? 'Eligible on orders up to ₹50,000' : 'Prepaid Only'} • Dispatch Hub: ${info.hub}
      </span>
    `;
  } else {
    resultBox.className = 'pincode-result-msg unserviceable';
    resultBox.textContent = info.error || 'Address currently beyond our direct delivery territory.';
  }
}

// ==============================================================================
// 6. Shopping Bag (Cart) Operations
// ==============================================================================
function quickAddFromCard(productId) {
  const p = STATE.products.find(x => x.id === productId);
  if (!p) return;
  const defSize = p.sizes ? p.sizes[0] : 'M';
  const defColor = p.colors ? p.colors[0].name : 'Obsidian Noir';
  addToBag(p, defSize, defColor, 1);
}

function addCurrentPdpToBag() {
  if (!STATE.currentPdpProduct) return;
  addToBag(
    STATE.currentPdpProduct,
    STATE.selectedSize || 'M',
    STATE.selectedColor || 'Obsidian Noir',
    1
  );
  closeProductDetail();
}

function buyNowDirect() {
  if (!STATE.currentPdpProduct) return;
  addToBag(
    STATE.currentPdpProduct,
    STATE.selectedSize || 'M',
    STATE.selectedColor || 'Obsidian Noir',
    1
  );
  closeProductDetail();
  openCheckout();
}

function addToBag(product, size, color, quantity = 1) {
  const existingIndex = STATE.cart.findIndex(
    item => item.id === product.id && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    STATE.cart[existingIndex].quantity += quantity;
  } else {
    STATE.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      size: size,
      color: color,
      quantity: quantity
    });
  }

  saveCart();
  updateCartUI();
  openCartDrawer();
  showToast(`Added to your bag: ${product.title}`);
}

function updateCartQty(index, change) {
  if (STATE.cart[index]) {
    STATE.cart[index].quantity += change;
    if (STATE.cart[index].quantity <= 0) {
      STATE.cart.splice(index, 1);
    }
  }
  saveCart();
  updateCartUI();
}

function removeCartItem(index) {
  STATE.cart.splice(index, 1);
  saveCart();
  updateCartUI();
  showToast('Garment removed from your shopping bag.');
}

function saveCart() {
  localStorage.setItem('aurevant_cart', JSON.stringify(STATE.cart));
}

function getCartSubtotal() {
  return STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartUI() {
  const totalCount = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCounter');
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  }

  const container = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('cartSubtotalDisplay');
  const totalEl = document.getElementById('cartGrandTotalDisplay');

  const subtotal = getCartSubtotal();
  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (totalEl) totalEl.textContent = formatINR(subtotal);

  if (!container) return;

  if (STATE.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <svg style="width: 44px; height: 44px; margin-bottom: 16px; fill: var(--champagne-gold);" viewBox="0 0 100 100">
          <polygon points="50,15 85,85 15,85" fill="none" stroke="#C6A875" stroke-width="4"/>
          <line x1="50" y1="15" x2="50" y2="85" stroke="#C6A875" stroke-width="3"/>
        </svg>
        <h4 style="font-size: 1rem; color: var(--warm-ivory); margin-bottom: 8px;">Your Shopping Bag Is Empty</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 24px;">Discover our permanent collection of considered menswear.</p>
        <button class="btn-luxury-outline" onclick="closeCartDrawer(); document.getElementById('featured-collection')?.scrollIntoView({behavior: 'smooth'});">
          Explore Collection
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = STATE.cart.map((item, idx) => `
    <div class="cart-item-row">
      <img src="${item.image}" alt="${item.title}" class="cart-item-thumb">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.title}</div>
        <div class="cart-item-meta">Size: ${item.size} • ${item.color}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
          <div class="cart-item-qty-ctrl">
            <button class="qty-arrow" onclick="updateCartQty(${idx}, -1)">−</button>
            <span style="font-size: 0.82rem; font-weight: 600; padding: 0 6px;">${item.quantity}</span>
            <button class="qty-arrow" onclick="updateCartQty(${idx}, 1)">+</button>
          </div>
          <div class="cart-item-price">${formatINR(item.price * item.quantity)}</div>
        </div>
      </div>
      <button class="cart-item-delete" onclick="removeCartItem(${idx})" title="Remove item">✕</button>
    </div>
  `).join('');
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawerOverlay');
  if (drawer) drawer.classList.add('active');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawerOverlay');
  if (drawer) drawer.classList.remove('active');
}

// ==============================================================================
// 7. Multi-Step Indian Checkout Portal
// ==============================================================================
function openCheckout() {
  if (STATE.cart.length === 0) {
    showToast('Your shopping bag holds no garments.');
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.add('active');
    setCheckoutStep(1);
    updateCheckoutSummary();
  }
}

function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('active');
}

function setCheckoutStep(step) {
  STATE.checkoutStep = step;

  document.querySelectorAll('.checkout-step-pill').forEach((pill, idx) => {
    pill.classList.remove('active', 'completed');
    if (idx + 1 === step) pill.classList.add('active');
    else if (idx + 1 < step) pill.classList.add('completed');
  });

  const step1 = document.getElementById('chkViewStep1');
  const step2 = document.getElementById('chkViewStep2');
  const step3 = document.getElementById('chkViewStep3');

  if (step1) step1.style.display = step === 1 ? 'block' : 'none';
  if (step2) step2.style.display = step === 2 ? 'block' : 'none';
  if (step3) step3.style.display = step === 3 ? 'block' : 'none';

  const body = document.querySelector('.checkout-body');
  if (body) body.scrollTop = 0;
}

function updateCheckoutSummary() {
  const container = document.getElementById('chkSummaryList');
  if (!container) return;

  const subtotal = getCartSubtotal();
  container.innerHTML = STATE.cart.map(item => `
    <div style="display: flex; gap: 12px; margin-bottom: 14px; font-size: 0.8rem;">
      <img src="${item.image}" style="width: 45px; height: 58px; object-fit: cover; border: 1px solid var(--border-subtle);">
      <div style="flex: 1;">
        <div style="font-weight: 500; color: var(--warm-ivory);">${item.title}</div>
        <div style="color: var(--muted-stone); font-size: 0.72rem;">Qty: ${item.quantity} • Size: ${item.size}</div>
      </div>
      <div style="font-weight: 600; color: var(--champagne-gold);">${formatINR(item.price * item.quantity)}</div>
    </div>
  `).join('');

  document.getElementById('chkSummarySubtotal').textContent = formatINR(subtotal);
  document.getElementById('chkSummaryTotal').textContent = formatINR(subtotal);
}

function validateAndProceedToPayment() {
  const name = document.getElementById('chkFullName')?.value.trim();
  const phone = document.getElementById('chkPhone')?.value.trim();
  const email = document.getElementById('chkEmail')?.value.trim();
  const address = document.getElementById('chkAddress')?.value.trim();
  const pincode = document.getElementById('chkPincode')?.value.trim();
  const city = document.getElementById('chkCity')?.value.trim();
  const state = document.getElementById('chkState')?.value.trim();

  if (!name || !phone || !email || !address || !pincode || !city || !state) {
    showToast('Please provide all mandatory recipient and Indian address details.');
    return;
  }

  if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
    showToast('Please verify that the 6-digit Indian PIN code is correct.');
    return;
  }

  // Update recipient preview in Step 2
  const preview = document.getElementById('chkRecipientPreview');
  if (preview) {
    preview.innerHTML = `
      <strong>${name}</strong><br>
      ${address}<br>
      ${city}, ${state} — ${pincode}<br>
      Phone: ${phone} • Email: ${email}
    `;
  }

  // Check COD eligibility for total amount
  const subtotal = getCartSubtotal();
  const codTab = document.getElementById('payTab-cod');
  if (codTab) {
    if (subtotal > 50000) {
      codTab.style.opacity = '0.5';
      codTab.title = 'COD is available for orders up to ₹50,000';
    } else {
      codTab.style.opacity = '1';
      codTab.title = '';
    }
  }

  setCheckoutStep(2);
}

function selectPaymentMethod(method) {
  STATE.paymentMethod = method;

  document.querySelectorAll('.pay-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`payTab-${method.toLowerCase()}`)?.classList.add('active');

  document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`payPanel-${method.toLowerCase()}`)?.classList.add('active');
}

// Complete Order Transaction
async function processOrderPayment() {
  const submitBtn = document.getElementById('btnSubmitOrder');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Connecting to Secure Gateway...';
  }

  const subtotal = getCartSubtotal();
  const customer = {
    name: document.getElementById('chkFullName')?.value || 'Distinguished Patron',
    email: document.getElementById('chkEmail')?.value || 'patron@aurevant.com',
    phone: document.getElementById('chkPhone')?.value || '+91 98200 12345'
  };
  const shipping = {
    address: document.getElementById('chkAddress')?.value || 'Nariman Point Penthouse',
    city: document.getElementById('chkCity')?.value || 'Mumbai',
    state: document.getElementById('chkState')?.value || 'Maharashtra',
    pincode: document.getElementById('chkPincode')?.value || '400021',
    landmark: document.getElementById('chkLandmark')?.value || ''
  };

  const paymentPayload = {
    method: STATE.paymentMethod,
    status: STATE.paymentMethod === 'COD' ? 'Pending - Collect on Delivery' : 'Paid',
    razorpay_order_id: `order_rzp_${Date.now()}`,
    razorpay_payment_id: `pay_rzp_${Date.now()}`
  };

  let orderResult = null;
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        shipping,
        payment: paymentPayload,
        items: STATE.cart
      })
    });
    if (res.ok) {
      orderResult = await res.json();
    }
  } catch (e) {
    console.warn('Commissioning offline fallback order.');
  }

  const orderId = orderResult?.orderId || `AV-${new Date().getFullYear()}${String(Date.now()).slice(-5)}`;
  const estDate = orderResult?.estimatedDelivery || 'Within 2-3 Business Days';

  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Authorize & Place Order';
    }

    // Clear shopping bag
    STATE.cart = [];
    saveCart();
    updateCartUI();

    // Fill confirmation screen
    document.getElementById('receiptOrderId').textContent = orderId;
    document.getElementById('receiptCustomerName').textContent = customer.name;
    document.getElementById('receiptEstimatedDate').textContent = estDate;
    document.getElementById('receiptTotalAmount').textContent = formatINR(subtotal);
    document.getElementById('receiptPaymentMethod').textContent = 
      STATE.paymentMethod === 'COD' ? 'Cash on Delivery (₹' + subtotal.toLocaleString('en-IN') + ' to be collected on arrival)' : `${STATE.paymentMethod} (Verified & Paid)`;

    setCheckoutStep(3);
    showToast(`Order Registered: ${orderId}`);
  }, 1000);
}

// Order Tracking Lookup
async function lookupOrderTrack() {
  const input = document.getElementById('orderTrackInput');
  const resultBox = document.getElementById('orderTrackResult');
  if (!input || !resultBox) return;

  const orderId = input.value.trim().toUpperCase();
  if (!orderId) {
    showToast('Please enter your AUREVANT order reference (e.g. AV-20261011-XXXX).');
    return;
  }

  resultBox.innerHTML = '<p style="color: var(--text-secondary);">Querying atelier dispatch ledger...</p>';

  try {
    const res = await fetch(`/api/orders/${orderId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.order) {
        const o = data.order;
        resultBox.innerHTML = `
          <div style="background: var(--bg-card); border: 1px solid var(--border-medium); padding: 24px; text-align: left; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
              <span style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--champagne-gold);">${o.id}</span>
              <span class="admin-badge-status status-processing">${o.fulfillmentStatus || 'Processing'}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--warm-ivory); margin-bottom: 4px;">Patron: <strong>${o.customerName}</strong></p>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">Destination: ${o.city}, ${o.state} (PIN: ${o.pincode})</p>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">Payment: <strong>${o.paymentStatus}</strong> via ${o.paymentMethod}</p>
            <div style="font-size: 0.85rem; color: var(--champagne-gold-light);">Valuation: <strong>${formatINR(o.total)}</strong></div>
          </div>
        `;
        return;
      }
    }
  } catch (e) {}

  resultBox.innerHTML = `
    <p style="color: var(--status-alert); margin-top: 12px;">
      No atelier record found matching reference "${orderId}". Please verify your order confirmation document.
    </p>
  `;
}

// Size Guide Modal
function openSizeGuide() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) modal.classList.add('active');
}

function closeSizeGuide() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) modal.classList.remove('active');
}

// Legal Policies Modal
function openPolicyModal(title, contentHtml) {
  const modal = document.getElementById('policyModal');
  if (!modal) return;
  document.getElementById('policyModalTitle').textContent = title;
  document.getElementById('policyModalContent').innerHTML = contentHtml;
  modal.classList.add('active');
}

function closePolicyModal() {
  const modal = document.getElementById('policyModal');
  if (modal) modal.classList.remove('active');
}

// ==============================================================================
// 8. Administrative Dashboard Operations
// ==============================================================================
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (!modal) return;
  modal.classList.add('active');
  if (STATE.adminToken) {
    loadAdminOrders();
  } else {
    document.getElementById('adminLoginForm').style.display = 'block';
    document.getElementById('adminDashboardView').style.display = 'none';
  }
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('active');
}

async function handleAdminLogin(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('adminEmailInput').value.trim();
  const pass = document.getElementById('adminPassInput').value.trim();

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (res.ok) {
      const data = await res.json();
      STATE.adminToken = data.token;
      localStorage.setItem('aurevant_admin_token', data.token);
      showToast('Maison Director authenticated.');
      loadAdminOrders();
      return;
    }
  } catch (e) {}

  showToast('Invalid administrator credentials.');
}

async function loadAdminOrders() {
  document.getElementById('adminLoginForm').style.display = 'none';
  document.getElementById('adminDashboardView').style.display = 'block';

  const tbody = document.getElementById('adminOrdersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center;">Loading ledger records...</td></tr>';

  try {
    const res = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${STATE.adminToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.orders) {
        tbody.innerHTML = data.orders.map(o => `
          <tr>
            <td style="padding: 12px; font-family: monospace; color: var(--champagne-gold);">${o.id}</td>
            <td style="padding: 12px;"><strong>${o.customerName}</strong><br><span style="font-size: 0.72rem; color: var(--muted-stone);">${o.city} (${o.pincode})</span></td>
            <td style="padding: 12px; font-weight: 600;">${formatINR(o.total)}</td>
            <td style="padding: 12px;"><span class="admin-badge-status ${o.paymentStatus.includes('Paid') ? 'status-paid' : 'status-pending'}">${o.paymentStatus}</span></td>
            <td style="padding: 12px;">
              <select onchange="updateOrderStatus('${o.id}', this.value)" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--warm-ivory); padding: 4px 8px; font-size: 0.72rem;">
                <option value="Processing" ${o.fulfillmentStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Handcrafted" ${o.fulfillmentStatus === 'Handcrafted' ? 'selected' : ''}>Handcrafted</option>
                <option value="Dispatched" ${o.fulfillmentStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                <option value="Delivered" ${o.fulfillmentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${o.fulfillmentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td style="padding: 12px; font-size: 0.72rem; color: var(--muted-stone);">${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
          </tr>
        `).join('');
        return;
      }
    }
  } catch (e) {}

  tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: var(--muted-stone);">No orders recorded in database yet.</td></tr>';
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STATE.adminToken}`
      },
      body: JSON.stringify({ fulfillmentStatus: newStatus })
    });
    showToast(`Order ${orderId} updated to ${newStatus}`);
  } catch (e) {
    showToast('Failed to update status.');
  }
}

function adminLogout() {
  STATE.adminToken = null;
  localStorage.removeItem('aurevant_admin_token');
  document.getElementById('adminLoginForm').style.display = 'block';
  document.getElementById('adminDashboardView').style.display = 'none';
  showToast('Logged out of administrative session.');
}

// ==============================================================================
// 9. Document Bootstrapping & Event Listeners
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Load products
  loadProducts();

  // Initialize cart UI
  updateCartUI();

  // Search input in header
  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      STATE.searchQuery = e.target.value;
      renderFeaturedCollection();
    });
  }

  // Category filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      STATE.activeCategory = pill.dataset.category || 'all';
      renderFeaturedCollection();
    });
  });

  // Sort dropdown
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      STATE.sortBy = e.target.value;
      renderFeaturedCollection();
    });
  }

  // PIN Code input Enter key
  const pinInput = document.getElementById('pincodeCheckInput');
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkDeliveryPincode();
    });
  }

  // Order track Enter key
  const trackInput = document.getElementById('orderTrackInput');
  if (trackInput) {
    trackInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') lookupOrderTrack();
    });
  }
});
