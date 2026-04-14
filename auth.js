// Google Apps Script Web App URL (you'll create this next)
const AUTH_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

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

    try {
        const response = await fetch(AUTH_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password
            })
        });

        // Since we're using no-cors, we can't read the response
        // So we'll use a workaround with JSONP or direct sheet reading
        // For now, simulate login
        if (username && password) {
            const user = {
                username: username,
                name: username,
                email: username,
                userId: btoa(username) // Simple ID generation
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            showSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    }

    return false;
}

async function handleSignup(event) {
    event.preventDefault();
    hideMessages();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validation
    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return false;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long!');
        return false;
    }

    try {
        const response = await fetch(AUTH_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'signup',
                name: name,
                email: email,
                username: username,
                password: password
            })
        });

        // Simulate successful signup
        showSuccess('Account created successfully! Please log in.');
        
        setTimeout(() => {
            switchTab('login');
            document.getElementById('loginUsername').value = username;
        }, 2000);

    } catch (error) {
        console.error('Signup error:', error);
        showError('Signup failed. Please try again.');
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
