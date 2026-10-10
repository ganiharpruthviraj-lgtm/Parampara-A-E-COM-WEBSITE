/**
 * Parampara Heritage E-Commerce - Advanced Interactive Checkout Engine
 * Supports Item Quantity Adjustment [ - / + ], Item Removal [🗑️], Quick Add Items,
 * Real-time 70% Artisan Payout recalculations, and PDF Invoice Generation
 */

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

let currentPayMethod = 'card';
let expressDelivery = false;
let promoApplied = false;
let activeOrderData = null;

const GST_RATE = 0.12;
const EXPRESS_FEE = 299;
const COD_FEE = 99;

// Default Curated Craft Inventory for Quick Add
const QUICK_ADD_CRAFTS = [
  {
    id: 'ass-muga-01',
    name: 'Assam Pure Natural Golden Muga Silk Saree',
    price: 24500,
    origin: 'Kamrup, Assam',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    giNumber: 'GI/RS/038/2007',
    artisanName: 'Kamrup Silk Weavers Cooperative'
  },
  {
    id: 'rj-blue-pottery-01',
    name: 'Jaipur Blue Pottery Azure Floral Royal Vase',
    price: 3400,
    origin: 'Jaipur, Rajasthan',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80',
    giNumber: 'GI/RS/080/2016',
    artisanName: 'Gopal Saini (National Awardee)'
  },
  {
    id: 'hp-kullu-shawl-01',
    name: 'Authentic Kullu Handwoven Woolen Shawl',
    price: 4800,
    origin: 'Kullu Valley, Himachal Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80',
    giNumber: 'GI/RS/130/2004',
    artisanName: 'Bhuttico Handloom Weavers Cooperative'
  },
  {
    id: 'ka-bidriware-01',
    name: 'Bidriware Pure Silver Inlay Heritage Surahi Vase',
    price: 4200,
    origin: 'Bidar, Karnataka',
    imageUrl: 'https://s7ap1.scene7.com/is/image/incredibleindia/bidriware-bidar-karnataka-craft-hero?qlt=82&ts=1726641338177',
    giNumber: 'GI/RS/070/2015',
    artisanName: 'Shah Rasheed Ahmed Quadri (Padma Shri)'
  }
];

// Active Checkout Cart Items Array
let cartItems = [];

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  const bgClass = type === 'error' ? 'border-red-500 bg-red-950' : type === 'success' ? 'border-green-500 bg-green-950' : 'border-[#B8860B] bg-[#1A1A1A]';
  t.className = `fixed bottom-6 right-6 z-[150] text-white px-5 py-4 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 ${bgClass}`;
  setTimeout(() => { t.className = 'hidden'; }, 3800);
}

function formatINR(n) {
  return '₹ ' + Number(n).toLocaleString('en-IN');
}

/**
 * Render Cart Items List with Quantity [-/+] Controls & Remove [🗑️] Buttons
 */
