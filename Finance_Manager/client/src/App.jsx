import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import ChatAssistant from './pages/ChatAssistant';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import {
  MessageSquare,
  ArrowLeftRight,
  User,
  Wallet,
  LogOut,
  Sliders,
} from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/chat', icon: <MessageSquare size={18} />, label: 'Chat Assistant' },
    { to: '/transactions', icon: <ArrowLeftRight size={18} />, label: 'Transactions' },
    { to: '/profile', icon: <User size={18} />, label: 'Profile' },
    { to: '/settings', icon: <Sliders size={18} />, label: 'Settings' },
  ];

  return (
    <aside
      style={{ background: 'var(--sidebar-bg)', width: '240px', minHeight: '100vh' }}
      className="flex flex-col shrink-0"
    >
      {/* Logo Block */}
      <div className="flex items-center gap-4 px-5 py-6">
        <div
          style={{ background: 'var(--accent)', borderRadius: '10px' }}
          className="w-10 h-10 flex items-center justify-center"
        >
          <Wallet size={20} color="#fff" />
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-widest">CENDRIC</p>
          <p style={{ color: 'var(--sidebar-text)', fontSize: '9px' }} className="tracking-widest uppercase">
            Expense Tracker
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to === '/chat' && location.pathname === '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive: navActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: navActive || isActive ? '600' : '400',
                color: navActive || isActive ? '#fff' : 'var(--sidebar-text)',
                background: navActive || isActive ? 'rgba(109,90,230,0.18)' : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
              })}
            >
              {({ isActive: navActive }) => (
                <>
                  {item.icon}
                  <span>{item.label}</span>
                  {(navActive || isActive) && (
                    <span
                      style={{
                        position: 'absolute',
                        right: '10px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        className="p-4 flex items-center gap-3"
      >
        <div
          style={{ background: 'var(--accent)', borderRadius: '50%' }}
          className="w-8 h-8 flex items-center justify-center text-white text-xs font-bold shrink-0"
        >
          {user?.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
          <p style={{ color: 'var(--sidebar-text)', fontSize: '10px' }} className="truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          style={{ color: 'var(--sidebar-text)' }}
          className="hover:text-white transition-colors"
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

function AppLayout({ children }) {
  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--main-bg)' }}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <Login />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatAssistant />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Transactions />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
