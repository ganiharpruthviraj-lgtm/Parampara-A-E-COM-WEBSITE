/**
 * Parampara Heritage — Collector Profile Page Logic (profile.js)
 * ==============================================================
 * Handles: profile data loading, personal info & address form, password change,
 * order history with interactive tracking dossier, collection grid, tab deep-linking, toasts.
 *
 * Depends on: auth.js (window.GLOBAL_API_BASE, handleLogout)
 */

'use strict';

// ─────────────────────────────────────────────────────────────────
// 1. CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────

var API = () => (window.GLOBAL_API_BASE || 'http://localhost:5000');
var getToken = () => localStorage.getItem('token');
var getCachedUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
};

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num) || amount === null || amount === undefined || amount === '') return '₹—';
  return '₹' + num.toLocaleString('en-IN');
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0].substring(0, 2)).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────
// 2. TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────────

let _toastTimer = null;

function showToast(message, type = 'success') {
  const toast = document.getElementById('profile-toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');
  if (!toast || !msgEl) return;

  if (_toastTimer) clearTimeout(_toastTimer);

  toast.className = 'profile-toast';
  msgEl.textContent = message;

  const iconMap = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    info:    'fa-circle-info'
  };
  if (iconEl) iconEl.className = `fa-solid ${iconMap[type] || 'fa-circle-check'} text-base`;

  void toast.offsetWidth;
  toast.classList.add('show', `toast-${type}`);

  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─────────────────────────────────────────────────────────────────
// 3. TAB SWITCHER (with Deep-Linking & History Support)
// ─────────────────────────────────────────────────────────────────

const TABS = ['account', 'orders', 'collection'];

function getTargetTabFromUrl() {
  // 1. Check URL Hash (e.g. #orders, #collection, #account)
  const hash = (window.location.hash || '').replace('#', '').replace('tab-', '').toLowerCase();
  if (TABS.includes(hash)) return hash;

  // 2. Check Search Param (e.g. ?tab=orders)
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = (params.get('tab') || '').toLowerCase();
    if (TABS.includes(tabParam)) return tabParam;
  } catch {}

  // 3. Fallback to session
  const savedTab = sessionStorage.getItem('profile_active_tab');
  if (savedTab && TABS.includes(savedTab)) return savedTab;

  return 'account';
}

function switchTab(tabId, updateHistory = true) {
  if (!TABS.includes(tabId)) return;

  TABS.forEach(id => {
    const panel = document.getElementById(`tab-${id}`);
    const btn   = document.getElementById(`tab-btn-${id}`);
    const isActive = (id === tabId);
    if (panel) {
      panel.hidden = !isActive;
      panel.classList.toggle('hidden', !isActive);
      panel.style.display = isActive ? 'block' : 'none';
    }
    if (btn) {
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
  });

  try {
    sessionStorage.setItem('profile_active_tab', tabId);
    if (updateHistory && window.location.hash !== `#${tabId}`) {
      history.pushState({ tab: tabId }, '', `#${tabId}`);
    }
  } catch {}
}
window.switchTab = switchTab;

// ─────────────────────────────────────────────────────────────────
// 4. PASSWORD UTILITIES
// ─────────────────────────────────────────────────────────────────

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = isHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

function updatePasswordStrength(value) {
  const fill  = document.getElementById('password-strength-fill');
  const label = document.getElementById('password-strength-label');
  const wrap  = document.getElementById('password-strength-wrap');
  if (!fill || !label) return;

  fill.className = 'password-strength-fill';

  if (!value || value.length === 0) {
    fill.style.width = '0%';
    label.textContent = '';
    label.style.color = '';
    if (wrap) wrap.classList.remove('is-active');
    return;
  }

  if (wrap) wrap.classList.add('is-active');

  let score = 0;
  if (value.length >= 6)  score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score <= 2) {
    fill.classList.add('strength-weak');
    label.textContent = 'Weak — add uppercase, numbers or symbols';
    label.style.color = '#EF4444';
  } else if (score <= 3) {
    fill.classList.add('strength-fair');
    label.textContent = 'Fair — add special characters';
    label.style.color = '#D97706';
  } else {
    fill.classList.add('strength-strong');
    label.textContent = 'Strong password';
    label.style.color = '#16A34A';
  }
}
window.updatePasswordStrength = updatePasswordStrength;

// ─────────────────────────────────────────────────────────────────
// 5. LOAD PROFILE DATA
// ─────────────────────────────────────────────────────────────────

async function loadProfileData() {
  try {
    const res = await fetch(`${API()}/api/auth/profile`, { headers: authHeaders() });
    if (res.status === 401) {
      showToast('Session expired. Redirecting to sign in…', 'error');
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      }, 1200);
      return;
    }

    const data = res.ok ? await res.json() : null;
    const cached = getCachedUser();
    const user   = data?.data || data || cached;

    renderHeroBanner(user);
    populateAccountForm(user);
  } catch (err) {
    console.warn('[Profile] loadProfileData fallback to cache:', err);
    const cached = getCachedUser();
    renderHeroBanner(cached);
    populateAccountForm(cached);
  }
}

function renderHeroBanner(user) {
  const rawName   = user.name || 'Heritage Collector';
  const email     = user.email || '—';
  const role      = user.role || 'user';
  const createdAt = user.createdAt || null;

  // Display name with editorial serif styling
  const nameEl = document.getElementById('profile-display-name');
  if (nameEl) {
    const parts = rawName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const last = parts.pop();
      nameEl.innerHTML = `${escapeHtml(parts.join(' '))}<br><span class="italic font-normal">${escapeHtml(last)}</span>`;
    } else {
      nameEl.textContent = rawName;
    }
  }

  // Email
  const emailEl = document.getElementById('profile-email-display');
  if (emailEl) {
    const span = emailEl.querySelector('span');
    if (span) span.textContent = email;
  }

  // Avatar image or initials fallback
  const avatarWrap = document.getElementById('profile-avatar-wrap');
  if (avatarWrap) {
    const rawUrl = (user.avatarUrl || '').trim();
    if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
      avatarWrap.innerHTML = `
        <img src="${escapeHtml(rawUrl)}" alt="${escapeHtml(rawName)}" class="profile-avatar-img"
             onerror="this.style.display='none'; const fb = document.getElementById('profile-initials-fallback'); if(fb) fb.style.display='flex';" />
        <div class="profile-avatar-initials" id="profile-initials-fallback" style="display:none;">${getInitials(rawName)}</div>
      `;
    } else {
      avatarWrap.innerHTML = `
        <div class="profile-avatar-initials" id="profile-initials">${getInitials(rawName)}</div>
      `;
    }
  }

  // Role badge
  const roleTextEl = document.getElementById('profile-role-text');
  const roleMap = { user: 'Heritage Collector', artisan: 'Shilp Guru Guild', admin: 'Platform Admin' };
  if (roleTextEl) roleTextEl.textContent = roleMap[role] || 'Heritage Collector';

  // Member since
  const sinceText = createdAt ? `Member since ${formatDate(createdAt)}` : 'Member since 20 Oct 2026';
  const sinceEl = document.getElementById('profile-member-since');
  const sinceMobile = document.getElementById('profile-member-since-mobile');
  if (sinceEl)     sinceEl.innerHTML = `<i class="fa-regular fa-clock text-[#EEDB9F]/80 text-[11px] mr-1"></i> ${escapeHtml(sinceText)}`;
  if (sinceMobile) sinceMobile.innerHTML = `<i class="fa-regular fa-clock text-[#EEDB9F]/80 text-[11px] mr-1"></i> ${escapeHtml(sinceText)}`;
}

function populateAccountForm(user) {
  const nameInput   = document.getElementById('input-name');
  const emailInput  = document.getElementById('input-email');
  const phoneInput  = document.getElementById('input-phone');
  const avatarInput = document.getElementById('input-avatar');
  const addrInput   = document.getElementById('input-address');
  const cityInput   = document.getElementById('input-city');
  const stateInput  = document.getElementById('input-state');
  const pinInput    = document.getElementById('input-pincode');

  if (nameInput)   nameInput.value   = user.name  || '';
  if (emailInput)  emailInput.value  = user.email || '';
  if (phoneInput)  phoneInput.value  = user.phone || '';
  if (avatarInput) avatarInput.value = user.avatarUrl || '';

  const ship = user.shippingAddress || {};
  if (addrInput)  addrInput.value  = ship.address || '';
  if (cityInput)  cityInput.value  = ship.city    || '';
  if (stateInput) stateInput.value = ship.state   || '';
  if (pinInput)   pinInput.value   = ship.pincode || '';

  // Google SSO Check & Handling
  const isGoogle = (user.authProvider === 'google') || (user.email && user.email.toLowerCase().includes('@gmail.com') && !user.hasLocalPassword);
  const ssoNotice = document.getElementById('google-sso-notice');
  const currPassWrap = document.getElementById('wrap-current-password');

  if (isGoogle) {
    if (ssoNotice) ssoNotice.classList.remove('hidden');
    if (currPassWrap) currPassWrap.classList.add('hidden');
  } else {
    if (ssoNotice) ssoNotice.classList.add('hidden');
    if (currPassWrap) currPassWrap.classList.remove('hidden');
  }
}

