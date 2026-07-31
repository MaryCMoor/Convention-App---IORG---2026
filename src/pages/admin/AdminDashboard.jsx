import { useMemo } from 'react';
import {
  Users, Calendar, Megaphone, Utensils, Calendar as CalendarIcon,
  ClipboardList, Award, FileText, Images, TrendingUp, Target,
  ArrowUpRight, ArrowDownRight, RefreshCw, Crown
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { getStats, attendees, schedule, announcements, config } = useAdmin();
  const stats = getStats();

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const chapters = new Set(attendees.map(a => a.chapter).filter(Boolean));
    const grandOfficers = attendees.filter(a => a.grandOffice).length;
    const byRole = attendees.reduce((acc, a) => {
      acc[a.role] = (acc[a.role] || 0) + 1;
      return acc;
    }, {});
    const byStatus = attendees.reduce((acc, a) => {
      acc[a.registrationStatus] = (acc[a.registrationStatus] || 0) + 1;
      return acc;
    }, {});
    const upcomingEvents = schedule.filter(e => new Date(e.startTime) > new Date()).length;
    const pinnedAnnouncements = announcements.filter(a => a.pinned).length;
    
    return {
      chapters: chapters.size,
      grandOfficers,
      byRole,
      byStatus,
      upcomingEvents,
      pinnedAnnouncements,
    };
  }, [attendees, schedule, announcements]);

  const statCards = [
    {
      id: 'attendees',
      label: 'Registered Attendees',
      value: stats.totalAttendees,
      icon: Users,
      color: 'gold',
      trend: '+12%',
      trendLabel: 'vs last week',
      trendUp: true,
    },
    {
      id: 'chapters',
      label: 'Chapters Attending',
      value: metrics.chapters,
      icon: Target,
      color: 'primary',
      trend: '+3',
      trendLabel: 'new chapters',
      trendUp: true,
    },
    {
      id: 'events',
      label: 'Scheduled Events',
      value: stats.scheduledEvents,
      icon: CalendarIcon,
      color: 'accent',
      trend: `${metrics.upcomingEvents} upcoming`,
      trendLabel: '',
      trendUp: true,
    },
    {
      id: 'announcements',
      label: 'Active Announcements',
      value: stats.activeAnnouncements,
      icon: Megaphone,
      color: 'secondary',
      trend: `${metrics.pinnedAnnouncements} pinned`,
      trendLabel: '',
      trendUp: false,
    },
    {
      id: 'meals',
      label: 'Meal Selections',
      value: stats.mealsSelected,
      icon: Utensils,
      color: 'gold',
      trend: '3 meal periods',
      trendLabel: '',
      trendUp: false,
    },
    {
      id: 'surveys',
      label: 'Survey Responses',
      value: stats.surveysCompleted,
      icon: ClipboardList,
      color: 'primary',
      trend: `${surveys.length} surveys`,
      trendLabel: '',
      trendUp: true,
    },
    {
      id: 'awards',
      label: 'Awards Created',
      value: stats.awardsCreated,
      icon: Award,
      color: 'accent',
      trend: 'Ready to assign',
      trendLabel: '',
      trendUp: false,
    },
    {
      id: 'documents',
      label: 'Documents',
      value: stats.documentsCount,
      icon: FileText,
      color: 'secondary',
      trend: `${stats.galleryImages} gallery images`,
      trendLabel: '',
      trendUp: false,
    },
  ];

  const surveys = useAdmin().surveys || [];

  // Recent activity (mock)
  const recentActivity = useMemo(() => [
    { id: 1, type: 'attendee', action: 'New registration', details: 'Sarah Mitchell - Delta Chapter', time: '2 min ago', icon: Users, color: 'gold' },
    { id: 2, type: 'announcement', action: 'Announcement published', details: 'Opening Ceremony Details', time: '15 min ago', icon: Megaphone, color: 'primary' },
    { id: 3, type: 'schedule', action: 'Event updated', details: 'Grand Banquet moved to 7:00 PM', time: '1 hour ago', icon: CalendarIcon, color: 'accent' },
    { id: 4, type: 'survey', action: 'Survey response', details: 'Pre-Convention Survey - 5 stars', time: '3 hours ago', icon: ClipboardList, color: 'secondary' },
    { id: 5, type: 'award', action: 'Award winner assigned', details: 'Leadership Award - Emma Wilson', time: 'Yesterday', icon: Award, color: 'gold' },
  ], []);

  // Quick actions
  const quickActions = [
    { label: 'Add Attendee', href: `${ADMIN_CONFIG.routePrefix}/attendees/new`, icon: Users, primary: true },
    { label: 'Create Event', href: `${ADMIN_CONFIG.routePrefix}/schedule/new`, icon: CalendarIcon, primary: false },
    { label: 'Post Announcement', href: `${ADMIN_CONFIG.routePrefix}/announcements/new`, icon: Megaphone, primary: false },
    { label: 'Add Award', href: `${ADMIN_CONFIG.routePrefix}/awards/new`, icon: Award, primary: false },
    { label: 'Upload Document', href: `${ADMIN_CONFIG.routePrefix}/documents/new`, icon: FileText, primary: false },
    { label: 'Manage Meals', href: `${ADMIN_CONFIG.routePrefix}/meals`, icon: Utensils, primary: false },
  ];

  return (
    <div className="admin-dashboard">
      {/* Welcome Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div>
            <h2 className="welcome-title">Welcome back, Administrator</h2>
            <p className="welcome-subtitle">
              {config.name} - {config.theme} Convention Management
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={18} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="dashboard-stats" aria-label="Key statistics">
        <div className="stats-grid">
          {statCards.map((card) => (
            <article key={card.id} className="stat-card">
              <div className="stat-icon" style={{ '--stat-color': `var(--${card.color})` }}>
                <card.icon size={24} aria-hidden="true" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
              <div className={`stat-trend ${card.trendUp ? 'up' : 'down'}`}>
                <span className="trend-value">{card.trend}</span>
                {card.trendLabel && <span className="trend-label">{card.trendLabel}</span>}
                <span className="trend-icon" aria-hidden="true">
                  {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Quick Actions */}
        <section className="dashboard-section quick-actions-section" aria-labelledby="quick-actions-title">
          <h3 id="quick-actions-title" className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <a key={action.label} href={action.href} className={`quick-action-btn ${action.primary ? 'primary' : ''}`}>
                <action.icon size={20} aria-hidden="true" />
                <span>{action.label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-section recent-activity-section" aria-labelledby="recent-activity-title">
          <div className="section-header">
            <h3 id="recent-activity-title" className="section-title">Recent Activity</h3>
            <a href={`${ADMIN_CONFIG.routePrefix}/attendees`} className="view-all-link">View All</a>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon" style={{ '--activity-color': `var(--${activity.color})` }}>
                  <activity.icon size={18} aria-hidden="true" />
                </div>
                <div className="activity-content">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-details">{activity.details}</div>
                </div>
                <time className="activity-time" dateTime={activity.time}>{activity.time}</time>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Attendee Breakdown */}
      <section className="dashboard-section breakdown-section" aria-labelledby="breakdown-title">
        <h3 id="breakdown-title" className="section-title">Attendee Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <h4 className="breakdown-title">By Role</h4>
            <div className="breakdown-list">
              {Object.entries(metrics.byRole).map(([role, count]) => (
                <div key={role} className="breakdown-item">
                  <span className="breakdown-label">{role}</span>
                  <span className="breakdown-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="breakdown-card">
            <h4 className="breakdown-title">By Registration Status</h4>
            <div className="breakdown-list">
              {Object.entries(metrics.byStatus).map(([status, count]) => (
                <div key={status} className="breakdown-item">
                  <span className="breakdown-label">{status.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="breakdown-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="breakdown-card">
            <h4 className="breakdown-title">Special Designations</h4>
            <div className="breakdown-list">
              <div className="breakdown-item">
                <span className="breakdown-label">Grand Officers</span>
                <span className="breakdown-value">{metrics.grandOfficers}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Chapters</span>
                <span className="breakdown-value">{metrics.chapters}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Convention Info */}
      <section className="dashboard-section convention-info-section" aria-labelledby="convention-info-title">
        <h3 id="convention-info-title" className="section-title">Convention Information</h3>
        <div className="convention-info-grid">
          <div className="info-card">
            <div className="info-icon">
              <Calendar size={24} />
            </div>
            <div className="info-content">
              <label>Convention Dates</label>
              <p>{config.startDate} - {config.endDate}</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <Target size={24} />
            </div>
            <div className="info-content">
              <label>Venue</label>
              <p>{config.venue}</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <Users size={24} />
            </div>
            <div className="info-content">
              <label>Expected Attendance</label>
              <p>{config.expectedAttendees} attendees</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <Crown size={24} />
            </div>
            <div className="info-content">
              <label>Theme</label>
              <p>{config.theme}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;