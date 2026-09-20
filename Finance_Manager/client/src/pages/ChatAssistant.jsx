import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Paperclip,
  Bot,
  Check,
  Edit3,
  X,
  AlertCircle,
  Receipt,
} from 'lucide-react';

const CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Salary', 'Others'];
const GREETING = `👋 Hi! I'm **Cendric**, your personal finance assistant.

Here's what I can help you with:
• **Ask me anything** about your spending — "How much did I spend on food this month?"
• **Upload a receipt** using the 📎 button and I'll extract the details and save it for you.
• Get your **current balance**, spending breakdowns by category, and more.

What would you like to know?`;

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const lines = msg.content.split('\n');

  return (
    <div
      className="flex animate-fade-in"
      style={{ justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px' }}
    >
      {!isUser && (
        <div
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginRight: '10px', flexShrink: 0, alignSelf: 'flex-end',
          }}
        >
          <Bot size={16} color="#fff" />
        </div>
      )}
      <div
        style={{
          maxWidth: '72%',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'var(--accent)' : '#fff',
          color: isUser ? '#fff' : 'var(--text-primary)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        {lines.map((line, i) => (
          <p key={i} style={{ marginBottom: i < lines.length - 1 ? '4px' : 0 }}>
            {parseBold(line)}
          </p>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex animate-fade-in" style={{ marginBottom: '16px' }}>
      <div
        style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginRight: '10px', flexShrink: 0,
        }}
      >
        <Bot size={16} color="#fff" />
      </div>
      <div
        style={{
          padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex', gap: '5px', alignItems: 'center',
        }}
      >
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function ExtractedCard({ data, onConfirm, onEdit, onDismiss, currency = 'INR' }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...data });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onConfirm(form);
    setSaving(false);
  };

  return (
    <div className="flex animate-fade-in" style={{ marginBottom: '16px' }}>
      <div
        style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginRight: '10px', flexShrink: 0, alignSelf: 'flex-start',
        }}
      >
        <Receipt size={16} color="#fff" />
      </div>
      <div
        style={{
          maxWidth: '80%',
          background: '#fff',
          borderRadius: '18px 18px 18px 4px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ background: 'var(--accent)', padding: '10px 16px' }}>
          <p className="text-white font-semibold text-sm">📄 Receipt Extracted</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
            Review the details below before saving
          </p>
        </div>

        <div style={{ padding: '14px 16px' }}>
          {editing ? (
            <div className="space-y-3" style={{ fontSize: '13px' }}>
              {[
                { label: 'Amount', field: 'amount', type: 'number' },
                { label: 'Description', field: 'description', type: 'text' },
                { label: 'Date', field: 'date', type: 'date' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    style={{
                      display: 'block', width: '100%', marginTop: '4px',
                      padding: '7px 10px', border: '1.5px solid var(--border)',
                      borderRadius: '8px', fontSize: '13px', outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              ))}
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{
                    display: 'block', width: '100%', marginTop: '4px',
                    padding: '7px 10px', border: '1.5px solid var(--border)',
                    borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff',
                  }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{
                    display: 'block', width: '100%', marginTop: '4px',
                    padding: '7px 10px', border: '1.5px solid var(--border)',
                    borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff',
                  }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '14px' }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: form.type === 'income' ? 'var(--success)' : 'var(--danger)', marginBottom: '6px' }}>
                {form.type === 'income' ? '+' : '-'}{currency} {Number(form.amount).toLocaleString()}
              </p>
              <div className="space-y-1.5">
                <Row label="Description" value={form.description} />
                <Row label="Category" value={form.category} />
                <Row label="Date" value={form.date} />
                <Row label="Type" value={form.type.charAt(0).toUpperCase() + form.type.slice(1)} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              id="confirm-receipt-btn"
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px',
                background: 'var(--accent)', color: '#fff', border: 'none',
                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <Check size={14} /> {saving ? 'Saving...' : 'Confirm & Save'}
            </button>
            <button
              id="edit-receipt-btn"
              onClick={() => setEditing(!editing)}
              style={{
                padding: '9px 14px', borderRadius: '8px',
                background: 'var(--main-bg)', border: '1.5px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <Edit3 size={13} /> {editing ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={onDismiss}
              style={{
                padding: '9px 12px', borderRadius: '8px',
                background: 'var(--main-bg)', border: '1.5px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2" style={{ fontSize: '13px' }}>
      <span style={{ color: 'var(--text-muted)', minWidth: '90px' }}>{label}:</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ChatAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractedMsgIndex, setExtractedMsgIndex] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Load chat history on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/chat/history');
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m) => ({ role: m.role, content: m.content })));
          setSessionId(data.sessionId);
        } else {
          setMessages([{ role: 'assistant', content: GREETING }]);
        }
      } catch {
        setMessages([{ role: 'assistant', content: GREETING }]);
      }
      setHistoryLoaded(true);
    })();
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const { data } = await api.post('/chat/message', { question: q, sessionId });
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, I ran into an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-uploaded
    e.target.value = '';

    setUploading(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `📎 Uploaded: ${file.name}` },
    ]);

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const { data } = await api.post('/transactions/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const cardIndex = messages.length + 1;
      setExtractedData(data);
      setExtractedMsgIndex(cardIndex);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '__EXTRACTED_CARD__' },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not extract receipt data.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${msg}` },
      ]);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmReceipt = async (form) => {
    try {
      await api.post('/transactions', {
        type: form.type,
        amount: form.amount,
        category: form.category,
        date: form.date,
        description: form.description,
        source: 'receipt-ai',
      });

      setExtractedData(null);
      setMessages((prev) => {
        const updated = [...prev];
        // Replace the card placeholder message with confirmation
        const idx = updated.findIndex((m) => m.content === '__EXTRACTED_CARD__');
        if (idx !== -1) updated[idx] = { role: 'assistant', content: '__CONFIRMED__' };
        return [...updated, {
          role: 'assistant',
          content: `✅ Got it! I've saved **${form.description}** (${form.category}) for **${user?.currencyPreference || 'INR'} ${Number(form.amount).toLocaleString()}** on ${form.date}. You can view it in the Transactions tab.`,
        }];
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Failed to save the transaction. Please try again.' },
      ]);
    }
  };

  const handleDismissCard = () => {
    setExtractedData(null);
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.content === '__EXTRACTED_CARD__');
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { role: 'assistant', content: '❌ Receipt dismissed — nothing was saved.' };
        return updated;
      }
      return prev;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!historyLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div
        style={{
          padding: '18px 28px',
          borderBottom: '1px solid var(--border)',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ background: 'var(--accent)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={18} color="#fff" />
        </div>
        <div>
          <h1 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Chat Assistant</h1>
          <p style={{ color: 'var(--success)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Online · Powered by Gemini AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {messages.map((msg, i) => {
          if (msg.content === '__EXTRACTED_CARD__' && extractedData) {
            return (
              <ExtractedCard
                key={i}
                data={extractedData}
                currency={user?.currencyPreference || 'INR'}
                onConfirm={handleConfirmReceipt}
                onEdit={() => {}}
                onDismiss={handleDismissCard}
              />
            );
          }
          if (msg.content === '__EXTRACTED_CARD__' || msg.content === '__CONFIRMED__') return null;
          return <MessageBubble key={i} msg={msg} />;
        })}
        {(loading || uploading) && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px',
            background: 'var(--main-bg)',
            borderRadius: '16px',
            padding: '8px 8px 8px 16px',
            border: '1.5px solid var(--border)',
          }}
        >
          {/* Attach button */}
          <button
            id="attach-receipt-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: 'none', background: uploading ? 'var(--accent-light)' : 'transparent',
              color: uploading ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}
            title="Attach receipt"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          {/* Textarea */}
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances or attach a receipt..."
            disabled={loading || uploading}
            style={{
              flex: 1, resize: 'none', border: 'none', background: 'transparent',
              outline: 'none', fontSize: '14px', color: 'var(--text-primary)',
              lineHeight: '1.5', paddingTop: '6px', paddingBottom: '6px',
              fontFamily: 'inherit',
            }}
          />

          {/* Send button */}
          <button
            id="send-message-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading || uploading}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: 'none',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
              color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
          Press Enter to send · Shift+Enter for new line · 📎 to attach a receipt
        </p>
      </div>
    </div>
  );
}
