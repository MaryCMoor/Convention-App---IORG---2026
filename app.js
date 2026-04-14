// Configuration for Google Sheets
const GOOGLE_SHEETS_CONFIG = {
    sheetId: '2PACX-1vTcWlhv_bK1thPxqX8ZaWaswTyaam1poIRptaJe-18E7IQbK39_ffnKvTUPtfeB8CiL5avfPgCoflCl',
    baseUrl: 'https://docs.google.com/spreadsheets/d/e/',
    sheets: {
        schedule: 'Schedule',
        members: 'Members',
        speakers: 'Speakers',
        notifications: 'Notifications',
        checklist: 'Checklist',
        gallery: 'Gallery'
    }
};

// Global app variable
var app;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    class ConventionApp {
        constructor() {
            // Check if user is logged in
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                window.location.href = 'login.html';
                return;
            }
            
            this.user = JSON.parse(currentUser);
            this.currentPage = 'home';
            
            // Check if user has admin role
            this.isAdmin = this.user.role === 'Admin';
            
            // Load user-specific favorites
            this.favorites = new Set(JSON.parse(localStorage.getItem(`favorites_${this.user.userId}`) || '[]'));
            
            this.data = {
                schedule: [],
                scheduleByDay: {},
                members: [],
                speakers: [],
                notifications: [],
                checklist: [],
                gallery: [],
                messages: []
            };
            this.init();
        }

        async init() {
            console.log('App initializing...');
            this.setupEventListeners();
            
            // Display user name and role
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = this.user.name || this.user.username;
            }
            
            // Hide admin tile if not admin
            if (!this.isAdmin) {
                const adminTile = document.querySelector('[data-page="admin"]');
                if (adminTile) {
                    adminTile.style.display = 'none';
                }
            }
            
            // Try to load from Google Sheets
            await this.loadFromGoogleSheets();
            
            this.loadProfile();
            this.loadNotes();
            this.loadMessages();
            this.updateStats();
            console.log('App initialized successfully!');
        }

        setupEventListeners() {
            // Tile click handlers
            const tiles = document.querySelectorAll('.tile');
            tiles.forEach(tile => {
                tile.addEventListener('click', () => {
                    const pageId = tile.getAttribute('data-page');
                    const title = tile.getAttribute('data-title');
                    
                    // Check admin access
                    if (pageId === 'admin' && !this.isAdmin) {
                        alert('⚠️ Access Denied: Only administrators can access this area.');
                        return;
                    }
                    
                    this.navigateTo(pageId, title);
                });
            });

            // Back button
            const backButton = document.getElementById('backButton');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    this.goHome();
                });
            }

            // Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to logout?')) {
                        localStorage.removeItem('currentUser');
                        window.location.href = 'login.html';
                    }
                });
            }

            // Profile save button
            const saveProfileBtn = document.getElementById('saveProfileBtn');
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', () => {
                    this.saveProfile();
                });
            }

            // Notes save button
            const saveNotesBtn = document.getElementById('saveNotesBtn');
            if (saveNotesBtn) {
                saveNotesBtn.addEventListener('click', () => {
                    this.saveNotes();
                });
            }

            // Message send button
            const sendMessageBtn = document.getElementById('sendMessageBtn');
            if (sendMessageBtn) {
                sendMessageBtn.addEventListener('click', () => {
                    this.sendMessage();
                });
            }

            // Message input enter key
            const messageText = document.getElementById('messageText');
            if (messageText) {
                messageText.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage();
                    }
                });
            }

            // Admin buttons
            const sendNotifBtn = document.getElementById('sendNotifBtn');
            if (sendNotifBtn) {
                sendNotifBtn.addEventListener('click', () => {
                    this.sendNotification();
                });
            }

            const syncNowBtn = document.getElementById('syncNowBtn');
            if (syncNowBtn) {
                syncNowBtn.addEventListener('click', () => {
                    this.loadFromGoogleSheets();
                });
            }

            // Admin event management buttons
            const addEventBtn = document.getElementById('addEventBtn');
            if (addEventBtn) {
                addEventBtn.addEventListener('click', () => {
                    this.showEventForm();
                });
            }

            const saveEventBtn = document.getElementById('saveEventBtn');
            if (saveEventBtn) {
                saveEventBtn.addEventListener('click', () => {
                    this.saveEvent();
                });
            }

            const cancelEventBtn = document.getElementById('cancelEventBtn');
            if (cancelEventBtn) {
                cancelEventBtn.addEventListener('click', () => {
                    this.hideEventForm();
                });
            }

            // Admin speaker management buttons
            const addSpeakerBtn = document.getElementById('addSpeakerBtn');
            if (addSpeakerBtn) {
                addSpeakerBtn.addEventListener('click', () => {
                    this.showSpeakerForm();
                });
            }

            const saveSpeakerBtn = document.getElementById('saveSpeakerBtn');
            if (saveSpeakerBtn) {
                saveSpeakerBtn.addEventListener('click', () => {
                    this.saveSpeaker();
                });
            }

            const cancelSpeakerBtn = document.getElementById('cancelSpeakerBtn');
            if (cancelSpeakerBtn) {
                cancelSpeakerBtn.addEventListener('click', () => {
                    this.hideSpeakerForm();
                });
            }

            // Search handlers
            const scheduleSearch = document.getElementById('scheduleSearch');
            if (scheduleSearch) {
                scheduleSearch.addEventListener('input', (e) => {
                    this.renderScheduleByDay(e.target.value);
                });
            }

            const meetNjSearch = document.getElementById('meetNjSearch');
            if (meetNjSearch) {
                meetNjSearch.addEventListener('input', (e) => {
                    this.renderMeetNJ(e.target.value);
                });
            }

            const speakersSearch = document.getElementById('speakersSearch');
            if (speakersSearch) {
                speakersSearch.addEventListener('input', (e) => {
                    this.renderSpeakers(e.target.value);
                });
            }
        }

        showLoading(show) {
            const indicator = document.getElementById('loadingIndicator');
            if (indicator) {
                indicator.style.display = show ? 'block' : 'none';
            }
        }

        async loadFromGoogleSheets() {
            this.showLoading(true);
            const syncStatus = document.getElementById('syncStatus');
            
            try {
                if (syncStatus) {
                    syncStatus.textContent = 'Syncing with Google Sheets...';
                }
                
                // Load all sheets
                await Promise.all([
                    this.loadSheetData('schedule'),
                    this.loadSheetData('members'),
                    this.loadSheetData('speakers'),
                    this.loadSheetData('notifications'),
                    this.loadSheetData('checklist'),
                    this.loadSheetData('gallery')
                ]);
                
                // MERGE WITH ADMIN-ADDED DATA
                const adminEvents = JSON.parse(localStorage.getItem('admin_events') || '[]');
                const adminSpeakers = JSON.parse(localStorage.getItem('admin_speakers') || '[]');
                
                // Merge events (admin-added events override sheet events with same ID)
                adminEvents.forEach(adminEvent => {
                    const index = this.data.schedule.findIndex(e => e.id == adminEvent.id);
                    if (index >= 0) {
                        this.data.schedule[index] = adminEvent;
                    } else {
                        this.data.schedule.push(adminEvent);
                    }
                });
                
                // Merge speakers
                adminSpeakers.forEach(adminSpeaker => {
                    const index = this.data.speakers.findIndex(s => s.id == adminSpeaker.id);
                    if (index >= 0) {
                        this.data.speakers[index] = adminSpeaker;
                    } else {
                        this.data.speakers.push(adminSpeaker);
                    }
                });
                
                this.organizeScheduleByDay();
                this.renderAll();
                
                if (syncStatus) {
                    syncStatus.textContent = `Last synced: ${new Date().toLocaleString()}`;
                }
                console.log('Data loaded successfully from Google Sheets');
                
            } catch (error) {
                console.error('Error loading from Google Sheets:', error);
                if (syncStatus) {
                    syncStatus.textContent = 'Error syncing. Using cached data.';
                }
            }
            
            this.showLoading(false);
        }

        async loadSheetData(sheetType) {
            const sheetName = GOOGLE_SHEETS_CONFIG.sheets[sheetType];
            const url = `${GOOGLE_SHEETS_CONFIG.baseUrl}${GOOGLE_SHEETS_CONFIG.sheetId}/pub?output=csv`;
            
            try {
                const response = await fetch(url);
                const csvText = await response.text();
                const rows = this.parseCSV(csvText);
                
                if (rows.length > 0) {
                    const headers = rows[0].map(h => h.toLowerCase().trim());
                    const items = rows.slice(1).map(row => {
                        const item = {};
                        headers.forEach((header, index) => {
                            item[header] = row[index] || '';
                        });
                        return item;
                    }).filter(item => item.id || item.name || item.title);

                    this.data[sheetType] = items;
                    
                    if (sheetType === 'schedule') {
                        this.organizeScheduleByDay();
                    }
                    
                    localStorage.setItem(`data_${sheetType}`, JSON.stringify(items));
                }
            } catch (error) {
                console.error(`Error loading ${sheetType}:`, error);
                const cached = localStorage.getItem(`data_${sheetType}`);
                if (cached) {
                    this.data[sheetType] = JSON.parse(cached);
                    if (sheetType === 'schedule') {
                        this.organizeScheduleByDay();
                    }
                }
            }
        }

        parseCSV(text) {
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
                    currentRow.push(currentField);
                    currentField = '';
                } else if ((char === '\n' || char === '\r') && !inQuotes) {
                    if (currentField || currentRow.length > 0) {
                        currentRow.push(currentField);
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
                currentRow.push(currentField);
                rows.push(currentRow);
            }
            
            return rows;
        }

        organizeScheduleByDay() {
            this.data.scheduleByDay = {
                'Friday': [],
                'Saturday': [],
                'Sunday': []
            };

            this.data.schedule.forEach(event => {
                if (event.id) {
                    event.id = parseInt(event.id);
                }
                
                if (event.day && this.data.scheduleByDay[event.day]) {
                    this.data.scheduleByDay[event.day].push(event);
                }
            });
        }

        navigateTo(pageId, title) {
            console.log('Navigating to:', pageId, title);
            
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            const backNav = document.getElementById('backNav');
            const pageTitle = document.getElementById('currentPageTitle');
            
            if (pageId === 'home') {
                if (backNav) backNav.style.display = 'none';
            } else {
                if (backNav) backNav.style.display = 'flex';
                if (pageTitle) pageTitle.textContent = title;
            }

            this.currentPage = pageId;
            this.renderPage(pageId);
            window.scrollTo(0, 0);
        }

        goHome() {
            this.navigateTo('home', '');
        }

        renderPage(pageId) {
            switch(pageId) {
                case 'my-schedule':
                    this.renderMySchedule();
                    break;
                case 'schedule':
                    this.renderScheduleByDay();
                    break;
                case 'meet-nj':
                    this.renderMeetNJ();
                    break;
                case 'speakers':
                    this.renderSpeakers();
                    break;
                case 'notifications':
                    this.renderNotifications();
                    break;
                case 'gallery':
                    this.renderGallery();
                    break;
                case 'checklist':
                    this.renderChecklist();
                    break;
                case 'admin':
                    if (this.isAdmin) {
                        document.getElementById('adminContent').style.display = 'block';
                        document.getElementById('adminAccessDenied').style.display = 'none';
                        this.renderAdminEvents();
                        this.renderAdminSpeakers();
                        this.updateAdminStats();
                    } else {
                        document.getElementById('adminContent').style.display = 'none';
                        document.getElementById('adminAccessDenied').style.display = 'block';
                    }
                    break;
            }
        }

        renderAll() {
            this.renderScheduleByDay();
            this.renderMeetNJ();
            this.renderSpeakers();
            this.renderNotifications();
            this.renderGallery();
            this.renderChecklist();
            this.updateStats();
        }
        // ================================
        // SCHEDULE RENDERING
        // ================================
        renderScheduleByDay(filter = '') {
            const container = document.getElementById('scheduleByDay');
            if (!container) return;
            
            const self = this;
            let html = '';
            
            ['Friday', 'Saturday', 'Sunday'].forEach(day => {
                let events = self.data.scheduleByDay[day] || [];
                
                if (filter) {
                    events = events.filter(event => 
                        JSON.stringify(event).toLowerCase().includes(filter.toLowerCase())
                    );
                }
                
                if (events.length > 0 || !filter) {
                    html += `
                        <div class="schedule-day-section">
                            <div class="day-header">
                                <h3>${day}</h3>
                                <p>${events.length} events scheduled</p>
                            </div>
                    `;
                    
                    if (events.length === 0) {
                        html += '<p style="text-align: center;">No events match your search</p>';
                    } else {
                        events.forEach(event => {
                            const isFavorite = self.favorites.has(event.id);
                            html += `
                                <div class="time-slot">
                                    <div class="time-indicator">
                                        ${event.time || 'TBD'}<br>
                                        ${event.timeend ? `to<br>${event.timeend}` : ''}
                                    </div>
                                    <div class="event-card">
                                        <div style="display: flex; justify-content: space-between; align-items: start;">
                                            <div style="flex: 1;">
                                                <div class="event-title">${event.title || 'Event'}</div>
                                                ${event.type ? `<span class="badge">${event.type}</span>` : ''}
                                                ${event.speaker ? `<span class="badge">🎤 ${event.speaker}</span>` : ''}
                                            </div>
                                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                                    data-event-id="${event.id}"
                                                    style="margin-left: 1rem;">
                                                ${isFavorite ? '❤️' : '🤍'}
                                            </button>
                                        </div>
                                        <div class="event-location">📍 ${event.location || 'TBD'}</div>
                                        <div class="event-description">${event.description || ''}</div>
                                    </div>
                                </div>
                            `;
                        });
                    }
                    
                    html += '</div>';
                }
            });
            
            if (html === '') {
                html = '<div class="empty-state"><h3>No schedule data available</h3><p>Please sync with Google Sheets from the Admin page</p></div>';
            }
            
            container.innerHTML = html;

            container.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const eventId = parseInt(this.getAttribute('data-event-id'));
                    self.toggleFavorite(eventId);
                });
            });
        }

        renderMySchedule() {
            const container = document.getElementById('myScheduleList');
            if (!container) return;
            
            const self = this;
            const favoriteEvents = this.data.schedule.filter(item => this.favorites.has(item.id));

            const favoriteCountElement = document.getElementById('favoriteCount');
            if (favoriteCountElement) {
                favoriteCountElement.textContent = favoriteEvents.length;
            }

            if (favoriteEvents.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No favorites yet</h3><p>Go to the Master Schedule and tap the 🤍 icon!</p></div>';
                return;
            }

            let byDay = {};
            favoriteEvents.forEach(event => {
                if (!byDay[event.day]) byDay[event.day] = [];
                byDay[event.day].push(event);
            });

            let html = '';
            ['Friday', 'Saturday', 'Sunday'].forEach(day => {
                if (byDay[day] && byDay[day].length > 0) {
                    html += `
                        <div class="schedule-day-section">
                            <div class="day-header">
                                <h3>${day}</h3>
                                <p>${byDay[day].length} events</p>
                            </div>
                    `;
                    
                    byDay[day].forEach(event => {
                        html += `
                            <div class="time-slot">
                                <div class="time-indicator">
                                    ${event.time}<br>
                                    ${event.timeend ? `to<br>${event.timeend}` : ''}
                                </div>
                                <div class="event-card">
                                    <div style="display: flex; justify-content: space-between;">
                                        <div style="flex: 1;">
                                            <div class="event-title">${event.title}</div>
                                            ${event.type ? `<span class="badge">${event.type}</span>` : ''}
                                        </div>
                                        <button class="favorite-btn active" data-event-id="${event.id}">❤️</button>
                                    </div>
                                    <div class="event-location">📍 ${event.location}</div>
                                    <div class="event-description">${event.description}</div>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                }
            });

            container.innerHTML = html;

            container.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const eventId = parseInt(this.getAttribute('data-event-id'));
                    self.toggleFavorite(eventId);
                });
            });
        }

        toggleFavorite(eventId) {
            if (this.favorites.has(eventId)) {
                this.favorites.delete(eventId);
            } else {
                this.favorites.add(eventId);
            }
            localStorage.setItem(`favorites_${this.user.userId}`, JSON.stringify([...this.favorites]));
            this.renderScheduleByDay();
            this.renderMySchedule();
        }

        // ================================
        // PROFILE & MEMBER RENDERING
        // ================================
        renderMeetNJ(filter = '') {
            const container = document.getElementById('meetNjList');
            if (!container) return;
            
            let items = this.data.members;

            if (filter) {
                items = items.filter(item => 
                    JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
                );
            }

            if (items.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No members found</h3></div>';
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="profile-card">
                    <img src="${item.photo || 'https://via.placeholder.com/100/8b0000/d4af37?text=' + (item.name ? item.name.charAt(0) : 'M')}" alt="${item.name}" class="profile-photo" onerror="this.src='https://via.placeholder.com/100/8b0000/d4af37?text=M'">
                    <div class="profile-info">
                        <div class="profile-name">${item.name || 'Member'}</div>
                        <div class="profile-station">${item.station || ''}</div>
                        <div class="profile-details">
                            <strong>🌈 ${item.assembly || ''}</strong><br><br>
                            ${item.bio || ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        renderSpeakers(filter = '') {
            const container = document.getElementById('speakersList');
            if (!container) return;
            
            let items = this.data.speakers;

            if (filter) {
                items = items.filter(item => 
                    JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
                );
            }

            if (items.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No speakers found</h3></div>';
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="profile-card">
                    <img src="${item.photo || 'https://via.placeholder.com/100/8b0000/d4af37?text=' + (item.name ? item.name.charAt(0) : 'S')}" alt="${item.name}" class="profile-photo" onerror="this.src='https://via.placeholder.com/100/8b0000/d4af37?text=S'">
                    <div class="profile-info">
                        <div class="profile-name">${item.name || 'Speaker'}</div>
                        <div class="profile-station">${item.title || ''}</div>
                        <div class="profile-details">
                            ${item.bio || ''}<br><br>
                            ${item.event ? `<strong>🎤 Speaking at:</strong> ${item.event}` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // ================================
        // NOTIFICATIONS
        // ================================
        renderNotifications() {
            const container = document.getElementById('notificationsList');
            if (!container) return;
            
            const items = this.data.notifications;

            const notifCountElement = document.getElementById('notifCount');
            if (notifCountElement) {
                notifCountElement.textContent = items.length;
            }

            if (items.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No notifications yet</h3></div>';
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="notification-card">
                    <div class="card-title">${item.title || 'Notification'}</div>
                    <div class="card-meta">
                        <span>📅 ${item.date || ''}</span>
                        <span>🕒 ${item.time || ''}</span>
                    </div>
                    <div class="card-description">${item.message || ''}</div>
                </div>
            `).join('');
        }

        sendNotification() {
            const titleElement = document.getElementById('notifTitle');
            const messageElement = document.getElementById('notifMessage');
            
            if (!titleElement || !messageElement) return;
            
            const title = titleElement.value;
            const message = messageElement.value;

            if (!title || !message) {
                alert('⚠️ Please enter both title and message');
                return;
            }

            const notification = {
                id: Date.now(),
                title: title,
                message: message,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };

            this.data.notifications.unshift(notification);
            localStorage.setItem('custom_notifications', JSON.stringify(this.data.notifications));
            
            this.renderNotifications();

            titleElement.value = '';
            messageElement.value = '';

            alert('✅ Notification sent!');
        }

        // ================================
        // CHECKLIST
        // ================================
        renderChecklist() {
            const container = document.getElementById('checklistItems');
            if (!container) return;
            
            const self = this;
            
            const checkedItems = JSON.parse(localStorage.getItem(`checklist_${this.user.userId}`) || '[]');
            
            this.data.checklist.forEach(item => {
                if (item.id) {
                    item.id = parseInt(item.id);
                    item.checked = checkedItems.includes(item.id);
                }
            });

            const categories = [...new Set(this.data.checklist.map(item => item.category))].filter(c => c);

            if (categories.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No checklist items</h3></div>';
                return;
            }

            container.innerHTML = categories.map(category => `
                <div class="category-section">
                    <h3 class="category-title">${category}</h3>
                    ${this.data.checklist
                        .filter(item => item.category === category)
                        .map(item => `
                            <div class="checklist-item ${item.checked ? 'checked' : ''}">
                                <input type="checkbox" 
                                       id="check-${item.id}" 
                                       data-item-id="${item.id}"
                                       ${item.checked ? 'checked' : ''}>
                                <label for="check-${item.id}">${item.text || 'Item'}</label>
                            </div>
                        `).join('')}
                </div>
            `).join('');

            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const itemId = parseInt(this.getAttribute('data-item-id'));
                    self.toggleChecklistItem(itemId);
                });
            });

            this.updateChecklistStats();
        }

        toggleChecklistItem(itemId) {
            const item = this.data.checklist.find(i => i.id === itemId);
            if (item) {
                item.checked = !item.checked;
                const checkedItems = this.data.checklist
                    .filter(i => i.checked)
                    .map(i => i.id);
                localStorage.setItem(`checklist_${this.user.userId}`, JSON.stringify(checkedItems));
                this.renderChecklist();
            }
        }

        updateChecklistStats() {
            const total = this.data.checklist.length;
            const checked = this.data.checklist.filter(i => i.checked).length;
            const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

            const totalElement = document.getElementById('checklistTotal');
            const checkedElement = document.getElementById('checklistChecked');
            const progressElement = document.getElementById('checklistProgress');
            
            if (totalElement) totalElement.textContent = total;
            if (checkedElement) checkedElement.textContent = checked;
            if (progressElement) progressElement.textContent = progress + '%';
        }

        // ================================
        // GALLERY
        // ================================
        renderGallery() {
            const container = document.getElementById('galleryGrid');
            if (!container) return;
            
            const items = this.data.gallery;

            const galleryCountElement = document.getElementById('galleryCount');
            if (galleryCountElement) {
                galleryCountElement.textContent = items.length;
            }

            if (items.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No photos yet</h3></div>';
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="gallery-item">
                    <img src="${item.url || 'https://via.placeholder.com/300/8b0000/d4af37?text=Photo'}" alt="${item.caption || 'Photo'}" onerror="this.src='https://via.placeholder.com/300/8b0000/d4af37?text=Photo'">
                    <div class="gallery-caption">${item.caption || 'Photo'}</div>
                </div>
            `).join('');
        }

        // ================================
        // PROFILE & NOTES
        // ================================
        loadProfile() {
            const profile = JSON.parse(localStorage.getItem(`profile_${this.user.userId}`) || '{}');
            
            const nameElement = document.getElementById('profileName');
            const assemblyElement = document.getElementById('profileAssembly');
            const stationElement = document.getElementById('profileStation');
            const emailElement = document.getElementById('profileEmail');
            const phoneElement = document.getElementById('profilePhone');
            const bioElement = document.getElementById('profileBio');
            
            if (nameElement) nameElement.value = profile.name || this.user.name || '';
            if (assemblyElement) assemblyElement.value = profile.assembly || '';
            if (stationElement) stationElement.value = profile.station || '';
            if (emailElement) emailElement.value = profile.email || this.user.email || '';
            if (phoneElement) phoneElement.value = profile.phone || '';
            if (bioElement) bioElement.value = profile.bio || '';
        }

        saveProfile() {
            const profile = {
                name: document.getElementById('profileName').value,
                assembly: document.getElementById('profileAssembly').value,
                station: document.getElementById('profileStation').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                bio: document.getElementById('profileBio').value
            };
            localStorage.setItem(`profile_${this.user.userId}`, JSON.stringify(profile));
            alert('✅ Profile saved!');
        }

        loadNotes() {
            const notes = localStorage.getItem(`notes_${this.user.userId}`) || '';
            const notesElement = document.getElementById('notesText');
            if (notesElement) {
                notesElement.value = notes;
            }
        }

        saveNotes() {
            const notesElement = document.getElementById('notesText');
            if (!notesElement) return;
            
            const notes = notesElement.value;
            localStorage.setItem(`notes_${this.user.userId}`, notes);
            alert('✅ Notes saved!');
        }

        // ================================
        // MESSAGES
        // ================================
        loadMessages() {
            const messages = JSON.parse(localStorage.getItem(`messages_${this.user.userId}`) || '[]');
            this.data.messages = messages;
            this.renderMessages();
        }

        renderMessages() {
            const container = document.getElementById('messagesList');
            if (!container) return;
            
            const messages = this.data.messages;

            const messageCountElement = document.getElementById('messageCount');
            if (messageCountElement) {
                messageCountElement.textContent = messages.length;
            }
            
            if (messages.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No messages yet</h3><p>Start a conversation!</p></div>';
                return;
            }

            container.innerHTML = messages.map(msg => `
                <div class="message-item">
                    <div class="message-header">
                        <span class="message-sender">${msg.sender || 'Anonymous'}</span>
                        <span class="message-time">${msg.time || ''}</span>
                    </div>
                    <div class="message-text">${msg.text || ''}</div>
                </div>
            `).join('');

            container.scrollTop = container.scrollHeight;
        }

        sendMessage() {
            const messageTextElement = document.getElementById('messageText');
            if (!messageTextElement) return;
            
            const text = messageTextElement.value.trim();
            if (!text) return;

            const sender = this.user.name || this.user.username || 'Anonymous';

            const message = {
                sender: sender,
                text: text,
                time: new Date().toLocaleTimeString()
            };

            this.data.messages.push(message);
            localStorage.setItem(`messages_${this.user.userId}`, JSON.stringify(this.data.messages));
            
            messageTextElement.value = '';
            this.renderMessages();
        }

        updateStats() {
            this.updateChecklistStats();
            this.updateAdminStats();
        }

        updateAdminStats() {
            const eventCountElement = document.getElementById('adminEventCount');
            const memberCountElement = document.getElementById('adminMemberCount');
            const speakerCountElement = document.getElementById('adminSpeakerCount');
            
            if (eventCountElement) eventCountElement.textContent = this.data.schedule.length;
            if (memberCountElement) memberCountElement.textContent = this.data.members.length;
            if (speakerCountElement) speakerCountElement.textContent = this.data.speakers.length;
        }
        // ================================
        // ADMIN - EVENT MANAGEMENT
        // ================================
        showEventForm() {
            if (!this.isAdmin) {
                alert('Access denied');
                return;
            }
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

        hideEventForm() {
            document.getElementById('eventForm').style.display = 'none';
        }

        saveEvent() {
            if (!this.isAdmin) return;

            const event = {
                id: document.getElementById('eventEditId').value || Date.now(),
                title: document.getElementById('eventTitle').value,
                day: document.getElementById('eventDay').value,
                time: document.getElementById('eventTime').value,
                timeend: document.getElementById('eventTimeEnd').value,
                location: document.getElementById('eventLocation').value,
                description: document.getElementById('eventDescription').value,
                type: document.getElementById('eventType').value,
                speaker: document.getElementById('eventSpeaker').value
            };

            if (!event.title || !event.time || !event.location) {
                alert('Please fill in at least: Title, Time, and Location');
                return;
            }

            const existingIndex = this.data.schedule.findIndex(e => e.id == event.id);
            if (existingIndex >= 0) {
                this.data.schedule[existingIndex] = event;
            } else {
                event.id = parseInt(event.id);
                this.data.schedule.push(event);
            }

            localStorage.setItem('admin_events', JSON.stringify(this.data.schedule));
            
            this.organizeScheduleByDay();
            this.renderAdminEvents();
            this.hideEventForm();
            this.updateAdminStats();
            
            alert('✅ Event saved! Note: This is saved locally. To sync to Google Sheets, update your sheet manually.');
        }

        editEvent(eventId) {
            if (!this.isAdmin) return;

            const event = this.data.schedule.find(e => e.id == eventId);
            if (!event) return;

            document.getElementById('eventForm').style.display = 'block';
            document.getElementById('eventEditId').value = event.id;
            document.getElementById('eventTitle').value = event.title || '';
            document.getElementById('eventDay').value = event.day || 'Friday';
            document.getElementById('eventTime').value = event.time || '';
            document.getElementById('eventTimeEnd').value = event.timeend || '';
            document.getElementById('eventLocation').value = event.location || '';
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventType').value = event.type || '';
            document.getElementById('eventSpeaker').value = event.speaker || '';

            window.scrollTo(0, document.getElementById('eventForm').offsetTop - 100);
        }

        deleteEvent(eventId) {
            if (!this.isAdmin) return;

            if (!confirm('Are you sure you want to delete this event?')) return;

            this.data.schedule = this.data.schedule.filter(e => e.id != eventId);
            localStorage.setItem('admin_events', JSON.stringify(this.data.schedule));
            
            this.organizeScheduleByDay();
            this.renderAdminEvents();
            this.updateAdminStats();
            
            alert('✅ Event deleted!');
        }

        renderAdminEvents() {
            const container = document.getElementById('adminEventsList');
            if (!container) return;

            if (this.data.schedule.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 1rem;">No events yet. Add your first event!</p>';
                return;
            }

            let html = '';
            ['Friday', 'Saturday', 'Sunday'].forEach(day => {
                const dayEvents = this.data.schedule.filter(e => e.day === day);
                if (dayEvents.length > 0) {
                    html += `<h4 style="color: var(--primary-gold); margin-top: 1rem;">${day} (${dayEvents.length} events)</h4>`;
                    dayEvents.forEach(event => {
                        html += `
                            <div style="background: rgba(212, 175, 55, 0.1); border: 2px solid var(--primary-gold); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div style="flex: 1;">
                                        <strong style="color: var(--primary-gold);">${event.title}</strong><br>
                                        <span>🕒 ${event.time} ${event.timeend ? `- ${event.timeend}` : ''}</span><br>
                                        <span>📍 ${event.location}</span>
                                        ${event.type ? `<br><span class="badge" style="margin-top: 0.5rem;">${event.type}</span>` : ''}
                                    </div>
                                    <div class="btn-group" style="gap: 0.5rem;">
                                        <button class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="app.editEvent(${event.id})">✏️ Edit</button>
                                        <button class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: #dc143c;" onclick="app.deleteEvent(${event.id})">🗑️ Delete</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
            });

            container.innerHTML = html;
        }

        // ================================
        // ADMIN - SPEAKER MANAGEMENT
        // ================================
        showSpeakerForm() {
            if (!this.isAdmin) return;
            
            document.getElementById('speakerForm').style.display = 'block';
            document.getElementById('speakerEditId').value = '';
            document.getElementById('speakerName').value = '';
            document.getElementById('speakerTitle').value = '';
            document.getElementById('speakerPhoto').value = '';
            document.getElementById('speakerBio').value = '';
            document.getElementById('speakerEvent').value = '';
        }

        hideSpeakerForm() {
            document.getElementById('speakerForm').style.display = 'none';
        }

        saveSpeaker() {
            if (!this.isAdmin) return;

            const speaker = {
                id: document.getElementById('speakerEditId').value || Date.now(),
                name: document.getElementById('speakerName').value,
                title: document.getElementById('speakerTitle').value,
                photo: document.getElementById('speakerPhoto').value,
                bio: document.getElementById('speakerBio').value,
                event: document.getElementById('speakerEvent').value
            };

            if (!speaker.name || !speaker.title) {
                alert('Please fill in at least: Name and Title');
                return;
            }

            const existingIndex = this.data.speakers.findIndex(s => s.id == speaker.id);
            if (existingIndex >= 0) {
                this.data.speakers[existingIndex] = speaker;
            } else {
                this.data.speakers.push(speaker);
            }

            localStorage.setItem('admin_speakers', JSON.stringify(this.data.speakers));
            
            this.renderAdminSpeakers();
            this.hideSpeakerForm();
            this.updateAdminStats();
            
            alert('✅ Speaker saved!');
        }

        editSpeaker(speakerId) {
            if (!this.isAdmin) return;

            const speaker = this.data.speakers.find(s => s.id == speakerId);
            if (!speaker) return;

            document.getElementById('speakerForm').style.display = 'block';
            document.getElementById('speakerEditId').value = speaker.id;
            document.getElementById('speakerName').value = speaker.name || '';
            document.getElementById('speakerTitle').value = speaker.title || '';
            document.getElementById('speakerPhoto').value = speaker.photo || '';
            document.getElementById('speakerBio').value = speaker.bio || '';
            document.getElementById('speakerEvent').value = speaker.event || '';

            window.scrollTo(0, document.getElementById('speakerForm').offsetTop - 100);
        }

        deleteSpeaker(speakerId) {
            if (!this.isAdmin) return;

            if (!confirm('Are you sure you want to delete this speaker?')) return;

            this.data.speakers = this.data.speakers.filter(s => s.id != speakerId);
            localStorage.setItem('admin_speakers', JSON.stringify(this.data.speakers));
            
            this.renderAdminSpeakers();
            this.updateAdminStats();
            
            alert('✅ Speaker deleted!');
        }

        renderAdminSpeakers() {
            const container = document.getElementById('adminSpeakersList');
            if (!container) return;

            if (this.data.speakers.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 1rem;">No speakers yet. Add your first speaker!</p>';
                return;
            }

            let html = '';
            this.data.speakers.forEach(speaker => {
                html += `
                    <div style="background: rgba(212, 175, 55, 0.1); border: 2px solid var(--primary-gold); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                                <strong style="color: var(--primary-gold);">${speaker.name}</strong><br>
                                <span>${speaker.title}</span>
                                ${speaker.event ? `<br><span>🎤 Speaking at: ${speaker.event}</span>` : ''}
                            </div>
                            <div class="btn-group" style="gap: 0.5rem;">
                                <button class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="app.editSpeaker('${speaker.id}')">✏️ Edit</button>
                                <button class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: #dc143c;" onclick="app.deleteSpeaker('${speaker.id}')">🗑️ Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }
    }

    // Initialize the app
    app = new ConventionApp();
});