// ─────────────────────────────────────────────────────────────────
// 6. LOAD ORDER HISTORY
// ─────────────────────────────────────────────────────────────────

async function loadOrderHistory() {
  const listEl    = document.getElementById('orders-list');
  const summaryEl = document.getElementById('orders-summary-text');
  const countEl   = document.getElementById('tab-orders-count');

  try {
    const res  = await fetch(`${API()}/api/orders/my-orders`, { headers: authHeaders() });
    if (res.status === 401) {
      if (summaryEl) summaryEl.textContent = 'Session expired.';
      return;
    }
    const json = res.ok ? await res.json() : null;
    const orders = Array.isArray(json?.data) ? json.data : (Array.isArray(json?.orders) ? json.orders : (Array.isArray(json) ? json : []));

    // Update hero order count
    const statEl = document.getElementById('stat-orders-val');
    if (statEl) statEl.textContent = orders.length;

    // Update tab count badge
    if (countEl && orders.length > 0) {
      countEl.textContent = orders.length;
      countEl.classList.remove('hidden');
    }

    // Update 70% direct artisan patronage stat in hero
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const artisanContribution = Math.round(totalSpent * 0.7);
    const spentEl = document.getElementById('stat-spent-val');
    if (spentEl) {
      spentEl.textContent = artisanContribution > 0 ? formatCurrency(artisanContribution) : '₹0';
    }

    if (!listEl) return;

    if (orders.length === 0) {
      listEl.innerHTML = `
        <div class="profile-empty-state">
          <div class="profile-empty-state-icon"><i class="fa-solid fa-bag-shopping"></i></div>
          <div class="profile-empty-state-title">No acquisitions in archive</div>
          <p class="profile-empty-state-text">Explore certified one-of-a-kind heritage masterpieces across India's 28 states with 70% direct artisan payout.</p>
          <a href="search.html" class="btn-gold-primary">
            <i class="fa-solid fa-compass text-xs"></i> Explore Masterpieces
          </a>
        </div>
      `;
      if (summaryEl) summaryEl.textContent = 'No orders placed yet.';
      return;
    }

    if (summaryEl) {
      summaryEl.textContent = `${orders.length} acquisition${orders.length > 1 ? 's' : ''} · ${formatCurrency(totalSpent)} total archive value`;
    }

    listEl.innerHTML = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(order => renderOrderCard(order))
      .join('');

  } catch (err) {
    console.warn('[Profile] loadOrderHistory error:', err);
    if (listEl) listEl.innerHTML = `
      <div class="profile-empty-state">
        <div class="profile-empty-state-icon"><i class="fa-solid fa-wifi"></i></div>
        <div class="profile-empty-state-title">Archive Offline</div>
        <p class="profile-empty-state-text">Could not retrieve your purchase history. Check server connection.</p>
        <button onclick="loadOrderHistory()" class="btn-gold-primary">
          <i class="fa-solid fa-rotate-right text-xs"></i> Retry
        </button>
      </div>
    `;
    if (summaryEl) summaryEl.textContent = 'Unable to load orders.';
  }
}

function toggleOrderDossier(orderId) {
  const el = document.getElementById(`dossier-${orderId}`);
  const btn = document.getElementById(`btn-toggle-${orderId}`);
  if (!el) return;
  const isShown = el.classList.contains('show');
  if (isShown) {
    el.classList.remove('show');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-route text-xs"></i> View Heritage Tracking Dossier';
  } else {
    el.classList.add('show');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-chevron-up text-xs"></i> Close Tracking Dossier';
  }
}
window.toggleOrderDossier = toggleOrderDossier;

