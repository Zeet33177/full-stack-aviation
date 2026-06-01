import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminEmployeeAPI } from '../../api/axios';

const EMPTY = {
  employeeId: '', firstName: '', lastName: '', jobRole: '',
  department: '', email: '', phone: '', hireDate: '',
  salary: '', status: 'ACTIVE'
};

const ROLES = ['PILOT', 'CO_PILOT', 'FLIGHT_ATTENDANT', 'GROUND_STAFF', 'CABIN_CREW', 'ENGINEER', 'MANAGER'];
const DEPTS = ['FLIGHT_OPERATIONS', 'GROUND_OPERATIONS', 'MAINTENANCE', 'CUSTOMER_SERVICE', 'ADMINISTRATION', 'FINANCE', 'IT'];

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const { data } = await adminEmployeeAPI.getAll();
      setEmployees(data.data || []);
    } catch { toast.error('Failed to load employees'); }
    finally  { setLoading(false); }
  }

  function openAdd() { setForm(EMPTY); setEditing(null); setModal('add'); }
  function openEdit(emp) {
    setForm({
      employeeId: emp.employeeId || '',
      firstName: emp.firstName || '', lastName: emp.lastName || '',
      jobRole: emp.jobRole || '', department: emp.department || '',
      email: emp.email || '', phone: emp.phone || '',
      hireDate: emp.hireDate || '', salary: emp.salary || '',
      status: emp.status || 'ACTIVE'
    });
    setEditing(emp);
    setModal('edit');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, salary: form.salary ? parseFloat(form.salary) : null };
      if (modal === 'add') {
        await adminEmployeeAPI.create(payload);
        toast.success('Employee added');
      } else {
        await adminEmployeeAPI.update(editing.id, payload);
        toast.success('Employee updated');
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function handleDelete(emp) {
    if (!window.confirm(`Delete ${emp.firstName} ${emp.lastName}?`)) return;
    setDeleting(emp.id);
    try {
      await adminEmployeeAPI.remove(emp.id);
      toast.success('Employee deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
    finally  { setDeleting(null); }
  }

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.employeeId} ${e.department} ${e.jobRole}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Employee Management</h1>
          <p className="admin-page-sub">{employees.length} total employees</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Employee</button>
      </div>

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="Search by name, ID, role, department…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="loading-screen">Loading…</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Role</th><th>Department</th>
                <th>Email</th><th>Phone</th><th>Salary</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td><strong>{emp.employeeId}</strong></td>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.jobRole?.replace(/_/g, ' ')}</td>
                  <td>{emp.department?.replace(/_/g, ' ')}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone || '-'}</td>
                  <td>₹{Number(emp.salary || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-pill ${emp.status === 'ACTIVE' ? 'pill-green' : 'pill-orange'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="btn-sm btn-outline" onClick={() => openEdit(emp)}>Edit</button>
                    <button className="btn-sm btn-danger" disabled={deleting === emp.id}
                      onClick={() => handleDelete(emp)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="9" className="empty-row">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Add Employee' : 'Edit Employee'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input required value={form.employeeId}
                    onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="EMP001" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option>ACTIVE</option><option>ON_LEAVE</option><option>TERMINATED</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input required value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input required value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Role *</label>
                  <select required value={form.jobRole}
                    onChange={e => setForm({...form, jobRole: e.target.value})}>
                    <option value="">Select role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select required value={form.department}
                    onChange={e => setForm({...form, department: e.target.value})}>
                    <option value="">Select dept</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input required type="email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Hire Date</label>
                  <input type="date" value={form.hireDate}
                    onChange={e => setForm({...form, hireDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Monthly Salary (₹)</label>
                <input type="number" min="0" step="0.01" value={form.salary}
                  onChange={e => setForm({...form, salary: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
