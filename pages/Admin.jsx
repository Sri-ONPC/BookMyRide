import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


export default function Admin(){
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db,'bookings'));
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
  

  const confirmBooking = async(id) => {
    try {
      await updateDoc(doc(db,'bookings',id), {status:'confirmed'});
      setBookings(b => b.map(x => x.id === id ? {...x, status:'confirmed'} : x));
      alert('✓ Booking confirmed successfully!');
    } catch(err) {
      alert('Error: ' + err.message);
    }
  };

const cancelBooking = async(id) => {
  // eslint-disable-next-line no-restricted-globals
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    await updateDoc(doc(db,'bookings',id), {status:'cancelled'});
    setBookings(b => b.map(x => x.id === id ? {...x, status:'cancelled'} : x));
    alert('✗ Booking cancelled');
  } catch(err) {
    alert('Error: ' + err.message);
  }
};


const deleteBooking = async (id) => {
  // eslint-disable-next-line no-restricted-globals
  const isConfirmed = confirm("Are you sure you want to delete this booking?");
  if (!isConfirmed) return; // Stop if user clicks Cancel

  try {
    await deleteDoc(doc(db, 'bookings', id));
    setBookings((b) => b.filter((x) => x.id !== id));
    alert('🗑️ Booking deleted');
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

  const handleLogout = async() => {
    await signOut(auth);
    navigate('/login');
  };

  // Filter and search bookings
  const filteredBookings = bookings
    .filter(b => {
      const matchesFilter = filter === 'all' || b.status === filter;
      const matchesSearch = searchTerm === '' || 
        b.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone?.includes(searchTerm) ||
        b.id.includes(searchTerm);
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if(sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if(sortBy === 'price') return b.price - a.price;
      if(sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });

  // Statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.price || 0), 0)
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'confirmed': return {bg:'#dcfce7', text:'#166534', border:'#22c55e'};
      case 'pending': return {bg:'#fef3c7', text:'#92400e', border:'#f59e0b'};
      case 'cancelled': return {bg:'#fee2e2', text:'#991b1b', border:'#ef4444'};
      default: return {bg:'#f3f4f6', text:'#374151', border:'#9ca3af'};
    }
  };

  if(loading) {
    return (
      <div className="container">
        <div className="card" style={{textAlign:'center', padding:60}}>
          <div style={{fontSize:48, marginBottom:16}} className="loading">⏳</div>
          <h3>Loading admin panel...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{
        marginBottom:20,
        background:'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color:'white'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16}}>
          <div>
            <h2 style={{margin:0, color:'white'}}>⚙️ Admin Dashboard</h2>
            <p style={{margin:'8px 0 0 0', opacity:0.9}}>Manage all bookings and routes</p>
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
              cursor:'pointer'
            }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',
        gap:16,
        marginBottom:20
      }}>
        <div className="card" style={{textAlign:'center', borderTop:'4px solid #3b82f6'}}>
          <div style={{fontSize:40}}>📊</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#3b82f6', marginTop:8}}>
            {stats.total}
          </div>
          <div className="muted">Total Bookings</div>
        </div>

        <div className="card" style={{textAlign:'center', borderTop:'4px solid #f59e0b'}}>
          <div style={{fontSize:40}}>⏳</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#f59e0b', marginTop:8}}>
            {stats.pending}
          </div>
          <div className="muted">Pending</div>
        </div>

        <div className="card" style={{textAlign:'center', borderTop:'4px solid #22c55e'}}>
          <div style={{fontSize:40}}>✓</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#22c55e', marginTop:8}}>
            {stats.confirmed}
          </div>
          <div className="muted">Confirmed</div>
        </div>

        <div className="card" style={{textAlign:'center', borderTop:'4px solid #ef4444'}}>
          <div style={{fontSize:40}}>✗</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#ef4444', marginTop:8}}>
            {stats.cancelled}
          </div>
          <div className="muted">Cancelled</div>
        </div>

        <div className="card" style={{textAlign:'center', borderTop:'4px solid #8b5cf6'}}>
          <div style={{fontSize:40}}>💰</div>
          <div style={{fontSize:32, fontWeight:'bold', color:'#8b5cf6', marginTop:8}}>
            ₹{stats.revenue}
          </div>
          <div className="muted">Total Revenue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'grid', gap:16}}>
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="🔍 Search by route, passenger name, phone, or booking ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width:'100%',
                padding:12,
                fontSize:15,
                borderRadius:8,
                border:'2px solid #e5e7eb'
              }}
            />
          </div>

          {/* Filters Row */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <span style={{fontWeight:'bold', alignSelf:'center'}}>Filter:</span>
              {[
                {key:'all', label:'All', count:stats.total},
                {key:'pending', label:'Pending', count:stats.pending},
                {key:'confirmed', label:'Confirmed', count:stats.confirmed},
                {key:'cancelled', label:'Cancelled', count:stats.cancelled}
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding:'8px 16px',
                    borderRadius:8,
                    border: filter === f.key ? '2px solid #6366f1' : '2px solid #e5e7eb',
                    background: filter === f.key ? '#eef2ff' : 'white',
                    fontWeight: filter === f.key ? 'bold' : 'normal',
                    cursor:'pointer',
                    fontSize:14
                  }}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <span style={{fontWeight:'bold', fontSize:14}}>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding:'8px 12px',
                  borderRadius:8,
                  border:'2px solid #e5e7eb',
                  fontSize:14
                }}>
                <option value="date">Date (Newest First)</option>
                <option value="price">Price (Highest First)</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="card" style={{textAlign:'center', padding:60}}>
          <div style={{fontSize:64, marginBottom:16}}>📭</div>
          <h3>No bookings found</h3>
          <p className="muted">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f9fafb', borderBottom:'2px solid #e5e7eb'}}>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Booking ID</th>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Route</th>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Passenger</th>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Date</th>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Seats</th>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Price</th>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Status</th>
                  <th style={{padding:16, textAlign:'left', fontWeight:'bold'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => {
                  const statusStyle = getStatusStyle(b.status);
                  return (
                    <tr key={b.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                      <td style={{padding:16, fontSize:13, fontFamily:'monospace'}}>
                        {b.id.substring(0, 8)}...
                      </td>
                      <td style={{padding:16}}>
                        <div style={{fontWeight:'bold'}}>{b.routeName}</div>
                        <div style={{fontSize:12, color:'#6b7280'}}>{b.time || 'N/A'}</div>
                      </td>
                      <td style={{padding:16}}>
                        <div style={{fontWeight:'500'}}>{b.name}</div>
                        <div style={{fontSize:12, color:'#6b7280'}}>{b.phone}</div>
                      </td>
                      <td style={{padding:16, fontSize:14}}>{b.date}</td>
                      <td style={{padding:16, fontSize:14, fontWeight:'500'}}>
                        {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}
                      </td>
                      <td style={{padding:16, fontSize:16, fontWeight:'bold', color:'#f59e0b'}}>
                        ₹{b.price}
                      </td>
                      <td style={{padding:16}}>
                        <span style={{
                          padding:'6px 12px',
                          borderRadius:20,
                          background:statusStyle.bg,
                          color:statusStyle.text,
                          fontSize:12,
                          fontWeight:'bold',
                          border:`2px solid ${statusStyle.border}`
                        }}>
                          {b.status || 'pending'}
                        </span>
                      </td>
                      <td style={{padding:16}}>
                        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                          {b.status !== 'confirmed' && (
                            <button
                              onClick={() => confirmBooking(b.id)}
                              style={{
                                padding:'6px 12px',
                                borderRadius:6,
                                border:'none',
                                background:'#22c55e',
                                color:'white',
                                fontSize:12,
                                fontWeight:'bold',
                                cursor:'pointer'
                              }}>
                              ✓ Confirm
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              style={{
                                padding:'6px 12px',
                                borderRadius:6,
                                border:'none',
                                background:'#f59e0b',
                                color:'white',
                                fontSize:12,
                                fontWeight:'bold',
                                cursor:'pointer'
                              }}>
                              ✗ Cancel
                            </button>
                          )}
                          <button
                            onClick={() => deleteBooking(b.id)}
                            style={{
                              padding:'6px 12px',
                              borderRadius:6,
                              border:'none',
                              background:'#ef4444',
                              color:'white',
                              fontSize:12,
                              fontWeight:'bold',
                              cursor:'pointer'
                            }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}