/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   Parampara Mitra — Floating Chat Widget             ║
 * ║   Version: 1.0                                       ║
 * ╠══════════════════════════════════════════════════════╣
 * ║  HOW TO INTEGRATE:                                   ║
 * ║                                                      ║
 * ║  1. Copy widget.js and widget.css to your project.   ║
 * ║  2. Add these 2 lines before </body> on any page:    ║
 * ║                                                      ║
 * ║     <link rel="stylesheet" href="widget.css" />      ║
 * ║     <script src="widget.js" defer></script>          ║
 * ║                                                      ║
 * ║  3. Set PARAMPARA_API below to your server URL.      ║
 * ╚══════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  // ── ⚙️  CONFIG — Change these to match your setup ──────────────────────────
  var CONFIG = {
    // Your backend chat API endpoint
    apiUrl: window.PARAMPARA_API || '/api/chat',

    // Bot display info
    botName:    'Parampara Mitra',
    botSubtitle: 'Always here to help you shop',
    botAvatar:  '<img src="favicon.png" alt="Parampara" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'🪔\';" />',

    // Welcome message shown when widget opens
    welcomeMsg: 'Hello! I am the Parampara AI Shopping Assistant. How can I help you find authentic Indian heritage crafts today?',

    // Input placeholder
    placeholder: 'Ask about products, prices…',

    // Quick suggestion buttons (set to [] to hide)
    suggestions: [
      { label: 'Karnataka products',  query: 'What products are famous in Karnataka?' },
      { label: 'Banarasi Silk',       query: 'Tell me about Banarasi Silk Saree' },
      { label: 'Darjeeling Tea',      query: 'Tell me about Darjeeling Tea' },
      { label: 'How to buy?',         query: 'How to buy products on Parampara Mitra?' }
    ]
  };
  // ────────────────────────────────────────────────────────────────────────────

  var chatHistory = [];
  var isWaiting   = false;
  var isOpen      = false;
  var welcomed    = false;

  // ── Inject HTML ──────────────────────────────────────────────────────────────
  function injectHTML() {
    var suggHTML = CONFIG.suggestions.map(function (s) {
      return '<button class="pm-sugg" data-q="' + escHtml(s.query) + '">' + escHtml(s.label) + '</button>';
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
          <button class="pm-xbtn" id="pm-xbtn" aria-label="Close">&#x2715;</button>\
        </div>\
        <div class="pm-messages" id="pm-messages" aria-live="polite"></div>\
        <div class="pm-sugg-bar" id="pm-sugg-bar">' + suggHTML + '</div>\
        <form class="pm-form" id="pm-form">\
          <input id="pm-input" type="text" maxlength="500" placeholder="' + escHtml(CONFIG.placeholder) + '" autocomplete="off" />\
          <button type="submit" id="pm-send" aria-label="Send">\
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\
              <line x1="22" y1="2" x2="11" y2="13"/>\
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>\
            </svg>\
          </button>\
        </form>\
      </div>\
      <button class="pm-launcher" id="pm-fab" aria-label="Open chat">\
        <span class="pm-launcher-icon">🪔</span>\
        <span class="pm-launcher-close">&#x2715;</span>\
        <span class="pm-badge">1</span>\
      </button>';

    var wrap = document.createElement('div');
    wrap.id = 'pm-root';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
  }

  // ── Markdown renderer (bold, italic, newlines) ────────────────────────────────
  function md(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Bubble helpers ────────────────────────────────────────────────────────────
  function addBubble(role, text) {
    var box = document.getElementById('pm-messages');
    var row = document.createElement('div');
    row.className = 'pm-row pm-' + role;
    var bub = document.createElement('div');
    bub.className = 'pm-bub pm-bub-' + role;
    bub.innerHTML = md(text);
    row.appendChild(bub);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function showTyping() {
    var box = document.getElementById('pm-messages');
    var row = document.createElement('div');
    row.id = 'pm-typing'; row.className = 'pm-row pm-assistant';
    row.innerHTML = '<div class="pm-bub pm-bub-assistant"><div class="pm-dots"><span></span><span></span><span></span></div></div>';
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function hideTyping() { var e = document.getElementById('pm-typing'); if (e) e.remove(); }

  function setWaiting(v) {
    isWaiting = v;
    var inp = document.getElementById('pm-input');
    var btn = document.getElementById('pm-send');
    if (inp) inp.disabled = v;
    if (btn) btn.disabled = v;
    if (!v && inp) inp.focus();
  }

  // ── Open / close ──────────────────────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    var win = document.getElementById('pm-window');
    var fab = document.getElementById('pm-fab');
    var badg = fab.querySelector('.pm-badge');
    win.classList.add('pm-open');
    win.setAttribute('aria-hidden','false');
    fab.classList.add('pm-active');
    if (badg) badg.style.display = 'none';
    if (!welcomed) { welcomed = true; addBubble('assistant', CONFIG.welcomeMsg); }
    setTimeout(function(){ var inp = document.getElementById('pm-input'); if(inp) inp.focus(); }, 280);
  }

  function closeChat() {
    isOpen = false;
    var win = document.getElementById('pm-window');
    var fab = document.getElementById('pm-fab');
    win.classList.remove('pm-open');
    win.setAttribute('aria-hidden','true');
    fab.classList.remove('pm-active');
  }

  // ── API call ──────────────────────────────────────────────────────────────────
  function askBot(message, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      try {
        var d = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) callback(null, d.reply);
        else callback(d.error || 'Server error');
      } catch(e) { callback('Parse error'); }
    };
    xhr.onerror = function () { callback('Network error. Please check the connection.'); };
    xhr.send(JSON.stringify({ message: message, history: chatHistory }));
  }

  // ── Send message ──────────────────────────────────────────────────────────────
  function send(text) {
    text = text.trim();
    if (!text || isWaiting) return;

    var sugg = document.getElementById('pm-sugg-bar');
    if (sugg) sugg.style.display = 'none';

    var inp = document.getElementById('pm-input');
    if (inp) inp.value = '';

    addBubble('user', text);
    chatHistory.push({ role: 'user', content: text });

    setWaiting(true);
    showTyping();

    askBot(text, function (err, reply) {
      hideTyping();
      if (err) {
        addBubble('assistant', "I'm sorry, I encountered an error while trying to help you. Please try again.");
      } else {
        addBubble('assistant', reply);
        chatHistory.push({ role: 'assistant', content: reply });
      }
      setWaiting(false);
    });
  }

  // ── Event wiring ──────────────────────────────────────────────────────────────
  function wire() {
    document.getElementById('pm-fab').onclick   = function () { isOpen ? closeChat() : openChat(); };
    document.getElementById('pm-xbtn').onclick  = closeChat;
    document.getElementById('pm-form').onsubmit = function (e) { e.preventDefault(); send(document.getElementById('pm-input').value); };

    var sugbs = document.querySelectorAll('.pm-sugg');
    for (var i = 0; i < sugbs.length; i++) {
      (function(b){ b.onclick = function(){ send(b.dataset.q); }; })(sugbs[i]);
    }

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closeChat(); });
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() { injectHTML(); wire(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
