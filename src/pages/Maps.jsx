import { useState, useMemo } from 'react'
import { 
  MapPin, Navigation, Building, DoorOpen, Wifi, 
  Coffee, Utensils, Waves, Accessibility, 
  Search, Layers, ZoomIn, ZoomOut, Home,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Maps.css'

const Maps = () => {
  const { state } = useApp()
  
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedPOI, setSelectedPOI] = useState(null)

  const floors = state.maps.floors
  const currentFloor = floors.find(f => f.id === selectedFloor)

  const categories = [
    { value: 'all', label: 'All', icon: MapPin },
    { value: 'session', label: 'Sessions', icon: Building },
    { value: 'meal', label: 'Meals', icon: Utensils },
    { value: 'registration', label: 'Registration', icon: DoorOpen },
    { value: 'exhibit', label: 'Exhibits', icon: Waves },
    { value: 'restroom', label: 'Restrooms', icon: Accessibility },
    { value: 'info', label: 'Info Desk', icon: Coffee },
    { value: 'wifi', label: 'WiFi Zones', icon: Wifi },
  ]

  const filteredPOIs = useMemo(() => {
    if (!currentFloor) return []
    let pois = currentFloor.pois
    
    if (filterCategory !== 'all') {
      pois = pois.filter(p => p.category === filterCategory)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      pois = pois.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }
    
    return pois
  }, [currentFloor, filterCategory, searchQuery])

  const handlePOIClick = (poi) => {
    setSelectedPOI(poi)
  }

  const closePOI = () => {
    setSelectedPOI(null)
  }

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? <cat.icon size={14} /> : <MapPin size={14} />
  }

  return (
    <div className="maps-page">
      <div className="page-header">
        <h1 className="page-title">
          <MapPin className="page-title-icon" size={32} />
          Venue Maps
        </h1>
        <p className="page-subtitle">Interactive venue maps and navigation for the Grand Assembly</p>
      </div>

      {/* Floor Selector */}
      <div className="floor-selector">
        <div className="floor-tabs">
          {floors.map(floor => (
            <button
              key={floor.id}
              className={`floor-tab ${selectedFloor === floor.id ? 'active' : ''}`}
              onClick={() => setSelectedFloor(floor.id)}
            >
              <span className="floor-number">{floor.name}</span>
              <span className="floor-label">{floor.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map View */}
      <div className="map-container">
        <div className="map-sidebar">
          {/* Search & Filters */}
          <div className="map-search-section">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-section">
              <label>Filter by Category</label>
              <div className="filter-chips">
                {categories.map(cat => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.value}
                      className={`filter-chip ${filterCategory === cat.value ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat.value)}
                    >
                      <Icon size={14} />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* POI List */}
          <div className="poi-list-section">
            <h3>Locations on {currentFloor?.label || 'this floor'}</h3>
            {filteredPOIs.length === 0 ? (
              <p className="no-results">No locations match your search.</p>
            ) : (
              <div className="poi-list">
                {filteredPOIs.map(poi => (
                  <button
                    key={poi.id}
                    className={`poi-item ${selectedPOI?.id === poi.id ? 'selected' : ''}`}
                    onClick={() => handlePOIClick(poi)}
                  >
                    <div className="poi-item-icon" style={{ backgroundColor: poi.color }}>
                      {getCategoryIcon(poi.category)}
                    </div>
                    <div className="poi-item-info">
                      <h4>{poi.name}</h4>
                      <p>{poi.description}</p>
                    </div>
                    <Navigation size={16} className="poi-nav-icon" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Visualization */}
        <div className="map-main">
          <div className="map-header">
            <h2>{currentFloor?.name} - {currentFloor?.label}</h2>
            <div className="map-controls">
              <button className="map-control-btn" title="Zoom In"><ZoomIn size={18} /></button>
              <button className="map-control-btn" title="Zoom Out"><ZoomOut size={18} /></button>
              <button className="map-control-btn" title="Reset View"><Home size={18} /></button>
              <button className="map-control-btn" title="Toggle Layers"><Layers size={18} /></button>
            </div>
          </div>
          
          <div className="map-viewport">
            <div className="map-canvas">
              {/* Floor plan representation */}
              <div className="floor-plan">
                {currentFloor?.rooms.map(room => (
                  <div
                    key={room.id}
                    className="map-room"
                    style={{
                      gridColumn: room.colStart + ' / ' + room.colEnd,
                      gridRow: room.rowStart + ' / ' + room.rowEnd,
                      backgroundColor: room.color,
                    }}
                    title={room.name}
                  >
                    <span className="room-label">{room.name}</span>
                    <span className="room-capacity">{room.capacity} pax</span>
                  </div>
                ))}
                
                {/* POIs on map */}
                {filteredPOIs.map(poi => (
                  <div
                    key={poi.id}
                    className="map-poi"
                    style={{
                      gridColumn: poi.col,
                      gridRow: poi.row,
                    }}
                    onClick={() => handlePOIClick(poi)}
                  >
                    <div className="poi-marker" style={{ backgroundColor: poi.color }}>
                      {getCategoryIcon(poi.category)}
                    </div>
                    <div className="poi-label">{poi.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map Legend */}
            <div className="map-legend">
              <h4>Legend</h4>
              <div className="legend-items">
                {categories.filter(c => c.value !== 'all').map(cat => (
                  <div key={cat.value} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: getCategoryColor(cat.value) }} />
                    <span>{cat.label}</span>
                  </div>
                ))}
                <div className="legend-item">
                  <span className="legend-color room-color" />
                  <span>Session Rooms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POI Detail Modal */}
      {selectedPOI && (
        <div className="poi-modal-overlay" onClick={closePOI}>
          <div className="poi-modal" onClick={e => e.stopPropagation()}>
            <button className="poi-modal-close" onClick={closePOI}>
              <ChevronLeft size={20} />
            </button>
            <div className="poi-modal-header" style={{ borderColor: selectedPOI.color }}>
              <div className="poi-modal-icon" style={{ backgroundColor: selectedPOI.color }}>
                {getCategoryIcon(selectedPOI.category)}
              </div>
              <div>
                <h3>{selectedPOI.name}</h3>
                <span className="poi-modal-category">{selectedPOI.category.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="poi-modal-body">
              <p>{selectedPOI.description}</p>
              
              {selectedPOI.features && selectedPOI.features.length > 0 && (
                <div className="poi-features">
                  <h4>Features</h4>
                  <ul>
                    {selectedPOI.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPOI.schedule && (
                <div className="poi-schedule">
                  <h4>Today's Schedule</h4>
                  {selectedPOI.schedule.map((item, i) => (
                    <div key={i} className="schedule-item">
                      <span className="schedule-time">{item.time}</span>
                      <span className="schedule-event">{item.event}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="poi-actions">
                <button className="btn btn-gold">
                  <Navigation size={18} />
                  Get Directions
                </button>
                <button className="btn btn-outline" onClick={closePOI}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="quick-nav">
        <h3>Quick Navigation</h3>
        <div className="quick-nav-grid">
          <QuickNavCard icon={Building} title="Session Rooms" subtitle="All convention sessions" color="var(--color-primary)" />
          <QuickNavCard icon={Utensils} title="Dining Areas" subtitle="Meals and refreshments" color="var(--color-gold-500)" />
          <QuickNavCard icon={DoorOpen} title="Registration" subtitle="Check-in and badges" color="var(--color-info)" />
          <QuickNavCard icon={Waves} title="Exhibit Hall" subtitle="Vendors and displays" color="var(--color-success)" />
          <QuickNavCard icon={Accessibility} title="Restrooms" subtitle="All facilities" color="var(--color-secondary)" />
          <QuickNavCard icon={Wifi} title="WiFi Zones" subtitle="Free internet access" color="var(--color-warning)" />
        </div>
      </div>
    </div>
  )
}

const QuickNavCard = ({ icon: Icon, title, subtitle, color }) => (
  <div className="quick-nav-card" style={{ borderLeftColor: color }}>
    <div className="quick-nav-icon" style={{ backgroundColor: color }}>
      <Icon size={24} />
    </div>
    <div className="quick-nav-content">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
    <ChevronRight size={20} className="quick-nav-arrow" />
  </div>
)

const getCategoryColor = (category) => {
  const colors = {
    session: '#8B0000',
    meal: '#D4AF37',
    registration: '#1E40AF',
    exhibit: '#059669',
    restroom: '#6B7280',
    info: '#D97706',
    wifi: '#F59E0B',
  }
  return colors[category] || '#6B7280'
}

export default Maps