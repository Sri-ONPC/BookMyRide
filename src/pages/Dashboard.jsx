import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc

} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export default function Dashboard(){
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
  const [viewMode, setViewMode] = useState('card'); // card or list
  const navigate = useNavigate();

  // For detecting status changes to trigger popup
  const prevStatusesRef = useRef({});
  const [approvedPopup, setApprovedPopup] = useState({show:false, bookingId:null, name:''});

  // keep reference to unsubscribe so we can cleanup
  const snapshotUnsubRef = useRef(null);

  useEffect(() => {
    // Wait for auth state to be ready before querying bookings.
    const authUnsub = onAuthStateChanged(auth, user => {
      // cleanup previous snapshot listener
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
        snapshotUnsubRef.current = null;
      }

      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      // listen to bookings for current user in real-time
      const q = query(
        collection(db, 'bookings'),
        where('user', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsub = onSnapshot(q, snap => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setBookings(arr);

        // initialize prevStatusesRef on first load if empty
        if (!prevStatusesRef.current || Object.keys(prevStatusesRef.current).length === 0) {
          const map = {};
          arr.forEach(b => map[b.id] = b.status);
          prevStatusesRef.current = map;
        }

        setLoading(false);
      }, err => {
        console.error('bookings onSnapshot error', err);
        setLoading(false);
      });

      snapshotUnsubRef.current = unsub;
    });

    return () => {
      // cleanup both listeners
      if (snapshotUnsubRef.current) snapshotUnsubRef.current();
      authUnsub();
    };
  }, []);

  // Watch bookings for status changes (pending -> confirmed)
  useEffect(() => {
    const prev = prevStatusesRef.current || {};
    let changedBooking = null;

    // find any booking that changed to confirmed (from something else)
    for (const b of bookings) {
      const prevStatus = prev[b.id];
      if (prevStatus && prevStatus !== 'confirmed' && b.status === 'confirmed') {
        changedBooking = b;
        break;
      }
    }

    // update prev map for future diffs
    const newMap = {};
    bookings.forEach(b => newMap[b.id] = b.status);
    prevStatusesRef.current = newMap;

    if (changedBooking) {
      setApprovedPopup({ show: true, bookingId: changedBooking.id, name: changedBooking.name });
      // auto hide after 3s
      setTimeout(() => setApprovedPopup({ show:false, bookingId:null, name:'' }), 3000);
    }
  }, [bookings]);

  const handleLogout = async() => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if(filter === 'all') return true;
    if(filter === 'upcoming') return b.status === 'pending' || b.status === 'confirmed';
    if(filter === 'completed') return b.status === 'completed';
    if(filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  // --- PDF generator with QR code (only when user clicks Download) ---
  const downloadTicketPDFDirect = async (booking) => {
    if (!booking || booking.status !== 'confirmed') {
      console.log("Trying to download ticket with status:", booking.status);
      alert('Ticket download available only after admin confirmation.');
      return;
    }
    

    try {
      // build QR payload (explicitly excluding booking id)
      const qrPayload = {
        name: booking.name,
        phone: booking.phone,
        route: booking.routeName,
        date: booking.date,
        time: booking.time || 'N/A',
        seats: Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats,
        price: booking.price,
        status: booking.status
      };

      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));

      // create jsPDF
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 36;
      const startX = margin;
      let y = 40;

      // Header bar
      doc.setFillColor(79, 70, 229); // #4f46e5
      doc.rect(0, 0, pageWidth, 70, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255,255,255);
      doc.text('BOOK MY RIDE', startX, 46);

      // Subheader and small meta
      doc.setFontSize(11);
      doc.setTextColor(255,255,255);
      doc.text(`Status: ${booking.status?.toUpperCase()}`, pageWidth - margin - 200, 46);

      y += 50;

      // Ticket Title box
      doc.setFontSize(16);
      doc.setTextColor(33, 37, 41); // dark
      doc.text('Passenger Ticket', startX, y);
      y += 18;

      // Draw a light box for main details
      doc.setDrawColor(220,220,220);
      if (typeof doc.roundedRect === 'function') {
        doc.roundedRect(startX, y, pageWidth - margin * 2, 140, 6, 6);
      } else {
        doc.rect(startX, y, pageWidth - margin * 2, 140);
      }

      // left column info
      let leftX = startX + 12;
      let rightX = pageWidth/2 + 10;
      let lineY = y + 22;
      doc.setFontSize(12);

      doc.text(`Name: ${booking.name}`, leftX, lineY);
      lineY += 16;
      doc.text(`Phone: ${booking.phone}`, leftX, lineY);
      lineY += 16;
      doc.text(`Route: ${booking.routeName}`, leftX, lineY);
      lineY += 16;
      doc.text(`Date: ${booking.date}`, leftX, lineY);
      lineY += 16;
      doc.text(`Time: ${booking.time || 'N/A'}`, leftX, lineY);
      lineY += 16;

      // seats and price on right column
      let rY = y + 22;
      doc.text(`Seats: ${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}`, rightX, rY);
      rY += 18;
      doc.text(`Total Price: ₹${booking.price}`, rightX, rY);
      rY += 18;
      doc.text(`Passenger Age: ${booking.age || 'N/A'}`, rightX, rY);
      rY += 18;
      const createdAtText = booking.createdAt && booking.createdAt.seconds
        ? new Date(booking.createdAt.seconds * 1000).toLocaleString()
        : (booking.createdAt ? String(booking.createdAt) : 'N/A');
      doc.text(`Booking Created: ${createdAtText}`, rightX, rY);

      // place QR code on the right-bottom of the box
      const qrSize = 90;
      const qrX = pageWidth - margin - qrSize - 12;
      const qrY = y + 40;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // small note near QR
      doc.setFontSize(9);
      doc.setTextColor(100,100,100);
      doc.text('Scan QR to view ticket details', qrX - 10, qrY + qrSize + 14);

      // below box: terms / instructions
      const footY = y + 170;
      doc.setFontSize(10);
      doc.setTextColor(60,60,60);
      doc.text('Important:', startX, footY);
      doc.setFontSize(9);
      doc.text('• Please arrive 15 minutes before departure.', startX, footY + 14);
      doc.text('• Carry a valid government ID for verification.', startX, footY + 28);
      doc.text('• This ticket is valid only after confirmation.', startX, footY + 42);

      // small footer
      doc.setFontSize(10);
      doc.setTextColor(120,120,120);
      doc.text('Generated by BookMyRide', startX, pageWidth - 40);

      // manual save (only on click)
      doc.save(`Ticket_${booking.id}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('Failed to generate PDF ticket.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return {bg:'#dcfce7', text:'#166534', icon:'✓'};
      case 'pending': return {bg:'#fef3c7', text:'#92400e', icon:'⏳'};
      case 'cancelled': return {bg:'#fee2e2', text:'#991b1b', icon:'✗'};
      case 'completed': return {bg:'#dbeafe', text:'#1e40af', icon:'✓'};
      default: return {bg:'#f3f4f6', text:'#374151', icon:'•'};
    }
  };

  if(loading) {
    return (
      <div className="container">
        <div className="card" style={{textAlign:'center', padding:60}}>
          <div style={{fontSize:48, marginBottom:16}}>⏳</div>
          <h3>Loading your bookings...</h3>
        </div>
      </div>
    );
  }

  if(!auth.currentUser) {
    return (
      <div className="container">
        <div className="card" style={{textAlign:'center', padding:60}}>
          <div style={{fontSize:64, marginBottom:16}}>🔐</div>
          <h2>Please Login</h2>
          <p className="muted" style={{marginBottom:24}}>You need to be logged in to view your bookings</p>
          <button onClick={() => navigate('/login')} className="btn" style={{padding:'12px 32px'}}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  // Cancel booking function - put this inside the component, but outside any other function
const cancelBooking = async (booking) => {
  if (!booking || booking.status === 'cancelled') {
    alert('This booking is already cancelled.');
    return;
  }

  const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
  if (!confirmCancel) return;

  try {
    const bookingRef = doc(db, 'bookings', booking.id);
    await updateDoc(bookingRef, { status: 'cancelled' });
    alert('Booking cancelled successfully.');
  } catch (err) {
    console.error('Failed to cancel booking:', err);
    alert('Failed to cancel booking. Please try again.');
  }
};
const renderBookingAction = (booking) => {
  switch (booking.status) {
    case 'pending':
      return (
        <button
          onClick={() => cancelBooking(booking)}
          className="btn"
          style={{
            padding:'10px 20px',
            fontSize:14,
            background:'#ef4444',
            color:'white',
            cursor:'pointer'
          }}
        >
          ❌ Cancel Booking
        </button>
      );

    case 'confirmed':
      return (
        <button
          onClick={() => downloadTicketPDFDirect(booking)}
          className="btn"
          style={{
            padding:'10px 20px',
            fontSize:14,
            background:'#10b981',
            color:'white',
            cursor:'pointer'
          }}
        >
          📥 Download Ticket
        </button>
      );

    case 'cancelled':
      return (
        <button
          className="btn"
          style={{
            padding:'10px 20px',
            fontSize:14,
            background:'#9ca3af',
            color:'white',
            cursor:'not-allowed'
          }}
          disabled
        >
          ❌ Booking Cancelled
        </button>
      );

    case 'completed':
      return (
        <span style={{fontSize:14, fontWeight:'bold', color:'#1e40af'}}>✅ Trip Completed</span>
      );

    default:
      return null;
  }
};



  return (
    <div className="container">
      {/* Animated Approved Popup */}
      {approvedPopup.show && (
        <div style={{
          position:'fixed',
          top:20,
          right:20,
          zIndex:2000,
          background:'#ecfccb',
          border:'1px solid #86efac',
          padding:'12px 18px',
          borderRadius:10,
          boxShadow:'0 12px 40px rgba(16,24,40,0.15)',
          display:'flex',
          gap:12,
          alignItems:'center',
          animation:'popupIn 0.5s ease'
        }}>
          <div style={{fontSize:22}}>🎉</div>
          <div>
            <div style={{fontWeight:'bold'}}>Ticket Approved</div>
            <div style={{fontSize:13, color:'#065f46'}}>Booking for {approvedPopup.name} is approved</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popupIn {
          0% { transform: translateY(-20px); opacity:0 }
          60% { transform: translateY(8px); opacity:1 }
          100% { transform: translateY(0); opacity:1 }
        }
      `}</style>

      {/* Header Card */}
      <div className="card" style={{marginBottom:20, background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color:'white'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16}}>
          <div>
            <h2 style={{margin:0, color:'white'}}>👋 Welcome back!</h2>
            <p style={{margin:'8px 0 0 0', opacity:0.9}}>{auth.currentUser.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding:'10px 24px',
              borderRadius:8,
              border:'2px solid white',
              background:'transparent',
              color:'white',
              fontWeight:'bold',
              cursor:'pointer',
              transition:'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.target.style.background = 'white';
              e.target.style.color = '#f59e0b';
            }}
            onMouseOut={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'white';
            }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:20}}>
        {/* Approved Bookings */}
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:40}}>✅</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#10b981', marginTop:8}}>
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="muted">Approved Bookings</div>
        </div>

        {/* Cancelled Bookings */}
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:40}}>❌</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#ef4444', marginTop:8}}>
            {bookings.filter(b => b.status === 'cancelled').length}
          </div>
          <div className="muted">Cancelled Bookings</div>
        </div>

        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:40}}>📊</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#f59e0b', marginTop:8}}>{bookings.length}</div>
          <div className="muted">Total Bookings</div>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:40}}>🎫</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#22c55e', marginTop:8}}>
            {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
          </div>
          <div className="muted">Upcoming Trips</div>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:40}}>💰</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#3b82f6', marginTop:8}}>
            ₹{bookings.reduce((sum, b) => sum + (b.price || 0), 0)}
          </div>
          <div className="muted">Total Spent</div>
        </div>
      </div>

      {/* Filters & View Controls */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16}}>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {[
              {key:'all', label:'All', icon:'📋'},
              {key:'upcoming', label:'Upcoming', icon:'🎫'},
              {key:'completed', label:'Completed', icon:'✓'},
              {key:'cancelled', label:'Cancelled', icon:'✗'}
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding:'8px 16px',
                  borderRadius:8,
                  border: filter === f.key ? '2px solid #f59e0b' : '2px solid #e5e5e5',
                  background: filter === f.key ? '#fff7ed' : 'white',
                  fontWeight: filter === f.key ? 'bold' : 'normal',
                  cursor:'pointer',
                  transition:'all 0.2s ease'
                }}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          <div style={{display:'flex', gap:8}}>
            <button
              onClick={() => setViewMode('card')}
              style={{
                padding:'8px 16px',
                borderRadius:8,
                border: viewMode === 'card' ? '2px solid #f59e0b' : '2px solid #e5e5e5',
                background: viewMode === 'card' ? '#fff7ed' : 'white',
                cursor:'pointer'
              }}>
              📇 Card
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding:'8px 16px',
                borderRadius:8,
                border: viewMode === 'list' ? '2px solid #f59e0b' : '2px solid #e5e5e5',
                background: viewMode === 'list' ? '#fff7ed' : 'white',
                cursor:'pointer'
              }}>
              📝 List
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card" style={{textAlign:'center', padding:60}}>
          <div style={{fontSize:64, marginBottom:16}}>
            {filter === 'all' ? '📭' : filter === 'upcoming' ? '🎫' : filter === 'completed' ? '✓' : '✗'}
          </div>
          <h3>No {filter !== 'all' ? filter : ''} bookings yet</h3>
          <p className="muted" style={{marginBottom:24}}>Start planning your journey today!</p>
          <button onClick={() => navigate('/')} className="btn" style={{padding:'12px 32px'}}>
            🔍 Browse Routes
          </button>
        </div>
      ) : (
        <div style={{display:'grid', gap:16, gridTemplateColumns: viewMode === 'card' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr'}}>
          {filteredBookings.map(b => {
            const statusStyle = getStatusColor(b.status);

            return viewMode === 'card' ? (
              // CARD VIEW
              <div key={b.id} className="card" style={{
                borderLeft:'6px solid #f59e0b',
                transition:'all 0.3s ease',
                cursor:'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:12}}>
                  <div>
                    <h3 style={{margin:0, fontSize:18}}>{b.routeName}</h3>
                    <div className="muted" style={{fontSize:13, marginTop:4}}>
                      Booking ID: {b.id.substring(0, 8)}
                    </div>
                  </div>
                  <div style={{
                    padding:'6px 12px',
                    borderRadius:20,
                    background:statusStyle.bg,
                    color:statusStyle.text,
                    fontSize:12,
                    fontWeight:'bold'
                  }}>
                    {statusStyle.icon} {b.status}
                  </div>
                </div>

                <div style={{
                  padding:16,
                  background:'#f9fafb',
                  borderRadius:8,
                  marginBottom:12
                }}>
                  <div style={{display:'grid', gap:8, fontSize:14}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span className="muted">📅 Date:</span>
                      <span style={{fontWeight:'bold'}}>{b.date}</span>
                    </div>
                    {b.time && (
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span className="muted">🕐 Time:</span>
                        <span style={{fontWeight:'bold'}}>{b.time}</span>
                      </div>
                    )}
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span className="muted">🪑 Seats:</span>
                      <span style={{fontWeight:'bold'}}>
                        {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}
                      </span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span className="muted">👤 Passenger:</span>
                      <span style={{fontWeight:'bold'}}>{b.name}</span>
                    </div>
                  </div>
                </div>

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div className="muted" style={{fontSize:12}}>Total Amount</div>
                    <div style={{fontSize:24, fontWeight:'bold', color:'#f59e0b'}}>
                      ₹{b.price}
                    </div>
                  </div>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      {renderBookingAction(b)}
</div>

                </div>
              </div>
            ) : (
              // LIST VIEW
              <div key={b.id} className="card" style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                gap:16,
                flexWrap:'wrap',
                borderLeft:'4px solid #f59e0b'
              }}>
                <div style={{flex:'1 1 200px'}}>
                  <h4 style={{margin:'0 0 4px 0'}}>{b.routeName}</h4>
                  <div className="muted" style={{fontSize:13}}>ID: {b.id.substring(0, 12)}</div>
                </div>

                <div style={{flex:'0 0 120px', textAlign:'center'}}>
                  <div className="muted" style={{fontSize:12}}>Date</div>
                  <div style={{fontWeight:'bold', fontSize:14}}>{b.date}</div>
                </div>

                <div style={{flex: '0 0 80px', textAlign: 'center'}}>
                  <div style={{fontSize: 12, color: '#6b7280'}}>Seats</div>
                  <div style={{fontWeight: 'bold', fontSize: 14}}>
                    {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}
                  </div>
                </div>

                <div style={{flex:'0 0 100px', textAlign:'center'}}>
                  <div className="muted" style={{fontSize:12}}>Amount</div>
                  <div style={{fontWeight:'bold', fontSize:18, color:'#f59e0b'}}>₹{b.price}</div>
                </div>

                <div style={{flex:'0 0 120px', textAlign:'center'}}>
                  <div style={{
                    padding:'6px 12px',
                    borderRadius:20,
                    background:statusStyle.bg,
                    color:statusStyle.text,
                    fontSize:12,
                    fontWeight:'bold',
                    display:'inline-block'
                  }}>
                    {statusStyle.icon} {b.status}
                  </div>
                </div>

                {b.status === "confirmed" && (
                  <button 
                    onClick={() => downloadTicketPDFDirect(b)}
                    className="btn"
                    style={{padding:'10px 20px', fontSize:14}}>
                    🖨️ Download Ticket
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Action Button */}
      <div style={{
        position:'fixed',
        bottom:30,
        right:30,
        zIndex:1000
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            width:60,
            height:60,
            borderRadius:'50%',
            background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color:'white',
            border:'none',
            fontSize:28,
            cursor:'pointer',
            boxShadow:'0 8px 24px rgba(245, 158, 11, 0.4)',
            transition:'all 0.3s ease'
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}>
          ➕
        </button>
      </div>

      {/* Hidden HTML tickets kept for preview (not used for PDF generation) */}
      {filteredBookings.map(booking => (
        <div
          id={`ticket-${booking.id}`}
          style={{
            width: 500,
            padding: 20,
            marginBottom: 30,
            fontFamily: 'Arial, sans-serif',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 10,
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            display: 'none' // hide it from UI
          }}
          key={booking.id + '-ticket'}
        >
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🎫 BookMyRide Ticket</h2>
          <p><strong>Passenger:</strong> {booking.name}</p>
          <p><strong>Phone:</strong> {booking.phone}</p>
          <p><strong>Route:</strong> {booking.routeName}</p>
          <p><strong>Date:</strong> {booking.date}</p>
          <p><strong>Time:</strong> {booking.time || 'N/A'}</p>
          <p><strong>Seats:</strong> {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</p>
          <p><strong>Total:</strong> ₹{booking.price}</p>
          <p><strong>Status:</strong> {booking.status?.toUpperCase()}</p>
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#888' }}>
            Please arrive 15 minutes early and carry valid ID.
          </div>
        </div>
      ))}

    </div>
  );
}
