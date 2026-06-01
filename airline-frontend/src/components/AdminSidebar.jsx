import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_ITEMS = [
  { to: '/admin',              label: 'Dashboard',       icon: '📊' },
  { to: '/admin/employees',    label: 'Employees',       icon: '👥' },
  { to: '/admin/aircraft',     label: 'Aircraft Fleet',  icon: '✈' },
  { to: '/admin/scheduling',   label: 'Flight & Crew',   icon: '🗓' },
];
const SHARED_ITEMS = [
  { to: '/admin/attendance',   label: 'Attendance',      icon: '📋' },
  { to: '/admin/duty-reports', label: 'Duty Reports',    icon: '📝' },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  function isActive(to) {
    return to === '/admin' ? pathname === '/admin' : pathname.startsWith(to);
  }

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">✈</span>
        <div>
          <div className="sidebar-brand-name">Horizon Airways</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.35)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1px' }}>
            {isAdmin ? 'Admin Panel' : 'Staff Panel'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin && (
          <>
            <div className="sidebar-section-label">Management</div>
            {ADMIN_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${isActive(item.to) ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}

        <div className="sidebar-section-label" style={{ marginTop: isAdmin ? '8px' : '0' }}>
          Staff
        </div>
        {SHARED_ITEMS.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link ${isActive(item.to) ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/search" className="sidebar-back-link">
          <span>←</span> Back to Main Site
        </Link>
      </div>
    </aside>
  );
}
