import { useState, useEffect } from 'react'
import { 
  Menu, X, Sun, Moon, Bell, User, LogOut, 
  Home, Calendar, UserCheck, Megaphone, Utensils, MapPin, Users, 
  Images, Award, BookOpen, TicketCheck, Settings, Star, Heart,
  ChevronDown, ChevronUp, Crown, Sparkles
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './Header.css'

const Header = () => {
  const { 
    theme, toggleTheme, currentUser, logout, 
    notifications, markNotificationRead, sidebarOpen, setSidebarOpen,
    activePage, setActivePage 
  } = useApp()

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, roles: ['all'] },
    { id: 'schedule', label: 'Schedule', icon: Calendar, roles: ['all'] },
    { id: 'my-convention', label: 'My Convention', icon: UserCheck, roles: ['attendee', 'grand_officer', 'advisor'] },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['all'] },
    { id: 'meals', label: 'Meals', icon: Utensils, roles: ['all'] },
    { id: 'maps', label: 'Maps', icon: MapPin, roles: ['all'] },
    { id: 'directory', label: 'Directory', icon: Users, roles: ['all'] },
    { id: 'gallery', label: 'Gallery', icon: Images, roles: ['all'] },
    { id: 'awards', label: 'Awards', icon: Award, roles: ['all'] },
    { id: 'program-book', label: 'Program Book', icon: BookOpen, roles: ['all'] },
    { id: 'check-in', label: 'Check-In', icon: TicketCheck, roles: ['attendee', 'grand_officer', 'advisor'] },
    { id: 'admin', label: 'Admin', icon: Settings, roles: ['admin'] },
  ]

  const filteredNavItems = navItems.filter(item => 
    !currentUser || item.roles.includes('all') || item.roles.includes(currentUser.role)
  )

  const handleNavClick = (pageId) => {
    setActivePage(pageId)
    setSidebarOpen(false)
  }

  const getRoleBadge = (role) => {
    const badges = {
      attendee: { label: 'Attendee', class: 'badge-gold' },
      grand_officer: { label: 'Grand Officer', class: 'badge-red' },
      advisor: { label: 'Advisor', class: 'badge-gold' },
      admin: { label: 'Administrator', class: 'badge-dark' },
    }
    return badges[role] || badges.attendee
  }

  return (
    <header className="header" role="banner">
      {/* Top Bar */}
      <div className="header-top">
        <div className="header-top-left">
          <button 
            className="menu-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="logo-container">
            <div className="logo-icon">
              <Crown size={28} />
            </div>
            <div className="logo-text">
              <span className="logo-main">103rd Grand Assembly</span>
              <span className="logo-theme">The Greatest Showman</span>
            </div>
          </div>
        </div>

        <div className="header-top-center">
          <div className="countdown-widget" id="countdown-widget">
            <CountdownWidget />
          </div>
        </div>

        <div className="header-top-right">
          {/* Theme Toggle */}
          <button 
            className="icon-btn" 
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications */}
          <div className="dropdown">
            <button 
              className="icon-btn notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="dropdown-menu notification-panel" role="menu">
                <div className="dropdown-header">
                  <h3>Announcements</h3>
                  <button className="mark-all-read" onClick={() => notifications.forEach(n => markNotificationRead(n.id))}>
                    Mark all read
                  </button>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="empty-state">
                      <Bell size={32} />
                      <p>No announcements yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                        role="menuitem"
                        onClick={() => markNotificationRead(notif.id)}
                      >
                        <div className="notification-icon">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="notification-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.body}</p>
                          <span className="notification-time">
                            {formatTime(notif.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 10 && (
                  <div className="dropdown-footer">
                    <span>{notifications.length} total notifications</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          {currentUser ? (
            <div className="dropdown user-dropdown">
              <button 
                className="user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="user-avatar">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="user-role">
                    {getRoleBadge(currentUser.role).label}
                  </span>
                </div>
                <ChevronDown size={16} />
              </button>
              
              {showUserMenu && (
                <div className="dropdown-menu user-menu" role="menu">
                  <div className="user-menu-header">
                    <div className="user-avatar large">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <div>
                      <h4>{currentUser.firstName} {currentUser.lastName}</h4>
                      <p>{currentUser.chapterName}</p>
                      <span className={`role-badge ${getRoleBadge(currentUser.role).class}`}>
                        {getRoleBadge(currentUser.role).label}
                      </span>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <nav className="user-menu-nav">
                    {filteredNavItems.map(item => (
                      <button
                        key={item.id}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                        role="menuitem"
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                        {activePage === item.id && <Star size={16} className="active-indicator" />}
                      </button>
                    ))}
                  </nav>
                  <div className="divider"></div>
                  <button 
                    className="nav-item danger"
                    onClick={logout}
                    role="menuitem"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-gold" onClick={() => setActivePage('check-in')}>
              <TicketCheck size={18} />
              <span>Check In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {sidebarOpen && (
        <nav className="mobile-nav" role="navigation" aria-label="Main navigation">
          <ul className="mobile-nav-list">
            {filteredNavItems.map(item => (
              <li key={item.id}>
                <button
                  className={`mobile-nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <item.icon size={22} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div className="mobile-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
    </header>
  )
}

const CountdownWidget = () => {
  const { getConventionCountdown } = useApp()
  const [countdown, setCountdown] = useState(getConventionCountdown())

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getConventionCountdown())
    }, 1000)
    return () => clearInterval(interval)
  }, [getConventionCountdown])

  if (countdown.started) {
    return (
      <div className="countdown-active animate-pulse">
        <Sparkles size={16} />
        <span>The Show Has Begun!</span>
        <Sparkles size={16} />
      </div>
    )
  }

  return (
    <div className="countdown-widget-inner marquee-lights">
      <span className="countdown-label">🎪</span>
      <span className="countdown-value">
        {countdown.days} DAYS {countdown.hours}H {countdown.minutes}M {countdown.seconds}S
      </span>
      <span className="countdown-label">🦁</span>
      <span className="countdown-until">UNTIL CONVENTION</span>
    </div>
  )
}

const getNotificationIcon = (type) => {
  const icons = {
    general: <Megaphone size={16} />,
    schedule_change: <Calendar size={16} />,
    emergency: <span className="emergency-icon">🚨</span>,
    meal_reminder: <Utensils size={16} />,
    officer_update: <User size={16} />,
    transportation: <MapPin size={16} />,
    success: <span>✅</span>,
    achievement: <span>🏆</span>,
  }
  return icons[type] || icons.general
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

export default Header