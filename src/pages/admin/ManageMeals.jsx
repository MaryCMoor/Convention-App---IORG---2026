import { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Download, Utensils,
  ChevronDown, ChevronUp, X, AlertCircle, Eye, Calendar,
  Tag, Coffee, WheatOff, Heart, Leaf, Fish, Apple, UtensilsCrossed
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageMeals.css';

const ManageMeals = () => {
  const { meals, addMeal, updateMeal, deleteMeal } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDietary, setFilterDietary] = useState('all');
  const [sortBy, setSortBy] = useState('day');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [viewMeal, setViewMeal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    day: 'Day 1',
    mealType: 'Breakfast',
    startTime: '',
    endTime: '',
    location: '',
    dietaryTags: [],
    menuItems: '',
    notes: '',
  });

  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const mealTypes = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack', 'Reception'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Kosher', 'Halal', 'Low-Sodium', 'Diabetic-Friendly'];
  const locations = useMemo(() => [...new Set(meals.map(m => m.location).filter(Boolean))].sort(), [meals]);

  const filteredMeals = useMemo(() => {
    return meals
      .filter(m => {
        const matchesSearch = !searchQuery || 
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDay = filterDay === 'all' || m.day === filterDay;
        const matchesType = filterType === 'all' || m.mealType === filterType;
        const matchesDietary = filterDietary === 'all' || (m.dietaryTags && m.dietaryTags.includes(filterDietary));
        return matchesSearch && matchesDay && matchesType && matchesDietary;
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
  }, [meals, searchQuery, filterDay, filterType, filterDietary, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredMeals.length / itemsPerPage);
  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMeals.slice(start, start + itemsPerPage);
  }, [filteredMeals, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, dietaryTags: formData.dietaryTags || [] };
    if (editingMeal) updateMeal(editingMeal.id, data);
    else addMeal(data);
    closeModal();
  };

  const openAddModal = () => { setEditingMeal(null); resetForm(); setShowModal(true); };
  const openEditModal = (m) => { setEditingMeal(m); setFormData({...m, dietaryTags: m.dietaryTags || []}); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingMeal(null); setTimeout(resetForm, 300); };
  const resetForm = () => setFormData({name:'',description:'',day:'Day 1',mealType:'Breakfast',startTime:'',endTime:'',location:'',dietaryTags:[],menuItems:'',notes:''});
  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteMeal = () => { if (confirmDelete) { deleteMeal(confirmDelete); setConfirmDelete(null); } };
  const handleSort = (field) => { if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } };

  const toggleDietary = (tag) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const exportMeals = () => {
    const csv = [['Name','Description','Day','Meal Type','Start','End','Location','Dietary Tags','Menu Items'].join(','),...filteredMeals.map(m=>[m.name,m.description,m.day,m.mealType,m.startTime,m.endTime,m.location,(m.dietaryTags||[]).join(';'),m.menuItems].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`meals-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type) => {
    const icons = { Breakfast: Coffee, Brunch: UtensilsCrossed, Lunch: Utensils, Dinner: Utensils, Snack: Apple, Reception: Heart };
    return icons[type] || Utensils;
  };

  return (
    <div className="manage-meals">
      <header className="page-header">
        <div className="header-left"><h1 className="page-title">Meals</h1><p className="page-subtitle">{filteredMeals.length} of {meals.length} meals</p></div>
        <div className="header-actions"><button className="btn btn-secondary" onClick={exportMeals}><Download size={18}/><span>Export CSV</span></button><button className="btn btn-primary" onClick={openAddModal}><Plus size={18}/><span>Add Meal</span></button></div>
      </header>

      <section className="filters-section">
        <div className="search-box"><Search size={20} className="search-icon"/><input type="text" placeholder="Search meals..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="search-input"/></div>
        <div className="filter-toggle"><button className={`btn btn-outline ${showFilters?'active':''}`} onClick={()=>setShowFilters(!showFilters)}><Filter size={18}/><span>Filters</span><ChevronDown size={16} className={showFilters?'rotated':''}/></button></div>
        {showFilters && <div className="filters-panel"><div className="filter-row"><select value={filterDay} onChange={e=>setFilterDay(e.target.value)} className="filter-select"><option value="all">All Days</option>{days.map(d=><option key={d} value={d}>{d}</option>)}</select><select value={filterType} onChange={e=>setFilterType(e.target.value)} className="filter-select"><option value="all">All Types</option>{mealTypes.map(t=><option key={t} value={t}>{t}</option>)}</select><select value={filterDietary} onChange={e=>setFilterDietary(e.target.value)} className="filter-select"><option value="all">All Dietary</option>{dietaryOptions.map(d=><option key={d} value={d}>{d}</option>)}</select></div></div>}
      </section>

      <section className="table-section">
        <div className="table-wrapper"><table className="data-table" role="grid"><thead><tr>
          <th><button className="sortable-header" onClick={()=>handleSort('name')}>Meal <span className="sort-icon">{sortBy==='name'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('day')}>Day <span className="sort-icon">{sortBy==='day'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('mealType')}>Type <span className="sort-icon">{sortBy==='mealType'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('startTime')}>Time <span className="sort-icon">{sortBy==='startTime'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th><button className="sortable-header" onClick={()=>handleSort('location')}>Location <span className="sort-icon">{sortBy==='location'?(sortOrder==='asc'?<ChevronUp size={14}/>:<ChevronDown size={14}/>):''}</span></button></th>
          <th>Dietary</th>
          <th>Actions</th>
        </tr></thead><tbody>
          {paginatedMeals.length===0?(
            <tr><td colSpan={7} className="empty-state"><Utensils size={32}/><p>No meals found</p><button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/>Add First Meal</button></td></tr>
          ):(
            paginatedMeals.map(m=><tr key={m.id}>
              <td className="name-cell"><div className="meal-name"><Icon size={16} />{m.name}</div>{m.description&&<div className="meal-desc">{m.description}</div>}</td>
              <td><span className="day-badge">{m.day}</span></td>
              <td><span className="type-badge">{m.mealType}</span></td>
              <td className="time-cell">{m.startTime&&new Date(m.startTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} - {m.endTime&&new Date(m.endTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
              <td>{m.location||'—'}</td>
              <td><div className="dietary-tags">{(m.dietaryTags||[]).slice(0,3).map(tag=><span key={tag} className="dietary-tag">{tag}</span>)}{(m.dietaryTags||[]).length>3&&<span className="dietary-more">+{(m.dietaryTags||[]).length-3} more</span>}</div></td>
              <td><div className="action-buttons"><button className="icon-btn view" onClick={()=>{setViewMeal(m);}}><Eye size={16}/></button><button className="icon-btn edit" onClick={()=>openEditModal(m)}><Edit size={16}/></button><button className="icon-btn delete" onClick={()=>handleDelete(m.id)}><Trash2 size={16}/></button></div></td>
            </tr>)
          )}
        </tbody></table></div>
        {totalPages>1&&<nav className="pagination" aria-label="Pagination"><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} aria-label="Previous"><ChevronLeft size={18}/></button><div className="page-info">Page {currentPage} of {totalPages} ({filteredMeals.length} total)</div><button className="page-btn" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} aria-label="Next"><ChevronRight size={18}/></button></nav>}
      </section>

      {showModal&&<div className="modal-overlay" onClick={closeModal}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">{editingMeal?'Edit':'Add'} Meal</h2><button className="modal-close" onClick={closeModal}><X size={20}/></button></div><form onSubmit={handleSubmit} className="modal-form"><div className="form-grid"><div className="form-field"><label htmlFor="name">Name *</label><input type="text" id="name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required/></div><div className="form-field"><label htmlFor="day">Day *</label><select id="day" value={formData.day} onChange={e=>setFormData({...formData,day:e.target.value})} required>{days.map(d=><option key={d} value={d}>{d}</option>)}</select></div><div className="form-field"><label htmlFor="mealType">Meal Type *</label><select id="mealType" value={formData.mealType} onChange={e=>setFormData({...formData,mealType:e.target.value})} required>{mealTypes.map(t=><option key={t} value={t}>{t}</option>)}</select></div><div className="form-field"><label htmlFor="startTime">Start Time *</label><input type="datetime-local" id="startTime" value={formData.startTime} onChange={e=>setFormData({...formData,startTime:e.target.value})} required/></div><div className="form-field"><label htmlFor="endTime">End Time *</label><input type="datetime-local" id="endTime" value={formData.endTime} onChange={e=>setFormData({...formData,endTime:e.target.value})} required/></div><div className="form-field"><label htmlFor="location">Location</label><select id="location" value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})}><option value="">Select Location</option>{locations.map(l=><option key={l} value={l}>{l}</option>)}</select></div><div className="form-field full-width"><label>Dietary Tags</label><div className="dietary-checkboxes">{dietaryOptions.map(tag=><label key={tag} className="checkbox-label"><input type="checkbox" checked={formData.dietaryTags.includes(tag)} onChange={()=>toggleDietary(tag)}/><span>{tag}</span></label>)}</div></div><div className="form-field full-width"><label htmlFor="menuItems">Menu Items</label><textarea id="menuItems" value={formData.menuItems} onChange={e=>setFormData({...formData,menuItems:e.target.value})} rows={3} placeholder="List menu items, one per line"/></div><div className="form-field full-width"><label htmlFor="notes">Notes</label><textarea id="notes" value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})} rows={2}/></div></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingMeal?'Save Changes':'Add Meal'}</button></div></form></div></div>}

      {viewMeal&&<div className="modal-overlay" onClick={()=>setViewMeal(null)}><div className="modal modal-lg" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Meal Details</h2><button className="modal-close" onClick={()=>setViewMeal(null)}><X size={20}/></button></div><div className="modal-body"><div className="view-grid"><div className="view-section"><h4>Meal Info</h4><dl><dt>Name</dt><dd>{viewMeal.name}</dd><dt>Description</dt><dd>{viewMeal.description||'—'}</dd><dt>Type</dt><dd><span className="type-badge">{viewMeal.mealType}</span></dd></dl></div><div className="view-section"><h4>Time & Location</h4><dl><dt>Day</dt><dd>{viewMeal.day}</dd><dt>Start</dt><dd>{viewMeal.startTime?new Date(viewMeal.startTime).toLocaleString():'—'}</dd><dt>End</dt><dd>{viewMeal.endTime?new Date(viewMeal.endTime).toLocaleString():'—'}</dd><dt>Location</dt><dd>{viewMeal.location||'—'}</dd></dl></div>{(viewMeal.dietaryTags||[]).length>0&&<div className="view-section"><h4>Dietary Tags</h4><div className="dietary-tags-large">{(viewMeal.dietaryTags||[]).map(tag=><span key={tag} className="dietary-tag">{tag}</span>)}</div></div>}{viewMeal.menuItems&&<div className="view-section full-width"><h4>Menu Items</h4><p>{viewMeal.menuItems}</p></div>}{viewMeal.notes&&<div className="view-section full-width"><h4>Notes</h4><p>{viewMeal.notes}</p></div>}</div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setViewMeal(null)}>Close</button><button className="btn btn-primary" onClick={()=>{setViewMeal(null);openEditModal(viewMeal);}}><Edit size={16}/> Edit</button></div></div></div>}

      {confirmDelete&&<div className="modal-overlay" onClick={()=>setConfirmDelete(null)}><div className="modal modal-sm" onClick={e=>e.stopPropagation()}><div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div><div className="modal-body"><div className="delete-warning"><AlertCircle size={48} className="warning-icon"/><p>Delete this meal?</p><p className="attendee-name">{meals.find(m=>m.id===confirmDelete)?.name}</p><p className="delete-note">Cannot be undone.</p></div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={confirmDeleteMeal}><Trash2 size={16}/> Delete</button></div></div></div>}
    </div>
  );
};

export default ManageMeals;