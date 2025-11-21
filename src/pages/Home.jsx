import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RouteMap2D from '../components/RouteMap2D';

// Enhanced mock routes with more details
const MOCK_ROUTES = [
  {
    id:'r1',
    type:'bus',
    name:'CBE - Erode Express',
    vehicle:'Volvo AC',
    seats:40,
    available:12,
    price:250,
    duration:'2h 30m',
    stops:['Coimbatore','Sulur','Tiruppur','Erode'],
    rating:4.5,
    departures:['06:00 AM','09:30 AM','02:00 PM','06:30 PM'],
    amenities:['AC','WiFi','Charging Port']
  },
  {
    id:'r2',
    type:'train',
    name:'CBE - Madurai Superfast',
    vehicle:'Express Train',
    seats:100,
    available:45,
    price:150,
    duration:'4h 15m',
    stops:['Coimbatore','Karur','Dindigul','Madurai'],
    rating:4.8,
    departures:['05:45 AM','12:30 PM','08:00 PM'],
    amenities:['Pantry','AC Coach','Reserved Seating']
  },
  {
    id:'r3',
    type:'bus',
    name:'CBE - Chennai Luxury',
    vehicle:'Mercedes Multi-Axle',
    seats:36,
    available:8,
    price:850,
    duration:'8h 00m',
    stops:['Coimbatore','Salem','Dharmapuri','Krishnagiri','Chennai'],
    rating:4.9,
    departures:['10:00 PM','11:00 PM'],
    amenities:['AC Sleeper','WiFi','Blanket','Water Bottle']
  },
  {
    id:'r4',
    type:'train',
    name:'Nilgiri Express',
    vehicle:'Passenger Train',
    seats:120,
    available:67,
    price:80,
    duration:'3h 45m',
    stops:['Coimbatore','Mettupalayam','Coonoor','Ooty'],
    rating:4.3,
    departures:['07:15 AM','03:30 PM'],
    amenities:['Scenic Route','Reserved Seating']
  },
];

