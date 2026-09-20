import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Wallet, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { fullName: form.fullName, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);
      login(data.user, data.token);
      navigate('/chat');
    } catch (err) {
      if (!err.response) {
        setError('Server is unreachable. Please check if the backend server is running.');
      } else if (typeof err.response.data === 'string' && (err.response.data.includes('ECONNREFUSED') || err.response.status === 500)) {
        setError('Backend server is not running (port 5000). Please start the backend server.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div
        style={{ background: 'var(--sidebar-bg)', flex: '1' }}
        className="hidden md:flex flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(109,90,230,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative z-10 text-center">
          <div
            style={{ background: 'var(--accent)', borderRadius: '20px' }}
            className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
          >
            <Wallet size={40} color="#fff" />
          </div>
          <h1 className="text-white text-4xl font-bold tracking-widest mb-2">CENDRIC</h1>
          <p style={{ color: 'var(--sidebar-text)', fontSize: '11px', letterSpacing: '4px' }}>
            EXPENSE TRACKER
          </p>
          <div className="mt-12 space-y-4">
            {[
              '💬 AI-powered spending analysis',
              '🧾 Scan receipts with Gemini AI',
              '📊 Track income & expenses',
            ].map((feat) => (
              <div
                key={feat}
                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                className="px-5 py-3 text-sm text-left"
                style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 20px' }}
              >
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#fff' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div style={{ background: 'var(--accent)', borderRadius: '10px' }} className="w-10 h-10 flex items-center justify-center">
              <Wallet size={20} color="#fff" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-widest" style={{ color: 'var(--sidebar-bg)' }}>CENDRIC</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '9px' }} className="tracking-widest uppercase">Expense Tracker</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {isRegister ? 'Create account' : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-8">
            {isRegister ? 'Start managing your finances smarter.' : 'Sign in to continue to Cendric.'}
          </p>

          {error && (
            <div
              style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: 'var(--danger)' }}
              className="px-4 py-3 text-sm mb-5"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={isRegister}
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid var(--border)', borderRadius: '10px',
                    fontSize: '14px', outline: 'none', color: 'var(--text-primary)',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid var(--border)', borderRadius: '10px',
                  fontSize: '14px', outline: 'none', color: 'var(--text-primary)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '11px 40px 11px 14px',
                    border: '1.5px solid var(--border)', borderRadius: '10px',
                    fontSize: '14px', outline: 'none', color: 'var(--text-primary)',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#a5b4fc' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s, transform 0.1s',
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--accent-hover)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--accent)')}
            >
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              id="toggle-auth-mode"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              style={{ color: 'var(--accent)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isRegister ? 'Sign In' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
