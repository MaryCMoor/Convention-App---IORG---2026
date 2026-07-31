import { useState, useMemo } from 'react'
import { 
  Users, Search, Filter, ChevronDown, ChevronUp,
  Mail, Phone, MessageCircle, Star, Heart, MapPin,
  Building, Award, Calendar, Shield, Download
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Directory.css'

const Directory = () => {
  const { state, currentUser } = useApp()
  
  const [filterRole, setFilterRole] = useState('all')
  const [filterChapter, setFilterChapter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('card')
  const [expandedAttendee, setExpandedAttendee] = useState(null)

  const attendees = state.attendees
  const chapters = [...new Set(attendees.map(a => a.chapter))].sort()

  const filteredAttendees = useMemo(() => {
    let result = attendees
    
    if (filterRole !== 'all') {
      result = result.filter(a => a.role === filterRole)
    }
    
    if (filterChapter !== 'all') {
      result = result.filter(a => a.chapter === filterChapter)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.chapter.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.title?.toLowerCase().includes(query)
      )
    }
    
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [attendees, filterRole, filterChapter, searchQuery])

  const roles = ['all', 'attendee', 'grand_officer', 'advisor', 'administrator', 'distinguished_guest']

  const getRoleBadge = (role) => {
    const badges = {
      grand_officer: { label: 'Grand Officer', class: 'badge-gold' },
      advisor: { label: 'Advisor', class: 'badge-blue' },
      administrator: { label: 'Administrator', class: 'badge-red' },
      distinguished_guest: { label: 'Distinguished Guest', class: 'badge-purple' },
      attendee: { label: 'Attendee', class: 'badge-gray' },
    }
    const badge = badges[role] || { label: role, class: '' }
    return <span className={`badge ${badge.class}`}>{badge.label}</span>
  }

  const getRoleIcon = (role) => {
    const icons = {
      grand_officer: <Award size={16} />,
      advisor: <Shield size={16} />,
      administrator: <Building size={16} />,
      distinguished_guest: <Star size={16} />,
      attendee: <Users size={16} />,
    }
    return icons[role] || <Users size={16} />
  }

  return (
    <div className="directory-page">
      <div className="page-header">
        <h1 className="page-title">
          <Users className="page-title-icon" size={32} />
          Attendee Directory
        </h1>
        <p className="page-subtitle">Find and connect with convention attendees, officers, and guests</p>
      </div>

      {/* Stats Bar */}
      <div className="directory-stats">
        <div className="stat-item">
          <strong>{attendees.length}</strong>
          <span>Total Attendees</span>
        </div>
        <div className="stat-item">
          <strong>{attendees.filter(a => a.role === 'grand_officer').length}</strong>
          <span>Grand Officers</span>
        </div>
        <div className="stat-item">
          <strong>{attendees.filter(a => a.role === 'advisor').length}</strong>
          <span>Advisors</span>
        </div>
        <div className="stat-item">
          <strong>{chapters.length}</strong>
          <span>Chapters</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Role</label>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="filter-select">
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Chapter</label>
          <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)} className="filter-select">
            <option value="all">All Chapters</option>
            {chapters.map(chapter => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, chapter, email, title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="view-toggle">
          <button className={`view-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')}>
            <div className="grid-icon" />
          </button>
          <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
            <div className="list-icon" />
          </button>
        </div>
      </div>

      {/* Directory */}
      <div className="directory-container">
        {viewMode === 'card' ? (
          <div className="directory-grid">
            {filteredAttendees.map(attendee => (
              <AttendeeCard 
                key={attendee.id} 
                attendee={attendee} 
                isExpanded={expandedAttendee === attendee.id}
                onToggle={() => setExpandedAttendee(expandedAttendee === attendee.id ? null : attendee.id)}
                currentUser={currentUser}
              />
            ))}
          </div>
        ) : (
          <div className="directory-list">
            <div className="list-header">
              <div className="list-col name-col">Name</div>
              <div className="list-col role-col">Role</div>
              <div className="list-col chapter-col">Chapter</div>
              <div className="list-col contact-col">Contact</div>
              <div className="list-col actions-col"></div>
            </div>
            {filteredAttendees.map(attendee => (
              <AttendeeRow key={attendee.id} attendee={attendee} currentUser={currentUser} />
            ))}
          </div>
        )}
        
        {filteredAttendees.length === 0 && (
          <div className="empty-state">
            <Users size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Attendees Found</h3>
            <p className="empty-state-message">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const AttendeeCard = ({ attendee, isExpanded, onToggle, currentUser }) => {
  return (
    <article className={`attendee-card ${isExpanded ? 'expanded' : ''} ${attendee.role !== 'attendee' ? 'special-role' : ''}`}>
      <div className="card-header" onClick={onToggle}>
        <div className="avatar-section">
          <div className={`avatar ${attendee.role !== 'attendee' ? 'special' : ''}`}>
            {attendee.name.split(' ').map(n => n[0]).join('')}
          </div>
          {attendee.role !== 'attendee' && (
            <div className="role-indicator">
              {getRoleIcon(attendee.role)}
            </div>
          )}
        </div>
        <div className="card-main">
          <div className="name-row">
            <h3>{attendee.name}</h3>
            {getRoleBadge(attendee.role)}
          </div>
          <p className="chapter">
            <Building size={14} />
            {attendee.chapter}
          </p>
          {attendee.title && <p className="title">{attendee.title}</p>}
        </div>
        <div className="card-expand">
          <ChevronDown size={20} className={isExpanded ? 'rotated' : ''} />
        </div>
      </div>

      {isExpanded && (
        <div className="card-expanded">
          <div className="expanded-info">
            <div className="info-row">
              <Mail size={16} />
              <a href={`mailto:${attendee.email}`}>{attendee.email}</a>
            </div>
            <div className="info-row">
              <Phone size={16} />
              <a href={`tel:${attendee.phone}`}>{attendee.phone}</a>
            </div>
            {attendee.emergencyContact && (
              <div className="info-row emergency">
                <Shield size={16} />
                <span>Emergency: {attendee.emergencyContact.name} - {attendee.emergencyContact.phone}</span>
              </div>
            )}
            {attendee.room && (
              <div className="info-row">
                <MapPin size={16} />
                <span>Room: {attendee.room}</span>
              </div>
            )}
          </div>
          <div className="card-actions">
            {currentUser && currentUser.id !== attendee.id && (
              <>
                <button className="btn btn-outline btn-sm">
                  <MessageCircle size={14} /> Message
                </button>
                <button className="btn btn-outline btn-sm">
                  <Mail size={14} /> Email
                </button>
              </>
            )}
            <button className="btn btn-gold btn-sm">
              <Star size={14} /> Add Contact
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

const AttendeeRow = ({ attendee, currentUser }) => (
  <div className="list-row">
    <div className="list-col name-col">
      <div className="attendee-name-cell">
        <div className={`avatar small ${attendee.role !== 'attendee' ? 'special' : ''}`}>
          {attendee.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <strong>{attendee.name}</strong>
          {attendee.title && <span className="title-small">{attendee.title}</span>}
        </div>
      </div>
    </div>
    <div className="list-col role-col">
      {getRoleBadge(attendee.role)}
    </div>
    <div className="list-col chapter-col">
      <Building size={14} /> {attendee.chapter}
    </div>
    <div className="list-col contact-col">
      <a href={`mailto:${attendee.email}`}>{attendee.email}</a>
    </div>
    <div className="list-col actions-col">
      {currentUser && currentUser.id !== attendee.id && (
        <div className="row-actions">
          <button className="icon-btn" title="Message"><MessageCircle size={16} /></button>
          <button className="icon-btn" title="Email"><Mail size={16} /></button>
          <button className="icon-btn" title="Add Contact"><Star size={16} /></button>
        </div>
      )}
    </div>
  </div>
)

export default Directory