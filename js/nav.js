/**
 * Parampara Unified Navigation & Mobile Menu Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle Logic
    const toggleBtn = document.querySelector('[data-landingsite-mobile-menu-toggle]') || document.getElementById('mobile-menu-toggle');
    const menu = document.querySelector('[data-landingsite-mobile-menu]') || document.getElementById('mobile-menu');

    if (toggleBtn && menu) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
            // If it has a specific animation or state, handle it here
            const icon = toggleBtn.querySelector('i') || toggleBtn.querySelector('svg');
            if (icon) {
                // Potential icon toggle logic if needed
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });

        // Close menu when clicking a link
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('hidden');
            });
        });
    }

    // 2. Active Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('text-[var(--primary-color)]');
            link.classList.add('font-bold');
        }
    });

    // 3. Smooth Scroll for Anchors (including cross-page)
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 500); // Wait for preloader
        }
    }
});
