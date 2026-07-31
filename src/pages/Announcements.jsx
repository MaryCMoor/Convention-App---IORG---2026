import { useState, useMemo } from 'react'
import { 
  Bell, AlertTriangle, Info, AlertCircle, 
  Filter, Search, ChevronDown, ChevronUp,
  Download, Eye, EyeOff, Flag, X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Announcements.css'

const Announcements = () => {
  const { state, currentUser, dismissAnnouncement } = useApp()
  
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showDismissed, setShowDismissed] = useState(false)

  const filteredAnnouncements = useMemo(() => {
    let announcements = state.announcements
    
    // Filter by role if logged in
    if (currentUser) {
      announcements = announcements.filter(a => 
        a.targetRoles.includes('all') || a.targetRoles.includes(currentUser.role)
      )
    }
    
    // Filter by type
    if (filter !== 'all') {
      announcements = announcements.filter(a => a.type === filter)
    }
    
    // Filter by search
    if (search) {
      const query = search.toLowerCase()
      announcements = announcements.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.body.toLowerCase().includes(query) ||
        a.author.toLowerCase().includes(query)
      )
    }
    
    // Filter dismissed
    const dismissedIds = currentUser?.dismissedAnnouncements || []
    if (!showDismissed) {
      announcements = announcements.filter(a => !dismissedIds.includes(a.id))
    } else {
      announcements = announcements.filter(a => dismissedIds.includes(a.id))
    }
    
    // Sort by date (newest first)
    return announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [state.announcements, currentUser, filter, search, showDismissed])

  const typeCounts = useMemo(() => {
    const counts = {}
    state.announcements.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1
    })
    return counts
  }, [state.announcements])

  const types = [
    { value: 'all', label: 'All', icon: Bell, count: state.announcements.length },
    { value: 'general', label: 'General', icon: Info, count: typeCounts.general || 0 },
    { value: 'warning', label: 'Important', icon: AlertTriangle, count: typeCounts.warning || 0 },
    { value: 'info', label: 'Info', icon: Info, count: typeCounts.info || 0 },
    { value: 'emergency', label: 'Emergency', icon: AlertCircle, count: typeCounts.emergency || 0 },
  ]

  const handleDismiss = (id) => {
    dismissAnnouncement(id)
  }

  const handleDismissAll = () => {
    filteredAnnouncements.forEach(a => dismissAnnouncement(a.id))
  }

  return (
    <div className="announcements-page">
      <div className="page-header">
        <h1 className="page-title">
          <Bell className="page-title-icon" size={32} />
          Announcements
        </h1>
        <p className="page-subtitle">Convention updates, important notices, and real-time information</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-types">
          {types.map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                className={`filter-type-btn ${filter === type.value ? 'active' : ''}`}
                onClick={() => setFilter(type.value)}
              >
                <Icon size={16} />
                <span>{type.label}</span>
                {type.count > 0 && <span className="filter-count">{type.count}</span>}
              </button>
            )
          })}
        </div>
        <div className="filter-search">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-actions">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showDismissed}
              onChange={e => setShowDismissed(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span>Show Dismissed</span>
          </label>
          {filteredAnnouncements.length > 0 && !showDismissed && (
            <button className="btn btn-ghost btn-sm" onClick={handleDismissAll}>
              <X size={14} />
              Dismiss All
            </button>
          )}
        </div>
      </div>

      {/* Emergency Banner */}
      {filteredAnnouncements.some(a => a.type === 'emergency') && !showDismissed && (
        <div className="emergency-banner">
          <AlertCircle size={24} />
          <div className="emergency-content">
            <strong>Emergency Notice Active</strong>
            <p>There are {filteredAnnouncements.filter(a => a.type === 'emergency').length} emergency announcement{filteredAnnouncements.filter(a => a.type === 'emergency').length !== 1 ? 's' : ''}. Please review immediately.</p>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="announcements-list">
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-state">
            {showDismissed ? (
              <>
                <Flag size={48} className="empty-state-icon" />
                <h3 className="empty-state-title">No Dismissed Announcements</h3>
                <p className="empty-state-message">Announcements you've dismissed will appear here.</p>
              </>
            ) : (
              <>
                <Bell size={48} className="empty-state-icon" />
                <h3 className="empty-state-title">No Announcements</h3>
                <p className="empty-state-message">Check back for updates during convention.</p>
              </>
            )}
          </div>
        ) : (
          filteredAnnouncements.map(ann => (
            <AnnouncementCard 
              key={ann.id} 
              announcement={ann} 
              onDismiss={handleDismiss}
              isDismissed={currentUser?.dismissedAnnouncements?.includes(ann.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredAnnouncements.length > 20 && (
        <div className="pagination">
          <button className="btn btn-outline" disabled>Previous</button>
          <span>Page 1 of {Math.ceil(filteredAnnouncements.length / 20)}</span>
          <button className="btn btn-outline">Next</button>
        </div>
      )}
    </div>
  )
}

const AnnouncementCard = ({ announcement, onDismiss, isDismissed }) => {
  const [expanded, setExpanded] = useState(false)
  const showFull = announcement.body.length > 200

  const typeIcons = {
    general: <Info size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
    emergency: <AlertCircle size={16} />,
  }

  return (
    <article className={`announcement-card ${announcement.type} ${isDismissed ? 'dismissed' : ''}`}>
      <div className="announcement-header">
        <div className="announcement-type-badge">
          {typeIcons[announcement.type] || typeIcons.general}
          <span>{announcement.type.replace('_', ' ')}</span>
        </div>
        <div className="announcement-meta">
          <span className="announcement-time">{new Date(announcement.createdAt).toLocaleString()}</span>
          <span className="announcement-author">{announcement.author}</span>
          <span className="announcement-role">{announcement.authorRole}</span>
        </div>
      </div>
      
      <h3 className="announcement-title">{announcement.title}</h3>
      
      <div className="announcement-body">
        {showFull && !expanded ? (
          <>
            <p className="announcement-preview">{announcement.body.substring(0, 200)}...</p>
            <button className="read-more-btn" onClick={() => setExpanded(true)}>
              Read more
            </button>
          </>
        ) : (
          <p>{announcement.body}</p>
        )}
        {expanded && showFull && (
          <button className="read-less-btn" onClick={() => setExpanded(false)}>
            Show less
          </button>
        )}
      </div>

      {announcement.attachments && announcement.attachments.length > 0 && (
        <div className="announcement-attachments">
          {announcement.attachments.map((att, i) => (
            <a key={i} href={att.url} className="attachment-link" target="_blank" rel="noopener">
              <Download size={16} />
              {att.name}
            </a>
          ))}
        </div>
      )}

      <div className="announcement-footer">
        <div className="announcement-targets">
          {announcement.targetRoles.map(role => (
            <span key={role} className="target-badge">{role.replace('_', ' ')}</span>
          ))}
        </div>
        {!isDismissed && (
          <button 
            className="dismiss-btn" 
            onClick={() => onDismiss(announcement.id)}
            aria-label="Dismiss announcement"
          >
            <X size={16} />
          </button>
        )}
        {isDismissed && (
          <span className="dismissed-badge">Dismissed</span>
        )}
      </div>
    </article>
  )
}

export default Announcements