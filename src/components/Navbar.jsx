import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar(){
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'My Bookings', icon: '📋' },
    { path: '/admin', label: 'Admin', icon: '⚙️' },
    { path: '/login', label: 'Login', icon: '🔐' }
  ];

  return (
    <header style={{
      background: 'linear-gradient(90deg, #5B3924 0%, #6b3f29 50%, #7d4a2e 100%)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="nav-inner" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        gap: 16
      }}>
        {/* Logo Section */}
        <Link to="/" style={{textDecoration:'none', display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            width: 48,
            height: 48,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            🚌
          </div>
          <div className="nav-left">
            <h1 style={{
              margin: 0,
              fontSize: 22,
              color: '#FFF7ED',
              fontWeight: 'bold',
              letterSpacing: '-0.5px'
            }}>
              BookMyRide Pro
            </h1>
            <div className="muted" style={{
              color: '#F59E0B',
              fontSize: 12,
              marginTop: 2,
              fontWeight: 500
            }}>
              Your Travel Companion
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-right" style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}>
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: isActive(link.path) ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: isActive(link.path) ? '#F59E0B' : '#FFF7ED',
                textDecoration: 'none',
                fontWeight: isActive(link.path) ? 'bold' : 'normal',
                fontSize: 15,
                transition: 'all 0.2s ease',
                border: isActive(link.path) ? '2px solid #F59E0B' : '2px solid transparent',
                display: 'none'
              }}
              className="desktop-link"
              onMouseOver={e => {
                if(!isActive(link.path)) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={e => {
                if(!isActive(link.path)) {
                  e.target.style.background = 'transparent';
                }
              }}>
              <span style={{marginRight: 6}}>{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #F59E0B',
              color: '#F59E0B',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 20,
              display: 'none'
            }}
            className="mobile-menu-btn">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          background: 'linear-gradient(180deg, #6b3f29 0%, #5B3924 100%)',
          padding: '16px 24px',
          borderTop: '2px solid rgba(245, 158, 11, 0.3)',
          animation: 'slideDown 0.3s ease'
        }}
        className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '14px 20px',
                margin: '8px 0',
                borderRadius: 8,
                background: isActive(link.path) ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: isActive(link.path) ? '#F59E0B' : '#FFF7ED',
                textDecoration: 'none',
                fontWeight: isActive(link.path) ? 'bold' : 'normal',
                fontSize: 16,
                border: isActive(link.path) ? '2px solid #F59E0B' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}>
              <span style={{marginRight: 10, fontSize: 20}}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-link {
            display: inline-block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .desktop-link {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nav-inner h1:hover {
          color: #FBBF24;
          transition: color 0.2s ease;
        }
      `}</style>
    </header>
  );
}