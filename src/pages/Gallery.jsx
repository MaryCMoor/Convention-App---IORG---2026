import { useState, useMemo } from 'react'
import { 
  Images, Camera, Heart, Star, Download, Share2, 
  Filter, Search, ChevronLeft, ChevronRight, X,
  Loader, Grid, MapPin, Calendar, MessageCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import '../components/ui/UIComponents.css'
import './Gallery.css'

const Gallery = () => {
  const { state, currentUser } = useApp()
  
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDay, setFilterDay] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const photos = state.gallery
  const categories = [...new Set(photos.map(p => p.category))].sort()
  const days = [...new Set(photos.map(p => p.day))].sort()

  const filteredPhotos = useMemo(() => {
    let result = photos
    
    if (filterCategory !== 'all') {
      result = result.filter(p => p.category === filterCategory)
    }
    
    if (filterDay !== 'all') {
      result = result.filter(p => p.day === filterDay)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.photographer.toLowerCase().includes(query)
      )
    }
    
    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [photos, filterCategory, filterDay, searchQuery])

  const handlePhotoClick = (photo, index) => {
    setSelectedPhoto(photo)
    setLightboxIndex(filteredPhotos.findIndex(p => p.id === photo.id))
  }

  const handleLightboxClose = () => {
    setSelectedPhoto(null)
  }

  const handleLightboxPrev = () => {
    setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)
  }

  const handleLightboxNext = () => {
    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
  }

  const toggleLike = (photo) => {
    if (!currentUser) return
    // In a real app, this would update the backend
    const newLikes = photo.likes + (photo.liked ? -1 : 1)
    photo.likes = newLikes
    photo.liked = !photo.liked
  }

  if (selectedPhoto) {
    return (
      <Lightbox
        photo={selectedPhoto}
        photos={filteredPhotos}
        index={lightboxIndex}
        onClose={handleLightboxClose}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
        onLike={toggleLike}
        currentUser={currentUser}
      />
    )
  }

  return (
    <div className="gallery-page">
      <div className="page-header">
        <h1 className="page-title">
          <Images className="page-title-icon" size={32} />
          Photo Gallery
        </h1>
        <p className="page-subtitle">Memories from the 103rd Grand Assembly - The Greatest Showman</p>
      </div>

      {/* Stats */}
      <div className="gallery-stats">
        <div className="stat-item">
          <strong>{photos.length}</strong>
          <span>Total Photos</span>
        </div>
        <div className="stat-item">
          <strong>{photos.filter(p => p.featured).length}</strong>
          <span>Featured</span>
        </div>
        <div className="stat-item">
          <strong>{categories.length}</strong>
          <span>Categories</span>
        </div>
        <div className="stat-item">
          <strong>{photos.reduce((sum, p) => sum + p.likes, 0)}</strong>
          <span>Total Likes</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Day</label>
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="filter-select">
            <option value="all">All Days</option>
            {days.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
        </div>
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search photos, tags, photographers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="view-toggle">
          <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
            <Grid size={20} />
          </button>
          <button className={`view-btn ${viewMode === 'masonry' ? 'active' : ''}`} onClick={() => setViewMode('masonry')} title="Masonry View">
            <div className="masonry-icon" />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-container">
        {viewMode === 'grid' ? (
          <div className="gallery-grid">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                index={index}
                onClick={handlePhotoClick}
                currentUser={currentUser}
                onLike={toggleLike}
              />
            ))}
          </div>
        ) : (
          <div className="gallery-masonry">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                index={index}
                onClick={handlePhotoClick}
                currentUser={currentUser}
                onLike={toggleLike}
                masonry={true}
              />
            ))}
          </div>
        )}
        
        {filteredPhotos.length === 0 && (
          <div className="empty-state">
            <Images size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Photos Found</h3>
            <p className="empty-state-message">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Photo of the Day */}
      {state.gallery.find(p => p.featured) && (
        <PhotoOfTheDay photo={state.gallery.find(p => p.featured)} />
      )}
    </div>
  )
}

