import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { flightAPI, bookingAPI, paymentAPI } from '../api/axios';
import { FaCheck, FaPlane, FaChair, FaCouch, FaCrown, FaArrowRight, FaLock } from 'react-icons/fa';

function formatDateTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const STEPS = ['Class', 'Seat', 'Review', 'Payment'];
const CLASS_MULTIPLIER = { ECONOMY: 1, BUSINESS: 2, FIRST: 3 };

const SEAT_TYPE_LABEL = {
  FREE:    'Standard',
  REGULAR: 'Extra comfort',
  PREMIUM: 'Premium legroom',
};

export default function BookingPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [flight, setFlight] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [seatClass, setSeatClass] = useState('ECONOMY');

  const [seatMap, setSeatMap] = useState(null);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [payment, setPayment] = useState({
    cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '', paymentMethod: 'CREDIT_CARD'
  });
  const [payErrors, setPayErrors] = useState({});

  useEffect(() => {
    flightAPI.getById(flightId)
      .then(({ data }) => setFlight(data.data))
      .catch(() => { toast.error('Flight not found'); navigate('/testLandingPage'); });
  }, [flightId, navigate]);

  const loadSeatMap = useCallback(() => {
    setSeatsLoading(true);
    flightAPI.seatMap(flightId)
      .then(({ data }) => setSeatMap(data.data))
      .catch(() => toast.error('Could not load the seat map'))
      .finally(() => setSeatsLoading(false));
  }, [flightId]);

  function goToSeats() {
    setStep(1);
    if (!seatMap) loadSeatMap();
  }

  async function handleCreateBooking() {
    if (!selectedSeat) { toast.error('Pick a seat to continue'); return; }
    setLoading(true);
    try {
      const { data } = await bookingAPI.create({
        flightId: Number(flightId),
        seatClass,
        seatNumber: selectedSeat.number,
      });
      setBooking(data.data);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
      // A seat may have just been taken — refresh the map.
      loadSeatMap();
      setSelectedSeat(null);
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

  function fillDemoPayment() {
    setPayment({
      cardNumber: '4111111111111111',
      cardHolderName: 'JOHN DOE',
      expiryDate: '12/27',
      cvv: '123',
      paymentMethod: 'CREDIT_CARD',
    });
    setPayErrors({});
  }

  async function handlePayment() {
    const errs = validatePayment();
    if (Object.keys(errs).length) { setPayErrors(errs); return; }
    setLoading(true);
    try {
      await paymentAPI.process(booking.id, payment);
      await ticketAfterPayment(booking.id);
      toast.success('Payment successful. Your ticket is ready.');
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

  const classFare = flight ? Number(flight.price) * CLASS_MULTIPLIER[seatClass] : 0;
  const seatAddOn = selectedSeat ? Number(selectedSeat.addOn) : 0;
  const liveTotal = classFare + seatAddOn;

  if (!flight) return <div className="loading-screen">Loading flight details…</div>;

  return (
    <div className="page-container">
      <div className="booking-container">
        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? <FaCheck /> : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
          ))}
        </div>

        {/* Flight summary (always visible) */}
        <div className="booking-flight-summary">
          <div className="summary-route">
            <span className="summary-city">{flight.origin}</span>
            <span className="summary-arrow"><FaPlane /></span>
            <span className="summary-city">{flight.destination}</span>
          </div>
          <div className="summary-details">
            <span>{formatDateTime(flight.departureTime)}</span>
            <span>·</span>
            <span>{flight.flightNumber}</span>
            <span>·</span>
            <span className="summary-price">{inr(flight.price)}</span>
          </div>
        </div>

        {/* Step 0: Select Seat Class */}
        {step === 0 && (
          <div className="booking-step">
            <h2>Select seat class</h2>
            <div className="seat-class-grid">
              {[
                { cls: 'ECONOMY',  Icon: FaChair, label: 'Economy',  mult: 1 },
                { cls: 'BUSINESS', Icon: FaCouch,  label: 'Business', mult: 2 },
                { cls: 'FIRST',    Icon: FaCrown, label: 'First',    mult: 3 },
              ].map(({ cls, Icon, label, mult }) => (
                <button
                  key={cls}
                  className={`seat-class-btn ${seatClass === cls ? 'selected' : ''}`}
                  onClick={() => setSeatClass(cls)}
                >
                  <span className="seat-icon"><Icon /></span>
                  <span>{label}</span>
                  <span style={{ fontSize: '0.8rem', color: seatClass === cls ? 'inherit' : 'var(--text-muted)', marginTop: '4px' }}>
                    {inr(Number(flight.price) * mult)}
                  </span>
                </button>
              ))}
            </div>
            <div className="booking-total">
              <span>Base fare: </span>
              <strong>{inr(classFare)}</strong>
            </div>
            <button className="btn-primary btn-full" onClick={goToSeats}>
              Continue to seat selection
            </button>
          </div>
        )}

        {/* Step 1: Seat map */}
        {step === 1 && (
          <div className="booking-step">
            <h2>Pick your seat</h2>

            <div className="seatmap-legend">
              <span><i className="seat-dot seat-free" /> Standard · free</span>
              <span><i className="seat-dot seat-regular" /> Extra comfort · +{inr(250)}</span>
              <span><i className="seat-dot seat-premium" /> Premium legroom · +{inr(350)}</span>
              <span><i className="seat-dot seat-selected" /> Selected</span>
              <span><i className="seat-dot seat-occupied" /> Taken</span>
            </div>

            {seatsLoading && <div className="loading-screen" style={{ minHeight: '200px' }}>Loading cabin…</div>}

            {!seatsLoading && seatMap && (
              <>
                <div className="cabin">
                  <div className="cabin-nose"><FaPlane /></div>
                  <div className="cabin-body">
                    {seatMap.rows.map((row) => (
                      <div className="cabin-row" key={row.row}>
                        <span className="cabin-row-label">{row.row}</span>
                        <div className="cabin-seats">
                          {row.seats.map((seat, idx) => {
                            const isSelected = selectedSeat?.number === seat.number;
                            const cls = seat.occupied
                              ? 'seat-occupied'
                              : isSelected
                                ? 'seat-selected'
                                : `seat-${seat.type.toLowerCase()}`;
                            return (
                              <React.Fragment key={seat.number}>
                                <button
                                  type="button"
                                  className={`seat ${cls}`}
                                  disabled={seat.occupied}
                                  title={seat.occupied
                                    ? `${seat.number} · taken`
                                    : `${seat.number} · ${SEAT_TYPE_LABEL[seat.type]}${Number(seat.addOn) > 0 ? ` · +${inr(seat.addOn)}` : ' · free'}`}
                                  onClick={() => setSelectedSeat(seat)}
                                >
                                  {seat.number}
                                </button>
                                {idx + 1 === seatMap.aisleAfter && <span className="cabin-aisle" />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="seat-summary-bar">
                  {selectedSeat ? (
                    <div className="seat-breakdown">
                      <div className="review-row"><span>Seat</span><strong>{selectedSeat.number} · {SEAT_TYPE_LABEL[selectedSeat.type]}</strong></div>
                      <div className="review-row"><span>{seatClass} fare</span><strong>{inr(classFare)}</strong></div>
                      <div className="review-row"><span>Seat add-on</span><strong>{seatAddOn > 0 ? `+${inr(seatAddOn)}` : 'Free'}</strong></div>
                      <div className="review-row highlight"><span>Total</span><strong>{inr(liveTotal)}</strong></div>
                    </div>
                  ) : (
                    <p className="seat-hint">Select an available seat to see your total.</p>
                  )}
                </div>
              </>
            )}

            <div className="form-row" style={{ marginTop: '16px' }}>
              <button className="btn-outline" onClick={() => setStep(0)}>Back</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleCreateBooking} disabled={loading || !selectedSeat}>
                {loading ? 'Reserving…' : selectedSeat ? `Reserve ${selectedSeat.number} · ${inr(liveTotal)}` : 'Reserve seat'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && booking && (
          <div className="booking-step">
            <h2>Review your booking</h2>
            <div className="review-card">
              <div className="review-row"><span>Booking Ref</span><strong>{booking.bookingReference}</strong></div>
              <div className="review-row"><span>Passenger</span><strong>{booking.passengerName}</strong></div>
              <div className="review-row"><span>Seat</span><strong>{booking.seatNumber} · {booking.seatClass}</strong></div>
              <div className="review-row"><span>Flight</span><strong>{booking.flightNumber}</strong></div>
              <div className="review-row"><span>Route</span><strong>{booking.origin} <FaArrowRight style={{ verticalAlign: 'middle' }} /> {booking.destination}</strong></div>
              <div className="review-row"><span>Departure</span><strong>{formatDateTime(booking.departureTime)}</strong></div>
              <div className="review-row highlight"><span>Amount</span><strong>{inr(booking.totalAmount)}</strong></div>
            </div>
            <button className="btn-primary btn-full" onClick={() => setStep(3)}>
              Proceed to payment
            </button>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && booking && (
          <div className="booking-step">
            <h2>Secure payment</h2>
            <div className="payment-form">
              <button type="button" className="btn-outline btn-full" onClick={fillDemoPayment} style={{ marginBottom: '1rem' }}>
                Fill Demo Card
              </button>
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
                <strong>{inr(booking.totalAmount)}</strong>
              </div>

              <button className="btn-primary btn-full" onClick={handlePayment} disabled={loading}>
                {loading ? 'Processing…' : `Pay ${inr(booking.totalAmount)}`}
              </button>

              <p className="secure-note"><FaLock /> Your payment is 256-bit SSL encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
