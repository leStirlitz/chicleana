// Auth UI — login/register forms and state-driven visibility
import { registerUser, loginUser, logoutUser, onAuthStateChanged } from './auth.js';
import { showToast, showView } from './app.js';

let currentUser = null;

/**
 * Initialize auth UI — render forms and set up auth state listener.
 */
export function initAuthUI() {
    renderAuthForm();
    onAuthStateChanged(handleAuthStateChange);
}

function handleAuthStateChange(user) {
    currentUser = user;
    updateUIForAuthState(user);
}

function updateUIForAuthState(user) {
    const authRequiredViews = ['report', 'profile'];
    const profileBtn = document.querySelector('[data-view="profile"]');

    if (user) {
        // User is logged in — show app, hide auth
        document.getElementById('view-auth').classList.remove('active');
        if (profileBtn) profileBtn.textContent = '👤';
        renderProfile(user);
    } else {
        // User is logged out — show auth if trying to access restricted view
        renderAuthForm();
    }
}

function renderAuthForm() {
    const container = document.getElementById('auth-container');
    container.innerHTML = `
        <div class="card" style="max-width:400px; margin:24px auto; padding:24px;">
            <h2 style="text-align:center; margin-bottom:20px;">🛶 Chicleana</h2>
            <div id="auth-mode-toggle" style="display:flex; gap:8px; margin-bottom:20px;">
                <button class="btn btn-primary btn-block" id="show-login">Log in</button>
                <button class="btn btn-block" id="show-register" style="background:var(--border);">Register</button>
            </div>
            <form id="auth-form">
                <div id="name-field" class="form-group" style="display:none;">
                    <label for="auth-name">Display Name</label>
                    <input type="text" id="auth-name" placeholder="Your name" autocomplete="name">
                </div>
                <div class="form-group">
                    <label for="auth-email">Email</label>
                    <input type="email" id="auth-email" placeholder="you@example.com" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="auth-password">Password</label>
                    <input type="password" id="auth-password" placeholder="Min 6 characters" required minlength="6" autocomplete="current-password">
                </div>
                <button type="submit" class="btn btn-primary btn-block" id="auth-submit">Log in</button>
            </form>
            <p id="auth-error" style="color:var(--alert); font-size:0.85rem; margin-top:12px; display:none;"></p>
        </div>
    `;

    let isLogin = true;

    document.getElementById('show-login').addEventListener('click', () => {
        isLogin = true;
        document.getElementById('name-field').style.display = 'none';
        document.getElementById('auth-submit').textContent = 'Log in';
        document.getElementById('show-login').classList.add('btn-primary');
        document.getElementById('show-register').classList.remove('btn-primary');
        document.getElementById('show-register').style.background = 'var(--border)';
        document.getElementById('show-login').style.background = '';
    });

    document.getElementById('show-register').addEventListener('click', () => {
        isLogin = false;
        document.getElementById('name-field').style.display = 'block';
        document.getElementById('auth-submit').textContent = 'Create account';
        document.getElementById('show-register').classList.add('btn-primary');
        document.getElementById('show-login').classList.remove('btn-primary');
        document.getElementById('show-login').style.background = 'var(--border)';
        document.getElementById('show-register').style.background = '';
    });

    document.getElementById('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name').value.trim();
        const errorEl = document.getElementById('auth-error');
        errorEl.style.display = 'none';

        try {
            if (isLogin) {
                await loginUser(email, password);
                showToast('Welcome back!', 'success');
            } else {
                if (!name) {
                    errorEl.textContent = 'Please enter a display name.';
                    errorEl.style.display = 'block';
                    return;
                }
                await registerUser(email, password, name);
                showToast('Account created!', 'success');
            }
            showView('map');
        } catch (err) {
            const msg = formatAuthError(err.code);
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
        }
    });
}

function renderProfile(user) {
    const container = document.getElementById('profile-container');
    container.innerHTML = `
        <div class="card" style="max-width:400px; margin:24px auto; padding:24px; text-align:center;">
            <h2>👤 ${user.displayName || 'User'}</h2>
            <p style="color:var(--text-light); margin:8px 0;">${user.email}</p>
            <button class="btn btn-danger btn-block" id="logout-btn" style="margin-top:20px;">Log out</button>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await logoutUser();
        showToast('Logged out', 'info');
        showView('auth');
    });
}

function formatAuthError(code) {
    const errors = {
        'auth/email-already-in-use': 'This email is already registered. Try logging in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return errors[code] || 'Authentication failed. Please try again.';
}

export { currentUser };
