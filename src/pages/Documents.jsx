import { useState, useMemo } from 'react'
import { 
  FileText, FileType, FileSpreadsheet, FileImage, FileVideo, FileAudio,
  Download, Search, Filter, ChevronDown, ChevronUp,
  Eye, Clock, Calendar, User, Lock, Unlock, AlertTriangle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Documents.css'

const Documents = () => {
  const { state, currentUser } = useApp()
  
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')

  const documents = state.documents
  const categories = [...new Set(documents.map(d => d.category))].sort()
  const types = [...new Set(documents.map(d => d.type))].sort()

  const filteredDocuments = useMemo(() => {
    let result = documents
    
    if (filterCategory !== 'all') {
      result = result.filter(d => d.category === filterCategory)
    }
    
    if (filterType !== 'all') {
      result = result.filter(d => d.type === filterType)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(d => 
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.tags.some(t => t.toLowerCase().includes(query)) ||
        d.author.toLowerCase().includes(query)
      )
    }
    
    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [documents, filterCategory, filterType, searchQuery])

  const getTypeIcon = (type) => {
    const icons = {
      pdf: <FileType size={18} className="pdf" />,
      doc: <FileText size={18} className="doc" />,
      xlsx: <FileSpreadsheet size={18} className="xlsx" />,
      jpg: <FileImage size={18} className="jpg" />,
      png: <FileImage size={18} className="png" />,
      mp4: <FileVideo size={18} className="mp4" />,
      mp3: <FileAudio size={18} className="mp3" />,
    }
    return icons[type] || <FileText size={18} />
  }

  const getCategoryBadge = (category) => {
    const badges = {
      schedule: 'badge-gold',
      policy: 'badge-red',
      form: 'badge-blue',
      guide: 'badge-green',
      minutes: 'badge-purple',
      reference: 'badge-gray',
    }
    return <span className={`badge ${badges[category] || 'badge-gray'}`}>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const canAccess = (doc) => {
    if (!doc.restricted) return true
    if (!currentUser) return false
    return doc.allowedRoles.includes(currentUser.role)
  }

  return (
    <div className="documents-page">
      <div className="page-header">
        <h1 className="page-title">
          <FileText className="page-title-icon" size={32} />
          Documents & Resources
        </h1>
        <p className="page-subtitle">Convention documents, forms, guides, and reference materials</p>
      </div>

      {/* Stats */}
      <div className="documents-stats">
        <div className="stat-item">
          <strong>{documents.length}</strong>
          <span>Total Documents</span>
        </div>
        <div className="stat-item">
          <strong>{documents.filter(d => d.category === 'schedule').length}</strong>
          <span>Schedules</span>
        </div>
        <div className="stat-item">
          <strong>{documents.filter(d => d.category === 'form').length}</strong>
          <span>Forms</span>
        </div>
        <div className="stat-item">
          <strong>{documents.filter(d => d.category === 'guide').length}</strong>
          <span>Guides</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>File Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            {types.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents, tags, authors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="view-toggle">
          <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
            <div className="list-icon" />
          </button>
          <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
            <div className="grid-icon" />
          </button>
        </div>
      </div>

      {/* Documents */}
      <div className="documents-container">
        {viewMode === 'list' ? (
          <DocumentList documents={filteredDocuments} getTypeIcon={getTypeIcon} getCategoryBadge={getCategoryBadge} formatFileSize={formatFileSize} canAccess={canAccess} currentUser={currentUser} />
        ) : (
          <DocumentGrid documents={filteredDocuments} getTypeIcon={getTypeIcon} getCategoryBadge={getCategoryBadge} formatFileSize={formatFileSize} canAccess={canAccess} currentUser={currentUser} />
        )}
        
        {filteredDocuments.length === 0 && (
          <div className="empty-state">
            <FileText size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Documents Found</h3>
            <p className="empty-state-message">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Document Categories Info */}
      <div className="categories-info">
        <h2>Document Categories</h2>
        <div className="categories-grid">
          {[
            { id: 'schedule', icon: Calendar, desc: 'Daily schedules, session timetables, and program outlines' },
            { id: 'policy', icon: AlertTriangle, desc: 'Convention rules, codes of conduct, and official policies' },
            { id: 'form', icon: FileText, desc: 'Registration forms, volunteer sign-ups, and feedback forms' },
            { id: 'guide', icon: FileText, desc: 'How-to guides, venue maps, and instructional materials' },
            { id: 'minutes', icon: Clock, desc: 'Meeting minutes, committee reports, and official records' },
            { id: 'reference', icon: FileText, desc: 'Contact lists, vendor info, and quick reference cards' },
          ].map(cat => (
            <div key={cat.id} className="category-card">
              <div className="category-icon">
                <cat.icon size={24} />
              </div>
              <h3>{cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}</h3>
              <p>{cat.desc}</p>
              <span className="category-count">{documents.filter(d => d.category === cat.id).length} documents</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DocumentList = ({ documents, getTypeIcon, getCategoryBadge, formatFileSize, canAccess, currentUser }) => (
  <div className="document-list">
    <div className="list-header">
      <div className="list-col file-col">Document</div>
      <div className="list-col category-col">Category</div>
      <div className="list-col type-col">Type</div>
      <div className="list-col size-col">Size</div>
      <div className="list-col date-col">Date</div>
      <div className="list-col author-col">Author</div>
      <div className="list-col actions-col"></div>
    </div>
    {documents.map(doc => (
      <DocumentRow 
        key={doc.id} 
        doc={doc} 
        getTypeIcon={getTypeIcon} 
        getCategoryBadge={getCategoryBadge} 
        formatFileSize={formatFileSize} 
        canAccess={canAccess(doc)} 
        currentUser={currentUser}
      />
    ))}
  </div>
)

const DocumentRow = ({ doc, getTypeIcon, getCategoryBadge, formatFileSize, canAccess, currentUser }) => (
  <div className={`list-row ${!canAccess ? 'restricted' : ''}`}>
    <div className="list-col file-col">
      <div className="doc-file-cell">
        {getTypeIcon(doc.type)}
        <div>
          <strong>{doc.title}</strong>
          <span className="doc-description">{doc.description}</span>
          {doc.tags.length > 0 && (
            <div className="doc-tags">
              {doc.tags.slice(0, 3).map((tag, i) => <span key={i} className="doc-tag">#{tag}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="list-col category-col">
      {getCategoryBadge(doc.category)}
    </div>
    <div className="list-col type-col">
      <span className="type-badge">{doc.type.toUpperCase()}</span>
    </div>
    <div className="list-col size-col">
      {formatFileSize(doc.size)}
    </div>
    <div className="list-col date-col">
      <Calendar size={14} /> {new Date(doc.date).toLocaleDateString()}
    </div>
    <div className="list-col author-col">
      <User size={14} /> {doc.author}
    </div>
    <div className="list-col actions-col">
      {doc.restricted && <Lock size={16} className="restricted-icon" title="Restricted access" />}
      {!canAccess ? (
        <span className="access-denied">Restricted</span>
      ) : (
        <div className="row-actions">
          <button className="icon-btn" title="View" onClick={() => window.open(doc.url, '_blank')}>
            <Eye size={16} />
          </button>
          <button className="icon-btn" title="Download" onClick={() => window.open(doc.url, '_blank')}>
            <Download size={16} />
          </button>
        </div>
      )}
    </div>
  </div>
)

const DocumentGrid = ({ documents, getTypeIcon, getCategoryBadge, formatFileSize, canAccess, currentUser }) => (
  <div className="document-grid">
    {documents.map(doc => (
      <DocumentCard 
        key={doc.id} 
        doc={doc} 
        getTypeIcon={getTypeIcon} 
        getCategoryBadge={getCategoryBadge} 
        formatFileSize={formatFileSize} 
        canAccess={canAccess(doc)} 
        currentUser={currentUser}
      />
    ))}
  </div>
)

const DocumentCard = ({ doc, getTypeIcon, getCategoryBadge, formatFileSize, canAccess, currentUser }) => (
  <article className={`document-card ${!canAccess ? 'restricted' : ''}`}>
    <div className="doc-card-header">
      <div className="doc-type-icon">
        {getTypeIcon(doc.type)}
      </div>
      <div className="doc-card-meta">
        {getCategoryBadge(doc.category)}
        {doc.restricted && <Lock size={14} className="restricted-badge" title="Restricted" />}
      </div>
    </div>
    <div className="doc-card-body">
      <h3>{doc.title}</h3>
      <p className="doc-description">{doc.description}</p>
      <div className="doc-card-meta-bottom">
        <span><Calendar size={14} /> {new Date(doc.date).toLocaleDateString()}</span>
        <span><User size={14} /> {doc.author}</span>
        <span>{formatFileSize(doc.size)}</span>
      </div>
      <div className="doc-tags">
        {doc.tags.slice(0, 4).map((tag, i) => <span key={i} className="doc-tag">#{tag}</span>)}
        {doc.tags.length > 4 && <span className="doc-tag more">+{doc.tags.length - 4}</span>}
      </div>
    </div>
    <div className="doc-card-footer">
      {!canAccess ? (
        <div className="access-info">
          <Lock size={16} />
          <span>Restricted to: {doc.allowedRoles.map(r => r.replace('_', ' ')).join(', ')}</span>
        </div>
      ) : (
        <div className="doc-actions">
          <button className="btn btn-outline btn-sm" onClick={() => window.open(doc.url, '_blank')}>
            <Eye size={14} /> View
          </button>
          <button className="btn btn-gold btn-sm" onClick={() => window.open(doc.url, '_blank')}>
            <Download size={14} /> Download
          </button>
        </div>
      )}
    </div>
  </article>
)

export default Documents