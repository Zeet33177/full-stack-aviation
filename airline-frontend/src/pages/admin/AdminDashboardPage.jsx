import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminEmployeeAPI, adminAircraftAPI, adminFlightAPI, attendanceAPI, dutyReportAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaPlane, FaKey, FaUserTie, FaUsers, FaCalendarAlt, FaClipboardList, FaEdit } from 'react-icons/fa';

function StatCard({ to, icon, title, stat, sub, color, gradient }) {
  return (
    <Link to={to} className="admin-module-card"
      style={{ borderTopColor: color, textDecoration: 'none' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: gradient || color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', flexShrink: 0,
        boxShadow: `0 4px 12px ${color}40`
      }}>
        {(() => { const Icon = icon; return <Icon />; })()}
      </div>
      <div className="module-card-body">
        <div className="module-card-title">{title}</div>
        <div className="module-card-stat" style={{ color }}>
          {stat !== undefined && stat !== null ? stat : '—'}
        </div>
        {sub && <div className="module-card-sub">{sub}</div>}
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.allSettled([
          isAdmin ? adminEmployeeAPI.getAll() : Promise.resolve(null),
          isAdmin ? adminAircraftAPI.getAll() : Promise.resolve(null),
          isAdmin ? adminFlightAPI.getAll()   : Promise.resolve(null),
          attendanceAPI.getAll(),
          dutyReportAPI.getAll(),
        ]);
        setStats({
          employees:   results[0].value?.data?.data?.length ?? null,
          aircraft:    results[1].value?.data?.data?.length ?? null,
          flights:     results[2].value?.data?.data?.length ?? null,
          attendance:  results[3].value?.data?.data?.length ?? null,
          dutyReports: results[4].value?.data?.data?.length ?? null,
        });
      } catch {
        toast.error('Failed to load dashboard stats');
      }
    }
    load();
  }, [isAdmin]);

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="admin-page">

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #134e4a 0%, #0d9488 60%, #2dd4bf 100%)',
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(29,78,216,.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-40px', bottom: '-40px',
          fontSize: '12rem', opacity: 0.05, pointerEvents: 'none'
        }}><FaPlane /></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: '700', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {greeting}
          </p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', fontFamily: 'Sora, sans-serif', lineHeight: 1.2 }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <span style={{
            display: 'inline-block', marginTop: '8px',
            background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)',
            color: 'rgba(255,255,255,.9)', fontSize: '0.72rem', fontWeight: '700',
            padding: '3px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            {isAdmin ? <><FaKey style={{ verticalAlign: 'middle' }} /> Administrator</> : <><FaUserTie style={{ verticalAlign: 'middle' }} /> Staff Member</>}
          </span>
        </div>

        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,.7)', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.75rem', opacity: .6 }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
        Overview
      </h2>

      <div className="admin-module-grid">
        {isAdmin && (
          <>
            <StatCard
              to="/admin/employees" icon={FaUsers} title="Total Employees"
              stat={stats?.employees} sub="Active staff members"
              color="#2563eb" gradient="linear-gradient(135deg,#2563eb,#1e3a8a)"
            />
            <StatCard
              to="/admin/aircraft" icon={FaPlane} title="Aircraft Fleet"
              stat={stats?.aircraft} sub="Registered aircraft"
              color="#7c3aed" gradient="linear-gradient(135deg,#7c3aed,#4f46e5)"
            />
            <StatCard
              to="/admin/scheduling" icon={FaCalendarAlt} title="Scheduled Flights"
              stat={stats?.flights} sub="Active flight routes"
              color="#0891b2" gradient="linear-gradient(135deg,#0891b2,#0284c7)"
            />
          </>
        )}
        <StatCard
          to="/admin/attendance" icon={FaClipboardList} title="Attendance Records"
          stat={stats?.attendance} sub="Total records logged"
          color="#16a34a" gradient="linear-gradient(135deg,#16a34a,#059669)"
        />
        <StatCard
          to="/admin/duty-reports" icon={FaEdit} title="Duty Reports"
          stat={stats?.dutyReports} sub="Reports submitted"
          color="#d97706" gradient="linear-gradient(135deg,#d97706,#b45309)"
        />
      </div>

      {/* Quick links */}
      {isAdmin && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { to: '/admin/employees', label: '+ Add Employee', style: 'primary' },
              { to: '/admin/aircraft',  label: '+ Add Aircraft',  style: 'outline' },
              { to: '/admin/scheduling',label: '+ Schedule Flight', style: 'outline' },
              { to: '/admin/attendance',label: 'View Attendance',  style: 'outline' },
            ].map(a => (
              <Link
                key={a.to} to={a.to}
                className={a.style === 'primary' ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '9px 20px', fontSize: '0.88rem', textDecoration: 'none' }}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
