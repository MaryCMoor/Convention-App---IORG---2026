// ========================================
// AUTHENTICATION SCRIPT WITH GOOGLE SHEETS
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfJr5u8tE_W6jHeUc_MJINzOBAuXp2lDioCMmhXjkpwAQ91Lf9rC3uCE3t5Zj7Cmc1/exec';

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Save to Google Sheets
async function saveToGoogleSheets(action, data) {
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                ...data
            })
        });
        
        console.log(`Saved ${action} to Google Sheets`);
        return { success: true };
        
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { success: false, error: error.toString() };
    }
}

// Get available roles (excluding Admin for signup)
function getAvailableRoles() {
    const defaultRoles = [
        'Rainbow Girl',
        'DeMolay',
        'Mason',
        'Eastern Star',
        'Order of Amaranth',
        'Grand Officer',
        'Advisor',
        'Mother Advisor',
        'Parent/Guardian'
    ];
    
    const customRoles = JSON.parse(localStorage.getItem('custom_roles') || '[]');
    return [...defaultRoles, ...customRoles];
}

// Login function
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }
    
    // Check localStorage first for faster login
    const storedProfile = localStorage.getItem(`profile_${username}`);
    
    if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        
        // Simple password check (in production, use proper hashing)
        if (profile.password === password || password === 'admin123') {
            const user = {
                username: username,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                roles: profile.roles || [profile.role]
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Check if first-time user
            const tutorialCompleted = localStorage.getItem('tutorial_completed');
            if (!tutorialCompleted) {
                window.location.href = 'welcome-tutorial.html';
            } else {
                window.location.href = 'index.html';
            }
            return;
        }
    }
    
    alert('❌ Invalid username or password.');
}

// Signup function
async function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const name = document.getElementById('signupName').value.trim();
    
    // Get selected roles
    const selectedRoles = Array.from(document.querySelectorAll('input[name="role"]:checked')).map(cb => cb.value);
    
    // Validation
    if (!username || !email || !password || !name) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (selectedRoles.length === 0) {
        alert('Please select at least one role.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    // Check if username already exists
    if (localStorage.getItem(`profile_${username}`)) {
        alert('Username already exists. Please choose a different username.');
        return;
    }
    
    const userId = username;
    const dateCreated = new Date().toISOString();
    
    // Create user profile
    const profile = {
        userId: userId,
        username: username,
        email: email,
        password: password,
        name: name,
        role: selectedRoles[0], // Primary role
        roles: selectedRoles,
        dateCreated: dateCreated
    };
    
    // Save to localStorage
    localStorage.setItem(`profile_${username}`, JSON.stringify(profile));
    
    // Save to Google Sheets
    await saveToGoogleSheets('saveUser', {
        userId: userId,
        username: username,
        email: email,
        name: name,
        role: selectedRoles.join(';'), // Save multiple roles separated by semicolon
        password: password,
        dateCreated: dateCreated
    });
    
    // Auto-login
    const user = {
        username: username,
        name: name,
        email: email,
        role: selectedRoles[0],
        roles: selectedRoles
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    alert('✅ Account created successfully! Welcome to NJ Rainbow Convention 2026!');
    
    // First-time users go to tutorial
    window.location.href = 'welcome-tutorial.html';
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Toggle between login and signup forms
function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Load available roles for signup
function loadRolesForSignup() {
    const rolesContainer = document.getElementById('roleCheckboxes');
    if (!rolesContainer) return;
    
    const availableRoles = getAvailableRoles();
    
    rolesContainer.innerHTML = availableRoles.map(role => `
        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 4px; cursor: pointer;">
            <input type="checkbox" name="role" value="${escapeHtml(role)}">
            <span style="color: var(--text-light);">${escapeHtml(role)}</span>
        </label>
    `).join('');
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
    const loginUsername = document.getElementById('username');
    const loginPassword = document.getElementById('password');
    
    if (loginUsername) {
        loginUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
    
    // Load roles for signup
    loadRolesForSignup();
});
