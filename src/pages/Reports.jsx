import { useState, useMemo } from 'react'
import { 
  BarChart2, PieChart, TrendingUp, Users, Calendar, 
  Download, Filter, Search, ChevronDown, ChevronUp,
  Eye, FileText, FileSpreadsheet, AlertTriangle, CheckCircle,
  Star, Heart, Award, Shield
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Reports.css'

const Reports = () => {
  const { state, currentUser } = useApp()
  
  const [filterType, setFilterType] = useState('all')
  const [dateRange, setDateRange] = useState('convention')
  const [expandedReport, setExpandedReport] = useState(null)

  const reports = state.reports
  const types = [...new Set(reports.map(r => r.type))].sort()

  const filteredReports = useMemo(() => {
    let result = reports
    
    if (filterType !== 'all') {
      result = result.filter(r => r.type === filterType)
    }
    
    return result.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
  }, [reports, filterType])

  const stats = useMemo(() => ({
    total: reports.length,
    attendance: reports.filter(r => r.type === 'attendance').length,
    financial: reports.filter(r => r.type === 'financial').length,
    satisfaction: reports.filter(r => r.type === 'satisfaction').length,
    recent: reports.filter(r => new Date(r.generatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
  }), [reports])

  const getTypeIcon = (type) => {
    const icons = {
      attendance: <Users size={18} />,
      financial: <BarChart2 size={18} />,
      satisfaction: <Star size={18} />,
      registration: <FileText size={18} />,
      meals: <PieChart size={18} />,
      housing: <Shield size={18} />,
      awards: <Award size={18} />,
      engagement: <Heart size={18} />,
    }
    return icons[type] || <FileText size={18} />
  }

  const getTypeBadge = (type) => {
    const badges = {
      attendance: 'badge-blue',
      financial: 'badge-gold',
      satisfaction: 'badge-red',
      registration: 'badge-green',
      meals: 'badge-purple',
      housing: 'badge-gray',
      awards: 'badge-gold',
      engagement: 'badge-red',
    }
    return <span className={`badge ${badges[type] || 'badge-gray'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">
          <BarChart2 className="page-title-icon" size={32} />
          Reports & Analytics
        </h1>
        <p className="page-subtitle">Convention analytics, attendance reports, and performance dashboards</p>
      </div>

      {/* Key Metrics */}
      <div className="reports-metrics">
        <MetricCard 
          icon={Users} 
          title="Total Attendees" 
          value={state.analytics?.totalAttendees || 1247}
          trend="+12% vs 2025"
          trendPositive
        />
        <MetricCard 
          icon={CheckCircle} 
          title="Check-in Rate" 
          value={`${state.analytics?.checkinRate || 94}%`}
          trend="+3% vs target"
          trendPositive
        />
        <MetricCard 
          icon={Star} 
          title="Satisfaction" 
          value={`${state.analytics?.satisfaction || 4.7}/5`}
          trend="+0.2 vs 2025"
          trendPositive
        />
        <MetricCard 
          icon={TrendingUp} 
          title="Engagement" 
          value={`${state.analytics?.engagement || 87}%`}
          trend="+5% vs target"
          trendPositive
        />
      </div>

      {/* Quick Stats */}
      <div className="reports-quick-stats">
        <div className="quick-stat">
          <span className="quick-stat-label">Reports Generated</span>
          <span className="quick-stat-value">{stats.total}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-label">This Week</span>
          <span className="quick-stat-value">{stats.recent}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-label">Attendance Reports</span>
          <span className="quick-stat-value">{stats.attendance}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat-label">Financial Reports</span>
          <span className="quick-stat-value">{stats.financial}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Report Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            {types.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Date Range</label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="filter-select">
            <option value="convention">Convention Week</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={""}
            onChange={() => {}}
            className="search-input"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-container">
        {filteredReports.map(report => (
          <ReportCard 
            key={report.id} 
            report={report} 
            isExpanded={expandedReport === report.id}
            onToggle={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
            getTypeIcon={getTypeIcon}
            getTypeBadge={getTypeBadge}
            formatDate={formatDate}
            currentUser={currentUser}
          />
        ))}
        
        {filteredReports.length === 0 && (
          <div className="empty-state">
            <BarChart2 size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Reports Found</h3>
            <p className="empty-state-message">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      <div className="analytics-dashboard">
        <h2>Convention Analytics Dashboard</h2>
        
        <div className="dashboard-grid">
          {/* Attendance Chart */}
          <div className="dashboard-card wide">
            <div className="dashboard-card-header">
              <h3><Users size={20} /> Attendance by Day</h3>
              <Download size={18} className="export-btn" />
            </div>
            <div className="chart-placeholder">
              <div className="chart-bars">
                {state.analytics?.attendanceByDay?.map((day, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${day.percent}%` }}>
                    <span className="bar-value">{day.count}</span>
                    <span className="bar-label">{day.day}</span>
                  </div>
                )) || [
                  { day: 'Mon', count: 850, percent: 68 },
                  { day: 'Tue', count: 1100, percent: 88 },
                  { day: 'Wed', count: 1247, percent: 100 },
                  { day: 'Thu', count: 1180, percent: 95 },
                  { day: 'Fri', count: 950, percent: 76 },
                  { day: 'Sat', count: 720, percent: 58 },
                ].map((d, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${d.percent}%` }}>
                    <span className="bar-value">{d.count}</span>
                    <span className="bar-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Registration by Type */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><FileText size={20} /> Registration Types</h3>
            </div>
            <div className="chart-placeholder">
              <div className="pie-chart">
                {state.analytics?.registrationByType?.map((item, i) => (
                  <div key={i} className="pie-slice" style={{ '--color': item.color }}>
                    <span className="slice-label">{item.type}: {item.percent}%</span>
                  </div>
                )) || [
                  { type: 'Full Week', percent: 45, color: '#8B0000' },
                  { type: 'Daily', percent: 30, color: '#D4AF37' },
                  { type: 'Student', percent: 15, color: '#1a1a2e' },
                  { type: 'Guest', percent: 10, color: '#f5f0e8' },
                ].map((d, i) => (
                  <div key={i} className="pie-slice" style={{ '--color': d.color }}>
                    <span className="slice-label">{d.type}: {d.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Satisfaction by Category */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><Star size={20} /> Satisfaction Scores</h3>
            </div>
            <div className="chart-placeholder">
              <div className="satisfaction-bars">
                {state.analytics?.satisfactionByCategory?.map((cat, i) => (
                  <div key={i} className="sat-bar">
                    <span className="sat-label">{cat.category}</span>
                    <div className="sat-bar-track">
                      <div className="sat-bar-fill" style={{ width: `${cat.score * 20}%`, background: cat.color }} />
                    </div>
                    <span className="sat-value">{cat.score}/5</span>
                  </div>
                )) || [
                  { category: 'Sessions', score: 4.8, color: '#8B0000' },
                  { category: 'Meals', score: 4.5, color: '#D4AF37' },
                  { category: 'Housing', score: 4.6, color: '#1a1a2e' },
                  { category: 'Activities', score: 4.9, color: '#D4AF37' },
                  { category: 'Organization', score: 4.7, color: '#8B0000' },
                  { category: 'Communication', score: 4.4, color: '#1a1a2e' },
                ].map((d, i) => (
                  <div key={i} className="sat-bar">
                    <span className="sat-label">{d.category}</span>
                    <div className="sat-bar-track">
                      <div className="sat-bar-fill" style={{ width: `${d.score * 20}%`, background: d.color }} />
                    </div>
                    <span className="sat-value">{d.score}/5</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3><TrendingUp size={20} /> Revenue Summary</h3>
            </div>
            <div className="revenue-summary">
              <div className="revenue-item">
                <span className="rev-label">Registrations</span>
                <span className="rev-value">${(state.analytics?.revenue?.registrations || 125000).toLocaleString()}</span>
              </div>
              <div className="revenue-item">
                <span className="rev-label">Meals</span>
                <span className="rev-value">${(state.analytics?.revenue?.meals || 45000).toLocaleString()}</span>
              </div>
              <div className="revenue-item">
                <span className="rev-label">Housing</span>
                <span className="rev-value">${(state.analytics?.revenue?.housing || 78000).toLocaleString()}</span>
              </div>
              <div className="revenue-item">
                <span className="rev-label">Merchandise</span>
                <span className="rev-value">${(state.analytics?.revenue?.merchandise || 12000).toLocaleString()}</span>
              </div>
              <div className="revenue-item">
                <span className="rev-label">Sponsorships</span>
                <span className="rev-value">${(state.analytics?.revenue?.sponsorships || 35000).toLocaleString()}</span>
              </div>
              <div className="revenue-item total">
                <span className="rev-label">Total</span>
                <span className="rev-value">${(state.analytics?.revenue?.total || 295000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ icon: Icon, title, value, trend, trendPositive }) => (
  <div className="metric-card">
    <div className="metric-icon">
      <Icon size={28} />
    </div>
    <div className="metric-content">
      <div className="metric-value">{value}</div>
      <div className="metric-title">{title}</div>
      <div className={`metric-trend ${trendPositive ? 'positive' : 'negative'}`}>{trend}</div>
    </div>
  </div>
)

const ReportCard = ({ report, isExpanded, onToggle, getTypeIcon, getTypeBadge, formatDate, currentUser }) => {
  const canAccess = !report.restricted || (currentUser && report.allowedRoles.includes(currentUser.role))

  return (
    <article className={`report-card ${isExpanded ? 'expanded' : ''} ${!canAccess ? 'restricted' : ''}`}>
      <div className="report-header" onClick={onToggle}>
        <div className="report-icon" style={{ backgroundColor: report.color }}>
          {getTypeIcon(report.type)}
        </div>
        <div className="report-main">
          <div className="report-title-row">
            <h3>{report.title}</h3>
            {getTypeBadge(report.type)}
          </div>
          <p className="report-description">{report.description}</p>
          <div className="report-meta">
            <span><Calendar size={14} /> Generated: {formatDate(report.generatedAt)}</span>
            <span><FileText size={14} /> {report.pages} pages</span>
            <span><Shield size={14} /> {report.restricted ? 'Restricted' : 'Public'}</span>
          </div>
        </div>
        <div className="report-expand">
          <ChevronDown size={20} className={isExpanded ? 'rotated' : ''} />
        </div>
      </div>

      {isExpanded && (
        <div className="report-expanded">
          <div className="report-details">
            <div className="detail-section">
              <h4>Summary</h4>
              <p>{report.summary}</p>
            </div>

            <div className="detail-section">
              <h4>Key Metrics</h4>
              <div className="metrics-grid">
                {report.keyMetrics.map((metric, i) => (
                  <div key={i} className="metric-item">
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-value">{metric.value}</div>
                    {metric.trend && <div className={`metric-trend ${metric.trendPositive ? 'positive' : 'negative'}`}>{metric.trend}</div>}
                  </div>
                ))}
              </div>
            </div>

            {report.charts && report.charts.length > 0 && (
              <div className="detail-section">
                <h4>Charts & Visualizations</h4>
                <div className="charts-preview">
                  {report.charts.map((chart, i) => (
                    <div key={i} className="chart-preview">
                      <span className="chart-type">{chart.type}</span>
                      <span className="chart-title">{chart.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>Data Sources</h4>
              <ul className="sources-list">
                {report.sources.map((source, i) => (
                  <li key={i}>{source}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="report-actions">
            {!canAccess ? (
              <div className="access-denied">
                <AlertTriangle size={16} />
                <span>Restricted to: {report.allowedRoles.map(r => r.replace('_', ' ')).join(', ')}</span>
              </div>
            ) : (
              <div className="action-buttons">
                <button className="btn btn-outline">
                  <Eye size={16} /> View Report
                </button>
                <button className="btn btn-gold">
                  <Download size={16} /> Download PDF
                </button>
                <button className="btn btn-outline">
                  <FileSpreadsheet size={16} /> Export Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export default Reports