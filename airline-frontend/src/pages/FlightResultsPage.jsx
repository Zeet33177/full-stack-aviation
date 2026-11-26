import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { flightAPI, trackAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AirportAutocomplete from '../components/AirportAutocomplete';
import AIRPORTS from '../data/airports';
import {
  FaPlane, FaPlaneDeparture, FaPlaneArrival, FaRegCalendarAlt,
  FaSearch, FaArrowRight, FaClock, FaChair, FaSlidersH, FaBell, FaRegBell,
} from 'react-icons/fa';

// IATA lookup from airports data
const IATA_MAP = Object.fromEntries(AIRPORTS.map(a => [a.city.toLowerCase(), a.iata]));
function getIata(city) {
  return IATA_MAP[city?.toLowerCase()] || city?.slice(0, 3).toUpperCase() || '???';
}

const inr    = n => `₹${Number(n).toLocaleString('en-IN')}`;
const inrShort = n => { const v = Number(n); return v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`; };

function fmtTime(dt) {
  if (!dt) return '--';
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtDate(dt) {
  if (!dt) return '';
  const d = typeof dt === 'string' && dt.length === 10 ? new Date(dt + 'T00:00:00') : new Date(dt);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
}
function fmtDuration(min) {
  if (!min && min !== 0) return '';
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}h${m ? ' ' + m + 'm' : ''}`;
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
}
function carouselMeta(iso) {
  const d = new Date(iso + 'T00:00:00');
  return {
    dow:       d.toLocaleDateString('en-IN', { weekday: 'short' }),
    dayNum:    d.getDate(),
    month:     d.toLocaleDateString('en-IN', { month: 'short' }),
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
  };
}

const TIME_SLOTS = [
  { key: 'early',     label: 'Early Morning', sub: '12 AM – 6 AM',  h: [0,  6]  },
  { key: 'morning',   label: 'Morning',        sub: '6 AM – 12 PM', h: [6,  12] },
  { key: 'afternoon', label: 'Afternoon',      sub: '12 PM – 6 PM', h: [12, 18] },
  { key: 'evening',   label: 'Evening & Night',sub: '6 PM – 12 AM', h: [18, 24] },
];

function AirlineBadge({ model }) {
  const isBoeing = model?.toLowerCase().includes('boeing');
  const cls = isBoeing ? 'fr-ab-boeing' : 'fr-ab-airbus';
  return <div className={`fr-airline-badge2 ${cls}`}>{isBoeing ? 'B' : 'A'}</div>;
}

const SUGGESTED = [
  { from: 'Mumbai',  to: 'Delhi',     price: '5,499', date: '2026-12-07' },
  { from: 'Delhi',   to: 'Mumbai',    price: '4,799', date: '2026-12-07' },
  { from: 'Mumbai',  to: 'Bengaluru', price: '3,299', date: '2026-12-07' },
  { from: 'Chennai', to: 'Mumbai',    price: '4,299', date: '2026-12-07' },
];

export default function FlightResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const s = location.state || {};

  const [form, setForm]       = useState({ origin: s.origin || '', destination: s.destination || '', date: s.date || '' });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errors,   setErrors]   = useState({});

  const [trackedIds, setTrackedIds] = useState(() => new Set());

  // Load existing tracks so bells render in their correct state
  useEffect(() => {
    if (!isAuthenticated) { setTrackedIds(new Set()); return; }
    trackAPI.getAll()
      .then(({ data }) => setTrackedIds(new Set((data.data || []).map(a => a.flight.id))))
      .catch(() => {});
  }, [isAuthenticated]);

  function toggleTrack(e, flightId) {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Sign in to track price drops');
      navigate('/login');
      return;
    }
    if (trackedIds.has(flightId)) {
      trackAPI.untrack(flightId)
        .then(() => {
          setTrackedIds(prev => { const n = new Set(prev); n.delete(flightId); return n; });
          toast.info('Stopped tracking this flight');
        })
        .catch(() => toast.error('Could not update tracking'));
    } else {
      trackAPI.track(flightId)
        .then(() => {
          setTrackedIds(prev => new Set(prev).add(flightId));
          toast.success("Tracking price — we'll alert you if it drops");
        })
        .catch(() => toast.error('Could not track this flight'));
    }
  }

  const [carouselPrices, setCarouselPrices] = useState({});

  const CACHE_TTL  = 2 * 60 * 1000;
  const DB_CHANGED = false;         // flip to true in demo to force re-fetch
  const flightCache = useRef({});   // { [key]: { data: Flight[], ts: number } }

  // Filters
  const [filterTimes,    setFilterTimes]    = useState([]);
  const [filterStops,    setFilterStops]    = useState([]);
  const [priceSlider,    setPriceSlider]    = useState(null);
  const [sortBy,         setSortBy]         = useState('price');

  const runSearch = useCallback((origin, destination, date) => {
    const key = `${origin}|${destination}|${date}`;
    const cached = flightCache.current[key];
    const now = Date.now();

    if (cached) {
      const ageMs  = now - cached.ts;
      const ageSec = Math.round(ageMs / 1000);

      if (DB_CHANGED) {
        console.log(
          `%c[Flight Cache] DB_CHANGED — force re-fetching: ${origin} → ${destination} | ${date}`,
          'color:#e67e22;font-weight:bold'
        );
      } else if (ageMs > CACHE_TTL) {
        console.log(
          `%c[Flight Cache] EXPIRED (${ageSec}s old) — re-fetching: ${origin} → ${destination} | ${date}`,
          'color:#e74c3c;font-weight:bold'
        );
      } else {
        console.log(
          `%c[Flight Cache] HIT — serving cached: ${origin} → ${destination} | ${date}  (fetched ${ageSec}s ago · dbChanged=${DB_CHANGED})`,
          'color:#27ae60;font-weight:bold'
        );
        setFlights(cached.data);
        setSearched(true);
        if (cached.data.length > 0) setPriceSlider(Math.max(...cached.data.map(f => Number(f.price))));
        else setPriceSlider(null);
        return;
      }
    } else {
      console.log(
        `%c[Flight Cache] MISS — fetching from API: ${origin} → ${destination} | ${date}`,
        'color:#2980b9;font-weight:bold'
      );
    }

    setLoading(true);
    setSearched(true);
    setCarouselPrices({});
    flightAPI.search(origin, destination, date)
      .then(({ data }) => {
        const res = data.data || [];
        flightCache.current[key] = { data: res, ts: Date.now() };
        console.log(
          `%c[Flight Cache] STORED: ${origin} → ${destination} | ${date}  (${res.length} flight${res.length !== 1 ? 's' : ''})`,
          'color:#8e44ad;font-weight:bold'
        );
        setFlights(res);
        if (res.length > 0) setPriceSlider(Math.max(...res.map(f => Number(f.price))));
        else setPriceSlider(null);
      })
      .catch(() => toast.error('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch carousel prices for ±3 days in background
  useEffect(() => {
    if (!form.origin || !form.destination || !form.date) return;
    let alive = true;
    [-3, -2, -1, 1, 2, 3].forEach(offset => {
      const iso = addDays(form.date, offset);
      flightAPI.search(form.origin, form.destination, iso)
        .then(({ data }) => {
          if (!alive) return;
          const res = data.data || [];
          setCarouselPrices(prev => ({
            ...prev,
            [iso]: res.length > 0 ? Math.min(...res.map(f => Number(f.price))) : null,
          }));
        })
        .catch(() => {});
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.origin, form.destination]);

  useEffect(() => {
    if (s.origin && s.destination && s.date) runSearch(s.origin, s.destination, s.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField(name, value) {
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: '' }));
  }

  function handleSearch(e) {
    e.preventDefault();
    const errs = {};
    if (!form.origin.trim())      errs.origin      = 'Required';
    if (!form.destination.trim()) errs.destination = 'Required';
    if (!form.date)               errs.date        = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    runSearch(form.origin, form.destination, form.date);
  }

  const priceRange = useMemo(() => {
    if (!flights.length) return { min: 0, max: 100000 };
    return {
      min: Math.min(...flights.map(f => Number(f.price))),
      max: Math.max(...flights.map(f => Number(f.price))),
    };
  }, [flights]);

  const visibleFlights = useMemo(() => {
    let list = [...flights];
    if (filterStops.length) {
      list = list.filter(f => filterStops.includes(f.stops));
    }
    if (filterTimes.length) {
      list = list.filter(f => {
        const h = new Date(f.departureTime).getHours();
        return filterTimes.some(k => {
          const slot = TIME_SLOTS.find(t => t.key === k);
          return slot && h >= slot.h[0] && h < slot.h[1];
        });
      });
    }
    if (priceSlider !== null) list = list.filter(f => Number(f.price) <= priceSlider);
    list.sort((a, b) => {
      if (sortBy === 'price')     return Number(a.price) - Number(b.price);
      if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime);
      if (sortBy === 'duration')  return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      return 0;
    });
    return list;
  }, [flights, filterStops, filterTimes, priceSlider, sortBy]);

  const carouselDates = useMemo(() => {
    if (!form.date) return [];
    const selMin = flights.length > 0 ? Math.min(...flights.map(f => Number(f.price))) : null;
    return [-3, -2, -1, 0, 1, 2, 3].map(i => {
      const iso = addDays(form.date, i);
      const price = i === 0 ? selMin : carouselPrices[iso];
      return { iso, ...carouselMeta(iso), price, isSelected: i === 0, loading: i !== 0 && !(iso in carouselPrices) };
    });
  }, [form.date, flights, carouselPrices]);

  const carouselMinPrice = useMemo(() => {
    const vals = carouselDates.map(d => d.price).filter(p => p != null);
    return vals.length ? Math.min(...vals) : null;
  }, [carouselDates]);

  const originIata = getIata(form.origin);
  const destIata   = getIata(form.destination);

  return (
    <div className="fr-page">

      {/* ── Sky header + search bar ────────────────────────── */}
      <div className="fr-top">
        <form className="tlp-search fr-search" onSubmit={handleSearch}>
          <div className="tlp-search-row">
            <AirportAutocomplete icon={<FaPlaneDeparture />} label="From" placeholder="City or airport"
              value={form.origin} error={errors.origin} onChange={v => setField('origin', v)} />
            <AirportAutocomplete icon={<FaPlaneArrival />} label="To" placeholder="City or airport"
              value={form.destination} error={errors.destination} onChange={v => setField('destination', v)} />
            <div className={`tlp-field ${errors.date ? 'tlp-field-err' : ''}`}>
              <FaRegCalendarAlt />
              <div>
                <span>Departure</span>
                <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="tlp-search-btn"><FaSearch /> Search</button>
          </div>
        </form>
      </div>

      {/* ── White lift panel ──────────────────────────────── */}
      <div className="fr-body">
        <div className="fr-inner">

          {/* Results heading */}
          {form.origin && form.destination && searched && (
            <div className="fr-head">
              <h1>
                {form.origin}&nbsp;<span className="fr-iata">({originIata})</span>
                &nbsp;<FaArrowRight />&nbsp;
                {form.destination}&nbsp;<span className="fr-iata">({destIata})</span>
              </h1>
              <p>
                {fmtDate(form.date)}
                &nbsp;·&nbsp;
                {loading
                  ? 'Searching…'
                  : `${visibleFlights.length}${visibleFlights.length !== flights.length ? ` of ${flights.length}` : ''} flight${flights.length === 1 ? '' : 's'} found`
                }
              </p>
            </div>
          )}

          {/* ── Date price carousel ────────────────────────── */}
          {searched && flights.length > 0 && !loading && (
            <div className="fr-carousel-wrap">
              {carouselDates.map(cd => {
                const cheapest = cd.price !== null && cd.price === carouselMinPrice && !cd.isSelected;
                return (
                  <button
                    key={cd.iso}
                    className={[
                      'fr-cd',
                      cd.isSelected ? 'fr-cd--sel' : '',
                      cheapest      ? 'fr-cd--cheap' : '',
                      cd.isWeekend && !cd.isSelected ? 'fr-cd--wknd' : '',
                    ].join(' ')}
                    onClick={() => { setField('date', cd.iso); runSearch(form.origin, form.destination, cd.iso); }}
                  >
                    <div className="fr-cd-dow">{cd.dow}</div>
                    <div className="fr-cd-date">{cd.dayNum} {cd.month}</div>
                    <div className="fr-cd-price">
                      {cd.loading ? '…' : cd.price !== null ? inrShort(cd.price) : '–'}
                    </div>
                    {cheapest && <div className="fr-cd-tag">Best deal</div>}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Skeletons ──────────────────────────────────── */}
          {loading && (
            <div className="fr-list" style={{ marginTop: 24 }}>
              {[0, 1, 2].map(i => <div key={i} className="fr-card fr-skeleton" />)}
            </div>
          )}

          {/* ── No results ─────────────────────────────────── */}
          {!loading && searched && flights.length === 0 && (
            <div className="fr-no-results">
              <div className="fr-empty">
                <span className="fr-empty-icon"><FaPlane /></span>
                <h3>No flights on this route and date</h3>
                <p>No direct flights found for <strong>{form.origin} → {form.destination}</strong> on {fmtDate(form.date)}.</p>
                <p style={{ marginTop: 6 }}>Try adjusting your date, or explore these popular routes:</p>
              </div>
              <div className="fr-suggestions">
                <div className="fr-sug-label">Popular routes available on Dec 7</div>
                <div className="fr-sug-grid">
                  {SUGGESTED.map((r, i) => (
                    <button key={i} className="fr-sug-card"
                      onClick={() => { setField('origin', r.from); setField('destination', r.to); setField('date', r.date); runSearch(r.from, r.to, r.date); }}>
                      <div className="fr-sug-route">
                        <span>{r.from}</span>
                        <FaArrowRight style={{ fontSize: '0.7rem', opacity: 0.5 }} />
                        <span>{r.to}</span>
                      </div>
                      <div className="fr-sug-price">from ₹{r.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Sidebar + results layout ───────────────────── */}
          {!loading && flights.length > 0 && (
            <div className="fr-layout">

              {/* Sidebar */}
              <aside className="fr-sidebar">
                <div className="fr-filter-head">
                  <span className="fr-filter-head-left"><FaSlidersH /> Filters</span>
                  <button className="fr-filter-reset"
                    onClick={() => { setFilterTimes([]); setFilterStops([]); setPriceSlider(priceRange.max); }}>
                    Reset all
                  </button>
                </div>

                {/* Stops */}
                <div className="fr-filter-sec">
                  <div className="fr-filter-sec-title">Stops</div>
                  {[{ val: 0, label: 'Non-stop' }, { val: 1, label: '1 Stop' }].map(({ val, label }) => {
                    const count = flights.filter(f => f.stops === val).length;
                    const active = filterStops.includes(val);
                    return (
                      <label key={val} className={`fr-fcheck ${count === 0 ? 'fr-fcheck--disabled' : ''}`}>
                        <input type="checkbox" disabled={count === 0} checked={active}
                          onChange={() => setFilterStops(prev =>
                            prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
                          )} />
                        <div className="fr-fcheck-body">
                          <span>{label}</span>
                          <span className="fr-fcount">{count}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Departure time */}
                <div className="fr-filter-sec">
                  <div className="fr-filter-sec-title">Departure Time</div>
                  {TIME_SLOTS.map(slot => {
                    const count = flights.filter(f => {
                      const h = new Date(f.departureTime).getHours();
                      return h >= slot.h[0] && h < slot.h[1];
                    }).length;
                    const active = filterTimes.includes(slot.key);
                    return (
                      <label key={slot.key} className={`fr-fcheck ${count === 0 ? 'fr-fcheck--disabled' : ''}`}>
                        <input type="checkbox" disabled={count === 0} checked={active}
                          onChange={() => setFilterTimes(prev =>
                            prev.includes(slot.key) ? prev.filter(k => k !== slot.key) : [...prev, slot.key]
                          )} />
                        <div className="fr-fcheck-body">
                          <div>
                            <div className="fr-fcheck-label">{slot.label}</div>
                            <div className="fr-fcheck-sub">{slot.sub}</div>
                          </div>
                          <span className="fr-fcount">{count}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Price range */}
                <div className="fr-filter-sec">
                  <div className="fr-filter-sec-title">Max Price</div>
                  <input className="fr-price-slider" type="range"
                    min={priceRange.min} max={priceRange.max}
                    value={priceSlider ?? priceRange.max}
                    onChange={e => setPriceSlider(Number(e.target.value))} />
                  <div className="fr-price-labels">
                    <span>{inr(priceRange.min)}</span>
                    <span className="fr-price-max-val">{inr(priceSlider ?? priceRange.max)}</span>
                  </div>
                </div>
              </aside>

              {/* Results column */}
              <div className="fr-results-col">
                <div className="fr-results-bar">
                  <span className="fr-bar-count">
                    {visibleFlights.length}{visibleFlights.length !== flights.length ? ` of ${flights.length}` : ''} flights
                  </span>
                  <div className="fr-sort-wrap">
                    <span>Sort by:</span>
                    <select className="fr-sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                      <option value="price">Cheapest first</option>
                      <option value="departure">Earliest departure</option>
                      <option value="duration">Shortest duration</option>
                    </select>
                  </div>
                </div>

                <div className="fr-list2">
                  {visibleFlights.map(f => {
                    const seatsLow = f.availableSeats <= 9;
                    const seatsMid = f.availableSeats > 9 && f.availableSeats <= 20;
                    return (
                      <article className="fr-card2" key={f.id}>

                        {/* Airline */}
                        <div className="fr-c2-airline">
                          <AirlineBadge model={f.aircraftModel} />
                          <div>
                            <div className="fr-c2-name">Horizon Airways</div>
                            <div className="fr-c2-sub">{f.flightNumber} · {f.aircraftModel || 'Aircraft'}</div>
                          </div>
                          <button
                            type="button"
                            className={`fr-track-bell ${trackedIds.has(f.id) ? 'fr-track-bell--on' : ''}`}
                            title={trackedIds.has(f.id) ? 'Tracking — click to stop' : 'Track price'}
                            aria-label="Track price"
                            onClick={e => toggleTrack(e, f.id)}
                          >
                            {trackedIds.has(f.id) ? <FaBell /> : <FaRegBell />}
                          </button>
                        </div>

                        {/* Route timeline */}
                        <div className="fr-c2-route">
                          <div className="fr-c2-pt">
                            <div className="fr-c2-time">{fmtTime(f.departureTime)}</div>
                            <div className="fr-c2-city">{f.origin}</div>
                            <div className="fr-c2-iata-tag">{getIata(f.origin)}</div>
                          </div>

                          <div className="fr-c2-path">
                            <div className="fr-c2-dur"><FaClock /> {fmtDuration(f.durationMinutes)}</div>
                            <div className="fr-c2-timeline">
                              <span className="fr-c2-tdot" />
                              <span className="fr-c2-tline" />
                              <FaPlane className="fr-c2-tplane" />
                              <span className="fr-c2-tline" />
                              <span className="fr-c2-tdot" />
                            </div>
                            {f.stops === 0
                              ? <div className="fr-c2-nonstop">Non-stop</div>
                              : <div className="fr-c2-stop1">1 stop · {f.viaCity || 'via hub'}</div>
                            }
                          </div>

                          <div className="fr-c2-pt fr-c2-pt--end">
                            <div className="fr-c2-time">{fmtTime(f.arrivalTime)}</div>
                            <div className="fr-c2-city">{f.destination}</div>
                            <div className="fr-c2-iata-tag">{getIata(f.destination)}</div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="fr-c2-cta">
                          {seatsLow && (
                            <div className="fr-c2-seats fr-c2-seats--low">
                              <FaChair /> {f.availableSeats} seats left
                            </div>
                          )}
                          {seatsMid && (
                            <div className="fr-c2-seats fr-c2-seats--mid">
                              <FaChair /> {f.availableSeats} left
                            </div>
                          )}
                          {!seatsLow && !seatsMid && (
                            <div className="fr-c2-seats fr-c2-seats--ok">
                              <FaChair /> {f.availableSeats} available
                            </div>
                          )}
                          <div className="fr-c2-price">{inr(f.price)}</div>
                          <div className="fr-c2-per">per person</div>
                          <button className="fr-c2-book"
                            disabled={f.availableSeats <= 0}
                            onClick={() => navigate(`/book/${f.id}`)}>
                            {f.availableSeats <= 0 ? 'Sold out' : 'Book Now'}
                          </button>
                        </div>

                      </article>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
