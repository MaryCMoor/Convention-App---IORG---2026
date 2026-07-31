import { useState, useEffect, useMemo } from 'react'
import { 
  User, Mail, Phone, Building, Star, Heart, 
  Filter, Search, ChevronDown, ChevronUp, 
  Download, Eye, EyeOff, MapPin, Utensils,
  Award, Calendar, CheckCircle, Bell
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './MyConvention.css'

const MyConvention = () => {
  const { state, currentUser, toggleFavorite, logout } = useApp()
  
  const [activeTab, setActiveTab] = useState('my-events')
  const [showCalendar, setShowCalendar] = useState(false)

  if (!currentUser) {
    return (
      <div className="my-convention-page">
        <div className="page-header">
          <h1 className="page-title">
            <User className="page-title-icon" size={32} />
            My Convention
          </h1>
          <p className="page-subtitle">Sign in to access your personalized convention experience</p>
        </div>
        <div className="auth-required">
          <div className="auth-card">
            <User size={64} className="auth-icon" />
            <h2>Welcome to Your Convention Hub</h2>
            <p>Sign in to view your personal schedule, favorite events, meal selections, housing info, and earned badges.</p>
            <div className="auth-actions">
              <button className="btn btn-gold btn-lg" onClick={() => window.location.href = '/registration'}>
                <User size={20} />
                Sign In / Register
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get user's favorite events
  const favoriteEvents = useMemo(() => 
    state.events.filter(e => currentUser.favorites?.includes(e.id))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  , [state.events, currentUser.favorites])

  // Get user's meals
  const userMeals = useMemo(() => 
    state.meals.filter(m => currentUser.meals?.includes(m.id))
  , [state.meals, currentUser.meals])

  // Get user's housing
  const userHousing = useMemo(() => {
    if (!currentUser.housing) return null
    return state.housing.assignments.find(h => h.id === currentUser.housing)
  }, [state.housing.assignments, currentUser.housing])

  // Get user's housing room type
  const userRoomType = useMemo(() => {
    if (!userHousing) return null
    return state.housing.roomTypes.find(r => r.id === userHousing.roomType)
  }, [state.housing.roomTypes, userHousing])

  // Get user's badges
  const earnedBadges = useMemo(() => 
    state.badges.filter(b => currentUser.badgesEarned?.includes(b.id))
  , [state.badges, currentUser.badgesEarned])

  // Get available badges
  const availableBadges = useMemo(() => 
    state.badges.filter(b => !currentUser.badgesEarned?.includes(b.id))
  , [state.badges, currentUser.badgesEarned])

  // Get user's announcements
  const userAnnouncements = useMemo(() => 
    state.announcements
      .filter(a => a.targetRoles.includes('all') || a.targetRoles.includes(currentUser.role))
      .slice(0, 10)
  , [state.announcements, currentUser.role])

  const tabs = [
    { id: 'my-events', label: 'My Events', icon: Calendar, count: favoriteEvents.length },
    { id: 'meals', label: 'My Meals', icon: Utensils, count: userMeals.length },
    { id: 'housing', label: 'Housing', icon: MapPin, count: userHousing ? 1 : 0 },
    { id: 'badges', label: 'Badges', icon: Award, count: earnedBadges.length },
    { id: 'announcements', label: 'Announcements', icon: Bell, count: userAnnouncements.length },
    { id: 'profile', label: 'Profile', icon: User, count: 0 },
  ]

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="my-convention-page">
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">
            <Calendar className="page-title-icon" size={32} />
            My Convention
          </h1>
          <p className="page-subtitle">Your personalized Grand Assembly experience</p>
        </div>
        <div className="user-badge">
          <span className="badge badge-gold">{currentUser.chapterName}</span>
          <span className={`badge ${currentUser.role === 'grand_officer' ? 'badge-red' : 'badge-gold'}`}>
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser.firstName[0]}{currentUser.lastName[0]}
        </div>
        <div className="profile-info">
          <h2>{currentUser.firstName} {currentUser.lastName}</h2>
          <p>{currentUser.chapterName}</p>
          <div className="profile-meta">
            <span>Badge: <strong>{currentUser.badgeNumber}</strong></span>
            <span>Status: <strong>{currentUser.checkedIn ? '✅ Checked In' : '⏳ Not Checked In'}</strong></span>
          </div>
        </div>
        <div className="profile-actions">
          <button className="btn btn-gold" onClick={() => setActiveTab('profile')}>
            Edit Profile
          </button>
          <button className="btn btn-outline" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* QR Code Badge */}
      <div className="qr-badge-section">
        <div className="qr-badge">
          <div className="qr-badge-header">
            <h3>Your Convention Badge</h3>
            <span className="badge-number">{currentUser.badgeNumber}</span>
          </div>
          <div className="qr-code-container">
            <div className="qr-placeholder">
              <div className="qr-pattern" />
            </div>
            <p className="qr-text">{currentUser.qrCode}</p>
          </div>
          <div className="qr-badge-footer">
            <p>Scan at check-in stations • Show at meal events</p>
            <button className="btn btn-ghost btn-sm">
              <Download size={14} />
              Save to Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="tab-nav" role="tablist" aria-label="My Convention sections">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          )
        })}
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'my-events' && (
          <MyEventsTab events={favoriteEvents} currentUser={currentUser} onToggleFavorite={toggleFavorite} />
        )}
        {activeTab === 'meals' && (
          <MyMealsTab meals={userMeals} dietaryRestrictions={currentUser.dietaryRestrictions} />
        )}
        {activeTab === 'housing' && (
          <MyHousingTab housing={userHousing} roomType={userRoomType} hotel={state.housing.hotel} />
        )}
        {activeTab === 'badges' && (
          <MyBadgesTab earned={earnedBadges} available={availableBadges} />
        )}
        {activeTab === 'announcements' && (
          <MyAnnouncementsTab announcements={userAnnouncements} />
        )}
        {activeTab === 'profile' && (
          <MyProfileTab user={currentUser} chapters={state.chapters} />
        )}
      </div>
    </div>
  )
}

