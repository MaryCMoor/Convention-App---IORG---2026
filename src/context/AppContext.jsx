import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import mockConvention from '../data/mockData'

const AppContext = createContext(null)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

const STORAGE_KEY = 'rainbow-convention-2026'

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with mock data to ensure all data is available
      return {
        ...mockConvention,
        ...parsed,
        // Ensure arrays are merged properly
        events: parsed.events || mockConvention.events,
        announcements: parsed.announcements || mockConvention.announcements,
        attendees: parsed.attendees || mockConvention.attendees,
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored data:', e)
  }
  return mockConvention
}

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(getInitialState)
  const [currentUser, setCurrentUser] = useState(null)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light'
    } catch {
      return 'light'
    }
  })
  const [notifications, setNotifications] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('home')

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to persist state:', e)
    }
  }, [state])

  // Persist theme
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    } catch (e) {
      console.warn('Failed to persist theme:', e)
    }
  }, [theme])

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const updateState = useCallback((updater) => {
    setState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater
      return { ...prev, ...newState }
    })
  }, [])

  const login = useCallback((userId) => {
    const user = state.attendees.find(a => a.id === userId)
    if (user) {
      setCurrentUser(user)
      return true
    }
    return false
  }, [state.attendees])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const registerAttendee = useCallback((attendeeData) => {
    const newAttendee = {
      ...attendeeData,
      id: `att-${Date.now()}`,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      badgeNumber: `GA2026-${String(state.attendees.length + 1).padStart(4, '0')}`,
      qrCode: `GA2026-${String(state.attendees.length + 1).padStart(4, '0')}-${attendeeData.firstName.toUpperCase()}-${attendeeData.lastName.toUpperCase()}`,
      checkedIn: false,
      favorites: [],
      bingoProgress: [],
      scavengerProgress: [],
      badgesEarned: [],
    }
    updateState(prev => ({
      ...prev,
      attendees: [...prev.attendees, newAttendee]
    }))
    return newAttendee
  }, [state.attendees.length, updateState])

  const updateAttendee = useCallback((attendeeId, updates) => {
    updateState(prev => ({
      ...prev,
      attendees: prev.attendees.map(a => 
        a.id === attendeeId ? { ...a, ...updates } : a
      )
    }))
    if (currentUser?.id === attendeeId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [updateState, currentUser])

  const toggleFavorite = useCallback((eventId) => {
    if (!currentUser) return
    const event = state.events.find(e => e.id === eventId)
    if (!event) return

    const isFav = currentUser.favorites.includes(eventId)
    const newFavorites = isFav
      ? currentUser.favorites.filter(id => id !== eventId)
      : [...currentUser.favorites, eventId]

    updateAttendee(currentUser.id, { favorites: newFavorites })
    
    // Also update event's attended array
    updateState(prev => ({
      ...prev,
      events: prev.events.map(e => 
        e.id === eventId 
          ? { ...e, attended: isFav 
              ? e.attended.filter(id => id !== currentUser.id)
              : [...e.attended, currentUser.id]
            }
          : e
      )
    }))
  }, [currentUser, state.events, updateAttendee, updateState])

  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications(prev => [newNotification, ...prev].slice(0, 50))
  }, [])

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const checkInAttendee = useCallback((attendeeId) => {
    updateAttendee(attendeeId, { checkedIn: true })
    addNotification({
      title: 'Check-In Successful',
      body: 'Welcome to the 103rd Grand Assembly!',
      type: 'success',
    })
  }, [updateAttendee, addNotification])

  const completeBingo = useCallback((bingoId) => {
    if (!currentUser) return
    const newProgress = [...(currentUser.bingoProgress || []), bingoId]
    updateAttendee(currentUser.id, { bingoProgress: newProgress })
    
    // Check for bingo completion
    if (newProgress.length >= 5) {
      addNotification({
        title: 'BINGO!',
        body: 'You\'ve completed a row! Claim your prize at the Registration Desk.',
        type: 'success',
      })
    }
  }, [currentUser, updateAttendee, addNotification])

  const completeScavenger = useCallback((itemId) => {
    if (!currentUser) return
    const newProgress = [...(currentUser.scavengerProgress || []), itemId]
    updateAttendee(currentUser.id, { scavengerProgress: newProgress })
    addNotification({
      title: 'Found It!',
      body: 'Scavenger hunt item completed!',
      type: 'success',
    })
  }, [currentUser, updateAttendee, addNotification])

  const earnBadge = useCallback((badgeId) => {
    if (!currentUser) return
    const badge = state.badges.find(b => b.id === badgeId)
    if (!badge || currentUser.badgesEarned?.includes(badgeId)) return

    const newBadges = [...(currentUser.badgesEarned || []), badgeId]
    updateAttendee(currentUser.id, { badgesEarned: newBadges })
    addNotification({
      title: 'Badge Earned!',
      body: `You earned the "${badge.name}" badge!`,
      type: 'achievement',
    })
  }, [currentUser, state.badges, updateAttendee, addNotification])

  const submitSurvey = useCallback((surveyId, responses) => {
    updateState(prev => ({
      ...prev,
      surveys: prev.surveys.map(s => 
        s.id === surveyId 
          ? { ...s, responses: s.responses + 1, isOpen: false }
          : s
      )
    }))
    addNotification({
      title: 'Survey Submitted',
      body: 'Thank you for your feedback!',
      type: 'success',
    })
  }, [updateState, addNotification])

  const createAnnouncement = useCallback((announcement) => {
    const newAnnouncement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      readBy: [],
    }
    updateState(prev => ({
      ...prev,
      announcements: [newAnnouncement, ...prev.announcements]
    }))
    // Add as notification for relevant users
    addNotification({
      title: newAnnouncement.title,
      body: newAnnouncement.body,
      type: newAnnouncement.type,
    })
  }, [updateState, addNotification])

  const getEventsForDay = useCallback((date) => {
    return state.events.filter(event => 
      event.startTime.startsWith(date)
    ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }, [state.events])

  const getUpcomingEvents = useCallback((limit = 5) => {
    const now = new Date()
    return state.events
      .filter(e => new Date(e.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, limit)
  }, [state.events])

  const getTodaysEvents = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return getEventsForDay(today)
  }, [getEventsForDay])

  const getConventionCountdown = useCallback(() => {
    const start = new Date(state.startDate)
    const now = new Date()
    const diff = start - now
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true }
    
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      started: false,
    }
  }, [state.startDate])

  const getStats = useCallback(() => {
    const confirmedAttendees = state.attendees.filter(a => a.status === 'confirmed').length
    const checkedIn = state.attendees.filter(a => a.checkedIn).length
    const todaysEvents = getTodaysEvents().length
    const activeAnnouncements = state.announcements.filter(a => 
      new Date(a.expiresAt) > new Date()
    ).length
    const totalMeals = state.meals.length
    const upcomingSessions = getUpcomingEvents(10).length

    return {
      registeredAttendees: confirmedAttendees,
      checkedInAttendees: checkedIn,
      todaysEvents,
      activeAnnouncements,
      totalMeals,
      upcomingSessions,
      countdown: getConventionCountdown(),
    }
  }, [state.attendees, state.announcements, state.meals, getTodaysEvents, getUpcomingEvents, getConventionCountdown])

  const exportData = useCallback((format = 'json') => {
    const data = {
      attendees: state.attendees,
      events: state.events,
      announcements: state.announcements,
      surveys: state.surveys,
      exportedAt: new Date().toISOString(),
    }
    
    if (format === 'csv') {
      // Simple CSV export for attendees
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Chapter', 'Role', 'Status', 'Checked In']
      const rows = state.attendees.map(a => [
        a.id, a.firstName, a.lastName, a.email, a.chapterName, a.role, a.status, a.checkedIn ? 'Yes' : 'No'
      ])
      return [headers, ...rows].map(r => r.join(',')).join('\n')
    }
    
    return JSON.stringify(data, null, 2)
  }, [state])

  const value = {
    state,
    currentUser,
    theme,
    notifications,
    sidebarOpen,
    activePage,
    setSidebarOpen,
    setActivePage,
    toggleTheme,
    login,
    logout,
    registerAttendee,
    updateAttendee,
    toggleFavorite,
    addNotification,
    markNotificationRead,
    checkInAttendee,
    completeBingo,
    completeScavenger,
    earnBadge,
    submitSurvey,
    createAnnouncement,
    getEventsForDay,
    getUpcomingEvents,
    getTodaysEvents,
    getConventionCountdown,
    getStats,
    exportData,
    updateState,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppProvider