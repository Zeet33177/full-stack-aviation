import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ha_token');
      localStorage.removeItem('ha_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)                 => api.post('/auth/register', data),
  login:          (data)                 => api.post('/auth/login',    data),
  forgotPassword: (email)                => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, newPassword)   => api.post('/auth/reset-password',  { token, newPassword }),
};

// ── Flights ─────────────────────────────────────────────────
export const flightAPI = {
  search:  (origin, destination, date) =>
    api.get('/flights/search', { params: { origin, destination, date } }),
  getById: (id) => api.get(`/flights/${id}`),
  getAll:  ()   => api.get('/flights'),
  seatMap: (id) => api.get(`/flights/${id}/seatmap`),
};

// ── Bookings ─────────────────────────────────────────────────
export const bookingAPI = {
  create:    (data)      => api.post('/bookings',                  data),
  getAll:    ()          => api.get('/bookings'),
  getById:   (id)        => api.get(`/bookings/${id}`),
  getByRef:  (ref)       => api.get(`/bookings/reference/${ref}`),
  cancel:    (id)        => api.put(`/bookings/${id}/cancel`),
};

// ── Payments ─────────────────────────────────────────────────
export const paymentAPI = {
  process: (bookingId, data) => api.post(`/payments/booking/${bookingId}`, data),
  get:     (bookingId)       => api.get(`/payments/booking/${bookingId}`),
};

// ── Tickets ──────────────────────────────────────────────────
export const ticketAPI = {
  generate:       (bookingId)    => api.post(`/tickets/booking/${bookingId}/generate`),
  getByBooking:   (bookingId)    => api.get(`/tickets/booking/${bookingId}`),
  getByNumber:    (ticketNumber) => api.get(`/tickets/${ticketNumber}`),
};

// ── Profile ──────────────────────────────────────────────────
export const profileAPI = {
  get:    ()     => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// ── Reports ──────────────────────────────────────────────
export const reportAPI = {
  getFullReport: () => api.get('/reports'),
};

// ── Admin: Employees ─────────────────────────────────
export const adminEmployeeAPI = {
  getAll:  ()         => api.get('/admin/employees'),
  getById: (id)       => api.get(`/admin/employees/${id}`),
  create:  (data)     => api.post('/admin/employees', data),
  update:  (id, data) => api.put(`/admin/employees/${id}`, data),
  remove:  (id)       => api.delete(`/admin/employees/${id}`),
};

// ── Admin: Aircraft ──────────────────────────────────
export const adminAircraftAPI = {
  getAll:  ()         => api.get('/admin/aircraft'),
  getById: (id)       => api.get(`/admin/aircraft/${id}`),
  create:  (data)     => api.post('/admin/aircraft', data),
  update:  (id, data) => api.put(`/admin/aircraft/${id}`, data),
  remove:  (id)       => api.delete(`/admin/aircraft/${id}`),
};

// ── Admin: Flights ───────────────────────────────────
export const adminFlightAPI = {
  getAll:  ()     => api.get('/admin/flights'),
  create:  (data) => api.post('/admin/flights', data),
  cancel:  (id)   => api.put(`/admin/flights/${id}/cancel`),
  remove:  (id)   => api.delete(`/admin/flights/${id}`),
};

// ── Crew Scheduling ──────────────────────────────────
export const crewAPI = {
  getByFlight:   (flightId) => api.get(`/admin/crew-schedule/flight/${flightId}`),
  getByEmployee: (empId)    => api.get(`/admin/crew-schedule/employee/${empId}`),
  assign:        (data)     => api.post('/admin/crew-schedule', data),
  unassign:      (id)       => api.delete(`/admin/crew-schedule/${id}`),
};

// ── Attendance ───────────────────────────────────────
export const attendanceAPI = {
  checkIn:         ()      => api.post('/staff/attendance/check-in'),
  checkOut:        ()      => api.put('/staff/attendance/check-out'),
  getMyAttendance: ()      => api.get('/staff/attendance/me'),
  getAll:          ()      => api.get('/admin/attendance'),
  getAllByDate:     (date)  => api.get(`/admin/attendance/date/${date}`),
  getAllByEmployee: (empId) => api.get(`/admin/attendance/employee/${empId}`),
  adminMark:       (data)  => api.post('/admin/attendance', data),
};

// ── Duty Reports ─────────────────────────────────────
export const dutyReportAPI = {
  submitMy:      (data)  => api.post('/staff/duty-reports', data),
  getMyReports:  ()      => api.get('/staff/duty-reports/me'),
  getAll:        ()      => api.get('/admin/duty-reports'),
  getByEmployee: (empId) => api.get(`/admin/duty-reports/employee/${empId}`),
  adminCreate:   (data)  => api.post('/admin/duty-reports', data),
};

export default api;
