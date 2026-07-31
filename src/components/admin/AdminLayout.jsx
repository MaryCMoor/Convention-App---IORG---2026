import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Megaphone, Utensils, Award,
  FileText, Images, ClipboardList, Settings, ChevronLeft, ChevronRight,
  Crown, LogOut, Sun, Moon, Save, Download, RotateCcw, Upload, Plus
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './AdminLayout.css';

const AdminLayout = () => {
  const { 
    sidebarOpen, setSidebarOpen, activeSection, setActiveSection,
    config, exportData, importData, resetToDefaults,
    toast
  } = useAdmin();
  const navigate = useNavigate();
  const [fileInput, setFileInput] = useState(null);

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const navigation = ADMIN_CONFIG.navigation;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`} role="navigation" aria-label="Admin navigation">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Crown size={28} className="brand-icon" />
            <span className="brand-text">Admin Portal</span>
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Admin sections">
          <ul role="list">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <NavLink
                    to={`${ADMIN_CONFIG.routePrefix}/${item.id}`}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveSection(item.id)}
                    title={sidebarOpen ? '' : item.label}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <button className="icon-btn" onClick={exportData} title="Export Data" aria-label="Export all data as JSON">
              <Download size={18} />
            </button>
            <button className="icon-btn" onClick={() => fileInput?.click()} title="Import Data" aria-label="Import data from JSON">
              <Upload size={18} />
            </button>
            <input 
              type="file" 
              ref={setFileInput} 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleFileImport}
              aria-label="Import JSON file"
            />
            <button className="icon-btn" onClick={resetToDefaults} title="Reset to Defaults" aria-label="Reset all data to defaults">
              <RotateCcw size={18} />
            </button>
          </div>
          <div className="sidebar-user">
            <span className="user-role">Administrator</span>
            <button className="logout-btn" onClick={handleLogout} aria-label="Return to public site">
              <LogOut size={16} />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" role="main">
        <header className="admin-header">
          <h1 className="page-title">{navigation.find(n => n.id === activeSection)?.label || 'Dashboard'}</h1>
          <div className="header-actions">
            <button className="theme-toggle" aria-label="Toggle theme">
              <Sun size={20} />
            </button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="alert" aria-live="polite">
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;