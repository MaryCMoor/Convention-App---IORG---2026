// Admin Panel with Google Sheets Backend
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfJr5u8tE_W6jHeUc_MJINzOBAuXp2lDioCMmhXjkpwAQ91Lf9rC3uCE3t5Zj7Cmc1/exec';

let allEvents = [];
let allSpeakers = [];
let allGallery = [];
let allUsers = [];

// Check admin access
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
if (currentUser.role !== 'Admin' && currentUser.role !== 'Grand Officer') {
    alert('Access Denied: Admin privileges required');
    window.location.href = 'index.html';
}

// Switch Admin Tabs
function switchAdminTab(tabName, buttonElement) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(tabName + 'Section').classList.add('active');
    
    // Update button states
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

// Parse CSV helper
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            }
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
        } else {
            currentField += char;
        }
    }
    
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }
    
    return rows;
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// EVENTS MANAGEMENT
// ============================================

async function loadEvents() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getEvents');
        const data = await response.json();
        
        if (data.success) {
            allEvents = data.data.map(event => ({
                ...event,
                id: parseInt(event.id) || Date.now()
            }));
        }
        
        renderEvents();
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Failed to load events from Google Sheets');
    }
}

function renderEvents() {
    const tbody = document.getElementById('eventsTableBody');
    
    if (allEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-light);">No events found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allEvents.map(event => `
        <tr>
            <td>${escapeHtml(event.id)}</td>
            <td>${escapeHtml(event.title)}</td>
            <td>${escapeHtml(event.day)}</td>
            <td>${escapeHtml(event.time)}</td>
            <td>${escapeHtml(event.timeEnd)}</td>
            <td>${escapeHtml(event.location)}</td>
            <td>${escapeHtml(event.type)}</td>
            <td>${escapeHtml(event.speaker)}</td>
            <td>
                <button onclick="editEvent(${event.id})" class="btn-edit">✏️ Edit</button>
                <button onclick="deleteEvent(${event.id})" class="btn-delete">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function showAddEventForm() {
    document.getElementById('eventFormContainer').style.display = 'block';
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    document.getElementById('eventFormTitle').textContent = '➕ Add New Event';
}

function hideEventForm() {
    document.getElementById('eventFormContainer').style.display = 'none';
    document.getElementById('eventForm').reset();
}

function editEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('eventFormTitle').textContent = '✏️ Edit Event';
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title || '';
    document.getElementById('eventDay').value = event.day || '';
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventTimeEnd').value = event.timeEnd || '';
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventType').value = event.type || '';
    document.getElementById('eventSpeaker').value = event.speaker || '';
    document.getElementById('eventDescription').value = event.description || '';
    
    document.getElementById('eventFormContainer').style.display = 'block';
}

async function saveEvent(event) {
    event.preventDefault();
    
    const eventId = document.getElementById('eventId').value;
    const isEdit = eventId !== '';
    
    const eventData = {
        id: isEdit ? parseInt(eventId) : Date.now(),
        title: document.getElementById('eventTitle').value,
        day: document.getElementById('eventDay').value,
        time: document.getElementById('eventTime').value,
        timeEnd: document.getElementById('eventTimeEnd').value,
        location: document.getElementById('eventLocation').value,
        type: document.getElementById('eventType').value,
        speaker: document.getElementById('eventSpeaker').value,
        description: document.getElementById('eventDescription').value
    };
    
    try {
        const action = isEdit ? 'updateEvent' : 'addEvent';
        const payload = isEdit ? 
            { action, eventId: eventData.id, event: eventData } :
            { action, event: eventData };
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        alert(isEdit ? 'Event updated successfully!' : 'Event added successfully!');
        
        hideEventForm();
        
        // Reload events after a short delay
        setTimeout(() => {
            loadEvents();
        }, 1000);
        
    } catch (error) {
        console.error('Error saving event:', error);
        alert('Failed to save event. Please try again.');
    }
    
    return false;
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'deleteEvent',
                eventId: eventId
            })
        });
        
        alert('Event deleted successfully!');
        
        // Reload events after a short delay
        setTimeout(() => {
            loadEvents();
        }, 1000);
        
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
    }
}

// ============================================
// SPEAKERS MANAGEMENT
// ============================================

async function loadSpeakers() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getSpeakers');
        const data = await response.json();
        
        if (data.success) {
            allSpeakers = data.data.map(speaker => ({
                ...speaker,
                id: parseInt(speaker.id) || Date.now()
            }));
        }
        
        renderSpeakers();
    } catch (error) {
        console.error('Error loading speakers:', error);
        alert('Failed to load speakers from Google Sheets');
    }
}

