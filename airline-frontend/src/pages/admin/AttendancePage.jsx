import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { attendanceAPI, adminEmployeeAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [date, setDate]                 = useState(new Date().toISOString().slice(0, 10));
  const [todayRecord, setTodayRecord]   = useState(null);
  const [actioning, setActioning]       = useState(false);
  const [employees, setEmployees]       = useState([]);
  const [noEmployeeLinked, setNoEmployeeLinked] = useState(false);

  // Admin: mark attendance form
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markForm, setMarkForm] = useState({
    employeeId: '', date: new Date().toISOString().slice(0, 10),
    checkInTime: '', checkOutTime: '', status: 'PRESENT', notes: ''
  });

  useEffect(() => {
    if (isAdmin) {
      adminEmployeeAPI.getAll()
        .then(r => setEmployees(r.data.data || []))
        .catch(() => {});
    }
    fetchRecords();
  }, [isAdmin]);

  async function fetchRecords() {
    setLoading(true);
    try {
      if (isAdmin) {
        const { data } = await attendanceAPI.getAll();
        setRecords(data.data || []);
      } else {
        const { data } = await attendanceAPI.getMyAttendance();
        const linked = data.message !== 'NO_EMPLOYEE_LINKED';
        setNoEmployeeLinked(!linked);
        setRecords(data.data || []);
        if (linked) {
          const today = new Date().toISOString().slice(0, 10);
          const todayRec = (data.data || []).find(r => r.date === today);
          setTodayRecord(todayRec || null);
        }
      }
    } catch { toast.error('Failed to load attendance'); }
    finally  { setLoading(false); }
  }

  async function handleCheckIn() {
    setActioning(true);
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully!');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally { setActioning(false); }
  }

  async function handleCheckOut() {
    setActioning(true);
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully!');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally { setActioning(false); }
  }

  async function handleAdminMark(e) {
    e.preventDefault();
    try {
      await attendanceAPI.adminMark({
        ...markForm,
        employeeId: parseInt(markForm.employeeId),
        checkInTime: markForm.checkInTime || null,
        checkOutTime: markForm.checkOutTime || null,
      });
      toast.success('Attendance marked');
      setShowMarkModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  }

  const filteredByDate = isAdmin
    ? records.filter(r => r.date === date)
    : records;

  const today = new Date().toISOString().slice(0, 10);
  const checkedIn  = !!todayRecord;
  const checkedOut = checkedIn && !!todayRecord?.checkOutTime;

  function statusColor(s) {
    return s === 'PRESENT' ? 'pill-green' : s === 'ABSENT' ? 'pill-red' : 'pill-orange';
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Attendance</h1>
          <p className="admin-page-sub">
            {isAdmin ? 'View and manage all employee attendance' : 'Mark and view your attendance'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowMarkModal(true)}>+ Mark Attendance</button>
        )}
      </div>

      {/* Not-linked warning */}
      {!isAdmin && noEmployeeLinked && (
        <div style={{
          background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px',
          padding: '1rem 1.25rem', marginBottom: '1.5rem'
        }}>
          <strong style={{color:'#92400e'}}>Account not linked to an employee profile.</strong>
          <p style={{margin:'0.35rem 0 0', color:'#78350f', fontSize:'0.9rem'}}>
            Ask your admin to create an <strong>Employee</strong> record with email:{' '}
            <code style={{background:'#fde68a', padding:'1px 6px', borderRadius:'4px'}}>{user?.email}</code>
          </p>
        </div>
      )}

      {/* Staff check-in / check-out panel */}
      {!isAdmin && (
        <div className="attendance-checkin-panel">
          <div className="checkin-status">
            <span className="checkin-date">Today: {today}</span>
            {!checkedIn && <span className="checkin-badge badge-gray">Not checked in</span>}
            {checkedIn && !checkedOut && (
              <span className="checkin-badge badge-green">
                Checked in at {todayRecord.checkInTime}
              </span>
            )}
            {checkedOut && (
              <span className="checkin-badge badge-blue">
                Checked out at {todayRecord.checkOutTime}
              </span>
            )}
          </div>
          <div className="attendance-actions">
            <button className="btn-primary" disabled={checkedIn || actioning || noEmployeeLinked} onClick={handleCheckIn}>
              Check In
            </button>
            <button className="btn-outline" disabled={!checkedIn || checkedOut || actioning || noEmployeeLinked} onClick={handleCheckOut}>
              Check Out
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="admin-toolbar">
          <label style={{marginRight:'8px'}}>Filter by date:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{padding:'6px 10px', border:'1px solid #d1d5db', borderRadius:'6px'}} />
          <span style={{marginLeft:'12px', color:'#6b7280'}}>
            {filteredByDate.length} record(s) on {date}
          </span>
        </div>
      )}

      {loading ? <div className="loading-screen">Loading…</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                {isAdmin && <th>Notes</th>}
              </tr>
            </thead>
            <tbody>
              {(isAdmin ? filteredByDate : records).map(r => (
                <tr key={r.id}>
                  {isAdmin && <td><strong>{r.employee?.firstName} {r.employee?.lastName}</strong></td>}
                  <td>{r.date}</td>
                  <td>{r.checkInTime || '-'}</td>
                  <td>{r.checkOutTime || '-'}</td>
                  <td><span className={`status-pill ${statusColor(r.status)}`}>{r.status}</span></td>
                  {isAdmin && <td>{r.notes || '-'}</td>}
                </tr>
              ))}
              {(isAdmin ? filteredByDate : records).length === 0 && (
                <tr><td colSpan={isAdmin ? 6 : 4} className="empty-row">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showMarkModal && (
        <div className="modal-overlay" onClick={() => setShowMarkModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mark Attendance</h2>
              <button className="modal-close" onClick={() => setShowMarkModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdminMark} className="modal-form">
              <div className="form-group">
                <label>Employee *</label>
                <select required value={markForm.employeeId}
                  onChange={e => setMarkForm(f=>({...f, employeeId: e.target.value}))}>
                  <option value="">Select employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input required type="date" value={markForm.date}
                    onChange={e => setMarkForm(f=>({...f, date: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select value={markForm.status}
                    onChange={e => setMarkForm(f=>({...f, status: e.target.value}))}>
                    <option>PRESENT</option><option>ABSENT</option>
                    <option>LEAVE</option><option>HALF_DAY</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Check In Time</label>
                  <input type="time" value={markForm.checkInTime}
                    onChange={e => setMarkForm(f=>({...f, checkInTime: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Check Out Time</label>
                  <input type="time" value={markForm.checkOutTime}
                    onChange={e => setMarkForm(f=>({...f, checkOutTime: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input value={markForm.notes}
                  onChange={e => setMarkForm(f=>({...f, notes: e.target.value}))} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowMarkModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
