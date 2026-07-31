import { useState, useMemo, useCallback } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Download, Calendar,
  ChevronDown, ChevronUp, X, Check, AlertCircle, Info,
  Eye, Clock, MapPin, User, Tag, ArrowUpDown, Save
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageSchedule.css';

const ManageSchedule = () => {
  const { schedule, addEvent, updateEvent, deleteEvent } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewEvent, setViewEvent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    day: 'Day 1',
    startTime: '',
    endTime: '',
    location: '',
    room: '',
    presenter: '',
    category: 'General',
    dressCode: 'Casual',
    capacity: '',
    notes: '',
  });

  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const categories = ['General', 'Ceremony', 'Workshop', 'Meal', 'Entertainment', 'Meeting', 'Competition', 'Social'];
  const dressCodes = ['Casual', 'Business Casual', 'Formal', 'Themed', 'Uniform'];
  const locations = useMemo(() => [...new Set(schedule.map(e => e.location).filter(Boolean))].sort(), [schedule]);
  const rooms = useMemo(() => [...new Set(schedule.map(e => e.room).filter(Boolean))].sort(), [schedule]);

  const filteredEvents = useMemo(() => {
    return schedule
      .filter(e => {
        const matchesSearch = !searchQuery || 
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDay = filterDay === 'all' || e.day === filterDay;
        const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
        return matchesSearch && matchesDay && matchesCategory;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [schedule, searchQuery, filterDay, filterCategory, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
    };
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
    closeModal();
  };

  const openAddModal = () => {
    setEditingEvent(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      day: event.day || 'Day 1',
      startTime: event.startTime ? event.startTime.slice(0, 16) : '',
      endTime: event.endTime ? event.endTime.slice(0, 16) : '',
      location: event.location || '',
      room: event.room || '',
      presenter: event.presenter || '',
      category: event.category || 'General',
      dressCode: event.dressCode || 'Casual',
      capacity: event.capacity || '',
      notes: event.notes || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setTimeout(resetForm, 300);
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', day: 'Day 1', startTime: '', endTime: '',
      location: '', room: '', presenter: '', category: 'General',
      dressCode: 'Casual', capacity: '', notes: '',
    });
  };

  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteEvent = () => { if (confirmDelete) { deleteEvent(confirmDelete); setConfirmDelete(null); } };
  const handleSort = (field) => { if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } };

  const exportSchedule = () => {
    const csv = [
      ['Title', 'Description', 'Day', 'Start', 'End', 'Location', 'Room', 'Presenter', 'Category', 'Dress Code', 'Capacity'].join(','),
      ...filteredEvents.map(e => [e.title, e.description, e.day, e.startTime, e.endTime, e.location, e.room, e.presenter, e.category, e.dressCode, e.capacity || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Ceremony: 'gold', Workshop: 'primary', Meal: 'accent',
      Entertainment: 'secondary', Meeting: 'primary', Competition: 'gold',
      Social: 'secondary', General: 'muted'
    };
    return colors[cat] || 'muted';
  };

  return (
    <div className="manage-schedule">
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">Manage Schedule</h1>
          <p className="page-subtitle">{filteredEvents.length} of {schedule.length} events</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportSchedule}><Download size={18} /><span>Export CSV</span></button>
          <button className="btn btn-primary" onClick={openAddModal}><Plus size={18} /><span>Add Event</span></button>
        </div>
      </header>

      <section className="filters-section">
        <div className="search-box"><Search size={20} className="search-icon" /><input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input" /></div>
        <div className="filter-toggle"><button className={`btn btn-outline ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><Filter size={18} /><span>Filters</span><ChevronDown size={16} className={showFilters ? 'rotated' : ''}/></button></div>
        {showFilters && <div className="filters-panel"><div className="filter-row"><select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="filter-select"><option value="all">All Days</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select"><option value="all">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>}
      </section>

      <section className="table-section">
        <div className="table-wrapper">
          <table className="data-table" role="grid">
            <thead><tr>
              <th><button className="sortable-header" onClick={() => handleSort('title')}>Title <span className="sort-icon">{sortBy==='title'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
              <th><button className="sortable-header" onClick={() => handleSort('day')}>Day <span className="sort-icon">{sortBy==='day'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
              <th><button className="sortable-header" onClick={() => handleSort('startTime')}>Time <span className="sort-icon">{sortBy==='startTime'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
              <th><button className="sortable-header" onClick={() => handleSort('category')}>Category <span className="sort-icon">{sortBy==='category'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
              <th><button className="sortable-header" onClick={() => handleSort('location')}>Location <span className="sort-icon">{sortBy==='location'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
              <th><button className="sortable-header" onClick={() => handleSort('presenter')}>Presenter <span className="sort-icon">{sortBy==='presenter'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
              <th>Actions</th>
            </tr></thead>
            <tbody>
              {paginatedEvents.length === 0 ? (
                <tr><td colSpan={7} className="empty-state"><Info size={32}/><p>No events found</p><button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/>Add First Event</button></td></tr>
              ) : (
                paginatedEvents.map(event => (
                  <tr key={event.id}>
                    <td className="title-cell"><div className="event-title">{event.title}</div>{event.description && <div className="event-desc">{event.description}</div>}</td>
                    <td><span className="day-badge">{event.day}</span></td>
                    <td className="time-cell">{event.startTime && new Date(event.startTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} - {event.endTime && new Date(event.endTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
                    <td><span className={`category-badge ${getCategoryColor(event.category)}`}>{event.category}</span></td>
                    <td>{event.location || '—'}{event.room && <span className="room-info">, {event.room}</span>}</td>
                    <td>{event.presenter || '—'}</td>
                    <td><div className="action-buttons"><button className="icon-btn view" onClick={() => {setViewEvent(event);}}><Eye size={16}/></button><button className="icon-btn edit" onClick={() => openEditModal(event)}><Edit size={16}/></button><button className="icon-btn delete" onClick={() => handleDelete(event.id)}><Trash2 size={16}/></button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <nav className="pagination" aria-label="Schedule pagination"><button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous"><ChevronLeft size={18}/></button><div className="page-info">Page {currentPage} of {totalPages} ({filteredEvents.length} total)</div><button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next"><ChevronRight size={18}/></button></nav>}
      </section>

      {/* Modals - similar structure to ManageAttendees */}
      {showModal && <div className="modal-overlay" onClick={closeModal}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2><button className="modal-close" onClick={closeModal} aria-label="Close"><X size={20}/></button></div><form onSubmit={handleSubmit} className="modal-form"><div className="form-grid"><div className="form-field"><label htmlFor="title">Title *</label><input type="text" id="title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required/></div><div className="form-field"><label htmlFor="day">Day *</label><select id="day" value={formData.day} onChange={e=>setFormData({...formData,day:e.target.value})} required>{days.map(d=><option key={d} value={d}>{d}</option>)}</select></div><div className="form-field"><label htmlFor="startTime">Start Time *</label><input type="datetime-local" id="startTime" value={formData.startTime} onChange={e=>setFormData({...formData,startTime:e.target.value})} required/></div><div className="form-field"><label htmlFor="endTime">End Time *</label><input type="datetime-local" id="endTime" value={formData.endTime} onChange={e=>setFormData({...formData,endTime:e.target.value})} required/></div><div className="form-field"><label htmlFor="location">Location</label><select id="location" value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})}><option value="">Select Location</option>{locations.map(l=><option key={l} value={l}>{l}</option>)}</select></div><div className="form-field"><label htmlFor="room">Room</label><select id="room" value={formData.room} onChange={e=>setFormData({...formData,room:e.target.value})}><option value="">Select Room</option>{rooms.map(r=><option key={r} value={r}>{r}</option>)}</select></div><div className="form-field"><label htmlFor="presenter">Presenter</label><input type="text" id="presenter" value={formData.presenter} onChange={e=>setFormData({...formData,presenter:e.target.value})}/></div><div className="form-field"><label htmlFor="category">Category *</label><select id="category" value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} required>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div className="form-field"><label htmlFor="dressCode">Dress Code</label><select id="dressCode" value={formData.dressCode} onChange={e=>setFormData({...formData,dressCode:e.target.value})}>{dressCodes.map(d=><option key={d} value={d}>{d}</option>)}</select></div><div className="form-field"><label htmlFor="capacity">Capacity</label><input type="number" id="capacity" value={formData.capacity} onChange={e=>setFormData({...formData,capacity:e.target.value})} min="0"/></div><div className="form-field full-width"><label htmlFor="description">Description</label><textarea id="description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3}/></div><div className="form-field full-width"><label htmlFor="notes">Notes</label><textarea id="notes" value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})} rows={2}/></div></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingEvent ? 'Save Changes' : 'Add Event'}</button></div></form></div></div>}

      {viewEvent && <div className="modal-overlay" onClick={()=>setViewEvent(null)}><div className="modal modal-lg" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Event Details</h2><button className="modal-close" onClick={()=>setViewEvent(null)}><X size={20}/></button></div><div className="modal-body"><div className="view-grid"><div className="view-section"><h4>Basic Info</h4><dl><dt>Title</dt><dd>{viewEvent.title}</dd><dt>Description</dt><dd>{viewEvent.description || '—'}</dd><dt>Category</dt><dd><span className={`category-badge ${getCategoryColor(viewEvent.category)}`}>{viewEvent.category}</span></dd><dt>Dress Code</dt><dd>{viewEvent.dressCode}</dd></dl></div><div className="view-section"><h4>Time & Location</h4><dl><dt>Day</dt><dd>{viewEvent.day}</dd><dt>Start</dt><dd>{viewEvent.startTime ? new Date(viewEvent.startTime).toLocaleString() : '—'}</dd><dt>End</dt><dd>{viewEvent.endTime ? new Date(viewEvent.endTime).toLocaleString() : '—'}</dd><dt>Location</dt><dd>{viewEvent.location || '—'}</dd><dt>Room</dt><dd>{viewEvent.room || '—'}</dd><dt>Presenter</dt><dd>{viewEvent.presenter || '—'}</dd></dl></div>{viewEvent.capacity && <div className="view-section"><h4>Capacity</h4><p>{viewEvent.capacity}</p></div>}{viewEvent.notes && <div className="view-section full-width"><h4>Notes</h4><p>{viewEvent.notes}</p></div>}</div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setViewEvent(null)}>Close</button><button className="btn btn-primary" onClick={()=>{setViewEvent(null);openEditModal(viewEvent);}}><Edit size={16}/> Edit</button></div></div></div>}

      {confirmDelete && <div className="modal-overlay" onClick={()=>setConfirmDelete(null)}><div className="modal modal-sm" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div><div className="modal-body"><div className="delete-warning"><AlertCircle size={48} className="warning-icon"/><p>Delete this event?</p><p className="attendee-name">{schedule.find(e=>e.id===confirmDelete)?.title}</p><p className="delete-note">Cannot be undone.</p></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={confirmDeleteEvent}><Trash2 size={16}/> Delete</button></div></div></div>}
    </div>
  );
};

export default ManageSchedule;