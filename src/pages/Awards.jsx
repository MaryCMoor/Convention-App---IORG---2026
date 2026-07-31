import { useState, useMemo } from 'react'
import { 
  Award, Star, Heart, Crown, Medal, Sparkles,
  Filter, Search, ChevronDown, ChevronUp,
  Calendar, User, Users, Download, Eye, EyeOff
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Awards.css'

const Awards = () => {
  const { state, currentUser } = useApp()
  
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAward, setExpandedAward] = useState(null)

  const awards = state.awards
  const categories = [...new Set(awards.map(a => a.category))].sort()

  const filteredAwards = useMemo(() => {
    let result = awards
    
    if (filterCategory !== 'all') {
      result = result.filter(a => a.category === filterCategory)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.recipient?.toLowerCase().includes(query) ||
        a.nominees.some(n => n.toLowerCase().includes(query))
      )
    }
    
    return result.sort((a, b) => {
      const categoryOrder = { 'grand_officer': 1, 'achievement': 2, 'service': 3, 'special': 4, 'fun': 5 }
      return (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99)
    })
  }, [awards, filterCategory, searchQuery])

  const userAwards = currentUser ? awards.filter(a => a.recipient === currentUser.name) : []

  const getCategoryIcon = (category) => {
    const icons = {
      grand_officer: <Crown size={20} />,
      achievement: <Medal size={20} />,
      service: <Heart size={20} />,
      special: <Sparkles size={20} />,
      fun: <Star size={20} />,
    }
    return icons[category] || <Award size={20} />
  }

  const getCategoryLabel = (category) => {
    const labels = {
      grand_officer: 'Grand Officer',
      achievement: 'Achievement',
      service: 'Service',
      special: 'Special Recognition',
      fun: 'Fun Awards',
    }
    return labels[category] || category
  }

  const getCategoryBadge = (category) => {
    const badges = {
      grand_officer: 'badge-gold',
      achievement: 'badge-red',
      service: 'badge-blue',
      special: 'badge-purple',
      fun: 'badge-green',
    }
    return <span className={`badge ${badges[category] || 'badge-gray'}`}>{getCategoryLabel(category)}</span>
  }

  return (
    <div className="awards-page">
      <div className="page-header">
        <h1 className="page-title">
          <Award className="page-title-icon" size={32} />
          Awards & Recognition
        </h1>
        <p className="page-subtitle">Celebrating excellence, service, and achievement at the 103rd Grand Assembly</p>
      </div>

      {/* User's Awards */}
      {userAwards.length > 0 && (
        <div className="user-awards-section">
          <h2>Your Awards</h2>
          <div className="user-awards-grid">
            {userAwards.map(award => (
              <UserAwardCard key={award.id} award={award} />
            ))}
          </div>
        </div>
      )}

      {/* Awards Stats */}
      <div className="awards-stats">
        <div className="stat-card">
          <Award size={28} className="stat-icon" />
          <div>
            <strong>{awards.length}</strong>
            <span>Total Awards</span>
          </div>
        </div>
        <div className="stat-card">
          <Crown size={28} className="stat-icon" />
          <div>
            <strong>{awards.filter(a => a.category === 'grand_officer').length}</strong>
            <span>Grand Officer</span>
          </div>
        </div>
        <div className="stat-card">
          <Medal size={28} className="stat-icon" />
          <div>
            <strong>{awards.filter(a => a.category === 'achievement').length}</strong>
            <span>Achievement</span>
          </div>
        </div>
        <div className="stat-card">
          <Heart size={28} className="stat-icon" />
          <div>
            <strong>{awards.filter(a => a.category === 'service').length}</strong>
            <span>Service</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>)}
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search awards, recipients, nominees..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Awards by Category */}
      <div className="awards-container">
        {categories.map(category => {
          const categoryAwards = filteredAwards.filter(a => a.category === category)
          if (categoryAwards.length === 0) return null
          
          return (
            <div key={category} className="category-section">
              <div className="category-header">
                {getCategoryIcon(category)}
                <h2>{getCategoryLabel(category)}</h2>
                <span className="category-count">{categoryAwards.length} award{categoryAwards.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="awards-grid">
                {categoryAwards.map(award => (
                  <AwardCard 
                    key={award.id} 
                    award={award} 
                    isExpanded={expandedAward === award.id}
                    onToggle={() => setExpandedAward(expandedAward === award.id ? null : award.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
        
        {filteredAwards.length === 0 && (
          <div className="empty-state">
            <Award size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Awards Found</h3>
            <p className="empty-state-message">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Lion Mascot Awards Spotlight */}
      <div className="lion-awards-spotlight">
        <div className="spotlight-content">
          <div className="spotlight-lion">🦁</div>
          <h2>Lion-Hearted Awards</h2>
          <p>Special recognition awards inspired by our convention mascot - the courageous lion representing leadership, bravery, and the spirit of the Greatest Showman!</p>
          <div className="spotlight-awards">
            {[
              { name: '🦁 Lionhearted Award', desc: 'For exceptional courage and leadership' },
              { name: '✨ Spotlight Award', desc: 'For outstanding performance and presence' },
              { name: '🎪 Greatest Performer Award', desc: 'For embodying the spirit of the show' },
              { name: '⭐ Ringmaster Award', desc: 'For exemplary event coordination' },
              { name: '❤️ Love Award', desc: 'For spreading kindness and sisterhood' },
            ].map((award, i) => (
              <div key={i} className="spotlight-award">
                <span className="spotlight-award-name">{award.name}</span>
                <span className="spotlight-award-desc">{award.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const UserAwardCard = ({ award }) => (
  <div className="user-award-card">
    <div className="user-award-icon" style={{ backgroundColor: award.color }}>
      {award.icon}
    </div>
    <div className="user-award-info">
      <h3>{award.name}</h3>
      <p>{award.description}</p>
      <span className="award-date">Awarded: {new Date(award.date).toLocaleDateString()}</span>
    </div>
  </div>
)

const AwardCard = ({ award, isExpanded, onToggle }) => {
  return (
    <article className={`award-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="award-card-header" onClick={onToggle}>
        <div className="award-icon" style={{ backgroundColor: award.color }}>
          {award.icon}
        </div>
        <div className="award-main-info">
          <div className="award-title-row">
            <h3>{award.name}</h3>
            {getCategoryBadge(award.category)}
          </div>
          <p className="award-description">{award.description}</p>
          <div className="award-meta">
            {award.recipient && <span><User size={14} /> Recipient: {award.recipient}</span>}
            <span><Calendar size={14} /> {new Date(award.date).toLocaleDateString()}</span>
            <span><Users size={14} /> {award.nominees.length} nominee{award.nominees.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="award-expand">
          <ChevronDown size={20} className={isExpanded ? 'rotated' : ''} />
        </div>
      </div>

      {isExpanded && (
        <div className="award-expanded">
          <div className="award-details">
            <div className="detail-section">
              <h4>About This Award</h4>
              <p>{award.fullDescription || award.description}</p>
            </div>

            {award.criteria && (
              <div className="detail-section">
                <h4>Selection Criteria</h4>
                <ul className="criteria-list">
                  {award.criteria.map((criterion, i) => (
                    <li key={i}>{criterion}</li>
                  ))}
                </ul>
              </div>
            )}

            {award.recipient && (
              <div className="detail-section">
                <h4>Recipient</h4>
                <div className="recipient-info">
                  <div className="recipient-avatar">{award.recipient.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <strong>{award.recipient}</strong>
                    {award.recipientChapter && <span>{award.recipientChapter}</span>}
                    {award.recipientTitle && <span>{award.recipientTitle}</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>Nominees</h4>
              <ul className="nominees-list">
                {award.nominees.map((nominee, i) => (
                  <li key={i}>
                    {nominee}
                    {nominee === award.recipient && <span className="winner-badge">🏆 Winner</span>}
                  </li>
                ))}
              </ul>
            </div>

            {award.history && award.history.length > 0 && (
              <div className="detail-section">
                <h4>Past Recipients</h4>
                <ul className="history-list">
                  {award.history.map((h, i) => (
                    <li key={i}><strong>{h.year}</strong>: {h.recipient}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export default Awards