import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FlightSearchPage from './pages/FlightSearchPage';
import TestLandingPage from './pages/TestLandingPage';
import FlightResultsPage from './pages/FlightResultsPage';
import BookingPage from './pages/BookingPage';
import TicketPage from './pages/TicketPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import ReportsPage from './pages/ReportsPage';
import PassengerReportsPage from './pages/PassengerReportsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import EmployeeManagementPage from './pages/admin/EmployeeManagementPage';
import AircraftManagementPage from './pages/admin/AircraftManagementPage';
import FlightCrewSchedulingPage from './pages/admin/FlightCrewSchedulingPage';
import AttendancePage from './pages/admin/AttendancePage';
import DutyReportPage from './pages/admin/DutyReportPage';

function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/search"          element={<FlightSearchPage />} />
          <Route path="/testLandingPage" element={<TestLandingPage />} />
          <Route path="/flights"         element={<FlightResultsPage />} />
          <Route path="/"         element={<Navigate to="/testLandingPage" replace />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/book/:flightId"        element={<BookingPage />} />
            <Route path="/ticket/:bookingId"     element={<TicketPage />} />
            <Route path="/my-bookings"           element={<MyBookingsPage />} />
            <Route path="/my-reports"            element={<PassengerReportsPage />} />
            <Route path="/profile"               element={<ProfilePage />} />
            <Route path="/reports"               element={<ReportsPage />} />

            {/* Admin / Staff module routes — sidebar layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index                    element={<AdminDashboardPage />} />
              <Route path="employees"         element={<EmployeeManagementPage />} />
              <Route path="aircraft"          element={<AircraftManagementPage />} />
              <Route path="scheduling"        element={<FlightCrewSchedulingPage />} />
              <Route path="attendance"        element={<AttendancePage />} />
              <Route path="duty-reports"      element={<DutyReportPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/testLandingPage" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
