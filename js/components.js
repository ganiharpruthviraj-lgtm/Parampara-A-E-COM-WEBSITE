/**
 * Parampara — Shared Component Loader (components.js)
 * =====================================================
 * Dynamically injects the shared navigation header and footer
 * into every page that includes this script.
 *
 * Usage: Add at the very end of <body>, BEFORE nav.js & auth.js:
 *   <script src="js/components.js"></script>
 *
 * Components are pulled from the /components/ directory.
 * Active nav link highlighting happens automatically based on current path.
 */

(function () {
  const NAV_LINKS = [
    { href: 'states.html',   label: 'All States' },
    { href: 'artisans.html', label: 'Our Artisans' },
    { href: 'about.html',    label: 'About' },
    { href: 'search.html',   label: 'Shop' },
  ];

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function makeLink(href, label, extraClass = '') {
    const isActive = href === currentPage;
    return `<a href="${href}" class="text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200${isActive ? ' text-[var(--primary-color)]' : ''}${extraClass ? ' ' + extraClass : ''}">${label}</a>`;
  }

  // ─── NAV TEMPLATE ────────────────────────────────────────────────────────────
  const navHTML = /* html */`
<header class="code-section" id="global-header">
  <nav class="bg-[var(--light-background-color)] border-b border-[var(--light-border-color)] sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <a class="flex items-center" href="index.html">
          <img alt="Parampara Logo" class="h-12 w-auto" src="https://assets.ls-assets.com/uploads/f24bfd2a-136d-48fa-ae0d-f0f9f79fbe67/7e4cfe35-4b17-4f27-b5bc-6f8ea447d211.webp?w=768" loading="lazy"/>
        </a>
        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center space-x-8" id="nav-desktop-links">
          ${NAV_LINKS.map(l => makeLink(l.href, l.label)).join('\n          ')}
          <a href="search.html" class="bg-[var(--primary-color)] text-[var(--primary-button-text-color)] px-6 py-3 rounded-[var(--button-rounded-radius)] font-semibold hover:bg-[var(--primary-button-hover-bg-color)] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-sm"></i>
            Search
          </a>
          <!-- Shopping Bag Link -->
          <a href="checkout.html" class="relative text-[var(--dark-text-color)] hover:text-[var(--primary-color)] p-2.5 rounded-full hover:bg-black/5 transition-colors flex items-center justify-center" title="Shopping Bag" id="nav-cart-link">
            <i class="fa-solid fa-bag-shopping text-lg"></i>
            <span id="nav-cart-badge" class="hidden absolute -top-0.5 -right-0.5 bg-[#B8860B] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow">0</span>
          </a>
        </div>
        <!-- Mobile Menu Toggle -->
        <button class="lg:hidden p-2 rounded-md text-[var(--dark-text-color)] hover:bg-[var(--medium-background-color)] transition-colors" data-landingsite-mobile-menu-toggle="" id="mobile-menu-toggle">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>
      </div>
      <!-- Mobile Navigation -->
      <div class="hidden lg:hidden pb-6" data-landingsite-mobile-menu="" id="mobile-menu">
        <div class="flex flex-col space-y-4">
          ${NAV_LINKS.map(l => makeLink(l.href, l.label, 'py-2')).join('\n          ')}
          <a href="checkout.html" class="flex items-center justify-between text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium py-2 transition-colors">
            <span class="flex items-center gap-2">
              <i class="fa-solid fa-bag-shopping text-sm text-[#B8860B]"></i>
              Shopping Bag
            </span>
            <span id="nav-cart-badge-mobile" class="bg-[#B8860B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0</span>
          </a>
          <a href="search.html" class="bg-[var(--primary-color)] text-[var(--primary-button-text-color)] px-6 py-3 rounded-[var(--button-rounded-radius)] font-semibold text-center hover:bg-[var(--primary-button-hover-bg-color)] transition-all flex items-center justify-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-sm"></i>
            Search
          </a>
        </div>
      </div>
    </div>
  </nav>
</header>`;

  // ─── FOOTER TEMPLATE ─────────────────────────────────────────────────────────
  const footerHTML = /* html */`
<footer class="bg-[#1A1A1A] text-white py-12 text-center border-t border-white/10" id="global-footer">
  <div class="max-w-7xl mx-auto px-4">
    <a href="index.html" class="inline-block mb-6">
      <img alt="Parampara" class="h-10 w-auto mx-auto opacity-80 hover:opacity-100 transition-opacity" src="https://assets.ls-assets.com/uploads/f24bfd2a-136d-48fa-ae0d-f0f9f79fbe67/7e4cfe35-4b17-4f27-b5bc-6f8ea447d211.webp?w=768" loading="lazy"/>
    </a>
    <p class="text-gray-400 text-sm mb-4">© 2026 Parampara. Preserving India's Craft Heritage.</p>
    <div class="flex justify-center flex-wrap gap-6 text-sm text-gray-500">
      <a class="hover:text-[var(--primary-color)] transition-colors" href="about.html">About Us</a>
      <a class="hover:text-[var(--primary-color)] transition-colors" href="states.html">All States</a>
      <a class="hover:text-[var(--primary-color)] transition-colors" href="artisans.html">Our Artisans</a>
      <a class="hover:text-[var(--primary-color)] transition-colors" href="search.html">Shop</a>
      <a class="hover:text-[var(--primary-color)] transition-colors" href="saathi.html">Saathi AI</a>
    </div>
    <p class="text-gray-600 text-xs mt-6">
      <a href="http://localhost:5000/api/health" target="_blank" class="hover:text-[var(--primary-color)] transition-colors" id="footer-status">🟢 Server Status</a>
    </p>
  </div>
</footer>`;

  // ─── INJECTION ────────────────────────────────────────────────────────────────
  function inject() {
    // Inject nav: replace existing #global-header placeholder OR prepend to body
    const existingHeader = document.getElementById('global-header');
    if (existingHeader) {
      existingHeader.outerHTML = navHTML;
    } else if (!document.querySelector('header#global-header')) {
      document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // Inject footer: replace existing #global-footer OR append to body
    const existingFooter = document.getElementById('global-footer');
    if (existingFooter) {
      existingFooter.outerHTML = footerHTML;
    } else if (!document.querySelector('footer#global-footer')) {
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // Live server status badge in footer
    fetch('/api/health')
      .then(r => r.json())
      .then(d => {
        const el = document.getElementById('footer-status');
        if (!el) return;
        const icon = d.status === 'ok' ? '🟢' : '🟡';
        const db = d.database?.status === 'connected' ? ' · DB ✓' : '';
        el.textContent = `${icon} Server ${d.status}${db}`;
      })
      .catch(() => {
        const el = document.getElementById('footer-status');
        if (el) el.textContent = '🔴 Server offline';
      });

    // Synchronize Cart Badge
    function updateCartBadge() {
      try {
        const cart = JSON.parse(localStorage.getItem('parampara_cart') || '[]');
        const count = Array.isArray(cart) ? cart.length : (cart ? 1 : 0);
        
        const badgeDesktop = document.getElementById('nav-cart-badge');
        if (badgeDesktop) {
          if (count > 0) {
            badgeDesktop.textContent = count > 9 ? '9+' : count;
            badgeDesktop.classList.remove('hidden');
            badgeDesktop.classList.add('flex');
          } else {
            badgeDesktop.classList.add('hidden');
            badgeDesktop.classList.remove('flex');
          }
        }

        const badgeMobile = document.getElementById('nav-cart-badge-mobile');
        if (badgeMobile) {
          badgeMobile.textContent = count;
        }
      } catch (e) {}
    }

    updateCartBadge();
    window.addEventListener('cart-updated', updateCartBadge);
    window.addEventListener('storage', updateCartBadge);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
