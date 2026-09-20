import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, Plus, X, Check, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Salary', 'Others'];

const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  'Bills & Utilities': '#8b5cf6',
  Salary: '#10b981',
  Others: '#64748b',
};

const EMPTY_FORM = { type: 'expense', amount: '', category: 'Others', date: new Date().toISOString().slice(0, 10), description: '', source: 'manual' };

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ background: color + '18', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <p style={{ color, fontSize: '20px', fontWeight: 800 }}>{value}</p>
      </div>
    </div>
  );
}

function Modal({ title, onClose, onSave, form, setForm }) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave();
    setSaving(false);
  };

  const fields = [
    { label: 'Description', field: 'description', type: 'text', required: true },
    { label: 'Amount', field: 'amount', type: 'number', required: true },
    { label: 'Date', field: 'date', type: 'date', required: true },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '420px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, field, type, required }) => (
            <div key={field}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{label}</label>
              <input
                type={type}
                required={required}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff' }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Type</label>
            <div className="flex gap-2">
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '10px', border: '2px solid',
                    borderColor: form.type === t ? (t === 'income' ? 'var(--success)' : 'var(--danger)') : 'var(--border)',
                    background: form.type === t ? (t === 'income' ? '#ecfdf5' : '#fff1f2') : '#fff',
                    color: form.type === t ? (t === 'income' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {t === 'income' ? '↑ ' : '↓ '}{t}
                </button>
              ))}
            </div>
          </div>
          <button
            id="save-transaction-btn"
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: saving ? '#a5b4fc' : 'var(--accent)', color: '#fff',
              border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <Check size={15} /> {saving ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState(null);

  const currencySymbolMap = {
    LKR: 'Rs.',
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
  };

  const currencySymbol = currencySymbolMap[user?.currencyPreference] || user?.currencyPreference || 'Rs.';

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions?limit=200');
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleEdit = (txn) => {
    setEditTarget(txn);
    setForm({
      type: txn.type,
      amount: txn.amount,
      category: txn.category,
      date: txn.date?.slice(0, 10) || '',
      description: txn.description,
      source: txn.source || 'manual',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editTarget) {
      await api.put(`/transactions/${editTarget._id}`, form);
    } else {
      await api.post('/transactions', form);
    }
    setShowModal(false);
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: '28px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          id="add-transaction-btn"
          onClick={handleAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: '12px', fontWeight: 600,
            fontSize: '13px', cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Income" value={`${currencySymbol} ${totalIncome.toLocaleString()}`} icon={<TrendingUp size={22} color="var(--success)" />} color="var(--success)" />
        <StatCard label="Total Expenses" value={`${currencySymbol} ${totalExpense.toLocaleString()}`} icon={<TrendingDown size={22} color="var(--danger)" />} color="var(--danger)" />
        <StatCard label="Net Balance" value={`${currencySymbol} ${Math.abs(balance).toLocaleString()}`} icon={<Wallet size={22} color="var(--accent)" />} color={balance >= 0 ? 'var(--success)' : 'var(--danger)'} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>💸</p>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No transactions yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Add one manually or upload a receipt in Chat Assistant.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Description', 'Category', 'Type', 'Date', 'Amount', ''].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, i) => (
                <tr
                  key={txn._id}
                  style={{
                    borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {txn.description || '—'}
                    {txn.source === 'receipt-ai' && (
                      <span style={{ marginLeft: '6px', fontSize: '10px', background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>
                        AI
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      color: CATEGORY_COLORS[txn.category] || 'var(--text-muted)',
                      background: (CATEGORY_COLORS[txn.category] || '#64748b') + '18',
                      padding: '3px 10px', borderRadius: '20px',
                    }}>
                      {txn.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)',
                      background: txn.type === 'income' ? '#ecfdf5' : '#fff1f2',
                      padding: '3px 10px', borderRadius: '20px',
                    }}>
                      {txn.type === 'income' ? '↑ Income' : '↓ Expense'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {txn.date ? new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: '14px', color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {txn.type === 'income' ? '+' : '-'}{currencySymbol} {txn.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div className="flex items-center gap-2">
                      <button
                        id={`edit-txn-${txn._id}`}
                        onClick={() => handleEdit(txn)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        id={`delete-txn-${txn._id}`}
                        onClick={() => handleDelete(txn._id)}
                        disabled={deletingId === txn._id}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: deletingId === txn._id ? 'var(--text-muted)' : 'var(--danger)', padding: '4px' }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal
          title={editTarget ? 'Edit Transaction' : 'Add Transaction'}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          form={form}
          setForm={setForm}
        />
      )}
    </div>
  );
}
