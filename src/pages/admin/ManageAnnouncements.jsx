import { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Download, Megaphone,
  ChevronDown, ChevronUp, X, AlertCircle, Pin, PinOff,
  Eye, Calendar, Tag, Hash, Flag
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageAnnouncements.css';

const ManageAnnouncements = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'normal',
    status: 'active',
    pinned: false,
    date: new Date().toISOString().split('T')[0],
  });

  const categories = ['General', 'Schedule Change', 'Emergency', 'Reminder', 'Welcome', 'Thank You', 'Award', 'Meal', 'Housing', 'Transportation'];
  const priorities = ['low', 'normal', 'high', 'urgent'];
  const statuses = ['active', 'draft', 'archived'];

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter(a => {
        const matchesSearch = !searchQuery || 
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
        const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
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
  }, [announcements, searchQuery, filterCategory, filterPriority, filterStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAnnouncements.slice(start, start + itemsPerPage);
  }, [filteredAnnouncements, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, date: new Date(formData.date).toISOString() };
    if (editingAnnouncement) updateAnnouncement(editingAnnouncement.id, data);
    else addAnnouncement(data);
    closeModal();
  };

  const openAddModal = () => { setEditingAnnouncement(null); resetForm(); setShowModal(true); };
  const openEditModal = (a) => { setEditingAnnouncement(a); setFormData({...a, date: a.date?.split('T')[0] || new Date().toISOString().split('T')[0]}); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingAnnouncement(null); setTimeout(resetForm, 300); };
  const resetForm = () => setFormData({title:'',description:'',category:'General',priority:'normal',status:'active',pinned:false,date:new Date().toISOString().split('T')[0]});
  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteAnn = () => { if (confirmDelete) { deleteAnnouncement(confirmDelete); setConfirmDelete(null); } };
  const handleSort = (field) => { if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } };

  const exportAnn = () => {
    const csv = [['Title','Description','Category','Priority','Status','Pinned','Date'].join(','),...filteredAnnouncements.map(a=>[a.title,a.description,a.category,a.priority,a.status,a.pinned? 'Yes':'No',a.date].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`announcements-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const getPriorityClass = (p) => ({low:'priority-low',normal:'priority-normal',high:'priority-high',urgent:'priority-urgent'}[p]||'priority-normal');
  const getStatusClass = (s) => ({active:'status-active',draft:'status-draft',archived:'status-archived'}[s]||'status-active');

  return (
    <div className="manage-announcements">
      <header className="page-header">
        <div className="header-left"><h1 className="page-title">Announcements</h1><p className="page-subtitle">{filteredAnnouncements.length} of {announcements.length} announcements</p></div>
        <div className="header-actions"><button className="btn btn-secondary" onClick={exportAnn}><Download size={18}/><span>Export CSV</span></button><button className="btn btn-primary" onClick={openAddModal}><Plus size={18}/><span>Create Announcement</span></button></div>
      </header>

      <section className="filters-section">
        <div className="search-box"><Search size={20} className="search-icon"/><input type="text" placeholder="Search announcements..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="search-input"/></div>
        <div className="filter-toggle"><button className={`btn btn-outline ${showFilters?'active':''}`} onClick={()=>setShowFilters(!showFilters)}><Filter size={18}/><span>Filters</span><ChevronDown size={16} className={showFilters?'rotated':''}/></button></div>
        {showFilters && <div className="filters-panel"><div className="filter-row"><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="filter-select"><option value="all">All Categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} className="filter-select"><option value="all">All Priorities</option>{priorities.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select><select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="filter-select"><option value="all">All Statuses</option>{statuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></div></div>}
      </section>

      <section className="table-section">
        <div className="table-wrapper"><table className="data-table" role="grid"><thead><tr>
          <th><button className="sortable-header" onClick={()=>handleSort('title')}>Title <span className="sort-icon">{sortBy==='title'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('category')}>Category <span className="sort-icon">{sortBy==='category'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('priority')}>Priority <span className="sort-icon">{sortBy==='priority'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('status')}>Status <span className="sort-icon">{sortBy==='status'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('pinned')}>Pinned <span className="sort-icon">{sortBy==='pinned'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('date')}>Date <span className="sort-icon">{sortBy==='date'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th>Actions</th>
        </tr></thead><tbody>
          {paginatedAnnouncements.length===0?(
            <tr><td colSpan={7} className="empty-state"><Info size={32}/><p>No announcements found</p><button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/>Create First</button></td></tr>
          ):(
            paginatedAnnouncements.map(a=><tr key={a.id}>
              <td className="title-cell"><div className="ann-title">{a.title}</div>{a.description&&<div className="ann-desc">{a.description}</div>}{a.pinned&&<span className="pinned-badge"><Pin size={12}/> Pinned to Home</span>}</td>
              <td><span className="category-tag">{a.category}</span></td>
              <td><span className={`priority-badge ${getPriorityClass(a.priority)}`}>{a.priority.charAt(0).toUpperCase()+a.priority.slice(1)}</span></td>
              <td><span className={`status-badge ${getStatusClass(a.status)}`}>{a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
              <td><span className={`pin-status ${a.pinned?'pinned':''}`}>{a.pinned?<Pin size={16}/>:<PinOff size={16}/>}</span></td>
              <td>{a.date?new Date(a.date).toLocaleDateString():'—'}</td>
              <td><div className="action-buttons"><button className="icon-btn view" onClick={()=>{setViewAnnouncement(a);}}><Eye size={16}/></button><button className="icon-btn edit" onClick={()=>openEditModal(a)}><Edit size={16}/></button><button className="icon-btn delete" onClick={()=>handleDelete(a.id)}><Trash2 size={16}/></button></div></td>
            </tr>)
          )}
        </tbody></table></div>
        {totalPages>1&&<nav className="pagination" aria-label="Pagination"><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} aria-label="Previous"><ChevronLeft size={18}/></button><div className="page-info">Page {currentPage} of {totalPages} ({filteredAnnouncements.length} total)</div><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} aria-label="Next"><ChevronRight size={18}/></button></nav>}
      </section>

      {showModal&&<div className="modal-overlay" onClick={closeModal}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">{editingAnnouncement?'Edit':'Create'} Announcement</h2><button className="modal-close" onClick={closeModal}><X size={20}/></button></div><form onSubmit={handleSubmit} className="modal-form"><div className="form-grid"><div className="form-field"><label htmlFor="title">Title *</label><input type="text" id="title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required/></div><div className="form-field"><label htmlFor="category">Category *</label><select id="category" value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} required>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div className="form-field"><label htmlFor="priority">Priority *</label><select id="priority" value={formData.priority} onChange={e=>setFormData({...formData,priority:e.target.value})} required>{priorities.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select></div><div className="form-field"><label htmlFor="status">Status *</label><select id="status" value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} required>{statuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></div><div className="form-field"><label htmlFor="date">Date *</label><input type="date" id="date" value={formData.date} onChange={e=>setFormData({...formData,date:e.target.value})} required/></div><div className="form-field"><label><input type="checkbox" checked={formData.pinned} onChange={e=>setFormData({...formData,pinned:e.target.checked})}/> Pin to Home Page</label></div><div className="form-field full-width"><label htmlFor="description">Description *</label><textarea id="description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={4} required/></div></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingAnnouncement?'Save Changes':'Create Announcement'}</button></div></form></div></div>}

      {viewAnnouncement&&<div className="modal-overlay" onClick={()=>setViewAnnouncement(null)}><div className="modal modal-lg" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Announcement Details</h2><button className="modal-close" onClick={()=>setViewAnnouncement(null)}><X size={20}/></button></div><div className="modal-body"><div className="view-grid"><div className="view-section"><h4>Content</h4><dl><dt>Title</dt><dd>{viewAnnouncement.title}</dd><dt>Description</dt><dd>{viewAnnouncement.description}</dd></dl></div><div className="view-section"><h4>Metadata</h4><dl><dt>Category</dt><dd><span className="category-tag">{viewAnnouncement.category}</span></dd><dt>Priority</dt><dd><span className={`priority-badge ${getPriorityClass(viewAnnouncement.priority)}`}>{viewAnnouncement.priority}</span></dd><dt>Status</dt><dd><span className={`status-badge ${getStatusClass(viewAnnouncement.status)}`}>{viewAnnouncement.status}</span></dd><dt>Pinned to Home</dt><dd>{viewAnnouncement.pinned?'Yes':'No'}</dd><dt>Date</dt><dd>{viewAnnouncement.date?new Date(viewAnnouncement.date).toLocaleDateString():'—'}</dd><dt>Created</dt><dd>{viewAnnouncement.createdAt?new Date(viewAnnouncement.createdAt).toLocaleString():'—'}</dd></dl></div></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setViewAnnouncement(null)}>Close</button><button className="btn btn-primary" onClick={()=>{setViewAnnouncement(null);openEditModal(viewAnnouncement);}}><Edit size={16}/> Edit</button></div></div></div>}

      {confirmDelete&&<div className="modal-overlay" onClick={()=>setConfirmDelete(null)}><div className="modal modal-sm" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div><div className="modal-body"><div className="delete-warning"><AlertCircle size={48} className="warning-icon"/><p>Delete this announcement?</p><p className="attendee-name">{announcements.find(a=>a.id===confirmDelete)?.title}</p><p className="delete-note">Cannot be undone.</p></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={confirmDeleteAnn}><Trash2 size={16}/> Delete</button></div></div></div>}
    </div>
  );
};

export default ManageAnnouncements;