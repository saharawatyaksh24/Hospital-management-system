import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  X, 
  Check, 
  Trash2 
} from 'lucide-react';

export default function Invoices({ triggerNotification }) {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals/Forms State
  const [showFormModal, setShowFormModal] = useState(false);
  const [financials, setFinancials] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0
  });

  // Form State
  const initialFormState = {
    patientId: '',
    appointmentId: '',
    description: '',
    amount: '',
    invoiceDate: new Date().toISOString().substring(0, 10),
    status: 'PENDING'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, patientsData] = await Promise.all([
        api.invoices.list(),
        api.patients.list()
      ]);
      setInvoices(invoicesData);
      setPatients(patientsData);
      calculateFinancials(invoicesData);
    } catch (err) {
      triggerNotification('error', 'Failed to load billing invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When patient selection changes during invoice creation, load appointments
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
      setPatientAppointments(data.filter(a => a.status !== 'CANCELLED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const calculateFinancials = (data) => {
    let billed = 0;
    let paid = 0;
    let pending = 0;

    data.forEach(inv => {
      const amt = parseFloat(inv.amount) || 0;
      billed += amt;
      if (inv.status === 'PAID') {
        paid += amt;
      } else if (inv.status === 'PENDING') {
        pending += amt;
      }
    });

    setFinancials({
      totalBilled: billed.toFixed(2),
      totalPaid: paid.toFixed(2),
      totalPending: pending.toFixed(2)
    });
  };

  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      patientId: patients[0]?.id?.toString() || ''
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.invoices.updateStatus(id, newStatus);
      triggerNotification('success', `Invoice marked as ${newStatus}`);
      loadData();
    } catch (err) {
      triggerNotification('error', err.message || 'Failed to update invoice status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.invoices.delete(id);
        triggerNotification('success', 'Invoice deleted successfully');
        loadData();
      } catch (err) {
        triggerNotification('error', 'Failed to delete invoice');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.patientId) return setFormError("Patient is required");
    if (!formData.description.trim()) return setFormError("Description is required");
    if (!formData.amount || parseFloat(formData.amount) <= 0) return setFormError("Amount must be greater than zero");
    if (!formData.invoiceDate) return setFormError("Invoice date is required");

    try {
      const payload = {
        patient: { id: parseInt(formData.patientId) },
        appointment: formData.appointmentId ? { id: parseInt(formData.appointmentId) } : null,
        description: formData.description,
        amount: parseFloat(formData.amount),
        invoiceDate: formData.invoiceDate,
        status: formData.status
      };

      await api.invoices.create(payload);
      triggerNotification('success', 'Billing invoice generated successfully');
      setShowFormModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to generate invoice');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Financials Overview Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="metric-card invoices" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)' }}>
          <div className="metric-info">
            <h3>Total Collections</h3>
            <div className="metric-number" style={{ color: 'var(--success)' }}>₹{financials.totalPaid}</div>
          </div>
          <div className="metric-icon-wrapper" style={{ color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="metric-card appointments" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)' }}>
          <div className="metric-info">
            <h3>Outstanding Bills</h3>
            <div className="metric-number" style={{ color: 'var(--warning)' }}>₹{financials.totalPending}</div>
          </div>
          <div className="metric-icon-wrapper" style={{ color: 'var(--warning)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="metric-card patients" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)' }}>
          <div className="metric-info">
            <h3>Total Invoiced</h3>
            <div className="metric-number" style={{ color: 'var(--color-primary)' }}>₹{financials.totalBilled}</div>
          </div>
          <div className="metric-icon-wrapper" style={{ color: 'var(--color-primary)' }}>
            <Receipt size={24} />
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="filters-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search invoices by patient name or description..." 
            className="search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenCreate}>
          <Plus size={18} />
          Generate Invoice
        </button>
      </div>

      {/* Main Invoices Table */}
      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No billing invoices generated.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice Date</th>
                  <th>Patient</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoiceDate}</td>
                    <td style={{ fontWeight: '500', color: 'var(--text-highlight)' }}>{inv.patient?.fullName}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{inv.description}</span>
                        {inv.appointment && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Linked Visit: {new Date(inv.appointment.appointmentDateTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-highlight)' }}>₹{inv.amount}</td>
                    <td>
                      <span className={`badge ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        {inv.status === 'PENDING' && (
                          <>
                            <button className="icon-btn" title="Mark Paid" onClick={() => handleUpdateStatus(inv.id, 'PAID')} style={{ color: 'var(--success)', background: 'var(--success-glow)' }}>
                              <Check size={14} />
                            </button>
                            <button className="icon-btn" title="Cancel Invoice" onClick={() => handleUpdateStatus(inv.id, 'CANCELLED')} style={{ color: 'var(--danger)', background: 'var(--danger-glow)' }}>
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {inv.status === 'CANCELLED' && (
                          <button className="icon-btn" title="Revert to Pending" onClick={() => handleUpdateStatus(inv.id, 'PENDING')} style={{ color: 'var(--pending)', background: 'var(--pending-glow)' }}>
                            <AlertCircle size={14} />
                          </button>
                        )}
                        <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(inv.id)}>
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

      {/* Generate Invoice Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Generate New Invoice</h2>
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
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount (INR) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="form-input" 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Invoice Date *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select 
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="PENDING">Pending Payment</option>
                      <option value="PAID">Paid</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Invoice Description *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Consult fee, blood panel lab tests, MRI chest scan"
                      className="form-input" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
