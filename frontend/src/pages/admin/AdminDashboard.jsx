import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ACCOUNTABILITY_LABELS = {
  acc_transparency_seal: 'Transparency Seal',
  acc_aip_wfp_app: 'AIP / WFP / APP',
  acc_saln: 'SALN',
  acc_philgeps: 'PhilGEPS',
  acc_coa_aom: 'COA / AOM',
  acc_foi: 'FOI',
  acc_arta: 'ARTA',
  acc_ccsr_csm: 'CCSR / CSM',
  acc_8888_ccb: '8888 / CCB',
};

function StatusBadge({ status }) {
  const map = {
    Completed:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    'In Progress': { bg: '#eff6ff', color: '#1565C0', border: '#bfdbfe' },
    Pending:     { bg: '#fffbeb', color: '#D97706', border: '#fde68a' },
    Overdue:     { bg: '#fef2f2', color: '#DC2626', border: '#fecaca' },
  };
  const s = map[status] || map.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
      borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status || 'Pending'}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [dash, setDash] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/staff').then(r => r.data.length),
      api.get('/faqs').then(r => r.data.length),
      api.get('/contact/messages').then(r => r.data),
      api.get('/issuances').then(r => r.data.length),
      api.get('/resources').then(r => r.data.length),
      api.get('/ppas').then(r => r.data.length),
      api.get('/accomplishments').then(r => r.data.length).catch(() => 0),
      api.get('/charter').then(r => (Array.isArray(r.data) ? r.data : [])).catch(() => []),
      api.get('/school-heads').then(r => r.data.length).catch(() => 0),
      api.get('/banners/all').then(r => r.data).catch(() => []),
      api.get('/committees').then(r => r.data).catch(() => []),
      api.get('/school-dashboard').catch(() => ({ data: { stats: {}, grades: [] } })),
    ]).then(([staff, faqs, msgs, issuances, resources, ppas, accomplishments, charterDocs, schoolHeads, banners, committees, dashRes]) => {
      const charterUploaded = charterDocs.filter(d => d.pdf_url).length;
      const observanceActive = banners.filter(b => b.observance_tag && b.is_active).length;
      const allMembers = committees.flatMap(c => c.members || []);
      const membersMissingPhoto = allMembers.filter(m => !m.photo_url).length;
      setStats({
        staff, faqs, issuances, resources, ppas, accomplishments,
        charterUploaded, schoolHeads, observanceActive, membersMissingPhoto,
        unread: msgs.filter(m => !m.is_read).length,
      });
      setMessages(msgs.slice(0, 5));
      setDash(dashRes?.data || { stats: {}, grades: [] });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const s = dash?.stats || {};
  const grades = dash?.grades || [];
  const totalSections = grades.reduce((a, g) => a + (Number(g.sections_count) || 0), 0);
  const accItems = Object.keys(ACCOUNTABILITY_LABELS);
  const accCompleted = accItems.filter(k => s[k] === 'Completed').length;
  const accPending = accItems.filter(k => s[k] === 'Pending' || !s[k]).length;
  const accOverdue = accItems.filter(k => s[k] === 'Overdue').length;

  const contentCards = [
    { icon: '👨‍🏫', label: 'Staff Members', val: stats.staff, path: '/admin/staff', color: 'var(--red-primary)' },
    { icon: '❓', label: 'FAQs', val: stats.faqs, path: '/admin/faqs', color: '#4F46E5' },
    { icon: '📢', label: 'Issuances', val: stats.issuances, path: '/admin/issuances', color: '#0891B2' },
    { icon: '📚', label: 'Resources', val: stats.resources, path: '/admin/resources', color: '#059669' },
    { icon: '🎓', label: 'PPAs', val: stats.ppas, path: '/admin/ppas', color: '#D97706' },
    { icon: '🏆', label: 'Accomplishments', val: stats.accomplishments, path: '/admin/accomplishments', color: '#7C3AED' },
    { icon: '👤', label: 'School Heads', val: stats.schoolHeads, path: '/admin/school-heads', color: '#0891B2' },
    { icon: '✉️', label: 'Unread Messages', val: stats.unread, path: '/admin/contact', color: stats.unread > 0 ? '#DC2626' : '#6B7280' },
  ];

  const quickActions = [
    { icon: '📊', label: 'Update School Dashboard', path: '/admin/school-dashboard' },
    { icon: '🖼️', label: 'Manage Slideshow', path: '/admin/banners' },
    { icon: '📝', label: 'Edit About Us', path: '/admin/content' },
    { icon: '👨‍🏫', label: 'Add Staff', path: '/admin/staff' },
    { icon: '📋', label: 'Upload Issuance', path: '/admin/issuances' },
    { icon: '📅', label: 'Add Calendar Event', path: '/admin/calendar' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">Welcome to the BES Admin Panel. Manage all website content from here.</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">🌐 View Public Site</a>
      </div>

      {/* ── SCHOOL PERFORMANCE SNAPSHOT ─────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', margin: 0 }}>
            📊 School Performance Snapshot
          </h2>
          {s.active_school_year && (
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '4px 10px', borderRadius: 12 }}>
              SY {s.active_school_year}
            </span>
          )}
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 14 }}>
          {[
            { label: 'Total Enrollment', val: Number(s.enrollment_count) || 0, color: '#1565C0', icon: '👥' },
            { label: 'Teaching Personnel', val: Number(s.teaching_personnel) || 0, color: '#2B63BF', icon: '👨‍🏫' },
            { label: 'Non-Teaching Staff', val: Number(s.non_teaching_personnel) || 0, color: '#7C3AED', icon: '🏢' },
            { label: 'Admin Staff', val: Number(s.administrative_staff) || 0, color: '#0891B2', icon: '📋' },
            { label: 'Total Sections', val: totalSections, color: '#D97706', icon: '📚' },
            { label: 'Vacant Positions', val: Number(s.vacant_positions) || 0, color: Number(s.vacant_positions) > 0 ? '#DC2626' : '#6B7280', icon: '⚠️' },
          ].map(c => (
            <Link key={c.label} to="/admin/school-dashboard" style={{
              display: 'block', background: 'white', borderRadius: 'var(--radius-lg)',
              padding: '16px 18px', border: '1px solid var(--gray-200)', textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{c.label}</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 900, color: c.color, lineHeight: 1 }}>{loading ? '—' : c.val.toLocaleString()}</p>
                </div>
                <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quality & rates row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 12, marginBottom: 14 }}>
          {[
            { label: 'Overall Proficiency', val: Number(s.overall_proficiency) > 0 ? `${Number(s.overall_proficiency).toFixed(1)}%` : '—', color: '#1565C0', icon: '📈' },
            { label: 'Retention Rate', val: Number(s.retention_rate) > 0 ? `${Number(s.retention_rate).toFixed(1)}%` : '—', color: '#2B63BF', icon: '✅' },
            { label: 'Dropout Rate', val: Number(s.dropout_rate) > 0 ? `${Number(s.dropout_rate).toFixed(1)}%` : '—', color: Number(s.dropout_rate) > 0 ? '#DC2626' : '#6B7280', icon: '⚠️' },
            { label: 'Completion Rate', val: Number(s.transition_completion_rate) > 0 ? `${Number(s.transition_completion_rate).toFixed(1)}%` : '—', color: '#7C3AED', icon: '🎓' },
            { label: 'Learners w/ Disabilities', val: Number(s.learners_with_disabilities) || 0, color: '#0891B2', icon: '♿' },
            { label: 'Child Protection Cases', val: Number(s.child_protection_cases) || 0, color: Number(s.child_protection_cases) > 0 ? '#DC2626' : '#6B7280', icon: '🛡️' },
          ].map(c => (
            <Link key={c.label} to="/admin/school-dashboard" style={{
              display: 'flex', alignItems: 'center', gap: 12, background: 'white',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px', border: '1px solid var(--gray-200)',
              textDecoration: 'none', boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition)',
            }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{c.icon}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>{c.label}</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: c.color, margin: 0 }}>{loading ? '—' : (typeof c.val === 'number' ? c.val.toLocaleString() : c.val)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── ACCOUNTABILITY COMPLIANCE ──────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--gray-100)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>
            🏛️ Agency Accountabilities Compliance
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              ✅ {accCompleted} Completed
            </span>
            {accPending > 0 && (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: '#fffbeb', color: '#D97706', border: '1px solid #fde68a' }}>
                ⏳ {accPending} Pending
              </span>
            )}
            {accOverdue > 0 && (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: '#fef2f2', color: '#DC2626', border: '1px solid #fecaca' }}>
                🚨 {accOverdue} Overdue
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
          {Object.entries(ACCOUNTABILITY_LABELS).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)' }}>{label}</span>
              <StatusBadge status={s[key] || 'Pending'} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)' }}>Digitalization</span>
            <StatusBadge status={s.digitalization_status || 'In Progress'} />
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <Link to="/admin/school-dashboard" style={{ fontSize: '0.78rem', color: 'var(--blue-primary)', fontWeight: 600 }}>Update Compliance Status →</Link>
        </div>
      </div>

      {/* ── CONTENT CARDS ─────────────────────────────────────── */}
      <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>📁 Content Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 22 }}>
        {contentCards.map(c => (
          <Link key={c.label} to={c.path} style={{
            display: 'block', background: 'white', borderRadius: 'var(--radius-lg)', padding: '18px 20px',
            border: '1px solid var(--gray-200)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{c.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 900, color: c.color, lineHeight: 1 }}>{loading ? '—' : (c.val ?? 0)}</p>
              </div>
              <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── STATUS CARDS ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14, marginBottom: 26 }}>
        <Link to="/admin/school-dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 'var(--radius-lg)', padding: '14px 18px', border: '1px solid var(--gray-200)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.7rem' }}>📊</span>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>School Performance Dashboard</p>
            <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>Enrollment, Quality, Governance & More</p>
          </div>
        </Link>
        <Link to="/admin/charter" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 'var(--radius-lg)', padding: '14px 18px', border: '1px solid var(--gray-200)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.7rem' }}>📜</span>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Citizen's Charter</p>
            <p style={{ fontSize: '0.84rem', fontWeight: 700, color: loading ? 'var(--gray-900)' : (stats.charterUploaded < 16 ? '#D97706' : '#059669'), margin: 0 }}>
              {loading ? '…' : `${stats.charterUploaded ?? 0} / 16 uploaded`}
            </p>
          </div>
        </Link>
        <Link to="/admin/banners" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 'var(--radius-lg)', padding: '14px 18px', border: '1px solid var(--gray-200)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.7rem' }}>🗓️</span>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Observance Banners</p>
            <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>{loading ? '…' : `${stats.observanceActive ?? 0} of 6 active`}</p>
          </div>
        </Link>
        <Link to="/admin/committees" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 'var(--radius-lg)', padding: '14px 18px', border: '1px solid var(--gray-200)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '1.7rem' }}>📸</span>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Committee Photos</p>
            <p style={{ fontSize: '0.84rem', fontWeight: 700, color: loading ? 'var(--gray-900)' : (stats.membersMissingPhoto > 0 ? '#D97706' : '#059669'), margin: 0 }}>
              {loading ? '…' : (stats.membersMissingPhoto > 0 ? `${stats.membersMissingPhoto} missing photo` : '✅ All uploaded')}
            </p>
          </div>
        </Link>
      </div>

      {/* ── QUICK ACTIONS + MESSAGES ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <div className="admin-card">
          <h2 className="admin-card-title">⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {quickActions.map(a => (
              <Link key={a.label} to={a.path} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-700)', transition: 'all var(--transition)', border: '1px solid var(--gray-200)' }}>
                <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--gray-100)' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>✉️ Recent Messages</h2>
            <Link to="/admin/contact" style={{ fontSize: '0.76rem', color: 'var(--red-primary)', fontWeight: 600 }}>View All</Link>
          </div>
          {loading ? <div className="spinner" style={{ margin: '14px auto' }} /> : messages.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: '0.84rem' }}>No messages yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {messages.map(m => (
                <div key={m.id} style={{ padding: '9px 11px', background: m.is_read ? 'var(--gray-50)' : 'var(--red-pale)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${m.is_read ? 'var(--gray-200)' : 'var(--red-primary)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--gray-900)' }}>{m.sender_name}</p>
                    {!m.is_read && <span className="badge badge-red" style={{ fontSize: '0.62rem' }}>New</span>}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>{m.subject || 'No subject'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginTop: 18, padding: '13px 16px', background: '#FEF9C3', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A', fontSize: '0.8rem', color: '#92400E' }}>
        📋 <strong>Note:</strong> The CSM link set in <Link to="/admin/feedback" style={{ color: '#92400E', fontWeight: 600 }}>Feedback Links</Link> also powers the floating CSM widget on the homepage.
      </div>
      <div style={{ marginTop: 12, padding: '14px 18px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
        🔒 <strong>Admin Access:</strong> Set your private <code>ADMIN_MAGIC_CODE</code> and use it in the admin login URL. Keep the URL confidential.
      </div>
    </div>
  );
}
