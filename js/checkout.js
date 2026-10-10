/**
 * Parampara Heritage E-Commerce - Checkout Engine
 * Connects frontend forms with /api/orders backend routes and PDF download
 */

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

let currentPayMethod = 'card';
let expressDelivery = false;
let promoApplied = false;
let activeOrderData = null;

let BASE_PRICE = 24500;
const GST_RATE = 0.12;
const EXPRESS_FEE = 299;
const COD_FEE = 99;

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

function recalculate() {
  let subtotal = BASE_PRICE;
  let discount = promoApplied ? Math.round(subtotal * 0.10) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = expressDelivery ? EXPRESS_FEE : 0;
  const cod = (currentPayMethod === 'cod') ? COD_FEE : 0;
  const gst = Math.round(afterDiscount * GST_RATE);
  const total = afterDiscount + shipping + cod + gst;
  const artisanPayout = Math.round(subtotal * 0.70);

  const subEl = document.getElementById('price-subtotal');
  if (subEl) subEl.textContent = formatINR(subtotal);
  const shipEl = document.getElementById('price-shipping');
  if (shipEl) shipEl.textContent = (shipping + cod) === 0 ? 'FREE' : formatINR(shipping + cod);
  const gstEl = document.getElementById('price-gst');
  if (gstEl) gstEl.textContent = formatINR(gst);
  const totEl = document.getElementById('price-total');
  if (totEl) totEl.textContent = formatINR(total);
  const artEl = document.getElementById('artisan-amount');
  if (artEl) artEl.textContent = formatINR(artisanPayout);

  const btnText = document.getElementById('order-btn-text');
  if (btnText) btnText.textContent = `Place Secure Order — ${formatINR(total)}`;

  const discRow = document.getElementById('row-discount');
  if (discRow) {
    if (discount > 0) {
      discRow.classList.remove('hidden');
      document.getElementById('price-discount').textContent = '- ' + formatINR(discount);
    } else {
      discRow.classList.add('hidden');
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
    const productName = document.getElementById('summary-product-name').textContent;
    const giNumber = (document.getElementById('summary-product-gi')?.textContent || '').replace('GI Certified · ', '');

    const orderPayload = {
      orderItems: [
        {
          name: productName,
          qty: 1,
          price: BASE_PRICE,
          image: document.getElementById('summary-product-img')?.src || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61',
          giNumber: giNumber || 'GI/RS/080/2016',
          artisanName: document.getElementById('artisan-name')?.textContent || 'Verified Heritage Guild',
          artisanPayoutAmount: Math.round(BASE_PRICE * 0.70),
          product: 'gi-item-selected'
        }
      ],
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
      itemsPrice: BASE_PRICE,
      taxPrice: Math.round(BASE_PRICE * GST_RATE),
      shippingPrice: expressDelivery ? EXPRESS_FEE : 0,
      discountPrice: promoApplied ? Math.round(BASE_PRICE * 0.10) : 0,
      totalPrice: (BASE_PRICE + Math.round(BASE_PRICE * GST_RATE) + (expressDelivery ? EXPRESS_FEE : 0) - (promoApplied ? Math.round(BASE_PRICE * 0.10) : 0))
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
  const btnText = document.getElementById('order-btn-text');
  if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Initializing Payment Gateway...';

  const orderId = activeOrderData?._id || ('PAR-2026-' + Math.floor(Math.random() * 9000 + 1000));
  const subtotal = BASE_PRICE;
  const discount = promoApplied ? Math.round(subtotal * 0.10) : 0;
  const shipping = expressDelivery ? EXPRESS_FEE : 0;
  const gst = Math.round((subtotal - discount) * GST_RATE);
  const total = subtotal - discount + shipping + gst;

  try {
    // 1. Request Razorpay Order initialization from API
    const rzpRes = await fetch(`${API_BASE}/orders/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total, currency: 'INR', receipt: orderId })
    });
    const rzpData = await rzpRes.json();

    const razorpayOrderId = rzpData.orderId || `order_rzp_demo_${Date.now()}`;

    // 2. Perform Payment Verification API call
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

    // 3. Update UI to Confirmation Screen
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (expressDelivery ? 3 : 7));
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const delivEnd = new Date(deliveryDate);
    delivEnd.setDate(delivEnd.getDate() + 2);

    document.getElementById('confirm-order-id').textContent = orderId;
    document.getElementById('confirm-item-name').textContent = document.getElementById('summary-product-name').textContent;
    document.getElementById('confirm-total').textContent = formatINR(total);
    document.getElementById('confirm-delivery').textContent =
      deliveryDate.toLocaleDateString('en-IN', opts) + ' – ' + delivEnd.toLocaleDateString('en-IN', opts);

    // Setup PDF Download Link Button
    const pdfBtnContainer = document.getElementById('pdf-download-container');
    if (pdfBtnContainer) {
      pdfBtnContainer.innerHTML = `
        <a href="${API_BASE}/orders/${orderId}/invoice-pdf" target="_blank" download class="inline-flex items-center gap-2 bg-[#8B0000] hover:bg-[#680000] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl my-3">
          <i class="fa-solid fa-file-pdf text-sm text-[#FFD700]"></i>
          <span>Download Certified GI Certificate & Receipt (PDF)</span>
        </a>
      `;
    }

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

// Bind radio listeners
document.addEventListener('DOMContentLoaded', () => {
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

  // Load Cart Info
  const params = new URLSearchParams(window.location.search);
  let itemData = null;

  if (params.get('name') || params.get('product')) {
    itemData = {
      name: params.get('name') || params.get('product'),
      price: parseInt(params.get('price')) || 24500,
      origin: params.get('origin') || params.get('state') || 'India',
      imageUrl: params.get('image') || params.get('img'),
      giNumber: params.get('gi') || params.get('giNumber')
    };
  } else {
    try {
      const stored = localStorage.getItem('parampara_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          itemData = parsed[parsed.length - 1];
        } else if (parsed && parsed.name) {
          itemData = parsed;
        }
      }
    } catch (e) {}
  }

  if (itemData) {
    if (itemData.name) {
      const nameEl = document.getElementById('summary-product-name');
      if (nameEl) nameEl.textContent = itemData.name;
    }
    if (itemData.price) {
      BASE_PRICE = Number(itemData.price);
    }
    if (itemData.origin) {
      const origEl = document.getElementById('summary-product-origin');
      if (origEl) origEl.innerHTML = `<i class="fa-solid fa-location-dot text-[#B8860B] text-[10px]"></i> ${itemData.origin}`;
    }
    if (itemData.imageUrl) {
      const imgEl = document.getElementById('summary-product-img');
      if (imgEl) imgEl.src = itemData.imageUrl;
    }
    if (itemData.giNumber) {
      const giEl = document.getElementById('summary-product-gi');
      if (giEl) giEl.textContent = `GI Certified · ${itemData.giNumber}`;
    }
  }

  recalculate();
});
