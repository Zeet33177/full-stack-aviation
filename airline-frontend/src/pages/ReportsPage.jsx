import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reportAPI } from '../api/axios';
import { FaPlane, FaRupeeSign, FaClipboardList, FaTimesCircle, FaPlaneDeparture, FaMoneyBillWave, FaUsers, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const TABS = [
  { id: 'flights',       icon: FaPlane,          label: 'Flights' },
  { id: 'revenue',       icon: FaRupeeSign,      label: 'Revenue' },
  { id: 'reservations',  icon: FaClipboardList,  label: 'Reservations' },
  { id: 'cancellations', icon: FaTimesCircle,    label: 'Cancellations' },
  { id: 'aircraft',      icon: FaPlaneDeparture, label: 'Aircraft' },
  { id: 'salary',        icon: FaMoneyBillWave,  label: 'Salary' },
  { id: 'employees',     icon: FaUsers,          label: 'Employees' },
];

function StatCard({ label, value, sub, color }) {
  return (
    <div className="report-stat-card" style={{ borderTopColor: color }}>
      <div className="report-stat-value" style={{ color }}>{value}</div>
      <div className="report-stat-label">{label}</div>
      {sub && <div className="report-stat-sub">{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="report-bar-row">
      <span className="report-bar-label">{label}</span>
      <div className="report-bar-track">
        <div className="report-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="report-bar-count">{value}</span>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('flights');
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    reportAPI.getFullReport()
      .then(({ data }) => setReport(data.data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen">Generating reports…</div>;
  if (!report)  return <div className="loading-screen error">Could not load report data.</div>;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
  const fmtCurr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reports &amp; Analytics</h1>
        <span className="report-generated">Generated: {report.generatedAt}</span>
      </div>

      {/* Tab bar */}
      <div className="report-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`report-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {(() => { const Icon = t.icon; return <Icon style={{ verticalAlign: 'middle', marginRight: '6px' }} />; })()}{t.label}
          </button>
        ))}
      </div>

      <div className="report-content">

        {/* ── FLIGHTS ─────────────────────────────────────────── */}
        {activeTab === 'flights' && (
          <div>
            <h2 className="report-section-title">Flight Report</h2>
            <div className="report-stats-grid">
              <StatCard label="Total Flights"     value={fmt(report.totalFlights)}     color="var(--primary)" />
              <StatCard label="Scheduled"         value={fmt(report.scheduledFlights)} color="#16a34a" />
              <StatCard label="Delayed"           value={fmt(report.delayedFlights)}   color="#d97706" />
              <StatCard label="Cancelled"         value={fmt(report.cancelledFlights)} color="#dc2626" />
              <StatCard label="Completed"         value={fmt(report.completedFlights)} color="#7c3aed" />
            </div>

            <h3 className="report-sub-title">Flights by Status</h3>
            <div className="report-bars">
              <BarRow label="Scheduled" value={report.scheduledFlights} max={report.totalFlights} color="#16a34a" />
              <BarRow label="Delayed"   value={report.delayedFlights}   max={report.totalFlights} color="#d97706" />
              <BarRow label="Cancelled" value={report.cancelledFlights} max={report.totalFlights} color="#dc2626" />
              <BarRow label="Completed" value={report.completedFlights} max={report.totalFlights} color="#7c3aed" />
            </div>

            <h3 className="report-sub-title">Active Routes</h3>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead><tr><th>#</th><th>Route</th><th>Flights</th></tr></thead>
                <tbody>
                  {Object.entries(report.topRoutes || {}).map(([route, count], i) => (
                    <tr key={route}>
                      <td>{i + 1}</td>
                      <td>{route}</td>
                      <td><span className="badge-blue">{count}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REVENUE ─────────────────────────────────────────── */}
        {activeTab === 'revenue' && (
          <div>
            <h2 className="report-section-title">Revenue Report</h2>
            <div className="report-stats-grid">
              <StatCard label="Total Revenue"      value={fmtCurr(report.totalRevenue)}      color="#16a34a" sub="All time" />
              <StatCard label="Avg Ticket Price"   value={fmtCurr(report.averageTicketPrice)} color="var(--primary)" sub="Per confirmed booking" />
              <StatCard label="Confirmed Bookings" value={fmt(report.confirmedBookings)}      color="#7c3aed" sub="Revenue-generating" />
              <StatCard label="Total Bookings"     value={fmt(report.totalBookings)}          color="#d97706" />
            </div>

            <h3 className="report-sub-title">Booking Revenue Breakdown</h3>
            <div className="report-revenue-breakdown">
              <div className="revenue-row">
                <span>Confirmed bookings contribute</span>
                <strong className="text-green">{fmtCurr(report.totalRevenue)}</strong>
              </div>
              <div className="revenue-row">
                <span>Cancelled / Refunded</span>
                <strong className="text-red">{fmt(report.cancelledBookings)} bookings</strong>
              </div>
              <div className="revenue-row">
                <span>Pending payments</span>
                <strong className="text-orange">{fmt(report.pendingBookings)} bookings</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── RESERVATIONS ────────────────────────────────────── */}
        {activeTab === 'reservations' && (
          <div>
            <h2 className="report-section-title">Reservations Report</h2>
            <div className="report-stats-grid">
              <StatCard label="Total Bookings"   value={fmt(report.totalBookings)}     color="var(--primary)" />
              <StatCard label="Confirmed"        value={fmt(report.confirmedBookings)} color="#16a34a" />
              <StatCard label="Pending"          value={fmt(report.pendingBookings)}   color="#d97706" />
              <StatCard label="Completed"        value={fmt(report.completedBookings)} color="#7c3aed" />
            </div>

            <h3 className="report-sub-title">Bookings by Status</h3>
            <div className="report-bars">
              <BarRow label="Confirmed"  value={report.confirmedBookings} max={report.totalBookings} color="#16a34a" />
              <BarRow label="Pending"    value={report.pendingBookings}   max={report.totalBookings} color="#d97706" />
              <BarRow label="Completed"  value={report.completedBookings} max={report.totalBookings} color="#7c3aed" />
              <BarRow label="Cancelled"  value={report.cancelledBookings} max={report.totalBookings} color="#dc2626" />
            </div>
          </div>
        )}

        {/* ── CANCELLATIONS ───────────────────────────────────── */}
        {activeTab === 'cancellations' && (
          <div>
            <h2 className="report-section-title">Cancellation Report</h2>
            <div className="report-stats-grid">
              <StatCard label="Cancelled Bookings" value={fmt(report.cancelledBookings)}         color="#dc2626" />
              <StatCard label="Cancellation Rate"  value={`${report.cancellationRate}%`}         color="#d97706" sub="Of total bookings" />
              <StatCard label="Total Bookings"     value={fmt(report.totalBookings)}              color="var(--primary)" />
              <StatCard label="Active Bookings"    value={fmt(report.confirmedBookings + report.pendingBookings)} color="#16a34a" sub="Confirmed + Pending" />
            </div>

            <h3 className="report-sub-title">Cancellation vs Active</h3>
            <div className="report-bars">
              <BarRow label="Cancelled" value={report.cancelledBookings}                              max={report.totalBookings} color="#dc2626" />
              <BarRow label="Active"    value={report.confirmedBookings + report.pendingBookings}      max={report.totalBookings} color="#16a34a" />
              <BarRow label="Completed" value={report.completedBookings}                              max={report.totalBookings} color="#7c3aed" />
            </div>

            <div className="report-note">
              {report.cancellationRate > 20
                ? <><FaExclamationTriangle style={{ verticalAlign: 'middle' }} /> Cancellation rate is above 20%. Consider reviewing booking policies.</>
                : <><FaCheckCircle style={{ verticalAlign: 'middle' }} /> Cancellation rate is within acceptable range.</>}
            </div>
          </div>
        )}

        {/* ── AIRCRAFT ────────────────────────────────────────── */}
        {activeTab === 'aircraft' && (
          <div>
            <h2 className="report-section-title">Aircraft Report</h2>
            <div className="report-stats-grid">
              <StatCard label="Total Fleet"    value={fmt(report.totalAircraft)}  color="var(--primary)" />
              <StatCard label="Active"         value={fmt(report.activeAircraft)} color="#16a34a" />
              <StatCard label="Under Maintenance / Retired"
                value={fmt(report.totalAircraft - report.activeAircraft)}         color="#d97706" />
            </div>

            <h3 className="report-sub-title">Fleet Details</h3>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Reg No.</th><th>Model</th><th>Manufacturer</th>
                    <th>Total Seats</th><th>Economy</th><th>Business</th>
                    <th>First Class</th><th>Year</th><th>Flights</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.aircraftList || []).map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.registrationNumber}</strong></td>
                      <td>{a.model}</td>
                      <td>{a.manufacturer}</td>
                      <td>{a.totalSeats}</td>
                      <td>{a.economySeats}</td>
                      <td>{a.businessSeats}</td>
                      <td>{a.firstClassSeats}</td>
                      <td>{a.yearOfManufacture}</td>
                      <td><span className="badge-blue">{a.assignedFlights}</span></td>
                      <td>
                        <span className={`status-pill ${a.status === 'ACTIVE' ? 'pill-green' : 'pill-orange'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SALARY ──────────────────────────────────────────── */}
        {activeTab === 'salary' && (
          <div>
            <h2 className="report-section-title">Salary Report</h2>
            <div className="report-stats-grid">
              <StatCard label="Total Payroll"    value={fmtCurr(report.totalSalaryPayroll)} color="#16a34a" sub="Monthly" />
              <StatCard label="Average Salary"   value={fmtCurr(report.averageSalary)}      color="var(--primary)" />
              <StatCard label="Total Employees"  value={fmt(report.totalEmployees)}          color="#7c3aed" />
              <StatCard label="Active Staff"     value={fmt(report.activeEmployees)}         color="#d97706" />
            </div>

            <h3 className="report-sub-title">Salary by Department</h3>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead><tr><th>Department</th><th>Employees</th><th>Total Salary</th></tr></thead>
                <tbody>
                  {Object.entries(report.salaryByDepartment || {}).map(([dept, total]) => (
                    <tr key={dept}>
                      <td>{dept.replace(/_/g, ' ')}</td>
                      <td>{report.employeesByDepartment?.[dept] ?? 0}</td>
                      <td><strong>{fmtCurr(total)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="report-sub-title">Employees by Role</h3>
            <div className="report-bars">
              {Object.entries(report.employeesByRole || {}).map(([role, count]) => (
                <BarRow
                  key={role}
                  label={role.replace(/_/g, ' ')}
                  value={count}
                  max={report.totalEmployees}
                  color="var(--primary)"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── EMPLOYEES ───────────────────────────────────────── */}
        {activeTab === 'employees' && (
          <div>
            <h2 className="report-section-title">Employee Report</h2>
            <div className="report-stats-grid">
              <StatCard label="Total Employees" value={fmt(report.totalEmployees)}  color="var(--primary)" />
              <StatCard label="Active"          value={fmt(report.activeEmployees)} color="#16a34a" />
              <StatCard label="On Leave / Other"
                value={fmt(report.totalEmployees - report.activeEmployees)}          color="#d97706" />
            </div>

            <h3 className="report-sub-title">All Employees</h3>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Role</th><th>Department</th>
                    <th>Email</th><th>Phone</th><th>Hire Date</th><th>Salary</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.employeeList || []).map(e => (
                    <tr key={e.employeeId}>
                      <td><strong>{e.employeeId}</strong></td>
                      <td>{e.firstName} {e.lastName}</td>
                      <td>{e.jobRole.replace(/_/g, ' ')}</td>
                      <td>{e.department.replace(/_/g, ' ')}</td>
                      <td>{e.email}</td>
                      <td>{e.phone || '-'}</td>
                      <td>{e.hireDate}</td>
                      <td>{fmtCurr(e.salary)}</td>
                      <td>
                        <span className={`status-pill ${e.status === 'ACTIVE' ? 'pill-green' : 'pill-orange'}`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
