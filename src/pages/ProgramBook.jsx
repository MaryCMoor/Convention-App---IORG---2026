import { useState, useMemo } from 'react'
import { 
  BookOpen, ChevronLeft, ChevronRight, Search, 
  Download, Bookmark, Share2, Heart, Star,
  User, Users, Award, Calendar, MapPin,
  AlertTriangle, Info, Sparkles
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './ProgramBook.css'

const ProgramBook = () => {
  const { state, currentUser, toggleFavorite } = useApp()
  
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState('book')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSection, setFilterSection] = useState('all')

  const sections = [
    { id: 'welcome', title: 'Welcome Message', icon: Sparkles, pages: 2 },
    { id: 'officers', title: 'Grand Officers', icon: User, pages: 3 },
    { id: 'guests', title: 'Distinguished Guests', icon: Users, pages: 2 },
    { id: 'schedule', title: 'Convention Schedule', icon: Calendar, pages: 4 },
    { id: 'awards', title: 'Awards & Recognition', icon: Award, pages: 3 },
    { id: 'sponsors', title: 'Sponsors & Partners', icon: Heart, pages: 2 },
    { id: 'committees', title: 'Committees', icon: Bookmark, pages: 3 },
    { id: 'maps', title: 'Venue Maps', icon: MapPin, pages: 2 },
    { id: 'info', title: 'Important Information', icon: Info, pages: 2 },
    { id: 'emergency', title: 'Emergency Procedures', icon: AlertTriangle, pages: 2 },
    { id: 'notes', title: 'Notes', icon: BookOpen, pages: 4 },
  ]

  const totalPages = sections.reduce((sum, s) => sum + s.pages, 0)
  const currentSection = sections[Math.min(currentPage, sections.length - 1)] || sections[0]

  const filteredSections = useMemo(() => {
    if (filterSection === 'all') return sections
    return sections.filter(s => s.id === filterSection)
  }, [filterSection])

  const goToPage = (page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
  }

  const goToSection = (sectionId) => {
    let pageIndex = 0
    for (const section of sections) {
      if (section.id === sectionId) {
        goToPage(pageIndex)
        break
      }
      pageIndex += section.pages
    }
  }

  return (
    <div className="program-book-page">
      <div className="page-header">
        <h1 className="page-title">
          <BookOpen className="page-title-icon" size={32} />
          Digital Program Book
        </h1>
        <p className="page-subtitle">103rd Grand Assembly — The Greatest Showman</p>
      </div>

      {/* Toolbar */}
      <div className="program-toolbar">
        <div className="toolbar-left">
          <div className="view-toggle">
            <button className={viewMode === 'book' ? 'active' : ''} onClick={() => setViewMode('book')}>
              <BookOpen size={18} />
              <span>Book View</span>
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="18"/></svg>
              <span>List View</span>
            </button>
          </div>
        </div>
        
        <div className="toolbar-center">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search program book..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="toolbar-right">
          <div className="page-nav">
            <button className="btn btn-outline" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
              <ChevronLeft size={18} />
            </button>
            <span className="page-indicator">{currentPage + 1} / {totalPages}</span>
            <button className="btn btn-outline" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
              <ChevronRight size={18} />
            </button>
          </div>
          <button className="btn btn-gold">
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="section-nav" aria-label="Program sections">
        {sections.map(section => {
          const Icon = section.icon
          let pageIndex = 0
          for (const s of sections) {
            if (s.id === section.id) break
            pageIndex += s.pages
          }
          const isActive = currentPage >= pageIndex && currentPage < pageIndex + section.pages
          return (
            <button
              key={section.id}
              className={`section-tab ${isActive ? 'active' : ''}`}
              onClick={() => goToSection(section.id)}
            >
              <Icon size={16} />
              <span>{section.title}</span>
              <span className="section-pages">{section.pages}p</span>
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <div className="program-content">
        {viewMode === 'book' ? (
          <BookView 
            currentPage={currentPage}
            currentSection={currentSection}
            totalPages={totalPages}
            sections={sections}
            onPageChange={goToPage}
            currentUser={currentUser}
            toggleFavorite={toggleFavorite}
          />
        ) : (
          <ListView 
            sections={filteredSections}
            searchQuery={searchQuery}
            currentUser={currentUser}
            toggleFavorite={toggleFavorite}
          />
        )}
      </div>

      {/* Bottom Page Nav */}
      <div className="bottom-page-nav">
        <button className="btn btn-outline" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
          <ChevronLeft size={18} />
          Previous
        </button>
        <div className="page-thumbnails">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-thumb ${i === currentPage ? 'active' : ''}`}
              onClick={() => goToPage(i)}
              aria-label={`Page ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button className="btn btn-outline" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

const BookView = ({ currentPage, currentSection, totalPages, sections, onPageChange, currentUser, toggleFavorite }) => {
  // Determine which logical page within section
  let pageInSection = currentPage
  for (const section of sections) {
    if (section.id === currentSection.id) break
    pageInSection -= section.pages
  }

  const renderPageContent = (sectionId, pageIndex) => {
    switch (sectionId) {
      case 'welcome':
        return pageIndex === 0 ? <WelcomePage1 /> : <WelcomePage2 />
      case 'officers':
        return pageIndex === 0 ? <OfficersPage1 /> : pageIndex === 1 ? <OfficersPage2 /> : <OfficersPage3 />
      case 'guests':
        return pageIndex === 0 ? <GuestsPage1 /> : <GuestsPage2 />
      case 'schedule':
        if (pageIndex === 0) return <SchedulePage1 />
        if (pageIndex === 1) return <SchedulePage2 />
        if (pageIndex === 2) return <SchedulePage3 />
        return <SchedulePage4 />
      case 'awards':
        return pageIndex === 0 ? <AwardsPage1 /> : pageIndex === 1 ? <AwardsPage2 /> : <AwardsPage3 />
      case 'sponsors':
        return pageIndex === 0 ? <SponsorsPage1 /> : <SponsorsPage2 />
      case 'committees':
        return pageIndex === 0 ? <CommitteesPage1 /> : pageIndex === 1 ? <CommitteesPage2 /> : <CommitteesPage3 />
      case 'maps':
        return pageIndex === 0 ? <MapsPage1 /> : <MapsPage2 />
      case 'info':
        return pageIndex === 0 ? <InfoPage1 /> : <InfoPage2 />
      case 'emergency':
        return pageIndex === 0 ? <EmergencyPage1 /> : <EmergencyPage2 />
      case 'notes':
        return <NotesPage />
      default:
        return <div>Page content</div>
    }
  }

  return (
    <div className="book-view">
      <div className="book-spread">
        {/* Left Page */}
        <div className="book-page left-page">
          <div className="page-content">
            <div className="page-header-inner">
              <span className="page-section">{currentSection.title}</span>
              <span className="page-number">{currentPage + 1}</span>
            </div>
            {renderPageContent(currentSection.id, pageInSection)}
            <div className="page-footer-inner">
              <span>The Greatest Showman — 103rd Grand Assembly</span>
              <span>Rainbow Girls International</span>
            </div>
          </div>
          <div className="page-curl" />
        </div>
        
        {/* Right Page (next page) */}
        {currentPage + 1 < totalPages && (
          <div className="book-page right-page">
            <div className="page-content">
              {/* Render next page content */}
              <div className="page-header-inner">
                <span className="page-section">{currentSection.title}</span>
                <span className="page-number">{currentPage + 2}</span>
              </div>
              <div className="page-placeholder">
                <p>Page {currentPage + 2} content would appear here</p>
              </div>
              <div className="page-footer-inner">
                <span>The Greatest Showman — 103rd Grand Assembly</span>
                <span>Rainbow Girls International</span>
              </div>
            </div>
            <div className="page-curl right" />
          </div>
        )}
      </div>
      
      {/* Page turn hint */}
      <div className="page-turn-hint">
        <span>← Swipe or click arrows to turn pages →</span>
      </div>
    </div>
  )
}

const ListView = ({ sections, searchQuery, currentUser, toggleFavorite }) => {
  return (
    <div className="list-view">
      {sections.map(section => (
        <div key={section.id} className="list-section">
          <h2 className="list-section-title">
            <section.icon size={20} />
            {section.title}
          </h2>
          <div className="list-section-content">
            <p>Section content would be displayed in list format here.</p>
            <p>Search query: {searchQuery || 'none'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Page Components
const WelcomePage1 = () => (
  <div className="welcome-page">
    <div className="welcome-hero">
      <div className="welcome-lion">🦁</div>
      <h1>The Greatest Showman</h1>
      <h2>103rd Grand Assembly</h2>
      <p className="welcome-date">July 15–18, 2026 • Grand Convention Center</p>
    </div>
    <div className="welcome-message">
      <h3>Welcome from the Grand Worthy Advisor</h3>
      <p>"Step right up, dear sisters, to the most spectacular show on earth! This year's Grand Assembly embraces the magic of The Greatest Showman — a celebration of courage, dreams, and the extraordinary within each of us.</p>
      <p>Like the lion that represents our theme, may you find your roar — your voice, your courage, your leadership. Under the big top of sisterhood, every girl shines in the spotlight.</p>
      <p>Let us make this convention a masterpiece of memories, a symphony of service, and a testament to the power of believing in the impossible."</p>
      <div className="signature">
        <p>With love and lion-hearted courage,</p>
        <p className="signature-name">Grand Worthy Advisor 2025–2026</p>
      </div>
    </div>
  </div>
)

const WelcomePage2 = () => (
  <div className="welcome-page">
    <h2>Convention Theme: The Greatest Showman</h2>
    <div className="theme-elements">
      <div className="theme-item">
        <span className="theme-icon">🦁</span>
        <h4>Lion Mascot</h4>
        <p>Courage, leadership, and the heart of a champion</p>
      </div>
      <div className="theme-item">
        <span className="theme-icon">🎪</span>
        <h4>Big Top Spirit</h4>
        <p>Where dreams take center stage and magic happens</p>
      </div>
      <div className="theme-item">
        <span className="theme-icon">✨</span>
        <h4>Marquee Lights</h4>
        <p>Every girl's name in lights — you are the star</p>
      </div>
      <div className="theme-item">
        <span className="theme-icon">🎭</span>
        <h4>Showmanship</h4>
        <p>Excellence in ritual, leadership, and service</p>
      </div>
    </div>
    <div className="convention-highlights">
      <h3>Convention Highlights</h3>
      <ul>
        <li>🎪 Opening Ceremony — "The Greatest Show" </li>
        <li>🦁 Lionhearted Leadership Workshops </li>
        <li>✨ Talent Showcase — "Center Stage" </li>
        <li>🎭 Ritual Competition — "Command Performance" </li>
        <li>🌟 Grand Banquet — "Curtain Call Celebration" </li>
        <li>🏆 Awards Ceremony — "Standing Ovation" </li>
      </ul>
    </div>
  </div>
)

const OfficersPage1 = () => (
  <div className="officers-page">
    <h2>2025–2026 Grand Officers</h2>
    <div className="officers-grid">
      {[
        { title: 'Grand Worthy Advisor', name: 'Alexandra Morrison', chapter: 'Alpha Chapter #1' },
        { title: 'Grand Worthy Associate Advisor', name: 'Isabella Chen', chapter: 'Beta Chapter #2' },
        { title: 'Grand Charity', name: 'Sophia Rodriguez', chapter: 'Gamma Chapter #3' },
        { title: 'Grand Hope', name: 'Emma Thompson', chapter: 'Delta Chapter #4' },
        { title: 'Grand Faith', name: 'Olivia Williams', chapter: 'Epsilon Chapter #5' },
        { title: 'Grand Secretary', name: 'Ava Martinez', chapter: 'Zeta Chapter #6' },
        { title: 'Grand Treasurer', name: 'Mia Anderson', chapter: 'Eta Chapter #7' },
      ].map((officer, i) => (
        <div key={i} className="officer-card">
          <div className="officer-avatar">{officer.name.split(' ').map(n => n[0]).join('')}</div>
          <h4>{officer.title}</h4>
          <p className="officer-name">{officer.name}</p>
          <p className="officer-chapter">{officer.chapter}</p>
        </div>
      ))}
    </div>
  </div>
)

const OfficersPage2 = () => (
  <div className="officers-page">
    <h2>Grand Officers Continued</h2>
    <div className="officers-grid">
      {[
        { title: 'Grand Lecturer', name: 'Charlotte Taylor', chapter: 'Theta Chapter #8' },
        { title: 'Grand Editor', name: 'Amelia Thomas', chapter: 'Iota Chapter #9' },
        { title: 'Grand Musician', name: 'Harper Jackson', chapter: 'Kappa Chapter #10' },
        { title: 'Grand Marshal', name: 'Evelyn White', chapter: 'Lambda Chapter #11' },
        { title: 'Grand Chaplain', name: 'Abigail Harris', chapter: 'Mu Chapter #12' },
        { title: 'Grand Historian', name: 'Emily Martin', chapter: 'Nu Chapter #13' },
        { title: 'Grand Organist', name: 'Elizabeth Thompson', chapter: 'Xi Chapter #14' },
      ].map((officer, i) => (
        <div key={i} className="officer-card">
          <div className="officer-avatar">{officer.name.split(' ').map(n => n[0]).join('')}</div>
          <h4>{officer.title}</h4>
          <p className="officer-name">{officer.name}</p>
          <p className="officer-chapter">{officer.chapter}</p>
        </div>
      ))}
    </div>
  </div>
)

const OfficersPage3 = () => (
  <div className="officers-page">
    <h2>Grand Deputies & Staff</h2>
    <p>Complete listing of Grand Deputies, District Deputies, and Convention Staff available in the directory.</p>
  </div>
)

const GuestsPage1 = () => (
  <div className="guests-page">
    <h2>Distinguished Guests</h2>
    <div className="guests-grid">
      {[
        { name: 'Supreme Inspector', title: 'International Order of Rainbow for Girls', honor: 'Highest Honor' },
        { name: 'Supreme Deputy', title: 'Jurisdiction Leadership', honor: 'Special Guest' },
        { name: 'Past Grand Worthy Advisors', title: 'Honorary Members', honor: 'Honored Guests' },
        { name: 'Masonic Leadership', title: 'Sponsoring Bodies', honor: 'Distinguished Visitors' },
      ].map((guest, i) => (
        <div key={i} className="guest-card">
          <h4>{guest.name}</h4>
          <p>{guest.title}</p>
          <span className="guest-honor">{guest.honor}</span>
        </div>
      ))}
    </div>
  </div>
)

const GuestsPage2 = () => (
  <div className="guests-page">
    <h2>Special Recognitions</h2>
    <p>Additional distinguished guests, international visitors, and honored alumni will be recognized throughout the convention.</p>
  </div>
)

const SchedulePage1 = () => (
  <div className="schedule-page-content">
    <h2>Convention Schedule Overview</h2>
    <div className="schedule-days">
      {['Wednesday, July 15', 'Thursday, July 16', 'Friday, July 17', 'Saturday, July 18'].map((day, i) => (
        <div key={i} className="schedule-day-summary">
          <h4>{day}</h4>
          <p>Full daily schedule with sessions, meals, and events</p>
        </div>
      ))}
    </div>
  </div>
)

const SchedulePage2 = () => (
  <div className="schedule-page-content">
    <h2>Wednesday — Opening Day</h2>
    <p>Registration • Opening Ceremony • Welcome Reception • Orientation Sessions</p>
  </div>
)

const SchedulePage3 = () => (
  <div className="schedule-page-content">
    <h2>Thursday — Leadership Day</h2>
    <p>Workshops • Ritual Practice • Committee Meetings • Talent Show Auditions</p>
  </div>
)

const SchedulePage4 = () => (
  <div className="schedule-page-content">
    <h2>Friday–Saturday — Celebration Days</h2>
    <p>Competitions • Grand Banquet • Awards • Installation • Closing Ceremony</p>
  </div>
)

const AwardsPage1 = () => (
  <div className="awards-page">
    <h2>Awards & Recognition</h2>
    <div className="awards-categories">
      {[
        { name: '🦁 Lionhearted Award', desc: 'Outstanding courage and leadership' },
        { name: '✨ Spotlight Award', desc: 'Excellence in performance and presentation' },
        { name: '🎪 Greatest Performer Award', desc: 'Exceptional talent showcase' },
        { name: '⭐ Ringmaster Award', desc: 'Masterful event coordination' },
        { name: '❤️ Love Award', desc: 'Embodiment of Rainbow values' },
        { name: '🎭 Showmanship Award', desc: 'Excellence in ritual and ceremony' },
      ].map((award, i) => (
        <div key={i} className="award-card">
          <h4>{award.name}</h4>
          <p>{award.desc}</p>
        </div>
      ))}
    </div>
  </div>
)

const AwardsPage2 = () => (
  <div className="awards-page">
    <h2>Scholarship Awards</h2>
    <p>Academic scholarships, leadership grants, and service awards presented during the Grand Banquet.</p>
  </div>
)

const AwardsPage3 = () => (
  <div className="awards-page">
    <h2>Chapter Awards</h2>
    <p>Membership growth, ritual excellence, service projects, and overall chapter achievement recognition.</p>
  </div>
)

const SponsorsPage1 = () => (
  <div className="sponsors-page">
    <h2>Platinum Sponsors</h2>
    <div className="sponsors-grid">
      <div className="sponsor-card">Masonic Grand Lodge</div>
      <div className="sponsor-card">Rainbow Foundation</div>
      <div className="sponsor-card">Local Business Alliance</div>
    </div>
  </div>
)

const SponsorsPage2 = () => (
  <div className="sponsors-page">
    <h2>Gold & Silver Sponsors</h2>
    <p>Complete listing of all convention sponsors and partners with gratitude for their generous support.</p>
  </div>
)

const CommitteesPage1 = () => (
  <div className="committees-page">
    <h2>Standing Committees</h2>
    <div className="committees-grid">
      {['Registration', 'Housing', 'Meals', 'Transportation', 'Security', 'First Aid', 'Decorations', 'Entertainment'].map((name, i) => (
        <div key={i} className="committee-card">
          <h4>{name} Committee</h4>
          <p>Chair: [Name] • Members: [Count]</p>
        </div>
      ))}
    </div>
  </div>
)

const CommitteesPage2 = () => (
  <div className="committees-page">
    <h2>Special Committees</h2>
    <div className="committees-grid">
      {['Talent Show', 'Ritual Competition', 'Scavenger Hunt', 'Photo Booth', 'Social Media', 'Welcome', 'Historian', 'Legacy'].map((name, i) => (
        <div key={i} className="committee-card">
          <h4>{name} Committee</h4>
          <p>Chair: [Name] • Members: [Count]</p>
        </div>
      ))}
    </div>
  </div>
)

const CommitteesPage3 = () => (
  <div className="committees-page">
    <h2>Committee Contact Information</h2>
    <p>Full contact details for all committee chairs and members available in the Directory section.</p>
  </div>
)

const MapsPage1 = () => (
  <div className="maps-page-content">
    <h2>Convention Center — Main Level</h2>
    <p>Interactive maps available in the Maps section of the app.</p>
  </div>
)

const MapsPage2 = () => (
  <div className="maps-page-content">
    <h2>Hotel & Surrounding Area</h2>
    <p>Walking directions, parking, and local amenities maps.</p>
  </div>
)

const InfoPage1 = () => (
  <div className="info-page">
    <h2>Important Information</h2>
    <div className="info-items">
      <div className="info-item">
        <h4>📋 Check-In</h4>
        <p>Registration opens 8:00 AM daily. Bring photo ID and confirmation QR code.</p>
      </div>
      <div className="info-item">
        <h4>👗 Dress Code</h4>
        <p>Business casual for sessions. Formal for Grand Banquet. Theme attire encouraged!</p>
      </div>
      <div className="info-item">
        <h4>📱 Mobile App</h4>
        <p>Download for schedules, maps, notifications, and your digital badge.</p>
      </div>
      <div className="info-item">
        <h4>♿ Accessibility</h4>
        <p>Wheelchair accessible venues. Sign language interpreters available. Contact registration for needs.</p>
      </div>
    </div>
  </div>
)

const InfoPage2 = () => (
  <div className="info-page">
    <h2>Convention Policies</h2>
    <div className="info-items">
      <div className="info-item">
        <h4>🚭 Smoke-Free</h4>
        <p>All convention venues are smoke-free including vaping.</p>
      </div>
      <div className="info-item">
        <h4>📸 Photography</h4>
        <p>Official photographer only during rituals. Personal photos allowed at meals and social events.</p>
      </div>
      <div className="info-item">
        <h4>🎒 What to Bring</h4>
        <p>Comfortable shoes, light jacket, water bottle, business cards for networking.</p>
      </div>
      <div className="info-item">
        <h4>💬 Code of Conduct</h4>
        <p>Respect, kindness, and sisterhood at all times. See full policy in app.</p>
      </div>
    </div>
  </div>
)

const EmergencyPage1 = () => (
  <div className="emergency-page">
    <h2>Emergency Procedures</h2>
    <div className="emergency-items">
      <div className="emergency-item critical">
        <h4>🚨 Medical Emergency</h4>
        <p><strong>Call 911 first</strong>, then notify Security at x5555. First Aid stations on each floor.</p>
      </div>
      <div className="emergency-item critical">
        <h4>🔥 Fire Emergency</h4>
        <p>Follow illuminated exit signs. Assemble at designated outdoor meeting points. Do not use elevators.</p>
      </div>
      <div className="emergency-item">
        <h4>🌪️ Severe Weather</h4>
        <p>Move to interior rooms away from windows. Follow staff instructions. Monitor app for alerts.</p>
      </div>
      <div className="emergency-item">
        <h4>🚨 Security Concern</h4>
        <p>Report to nearest staff member or Security at x5555. Do not confront. Stay calm.</p>
      </div>
    </div>
  </div>
)

const EmergencyPage2 = () => (
  <div className="emergency-page">
    <h2>Emergency Contacts</h2>
    <div className="emergency-contacts">
      <div className="contact-item">
        <h4>🏥 Convention First Aid</h4>
        <p>Extension 5555 • Room 101</p>
      </div>
      <div className="contact-item">
        <h4>🚑 Nearest Hospital</h4>
        <p>City Medical Center • 2.3 miles</p>
      </div>
      <div className="contact-item">
        <h4>👮 Security Office</h4>
        <p>Extension 5555 • Lobby Level</p>
      </div>
      <div className="contact-item">
        <h4>☎️ Emergency Services</h4>
        <p>911 (from any phone)</p>
      </div>
    </div>
  </div>
)

const NotesPage = () => (
  <div className="notes-page">
    <h2>My Convention Notes</h2>
    <p>Use this space to record thoughts, ideas, and memories from the 103rd Grand Assembly.</p>
    <div className="notes-lines">
      {Array.from({ length: 20 }, (_, i) => <div key={i} className="note-line" />)}
    </div>
  </div>
)

export default ProgramBook