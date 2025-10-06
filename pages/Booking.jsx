import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import SeatMap from '../components/SeatMap';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MOCK = {
  r1:{id:'r1',name:'CBE - Erode Express',price:250,totalSeats:40,vehicle:'Volvo AC',type:'bus',duration:'2h 30m',departures:['06:00 AM','09:30 AM','02:00 PM','06:30 PM']},
  r2:{id:'r2',name:'CBE - Madurai Superfast',price:150,totalSeats:100,vehicle:'Express Train',type:'train',duration:'4h 15m',departures:['05:45 AM','12:30 PM','08:00 PM']},
  r3:{id:'r3',name:'CBE - Chennai Luxury',price:850,totalSeats:36,vehicle:'Mercedes Multi-Axle',type:'bus',duration:'8h 00m',departures:['10:00 PM','11:00 PM']},
  r4:{id:'r4',name:'Nilgiri Express',price:80,totalSeats:120,vehicle:'Passenger Train',type:'train',duration:'3h 45m',departures:['07:15 AM','03:30 PM']},
};

export default function Booking(){
  const { id } = useParams();
  const nav = useNavigate();
  const route = MOCK[id] || MOCK['r1'];
  
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalPrice = selectedSeats.length * route.price;

  const steps = [
    { num: 1, title: 'Select Date & Time', icon: '📅' },
    { num: 2, title: 'Choose Seats', icon: '🪑' },
    { num: 3, title: 'Passenger Details', icon: '👤' },
    { num: 4, title: 'Review & Confirm', icon: '✅' }
  ];

  const canProceedStep1 = date && departureTime;
  const canProceedStep2 = selectedSeats.length > 0;
  const canProceedStep3 = name && age && phone;

  const submit = async() => {
    setLoading(true);
    try {
      await addDoc(collection(db,'bookings'),{
        routeId: route.id,
        routeName: route.name,
        user: auth.currentUser ? auth.currentUser.uid : 'guest',
        name,
        age,
        phone,
        email,
        seats: selectedSeats,
        price: totalPrice,
        date: date.toLocaleDateString(),
        time: departureTime,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      alert('🎉 Booking Confirmed! Your journey is all set.');
      nav('/dashboard');
    } catch(err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{maxWidth:900}}>
      {/* Progress Indicator */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative'}}>
          {/* Progress Line */}
          <div style={{
            position:'absolute',
            top:'20px',
            left:'10%',
            right:'10%',
            height:4,
            background:'#e5e5e5',
            zIndex:0
          }}>
            <div style={{
              height:'100%',
              background:'#f59e0b',
              width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              transition:'width 0.3s ease'
            }} />
          </div>

          {steps.map(s => (
            <div key={s.num} style={{flex:1, textAlign:'center', position:'relative', zIndex:1}}>
              <div style={{
                width:40,
                height:40,
                borderRadius:'50%',
                background: step >= s.num ? '#f59e0b' : '#e5e5e5',
                color: step >= s.num ? 'white' : '#999',
                display:'inline-flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize:18,
                fontWeight:'bold',
                marginBottom:8,
                transition:'all 0.3s ease',
                border: step === s.num ? '3px solid #d97706' : 'none'
              }}>
                {step > s.num ? '✓' : s.icon}
              </div>
              <div style={{
                fontSize:13,
                fontWeight: step === s.num ? 'bold' : 'normal',
                color: step >= s.num ? '#5B3924' : '#999'
              }}>
                {s.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Info Header */}
      <div className="card" style={{marginBottom:20, background:'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:16}}>
          <div>
            <h2 style={{margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:32}}>{route.type === 'bus' ? '🚌' : '🚂'}</span>
              {route.name}
            </h2>
            <p className="muted" style={{margin:0}}>{route.vehicle} • {route.duration}</p>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:28, fontWeight:'bold', color:'#f59e0b'}}>₹{route.price}</div>
            <div className="muted" style={{fontSize:13}}>per seat</div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="card" style={{padding:30}}>
        {/* STEP 1: Date & Time */}
        {step === 1 && (
          <div>
            <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:8}}>
              📅 Select Journey Date & Time
            </h3>
            
            <div style={{marginBottom:24}}>
              <label style={{display:'block', fontWeight:'bold', marginBottom:12, fontSize:15}}>
                Choose Travel Date
              </label>
              <Calendar 
                onChange={setDate} 
                value={date}
                minDate={new Date()}
                className="custom-calendar"
              />
            </div>

            <div>
              <label style={{display:'block', fontWeight:'bold', marginBottom:12, fontSize:15}}>
                Select Departure Time
              </label>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12}}>
                {route.departures.map(time => (
                  <button
                    key={time}
                    onClick={() => setDepartureTime(time)}
                    style={{
                      padding:16,
                      borderRadius:12,
                      border: departureTime === time ? '3px solid #f59e0b' : '2px solid #e5e5e5',
                      background: departureTime === time ? '#fff7ed' : 'white',
                      cursor:'pointer',
                      fontWeight: departureTime === time ? 'bold' : 'normal',
                      fontSize:16,
                      transition:'all 0.2s ease'
                    }}>
                    🕐 {time}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginTop:24, padding:16, background:'#fef3c7', borderRadius:12}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:'bold', color:'#92400e'}}>Selected Date:</div>
                  <div style={{fontSize:18, color:'#78350f', marginTop:4}}>
                    {date.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                  </div>
                </div>
                {departureTime && (
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:'bold', color:'#92400e'}}>Departure:</div>
                    <div style={{fontSize:18, color:'#78350f', marginTop:4}}>{departureTime}</div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="btn"
              style={{
                width:'100%',
                marginTop:20,
                padding:14,
                fontSize:16,
                opacity: canProceedStep1 ? 1 : 0.5,
                cursor: canProceedStep1 ? 'pointer' : 'not-allowed'
              }}>
              Continue to Seat Selection →
            </button>
          </div>
        )}

        {/* STEP 2: Seat Selection */}
        {step === 2 && (
          <div>
            <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:8}}>
              🪑 Choose Your Seats
            </h3>
            
            <SeatMap total={route.totalSeats} onChange={setSelectedSeats} />

            {selectedSeats.length > 0 && (
              <div style={{marginTop:20, padding:20, background:'#dcfce7', borderRadius:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
                  <div>
                    <div style={{fontWeight:'bold', color:'#166534', fontSize:15}}>Selected Seats:</div>
                    <div style={{fontSize:20, color:'#15803d', marginTop:4, fontWeight:'bold'}}>
                      {selectedSeats.sort((a,b) => a - b).join(', ')}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:'bold', color:'#166534', fontSize:15}}>Total Amount:</div>
                    <div style={{fontSize:28, color:'#15803d', marginTop:4, fontWeight:'bold'}}>
                      ₹{totalPrice}
                    </div>
                    <div style={{fontSize:13, color:'#166534'}}>
                      ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × ₹{route.price})
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{display:'flex', gap:12, marginTop:20}}>
              <button 
                onClick={() => setStep(1)}
                style={{
                  flex:1,
                  padding:14,
                  borderRadius:12,
                  border:'2px solid #e5e5e5',
                  background:'white',
                  cursor:'pointer',
                  fontSize:16,
                  fontWeight:'500'
                }}>
                ← Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="btn"
                style={{
                  flex:1,
                  padding:14,
                  fontSize:16,
                  opacity: canProceedStep2 ? 1 : 0.5,
                  cursor: canProceedStep2 ? 'pointer' : 'not-allowed'
                }}>
                Continue to Passenger Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Passenger Details */}
        {step === 3 && (
          <div>
            <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:8}}>
              👤 Passenger Information
            </h3>

            <div style={{display:'grid', gap:16}}>
              <div>
                <label style={{display:'block', fontWeight:'bold', marginBottom:8, fontSize:14}}>
                  Full Name *
                </label>
                <input 
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width:'100%',
                    padding:12,
                    fontSize:15,
                    borderRadius:8,
                    border:'2px solid #e5e5e5'
                  }}
                  required
                />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                <div>
                  <label style={{display:'block', fontWeight:'bold', marginBottom:8, fontSize:14}}>
                    Age *
                  </label>
                  <input 
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="Age"
                    style={{
                      width:'100%',
                      padding:12,
                      fontSize:15,
                      borderRadius:8,
                      border:'2px solid #e5e5e5'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{display:'block', fontWeight:'bold', marginBottom:8, fontSize:14}}>
                    Phone Number *
                  </label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    style={{
                      width:'100%',
                      padding:12,
                      fontSize:15,
                      borderRadius:8,
                      border:'2px solid #e5e5e5'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{display:'block', fontWeight:'bold', marginBottom:8, fontSize:14}}>
                  Email Address (Optional)
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{
                    width:'100%',
                    padding:12,
                    fontSize:15,
                    borderRadius:8,
                    border:'2px solid #e5e5e5'
                  }}
                />
              </div>
            </div>

            <div style={{marginTop:20, padding:16, background:'#dbeafe', borderRadius:12}}>
              <div style={{fontWeight:'bold', color:'#1e40af', marginBottom:8}}>📱 Booking Summary</div>
              <div style={{fontSize:14, color:'#1e3a8a'}}>
                <div>✓ Date: {date.toLocaleDateString()}</div>
                <div>✓ Time: {departureTime}</div>
                <div>✓ Seats: {selectedSeats.join(', ')}</div>
                <div>✓ Total: ₹{totalPrice}</div>
              </div>
            </div>

            <div style={{display:'flex', gap:12, marginTop:20}}>
              <button 
                onClick={() => setStep(2)}
                style={{
                  flex:1,
                  padding:14,
                  borderRadius:12,
                  border:'2px solid #e5e5e5',
                  background:'white',
                  cursor:'pointer',
                  fontSize:16,
                  fontWeight:'500'
                }}>
                ← Back
              </button>
              <button 
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="btn"
                style={{
                  flex:1,
                  padding:14,
                  fontSize:16,
                  opacity: canProceedStep3 ? 1 : 0.5,
                  cursor: canProceedStep3 ? 'pointer' : 'not-allowed'
                }}>
                Review Booking →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Confirm */}
        {step === 4 && (
          <div>
            <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:8}}>
              ✅ Review & Confirm Your Booking
            </h3>

            <div style={{display:'grid', gap:16}}>
              {/* Journey Details */}
              <div style={{padding:20, background:'#fff7ed', borderRadius:12}}>
                <h4 style={{margin:'0 0 12px 0', color:'#c2410c'}}>🚌 Journey Details</h4>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12, fontSize:14}}>
                  <div>
                    <span className="muted">Route:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{route.name}</div>
                  </div>
                  <div>
                    <span className="muted">Vehicle:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{route.vehicle}</div>
                  </div>
                  <div>
                    <span className="muted">Date:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{date.toLocaleDateString('en-IN')}</div>
                  </div>
                  <div>
                    <span className="muted">Departure:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{departureTime}</div>
                  </div>
                  <div>
                    <span className="muted">Duration:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{route.duration}</div>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div style={{padding:20, background:'#dcfce7', borderRadius:12}}>
                <h4 style={{margin:'0 0 12px 0', color:'#166534'}}>👤 Passenger Details</h4>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12, fontSize:14}}>
                  <div>
                    <span className="muted">Name:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{name}</div>
                  </div>
                  <div>
                    <span className="muted">Age:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{age} years</div>
                  </div>
                  <div>
                    <span className="muted">Phone:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{phone}</div>
                  </div>
                  <div>
                    <span className="muted">Email:</span>
                    <div style={{fontWeight:'bold', marginTop:4}}>{email || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Seat & Payment Details */}
              <div style={{padding:20, background:'#fef3c7', borderRadius:12}}>
                <h4 style={{margin:'0 0 12px 0', color:'#92400e'}}>🪑 Seat & Payment Details</h4>
                <div style={{fontSize:14}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                    <span>Selected Seats:</span>
                    <span style={{fontWeight:'bold'}}>{selectedSeats.sort((a,b) => a - b).join(', ')}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                    <span>Number of Seats:</span>
                    <span style={{fontWeight:'bold'}}>{selectedSeats.length}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                    <span>Price per Seat:</span>
                    <span style={{fontWeight:'bold'}}>₹{route.price}</span>
                  </div>
                  <div style={{height:2, background:'#d97706', margin:'12px 0'}} />
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:18}}>
                    <span style={{fontWeight:'bold'}}>Total Amount:</span>
                    <span style={{fontWeight:'bold', color:'#f59e0b', fontSize:24}}>₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div style={{padding:16, background:'#e0e7ff', borderRadius:12, fontSize:13, color:'#3730a3'}}>
                <div style={{fontWeight:'bold', marginBottom:8}}>📢 Important Information:</div>
                <ul style={{margin:0, paddingLeft:20}}>
                  <li>Please arrive at the boarding point 15 minutes before departure</li>
                  <li>Carry a valid ID proof for verification</li>
                  <li>Your booking confirmation will be sent to {phone}</li>
                  <li>No payment required - booking stored in system</li>
                </ul>
              </div>
            </div>

            <div style={{display:'flex', gap:12, marginTop:24}}>
              <button 
                onClick={() => setStep(3)}
                style={{
                  flex:1,
                  padding:14,
                  borderRadius:12,
                  border:'2px solid #e5e5e5',
                  background:'white',
                  cursor:'pointer',
                  fontSize:16,
                  fontWeight:'500'
                }}>
                ← Back
              </button>
              <button 
                onClick={submit}
                disabled={loading}
                className="btn"
                style={{
                  flex:2,
                  padding:14,
                  fontSize:16,
                  fontWeight:'bold',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                  background: loading ? '#999' : undefined
                }}>
                {loading ? '⏳ Processing...' : '🎉 Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-calendar {
          width: 100%;
          border: 2px solid #e5e5e5;
          border-radius: 12px;
          padding: 16px;
        }
        .custom-calendar .react-calendar__tile--active {
          background: #f59e0b !important;
          color: white;
        }
        .custom-calendar .react-calendar__tile--now {
          background: #fff7ed;
        }
      `}</style>
    </div>
  );
}