// Google Apps Script Web App URL
const AUTH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyD1W69Socavo7kZAwJj7TPOQ_Kteq8AKjpTTzSBr2Bd6B8s1EHA5Tx6BQ7em4SgOTQ/exec';

function switchTab(tab) {
    // Update tabs
    document.querySelectorAll('.form-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(f => {
        f.classList.remove('active');
    });
    document.getElementById(tab + 'Form').classList.add('active');

    // Clear messages
    hideMessages();
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
}

function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

async function handleLogin(event) {
    event.preventDefault();
    hideMessages();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Logging in...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${AUTH_SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
            method: 'GET',
            redirect: 'follow'
        });

        const data = await response.json();

        if (data.success) {
            const user = {
                userId: data.user.userId,
                username: data.user.username,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            showSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError(data.message || 'Invalid credentials. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please check your connection and try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }

    return false;
}

async function handleSignup(event) {
    event.preventDefault();
    hideMessages();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const role = document.getElementById('signupRole').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validation
    if (!role) {
        showError('Please select your role!');
        return false;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return false;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long!');
        return false;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Creating account...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${AUTH_SCRIPT_URL}?action=signup&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}&password=${encodeURIComponent(password)}`, {
            method: 'GET',
            redirect: 'follow'
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Account created successfully! Please log in.');
            
            setTimeout(() => {
                // Switch to login tab
                document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.form-tab[onclick*="login"]').classList.add('active');
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.getElementById('loginForm').classList.add('active');
                
                // Pre-fill username
                document.getElementById('loginUsername').value = username;
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        } else {
            showError(data.message || 'Signup failed. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }

    } catch (error) {
        console.error('Signup error:', error);
        showError('Signup failed. Please check your connection and try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }

    return false;
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'index.html';
    }
});
