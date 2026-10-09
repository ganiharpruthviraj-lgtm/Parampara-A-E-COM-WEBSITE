/**
 * Parampara Heritage - Global Auth Management
 */

window.GLOBAL_API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '' || window.location.protocol === 'file:')
    ? 'http://localhost:5000'
    : 'https://parampara-a-e-com-website-1.onrender.com';

function updateGlobalNav() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Handle explicitly IDed nav-signin-btn on index.html, states.html, etc.
    const signinButtons = document.querySelectorAll('#nav-signin-btn, .nav-signin-btn');
    signinButtons.forEach(btn => {
        if (token && user) {
            btn.href = '#';
            btn.className = 'bg-[var(--primary-color)] text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer shadow-md hover:bg-[var(--primary-button-hover-bg-color)]';
            btn.innerHTML = `<i class="fa-solid fa-user-check text-base"></i> <span>${user.name ? user.name.split(' ')[0] : 'Member'}</span>`;
            btn.title = 'Click to Sign Out';
            btn.onclick = (e) => {
                e.preventDefault();
                if (confirm(`Signed in as ${user.name || 'Collector'}.\nDo you want to sign out from Parampara Heritage Archive? 🏺`)) {
                    handleLogout();
                }
            };
        } else {
            btn.href = 'login.html';
            btn.className = 'border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer';
            btn.innerHTML = `<i class="fa-regular fa-circle-user text-base"></i> <span>Sign In</span>`;
            btn.onclick = null;
        }
    });

    // Find all headers on the page
    const headers = document.querySelectorAll('header');
    
    headers.forEach(header => {
        const navContainers = header.querySelectorAll('.flex.items-center.space-x-8, .flex.items-center.gap-8, .flex.items-center.space-x-6, .flex.items-center.gap-6, .flex.items-center.space-x-4');
        
        navContainers.forEach(container => {
            if (container.querySelector('#auth-link')) return;

            const authLink = document.createElement('a');
            authLink.id = 'auth-link';
            authLink.href = token ? '#' : 'login.html';
            authLink.className = 'text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200 flex items-center gap-2 mr-2 cursor-pointer';
            
            if (token) {
                const collectionLink = document.createElement('a');
                collectionLink.href = 'collection.html';
                collectionLink.className = 'text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200 flex items-center gap-2 mr-6';
                collectionLink.innerHTML = `<i class="fa-regular fa-bookmark"></i> <span class="hidden lg:inline">Collection</span>`;
                container.prepend(collectionLink);

                authLink.innerHTML = `<i class="fa-solid fa-user-circle text-lg"></i> <span class="hidden sm:inline">${user?.name?.split(' ')[0] || 'Member'}</span>`;
                authLink.title = 'Logout';
                authLink.onclick = (e) => {
                    e.preventDefault();
                    if (confirm('Do you want to sign out from the heritage archive? 🏺')) {
                        handleLogout();
                    }
                };
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
    window.location.href = 'index.html';
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
