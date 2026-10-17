import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const GRADES = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'SPED'];
const BLANK = { full_name: '', position_subject: '', section_name: '', department_grade_level: '', years_in_service: 0, contact_no: '', sort_order: 0 };

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/staff').then(r => setStaff(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

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
    setEditId(s.id);
    setForm({ full_name: s.full_name || '', position_subject: s.position_subject || '', section_name: s.section_name || '', department_grade_level: s.department_grade_level || '', years_in_service: s.years_in_service || 0, contact_no: s.contact_no || '', sort_order: s.sort_order || 0 });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff record?')) return;
    await api.delete(`/staff/${id}`);
    toast.success('Deleted.'); load();
  };

  const filtered = staff.filter(s => {
    const gMatch = !filter || s.department_grade_level === filter;
    const sMatch = !search || s.full_name.toLowerCase().includes(search.toLowerCase());
    return gMatch && sMatch;
  });

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
        <input type="text" className="form-control" style={{ width: 240 }} placeholder="🔍 Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Grade Levels</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <span style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>{filtered.length} of {staff.length}</span>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Photo</th><th>Name</th><th>Position</th><th>Section</th><th>Grade</th><th>Photo Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>{s.photo_url ? <img src={getImageUrl(s.photo_url)} alt={s.full_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.4rem' }}>👤</span>}</td>
                  <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                  <td>{s.position_subject}</td>
                  <td>{s.section_name}</td>
                  <td>{s.department_grade_level}</td>
                  <td><span className={`badge ${s.photo_match_status === 'matched' ? 'badge-green' : s.photo_match_status === 'unmatched' ? 'badge-red' : 'badge-gold'}`}>{s.photo_match_status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(s)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(s.id)}>🗑️</button>
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
