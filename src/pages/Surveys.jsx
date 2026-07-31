import { useState, useMemo } from 'react'
import { 
  ClipboardList, CheckSquare, Star, MessageCircle,
  Filter, Search, ChevronDown, ChevronUp,
  Calendar, User, Users, Download, Eye, EyeOff,
  AlertTriangle, CheckCircle, XCircle, Loader,
  BarChart2, PieChart, TrendingUp
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Surveys.css'

const Surveys = () => {
  const { state, currentUser } = useApp()
  
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSurvey, setExpandedSurvey] = useState(null)
  const [activeTab, setActiveTab] = useState('available')

  const surveys = state.surveys
  const userResponses = currentUser?.surveyResponses || []

  const availableSurveys = surveys.filter(s => s.status === 'open')
  const completedSurveys = surveys.filter(s => userResponses.includes(s.id))
  const upcomingSurveys = surveys.filter(s => s.status === 'upcoming')
  const closedSurveys = surveys.filter(s => s.status === 'closed')

  const filteredSurveys = useMemo(() => {
    let result = activeTab === 'available' ? availableSurveys :
                 activeTab === 'completed' ? completedSurveys :
                 activeTab === 'upcoming' ? upcomingSurveys : closedSurveys
    
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      )
    }
    
    return result.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
  }, [surveys, activeTab, filterStatus, searchQuery, userResponses])

  const isCompleted = (surveyId) => userResponses.includes(surveyId)
  const isExpired = (survey) => new Date(survey.endDate) < new Date()

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'Open', class: 'badge-success' },
      upcoming: { label: 'Upcoming', class: 'badge-blue' },
      closed: { label: 'Closed', class: 'badge-gray' },
    }
    const badge = badges[status] || { label: status, class: '' }
    return <span className={`badge ${badge.class}`}>{badge.label}</span>
  }

  const getCategoryIcon = (category) => {
    const icons = {
      feedback: <MessageCircle size={18} />,
      evaluation: <CheckSquare size={18} />,
      preference: <Star size={18} />,
      demographic: <Users size={18} />,
    }
    return icons[category] || <ClipboardList size={18} />
  }

  const tabs = [
    { id: 'available', label: 'Available', count: availableSurveys.length, icon: ClipboardList },
    { id: 'completed', label: 'Completed', count: completedSurveys.length, icon: CheckCircle },
    { id: 'upcoming', label: 'Upcoming', count: upcomingSurveys.length, icon: Calendar },
    { id: 'closed', label: 'Closed', count: closedSurveys.length, icon: XCircle },
  ]

  return (
    <div className="surveys-page">
      <div className="page-header">
        <h1 className="page-title">
          <ClipboardList className="page-title-icon" size={32} />
          Surveys & Feedback
        </h1>
        <p className="page-subtitle">Share your voice - convention surveys, evaluations, and feedback forms</p>
      </div>

      {/* Stats */}
      <div className="surveys-stats">
        <div className="stat-item">
          <strong>{surveys.length}</strong>
          <span>Total Surveys</span>
        </div>
        <div className="stat-item">
          <strong>{availableSurveys.length}</strong>
          <span>Open Now</span>
        </div>
        <div className="stat-item">
          <strong>{completedSurveys.length}</strong>
          <span>Completed</span>
        </div>
        <div className="stat-item">
          <strong>{surveys.reduce((sum, s) => sum + s.responses, 0)}</strong>
          <span>Total Responses</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="survey-tabs">
        {tabs.map(tab => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              className={`survey-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon size={18} />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          )
        })}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Surveys List */}
      <div className="surveys-container">
        {filteredSurveys.map(survey => (
          <SurveyCard 
            key={survey.id} 
            survey={survey} 
            isCompleted={isCompleted(survey.id)}
            isExpired={isExpired(survey)}
            isExpanded={expandedSurvey === survey.id}
            onToggle={() => setExpandedSurvey(expandedSurvey === survey.id ? null : survey.id)}
            getStatusBadge={getStatusBadge}
            getCategoryIcon={getCategoryIcon}
            currentUser={currentUser}
          />
        ))}
        
        {filteredSurveys.length === 0 && (
          <div className="empty-state">
            <ClipboardList size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Surveys Found</h3>
            <p className="empty-state-message">
              {activeTab === 'available' ? 'No open surveys at the moment. Check back soon!' :
               activeTab === 'completed' ? 'You haven\'t completed any surveys yet.' :
               activeTab === 'upcoming' ? 'No upcoming surveys scheduled.' :
               'No closed surveys.'}
            </p>
          </div>
        )}
      </div>

      {/* Survey Analytics Preview */}
      {currentUser?.role === 'administrator' && (
        <div className="survey-analytics">
          <h2>Survey Analytics Overview</h2>
          <div className="analytics-grid">
            <AnalyticsCard icon={BarChart2} title="Response Rate" value="78%" trend="+5%" />
            <AnalyticsCard icon={PieChart} title="Completion Rate" value="85%" trend="+3%" />
            <AnalyticsCard icon={TrendingUp} title="Satisfaction" value="4.6/5" trend="+0.2" />
            <AnalyticsCard icon={Users} title="Participants" value="1,247" trend="+127" />
          </div>
        </div>
      )}
    </div>
  )
}

const SurveyCard = ({ survey, isCompleted, isExpired, isExpanded, onToggle, getStatusBadge, getCategoryIcon, currentUser }) => {
  const progress = survey.targetResponses > 0 ? Math.min(100, (survey.responses / survey.targetResponses) * 100) : 0

  return (
    <article className={`survey-card ${isCompleted ? 'completed' : ''} ${isExpired && !isCompleted ? 'expired' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="survey-header" onClick={onToggle}>
        <div className="survey-icon-wrapper">
          <div className="survey-icon" style={{ backgroundColor: survey.color }}>
            {getCategoryIcon(survey.category)}
          </div>
          {isCompleted && <div className="completed-badge"><CheckCircle size={16} /></div>}
        </div>
        <div className="survey-main">
          <div className="survey-title-row">
            <h3>{survey.title}</h3>
            {getStatusBadge(survey.status)}
          </div>
          <p className="survey-description">{survey.description}</p>
          <div className="survey-meta">
            <span><Calendar size={14} /> Ends: {new Date(survey.endDate).toLocaleDateString()}</span>
            <span><Users size={14} /> {survey.responses}/{survey.targetResponses} responses</span>
            <span>{survey.estimatedTime} min</span>
          </div>
          <div className="survey-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-text">{Math.round(progress)}% complete</span>
          </div>
        </div>
        <div className="survey-expand">
          <ChevronDown size={20} className={isExpanded ? 'rotated' : ''} />
        </div>
      </div>

      {isExpanded && (
        <div className="survey-expanded">
          <div className="survey-details">
            <div className="detail-section">
              <h4>About This Survey</h4>
              <p>{survey.fullDescription || survey.description}</p>
            </div>

            <div className="detail-section">
              <h4>Questions Preview</h4>
              <ul className="questions-preview">
                {survey.questions.slice(0, 3).map((q, i) => (
                  <li key={i}>
                    <span className="question-type">{q.type}</span>
                    <span className="question-text">{q.text}</span>
                    {q.required && <span className="required-badge">Required</span>}
                  </li>
                ))}
                {survey.questions.length > 3 && (
                  <li className="more-questions">+ {survey.questions.length - 3} more questions</li>
                )}
              </ul>
            </div>

            <div className="detail-section">
              <h4>Categories</h4>
              <div className="survey-categories">
                {survey.categories.map((cat, i) => (
                  <span key={i} className="category-tag">{cat}</span>
                ))}
              </div>
            </div>

            {survey.incentives && survey.incentives.length > 0 && (
              <div className="detail-section">
                <h4>Incentives</h4>
                <ul className="incentives-list">
                  {survey.incentives.map((inc, i) => (
                    <li key={i}>{inc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="survey-actions">
            {isCompleted ? (
              <button className="btn btn-success" disabled>
                <CheckCircle size={16} /> Completed - Thank You!
              </button>
            ) : isExpired ? (
              <button className="btn btn-gray" disabled>
                <XCircle size={16} /> Survey Closed
              </button>
            ) : currentUser ? (
              <button className="btn btn-gold btn-lg">
                <CheckSquare size={16} /> Take Survey
              </button>
            ) : (
              <button className="btn btn-outline btn-lg">
                <User size={16} /> Login to Participate
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

const AnalyticsCard = ({ icon: Icon, title, value, trend }) => (
  <div className="analytics-card">
    <div className="analytics-icon">
      <Icon size={28} />
    </div>
    <div className="analytics-value">{value}</div>
    <div className="analytics-title">{title}</div>
    <div className="analytics-trend positive">{trend}</div>
  </div>
)

export default Surveys