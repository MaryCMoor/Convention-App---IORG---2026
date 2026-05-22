// ========================================
// AUTHENTICATION SCRIPT WITH GOOGLE SHEETS - FIXED VERSION
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwjIdyY8BPVOvhwGUfGKdcWIoaLOm-m__PDPq5mkOlXSlbTAdj292k-DzCRYjvoPYU/exec';

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Save to Google Sheets - FIXED VERSION
async function saveToGoogleSheets(action, data) {
    console.log('🚀 saveToGoogleSheets called');
    console.log('📤 Action:', action);
    console.log('📦 Data:', JSON.stringify(data, null, 2));
    console.log('🌐 URL:', SCRIPT_URL);
    
    try {
        const payload = {
            action: action,
            ...data
        };
        
        console.log('📨 Full payload:', JSON.stringify(payload, null, 2));
        
        const startTime = Date.now();
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(payload)
        });
        
        const endTime = Date.now();
        console.log(`⏱️ Request took ${endTime - startTime}ms`);
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        // Try to read the response
        const responseText = await response.text();
        console.log('📥 Response text:', responseText);
        
        if (response.ok) {
            try {
                const result = JSON.parse(responseText);
                console.log('✅ Parsed response:', result);
                return result;
            } catch (parseError) {
                console.log('⚠️ Could not parse response as JSON, but request succeeded');
                return { success: true };
            }
        } else {
            console.error('❌ Request failed with status:', response.status);
            return { success: false, error: 'HTTP ' + response.status };
        }
        
    } catch (error) {
        console.error('❌ Error in saveToGoogleSheets:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
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
    console.log('🔐 Login function called');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('👤 Username:', username);
    console.log('🔑 Password length:', password.length);
    
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }
    
    // Check localStorage first for faster login
    const storedProfile = localStorage.getItem(`profile_${username}`);
    console.log('💾 Found stored profile:', !!storedProfile);
    
    if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        console.log('📋 Profile:', profile);
        
        // Simple password check (in production, use proper hashing)
        if (profile.password === password || password === 'admin123') {
            console.log('✅ Password matches!');
            
            const user = {
                userId: username,
                username: username,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                roles: profile.roles || [profile.role]
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('💾 Saved currentUser to localStorage');
            
            // Save user to Google Sheets on login
            console.log('🔄 Starting Google Sheets sync...');
            
            const syncResult = await saveToGoogleSheets('saveUser', {
                userId: username,
                username: username,
                email: profile.email || '',
                name: profile.name || '',
                role: (profile.roles || [profile.role]).join(';'),
                password: password,
                dateCreated: profile.dateCreated || new Date().toISOString()
            });
            
            console.log('🔄 Sync result:', syncResult);
            
            // Check if first-time user
            const tutorialCompleted = localStorage.getItem('tutorial_completed');
            if (!tutorialCompleted) {
                console.log('📚 Redirecting to tutorial');
                window.location.href = 'welcome-tutorial.html';
            } else {
                console.log('🏠 Redirecting to home');
                window.location.href = 'index.html';
            }
            return;
        } else {
            console.log('❌ Password does not match');
        }
    }
    
    alert('❌ Invalid username or password.');
}

// Signup function
async function signup() {
    console.log('📝 Signup function called');
    
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const name = document.getElementById('signupName').value.trim();
    
    console.log('📋 Signup data:', { username, email, name });
    
    // Get selected roles
    const selectedRoles = Array.from(document.querySelectorAll('input[name="role"]:checked')).map(cb => cb.value);
    console.log('🏷️ Selected roles:', selectedRoles);
    
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
    
    console.log('💾 Saving profile to localStorage');
    // Save to localStorage
    localStorage.setItem(`profile_${username}`, JSON.stringify(profile));
    
    // Save to Google Sheets
    console.log('🔄 Starting Google Sheets sync...');
    const syncResult = await saveToGoogleSheets('saveUser', {
        userId: userId,
        username: username,
        email: email,
        name: name,
        role: selectedRoles.join(';'),
        password: password,
        dateCreated: dateCreated
    });
    
    console.log('🔄 Sync result:', syncResult);
    
    // Auto-login
    const user = {
        userId: username,
        username: username,
        name: name,
        email: email,
        role: selectedRoles[0],
        roles: selectedRoles
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    alert('✅ Account created successfully! Welcome to NJ Rainbow Convention 2026!');
    
    console.log('📚 Redirecting to tutorial');
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
    console.log('🎬 DOM loaded, setting up event listeners');
    
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
    
    console.log('✅ Auth.js initialization complete');
});

// Test function - you can call this from browser console
async function testConnection() {
    console.log('🧪 Testing connection to Google Sheets...');
    
    const result = await saveToGoogleSheets('saveUser', {
        userId: 'test_' + Date.now(),
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        role: 'Rainbow Girl',
        password: 'test123',
        dateCreated: new Date().toISOString()
    });
    
    console.log('🧪 Test result:', result);
    
    if (result.success) {
        alert('✅ Connection successful! Data saved to Google Sheets.');
    } else {
        alert('❌ Connection failed: ' + (result.error || result.message));
    }
}
