import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAircraftAPI } from '../../api/axios';

const EMPTY = {
  registrationNumber: '', model: '', manufacturer: '',
  totalSeats: '', economySeats: '', businessSeats: '',
  firstClassSeats: '', yearOfManufacture: '', status: 'ACTIVE'
};

export default function AircraftManagementPage() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const { data } = await adminAircraftAPI.getAll();
      setAircraft(data.data || []);
    } catch { toast.error('Failed to load aircraft'); }
    finally  { setLoading(false); }
  }

  function openAdd()  { setForm(EMPTY); setEditing(null); setModal('open'); }
  function openEdit(a) {
    setForm({
      registrationNumber: a.registrationNumber || '',
      model: a.model || '', manufacturer: a.manufacturer || '',
      totalSeats: a.totalSeats || '', economySeats: a.economySeats || '',
      businessSeats: a.businessSeats || '', firstClassSeats: a.firstClassSeats || '',
      yearOfManufacture: a.yearOfManufacture || '', status: a.status || 'ACTIVE'
    });
    setEditing(a); setModal('open');
  }

  function setField(k, v) { setForm(f => ({...f, [k]: v})); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        totalSeats: parseInt(form.totalSeats) || 0,
        economySeats: parseInt(form.economySeats) || 0,
        businessSeats: parseInt(form.businessSeats) || 0,
        firstClassSeats: parseInt(form.firstClassSeats) || 0,
        yearOfManufacture: parseInt(form.yearOfManufacture) || 0,
      };
      if (editing) {
        await adminAircraftAPI.update(editing.id, payload);
        toast.success('Aircraft updated');
      } else {
        await adminAircraftAPI.create(payload);
        toast.success('Aircraft added');
      }
      setModal(null); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function handleDelete(a) {
    if (!window.confirm(`Delete aircraft ${a.registrationNumber}?`)) return;
    try {
      await adminAircraftAPI.remove(a.id);
      toast.success('Aircraft deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Aircraft Management</h1>
          <p className="admin-page-sub">{aircraft.length} aircraft in fleet</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Aircraft</button>
      </div>

      {loading ? <div className="loading-screen">Loading…</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reg No.</th><th>Model</th><th>Manufacturer</th>
                <th>Total Seats</th><th>Economy</th><th>Business</th>
                <th>First Class</th><th>Year</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {aircraft.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.registrationNumber}</strong></td>
                  <td>{a.model}</td>
                  <td>{a.manufacturer}</td>
                  <td>{a.totalSeats}</td>
                  <td>{a.economySeats}</td>
                  <td>{a.businessSeats}</td>
                  <td>{a.firstClassSeats}</td>
                  <td>{a.yearOfManufacture}</td>
                  <td>
                    <span className={`status-pill ${a.status === 'ACTIVE' ? 'pill-green' : 'pill-orange'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="btn-sm btn-outline" onClick={() => openEdit(a)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(a)}>Delete</button>
                  </td>
                </tr>
              ))}
              {aircraft.length === 0 && (
                <tr><td colSpan="10" className="empty-row">No aircraft found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Aircraft' : 'Add Aircraft'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input required value={form.registrationNumber}
                    onChange={e => setField('registrationNumber', e.target.value)} placeholder="VT-ANB" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setField('status', e.target.value)}>
                    <option>ACTIVE</option><option>MAINTENANCE</option><option>RETIRED</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Model *</label>
                  <input required value={form.model}
                    onChange={e => setField('model', e.target.value)} placeholder="Boeing 737-800" />
                </div>
                <div className="form-group">
                  <label>Manufacturer *</label>
                  <input required value={form.manufacturer}
                    onChange={e => setField('manufacturer', e.target.value)} placeholder="Boeing" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Seats *</label>
                  <input required type="number" min="1" value={form.totalSeats}
                    onChange={e => setField('totalSeats', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Year of Manufacture</label>
                  <input type="number" min="1950" max="2030" value={form.yearOfManufacture}
                    onChange={e => setField('yearOfManufacture', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Economy Seats</label>
                  <input type="number" min="0" value={form.economySeats}
                    onChange={e => setField('economySeats', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Business Seats</label>
                  <input type="number" min="0" value={form.businessSeats}
                    onChange={e => setField('businessSeats', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>First Class Seats</label>
                <input type="number" min="0" value={form.firstClassSeats}
                  onChange={e => setField('firstClassSeats', e.target.value)} />
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
