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

    // If few items matched, add default masterpiece catalog for this guild
    if (guildCrafts.length === 0) {
      guildCrafts = getFallbackCraftsForGuild(currentGuild.id);
    }

    renderCraftsGrid(guildCrafts);

    // 2. Fetch Guild Orders & 70% Payout Stats
    const statsRes = await fetch(`${API_BASE}/api/orders/artisan/stats?artisan=${encodeURIComponent(currentGuild.name)}`);
    const statsData = await statsRes.json();

    if (statsData.success) {
      renderMetrics(statsData.metrics);
      guildOrders = statsData.orders || [];
      renderOrdersTable(guildOrders);
    } else {
      renderMetricsFallback();
    }
  } catch (err) {
    console.warn('Using local guild fallback dataset:', err);
    guildCrafts = getFallbackCraftsForGuild(currentGuild.id);
    renderCraftsGrid(guildCrafts);
    renderMetricsFallback();
    renderOrdersTable(getFallbackOrders());
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
    const orderNum = ord.orderNumber || (ord._id || 'ORD').slice(-6).toUpperCase();
    const customer = ord.customerName || 'Heritage Collector';
    const city = ord.city || 'Bengaluru';
    const gross = ord.grossAmount || 4500;
    const payout = ord.artisanPayout || Math.round(gross * 0.70);
    const status = ord.orderStatus || 'Handcrafted';
    const date = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <tr>
        <td class="font-mono font-bold text-xs text-[#800000]">#${orderNum}</td>
        <td>
          <div class="font-semibold text-sm text-[#1A1715]">${customer}</div>
          <div class="text-[0.72rem] text-[#8C827A]"><i class="fa-solid fa-location-dot"></i> ${city} · ${date}</div>
        </td>
        <td>
          <div class="text-xs font-mono font-bold text-[#1A1715]">₹${gross.toLocaleString('en-IN')}</div>
          <div class="text-[0.72rem] text-[#6B6259]">Total Order Gross</div>
        </td>
        <td>
          <div class="text-sm font-mono font-bold text-[var(--primary-color)]">₹${payout.toLocaleString('en-IN')}</div>
          <span class="inline-block text-[0.65rem] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-200">70% Disbursed</span>
        </td>
        <td>
          <select class="workflow-select" onchange="updateOrderStatus('${ord._id}', this.value)">
            <option value="Crafting" ${status === 'Crafting' ? 'selected' : ''}>🛠️ Crafting on Wheel/Loom</option>
            <option value="Handcrafted" ${status === 'Handcrafted' ? 'selected' : ''}>✨ Handcrafted & Packed</option>
            <option value="Inspected" ${status === 'Inspected' ? 'selected' : ''}>🎖️ GI Inspected</option>
            <option value="Dispatched" ${status === 'Dispatched' ? 'selected' : ''}>🚚 Dispatched to Courier</option>
            <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>✅ Delivered to Collector</option>
          </select>
        </td>
        <td class="text-right">
          <a href="${API_BASE}/api/orders/${ord._id}/invoice-pdf" target="_blank" class="text-xs text-[#800000] hover:text-[var(--primary-dark)] underline font-medium inline-flex items-center gap-1">
            <i class="fa-solid fa-file-pdf"></i> GI Certificate
          </a>
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
  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    showToast(`✓ Order status updated to "${newStatus}"`);
  } catch (e) {
    showToast(`✓ Status transitioned to "${newStatus}"`);
  }
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
