import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';
import { IconSearch, IconUser, IconUsers } from '../../components/Icons';

const GRADES = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'SPED'];
const BLANK = { full_name: '', position_subject: '', section_name: '', department_grade_level: '', years_in_service: 0, contact_no: '', sort_order: 0 };

const STATUS_LABEL = {
  matched: 'Photo matched',
  unmatched: 'Photo unmatched',
};

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    return api.get('/staff').then(r => setStaff(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  // Close profile modal on Escape, lock background scroll while open
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setSelected(null);
  }, []);

  useEffect(() => {
    if (selected) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selected, handleKeyDown]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('photo', file);
      if (editId) await api.put(`/staff/${editId}`, fd);
      else await api.post('/staff', fd);
      toast.success(editId ? 'Staff updated!' : 'Staff added!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (s) => {
    setSelected(null);
    setEditId(s.id);
    setForm({ full_name: s.full_name || '', position_subject: s.position_subject || '', section_name: s.section_name || '', department_grade_level: s.department_grade_level || '', years_in_service: s.years_in_service || 0, contact_no: s.contact_no || '', sort_order: s.sort_order || 0 });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff record?')) return;
    await api.delete(`/staff/${id}`);
    setSelected(null);
    toast.success('Deleted.'); load();
  };

  const filtered = staff.filter(s => {
    const gMatch = !filter || s.department_grade_level === filter;
    const sMatch = !search || s.full_name.toLowerCase().includes(search.toLowerCase());
    return gMatch && sMatch;
  });

  const hasActiveFilters = filter || search;
  const clearFilters = () => { setFilter(''); setSearch(''); };

  const openProfile = (s) => setSelected(s);

  const handleCardKeyDown = (e, s) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProfile(s);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">👨‍🏫 Faculty & Staff</h1><p className="admin-page-sub">{staff.length} staff records. Manage the faculty and staff directory.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>
          {showForm ? 'Close Form' : '+ Add Staff'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-control" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Position / Designation</label>
                <input type="text" className="form-control" value={form.position_subject} onChange={e => setForm(f => ({ ...f, position_subject: e.target.value }))} placeholder="e.g. Teacher III" />
              </div>
              <div className="form-group">
                <label className="form-label">Section Name</label>
                <input type="text" className="form-control" value={form.section_name} onChange={e => setForm(f => ({ ...f, section_name: e.target.value }))} placeholder="e.g. Rosal" />
              </div>
              <div className="form-group">
                <label className="form-label">Grade Level</label>
                <select className="form-control" value={form.department_grade_level} onChange={e => setForm(f => ({ ...f, department_grade_level: e.target.value }))}>
                  <option value="">Select Grade Level</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contact No.</label>
                <input type="text" className="form-control" value={form.contact_no} onChange={e => setForm(f => ({ ...f, contact_no: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Photo</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Staff'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrap">
          <span className="search-input-icon" aria-hidden="true"><IconSearch size={16} /></span>
          <input type="text" className="form-control" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Grade Levels</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {!loading && (
          <span className="result-count">
            <IconUsers size={14} />
            {filtered.length} of {staff.length}
          </span>
        )}
      </div>

      {/* Staff grid */}
      {loading ? (
        <div className="staff-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="card official-card" key={i}>
              <div className="skeleton" style={{ width: 112, height: 112, borderRadius: '50%', margin: '0 auto 16px' }} />
              <div className="skeleton" style={{ width: '80%', height: 10, margin: '0 auto 8px' }} />
              <div className="skeleton" style={{ width: '60%', height: 9, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true"><IconSearch size={22} /></div>
          <p>No staff found matching your criteria.</p>
          {hasActiveFilters && (
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </div>
      ) : (
        <div className="staff-grid">
          {filtered.map(s => (
            <div
              key={s.id}
              className="card official-card official-card-clickable"
              role="button"
              tabIndex={0}
              aria-label={`View profile for ${s.full_name}`}
              onClick={() => openProfile(s)}
              onKeyDown={(e) => handleCardKeyDown(e, s)}
              style={{ position: 'relative' }}
            >
              {/* Quick admin actions — stop propagation so the card click (open profile) doesn't also fire */}
              <div
                style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4, zIndex: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ width: 30, height: 30, background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}
                  aria-label={`Edit ${s.full_name}`}
                  onClick={() => handleEdit(s)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ width: 30, height: 30, background: 'var(--white)', boxShadow: 'var(--shadow-sm)', color: 'var(--red-primary)' }}
                  aria-label={`Delete ${s.full_name}`}
                  onClick={() => handleDelete(s.id)}
                >
                  🗑️
                </button>
              </div>

              <div className="official-photo-wrap">
                {s.photo_url ? (
                  <img src={getImageUrl(s.photo_url)} alt={s.full_name} className="avatar-photo avatar-photo-lg" />
                ) : (
                  <div className="avatar-placeholder avatar-placeholder-accent avatar-placeholder-lg" aria-hidden="true">
                    <IconUser size={40} />
                  </div>
                )}
                <span className="official-photo-hint">View profile</span>
              </div>

              <p className="official-name">{s.full_name}</p>
              <p className="official-position">{s.position_subject || '—'}</p>
              {s.section_name && <p className="official-office">Section: {s.section_name}</p>}

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                {s.department_grade_level && (
                  <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>{s.department_grade_level}</span>
                )}
                <span
                  className={`badge ${s.photo_match_status === 'matched' ? 'badge-green' : s.photo_match_status === 'unmatched' ? 'badge-red' : 'badge-gold'}`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {s.photo_match_status || 'pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile modal */}
      {selected && (
        <div className="staff-modal-overlay" onClick={() => setSelected(null)} role="presentation">
          <div
            className="staff-modal card"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.full_name} profile`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="staff-modal-close" onClick={() => setSelected(null)} aria-label="Close profile">
              &times;
            </button>

            <div className="staff-modal-photo-wrap">
              {selected.photo_url ? (
                <img src={getImageUrl(selected.photo_url)} alt={selected.full_name} className="avatar-photo staff-modal-photo" />
              ) : (
                <div className="avatar-placeholder avatar-placeholder-accent staff-modal-photo" aria-hidden="true">
                  <IconUser size={56} />
                </div>
              )}
            </div>

            <h3 className="staff-modal-name">{selected.full_name}</h3>
            <p className="staff-modal-position">{selected.position_subject || '—'}</p>

            <div className="staff-modal-meta">
              {selected.section_name && (
                <div className="staff-modal-meta-item">
                  <span className="staff-modal-meta-label">Section</span>
                  <span className="staff-modal-meta-value">{selected.section_name}</span>
                </div>
              )}
              {selected.department_grade_level && (
                <div className="staff-modal-meta-item">
                  <span className="staff-modal-meta-label">Grade Level</span>
                  <span className="badge badge-red">{selected.department_grade_level}</span>
                </div>
              )}
              {selected.contact_no && (
                <div className="staff-modal-meta-item">
                  <span className="staff-modal-meta-label">Contact No.</span>
                  <span className="staff-modal-meta-value">{selected.contact_no}</span>
                </div>
              )}
              {!!selected.years_in_service && (
                <div className="staff-modal-meta-item">
                  <span className="staff-modal-meta-label">Years in Service</span>
                  <span className="staff-modal-meta-value">{selected.years_in_service}</span>
                </div>
              )}
              <div className="staff-modal-meta-item">
                <span className="staff-modal-meta-label">Photo Status</span>
                <span className={`badge ${selected.photo_match_status === 'matched' ? 'badge-green' : selected.photo_match_status === 'unmatched' ? 'badge-red' : 'badge-gold'}`}>
                  {STATUS_LABEL[selected.photo_match_status] || selected.photo_match_status || 'Pending'}
                </span>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 20, justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selected)}>✏️ Edit</button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(selected.id)}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
