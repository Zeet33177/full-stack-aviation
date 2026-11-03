import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaPlane, FaGlobe, FaBolt, FaShieldAlt, FaEye, FaEyeSlash, FaArrowLeft, FaKey, FaEnvelope } from 'react-icons/fa';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [view, setView]         = useState('login');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  }

  function validate() {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.data);
      toast.success('Welcome back, ' + data.data.firstName);
      const role = data.data.role;
      if (role === 'ADMIN' || role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate('/testLandingPage');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors({ forgotEmail: 'Please enter a valid email address' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      setView('forgot-sent');
    } catch {
      setView('forgot-sent');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email, password) {
    setForm({ email, password });
    setErrors({});
  }

  return (
    <div className="sky-auth-page">
      {/* Sky background overlay */}
      <div className="sky-auth-overlay" />

      {/* Left brand panel */}
      <div className="sky-auth-left">
        <div className="sky-auth-brand">
          <FaPlane />
          <span>Full Stack Aviation</span>
        </div>
        <h2 className="sky-auth-headline">
          Your world,<br />
          <span>one flight</span> away.
        </h2>
        <p className="sky-auth-sub">
          Experience seamless booking, real-time updates, and unmatched comfort
          on every journey.
        </p>
        <div className="sky-auth-features">
          <div className="sky-auth-feat">
            <FaGlobe /> <span>100+ Global Destinations</span>
          </div>
          <div className="sky-auth-feat">
            <FaBolt /> <span>Instant Booking Confirmation</span>
          </div>
          <div className="sky-auth-feat">
            <FaShieldAlt /> <span>Safe &amp; Secure Payments</span>
          </div>
        </div>
      </div>

      {/* Right glass card */}
      <div className="sky-auth-right">
        <div className="sky-auth-card">

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <>
              <div className="auth-card-header">
                <h1>Welcome back</h1>
                <p>Sign in to your Full Stack Aviation account</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email" type="email" name="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    className={errors.email ? 'input-error' : ''}
                    autoComplete="email"
                  />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => { setForgotEmail(form.email); setView('forgot'); setErrors({}); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)',
                        padding: 0, fontFamily: 'inherit', transition: 'opacity .15s',
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={form.password} onChange={handleChange}
                      className={errors.password ? 'input-error' : ''}
                      autoComplete="current-password"
                      style={{ paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                        color: 'var(--text-muted)', padding: '2px'
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>

                <button type="submit" className="btn-primary btn-full" disabled={loading}
                  style={{ marginTop: '4px', padding: '13px 24px', fontSize: '0.96rem' }}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="auth-footer" style={{ marginTop: '20px' }}>
                Don't have an account?{' '}
                <Link to="/register">Create one free</Link>
              </p>

              <div className="demo-credentials">
                <p><strong>Quick demo access:</strong></p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {[
                    { label: 'Passenger', email: 'arjun@email.com', pass: 'pass@123' },
                    { label: 'Admin',     email: 'admin@horizon.com', pass: 'admin@123' },
                    { label: 'Staff',     email: 'staff@horizon.com', pass: 'staff@123' },
                  ].map(d => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => fillDemo(d.email, d.pass)}
                      style={{
                        background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.18)',
                        borderRadius: '6px', padding: '7px 12px', cursor: 'pointer',
                        fontSize: '0.8rem', textAlign: 'left', transition: 'var(--transition)',
                        color: 'var(--text)', fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,148,136,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(13,148,136,0.06)'}
                    >
                      <strong>{d.label}</strong> — {d.email} / {d.pass}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <>
              <button
                type="button"
                onClick={() => { setView('login'); setErrors({}); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)',
                  fontFamily: 'inherit', transition: 'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <FaArrowLeft style={{ verticalAlign: 'middle' }} /> Back to Sign In
              </button>

              <div className="auth-card-header">
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px', marginBottom: '16px',
                  background: 'linear-gradient(135deg, var(--primary-light), #99f6e4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                  color: 'var(--primary-dark)',
                }}>
                  <FaKey />
                </div>
                <h1>Forgot Password?</h1>
                <p>No worries — enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="forgotEmail">Email Address</label>
                  <input
                    id="forgotEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); setErrors({}); }}
                    className={errors.forgotEmail ? 'input-error' : ''}
                    autoComplete="email"
                    autoFocus
                  />
                  {errors.forgotEmail && <span className="error-msg">{errors.forgotEmail}</span>}
                </div>

                <button type="submit" className="btn-primary btn-full" disabled={loading}
                  style={{ padding: '13px 24px', fontSize: '0.96rem' }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="auth-footer" style={{ marginTop: '20px' }}>
                Remembered it?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); setErrors({}); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)', fontWeight: '600', fontSize: 'inherit', fontFamily: 'inherit' }}
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {/* ── EMAIL SENT VIEW ── */}
          {view === 'forgot-sent' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 20px',
                background: 'linear-gradient(135deg, var(--primary-light), #99f6e4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                color: 'var(--primary-dark)',
              }}>
                <FaEnvelope />
              </div>

              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '10px' }}>
                Check your inbox
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                If <strong style={{ color: 'var(--text)' }}>{forgotEmail}</strong> is registered with us,
                you'll receive a password reset link shortly. The link expires in <strong>30 minutes</strong>.
              </p>

              <div style={{
                background: 'rgba(13,148,136,0.06)', border: '1.5px solid rgba(13,148,136,0.15)',
                borderRadius: 'var(--radius-sm)', padding: '14px 18px',
                marginBottom: '28px', textAlign: 'left',
              }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>Didn't receive it?</strong><br />
                  Check your spam / junk folder. If you still can't find it, make sure you used the correct email address.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setView('forgot'); setErrors({}); }}
                className="btn-outline btn-full"
                style={{ marginBottom: '12px', padding: '12px 24px' }}
              >
                Try a different email
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); setErrors({}); }}
                className="btn-primary btn-full"
                style={{ padding: '12px 24px' }}
              >
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
