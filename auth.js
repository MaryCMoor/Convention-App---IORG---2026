// ========================================
// AUTHENTICATION & GOOGLE SHEETS INTEGRATION - WITH TRAINING FLOW
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
            form.submit();
            
            setTimeout(() => {
                document.body.removeChild(form);
                console.log('✅ Form submitted successfully');
                resolve(true);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error submitting form:', error);
            reject(error);
        }
    });
}

// Sign Up Function - NEW USERS GO TO TRAINING
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
        
        alert('Account created successfully! ✅\n\nWelcome! You will now go through a quick tutorial.');
        return true;
    } catch (error) {
        console.error('❌ Signup failed:', error);
        alert('Signup failed. Please try again.');
        return false;
    }
}

// Login Function - RETURNING USERS SKIP TRAINING
function login(username, password) {
    console.log('🔐 Attempting login for:', username);
    
    const userSession = {
        userId: Date.now().toString(),
        username: username,
        email: username + '@example.com',
        name: username,
        role: 'Rainbow Girl',
        isNewUser: false,
        needsTraining: false
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('✅ Login successful');
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
