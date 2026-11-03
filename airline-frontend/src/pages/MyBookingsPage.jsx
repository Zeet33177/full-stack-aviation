import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingAPI } from '../api/axios';
import { FaPlane } from 'react-icons/fa';

function formatDateTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

const STATUS_COLORS = {
  CONFIRMED: '#16a34a',
  PENDING:   '#d97706',
  CANCELLED: '#dc2626',
  COMPLETED: '#0d9488',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    bookingAPI.getAll()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      const { data } = await bookingAPI.cancel(bookingId);
      setBookings(bookings.map(b => b.id === bookingId ? data.data : b));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  }

  if (loading) return <div className="loading-screen">Loading your bookings…</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Bookings</h1>
        <Link to="/testLandingPage" className="btn-outline">+ Book New Flight</Link>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><FaPlane /></span>
          <h3>No bookings yet</h3>
          <p>Start exploring flights and book your first trip!</p>
          <Link to="/testLandingPage" className="btn-primary">Search Flights</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <div className="booking-ref">
                  <span className="ref-label">Booking Ref</span>
                  <span className="ref-value">{booking.bookingReference}</span>
                </div>
                <span
                  className="booking-status-badge"
                  style={{ backgroundColor: STATUS_COLORS[booking.status] }}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-card-body">
                <div className="booking-route">
                  <div className="booking-city">
                    <span className="city-big">{booking.origin}</span>
                    <span className="time-small">{formatDateTime(booking.departureTime)}</span>
                  </div>
                  <div className="booking-arrow-block">
                    <span>{booking.flightNumber}</span>
                    <div className="booking-arrow"><FaPlane /></div>
                  </div>
                  <div className="booking-city">
                    <span className="city-big">{booking.destination}</span>
                    <span className="time-small">{formatDateTime(booking.arrivalTime)}</span>
                  </div>
                </div>

                <div className="booking-meta">
                  <div className="meta-item"><span>Seat</span><strong>{booking.seatNumber} · {booking.seatClass}</strong></div>
                  <div className="meta-item"><span>Booked</span><strong>{formatDateTime(booking.bookingDate)}</strong></div>
                  <div className="meta-item"><span>Amount</span><strong>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</strong></div>
                </div>
              </div>

              <div className="booking-card-actions">
                {booking.status === 'CONFIRMED' && (
                  <Link to={`/ticket/${booking.id}`} className="btn-outline btn-sm">
                    View Ticket
                  </Link>
                )}
                {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelling === booking.id}
                  >
                    {cancelling === booking.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