const MyEventsTab = ({ events, currentUser, onToggleFavorite }) => {
  const [viewMode, setViewMode] = useState('list')

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <Calendar size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">No Events Saved</h3>
        <p className="empty-state-message">Browse the schedule and click the heart icon to add events to your personal schedule.</p>
        <a href="/schedule" className="btn btn-gold">
          <Calendar size={18} />
          Browse Schedule
        </a>
      </div>
    )
  }

  const groupedByDay = useMemo(() => {
    const groups = {}
    events.forEach(event => {
      const day = event.startTime.split('T')[0]
      if (!groups[day]) groups[day] = []
      groups[day].push(event)
    })
    return groups
  }, [events])

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <div className="view-toggle">
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="18"/></svg>
            List
          </button>
          <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}>
            <Calendar size={18} />
            Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="events-list">
          {Object.entries(groupedByDay).map(([day, dayEvents]) => (
            <div key={day} className="day-group">
              <h3 className="day-group-header">
                <span>{new Date(day).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                <span>{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</span>
              </h3>
              {dayEvents.map(event => (
                <MyEventCard key={event.id} event={event} currentUser={currentUser} onToggleFavorite={onToggleFavorite} />
              ))}
            </div>
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="calendar-view">
          <div className="calendar-grid">
            {Object.entries(groupedByDay).map(([day, dayEvents]) => (
              <div key={day} className="calendar-day">
                <div className="calendar-day-header">
                  <span className="calendar-day-number">{new Date(day).getDate()}</span>
                  <span className="calendar-day-name">{new Date(day).toLocaleString([], { weekday: 'short' })}</span>
                </div>
                {dayEvents.map(event => (
                  <div key={event.id} className="calendar-event">
                    <span className="calendar-event-time">{new Date(event.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="calendar-event-name">{event.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MyEventCard = ({ event, currentUser, onToggleFavorite }) => {
  const isFav = currentUser?.favorites?.includes(event.id)
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)
  const timeStr = `${startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`

  return (
    <article className="my-event-card">
      <div className="my-event-main">
        <div className="my-event-header">
          <span className="event-category">{event.category}</span>
          <h4>{event.name}</h4>
        </div>
        <div className="my-event-meta">
          <span>🕐 {timeStr}</span>
          <span>📍 {event.room}</span>
          <span>👗 {event.dressCode}</span>
        </div>
      </div>
      <div className="my-event-actions">
        <button
          className={`favorite-btn ${isFav ? 'active' : ''}`}
          onClick={() => onToggleFavorite(event.id)}
          aria-pressed={isFav}
        >
          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}

const MyMealsTab = ({ meals, dietaryRestrictions }) => {
  if (meals.length === 0) {
    return (
      <div className="empty-state">
        <Utensils size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">No Meals Selected</h3>
        <p className="empty-state-message">Select your meals during registration or update your registration.</p>
        <a href="/registration" className="btn btn-gold">
          <Utensils size={18} />
          Update Meal Selections
        </a>
      </div>
    )
  }

  return (
    <div className="tab-panel">
      {dietaryRestrictions.length > 0 && (
        <div className="dietary-banner">
          <span>🍽️ Your dietary restrictions: {dietaryRestrictions.join(', ')}</span>
          <span className="badge badge-success">Kitchen Notified</span>
        </div>
      )}
      <div className="meals-list">
        {meals.map(meal => (
          <article key={meal.id} className="meal-detail-card">
            <div className="meal-detail-header">
              <span className="meal-type-badge">{meal.type}</span>
              <h3>{meal.name}</h3>
            </div>
            <div className="meal-detail-meta">
              <span>📅 {new Date(meal.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              <span>🕐 {meal.time}</span>
              <span>📍 {meal.location}</span>
              <span>👗 {meal.dressCode}</span>
            </div>
            <div className="meal-menu-full">
              <h4>Menu</h4>
              <ul>
                {meal.menu.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="meal-dietary">
              <h4>Dietary Notes</h4>
              <p>{meal.dietaryNotes}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

const MyHousingTab = ({ housing, roomType, hotel }) => {
  if (!housing) {
    return (
      <div className="empty-state">
        <MapPin size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">No Housing Assigned</h3>
        <p className="empty-state-message">Complete your registration to receive housing assignment.</p>
        <a href="/registration" className="btn btn-gold">
          <MapPin size={18} />
          Update Registration
        </a>
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="housing-detail">
        <div className="housing-card-main">
          <div className="housing-icon">
            <Building size={32} />
          </div>
          <div className="housing-info">
            <h3>{roomType?.name || 'Hotel Room'}</h3>
            <p className="room-number">Room {housing.roomNumber}</p>
            <p>{roomType?.description || ''}</p>
          </div>
          <div className="housing-status">
            <span className="badge badge-success">Confirmed</span>
          </div>
        </div>

        <div className="housing-details-grid">
          <div className="housing-detail-item">
            <h4>Check-In</h4>
            <p>{new Date(housing.checkIn).toLocaleString()}</p>
          </div>
          <div className="housing-detail-item">
            <h4>Check-Out</h4>
            <p>{new Date(housing.checkOut).toLocaleString()}</p>
          </div>
          <div className="housing-detail-item">
            <h4>Hotel</h4>
            <p>{hotel.name}</p>
          </div>
          <div className="housing-detail-item">
            <h4>Phone</h4>
            <p>{hotel.phone}</p>
          </div>
        </div>

        {housing.roommates && housing.roommates.length > 0 && (
          <div className="roommates-section">
            <h4>Roommates</h4>
            <div className="roommates-list">
              {housing.roommates.map((roommateId, i) => (
                <div key={i} className="roommate-item">
                  <div className="roommate-avatar">{roommateId}</div>
                  <span>{roommateId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="hotel-amenities">
          <h4>Hotel Amenities</h4>
          <div className="amenities-list">
            {hotel.amenities.map((amenity, i) => (
              <span key={i} className="amenity-badge">{amenity}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const MyBadgesTab = ({ earned, available }) => {
  return (
    <div className="tab-panel">
      <div className="badges-section">
        <h3>Earned Badges ({earned.length}/{earned.length + available.length})</h3>
        <div className="badges-grid">
          {earned.map(badge => (
            <div key={badge.id} className="badge-card earned">
              <div className="badge-icon">{badge.icon}</div>
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
              <span className="earned-label">✅ Earned</span>
            </div>
          ))}
          {available.map(badge => (
            <div key={badge.id} className="badge-card available">
              <div className="badge-icon">{badge.icon}</div>
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
              <span className="available-label">🔒 Locked</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MyAnnouncementsTab = ({ announcements }) => {
  return (
    <div className="tab-panel">
      {announcements.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No Announcements</h3>
          <p className="empty-state-message">Check back for updates during convention.</p>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map(ann => (
            <article key={ann.id} className="announcement-card">
              <div className="announcement-header">
                <span className={`announcement-type ${ann.type}`}>{ann.type.replace('_', ' ')}</span>
                <span className="announcement-time">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <h4>{ann.title}</h4>
              <p>{ann.body}</p>
              <div className="announcement-footer">
                <span>From: {ann.author}</span>
                <span>{ann.authorRole}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

const MyProfileTab = ({ user, chapters }) => {
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    chapterId: user.chapterId,
    dietaryRestrictions: user.dietaryRestrictions,
    tshirtSize: user.tshirtSize,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        dietaryRestrictions: checked 
          ? [...prev.dietaryRestrictions, value]
          : prev.dietaryRestrictions.filter(d => d !== value)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = () => {
    // In real app, would call updateAttendee
    setEditMode(false)
  }

  if (!editMode) {
    return (
      <div className="tab-panel">
        <div className="profile-detail">
          <div className="profile-detail-header">
            <h3>Profile Information</h3>
            <button className="btn btn-gold" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          </div>
          <dl className="profile-dl">
            <dt>First Name</dt>
            <dd>{user.firstName}</dd>
            <dt>Last Name</dt>
            <dd>{user.lastName}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Phone</dt>
            <dd>{user.phone || 'Not provided'}</dd>
            <dt>Chapter</dt>
            <dd>{chapters.find(c => c.id === user.chapterId)?.name || 'Not set'}</dd>
            <dt>Role</dt>
            <dd>{user.role.replace('_', ' ')}</dd>
            <dt>Badge Number</dt>
            <dd>{user.badgeNumber}</dd>
            <dt>T-Shirt Size</dt>
            <dd>{user.tshirtSize}</dd>
            <dt>Dietary Restrictions</dt>
            <dd>{user.dietaryRestrictions.length > 0 ? user.dietaryRestrictions.join(', ') : 'None'}</dd>
            <dt>Registration Date</dt>
            <dd>{new Date(user.registrationDate).toLocaleDateString()}</dd>
            <dt>Status</dt>
            <dd>{user.status}</dd>
          </dl>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <form className="profile-edit-form" onSubmit={e => { e.preventDefault(); handleSave() }}>
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input type="text" name="firstName" className="form-input" value={formData.firstName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input type="text" name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Chapter</label>
          <select name="chapterId" className="form-select" value={formData.chapterId} onChange={handleChange}>
            {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">T-Shirt Size</label>
          <select name="tshirtSize" className="form-select" value={formData.tshirtSize} onChange={handleChange}>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="2XL">2XL</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Dietary Restrictions</label>
          <div className="checkbox-grid">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Kosher', 'Halal', 'Other'].map(diet => (
              <label key={diet} className="form-checkbox">
                <input type="checkbox" name="dietaryRestrictions" value={diet} checked={formData.dietaryRestrictions.includes(diet)} onChange={handleChange} />
                {diet}
              </label>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => setEditMode(false)}>Cancel</button>
          <button type="submit" className="btn btn-gold">Save Changes</button>
        </div>
      </form>
    </div>
  )
}

export default MyConvention