// ========================================
// AUTHENTICATION & GOOGLE SHEETS INTEGRATION
// ========================================

// Google Apps Script Web App URL - IMPORTANT: Use the correct deployment URL!
const SCRIPT_URL = 'https://script.google.com/a/moor.cc/macros/s/AKfycbwjIdyY8BPVOvhwGUfGKdcWIoaLOm-m__PDPq5mkOlXSlbTAdj292k-DzCRYjvoPYU/exec';

// Save user data to Google Sheets
async function saveToGoogleSheets(userData) {
    console.log('🔄 Attempting to save to Google Sheets...');
    console.log('📤 Data being sent:', userData);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify({
                action: 'saveUser',
                ...userData
            }),
            mode: 'cors'
        });
        
        console.log('📥 Response status:', response.status);
        
        const text = await response.text();
        console.log('📥 Response text:', text);
        
        const result = JSON.parse(text);
        console.log('📥 Parsed result:', result);
        
        if (result.success) {
            console.log('✅ Successfully saved to Google Sheets!');
            return true;
        } else {
            console.error('❌ Google Sheets save failed:', result.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error saving to Google Sheets:', error);
        return false;
    }
}

// Hash password (simple client-side hash - not production secure!)
function hashPassword(password) {
    // For production, use a proper hashing library
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// Sign Up Function
async function signUp(username, email, name, role, password) {
    console.log('📝 Starting signup process...');
    
    // Validate inputs
    if (!username || !email || !name || !role || !password) {
        alert('Please fill in all fields!');
        return false;
    }
    
    // Create user object
    const userData = {
        userId: Date.now().toString(),
        username: username,
        email: email,
        name: name,
        role: role,
        password: password,
        dateCreated: new Date().toISOString()
    };
    
    console.log('👤 User data prepared:', userData);
    
    // Save to Google Sheets
    const saved = await saveToGoogleSheets(userData);
    
    if (saved) {
        console.log('✅ Signup successful!');
        
        // Store in localStorage (without password)
        const userSession = {
            userId: userData.userId,
            username: userData.username,
            email: userData.email,
            name: userData.name,
            role: userData.role
        };
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        localStorage.setItem('isLoggedIn', 'true');
        
        alert('Account created successfully! ✅');
        return true;
    } else {
        console.error('❌ Signup failed - could not save to Google Sheets');
        alert('Signup failed. Please try again.');
        return false;
    }
}

// Login Function (simplified - checks localStorage only)
function login(username, password) {
    console.log('🔐 Attempting login for:', username);
    
    // In a real app, you would verify against Google Sheets
    // For now, we'll just create a session
    
    const userSession = {
        userId: Date.now().toString(),
        username: username,
        email: username + '@example.com',
        name: username,
        role: 'Rainbow Girl'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('✅ Login successful');
    return true;
}

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Require login (redirect to login page if not logged in)
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}
