import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaPlane, FaPlaneDeparture, FaPlaneArrival, FaRegCalendarAlt,
  FaSearch, FaStar, FaUserCircle, FaChevronDown, FaTicketAlt, FaSignOutAlt,
} from 'react-icons/fa';
import AirportAutocomplete from '../components/AirportAutocomplete';
import { useAuth } from '../context/AuthContext';

const AVATARS = [
  { id: 1, name: 'Marco Bianchi',  bg: '#1e3a8a' },
  { id: 2, name: 'Lena Fischer',   bg: '#0d9488' },
  { id: 3, name: 'Priya Nair',     bg: '#b45309' },
  { id: 4, name: 'Tomas Novak',    bg: '#be123c' },
];

const dropStyle = {
  display: 'flex', alignItems: 'center', gap: '9px',
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: '500', color: 'var(--text)',
  fontFamily: 'inherit', textAlign: 'left', transition: 'background .15s',
};

export default function TestLandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [form, setForm] = useState({ origin: '', destination: '', date: '' });
  const [tripType, setTripType] = useState('One way');
  const [errors, setErrors] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user
    ? ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase()
    : '';

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  }

  function handleSearch(e) {
    e.preventDefault();
    const errs = {};
    if (!form.origin.trim())      errs.origin = 'Required';
    if (!form.destination.trim()) errs.destination = 'Required';
    if (!form.date)               errs.date = 'Required';
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(form.date) < today) errs.date = 'Must be today or later';
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Fill in from, to and a valid departure date');
      return;
    }
    navigate('/flights', { state: { origin: form.origin, destination: form.destination, date: form.date } });
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    toast.success('Signed out');
  }

  return (
    <div className="tlp-page">
      <div className="tlp-frame">
        {/* Nav */}
        <header className="tlp-nav">
          <div className="tlp-brand">Full Stack Aviation</div>
          <nav className="tlp-links">
            <button onClick={() => navigate('/flights')}>Deals</button>
            <button onClick={() => navigate('/testLandingPage')}>Destinations</button>
            <button onClick={() => navigate('/testLandingPage')}>Travel Guides</button>
            <button onClick={() => navigate('/testLandingPage')}>Support</button>
          </nav>
          <div className="tlp-nav-right">
            {isAuthenticated ? (
              <>
                <button className="tlp-book-btn" onClick={() => navigate('/my-bookings')}>
                  <FaTicketAlt style={{ marginRight: '6px' }} /> My Bookings
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    className="tlp-avatar-btn"
                    onClick={() => setMenuOpen(s => !s)}
                    aria-label="User menu"
                    style={{
                      background: 'var(--primary)', color: '#fff',
                      fontSize: '0.82rem', fontWeight: '800',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {initials || <FaUserCircle />}
                  </button>
                  {menuOpen && (
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                        background: '#fff', borderRadius: '14px',
                        boxShadow: '0 16px 48px rgba(0,0,0,.18)',
                        border: '1px solid var(--border)', minWidth: '190px',
                        overflow: 'hidden', zIndex: 300,
                      }}
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.9rem' }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {user.email}
                        </div>
                      </div>
                      <div style={{ padding: '6px' }}>
                        <button onClick={() => { navigate('/my-bookings'); setMenuOpen(false); }} style={dropStyle}>
                          <FaTicketAlt /> My Bookings
                        </button>
                        <button onClick={handleLogout} style={{ ...dropStyle, color: 'var(--danger)' }}>
                          <FaSignOutAlt /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="tlp-book-btn" onClick={() => navigate('/testLandingPage')}>Book a Flight</button>
                <button className="tlp-avatar-btn" onClick={() => navigate('/login')} aria-label="Sign in">
                  <FaUserCircle />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Plane */}
        <img className="tlp-plane" src="/img/airplane.png" alt="Airliner gliding through the sky" />

        {/* Stat chips */}
        <div className="tlp-stats">
          <div className="tlp-chip">450+ Airlines Supported</div>
          <div className="tlp-chip">12,230+ Destinations</div>
          <div className="tlp-chip">8.5M+ Flights Booked</div>
        </div>

        {/* Hero copy */}
        <div className="tlp-hero">
          <h1>Find the Best Flights<br />at the Best Prices</h1>
          <p>Search, compare, and book flights from hundreds of airlines worldwide.</p>
        </div>

        {/* Social proof */}
        <div className="tlp-social">
          <div className="tlp-avatars">
            {AVATARS.map((a) => (
              <span key={a.id} className="tlp-av" style={{ background: a.bg }} title={a.name}>
                {a.name.split(' ').map((n) => n[0]).join('')}
              </span>
            ))}
          </div>
          <div className="tlp-rating">
            <span><FaStar /> 4.9</span>
            <small>(75.3k)</small>
          </div>
        </div>

        {/* Search bar */}
        <form className="tlp-search" onSubmit={handleSearch}>
          <div className="tlp-search-top">
            <div className="tlp-mode"><FaPlane /> Flight</div>
            <div className="tlp-selects">
              <label className="tlp-select">
                <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
                  <option>One way</option>
                  <option>Round trip</option>
                </select>
                <FaChevronDown />
              </label>
            </div>
          </div>

          <div className="tlp-search-row">
            <AirportAutocomplete
              icon={<FaPlaneDeparture />}
              label="From"
              placeholder="City or airport"
              value={form.origin}
              error={errors.origin}
              onChange={(v) => set('origin', v)}
            />
            <AirportAutocomplete
              icon={<FaPlaneArrival />}
              label="To"
              placeholder="City or airport"
              value={form.destination}
              error={errors.destination}
              onChange={(v) => set('destination', v)}
            />
            <div className={`tlp-field ${errors.date ? 'tlp-field-err' : ''}`}>
              <FaRegCalendarAlt />
              <div>
                <span>Departure</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="tlp-search-btn">
              <FaSearch /> Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
