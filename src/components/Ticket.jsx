import React from 'react';

export default function Ticket({ booking, onClose }) {
  const printTicket = () => {
    window.print();
    };
  
    return (
      <div className="ticket-modal">
        <div className="ticket-content">
          <h2>BOOKMYRIDE PRO - TICKET</h2>
          <p><strong>Booking ID:</strong> {booking.id}</p>
          <p><strong>Status:</strong> {booking.status?.toUpperCase()}</p>
          <hr />
          <h3>Journey Details</h3>
          <p><strong>Route:</strong> {booking.routeName}</p>
          <p><strong>Date:</strong> {booking.date}</p>
          <p><strong>Time:</strong> {booking.time || 'Check at counter'}</p>
          <p><strong>Duration:</strong> Approx. 2-4 hours</p>
          <hr />
          <h3>Passenger Details</h3>
          <p><strong>Name:</strong> {booking.name}</p>
          <p><strong>Age:</strong> {booking.age}</p>
          <p><strong>Phone:</strong> {booking.phone}</p>
          <p><strong>Email:</strong> {booking.email || 'Not provided'}</p>
          <hr />
          <h3>Seat Information</h3>
          <p><strong>Seat Number(s):</strong> {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</p>
          <p><strong>Total Seats:</strong> {Array.isArray(booking.seats) ? booking.seats.length : 1}</p>
          <hr />
          <h3>Payment Details</h3>
          <p><strong>Total Amount:</strong> ₹{booking.price}</p>
          <p><strong>Payment Status:</strong> Confirmed</p>
          <p><strong>Booking Date:</strong> {booking.bookingDate || new Date().toLocaleDateString()}</p>
          <div className="ticket-actions">
            <button onClick={printTicket}>Print Ticket</button>
            <button onClick={downloadTicket}>Download Ticket</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const downloadTicket = () => {
    const ticketContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      BOOKMYRIDE PRO - TICKET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.id}
Status: ${booking.status?.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOURNEY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Route: ${booking.routeName}
Date: ${booking.date}
Time: ${booking.time || 'Check at counter'}
Duration: Approx. 2-4 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSENGER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${booking.name}
Age: ${booking.age}
Phone: ${booking.phone}
Email: ${booking.email || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEAT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Seat Number(s): ${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
Total Seats: ${Array.isArray(booking.seats) ? booking.seats.length : 1}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Amount: ₹${booking.price}
Payment Status: Confirmed
Booking Date: ${booking.bookingDate || new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // Create a blob and trigger download
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ticket-${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };