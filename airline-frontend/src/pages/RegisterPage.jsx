import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userType, setUserType] = useState('PASSENGER');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', phone: '', dateOfBirth: '', nationality: '',
    passportNumber: '', staffCode: ''
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required';
    if (!form.email)            errs.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password)         errs.password  = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (userType === 'STAFF' && !form.staffCode.trim()) errs.staffCode = 'Verification code is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (userType !== 'STAFF') delete payload.staffCode;
      const { data } = await authAPI.register(payload);
      login(data.data);
      toast.success('Registration successful! Welcome aboard.');
      navigate('/search');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split">

      {/* ── Left panel ── */}
      <div className="auth-left-panel">
        <div className="auth-left-deco">✈</div>
        <div className="auth-left-inner">

          <div className="auth-left-brand">
            <span className="auth-left-brand-icon">✈</span>
            <span className="auth-left-brand-name">Horizon Airways</span>
          </div>

          <p className="auth-left-tagline">Join Our Community</p>
          <h2 className="auth-left-headline">
            Fly smarter,<br />
            <span>travel better.</span>
          </h2>
          <p className="auth-left-sub">
            Create your free account and unlock exclusive fares, seamless booking,
            and a personalised travel experience.
          </p>

          <div className="auth-left-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🎫</span>
              <span className="auth-feature-text">Digital Boarding Passes</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">📱</span>
              <span className="auth-feature-text">Manage Bookings Anytime</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">💺</span>
              <span className="auth-feature-text">Choose Your Seat & Class</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right-panel" style={{ padding: '32px 48px', alignItems: 'flex-start' }}>
        <div className="auth-right-inner" style={{ maxWidth: '520px' }}>

          <div className="auth-card-header">
            <h1>Create account</h1>
            <p>Join Horizon Airways — it's free</p>
          </div>

          {/* Role toggle */}
          <div className="reg-role-toggle" style={{ marginBottom: '22px' }}>
            <button
              type="button"
              className={`reg-role-btn ${userType === 'PASSENGER' ? 'active' : ''}`}
              onClick={() => setUserType('PASSENGER')}
            >
              ✈ Passenger
            </button>
            <button
              type="button"
              className={`reg-role-btn ${userType === 'STAFF' ? 'active' : ''}`}
              onClick={() => setUserType('STAFF')}
            >
              👔 Staff / Employee
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input name="firstName" placeholder="John" value={form.firstName}
                  onChange={handleChange} className={errors.firstName ? 'input-error' : ''}
                  autoComplete="given-name" />
                {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input name="lastName" placeholder="Doe" value={form.lastName}
                  onChange={handleChange} className={errors.lastName ? 'input-error' : ''}
                  autoComplete="family-name" />
                {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" placeholder="john@example.com"
                value={form.email} onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                autoComplete="email" />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input type="password" name="password" placeholder="Min 6 characters"
                  value={form.password} onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  autoComplete="new-password" />
                {errors.password && <span className="error-msg">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={handleChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  autoComplete="new-password" />
                {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" placeholder="+91 XXXXX XXXXX"
                  value={form.phone} onChange={handleChange}
                  autoComplete="tel" />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nationality</label>
                <input name="nationality" placeholder="e.g. Indian"
                  value={form.nationality} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Passport Number</label>
                <input name="passportNumber" placeholder="P1234567"
                  value={form.passportNumber} onChange={handleChange} />
              </div>
            </div>

            {userType === 'STAFF' && (
              <div className="form-group"
                style={{
                  background: 'var(--warning-light)', border: '1.5px solid rgba(217,119,6,.25)',
                  borderRadius: 'var(--radius-sm)', padding: '14px 16px'
                }}>
                <label style={{ color: 'var(--warning)' }}>Staff Verification Code *</label>
                <input
                  name="staffCode"
                  placeholder="Enter the code provided by HR"
                  value={form.staffCode} onChange={handleChange}
                  className={errors.staffCode ? 'input-error' : ''}
                  style={{ background: '#fff' }}
                />
                {errors.staffCode && <span className="error-msg">{errors.staffCode}</span>}
                <span className="field-hint" style={{ color: 'var(--warning)' }}>
                  Contact HR to receive your staff verification code.
                </span>
              </div>
            )}

            <button type="submit" className="btn-primary btn-full" disabled={loading}
              style={{ marginTop: '4px', padding: '13px 24px', fontSize: '0.96rem' }}>
              {loading ? 'Creating account…' : `Register as ${userType === 'STAFF' ? 'Staff' : 'Passenger'}`}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: '22px' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
