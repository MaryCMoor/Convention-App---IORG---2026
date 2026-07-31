import { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Download, Award,
  ChevronDown, ChevronUp, X, AlertCircle, Eye, Calendar,
  Tag, Star, Trophy, Crown, Medal, Sparkles, Image, Upload
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageAwards.css';

const ManageAwards = () => {
  const { awards, addAward, updateAward, deleteAward } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [viewAward, setViewAward] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Competition',
    status: 'pending',
    winner: '',
    winnerChapter: '',
    criteria: '',
    imageUrl: '',
    displayOrder: 0,
  });

  const categories = ['Competition', 'Superlative', 'Recognition', 'Achievement', 'Special', 'Scholarship'];
  const statuses = ['pending', 'voting', 'announced', 'awarded'];

  const filteredAwards = useMemo(() => {
    return awards
      .filter(a => {
        const matchesSearch = !searchQuery || 
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.winner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
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
  }, [awards, searchQuery, filterCategory, filterStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAwards.length / itemsPerPage);
  const paginatedAwards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAwards.slice(start, start + itemsPerPage);
  }, [filteredAwards, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, displayOrder: parseInt(formData.displayOrder) || 0 };
    if (editingAward) updateAward(editingAward.id, data);
    else addAward(data);
    closeModal();
  };

  const openAddModal = () => { setEditingAward(null); resetForm(); setShowModal(true); };
  const openEditModal = (a) => { setEditingAward(a); setFormData({...a, displayOrder: a.displayOrder || 0}); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingAward(null); setTimeout(resetForm, 300); };
  const resetForm = () => setFormData({name:'',description:'',category:'Competition',status:'pending',winner:'',winnerChapter:'',criteria:'',imageUrl:'',displayOrder:0});
  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteAward = () => { if (confirmDelete) { deleteAward(confirmDelete); setConfirmDelete(null); } };
  const handleSort = (field) => { if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } };

  const exportAwards = () => {
    const csv = [['Name','Description','Category','Status','Winner','Winner Chapter','Criteria','Display Order'].join(','),...filteredAwards.map(a=>[a.name,a.description,a.category,a.status,a.winner,a.winnerChapter,a.criteria,a.displayOrder].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`awards-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (cat) => {
    const icons = { Competition: Trophy, Superlative: Star, Recognition: Crown, Achievement: Medal, Special: Sparkles, Scholarship: Award };
    return icons[cat] || Award;
  };

  const getStatusClass = (s) => ({pending:'status-pending',voting:'status-voting',announced:'status-announced',awarded:'status-awarded'}[s]||'status-pending');

  return (
    <div className="manage-awards">
      <header className="page-header">
        <div className="header-left"><h1 className="page-title">Awards</h1><p className="page-subtitle">{filteredAwards.length} of {awards.length} awards</p></div>
        <div className="header-actions"><button className="btn btn-secondary" onClick={exportAwards}><Download size={18}/><span>Export CSV</span></button><button className="btn btn-primary" onClick={openAddModal}><Plus size={18}/><span>Add Award</span></button></div>
      </header>

      <section className="filters-section">
        <div className="search-box"><Search size={20} className="search-icon"/><input type="text" placeholder="Search awards..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="search-input"/></div>
        <div className="filter-toggle"><button className={`btn btn-outline ${showFilters?'active':''}`} onClick={()=>setShowFilters(!showFilters)}><Filter size={18}/><span>Filters</span><ChevronDown size={16} className={showFilters?'rotated':''}/></button></div>
        {showFilters && <div className="filters-panel"><div className="filter-row"><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="filter-select"><option value="all">All Categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="filter-select"><option value="all">All Statuses</option>{statuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></div></div>}
      </section>

      <section className="table-section">
        <div className="table-wrapper"><table className="data-table" role="grid"><thead><tr>
          <th><button className="sortable-header" onClick={()=>handleSort('name')}>Award <span className="sort-icon">{sortBy==='name'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('category')}>Category <span className="sort-icon">{sortBy==='category'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('status')}>Status <span className="sort-icon">{sortBy==='status'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('winner')}>Winner <span className="sort-icon">{sortBy==='winner'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('displayOrder')}>Order <span className="sort-icon">{sortBy==='displayOrder'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th>Actions</th>
        </tr></thead><tbody>
          {paginatedAwards.length===0?(
            <tr><td colSpan={6} className="empty-state"><Award size={32}/><p>No awards found</p><button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/>Add First Award</button></td></tr>
          ):(
            paginatedAwards.map(a=><tr key={a.id}>
              <td className="name-cell"><div className="award-name"><Icon size={16} className="category-icon"/>{a.name}</div>{a.description&&<div className="award-desc">{a.description}</div>}</td>
              <td><span className="category-badge">{a.category}</span></td>
              <td><span className={`status-badge ${getStatusClass(a.status)}`}>{a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
              <td>{a.winner||'—'}{a.winnerChapter&&<span className="winner-chapter">, {a.winnerChapter}</span>}</td>
              <td>{a.displayOrder}</td>
              <td><div className="action-buttons"><button className="icon-btn view" onClick={()=>{setViewAward(a);}}><Eye size={16}/></button><button className="icon-btn edit" onClick={()=>openEditModal(a)}><Edit size={16}/></button><button className="icon-btn delete" onClick={()=>handleDelete(a.id)}><Trash2 size={16}/></button></div></td>
            </tr>)
          )}
        </tbody></table></div>
        {totalPages>1&&<nav className="pagination" aria-label="Pagination"><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} aria-label="Previous"><ChevronLeft size={18}/></button><div className="page-info">Page {currentPage} of {totalPages} ({filteredAwards.length} total)</div><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} aria-label="Next"><ChevronRight size={18}/></button></nav>}
      </section>

      {showModal&&<div className="modal-overlay" onClick={closeModal}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">{editingAward?'Edit':'Add'} Award</h2><button className="modal-close" onClick={closeModal}><X size={20}/></button></div><form onSubmit={handleSubmit} className="modal-form"><div className="form-grid"><div className="form-field"><label htmlFor="name">Name *</label><input type="text" id="name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required/></div><div className="form-field"><label htmlFor="category">Category *</label><select id="category" value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} required>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div className="form-field"><label htmlFor="status">Status *</label><select id="status" value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} required>{statuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></div><div className="form-field"><label htmlFor="displayOrder">Display Order</label><input type="number" id="displayOrder" value={formData.displayOrder} onChange={e=>setFormData({...formData,displayOrder:parseInt(e.target.value)||0})} min="0"/></div><div className="form-field"><label htmlFor="winner">Winner</label><input type="text" id="winner" value={formData.winner} onChange={e=>setFormData({...formData,winner:e.target.value})}/></div><div className="form-field"><label htmlFor="winnerChapter">Winner Chapter</label><input type="text" id="winnerChapter" value={formData.winnerChapter} onChange={e=>setFormData({...formData,winnerChapter:e.target.value})}/></div><div className="form-field full-width"><label htmlFor="criteria">Criteria</label><textarea id="criteria" value={formData.criteria} onChange={e=>setFormData({...formData,criteria:e.target.value})} rows={3} placeholder="Judging criteria..."/></div><div className="form-field full-width"><label htmlFor="imageUrl">Image URL (for certificate/badge)</label><input type="url" id="imageUrl" value={formData.imageUrl} onChange={e=>setFormData({...formData,imageUrl:e.target.value})} placeholder="https://..."/></div><div className="form-field full-width"><label htmlFor="description">Description</label><textarea id="description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3}/></div></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingAward?'Save Changes':'Add Award'}</button></div></form></div></div>}

      {viewAward&&<div className="modal-overlay" onClick={()=>setViewAward(null)}><div className="modal modal-lg" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Award Details</h2><button className="modal-close" onClick={()=>setViewAward(null)}><X size={20}/></button></div><div className="modal-body"><div className="view-grid"><div className="view-section"><h4>Award Info</h4><dl><dt>Name</dt><dd>{viewAward.name}</dd><dt>Description</dt><dd>{viewAward.description||'—'}</dd><dt>Category</dt><dd><span className="category-badge">{viewAward.category}</span></dd></dl></div><div className="view-section"><h4>Status & Winner</h4><dl><dt>Status</dt><dd><span className={`status-badge ${getStatusClass(viewAward.status)}`}>{viewAward.status}</span></dd><dt>Winner</dt><dd>{viewAward.winner||'Not selected'}</dd><dt>Winner Chapter</dt><dd>{viewAward.winnerChapter||'—'}</dd><dt>Display Order</dt><dd>{viewAward.displayOrder}</dd></dl></div>{viewAward.criteria&&<div className="view-section full-width"><h4>Criteria</h4><p>{viewAward.criteria}</p></div>}{viewAward.imageUrl&&<div className="view-section full-width"><h4>Image</h4><img src={viewAward.imageUrl} alt={viewAward.name} style={{maxWidth:'100%',borderRadius:'var(--radius-md)'}}/></div>}</div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setViewAward(null)}>Close</button><button className="btn btn-primary" onClick={()=>{setViewAward(null);openEditModal(viewAward);}}><Edit size={16}/> Edit</button></div></div></div>}

      {confirmDelete&&<div className="modal-overlay" onClick={()=>setConfirmDelete(null)}><div className="modal modal-sm" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div><div className="modal-body"><div className="delete-warning"><AlertCircle size={48} className="warning-icon"/><p>Delete this award?</p><p className="attendee-name">{awards.find(a=>a.id===confirmDelete)?.name}</p><p className="delete-note">Cannot be undone.</p></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={confirmDeleteAward}><Trash2 size={16}/> Delete</button></div></div></div>}
    </div>
  );
};

export default ManageAwards;