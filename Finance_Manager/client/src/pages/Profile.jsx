import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogOut, User, Mail, Calendar, Globe, Shield } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [txnCount, setTxnCount] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, txnRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/transactions?limit=1'),
        ]);
        setProfile(profileRes.data);
        setTxnCount(txnRes.data.total);
      } catch {
        // If profile fails, fall back to cached user
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayUser = profile || user;
  const initials = displayUser?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div style={{ padding: '28px', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>Profile</h1>

      {/* Avatar card */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: '16px', textAlign: 'center' }}>
        <div
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, #9333ea 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 auto 16px',
            boxShadow: '0 4px 20px rgba(109,90,230,0.35)',
          }}
        >
          {initials}
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{displayUser?.fullName}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{displayUser?.email}</p>

        {txnCount !== null && (
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)' }}>{txnCount}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions</p>
            </div>
          </div>
        )}
      </div>

      {/* Info card */}
      <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px' }}>
        {[
          { icon: <User size={16} color="var(--accent)" />, label: 'Full Name', value: displayUser?.fullName },
          { icon: <Mail size={16} color="var(--accent)" />, label: 'Email', value: displayUser?.email },
          { icon: <Globe size={16} color="var(--accent)" />, label: 'Currency', value: profile?.currencyPreference || 'INR' },
          { icon: <Calendar size={16} color="var(--accent)" />, label: 'Member Since', value: joinDate },
          { icon: <Shield size={16} color="var(--accent)" />, label: 'Auth', value: 'JWT (7-day token)' },
        ].map(({ icon, label, value }, i, arr) => (
          <div
            key={label}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px 24px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{value || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        id="logout-btn"
        onClick={handleLogout}
        style={{
          width: '100%', padding: '14px', borderRadius: '14px',
          background: '#fff1f2', border: '1.5px solid #fecdd3',
          color: 'var(--danger)', fontWeight: 700, fontSize: '14px',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px', transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.background = '#ffe4e6')}
        onMouseLeave={(e) => (e.target.style.background = '#fff1f2')}
      >
        <LogOut size={16} /> Sign Out
      </button>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', marginTop: '16px' }}>
        Cendric · AI-Powered Finance Assistant · University Prototype
      </p>
    </div>
  );
}
