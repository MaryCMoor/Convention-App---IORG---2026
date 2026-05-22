// ========================================
// AUTHENTICATION & GOOGLE SHEETS INTEGRATION
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwjIdyY8BPVOvhwGUfGKdcWIoaLOm-m__PDPq5mkOlXSlbTAdj292k-DzCRYjvoPYU/exec';

// Save user data to Google Sheets using form submission (bypasses CORS)
async function saveToGoogleSheets(userData) {
    console.log('🔄 Attempting to save to Google Sheets via form submission...');
    console.log('📤 Data being sent:', userData);
    
    return new Promise((resolve, reject) => {
        try {
            let iframe = document.getElementById('googleSheetsIframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'googleSheetsIframe';
                iframe.name = 'googleSheetsIframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                console.log('✅ Created hidden iframe');
            }
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = SCRIPT_URL;
            form.target = 'googleSheetsIframe';
            form.style.display = 'none';
            
            const actionField = document.createElement('input');
            actionField.type = 'hidden';
            actionField.name = 'action';
            actionField.value = 'saveUser';
            form.appendChild(actionField);
            
            Object.keys(userData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = userData[key];
                form.appendChild(input);
            });
            
            document.body.appendChild(form);
            console.log('📤 Submitting form to Google Sheets...');
            console.log('📤 Form action:', form.action);
            console.log('📤 Form fields:', Object.keys(userData));
            form.submit();
            
            setTimeout(() => {
                document.body.removeChild(form);
                console.log('✅ Form submitted successfully');
                console.log('⏳ Waiting for Google Sheets to process...');
                resolve(true);
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error submitting form:', error);
            reject(error);
        }
    });
}

// Sign Up Function - NEW USERS GO TO TRAINING
async function signUp(username, email, name, role, password) {
    console.log('========================================');
    console.log('📝 SIGNUP FUNCTION STARTED');
    console.log('========================================');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Role:', role);
    
    if (!username || !email || !name || !role || !password) {
        console.error('❌ Validation failed: Missing fields');
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
        console.log('🚀 Calling saveToGoogleSheets...');
        await saveToGoogleSheets(userData);
        
        console.log('✅ saveToGoogleSheets completed!');
        
        const userSession = {
            userId: userData.userId,
            username: userData.username,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            isNewUser: true,
            needsTraining: true
        };
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('✅ User session saved to localStorage');
        console.log('========================================');
        console.log('✅✅✅ SIGNUP COMPLETED SUCCESSFULLY ✅✅✅');
        console.log('========================================');
        
        alert('Account created successfully! ✅\n\nWelcome! You will now go through a quick tutorial.');
        return true;
    } catch (error) {
        console.error('❌❌❌ SIGNUP FAILED ❌❌❌');
        console.error('Error:', error);
        console.log('========================================');
        alert('Signup failed. Please try again.\n\nError: ' + error.message);
        return false;
    }
}

// Login Function - SIMPLE VERSION (NO FETCH - GIVES EVERYONE ADMIN)
function login(username, password) {
    console.log('========================================');
    console.log('🔐 LOGIN FUNCTION STARTED');
    console.log('========================================');
    console.log('Username entered:', username);
    
    const userSession = {
        userId: Date.now().toString(),
        username: username,
        email: username.includes('@') ? username : username + '@example.com',
        name: username,
        role: 'Rainbow Girl, Admin',
        isNewUser: false,
        needsTraining: false
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('✅ Login successful with role:', userSession.role);
    console.log('========================================');
    return true;
}

// Mark training as completed
function completeTraining() {
    const user = getCurrentUser();
    if (user) {
        user.needsTraining = false;
        user.isNewUser = false;
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('✅ Training marked as complete');
    }
}

// Check if user needs training
function needsTraining() {
    const user = getCurrentUser();
    return user && user.needsTraining === true;
}

// Logout Function
function logout() {
    console.log('========================================');
    console.log('🚪 LOGOUT STARTED');
    console.log('========================================');
    console.log('Before clear - isLoggedIn:', localStorage.getItem('isLoggedIn'));
    console.log('Before clear - currentUser:', localStorage.getItem('currentUser'));
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    
    console.log('After clear - isLoggedIn:', localStorage.getItem('isLoggedIn'));
    console.log('After clear - currentUser:', localStorage.getItem('currentUser'));
    console.log('✅ Session cleared');
    
    setTimeout(() => {
        console.log('➡️ Redirecting to login page...');
        console.log('========================================');
        window.location.replace('login.html');
    }, 100);
}

// Check if user is logged in
function isLoggedIn() {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    return loggedIn;
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Require login (redirect to login page if not logged in)
function requireLogin() {
    if (!isLoggedIn()) {
        console.log('❌ Not logged in, redirecting to login...');
        window.location.replace('login.html');
    }
}

console.log('✅ auth.js loaded successfully');
console.log('📍 SCRIPT_URL:', SCRIPT_URL);
