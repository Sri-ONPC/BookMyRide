import React, { useState } from 'react';

export default function SeatMap({total=40, onChange}) {
  const cols = 4; // 4 seats per row (2-2 configuration for bus)
  const rows = Math.ceil(total / cols);
  
  // Mock some seats as already taken (in real app, fetch from Firebase)
  const takenSeats = [7, 14, 21, 28, 35]; // Demo taken seats
  
  const [selected, setSelected] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  function toggle(seatNum) {
    if(takenSeats.includes(seatNum)) return; // Can't select taken seats
    
    let next;
    if(selected.includes(seatNum)) {
      next = selected.filter(x => x !== seatNum);
    } else {
      next = [...selected, seatNum];
    }
    setSelected(next);
    onChange && onChange(next);
  }

  // Determine seat type (window/aisle/middle)
  const getSeatPosition = (seatNum) => {
    const position = (seatNum - 1) % cols;
    if(position === 0 || position === 3) return 'window';
    return 'aisle';
  };

  return (
    <div>
      {/* Legend */}
      <div style={{
        display:'flex',
        justifyContent:'center',
        gap:24,
        marginBottom:20,
        padding:16,
        background:'#f9fafb',
        borderRadius:12,
        fontSize:14
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:32, height:32, background:'white', border:'2px solid #e5e5e5', borderRadius:6}} />
          <span>Available</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:32, height:32, background:'#f59e0b', borderRadius:6}} />
          <span style={{fontWeight:'bold'}}>Selected</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:32, height:32, background:'#d1d5db', borderRadius:6}} />
          <span>Booked</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:32, height:32, background:'#dbeafe', border:'2px solid #3b82f6', borderRadius:6}} />
          <span>Window</span>
        </div>
      </div>

      {/* Seat Layout */}
      <div style={{
        background:'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)',
        padding:24,
        borderRadius:16,
        maxWidth:420,
        margin:'0 auto'
      }}>
        {/* Driver section */}
        <div style={{
          marginBottom:20,
          padding:12,
          background:'#1f2937',
          borderRadius:12,
          color:'white',
          textAlign:'center',
          fontWeight:'bold',
          fontSize:14
        }}>
          🚗 Driver
        </div>

        {/* Seats Grid */}
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {Array.from({length: rows}, (_, rowIdx) => {
            const rowStart = rowIdx * cols + 1;
            const rowEnd = Math.min(rowStart + cols - 1, total);
            const seatsInRow = [];
            
            for(let i = rowStart; i <= rowEnd; i++) {
              seatsInRow.push(i);
            }

            return (
              <div key={rowIdx} style={{display:'flex', gap:12, justifyContent:'center'}}>
                {/* Left side seats (2 seats) */}
                <div style={{display:'flex', gap:8}}>
                  {seatsInRow.slice(0, 2).map(seatNum => {
                    const isTaken = takenSeats.includes(seatNum);
                    const isSelected = selected.includes(seatNum);
                    const isWindow = getSeatPosition(seatNum) === 'window';
                    const isHovered = hoveredSeat === seatNum;

                    return (
                      <button
                        key={seatNum}
                        onClick={() => toggle(seatNum)}
                        onMouseEnter={() => setHoveredSeat(seatNum)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={isTaken}
                        style={{
                          width:60,
                          height:60,
                          borderRadius:8,
                          border: isWindow ? '2px solid #3b82f6' : '2px solid #e5e5e5',
                          background: isTaken ? '#d1d5db' : 
                                     isSelected ? '#f59e0b' : 
                                     isWindow ? '#dbeafe' : 'white',
                          color: isTaken ? '#6b7280' : 
                                isSelected ? 'white' : '#374151',
                          fontWeight: isSelected ? 'bold' : '600',
                          fontSize: 16,
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          transform: isHovered && !isTaken ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isSelected ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 
                                    isHovered && !isTaken ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                          position: 'relative'
                        }}>
                        {seatNum}
                        {isWindow && !isTaken && !isSelected && (
                          <div style={{
                            position:'absolute',
                            bottom:2,
                            right:2,
                            fontSize:10
                          }}>🪟</div>
                        )}
                        {isTaken && (
                          <div style={{
                            position:'absolute',
                            top:'50%',
                            left:'50%',
                            transform:'translate(-50%, -50%)',
                            fontSize:20
                          }}>🔒</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle space */}
                <div style={{width:32}} />

                {/* Right side seats (2 seats) */}
                <div style={{display:'flex', gap:8}}>
                  {seatsInRow.slice(2, 4).map(seatNum => {
                    const isTaken = takenSeats.includes(seatNum);
                    const isSelected = selected.includes(seatNum);
                    const isWindow = getSeatPosition(seatNum) === 'window';
                    const isHovered = hoveredSeat === seatNum;

                    return (
                      <button
                        key={seatNum}
                        onClick={() => toggle(seatNum)}
                        onMouseEnter={() => setHoveredSeat(seatNum)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={isTaken}
                        style={{
                          width:60,
                          height:60,
                          borderRadius:8,
                          border: isWindow ? '2px solid #3b82f6' : '2px solid #e5e5e5',
                          background: isTaken ? '#d1d5db' : 
                                     isSelected ? '#f59e0b' : 
                                     isWindow ? '#dbeafe' : 'white',
                          color: isTaken ? '#6b7280' : 
                                isSelected ? 'white' : '#374151',
                          fontWeight: isSelected ? 'bold' : '600',
                          fontSize: 16,
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          transform: isHovered && !isTaken ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isSelected ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 
                                    isHovered && !isTaken ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                          position: 'relative'
                        }}>
                        {seatNum}
                        {isWindow && !isTaken && !isSelected && (
                          <div style={{
                            position:'absolute',
                            bottom:2,
                            right:2,
                            fontSize:10
                          }}>🪟</div>
                        )}
                        {isTaken && (
                          <div style={{
                            position:'absolute',
                            top:'50%',
                            left:'50%',
                            transform:'translate(-50%, -50%)',
                            fontSize:20
                          }}>🔒</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Back section indicator */}
        <div style={{
          marginTop:20,
          padding:8,
          background:'#fef3c7',
          borderRadius:8,
          textAlign:'center',
          fontSize:12,
          color:'#92400e',
          fontWeight:'500'
        }}>
          🚪 Exit
        </div>
      </div>

      {/* Selection Summary */}
      {selected.length > 0 && (
        <div style={{
          marginTop:20,
          padding:16,
          background:'#dcfce7',
          borderRadius:12,
          animation:'fadeIn 0.3s ease'
        }}>
          <div style={{fontWeight:'bold', color:'#166534', marginBottom:8}}>
            ✓ You've selected {selected.length} seat{selected.length > 1 ? 's' : ''}
          </div>
          <div style={{
            display:'flex',
            flexWrap:'wrap',
            gap:8
          }}>
            {selected.sort((a,b) => a - b).map(seat => (
              <span key={seat} style={{
                padding:'6px 12px',
                background:'#22c55e',
                color:'white',
                borderRadius:8,
                fontSize:14,
                fontWeight:'bold'
              }}>
                {seat}
              </span>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}