const PhotoCard = ({ photo, index, onClick, currentUser, onLike, masonry = false }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <article className={`photo-card ${masonry ? 'masonry' : ''} ${photo.featured ? 'featured' : ''} ${!loaded ? 'loading' : ''} ${error ? 'error' : ''}`} style={{ animationDelay: `${(index % 10) * 50}ms` }}>
      <div className="photo-image-wrapper" onClick={() => onClick(photo, index)}>
        {error ? (
          <div className="photo-placeholder">
            <Images size={32} />
            <span>Failed to load</span>
          </div>
        ) : (
          <img
            src={photo.thumbnail || photo.url}
            alt={photo.title}
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
            loading="lazy"
            className={loaded ? 'loaded' : ''}
          />
        )}
        {photo.featured && <span className="featured-badge">★ Featured</span>}
        {!loaded && !error && <div className="photo-skeleton" />}
      </div>
      
      <div className="photo-info">
        <div className="photo-header">
          <h3>{photo.title}</h3>
          {photo.day && <span className="photo-day">{photo.day}</span>}
        </div>
        <p className="photo-description">{photo.description}</p>
        <div className="photo-meta">
          <span className="photo-category">{photo.category}</span>
          <span className="photo-photographer">📷 {photo.photographer}</span>
        </div>
        <div className="photo-tags">
          {photo.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="photo-tag">#{tag}</span>
          ))}
          {photo.tags.length > 4 && <span className="photo-tag more">+{photo.tags.length - 4}</span>}
        </div>
        <div className="photo-actions">
          <button 
            className={`action-btn ${photo.liked ? 'liked' : ''}`}
            onClick={e => { e.stopPropagation(); onLike(photo); }}
            title={photo.liked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} className={photo.liked ? 'filled' : ''} />
            <span>{photo.likes}</span>
          </button>
          <button className="action-btn" onClick={e => { e.stopPropagation(); }} title="Share">
            <Share2 size={16} />
          </button>
          <button className="action-btn" onClick={e => { e.stopPropagation(); }} title="Download">
            <Download size={16} />
          </button>
          <button className="action-btn" onClick={e => { e.stopPropagation(); }} title="Comment">
            <MessageCircle size={16} />
            <span>{photo.comments}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

const Lightbox = ({ photo, photos, index, onClose, onPrev, onNext, onLike, currentUser }) => {
  const [loaded, setLoaded] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onPrev()
    if (e.key === 'ArrowRight') onNext()
  }

  useState(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <X size={28} />
      </button>
      
      <button className="lightbox-nav prev" onClick={e => { e.stopPropagation(); onPrev(); }} aria-label="Previous">
        <ChevronLeft size={32} />
      </button>
      
      <button className="lightbox-nav next" onClick={e => { e.stopPropagation(); onNext(); }} aria-label="Next">
        <ChevronRight size={32} />
      </button>

      <div className="lightbox-content">
        <div className="lightbox-image-wrapper">
          {!loaded && <div className="lightbox-skeleton" />}
          <img
            src={photo.url}
            alt={photo.title}
            onLoad={() => setLoaded(true)}
            className={loaded ? 'loaded' : ''}
          />
        </div>
        
        <div className="lightbox-info">
          <div className="lightbox-header">
            <h2>{photo.title}</h2>
            <div className="lightbox-meta">
              <span>{photo.category}</span>
              <span>{photo.day}</span>
              <span>📷 {photo.photographer}</span>
              <span>{new Date(photo.date).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="lightbox-description">{photo.description}</p>
          <div className="lightbox-tags">
            {photo.tags.map((tag, i) => (
              <span key={i} className="photo-tag">#{tag}</span>
            ))}
          </div>
          <div className="lightbox-actions">
            <button 
              className={`lightbox-action-btn ${photo.liked ? 'liked' : ''}`}
              onClick={e => { e.stopPropagation(); onLike(photo); }}
            >
              <Heart size={20} className={photo.liked ? 'filled' : ''} />
              <span>{photo.likes}</span>
            </button>
            <button className="lightbox-action-btn" onClick={e => e.stopPropagation()}>
              <Share2 size={20} />
              <span>Share</span>
            </button>
            <button className="lightbox-action-btn" onClick={e => e.stopPropagation()}>
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>
          <div className="lightbox-counter">
            {index + 1} of {photos.length}
          </div>
        </div>
      </div>
    </div>
  )
}

const PhotoOfTheDay = ({ photo }) => (
  <div className="photo-of-day">
    <div className="pod-header">
      <span className="pod-badge">✨ Photo of the Day</span>
    </div>
    <div className="pod-content">
      <img src={photo.url} alt={photo.title} />
      <div className="pod-info">
        <h3>{photo.title}</h3>
        <p>{photo.description}</p>
        <div className="pod-meta">
          <span>📷 {photo.photographer}</span>
          <span>{photo.category}</span>
          <span>{photo.day}</span>
        </div>
      </div>
    </div>
  </div>
)

export default Gallery