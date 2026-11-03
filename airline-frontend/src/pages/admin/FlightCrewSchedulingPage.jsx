import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminFlightAPI, adminAircraftAPI, crewAPI, adminEmployeeAPI } from '../../api/axios';
import { FaTimes, FaArrowRight } from 'react-icons/fa';

const CREW_ROLES = ['PILOT', 'CO_PILOT', 'SENIOR_CABIN_CREW', 'CABIN_CREW', 'GROUND_STAFF'];

export default function FlightCrewSchedulingPage() {
  const [flights, setFlights]     = useState([]);
  const [aircraft, setAircraft]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [crew, setCrew]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [crewRole, setCrewRole]   = useState('PILOT');
  const [empId, setEmpId]         = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [flightForm, setFlightForm] = useState({
    flightNumber: '', aircraftId: '', origin: '', destination: '',
    departureTime: '', arrivalTime: '', totalSeats: '', price: '',
    terminal: 'T1', gate: 'G1'
  });
  const [savingFlight, setSavingFlight] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFlightAPI.getAll(),
      adminAircraftAPI.getAll(),
      adminEmployeeAPI.getAll(),
    ]).then(([f, a, e]) => {
      setFlights(f.data.data || []);
      setAircraft(a.data.data || []);
      setEmployees(e.data.data || []);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  async function selectFlight(flight) {
    setSelected(flight);
    setEmpId('');
    try {
      const { data } = await crewAPI.getByFlight(flight.id);
      setCrew(data.data || []);
    } catch { toast.error('Failed to load crew'); }
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!empId) { toast.warn('Select an employee'); return; }
    setAssigning(true);
    try {
      await crewAPI.assign({ flightId: selected.id, employeeId: parseInt(empId), crewRole });
      toast.success('Crew assigned');
      const { data } = await crewAPI.getByFlight(selected.id);
      setCrew(data.data || []);
      setEmpId('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally { setAssigning(false); }
  }

  async function handleUnassign(id) {
    try {
      await crewAPI.unassign(id);
      setCrew(c => c.filter(x => x.id !== id));
      toast.success('Crew removed');
    } catch { toast.error('Failed to remove crew'); }
  }

  async function handleCancelFlight(flight) {
    if (!window.confirm(`Cancel flight ${flight.flightNumber}?`)) return;
    try {
      await adminFlightAPI.cancel(flight.id);
      toast.success('Flight cancelled');
      const { data } = await adminFlightAPI.getAll();
      setFlights(data.data || []);
      if (selected?.id === flight.id) setSelected(f => ({...f, status: 'CANCELLED'}));
    } catch { toast.error('Cancel failed'); }
  }

  async function handleSaveFlight(e) {
    e.preventDefault();
    setSavingFlight(true);
    try {
      const payload = {
        ...flightForm,
        totalSeats: parseInt(flightForm.totalSeats),
        price: parseFloat(flightForm.price),
        aircraftId: parseInt(flightForm.aircraftId),
      };
      await adminFlightAPI.create(payload);
      toast.success('Flight created');
      setShowFlightModal(false);
      const { data } = await adminFlightAPI.getAll();
      setFlights(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    } finally { setSavingFlight(false); }
  }

  const filtered = flights.filter(f =>
    `${f.flightNumber} ${f.origin} ${f.destination}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Flight &amp; Crew Scheduling</h1>
          <p className="admin-page-sub">Assign crew members to flights</p>
        </div>
        <button className="btn-primary" onClick={() => setShowFlightModal(true)}>+ Add Flight</button>
      </div>

      <div className="scheduling-layout">
        {/* Left panel: flight list */}
        <div className="scheduling-flights">
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="Search flight…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {loading ? <div className="loading-screen">Loading…</div> : (
            <div className="flight-list">
              {filtered.map(f => (
                <div
                  key={f.id}
                  className={`flight-list-item ${selected?.id === f.id ? 'selected' : ''}`}
                  onClick={() => selectFlight(f)}
                >
                  <div className="fli-number">{f.flightNumber}</div>
                  <div className="fli-route">{f.origin} <FaArrowRight style={{ verticalAlign: 'middle' }} /> {f.destination}</div>
                  <div className="fli-time">{f.departureTime?.replace('T', ' ').slice(0, 16)}</div>
                  <span className={`status-pill ${f.status === 'SCHEDULED' ? 'pill-green' : f.status === 'CANCELLED' ? 'pill-red' : 'pill-orange'}`}>
                    {f.status}
                  </span>
                  {f.status === 'SCHEDULED' && (
                    <button className="btn-sm btn-danger" style={{marginTop:'4px'}}
                      onClick={e => { e.stopPropagation(); handleCancelFlight(f); }}>Cancel</button>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <p className="empty-row">No flights</p>}
            </div>
          )}
        </div>

        {/* Right panel: crew */}
        <div className="scheduling-crew">
          {!selected ? (
            <div className="crew-empty">Select a flight to manage crew</div>
          ) : (
            <>
              <h3 className="crew-panel-title">
                Crew for {selected.flightNumber} — {selected.origin} <FaArrowRight style={{ verticalAlign: 'middle' }} /> {selected.destination}
              </h3>

              <table className="admin-table">
                <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Action</th></tr></thead>
                <tbody>
                  {crew.map(c => (
                    <tr key={c.id}>
                      <td>{c.employee?.firstName} {c.employee?.lastName}</td>
                      <td>{c.crewRole?.replace(/_/g,' ')}</td>
                      <td>{c.employee?.department?.replace(/_/g,' ')}</td>
                      <td>
                        <button className="btn-sm btn-danger" onClick={() => handleUnassign(c.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {crew.length === 0 && (
                    <tr><td colSpan="4" className="empty-row">No crew assigned yet</td></tr>
                  )}
                </tbody>
              </table>

              {selected.status === 'SCHEDULED' && (
                <form onSubmit={handleAssign} className="assign-crew-form">
                  <h4>Assign Crew Member</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Employee</label>
                      <select value={empId} onChange={e => setEmpId(e.target.value)} required>
                        <option value="">Select employee</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.firstName} {e.lastName} — {e.jobRole?.replace(/_/g,' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Crew Role</label>
                      <select value={crewRole} onChange={e => setCrewRole(e.target.value)}>
                        {CREW_ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={assigning}>
                    {assigning ? 'Assigning…' : 'Assign'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Flight Modal */}
      {showFlightModal && (
        <div className="modal-overlay" onClick={() => setShowFlightModal(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Flight</h2>
              <button className="modal-close" onClick={() => setShowFlightModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveFlight} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Flight Number *</label>
                  <input required value={flightForm.flightNumber}
                    onChange={e => setFlightForm(f=>({...f, flightNumber: e.target.value}))} placeholder="HA201" />
                </div>
                <div className="form-group">
                  <label>Aircraft *</label>
                  <select required value={flightForm.aircraftId}
                    onChange={e => setFlightForm(f=>({...f, aircraftId: e.target.value}))}>
                    <option value="">Select aircraft</option>
                    {aircraft.filter(a=>a.status==='ACTIVE').map(a => (
                      <option key={a.id} value={a.id}>{a.registrationNumber} — {a.model}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Origin *</label>
                  <input required value={flightForm.origin}
                    onChange={e => setFlightForm(f=>({...f, origin: e.target.value}))} placeholder="Mumbai" />
                </div>
                <div className="form-group">
                  <label>Destination *</label>
                  <input required value={flightForm.destination}
                    onChange={e => setFlightForm(f=>({...f, destination: e.target.value}))} placeholder="Delhi" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Departure *</label>
                  <input required type="datetime-local" value={flightForm.departureTime}
                    onChange={e => setFlightForm(f=>({...f, departureTime: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Arrival *</label>
                  <input required type="datetime-local" value={flightForm.arrivalTime}
                    onChange={e => setFlightForm(f=>({...f, arrivalTime: e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Seats *</label>
                  <input required type="number" min="1" value={flightForm.totalSeats}
                    onChange={e => setFlightForm(f=>({...f, totalSeats: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={flightForm.price}
                    onChange={e => setFlightForm(f=>({...f, price: e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Terminal</label>
                  <input value={flightForm.terminal}
                    onChange={e => setFlightForm(f=>({...f, terminal: e.target.value}))} placeholder="T1" />
                </div>
                <div className="form-group">
                  <label>Gate</label>
                  <input value={flightForm.gate}
                    onChange={e => setFlightForm(f=>({...f, gate: e.target.value}))} placeholder="G1" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowFlightModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingFlight}>
                  {savingFlight ? 'Creating…' : 'Create Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
