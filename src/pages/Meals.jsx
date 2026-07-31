import { useState, useMemo } from 'react'
import { 
  Utensils, Coffee, Calendar, Clock, MapPin, 
  Filter, Search, CheckCircle, AlertTriangle,
  Heart, WheatOff, Droplet, Leaf, Star,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Meals.css'

const Meals = () => {
  const { state, currentUser } = useApp()
  
  const [filterDay, setFilterDay] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMyMealsOnly, setShowMyMealsOnly] = useState(false)

  const meals = state.meals
  const userMealIds = currentUser?.meals || []

  const filteredMeals = useMemo(() => {
    let result = meals
    
    if (showMyMealsOnly && currentUser) {
      result = result.filter(m => userMealIds.includes(m.id))
    }
    
    if (filterDay !== 'all') {
      result = result.filter(m => m.day === filterDay)
    }
    
    if (filterType !== 'all') {
      result = result.filter(m => m.type === filterType)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.menu.some(item => item.toLowerCase().includes(query))
      )
    }
    
    return result.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [meals, filterDay, filterType, searchQuery, showMyMealsOnly, userMealIds])

  const days = [...new Set(meals.map(m => m.day))].sort()
  const types = [...new Set(meals.map(m => m.type))].sort()

  const getDietaryIcons = (restrictions) => {
    const icons = {
      vegetarian: <Leaf size={14} title="Vegetarian" />,
      vegan: <Leaf size={14} title="Vegan" className="vegan" />,
      'gluten-free': <WheatOff size={14} title="Gluten-Free" />,
      'dairy-free': <Droplet size={14} title="Dairy-Free" />,
      'nut-free': <AlertTriangle size={14} title="Nut-Free" />,
      kosher: <Star size={14} title="Kosher" />,
      halal: <Heart size={14} title="Halal" />,
    }
    return restrictions.map(r => icons[r.toLowerCase().replace(' ', '-')] || null).filter(Boolean)
  }

  const isMyMeal = (mealId) => userMealIds.includes(mealId)

  return (
    <div className="meals-page">
      <div className="page-header">
        <h1 className="page-title">
          <Utensils className="page-title-icon" size={32} />
          Meals & Dining
        </h1>
        <p className="page-subtitle">Convention dining schedule, menus, and dietary accommodations</p>
      </div>

      {/* My Meals Summary */}
      {currentUser && userMealIds.length > 0 && (
        <div className="my-meals-summary">
          <div className="summary-card">
            <Utensils size={24} />
            <div>
              <strong>{userMealIds.length} Meals Selected</strong>
              <span>of {meals.length} total</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowMyMealsOnly(!showMyMealsOnly)}>
              {showMyMealsOnly ? 'Show All' : 'My Meals Only'}
            </button>
          </div>
        </div>
      )}

      {/* Dietary Restrictions Banner */}
      {currentUser && currentUser.dietaryRestrictions.length > 0 && (
        <div className="dietary-banner">
          <div className="dietary-info">
            <strong>Your Dietary Restrictions:</strong>
            <div className="dietary-tags">
              {currentUser.dietaryRestrictions.map(r => (
                <span key={r} className="dietary-tag">{r}</span>
              ))}
            </div>
          </div>
          <span className="badge badge-success">Kitchen Notified</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Day</label>
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="filter-select">
            <option value="all">All Days</option>
            {days.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Meal Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            {types.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search meals, menus, locations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Meals by Day */}
      <div className="meals-container">
        {days.map(day => {
          const dayMeals = filteredMeals.filter(m => m.day === day)
          if (dayMeals.length === 0) return null
          
          return (
            <div key={day} className="day-section">
              <h2 className="day-header">
                <span>{day}</span>
                <span className="day-count">{dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''}</span>
              </h2>
              <div className="meals-grid">
                {dayMeals.map(meal => (
                  <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    isMyMeal={isMyMeal(meal.id)}
                    dietaryIcons={getDietaryIcons(meal.dietaryAccommodations)}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            </div>
          )
        })}
        
        {filteredMeals.length === 0 && (
          <div className="empty-state">
            <Utensils size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Meals Found</h3>
            <p className="empty-state-message">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Dietary Legend */}
      <div className="dietary-legend">
        <h3>Dietary Accommodation Symbols</h3>
        <div className="legend-grid">
          <LegendItem icon={<Leaf size={16} />} label="Vegetarian" />
          <LegendItem icon={<Leaf size={16} className="vegan" />} label="Vegan" />
          <LegendItem icon={<WheatOff size={16} />} label="Gluten-Free" />
          <LegendItem icon={<Droplet size={16} />} label="Dairy-Free" />
          <LegendItem icon={<AlertTriangle size={16} />} label="Nut-Free" />
          <LegendItem icon={<Star size={16} />} label="Kosher" />
          <LegendItem icon={<Heart size={16} />} label="Halal" />
        </div>
      </div>
    </div>
  )
}

const MealCard = ({ meal, isMyMeal, dietaryIcons, currentUser }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className={`meal-card ${isMyMeal ? 'my-meal' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="meal-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="meal-type-section">
          <span className={`meal-type-badge ${meal.type}`}>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</span>
          {isMyMeal && <CheckCircle size={16} className="my-meal-badge" title="In your schedule" />}
        </div>
        <div className="meal-main-info">
          <h3>{meal.name}</h3>
          <div className="meal-meta">
            <span><Calendar size={14} /> {new Date(meal.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span><Clock size={14} /> {meal.time}</span>
            <span><MapPin size={14} /> {meal.location}</span>
          </div>
        </div>
        <div className="meal-dress-code">
          <span className="dress-code-badge">{meal.dressCode}</span>
          <ChevronDown size={18} className={expanded ? 'rotated' : ''} />
        </div>
      </div>

      {expanded && (
        <div className="meal-card-expanded">
          <div className="meal-menu">
            <h4>Menu</h4>
            <ul>
              {meal.menu.map((item, i) => (
                <li key={i}>
                  <span className="menu-item">{item}</span>
                  <div className="dietary-icons">
                    {getItemDietaryIcons(item, dietaryIcons)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="meal-dietary-info">
            <h4>Dietary Accommodations</h4>
            <p>{meal.dietaryNotes}</p>
            <div className="dietary-icons-row">
              {dietaryIcons}
            </div>
          </div>

          <div className="meal-special-notes">
            <h4>Special Notes</h4>
            <ul>
              {meal.specialNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>

          {currentUser && !isMyMeal && (
            <div className="meal-actions">
              <button className="btn btn-gold btn-sm">
                <CheckCircle size={14} />
                Add to My Schedule
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

const getItemDietaryIcons = (item, allIcons) => {
  const lower = item.toLowerCase()
  const icons = []
  if (lower.includes('vegetarian') || lower.includes('veggie')) icons.push(<Leaf size={12} title="Vegetarian" />)
  if (lower.includes('vegan')) icons.push(<Leaf size={12} title="Vegan" className="vegan" />)
  if (lower.includes('gluten')) icons.push(<WheatOff size={12} title="Gluten-Free" />)
  if (lower.includes('dairy') || lower.includes('cheese') || lower.includes('cream')) icons.push(<Droplet size={12} title="Contains Dairy" />)
  if (lower.includes('nut')) icons.push(<AlertTriangle size={12} title="Contains Nuts" />)
  return icons
}

const LegendItem = ({ icon, label }) => (
  <div className="legend-item">
    {icon}
    <span>{label}</span>
  </div>
)

export default Meals