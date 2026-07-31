import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, Users, Utensils, MapPin, Megaphone, Award, 
  Star, Heart, Clock, CheckCircle, Sparkles, Crown, 
  Ticket, BookOpen, Camera, Target, Gift, Music, 
  ChevronRight, ArrowRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Home.css'

const Home = () => {
  const { 
    state, currentUser, getStats, getUpcomingEvents, 
    getTodaysEvents, getConventionCountdown,
    toggleFavorite, login, registerAttendee 
  } = useApp()
  
  const [stats, setStats] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [todaysEvents, setTodaysEvents] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    setStats(getStats())
    setUpcomingEvents(getUpcomingEvents(6))
    setTodaysEvents(getTodaysEvents())
    setCountdown(getConventionCountdown())
    
    const interval = setInterval(() => {
      setStats(getStats())
      setCountdown(getConventionCountdown())
    }, 30000)
    
    return () => clearInterval(interval)
  }, [getStats, getUpcomingEvents, getTodaysEvents, getConventionCountdown])

  const quickActions = [
    { id: 'schedule', icon: Calendar, label: 'View Schedule', description: 'Full convention timeline', href: '/schedule', color: 'primary' },
    { id: 'my-convention', icon: Star, label: 'My Convention', description: 'Personal schedule & favorites', href: '/my-convention', color: 'gold', auth: true },
    { id: 'announcements', icon: Megaphone, label: 'Announcements', description: 'Latest updates & alerts', href: '/announcements', color: 'primary' },
    { id: 'meals', icon: Utensils, label: 'Meals & Menus', description: 'Dining schedule & dietary info', href: '/meals', color: 'gold' },
    { id: 'maps', icon: MapPin, label: 'Venue Maps', description: 'Interactive hotel maps', href: '/maps', color: 'primary' },
    { id: 'directory', icon: Users, label: 'Directory', description: 'Find attendees & officers', href: '/directory', color: 'gold' },
    { id: 'gallery', icon: Camera, label: 'Photo Gallery', description: 'Convention memories', href: '/gallery', color: 'primary' },
    { id: 'awards', icon: Award, label: 'Awards', description: 'Lionhearted & more', href: '/awards', color: 'gold' },
    { id: 'program-book', icon: BookOpen, label: 'Program Book', description: 'Digital convention book', href: '/program-book', color: 'primary' },
    { id: 'check-in', icon: Ticket, label: 'Check In', description: 'Scan your badge QR code', href: '/check-in', color: 'gold', auth: true },
    { id: 'documents', icon: BookOpen, label: 'Documents', description: 'Packets, maps, forms', href: '/documents', color: 'primary' },
    { id: 'surveys', icon: Target, label: 'Surveys', description: 'Share your feedback', href: '/surveys', color: 'gold', auth: true },
  ]

  const featuredEvents = upcomingEvents.slice(0, 3)
  
  const highlights = [
    { icon: Crown, title: 'Lion Mascot Debut', description: 'Meet our courageous lion mascot at the Opening Ceremony!', color: 'gold' },
    { icon: Sparkles, title: 'Grand Banquet', description: 'The Greatest Show - elegant dinner, awards & celebration', color: 'primary' },
    { icon: Music, title: 'Talent Show', description: 'Stars in the Spotlight - showcase your talents!', color: 'gold' },
    { icon: Gift, title: 'Convention Bingo', description: 'Complete challenges, win prizes!', color: 'primary' },
    { icon: Heart, title: 'Sisterhood', description: 'Connect with 500+ Rainbow sisters from 12 chapters', color: 'gold' },
    { icon: Target, title: 'Scavenger Hunt', description: 'Find hidden treasures around the venue', color: 'primary' },
  ]

  const handleQuickAction = (action) => {
    if (action.auth && !currentUser) {
      setShowLogin(true)
      return
    }
  }

  const handleLogin = (email) => {
    const user = state.attendees.find(a => a.email === email)
    if (user && login(user.id)) {
      setShowLogin(false)
    }
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-background">
          <div className="hero-curtain left" />
          <div className="hero-curtain right" />
          <div className="hero-spotlights">
            <div className="spotlight spotlight-1" />
            <div className="spotlight spotlight-2" />
            <div className="spotlight spotlight-3" />
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge animate-slide-up">
            <span className="badge badge-gold">🎪 The Greatest Showman Theme</span>
          </div>
          
          <h1 id="hero-title" className="hero-title animate-slide-up" style={{animationDelay: '100ms'}}>
            103rd Grand Assembly
          </h1>
          
          <p className="hero-tagline animate-slide-up" style={{animationDelay: '200ms'}}>
            Step Right Up to an Unforgettable Adventure!
          </p>
          
          <div className="hero-countdown animate-slide-up" style={{animationDelay: '300ms'}}>
            <CountdownDisplay countdown={countdown} />
          </div>
          
          <div className="hero-actions animate-slide-up" style={{animationDelay: '400ms'}}>
            {!currentUser ? (
              <>
                <button className="btn btn-gold btn-lg" onClick={() => setShowRegister(true)}>
                  <Ticket size={20} />
                  Register for Convention
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => setShowLogin(true)}>
                  <ArrowRight size={20} />
                  Already Registered? Sign In
                </button>
              </>
            ) : (
              <a href="/my-convention" className="btn btn-gold btn-lg">
                <Star size={20} />
                Go to My Convention
              </a>
            )}
          </div>
          
          <div className="hero-stats animate-slide-up" style={{animationDelay: '500ms'}}>
            <div className="hero-stat">
              <span className="hero-stat-value">{state.chapters.length}</span>
              <span className="hero-stat-label">Chapters</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">{state.attendees.filter(a => a.status === 'confirmed').length}+</span>
              <span className="hero-stat-label">Attendees</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">{state.events.length}</span>
              <span className="hero-stat-label">Events</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">4</span>
              <span className="hero-stat-label">Magical Days</span>
            </div>
          </div>
        </div>
        
        <div className="hero-lion animate-bounce-gentle">
          <Crown size={80} />
        </div>
      </section>

      {/* Quick Stats */}
      <section className="stats-section" aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Convention Statistics</h2>
        <div className="stats-grid">
          <StatCard 
            icon={<Users size={28} />}
            value={stats?.registeredAttendees || 0}
            label="Registered Attendees"
            trend={{ value: '+12 this week', positive: true }}
          />
          <StatCard 
            icon={<CheckCircle size={28} />}
            value={stats?.checkedInAttendees || 0}
            label="Checked In"
            trend={{ value: `${stats?.countdown?.days || 0} days to go`, positive: false }}
          />
          <StatCard 
            icon={<Calendar size={28} />}
            value={stats?.todaysEvents || 0}
            label="Today's Events"
            trend={{ value: `${stats?.upcomingSessions || 0} upcoming`, positive: true }}
          />
          <StatCard 
            icon={<Megaphone size={28} />}
            value={stats?.activeAnnouncements || 0}
            label="Active Announcements"
          />
          <StatCard 
            icon={<Utensils size={28} />}
            value={stats?.totalMeals || 0}
            label="Planned Meals"
          />
          <StatCard 
            icon={<Clock size={28} />}
            value={stats?.countdown?.days || 0}
            label="Days Until Convention"
            trend={{ value: `${stats?.countdown?.hours || 0}h ${stats?.countdown?.minutes || 0}m`, positive: false }}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section" aria-labelledby="actions-title">
        <div className="section-header">
          <h2 id="actions-title" className="section-title">Quick Actions</h2>
        </div>
        <div className="actions-grid">
          {quickActions.map(action => (
            <QuickActionCard 
              key={action.id}
              action={action}
              currentUser={currentUser}
              onClick={handleQuickAction}
            />
          ))}
        </div>
      </section>

      {/* Today's Events / Upcoming Events */}
      <section className="events-section" aria-labelledby="events-title">
        <div className="section-header">
          <h2 id="events-title" className="section-title">
            {todaysEvents.length > 0 ? "Today's Events" : 'Upcoming Events'}
          </h2>
          <a href="/schedule" className="btn btn-ghost btn-sm">
            View All <ChevronRight size={14} />
          </a>
        </div>
        <div className="events-carousel">
          {(todaysEvents.length > 0 ? todaysEvents : upcomingEvents.slice(0, 5)).map(event => (
            <EventCard key={event.id} event={event} currentUser={currentUser} onToggleFavorite={toggleFavorite} />
          ))}
          {(todaysEvents.length === 0 && upcomingEvents.length === 0) && (
            <div className="empty-state">
              <Calendar size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">No Events Scheduled</h3>
              <p className="empty-state-message">Events will appear here as convention approaches</p>
            </div>
          )}
        </div>
      </section>

      {/* Convention Highlights */}
      <section className="highlights-section" aria-labelledby="highlights-title">
        <div className="section-header">
          <h2 id="highlights-title" className="section-title">Convention Highlights</h2>
        </div>
        <div className="highlights-grid">
          {highlights.map((highlight, index) => (
            <HighlightCard key={highlight.id || index} highlight={highlight} index={index} />
          ))}
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="featured-section" aria-labelledby="featured-title">
          <div className="section-header">
            <h2 id="featured-title" className="section-title">Featured Events</h2>
            <a href="/schedule" className="btn btn-ghost btn-sm">
              View Schedule <ChevronRight size={14} />
            </a>
          </div>
          <div className="featured-grid">
            {featuredEvents.map(event => (
              <FeaturedEventCard key={event.id} event={event} currentUser={currentUser} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {/* Grand Officers Preview */}
      <section className="officers-section" aria-labelledby="officers-title">
        <div className="section-header">
          <h2 id="officers-title" className="section-title">2025-2026 Grand Officers</h2>
          <a href="/directory" className="btn btn-ghost btn-sm">
            View All <ChevronRight size={14} />
          </a>
        </div>
        <div className="officers-carousel">
          {state.grandOfficers.slice(0, 6).map(officer => (
            <OfficerCard key={officer.id} officer={officer} />
          ))}
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterModal 
          onClose={() => setShowRegister(false)}
          onRegister={registerAttendee}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      )}
    </div>
  )
}

