import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  UserSquare, 
  Calendar, 
  Receipt, 
  PlusCircle, 
  UserPlus, 
  CalendarPlus, 
  FileText, 
  Activity 
} from 'lucide-react';

export default function Dashboard({ setView }) {
  const [stats, setStats] = useState({
    patientsCount: 0,
    doctorsCount: 0,
    appointmentsCount: 0,
    pendingInvoicesCount: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [patients, doctors, appointments, invoices] = await Promise.all([
          api.patients.list(),
          api.doctors.list(),
          api.appointments.list(),
          api.invoices.list()
        ]);

        setStats({
          patientsCount: patients.length,
          doctorsCount: doctors.length,
          appointmentsCount: appointments.length,
          pendingInvoicesCount: invoices.filter(inv => inv.status === 'PENDING').length,
        });

        // Filter and sort for future appointments
        const now = new Date();
        const sorted = appointments
          .filter(app => new Date(app.appointmentDateTime) >= now && app.status !== 'CANCELLED')
          .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
          .slice(0, 5);

        setUpcomingAppointments(sorted);
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
        setError("Failed to load dashboard data. Please ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && (
        <div className="alert-toast error" style={{ position: 'static', transform: 'none', maxWidth: 'none' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card patients">
          <div className="metric-info">
            <h3>Total Patients</h3>
            <div className="metric-number">{stats.patientsCount}</div>
          </div>
          <div className="metric-icon-wrapper">
            <Users size={24} />
          </div>
        </div>

        <div className="metric-card doctors">
          <div className="metric-info">
            <h3>Active Doctors</h3>
            <div className="metric-number">{stats.doctorsCount}</div>
          </div>
          <div className="metric-icon-wrapper">
            <UserSquare size={24} />
          </div>
        </div>

        <div className="metric-card appointments">
          <div className="metric-info">
            <h3>Scheduled Appointments</h3>
            <div className="metric-number">{stats.appointmentsCount}</div>
          </div>
          <div className="metric-icon-wrapper">
            <Calendar size={24} />
          </div>
        </div>

        <div className="metric-card invoices">
          <div className="metric-info">
            <h3>Unpaid Invoices</h3>
            <div className="metric-number">{stats.pendingInvoicesCount}</div>
          </div>
          <div className="metric-icon-wrapper">
            <Receipt size={24} />
          </div>
        </div>
      </div>

      {/* Dashboard Content split */}
      <div className="dashboard-actions-section">
        {/* Upcoming Appointments */}
        <div className="panel-card">
          <div className="panel-card-header">
            <h2>Upcoming Appointments</h2>
            <button className="secondary-btn" onClick={() => setView('appointments')}>View All</button>
          </div>
          <div className="table-responsive">
            {upcomingAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No upcoming appointments scheduled.
              </p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: '500' }}>{app.patient?.fullName}</td>
                      <td>Dr. {app.doctor?.fullName}</td>
                      <td>{formatDateTime(app.appointmentDateTime)}</td>
                      <td>
                        <span className={`badge ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel-card">
          <div className="panel-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
            <button className="action-btn action-btn-patients" onClick={() => setView('patients')} style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '1rem' }}>
              <div className="metric-icon-wrapper" style={{ minWidth: '40px', height: '40px', color: 'var(--color-secondary)', backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                <UserPlus size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Register Patient</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add new patient files</div>
              </div>
            </button>

            <button className="action-btn action-btn-appointments" onClick={() => setView('appointments')} style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '1rem' }}>
              <div className="metric-icon-wrapper" style={{ minWidth: '40px', height: '40px', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}>
                <CalendarPlus size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Schedule Appointment</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Book doctor time blocks</div>
              </div>
            </button>

            <button className="action-btn action-btn-invoices" onClick={() => setView('invoices')} style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '1rem' }}>
              <div className="metric-icon-wrapper" style={{ minWidth: '40px', height: '40px', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <FileText size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Generate Invoice</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Create billing records</div>
              </div>
            </button>

            <button className="action-btn action-btn-records" onClick={() => setView('medical-records')} style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '1rem' }}>
              <div className="metric-icon-wrapper" style={{ minWidth: '40px', height: '40px', color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)' }}>
                <Activity size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Add Medical Record</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log diagnoses & treatments</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
