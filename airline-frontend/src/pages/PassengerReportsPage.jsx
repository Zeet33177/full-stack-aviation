import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaPlaneArrival, FaPlane, FaTicketAlt, FaMoneyBillWave, FaSearch, FaCircle } from 'react-icons/fa';

function formatDate(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

const STATUS_META = {
  CONFIRMED: { label: 'Confirmed',  color: 'var(--primary)', bg: '#ccfbf1', icon: FaCheckCircle },
  PENDING:   { label: 'Pending',    color: '#d97706', bg: '#fef3c7', icon: FaHourglassHalf },
  CANCELLED: { label: 'Cancelled',  color: '#dc2626', bg: '#fee2e2', icon: FaTimesCircle },
  COMPLETED: { label: 'Completed',  color: '#059669', bg: '#d1fae5', icon: FaPlaneArrival },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, color: '#6b7280', bg: '#f3f4f6', icon: FaCircle };
  const Icon = m.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 12px', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.04em',
      color: m.color, background: m.bg,
    }}>
      <Icon /> {m.label}
    </span>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  const Icon = icon;
  return (
    <div style={{
      background: 'var(--surface)', border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 22px',
      borderTop: `3px solid ${color}`,
      boxShadow: 'var(--shadow-sm)',
      transition: 'var(--transition)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem',
        }}><Icon /></div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: '900', color, fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginTop: '5px' }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', opacity: .7 }}>{sub}</div>}
    </div>
  );
}

const FILTERS = ['All', 'CONFIRMED', 'COMPLETED', 'PENDING', 'CANCELLED'];

