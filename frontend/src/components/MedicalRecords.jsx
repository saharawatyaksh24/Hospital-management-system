import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  FileText, 
  User, 
  Stethoscope, 
  Calendar, 
  Trash2, 
  X, 
  Eye 
} from 'lucide-react';

export default function MedicalRecords({ triggerNotification }) {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals/Forms State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State
  const initialFormState = {
    patientId: '',
    doctorId: '',
    appointmentId: '',
    visitDate: new Date().toISOString().substring(0, 10),
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, patientsData, doctorsData] = await Promise.all([
        api.medicalRecords.list(),
        api.patients.list(),
        api.doctors.list()
      ]);
      setRecords(recordsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      triggerNotification('error', 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When patient selection changes during record creation, fetch their appointments
  useEffect(() => {
    if (formData.patientId) {
      loadPatientAppointments(formData.patientId);
    } else {
      setPatientAppointments([]);
    }
  }, [formData.patientId]);

  const loadPatientAppointments = async (patientId) => {
    setLoadingAppointments(true);
    try {
      const data = await api.appointments.listByPatient(patientId);
      // Only keep completed/scheduled appointments
      setPatientAppointments(data.filter(a => a.status !== 'CANCELLED'));
    } catch (err) {
      console.error("Error loading patient appointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      patientId: patients[0]?.id?.toString() || '',
      doctorId: doctors[0]?.id?.toString() || ''
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medical record? This action is irreversible.')) {
      try {
        await api.medicalRecords.delete(id);
        triggerNotification('success', 'Medical record deleted');
        loadData();
      } catch (err) {
        triggerNotification('error', 'Failed to delete medical record');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.patientId) return setFormError("Patient selection is required");
    if (!formData.doctorId) return setFormError("Attending doctor is required");
    if (!formData.visitDate) return setFormError("Visit date is required");
    if (!formData.diagnosis.trim()) return setFormError("Diagnosis is required");

    try {
      const payload = {
        patient: { id: parseInt(formData.patientId) },
        doctor: { id: parseInt(formData.doctorId) },
        appointment: formData.appointmentId ? { id: parseInt(formData.appointmentId) } : null,
        visitDate: formData.visitDate,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        prescription: formData.prescription,
        notes: formData.notes
      };

      await api.medicalRecords.create(payload);
      triggerNotification('success', 'Medical record logged successfully');
      setShowFormModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save medical record');
    }
  };

  const filteredRecords = records.filter(rec => 
    rec.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    rec.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
    rec.doctor?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Filters & Actions */}
      <div className="filters-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by patient, doctor, or diagnosis..." 
            className="search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenCreate}>
          <Plus size={18} />
          Create Medical Record
        </button>
      </div>

      {/* Main Records Table */}
      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading medical records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No medical charts logged yet.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Attending Doctor</th>
                  <th>Visit Date</th>
                  <th>Diagnosis Summary</th>
                  <th>Prescription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: '500', color: 'var(--text-highlight)' }}>{rec.patient?.fullName}</td>
                    <td>Dr. {rec.doctor?.fullName}</td>
                    <td>{rec.visitDate}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: '600' }}>{rec.diagnosis}</span>
                      {rec.treatment && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tx: {rec.treatment}</div>}
                    </td>
                    <td>
                      {rec.prescription ? (
                        <code style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {rec.prescription}
                        </code>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <div className="action-cell">
                        <button className="icon-btn" title="View Full Chart" onClick={() => handleOpenView(rec)}>
                          <Eye size={16} />
                        </button>
                        <button className="icon-btn delete" title="Delete Chart" onClick={() => handleDelete(rec.id)}>
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

      {/* Log New Medical Record Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Log Medical Record</h2>
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
                  <div className="form-group">
                    <label className="form-label">Select Patient *</label>
                    <select 
                      className="form-select"
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      required
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} (ID: {p.id})</option>
                      ))}
                      {patients.length === 0 && <option value="">No patients registered</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attending Doctor *</label>
                    <select 
                      className="form-select"
                      value={formData.doctorId}
                      onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                      required
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.fullName} ({d.specialization})</option>
                      ))}
                      {doctors.length === 0 && <option value="">No doctors available</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Link Appointment (Optional)</label>
                    <select 
                      className="form-select"
                      value={formData.appointmentId}
                      onChange={(e) => setFormData({...formData, appointmentId: e.target.value})}
                      disabled={loadingAppointments || patientAppointments.length === 0}
                    >
                      <option value="">-- No appointment linkage --</option>
                      {patientAppointments.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.reason.substring(0, 20)}... ({new Date(app.appointmentDateTime).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                    {patientAppointments.length === 0 && formData.patientId && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No active appointments found for this patient.</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visit Date *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.visitDate}
                      onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Diagnosis *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acute bronchitis, Type II Diabetes mellitus"
                      className="form-input" 
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Treatment Plan</label>
                    <textarea 
                      placeholder="Describe therapy, procedures, or lifestyle recommendations..."
                      className="form-textarea" 
                      value={formData.treatment}
                      onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Prescription (Meds & Dosage)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Amoxicillin 500mg (3x daily for 7 days)"
                      className="form-input" 
                      value={formData.prescription}
                      onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">General Clinical Notes</label>
                    <textarea 
                      placeholder="Additional vitals or symptoms details..."
                      className="form-textarea" 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Chart</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Medical Chart Modal */}
      {showViewModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="metric-icon-wrapper" style={{ width: '36px', height: '36px', color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>Medical Record Details</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Record ID: #{selectedRecord.id}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowViewModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="detail-header-card" style={{ gridTemplateColumns: '1fr 1fr', padding: '1rem' }}>
                <div className="detail-info-item">
                  <span className="detail-info-label">Patient</span>
                  <span className="detail-info-value">{selectedRecord.patient?.fullName}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Attending Doctor</span>
                  <span className="detail-info-value">Dr. {selectedRecord.doctor?.fullName}</span>
                </div>
                <div className="detail-info-item" style={{ marginTop: '0.5rem' }}>
                  <span className="detail-info-label">Visit Date</span>
                  <span className="detail-info-value" style={{ fontWeight: 'normal' }}>{selectedRecord.visitDate}</span>
                </div>
                <div className="detail-info-item" style={{ marginTop: '0.5rem' }}>
                  <span className="detail-info-label">Blood Group</span>
                  <span className="detail-info-value" style={{ color: 'var(--danger)' }}>{selectedRecord.patient?.bloodGroup || '-'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="history-card" style={{ background: 'var(--bg-primary)' }}>
                  <span className="detail-info-label" style={{ marginBottom: '0.2rem' }}>Diagnosis</span>
                  <p style={{ fontWeight: '600', color: 'var(--text-highlight)' }}>{selectedRecord.diagnosis}</p>
                </div>

                {selectedRecord.treatment && (
                  <div className="history-card" style={{ background: 'var(--bg-primary)' }}>
                    <span className="detail-info-label" style={{ marginBottom: '0.2rem' }}>Treatment Plan</span>
                    <p style={{ color: 'var(--text-main)' }}>{selectedRecord.treatment}</p>
                  </div>
                )}

                {selectedRecord.prescription && (
                  <div className="history-card" style={{ background: 'var(--bg-primary)' }}>
                    <span className="detail-info-label" style={{ marginBottom: '0.2rem' }}>Prescriptions</span>
                    <code style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '6px', color: 'var(--color-secondary)', display: 'block', fontSize: '0.9rem' }}>
                      {selectedRecord.prescription}
                    </code>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div className="history-card" style={{ background: 'var(--bg-primary)' }}>
                    <span className="detail-info-label" style={{ marginBottom: '0.2rem' }}>Clinical Notes</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => setShowViewModal(false)}>Close View</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
