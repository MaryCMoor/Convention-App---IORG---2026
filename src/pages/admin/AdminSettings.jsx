import { useState, useCallback } from 'react';
import {
  Settings, Save, RefreshCw, Trash2, AlertTriangle, CheckCircle,
  XCircle, Database, Wrench, Bell, Shield, Palette, Calendar,
  MapPin, Phone, Mail, Globe, Twitter, Facebook, Instagram,
  Youtube, Linkedin, Eye, EyeOff, Download, Upload
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './AdminSettings.css';

const AdminSettings = () => {
  const { 
    conventionConfig, 
    updateConventionConfig, 
    clearAllData, 
    resetMockData, 
    toggleMaintenanceMode,
    exportAllData,
    auditLog,
    clearAuditLog
  } = useAdmin();

  const [config, setConfig] = useState(conventionConfig);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmAction, setConfirmAction] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'venue', label: 'Venue', icon: MapPin },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Wrench },
    { id: 'data', label: 'Data Tools', icon: Database },
    { id: 'audit', label: 'Audit Log', icon: Shield },
  ];

  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const saveConfig = () => {
    updateConventionConfig(config);
    showMessage('success', 'Settings saved successfully!');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleConfirmAction = (action) => {
    setConfirmAction(action);
  };

  const executeConfirmedAction = () => {
    switch (confirmAction) {
      case 'clearAll':
        clearAllData();
        showMessage('success', 'All data cleared. Application reset to defaults.');
        break;
      case 'resetMock':
        resetMockData();
        showMessage('success', 'Mock data restored to defaults.');
        break;
      case 'toggleMaintenance':
        toggleMaintenanceMode();
        setMaintenanceMode(!maintenanceMode);
        showMessage('success', `Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}.`);
        break;
      case 'exportAll':
        exportAllData();
        showMessage('success', 'All data exported as JSON.');
        break;
      case 'clearAudit':
        clearAuditLog();
        showMessage('success', 'Audit log cleared.');
        break;
      default:
        break;
    }
    setConfirmAction(null);
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convention-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('success', 'Configuration exported.');
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setConfig(imported);
        showMessage('success', 'Configuration imported. Click Save to apply.');
      } catch (err) {
        showMessage('error', 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleString() : '—';

  return (
    <div className="admin-settings">
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Convention configuration and system tools</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportConfig}><Download size={18} /><span>Export Config</span></button>
          <label className="btn btn-secondary" style={{cursor:'pointer'}}><Upload size={18} /><span>Import Config</span><input type="file" accept=".json" onChange={importConfig} style={{display:'none'}} /></label>
          <button className="btn btn-primary" onClick={saveConfig}><Save size={18} /><span>Save Changes</span></button>
        </div>
      </header>

      {message.type && <div className={`alert alert-${message.type}`}><span className={message.type==='success'?'success-icon':'error-icon'}>{message.type==='success'?<CheckCircle size={20}/>:<XCircle size={20}/>}</span><span>{message.text}</span><button onClick={()=>setMessage({type:'',text:''})} aria-label="Dismiss"><X size={16}/></button></div>}

      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections">
          {tabs.map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab===tab.id?'active':''}`} onClick={()=>setActiveTab(tab.id)}><tab.icon size={18} /><span>{tab.label}</span></button>
          ))}
        </nav>

        <div className="settings-content">
          {/* General Tab */}
          {activeTab==='general' && (
            <section className="settings-section">
              <h2 className="section-title">Convention Information</h2>
              <div className="settings-grid">
                <div className="form-field"><label htmlFor="conventionName">Convention Name *</label><input type="text" id="conventionName" value={config.general?.name||''} onChange={e=>handleConfigChange('general','name',e.target.value)} required/></div>
                <div className="form-field"><label htmlFor="conventionTheme">Theme *</label><input type="text" id="conventionTheme" value={config.general?.theme||''} onChange={e=>handleConfigChange('general','theme',e.target.value)} required/></div>
                <div className="form-field"><label htmlFor="countdownDate">Countdown Date *</label><input type="date" id="countdownDate" value={config.general?.countdownDate||''} onChange={e=>handleConfigChange('general','countdownDate',e.target.value)} required/></div>
                <div className="form-field"><label htmlFor="conventionYear">Year</label><input type="text" id="conventionYear" value={config.general?.year||''} onChange={e=>handleConfigChange('general','year',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="tagline">Tagline</label><input type="text" id="tagline" value={config.general?.tagline||''} onChange={e=>handleConfigChange('general','tagline',e.target.value)} /></div>
                <div className="form-field full-width"><label htmlFor="description">Description</label><textarea id="description" value={config.general?.description||''} onChange={e=>handleConfigChange('general','description',e.target.value)} rows={3} /></div>
              </div>
            </section>
          )}

          {/* Venue Tab */}
          {activeTab==='venue' && (
            <section className="settings-section">
              <h2 className="section-title">Venue Details</h2>
              <div className="settings-grid">
                <div className="form-field"><label htmlFor="venueName">Venue Name *</label><input type="text" id="venueName" value={config.venue?.name||''} onChange={e=>handleConfigChange('venue','name',e.target.value)} required/></div>
                <div className="form-field"><label htmlFor="venueAddress">Address</label><input type="text" id="venueAddress" value={config.venue?.address||''} onChange={e=>handleConfigChange('venue','address',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="venueCity">City</label><input type="text" id="venueCity" value={config.venue?.city||''} onChange={e=>handleConfigChange('venue','city',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="venueState">State/Province</label><input type="text" id="venueState" value={config.venue?.state||''} onChange={e=>handleConfigChange('venue','state',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="venueZip">ZIP/Postal Code</label><input type="text" id="venueZip" value={config.venue?.zip||''} onChange={e=>handleConfigChange('venue','zip',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="venueCountry">Country</label><input type="text" id="venueCountry" value={config.venue?.country||''} onChange={e=>handleConfigChange('venue','country',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="venuePhone">Venue Phone</label><input type="tel" id="venuePhone" value={config.venue?.phone||''} onChange={e=>handleConfigChange('venue','phone',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="venueWebsite">Venue Website</label><input type="url" id="venueWebsite" value={config.venue?.website||''} onChange={e=>handleConfigChange('venue','website',e.target.value)} /></div>
                <div className="form-field full-width"><label htmlFor="venueNotes">Notes</label><textarea id="venueNotes" value={config.venue?.notes||''} onChange={e=>handleConfigChange('venue','notes',e.target.value)} rows={3} /></div>
              </div>
            </section>
          )}

          {/* Contact Tab */}
          {activeTab==='contact' && (
            <section className="settings-section">
              <h2 className="section-title">Contact Information</h2>
              <div className="settings-grid">
                <div className="form-field"><label htmlFor="contactEmail">Primary Email *</label><input type="email" id="contactEmail" value={config.contact?.email||''} onChange={e=>handleConfigChange('contact','email',e.target.value)} required/></div>
                <div className="form-field"><label htmlFor="contactPhone">Phone</label><input type="tel" id="contactPhone" value={config.contact?.phone||''} onChange={e=>handleConfigChange('contact','phone',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="contactAddress">Mailing Address</label><input type="text" id="contactAddress" value={config.contact?.address||''} onChange={e=>handleConfigChange('contact','address',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="contactCity">City</label><input type="text" id="contactCity" value={config.contact?.city||''} onChange={e=>handleConfigChange('contact','city',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="contactState">State/Province</label><input type="text" id="contactState" value={config.contact?.state||''} onChange={e=>handleConfigChange('contact','state',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="contactZip">ZIP/Postal Code</label><input type="text" id="contactZip" value={config.contact?.zip||''} onChange={e=>handleConfigChange('contact','zip',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="emergencyContact">Emergency Contact Name</label><input type="text" id="emergencyContact" value={config.contact?.emergencyContact||''} onChange={e=>handleConfigChange('contact','emergencyContact',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="emergencyPhone">Emergency Phone</label><input type="tel" id="emergencyPhone" value={config.contact?.emergencyPhone||''} onChange={e=>handleConfigChange('contact','emergencyPhone',e.target.value)} /></div>
              </div>
            </section>
          )}

          {/* Social Tab */}
          {activeTab==='social' && (
            <section className="settings-section">
              <h2 className="section-title">Social Media Links</h2>
              <div className="settings-grid">
                {['twitter','facebook','instagram','youtube','linkedin'].map(platform => {
                  const Icon = {twitter:Twitter,facebook:Facebook,instagram:Instagram,youtube:Youtube,linkedin:Linkedin}[platform];
                  return (
                    <div key={platform} className="form-field social-field">
                      <label htmlFor={platform}><Icon size={18} /> {platform.charAt(0).toUpperCase()+platform.slice(1)}</label>
                      <input type="url" id={platform} value={config.social?.[platform]||''} onChange={e=>handleConfigChange('social',platform,e.target.value)} placeholder={`https://${platform}.com/...`} />
                    </div>
                  );
                })}
                <div className="form-field full-width"><label htmlFor="hashtag">Official Hashtag</label><input type="text" id="hashtag" value={config.social?.hashtag||''} onChange={e=>handleConfigChange('social','hashtag',e.target.value)} placeholder="#IORG2026" /></div>
              </div>
            </section>
          )}

          {/* Appearance Tab */}
          {activeTab==='appearance' && (
            <section className="settings-section">
              <h2 className="section-title">Appearance & Branding</h2>
              <div className="settings-grid">
                <div className="form-field"><label htmlFor="primaryColor">Primary Color</label><input type="color" id="primaryColor" value={config.appearance?.primaryColor||'#8B0000'} onChange={e=>handleConfigChange('appearance','primaryColor',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="goldColor">Gold/Accent Color</label><input type="color" id="goldColor" value={config.appearance?.goldColor||'#D4AF37'} onChange={e=>handleConfigChange('appearance','goldColor',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="darkModeDefault">Default Dark Mode</label><select id="darkModeDefault" value={config.appearance?.darkModeDefault||'auto'} onChange={e=>handleConfigChange('appearance','darkModeDefault',e.target.value)}><option value="auto">Auto (System)</option><option value="true">Always Dark</option><option value="false">Always Light</option></select></div>
                <div className="form-field"><label htmlFor="logoUrl">Logo URL</label><input type="url" id="logoUrl" value={config.appearance?.logoUrl||''} onChange={e=>handleConfigChange('appearance','logoUrl',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="faviconUrl">Favicon URL</label><input type="url" id="faviconUrl" value={config.appearance?.faviconUrl||''} onChange={e=>handleConfigChange('appearance','faviconUrl',e.target.value)} /></div>
                <div className="form-field"><label htmlFor="mascotImage">Mascot Image URL</label><input type="url" id="mascotImage" value={config.appearance?.mascotImage||''} onChange={e=>handleConfigChange('appearance','mascotImage',e.target.value)} /></div>
              </div>
            </section>
          )}

          {/* System Tab */}
          {activeTab==='system' && (
            <section className="settings-section">
              <h2 className="section-title">System Settings</h2>
              <div className="settings-grid">
                <div className="form-field"><label>Timezone</label><select value={config.system?.timezone||'America/New_York'} onChange={e=>handleConfigChange('system','timezone',e.target.value)}><option value="America/New_York">Eastern (ET)</option><option value="America/Chicago">Central (CT)</option><option value="America/Denver">Mountain (MT)</option><option value="America/Los_Angeles">Pacific (PT)</option></select></div>
                <div className="form-field"><label>Date Format</label><select value={config.system?.dateFormat||'MM/DD/YYYY'} onChange={e=>handleConfigChange('system','dateFormat',e.target.value)}><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></div>
                <div className="form-field"><label>Time Format</label><select value={config.system?.timeFormat||'12h'} onChange={e=>handleConfigChange('system','timeFormat',e.target.value)}><option value="12h">12-hour</option><option value="24h">24-hour</option></select></div>
                <div className="form-field"><label>Language</label><select value={config.system?.language||'en'} onChange={e=>handleConfigChange('system','language',e.target.value)}><option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option></select></div>
                <div className="form-field full-width"><label><input type="checkbox" checked={config.system?.enableNotifications!==false} onChange={e=>handleConfigChange('system','enableNotifications',e.target.checked)}/> Enable Push Notifications</label></div>
                <div className="form-field full-width"><label><input type="checkbox" checked={config.system?.enableOffline!==false} onChange={e=>handleConfigChange('system','enableOffline',e.target.checked)}/> Enable Offline Support</label></div>
                <div className="form-field full-width"><label><input type="checkbox" checked={config.system?.analyticsEnabled!==false} onChange={e=>handleConfigChange('system','analyticsEnabled',e.target.checked)}/> Enable Analytics Tracking</label></div>
              </div>
            </section>
          )}

          {/* Data Tools Tab */}
          {activeTab==='data' && (
            <section className="settings-section">
              <h2 className="section-title">Data Management Tools</h2>
              <p className="section-desc">Dangerous operations - use with caution. All actions persist to localStorage.</p>
              
              <div className="tools-grid">
                <div className="tool-card warning">
                  <div className="tool-icon"><Database size={32} /></div>
                  <div className="tool-info"><h4>Clear All Data</h4><p>Removes ALL localStorage data including attendees, schedule, announcements, and settings. Resets app to empty state.</p></div>
                  <button className="btn btn-danger" onClick={()=>handleConfirmAction('clearAll')}>Clear All Data</button>
                </div>
                <div className="tool-card warning">
                  <div className="tool-icon"><RefreshCw size={32} /></div>
                  <div className="tool-info"><h4>Reset Mock Data</h4><p>Restores all mock data (attendees, schedule, meals, etc.) to factory defaults. Preserves admin-created data.</p></div>
                  <button className="btn btn-warning" onClick={()=>handleConfirmAction('resetMock')}>Reset Mock Data</button>
                </div>
                <div className="tool-card info">
                  <div className="tool-icon"><Bell size={32} /></div>
                  <div className="tool-info"><h4>Toggle Maintenance Mode</h4><p>Shows maintenance banner to all users. Admin portal remains accessible. Current: <strong>{maintenanceMode?'Enabled':'Disabled'}</strong></p></div>
                  <button className="btn btn-secondary" onClick={()=>handleConfirmAction('toggleMaintenance')}>{maintenanceMode?'Disable':'Enable'} Maintenance</button>
                </div>
                <div className="tool-card success">
                  <div className="tool-icon"><Download size={32} /></div>
                  <div className="tool-info"><h4>Export All Data</h4><p>Downloads complete JSON export of all convention data including attendees, schedule, announcements, meals, awards, gallery, surveys, documents, and config.</p></div>
                  <button className="btn btn-primary" onClick={()=>handleConfirmAction('exportAll')}>Export All Data</button>
                </div>
              </div>
            </section>
          )}

          {/* Audit Log Tab */}
          {activeTab==='audit' && (
            <section className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Audit Log</h2>
                <button className="btn btn-danger" onClick={()=>handleConfirmAction('clearAudit')}>Clear Audit Log</button>
              </div>
              <p className="section-desc">All admin actions are logged with timestamps. {auditLog.length} entries.</p>
              
              <div className="audit-table-wrapper">
                <table className="data-table" role="grid">
                  <thead><tr><th>Timestamp</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
                  <tbody>
                    {auditLog.length===0?(
                      <tr><td colSpan={4} className="empty-state"><Shield size={32}/><p>No audit entries</p></td></tr>
                    ):(
                      [...auditLog].reverse().map((entry,i)=><tr key={i}><td>{formatDate(entry.timestamp)}</td><td><span className="audit-action">{entry.action}</span></td><td>{entry.entity||'—'}</td><td>{entry.details||'—'}</td></tr>)
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="modal-overlay" onClick={()=>setConfirmAction(null)}>
          <div className="modal modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Confirm Action</h2></div>
            <div className="modal-body">
              <div className="delete-warning">
                <AlertTriangle size={48} className="warning-icon"/>
                <p>{{
                  clearAll: 'This will delete ALL data and reset the application. This cannot be undone.',
                  resetMock: 'This will restore mock data to defaults. Admin-created data will be preserved.',
                  toggleMaintenance: `This will ${maintenanceMode?'disable':'enable'} maintenance mode for all users.`,
                  exportAll: 'This will download a complete JSON export of all convention data.',
                  clearAudit: 'This will permanently delete all audit log entries. This cannot be undone.',
                }[confirmAction]}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={()=>setConfirmAction(null)}>Cancel</button>
              <button className={`btn ${confirmAction==='clearAll'||confirmAction==='clearAudit'?'btn-danger':confirmAction==='resetMock'?'btn-warning':'btn-primary'}`} onClick={executeConfirmedAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;