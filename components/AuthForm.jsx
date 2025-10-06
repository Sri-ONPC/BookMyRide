import React, { useState } from 'react';
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function AuthForm({mode='login'}){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if(!email) {
      newErrors.email = 'Email is required';
    } else if(!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if(!password) {
      newErrors.password = 'Password is required';
    } else if(mode === 'signup' && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation (signup only)
    if(mode === 'signup') {
      if(!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if(password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async(e) => {
    e.preventDefault();
    
    if(!validateForm()) return;

    setLoading(true);
    try {
      if(mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document in Firestore
        await setDoc(doc(db, 'users', cred.user.uid), {
          email,
          isAdmin: false,
          createdAt: new Date().toISOString()
        });
        alert('🎉 Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('✓ Login successful!');
      }
      navigate('/dashboard');
    } catch(err) {
      console.error(err);
      let errorMessage = 'An error occurred';
      
      // User-friendly error messages
      if(err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if(err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if(err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if(err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if(err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else {
        errorMessage = err.message;
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div className="card" style={{
        maxWidth:480,
        width:'100%',
        margin:'20px auto',
        boxShadow:'0 20px 60px rgba(91,57,36,0.15)'
      }}>
        {/* Header */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{
            width:80,
            height:80,
            background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius:20,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontSize:40,
            margin:'0 auto 16px',
            boxShadow:'0 8px 24px rgba(245, 158, 11, 0.3)'
          }}>
            {mode === 'signup' ? '✨' : '🔐'}
          </div>
          <h2 style={{margin:'0 0 8px 0', fontSize:28}}>
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="muted" style={{margin:0}}>
            {mode === 'signup' ? 'Join us for seamless travel booking' : 'Login to manage your bookings'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          {/* Email Field */}
          <div style={{marginBottom:20}}>
            <label style={{display:'block', fontWeight:'600', marginBottom:8, fontSize:14}}>
              Email Address *
            </label>
            <div style={{position:'relative'}}>
              <span style={{
                position:'absolute',
                left:14,
                top:'50%',
                transform:'translateY(-50%)',
                fontSize:18
              }}>📧</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => {setEmail(e.target.value); setErrors({...errors, email:null});}}
                style={{
                  width:'100%',
                  padding:'12px 12px 12px 44px',
                  fontSize:15,
                  borderRadius:10,
                  border: errors.email ? '2px solid #ef4444' : '2px solid #e5e7eb'
                }}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <div style={{color:'#ef4444', fontSize:13, marginTop:6}}>
                ⚠️ {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div style={{marginBottom:20}}>
            <label style={{display:'block', fontWeight:'600', marginBottom:8, fontSize:14}}>
              Password *
            </label>
            <div style={{position:'relative'}}>
              <span style={{
                position:'absolute',
                left:14,
                top:'50%',
                transform:'translateY(-50%)',
                fontSize:18
              }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                value={password}
                onChange={e => {setPassword(e.target.value); setErrors({...errors, password:null});}}
                style={{
                  width:'100%',
                  padding:'12px 44px 12px 44px',
                  fontSize:15,
                  borderRadius:10,
                  border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb'
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position:'absolute',
                  right:14,
                  top:'50%',
                  transform:'translateY(-50%)',
                  background:'none',
                  border:'none',
                  cursor:'pointer',
                  fontSize:18
                }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <div style={{color:'#ef4444', fontSize:13, marginTop:6}}>
                ⚠️ {errors.password}
              </div>
            )}
            {mode === 'signup' && !errors.password && (
              <div style={{fontSize:12, color:'#6b7280', marginTop:6}}>
                💡 Use at least 6 characters
              </div>
            )}
          </div>

          {/* Confirm Password Field (Signup only) */}
          {mode === 'signup' && (
            <div style={{marginBottom:20}}>
              <label style={{display:'block', fontWeight:'600', marginBottom:8, fontSize:14}}>
                Confirm Password *
              </label>
              <div style={{position:'relative'}}>
                <span style={{
                  position:'absolute',
                  left:14,
                  top:'50%',
                  transform:'translateY(-50%)',
                  fontSize:18
                }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={e => {setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword:null});}}
                  style={{
                    width:'100%',
                    padding:'12px 12px 12px 44px',
                    fontSize:15,
                    borderRadius:10,
                    border: errors.confirmPassword ? '2px solid #ef4444' : '2px solid #e5e7eb'
                  }}
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && (
                <div style={{color:'#ef4444', fontSize:13, marginTop:6}}>
                  ⚠️ {errors.confirmPassword}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="btn"
            type="submit"
            disabled={loading}
            style={{
              width:'100%',
              padding:14,
              fontSize:16,
              fontWeight:'bold',
              marginTop:8,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}>
            {loading ? (
              <span className="loading">
                {mode === 'signup' ? '⏳ Creating Account...' : '⏳ Logging in...'}
              </span>
            ) : (
              <span>
                {mode === 'signup' ? '✨ Create Account' : '🚀 Login'}
              </span>
            )}
          </button>

          {/* Toggle Mode */}
          <div style={{
            marginTop:24,
            textAlign:'center',
            padding:16,
            background:'#f9fafb',
            borderRadius:10
          }}>
            <p style={{margin:0, fontSize:14, color:'#6b7280'}}>
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              type="button"
              onClick={() => navigate(mode === 'signup' ? '/login' : '/signup')}
              style={{
                marginTop:8,
                padding:'8px 20px',
                background:'white',
                border:'2px solid #e5e7eb',
                borderRadius:8,
                cursor:'pointer',
                fontWeight:'600',
                fontSize:14,
                color:'#f59e0b'
              }}>
              {mode === 'signup' ? '🔐 Login Instead' : '✨ Create Account'}
            </button>
          </div>
        </form>

        {/* Demo Credentials (Login only) */}
        {mode === 'login' && (
          <div style={{
            marginTop:20,
            padding:16,
            background:'#dbeafe',
            borderRadius:10,
            fontSize:13
          }}>
            <div style={{fontWeight:'bold', color:'#1e40af', marginBottom:8}}>
              🔑 Demo Credentials
            </div>
            <div style={{color:'#1e3a8a', fontFamily:'monospace'}}>
              Email: demo@bookmyride.com<br/>
              Password: demo123
            </div>
          </div>
        )}
      </div>
    </div>
  );
}