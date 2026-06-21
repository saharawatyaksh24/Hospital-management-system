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
  FileText, 
  Receipt,
  User 
} from 'lucide-react';

export default function Patients({ triggerNotification }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals/Forms State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Tab within detailed view
  const [activeTab, setActiveTab] = useState('general');
  const [patientHistory, setPatientHistory] = useState({
    appointments: [],
    records: [],
    invoices: []
  });
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form State
  const initialFormState = {
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    bloodGroup: '',
    emergencyContact: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api.patients.list();
      setPatients(data);
    } catch (err) {
      triggerNotification('error', 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (patient) => {
    setFormData({
      id: patient.id,
      fullName: patient.fullName || '',
      phone: patient.phone || '',
      email: patient.email || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || 'MALE',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || '',
      emergencyContact: patient.emergencyContact || ''
    });
    setIsEditing(true);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenDetail = async (patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
    setActiveTab('general');
    setLoadingHistory(true);
    try {
      const [appointments, records, invoices] = await Promise.all([
        api.appointments.listByPatient(patient.id),
        api.medicalRecords.listByPatient(patient.id),
        api.invoices.listByPatient(patient.id)
      ]);
      setPatientHistory({ appointments, records, invoices });
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Could not load patient history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await api.patients.delete(id);
        triggerNotification('success', 'Patient deleted successfully');
        loadPatients();
      } catch (err) {
        triggerNotification('error', err.message || 'Failed to delete patient');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Simple validation matches Spring Boot validation
    if (!formData.fullName.trim()) return setFormError("Full name is required");
    if (!formData.phone.trim()) return setFormError("Phone number is required");
    if (!formData.dateOfBirth) return setFormError("Date of birth is required");
    if (new Date(formData.dateOfBirth) > new Date()) return setFormError("Date of birth must be in the past");

    try {
      if (isEditing) {
        await api.patients.update(formData.id, formData);
        triggerNotification('success', 'Patient updated successfully');
      } else {
        await api.patients.create(formData);
        triggerNotification('success', 'Patient registered successfully');
      }
      setShowFormModal(false);
      loadPatients();
    } catch (err) {
      setFormError(err.message || 'Failed to save patient');
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    patient.phone?.includes(search) ||
    patient.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Filters & Actions row */}
      <div className="filters-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search patients by name, phone, or email..." 
            className="search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenCreate}>
          <Plus size={18} />
          Register Patient
        </button>
      </div>

      {/* Main Patients Table */}
      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading patient data...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No patients found.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td style={{ fontWeight: '500', color: 'var(--text-highlight)' }}>{patient.fullName}</td>
                    <td><span style={{ fontSize: '0.85rem' }}>{patient.gender}</span></td>
                    <td>{patient.dateOfBirth}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.email || '-'}</td>
                    <td>
                      <div className="action-cell">
                        <button className="icon-btn" title="View History" onClick={() => handleOpenDetail(patient)}>
                          <Eye size={16} />
                        </button>
                        <button className="icon-btn" title="Edit Patient" onClick={() => handleOpenEdit(patient)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" title="Delete Patient" onClick={() => handleDelete(patient.id)}>
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

      {/* Create / Edit Patient Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Patient Details' : 'Register New Patient'}</h2>
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
                      className="form-input" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +91 9999988888"
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
                    <label className="form-label">Date of Birth *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select 
                      className="form-select"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      required
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <input 
                      type="text" 
                      placeholder="e.g. O+, A-"
                      className="form-input" 
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Address</label>
                    <textarea 
                      className="form-textarea" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">{isEditing ? 'Save Changes' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detailed view modal */}
      {showDetailModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="metric-icon-wrapper" style={{ width: '36px', height: '36px', color: 'var(--color-secondary)' }}>
                  <User size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>{selectedPatient.fullName}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patient ID: #{selectedPatient.id}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Brief General header summary */}
              <div className="detail-header-card">
                <div className="detail-info-item">
                  <span className="detail-info-label">Phone</span>
                  <span className="detail-info-value">{selectedPatient.phone}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Email</span>
                  <span className="detail-info-value">{selectedPatient.email || '-'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">DOB</span>
                  <span className="detail-info-value">{selectedPatient.dateOfBirth}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Gender</span>
                  <span className="detail-info-value">{selectedPatient.gender}</span>
                </div>
              </div>

              {/* Tabs navigation */}
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  General Info
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Appointments ({loadingHistory ? '..' : patientHistory.appointments.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
                  onClick={() => setActiveTab('records')}
                >
                  Medical Records ({loadingHistory ? '..' : patientHistory.records.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
                  onClick={() => setActiveTab('invoices')}
                >
                  Billing & Invoices ({loadingHistory ? '..' : patientHistory.invoices.length})
                </button>
              </div>

              {/* Tab Content panels */}
              <div style={{ flexGrow: 1, minHeight: '250px' }}>
                {loadingHistory ? (
                  <div style={{ padding: '2rem', textAlignment: 'center', color: 'var(--text-muted)' }}>
                    Loading history items...
                  </div>
                ) : (
                  <>
                    {/* General info tab */}
                    {activeTab === 'general' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="panel-card" style={{ gap: '0.75rem' }}>
                          <h3 style={{ fontSize: '1rem', color: 'var(--text-highlight)' }}>Physical Details</h3>
                          <div className="detail-info-item">
                            <span className="detail-info-label">Blood Group</span>
                            <span className="detail-info-value" style={{ color: 'var(--danger)' }}>{selectedPatient.bloodGroup || 'Not Recorded'}</span>
                          </div>
                          <div className="detail-info-item">
                            <span className="detail-info-label">Emergency Contact</span>
                            <span className="detail-info-value">{selectedPatient.emergencyContact || 'Not Recorded'}</span>
                          </div>
                        </div>
                        <div className="panel-card" style={{ gap: '0.75rem' }}>
                          <h3 style={{ fontSize: '1rem', color: 'var(--text-highlight)' }}>Contact Address</h3>
                          <div className="detail-info-item">
                            <span className="detail-info-label">Permanent Address</span>
                            <span className="detail-info-value" style={{ fontWeight: 'normal', color: 'var(--text-main)' }}>
                              {selectedPatient.address || 'No address logged for this patient.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Appointments History tab */}
                    {activeTab === 'appointments' && (
                      <div className="history-card-list">
                        {patientHistory.appointments.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            No appointment records found.
                          </p>
                        ) : (
                          patientHistory.appointments.map((app) => (
                            <div className="history-card" key={app.id}>
                              <div className="history-card-header">
                                <span className="history-card-title">Dr. {app.doctor?.fullName}</span>
                                <span className="history-card-date">{new Date(app.appointmentDateTime).toLocaleString()}</span>
                              </div>
                              <div className="history-card-body">
                                <div><span className="history-card-label">Reason:</span>{app.reason}</div>
                                {app.notes && <div><span className="history-card-label">Notes:</span>{app.notes}</div>}
                                <div style={{ marginTop: '0.5rem' }}>
                                  <span className={`badge ${app.status.toLowerCase()}`}>{app.status}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Medical Records History tab */}
                    {activeTab === 'records' && (
                      <div className="history-card-list">
                        {patientHistory.records.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            No medical records found.
                          </p>
                        ) : (
                          patientHistory.records.map((rec) => (
                            <div className="history-card" key={rec.id}>
                              <div className="history-card-header">
                                <span className="history-card-title">Diagnosis: {rec.diagnosis}</span>
                                <span className="history-card-date">Visited: {rec.visitDate}</span>
                              </div>
                              <div className="history-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {rec.doctor && <div><span className="history-card-label">Attending Doctor:</span>Dr. {rec.doctor.fullName}</div>}
                                {rec.treatment && <div><span className="history-card-label">Treatment:</span>{rec.treatment}</div>}
                                {rec.prescription && <div><span className="history-card-label">Prescription:</span><code style={{ background: 'var(--bg-secondary)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{rec.prescription}</code></div>}
                                {rec.notes && <div><span className="history-card-label">Notes:</span>{rec.notes}</div>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Billing / Invoice tab */}
                    {activeTab === 'invoices' && (
                      <div className="history-card-list">
                        {patientHistory.invoices.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            No billing invoice records.
                          </p>
                        ) : (
                          patientHistory.invoices.map((inv) => (
                            <div className="history-card" key={inv.id}>
                              <div className="history-card-header">
                                <span className="history-card-title">{inv.description}</span>
                                <span className="history-card-date">Issued: {inv.invoiceDate}</span>
                              </div>
                              <div className="history-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span className="history-card-label" style={{ fontSize: '1rem' }}>Amount:</span>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-highlight)' }}>₹{inv.amount}</span>
                                </div>
                                <div>
                                  <span className={`badge ${inv.status.toLowerCase()}`}>{inv.status}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => setShowDetailModal(false)}>Close View</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
