/**
 * Parampara Saathi - Embeddable Global AI Cultural Docent & Provenance Verifier Widget
 * Automatically detects current page/product context and mounts a luxury floating assistant.
 */
(function() {
  // Prevent duplicate initialization
  if (window.ParamparaSaathiInitialized) return;
  window.ParamparaSaathiInitialized = true;

  // 1. Inject Stylesheet if not already present
  if (!document.querySelector('link[href*="saathi.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/saathi.css';
    document.head.appendChild(link);
  }

  // 2. Extract Context from Active Page
  function detectPageContext() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    const idParam = urlParams.get('id');

    let detectedCraft = 'Indian Heritage Masterpieces';
    let detectedState = stateParam || 'All India';
    let detectedArtisan = 'Master Heritage Guild';
    let detectedPrice = 14500;
    let detectedGi = 'GI Certified';

    // Page-specific detection
    if (url.includes('product-jaipur-pottery.html') || stateParam === 'Rajasthan' || idParam === 'fallback-3') {
      detectedCraft = 'Jaipur Blue Pottery';
      detectedState = 'Rajasthan';
      detectedArtisan = 'Shri Gopal Saini';
      detectedPrice = 24800;
      detectedGi = 'GI-34 (Class 21)';
    } else if (url.includes('masterpiece.html')) {
      const h1 = document.getElementById('dynamic-title') || document.querySelector('h1');
      if (h1 && h1.textContent.trim()) {
        detectedCraft = h1.textContent.replace(/\s+/g, ' ').trim();
      }
      const artisanEl = document.getElementById('artisan-name');
      if (artisanEl && artisanEl.textContent.trim() && artisanEl.textContent !== '--') {
        detectedArtisan = artisanEl.textContent.trim();
      }
    } else if (url.includes('artisans.html')) {
      detectedCraft = 'Master Artisan Lineages';
      detectedState = 'National Craft Clusters';
    } else if (url.includes('states.html')) {
      detectedCraft = '28 Regional Craft Traditions';
      detectedState = 'Pan-India';
    }

    return {
      craft: detectedCraft,
      state: detectedState,
      artisan: detectedArtisan,
      price: detectedPrice,
      gi: detectedGi
    };
  }

  // 3. Mount Widget DOM
  function mountWidget() {
    // Don't mount widget on standalone testing lab (saathi.html has full interface)
    if (window.location.pathname.endsWith('saathi.html')) return;

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'parampara-saathi-root';
    widgetContainer.innerHTML = `
      <!-- Tooltip Bubble Hint -->
      <div id="saathi-hint" class="saathi-hint-bubble" onclick="toggleSaathiDrawer()">
        <i class="fa-solid fa-sparkles text-amber-500 text-xs"></i>
        <span>Ask Saathi (AI Cultural Docent)</span>
        <button onclick="dismissSaathiHint(event)" style="background:none; border:none; color:#999; font-size:14px; margin-left:4px; cursor:pointer;">&times;</button>
      </div>

      <!-- Floating Action Button (FAB) -->
      <button id="saathi-fab" class="saathi-fab" onclick="toggleSaathiDrawer()" aria-label="Open Parampara Saathi Cultural Assistant">
        <div class="saathi-fab-halo"></div>
        <i class="fa-solid fa-sparkles text-amber-400 text-xl"></i>
      </button>

      <!-- Chat Drawer -->
      <div id="saathi-drawer" class="saathi-chat-drawer">
        <!-- Header -->
        <div class="saathi-drawer-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:28px; height:28px; border-radius:50%; background:rgba(212,175,55,0.2); border:1px solid #D4AF37; display:flex; align-items:center; justify-content:center; color:#D4AF37; font-size:12px;">
              <i class="fa-solid fa-sparkles"></i>
            </div>
            <div>
              <div class="saathi-header-title">PARAMPARA SAATHI</div>
              <div class="saathi-header-sub">AI Docent &bull; Provenance Verifier</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <a href="saathi.html" target="_blank" style="color:#C5A880; font-size:11px; text-decoration:none; padding:3px 6px; border:1px solid rgba(197,168,128,0.3); border-radius:4px;" title="Open Dedicated Testing Lab">
              <i class="fa-solid fa-up-right-from-square"></i> Full Lab
            </a>
            <button onclick="toggleSaathiDrawer()" style="background:none; border:none; color:#FAF9F6; font-size:18px; cursor:pointer; line-height:1;">&times;</button>
          </div>
        </div>

        <!-- Context Bar -->
        <div class="saathi-context-bar">
          <span style="font-weight:700; color:#A32A29; text-transform:uppercase; font-size:9px; letter-spacing:0.05em;">
            <i class="fa-solid fa-location-dot"></i> <span id="saathi-ctx-state">Detecting Context...</span>
          </span>
          <span style="color:#666; font-size:10px;" id="saathi-ctx-gi">GI Registry Grounded</span>
        </div>

        <!-- Messages Area -->
        <div id="saathi-drawer-messages" class="saathi-messages">
          <!-- Populated dynamically -->
        </div>

        <!-- Input Area -->
        <form id="saathi-drawer-form" onsubmit="handleDrawerSubmit(event)" class="saathi-input-area">
          <input type="text" id="saathi-drawer-input" placeholder="Ask about 800-yr lore, GI proof, or 70% payout..." class="saathi-input-field">
          <button type="submit" class="saathi-send-btn" title="Send Question">
            <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(widgetContainer);

    // Initial greeting after mounting
    setTimeout(initSaathiSession, 600);
  }

  // Session state
  let isDrawerOpen = false;
  let pageContext = {};

  function initSaathiSession() {
    pageContext = detectPageContext();
    const stateEl = document.getElementById('saathi-ctx-state');
    if (stateEl) stateEl.textContent = `${pageContext.state}: ${pageContext.craft}`;

    const messagesEl = document.getElementById('saathi-drawer-messages');
    if (messagesEl && messagesEl.children.length === 0) {
      const greeting = `Namaste! I am **Parampara Saathi**, your cultural docent.\n\nI am currently inspecting **${pageContext.craft}** by **${pageContext.artisan}** (${pageContext.gi}).\n\nHow may I help you explore this heritage piece?`;
      addDrawerMessage('saathi', greeting, [
        { label: '🏛️ 800-Yr History & Motifs', query: `Explain the historical lore and sacred motifs of ${pageContext.craft}` },
        { label: '🛡️ How to Spot Replicas', query: `How do I verify if this ${pageContext.craft} is genuine?` },
        { label: '📊 70% Artisan Payment', query: `Break down the 70% direct payment for ${pageContext.artisan}` }
      ]);
    }
  }

  window.toggleSaathiDrawer = function() {
    const drawer = document.getElementById('saathi-drawer');
    const hint = document.getElementById('saathi-hint');
    if (!drawer) return;

    isDrawerOpen = !isDrawerOpen;
    if (isDrawerOpen) {
      drawer.classList.add('open');
      if (hint) hint.style.display = 'none';
      setTimeout(() => {
        const input = document.getElementById('saathi-drawer-input');
        if (input) input.focus();
      }, 300);
    } else {
      drawer.classList.remove('open');
    }
  };

  window.dismissSaathiHint = function(e) {
    if (e) e.stopPropagation();
    const hint = document.getElementById('saathi-hint');
    if (hint) hint.style.display = 'none';
  };

  window.handleDrawerSubmit = async function(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('saathi-drawer-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    addDrawerMessage('user', message);

    // Call API or Fallback
    try {
      const res = await fetch(`${window.location.origin}/api/saathi/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          context: {
            state: pageContext.state,
            craft: pageContext.craft,
            artisan: pageContext.artisan,
            price: pageContext.price
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        addDrawerMessage('saathi', data.response, data.chips);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Local Grounded Fallback
      addDrawerMessage('saathi', `Under Parampara's direct fair-trade model, **70% of every purchase** is transferred directly to **${pageContext.artisan}**'s cluster account. This authentic piece is verified under **${pageContext.gi}** and requires weeks of manual craftsmanship with zero synthetic shortcuts.`);
    }
  };

  function addDrawerMessage(sender, text, chips = []) {
    const container = document.getElementById('saathi-drawer-messages');
    if (!container) return;

    const el = document.createElement('div');
    el.className = sender === 'user' ? 'saathi-msg-user' : 'saathi-msg-saathi';

    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    let chipsHtml = '';
    if (chips && chips.length > 0) {
      chipsHtml = `
        <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
          ${chips.map(c => `
            <button onclick="window.sendSaathiQuery('${(c.query || c.label).replace(/'/g, "\\'")}')" class="saathi-chip-btn">
              ${c.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    el.innerHTML = `<div>${formatted}</div>${chipsHtml}`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  window.sendSaathiQuery = function(query) {
    const input = document.getElementById('saathi-drawer-input');
    if (input) {
      input.value = query;
      window.handleDrawerSubmit();
    }
  };

  // Mount on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
})();