export default function PassengerReportsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');

  useEffect(() => {
    bookingAPI.getAll()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => toast.error('Failed to load flight history'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total     = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    const pending   = bookings.filter(b => b.status === 'PENDING').length;
    const spent     = bookings
      .filter(b => b.status !== 'CANCELLED')
      .reduce((s, b) => s + Number(b.totalAmount || 0), 0);
    return { total, confirmed, completed, cancelled, pending, spent };
  }, [bookings]);

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  const pct = (n) => stats.total === 0 ? 0 : Math.round((n / stats.total) * 100);

  if (loading) return (
    <div className="loading-screen">
      <span style={{ fontSize: '1.5rem' }}><FaPlane /></span> Loading your flight history…
    </div>
  );

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #134e4a 0%, #0d9488 60%, #2dd4bf 100%)',
        borderRadius: 'var(--radius)', padding: '28px 32px', marginBottom: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
        boxShadow: '0 8px 32px rgba(29,78,216,.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-30px', bottom: '-30px',
          fontSize: '10rem', opacity: 0.06, pointerEvents: 'none',
        }}><FaPlane /></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Passenger Flight History
          </p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', fontFamily: 'Sora, sans-serif', lineHeight: 1.2 }}>
            My Reports
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,.65)', marginTop: '6px' }}>
            {user?.firstName} {user?.lastName} · All-time travel summary
          </p>
        </div>

        <Link to="/testLandingPage" className="btn-accent" style={{
          padding: '10px 22px', textDecoration: 'none', fontSize: '0.88rem',
          position: 'relative', zIndex: 1,
        }}>
          + Book New Flight
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        <StatCard icon={FaTicketAlt} label="Total Bookings"  value={stats.total}     color="var(--primary)" />
        <StatCard icon={FaPlaneArrival} label="Completed"       value={stats.completed} color="#059669" sub="Flights attended" />
        <StatCard icon={FaCheckCircle} label="Confirmed"        value={stats.confirmed} color="#0891b2" sub="Upcoming flights" />
        <StatCard icon={FaTimesCircle} label="Cancelled"        value={stats.cancelled} color="#dc2626" sub="Cancelled bookings" />
        <StatCard icon={FaMoneyBillWave} label="Total Spent"      value={formatCurrency(stats.spent)} color="#d97706" sub="Excl. cancellations" />
      </div>

      {/* ── Status Breakdown Bar ── */}
      {stats.total > 0 && (
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '22px 24px', marginBottom: '32px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Booking Breakdown
          </h3>

          {/* Segmented progress bar */}
          <div style={{ display: 'flex', borderRadius: '999px', overflow: 'hidden', height: '10px', background: 'var(--border)', marginBottom: '16px' }}>
            {stats.completed > 0 && (
              <div style={{ width: `${pct(stats.completed)}%`, background: '#059669', transition: 'width .5s ease' }} />
            )}
            {stats.confirmed > 0 && (
              <div style={{ width: `${pct(stats.confirmed)}%`, background: 'var(--primary)', transition: 'width .5s ease' }} />
            )}
            {stats.pending > 0 && (
              <div style={{ width: `${pct(stats.pending)}%`, background: '#d97706', transition: 'width .5s ease' }} />
            )}
            {stats.cancelled > 0 && (
              <div style={{ width: `${pct(stats.cancelled)}%`, background: '#dc2626', transition: 'width .5s ease' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Completed',  count: stats.completed, color: '#059669' },
              { label: 'Confirmed',  count: stats.confirmed, color: 'var(--primary)' },
              { label: 'Pending',    count: stats.pending,   color: '#d97706' },
              { label: 'Cancelled',  count: stats.cancelled, color: '#dc2626' },
            ].filter(i => i.count > 0).map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {item.label} <strong style={{ color: 'var(--text)' }}>{item.count}</strong>
                  <span style={{ opacity: .6 }}> ({pct(item.count)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const count = f === 'All' ? stats.total : bookings.filter(b => b.status === f).length;
          const active = filter === f;
          const m = STATUS_META[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: '700',
                border: active ? 'none' : '1.5px solid var(--border)',
                background: active ? (m ? m.color : 'var(--primary)') : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'var(--transition)',
                boxShadow: active ? `0 4px 12px ${m ? m.color : 'var(--primary)'}40` : 'none',
              }}
            >
              {f === 'All' ? 'All Bookings' : STATUS_META[f]?.label || f} {count > 0 && (
                <span style={{ opacity: .75 }}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Booking History ── */}
      {bookings.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><FaPlane /></span>
          <h3>No travel history yet</h3>
          <p>Book your first flight and your journey will appear here.</p>
          <Link to="/testLandingPage" className="btn-primary">Search Flights</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><FaSearch /></span>
          <h3>No {STATUS_META[filter]?.label || filter} bookings</h3>
          <p>Try a different filter above.</p>
          <button className="btn-outline" onClick={() => setFilter('All')}>Show All</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((booking, idx) => (
            <div
              key={booking.id}
              style={{
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)',
                animation: `fadeUp .3s ease ${idx * 0.04}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Card top stripe by status */}
              <div style={{ height: '3px', background: STATUS_META[booking.status]?.color || '#e5e7eb' }} />

              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>

                {/* Route block */}
                <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text)', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
                      {booking.origin}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {formatTime(booking.departureTime)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatDate(booking.departureTime)}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '999px' }}>
                      {booking.flightNumber}
                    </span>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}><FaPlane /></span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text)', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
                      {booking.destination}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {formatTime(booking.arrivalTime)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatDate(booking.arrivalTime)}
                    </div>
                  </div>
                </div>

                {/* Meta info */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flex: '0 0 auto' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                      Seat
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.9rem' }}>
                      {booking.seatNumber} · {booking.seatClass}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                      Amount
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.9rem' }}>
                      {formatCurrency(booking.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                      Ref
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {booking.bookingReference}
                    </div>
                  </div>
                </div>

                {/* Status + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flex: '0 0 auto' }}>
                  <StatusBadge status={booking.status} />
                  {booking.status === 'CONFIRMED' && (
                    <Link
                      to={`/ticket/${booking.id}`}
                      style={{
                        fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)',
                        textDecoration: 'none', padding: '5px 12px',
                        border: '1.5px solid var(--primary)', borderRadius: '8px',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      View Ticket
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
