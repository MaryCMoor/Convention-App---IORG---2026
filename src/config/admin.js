/**
 * Admin Portal Configuration
 * 
 * The secret route for accessing the hidden admin portal.
 * Change this value to customize the secret URL.
 * 
 * Example values:
 * - '/admin/IORG-2026-ADMIN'
 * - '/IORG-2026-ADMIN'
 * - '/admin/secret-panel-x7k9'
 * - '/rainbow-admin-2026'
 */

export const ADMIN_CONFIG = {
  // Secret route path - ONLY way to access admin portal
  // Must start with /
  secretRoute: '/admin/IORG-2026-ADMIN',
  
  // Optional: Route prefix for all admin pages (derived from secretRoute)
  // e.g., if secretRoute is '/admin/IORG-2026-ADMIN', prefix is '/admin/IORG-2026-ADMIN'
  routePrefix: '/admin/IORG-2026-ADMIN',
  
  // Admin portal settings
  settings: {
    // Portal title
    title: 'IORG 2026 Grand Assembly - Admin Portal',
    
    // Items per page for paginated lists
    itemsPerPage: 25,
    
    // Enable debug logging
    debug: false,
  },
  
  // Admin navigation sections
  navigation: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'attendees', label: 'Manage Attendees', icon: 'Users' },
    { id: 'schedule', label: 'Manage Schedule', icon: 'Calendar' },
    { id: 'announcements', label: 'Announcements', icon: 'Megaphone' },
    { id: 'meals', label: 'Meals', icon: 'Utensils' },
    { id: 'awards', label: 'Awards', icon: 'Award' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'gallery', label: 'Gallery', icon: 'Images' },
    { id: 'surveys', label: 'Surveys', icon: 'ClipboardList' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ],
};

export default ADMIN_CONFIG;