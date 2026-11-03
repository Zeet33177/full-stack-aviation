import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { flightAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaExchangeAlt, FaSearch, FaPlane, FaPlaneDeparture, FaChair, FaBuilding, FaCity, FaUmbrellaBeach, FaLandmark, FaFlag, FaArrowRight } from 'react-icons/fa';

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? m + 'm' : ''}`;
}

function formatDateTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function FlightSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({ origin: '', destination: '', date: '' });
  const [flights, setFlights]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [errors, setErrors]     = useState({});

  // Auto-run a search when arriving from the landing page with query state.
  useEffect(() => {
    const s = location.state;
    if (s?.origin && s?.destination && s?.date) {
      setForm({ origin: s.origin, destination: s.destination, date: s.date });
      doSearch(s.origin, s.destination, s.date);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  }

  function swapCities() {
    setForm(f => ({ ...f, origin: f.destination, destination: f.origin }));
  }

  function validate() {
    const errs = {};
    if (!form.origin.trim())      errs.origin      = 'Origin is required';
    if (!form.destination.trim()) errs.destination = 'Destination is required';
    if (!form.date)               errs.date        = 'Travel date is required';
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(form.date) < today) errs.date = 'Date must be today or in the future';
    }
    return errs;
  }

  async function searchByRoute(origin, destination) {
    setForm(f => ({ ...f, origin, destination }));
    setErrors({});
    setLoading(true);
    setSearched(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const { data } = await flightAPI.getAll();
      const all = data.data || [];
      const filtered = all.filter(f =>
        f.origin?.toLowerCase() === origin.toLowerCase() &&
        f.destination?.toLowerCase() === destination.toLowerCase()
      );
      setFlights(filtered);
      if (filtered.length === 0) toast.info('No flights found for this route.');
    } catch {
      toast.error('Failed to load flights. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function doSearch(origin, destination, date) {
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await flightAPI.search(origin, destination, date);
      setFlights(data.data || []);
      if ((data.data || []).length === 0) toast.info('No flights found for this route and date.');
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    doSearch(form.origin, form.destination, form.date);
  }

  function handleBook(flightId) {
    if (!isAuthenticated) {
      toast.info('Please sign in to book a flight');
      navigate('/login');
      return;
    }
    navigate(`/book/${flightId}`);
  }

  return (
    <div className="page-container">

      {/* ── Hero Section ── */}
      <div className="hero-section">
        <h1>Find Your Perfect <span>Flight</span></h1>
        <p>Search from hundreds of routes across India and beyond</p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">

            <div className="form-group">
              <label>From</label>
              <input
                name="origin"
                placeholder="City or airport"
                value={form.origin}
                onChange={handleChange}
                className={errors.origin ? 'input-error' : ''}
                autoComplete="off"
              />
              {errors.origin && <span className="error-msg" style={{ color: '#fca5a5' }}>{errors.origin}</span>}
            </div>

            <button type="button" className="swap-btn" onClick={swapCities} title="Swap cities">
              <FaExchangeAlt />
            </button>

            <div className="form-group">
              <label>To</label>
              <input
                name="destination"
                placeholder="City or airport"
                value={form.destination}
                onChange={handleChange}
                className={errors.destination ? 'input-error' : ''}
                autoComplete="off"
              />
              {errors.destination && <span className="error-msg" style={{ color: '#fca5a5' }}>{errors.destination}</span>}
            </div>

            <div className="form-group">
              <label>Travel Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className={errors.date ? 'input-error' : ''}
              />
              {errors.date && <span className="error-msg" style={{ color: '#fca5a5' }}>{errors.date}</span>}
            </div>

            <button type="submit" className="btn-accent btn-search" disabled={loading}
              style={{ alignSelf: 'flex-end', padding: '12px 28px' }}>
              {loading ? 'Searching…' : <><FaSearch /> Search</>}
            </button>
          </div>
        </form>
      </div>

      {/* ── Results ── */}
      {loading && (
        <div className="loading-screen">
          <span style={{ fontSize: '1.5rem' }}><FaPlane /></span>
          Searching flights…
        </div>
      )}

      {searched && !loading && (
        <div className="results-section">
          <h2 className="results-title">
            {flights.length > 0 ? (
              <>
                Available Flights
                <span className="results-count">
                  {flights.length} found
                </span>
              </>
            ) : 'No Flights Available'}
          </h2>

          <div className="flight-list">
            {flights.map((flight, idx) => (
              <div
                key={flight.id}
                className="flight-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flight-card-left">
                  <div className="flight-route">
                    <div className="flight-city">
                      <span className="city-name">{flight.origin}</span>
                      <span className="flight-time">{formatTime(flight.departureTime)}</span>
                      <span className="flight-time">{formatDate(flight.departureTime)}</span>
                    </div>

                    <div className="flight-arrow">
                      <span className="flight-duration">{formatDuration(flight.durationMinutes)}</span>
                      <div className="arrow-line"><span><FaPlane /></span></div>
                      <span className="flight-number">{flight.flightNumber}</span>
                    </div>

                    <div className="flight-city">
                      <span className="city-name">{flight.destination}</span>
                      <span className="flight-time">{formatTime(flight.arrivalTime)}</span>
                      <span className="flight-time">{formatDate(flight.arrivalTime)}</span>
                    </div>
                  </div>

                  <div className="flight-meta">
                    <span>
                      <span style={{ marginRight: '4px' }}><FaPlaneDeparture /></span>
                      {flight.aircraftModel || 'Aircraft'}
                    </span>
                    <span>
                      <span style={{ marginRight: '4px' }}><FaChair /></span>
                      {flight.availableSeats} seats left
                    </span>
                    <span>
                      <span style={{ marginRight: '4px' }}><FaBuilding /></span>
                      Terminal {flight.terminal} · Gate {flight.gate}
                    </span>
                  </div>
                </div>

                <div className="flight-card-right">
                  <div className="flight-price">
                    <span className="price-currency">₹</span>
                    <span className="price-amount">
                      {Number(flight.price).toLocaleString('en-IN')}
                    </span>
                    <span className="price-label">per person</span>
                  </div>

                  <div className={`flight-status status-${flight.status?.toLowerCase()}`}>
                    {flight.status}
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handleBook(flight.id)}
                    disabled={flight.availableSeats === 0 || flight.status === 'CANCELLED'}
                    style={{ padding: '10px 22px', minWidth: '110px' }}
                  >
                    {flight.availableSeats === 0 ? 'Sold Out'
                      : flight.status === 'CANCELLED' ? 'Cancelled'
                      : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {flights.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon"><FaPlane /></span>
              <h3>No flights found</h3>
              <p>Try a different date or route to find available flights.</p>
              <button className="btn-outline" onClick={() => { setSearched(false); setFlights([]); }}>
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div style={{
          marginTop: '48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {[
            { Icon: FaCity, from: 'Mumbai', to: 'Delhi', price: '4,999', tag: 'Popular' },
            { Icon: FaUmbrellaBeach, from: 'Mumbai', to: 'Bengaluru', price: '3,499', tag: 'Best Value' },
            { Icon: FaLandmark, from: 'Delhi', to: 'New York', price: '45,999', tag: 'International' },
            { Icon: FaFlag, from: 'Mumbai', to: 'London', price: '52,999', tag: 'International' },
          ].map((route, i) => (
            <div
              key={i}
              onClick={() => searchByRoute(route.from, route.to)}
              style={{
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '20px',
                cursor: 'pointer', transition: 'var(--transition)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{(() => { const Icon = route.Icon; return <Icon />; })()}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '999px', display: 'inline-block', marginBottom: '8px' }}>
                {route.tag}
              </div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                {route.from} <FaArrowRight style={{ verticalAlign: 'middle' }} /> {route.to}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                From <strong style={{ color: 'var(--primary)', fontFamily: 'Sora, sans-serif', fontSize: '1.1rem' }}>₹{route.price}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
