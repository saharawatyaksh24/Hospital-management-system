const BASE_URL = '/api';

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`HTTP error ${response.status}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || `HTTP error ${response.status}`);
  }

  return data.data; // Return the inner data object
};

export const api = {
  // Patients
  patients: {
    list: () => fetch(`${BASE_URL}/patients`).then(handleResponse),
    get: (id) => fetch(`${BASE_URL}/patients/${id}`).then(handleResponse),
    create: (patient) =>
      fetch(`${BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      }).then(handleResponse),
    update: (id, patient) =>
      fetch(`${BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${BASE_URL}/patients/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
  },

  // Doctors
  doctors: {
    list: () => fetch(`${BASE_URL}/doctors`).then(handleResponse),
    get: (id) => fetch(`${BASE_URL}/doctors/${id}`).then(handleResponse),
    create: (doctor) =>
      fetch(`${BASE_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor),
      }).then(handleResponse),
    update: (id, doctor) =>
      fetch(`${BASE_URL}/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${BASE_URL}/doctors/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
    getDashboard: (id) => fetch(`${BASE_URL}/doctors/${id}/dashboard`).then(handleResponse),
  },

  // Appointments
  appointments: {
    list: () => fetch(`${BASE_URL}/appointments`).then(handleResponse),
    get: (id) => fetch(`${BASE_URL}/appointments/${id}`).then(handleResponse),
    create: (appointment) =>
      fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      }).then(handleResponse),
    update: (id, appointment) =>
      fetch(`${BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
    getCalendar: (doctorId, date) =>
      fetch(`${BASE_URL}/appointments/calendar?doctorId=${doctorId}&date=${date}`).then(handleResponse),
    listByPatient: (patientId) => fetch(`${BASE_URL}/appointments/patient/${patientId}`).then(handleResponse),
  },

  // Medical Records
  medicalRecords: {
    list: () => fetch(`${BASE_URL}/medical-records`).then(handleResponse),
    get: (id) => fetch(`${BASE_URL}/medical-records/${id}`).then(handleResponse),
    create: (record) =>
      fetch(`${BASE_URL}/medical-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).then(handleResponse),
    update: (id, record) =>
      fetch(`${BASE_URL}/medical-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${BASE_URL}/medical-records/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
    listByPatient: (patientId) => fetch(`${BASE_URL}/medical-records/patient/${patientId}`).then(handleResponse),
  },

  // Invoices
  invoices: {
    list: () => fetch(`${BASE_URL}/invoices`).then(handleResponse),
    get: (id) => fetch(`${BASE_URL}/invoices/${id}`).then(handleResponse),
    create: (invoice) =>
      fetch(`${BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      }).then(handleResponse),
    update: (id, invoice) =>
      fetch(`${BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      }).then(handleResponse),
    updateStatus: (id, status) =>
      fetch(`${BASE_URL}/invoices/${id}/status?status=${status}`, {
        method: 'PATCH',
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
      }).then(handleResponse),
    listByPatient: (patientId) => fetch(`${BASE_URL}/invoices/patient/${patientId}`).then(handleResponse),
  },
};
