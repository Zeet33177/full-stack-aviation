import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { flightAPI } from '../api/axios';
import AirportAutocomplete from '../components/AirportAutocomplete';
import {
  FaPlane, FaPlaneDeparture, FaPlaneArrival, FaRegCalendarAlt,
  FaSearch, FaArrowRight, FaClock, FaChair, FaArrowLeft,
} from 'react-icons/fa';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

function fmtTime(dt) {
  if (!dt) return '--';
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
}
function fmtDuration(min) {
  if (!min && min !== 0) return '';
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}h${m ? ' ' + m + 'm' : ''}`;
}

export default function FlightResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const s = location.state || {};

  const [form, setForm] = useState({
    origin: s.origin || '',
    destination: s.destination || '',
    date: s.date || '',
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState({});

  const runSearch = useCallback((origin, destination, date) => {
    setLoading(true);
    setSearched(true);
    flightAPI.search(origin, destination, date)
      .then(({ data }) => setFlights(data.data || []))
      .catch(() => toast.error('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (s.origin && s.destination && s.date) {
      runSearch(s.origin, s.destination, s.date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  }

  function handleSearch(e) {
    e.preventDefault();
    const errs = {};
    if (!form.origin.trim()) errs.origin = 'Required';
    if (!form.destination.trim()) errs.destination = 'Required';
    if (!form.date) errs.date = 'Required';
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(form.date) < today) errs.date = 'Must be today or later';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    runSearch(form.origin, form.destination, form.date);
  }

  return (
    <div className="fr-page">
      <div className="fr-top">
        {/* Nav */}
        <header className="tlp-nav">
          <button className="fr-brand-btn" onClick={() => navigate('/testLandingPage')}>
            <FaArrowLeft /> <span className="tlp-brand">Full Stack Aviation</span>
          </button>
          <div className="tlp-nav-right">
            <button className="tlp-book-btn" onClick={() => navigate('/my-bookings')}>My Bookings</button>
          </div>
        </header>

        {/* Search bar */}
        <form className="tlp-search fr-search" onSubmit={handleSearch}>
          <div className="tlp-search-row">
            <AirportAutocomplete
              icon={<FaPlaneDeparture />} label="From" placeholder="City or airport"
              value={form.origin} error={errors.origin} onChange={(v) => set('origin', v)}
            />
            <AirportAutocomplete
              icon={<FaPlaneArrival />} label="To" placeholder="City or airport"
              value={form.destination} error={errors.destination} onChange={(v) => set('destination', v)}
            />
            <div className={`tlp-field ${errors.date ? 'tlp-field-err' : ''}`}>
              <FaRegCalendarAlt />
              <div>
                <span>Departure</span>
                <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="tlp-search-btn"><FaSearch /> Search</button>
          </div>
        </form>
      </div>

      <div className="fr-body">
        <div className="fr-inner">
          {form.origin && form.destination && (
            <div className="fr-head">
              <h1>{form.origin} <FaArrowRight /> {form.destination}</h1>
              <p>{fmtDate(form.date)} · {loading ? 'Searching…' : `${flights.length} flight${flights.length === 1 ? '' : 's'} found`}</p>
            </div>
          )}

          {loading && (
            <div className="fr-list">
              {[0, 1, 2].map((i) => <div key={i} className="fr-card fr-skeleton" />)}
            </div>
          )}

          {!loading && searched && flights.length === 0 && (
            <div className="fr-empty">
              <span className="fr-empty-icon"><FaPlane /></span>
              <h3>No flights on this route and date</h3>
              <p>Try a different date or nearby cities.</p>
            </div>
          )}

          {!loading && flights.length > 0 && (
            <div className="fr-list">
              {flights.map((f) => (
                <article className="fr-card" key={f.id}>
                  <div className="fr-airline">
                    <span className="fr-airline-badge"><FaPlane /></span>
                    <div>
                      <div className="fr-flightno">{f.flightNumber}</div>
                      <div className="fr-aircraft">{f.aircraftModel || 'Aircraft'}</div>
                    </div>
                  </div>

                  <div className="fr-route">
                    <div className="fr-point">
                      <div className="fr-time">{fmtTime(f.departureTime)}</div>
                      <div className="fr-city">{f.origin}</div>
                    </div>
                    <div className="fr-path">
                      <span className="fr-dur"><FaClock /> {fmtDuration(f.durationMinutes)}</span>
                      <span className="fr-line"><i /><FaPlane /></span>
                      <span className="fr-nonstop">Non-stop</span>
                    </div>
                    <div className="fr-point fr-point-end">
                      <div className="fr-time">{fmtTime(f.arrivalTime)}</div>
                      <div className="fr-city">{f.destination}</div>
                    </div>
                  </div>

                  <div className="fr-cta">
                    <div className="fr-seats"><FaChair /> {f.availableSeats} left</div>
                    <div className="fr-price">{inr(f.price)}</div>
                    <button
                      className="tlp-search-btn fr-book"
                      disabled={f.availableSeats <= 0}
                      onClick={() => navigate(`/book/${f.id}`)}
                    >
                      {f.availableSeats <= 0 ? 'Sold out' : 'Book Now'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
