import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartBar, FaUsers, FaPlane, FaCalendarAlt, FaClipboardList, FaEdit, FaArrowLeft } from 'react-icons/fa';

const ADMIN_ITEMS = [
  { to: '/admin',              label: 'Dashboard',       icon: FaChartBar },
  { to: '/admin/employees',    label: 'Employees',       icon: FaUsers },
  { to: '/admin/aircraft',     label: 'Aircraft Fleet',  icon: FaPlane },
  { to: '/admin/scheduling',   label: 'Flight & Crew',   icon: FaCalendarAlt },
];
const SHARED_ITEMS = [
  { to: '/admin/attendance',   label: 'Attendance',      icon: FaClipboardList },
  { to: '/admin/duty-reports', label: 'Duty Reports',    icon: FaEdit },
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
        <span className="sidebar-brand-icon"><FaPlane /></span>
        <div>
          <div className="sidebar-brand-name">Full Stack Aviation</div>
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
                <span className="sidebar-link-icon">{(() => { const Icon = item.icon; return <Icon />; })()}</span>
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
            <span className="sidebar-link-icon">{(() => { const Icon = item.icon; return <Icon />; })()}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/testLandingPage" className="sidebar-back-link">
          <span><FaArrowLeft /></span> Back to Main Site
        </Link>
      </div>
    </aside>
  );
}
