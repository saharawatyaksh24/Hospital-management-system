import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Doctors from './components/Doctors';
import Appointments from './components/Appointments';
import MedicalRecords from './components/MedicalRecords';
import Invoices from './components/Invoices';

import { 
  LayoutDashboard, 
  Users, 
  UserSquare, 
  Calendar, 
  Activity, 
  Receipt, 
  HeartPulse,
  BellRing
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const getHeaderTitle = () => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'patients': return 'Patient Records';
      case 'doctors': return 'Clinical Staff (Doctors)';
      case 'appointments': return 'Appointment Schedule';
      case 'medical-records': return 'Medical Charts';
      case 'invoices': return 'Billing & Invoices';
      default: return 'Hospital Management System';
    }
  };

  const getHeaderSubtitle = () => {
    switch (view) {
      case 'dashboard': return 'Overview of hospital operations and quick metrics.';
      case 'patients': return 'Manage patient files, registration details, and histories.';
      case 'doctors': return 'Directory of specialized doctors and calendar tracking.';
      case 'appointments': return 'Book consultation appointments and check doctor slots.';
      case 'medical-records': return 'Record clinical diagnostics, prescription charts, and notes.';
      case 'invoices': return 'Manage patient billing details, invoice creations, and status payouts.';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Alert */}
      {notification && (
        <div className={`alert-toast ${notification.type}`}>
          <BellRing size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <HeartPulse className="sidebar-logo-icon" size={24} />
          <span className="sidebar-brand-text">MedFlow HMS</span>
        </div>

        <nav className="sidebar-menu">
          <a 
            className={`sidebar-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <LayoutDashboard className="sidebar-item-icon" size={18} />
            <span>Dashboard</span>
          </a>

          <a 
            className={`sidebar-item ${view === 'patients' ? 'active' : ''}`}
            onClick={() => setView('patients')}
          >
            <Users className="sidebar-item-icon" size={18} />
            <span>Patients</span>
          </a>

          <a 
            className={`sidebar-item ${view === 'doctors' ? 'active' : ''}`}
            onClick={() => setView('doctors')}
          >
            <UserSquare className="sidebar-item-icon" size={18} />
            <span>Doctors</span>
          </a>

          <a 
            className={`sidebar-item ${view === 'appointments' ? 'active' : ''}`}
            onClick={() => setView('appointments')}
          >
            <Calendar className="sidebar-item-icon" size={18} />
            <span>Appointments</span>
          </a>

          <a 
            className={`sidebar-item ${view === 'medical-records' ? 'active' : ''}`}
            onClick={() => setView('medical-records')}
          >
            <Activity className="sidebar-item-icon" size={18} />
            <span>Medical Records</span>
          </a>

          <a 
            className={`sidebar-item ${view === 'invoices' ? 'active' : ''}`}
            onClick={() => setView('invoices')}
          >
            <Receipt className="sidebar-item-icon" size={18} />
            <span>Billing & Invoices</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 MedFlow Inc.</p>
          <p style={{ marginTop: '0.2rem', color: 'var(--color-secondary)' }}>System Connected</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="app-header">
          <div className="header-title-section">
            <h1>{getHeaderTitle()}</h1>
            <p>{getHeaderSubtitle()}</p>
          </div>
          <div className="header-profile">
            <div className="system-status">
              <span className="status-dot"></span>
              <span>LIVE SERVER</span>
            </div>
          </div>
        </header>

        {/* View Routing */}
        <section style={{ animation: 'fadeIn 0.4s ease' }}>
          {view === 'dashboard' && <Dashboard setView={setView} />}
          {view === 'patients' && <Patients triggerNotification={triggerNotification} />}
          {view === 'doctors' && <Doctors triggerNotification={triggerNotification} />}
          {view === 'appointments' && <Appointments triggerNotification={triggerNotification} />}
          {view === 'medical-records' && <MedicalRecords triggerNotification={triggerNotification} />}
          {view === 'invoices' && <Invoices triggerNotification={triggerNotification} />}
        </section>
      </main>
    </div>
  );
}