export default function Home(){
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: 'all',
    sortBy: 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRoute, setHoveredRoute] = useState(null);

  // Filter and sort routes
  const filteredRoutes = MOCK_ROUTES.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         route.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.stops.some(stop => stop.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filters.type === 'all' || route.type === filters.type;
    
    const matchesPrice = filters.priceRange === 'all' || 
                        (filters.priceRange === 'budget' && route.price < 200) ||
                        (filters.priceRange === 'mid' && route.price >= 200 && route.price < 500) ||
                        (filters.priceRange === 'premium' && route.price >= 500);
    
    return matchesSearch && matchesType && matchesPrice;
  }).sort((a, b) => {
    if(filters.sortBy === 'price') return a.price - b.price;
    if(filters.sortBy === 'duration') return parseFloat(a.duration) - parseFloat(b.duration);
    if(filters.sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="container">
      {/* Hero Section with Search */}
      <div className="card" style={{background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color:'white', marginBottom:20}}>
        <div style={{textAlign:'center', padding:'20px 0'}}>
          <h1 style={{fontSize:36, margin:0, color:'white'}}>🚌 Find Your Perfect Journey 🚂</h1>
          <p style={{fontSize:16, marginTop:8, opacity:0.9}}>Book buses and trains across Tamil Nadu with ease</p>
        </div>
        
        {/* Search Bar */}
        <div style={{maxWidth:700, margin:'20px auto'}}>
          <input 
            placeholder="🔍 Search by destination, route, or vehicle type..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width:'100%',
              padding:'14px 20px',
              fontSize:16,
              borderRadius:12,
              border:'none',
              boxShadow:'0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
        </div>

        {/* Quick Filter Buttons */}
        <div style={{display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginTop:16}}>
          <button 
            onClick={() => setFilters({...filters, type: filters.type === 'bus' ? 'all' : 'bus'})}
            style={{
              padding:'10px 20px',
              borderRadius:25,
              border:'2px solid white',
              background: filters.type === 'bus' ? 'white' : 'transparent',
              color: filters.type === 'bus' ? '#f59e0b' : 'white',
              fontWeight:'bold',
              cursor:'pointer'
            }}>
            🚌 Buses
          </button>
          <button 
            onClick={() => setFilters({...filters, type: filters.type === 'train' ? 'all' : 'train'})}
            style={{
              padding:'10px 20px',
              borderRadius:25,
              border:'2px solid white',
              background: filters.type === 'train' ? 'white' : 'transparent',
              color: filters.type === 'train' ? '#f59e0b' : 'white',
              fontWeight:'bold',
              cursor:'pointer'
            }}>
            🚂 Trains
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding:'10px 20px',
              borderRadius:25,
              border:'2px solid white',
              background:'transparent',
              color:'white',
              fontWeight:'bold',
              cursor:'pointer'
            }}>
            ⚙️ {showFilters ? 'Hide' : 'More'} Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={{marginTop:20, padding:20, background:'rgba(255,255,255,0.2)', borderRadius:12}}>
            <div style={{marginBottom:16}}>
              <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>💰 Price Range</label>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {[
                  {key:'all', label:'All Prices'},
                  {key:'budget', label:'Budget (< ₹200)'},
                  {key:'mid', label:'Mid-range (₹200-500)'},
                  {key:'premium', label:'Premium (₹500+)'}
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setFilters({...filters, priceRange: option.key})}
                    style={{
                      padding:'8px 16px',
                      borderRadius:8,
                      border:'none',
                      background: filters.priceRange === option.key ? 'white' : 'rgba(255,255,255,0.3)',
                      color: filters.priceRange === option.key ? '#f59e0b' : 'white',
                      fontWeight: filters.priceRange === option.key ? 'bold' : 'normal',
                      cursor:'pointer'
                    }}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>📊 Sort By</label>
              <select 
                value={filters.sortBy} 
                onChange={e => setFilters({...filters, sortBy: e.target.value})}
                style={{
                  width:'100%',
                  padding:'10px 16px',
                  borderRadius:8,
                  border:'none',
                  fontSize:15,
                  fontWeight:'500'
                }}>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price">💵 Lowest Price</option>
                <option value="duration">⏱️ Shortest Duration</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:20}}>
        <div className="card" style={{textAlign:'center', padding:20}}>
          <div style={{fontSize:40}}>🚍</div>
          <div style={{fontSize:28, fontWeight:'bold', color:'#f59e0b'}}>{MOCK_ROUTES.length}</div>
          <div className="muted">Active Routes</div>
        </div>
        <div className="card" style={{textAlign:'center', padding:20}}>
          <div style={{fontSize:40}}>👥</div>
          <div style={{fontSize:28, fontWeight:'bold', color:'#f59e0b'}}>1,234</div>
          <div className="muted">Happy Travelers</div>
        </div>
        <div className="card" style={{textAlign:'center', padding:20}}>
          <div style={{fontSize:40}}>⭐</div>
          <div style={{fontSize:28, fontWeight:'bold', color:'#f59e0b'}}>4.7</div>
          <div className="muted">Average Rating</div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid">
        <div>
          <h2 style={{marginBottom:16}}>
            {filteredRoutes.length} Route{filteredRoutes.length !== 1 ? 's' : ''} Available
          </h2>
          
          {filteredRoutes.length === 0 ? (
            <div className="card" style={{textAlign:'center', padding:40}}>
              <div style={{fontSize:60, marginBottom:16}}>🔍</div>
              <h3>No routes found</h3>
              <p className="muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              {filteredRoutes.map(r => (
                <div 
                  key={r.id} 
                  className="route-item card" 
                  onMouseEnter={() => setHoveredRoute(r.id)}
                  onMouseLeave={() => setHoveredRoute(null)}
                  style={{
                    padding:20,
                    transition:'all 0.3s ease',
                    transform: hoveredRoute === r.id ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredRoute === r.id ? '0 12px 24px rgba(0,0,0,0.15)' : '0 6px 18px rgba(91,57,36,0.08)'
                  }}>
                  
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', gap:16, flexWrap:'wrap'}}>
                    <div style={{flex:1, minWidth:300}}>
                      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
                        <span style={{fontSize:32}}>{r.type === 'bus' ? '🚌' : '🚂'}</span>
                        <div>
                          <h3 style={{margin:0, fontSize:22}}>{r.name}</h3>
                          <p className="muted" style={{margin:'4px 0 0 0'}}>{r.vehicle}</p>
                        </div>
                        <div style={{
                          marginLeft:'auto',
                          background:'#22c55e',
                          color:'white',
                          padding:'4px 12px',
                          borderRadius:20,
                          fontSize:14,
                          fontWeight:'bold',
                          display:'flex',
                          alignItems:'center',
                          gap:4
                        }}>
                          ⭐ {r.rating}
                        </div>
                      </div>

                      {/* Route Info */}
                      <div style={{display:'flex', flexWrap:'wrap', gap:16, marginBottom:12, fontSize:14}}>
                        <span>⏱️ {r.duration}</span>
                        <span>🪑 {r.available}/{r.seats} available</span>
                        <span>📍 {r.stops.length} stops</span>
                      </div>

                      {/* Amenities */}
                      <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:12}}>
                        {r.amenities.map(amenity => (
                          <span key={amenity} style={{
                            background:'#fff7ed',
                            color:'#ea580c',
                            padding:'4px 10px',
                            borderRadius:12,
                            fontSize:12,
                            fontWeight:'500'
                          }}>
                            {amenity}
                          </span>
                        ))}
                      </div>

                      {/* Stops Route */}
                      <div style={{
                        background:'#fef3c7',
                        padding:10,
                        borderRadius:8,
                        marginBottom:12
                      }}>
                        <div style={{fontSize:12, fontWeight:'bold', marginBottom:4, color:'#92400e'}}>Route:</div>
                        <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', fontSize:13}}>
                          {r.stops.map((stop, idx) => (
                            <React.Fragment key={stop}>
                              <span style={{fontWeight:'500'}}>{stop}</span>
                              {idx < r.stops.length - 1 && <span style={{color:'#d97706'}}>→</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Departures */}
                      <div className="muted" style={{fontSize:13}}>
                        🕐 Departures: {r.departures.join(' • ')}
                      </div>
                    </div>

                    {/* Price & Book Section */}
                    <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12}}>
                      <div>
                        <div style={{fontSize:32, fontWeight:'bold', color:'#f59e0b'}}>₹{r.price}</div>
                        <div className="muted" style={{fontSize:13}}>per seat</div>
                      </div>
                      <Link 
                        to={`/booking/${r.id}`} 
                        className="btn"
                        style={{
                          padding:'12px 32px',
                          fontSize:16,
                          fontWeight:'bold',
                          textDecoration:'none',
                          display:'inline-block',
                          transition:'all 0.3s ease',
                          transform: hoveredRoute === r.id ? 'scale(1.05)' : 'scale(1)'
                        }}>
                        Book Now →
                      </Link>
                    </div>
                  </div>

                  {/* Map Preview */}
                  {hoveredRoute === r.id && (
                    <div style={{marginTop:16, animation:'fadeIn 0.3s ease'}}>
                      <div className="map-wrap">
                        <RouteMap2D small />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="card" style={{height:'fit-content', position:'sticky', top:20}}>
          <h3>Live Route Map</h3>
          <div className="map-wrap">
            <RouteMap2D />
          </div>
          <p className="muted" style={{marginTop:12, fontSize:14}}>
            📍 Track your route in real-time with our interactive map
          </p>
          
          <div style={{marginTop:20, padding:16, background:'#fef3c7', borderRadius:8}}>
            <h4 style={{marginTop:0, color:'#92400e'}}>💡 Pro Tips</h4>
            <ul style={{fontSize:13, color:'#78350f', paddingLeft:20, margin:0}}>
              <li>Book early for better seat selection</li>
              <li>Check departure times carefully</li>
              <li>Arrive 15 minutes before departure</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="footer">Made with ❤️ • BookMyRide Pro</div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}