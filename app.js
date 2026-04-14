// Configuration for Google Sheets
const GOOGLE_SHEETS_CONFIG = {
    // Your published Google Sheet ID
    sheetId: '2PACX-1vTcWlhv_bK1thPxqX8ZaWaswTyaam1poIRptaJe-18E7IQbK39_ffnKvTUPtfeB8CiL5avfPgCoflCl',
    baseUrl: 'https://docs.google.com/spreadsheets/d/e/',
    
    // Sheet names (must match your Google Sheet tab names exactly)
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
            
            // Load user-specific favorites from their own storage key
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
            
            // Display user name
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = this.user.name || this.user.username;
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
                alert('⚠️ Could not load data from Google Sheets. Please check your internet connection.');
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
                    }).filter(item => item.id || item.name || item.title); // Filter out empty rows

                    this.data[sheetType] = items;
                    
                    // Special handling for schedule - organize by day
                    if (sheetType === 'schedule') {
                        this.organizeScheduleByDay();
                    }
                    
                    // Save to localStorage for offline use
                    localStorage.setItem(`data_${sheetType}`, JSON.stringify(items));
                }
            } catch (error) {
                console.error(`Error loading ${sheetType}:`, error);
                // Try to load from cache
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
                // Convert id to number
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
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Show selected page
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            // Update navigation
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
                    this.updateAdminStats();
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

            // Add event listeners to favorite buttons
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

            // Group by day
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

            // Add event listeners
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
            // Save with user ID
            localStorage.setItem(`favorites_${this.user.userId}`, JSON.stringify([...this.favorites]));
            this.renderScheduleByDay();
            this.renderMySchedule();
        }

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
            
            // Save to localStorage (in real app, this would sync to Google Sheets)
            localStorage.setItem('custom_notifications', JSON.stringify(this.data.notifications));
            
            this.renderNotifications();

            titleElement.value = '';
            messageElement.value = '';

            alert('✅ Notification sent!');
        }

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

            // Add event listeners
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

        updateAdminStats() {
            const eventCountElement = document.getElementById('adminEventCount');
            const memberCountElement = document.getElementById('adminMemberCount');
            const speakerCountElement = document.getElementById('adminSpeakerCount');
            
            if (eventCountElement) eventCountElement.textContent = this.data.schedule.length;
            if (memberCountElement) memberCountElement.textContent = this.data.members.length;
            if (speakerCountElement) speakerCountElement.textContent = this.data.speakers.length;
        }

        updateStats() {
            this.updateChecklistStats();
            this.updateAdminStats();
        }
    }

    // Initialize the app
    app = new ConventionApp();
});
