import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, Building, Utensils, Bed, 
  Shield, CheckCircle, AlertCircle, Loader, 
  CreditCard, Download, Eye, EyeOff,
  ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Registration.css'

const Registration = () => {
  const { state, currentUser, registerAttendee, updateAttendee, login } = useApp()
  
  const [step, setStep] = useState(1)
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
    // Meal selections
    meals: [],
    // Housing
    housingType: '',
    roommatePreference: '',
    // Activities
    activities: [],
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [registeredAttendee, setRegisteredAttendee] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')

  const chapters = state.chapters
  const meals = state.meals
  const housingTypes = state.housing.roomTypes
  const activities = [
    { id: 'act-1', name: 'Talent Show Participation', description: 'Perform in the Talent Show', requiresAudition: true },
    { id: 'act-2', name: 'Scavenger Hunt', description: 'Join the convention-wide scavenger hunt', requiresAudition: false },
    { id: 'act-3', name: 'Convention Choir', description: 'Sing in the Grand Assembly choir', requiresAudition: true },
    { id: 'act-4', name: 'Workshop Facilitator', description: 'Help facilitate leadership workshops', requiresAudition: false },
    { id: 'act-5', name: 'Ritual Participant', description: 'Participate in ritual ceremonies', requiresAudition: false },
    { id: 'act-6', name: 'Photo Booth Volunteer', description: 'Help run the photo booth', requiresAudition: false },
    { id: 'act-7', name: 'Social Media Ambassador', description: 'Share convention highlights online', requiresAudition: false },
    { id: 'act-8', name: 'Welcome Committee', description: 'Greet attendees at registration', requiresAudition: false },
  ]

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Meals', icon: Utensils },
    { num: 3, title: 'Housing', icon: Bed },
    { num: 4, title: 'Activities', icon: Shield },
    { num: 5, title: 'Confirm', icon: CheckCircle },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateStep = (stepNum) => {
    const newErrors = {}
    
    if (stepNum === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
      if (!formData.chapterId) newErrors.chapterId = 'Please select your chapter'
      if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name required'
      if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone required'
    }
    
    if (stepNum === 2) {
      if (formData.meals.length === 0) newErrors.meals = 'Please select at least one meal'
    }
    
    if (stepNum === 3) {
      if (!formData.housingType) newErrors.housingType = 'Please select housing type'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(5)) return
    
    setSubmitting(true)
    try {
      if (currentUser) {
        // Update existing attendee
        await updateAttendee(currentUser.id, formData)
        setRegisteredAttendee({ ...currentUser, ...formData })
      } else {
        // Register new attendee
        const newAttendee = await registerAttendee(formData)
        setRegisteredAttendee(newAttendee)
      }
      setStep(6) // Success step
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const user = state.attendees.find(a => a.email === loginEmail)
    if (user && login(user.id)) {
      setShowLogin(false)
      setLoginEmail('')
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        chapterId: user.chapterId,
        dietaryRestrictions: user.dietaryRestrictions,
        tshirtSize: user.tshirtSize,
        meals: user.meals,
        housingType: user.housing ? state.housing.assignments.find(h => h.id === user.housing)?.roomType : '',
      }))
    } else {
      setErrors({ login: 'Email not found. Please register or try again.' })
    }
  }

  const getProgress = () => (step / 5) * 100

  if (step === 6 && registeredAttendee) {
    return (
      <div className="registration-page">
        <div className="registration-success animate-slide-up">
          <div className="success-icon">
            <CheckCircle size={64} />
          </div>
          <h1>Registration Confirmed!</h1>
          <p className="success-message">
            Welcome to the 103rd Grand Assembly, <strong>{registeredAttendee.firstName}</strong>!
          </p>
          
          <div className="confirmation-details">
            <h3>Your Confirmation Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Badge Number</span>
                <span className="detail-value badge-number">{registeredAttendee.badgeNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">QR Code</span>
                <span className="detail-value qr-code">{registeredAttendee.qrCode}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Chapter</span>
                <span className="detail-value">{registeredAttendee.chapterName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role</span>
                <span className="detail-value">{registeredAttendee.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          
          <div className="success-actions">
            <button className="btn btn-gold btn-lg" onClick={() => { setStep(1); setRegisteredAttendee(null); setFormData({ firstName: '', lastName: '', email: '', phone: '', chapterId: '', role: 'attendee', dietaryRestrictions: [], tshirtSize: 'M', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '', meals: [], housingType: '', roommatePreference: '', activities: [] }) }}>
              <Download size={20} />
              Register Another Attendee
            </button>
            <a href="/my-convention" className="btn btn-primary btn-lg">
              <ChevronRight size={20} />
              Go to My Convention
            </a>
          </div>
          
          <div className="success-note">
            <p>📧 A confirmation email has been sent to {registeredAttendee.email}</p>
            <p>📱 Save your QR code for quick check-in at the convention</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="registration-page">
      <div className="page-header">
        <h1 className="page-title">
          <User className="page-title-icon" size={32} />
          Convention Registration
        </h1>
        <p className="page-subtitle">Join us for The Greatest Showman - 103rd Grand Assembly</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{width: `${getProgress()}%`}} />
        </div>
        <div className="progress-steps-list">
          {steps.map((s, index) => (
            <div key={s.num} className={`progress-step ${step > s.num ? 'completed' : step === s.num ? 'active' : ''}`}>
              <div className="step-circle">
                {step > s.num ? <CheckCircle size={16} /> : <s.icon size={16} />}
              </div>
              <span className="step-label">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Prompt */}
      {showLogin && !currentUser && (
        <div className="login-prompt animate-slide-down">
          <h3>Already Registered?</h3>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="login-form-actions">
              <button type="submit" className="btn btn-gold">Sign In & Auto-Fill</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowLogin(false)}>
                Continue as New
              </button>
            </div>
            {errors.login && <div className="alert alert-error">{errors.login}</div>}
          </form>
        </div>
      )}

      {!currentUser && !showLogin && step === 1 && (
        <div className="new-registration-notice">
          <p>Already registered? <button onClick={() => setShowLogin(true)}>Sign in to auto-fill your information</button></p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="registration-form">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <fieldset className="form-step animate-slide-up">
            <legend>Personal Information</legend>
            
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
                  required
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
                  required
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
                required
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
                required
              >
                <option value="">Select your chapter</option>
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name} ({ch.city})</option>
                ))}
              </select>
              {errors.chapterId && <span className="form-error">{errors.chapterId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="attendee">Attendee</option>
                <option value="grand_officer">Grand Officer</option>
                <option value="advisor">Advisor</option>
              </select>
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
              <div className="checkbox-grid">
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

            <hr className="divider" />

            <h4>Emergency Contact *</h4>
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
                  required
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
                  required
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
          </fieldset>
        )}

        {/* Step 2: Meal Selections */}
        {step === 2 && (
          <fieldset className="form-step animate-slide-up">
            <legend>Meal Selections</legend>
            <p className="step-description">Select all meals you plan to attend. Dietary accommodations will be honored based on your restrictions above.</p>
            
            <div className="meals-grid">
              {meals.map(meal => (
                <label key={meal.id} className={`meal-card ${formData.meals.includes(meal.id) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    name="meals"
                    value={meal.id}
                    checked={formData.meals.includes(meal.id)}
                    onChange={handleChange}
                  />
                  <div className="meal-card-content">
                    <div className="meal-card-header">
                      <span className="meal-type">{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</span>
                      <span className="meal-date">{meal.name}</span>
                    </div>
                    <div className="meal-meta">
                      <span>📅 {new Date(meal.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      <span>🕐 {meal.time}</span>
                      <span>📍 {meal.location}</span>
                      <span>👗 {meal.dressCode}</span>
                    </div>
                    <div className="meal-menu">
                      <strong>Menu:</strong> {meal.menu.slice(0, 3).join(', ')}...
                    </div>
                  </div>
                  <CheckCircle className="meal-check" size={24} />
                </label>
              ))}
            </div>
            
            {errors.meals && <div className="alert alert-error">{errors.meals}</div>}
            
            <div className="meal-selection-summary">
              <h4>Selected Meals: {formData.meals.length} of {meals.length}</h4>
              {formData.meals.map(mealId => {
                const meal = meals.find(m => m.id === mealId)
                return meal && <span key={meal.id} className="selected-meal-badge">{meal.type}: {meal.name}</span>
              })}
            </div>
          </fieldset>
        )}

        {/* Step 3: Housing */}
        {step === 3 && (
          <fieldset className="form-step animate-slide-up">
            <legend>Housing & Accommodations</legend>
            <p className="step-description">Select your preferred room type. Room assignments will be made based on availability and chapter groupings.</p>
            
            <div className="housing-options">
              {housingTypes.map(room => (
                <label key={room.id} className={`housing-card ${formData.housingType === room.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="housingType"
                    value={room.id}
                    checked={formData.housingType === room.id}
                    onChange={handleChange}
                  />
                  <div className="housing-card-content">
                    <div className="housing-header">
                      <h4>{room.name}</h4>
                      <span className="housing-rate">${room.rate}/night</span>
                    </div>
                    <p>{room.description}</p>
                    <div className="housing-features">
                      <span>✅ Sleeps {room.name.includes('Double') ? '4' : room.name.includes('Suite') ? '4' : '2'}</span>
                      <span>{room.available > 0 ? `✅ ${room.available} available` : '❌ Sold Out'}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            {errors.housingType && <div className="alert alert-error">{errors.housingType}</div>}

            <div className="form-group">
              <label className="form-label">Roommate Preference (Optional)</label>
              <input
                type="text"
                name="roommatePreference"
                className="form-input"
                value={formData.roommatePreference}
                onChange={handleChange}
                placeholder="Name of preferred roommate(s) or chapter"
              />
              <p className="form-hint">We'll do our best to accommodate requests. Final assignments based on availability.</p>
            </div>

            <div className="housing-info">
              <h4>Hotel Information</h4>
              <div className="hotel-details">
                <p><strong>{state.housing.hotel.name}</strong></p>
                <p>{state.housing.hotel.address}</p>
                <p>📞 {state.housing.hotel.phone}</p>
                <p>🕐 Check-in: {state.housing.hotel.checkIn} | Check-out: {state.housing.hotel.checkOut}</p>
                <div className="hotel-amenities">
                  {state.housing.hotel.amenities.map((amenity, i) => (
                    <span key={i} className="amenity-badge">{amenity}</span>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>
        )}

        {/* Step 4: Activities */}
        {step === 4 && (
          <fieldset className="form-step animate-slide-up">
            <legend>Activities & Participation</legend>
            <p className="step-description">Choose optional activities you'd like to participate in. Some require auditions or advance sign-up.</p>
            
            <div className="activities-list">
              {activities.map(activity => (
                <label key={activity.id} className={`activity-card ${formData.activities.includes(activity.id) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    name="activities"
                    value={activity.id}
                    checked={formData.activities.includes(activity.id)}
                    onChange={handleChange}
                  />
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4>{activity.name}</h4>
                      {activity.requiresAudition && <span className="audition-badge">Audition Required</span>}
                    </div>
                    <p>{activity.description}</p>
                  </div>
                  <CheckCircle className="activity-check" size={20} />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <fieldset className="form-step animate-slide-up">
            <legend>Review & Confirm</legend>
            <p className="step-description">Please review your registration details before submitting.</p>
            
            <div className="review-sections">
              <div className="review-section">
                <h4>Personal Information</h4>
                <dl>
                  <dt>Name</dt>
                  <dd>{formData.firstName} {formData.lastName}</dd>
                  <dt>Email</dt>
                  <dd>{formData.email}</dd>
                  <dt>Phone</dt>
                  <dd>{formData.phone || 'Not provided'}</dd>
                  <dt>Chapter</dt>
                  <dd>{chapters.find(c => c.id === formData.chapterId)?.name || 'Not selected'}</dd>
                  <dt>Role</dt>
                  <dd>{formData.role.replace('_', ' ')}</dd>
                  <dt>T-Shirt Size</dt>
                  <dd>{formData.tshirtSize}</dd>
                  <dt>Dietary Restrictions</dt>
                  <dd>{formData.dietaryRestrictions.length > 0 ? formData.dietaryRestrictions.join(', ') : 'None'}</dd>
                </dl>
              </div>
              
              <div className="review-section">
                <h4>Emergency Contact</h4>
                <dl>
                  <dt>Name</dt>
                  <dd>{formData.emergencyContactName}</dd>
                  <dt>Phone</dt>
                  <dd>{formData.emergencyContactPhone}</dd>
                  <dt>Relationship</dt>
                  <dd>{formData.emergencyContactRelationship || 'Not specified'}</dd>
                </dl>
              </div>
              
              <div className="review-section">
                <h4>Meals ({formData.meals.length} selected)</h4>
                <ul>
                  {formData.meals.map(mealId => {
                    const meal = meals.find(m => m.id === mealId)
                    return meal && <li key={meal.id}>{meal.type}: {meal.name}</li>
                  })}
                </ul>
              </div>
              
              <div className="review-section">
                <h4>Housing</h4>
                <dl>
                  <dt>Room Type</dt>
                  <dd>{housingTypes.find(r => r.id === formData.housingType)?.name || 'Not selected'}</dd>
                  <dt>Roommate Preference</dt>
                  <dd>{formData.roommatePreference || 'None specified'}</dd>
                </dl>
              </div>
              
              <div className="review-section">
                <h4>Activities ({formData.activities.length} selected)</h4>
                <ul>
                  {formData.activities.map(activityId => {
                    const activity = activities.find(a => a.id === activityId)
                    return activity && <li key={activity.id}>{activity.name}</li>
                  })}
                </ul>
              </div>
            </div>

            <div className="terms-agreement">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="terms"
                  required
                  onChange={handleChange}
                />
                I agree to the <a href="#">Convention Terms & Conditions</a> and <a href="#">Privacy Policy</a>, and confirm all information is accurate.
              </label>
            </div>

            {errors.submit && <div className="alert alert-error">{errors.submit}</div>}
            {errors.terms && <div className="alert alert-error">You must agree to the terms and conditions</div>}
          </fieldset>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {step > 1 && (
            <button type="button" className="btn btn-outline" onClick={handleBack}>
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          
          {step < 5 && (
            <button type="button" className="btn btn-gold" onClick={handleNext}>
              Next <ChevronRight size={18} />
            </button>
          )}
          
          {step === 5 && (
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader size={18} className="spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default Registration