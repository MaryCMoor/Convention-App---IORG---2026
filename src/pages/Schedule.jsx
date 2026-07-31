import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import './Schedule.css'

const Schedule = () => {
  const { state, currentUser, toggleFavorite, getEventsForDay } = useApp()
  const [selectedDay] = useState('2026-07-15')
  const events = getEventsForDay(selectedDay)

  return (
    <div className="schedule-page">
      <div className="page-header">
        <h1 className="page-title">
          <Calendar className="page-title-icon" size={32} />
          Convention Schedule
        </h1>
        <p className="page-subtitle">The Greatest Showman — 103rd Grand Assembly</p>
      </div>
      <div className="schedule-content">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <h3>{event.name}</h3>
            <p>{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Schedule
