import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ticketAPI, bookingAPI } from '../api/axios';

function formatDateTime(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function TicketPage() {
  const { bookingId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    // Try fetching existing ticket; if not found, generate it
    ticketAPI.getByBooking(bookingId)
      .then(({ data }) => setTicket(data.data))
      .catch(() =>
        ticketAPI.generate(bookingId)
          .then(({ data }) => setTicket(data.data))
          .catch(() => toast.error('Could not load ticket. Ensure your booking is confirmed.'))
      )
      .finally(() => setLoading(false));
  }, [bookingId]);

  function handlePrint() {
    window.print();
  }

  if (loading) return <div className="loading-screen">Loading your e-ticket…</div>;
  if (!ticket)  return <div className="loading-screen error">Ticket not available.</div>;

  return (
    <div className="page-container">
      <div className="ticket-wrapper" ref={printRef}>

        {/* Ticket header */}
        <div className="ticket-header">
          <div className="ticket-airline">
            <span className="ticket-logo">✈</span>
            <span className="ticket-airline-name">Horizon Airways</span>
          </div>
          <div className="ticket-type">BOARDING PASS</div>
        </div>

        {/* Main ticket body */}
        <div className="ticket-body">
          <div className="ticket-left">
            <div className="ticket-section">
              <span className="ticket-label">Passenger Name</span>
              <span className="ticket-value large">{ticket.passengerName}</span>
            </div>

            <div className="ticket-route-display">
              <div className="ticket-city-block">
                <span className="ticket-iata">{ticket.origin?.substring(0,3).toUpperCase()}</span>
                <span className="ticket-city-name">{ticket.origin}</span>
              </div>
              <div className="ticket-flight-line">
                <span className="ticket-flight-num">{ticket.flightNumber}</span>
                <div className="dotted-line"></div>
                <span>✈</span>
              </div>
              <div className="ticket-city-block">
                <span className="ticket-iata">{ticket.destination?.substring(0,3).toUpperCase()}</span>
                <span className="ticket-city-name">{ticket.destination}</span>
              </div>
            </div>

            <div className="ticket-info-grid">
              <div className="ticket-info-cell">
                <span className="ticket-label">Departure</span>
                <span className="ticket-value">{formatDateTime(ticket.departureTime)}</span>
              </div>
              <div className="ticket-info-cell">
                <span className="ticket-label">Arrival</span>
                <span className="ticket-value">{formatDateTime(ticket.arrivalTime)}</span>
              </div>
              <div className="ticket-info-cell">
                <span className="ticket-label">Terminal</span>
                <span className="ticket-value">{ticket.terminal || '-'}</span>
              </div>
              <div className="ticket-info-cell">
                <span className="ticket-label">Gate</span>
                <span className="ticket-value large">{ticket.gate || ticket.boardingGate || '-'}</span>
              </div>
              <div className="ticket-info-cell">
                <span className="ticket-label">Seat</span>
                <span className="ticket-value large">{ticket.seatNumber}</span>
              </div>
              <div className="ticket-info-cell">
                <span className="ticket-label">Class</span>
                <span className="ticket-value">{ticket.seatClass}</span>
              </div>
              <div className="ticket-info-cell">
                <span className="ticket-label">Boarding</span>
                <span className="ticket-value">{formatDateTime(ticket.boardingTime)}</span>
              </div>
              <div className="ticket-info-cell">
                <span className="ticket-label">Group</span>
                <span className="ticket-value large">{ticket.boardingGroup}</span>
              </div>
            </div>

            {ticket.passportNumber && (
              <div className="ticket-section">
                <span className="ticket-label">Passport</span>
                <span className="ticket-value">{ticket.passportNumber}</span>
              </div>
            )}

            <div className="ticket-section">
              <span className="ticket-label">Booking Reference</span>
              <span className="ticket-value mono">{ticket.bookingReference}</span>
            </div>
          </div>

          {/* Tear-off stub */}
          <div className="ticket-stub">
            <div className="stub-line"></div>
            <div className="stub-content">
              <div className="stub-row">
                <span className="ticket-label">Ticket No.</span>
                <span className="ticket-value mono small">{ticket.ticketNumber}</span>
              </div>
              <div className="stub-row">
                <span className="ticket-label">Seat</span>
                <span className="stub-seat">{ticket.seatNumber}</span>
              </div>
              <div className="stub-row">
                <span className="ticket-label">Class</span>
                <span className="ticket-value">{ticket.seatClass}</span>
              </div>
              <div className="stub-row">
                <span className="ticket-label">Amount</span>
                <span className="ticket-value">₹{Number(ticket.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="stub-barcode">
                {/* Simulated barcode lines */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="barcode-line" style={{ width: `${(i % 3) + 1}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket footer */}
        <div className="ticket-footer">
          <span>Aircraft: {ticket.aircraftModel || 'N/A'}</span>
          <span>Issued: {formatDateTime(ticket.issuedAt)}</span>
          <span>Meal: {ticket.mealPreference || 'Standard'}</span>
        </div>
      </div>

      <div className="ticket-actions no-print">
        <button className="btn-primary" onClick={handlePrint}>🖨 Print Ticket</button>
      </div>
    </div>
  );
}
