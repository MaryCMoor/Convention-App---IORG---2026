import { useState, useMemo } from 'react'
import { 
  Users, Gavel, ClipboardList, Award, 
  Search, Filter, ChevronDown, ChevronUp,
  Mail, Phone, MessageCircle, Star, Heart,
  Building, Calendar, CheckCircle, AlertTriangle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Committees.css'

const Committees = () => {
  const { state, currentUser } = useApp()
  
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCommittee, setExpandedCommittee] = useState(null)

  const committees = state.committees

  const filteredCommittees = useMemo(() => {
    let result = committees
    
    if (filterType !== 'all') {
      result = result.filter(c => c.type === filterType)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.chair.toLowerCase().includes(query) ||
        c.members.some(m => m.name.toLowerCase().includes(query))
      )
    }
    
    return result.sort((a, b) => {
      const typeOrder = { standing: 1, special: 2, ad_hoc: 3 }
      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99)
    })
  }, [committees, filterType, searchQuery])

  const committeeTypes = [
    { value: 'all', label: 'All Committees', icon: Users, count: committees.length },
    { value: 'standing', label: 'Standing', icon: Building, count: committees.filter(c => c.type === 'standing').length },
    { value: 'special', label: 'Special', icon: Award, count: committees.filter(c => c.type === 'special').length },
    { value: 'ad_hoc', label: 'Ad Hoc', icon: AlertTriangle, count: committees.filter(c => c.type === 'ad_hoc').length },
  ]

  const getTypeBadge = (type) => {
    const badges = {
      standing: { label: 'Standing', class: 'badge-gold' },
      special: { label: 'Special', class: 'badge-red' },
      ad_hoc: { label: 'Ad Hoc', class: 'badge-blue' },
    }
    const badge = badges[type] || { label: type, class: '' }
    return <span className={`badge ${badge.class}`}>{badge.label}</span>
  }

  return (
    <div className="committees-page">
      <div className="page-header">
        <h1 className="page-title">
          <Users className="page-title-icon" size={32} />
          Committees
        </h1>
        <p className="page-subtitle">Standing, special, and ad hoc committees for the 103rd Grand Assembly</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-types">
          {committeeTypes.map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                className={`filter-type-btn ${filterType === type.value ? 'active' : ''}`}
                onClick={() => setFilterType(type.value)}
              >
                <Icon size={16} />
                <span>{type.label}</span>
                {type.count > 0 && <span className="filter-count">{type.count}</span>}
              </button>
            )
          })}
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search committees..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Committee Stats */}
      <div className="committee-stats">
        <div className="stat-card">
          <span className="stat-number">{committees.length}</span>
          <span className="stat-label">Total Committees</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{committees.reduce((sum, c) => sum + c.members.length, 0)}</span>
          <span className="stat-label">Total Members</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{committees.filter(c => c.type === 'standing').length}</span>
          <span className="stat-label">Standing Committees</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{committees.filter(c => c.type === 'special').length}</span>
          <span className="stat-label">Special Committees</span>
        </div>
      </div>

      {/* Committees List */}
      <div className="committees-list">
        {filteredCommittees.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Committees Found</h3>
            <p className="empty-state-message">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredCommittees.map(committee => (
            <CommitteeCard 
              key={committee.id} 
              committee={committee} 
              isExpanded={expandedCommittee === committee.id}
              onToggle={() => setExpandedCommittee(expandedCommittee === committee.id ? null : committee.id)}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  )
}

const CommitteeCard = ({ committee, isExpanded, onToggle, currentUser }) => {
  const [showAllMembers, setShowAllMembers] = useState(false)
  const visibleMembers = showAllMembers ? committee.members : committee.members.slice(0, 6)

  const typeIcons = {
    standing: <Building size={20} />,
    special: <Award size={20} />,
    ad_hoc: <AlertTriangle size={20} />,
  }

  return (
    <article className={`committee-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="committee-header" onClick={onToggle}>
        <div className="committee-icon" style={{ backgroundColor: committee.color }}>
          {typeIcons[committee.type] || <Users size={20} />}
        </div>
        <div className="committee-main-info">
          <div className="committee-title-row">
            <h3>{committee.name}</h3>
            {getTypeBadge(committee.type)}
          </div>
          <p className="committee-description">{committee.description}</p>
          <div className="committee-meta">
            <span><Gavel size={14} /> Chair: {committee.chair}</span>
            <span><Users size={14} /> {committee.members.length} members</span>
            <span><Calendar size={14} /> {committee.meetings} meetings</span>
          </div>
        </div>
        <div className="committee-expand">
          <ChevronDown size={20} className={isExpanded ? 'rotated' : ''} />
        </div>
      </div>

      {isExpanded && (
        <div className="committee-expanded">
          <div className="committee-details">
            <div className="detail-section">
              <h4>Chairperson</h4>
              <div className="chair-info">
                <div className="chair-avatar">{committee.chair.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <strong>{committee.chair}</strong>
                  <div className="contact-row">
                    <a href={`mailto:${committee.chairEmail}`}><Mail size={14} /> {committee.chairEmail}</a>
                    <a href={`tel:${committee.chairPhone}`}><Phone size={14} /> {committee.chairPhone}</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Members ({committee.members.length})</h4>
              <div className="members-grid">
                {visibleMembers.map((member, i) => (
                  <MemberCard key={i} member={member} index={i} />
                ))}
                {committee.members.length > 6 && (
                  <button 
                    className="show-more-btn"
                    onClick={e => { e.stopPropagation(); setShowAllMembers(!showAllMembers) }}
                  >
                    {showAllMembers ? 'Show Less' : `Show ${committee.members.length - 6} More Members`}
                  </button>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h4>Meeting Schedule</h4>
              <div className="meeting-schedule">
                {committee.schedule.map((meeting, i) => (
                  <div key={i} className="meeting-item">
                    <span className="meeting-time">{meeting.time}</span>
                    <span className="meeting-desc">{meeting.description}</span>
                    <span className="meeting-location">{meeting.location}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>Responsibilities</h4>
              <ul className="responsibilities-list">
                {committee.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>

            {committee.budget && (
              <div className="detail-section">
                <h4>Budget</h4>
                <p className="budget-amount">${committee.budget.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="committee-actions">
            {currentUser && (
              <>
                <button className="btn btn-outline">
                  <Mail size={16} />
                  Email Committee
                </button>
                <button className="btn btn-outline">
                  <MessageCircle size={16} />
                  Message Chair
                </button>
              </>
            )}
            <button className="btn btn-gold">
              <CheckCircle size={16} />
              Volunteer Interest
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

const MemberCard = ({ member, index }) => (
  <div className="member-card">
    <div className="member-avatar">{member.name.split(' ').map(n => n[0]).join('')}</div>
    <div className="member-info">
      <strong>{member.name}</strong>
      <span className="member-role">{member.role}</span>
      <span className="member-chapter">{member.chapter}</span>
    </div>
    <div className="member-contact">
      <a href={`mailto:${member.email}`} title="Email"><Mail size={14} /></a>
      <a href={`tel:${member.phone}`} title="Phone"><Phone size={14} /></a>
    </div>
  </div>
)

const getTypeBadge = (type) => {
  const badges = {
    standing: { label: 'Standing', class: 'badge-gold' },
    special: { label: 'Special', class: 'badge-red' },
    ad_hoc: { label: 'Ad Hoc', class: 'badge-blue' },
  }
  const badge = badges[type] || { label: type, class: '' }
  return <span className={`badge ${badge.class}`}>{badge.label}</span>
}

export default Committees