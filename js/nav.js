/**
 * Parampara Unified Navigation, Mobile Menu & Responsive Interactive Button Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Parampara Interactive System Initialized');
    
    // 1. Inject responsive button styles if not already present
    if (!document.querySelector('link[href*="buttons.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/buttons.css';
        document.head.appendChild(link);
    }

    // 1b. Inject Parampara Saathi AI Cultural Docent Widget
    if (!document.querySelector('script[src*="saathi.js"]') && !window.location.pathname.endsWith('saathi.html')) {
        const saathiScript = document.createElement('script');
        saathiScript.src = 'js/saathi.js';
        document.body.appendChild(saathiScript);
    }
    
    // 2. Mobile Menu Toggle Logic
    const toggleBtn = document.querySelector('[data-landingsite-mobile-menu-toggle]') || document.getElementById('mobile-menu-toggle');
    const menu = document.querySelector('[data-landingsite-mobile-menu]') || document.getElementById('mobile-menu');

    if (toggleBtn && menu) {
        // Define the SVG paths for bars and X
        const barsPath = 'M4 6h16M4 12h16M4 18h16';
        const xPath = 'M6 18L18 6M6 6l12 12';
        
        const svg = toggleBtn.querySelector('svg');
        const path = svg ? svg.querySelector('path') : null;

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = menu.classList.contains('hidden');
            
            if (isHidden) {
                menu.classList.remove('hidden');
                if (path) path.setAttribute('d', xPath);
            } else {
                menu.classList.add('hidden');
                if (path) path.setAttribute('d', barsPath);
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) {
                if (!menu.classList.contains('hidden')) {
                    menu.classList.add('hidden');
                    if (path) path.setAttribute('d', barsPath);
                }
            }
        });

        // Close menu when clicking a link
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('hidden');
                if (path) path.setAttribute('d', barsPath);
            });
        });
    }

    // 3. Interactive Ripple & Tap Feedback for All Buttons
    function initButtonInteractions() {
        const interactiveSelectors = 'button, a[role="button"], .btn, .btn-submit, .region-btn, a[class*="px-"][class*="py-"], .explore-btn, [class*="btn-"]';
        const elements = document.querySelectorAll(interactiveSelectors);

        elements.forEach(btn => {
            if (btn.dataset.rippleAttached) return;
            btn.dataset.rippleAttached = 'true';
            btn.classList.add('btn-ripple');

            btn.addEventListener('pointerdown', function(e) {
                const rect = this.getBoundingClientRect();
                const circle = document.createElement('span');
                const diameter = Math.max(rect.width, rect.height);
                const radius = diameter / 2;

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${(e.clientX || (rect.left + rect.width / 2)) - rect.left - radius}px`;
                circle.style.top = `${(e.clientY || (rect.top + rect.height / 2)) - rect.top - radius}px`;
                circle.classList.add('ripple-circle');

                const existingRipple = this.querySelector('.ripple-circle');
                if (existingRipple) existingRipple.remove();

                this.appendChild(circle);

                setTimeout(() => {
                    if (circle && circle.parentNode) circle.remove();
                }, 600);
            });
        });
    }

    initButtonInteractions();
    // Re-run for dynamic items inserted later
    const observer = new MutationObserver(() => initButtonInteractions());
    observer.observe(document.body, { childList: true, subtree: true });

    // 4. Active Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('text-[var(--primary-color)]', 'font-bold');
        }
    });

    // 5. Smooth Scroll for Anchors
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 800); 
        }
    }
});
