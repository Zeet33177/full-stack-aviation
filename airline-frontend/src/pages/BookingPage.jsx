import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { flightAPI, bookingAPI, paymentAPI } from '../api/axios';

function formatDateTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const STEPS = ['Select Seat', 'Review', 'Payment'];

export default function BookingPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [flight, setFlight] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [seatClass, setSeatClass] = useState('ECONOMY');

  const [payment, setPayment] = useState({
    cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '', paymentMethod: 'CREDIT_CARD'
  });
  const [payErrors, setPayErrors] = useState({});

  useEffect(() => {
    flightAPI.getById(flightId)
      .then(({ data }) => setFlight(data.data))
      .catch(() => { toast.error('Flight not found'); navigate('/search'); });
  }, [flightId, navigate]);

  async function handleCreateBooking() {
    setLoading(true);
    try {
      const { data } = await bookingAPI.create({ flightId: Number(flightId), seatClass });
      setBooking(data.data);
      setStep(1);
      toast.success('Seat reserved! Proceed to payment.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  function validatePayment() {
    const errs = {};
    if (!/^\d{16}$/.test(payment.cardNumber))                     errs.cardNumber = 'Must be 16 digits';
    if (!payment.cardHolderName.trim())                           errs.cardHolderName = 'Required';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiryDate))   errs.expiryDate = 'Use MM/YY format';
    if (!/^\d{3,4}$/.test(payment.cvv))                          errs.cvv = '3 or 4 digits';
    return errs;
  }

  async function handlePayment() {
    const errs = validatePayment();
    if (Object.keys(errs).length) { setPayErrors(errs); return; }
    setLoading(true);
    try {
      await paymentAPI.process(booking.id, payment);
      // Generate ticket automatically
      await ticketAfterPayment(booking.id);
      toast.success('Payment successful! Your ticket is ready.');
      navigate(`/ticket/${booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  async function ticketAfterPayment(bookingId) {
    try {
      const { ticketAPI } = await import('../api/axios');
      await ticketAPI.generate(bookingId);
    } catch { /* ticket can be generated later from bookings page */ }
  }

  const CLASS_MULTIPLIER = { ECONOMY: 1, BUSINESS: 2, FIRST: 3 };
  const classPrice = flight ? Number(flight.price) * CLASS_MULTIPLIER[seatClass] : 0;

  if (!flight) return <div className="loading-screen">Loading flight details…</div>;

  return (
    <div className="page-container">
      <div className="booking-container">
        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? '✓' : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
          ))}
        </div>

        {/* Flight summary (always visible) */}
        <div className="booking-flight-summary">
          <div className="summary-route">
            <span className="summary-city">{flight.origin}</span>
            <span className="summary-arrow">✈</span>
            <span className="summary-city">{flight.destination}</span>
          </div>
          <div className="summary-details">
            <span>{formatDateTime(flight.departureTime)}</span>
            <span>·</span>
            <span>{flight.flightNumber}</span>
            <span>·</span>
            <span className="summary-price">₹{Number(flight.price).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Step 0: Select Seat Class */}
        {step === 0 && (
          <div className="booking-step">
            <h2>Select Seat Class</h2>
            <div className="seat-class-grid">
              {[
                { cls: 'ECONOMY',  icon: '💺', label: 'Economy',  mult: 1 },
                { cls: 'BUSINESS', icon: '🛋',  label: 'Business', mult: 2 },
                { cls: 'FIRST',    icon: '👑', label: 'First',    mult: 3 },
              ].map(({ cls, icon, label, mult }) => (
                <button
                  key={cls}
                  className={`seat-class-btn ${seatClass === cls ? 'selected' : ''}`}
                  onClick={() => setSeatClass(cls)}
                >
                  <span className="seat-icon">{icon}</span>
                  <span>{label}</span>
                  <span style={{ fontSize: '0.8rem', color: seatClass === cls ? 'inherit' : 'var(--text-muted)', marginTop: '4px' }}>
                    ₹{(Number(flight.price) * mult).toLocaleString('en-IN')}
                  </span>
                </button>
              ))}
            </div>
            <div className="booking-total">
              <span>Total: </span>
              <strong>₹{classPrice.toLocaleString('en-IN')}</strong>
            </div>
            <button className="btn-primary btn-full" onClick={handleCreateBooking} disabled={loading}>
              {loading ? 'Reserving…' : 'Reserve Seat'}
            </button>
          </div>
        )}

        {/* Step 1: Review */}
        {step === 1 && booking && (
          <div className="booking-step">
            <h2>Review Your Booking</h2>
            <div className="review-card">
              <div className="review-row"><span>Booking Ref</span><strong>{booking.bookingReference}</strong></div>
              <div className="review-row"><span>Passenger</span><strong>{booking.passengerName}</strong></div>
              <div className="review-row"><span>Seat</span><strong>{booking.seatNumber} · {booking.seatClass}</strong></div>
              <div className="review-row"><span>Flight</span><strong>{booking.flightNumber}</strong></div>
              <div className="review-row"><span>Route</span><strong>{booking.origin} → {booking.destination}</strong></div>
              <div className="review-row"><span>Departure</span><strong>{formatDateTime(booking.departureTime)}</strong></div>
              <div className="review-row highlight"><span>Amount</span><strong>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</strong></div>
            </div>
            <button className="btn-primary btn-full" onClick={() => setStep(2)}>
              Proceed to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && booking && (
          <div className="booking-step">
            <h2>Secure Payment</h2>
            <div className="payment-form">
              <div className="form-group">
                <label>Card Number (16 digits) *</label>
                <input
                  name="cardNumber"
                  maxLength={16}
                  placeholder="4111 1111 1111 1111"
                  value={payment.cardNumber}
                  onChange={(e) => { setPayment({...payment, cardNumber: e.target.value.replace(/\D/,'')}); setPayErrors({...payErrors, cardNumber:''}); }}
                  className={payErrors.cardNumber ? 'input-error' : ''}
                />
                {payErrors.cardNumber && <span className="error-msg">{payErrors.cardNumber}</span>}
              </div>

              <div className="form-group">
                <label>Card Holder Name *</label>
                <input
                  name="cardHolderName"
                  placeholder="JOHN DOE"
                  value={payment.cardHolderName}
                  onChange={(e) => { setPayment({...payment, cardHolderName: e.target.value}); setPayErrors({...payErrors, cardHolderName:''}); }}
                  className={payErrors.cardHolderName ? 'input-error' : ''}
                />
                {payErrors.cardHolderName && <span className="error-msg">{payErrors.cardHolderName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry (MM/YY) *</label>
                  <input
                    name="expiryDate"
                    placeholder="12/27"
                    maxLength={5}
                    value={payment.expiryDate}
                    onChange={(e) => { setPayment({...payment, expiryDate: e.target.value}); setPayErrors({...payErrors, expiryDate:''}); }}
                    className={payErrors.expiryDate ? 'input-error' : ''}
                  />
                  {payErrors.expiryDate && <span className="error-msg">{payErrors.expiryDate}</span>}
                </div>
                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    name="cvv"
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={payment.cvv}
                    onChange={(e) => { setPayment({...payment, cvv: e.target.value}); setPayErrors({...payErrors, cvv:''}); }}
                    className={payErrors.cvv ? 'input-error' : ''}
                  />
                  {payErrors.cvv && <span className="error-msg">{payErrors.cvv}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select value={payment.paymentMethod}
                  onChange={(e) => setPayment({...payment, paymentMethod: e.target.value})}>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>
              </div>

              <div className="payment-total">
                <span>Total Payable: </span>
                <strong>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</strong>
              </div>

              <button className="btn-primary btn-full" onClick={handlePayment} disabled={loading}>
                {loading ? 'Processing…' : `Pay ₹${Number(booking.totalAmount).toLocaleString('en-IN')}`}
              </button>

              <p className="secure-note">🔒 Your payment is 256-bit SSL encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
