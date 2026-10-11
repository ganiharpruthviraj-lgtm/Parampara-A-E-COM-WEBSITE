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

  // ── Chat API Interaction (Carries Live Cart & History) ────────────────────────
  function askBot(message, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      try {
        var d = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          callback(null, d.reply, d.suggestions);
        } else {
          callback(d.error || 'Server error');
        }
      } catch (e) {
        callback('Parse error');
      }
    };
    xhr.onerror = function () {
      callback('Network error. Please check the connection.');
    };

    var payload = {
      message: message,
      history: chatHistory.slice(-8),
      cart: getLiveCart()
    };
    xhr.send(JSON.stringify(payload));
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
      if (err) {
        addBubble('assistant', "I apologize, I encountered a temporary connection issue. Please try asking again in a moment.");
      } else {
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
      }
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
