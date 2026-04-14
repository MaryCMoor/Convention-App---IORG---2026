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

        // [REST OF THE APP.JS CODE CONTINUES - SAME AS BEFORE]
        // I'll provide the admin-specific methods next
