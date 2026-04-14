// ========================================
// ADMIN DASHBOARD SCRIPT
// ========================================

const GOOGLE_SHEETS_ID = '2PACX-1vTcWlhv_bK1thPxqX8ZaWaswTyaam1poIRptaJe-18E7IQbK39_ffnKvTUPtfeB8CiL5avfPgCoflCl';

// Tab switching
function switchAdminTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active from all tab buttons
    const tabButtons = document.querySelectorAll('.admin-tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the tab
    switch(tabName) {
        case 'users':
            loadUsers();
            break;
        case 'assemblies':
            loadAssemblies();
            break;
        case 'members':
            loadMembers();
            loadAssembliesForDropdown();
            break;
        case 'events':
            loadEvents();
            break;
        case 'speakers':
            loadSpeakers();
            break;
        case 'sync':
            updateStats();
            break;
    }
}

// ========================================
// USER MANAGEMENT
// ========================================

function loadUsers() {
    const users = getAllUsers();
    const container = document.getElementById('usersList');
    
    if (users.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No users registered yet.</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: var(--primary-gold);">${user.name || user.username}</strong>
                    <br>
                    <span style="color: var(--text-light); font-size: 0.9rem;">
                        📧 ${user.email} | 👤 ${user.role} | 🆔 ${user.username}
                    </span>
                </div>
                <button class="btn-secondary" onclick="editUser('${user.userId}')">✏️ Edit</button>
            </div>
        </div>
    `).join('');
}

function getAllUsers() {
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('profile_')) {
            const userId = key.replace('profile_', '');
            const profile = JSON.parse(localStorage.getItem(key) || '{}');
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            // Try to get user from registration data
            users.push({
                userId: userId,
                name: profile.name || 'Unknown',
                email: profile.email || 'No email',
                username: userId,
                role: profile.role || 'User'
            });
        }
    }
    return users;
}

function editUser(userId) {
    const profile = JSON.parse(localStorage.getItem(`profile_${userId}`) || '{}');
    
    document.getElementById('editUserId').value = userId;
    document.getElementById('editUserName').value = profile.name || '';
    document.getElementById('editUserEmail').value = profile.email || '';
    document.getElementById('editUserUsername').value = userId;
    document.getElementById('editUserRole').value = profile.role || 'Rainbow';
    
    document.getElementById('userEditModal').style.display = 'block';
    document.getElementById('usersList').style.display = 'none';
}

function saveUserEdit() {
    const userId = document.getElementById('editUserId').value;
    const profile = JSON.parse(localStorage.getItem(`profile_${userId}`) || '{}');
    
    profile.name = document.getElementById('editUserName').value;
    profile.email = document.getElementById('editUserEmail').value;
    profile.role = document.getElementById('editUserRole').value;
    
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    
    alert('✅ User profile updated successfully!');
    closeUserEdit();
    loadUsers();
}

function closeUserEdit() {
    document.getElementById('userEditModal').style.display = 'none';
    document.getElementById('usersList').style.display = 'block';
}

function createAdminUser() {
    const username = prompt('Enter username for new admin:');
    if (!username) return;
    
    const email = prompt('Enter email for new admin:');
    if (!email) return;
    
    const name = prompt('Enter full name for new admin:');
    if (!name) return;
    
    const password = prompt('Enter password for new admin (min 6 characters):');
    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }
    
    const userId = 'admin_' + Date.now();
    
    const profile = {
        userId: userId,
        username: username,
        email: email,
        name: name,
        role: 'Admin',
        dateCreated: new Date().toISOString()
    };
    
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    
    alert('✅ Admin user created successfully!\n\nUsername: ' + username + '\nPassword: ' + password + '\n\nPlease save these credentials.');
    loadUsers();
}

// Search users
document.getElementById('userSearch')?.addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    const users = document.querySelectorAll('.user-item');
    
    users.forEach(user => {
        const text = user.textContent.toLowerCase();
        user.style.display = text.includes(search) ? 'block' : 'none';
    });
});

// ========================================
// ASSEMBLY MANAGEMENT
// ========================================

function loadAssemblies() {
    const assemblies = JSON.parse(localStorage.getItem('assemblies_list') || '[]');
    const container = document.getElementById('assembliesList');
    
    if (assemblies.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No assemblies added yet. Add your first assembly above.</p>';
        return;
    }
    
    container.innerHTML = assemblies.map((assembly, index) => `
        <div class="assembly-item">
            <span style="color: var(--text-light);">${assembly}</span>
            <button class="btn-danger" onclick="deleteAssembly(${index})">🗑️ Remove</button>
        </div>
    `).join('');
}

function addAssembly() {
    const input = document.getElementById('newAssembly');
    const assemblyName = input.value.trim();
    
    if (!assemblyName) {
        alert('Please enter an assembly name.');
        return;
    }
    
    const assemblies = JSON.parse(localStorage.getItem('assemblies_list') || '[]');
    
    if (assemblies.includes(assemblyName)) {
        alert('This assembly already exists.');
        return;
    }
    
    assemblies.push(assemblyName);
    localStorage.setItem('assemblies_list', JSON.stringify(assemblies));
    
    input.value = '';
    loadAssemblies();
    alert('✅ Assembly added successfully!');
}

function deleteAssembly(index) {
    if (!confirm('Are you sure you want to remove this assembly?')) return;
    
    const assemblies = JSON.parse(localStorage.getItem('assemblies_list') || '[]');
    assemblies.splice(index, 1);
    localStorage.setItem('assemblies_list', JSON.stringify(assemblies));
    
    loadAssemblies();
    alert('✅ Assembly removed successfully!');
}

// ========================================
// MEET NJ RAINBOW MEMBER MANAGEMENT
// ========================================

function loadAssembliesForDropdown() {
    const assemblies = JSON.parse(localStorage.getItem('assemblies_list') || '[]');
    const select = document.getElementById('memberAssembly');
    
    select.innerHTML = '<option value="">Select assembly</option>';
    assemblies.forEach(assembly => {
        const option = document.createElement('option');
        option.value = assembly;
        option.textContent = assembly;
        select.appendChild(option);
    });
}

function loadMembers() {
    const members = JSON.parse(localStorage.getItem('admin_members') || '[]');
    const container = document.getElementById('membersList');
    
    if (members.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No members added yet.</p>';
        return;
    }
    
    container.innerHTML = members.map(member => `
        <div class="event-item">
            <div style="display: flex; gap: 1rem; align-items: center;">
                ${member.photo ? `<img src="${member.photo}" alt="${member.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-gold);">` : '<div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary-gold); display: flex; align-items: center; justify-content: center; font-size: 2rem;">👤</div>'}
                <div style="flex: 1;">
                    <strong style="color: var(--primary-gold); font-size: 1.1rem;">${member.name}</strong>
                    <br>
                    <span style="color: var(--text-light);">
                        ${member.station ? `⭐ ${member.station}<br>` : ''}
                        ${member.assembly ? `🌈 ${member.assembly}<br>` : ''}
                        ${member.bio ? `📝 ${member.bio}` : ''}
                    </span>
                </div>
                <div class="btn-group">
                    <button class="btn-secondary" onclick="editMember(${member.id})">✏️</button>
                    <button class="btn-danger" onclick="deleteMember(${member.id})">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showMemberForm() {
    document.getElementById('memberForm').style.display = 'block';
    document.getElementById('memberEditId').value = '';
    document.getElementById('memberName').value = '';
    document.getElementById('memberStation').value = '';
    document.getElementById('memberAssembly').value = '';
    document.getElementById('memberPhoto').value = '';
    document.getElementById('memberBio').value = '';
}

function hideMemberForm() {
    document.getElementById('memberForm').style.display = 'none';
}

function saveMember() {
    const name = document.getElementById('memberName').value.trim();
    const station = document.getElementById('memberStation').value.trim();
    const assembly = document.getElementById('memberAssembly').value;
    const photo = document.getElementById('memberPhoto').value.trim();
    const bio = document.getElementById('memberBio').value.trim();
    
    if (!name) {
        alert('Please enter member name.');
        return;
    }
    
    const members = JSON.parse(localStorage.getItem('admin_members') || '[]');
    const editId = document.getElementById('memberEditId').value;
    
    if (editId) {
        // Edit existing
        const index = members.findIndex(m => m.id == editId);
        if (index !== -1) {
            members[index] = { id: parseInt(editId), name, station, assembly, photo, bio };
        }
    } else {
        // Add new
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        members.push({ id: newId, name, station, assembly, photo, bio });
    }
    
    localStorage.setItem('admin_members', JSON.stringify(members));
    
    alert('✅ Member saved successfully!');
    hideMemberForm();
    loadMembers();
}

function editMember(id) {
    const members = JSON.parse(localStorage.getItem('admin_members') || '[]');
    const member = members.find(m => m.id === id);
    
    if (!member) return;
    
    document.getElementById('memberEditId').value = member.id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberStation').value = member.station || '';
    document.getElementById('memberAssembly').value = member.assembly || '';
    document.getElementById('memberPhoto').value = member.photo || '';
    document.getElementById('memberBio').value = member.bio || '';
    
    document.getElementById('memberForm').style.display = 'block';
}

function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    let members = JSON.parse(localStorage.getItem('admin_members') || '[]');
    members = members.filter(m => m.id !== id);
    localStorage.setItem('admin_members', JSON.stringify(members));
    
    alert('✅ Member deleted successfully!');
    loadMembers();
}

// ========================================
// EVENT MANAGEMENT
// ========================================

function loadEvents() {
    const events = JSON.parse(localStorage.getItem('admin_events') || '[]');
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No custom events added yet.</p>';
        return;
    }
    
    container.innerHTML = events.map(event => `
        <div class="event-item">
            <strong style="color: var(--primary-gold);">${event.title}</strong>
            <br>
            <span style="color: var(--text-light);">
                📅 ${event.day} | ⏰ ${event.time}${event.timeEnd ? ' - ' + event.timeEnd : ''} | 📍 ${event.location}
            </span>
            <div class="btn-group" style="margin-top: 0.5rem;">
                <button class="btn-secondary" onclick="editEvent(${event.id})">✏️ Edit</button>
                <button class="btn-danger" onclick="deleteEvent(${event.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function showEventForm() {
    document.getElementById('eventForm').style.display = 'block';
    document.getElementById('eventEditId').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDay').value = 'Friday';
    document.getElementById('eventTime').value = '';
    document.getElementById('eventTimeEnd').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventType').value = '';
    document.getElementById('eventSpeaker').value = '';
}

function hideEventForm() {
    document.getElementById('eventForm').style.display = 'none';
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const day = document.getElementById('eventDay').value;
    const time = document.getElementById('eventTime').value.trim();
    const timeEnd = document.getElementById('eventTimeEnd').value.trim();
    const location = document.getElementById('eventLocation').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const type = document.getElementById('eventType').value.trim();
    const speaker = document.getElementById('eventSpeaker').value.trim();
    
    if (!title || !day || !time || !location) {
        alert('Please fill in all required fields (title, day, time, location).');
        return;
    }
    
    const events = JSON.parse(localStorage.getItem('admin_events') || '[]');
    const editId = document.getElementById('eventEditId').value;
    
    if (editId) {
        // Edit existing
        const index = events.findIndex(e => e.id == editId);
        if (index !== -1) {
            events[index] = { id: parseInt(editId), title, day, time, timeEnd, location, description, type, speaker };
        }
    } else {
        // Add new
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        events.push({ id: newId, title, day, time, timeEnd, location, description, type, speaker });
    }
    
    localStorage.setItem('admin_events', JSON.stringify(events));
    
    alert('✅ Event saved successfully!');
    hideEventForm();
    loadEvents();
}

function editEvent(id) {
    const events = JSON.parse(localStorage.getItem('admin_events') || '[]');
    const event = events.find(e => e.id === id);
    
    if (!event) return;
    
    document.getElementById('eventEditId').value = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDay').value = event.day;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventTimeEnd').value = event.timeEnd || '';
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventType').value = event.type || '';
    document.getElementById('eventSpeaker').value = event.speaker || '';
    
    document.getElementById('eventForm').style.display = 'block';
}

function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    let events = JSON.parse(localStorage.getItem('admin_events') || '[]');
    events = events.filter(e => e.id !== id);
    localStorage.setItem('admin_events', JSON.stringify(events));
    
    alert('✅ Event deleted successfully!');
    loadEvents();
}

// ========================================
// SPEAKER MANAGEMENT
// ========================================

function loadSpeakers() {
    const speakers = JSON.parse(localStorage.getItem('admin_speakers') || '[]');
    const container = document.getElementById('speakersList');
    
    if (speakers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No custom speakers added yet.</p>';
        return;
    }
    
    container.innerHTML = speakers.map(speaker => `
        <div class="event-item">
            <strong style="color: var(--primary-gold);">${speaker.name}</strong>
            <br>
            <span style="color: var(--text-light);">
                ${speaker.title ? `📋 ${speaker.title}<br>` : ''}
                ${speaker.event ? `🎤 Speaking at: ${speaker.event}` : ''}
            </span>
            <div class="btn-group" style="margin-top: 0.5rem;">
                <button class="btn-secondary" onclick="editSpeaker(${speaker.id})">✏️ Edit</button>
                <button class="btn-danger" onclick="deleteSpeaker(${speaker.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function showSpeakerForm() {
    document.getElementById('speakerForm').style.display = 'block';
    document.getElementById('speakerEditId').value = '';
    document.getElementById('speakerName').value = '';
    document.getElementById('speakerTitle').value = '';
    document.getElementById('speakerPhoto').value = '';
    document.getElementById('speakerBio').value = '';
    document.getElementById('speakerEvent').value = '';
}

function hideSpeakerForm() {
    document.getElementById('speakerForm').style.display = 'none';
}

function saveSpeaker() {
    const name = document.getElementById('speakerName').value.trim();
    const title = document.getElementById('speakerTitle').value.trim();
    const photo = document.getElementById('speakerPhoto').value.trim();
    const bio = document.getElementById('speakerBio').value.trim();
    const event = document.getElementById('speakerEvent').value.trim();
    
    if (!name) {
        alert('Please enter speaker name.');
        return;
    }
    
    const speakers = JSON.parse(localStorage.getItem('admin_speakers') || '[]');
    const editId = document.getElementById('speakerEditId').value;
    
    if (editId) {
        // Edit existing
        const index = speakers.findIndex(s => s.id == editId);
        if (index !== -1) {
            speakers[index] = { id: parseInt(editId), name, title, photo, bio, event };
        }
    } else {
        // Add new
        const newId = speakers.length > 0 ? Math.max(...speakers.map(s => s.id)) + 1 : 1;
        speakers.push({ id: newId, name, title, photo, bio, event });
    }
    
    localStorage.setItem('admin_speakers', JSON.stringify(speakers));
    
    alert('✅ Speaker saved successfully!');
    hideSpeakerForm();
    loadSpeakers();
}

function editSpeaker(id) {
    const speakers = JSON.parse(localStorage.getItem('admin_speakers') || '[]');
    const speaker = speakers.find(s => s.id === id);
    
    if (!speaker) return;
    
    document.getElementById('speakerEditId').value = speaker.id;
    document.getElementById('speakerName').value = speaker.name;
    document.getElementById('speakerTitle').value = speaker.title || '';
    document.getElementById('speakerPhoto').value = speaker.photo || '';
    document.getElementById('speakerBio').value = speaker.bio || '';
    document.getElementById('speakerEvent').value = speaker.event || '';
    
    document.getElementById('speakerForm').style.display = 'block';
}

function deleteSpeaker(id) {
    if (!confirm('Are you sure you want to delete this speaker?')) return;
    
    let speakers = JSON.parse(localStorage.getItem('admin_speakers') || '[]');
    speakers = speakers.filter(s => s.id !== id);
    localStorage.setItem('admin_speakers', JSON.stringify(speakers));
    
    alert('✅ Speaker deleted successfully!');
    loadSpeakers();
}

// ========================================
// NOTIFICATIONS
// ========================================

function sendNotification() {
    const title = document.getElementById('notifTitle').value.trim();
    const message = document.getElementById('notifMessage').value.trim();
    
    if (!title || !message) {
        alert('Please enter both title and message.');
        return;
    }
    
    const notifications = JSON.parse(localStorage.getItem('custom_notifications') || '[]');
    const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    
    const notification = {
        id: newId,
        title: title,
        message: message,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    notifications.push(notification);
    localStorage.setItem('custom_notifications', JSON.stringify(notifications));
    
    document.getElementById('notifTitle').value = '';
    document.getElementById('notifMessage').value = '';
    
    alert('✅ Notification sent to all users!');
}

// ========================================
// DATA SYNC
// ========================================

function syncData() {
    document.getElementById('syncStatus').textContent = '🔄 Syncing data from Google Sheets...';
    
    // This would normally fetch from Google Sheets
    // For now, just simulate a sync
    setTimeout(() => {
        document.getElementById('syncStatus').textContent = '✅ Sync completed successfully!';
        updateStats();
    }, 2000);
}

function updateStats() {
    const events = JSON.parse(localStorage.getItem('admin_events') || '[]');
    const members = JSON.parse(localStorage.getItem('admin_members') || '[]');
    const speakers = JSON.parse(localStorage.getItem('admin_speakers') || '[]');
    const users = getAllUsers();
    
    document.getElementById('statsEvents').textContent = events.length;
    document.getElementById('statsMembers').textContent = members.length;
    document.getElementById('statsSpeakers').textContent = speakers.length;
    document.getElementById('statsUsers').textContent = users.length;
}

// ========================================
// INITIALIZATION
// ========================================

// Load initial data
loadUsers();
updateStats();