function openOrderSupport(shortId) {
  const pmBtn = document.getElementById('pm-trigger-btn') || document.querySelector('[data-pm-trigger]');
  if (pmBtn) {
    pmBtn.click();
    showToast(`🏺 Parampara Mitra Concierge opened for Order #${shortId}`, 'info');
  } else {
    showToast(`Assistance for Order #${shortId}: support@parampara.in`, 'info');
  }
}
window.openOrderSupport = openOrderSupport;

function renderOrderCard(order) {
  const statusMap = {
    Processing:  { step: 1, cls: 'status-processing',  icon: 'fa-clock',        label: 'Processing' },
    Handcrafted: { step: 2, cls: 'status-handcrafted', icon: 'fa-hammer',       label: 'Handcrafted in Loom' },
    Dispatched:  { step: 3, cls: 'status-dispatched',  icon: 'fa-truck-fast',   label: 'Dispatched' },
    Delivered:   { step: 4, cls: 'status-delivered',   icon: 'fa-circle-check', label: 'Delivered & Certified' }
  };
  const currentStep = statusMap[order.orderStatus]?.step || 1;
  const status = statusMap[order.orderStatus] || statusMap['Processing'];

  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const itemsHTML = items.map(item => {
    const itemImg = item.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&q=80';
    const giTag = item.giNumber || 'GI-AUTHENTIC';
    const artisan = item.artisanName || 'Verified Heritage Guild';
    return `
      <li class="order-item-row">
        <img src="${escapeHtml(itemImg)}" alt="${escapeHtml(item.name || 'Craft')}" class="order-item-thumb" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&q=80';"/>
        <div class="order-item-meta">
          <div class="order-item-name">${escapeHtml(item.name || 'Heritage Craft')}</div>
          <div class="order-item-sub">
            <span class="order-gi-pill"><i class="fa-solid fa-certificate"></i> ${escapeHtml(giTag)}</span>
            <span>·</span>
            <span><i class="fa-solid fa-hands-holding-circle text-[10px]"></i> ${escapeHtml(artisan)}</span>
            <span>·</span>
            <span>Qty: ${escapeHtml(item.qty || 1)}</span>
          </div>
        </div>
        <div class="ml-auto font-medium text-sm text-[#1A1A1A] flex-shrink-0">${formatCurrency(item.price || 0)}</div>
      </li>
    `;
  }).join('');

  const rawOrderId = String(order._id || order.id || '');
  const orderId = escapeHtml(rawOrderId);
  const shortId = rawOrderId.length > 8 ? rawOrderId.slice(-8).toUpperCase() : (rawOrderId || 'N/A');
  const artisanShare = Math.round((Number(order.totalPrice) || 0) * 0.7);

  // Shipping Address
  const ship = order.shippingAddress || {};
  const shipDest = [ship.address, ship.city, ship.state, ship.postalCode || ship.pincode].filter(Boolean).join(', ') || 'Address on file';
  const shipRecipient = ship.fullName || 'Collector';
  const shipPhone = ship.phone ? `+91 ${ship.phone}` : '—';
  const paymentBadge = `${order.paymentMethod || 'Razorpay Secured'} · ${order.isPaid ? 'Payment Confirmed ✓' : 'Payment Completed'}`;

  // Timeline steps
  const stepsDef = [
    { num: 1, title: 'Commissioned', sub: 'Artisan Allocated' },
    { num: 2, title: 'Master Loom', sub: 'GI Handcrafted' },
    { num: 3, title: 'Dispatched', sub: 'Inspected & Sealed' },
    { num: 4, title: 'Delivered', sub: 'Certified Archive' }
  ];
  const timelineHTML = stepsDef.map(st => {
    let stateClass = '';
    let iconHTML = String(st.num);
    if (st.num < currentStep) {
      stateClass = 'completed';
      iconHTML = '<i class="fa-solid fa-check"></i>';
    } else if (st.num === currentStep) {
      stateClass = 'active';
      iconHTML = `<i class="fa-solid ${status.icon}"></i>`;
    }
    return `
      <div class="order-timeline-step ${stateClass}">
        <div class="order-step-dot">${iconHTML}</div>
        <div class="order-step-label">
          <div class="font-bold">${st.title}</div>
          <div class="text-[9px] text-[#8C827A] hidden sm:block">${st.sub}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <article class="order-card" data-order-id="${orderId}">
      <div class="order-card-header">
        <div class="flex flex-wrap items-center gap-2">
          <span class="order-ref-badge">
            <i class="fa-solid fa-receipt text-[#B8860B]"></i>
            ORD-${escapeHtml(shortId)}
          </span>
          <span class="text-xs text-[#8C827A] font-light">Acquisition on ${formatDate(order.createdAt)}</span>
        </div>
        <span class="order-status-badge ${status.cls}">
          <i class="fa-solid ${status.icon}"></i>
          ${status.label}
        </span>
      </div>

      <ul class="order-items-list">
        ${itemsHTML}
      </ul>

      <!-- 70% Direct Artisan Payout Highlight (Core Brand Pillar) -->
      <div class="order-artisan-payout-banner">
        <span class="flex items-center gap-1.5">
          <i class="fa-solid fa-hand-holding-heart text-[#B8860B]"></i>
          <span>70% Direct Artisan Payout:</span>
        </span>
        <strong>${formatCurrency(artisanShare)} transferred to Shilp Guru Guild</strong>
      </div>

      <!-- Expandable Tracking Dossier Toggle Button -->
      <div class="mb-3">
        <button type="button" id="btn-toggle-${orderId}" class="btn-dossier-toggle" onclick="toggleOrderDossier('${orderId}')">
          <i class="fa-solid fa-route text-xs"></i>
          View Heritage Tracking Dossier
        </button>
      </div>

      <!-- Expandable Tracking & Destination Dossier Panel -->
      <div id="dossier-${orderId}" class="order-dossier-expand">
        <div class="text-[11px] uppercase tracking-wider text-[#B8860B] font-bold mb-3 flex items-center gap-1.5">
          <i class="fa-solid fa-compass"></i> Heritage Acquisition Dispatch & Certification Dossier
        </div>

        <div class="order-timeline">
          ${timelineHTML}
        </div>

        <div class="order-details-grid">
          <div class="order-detail-box">
            <div class="order-detail-title"><i class="fa-solid fa-location-dot text-[#B8860B] mr-1"></i> Delivery Destination</div>
            <div class="font-semibold text-[#1A1A1A]">${escapeHtml(shipRecipient)}</div>
            <div class="text-[#6B6B6B] mt-0.5">${escapeHtml(shipDest)}</div>
            <div class="text-[#8C827A] text-[11px] mt-1"><i class="fa-solid fa-phone text-[10px] mr-1"></i> ${escapeHtml(shipPhone)}</div>
          </div>
          <div class="order-detail-box">
            <div class="order-detail-title"><i class="fa-solid fa-shield-halved text-[#B8860B] mr-1"></i> Payment & Guarantee</div>
            <div class="font-semibold text-[#1A1A1A]">${escapeHtml(paymentBadge)}</div>
            <div class="text-[#6B6B6B] mt-1 text-[11px] leading-relaxed">GI tagged authenticity verified. Includes tamper-evident wax seal & certificate.</div>
          </div>
        </div>
      </div>

      <div class="order-card-footer">
        <div>
          <div class="text-[10px] uppercase tracking-wider text-[#8C827A] mb-0.5 font-semibold">Order Total</div>
          <div class="order-total-price">${formatCurrency(order.totalPrice)}</div>
        </div>
        <div class="flex items-center gap-2.5 flex-wrap">
          ${orderId ? `
            <a href="${API()}/api/orders/${orderId}/invoice-pdf"
               target="_blank" rel="noopener noreferrer"
               class="btn-invoice"
               title="Download GI Authenticity Certificate & Invoice PDF">
              <i class="fa-solid fa-file-pdf"></i>
              GI Certificate & Invoice
            </a>
          ` : ''}
          <button type="button"
             onclick="openOrderSupport('${escapeHtml(shortId)}')"
             class="btn-order-help"
             title="Need assistance or have questions about this craft?">
            <i class="fa-solid fa-headset"></i>
            Order Support
          </button>
          <a href="search.html" class="btn-reorder">
            <i class="fa-solid fa-compass"></i>
            Explore More Crafts
          </a>
        </div>
      </div>
    </article>
  `;
}

// ─────────────────────────────────────────────────────────────────
// 7. LOAD COLLECTION (Saved Masterpieces - 100% Matching collection.html)
// ─────────────────────────────────────────────────────────────────

async function loadCollection() {
  const gridEl   = document.getElementById('collection-grid');
  const countEl  = document.getElementById('tab-collection-count');
  const statEl   = document.getElementById('stat-collection-val');

  try {
    const res   = await fetch(`${API()}/api/auth/collection`, { headers: authHeaders() });
    if (res.status === 401) return;
    const items = res.ok ? await res.json() : [];
    const collection = (Array.isArray(items) ? items : []).filter(item => Boolean(item && (item._id || item.id || item.name)));

    if (statEl) statEl.textContent = collection.length;

    if (countEl && collection.length > 0) {
      countEl.textContent = collection.length;
      countEl.classList.remove('hidden');
    }

    if (!gridEl) return;

    if (collection.length === 0) {
      gridEl.className = 'w-full';
      gridEl.innerHTML = `
        <div class="profile-empty-state">
          <div class="profile-empty-state-icon"><i class="fa-regular fa-heart"></i></div>
          <div class="profile-empty-state-title">Your collection is empty</div>
          <p class="profile-empty-state-text">Discover authentic heritage crafts from 28 states and save them to your personal archive.</p>
          <a href="search.html" class="btn-gold-primary">
            <i class="fa-solid fa-compass text-xs"></i> Explore Masterpieces
          </a>
        </div>
      `;
      return;
    }

    gridEl.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    gridEl.innerHTML = collection.map((product, i) => renderCollectionCard(product, i)).join('');

  } catch (err) {
    console.warn('[Profile] loadCollection error:', err);
    if (gridEl) {
      gridEl.className = 'w-full';
      gridEl.innerHTML = `
        <div class="profile-empty-state">
          <div class="profile-empty-state-icon"><i class="fa-solid fa-wifi"></i></div>
          <div class="profile-empty-state-title">Archive Currently Offline</div>
          <p class="profile-empty-state-text">We couldn't connect to the heritage archive. Please check server connection.</p>
          <button onclick="loadCollection()" class="btn-gold-primary">
            <i class="fa-solid fa-rotate-right text-xs"></i> Try Again
          </button>
        </div>
      `;
    }
  }
}

function renderCollectionCard(product, index = 0) {
  const rawId    = String(product._id || product.id || '');
  const id       = escapeHtml(rawId);
  const name     = escapeHtml(product.name || 'Heritage Craft');
  const state    = escapeHtml(product.state || 'India');
  const craft    = escapeHtml(product.craft || product.category || 'GI Certified Masterpiece');
  const price    = product.price || 0;
  const imageUrl = escapeHtml(product.imageUrl || 'https://images.unsplash.com/photo-1641468118437-71516df9e0da?w=600&q=80');
  const giTagged = product.giTagged !== false;

  return `
    <div class="product-card" onclick="location.href='masterpiece.html?id=${id}'" style="animation-delay: ${index * 80}ms">
      <div class="product-card-img">
        <button class="btn-heart-remove"
                onclick="event.stopPropagation(); removeFromCollection('${id}', this.closest('.product-card'))"
                title="Remove from Collection" aria-label="Remove ${name} from collection">
          <i class="fa-solid fa-heart"></i>
        </button>
        ${giTagged ? '<span class="product-gi-tag">GI Certified</span>' : ''}
        <img decoding="async" src="${imageUrl}" alt="${name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1641468118437-71516df9e0da?w=600&q=80'"/>
      </div>
      <div class="product-card-body">
        <p class="product-state">${state}</p>
        <p class="product-name">${name}</p>
        <div class="product-footer">
          <span class="product-craft">${craft}</span>
          <span class="product-price">${formatCurrency(price)}</span>
        </div>
      </div>
    </div>
  `;
}

async function removeFromCollection(productId, cardEl) {
  if (!productId) return;
  if (!confirm('Remove this masterpiece from your collection? 🏺')) return;
  try {
    const res = await fetch(`${API()}/api/auth/collection/${productId}`, {
      method: 'POST',
      headers: authHeaders()
    });
    if (res.ok) {
      if (cardEl) {
        cardEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        cardEl.style.opacity = '0';
        cardEl.style.transform = 'scale(0.9)';
        setTimeout(() => {
          cardEl.remove();
          updateCollectionCountAfterRemoval();
        }, 300);
      }
      showToast('Masterpiece removed from your archive', 'info');
    } else {
      showToast('Could not remove item. Try again.', 'error');
    }
  } catch (err) {
    console.error('[Profile] removeFromCollection error:', err);
    showToast('Network error. Please try again.', 'error');
  }
}
window.removeFromCollection = removeFromCollection;

function updateCollectionCountAfterRemoval() {
  const grid      = document.getElementById('collection-grid');
  const remaining = grid ? grid.querySelectorAll('.product-card').length : 0;
  const statEl    = document.getElementById('stat-collection-val');
  const countEl   = document.getElementById('tab-collection-count');

  if (statEl) statEl.textContent = remaining;
  if (countEl) {
    countEl.textContent = remaining;
    if (remaining === 0) countEl.classList.add('hidden');
  }

  if (remaining === 0 && grid) {
    grid.className = 'w-full';
    grid.innerHTML = `
      <div class="profile-empty-state">
        <div class="profile-empty-state-icon"><i class="fa-regular fa-heart"></i></div>
        <div class="profile-empty-state-title">Your collection is empty</div>
        <p class="profile-empty-state-text">Discover authentic heritage crafts from 28 states and save them to your personal archive.</p>
        <a href="search.html" class="btn-gold-primary">
          <i class="fa-solid fa-compass text-xs"></i> Explore Masterpieces
        </a>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────
// 8. FORM: PERSONAL INFO & SAVED SHIPPING ADDRESS
// ─────────────────────────────────────────────────────────────────

function bindAccountForm() {
  const form       = document.getElementById('form-personal-info');
  const btn        = document.getElementById('btn-save-personal');
  const status     = document.getElementById('personal-form-status');
  const phoneInput = document.getElementById('input-phone');

  if (!form) return;

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…'; }
    if (status) status.textContent = '';

    const name = (document.getElementById('input-name')?.value || '').trim();
    let phone  = (document.getElementById('input-phone')?.value || '').trim();
    const avatarUrl = (document.getElementById('input-avatar')?.value || '').trim();
    const shippingAddress = {
      address: (document.getElementById('input-address')?.value || '').trim(),
      city:    (document.getElementById('input-city')?.value || '').trim(),
      state:   (document.getElementById('input-state')?.value || '').trim(),
      pincode: (document.getElementById('input-pincode')?.value || '').trim()
    };

    if (phone) {
      phone = phone.replace(/\D/g, '').replace(/^91(?=[6-9]\d{9}$)/, '').slice(0, 10);
      if (phoneInput) phoneInput.value = phone;
    }

    if (!name || name.length < 2) {
      if (status) { status.textContent = '⚠ Full name must be at least 2 characters.'; status.style.color = '#DC2626'; }
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk text-xs"></i> Save Changes'; }
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      if (status) { status.textContent = '⚠ Enter a valid 10-digit Indian mobile number.'; status.style.color = '#DC2626'; }
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk text-xs"></i> Save Changes'; }
      return;
    }

    try {
      const res  = await fetch(`${API()}/api/auth/profile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name, phone: phone || null, avatarUrl: avatarUrl || null, shippingAddress })
      });
      const data = await res.json();

      if (res.ok) {
        const cached = getCachedUser();
        cached.name = name;
        cached.phone = phone || null;
        cached.avatarUrl = avatarUrl || null;
        cached.shippingAddress = shippingAddress;
        try { localStorage.setItem('user', JSON.stringify(cached)); } catch {}

        renderHeroBanner(cached);

        if (typeof updateGlobalNav === 'function') {
          updateGlobalNav();
        }

        showToast('Profile & Address updated successfully!', 'success');
        if (status) { status.textContent = '✓ Saved'; status.style.color = '#16A34A'; }
      } else {
        const msg = data.message || 'Update failed.';
        showToast(msg, 'error');
        if (status) { status.textContent = `⚠ ${msg}`; status.style.color = '#DC2626'; }
      }
    } catch (err) {
      console.error('[Profile] savePersonalInfo error:', err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk text-xs"></i> Save Changes'; }
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// 9. FORM: CHANGE PASSWORD (SSO & Local)
// ─────────────────────────────────────────────────────────────────

function bindPasswordForm() {
  const form             = document.getElementById('form-change-password');
  const btn              = document.getElementById('btn-update-password');
  const status           = document.getElementById('password-form-status');
  const mismatch         = document.getElementById('password-mismatch-hint');
  const newPassInput     = document.getElementById('input-new-password');
  const confirmPassInput = document.getElementById('input-confirm-password');

  if (!form) return;

  const clearMismatch = () => {
    if (mismatch && !mismatch.classList.contains('hidden')) {
      if (newPassInput && confirmPassInput && newPassInput.value === confirmPassInput.value) {
        mismatch.classList.add('hidden');
      }
    }
  };
  if (confirmPassInput) confirmPassInput.addEventListener('input', clearMismatch);
  if (newPassInput) newPassInput.addEventListener('input', clearMismatch);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currPassWrap    = document.getElementById('wrap-current-password');
    const isGoogleSSO     = currPassWrap && currPassWrap.classList.contains('hidden');
    const currentPassword = document.getElementById('input-current-password')?.value || '';
    const newPassword     = newPassInput?.value || '';
    const confirmPassword = confirmPassInput?.value || '';

    if (!isGoogleSSO && !currentPassword) {
      showToast('Enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      if (mismatch) mismatch.classList.remove('hidden');
      return;
    }
    if (mismatch) mismatch.classList.add('hidden');

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating…'; }
    if (status) status.textContent = '';

    try {
      const payload = { newPassword };
      if (!isGoogleSSO && currentPassword) {
        payload.currentPassword = currentPassword;
      }

      const res  = await fetch(`${API()}/api/auth/password`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        form.reset();
        const fill = document.getElementById('password-strength-fill');
        const label = document.getElementById('password-strength-label');
        if (fill)  { fill.className = 'password-strength-fill'; fill.style.width = '0%'; }
        if (label) { label.textContent = '—'; label.style.color = ''; }

        if (isGoogleSSO) {
          const cached = getCachedUser();
          cached.authProvider = 'local';
          try { localStorage.setItem('user', JSON.stringify(cached)); } catch {}
          if (currPassWrap) currPassWrap.classList.remove('hidden');
          const notice = document.getElementById('google-sso-notice');
          if (notice) notice.classList.add('hidden');
        }

        showToast('Password changed successfully!', 'success');
        if (status) { status.textContent = '✓ Updated'; status.style.color = '#16A34A'; }
      } else {
        const msg = data.message || 'Password change failed.';
        showToast(msg, 'error');
        if (status) { status.textContent = `⚠ ${msg}`; status.style.color = '#DC2626'; }
      }
    } catch (err) {
      console.error('[Profile] changePassword error:', err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-shield-halved text-xs"></i> Update Password'; }
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// 10. SIGN OUT
// ─────────────────────────────────────────────────────────────────

function confirmSignOut() {
  if (confirm('Sign out of Parampara Heritage Archive? 🏺\nYour collection and session will be safely stored.')) {
    try { sessionStorage.removeItem('profile_active_tab'); } catch {}
    if (typeof handleLogout === 'function') {
      handleLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }
  }
}
window.confirmSignOut = confirmSignOut;

// ─────────────────────────────────────────────────────────────────
// 11. EMPTY STATE RENDERER
// ─────────────────────────────────────────────────────────────────

function renderEmptyState(icon, title, text) {
  return `
    <div class="profile-empty-state">
      <div class="profile-empty-state-icon"><i class="fa-regular ${escapeHtml(icon)}"></i></div>
      <div class="profile-empty-state-title">${escapeHtml(title)}</div>
      <p class="profile-empty-state-text">${escapeHtml(text)}</p>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────
// 12. INIT
// ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const initialTab = getTargetTabFromUrl();
  switchTab(initialTab, false);

  window.addEventListener('popstate', () => {
    const target = getTargetTabFromUrl();
    switchTab(target, false);
  });
  window.addEventListener('hashchange', () => {
    const target = getTargetTabFromUrl();
    switchTab(target, false);
  });

  await Promise.allSettled([
    loadProfileData(),
    loadOrderHistory(),
    loadCollection()
  ]);

  bindAccountForm();
  bindPasswordForm();
});
