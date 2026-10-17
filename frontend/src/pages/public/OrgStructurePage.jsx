import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconLayers, IconUser } from '../../components/Icons';

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23e5e7eb"/><circle cx="40" cy="30" r="16" fill="%239ca3af"/><ellipse cx="40" cy="62" rx="24" ry="16" fill="%239ca3af"/></svg>';

const GRADE_LEVELS = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'SPED', 'Non-Teaching'];

export default function OrgStructurePage() {
  const [orgChart, setOrgChart] = useState(null);
  const [staff, setStaff] = useState([]);
  const [info, setInfo] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/org-chart'),
      api.get('/staff'),
      api.get('/school-info'),
      api.get('/officials').catch(() => ({ data: [] })),
    ]).then(([o, s, i, off]) => {
      setOrgChart(o.data);
      setStaff(s.data);
      setInfo(i.data);
      setOfficials(off.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // School Head & Admin Officer are rows in the officials table — pulling from
  // there (not school_info) is what gives us their uploaded photo_url
  const schoolHead = officials.find(o => o.full_name === info?.principal_name)
    || officials.find(o => o.position && o.position.toLowerCase().includes('principal'));
  const adminOfficer = officials.find(
    o => o.position && o.position.toLowerCase().includes('administrative officer')
  );

  // Normalize an officials-table record into the shape the profile modal expects
  // (which was built around staff_directory fields)
  const openOfficialProfile = (o) => setSelected({
    full_name: o.full_name,
    position_subject: o.position,
    section_name: o.department_office,
    photo_url: o.photo_url,
  });

  const handleOfficialKeyDown = (e, o) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openOfficialProfile(o);
    }
  };

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

  const handleCardKeyDown = (e, m) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected(m);
    }
  };

  // Group staff by department_grade_level
  const grouped = GRADE_LEVELS.reduce((acc, gl) => {
    const members = staff.filter(m => m.department_grade_level === gl);
    if (members.length) acc[gl] = members;
    return acc;
  }, {});

  // Any grade levels not in the predefined list
  const otherKeys = [...new Set(staff.map(m => m.department_grade_level).filter(k => k && !GRADE_LEVELS.includes(k)))];
  otherKeys.forEach(k => { grouped[k] = staff.filter(m => m.department_grade_level === k); });

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Organizational Structure</h1>
          <p>School governance, org chart, and faculty & staff directory</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Org Chart */}
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--gray-900)', marginBottom: 20 }}>Org Chart</h2>
          {loading ? (
            <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 10 }} />
          ) : orgChart?.image_url ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
              <img
                src={getImageUrl(orgChart.image_url)}
                alt="BES Organizational Chart placeholder"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="alert alert-info" style={{ marginBottom: 32 }}>
              The organizational chart has not been uploaded yet. Please check back soon.
            </div>
          )}

          {/* School Head / Admin Officer spotlight — sits below the org chart */}
          {loading ? (
            <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 16, marginBottom: 48 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
              {info?.principal_name && (
                <div
                  className="card"
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile for ${info.principal_name}`}
                  onClick={() => schoolHead ? openOfficialProfile(schoolHead) : setSelected({ full_name: info.principal_name, position_subject: info.principal_title })}
                  onKeyDown={(e) => handleOfficialKeyDown(e, schoolHead || { full_name: info.principal_name, position: info.principal_title })}
                  style={{
                    padding: '32px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    flexWrap: 'wrap',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(120deg, var(--blue-dark), var(--blue-primary))',
                  }}
                >
                  {schoolHead?.photo_url ? (
                    <img
                      src={getImageUrl(schoolHead.photo_url)}
                      alt={info.principal_name}
                      style={{
                        width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                        objectFit: 'cover', border: '2px solid rgba(255,255,255,0.35)',
                      }}
                      onError={e => { e.target.src = PLACEHOLDER_AVATAR; }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.16)', border: '2px solid rgba(255,255,255,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      }}
                    >
                      <IconUser size={40} />
                    </div>
                  )}
                  <div>
                    <span className="section-eyebrow section-eyebrow-invert" style={{ marginBottom: 6 }}>
                      School Head
                    </span>
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 2px' }}>{info.principal_name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.9rem' }}>{info.principal_title}</p>
                  </div>
                </div>
              )}

              {adminOfficer && (
                <div
                  className="card"
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile for ${adminOfficer.full_name}`}
                  onClick={() => openOfficialProfile(adminOfficer)}
                  onKeyDown={(e) => handleOfficialKeyDown(e, adminOfficer)}
                  style={{
                    padding: '32px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    flexWrap: 'wrap',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(120deg, var(--blue-dark), var(--blue-primary))',
                  }}
                >
                  {adminOfficer.photo_url ? (
                    <img
                      src={getImageUrl(adminOfficer.photo_url)}
                      alt={adminOfficer.full_name}
                      style={{
                        width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                        objectFit: 'cover', border: '2px solid rgba(255,255,255,0.35)',
                      }}
                      onError={e => { e.target.src = PLACEHOLDER_AVATAR; }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.16)', border: '2px solid rgba(255,255,255,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      }}
                    >
                      <IconUser size={40} />
                    </div>
                  )}
                  <div>
                    <span className="section-eyebrow section-eyebrow-invert" style={{ marginBottom: 6 }}>
                      Admin Officer
                    </span>
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 2px' }}>{adminOfficer.full_name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.9rem' }}>{adminOfficer.position}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Faculty & Staff Directory — directly below the School Head */}
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--gray-900)', marginBottom: 8 }}>
            Faculty &amp; Staff Directory
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 28 }}>
            Teaching and non-teaching personnel of BES, grouped by elementary grade level. Click a profile to view more.
          </p>

          {loading ? (
            <div className="staff-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card official-card">
                  <div className="skeleton" style={{ width: 112, height: 112, borderRadius: '50%', margin: '0 auto 16px' }} />
                  <div className="skeleton" style={{ width: '80%', height: 10, margin: '0 auto 8px' }} />
                  <div className="skeleton" style={{ width: '60%', height: 9, margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="alert alert-info">Faculty and staff directory is being updated.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {Object.entries(grouped).map(([gradeLevel, members]) => (
                <div key={gradeLevel}>
                  <h3 style={{
                    fontWeight: 700, fontSize: '0.95rem', color: 'var(--blue-primary)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '2px solid var(--blue-pale)', paddingBottom: 8, marginBottom: 16
                  }}>
                    {gradeLevel}
                    <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--gray-400)', marginLeft: 8, textTransform: 'none' }}>
                      ({members.length} {members.length === 1 ? 'member' : 'members'})
                    </span>
                  </h3>
                  <div className="staff-grid">
                    {members.map(m => (
                      <div
                        key={m.id}
                        className="card official-card official-card-clickable"
                        role="button"
                        tabIndex={0}
                        aria-label={`View profile for ${m.full_name}`}
                        onClick={() => setSelected(m)}
                        onKeyDown={(e) => handleCardKeyDown(e, m)}
                      >
                        <div className="official-photo-wrap">
                          {m.photo_url ? (
                            <img
                              src={getImageUrl(m.photo_url)}
                              alt={m.full_name}
                              className="avatar-photo avatar-photo-lg"
                              onError={e => { e.target.src = PLACEHOLDER_AVATAR; }}
                            />
                          ) : (
                            <div className="avatar-placeholder avatar-placeholder-accent avatar-placeholder-lg" aria-hidden="true">
                              <IconUser size={40} />
                            </div>
                          )}
                          <span className="official-photo-hint">View profile</span>
                        </div>
                        <p className="official-name">{m.full_name}</p>
                        {m.position_subject && <p className="official-position">{m.position_subject}</p>}
                        {m.section_name && <p className="official-office">{m.section_name}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
                <img
                  src={getImageUrl(selected.photo_url)}
                  alt={selected.full_name}
                  className="avatar-photo staff-modal-photo"
                  onError={e => { e.target.src = PLACEHOLDER_AVATAR; }}
                />
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
                  <span className="badge badge-blue">{selected.department_grade_level}</span>
                </div>
              )}
              {!!selected.years_in_service && (
                <div className="staff-modal-meta-item">
                  <span className="staff-modal-meta-label">Years in Service</span>
                  <span className="staff-modal-meta-value">{selected.years_in_service}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
