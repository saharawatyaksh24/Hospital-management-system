import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Check, 
  X, 
  Trash2, 
  Edit 
} from 'lucide-react';

export default function Appointments({ triggerNotification }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals/Forms State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Calendar search state
  const [calendarDoctorId, setCalendarDoctorId] = useState('');
  const [calendarDate, setCalendarDate] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Form State
  const initialFormState = {
    patientId: '',
    doctorId: '',
    appointmentDateTime: '',
    reason: '',
    notes: '',
    status: 'SCHEDULED'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        api.appointments.list(),
        api.patients.list(),
        api.doctors.list()
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      triggerNotification('error', 'Failed to load appointments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    if (patients.length > 0) initialFormState.patientId = patients[0].id.toString();
    if (doctors.length > 0) initialFormState.doctorId = doctors[0].id.toString();
    setFormData({
      ...initialFormState,
      patientId: patients[0]?.id?.toString() || '',
      doctorId: doctors[0]?.id?.toString() || ''
    });
    setIsEditing(false);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (app) => {
    // Format LocalDateTime string to datetime-local format (YYYY-MM-DDTHH:MM)
    let formattedDateTime = '';
    if (app.appointmentDateTime) {
      formattedDateTime = app.appointmentDateTime.substring(0, 16);
    }

    setFormData({
      id: app.id,
      patientId: app.patient?.id?.toString() || '',
      doctorId: app.doctor?.id?.toString() || '',
      appointmentDateTime: formattedDateTime,
      reason: app.reason || '',
      notes: app.notes || '',
      status: app.status || 'SCHEDULED'
    });
    setIsEditing(true);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const appToCancel = appointments.find(a => a.id === id);
        if (appToCancel) {
          const updated = {
            ...appToCancel,
            patient: { id: appToCancel.patient.id },
            doctor: { id: appToCancel.doctor.id },
            status: 'CANCELLED'
          };
          await api.appointments.update(id, updated);
          triggerNotification('success', 'Appointment cancelled');
          loadData();
        }
      } catch (err) {
        triggerNotification('error', err.message || 'Failed to cancel appointment');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment completely?')) {
      try {
        await api.appointments.delete(id);
        triggerNotification('success', 'Appointment deleted');
        loadData();
      } catch (err) {
        triggerNotification('error', 'Failed to delete appointment');
      }
    }
  };

  const handleUpdateStatus = async (app, newStatus) => {
    try {
      const updated = {
        ...app,
        patient: { id: app.patient.id },
        doctor: { id: app.doctor.id },
        status: newStatus
      };
      await api.appointments.update(app.id, updated);
      triggerNotification('success', `Appointment marked as ${newStatus}`);
      loadData();
    } catch (err) {
      triggerNotification('error', err.message || 'Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.patientId) return setFormError("Patient is required");
    if (!formData.doctorId) return setFormError("Doctor is required");
    if (!formData.appointmentDateTime) return setFormError("Date and Time is required");
    if (!formData.reason.trim()) return setFormError("Reason is required");

    // Validations: Future slot checks are run on the backend and we catch the error
    try {
      const payload = {
        patient: { id: parseInt(formData.patientId) },
        doctor: { id: parseInt(formData.doctorId) },
        appointmentDateTime: formData.appointmentDateTime,
        reason: formData.reason,
        notes: formData.notes,
        status: formData.status
      };

      if (isEditing) {
        await api.appointments.update(formData.id, payload);
        triggerNotification('success', 'Appointment rescheduled successfully');
      } else {
        await api.appointments.create(payload);
        triggerNotification('success', 'Appointment scheduled successfully');
      }
      setShowFormModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save appointment');
    }
  };

  const handleLookupCalendar = async (e) => {
    e.preventDefault();
    if (!calendarDoctorId || !calendarDate) return;
    setLoadingCalendar(true);
    try {
      const events = await api.appointments.getCalendar(calendarDoctorId, calendarDate);
      setCalendarEvents(events);
    } catch (err) {
      triggerNotification('error', 'Failed to query doctor calendar');
    } finally {
      setLoadingCalendar(false);
    }
  };

  const handleOpenCalendar = () => {
    setCalendarEvents([]);
    if (doctors.length > 0) setCalendarDoctorId(doctors[0].id.toString());
    setCalendarDate(new Date().toISOString().substring(0, 10));
    setShowCalendarModal(true);
  };

  const filteredAppointments = appointments.filter(app => 
    app.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    app.doctor?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    app.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTimeOnly = (dateTimeStr) => {
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
            placeholder="Search by patient name, doctor name, reason..." 
            className="search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-btn" onClick={handleOpenCalendar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} />
            Check Availability
          </button>
          <button className="primary-btn" onClick={handleOpenCreate}>
            <Plus size={18} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Main Appointments Table */}
      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No appointments scheduled.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: '500', color: 'var(--text-highlight)' }}>{app.patient?.fullName}</td>
                    <td>Dr. {app.doctor?.fullName}</td>
                    <td>{formatDateTime(app.appointmentDateTime)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{app.reason}</span>
                        {app.notes && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Note: {app.notes}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        {app.status === 'SCHEDULED' && (
                          <>
                            <button className="icon-btn" title="Mark Completed" onClick={() => handleUpdateStatus(app, 'COMPLETED')} style={{ color: 'var(--success)', background: 'var(--success-glow)' }}>
                              <Check size={14} />
                            </button>
                            <button className="icon-btn" title="Cancel Appointment" onClick={() => handleCancelAppointment(app.id)} style={{ color: 'var(--danger)', background: 'var(--danger-glow)' }}>
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button className="icon-btn" title="Reschedule" onClick={() => handleOpenEdit(app)}>
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(app.id)}>
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

      {/* Book / Edit Appointment Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Reschedule Appointment' : 'Book New Appointment'}</h2>
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
                      disabled={isEditing}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} (ID: {p.id})</option>
                      ))}
                      {patients.length === 0 && <option value="">No patients registered</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Doctor *</label>
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
                    <label className="form-label">Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      className="form-input" 
                      value={formData.appointmentDateTime}
                      onChange={(e) => setFormData({...formData, appointmentDateTime: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Appointment Status</label>
                    <select 
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Reason for Visit *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Regular health checkup, cardiovascular scan"
                      className="form-input" 
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Clinical Notes</label>
                    <textarea 
                      placeholder="Describe symptoms or instructions..."
                      className="form-textarea" 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">{isEditing ? 'Confirm Changes' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Doctor Availability Modal */}
      {showCalendarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Doctor Calendar Availability</h2>
              <button className="modal-close-btn" onClick={() => setShowCalendarModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleLookupCalendar} className="calendar-search-box">
                <div className="form-group" style={{ flexGrow: 1, minWidth: '200px', marginBottom: 0 }}>
                  <label className="form-label">Doctor</label>
                  <select 
                    className="form-select"
                    value={calendarDoctorId}
                    onChange={(e) => setCalendarDoctorId(e.target.value)}
                    required
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={calendarDate}
                    onChange={(e) => setCalendarDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-end', height: '38px' }}>
                  Query
                </button>
              </form>

              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-highlight)', marginBottom: '0.75rem' }}>Blocked Schedule Blocks</h3>
                
                {loadingCalendar ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading schedule...</p>
                ) : calendarEvents.length === 0 ? (
                  <p style={{ color: 'var(--success)', textAlign: 'center', padding: '1.5rem', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    No appointments on this day. The doctor is fully available!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {calendarEvents.map(event => (
                      <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--text-highlight)' }}>Time Slot: </span>
                          <span style={{ color: 'var(--color-secondary)' }}>{formatTimeOnly(event.appointmentDateTime)}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          Status: <span style={{ fontWeight: '600' }} className={event.status === 'CANCELLED' ? 'badge cancelled' : 'badge scheduled'}>{event.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => setShowCalendarModal(false)}>Close Lookup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
