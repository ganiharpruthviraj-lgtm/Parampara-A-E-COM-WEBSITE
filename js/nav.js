/**
 * Parampara Unified Navigation & Mobile Menu Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Parampara Navigation Initialized');
    
    // 1. Mobile Menu Toggle Logic
    const toggleBtn = document.querySelector('[data-landingsite-mobile-menu-toggle]') || document.getElementById('mobile-menu-toggle');
    const menu = document.querySelector('[data-landingsite-mobile-menu]') || document.getElementById('mobile-menu');

    if (toggleBtn && menu) {
        console.log('Mobile menu elements found');
        
        // Define the SVG paths for bars and X
        const barsPath = 'M4 6h16M4 12h16M4 18h16';
        const xPath = 'M6 18L18 6M6 6l12 12';
        
        const svg = toggleBtn.querySelector('svg');
        const path = svg ? svg.querySelector('path') : null;

        toggleBtn.addEventListener('click', (e) => {
            console.log('Menu Toggle Clicked');
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
    } else {
        console.warn('Mobile menu elements NOT found');
    }

    // 2. Active Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('text-[var(--primary-color)]', 'font-bold');
        }
    });

    // 3. Smooth Scroll for Anchors
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 800); 
        }
    }
});
