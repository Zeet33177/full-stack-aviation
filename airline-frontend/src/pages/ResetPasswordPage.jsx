import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../api/axios';
import { FaPlane, FaUserLock, FaShieldAlt, FaStopwatch, FaLock, FaExclamationTriangle, FaEye, FaEyeSlash, FaCheck, FaTimes, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm]         = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [success, setSuccess]   = useState(false);

  function validate() {
    const errs = {};
    if (!form.newPassword)          errs.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    if (!form.confirmPassword)      errs.confirmPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.newPassword);
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split">

      {/* ── Left panel ── */}
      <div className="auth-left-panel">
        <div className="auth-left-deco"><FaPlane /></div>
        <div className="auth-left-inner">
          <div className="auth-left-brand">
            <span className="auth-left-brand-icon"><FaPlane /></span>
            <span className="auth-left-brand-name">Full Stack Aviation</span>
          </div>
          <p className="auth-left-tagline">Account Security</p>
          <h2 className="auth-left-headline">
            Keep your<br />
            <span>account safe.</span>
          </h2>
          <p className="auth-left-sub">
            Choose a strong password you haven't used before to protect your Full Stack Aviation account.
          </p>
          <div className="auth-left-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><FaUserLock /></span>
              <span className="auth-feature-text">Minimum 6 characters</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><FaShieldAlt /></span>
              <span className="auth-feature-text">Stored with BCrypt encryption</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><FaStopwatch /></span>
              <span className="auth-feature-text">Reset link valid for 30 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right-panel">
        <div className="auth-right-inner">

          {!success ? (
            <>
              <div className="auth-card-header">
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px', marginBottom: '16px',
                  background: 'linear-gradient(135deg, var(--primary-light), #99f6e4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                }}>
                  <FaLock />
                </div>
                <h1>Set New Password</h1>
                <p>Enter and confirm your new password below.</p>
              </div>

              {!token && (
                <div style={{
                  background: '#fef2f2', border: '1.5px solid #fca5a5',
                  borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '20px',
                  fontSize: '0.85rem', color: '#dc2626', lineHeight: 1.5,
                }}>
                  <FaExclamationTriangle style={{ verticalAlign: 'middle' }} /> Invalid or missing reset token. Please use the link from your email, or{' '}
                  <Link to="/login" style={{ color: '#dc2626', fontWeight: '700' }}>request a new one</Link>.
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="newPassword"
                      type={showNew ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={form.newPassword}
                      onChange={e => { setForm(f => ({ ...f, newPassword: e.target.value })); setErrors(err => ({ ...err, newPassword: '' })); }}
                      className={errors.newPassword ? 'input-error' : ''}
                      autoComplete="new-password"
                      style={{ paddingRight: '44px' }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowNew(s => !s)} tabIndex={-1}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)', padding: '2px' }}>
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && <span className="error-msg">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirmPassword"
                      type={showConf ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      value={form.confirmPassword}
                      onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setErrors(err => ({ ...err, confirmPassword: '' })); }}
                      className={errors.confirmPassword ? 'input-error' : ''}
                      autoComplete="new-password"
                      style={{ paddingRight: '44px' }}
                    />
                    <button type="button" onClick={() => setShowConf(s => !s)} tabIndex={-1}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)', padding: '2px' }}>
                      {showConf ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}

                  {/* Password match indicator */}
                  {form.confirmPassword && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px',
                      color: form.newPassword === form.confirmPassword ? '#059669' : '#dc2626' }}>
                      {form.newPassword === form.confirmPassword
                        ? <><FaCheck /> Passwords match</>
                        : <><FaTimes /> Passwords do not match</>}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary btn-full" disabled={loading || !token}
                  style={{ padding: '13px 24px', fontSize: '0.96rem' }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>

              <p className="auth-footer" style={{ marginTop: '24px' }}>
                <Link to="/login"><FaArrowLeft style={{ verticalAlign: 'middle' }} /> Back to Sign In</Link>
              </p>
            </>
          ) : (
            /* ── SUCCESS VIEW ── */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 20px',
                background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
              }}>
                <FaCheckCircle />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginBottom: '10px' }}>
                Password Reset!
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button
                className="btn-primary btn-full"
                onClick={() => navigate('/login')}
                style={{ padding: '13px 24px', fontSize: '0.96rem' }}
              >
                Sign In Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
