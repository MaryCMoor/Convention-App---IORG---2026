// Authentication with Google Sheets Backend
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfJr5u8tE_W6jHeUc_MJINzOBAuXp2lDioCMmhXjkpwAQ91Lf9rC3uCE3t5Zj7Cmc1/exec';

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

function handleLogin(event) {
    event.preventDefault();
    hideMessages();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showError('Please enter both username/email and password.');
        return false;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Logging in...';
    submitBtn.disabled = true;

    // Call Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'loginUser',
            username: username,
            password: password
        })
    })
    .then(() => {
        // no-cors mode doesn't return response, so we need to verify differently
        // Let's try a GET request to verify
        return fetch(SCRIPT_URL + '?action=loginUser&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password))
            .then(response => response.json());
    })
    .then(data => {
        if (data.success) {
            // Store user data
            const currentUser = {
                userId: data.user.userId,
                username: data.user.username,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError(data.message || 'Login failed. Please check your credentials.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showError('Connection error. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });

    return false;
}

function handleSignup(event) {
    event.preventDefault();
    hideMessages();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const role = document.getElementById('signupRole').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validation
    if (!name || !email || !username || !role || !password || !confirmPassword) {
        showError('Please fill in all fields!');
        return false;
    }

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address!');
        return false;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Creating account...';
    submitBtn.disabled = true;

    // Create user object
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
        userId: userId,
        username: username,
        email: email,
        name: name,
        role: role,
        password: password // Google Apps Script should hash this
    };

    // Call Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'registerUser',
            user: newUser
        })
    })
    .then(() => {
        // Since no-cors doesn't return data, assume success after delay
        setTimeout(() => {
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
                
                hideMessages();
            }, 2000);
        }, 1000);
    })
    .catch(error => {
        console.error('Signup error:', error);
        showError('Connection error. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });

    return false;
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'index.html';
    }
});
