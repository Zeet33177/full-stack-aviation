import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { dutyReportAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DUTY_AREAS = [
  'COCKPIT', 'CABIN', 'GROUND OPERATIONS', 'CHECK-IN COUNTER',
  'BAGGAGE HANDLING', 'MAINTENANCE', 'ADMINISTRATION', 'CUSTOMER SERVICE'
];

const EMPTY_FORM = {
  dutyArea: '', dutyDate: new Date().toISOString().slice(0, 10),
  startTime: '', endTime: '', location: '', remarks: ''
};

export default function DutyReportPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [submitting, setSubmitting]     = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [noEmployeeLinked, setNoEmployeeLinked] = useState(false);

  useEffect(() => { fetchReports(); }, [isAdmin]);

  async function fetchReports() {
    setLoading(true);
    try {
      const fn = isAdmin ? dutyReportAPI.getAll() : dutyReportAPI.getMyReports();
      const { data } = await fn;
      if (!isAdmin) setNoEmployeeLinked(data.message === 'NO_EMPLOYEE_LINKED');
      setReports(data.data || []);
    } catch { toast.error('Failed to load duty reports'); }
    finally  { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dutyReportAPI.submitMy({
        ...form,
        startTime: form.startTime || null,
        endTime:   form.endTime   || null,
      });
      toast.success('Duty report submitted');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Duty Reports</h1>
          <p className="admin-page-sub">
            {isAdmin ? 'All staff duty reports' : 'Log your duty details'}
          </p>
        </div>
        {!isAdmin && (
          <button className="btn-primary" disabled={noEmployeeLinked} onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Submit Duty Report'}
          </button>
        )}
      </div>

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

      {!isAdmin && showForm && (
        <div className="duty-form-panel">
          <h3>New Duty Report</h3>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>Duty Area *</label>
                <select required value={form.dutyArea}
                  onChange={e => setForm(f=>({...f, dutyArea: e.target.value}))}>
                  <option value="">Select area</option>
                  {DUTY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Duty Date *</label>
                <input required type="date" value={form.dutyDate}
                  onChange={e => setForm(f=>({...f, dutyDate: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={form.startTime}
                  onChange={e => setForm(f=>({...f, startTime: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" value={form.endTime}
                  onChange={e => setForm(f=>({...f, endTime: e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label>Location / Station</label>
              <input value={form.location} placeholder="e.g. Mumbai T2"
                onChange={e => setForm(f=>({...f, location: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <textarea rows={3} value={form.remarks}
                onChange={e => setForm(f=>({...f, remarks: e.target.value}))}
                placeholder="Any notes about your duty shift…"
                style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #d1d5db'}} />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </form>
        </div>
      )}

      {loading ? <div className="loading-screen">Loading…</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Duty Area</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  {isAdmin && <td><strong>{r.employee?.firstName} {r.employee?.lastName}</strong></td>}
                  <td>{r.dutyArea}</td>
                  <td>{r.dutyDate}</td>
                  <td>{r.startTime || '-'}</td>
                  <td>{r.endTime   || '-'}</td>
                  <td>{r.location  || '-'}</td>
                  <td style={{maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis'}}>
                    {r.remarks || '-'}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={isAdmin ? 7 : 6} className="empty-row">No duty reports found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