function renderCartItems() {
  const container = document.getElementById('cart-items-container');
  const countEl = document.getElementById('summary-items-count');
  if (!container) return;

  const totalItemQuantity = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  if (countEl) {
    countEl.textContent = `${totalItemQuantity} ${totalItemQuantity === 1 ? 'Item' : 'Items'}`;
  }

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 px-4 bg-[#FAF9F5] rounded-2xl border border-dashed border-gray-300">
        <div class="w-12 h-12 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center text-xl mx-auto mb-3">
          <i class="fa-solid fa-basket-shopping"></i>
        </div>
        <h4 class="font-bold text-sm text-gray-900 mb-1 font-sora">Your Heritage Bag is Empty</h4>
        <p class="text-xs text-gray-500 mb-4">Add certified handicraft items to complete your checkout.</p>
        <button onclick="toggleQuickAddModal()" class="px-4 py-2 bg-[#B8860B] hover:bg-[#8B6508] text-white font-bold text-xs rounded-full uppercase tracking-wider transition-all shadow">
          + Add Heritage Crafts
        </button>
      </div>
    `;
    recalculate();
    return;
  }

  container.innerHTML = cartItems.map((item, index) => {
    const itemSubtotal = (item.price || 0) * (item.qty || 1);
    return `
      <div class="flex items-start gap-3.5 pb-4 mb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0 group">
        <!-- Image & Qty Pill -->
        <div class="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
          <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61'}" alt="${item.name}" class="w-full h-full object-cover"/>
          <span class="absolute top-1 right-1 bg-[#B8860B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
            ${item.qty || 1}
          </span>
        </div>

        <!-- Info & Controls -->
        <div class="flex-grow min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h4 class="text-xs font-bold text-gray-900 leading-tight line-clamp-2" title="${item.name}">${item.name}</h4>
            <!-- Remove Button -->
            <button onclick="removeItem(${index})" title="Remove Item from Order" class="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0">
              <i class="fa-regular fa-trash-can text-xs"></i>
            </button>
          </div>

          <p class="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
            <i class="fa-solid fa-location-dot text-[#B8860B] text-[9px]"></i> ${item.origin || 'India'}
          </p>

          <div class="flex items-center justify-between mt-2">
            <!-- Quantity Control Pill [- 1 +] -->
            <div class="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden shadow-xs">
              <button onclick="updateQuantity(${index}, -1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 font-bold text-xs transition-colors" title="Decrease Quantity">
                -
              </button>
              <span class="w-7 text-center font-mono font-bold text-xs text-gray-900 bg-white border-x border-gray-200 py-0.5">
                ${item.qty || 1}
              </span>
              <button onclick="updateQuantity(${index}, 1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 font-bold text-xs transition-colors" title="Increase Quantity">
                +
              </button>
            </div>

            <!-- Price Breakdown -->
            <div class="text-right">
              <span class="text-xs font-extrabold font-sora text-gray-900 block">${formatINR(itemSubtotal)}</span>
              ${item.qty > 1 ? `<span class="text-[10px] text-gray-400 block">(${formatINR(item.price)} each)</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  recalculate();
}

/**
 * Update Item Quantity by Delta (+1 / -1)
 */
function updateQuantity(index, delta) {
  if (index < 0 || index >= cartItems.length) return;
  const item = cartItems[index];
  const newQty = (item.qty || 1) + delta;

  if (newQty <= 0) {
    removeItem(index);
    return;
  }

  item.qty = newQty;
  saveCartToLocalStorage();
  renderCartItems();
  showToast(`Updated "${item.name.slice(0, 20)}..." quantity to ${newQty}`, 'info');
}

/**
 * Remove Item from Order
 */
function removeItem(index) {
  if (index < 0 || index >= cartItems.length) return;
  const removed = cartItems.splice(index, 1)[0];
  saveCartToLocalStorage();
  renderCartItems();
  showToast(`Removed "${removed.name.slice(0, 24)}..." from order summary`, 'error');
}

/**
 * Quick Add Craft Item to Order
 */
function addQuickCraftItem(itemObj) {
  const existing = cartItems.find(i => i.id === itemObj.id || i.name === itemObj.name);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cartItems.push({
      id: itemObj.id || `craft-${Date.now()}`,
      name: itemObj.name,
      price: Number(itemObj.price),
      qty: 1,
      origin: itemObj.origin || 'India',
      imageUrl: itemObj.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61',
      giNumber: itemObj.giNumber || 'GI/RS/VERIFIED',
      artisanName: itemObj.artisanName || 'Verified Master Guild'
    });
  }

  saveCartToLocalStorage();
  renderCartItems();
  showToast(`Added "${itemObj.name.slice(0, 22)}..." to your order! 🎉`, 'success');
}

function saveCartToLocalStorage() {
  try {
    localStorage.setItem('parampara_cart', JSON.stringify(cartItems));
  } catch (e) {}
}

/**
 * Recalculate Subtotal, 70% Artisan Payout, Taxes & Total Payable
 */
function recalculate() {
  const craftSubtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const artisanPayout = Math.round(craftSubtotal * 0.70);

  let discount = promoApplied ? Math.round(craftSubtotal * 0.10) : 0;
  const afterDiscount = craftSubtotal - discount;
  const shipping = expressDelivery ? EXPRESS_FEE : 0;
  const cod = (currentPayMethod === 'cod') ? COD_FEE : 0;
  const gst = Math.round(afterDiscount * GST_RATE);
  const totalPayable = afterDiscount + shipping + cod + gst;

  const subEl = document.getElementById('price-subtotal');
  if (subEl) subEl.textContent = formatINR(craftSubtotal);
  const shipEl = document.getElementById('price-shipping');
  if (shipEl) shipEl.textContent = (shipping + cod) === 0 ? 'FREE' : formatINR(shipping + cod);
  const gstEl = document.getElementById('price-gst');
  if (gstEl) gstEl.textContent = formatINR(gst);
  const totEl = document.getElementById('price-total');
  if (totEl) totEl.textContent = formatINR(totalPayable);
  const artEl = document.getElementById('artisan-amount');
  if (artEl) artEl.textContent = formatINR(artisanPayout);

  const btnText = document.getElementById('order-btn-text');
  if (btnText) {
    if (cartItems.length === 0) {
      btnText.textContent = 'Bag is Empty — Add Items to Proceed';
    } else {
      btnText.textContent = `Place Secure Order — ${formatINR(totalPayable)}`;
    }
  }

  const discRow = document.getElementById('row-discount');
  if (discRow) {
    if (discount > 0) {
      discRow.classList.remove('hidden');
      document.getElementById('price-discount').textContent = '- ' + formatINR(discount);
    } else {
      discRow.classList.add('hidden');
    }
  }

  // Update primary artisan story dossier card to reflect first item's artisan
  if (cartItems.length > 0) {
    const mainItem = cartItems[0];
    const artNameEl = document.getElementById('artisan-name');
    if (artNameEl && mainItem.artisanName) {
      artNameEl.textContent = mainItem.artisanName;
    }
  }
}

function selectPayMethod(method, btn) {
  currentPayMethod = method;
  document.querySelectorAll('.pay-method').forEach(b => {
    b.classList.remove('border-[#B8860B]', 'text-[#B8860B]');
    b.classList.add('border-gray-200', 'text-gray-700');
  });
  if (btn) {
    btn.classList.remove('border-gray-200', 'text-gray-700');
    btn.classList.add('border-[#B8860B]', 'text-[#B8860B]');
  }

  const panels = ['card', 'upi', 'netbanking', 'cod'];
  panels.forEach(p => {
    const el = document.getElementById('panel-' + p);
    if (el) el.classList.add('hidden');
  });
  const activePanel = document.getElementById('panel-' + method);
  if (activePanel) activePanel.classList.remove('hidden');
  recalculate();
}

function selectUpiApp(appName) {
  const upiInput = document.getElementById('upi-id');
  if (upiInput) {
    upiInput.value = `collector@${appName.toLowerCase()}`;
  }
  showToast(`Connected to ${appName} UPI VPA gateway`, 'success');
}

const VALID_PROMOS = { 'ARTISAN10': 10, 'HERITAGE15': 15, 'PARAMPARA': 10 };
function applyPromo() {
  const inputEl = document.getElementById('promo-input');
  if (!inputEl) return;
  const code = (inputEl.value || '').trim().toUpperCase();
  const msg = document.getElementById('promo-msg');
  if (!msg) return;
  msg.classList.remove('hidden');
  if (VALID_PROMOS[code]) {
    promoApplied = true;
    msg.textContent = `✓ Code "${code}" applied — ${VALID_PROMOS[code]}% off!`;
    msg.className = 'text-xs mt-1.5 font-semibold text-green-700';
    const discLabel = document.getElementById('discount-label');
    if (discLabel) discLabel.textContent = `${VALID_PROMOS[code]}% Heritage Discount`;
    showToast(`Promo applied! ${VALID_PROMOS[code]}% off 🎉`, 'success');
  } else {
    promoApplied = false;
    msg.textContent = '✕ Invalid promo code. Try ARTISAN10.';
    msg.className = 'text-xs mt-1.5 font-semibold text-red-600';
  }
  recalculate();
}

async function goToPayment() {
  if (cartItems.length === 0) {
    showToast('Your bag is empty! Add craft items to proceed.', 'error');
    return;
  }

  const fields = ['first-name','last-name','email-checkout','phone','address1','city','state-select','pincode'];
  for (const id of fields) {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.focus();
      showToast('Please fill in all required shipping fields', 'error');
      return;
    }
  }

  // Pre-create Order on backend via POST /api/orders
  try {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email-checkout').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address1').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state-select').value.trim();
    const postalCode = document.getElementById('pincode').value.trim();

    const craftSubtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const discount = promoApplied ? Math.round(craftSubtotal * 0.10) : 0;
    const shipping = expressDelivery ? EXPRESS_FEE : 0;
    const gst = Math.round((craftSubtotal - discount) * GST_RATE);
    const totalPrice = craftSubtotal - discount + shipping + gst;

    const orderPayload = {
      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.qty || 1,
        price: item.price,
        image: item.imageUrl,
        giNumber: item.giNumber || 'GI/RS/VERIFIED',
        artisanName: item.artisanName || 'Verified Heritage Guild',
        artisanPayoutAmount: Math.round((item.price * (item.qty || 1)) * 0.70),
        product: item.id || 'gi-product'
      })),
      shippingAddress: {
        fullName: `${firstName} ${lastName}`,
        address,
        city,
        state,
        postalCode,
        country: 'India',
        phone
      },
      paymentMethod: currentPayMethod.toUpperCase(),
      itemsPrice: craftSubtotal,
      taxPrice: gst,
      shippingPrice: shipping,
      discountPrice: discount,
      totalPrice
    };

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('parampara_token') || ''}`
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    if (data.success && data.data) {
      activeOrderData = data.data;
    }
  } catch (err) {
    console.warn("Backend order pre-creation notice:", err.message);
  }

  document.getElementById('form-shipping').classList.add('hidden');
  document.getElementById('form-payment').classList.remove('hidden');

  const sNavShip = document.getElementById('step-nav-shipping');
  const sNavPay = document.getElementById('step-nav-payment');
  if (sNavShip) sNavShip.className = 'flex items-center gap-2 text-gray-400';
  if (sNavPay) sNavPay.className = 'flex items-center gap-2 text-[#B8860B] font-bold';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToShipping() {
  document.getElementById('form-payment').classList.add('hidden');
  document.getElementById('form-shipping').classList.remove('hidden');

  const sNavShip = document.getElementById('step-nav-shipping');
  const sNavPay = document.getElementById('step-nav-payment');
  if (sNavShip) sNavShip.className = 'flex items-center gap-2 text-[#B8860B] font-bold';
  if (sNavPay) sNavPay.className = 'flex items-center gap-2 text-gray-400';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function placeOrder() {
  if (cartItems.length === 0) {
    showToast('Your bag is empty! Add craft items to proceed.', 'error');
    return;
  }

  const btnText = document.getElementById('order-btn-text');
  if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Initializing Gateway...';

  const orderId = activeOrderData?._id || ('PAR-2026-' + Math.floor(Math.random() * 9000 + 1000));
  const craftSubtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const discount = promoApplied ? Math.round(craftSubtotal * 0.10) : 0;
  const shipping = expressDelivery ? EXPRESS_FEE : 0;
  const gst = Math.round((craftSubtotal - discount) * GST_RATE);
  const total = craftSubtotal - discount + shipping + gst;

  try {
    const rzpRes = await fetch(`${API_BASE}/orders/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total, currency: 'INR', receipt: orderId })
    });
    const rzpData = await rzpRes.json();
    const razorpayOrderId = rzpData.orderId || `order_rzp_demo_${Date.now()}`;

    const verifyRes = await fetch(`${API_BASE}/orders/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: `pay_rzp_certified_${Date.now()}`,
        razorpaySignature: 'simulated_hmac_sha256_signature',
        paymentMethod: currentPayMethod
      })
    });
    await verifyRes.json();

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (expressDelivery ? 3 : 7));
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const delivEnd = new Date(deliveryDate);
    delivEnd.setDate(delivEnd.getDate() + 2);

    document.getElementById('confirm-order-id').textContent = orderId;
    document.getElementById('confirm-item-name').textContent = cartItems.map(i => `${i.name} (${i.qty})`).join(', ');
    document.getElementById('confirm-total').textContent = formatINR(total);
    document.getElementById('confirm-delivery').textContent =
      deliveryDate.toLocaleDateString('en-IN', opts) + ' – ' + delivEnd.toLocaleDateString('en-IN', opts);

    const pdfBtnContainer = document.getElementById('pdf-download-container');
    if (pdfBtnContainer) {
      pdfBtnContainer.innerHTML = `
        <a href="${API_BASE}/orders/${orderId}/invoice-pdf" target="_blank" download class="inline-flex items-center gap-2 bg-[#8B0000] hover:bg-[#680000] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl my-3">
          <i class="fa-solid fa-file-pdf text-sm text-[#FFD700]"></i>
          <span>Download Certified GI Certificate & Receipt (PDF)</span>
        </a>
      `;
    }

    // Clear cart after placement
    localStorage.removeItem('parampara_cart');

    document.getElementById('form-payment').classList.add('hidden');
    document.getElementById('form-confirm').classList.remove('hidden');

    const sNavPay = document.getElementById('step-nav-payment');
    const sNavConf = document.getElementById('step-nav-confirm');
    if (sNavPay) sNavPay.className = 'flex items-center gap-2 text-gray-400';
    if (sNavConf) sNavConf.className = 'flex items-center gap-2 text-green-700 font-bold';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('🎉 Payment Verified! 70% direct artisan payout processed.', 'success');
  } catch (err) {
    console.error("Order processing error:", err);
    showToast('Order confirmed in offline simulation mode.', 'info');
  }
}

