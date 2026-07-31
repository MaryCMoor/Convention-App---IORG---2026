import { useState, useMemo, useCallback } from 'react';
import {
  Search, Filter, Plus, Edit, Trash2, UserPlus, Download,
  ChevronDown, ChevronUp, X, Check, AlertCircle, Info,
  Eye, Mail, Phone, MapPin, Award, Crown, Shield
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_CONFIG } from '../../config/admin';
import './ManageAttendees.css';

const ManageAttendees = () => {
  const { attendees, addAttendee, updateAttendee, deleteAttendee } = useAdmin();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [viewAttendee, setViewAttendee] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    chapter: '',
    role: 'Attendee',
    grandOffice: '',
    registrationStatus: 'confirmed',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });

  // Derived data
  const chapters = useMemo(() => 
    [...new Set(attendees.map(a => a.chapter).filter(Boolean))].sort(), 
    [attendees]
  );

  const roles = ['Attendee', 'Grand Officer', 'Advisor', 'Volunteer', 'Staff'];
  const statuses = ['confirmed', 'pending', 'cancelled', 'waitlist'];

  const filteredAttendees = useMemo(() => {
    return attendees
      .filter(a => {
        const matchesSearch = !searchQuery || 
          a.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.chapter.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || a.role === filterRole;
        const matchesStatus = filterStatus === 'all' || a.registrationStatus === filterStatus;
        const matchesChapter = filterChapter === 'all' || a.chapter === filterChapter;
        return matchesSearch && matchesRole && matchesStatus && matchesChapter;
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
  }, [attendees, searchQuery, filterRole, filterStatus, filterChapter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const paginatedAttendees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAttendees.slice(start, start + itemsPerPage);
  }, [filteredAttendees, currentPage]);

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAttendee) {
      updateAttendee(editingAttendee.id, formData);
    } else {
      addAttendee(formData);
    }
    closeModal();
  };

  const openAddModal = () => {
    setEditingAttendee(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (attendee) => {
    setEditingAttendee(attendee);
    setFormData({
      firstName: attendee.firstName || '',
      lastName: attendee.lastName || '',
      email: attendee.email || '',
      phone: attendee.phone || '',
      chapter: attendee.chapter || '',
      role: attendee.role || 'Attendee',
      grandOffice: attendee.grandOffice || '',
      registrationStatus: attendee.registrationStatus || 'confirmed',
      dietaryRestrictions: attendee.dietaryRestrictions || '',
      accessibilityNeeds: attendee.accessibilityNeeds || '',
      emergencyContact: attendee.emergencyContact || '',
      emergencyPhone: attendee.emergencyPhone || '',
      notes: attendee.notes || '',
    });
    setShowModal(true);
  };

  const openViewModal = (attendee) => {
    setViewAttendee(attendee);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAttendee(null);
    setTimeout(resetForm, 300);
  };

  const closeViewModal = () => {
    setViewAttendee(null);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      chapter: '',
      role: 'Attendee',
      grandOffice: '',
      registrationStatus: 'confirmed',
      dietaryRestrictions: '',
      accessibilityNeeds: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
    });
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAttendee = () => {
    if (confirmDelete) {
      deleteAttendee(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportAttendees = () => {
    const csv = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Chapter', 'Role', 'Grand Office', 'Status', 'Dietary', 'Accessibility', 'Emergency Contact', 'Emergency Phone'].join(','),
      ...filteredAttendees.map(a => [
        a.firstName, a.lastName, a.email, a.phone, a.chapter, a.role, 
        a.grandOffice, a.registrationStatus, a.dietaryRestrictions, 
        a.accessibilityNeeds, a.emergencyContact, a.emergencyPhone
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'status-confirmed',
      pending: 'status-pending',
      cancelled: 'status-cancelled',
      waitlist: 'status-waitlist',
    };
    return badges[status] || 'status-confirmed';
  };

  const getRoleIcon = (role) => {
    if (role === 'Grand Officer') return <Crown size={14} className="role-icon" />;
    if (role === 'Advisor') return <Shield size={14} className="role-icon" />;
    if (role === 'Volunteer') return <Award size={14} className="role-icon" />;
    return <UserPlus size={14} className="role-icon" />;
  };

  return (
    <div className="manage-attendees">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">Manage Attendees</h1>
          <p className="page-subtitle">
            {filteredAttendees.length} of {attendees.length} attendees
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportAttendees}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Add Attendee</span>
          </button>
        </div>
      </header>

      {/* Search & Filters */}
      <section className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search attendees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-toggle">
          <button 
            className={`btn btn-outline ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Chapters</option>
                {chapters.map(chapter => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Table */}
      <section className="table-section">
        <div className="table-wrapper">
          <table className="data-table" role="grid">
            <thead>
              <tr>
                <th scope="col">
                  <button className="sortable-header" onClick={() => handleSort('firstName')}>
                    Name <span className="sort-icon">{sortBy === 'firstName' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}</span>
                  </button>
                </th>
                <th scope="col">
                  <button className="sortable-header" onClick={() => handleSort('chapter')}>
                    Chapter <span className="sort-icon">{sortBy === 'chapter' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}</span>
                  </button>
                </th>
                <th scope="col">
                  <button className="sortable-header" onClick={() => handleSort('role')}>
                    Role <span className="sort-icon">{sortBy === 'role' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}</span>
                  </button>
                </th>
                <th scope="col">
                  <button className="sortable-header" onClick={() => handleSort('grandOffice')}>
                    Grand Office <span className="sort-icon">{sortBy === 'grandOffice' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}</span>
                  </button>
                </th>
                <th scope="col">
                  <button className="sortable-header" onClick={() => handleSort('registrationStatus')}>
                    Status <span className="sort-icon">{sortBy === 'registrationStatus' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}</span>
                  </button>
                </th>
                <th scope="col">
                  <button className="sortable-header" onClick={() => handleSort('email')}>
                    Contact <span className="sort-icon">{sortBy === 'email' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ''}</span>
                  </button>
                </th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <Info size={32} />
                    <p>No attendees found</p>
                    <button className="btn btn-primary" onClick={openAddModal}>
                      <Plus size={16} />
                      Add First Attendee
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedAttendees.map(attendee => (
                  <tr key={attendee.id}>
                    <td className="name-cell">
                      <div className="attendee-info">
                        <div className="attendee-name">
                          <span className="name">{attendee.firstName} {attendee.lastName}</span>
                          {attendee.grandOffice && (
                            <span className="grand-office-badge">
                              <Crown size={12} />
                              {attendee.grandOffice}
                            </span>
                          )}
                        </div>
                        <div className="attendee-meta">
                          {attendee.chapter && (
                            <span className="meta-item">
                              <MapPin size={12} />
                              {attendee.chapter}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{attendee.chapter || '—'}</td>
                    <td>
                      <span className="role-badge">
                        {getRoleIcon(attendee.role)}
                        {attendee.role}
                      </span>
                    </td>
                    <td>{attendee.grandOffice || '—'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(attendee.registrationStatus)}`}>
                        {attendee.registrationStatus.charAt(0).toUpperCase() + attendee.registrationStatus.slice(1)}
                      </span>
                    </td>
                    <td className="contact-cell">
                      <div className="contact-info">
                        {attendee.email && (
                          <a href={`mailto:${attendee.email}`} className="contact-link">
                            <Mail size={14} />
                            {attendee.email}
                          </a>
                        )}
                        {attendee.phone && (
                          <a href={`tel:${attendee.phone}`} className="contact-link">
                            <Phone size={14} />
                            {attendee.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="icon-btn view" 
                          onClick={() => openViewModal(attendee)}
                          aria-label={`View ${attendee.firstName} ${attendee.lastName}`}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="icon-btn edit" 
                          onClick={() => openEditModal(attendee)}
                          aria-label={`Edit ${attendee.firstName} ${attendee.lastName}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="icon-btn delete" 
                          onClick={() => handleDelete(attendee.id)}
                          aria-label={`Delete ${attendee.firstName} ${attendee.lastName}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Attendees pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="page-info">
              Page {currentPage} of {totalPages} ({filteredAttendees.length} total)
            </div>
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </section>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAttendee ? 'Edit Attendee' : 'Add New Attendee'}
              </h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="chapter">Chapter</label>
                  <select
                    id="chapter"
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="grandOffice">Grand Office</label>
                  <input
                    type="text"
                    id="grandOffice"
                    value={formData.grandOffice}
                    onChange={(e) => setFormData({...formData, grandOffice: e.target.value})}
                    placeholder="e.g., Grand Worthy Advisor"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="registrationStatus">Registration Status *</label>
                  <select
                    id="registrationStatus"
                    value={formData.registrationStatus}
                    onChange={(e) => setFormData({...formData, registrationStatus: e.target.value})}
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field full-width">
                  <label htmlFor="dietaryRestrictions">Dietary Restrictions</label>
                  <textarea
                    id="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => setFormData({...formData, dietaryRestrictions: e.target.value})}
                    rows={2}
                    placeholder="Food allergies, preferences, etc."
                  />
                </div>
                <div className="form-field full-width">
                  <label htmlFor="accessibilityNeeds">Accessibility Needs</label>
                  <textarea
                    id="accessibilityNeeds"
                    value={formData.accessibilityNeeds}
                    onChange={(e) => setFormData({...formData, accessibilityNeeds: e.target.value})}
                    rows={2}
                    placeholder="Mobility, visual, hearing, or other accommodations"
                  />
                </div>
                <div className="form-field full-width">
                  <label htmlFor="emergencyContact">Emergency Contact</label>
                  <input
                    type="text"
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    placeholder="Name and relationship"
                  />
                </div>
                <div className="form-field full-width">
                  <label htmlFor="emergencyPhone">Emergency Phone</label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                  />
                </div>
                <div className="form-field full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    placeholder="Internal notes"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAttendee ? 'Save Changes' : 'Add Attendee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewAttendee && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Attendee Details</h2>
              <button className="modal-close" onClick={closeViewModal} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="view-header">
                <div className="view-avatar">
                  {viewAttendee.firstName[0]}{viewAttendee.lastName[0]}
                </div>
                <div className="view-name">
                  <h3>{viewAttendee.firstName} {viewAttendee.lastName}</h3>
                  <div className="view-badges">
                    <span className={`status-badge ${getStatusBadge(viewAttendee.registrationStatus)}`}>
                      {viewAttendee.registrationStatus}
                    </span>
                    <span className="role-badge">
                      {getRoleIcon(viewAttendee.role)}
                      {viewAttendee.role}
                    </span>
                    {viewAttendee.grandOffice && (
                      <span className="grand-office-badge">
                        <Crown size={12} />
                        {viewAttendee.grandOffice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="view-grid">
                <div className="view-section">
                  <h4>Contact Information</h4>
                  <dl>
                    {viewAttendee.email && (
                      <>
                        <dt>Email</dt>
                        <dd><a href={`mailto:${viewAttendee.email}`}>{viewAttendee.email}</a></dd>
                      </>
                    )}
                    {viewAttendee.phone && (
                      <>
                        <dt>Phone</dt>
                        <dd><a href={`tel:${viewAttendee.phone}`}>{viewAttendee.phone}</a></dd>
                      </>
                    )}
                    {viewAttendee.chapter && (
                      <>
                        <dt>Chapter</dt>
                        <dd>{viewAttendee.chapter}</dd>
                      </>
                    )}
                  </dl>
                </div>

                <div className="view-section">
                  <h4>Registration Details</h4>
                  <dl>
                    <dt>Status</dt>
                    <dd>{viewAttendee.registrationStatus}</dd>
                    {viewAttendee.grandOffice && (
                      <>
                        <dt>Grand Office</dt>
                        <dd>{viewAttendee.grandOffice}</dd>
                      </>
                    )}
                    <dt>Role</dt>
                    <dd>{viewAttendee.role}</dd>
                    {viewAttendee.registeredAt && (
                      <>
                        <dt>Registered</dt>
                        <dd>{new Date(viewAttendee.registeredAt).toLocaleDateString()}</dd>
                      </>
                    )}
                  </dl>
                </div>

                {viewAttendee.dietaryRestrictions && (
                  <div className="view-section">
                    <h4>Dietary Restrictions</h4>
                    <p>{viewAttendee.dietaryRestrictions}</p>
                  </div>
                )}

                {viewAttendee.accessibilityNeeds && (
                  <div className="view-section">
                    <h4>Accessibility Needs</h4>
                    <p>{viewAttendee.accessibilityNeeds}</p>
                  </div>
                )}

                {viewAttendee.emergencyContact && (
                  <div className="view-section">
                    <h4>Emergency Contact</h4>
                    <dl>
                      <dt>Contact</dt>
                      <dd>{viewAttendee.emergencyContact}</dd>
                      {viewAttendee.emergencyPhone && (
                        <>
                          <dt>Phone</dt>
                          <dd>{viewAttendee.emergencyPhone}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                )}

                {viewAttendee.notes && (
                  <div className="view-section full-width">
                    <h4>Notes</h4>
                    <p>{viewAttendee.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeViewModal}>Close</button>
              <button className="btn btn-primary" onClick={() => { closeViewModal(); openEditModal(viewAttendee); }}>
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <AlertCircle size={48} className="warning-icon" />
                <p>Are you sure you want to delete this attendee?</p>
                <p className="attendee-name">
                  {attendees.find(a => a.id === confirmDelete)?.firstName} 
                  {attendees.find(a => a.id === confirmDelete)?.lastName}
                </p>
                <p className="delete-note">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteAttendee}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAttendees;