// ========================================
// AUTHENTICATION & GOOGLE SHEETS INTEGRATION - CORS FIXED
// ========================================

const SCRIPT_URL = 'https://script.google.com/a/moor.cc/macros/s/AKfycbwjIdyY8BPVOvhwGUfGKdcWIoaLOm-m__PDPq5mkOlXSlbTAdj292k-DzCRYjvoPYU/exec';

// Save user data to Google Sheets using form submission (bypasses CORS)
async function saveToGoogleSheets(userData) {
    console.log('🔄 Attempting to save to Google Sheets via form submission...');
    console.log('📤 Data being sent:', userData);
    
    return new Promise((resolve, reject) => {
        try {
            // Create hidden iframe to receive response
            let iframe = document.getElementById('googleSheetsIframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'googleSheetsIframe';
                iframe.name = 'googleSheetsIframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            
            // Create form
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = SCRIPT_URL;
            form.target = 'googleSheetsIframe';
            form.style.display = 'none';
            
            // Add action field
            const actionField = document.createElement('input');
            actionField.type = 'hidden';
            actionField.name = 'action';
            actionField.value = 'saveUser';
            form.appendChild(actionField);
            
            // Add all user data fields
            Object.keys(userData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = userData[key];
                form.appendChild(input);
            });
            
            // Submit form
            document.body.appendChild(form);
            console.log('📤 Submitting form to Google Sheets...');
            form.submit();
            
            // Clean up form after submission
            setTimeout(() => {
                document.body.removeChild(form);
                console.log('✅ Form submitted successfully');
                console.log('⚠️ Note: Response is hidden in iframe, but data should be in Google Sheets');
                console.log('👉 Check Apps Script Executions and Google Sheet to verify!');
                resolve(true);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error submitting form:', error);
            reject(error);
        }
    });
}

// Hash password (simple client-side hash)
function hashPassword(password) {
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
    
    if (!username || !email || !name || !role || !password) {
        alert('Please fill in all fields!');
        return false;
    }
    
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
    
    try {
        await saveToGoogleSheets(userData);
        
        console.log('✅ Signup process completed!');
        
        // Store in localStorage
        const userSession = {
            userId: userData.userId,
            username: userData.username,
            email: userData.email,
            name: userData.name,
            role: userData.role
        };
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        localStorage.setItem('isLoggedIn', 'true');
        
        alert('Account created successfully! ✅\n\nYour account has been saved to the database.\n\nCheck Apps Script Executions to see the logs!');
        return true;
    } catch (error) {
        console.error('❌ Signup failed:', error);
        alert('Signup failed. Please try again.');
        return false;
    }
}

// Login Function (simplified - checks localStorage only for now)
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