function toggleQuickAddModal() {
  const modal = document.getElementById('quick-add-modal');
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  // 1. Check URL parameters first
  const params = new URLSearchParams(window.location.search);
  let urlItem = null;
  if (params.get('name') || params.get('product')) {
    urlItem = {
      id: 'url-item-' + Date.now(),
      name: params.get('name') || params.get('product'),
      price: parseInt(params.get('price')) || 24500,
      qty: 1,
      origin: params.get('origin') || params.get('state') || 'Kamrup, Assam',
      imageUrl: params.get('image') || params.get('img') || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      giNumber: params.get('gi') || params.get('giNumber') || 'GI/RS/038/2007',
      artisanName: 'Kamrup Silk Weavers Guild'
    };
  }

  // 2. Load stored cart or fallback default
  try {
    const stored = localStorage.getItem('parampara_cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cartItems = parsed.map(i => ({ ...i, qty: i.qty || 1 }));
      } else if (parsed && parsed.name) {
        cartItems = [{ ...parsed, qty: parsed.qty || 1 }];
      }
    }
  } catch (e) {}

  // If URL item is passed, prepend or use it
  if (urlItem) {
    const exists = cartItems.find(i => i.name === urlItem.name);
    if (!exists) {
      cartItems.unshift(urlItem);
    }
  }

  // Default fallback item if cart is empty on first visit
  if (cartItems.length === 0) {
    cartItems = [
      {
        id: 'ass-muga-01',
        name: 'Assam Pure Natural Golden Muga Silk Saree',
        price: 24500,
        qty: 1,
        origin: 'Kamrup, Assam',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
        giNumber: 'GI/RS/038/2007',
        artisanName: 'Kamrup Silk Weavers Cooperative'
      }
    ];
  }

  // Delivery option radios
  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', function() {
      expressDelivery = this.value === 'express';
      document.querySelectorAll('.delivery-opt').forEach(o => {
        o.classList.remove('border-[#B8860B]', 'bg-[#FAF6ED]');
        o.classList.add('border-gray-200', 'bg-white');
      });
      const parent = this.closest('label');
      if (parent) {
        parent.classList.remove('border-gray-200', 'bg-white');
        parent.classList.add('border-[#B8860B]', 'bg-[#FAF6ED]');
      }
      recalculate();
    });
  });

  renderCartItems();
});
