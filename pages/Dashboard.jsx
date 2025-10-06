import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function Dashboard(){
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
  const [viewMode, setViewMode] = useState('card'); // card or list
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        if(!auth.currentUser) {
          setLoading(false);
          return;
        }
        const q = query(
          collection(db,'bookings'), 
          where('user','==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const arr = snap.docs.map(d => ({id:d.id,...d.data()}));
        setBookings(arr);
      } catch(err) { 
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleLogout = async() => {
    await signOut(auth);
    navigate('/login');
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if(filter === 'all') return true;
    if(filter === 'upcoming') return b.status === 'pending' || b.status === 'confirmed';
    if(filter === 'completed') return b.status === 'completed';
    if(filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });
// ✅ Export All Tickets as CSV

// ✅ Download individual ticket
const downloadTicket = (booking) => {
  const ticketContent = `
━━━━━━━━━━━━━━━━━━━━━━━━
   BOOKMYRIDE PRO TICKET
━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.id}
Route: ${booking.routeName}
Date: ${booking.date}
Time: ${booking.time || 'N/A'}
Seats: ${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
Passenger: ${booking.name}
Phone: ${booking.phone}
Total: ₹${booking.price}
Status: ${booking.status?.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━
Please arrive 15 mins early
Carry a valid ID proof
━━━━━━━━━━━━━━━━━━━━━━━━
  `;
  const blob = new Blob([ticketContent], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BookMyRide_Ticket_${booking.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
const downloadTicketPDF = async (booking) => {
  const ticketId = `ticket-${booking.id}`;
  const input = document.getElementById(ticketId);

  if (!input) return alert("Ticket not found!");

  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`BookMyRide_Ticket_${booking.id}.pdf`);
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

  return (
    <div className="container">
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
        {/* ✅ Approved Bookings */}
<div className="card" style={{textAlign:'center'}}>
  <div style={{fontSize:40}}>✅</div>
  <div style={{fontSize:32, fontWeight:'bold', color:'#10b981', marginTop:8}}>
    {bookings.filter(b => b.status === 'confirmed').length}
  </div>
  <div className="muted">Approved Bookings</div>
</div>

{/* ✅ Cancelled Bookings */}
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
              <div key={b.id} classNaame="card" style={{
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
                  <button 
                    onClick={() => downloadTicket(b)}
                    className="btn"
                    style={{padding:'10px 20px', fontSize:14}}>
                    📥 Download Ticket
                  </button>
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
                <div style={{fontSize: 12, color: '#6b7280'}}>Seats</div> {/* optional: muted color */}
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

                <button 
                onClick={() => downloadTicketPDF(b)}
                className="btn"
                style={{padding:'10px 20px', fontSize:14}}>
                🖨️ Download Ticket
                </button>

              </div>
            );
          })}
        </div>
      )}
      {/* ✅ Export All Bookings
<div style={{textAlign:'center', marginTop: 30}}>
  <button 
    onClick={downloadAllTicketsCSV}
    className="btn"
    style={{padding: '12px 32px', fontSize: 16}}>
    📄 Export All as CSV
  </button>
</div> */}

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