/**
 * Parampara Heritage — Artisan Guild Portal Controller (artisan-dashboard.js)
 * Manages craft inventory, live stock counts, 70% direct payouts, and order workflow.
 */

const API_BASE = window.GLOBAL_API_BASE || '';

// Master Artisan Guild Profiles
const GUILD_PROFILES = {
  gopal_saini: {
    id: 'gopal_saini',
    name: 'Gopal Saini (Shilp Guru)',
    craftTradition: 'Jaipur Blue Pottery',
    state: 'Rajasthan',
    district: 'Jaipur Craft Hub',
    giNumber: 'GI/42/RAJ/POTTERY',
    avatar: 'assets/jaipur_pottery_artisan.webp',
    award: 'National Shilp Guru Awardee',
    membersCount: '12 Master Artisans & 35 Apprentices',
    bankAccount: 'State Bank of India •••• 8492 (Verified NEFT/UPI)',
    establishedYear: '1974',
    initialGross: 482600,
    initialPayout: 337820,
    pendingPayout: 28450,
    disbursedPayout: 309370,
    fulfilledUnits: 48
  },
  devki_devi: {
    id: 'devki_devi',
    name: 'Smt. Devki Devi',
    craftTradition: 'Kanchipuram Pure Silk Weaving',
    state: 'Tamil Nadu',
    district: 'Kanchipuram Hub',
    giNumber: 'GI/01/TN/SILK',
    avatar: 'assets/kanchipuram_silk_artisan.webp',
    award: 'Master Craftsperson of India',
    membersCount: '28 Handloom Guild Families',
    bankAccount: 'Indian Overseas Bank •••• 1923 (Verified NEFT/UPI)',
    establishedYear: '1982',
    initialGross: 624000,
    initialPayout: 436800,
    pendingPayout: 36200,
    disbursedPayout: 400600,
    fulfilledUnits: 32
  },
  ghulam_nabi: {
    id: 'ghulam_nabi',
    name: 'Ghulam Nabi & Sons',
    craftTradition: 'Kashmir Pashmina & Walnut Wood',
    state: 'Jammu & Kashmir',
    district: 'Srinagar Valley',
    giNumber: 'GI/46/JK/PASHMINA',
    avatar: 'assets/kashmir_pashmina_artisan.webp',
    award: 'Presidential Gold Medalist Guild',
    membersCount: '40 Pashmina Spinners & Woodcarvers',
    bankAccount: 'Jammu & Kashmir Bank •••• 5510 (Verified NEFT/UPI)',
    establishedYear: '1968',
    initialGross: 785000,
    initialPayout: 549500,
    pendingPayout: 45000,
    disbursedPayout: 504500,
    fulfilledUnits: 29
  },
  sudarsan_sahoo: {
    id: 'sudarsan_sahoo',
    name: 'Sudarsan Sahoo (Padma Shri)',
    craftTradition: 'Puri Stone Carving & Pattachitra',
    state: 'Odisha',
    district: 'Puri Heritage Craft Hub',
    giNumber: 'GI/87/OD/STONE',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80',
    award: 'Padma Shri & Shilp Guru Awardee',
    membersCount: '34 Stone Sculptors & Pattachitra Chitrakars',
    bankAccount: 'Bank of India •••• 4209 (Verified NEFT/UPI)',
    establishedYear: '1977',
    initialGross: 720000,
    initialPayout: 504000,
    pendingPayout: 42000,
    disbursedPayout: 462000,
    fulfilledUnits: 36
  },
  babulal_marotia: {
    id: 'babulal_marotia',
    name: 'Babulal Marotia (Shilp Guru)',
    craftTradition: 'Banarasi Zari Handloom Brocade',
    state: 'Uttar Pradesh',
    district: 'Varanasi Weavers Corridor',
    giNumber: 'GI/99/UP/BANARASI',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    award: 'National Master Weavers Guild Leader',
    membersCount: '52 Master Handloom Families',
    bankAccount: 'Union Bank of India •••• 6631 (Verified NEFT/UPI)',
    establishedYear: '1965',
    initialGross: 940000,
    initialPayout: 658000,
    pendingPayout: 56000,
    disbursedPayout: 602000,
    fulfilledUnits: 42
  },
  dr_venkat_raman: {
    id: 'dr_venkat_raman',
    name: 'Dr. Venkat Raman',
    craftTradition: 'Mysore Rosewood Inlay & Raw Silk',
    state: 'Karnataka',
    district: 'Mysuru Artisan Colony',
    giNumber: 'GI/24/KA/ROSEWOOD',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    award: 'State Shilp Awardee & Guild Chair',
    membersCount: '19 Inlay Masters & Carvers',
    bankAccount: 'Canara Bank •••• 7712 (Verified NEFT/UPI)',
    establishedYear: '1988',
    initialGross: 560000,
    initialPayout: 392000,
    pendingPayout: 31500,
    disbursedPayout: 360500,
    fulfilledUnits: 26
  }
};

let currentGuild = GUILD_PROFILES.gopal_saini;
let guildCrafts = [];
let guildOrders = [];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  initGuildSelector();
  setupEventListeners();
  await loadGuildData();
});

function initGuildSelector() {
  const selector = document.getElementById('guild-profile-select');
  if (!selector) return;

  selector.value = currentGuild.id;
  selector.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (GUILD_PROFILES[selectedId]) {
      currentGuild = GUILD_PROFILES[selectedId];
      renderGuildHeader();
      loadGuildData();
      showToast(`🏺 Switched to ${currentGuild.name}'s Guild Portal`);
    }
  });

  renderGuildHeader();
}

function renderGuildHeader() {
  const nameEl = document.getElementById('guild-artisan-name');
  const craftEl = document.getElementById('guild-craft-name');
  const locationEl = document.getElementById('guild-location-tag');
  const giEl = document.getElementById('guild-gi-badge');
  const awardEl = document.getElementById('guild-award-tag');
  const bankEl = document.getElementById('guild-bank-display');
  const avatarEl = document.getElementById('guild-avatar-img');

  if (nameEl) nameEl.textContent = currentGuild.name;
  if (craftEl) craftEl.textContent = currentGuild.craftTradition;
  if (locationEl) locationEl.textContent = `${currentGuild.district}, ${currentGuild.state}`;
  if (giEl) giEl.textContent = currentGuild.giNumber;
  if (awardEl) awardEl.textContent = currentGuild.award;
  if (bankEl) bankEl.textContent = currentGuild.bankAccount;
  if (avatarEl) {
    avatarEl.src = currentGuild.avatar;
    avatarEl.alt = currentGuild.name;
  }
}

async function loadGuildData() {
  showLoadingStates();

  try {
    // 1. Fetch Crafts for this guild's state or craft tradition
    const productsRes = await fetch(`${API_BASE}/api/products`);
    const productsData = await productsRes.json();
    const allProducts = productsData.products || [];

    // Filter crafts relevant to current guild's state or artisan name
    guildCrafts = allProducts.filter(p => {
      const pState = (p.state || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const pArtisan = (p.artisan || '').toLowerCase();
      const targetState = currentGuild.state.toLowerCase();

      return pState.includes(targetState) || 
             pArtisan.includes(currentGuild.name.toLowerCase().split(' ')[0]) ||
             pName.includes(currentGuild.craftTradition.toLowerCase().split(' ')[0]);
    });

    if (guildCrafts.length === 0) {
      guildCrafts = getFallbackCraftsForGuild(currentGuild.id);
    }
    renderCraftsGrid(guildCrafts);

    // 2. Fetch Guild Orders & 70% Payout Stats from Backend
    let backendOrders = [];
    try {
      const statsRes = await fetch(`${API_BASE}/api/orders/artisan/stats?artisan=${encodeURIComponent(currentGuild.name)}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        backendOrders = statsData.orders || [];
      }
    } catch (e) {
      console.warn('Artisan stats endpoint notice:', e.message);
    }

    // 3. Integrate Local Orders placed during checkout
    let localOrders = [];
    try {
      localOrders = JSON.parse(localStorage.getItem('parampara_orders') || '[]');
    } catch {}

    const combinedMap = new Map();

    // Insert backend orders
    backendOrders.forEach(ord => {
      const id = String(ord._id || ord.id || '');
      if (id) combinedMap.set(id, ord);
    });

    // Merge local orders (enriching with newly placed checkouts)
    localOrders.forEach(ord => {
      const id = String(ord._id || ord.id || '');
      if (!id) return;

      const items = ord.orderItems || ord.items || [];
      const gross = Number(ord.totalPrice) || items.reduce((s, it) => s + (Number(it.price || 0) * (it.qty || 1)), 0) || 5400;
      const artisanShare = Math.round(gross * 0.70);

      const existing = combinedMap.get(id);
      if (existing) {
        if (ord.orderStatus) existing.orderStatus = ord.orderStatus;
        if (ord.awb) existing.awb = ord.awb;
      } else {
        combinedMap.set(id, {
          _id: id,
          orderNumber: id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase(),
          customerName: ord.shippingAddress ? (ord.shippingAddress.fullName || ord.shippingAddress.name) : 'Heritage Collector',
          city: ord.shippingAddress ? (ord.shippingAddress.city || 'Bengaluru') : 'Bengaluru',
          items: items.map(i => ({
            name: i.name || 'Masterpiece',
            qty: i.qty || 1,
            price: i.price,
            artisanPayout: Math.round((Number(i.price) || 0) * 0.70)
          })),
          grossAmount: gross,
          artisanPayout: artisanShare,
          orderStatus: ord.orderStatus || (ord.isPaid ? 'Handcrafted' : 'Processing'),
          isPaid: Boolean(ord.isPaid),
          awb: ord.awb || null,
          createdAt: ord.createdAt || new Date().toISOString()
        });
      }
    });

    guildOrders = Array.from(combinedMap.values());
    if (guildOrders.length === 0) {
      guildOrders = getFallbackOrders();
    }

    // Sort latest first
    guildOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Calculate aggregated metrics
    let totalGrossSales = 0;
    let totalArtisanPayout = 0;
    let pendingPayout = 0;
    let disbursedPayout = 0;
    let fulfilledCrafts = 0;

    guildOrders.forEach(ord => {
      const gross = Number(ord.grossAmount) || 0;
      const payout = Number(ord.artisanPayout) || Math.round(gross * 0.70);
      totalGrossSales += gross;
      totalArtisanPayout += payout;

      if (ord.orderStatus === 'Delivered' || (ord.isPaid && ord.orderStatus !== 'Processing')) {
        disbursedPayout += payout;
        fulfilledCrafts += (ord.items && ord.items.length) ? ord.items.reduce((s, it) => s + (it.qty || 1), 0) : 1;
      } else {
        pendingPayout += payout;
      }
    });

    renderMetrics({
      totalGrossSales: totalGrossSales || currentGuild.initialGross,
      totalArtisanPayout: totalArtisanPayout || currentGuild.initialPayout,
      pendingPayout: pendingPayout || currentGuild.pendingPayout,
      disbursedPayout: disbursedPayout || currentGuild.disbursedPayout,
      fulfilledCrafts: fulfilledCrafts || currentGuild.fulfilledUnits
    });

    renderOrdersTable(guildOrders);
  } catch (err) {
    console.warn('Using local guild fallback dataset:', err);
    guildCrafts = getFallbackCraftsForGuild(currentGuild.id);
    renderCraftsGrid(guildCrafts);
    renderMetricsFallback();
    guildOrders = getFallbackOrders();
    renderOrdersTable(guildOrders);
  }
}

function renderMetrics(metrics) {
  const grossEl = document.getElementById('metric-gross-sales');
  const payoutEl = document.getElementById('metric-artisan-payout');
  const pendingEl = document.getElementById('metric-pending-payout');
  const unitsEl = document.getElementById('metric-fulfilled-units');
  const craftsCountEl = document.getElementById('metric-active-crafts');

  const gross = metrics.totalGrossSales || currentGuild.initialGross;
  const payout = metrics.totalArtisanPayout || currentGuild.initialPayout;
  const pending = metrics.pendingPayout || currentGuild.pendingPayout;
  const units = metrics.fulfilledCrafts || currentGuild.fulfilledUnits;

  if (grossEl) grossEl.textContent = `₹${gross.toLocaleString('en-IN')}`;
  if (payoutEl) payoutEl.textContent = `₹${payout.toLocaleString('en-IN')}`;
  if (pendingEl) pendingEl.textContent = `₹${pending.toLocaleString('en-IN')}`;
  if (unitsEl) unitsEl.textContent = `${units} Units`;
  if (craftsCountEl) craftsCountEl.textContent = `${guildCrafts.length} Masterpieces`;
}

function renderMetricsFallback() {
  renderMetrics({
    totalGrossSales: currentGuild.initialGross,
    totalArtisanPayout: currentGuild.initialPayout,
    pendingPayout: currentGuild.pendingPayout,
    fulfilledCrafts: currentGuild.fulfilledUnits
  });
}

function renderCraftsGrid(crafts) {
  const container = document.getElementById('crafts-inventory-grid');
  if (!container) return;

  if (crafts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-[#8C827A]">
        <i class="fa-solid fa-box-open text-4xl mb-3 text-[var(--gold-accent)] opacity-60"></i>
        <p class="font-serif text-lg text-[#1A1715]">No craft masterpieces registered yet.</p>
        <p class="text-xs mt-1">Click "Register New Masterpiece" to add your first craft to the archive.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = crafts.map(craft => {
    const price = Number(craft.price) || 4500;
    const artisanShare = Math.round(price * 0.70);
    const stock = (craft.stockCount !== undefined) ? craft.stockCount : 8;
    const isInStock = craft.inStock !== false && stock > 0;
    const stockClass = stock > 5 ? 'stock-in' : (stock > 0 ? 'stock-low' : 'stock-out');
    const stockLabel = stock > 5 ? `${stock} In Stock` : (stock > 0 ? `Only ${stock} Left` : 'Sold Out');
    const imgUrl = craft.imageUrl || craft.image || 'assets/products/blue_pottery_vase.webp';

    return `
      <div class="craft-grid-card" id="craft-card-${craft._id || craft.id}">
        <div class="craft-img-wrapper">
          <img decoding="async" loading="lazy" src="${imgUrl}" alt="${craft.name || craft.title}" class="craft-card-img" onerror="this.onerror=null; this.src='assets/products/blue_pottery_vase.webp';"/>
          <span class="stock-tag-pill ${stockClass}">${stockLabel}</span>
          <span class="gi-tag-badge"><i class="fa-solid fa-award"></i> ${craft.giNumber || 'GI Certified'}</span>
        </div>
        
        <div class="p-4 flex flex-col flex-1">
          <div class="flex items-start justify-between gap-2 mb-1">
            <span class="text-[0.68rem] font-bold text-[#800000] uppercase tracking-wider">${craft.state || currentGuild.state} · ${craft.category || 'Craft'}</span>
            <span class="text-xs text-[#8C827A] font-mono">ID: ${(craft._id || craft.id || 'CRAFT').toString().slice(-6).toUpperCase()}</span>
          </div>

          <h3 class="font-serif font-bold text-[#1A1715] text-base leading-snug line-clamp-2 mb-2">${craft.name || craft.title}</h3>
          
          <div class="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EADBCC] mb-3">
            <div class="flex justify-between items-center text-xs text-[#6B6259] mb-1">
              <span>Collector Price:</span>
              <strong class="text-[#1A1715] font-mono">₹${price.toLocaleString('en-IN')}</strong>
            </div>
            <div class="flex justify-between items-center text-xs font-semibold text-[#800000]">
              <span class="flex items-center gap-1"><i class="fa-solid fa-hand-holding-dollar text-[var(--gold-dark)]"></i> 70% Guild Share:</span>
              <strong class="font-mono text-sm text-[var(--primary-color)]">₹${artisanShare.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <!-- Stock Stepper & In-Stock Toggle Controls -->
          <div class="mt-auto pt-2 border-t border-[#F5EFE6] flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-[#6B6259]">Stock:</span>
              <button type="button" class="stepper-btn" onclick="updateStock('${craft._id || craft.id}', -1)" title="Decrease stock">-</button>
              <span class="font-mono font-bold text-xs px-1.5" id="stock-val-${craft._id || craft.id}">${stock}</span>
              <button type="button" class="stepper-btn" onclick="updateStock('${craft._id || craft.id}', 1)" title="Increase stock">+</button>
            </div>

            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer" title="Toggle active status">
                <input type="checkbox" ${isInStock ? 'checked' : ''} onchange="toggleInStock('${craft._id || craft.id}', this.checked)" class="sr-only peer">
                <div class="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
              </label>
              <button type="button" class="text-xs text-red-600 hover:text-red-800 p-1 bg-transparent border-0 cursor-pointer transition-colors" onclick="removeCraft('${craft._id || craft.id}')" title="Remove craft from catalog">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('guild-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-8 text-[#8C827A] text-xs">
          No customer orders recorded yet for this craft category.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(ord => {
    const rawId = String(ord._id || ord.id || '');
    const orderNum = ord.orderNumber || (rawId.length > 8 ? rawId.slice(-8).toUpperCase() : rawId);
    const customer = ord.customerName || 'Heritage Collector';
    const city = ord.city || 'Bengaluru';
    const gross = ord.grossAmount || 4500;
    const payout = ord.artisanPayout || Math.round(gross * 0.70);
    const status = ord.orderStatus || 'Processing';
    const awb = ord.awb || (status === 'Dispatched' || status === 'Delivered' ? `INP-2026-${orderNum}-GI` : null);
    const date = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const itemsSummary = Array.isArray(ord.items) && ord.items.length > 0
      ? ord.items.map(it => `${it.name || 'Craft'} (x${it.qty || 1})`).join(', ')
      : 'Authentic GI Masterpiece';

    const isDisbursed = status === 'Delivered' || (ord.isPaid && status !== 'Processing');
    const escrowBadge = isDisbursed
      ? '<span class="inline-block text-[0.65rem] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200"><i class="fa-solid fa-check"></i> 70% Disbursed</span>'
      : '<span class="inline-block text-[0.65rem] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-200"><i class="fa-solid fa-hourglass-half"></i> 70% In Escrow</span>';

    return `
      <tr id="order-row-${rawId}">
        <td>
          <div class="font-mono font-bold text-xs text-[#800000]">#${orderNum}</div>
          ${awb ? `
            <div class="text-[0.68rem] font-mono text-[#6B6259] bg-[#FAF7F2] border border-[#EADBCC] px-1 py-0.5 rounded mt-1 inline-flex items-center gap-1" title="India Post SpeedPost AWB">
              <i class="fa-solid fa-truck-fast text-[var(--gold-dark)]"></i> ${awb}
            </div>
          ` : ''}
        </td>
        <td>
          <div class="font-semibold text-sm text-[#1A1715]">${customer}</div>
          <div class="text-[0.72rem] text-[#8C827A]"><i class="fa-solid fa-location-dot"></i> ${city} · ${date}</div>
          <div class="text-[0.70rem] text-[#6B6259] truncate max-w-xs mt-0.5" title="${itemsSummary}">${itemsSummary}</div>
        </td>
        <td>
          <div class="text-xs font-mono font-bold text-[#1A1715]">₹${gross.toLocaleString('en-IN')}</div>
          <div class="text-[0.72rem] text-[#6B6259]">Total Order Gross</div>
        </td>
        <td>
          <div class="text-sm font-mono font-bold text-[var(--primary-color)]">₹${payout.toLocaleString('en-IN')}</div>
          ${escrowBadge}
        </td>
        <td>
          <select class="workflow-select" onchange="updateOrderStatus('${rawId}', this.value)" style="min-width: 200px;">
            <option value="Processing" ${status === 'Processing' ? 'selected' : ''}>⏳ Order Confirmed &amp; In Queue</option>
            <option value="Crafting" ${status === 'Crafting' ? 'selected' : ''}>🛠️ Crafting on Loom/Wheel</option>
            <option value="Handcrafted" ${status === 'Handcrafted' ? 'selected' : ''}>✨ Handcrafted &amp; Packed</option>
            <option value="Inspected" ${status === 'Inspected' ? 'selected' : ''}>🎖️ GI Inspected &amp; Certified</option>
            <option value="Dispatched" ${status === 'Dispatched' ? 'selected' : ''}>🚚 Dispatched to Courier</option>
            <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>✅ Delivered to Collector</option>
          </select>
        </td>
        <td class="text-right">
          <div class="flex flex-col items-end gap-1">
            <a href="${API_BASE}/api/orders/${rawId}/invoice-pdf" target="_blank" class="text-xs text-[#800000] hover:text-[var(--primary-dark)] underline font-medium inline-flex items-center gap-1">
              <i class="fa-solid fa-file-pdf"></i> GI Certificate
            </a>
            <a href="profile.html#orders" class="text-[0.70rem] text-[#B8860B] hover:underline inline-flex items-center gap-1 font-semibold">
              <i class="fa-solid fa-compass"></i> Collector View
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Actions & Handlers ───

window.updateStock = async function(craftId, change) {
  const craft = guildCrafts.find(c => (c._id || c.id) === craftId);
  if (!craft) return;

  const currentCount = (craft.stockCount !== undefined) ? craft.stockCount : 8;
  const newCount = Math.max(0, currentCount + change);
  craft.stockCount = newCount;
  craft.inStock = newCount > 0;

  const stockEl = document.getElementById(`stock-val-${craftId}`);
  if (stockEl) stockEl.textContent = newCount;

  try {
    await fetch(`${API_BASE}/api/products/${craftId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockCount: newCount, inStock: craft.inStock })
    });
    showToast(`✓ Stock count updated to ${newCount}`);
    renderCraftsGrid(guildCrafts);
  } catch (e) {
    showToast(`✓ Stock count updated to ${newCount} (Local mode)`);
  }
};

window.toggleInStock = async function(craftId, isChecked) {
  const craft = guildCrafts.find(c => (c._id || c.id) === craftId);
  if (!craft) return;

  craft.inStock = isChecked;
  try {
    await fetch(`${API_BASE}/api/products/${craftId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: isChecked })
    });
    showToast(isChecked ? '✓ Craft marked In Stock' : '⚠️ Craft marked Out of Stock');
  } catch (e) {
    showToast(isChecked ? '✓ In Stock (Saved locally)' : '⚠️ Out of Stock');
  }
};

window.removeCraft = async function(craftId) {
  if (!confirm('Are you sure you want to remove this masterpiece from the archive?')) return;

  guildCrafts = guildCrafts.filter(c => (c._id || c.id) !== craftId);
  renderCraftsGrid(guildCrafts);

  try {
    await fetch(`${API_BASE}/api/products/${craftId}`, { method: 'DELETE' });
    showToast('✓ Masterpiece removed from catalog.');
  } catch (e) {
    showToast('✓ Removed (Local mode)');
  }
};

window.updateOrderStatus = async function(orderId, newStatus) {
  let awb = null;
  const shortId = orderId.length > 8 ? orderId.slice(-8).toUpperCase() : orderId.toUpperCase();

  if (newStatus === 'Dispatched') {
    const defaultAwb = `INP-2026-${shortId}-GI`;
    const promptInput = prompt('Enter India Post SpeedPost AWB Tracking Number:', defaultAwb);
    awb = (promptInput && promptInput.trim()) ? promptInput.trim() : defaultAwb;
  }

  // 1. Update remote API
  try {
    const payload = { status: newStatus };
    if (awb) payload.awb = awb;

    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.warn('Status API returned HTTP status:', res.status);
    }
  } catch (e) {
    console.warn('Order status API update notice:', e.message);
  }

  // 2. Synchronize local storage order cache
  try {
    const storedOrders = JSON.parse(localStorage.getItem('parampara_orders') || '[]');
    let found = false;
    storedOrders.forEach(ord => {
      if ((ord._id && ord._id === orderId) || (ord.id && ord.id === orderId)) {
        ord.orderStatus = newStatus;
        if (awb) ord.awb = awb;
        found = true;
      }
    });
    if (found) {
      localStorage.setItem('parampara_orders', JSON.stringify(storedOrders));
    }
  } catch (lsErr) {
    console.warn('Local storage order update notice:', lsErr.message);
  }

  // 3. Update in-memory guildOrders
  const target = guildOrders.find(o => (o._id || o.id) === orderId);
  if (target) {
    target.orderStatus = newStatus;
    if (awb) target.awb = awb;
  }

  // 4. Dispatch event for live cross-tab and profile sync
  try {
    window.dispatchEvent(new CustomEvent('order-status-updated', {
      detail: { orderId, status: newStatus, awb }
    }));
  } catch {}

  // 5. Re-render table and metrics
  renderOrdersTable(guildOrders);

  let gross = 0;
  let payout = 0;
  let pending = 0;
  let disbursed = 0;
  let fulfilled = 0;
  guildOrders.forEach(ord => {
    const g = Number(ord.grossAmount) || 0;
    const p = Number(ord.artisanPayout) || Math.round(g * 0.70);
    gross += g;
    payout += p;
    if (ord.orderStatus === 'Delivered' || (ord.isPaid && ord.orderStatus !== 'Processing')) {
      disbursed += p;
      fulfilled += 1;
    } else {
      pending += p;
    }
  });

  renderMetrics({
    totalGrossSales: gross || currentGuild.initialGross,
    totalArtisanPayout: payout || currentGuild.initialPayout,
    pendingPayout: pending || currentGuild.pendingPayout,
    disbursedPayout: disbursed || currentGuild.disbursedPayout,
    fulfilledCrafts: fulfilled || currentGuild.fulfilledUnits
  });

  showToast(`✓ Order #${shortId} transitioned to "${newStatus}"${awb ? ` with AWB: ${awb}` : ''}`);
};

function setupEventListeners() {
  // Modal Open & Close
  const openModalBtn = document.getElementById('open-add-craft-modal');
  const closeModalBtn = document.getElementById('close-add-craft-modal');
  const modal = document.getElementById('add-craft-modal');
  const form = document.getElementById('add-craft-form');
  const priceInput = document.getElementById('new-craft-price');
  const payoutDisplay = document.getElementById('calculated-payout-display');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.getElementById('new-craft-name')?.focus();
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // Live 70% Payout Calculator in Modal
  if (priceInput && payoutDisplay) {
    priceInput.addEventListener('input', () => {
      const priceVal = Number(priceInput.value) || 0;
      const share = Math.round(priceVal * 0.70);
      payoutDisplay.textContent = `₹${share.toLocaleString('en-IN')}`;
    });
  }

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-craft-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering in Archive...';
      }

      const name = document.getElementById('new-craft-name').value.trim();
      const state = document.getElementById('new-craft-state').value;
      const category = document.getElementById('new-craft-category').value;
      const price = Number(document.getElementById('new-craft-price').value) || 4500;
      const stockCount = Number(document.getElementById('new-craft-stock').value) || 10;
      const giNumber = document.getElementById('new-craft-gi').value.trim() || currentGuild.giNumber;
      const description = document.getElementById('new-craft-desc').value.trim();
      const imageUrl = document.getElementById('new-craft-img').value.trim() || 'assets/products/blue_pottery_vase.webp';

      const payload = {
        name,
        state,
        category,
        price,
        stockCount,
        giNumber,
        description,
        imageUrl,
        artisan: currentGuild.name,
        giTagged: true,
        inStock: true
      };

      try {
        const res = await fetch(`${API_BASE}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        const newProduct = data.product || { ...payload, _id: 'craft-' + Date.now() };

        guildCrafts.unshift(newProduct);
        renderCraftsGrid(guildCrafts);
        modal?.classList.remove('active');
        form.reset();
        if (payoutDisplay) payoutDisplay.textContent = '₹0';
        showToast(`🎉 "${name}" certified and listed in Parampara Archive!`);
      } catch (err) {
        const fallbackProduct = { ...payload, _id: 'craft-' + Date.now() };
        guildCrafts.unshift(fallbackProduct);
        renderCraftsGrid(guildCrafts);
        modal?.classList.remove('active');
        form.reset();
        showToast(`🎉 "${name}" certified and listed! (Local Mode)`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Submit &amp; Verify Masterpiece';
        }
      }
    });
  }
}

function showLoadingStates() {
  const container = document.getElementById('crafts-inventory-grid');
  if (container) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-[#8C827A]">
        <div class="inline-block w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="font-serif text-sm">Accessing GI Registry &amp; Inventory Archive...</p>
      </div>
    `;
  }
}

function showToast(msg) {
  let toast = document.getElementById('dashboard-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dashboard-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #1A1715;
      color: #D4AF37;
      border: 1px solid #D4AF37;
      padding: 0.8rem 1.6rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}

// ─── Default Fallback Datasets ───
function getFallbackCraftsForGuild(guildId) {
  if (guildId === 'devki_devi') {
    return [
      {
        _id: 'tn-silk-1',
        name: 'Mayilkan Peacock Motif Kanchipuram Silk Saree',
        state: 'Tamil Nadu',
        category: 'Textiles',
        price: 32000,
        stockCount: 6,
        giNumber: 'GI/01/TN/SILK',
        imageUrl: 'assets/products/banarasi_saree.webp',
        inStock: true
      },
      {
        _id: 'tn-silk-2',
        name: 'Temple Border Korvai Bridal Silk Masterpiece',
        state: 'Tamil Nadu',
        category: 'Textiles',
        price: 45000,
        stockCount: 4,
        giNumber: 'GI/01/TN/SILK',
        imageUrl: 'assets/products/banarasi_saree.webp',
        inStock: true
      }
    ];
  } else if (guildId === 'ghulam_nabi') {
    return [
      {
        _id: 'jk-pash-1',
        name: 'Imperial Sozni Hand-Embroidered Pashmina Shawl',
        state: 'Jammu & Kashmir',
        category: 'Textiles',
        price: 28500,
        stockCount: 7,
        giNumber: 'GI/46/JK/PASHMINA',
        imageUrl: 'assets/products/banarasi_saree.webp',
        inStock: true
      },
      {
        _id: 'jk-wood-1',
        name: 'Kashmiri Carved Walnut Wood Jewelry Casket',
        state: 'Jammu & Kashmir',
        category: 'Woodcraft',
        price: 14200,
        stockCount: 9,
        giNumber: 'GI/182/JK/WOOD',
        imageUrl: 'assets/products/blue_pottery_vase.webp',
        inStock: true
      }
    ];
  } else if (guildId === 'sudarsan_sahoo') {
    return [
      {
        _id: 'od-stone-1',
        name: 'Hand-Carved Chlorite Stone Konark Sun Temple Wheel',
        state: 'Odisha',
        category: 'Stonecraft',
        price: 18500,
        stockCount: 5,
        giNumber: 'GI/87/OD/STONE',
        imageUrl: 'assets/products/blue_pottery_vase.webp',
        inStock: true
      },
      {
        _id: 'od-patta-1',
        name: 'Raghurajpur Palm Leaf Pattachitra Gita Govinda Scroll',
        state: 'Odisha',
        category: 'Paintings',
        price: 12800,
        stockCount: 8,
        giNumber: 'GI/86/OD/PATTACHITRA',
        imageUrl: 'assets/products/banarasi_saree.webp',
        inStock: true
      }
    ];
  } else if (guildId === 'babulal_marotia') {
    return [
      {
        _id: 'up-ban-1',
        name: 'Shikargah Royal Hunting Motif Pure Katan Silk Saree',
        state: 'Uttar Pradesh',
        category: 'Textiles',
        price: 48000,
        stockCount: 4,
        giNumber: 'GI/99/UP/BANARASI',
        imageUrl: 'assets/products/banarasi_saree.webp',
        inStock: true
      },
      {
        _id: 'up-ban-2',
        name: 'Jangla Floral Antique Gold Zari Brocade Dupatta',
        state: 'Uttar Pradesh',
        category: 'Textiles',
        price: 22000,
        stockCount: 7,
        giNumber: 'GI/99/UP/BANARASI',
        imageUrl: 'assets/products/banarasi_saree.webp',
        inStock: true
      }
    ];
  } else if (guildId === 'dr_venkat_raman') {
    return [
      {
        _id: 'ka-rose-1',
        name: 'Mysore Rosewood Floral Marquetry Elephant Keepsake Chest',
        state: 'Karnataka',
        category: 'Woodcraft',
        price: 16500,
        stockCount: 6,
        giNumber: 'GI/24/KA/ROSEWOOD',
        imageUrl: 'assets/products/blue_pottery_vase.webp',
        inStock: true
      },
      {
        _id: 'ka-silk-1',
        name: 'Pure Mulberry KSIC Mysore Silk Gold Zari Saree',
        state: 'Karnataka',
        category: 'Textiles',
        price: 26500,
        stockCount: 8,
        giNumber: 'GI/25/KA/SILK',
        imageUrl: 'assets/products/banarasi_saree.webp',
        inStock: true
      }
    ];
  }

  // Default: Gopal Saini (Jaipur Blue Pottery)
  return [
    {
      _id: 'raj-pot-1',
      name: 'Cobalt Persian Floral Glaze Blue Pottery Urn',
      state: 'Rajasthan',
      category: 'Pottery',
      price: 5400,
      stockCount: 12,
      giNumber: 'GI/42/RAJ/POTTERY',
      imageUrl: 'assets/products/blue_pottery_vase.webp',
      inStock: true
    },
    {
      _id: 'raj-pot-2',
      name: 'Geometric Quartz Medallion Decorative Platter',
      state: 'Rajasthan',
      category: 'Pottery',
      price: 3800,
      stockCount: 8,
      giNumber: 'GI/42/RAJ/POTTERY',
      imageUrl: 'assets/products/blue_pottery_vase.webp',
      inStock: true
    },
    {
      _id: 'raj-pot-3',
      name: 'Turquoise Miniature Floral Tea Service (6 Pcs)',
      state: 'Rajasthan',
      category: 'Pottery',
      price: 8900,
      stockCount: 5,
      giNumber: 'GI/42/RAJ/POTTERY',
      imageUrl: 'assets/products/blue_pottery_vase.webp',
      inStock: true
    }
  ];
}

function getFallbackOrders() {
  return [
    {
      _id: 'ORD-84921',
      orderNumber: '84921',
      customerName: 'Arjun Sharma',
      city: 'Bengaluru',
      grossAmount: 5400,
      artisanPayout: 3780,
      orderStatus: 'Handcrafted',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      _id: 'ORD-84918',
      orderNumber: '84918',
      customerName: 'Dr. Meera Nambiar',
      city: 'Kochi',
      grossAmount: 8900,
      artisanPayout: 6230,
      orderStatus: 'Dispatched',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      _id: 'ORD-84890',
      orderNumber: '84890',
      customerName: 'Vikramaditya Roy',
      city: 'Kolkata',
      grossAmount: 3800,
      artisanPayout: 2660,
      orderStatus: 'Delivered',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ];
}
