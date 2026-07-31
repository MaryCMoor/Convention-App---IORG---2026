import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockAttendees, mockSchedule, mockAnnouncements, mockMeals, mockAwards, mockDocuments, mockGallery, mockSurveys, conventionConfig } from '../data/mockData';

const AdminContext = createContext(null);

// Generate unique IDs
const generateId = (prefix = 'item') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Local storage keys
const STORAGE_KEYS = {
  attendees: 'iorg2026_admin_attendees',
  schedule: 'iorg2026_admin_schedule',
  announcements: 'iorg2026_admin_announcements',
  meals: 'iorg2026_admin_meals',
  awards: 'iorg2026_admin_awards',
  documents: 'iorg2026_admin_documents',
  gallery: 'iorg2026_admin_gallery',
  surveys: 'iorg2026_admin_surveys',
  config: 'iorg2026_admin_config',
};

// Load data from localStorage or use mock data as fallback
const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
    return fallback;
  }
};

// Save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

// Audit log storage
const AUDIT_LOG_KEY = 'iorg2026_admin_audit_log';
const loadAuditLog = () => loadFromStorage(AUDIT_LOG_KEY, []);
const saveAuditLog = (log) => saveToStorage(AUDIT_LOG_KEY, log);

const addAuditEntry = (action, entity, details) => {
  const log = loadAuditLog();
  log.push({ id: generateId('audit'), action, entity, details, timestamp: new Date().toISOString() });
  saveAuditLog(log);
};

export const AdminProvider = ({ children }) => {
  // Initialize state from localStorage or mock data
  const [attendees, setAttendees] = useState(() => loadFromStorage(STORAGE_KEYS.attendees, mockAttendees));
  const [schedule, setSchedule] = useState(() => loadFromStorage(STORAGE_KEYS.schedule, mockSchedule));
  const [announcements, setAnnouncements] = useState(() => loadFromStorage(STORAGE_KEYS.announcements, mockAnnouncements));
  const [meals, setMeals] = useState(() => loadFromStorage(STORAGE_KEYS.meals, mockMeals));
  const [awards, setAwards] = useState(() => loadFromStorage(STORAGE_KEYS.awards, mockAwards));
  const [documents, setDocuments] = useState(() => loadFromStorage(STORAGE_KEYS.documents, mockDocuments));
  const [gallery, setGallery] = useState(() => loadFromStorage(STORAGE_KEYS.gallery, mockGallery));
  const [surveys, setSurveys] = useState(() => loadFromStorage(STORAGE_KEYS.surveys, mockSurveys));
  const [config, setConfig] = useState(() => loadFromStorage(STORAGE_KEYS.config, conventionConfig));
  const [auditLog, setAuditLog] = useState(() => loadAuditLog());
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iorg2026_maintenance_mode') || 'false');
    } catch { return false; }
  });
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Persist to localStorage whenever data changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.attendees, attendees); }, [attendees]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.schedule, schedule); }, [schedule]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.announcements, announcements); }, [announcements]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.meals, meals); }, [meals]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.awards, awards); }, [awards]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.documents, documents); }, [documents]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.gallery, gallery); }, [gallery]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.surveys, surveys); }, [surveys]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.config, config); }, [config]);
  useEffect(() => { saveAuditLog(auditLog); }, [auditLog]);
  useEffect(() => { localStorage.setItem('iorg2026_maintenance_mode', JSON.stringify(maintenanceMode)); }, [maintenanceMode]);

  // Toast notification helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ===== ATTENDEES CRUD =====
  const addAttendee = useCallback((attendee) => {
    const newAttendee = { ...attendee, id: generateId('attendee'), createdAt: new Date().toISOString() };
    setAttendees(prev => [...prev, newAttendee]);
    addAuditEntry('create', 'attendee', `Added attendee: ${newAttendee.name || newAttendee.id}`);
    showToast('Attendee added successfully');
    return newAttendee;
  }, [showToast]);

  const updateAttendee = useCallback((id, updates) => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    addAuditEntry('update', 'attendee', `Updated attendee: ${id}`);
    showToast('Attendee updated successfully');
  }, [showToast]);

  const deleteAttendee = useCallback((id) => {
    setAttendees(prev => prev.filter(a => a.id !== id));
    addAuditEntry('delete', 'attendee', `Deleted attendee: ${id}`);
    showToast('Attendee deleted');
  }, [showToast]);

  // ===== SCHEDULE CRUD =====
  const addEvent = useCallback((event) => {
    const newEvent = { ...event, id: generateId('event'), createdAt: new Date().toISOString() };
    setSchedule(prev => [...prev, newEvent]);
    addAuditEntry('create', 'event', `Created event: ${newEvent.title || newEvent.id}`);
    showToast('Event created successfully');
    return newEvent;
  }, [showToast]);

  const updateEvent = useCallback((id, updates) => {
    setSchedule(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
    addAuditEntry('update', 'event', `Updated event: ${id}`);
    showToast('Event updated successfully');
  }, [showToast]);

  const deleteEvent = useCallback((id) => {
    setSchedule(prev => prev.filter(e => e.id !== id));
    addAuditEntry('delete', 'event', `Deleted event: ${id}`);
    showToast('Event deleted');
  }, [showToast]);

  // ===== ANNOUNCEMENTS CRUD =====
  const addAnnouncement = useCallback((announcement) => {
    const newAnnouncement = { ...announcement, id: generateId('announcement'), createdAt: new Date().toISOString() };
    setAnnouncements(prev => [...prev, newAnnouncement]);
    addAuditEntry('create', 'announcement', `Created announcement: ${newAnnouncement.title || newAnnouncement.id}`);
    showToast('Announcement created');
    return newAnnouncement;
  }, [showToast]);

  const updateAnnouncement = useCallback((id, updates) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    addAuditEntry('update', 'announcement', `Updated announcement: ${id}`);
    showToast('Announcement updated');
  }, [showToast]);

  const deleteAnnouncement = useCallback((id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addAuditEntry('delete', 'announcement', `Deleted announcement: ${id}`);
    showToast('Announcement deleted');
  }, [showToast]);

  // ===== MEALS CRUD =====
  const addMeal = useCallback((meal) => {
    const newMeal = { ...meal, id: generateId('meal'), createdAt: new Date().toISOString() };
    setMeals(prev => [...prev, newMeal]);
    addAuditEntry('create', 'meal', `Added meal: ${newMeal.name || newMeal.id}`);
    showToast('Meal added');
    return newMeal;
  }, [showToast]);

  const updateMeal = useCallback((id, updates) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
    addAuditEntry('update', 'meal', `Updated meal: ${id}`);
    showToast('Meal updated');
  }, [showToast]);

  const deleteMeal = useCallback((id) => {
    setMeals(prev => prev.filter(m => m.id !== id));
    addAuditEntry('delete', 'meal', `Deleted meal: ${id}`);
    showToast('Meal deleted');
  }, [showToast]);

  // ===== AWARDS CRUD =====
  const addAward = useCallback((award) => {
    const newAward = { ...award, id: generateId('award'), createdAt: new Date().toISOString() };
    setAwards(prev => [...prev, newAward]);
    addAuditEntry('create', 'award', `Created award: ${newAward.name || newAward.id}`);
    showToast('Award created');
    return newAward;
  }, [showToast]);

  const updateAward = useCallback((id, updates) => {
    setAwards(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    addAuditEntry('update', 'award', `Updated award: ${id}`);
    showToast('Award updated');
  }, [showToast]);

  const deleteAward = useCallback((id) => {
    setAwards(prev => prev.filter(a => a.id !== id));
    addAuditEntry('delete', 'award', `Deleted award: ${id}`);
    showToast('Award deleted');
  }, [showToast]);

  // ===== DOCUMENTS CRUD =====
  const addDocument = useCallback((doc) => {
    const newDoc = { ...doc, id: generateId('doc'), createdAt: new Date().toISOString() };
    setDocuments(prev => [...prev, newDoc]);
    addAuditEntry('create', 'document', `Added document: ${newDoc.title || newDoc.id}`);
    showToast('Document added');
    return newDoc;
  }, [showToast]);

  const updateDocument = useCallback((id, updates) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
    addAuditEntry('update', 'document', `Updated document: ${id}`);
    showToast('Document updated');
  }, [showToast]);

  const deleteDocument = useCallback((id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    addAuditEntry('delete', 'document', `Deleted document: ${id}`);
    showToast('Document deleted');
  }, [showToast]);

  // ===== GALLERY CRUD =====
  const addGalleryItem = useCallback((item) => {
    const newItem = { ...item, id: generateId('gallery'), createdAt: new Date().toISOString() };
    setGallery(prev => [...prev, newItem]);
    addAuditEntry('create', 'gallery', `Added gallery item: ${newItem.title || newItem.id}`);
    showToast('Gallery item added');
    return newItem;
  }, [showToast]);

  const updateGalleryItem = useCallback((id, updates) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
    addAuditEntry('update', 'gallery', `Updated gallery item: ${id}`);
    showToast('Gallery item updated');
  }, [showToast]);

  const deleteGalleryItem = useCallback((id) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    addAuditEntry('delete', 'gallery', `Deleted gallery item: ${id}`);
    showToast('Gallery item deleted');
  }, [showToast]);

  // ===== SURVEYS (read-only for responses, CRUD for survey config) =====
  const addSurvey = useCallback((survey) => {
    const newSurvey = { ...survey, id: generateId('survey'), responses: [], createdAt: new Date().toISOString() };
    setSurveys(prev => [...prev, newSurvey]);
    addAuditEntry('create', 'survey', `Created survey: ${newSurvey.title || newSurvey.id}`);
    showToast('Survey created');
    return newSurvey;
  }, [showToast]);

  const updateSurvey = useCallback((id, updates) => {
    setSurveys(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
    addAuditEntry('update', 'survey', `Updated survey: ${id}`);
    showToast('Survey updated');
  }, [showToast]);

  const deleteSurvey = useCallback((id) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
    addAuditEntry('delete', 'survey', `Deleted survey: ${id}`);
    showToast('Survey deleted');
  }, [showToast]);

  const addSurveyResponse = useCallback((surveyId, response) => {
    setSurveys(prev => prev.map(s => 
      s.id === surveyId 
        ? { ...s, responses: [...s.responses, { ...response, id: generateId('response'), submittedAt: new Date().toISOString() }] }
        : s
    ));
  }, []);

  // ===== CONFIG =====
  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
    addAuditEntry('update', 'config', 'Updated convention configuration');
    showToast('Settings saved');
  }, [showToast]);

  // ===== UTILITY =====
  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(AUDIT_LOG_KEY);
    localStorage.removeItem('iorg2026_maintenance_mode');
    setAttendees([]);
    setSchedule([]);
    setAnnouncements([]);
    setMeals([]);
    setAwards([]);
    setDocuments([]);
    setGallery([]);
    setSurveys([]);
    setConfig(conventionConfig);
    setAuditLog([]);
    setMaintenanceMode(false);
    addAuditEntry('clear', 'all', 'Cleared all application data');
    showToast('All data cleared');
  }, [showToast]);

  const resetMockData = useCallback(() => {
    setAttendees(mockAttendees);
    setSchedule(mockSchedule);
    setAnnouncements(mockAnnouncements);
    setMeals(mockMeals);
    setAwards(mockAwards);
    setDocuments(mockDocuments);
    setGallery(mockGallery);
    setSurveys(mockSurveys);
    setConfig(conventionConfig);
    addAuditEntry('reset', 'all', 'Reset mock data to defaults');
    showToast('Mock data restored');
  }, [showToast]);

  const toggleMaintenanceMode = useCallback(() => {
    setMaintenanceMode(prev => {
      const next = !prev;
      addAuditEntry(next ? 'enable' : 'disable', 'maintenance', `Maintenance mode ${next ? 'enabled' : 'disabled'}`);
      showToast(`Maintenance mode ${next ? 'enabled' : 'disabled'}`);
      return next;
    });
  }, [showToast]);

  const exportAllData = useCallback(() => {
    const data = {
      attendees,
      schedule,
      announcements,
      meals,
      awards,
      documents,
      gallery,
      surveys,
      config,
      auditLog,
      maintenanceMode,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iorg2026-full-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditEntry('export', 'all', 'Exported all data');
    showToast('All data exported successfully');
  }, [attendees, schedule, announcements, meals, awards, documents, gallery, surveys, config, auditLog, showToast]);

  const importData = useCallback((jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.attendees) setAttendees(data.attendees);
      if (data.schedule) setSchedule(data.schedule);
      if (data.announcements) setAnnouncements(data.announcements);
      if (data.meals) setMeals(data.meals);
      if (data.awards) setAwards(data.awards);
      if (data.documents) setDocuments(data.documents);
      if (data.gallery) setGallery(data.gallery);
      if (data.surveys) setSurveys(data.surveys);
      if (data.config) setConfig(data.config);
      if (data.auditLog) setAuditLog(data.auditLog);
      if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
      addAuditEntry('import', 'all', 'Imported data from backup');
      showToast('Data imported successfully');
    } catch (e) {
      showToast('Invalid data format', 'error');
    }
  }, [showToast]);

  const clearAuditLog = useCallback(() => {
    setAuditLog([]);
    localStorage.removeItem(AUDIT_LOG_KEY);
    addAuditEntry('clear', 'audit_log', 'Cleared audit log');
    showToast('Audit log cleared');
  }, [showToast]);

  const resetToDefaults = useCallback(() => {
    setAttendees(mockAttendees);
    setSchedule(mockSchedule);
    setAnnouncements(mockAnnouncements);
    setMeals(mockMeals);
    setAwards(mockAwards);
    setDocuments(mockDocuments);
    setGallery(mockGallery);
    setSurveys(mockSurveys);
    setConfig(conventionConfig);
    showToast('All data reset to defaults');
  }, [showToast]);

  const exportData = useCallback(() => {
    const data = {
      attendees,
      schedule,
      announcements,
      meals,
      awards,
      documents,
      gallery,
      surveys,
      config,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iorg2026-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully');
  }, [attendees, schedule, announcements, meals, awards, documents, gallery, surveys, config, showToast]);

  const value = {
    // Data
    attendees,
    schedule,
    announcements,
    meals,
    awards,
    documents,
    gallery,
    surveys,
    config,
    auditLog,
    maintenanceMode,
    // UI State
    sidebarOpen,
    setSidebarOpen,
    activeSection,
    setActiveSection,
    loading,
    toast,
    // Stats
    getStats: useCallback(() => ({
      totalAttendees: attendees.length,
      chaptersAttending: new Set(attendees.map(a => a.chapter).filter(Boolean)).size,
      activeAnnouncements: announcements.filter(a => a.status === 'active').length,
      mealsSelected: meals.length,
      scheduledEvents: schedule.length,
      surveysCompleted: surveys.reduce((sum, s) => sum + (s.responses?.length || 0), 0),
      awardsCreated: awards.length,
      documentsCount: documents.length,
      galleryImages: gallery.length,
    }), [attendees, announcements, meals, schedule, surveys, awards, documents, gallery]),
    // Attendees
    addAttendee,
    updateAttendee,
    deleteAttendee,
    // Schedule
    addEvent,
    updateEvent,
    deleteEvent,
    // Announcements
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    // Meals
    addMeal,
    updateMeal,
    deleteMeal,
    // Awards
    addAward,
    updateAward,
    deleteAward,
    // Documents
    addDocument,
    updateDocument,
    deleteDocument,
    // Gallery
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    // Surveys
    addSurvey,
    updateSurvey,
    deleteSurvey,
    addSurveyResponse,
    // Config
    updateConfig,
    // Utilities
    clearAllData,
    resetMockData,
    toggleMaintenanceMode,
    exportAllData,
    importData,
    clearAuditLog,
    resetToDefaults,
    exportData,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;