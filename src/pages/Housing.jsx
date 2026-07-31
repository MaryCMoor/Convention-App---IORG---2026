import { useState, useMemo } from 'react'
import { 
  Bed, Building, Users, Wifi, Coffee, 
  Utensils, Waves, Accessibility, Shield,
  Search, Filter, CheckCircle, MapPin,
  ChevronDown, ChevronUp, Key, DollarSign
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Housing.css'

const Housing = () => {
  const { state, currentUser } = useApp()
  
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRoom, setExpandedRoom] = useState(null)

  const housing = state.housing
  const userHousingId = currentUser?.housing
  const userAssignment = userHousingId ? housing.assignments.find(a => a.id === userHousingId) : null
  const userRoomType = userAssignment ? housing.roomTypes.find(r => r.id === userAssignment.roomType) : null

  const filteredAssignments = useMemo(() => {
    let result = housing.assignments
    
    if (filterType !== 'all') {
      result = result.filter(a => {
        const roomType = housing.roomTypes.find(r => r.id === a.roomType)
        return roomType?.name.toLowerCase().includes(filterType.toLowerCase())
      })
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        a.roomNumber.toLowerCase().includes(query) ||
        a.building.toLowerCase().includes(query) ||
        (a.roommates?.some(r => r.toLowerCase().includes(query)))
      )
    }
    
    return result.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
  }, [housing.assignments, filterType, searchQuery, housing.roomTypes])

  const roomTypeNames = [...new Set(housing.roomTypes.map(r => r.name))]

  return (
    <div className="housing-page">
      <div className="page-header">
        <h1 className="page-title">
          <Bed className="page-title-icon" size={32} />
          Housing & Accommodations
        </h1>
        <p className="page-subtitle">Hotel assignments, room details, and convention housing information</p>
      </div>

      {/* User's Housing Card */}
      {userAssignment && (
        <div className="my-housing-card">
          <div className="my-housing-main">
            <div className="my-housing-icon">
              <Bed size={32} />
            </div>
            <div className="my-housing-info">
              <h2>Your Housing Assignment</h2>
              <div className="my-housing-details">
                <span className="room-number">Room {userAssignment.roomNumber}</span>
                <span className="room-type">{userRoomType?.name || 'Standard Room'}</span>
                <span className="building">{userAssignment.building}</span>
              </div>
            </div>
            <div className="my-housing-status">
              <span className="badge badge-success">Confirmed</span>
            </div>
          </div>
          <div className="my-housing-meta">
            <div className="meta-item">
              <Key size={16} />
              <div>
                <strong>Check-In</strong>
                <span>{new Date(userAssignment.checkIn).toLocaleString()}</span>
              </div>
            </div>
            <div className="meta-item">
              <Key size={16} />
              <div>
                <strong>Check-Out</strong>
                <span>{new Date(userAssignment.checkOut).toLocaleString()}</span>
              </div>
            </div>
            <div className="meta-item">
              <DollarSign size={16} />
              <div>
                <strong>Rate</strong>
                <span>${userRoomType?.rate || 'N/A'}/night</span>
              </div>
            </div>
            {userAssignment.roommates && userAssignment.roommates.length > 0 && (
              <div className="meta-item roommates">
                <Users size={16} />
                <div>
                  <strong>Roommates</strong>
                  <span>{userAssignment.roommates.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hotel Info */}
      <div className="hotel-info-section">
        <div className="hotel-main">
          <div className="hotel-header">
            <div className="hotel-icon">
              <Building size={32} />
            </div>
            <div>
              <h3>{housing.hotel.name}</h3>
              <p>{housing.hotel.address}</p>
            </div>
          </div>
          <div className="hotel-contact">
            <a href={`tel:${housing.hotel.phone}`}><span>📞 {housing.hotel.phone}</span></a>
            <span>🕐 Check-in: {housing.hotel.checkIn} | Check-out: {housing.hotel.checkOut}</span>
          </div>
        </div>
        <div className="hotel-amenities">
          {housing.hotel.amenities.map((amenity, i) => (
            <span key={i} className="amenity-badge">{amenity}</span>
          ))}
        </div>
      </div>

      {/* Room Types Overview */}
      <div className="room-types-section">
        <h2>Available Room Types</h2>
        <div className="room-types-grid">
          {housing.roomTypes.map(roomType => {
            const assignments = housing.assignments.filter(a => a.roomType === roomType.id)
            const available = roomType.available
            const total = roomType.total || assignments.length + available
            const occupied = total - available
            
            return (
              <div key={roomType.id} className="room-type-card">
                <div className="room-type-header">
                  <h3>{roomType.name}</h3>
                  <span className={`availability-badge ${available > 0 ? 'available' : 'full'}`}>
                    {available > 0 ? `${available} Available` : 'Sold Out'}
                  </span>
                </div>
                <p>{roomType.description}</p>
                <div className="room-type-features">
                  <span>👥 Sleeps {roomType.capacity}</span>
                  <span>💰 ${roomType.rate}/night</span>
                </div>
                <div className="room-type-occupancy">
                  <div className="occupancy-bar">
                    <div className="occupancy-fill" style={{ width: `${(occupied / total) * 100}%` }} />
                  </div>
                  <span className="occupancy-text">{occupied} / {total} occupied</span>
                </div>
                <div className="room-type-amenities">
                  {roomType.amenities.map((amenity, i) => (
                    <span key={i} className="room-amenity">{amenity}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Room Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            {roomTypeNames.map(name => <option key={name} value={name.toLowerCase()}>{name}</option>)}
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search room numbers, buildings, roommates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Assignments List */}
      <div className="assignments-container">
        <h2>All Room Assignments ({filteredAssignments.length})</h2>
        <div className="assignments-grid">
          {filteredAssignments.map(assignment => {
            const roomType = housing.roomTypes.find(r => r.id === assignment.roomType)
            const isUserRoom = userAssignment?.id === assignment.id
            
            return (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
                roomType={roomType}
                isUserRoom={isUserRoom}
                isExpanded={expandedRoom === assignment.id}
                onToggle={() => setExpandedRoom(expandedRoom === assignment.id ? null : assignment.id)}
              />
            )
          })}
        </div>
        
        {filteredAssignments.length === 0 && (
          <div className="empty-state">
            <Bed size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Assignments Found</h3>
            <p className="empty-state-message">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Housing Policies */}
      <div className="housing-policies">
        <h2>Housing Policies & Information</h2>
        <div className="policies-grid">
          <PolicyCard icon={Shield} title="Security" items={['24/7 front desk', 'Key card access', 'Security cameras in common areas', 'On-site security staff']} />
          <PolicyCard icon={Wifi} title="Connectivity" items={['Free high-speed WiFi', 'Business center', 'Charging stations in lobby', 'Tech support available']} />
          <PolicyCard icon={Coffee} title="Dining" items={['Continental breakfast included', 'Room service 6AM-10PM', 'Dietary accommodations', 'Nearby restaurants']} />
          <PolicyCard icon={Accessibility} title="Accessibility" items={['ADA compliant rooms', 'Roll-in showers available', 'Elevator access all floors', 'Service animals welcome']} />
        </div>
      </div>
    </div>
  )
}

const AssignmentCard = ({ assignment, roomType, isUserRoom, isExpanded, onToggle }) => {
  return (
    <article className={`assignment-card ${isUserRoom ? 'user-room' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="assignment-header" onClick={onToggle}>
        <div className="assignment-main">
          <div className="assignment-room">
            <span className="room-number">Room {assignment.roomNumber}</span>
            <span className="room-type-name">{roomType?.name || 'Standard'}</span>
          </div>
          <div className="assignment-building">
            <MapPin size={14} />
            <span>{assignment.building}</span>
          </div>
        </div>
        <div className="assignment-status">
          {isUserRoom && <span className="badge badge-gold">Your Room</span>}
          <ChevronDown size={18} className={isExpanded ? 'rotated' : ''} />
        </div>
      </div>

      {isExpanded && (
        <div className="assignment-expanded">
          <div className="expanded-grid">
            <div className="expanded-section">
              <h4>Room Details</h4>
              <dl>
                <dt>Room Type</dt>
                <dd>{roomType?.name || 'Standard'}</dd>
                <dt>Capacity</dt>
                <dd>{roomType?.capacity || 'N/A'} guests</dd>
                <dt>Rate</dt>
                <dd>${roomType?.rate || 'N/A'}/night</dd>
                <dt>Floor</dt>
                <dd>{assignment.floor}</dd>
              </dl>
            </div>
            
            <div className="expanded-section">
              <h4>Dates</h4>
              <dl>
                <dt>Check-In</dt>
                <dd>{new Date(assignment.checkIn).toLocaleString()}</dd>
                <dt>Check-Out</dt>
                <dd>{new Date(assignment.checkOut).toLocaleString()}</dd>
                <dt>Nights</dt>
                <dd>{Math.ceil((new Date(assignment.checkOut) - new Date(assignment.checkIn)) / (1000 * 60 * 60 * 24))}</dd>
              </dl>
            </div>

            <div className="expanded-section">
              <h4>Roommates</h4>
              {assignment.roommates && assignment.roommates.length > 0 ? (
                <ul className="roommates-list">
                  {assignment.roommates.map((roommate, i) => (
                    <li key={i}>{roommate}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-roommates">No roommates assigned</p>
              )}
            </div>

            <div className="expanded-section">
              <h4>Amenities</h4>
              <div className="amenities-list">
                {roomType?.amenities.map((amenity, i) => (
                  <span key={i} className="room-amenity">{amenity}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

const PolicyCard = ({ icon: Icon, title, items }) => (
  <div className="policy-card">
    <div className="policy-icon">
      <Icon size={24} />
    </div>
    <h3>{title}</h3>
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </div>
)

export default Housing