const API_URL = 'http://localhost:8000';

// Token management
function setToken(token) {
    localStorage.setItem('auth_token', token);
}

function getToken() {
    return localStorage.getItem('auth_token');
}

function clearToken() {
    localStorage.removeItem('auth_token');
}

function isAuthenticated() {
    return !!getToken();
}

// Login
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const messageEl = document.getElementById('auth-message');

    if (!email || !password) {
        messageEl.textContent = 'Por favor completa todos los campos';
        return;
    }

    try {
        messageEl.textContent = 'Iniciando sesión...';
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al iniciar sesión');
        }

        const data = await response.json();
        setToken(data.access_token);
        messageEl.textContent = '¡Bienvenido!';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    } catch (error) {
        messageEl.textContent = `Error: ${error.message}`;
    }
}

// Register
async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const passwordConfirm = form['password-confirm'].value.trim();
    const messageEl = document.getElementById('auth-message');

    if (!email || !password || !passwordConfirm) {
        messageEl.textContent = 'Por favor completa todos los campos';
        return;
    }

    if (password !== passwordConfirm) {
        messageEl.textContent = 'Las contraseñas no coinciden';
        return;
    }

    if (password.length < 6) {
        messageEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
        return;
    }

    try {
        messageEl.textContent = 'Registrando...';
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al registrar');
        }

        messageEl.textContent = '¡Cuenta creada! Redirigiendo...';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        messageEl.textContent = `Error: ${error.message}`;
    }
}

// Event listeners
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
}
