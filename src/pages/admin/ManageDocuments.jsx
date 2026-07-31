import { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Download, FileText,
  ChevronDown, ChevronUp, X, AlertCircle, Eye, Calendar,
  Tag, FileType, FileSpreadsheet, FileImage, FileVideo,
  FileAudio, Upload, Paperclip
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageDocuments.css';

const ManageDocuments = () => {
  const { documents, addDocument, updateDocument, deleteDocument } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    type: 'PDF',
    url: '',
    accessLevel: 'public',
    tags: '',
    displayOrder: 0,
  });

  const categories = ['General', 'Convention Packet', 'Schedule', 'Maps', 'Forms', 'Policies', 'Minutes', 'Reports', 'Guides', 'Templates'];
  const types = ['PDF', 'DOC', 'XLSX', 'PPTX', 'JPG', 'PNG', 'MP4', 'MP3', 'ZIP', 'Other'];
  const accessLevels = ['public', 'officers', 'advisors', 'admin'];

  const filteredDocs = useMemo(() => {
    return documents
      .filter(d => {
        const matchesSearch = !searchQuery || 
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || d.category === filterCategory;
        const matchesType = filterType === 'all' || d.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
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
  }, [documents, searchQuery, filterCategory, filterType, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocs.slice(start, start + itemsPerPage);
  }, [filteredDocs, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, displayOrder: parseInt(formData.displayOrder) || 0, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (editingDoc) updateDocument(editingDoc.id, data);
    else addDocument(data);
    closeModal();
  };

  const openAddModal = () => { setEditingDoc(null); resetForm(); setShowModal(true); };
  const openEditModal = (d) => { setEditingDoc(d); setFormData({...d, displayOrder: d.displayOrder || 0, tags: (d.tags || []).join(', ')}); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingDoc(null); setTimeout(resetForm, 300); };
  const resetForm = () => setFormData({title:'',description:'',category:'General',type:'PDF',url:'',accessLevel:'public',tags:'',displayOrder:0});
  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteDoc = () => { if (confirmDelete) { deleteDocument(confirmDelete); setConfirmDelete(null); } };
  const handleSort = (field) => { if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } };

  const exportDocs = () => {
    const csv = [['Title','Description','Category','Type','Access Level','Tags','Display Order'].join(','),...filteredDocs.map(d=>[d.title,d.description,d.category,d.type,d.accessLevel,(d.tags||[]).join(';'),d.displayOrder].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`documents-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type) => {
    const icons = { PDF: FileType, DOC: FileText, XLSX: FileSpreadsheet, PPTX: FileText, JPG: FileImage, PNG: FileImage, MP4: FileVideo, MP3: FileAudio, ZIP: FileText, Other: FileText };
    return icons[type] || FileText;
  };

  const getAccessClass = (level) => ({public:'access-public',officers:'access-officers',advisors:'access-advisors',admin:'access-admin'}[level]||'access-public');

  return (
    <div className="manage-documents">
      <header className="page-header">
        <div className="header-left"><h1 className="page-title">Documents</h1><p className="page-subtitle">{filteredDocs.length} of {documents.length} documents</p></div>
        <div className="header-actions"><button className="btn btn-secondary" onClick={exportDocs}><Download size={18}/><span>Export CSV</span></button><button className="btn btn-primary" onClick={openAddModal}><Plus size={18}/><span>Add Document</span></button></div>
      </header>

      <section className="filters-section">
        <div className="search-box"><Search size={20} className="search-icon"/><input type="text" placeholder="Search documents..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="search-input"/></div>
        <div className="filter-toggle"><button className={`btn btn-outline ${showFilters?'active':''}`} onClick={()=>setShowFilters(!showFilters)}><Filter size={18}/><span>Filters</span><ChevronDown size={16} className={showFilters?'rotated':''}/></button></div>
        {showFilters && <div className="filters-panel"><div className="filter-row"><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="filter-select"><option value="all">All Categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><select value={filterType} onChange={e=>setFilterType(e.target.value)} className="filter-select"><option value="all">All Types</option>{types.map(t=><option key={t} value={t}>{t}</option>)}</select></div></div>}
      </section>

      <section className="table-section">
        <div className="table-wrapper"><table className="data-table" role="grid"><thead><tr>
          <th><button className="sortable-header" onClick={()=>handleSort('title')}>Document <span className="sort-icon">{sortBy==='title'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('category')}>Category <span className="sort-icon">{sortBy==='category'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('type')}>Type <span className="sort-icon">{sortBy==='type'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('accessLevel')}>Access <span className="sort-icon">{sortBy==='accessLevel'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('displayOrder')}>Order <span className="sort-icon">{sortBy==='displayOrder'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th>Actions</th>
        </tr></thead><tbody>
          {paginatedDocs.length===0?(
            <tr><td colSpan={6} className="empty-state"><FileText size={32}/><p>No documents found</p><button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/>Add First Document</button></td></tr>
          ):(
            paginatedDocs.map(d=><tr key={d.id}>
              <td className="name-cell"><div className="doc-name"><Icon size={16} className="type-icon"/>{d.title}</div>{d.description&&<div className="doc-desc">{d.description}</div>}</td>
              <td><span className="category-badge">{d.category}</span></td>
              <td><span className="type-badge">{d.type}</span></td>
              <td><span className={`access-badge ${getAccessClass(d.accessLevel)}`}>{d.accessLevel.charAt(0).toUpperCase()+d.accessLevel.slice(1)}</span></td>
              <td>{d.displayOrder}</td>
              <td><div className="action-buttons"><button className="icon-btn view" onClick={()=>{setViewDoc(d);}}><Eye size={16}/></button><button className="icon-btn edit" onClick={()=>openEditModal(d)}><Edit size={16}/></button><button className="icon-btn delete" onClick={()=>handleDelete(d.id)}><Trash2 size={16}/></button></div></td>
            </tr>)
          )}
        </tbody></table></div>
        {totalPages>1&&<nav className="pagination" aria-label="Pagination"><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} aria-label="Previous"><ChevronLeft size={18}/></button><div className="page-info">Page {currentPage} of {totalPages} ({filteredDocs.length} total)</div><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} aria-label="Next"><ChevronRight size={18}/></button></nav>}
      </section>

      {showModal&&<div className="modal-overlay" onClick={closeModal}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">{editingDoc?'Edit':'Add'} Document</h2><button className="modal-close" onClick={closeModal}><X size={20}/></button></div><form onSubmit={handleSubmit} className="modal-form"><div className="form-grid"><div className="form-field"><label htmlFor="title">Title *</label><input type="text" id="title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required/></div><div className="form-field"><label htmlFor="category">Category *</label><select id="category" value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} required>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div className="form-field"><label htmlFor="type">File Type *</label><select id="type" value={formData.type} onChange={e=>setFormData({...formData,type:e.target.value})} required>{types.map(t=><option key={t} value={t}>{t}</option>)}</select></div><div className="form-field"><label htmlFor="accessLevel">Access Level *</label><select id="accessLevel" value={formData.accessLevel} onChange={e=>setFormData({...formData,accessLevel:e.target.value})} required>{accessLevels.map(a=><option key={a} value={a}>{a.charAt(0).toUpperCase()+a.slice(1)}</option>)}</select></div><div className="form-field"><label htmlFor="displayOrder">Display Order</label><input type="number" id="displayOrder" value={formData.displayOrder} onChange={e=>setFormData({...formData,displayOrder:parseInt(e.target.value)||0})} min="0"/></div><div className="form-field full-width"><label htmlFor="url">File URL *</label><input type="url" id="url" value={formData.url} onChange={e=>setFormData({...formData,url:e.target.value})} placeholder="https://..." required/></div><div className="form-field full-width"><label htmlFor="tags">Tags (comma-separated)</label><input type="text" id="tags" value={formData.tags} onChange={e=>setFormData({...formData,tags:e.target.value})} placeholder="packet, schedule, maps"/></div><div className="form-field full-width"><label htmlFor="description">Description</label><textarea id="description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3}/></div></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingDoc?'Save Changes':'Add Document'}</button></div></form></div></div>}

      {viewDoc&&<div className="modal-overlay" onClick={()=>setViewDoc(null)}><div className="modal modal-lg" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Document Details</h2><button className="modal-close" onClick={()=>setViewDoc(null)}><X size={20}/></button></div><div className="modal-body"><div className="view-grid"><div className="view-section"><h4>Document Info</h4><dl><dt>Title</dt><dd>{viewDoc.title}</dd><dt>Description</dt><dd>{viewDoc.description||'—'}</dd><dt>Category</dt><dd><span className="category-badge">{viewDoc.category}</span></dd></dl></div><div className="view-section"><h4>File Details</h4><dl><dt>Type</dt><dd><span className="type-badge">{viewDoc.type}</span></dd><dt>Access Level</dt><dd><span className={`access-badge ${getAccessClass(viewDoc.accessLevel)}`}>{viewDoc.accessLevel}</span></dd><dt>Display Order</dt><dd>{viewDoc.displayOrder}</dd><dt>Tags</dt><dd>{(viewDoc.tags||[]).join(', ')||'—'}</dd><dt>URL</dt><dd><a href={viewDoc.url} target="_blank" rel="noopener noreferrer">{viewDoc.url}</a></dd></dl></div></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setViewDoc(null)}>Close</button><button className="btn btn-primary" onClick={()=>{setViewDoc(null);openEditModal(viewDoc);}}><Edit size={16}/> Edit</button></div></div></div>}

      {confirmDelete&&<div className="modal-overlay" onClick={()=>setConfirmDelete(null)}><div className="modal modal-sm" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div><div className="modal-body"><div className="delete-warning"><AlertCircle size={48} className="warning-icon"/><p>Delete this document?</p><p className="attendee-name">{documents.find(d=>d.id===confirmDelete)?.title}</p><p className="delete-note">Cannot be undone.</p></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={confirmDeleteDoc}><Trash2 size={16}/> Delete</button></div></div></div>}
    </div>
  );
};

export default ManageDocuments;