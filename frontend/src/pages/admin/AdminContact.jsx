import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/helpers';

export default function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/contact/messages').then(r => setMessages(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await api.put(`/contact/messages/${id}/read`); load(); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/contact/messages/${id}`); toast.success('Deleted.'); load(); };

  const filtered = messages.filter(m => filter === 'all' ? true : filter === 'unread' ? !m.is_read : m.is_read);
  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">✉️ Contact Messages</h1>
          <p className="admin-page-sub">{unread} unread of {messages.length} total messages.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'unread', 'read'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Status</th><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} style={{ background: m.is_read ? '' : 'var(--red-pale)' }}>
                  <td>{m.is_read ? <span className="badge badge-gray">Read</span> : <span className="badge badge-red">New</span>}</td>
                  <td style={{ fontWeight: 600 }}>{m.sender_name}</td>
                  <td>{m.sender_email || '—'}</td>
                  <td>{m.subject || '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{formatDate(m.submitted_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!m.is_read && <button className="btn btn-ghost btn-sm" onClick={() => markRead(m.id)}>✅ Mark Read</button>}
                      {m.sender_email && <a href={`mailto:${m.sender_email}?subject=Re: ${m.subject || 'Your inquiry to BES'}`} className="btn btn-ghost btn-sm">📧 Reply</a>}
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(m.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
