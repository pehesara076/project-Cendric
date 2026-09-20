import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { DollarSign, Moon, Sun, Check, Globe, Sliders } from 'lucide-react';

const CURRENCIES = [
  { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee (LKR)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD)' },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [selectedCurrency, setSelectedCurrency] = useState(user?.currencyPreference || 'LKR');
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveCurrency = async (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setSavingCurrency(true);
    setMessage('');
    try {
      const { data } = await api.put('/auth/profile', { currencyPreference: currencyCode });
      updateUser({ currencyPreference: data.currencyPreference });
      setMessage('Currency preference updated successfully!');
    } catch (err) {
      setMessage('Failed to update currency preference.');
    } finally {
      setSavingCurrency(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '720px' }}>
      <div className="flex items-center gap-3 mb-6">
        <div
          style={{
            background: 'var(--accent)',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sliders size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Customize your app preferences, theme, and default currency
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            background: message.includes('successfully') ? '#ecfdf5' : '#fff1f2',
            border: `1px solid ${message.includes('successfully') ? '#a7f3d0' : '#fecdd3'}`,
            color: message.includes('successfully') ? 'var(--success)' : 'var(--danger)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
          className="animate-fade-in flex items-center gap-2"
        >
          <Check size={16} /> {message}
        </div>
      )}

      {/* Theme Card */}
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          border: '1px solid var(--border)',
          marginBottom: '20px',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <Moon size={22} color="var(--accent)" /> : <Sun size={22} color="var(--accent)" />}
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Appearance</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                Switch between Light mode and Dark mode
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={toggleTheme}
            style={{
              width: '60px',
              height: '32px',
              borderRadius: '99px',
              background: theme === 'dark' ? 'var(--accent)' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.3s ease',
              padding: '4px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ffffff',
                transform: theme === 'dark' ? 'translateX(28px)' : 'translateX(0)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {theme === 'dark' ? <Moon size={13} color="var(--accent)" /> : <Sun size={13} color="#f59e0b" />}
            </div>
          </button>
        </div>
      </div>

      {/* Currency Preference Card */}
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe size={22} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Currency Preference</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              Select your primary currency for transaction displays & AI assistant reports
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CURRENCIES.map((curr) => {
            const isSelected = selectedCurrency === curr.code;
            return (
              <div
                key={curr.code}
                onClick={() => handleSaveCurrency(curr.code)}
                style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                  background: isSelected ? 'var(--accent-light)' : 'var(--card-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between',
                  transition: 'all 0.2s ease',
                }}
                className="flex items-center justify-between hover:border-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                      width: '32px',
                    }}
                  >
                    {curr.symbol}
                  </span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{curr.code}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{curr.name}</p>
                  </div>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={13} color="#fff" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
