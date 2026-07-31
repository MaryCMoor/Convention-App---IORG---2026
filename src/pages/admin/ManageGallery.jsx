import { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Download, Images,
  ChevronDown, ChevronUp, X, AlertCircle, Eye, Calendar,
  Tag, Star, Upload, Image as ImageIcon
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageGallery.css';

const ManageGallery = () => {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    imageUrl: '',
    thumbnailUrl: '',
    featured: false,
    tags: '',
    displayOrder: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const categories = ['General', 'Opening Ceremony', 'Competitions', 'Meals', 'Social Events', 'Awards', 'Behind the Scenes', 'Venue', 'Group Photos', 'Candid'];

  const filteredGallery = useMemo(() => {
    return gallery
      .filter(g => {
        const matchesSearch = !searchQuery || 
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || g.category === filterCategory;
        const matchesFeatured = filterFeatured === 'all' || (filterFeatured === 'featured' ? g.featured : !g.featured);
        return matchesSearch && matchesCategory && matchesFeatured;
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
  }, [gallery, searchQuery, filterCategory, filterFeatured, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredGallery.length / itemsPerPage);
  const paginatedGallery = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGallery.slice(start, start + itemsPerPage);
  }, [filteredGallery, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, displayOrder: parseInt(formData.displayOrder) || 0, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean), date: new Date(formData.date).toISOString() };
    if (editingItem) updateGalleryItem(editingItem.id, data);
    else addGalleryItem(data);
    closeModal();
  };

  const openAddModal = () => { setEditingItem(null); resetForm(); setShowModal(true); };
  const openEditModal = (g) => { setEditingItem(g); setFormData({...g, displayOrder: g.displayOrder || 0, tags: (g.tags || []).join(', '), date: g.date?.split('T')[0] || new Date().toISOString().split('T')[0]}); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingItem(null); setTimeout(resetForm, 300); };
  const resetForm = () => setFormData({title:'',description:'',category:'General',imageUrl:'',thumbnailUrl:'',featured:false,tags:'',displayOrder:0,date:new Date().toISOString().split('T')[0]});
  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteGallery = () => { if (confirmDelete) { deleteGalleryItem(confirmDelete); setConfirmDelete(null); } };
  const handleSort = (field) => { if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } };

  const exportGallery = () => {
    const csv = [['Title','Description','Category','Featured','Tags','Date','Display Order'].join(','),...filteredGallery.map(g=>[g.title,g.description,g.category,g.featured?'Yes':'No',(g.tags||[]).join(';'),g.date,g.displayOrder].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`gallery-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="manage-gallery">
      <header className="page-header">
        <div className="header-left"><h1 className="page-title">Gallery</h1><p className="page-subtitle">{filteredGallery.length} of {gallery.length} images</p></div>
        <div className="header-actions"><button className="btn btn-secondary" onClick={exportGallery}><Download size={18}/><span>Export CSV</span></button><button className="btn btn-primary" onClick={openAddModal}><Plus size={18}/><span>Add Image</span></button></div>
      </header>

      <section className="filters-section">
        <div className="search-box"><Search size={20} className="search-icon"/><input type="text" placeholder="Search gallery..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="search-input"/></div>
        <div className="filter-toggle"><button className={`btn btn-outline ${showFilters?'active':''}`} onClick={()=>setShowFilters(!showFilters)}><Filter size={18}/><span>Filters</span><ChevronDown size={16} className={showFilters?'rotated':''}/></button></div>
        {showFilters && <div className="filters-panel"><div className="filter-row"><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="filter-select"><option value="all">All Categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><select value={filterFeatured} onChange={e=>setFilterFeatured(e.target.value)} className="filter-select"><option value="all">All</option><option value="featured">Featured Only</option><option value="not-featured">Not Featured</option></select></div></div>}
      </section>

      <section className="table-section">
        <div className="table-wrapper"><table className="data-table" role="grid"><thead><tr>
          <th><button className="sortable-header" onClick={()=>handleSort('title')}>Image <span className="sort-icon">{sortBy==='title'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('category')}>Category <span className="sort-icon">{sortBy==='category'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('featured')}>Featured <span className="sort-icon">{sortBy==='featured'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('date')}>Date <span className="sort-icon">{sortBy==='date'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('displayOrder')}>Order <span className="sort-icon">{sortBy==='displayOrder'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th>Actions</th>
        </tr></thead><tbody>
          {paginatedGallery.length===0?(
            <tr><td colSpan={6} className="empty-state"><Images size={32}/><p>No images found</p><button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/>Add First Image</button></td></tr>
          ):(
            paginatedGallery.map(g=><tr key={g.id}>
              <td className="image-cell"><div className="image-preview" style={{backgroundImage:`url(${g.thumbnailUrl||g.imageUrl})`}}/><div className="image-info"><div className="image-title">{g.title}</div>{g.description&&<div className="image-desc">{g.description}</div>}</div></td>
              <td><span className="category-badge">{g.category}</span></td>
              <td><span className={`featured-badge ${g.featured?'yes':'no'}`}>{g.featured?'★ Featured':'Not Featured'}</span></td>
              <td>{g.date?new Date(g.date).toLocaleDateString():'—'}</td>
              <td>{g.displayOrder}</td>
              <td><div className="action-buttons"><button className="icon-btn view" onClick={()=>{setViewItem(g);}}><Eye size={16}/></button><button className="icon-btn edit" onClick={()=>openEditModal(g)}><Edit size={16}/></button><button className="icon-btn delete" onClick={()=>handleDelete(g.id)}><Trash2 size={16}/></button></div></td>
            </tr>)
          )}
        </tbody></table></div>
        {totalPages>1&&<nav className="pagination" aria-label="Pagination"><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} aria-label="Previous"><ChevronLeft size={18}/></button><div className="page-info">Page {currentPage} of {totalPages} ({filteredGallery.length} total)</div><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} aria-label="Next"><ChevronRight size={18}/></button></nav>}
      </section>

      {showModal&&<div className="modal-overlay" onClick={closeModal}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">{editingItem?'Edit':'Add'} Gallery Image</h2><button className="modal-close" onClick={closeModal}><X size={20}/></button></div><form onSubmit={handleSubmit} className="modal-form"><div className="form-grid"><div className="form-field"><label htmlFor="title">Title *</label><input type="text" id="title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required/></div><div className="form-field"><label htmlFor="category">Category *</label><select id="category" value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} required>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div className="form-field"><label htmlFor="featured"><input type="checkbox" id="featured" checked={formData.featured} onChange={e=>setFormData({...formData,featured:e.target.checked})}/> Featured</label></div><div className="form-field"><label htmlFor="displayOrder">Display Order</label><input type="number" id="displayOrder" value={formData.displayOrder} onChange={e=>setFormData({...formData,displayOrder:parseInt(e.target.value)||0})} min="0"/></div><div className="form-field"><label htmlFor="date">Date *</label><input type="date" id="date" value={formData.date} onChange={e=>setFormData({...formData,date:e.target.value})} required/></div><div className="form-field full-width"><label htmlFor="imageUrl">Image URL *</label><input type="url" id="imageUrl" value={formData.imageUrl} onChange={e=>setFormData({...formData,imageUrl:e.target.value})} placeholder="https://..." required/></div><div className="form-field full-width"><label htmlFor="thumbnailUrl">Thumbnail URL (optional)</label><input type="url" id="thumbnailUrl" value={formData.thumbnailUrl} onChange={e=>setFormData({...formData,thumbnailUrl:e.target.value})} placeholder="https://... (auto-generated if empty)"/></div><div className="form-field full-width"><label htmlFor="tags">Tags (comma-separated)</label><input type="text" id="tags" value={formData.tags} onChange={e=>setFormData({...formData,tags:e.target.value})} placeholder="opening, ceremony, lion"/></div><div className="form-field full-width"><label htmlFor="description">Description</label><textarea id="description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3}/></div></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingItem?'Save Changes':'Add Image'}</button></div></form></div></div>}

      {viewItem&&<div className="modal-overlay" onClick={()=>setViewItem(null)}><div className="modal modal-lg" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Image Details</h2><button className="modal-close" onClick={()=>setViewItem(null)}><X size={20}/></button></div><div className="modal-body"><div className="view-grid"><div className="view-section full-width"><h4>Preview</h4><img src={viewItem.imageUrl} alt={viewItem.title} style={{maxWidth:'100%',borderRadius:'var(--radius-md)'}}/></div><div className="view-section"><h4>Info</h4><dl><dt>Title</dt><dd>{viewItem.title}</dd><dt>Description</dt><dd>{viewItem.description||'—'}</dd><dt>Category</dt><dd><span className="category-badge">{viewItem.category}</span></dd><dt>Featured</dt><dd>{viewItem.featured?'Yes':'No'}</dd><dt>Date</dt><dd>{viewItem.date?new Date(viewItem.date).toLocaleDateString():'—'}</dd><dt>Display Order</dt><dd>{viewItem.displayOrder}</dd><dt>Tags</dt><dd>{(viewItem.tags||[]).join(', ')||'—'}</dd></dl></div></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setViewItem(null)}>Close</button><button className="btn btn-primary" onClick={()=>{setViewItem(null);openEditModal(viewItem);}}><Edit size={16}/> Edit</button></div></div></div>}

      {confirmDelete&&<div className="modal-overlay" onClick={()=>setConfirmDelete(null)}><div className="modal modal-sm" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div><div className="modal-body"><div className="delete-warning"><AlertCircle size={48} className="warning-icon"/><p>Delete this image?</p><p className="attendee-name">{gallery.find(g=>g.id===confirmDelete)?.title}</p><p className="delete-note">Cannot be undone.</p></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={confirmDeleteGallery}><Trash2 size={16}/> Delete</button></div></div></div>}
    </div>
  );
};

export default ManageGallery;