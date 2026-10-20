/**
 * Parampara Heritage - Global Auth Management & Mandatory Authentication
 */

// ─── MANDATORY PLATFORM AUTHENTICATION ENFORCEMENT ─────────────────────────
(function enforcePlatformAuth() {
    // Check current page
    const path = window.location.pathname.toLowerCase();
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Public authentication routes (allowed without logging in)
    if (filename === 'login.html' || filename === 'login' || filename === 'register.html' || filename === 'register') {
        return;
    }

    // Check existing authentication token and session
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    let isAuthenticated = false;
    if (token && token !== 'undefined' && token !== 'null' && userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
            const user = JSON.parse(userStr);
            if (user && (user.email || user.name || user._id)) {
                isAuthenticated = true;
            }
        } catch (e) {
            isAuthenticated = false;
        }
    }

    if (!isAuthenticated) {
        // Store intended destination so user returns seamlessly after sign-in
        try {
            localStorage.setItem('redirectAfterLogin', window.location.href);
        } catch (e) { }

        // Hide unauthenticated page content to prevent flicker
        if (document.documentElement) {
            document.documentElement.style.display = 'none';
        }

        // Redirect immediately to login.html
        window.location.replace('login.html?required=true');
    }
})();

window.GLOBAL_API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '' || window.location.protocol === 'file:')
    ? 'http://localhost:5000'
    : 'https://parampara-a-e-com-website-1.onrender.com';

function updateGlobalNav() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Handle explicitly IDed nav-signin-btn on index.html, states.html, components.js, etc.
    const signinButtons = document.querySelectorAll('#nav-signin-btn, .nav-signin-btn, #mobile-nav-signin-btn');
    signinButtons.forEach(btn => {
        if (token && user) {
            btn.href = 'profile.html';
            btn.className = 'bg-[var(--primary-color)] text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer shadow-md hover:bg-[var(--primary-button-hover-bg-color)]';
            btn.innerHTML = `<i class="fa-solid fa-user-check text-base"></i> <span>${user.name ? user.name.split(' ')[0] : 'Collector'}</span>`;
            btn.title = `Signed in as ${user.name || 'Collector'} — View Collector Profile`;
            btn.onclick = null;
        } else {
            btn.href = 'login.html';
            btn.className = 'nav-signin-btn border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer shadow-sm hover:shadow-md group';
            btn.innerHTML = `<i class="fa-regular fa-circle-user text-base group-hover:scale-110 transition-transform"></i> <span>Sign In / Sign Up</span>`;
            btn.title = 'Sign In or Sign Up — Collector Portal';
            btn.onclick = null;
        }
    });

    // Show/hide mobile "My Profile" link (injected by components.js)
    const mobileProfileLink = document.getElementById('mobile-nav-profile-link');
    if (mobileProfileLink) {
        mobileProfileLink.style.display = (token && user) ? 'flex' : 'none';
    }

    // Find all headers on the page
    const headers = document.querySelectorAll('header');

    headers.forEach(header => {
        const navContainers = header.querySelectorAll('.flex.items-center.space-x-8, .flex.items-center.gap-8, .flex.items-center.space-x-6, .flex.items-center.gap-6, .flex.items-center.space-x-4');

        navContainers.forEach(container => {
            if (container.querySelector('#auth-link, #nav-signin-btn, .nav-signin-btn')) return;

            const authLink = document.createElement('a');
            authLink.id = 'auth-link';
            authLink.href = token ? 'profile.html' : 'login.html';
            authLink.className = 'text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200 flex items-center gap-2 mr-2 cursor-pointer';

            if (token) {
                const collectionLink = document.createElement('a');
                collectionLink.href = 'collection.html';
                collectionLink.className = 'text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200 flex items-center gap-2 mr-6';
                collectionLink.innerHTML = `<i class="fa-regular fa-bookmark"></i> <span class="hidden lg:inline">Collection</span>`;
                container.prepend(collectionLink);

                const profileLink = document.createElement('a');
                profileLink.href = 'profile.html';
                profileLink.className = 'text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200 flex items-center gap-2 mr-6';
                profileLink.innerHTML = `<i class="fa-regular fa-circle-user"></i> <span class="hidden lg:inline">My Profile</span>`;
                profileLink.title = 'My Collector Profile';
                container.prepend(profileLink);

                authLink.innerHTML = `<i class="fa-solid fa-user-circle text-lg"></i> <span class="hidden sm:inline">${user?.name?.split(' ')[0] || 'Member'}</span>`;
                authLink.title = 'My Profile';
                authLink.onclick = null; // navigate naturally to profile.html
            } else {
                const page = window.location.pathname.split('/').pop();
                if (page === 'login.html' || page === 'register.html') return;

                authLink.innerHTML = `<i class="fa-regular fa-circle-user text-lg text-[var(--primary-color)]"></i> <span class="hidden sm:inline">Sign In</span>`;
            }

            container.prepend(authLink);
        });
    });
}

/**
 * Protected Route Helper
 * Call this at the start of any page that requires authentication.
 */
function protectRoute() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Store current URL to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Toggle Item in User Collection
 * @param {string} productId 
 * @param {HTMLElement} btn - The button element to update UI
 */
async function toggleCollection(productId, btn) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please Sign In to preserve this masterpiece in your collection. 🏺');
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${window.GLOBAL_API_BASE}/api/auth/collection/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (btn) {
                const icon = btn.querySelector('i');
                if (data.isCollected) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                    btn.classList.add('text-red-500');
                    if (btn.tagName === 'BUTTON' && btn.querySelector('span')) {
                        btn.querySelector('span').textContent = 'In Collection';
                        btn.classList.add('bg-green-600');
                    }
                } else {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                    btn.classList.remove('text-red-500');
                    if (btn.tagName === 'BUTTON' && btn.querySelector('span')) {
                        btn.querySelector('span').textContent = 'Add to Collection';
                        btn.classList.remove('bg-green-600');
                    }
                }
            }
        }
    } catch (error) {
        console.error('Collection toggle failed:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Initial update
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGlobalNav);
} else {
    updateGlobalNav();
}

// Global hook for login success
window.onAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
    updateGlobalNav();
};

/**
 * Dynamic Google OAuth Client ID Loader
 * Fetches configured Google Client ID from backend /api/auth/config and updates g_id_onload element.
 */
async function initGoogleAuthConfig() {
    try {
        const res = await fetch(`${window.GLOBAL_API_BASE}/api/auth/config`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.googleClientId) {
            window.GOOGLE_CLIENT_ID = data.googleClientId;
            const gIdOnload = document.getElementById('g_id_onload');
            if (gIdOnload) {
                gIdOnload.setAttribute('data-client_id', data.googleClientId);
            }
        }
    } catch (err) {
        // Backend offline or config unavailable
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleAuthConfig);
} else {
    initGoogleAuthConfig();
}
