import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const canViewReports    = user?.role === 'ADMIN';
  const canViewAdmin      = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const isPassenger       = user?.role === 'PASSENGER';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user
    ? (user.firstName?.[0] || '') + (user.lastName?.[0] || '')
    : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/search">
          <span className="brand-icon">✈</span>
          <span className="brand-name">Horizon Airways</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link
          to="/search"
          className="nav-link"
          style={isActive('/search') ? { color: '#fff', background: 'rgba(255,255,255,.12)' } : {}}
        >
          Search Flights
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/my-bookings"
              className="nav-link"
              style={isActive('/my-bookings') ? { color: '#fff', background: 'rgba(255,255,255,.12)' } : {}}
            >
              My Bookings
            </Link>

            {isPassenger && (
              <Link
                to="/my-reports"
                className="nav-link"
                style={isActive('/my-reports') ? { color: '#fff', background: 'rgba(255,255,255,.12)' } : {}}
              >
                My Reports
              </Link>
            )}

            {canViewReports && (
              <Link
                to="/reports"
                className="nav-link nav-link-reports"
                style={isActive('/reports') ? { background: 'rgba(255,255,255,.12)' } : {}}
              >
                Reports
              </Link>
            )}

            {canViewAdmin && (
              <Link to="/admin" className="nav-link nav-link-admin">
                Admin Panel
              </Link>
            )}

            {/* User avatar / dropdown */}
            <div ref={menuRef} style={{ position: 'relative', marginLeft: '6px' }}>
              <button
                onClick={() => setMenuOpen(s => !s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
                  borderRadius: '40px', padding: '5px 14px 5px 5px',
                  cursor: 'pointer', transition: 'all .2s', color: '#fff'
                }}
              >
                <span style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '800', color: '#fff',
                  fontFamily: 'Sora, sans-serif', flexShrink: 0
                }}>
                  {initials.toUpperCase() || '?'}
                </span>
                <span style={{ fontSize: '0.86rem', fontWeight: '600', color: 'rgba(255,255,255,.9)' }}>
                  {user?.firstName}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.5)', marginLeft: '-3px' }}>
                  {menuOpen ? '▲' : '▼'}
                </span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: '#fff', borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,.18)',
                  border: '1px solid var(--border)', minWidth: '200px', overflow: 'hidden',
                  zIndex: 300, animation: 'fadeUp .15s ease'
                }}>
                  <div style={{
                    padding: '14px 16px', borderBottom: '1px solid var(--border)',
                    background: 'var(--surface-2)'
                  }}>
                    <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.9rem' }}>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {user?.email}
                    </div>
                    <span style={{
                      display: 'inline-block', marginTop: '6px',
                      fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px',
                      borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '.05em',
                      background: user?.role === 'ADMIN' ? '#dbeafe' : user?.role === 'STAFF' ? '#fef3c7' : '#dcfce7',
                      color: user?.role === 'ADMIN' ? '#1d4ed8' : user?.role === 'STAFF' ? '#d97706' : '#059669'
                    }}>
                      {user?.role}
                    </span>
                  </div>

                  <div style={{ padding: '6px' }}>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px',
                        color: 'var(--text)', textDecoration: 'none',
                        fontSize: '0.875rem', fontWeight: '500', transition: 'background .15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>👤</span> My Profile
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px',
                        color: 'var(--text)', textDecoration: 'none',
                        fontSize: '0.875rem', fontWeight: '500', transition: 'background .15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>🎫</span> My Bookings
                    </Link>

                    <div style={{ margin: '4px 0', borderTop: '1px solid var(--border)' }} />

                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px',
                        color: 'var(--danger)', background: 'none', border: 'none',
                        fontSize: '0.875rem', fontWeight: '600', transition: 'background .15s',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn-outline">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
