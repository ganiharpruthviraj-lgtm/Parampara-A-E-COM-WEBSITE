/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║   Parampara Mitra — AI Shopping Concierge Widget (Version 3.0)     ║
 * ║   Production E-Commerce Grade Hybrid AI Shopping Assistant         ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║  Key Capabilities:                                                 ║
 * ║  • Live Cart Awareness (Inspects bag, item totals, direct checkout)║
 * ║  • Rich Visual Product Cards (Photo thumbnails, GI tags, pricing)  ║
 * ║  • Smart Budget Filters (Parses under ₹X, luxury, price sorts)     ║
 * ║  • Cross-Page Session Persistence (Maintains history & open state) ║
 * ║  • Vernacular & Hinglish Query Understanding                       ║
 * ║  • Viewport Preserving Auto-Scroll                                 ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  // ── ⚙️ CONFIGURATION ─────────────────────────────────────────────────────────
  var CONFIG = {
    apiUrl: window.PARAMPARA_API || '/api/chat',
    botName: 'Parampara Mitra',
    botSubtitle: 'AI Heritage Shopping Concierge',
    botAvatar: '<img src="favicon.png" alt="Parampara" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'🪔\';" />',
    welcomeMsg: 'Namaste! I am **Parampara Mitra**, your AI Shopping Concierge for authentic Indian heritage handicrafts.\n\nI can help you explore verified GI-certified masterpieces, find gifts by budget, inspect your current shopping bag, or guide you through artisan provenance. How may I assist you today?',
    placeholder: 'Ask about crafts, budget, your bag…',
    defaultSuggestions: [
      { label: 'Karnataka crafts', query: 'What products are famous in Karnataka?' },
      { label: 'Crafts under ₹3,000', query: 'Show me crafts under ₹3,000' },
      { label: 'What is in my bag?', query: 'What is in my bag?' },
      { label: 'Return Policy', query: 'What is the return policy?' }
    ]
  };

  var chatHistory = [];
  var isWaiting   = false;
  var isOpen      = false;

  // ── Helper: Live Cart Getter ─────────────────────────────────────────────────
  function getLiveCart() {
    try {
      var c = JSON.parse(localStorage.getItem('parampara_cart') || '[]');
      return Array.isArray(c) ? c : [];
    } catch (e) {
      return [];
    }
  }

  // ── Session Storage Persistence ──────────────────────────────────────────────
  function saveSessionState(currentSuggestions) {
    try {
      sessionStorage.setItem('pm_chat_history', JSON.stringify(chatHistory));
      sessionStorage.setItem('pm_chat_open', isOpen ? 'true' : 'false');
      if (currentSuggestions && currentSuggestions.length) {
        sessionStorage.setItem('pm_chat_suggestions', JSON.stringify(currentSuggestions));
      }
    } catch (e) {}
  }

  function loadSessionState() {
    try {
      var savedHist = sessionStorage.getItem('pm_chat_history');
      if (savedHist) {
        chatHistory = JSON.parse(savedHist);
      }
      var savedOpen = sessionStorage.getItem('pm_chat_open');
      isOpen = (savedOpen === 'true');
      var savedSugg = sessionStorage.getItem('pm_chat_suggestions');
      if (savedSugg) {
        return JSON.parse(savedSugg);
      }
    } catch (e) {}
    return null;
  }

  function clearSessionState() {
    try {
      sessionStorage.removeItem('pm_chat_history');
      sessionStorage.removeItem('pm_chat_suggestions');
    } catch (e) {}
    chatHistory = [];
    var box = document.getElementById('pm-messages');
    if (box) box.innerHTML = '';
    addBubble('assistant', CONFIG.welcomeMsg, false);
    updateSuggestions(CONFIG.defaultSuggestions);
    saveSessionState(CONFIG.defaultSuggestions);
  }

  // ── Inject Widget HTML ───────────────────────────────────────────────────────
  function injectHTML() {
    var initialSugg = loadSessionState() || CONFIG.defaultSuggestions;
    var suggHTML = initialSugg.map(function (s) {
      var label = typeof s === 'string' ? s : s.label;
      var query = typeof s === 'string' ? s : s.query;
      return '<button type="button" class="pm-sugg" data-q="' + escHtml(query) + '">' + escHtml(label) + '</button>';
    }).join('');

    var html = '\
      <div id="pm-window" class="pm-window" role="dialog" aria-label="Chat with Parampara Mitra" aria-hidden="true">\
        <div class="pm-header">\
          <div class="pm-header-left">\
            <div class="pm-hav">' + CONFIG.botAvatar + '</div>\
            <div>\
              <div class="pm-hname">' + escHtml(CONFIG.botName) + '</div>\
              <div class="pm-hsub">' + escHtml(CONFIG.botSubtitle) + '</div>\
            </div>\
          </div>\
          <div class="pm-header-actions">\
            <button type="button" class="pm-head-btn" id="pm-reset-btn" title="Reset Conversation" aria-label="Reset Conversation">🔄</button>\
            <button type="button" class="pm-xbtn" id="pm-xbtn" title="Close" aria-label="Close">&#x2715;</button>\
          </div>\
        </div>\
        <div class="pm-messages" id="pm-messages" aria-live="polite"></div>\
        <div class="pm-sugg-bar" id="pm-sugg-bar">' + suggHTML + '</div>\
        <form class="pm-form" id="pm-form">\
          <input id="pm-input" type="text" maxlength="500" placeholder="' + escHtml(CONFIG.placeholder) + '" autocomplete="off" />\
          <button type="button" class="pm-mic-btn" id="pm-mic-btn" title="Speak to Parampara Mitra in English or Hindi" aria-label="Voice input">\
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>\
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>\
              <line x1="12" y1="19" x2="12" y2="23"/>\
              <line x1="8" y1="23" x2="16" y2="23"/>\
            </svg>\
          </button>\
          <button type="submit" id="pm-send" aria-label="Send">\
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\
              <line x1="22" y1="2" x2="11" y2="13"/>\
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>\
            </svg>\
          </button>\
        </form>\
      </div>\
      <button class="pm-launcher" id="pm-fab" aria-label="Open chat with Parampara Mitra">\
        <span class="pm-launcher-icon">🪔</span>\
        <div class="pm-launcher-text">\
          <span class="pm-launcher-title">Mitra AI</span>\
          <span class="pm-launcher-sub">Shopping Concierge</span>\
        </div>\
        <span class="pm-launcher-close">&#x2715;</span>\
        <span class="pm-badge">1</span>\
      </button>';

    var wrap = document.createElement('div');
    wrap.id = 'pm-root';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);

    // Restore previous conversation if available, or show welcome
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(function (msg) {
        addBubble(msg.role, msg.content, false);
      });
    } else {
      addBubble('assistant', CONFIG.welcomeMsg, false);
    }

    if (isOpen) {
      openChat(false);
    }
  }

  // ── Rich Markdown, Product Card & Bag Action Formatter ───────────────────────
  function md(text) {
    if (!text) return '';
    var safe = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Markdown links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="pm-link" target="_blank" rel="noopener noreferrer">$1</a>')
      // Rich Visual Product Cards: [action:product-card|ID|NAME|PRICE|STATE|CRAFT|ARTISAN|GI|IMG|URL]
      .replace(/\[action:product-card\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g, function (match, id, name, price, state, craft, artisan, gi, img, url) {
        var numPrice = Number(price) || 0;
        var isGi = (gi === '1');
        var statePage = (state.toLowerCase() === 'karnataka') ? 'karnataka.html' : ('state_categories.html?name=' + encodeURIComponent(state));
        return '<div class="pm-card">' +
          '<div class="pm-card-img-wrap">' +
            '<img src="' + img + '" alt="' + name + '" class="pm-card-img" loading="lazy" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80\';" />' +
            (isGi ? '<span class="pm-card-gi-badge">GI Certified ✓</span>' : '') +
          '</div>' +
          '<div class="pm-card-body">' +
            '<div class="pm-card-meta"><a href="' + statePage + '" class="pm-card-state-link" target="_blank">' + state + '</a> • ' + craft + '</div>' +
            '<a href="' + url + '" class="pm-card-title" target="_blank">' + name + '</a>' +
            '<div class="pm-card-artisan">Guild: ' + artisan + '</div>' +
            '<div class="pm-card-foot">' +
              '<div class="pm-card-price">₹' + numPrice.toLocaleString('en-IN') + '</div>' +
              '<div class="pm-card-actions">' +
                '<button type="button" class="pm-btn-add-cart" data-id="' + id + '" data-name="' + name + '" data-price="' + numPrice + '">➕ Add to Bag</button>' +
                '<a href="' + url + '" class="pm-btn-view-shop" target="_blank">View Piece</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      })
      // Automatic Add-to-Bag Action: [action:add-to-cart|ID|NAME|PRICE]
      .replace(/\[action:add-to-cart\|([^|]+)\|([^|]+)\|([^\]]+)\]/g, function (match, id, name, price) {
        var numPrice = Number(price) || 0;
        return '<div class="pm-card-added-badge">✓ <strong>' + name + '</strong> (₹' + numPrice.toLocaleString('en-IN') + ') added to your shopping bag!</div>';
      })
      // Cart Summary Actions: [action:cart-summary|TOTAL]
      .replace(/\[action:cart-summary\|([^\]]+)\]/g, function (match, total) {
        var numTotal = Number(total) || 0;
        return '<div class="pm-cart-actions">' +
          '<a href="checkout.html" class="pm-btn-checkout" target="_blank">🛒 Proceed to Checkout (₹' + numTotal.toLocaleString('en-IN') + ')</a>' +
          '<button type="button" class="pm-btn-clear-cart">🗑️ Empty Bag</button>' +
        '</div>';
      })
      // Clear Cart confirmation: [action:clear-cart]
      .replace(/\[action:clear-cart\]/g, function () {
        return '<div class="pm-cart-cleared-tag">✓ Shopping bag reset to 0 items</div>';
      })
      .replace(/\n/g, '<br>');
    return safe;
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Dynamic Contextual Suggestion Chips ──────────────────────────────────────
  function updateSuggestions(chips) {
    var suggBar = document.getElementById('pm-sugg-bar');
    if (!suggBar) return;
    if (!chips || !chips.length) {
      chips = CONFIG.defaultSuggestions;
    }
    suggBar.innerHTML = chips.map(function (s) {
      var label = typeof s === 'string' ? s : s.label;
      var query = typeof s === 'string' ? s : s.query;
      return '<button type="button" class="pm-sugg" data-q="' + escHtml(query) + '">' + escHtml(label) + '</button>';
    }).join('');
    suggBar.style.display = 'flex';

    var sugbs = suggBar.querySelectorAll('.pm-sugg');
    for (var i = 0; i < sugbs.length; i++) {
      (function (b) { b.onclick = function () { send(b.dataset.q); }; })(sugbs[i]);
    }
    saveSessionState(chips);
  }

  // ── Message Bubbles & Smart Auto-Scroll ──────────────────────────────────────
  function addBubble(role, text, shouldScroll) {
    if (typeof shouldScroll === 'undefined') shouldScroll = true;
    var box = document.getElementById('pm-messages');
    if (!box) return;
    var row = document.createElement('div');
    row.className = 'pm-row pm-' + role;
    var bub = document.createElement('div');
    bub.className = 'pm-bub pm-bub-' + role;
    bub.innerHTML = md(text);
    row.appendChild(bub);
    box.appendChild(row);

    if (shouldScroll) {
      if (role === 'assistant') {
        // Smart Viewport Scroll: Align to top of assistant message so product #1 is not pushed above fold!
        setTimeout(function () {
          box.scrollTop = row.offsetTop - 14;
        }, 50);
      } else {
        box.scrollTop = box.scrollHeight;
      }
    }
  }

  function showTyping() {
    var box = document.getElementById('pm-messages');
    if (!box) return;
    var row = document.createElement('div');
    row.id = 'pm-typing';
    row.className = 'pm-row pm-assistant';
    row.innerHTML = '<div class="pm-bub pm-bub-assistant"><div class="pm-dots"><span></span><span></span><span></span></div></div>';
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function hideTyping() {
    var e = document.getElementById('pm-typing');
    if (e) e.remove();
  }

  function setWaiting(v) {
    isWaiting = v;
    var inp = document.getElementById('pm-input');
    var btn = document.getElementById('pm-send');
    if (inp) inp.disabled = v;
    if (btn) btn.disabled = v;
    if (!v && inp) inp.focus();
  }

  // ── Open / Close Controls ────────────────────────────────────────────────────
  function openChat(focusInput) {
    if (typeof focusInput === 'undefined') focusInput = true;
    isOpen = true;
    var win = document.getElementById('pm-window');
    var fab = document.getElementById('pm-fab');
    var triggers = document.querySelectorAll('#nav-pm-trigger, #nav-pm-trigger-mobile, .pm-nav-trigger');
    if (win) {
      win.classList.add('pm-open');
      win.setAttribute('aria-hidden', 'false');
    }
    if (fab) {
      fab.classList.add('pm-active');
      var badg = fab.querySelector('.pm-badge');
      if (badg) badg.style.display = 'none';
    }
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].classList.add('pm-active');
    }
    saveSessionState();
    if (focusInput) {
      setTimeout(function () {
        var inp = document.getElementById('pm-input');
        if (inp) inp.focus();
      }, 280);
    }
  }

  function closeChat() {
    isOpen = false;
    var win = document.getElementById('pm-window');
    var fab = document.getElementById('pm-fab');
    var triggers = document.querySelectorAll('#nav-pm-trigger, #nav-pm-trigger-mobile, .pm-nav-trigger');
    if (win) {
      win.classList.remove('pm-open');
      win.setAttribute('aria-hidden', 'true');
    }
    if (fab) fab.classList.remove('pm-active');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].classList.remove('pm-active');
    }
    saveSessionState();
  }

  // ── 🌐 Multi-Tier API Endpoint Resolver ──────────────────────────────────────
  function getCandidateApiUrls() {
    if (window.PARAMPARA_API) return [window.PARAMPARA_API];
    if (window.GLOBAL_API_BASE) {
      return [
        window.GLOBAL_API_BASE + '/api/chat',
        '/api/chat'
      ];
    }
    var isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:' || 
                  window.location.hostname === '';
    if (isLocal) {
      return ['http://localhost:5000/api/chat', '/api/chat'];
    }
    return [
      'https://parampara-a-e-com-website-1.onrender.com/api/chat',
      '/api/chat'
    ];
  }

  // ── 🏛️ Embedded 28-State Heritage Knowledge Base ─────────────────────────────
  var HERITAGE_VAULT = {
    'Karnataka': [
      { name: 'Bidriware Pure Silver Inlay Heritage Surahi Vase', price: 4200, id: 'ka-bidriware-01', gi: 'GI/RS/070/2015', craft: 'Bidriware Metal Inlay', img: 'https://s7ap1.scene7.com/is/image/incredibleindia/bidriware-bidar-karnataka-craft-hero?qlt=82&ts=1726641338177' },
      { name: 'Pure Mulberry Mysore Silk Heritage Saree (Zari Border)', price: 16500, id: 'ka-mysore-silk-01', gi: 'GI/RS/007/2005', craft: 'Mysore Silk Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Channapatna Lacquered Wooden Royal Horse Figurine', price: 1850, id: 'ka-channapatna-01', gi: 'GI/RS/010/2006', craft: 'Channapatna Toys & Lacquerware', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
      { name: 'Dharwad Handloom Pure Silk Kasuti Embroidered Stole', price: 3200, id: 'ka-dharwad-01', gi: 'GI/RS/064/2008', craft: 'Kasuti Hand Embroidery', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Traditional Sandalwood Carved Peacock Trinket Box', price: 4800, id: 'ka-sandalwood-01', gi: 'GI/RS/082/2008', craft: 'Karnataka Sandalwood Carving', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' }
    ],
    'Rajasthan': [
      { name: 'Jaipur Blue Pottery Azure Floral Royal Vase', price: 3400, id: 'rj-blue-pottery-01', gi: 'GI/RS/080/2016', craft: 'Blue Pottery', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
      { name: 'Sanganeri Hand Block Printed Pure Cotton Bedcover', price: 2800, id: 'rj-sanganeri-01', gi: 'GI/RS/088/2008', craft: 'Sanganeri Block Printing', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Molela Terracotta Ritual Votive Plaque', price: 3100, id: 'rj-molela-01', gi: 'GI/RS/092/2008', craft: 'Molela Clay Art', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80' }
    ],
    'Jammu and Kashmir': [
      { name: 'Kashmir Pure Pashmina Hand-Embroidered Sozni Shawl', price: 28000, id: 'jk-pashmina-01', gi: 'GI/RS/046/2008', craft: 'Pashmina Weaving', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Kashmir Hand-Carved Walnut Wood Jewellery Box', price: 6500, id: 'jk-walnut-01', gi: 'GI/RS/050/2008', craft: 'Walnut Wood Carving', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
      { name: 'Kashmir Papier-Mache Gold Leaf Samovar Urn', price: 3800, id: 'jk-papier-01', gi: 'GI/RS/048/2008', craft: 'Papier Mache', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' }
    ],
    'Maharashtra': [
      { name: 'Paithani Handloom Pure Silk Saree with Peacock Pallu', price: 24500, id: 'mh-paithani-01', gi: 'GI/RS/030/2006', craft: 'Paithani Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Authentic Kolhapuri Handcrafted Leather Chappal', price: 2200, id: 'mh-kolhapuri-01', gi: 'GI/RS/113/2019', craft: 'Leather Craft', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
      { name: 'Warli Indigenous Tribal Ochre Painting', price: 4500, id: 'mh-warli-01', gi: 'GI/RS/342/2014', craft: 'Warli Art', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' }
    ],
    'Tamil Nadu': [
      { name: 'Kanchipuram Pure Mulberry Silk Temple Saree', price: 32000, id: 'tn-kanchi-01', gi: 'GI/RS/001/2005', craft: 'Kanchipuram Silk', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Thanjavur 22K Gold Foil Traditional Temple Painting', price: 14500, id: 'tn-tanjore-01', gi: 'GI/RS/006/2007', craft: 'Tanjore Art', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' },
      { name: 'Swamimalai Chola Bronze Hand-Cast Nataraja Statue', price: 18500, id: 'tn-bronze-01', gi: 'GI/RS/028/2007', craft: 'Bronze Casting', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' }
    ],
    'Uttar Pradesh': [
      { name: 'Banarasi Katan Silk Brocade Zari Saree', price: 26000, id: 'up-banarasi-01', gi: 'GI/RS/099/2009', craft: 'Banarasi Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Lucknowi Hand Chikankari Georgette Kurta', price: 5200, id: 'up-chikan-01', gi: 'GI/RS/119/2008', craft: 'Chikankari Embroidery', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Moradabad Hand-Engraved Brass Royal Lamp', price: 4600, id: 'up-brass-01', gi: 'GI/RS/360/2014', craft: 'Moradabad Metalcraft', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' }
    ],
    'Assam': [
      { name: 'Assam Pure Natural Golden Muga Silk Saree', price: 24500, id: 'ass-muga-01', gi: 'GI/RS/038/2007', craft: 'Muga Silk Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Assam Bell Metal Handcrafted Xorai Votive Plate', price: 3200, id: 'ass-bell-01', gi: 'GI/RS/056/2008', craft: 'Bell Metal Craft', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' }
    ],
    'Himachal Pradesh': [
      { name: 'Authentic Kullu Handwoven Woolen Shawl with Geometric Borders', price: 4800, id: 'hp-kullu-shawl-01', gi: 'GI/RS/130/2004', craft: 'Kullu Shawl Weaving', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Chamba Rumal Double-Sided Silk Embroidery Plaque', price: 5600, id: 'hp-chamba-01', gi: 'GI/RS/079/2008', craft: 'Chamba Rumal', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' }
    ],
    'West Bengal': [
      { name: 'Baluchari Handloom Silk Saree with Mythological Borders', price: 18500, id: 'wb-baluchari-01', gi: 'GI/RS/174/2011', craft: 'Baluchari Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bankura Terracotta Long-Eared Temple Horse', price: 2600, id: 'wb-bankura-01', gi: 'GI/RS/345/2018', craft: 'Bankura Terracotta', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80' }
    ],
    'Odisha': [
      { name: 'Raghurajpur Traditional Palm Leaf Pattachitra Painting', price: 5800, id: 'od-pattachitra-01', gi: 'GI/RS/086/2008', craft: 'Pattachitra Painting', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' },
      { name: 'Cuttack Pure Silver Filigree (Tarakasi) Peacock Brooch', price: 4200, id: 'od-filigree-01', gi: 'GI/RS/450/2024', craft: 'Silver Filigree', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' }
    ],
    'Gujarat': [
      { name: 'Patan Patola Pure Silk Double-Ikat Masterpiece', price: 45000, id: 'gj-patola-01', gi: 'GI/RS/232/2013', craft: 'Patan Patola Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Kutch Traditional Bandhani Tie-Dye Silk Dupatta', price: 3600, id: 'gj-bandhani-01', gi: 'GI/RS/219/2012', craft: 'Bandhani Textile', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' }
    ],
    'Kerala': [
      { name: 'Aranmula Handcrafted Metal Mirror (Kannadi)', price: 8900, id: 'kl-aranmula-01', gi: 'GI/RS/005/2005', craft: 'Metal Mirror Casting', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
      { name: 'Balaramapuram Kasavu Pure Cotton Gold Zari Saree', price: 6500, id: 'kl-kasavu-01', gi: 'GI/RS/115/2009', craft: 'Kasavu Handloom', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' }
    ],
    'Madhya Pradesh': [
      { name: 'Chanderi Handloom Pure Silk Cotton Zari Saree', price: 7500, id: 'mp-chanderi-01', gi: 'GI/RS/008/2005', craft: 'Chanderi Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bagh Traditional Hand Block Printed Textile Stole', price: 2400, id: 'mp-bagh-01', gi: 'GI/RS/098/2008', craft: 'Bagh Print', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' }
    ],
    'Bihar': [
      { name: 'Madhubani Hand-Painted Mithila Folk Art Canvas', price: 4500, id: 'br-madhubani-01', gi: 'GI/RS/075/2007', craft: 'Madhubani Painting', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' }
    ],
    'Chhattisgarh': [
      { name: 'Bastar Hand-Wrought Iron (Loha Shilp) Tribal Musician', price: 3800, id: 'cg-loha-01', gi: 'GI/RS/112/2008', craft: 'Loha Shilp (Iron Craft)', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
      { name: 'Wild Forest Kosa Tussar Silk Handloom Saree', price: 12800, id: 'cg-kosa-01', gi: 'GI/RS/395/2013', craft: 'Kosa Silk Weaving', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' }
    ]
  };

  var STATE_ALIASES = {
    'karnataka': 'Karnataka', 'bangalore': 'Karnataka', 'bengaluru': 'Karnataka', 'mysore': 'Karnataka', 'mysuru': 'Karnataka', 'bidar': 'Karnataka', 'channapatna': 'Karnataka', 'dharwad': 'Karnataka',
    'rajasthan': 'Rajasthan', 'jaipur': 'Rajasthan', 'jodhpur': 'Rajasthan', 'udaipur': 'Rajasthan', 'sanganer': 'Rajasthan',
    'kashmir': 'Jammu and Kashmir', 'jammu': 'Jammu and Kashmir', 'j&k': 'Jammu and Kashmir', 'srinagar': 'Jammu and Kashmir', 'pashmina': 'Jammu and Kashmir',
    'maharashtra': 'Maharashtra', 'mumbai': 'Maharashtra', 'pune': 'Maharashtra', 'kolhapur': 'Maharashtra', 'paithan': 'Maharashtra', 'warli': 'Maharashtra',
    'tamil nadu': 'Tamil Nadu', 'chennai': 'Tamil Nadu', 'tanjore': 'Tamil Nadu', 'thanjavur': 'Tamil Nadu', 'kanchipuram': 'Tamil Nadu',
    'uttar pradesh': 'Uttar Pradesh', 'up': 'Uttar Pradesh', 'varanasi': 'Uttar Pradesh', 'banaras': 'Uttar Pradesh', 'lucknow': 'Uttar Pradesh', 'moradabad': 'Uttar Pradesh',
    'gujarat': 'Gujarat', 'ahmedabad': 'Gujarat', 'patan': 'Gujarat', 'kutch': 'Gujarat',
    'assam': 'Assam', 'guwahati': 'Assam', 'muga': 'Assam',
    'himachal': 'Himachal Pradesh', 'himachal pradesh': 'Himachal Pradesh', 'kullu': 'Himachal Pradesh',
    'west bengal': 'West Bengal', 'bengal': 'West Bengal', 'kolkata': 'West Bengal', 'darjeeling': 'West Bengal',
    'odisha': 'Odisha', 'orissa': 'Odisha', 'puri': 'Odisha', 'cuttack': 'Odisha',
    'kerala': 'Kerala', 'kochi': 'Kerala', 'cochin': 'Kerala',
    'madhya pradesh': 'Madhya Pradesh', 'mp': 'Madhya Pradesh', 'chanderi': 'Madhya Pradesh',
    'bihar': 'Bihar', 'madhubani': 'Bihar',
    'chhattisgarh': 'Chhattisgarh', 'bastar': 'Chhattisgarh'
  };

  function clientSideHeritageEngine(message, history, liveCart) {
    var q = (message || '').toLowerCase().trim();

    // 1. Check for specific State queries
    for (var alias in STATE_ALIASES) {
      if (new RegExp('\\b' + alias + '\\b', 'i').test(q)) {
        var realState = STATE_ALIASES[alias];
        var list = HERITAGE_VAULT[realState];
        if (list && list.length) {
          var text = 'Namaste! Here are authentic GI-certified masterpieces from **' + realState + '**:\n\n';
          var suggs = [];
          list.forEach(function (c) {
            text += '• **' + c.name + '** (' + c.craft + ') — ₹' + Number(c.price).toLocaleString('en-IN') + '\n';
            text += '  [action:product-card|' + c.id + '|' + c.name + '|' + c.price + '|' + c.gi + '|' + c.img + '|' + realState + ']\n\n';
            suggs.push({ label: c.name.slice(0, 28) + '...', query: 'Tell me more about ' + c.name });
          });
          text += 'Would you like more details, or help adding one of these to your bag?';
          return { reply: text, suggestions: suggs.slice(0, 4) };
        }
      }
    }

    // 2. Check for Budget / Price queries (e.g. "under 3000", "below 5000")
    var budgetMatch = q.match(/(?:under|below|budget\s*of|less\s*than|within)\s*(?:rs\.?|₹)?\s*(\d+)/i) || q.match(/(\d+)\s*(?:budget|or\s*less)/i);
    if (budgetMatch) {
      var budget = parseInt(budgetMatch[1], 10);
      var matched = [];
      for (var st in HERITAGE_VAULT) {
        HERITAGE_VAULT[st].forEach(function (c) {
          if (c.price <= budget) {
            matched.push({ craft: c, state: st });
          }
        });
      }
      matched.sort(function (a, b) { return a.craft.price - b.craft.price; });
      if (matched.length) {
        var bText = 'Namaste! Here are verified GI-certified heritage treasures within your budget of **₹' + Number(budget).toLocaleString('en-IN') + '**:\n\n';
        var bSuggs = [];
        matched.slice(0, 4).forEach(function (m) {
          var c = m.craft;
          bText += '• **' + c.name + '** (' + m.state + ') — ₹' + Number(c.price).toLocaleString('en-IN') + '\n';
          bText += '  [action:product-card|' + c.id + '|' + c.name + '|' + c.price + '|' + c.gi + '|' + c.img + '|' + m.state + ']\n\n';
          bSuggs.push({ label: c.name.slice(0, 24) + '...', query: 'Tell me about ' + c.name });
        });
        bText += 'All orders include Free Insured Shipping and a 70% direct payout to the master artisan.';
        return { reply: bText, suggestions: bSuggs };
      }
    }

    // 3. Check for Live Cart / Bag queries
    if (/bag|cart|basket|in my bag/i.test(q)) {
      if (!liveCart || !liveCart.length) {
        return {
          reply: 'Your heritage bag is currently empty! 🏺\n\nWould you like recommendations from Karnataka, Rajasthan, Kashmir, or gifts under ₹3,000?',
          suggestions: [
            { label: 'Karnataka crafts', query: 'What products are famous in Karnataka?' },
            { label: 'Crafts under ₹3,000', query: 'Show me crafts under ₹3,000' }
          ]
        };
      }
      var total = liveCart.reduce(function (sum, item) {
        return sum + ((item.price || 0) * (item.quantity || item.qty || 1));
      }, 0);
      var artisanShare = Math.round(total * 0.70);
      var cText = 'Your heritage bag currently contains **' + liveCart.length + ' item(s)**:\n\n';
      liveCart.forEach(function (i) {
        cText += '• **' + (i.name || 'Heritage Craft') + '** × ' + (i.quantity || i.qty || 1) + ' — ₹' + Number((i.price || 0) * (i.quantity || i.qty || 1)).toLocaleString('en-IN') + '\n';
      });
      cText += '\n**Subtotal:** ₹' + Number(total).toLocaleString('en-IN') + '\n';
      cText += '🌱 **Direct Artisan Payout (70%):** ₹' + Number(artisanShare).toLocaleString('en-IN') + '\n\n';
      cText += '[action:checkout-button]';
      return {
        reply: cText,
        suggestions: [
          { label: 'Proceed to Checkout', query: 'Proceed to Checkout' },
          { label: 'Explore More Crafts', query: 'What products are famous in Karnataka?' }
        ]
      };
    }

    // 4. Return Policy & Guarantee
    if (/return|refund|exchange|guarantee|policy/i.test(q)) {
      return {
        reply: 'Every certified masterpiece on Parampara comes with a **7-Day Hassle-Free Heritage Return Guarantee**.\n\n• 100% money-back refund if you are not delighted.\n• Free reverse-pickup from your doorstep across all 28 states.\n• Simply ensure the authentic GI seal and original white-glove packaging remain intact.',
        suggestions: [
          { label: 'How is authenticity verified?', query: 'How is GI authenticity verified?' },
          { label: 'Explore Collection', query: 'What products are famous in Karnataka?' }
        ]
      };
    }

    // 5. Shipping & Delivery
    if (/shipping|delivery|dispatch|courier/i.test(q)) {
      return {
        reply: 'We offer **Free Insured White-Glove Shipping** across all 28 Indian states.\n\n• **Standard Delivery:** 5–7 business days via BlueDart Insured Handoff (FREE).\n• **Express Air Delivery:** 2–3 business days priority dispatch (₹299).\n• Every shipment is insured against transit damage with tamper-evident heritage sealing.',
        suggestions: [
          { label: 'Karnataka crafts', query: 'What products are famous in Karnataka?' },
          { label: 'What is in my bag?', query: 'What is in my bag?' }
        ]
      };
    }

    // 6. GI Authenticity & 70% Direct Payout
    if (/gi|authenticity|certified|artisan|payout|percentage/i.test(q)) {
      return {
        reply: 'Parampara is certified under the **Geographical Indications (GI) Registry of India** (GI of Goods Act, 1999).\n\n• **70% Direct Payout:** ₹70 of every ₹100 goes directly into the bank account of the registered master artisan cooperative.\n• **Tamper-Proof Certificate:** Every order includes a signed digital GI Authenticity Certificate and lineage dossier.',
        suggestions: [
          { label: 'Karnataka crafts', query: 'What products are famous in Karnataka?' },
          { label: 'Kashmir Pashmina', query: 'Tell me about Kashmir Pashmina' }
        ]
      };
    }

    // Default warm concierge response
    return {
      reply: 'Namaste! I am **Parampara Mitra**, your AI Shopping Concierge.\n\nI can help you explore certified Indian heritage crafts:\n• **Explore by State:** e.g., *"What products are famous in Karnataka?"* or *"Show crafts from Rajasthan"*\n• **Search by Budget:** e.g., *"Show me crafts under ₹3,000"*\n• **Manage Order:** e.g., *"What is in my bag?"* or *"What is your return policy?"*\n\nHow may I assist your heritage journey today?',
      suggestions: [
        { label: 'Karnataka crafts', query: 'What products are famous in Karnataka?' },
        { label: 'Crafts under ₹3,000', query: 'Show me crafts under ₹3,000' },
        { label: 'Rajasthan crafts', query: 'What products are famous in Rajasthan?' },
        { label: 'What is in my bag?', query: 'What is in my bag?' }
      ]
    };
  }

  // ── Chat API Interaction (Carries Live Cart & Multi-Endpoint Failover) ───────
  function askBot(message, callback) {
    var candidateUrls = getCandidateApiUrls();
    var payload = {
      message: message,
      history: chatHistory.slice(-8),
      cart: getLiveCart()
    };

    function tryUrl(index) {
      if (index >= candidateUrls.length) {
        try {
          var fallbackRes = clientSideHeritageEngine(message, chatHistory, getLiveCart());
          callback(null, fallbackRes.reply, fallbackRes.suggestions);
        } catch (fbErr) {
          callback(null, "Namaste! I am here to help you explore India's 28-state GI heritage crafts. Ask me about crafts from Karnataka, Rajasthan, Kashmir, or gifts under your budget!");
        }
        return;
      }

      var targetUrl = candidateUrls[index];
      var xhr = new XMLHttpRequest();
      xhr.open('POST', targetUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 4000;

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var d = JSON.parse(xhr.responseText);
            if (d && d.reply) {
              callback(null, d.reply, d.suggestions);
              return;
            }
          } catch (e) {}
        }
        tryUrl(index + 1);
      };

      xhr.onerror = function () {
        tryUrl(index + 1);
      };

      xhr.ontimeout = function () {
        tryUrl(index + 1);
      };

      try {
        xhr.send(JSON.stringify(payload));
      } catch (e) {
        tryUrl(index + 1);
      }
    }

    tryUrl(0);
  }

  // ── Send Message ─────────────────────────────────────────────────────────────
  function send(text) {
    text = (text || '').trim();
    if (!text || isWaiting) return;

    var inp = document.getElementById('pm-input');
    if (inp) inp.value = '';

    addBubble('user', text);
    chatHistory.push({ role: 'user', content: text });
    saveSessionState();

    setWaiting(true);
    showTyping();

    askBot(text, function (err, reply, suggestions) {
      hideTyping();
      if (err || !reply) {
        var fb = clientSideHeritageEngine(text, chatHistory, getLiveCart());
        reply = fb.reply;
        suggestions = fb.suggestions;
      }

      // If action is clear-cart, execute clear immediately
      if (reply.indexOf('[action:clear-cart]') !== -1) {
        try {
          localStorage.removeItem('parampara_cart');
          window.dispatchEvent(new Event('cart-updated'));
        } catch (e) {}
      }

      // If action is add-to-cart, execute add immediately
      var addMatch = reply.match(/\[action:add-to-cart\|([^|]+)\|([^|]+)\|([^\]]+)\]/);
      if (addMatch) {
        try {
          var aId = addMatch[1];
          var aName = addMatch[2];
          var aPrice = Number(addMatch[3]) || 0;
          var currentCart = getLiveCart();
          var existing = currentCart.find(function (item) {
            return item && (item.id === aId || item.name === aName);
          });
          if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
          } else {
            currentCart.push({ id: aId, name: aName, price: aPrice, quantity: 1 });
          }
          localStorage.setItem('parampara_cart', JSON.stringify(currentCart));
          window.dispatchEvent(new Event('cart-updated'));
        } catch (e) {}
      }

      addBubble('assistant', reply);
      chatHistory.push({ role: 'assistant', content: reply });
      updateSuggestions(suggestions);
      saveSessionState(suggestions);
      setWaiting(false);
    });
  }

  // ── Event Wiring & Interactive Cart Handlers ─────────────────────────────────
  function wire() {
    var fab = document.getElementById('pm-fab');
    if (fab) {
      fab.onclick = function () { isOpen ? closeChat() : openChat(); };
    }

    var xbtn = document.getElementById('pm-xbtn');
    if (xbtn) {
      xbtn.onclick = closeChat;
    }

    var resetBtn = document.getElementById('pm-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        resetBtn.style.transform = 'rotate(360deg)';
        resetBtn.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(function () {
          resetBtn.style.transform = '';
          resetBtn.style.transition = '';
        }, 450);
        clearSessionState();
      };
    }

    var form = document.getElementById('pm-form');
    var inp = document.getElementById('pm-input');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        if (inp) send(inp.value);
      };
    }
    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          send(inp.value);
        }
      });
    }

    // Speech-to-Text Microphone Integration
    var micBtn = document.getElementById('pm-mic-btn');
    if (micBtn) {
      var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        micBtn.title = "Voice recognition not supported in this browser";
        micBtn.style.opacity = '0.6';
      } else {
        var recognition = null;
        var isListening = false;

        micBtn.onclick = function (e) {
          e.preventDefault();
          if (isListening && recognition) {
            recognition.stop();
            return;
          }

          try {
            recognition = new SpeechRec();
            recognition.lang = 'en-IN';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = function () {
              isListening = true;
              micBtn.classList.add('pm-mic-listening');
              if (inp) inp.placeholder = "Listening... Speak your query";
            };

            recognition.onresult = function (event) {
              if (event.results && event.results[0] && event.results[0][0]) {
                var transcript = event.results[0][0].transcript;
                if (inp) inp.value = transcript;
                send(transcript);
              }
            };

            recognition.onerror = function (event) {
              console.warn("Speech recognition notice:", event.error);
            };

            recognition.onend = function () {
              isListening = false;
              micBtn.classList.remove('pm-mic-listening');
              if (inp) inp.placeholder = CONFIG.placeholder;
            };

            recognition.start();
          } catch (err) {
            console.warn("Speech recognition initialization:", err.message);
          }
        };
      }
    }

    // Delegated click handler
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('#nav-pm-trigger, #nav-pm-trigger-mobile, .pm-nav-trigger');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        isOpen ? closeChat() : openChat();
        return;
      }

      // Delegated click handler for suggestion pills
      var suggBtn = e.target.closest('.pm-sugg');
      if (suggBtn && suggBtn.dataset.q) {
        e.preventDefault();
        send(suggBtn.dataset.q);
        return;
      }

      // Delegated click handler for "Add to Bag" buttons inside chat
      var addBtn = e.target.closest('.pm-btn-add-cart');
      if (addBtn) {
        e.preventDefault();
        var id = addBtn.dataset.id;
        var name = addBtn.dataset.name;
        var price = Number(addBtn.dataset.price) || 0;

        var cart = getLiveCart();
        var existing = cart.find(function (item) {
          return item && (item.id === id || item.name === name);
        });

        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          cart.push({ id: id, name: name, price: price, quantity: 1 });
        }

        localStorage.setItem('parampara_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));

        addBtn.textContent = '✓ Added to Bag!';
        addBtn.classList.add('pm-btn-added');
        setTimeout(function () {
          addBtn.textContent = '➕ Add to Bag';
          addBtn.classList.remove('pm-btn-added');
        }, 2200);
        return;
      }

      // Delegated click handler for "Empty Bag" button inside chat
      var clearBtn = e.target.closest('.pm-btn-clear-cart');
      if (clearBtn) {
        e.preventDefault();
        if (confirm('Are you sure you want to empty your shopping bag?')) {
          localStorage.removeItem('parampara_cart');
          window.dispatchEvent(new Event('cart-updated'));
          clearBtn.textContent = '✓ Bag Cleared';
          clearBtn.disabled = true;
          addBubble('assistant', 'Your shopping bag is now empty. Feel free to ask for craft recommendations anytime!');
        }
        return;
      }
    });

    var sugbs = document.querySelectorAll('.pm-sugg');
    for (var i = 0; i < sugbs.length; i++) {
      (function (b) { b.onclick = function () { send(b.dataset.q); }; })(sugbs[i]);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeChat();
    });
  }

  // ── Initialization ───────────────────────────────────────────────────────────
  function init() {
    injectHTML();
    wire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
