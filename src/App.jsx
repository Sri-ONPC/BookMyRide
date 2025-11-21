import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import NotFound from './pages/NotFound';
import Loading from './components/Loading';

export default function App() {
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        
        {/* Main Content with Loading Fallback */}
        <main style={{flex: 1}}>
          <Suspense fallback={<Loading message="Loading page..." fullScreen={false} />}>
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<Home />} />
              
              {/* Booking Page */}
              <Route path="/booking/:id" element={<Booking />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<AuthForm mode="login" />} />
              <Route path="/signup" element={<AuthForm mode="signup" />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Admin Panel */}
              <Route path="/admin" element={<Admin />} />
              
              {/* 404 Not Found - Catch all routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer style={{
          background: 'linear-gradient(90deg, #5B3924 0%, #6b3f29 100%)',
          color: '#FFF7ED',
          padding: '24px 20px',
          marginTop: 'auto'
        }}>
          <div className="container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            maxWidth: 1100,
            margin: '0 auto'
          }}>
            <div>
              <div style={{
                fontWeight: 'bold',
                fontSize: 18,
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{fontSize: 24}}>🚌</span>
                BookMyRide Pro
              </div>
              <div style={{fontSize: 13, opacity: 0.8}}>
                Your trusted travel companion
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 24,
              fontSize: 14
            }}>
              <a href="/" style={{color: '#FFF7ED', textDecoration: 'none'}}>
                Home
              </a>
              <a href="/dashboard" style={{color: '#FFF7ED', textDecoration: 'none'}}>
                Bookings
              </a>
              <a href="/admin" style={{color: '#FFF7ED', textDecoration: 'none'}}>
                Admin
              </a>
            </div>

            <div style={{fontSize: 13, opacity: 0.8}}>
              © 2024 BookMyRide Pro. Made with ❤️
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}