const CountdownDisplay = ({ countdown }) => {
  if (!countdown) return null
  
  if (countdown.started) {
    return (
      <div className="countdown-active-large">
        <Sparkles size={24} />
        <span>The Show Has Begun!</span>
        <Sparkles size={24} />
      </div>
    )
  }

  return (
    <div className="countdown-display marquee-lights">
      <div className="countdown-item">
        <span className="countdown-number">{countdown.days}</span>
        <span className="countdown-unit">DAYS</span>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span className="countdown-number">{countdown.hours.toString().padStart(2, '0')}</span>
        <span className="countdown-unit">HOURS</span>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span className="countdown-number">{countdown.minutes.toString().padStart(2, '0')}</span>
        <span className="countdown-unit">MINS</span>
      </div>
      <div className="countdown-separator">:</div>
      <div className="countdown-item">
        <span className="countdown-number">{countdown.seconds.toString().padStart(2, '0')}</span>
        <span className="countdown-unit">SECS</span>
      </div>
    </div>
  )
}

const StatCard = ({ icon, value, label, trend }) => (
  <div className="stat-card">
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-value">{value.toLocaleString()}</div>
    <div className="stat-card-label">{label}</div>
    {trend && (
      <div className={`stat-card-trend ${trend.positive ? 'positive' : 'negative'}`}>
        {trend.positive ? '↑' : '↓'} {trend.value}
      </div>
    )}
  </div>
)

const QuickActionCard = ({ action, currentUser, onClick }) => {
  const isLocked = action.auth && !currentUser
  const Icon = action.icon
  
  return (
    <button 
      className={`quick-action-card ${action.color} ${isLocked ? 'locked' : ''}`}
      onClick={() => onClick(action)}
      disabled={isLocked}
    >
      <div className="action-icon">
        <Icon size={24} />
        {isLocked && <span className="lock-icon">🔒</span>}
      </div>
      <div className="action-content">
        <h3>{action.label}</h3>
        <p>{action.description}</p>
      </div>
      <ChevronRight size={20} className="action-arrow" />
    </button>
  )
}

const EventCard = ({ event, currentUser, onToggleFavorite }) => {
  const isFav = currentUser?.favorites?.includes(event.id)
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)
  const timeStr = `${startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  const dateStr = startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  
  return (
    <article className="event-card">
      <div className="event-card-header">
        <span className="event-card-category">{event.category}</span>
        <h3 className="event-card-title">{event.name}</h3>
        <div className="event-card-time">
          <span>📅</span>
          <span>{dateStr}</span>
          <span>•</span>
          <span>🕐</span>
          <span>{timeStr}</span>
        </div>
      </div>
      <div className="event-card-body">
        <p className="event-card-description">{event.description}</p>
        <div className="event-card-meta">
          <span className="event-card-meta-item">
            <span>📍</span>
            <span>{event.room}</span>
          </span>
          <span className="event-card-meta-item">
            <span>👗</span>
            <span>{event.dressCode}</span>
          </span>
        </div>
      </div>
      <div className="event-card-footer">
        <span className="event-card-dresscode">{event.dressCode}</span>
        <div className="event-card-actions">
          {currentUser && (
            <button 
              className={`btn btn-sm ${isFav ? 'btn-gold' : 'btn-outline'}`}
              onClick={() => onToggleFavorite(event.id)}
              aria-pressed={isFav}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFav ? <Heart size={16} fill="currentColor" /> : <Heart size={16} />}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

const FeaturedEventCard = ({ event, currentUser, onToggleFavorite }) => {
  const isFav = currentUser?.favorites?.includes(event.id)
  const startTime = new Date(event.startTime)
  const dateStr = startTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  
  return (
    <article className="featured-event-card">
      <div className="featured-event-image">
        <div className="event-category-badge">{event.category}</div>
        <div className="event-date-badge">
          <span className="event-day">{startTime.getDate()}</span>
          <span className="event-month">{startTime.toLocaleString([], { month: 'short' })}</span>
        </div>
      </div>
      <div className="featured-event-content">
        <h3>{event.name}</h3>
        <p>{event.description}</p>
        <div className="featured-event-meta">
          <span>🕐 {timeStr}</span>
          <span>📍 {event.room}</span>
          <span>👗 {event.dressCode}</span>
        </div>
        <div className="featured-event-actions">
          {currentUser && (
            <button 
              className={`btn btn-sm ${isFav ? 'btn-gold' : 'btn-outline'}`}
              onClick={() => onToggleFavorite(event.id)}
            >
              {isFav ? <Heart size={16} fill="currentColor" /> : <Heart size={16} />}
              {isFav ? ' Saved' : ' Save'}
            </button>
          )}
          <a href="/schedule" className="btn btn-primary btn-sm">Details</a>
        </div>
      </div>
    </article>
  )
}

const HighlightCard = ({ highlight, index }) => {
  const Icon = highlight.icon
  const delay = `${index * 100}ms`
  
  return (
    <article className={`highlight-card ${highlight.color}`} style={{animationDelay: delay}}>
      <div className="highlight-icon">
        <Icon size={32} />
      </div>
      <h3>{highlight.title}</h3>
      <p>{highlight.description}</p>
    </article>
  )
}

const OfficerCard = ({ officer }) => (
  <article className="officer-card">
    <div className="officer-photo">
      <img src={officer.photo} alt={officer.name} />
    </div>
    <div className="officer-info">
      <h4>{officer.name}</h4>
      <p className="officer-title">{officer.title}</p>
      <p className="officer-chapter">{officer.chapter}</p>
    </div>
  </article>
)

const LoginModal = ({ onClose, onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const user = onLogin(email)
    if (!user) {
      setError('Email not found. Please check or register.')
    }
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Welcome Back!</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-gold btn-block">Sign In</button>
          </div>
        </form>
        <div className="modal-footer" style={{borderTop: 'none', background: 'transparent', justifyContent: 'center'}}>
          <p style={{color: 'var(--color-text-light)', fontSize: '0.875rem'}}>
            Don't have an account? 
            <button type="button" onClick={onSwitchToRegister} style={{color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 600}}>Register</button>
          </p>
        </div>
      </div>
    </div>
  )
}

const RegisterModal = ({ onClose, onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    chapterId: '',
    role: 'attendee',
    dietaryRestrictions: [],
    tshirtSize: 'M',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  
  const chapters = [
    { id: 'ch-1', name: 'Starlight Assembly #42' },
    { id: 'ch-2', name: 'Harmony Assembly #17' },
    { id: 'ch-3', name: 'Grace Assembly #88' },
    { id: 'ch-4', name: 'Faith Assembly #23' },
    { id: 'ch-5', name: 'Hope Assembly #56' },
    { id: 'ch-6', name: 'Charity Assembly #91' },
    { id: 'ch-7', name: 'Joy Assembly #12' },
    { id: 'ch-8', name: 'Peace Assembly #34' },
    { id: 'ch-9', name: 'Unity Assembly #67' },
    { id: 'ch-10', name: 'Melody Assembly #45' },
    { id: 'ch-11', name: 'Service Assembly #78' },
    { id: 'ch-12', name: 'Dream Assembly #99' },
  ]
  
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }
  
  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.chapterId) newErrors.chapterId = 'Please select your chapter'
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name required'
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setSubmitting(true)
    try {
      await onRegister({
        ...formData,
        dietaryRestrictions: formData.dietaryRestrictions,
      })
      onClose()
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Register for Convention</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && <div className="alert alert-error">{errors.submit}</div>}
          
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input 
                type="text" 
                name="firstName" 
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
              />
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input 
                type="text" 
                name="lastName" 
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
              />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Chapter *</label>
            <select 
              name="chapterId" 
              className={`form-select ${errors.chapterId ? 'error' : ''}`}
              value={formData.chapterId}
              onChange={handleChange}
            >
              <option value="">Select your chapter</option>
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
            {errors.chapterId && <span className="form-error">{errors.chapterId}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">T-Shirt Size</label>
            <select 
              name="tshirtSize" 
              className="form-select"
              value={formData.tshirtSize}
              onChange={handleChange}
            >
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
            <div className="flex flex-wrap gap-sm">
              {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Kosher', 'Halal', 'Other'].map(diet => (
                <label key={diet} className="form-checkbox">
                  <input 
                    type="checkbox" 
                    name="dietaryRestrictions"
                    value={diet}
                    checked={formData.dietaryRestrictions.includes(diet)}
                    onChange={handleChange}
                  />
                  {diet}
                </label>
              ))}
            </div>
          </div>
          
          <h4 style={{margin: 'var(--space-lg) 0 var(--space-md)', color: 'var(--color-primary)'}}>
            Emergency Contact
          </h4>
          
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input 
                type="text" 
                name="emergencyContactName" 
                className={`form-input ${errors.emergencyContactName ? 'error' : ''}`}
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Contact name"
              />
              {errors.emergencyContactName && <span className="form-error">{errors.emergencyContactName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input 
                type="tel" 
                name="emergencyContactPhone" 
                className={`form-input ${errors.emergencyContactPhone ? 'error' : ''}`}
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
              {errors.emergencyContactPhone && <span className="form-error">{errors.emergencyContactPhone}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <input 
              type="text" 
              name="emergencyContactRelationship" 
              className="form-input"
              value={formData.emergencyContactRelationship}
              onChange={handleChange}
              placeholder="Mother, Father, Guardian, etc."
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-block" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register for Convention'}
            </button>
          </div>
        </form>
        <div className="modal-footer" style={{borderTop: 'none', background: 'transparent', justifyContent: 'center'}}>
          <p style={{color: 'var(--color-text-light)', fontSize: '0.875rem'}}>
            Already registered? 
            <button type="button" onClick={onSwitchToLogin} style={{color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 600}}>Sign In</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home