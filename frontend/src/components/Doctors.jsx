import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  Calendar, 
  Stethoscope, 
  Clock, 
  Mail, 
  Phone 
} from 'lucide-react';

export default function Doctors({ triggerNotification }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals/Forms State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorDashboard, setDoctorDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Form State
  const initialFormState = {
    fullName: '',
    specialization: '',
    phone: '',
    email: '',
    qualification: '',
    experienceYears: '',
    availability: 'Mon-Fri 9:00 AM - 5:00 PM'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await api.doctors.list();
      setDoctors(data);
    } catch (err) {
      triggerNotification('error', 'Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (doctor) => {
    setFormData({
      id: doctor.id,
      fullName: doctor.fullName || '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      qualification: doctor.qualification || '',
      experienceYears: doctor.experienceYears || '',
      availability: doctor.availability || 'Mon-Fri 9:00 AM - 5:00 PM'
    });
    setIsEditing(true);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenDashboard = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowDashboardModal(true);
    setLoadingDashboard(true);
    try {
      const data = await api.doctors.getDashboard(doctor.id);
      setDoctorDashboard(data);
    } catch (err) {
      triggerNotification('error', 'Failed to load doctor dashboard data');
      setShowDashboardModal(false);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor? All appointments associated with them might be affected.')) {
      try {
        await api.doctors.delete(id);
        triggerNotification('success', 'Doctor deleted successfully');
        loadDoctors();
      } catch (err) {
        triggerNotification('error', err.message || 'Failed to delete doctor');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Form validation matching backend constraints
    if (!formData.fullName.trim()) return setFormError("Full name is required");
    if (!formData.specialization.trim()) return setFormError("Specialization is required");
    if (!formData.phone.trim()) return setFormError("Phone number is required");
    
    // Parse experience years
    const exp = formData.experienceYears ? parseInt(formData.experienceYears) : null;

    try {
      const payload = {
        ...formData,
        experienceYears: exp
      };

      if (isEditing) {
        await api.doctors.update(formData.id, payload);
        triggerNotification('success', 'Doctor details updated successfully');
      } else {
        await api.doctors.create(payload);
        triggerNotification('success', 'Doctor registered successfully');
      }
      setShowFormModal(false);
      loadDoctors();
    } catch (err) {
      setFormError(err.message || 'Failed to save doctor');
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Filters & Actions */}
      <div className="filters-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search doctors by name, specialization, email..." 
            className="search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenCreate}>
          <Plus size={18} />
          Add Doctor
        </button>
      </div>

      {/* Main Doctors List Table */}
      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading doctors data...
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No doctors found.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Availability</th>
                  <th>Contact Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: '500', color: 'var(--text-highlight)' }}>Dr. {doc.fullName}</td>
                    <td>
                      <span className="badge scheduled" style={{ color: 'var(--color-primary)', background: 'rgba(99, 102, 241, 0.1)' }}>
                        {doc.specialization}
                      </span>
                    </td>
                    <td>{doc.qualification || '-'}</td>
                    <td>{doc.experienceYears ? `${doc.experienceYears} Years` : '-'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} /> {doc.availability || 'Not set'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                        <span><Phone size={10} style={{ marginRight: '0.2rem' }} />{doc.phone}</span>
                        {doc.email && <span style={{ color: 'var(--text-muted)' }}><Mail size={10} style={{ marginRight: '0.2rem' }} />{doc.email}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button className="icon-btn" title="View Today's Dashboard" onClick={() => handleOpenDashboard(doc)}>
                          <Calendar size={16} />
                        </button>
                        <button className="icon-btn" title="Edit Doctor" onClick={() => handleOpenEdit(doc)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" title="Delete Doctor" onClick={() => handleDelete(doc.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Doctor Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Doctor Profile' : 'Add New Doctor'}</h2>
              <button className="modal-close-btn" onClick={() => setShowFormModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-toast error" style={{ position: 'static', transform: 'none', maxWidth: 'none', marginBottom: '1rem' }}>
                    <span>{formError}</span>
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="form-input" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cardiologist"
                      className="form-input" 
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="form-input" 
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +91 9876543210"
                      className="form-input" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MBBS, MD"
                      className="form-input" 
                      value={formData.qualification}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weekly Availability</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mon-Fri 9:00 AM - 5:00 PM"
                      className="form-input" 
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">{isEditing ? 'Save Changes' : 'Add Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Dashboard Modal */}
      {showDashboardModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="metric-icon-wrapper" style={{ width: '36px', height: '36px', color: 'var(--color-primary)' }}>
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>Dr. {selectedDoctor.fullName} Dashboard</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Specialist: {selectedDoctor.specialization}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDashboardModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              {loadingDashboard ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading today's schedule...
                </div>
              ) : doctorDashboard ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Today status summary */}
                  <div className="detail-header-card" style={{ gridTemplateColumns: '1fr', textAlign: 'center', padding: '1.25rem' }}>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Appointments Today</span>
                      <span className="detail-info-value" style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                        {doctorDashboard.todayAppointmentsCount}
                      </span>
                    </div>
                  </div>

                  {/* Appointments list */}
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--text-highlight)', marginBottom: '0.75rem' }}>Today's Scheduled Shifts</h3>
                    {doctorDashboard.todayAppointments.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                        No appointments scheduled for today.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {doctorDashboard.todayAppointments.map((app) => (
                          <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-highlight)' }}>{app.patient?.fullName}</div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reason: {app.reason}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-secondary)' }}>
                                {formatTime(app.appointmentDateTime)}
                              </span>
                              <span className={`badge ${app.status.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>{app.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Could not load schedule dashboard details.</p>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => setShowDashboardModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
