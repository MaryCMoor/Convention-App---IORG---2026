import { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, Download, ClipboardList,
  ChevronDown, ChevronUp, X, AlertCircle, Eye, Calendar,
  Tag, BarChart2, Star, MessageSquare, CheckCircle, XCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageSurveys.css';

const ManageSurveys = () => {
  const { surveys, addSurvey, updateSurvey, deleteSurvey } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [viewSurvey, setViewSurvey] = useState(null);
  const [viewResponses, setViewResponses] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Feedback',
    status: 'draft',
    questions: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    anonymous: false,
    requiredCompletion: false,
  });

  const types = ['Feedback', 'Satisfaction', 'Assessment', 'Poll', 'Registration', 'Evaluation'];
  const statuses = ['draft', 'active', 'closed', 'archived'];

  const filteredSurveys = useMemo(() => {
    return surveys
      .filter(s => {
        const matchesSearch = !searchQuery ||
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        const matchesType = filterType === 'all' || s.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
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
  }, [surveys, searchQuery, filterStatus, filterType, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const paginatedSurveys = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSurveys.slice(start, start + itemsPerPage);
  }, [filteredSurveys, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      questions: formData.questions || [],
    };
    if (editingSurvey) updateSurvey(editingSurvey.id, data);
    else addSurvey(data);
    closeModal();
  };

  const openAddModal = () => { setEditingSurvey(null); resetForm(); setShowModal(true); };
  const openEditModal = (s) => { 
    setEditingSurvey(s); 
    setFormData({
      ...s, 
      startDate: s.startDate?.split('T')[0] || new Date().toISOString().split('T')[0], 
      endDate: s.endDate?.split('T')[0] || ''
    }); 
    setShowModal(true); 
  };
  const closeModal = () => { setShowModal(false); setEditingSurvey(null); setTimeout(resetForm, 300); };
  const resetForm = () => setFormData({
    title: '', description: '', type: 'Feedback', status: 'draft',
    questions: [], startDate: new Date().toISOString().split('T')[0],
    endDate: '', anonymous: false, requiredCompletion: false
  });
  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteSurvey = () => { if (confirmDelete) { deleteSurvey(confirmDelete); setConfirmDelete(null); } };
  const handleSort = (field) => { 
    if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); 
    else { setSortBy(field); setSortOrder('asc'); } 
  };

  const exportSurveys = () => {
      const csv = [
        ['Title', 'Description', 'Type', 'Status', 'Start Date', 'End Date', 'Questions', 'Responses'].join(','),
        ...filteredSurveys.map(s => [
          s.title, s.description, s.type, s.status, s.startDate, s.endDate || '',
          (s.questions || []).length, s.responsesCount || 0
        ].map(v => '"' + String(v).replaceAll('"', '""') + '"').join(','))
      ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'surveys-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusClass = (s) => ({
    draft: 'status-draft', active: 'status-active', 
    closed: 'status-closed', archived: 'status-archived'
  }[s] || 'status-draft');

  const formatResponseCount = (survey) => {
    const count = survey.responsesCount || 0;
    if (survey.questions && survey.questions.length > 0) {
      return count + ' responses';
    }
    return 'No questions';
  };

  return (
    <div className="manage-surveys">
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">Surveys</h1>
          <p className="page-subtitle">{filteredSurveys.length} of {surveys.length} surveys</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportSurveys}>
            <Download size={18} /><span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} /><span>Create Survey</span>
          </button>
        </div>
      </header>

      <section className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search surveys..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="search-input"
          />
        </div>
        <div className="filter-toggle">
          <button 
            className={'btn btn-outline ' + (showFilters ? 'active' : '')}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /><span>Filters</span>
            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
          </button>
        </div>
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
                <option value="all">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
                <option value="all">All Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
      </section>

      <section className="table-section">
        <div className="table-wrapper">
          <table className="data-table" role="grid">
            <thead>
              <tr>
                <th>
                  <button className="sortable-header" onClick={() => handleSort('title')}>
                    Survey 
                    <span className="sort-icon">
                      {sortBy === 'title' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}
                    </span>
                  </button>
                </th>
                <th>
                  <button className="sortable-header" onClick={() => handleSort('type')}>
                    Type 
                    <span className="sort-icon">
                      {sortBy === 'type' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}
                    </span>
                  </button>
                </th>
                <th>
                  <button className="sortable-header" onClick={() => handleSort('status')}>
                    Status 
                    <span className="sort-icon">
                      {sortBy === 'status' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}
                    </span>
                  </button>
                </th>
                <th>
                  <button className="sortable-header" onClick={() => handleSort('startDate')}>
                    Start Date 
                    <span className="sort-icon">
                      {sortBy === 'startDate' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}
                    </span>
                  </button>
                </th>
                <th>Questions</th>
                <th>Responses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSurveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <ClipboardList size={32} />
                    <p>No surveys found</p>
                    <button className="btn btn-primary" onClick={openAddModal}>
                      <Plus size={16} /> Create First Survey
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedSurveys.map(s => (
                  <tr key={s.id}>
                    <td className="title-cell">
                      <div className="survey-title">{s.title}</div>
                      {s.description && <div className="survey-desc">{s.description}</div>}
                    </td>
                    <td><span className="type-badge">{s.type}</span></td>
                    <td>
                      <span className={'status-badge ' + getStatusClass(s.status)}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td>{s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'}</td>
                    <td>{(s.questions || []).length}</td>
                    <td><span className="response-count">{formatResponseCount(s)}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn view" onClick={() => { setViewSurvey(s); }}><Eye size={16} /></button>
                        <button className="icon-btn responses" onClick={() => { setViewResponses(s); }}><BarChart2 size={16} /></button>
                        <button className="icon-btn edit" onClick={() => openEditModal(s)}><Edit size={16} /></button>
                        <button className="icon-btn delete" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <div className="page-info">Page {currentPage} of {totalPages} ({filteredSurveys.length} total)</div>
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingSurvey ? 'Edit' : 'Create'} Survey</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="title">Title *</label>
                  <input 
                    type="text" 
                    id="title" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="type">Type *</label>
                  <select 
                    id="type" 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})} 
                    required
                  >
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="status">Status *</label>
                  <select 
                    id="status" 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    required
                  >
                    {statuses.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="startDate">Start Date *</label>
                  <input 
                    type="date" 
                    id="startDate" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="endDate">End Date</label>
                  <input 
                    type="date" 
                    id="endDate" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                  />
                </div>
                <div className="form-field">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.anonymous} 
                      onChange={e => setFormData({...formData, anonymous: e.target.checked})} 
                    /> 
                    Anonymous
                  </label>
                </div>
                <div className="form-field">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.requiredCompletion} 
                      onChange={e => setFormData({...formData, requiredCompletion: e.target.checked})} 
                    /> 
                    Required
                  </label>
                </div>
                <div className="form-field full-width">
                  <label htmlFor="description">Description</label>
                  <textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={3} 
                  />
                </div>
              </div>
              <div className="questions-section">
                <h4>Questions</h4>
                <div className="questions-list">
                  {(formData.questions || []).length === 0 ? (
                    <p className="no-questions">No questions added yet. Click "Add Question" to start.</p>
                  ) : (
                    (formData.questions || []).map((q, i) => (
                      <div key={i} className="question-item">
                        <div className="question-header">
                          <span className="question-number">Q{i + 1}</span>
                          <span className="question-type">{q.type}</span>
                          <button 
                            type="button" 
                            className="icon-btn delete" 
                            onClick={() => {
                              const newQ = [...formData.questions];
                              newQ.splice(i, 1);
                              setFormData({...formData, questions: newQ});
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="question-text">{q.text}</div>
                        {q.options && q.options.length > 0 && (
                          <div className="question-options">
                            {q.options.map((opt, oi) => <span key={oi} className="option-tag">{opt}</span>)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setFormData({
                    ...formData, 
                    questions: [...(formData.questions || []), { type: 'text', text: '', required: false, options: [] }]
                  })}
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingSurvey ? 'Save Changes' : 'Create Survey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewSurvey && (
        <div className="modal-overlay" onClick={() => setViewSurvey(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Survey Details</h2>
              <button className="modal-close" onClick={() => setViewSurvey(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="view-grid">
                <div className="view-section">
                  <h4>Survey Info</h4>
                  <dl>
                    <dt>Title</dt><dd>{viewSurvey.title}</dd>
                    <dt>Description</dt><dd>{viewSurvey.description || '—'}</dd>
                    <dt>Type</dt><dd><span className="type-badge">{viewSurvey.type}</span></dd>
                    <dt>Status</dt>
                    <dd>
                      <span className={'status-badge ' + getStatusClass(viewSurvey.status)}>
                        {viewSurvey.status}
                      </span>
                    </dd>
                  </dl>
                </div>
                <div className="view-section">
                  <h4>Settings</h4>
                  <dl>
                    <dt>Start Date</dt><dd>{viewSurvey.startDate ? new Date(viewSurvey.startDate).toLocaleDateString() : '—'}</dd>
                    <dt>End Date</dt><dd>{viewSurvey.endDate ? new Date(viewSurvey.endDate).toLocaleDateString() : '—'}</dd>
                    <dt>Anonymous</dt><dd>{viewSurvey.anonymous ? 'Yes' : 'No'}</dd>
                    <dt>Required Completion</dt><dd>{viewSurvey.requiredCompletion ? 'Yes' : 'No'}</dd>
                  </dl>
                </div>
                {(viewSurvey.questions || []).length > 0 && (
                  <div className="view-section full-width">
                    <h4>Questions ({(viewSurvey.questions || []).length})</h4>
                    <div className="questions-preview">
                      {(viewSurvey.questions || []).map((q, i) => (
                        <div key={i} className="question-preview">
                          <div className="question-preview-header">
                            <span className="question-number">Q{i + 1}</span>
                            <span className="question-type">{q.type}</span>
                            {q.required && <span className="required-tag">Required</span>}
                          </div>
                          <div className="question-preview-text">{q.text}</div>
                          {q.options && q.options.length > 0 && (
                            <div className="question-preview-options">
                              {q.options.map((opt, oi) => <span key={oi} className="option-tag">{opt}</span>)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setViewSurvey(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setViewSurvey(null); openEditModal(viewSurvey); }}>
                <Edit size={16} /> Edit
              </button>
              <button className="btn btn-secondary" onClick={() => { setViewSurvey(null); setViewResponses(viewSurvey); }}>
                <BarChart2 size={16} /> View Responses
              </button>
            </div>
          </div>
        </div>
      )}

                        </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setViewResponses(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setViewResponses(null); setViewSurvey(viewResponses); }}>
                <Eye size={16} /> Back to Survey
              </button>
            </div>
          </div>
        </div>
      )}

          </div>
  );
};

export default ManageSurveys;