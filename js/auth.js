/**
 * Parampara Heritage - Global Auth Management
 */

function updateGlobalNav() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Find all headers on the page
    const headers = document.querySelectorAll('header');
    
    headers.forEach(header => {
        // Find containers for navigation icons/links - expanded to match index, artisans, and states pages
        const navContainers = header.querySelectorAll('.flex.items-center.space-x-8, .flex.items-center.gap-8, .flex.items-center.space-x-6, .flex.items-center.gap-6, .flex.items-center.space-x-4');
        
        navContainers.forEach(container => {
            // Check if we already injected the auth link
            if (container.querySelector('#auth-link')) return;

            const authLink = document.createElement('a');
            authLink.id = 'auth-link';
            // Set link to login if not logged in, or prevent default if logged in (for logout dialog)
            authLink.href = token ? '#' : 'login.html';
            authLink.className = 'text-[var(--dark-text-color)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200 flex items-center gap-2 mr-2 cursor-pointer';
            
            if (token) {
                authLink.innerHTML = `<i class="fa-solid fa-user-circle text-lg"></i> <span class="hidden sm:inline">${user?.name?.split(' ')[0] || 'Member'}</span>`;
                authLink.title = 'Logout';
                authLink.onclick = (e) => {
                    e.preventDefault();
                    if (confirm('Do you want to sign out from the heritage archive? 🏺')) {
                        handleLogout();
                    }
                };
            } else {
                // If on login/register page, hide the sign in link to avoid redundancy
                const page = window.location.pathname.split('/').pop();
                if (page === 'login.html' || page === 'register.html') return;

                authLink.innerHTML = `<i class="fa-regular fa-circle-user text-lg text-[var(--primary-color)]"></i> <span class="hidden sm:inline">Sign In</span>`;
            }
            
            // Prepend to the container
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
        const response = await fetch(`http://localhost:5000/api/auth/collection/${productId}`, {
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