function renderSpeakers() {
    const tbody = document.getElementById('speakersTableBody');
    
    if (allSpeakers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-light);">No speakers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allSpeakers.map(speaker => `
        <tr>
            <td>${escapeHtml(speaker.id)}</td>
            <td>${escapeHtml(speaker.name)}</td>
            <td>${escapeHtml(speaker.title)}</td>
            <td>${escapeHtml(speaker.event)}</td>
            <td>${speaker.photo ? '✅' : '❌'}</td>
            <td>
                <button onclick="editSpeaker(${speaker.id})" class="btn-edit">✏️ Edit</button>
                <button onclick="deleteSpeaker(${speaker.id})" class="btn-delete">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function showAddSpeakerForm() {
    document.getElementById('speakerFormContainer').style.display = 'block';
    document.getElementById('speakerForm').reset();
    document.getElementById('speakerId').value = '';
    document.getElementById('speakerFormTitle').textContent = '➕ Add New Speaker';
}

function hideSpeakerForm() {
    document.getElementById('speakerFormContainer').style.display = 'none';
    document.getElementById('speakerForm').reset();
}

function editSpeaker(speakerId) {
    const speaker = allSpeakers.find(s => s.id === speakerId);
    if (!speaker) return;
    
    document.getElementById('speakerFormTitle').textContent = '✏️ Edit Speaker';
    document.getElementById('speakerId').value = speaker.id;
    document.getElementById('speakerName').value = speaker.name || '';
    document.getElementById('speakerTitle').value = speaker.title || '';
    document.getElementById('speakerEvent').value = speaker.event || '';
    document.getElementById('speakerBio').value = speaker.bio || '';
    document.getElementById('speakerPhoto').value = speaker.photo || '';
    
    document.getElementById('speakerFormContainer').style.display = 'block';
}

async function saveSpeaker(event) {
    event.preventDefault();
    
    const speakerId = document.getElementById('speakerId').value;
    const isEdit = speakerId !== '';
    
    const speakerData = {
        id: isEdit ? parseInt(speakerId) : Date.now(),
        name: document.getElementById('speakerName').value,
        title: document.getElementById('speakerTitle').value,
        event: document.getElementById('speakerEvent').value,
        bio: document.getElementById('speakerBio').value,
        photo: document.getElementById('speakerPhoto').value
    };
    
    try {
        const action = isEdit ? 'updateSpeaker' : 'addSpeaker';
        const payload = isEdit ?
            { action, speakerId: speakerData.id, speaker: speakerData } :
            { action, speaker: speakerData };
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        alert(isEdit ? 'Speaker updated successfully!' : 'Speaker added successfully!');
        
        hideSpeakerForm();
        
        setTimeout(() => {
            loadSpeakers();
        }, 1000);
        
    } catch (error) {
        console.error('Error saving speaker:', error);
        alert('Failed to save speaker. Please try again.');
    }
    
    return false;
}

async function deleteSpeaker(speakerId) {
    if (!confirm('Are you sure you want to delete this speaker?')) return;
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'deleteSpeaker',
                speakerId: speakerId
            })
        });
        
        alert('Speaker deleted successfully!');
        
        setTimeout(() => {
            loadSpeakers();
        }, 1000);
        
    } catch (error) {
        console.error('Error deleting speaker:', error);
        alert('Failed to delete speaker. Please try again.');
    }
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

async function loadGallery() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getGallery');
        const data = await response.json();
        
        if (data.success) {
            allGallery = data.data.map(item => ({
                ...item,
                id: parseInt(item.id) || Date.now()
            }));
        }
        
        renderGallery();
    } catch (error) {
        console.error('Error loading gallery:', error);
        alert('Failed to load gallery from Google Sheets');
    }
}

function renderGallery() {
    const tbody = document.getElementById('galleryTableBody');
    
    if (allGallery.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-light);">No gallery items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allGallery.map(item => `
        <tr>
            <td>${escapeHtml(item.id)}</td>
            <td><img src="${escapeHtml(item.imageUrl)}" style="max-width: 100px; border-radius: 8px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ccc%22 width=%22100%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22>No Image</text></svg>'"></td>
            <td>${escapeHtml(item.caption)}</td>
            <td>
                <button onclick="deleteGalleryItem(${item.id})" class="btn-delete">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function showAddGalleryForm() {
    document.getElementById('galleryFormContainer').style.display = 'block';
    document.getElementById('galleryForm').reset();
}

function hideGalleryForm() {
    document.getElementById('galleryFormContainer').style.display = 'none';
    document.getElementById('galleryForm').reset();
}

async function saveGalleryItem(event) {
    event.preventDefault();
    
    const galleryData = {
        id: Date.now(),
        imageUrl: document.getElementById('galleryImageUrl').value,
        caption: document.getElementById('galleryCaption').value,
        category: document.getElementById('galleryCategory').value
    };
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'addGalleryItem',
                item: galleryData
            })
        });
        
        alert('Gallery item added successfully!');
        
        hideGalleryForm();
        
        setTimeout(() => {
            loadGallery();
        }, 1000);
        
    } catch (error) {
        console.error('Error saving gallery item:', error);
        alert('Failed to save gallery item. Please try again.');
    }
    
    return false;
}

async function deleteGalleryItem(itemId) {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'deleteGalleryItem',
                itemId: itemId
            })
        });
        
        alert('Gallery item deleted successfully!');
        
        setTimeout(() => {
            loadGallery();
        }, 1000);
        
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        alert('Failed to delete gallery item. Please try again.');
    }
}

// ============================================
// USERS MANAGEMENT
// ============================================

async function loadUsers() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getUsers');
        const data = await response.json();
        
        if (data.success) {
            allUsers = data.data;
        }
        
        renderUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users from Google Sheets');
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>${escapeHtml(user.userId)}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.role)}</td>
        </tr>
    `).join('');
}

// Initialize
loadEvents();
loadSpeakers();
loadGallery();
loadUsers();
