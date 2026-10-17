import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

export default function AlumniPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/alumni')
      .then(r => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lightbox) return undefined;
    const handleKeyDown = e => { if (e.key === 'Escape') setLightbox(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  const openLightbox = useCallback((src, alt) => setLightbox({ src, alt }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const batchYears = [...new Set(items.map(a => a.batch_year).filter(Boolean))].sort((a, b) => b - a);

  const filtered = items.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      `${a.full_name} ${a.course_profession} ${a.company} ${a.location}`.toLowerCase().includes(q);
    const matchYear = !filterYear || String(a.batch_year) === filterYear;
    return matchSearch && matchYear;
  });

  const featured = items.filter(a => a.is_featured);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Alumni</h1>
          <p>Proud graduates of Bacao Elementary School</p>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* Featured Alumni */}
          {!loading && featured.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '7px 12px', borderRadius: 999,
                  background: 'var(--red-pale)', color: 'var(--red-dark)',
                  fontSize: '0.78rem', fontWeight: 700,
                }}>
                  Featured Alumni
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {featured.map(a => (
                  <AlumniCard key={a.id} alumni={a} onPhotoClick={openLightbox} />
                ))}
              </div>
            </div>
          )}

          {/* Section label */}
          <div style={{ marginBottom: 22 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 12px', borderRadius: 999,
              background: 'var(--red-pale)', color: 'var(--red-dark)',
              fontSize: '0.78rem', fontWeight: 700,
            }}>
              All Alumni
            </span>
          </div>

          {/* Search & Filter */}
          {!loading && items.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, profession, or company…"
                style={{
                  flex: 1, minWidth: 220,
                  padding: '9px 14px',
                  border: '1px solid var(--gray-200, #e5e7eb)',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {batchYears.length > 0 && (
                <select
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    border: '1px solid var(--gray-200, #e5e7eb)',
                    borderRadius: 8,
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    background: '#fff',
                    cursor: 'pointer',
                    minWidth: 150,
                  }}
                >
                  <option value="">All Batches</option>
                  {batchYears.map(y => (
                    <option key={y} value={y}>Batch {y}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: '70%', height: 14 }} />
                  <div className="skeleton" style={{ width: '50%', height: 11 }} />
                  <div className="skeleton" style={{ width: '80%', height: 10 }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="alert alert-info">
              {items.length === 0
                ? 'No alumni profiles have been added yet. Please check back soon.'
                : 'No alumni match your search criteria.'}
            </div>
          )}

          {/* Alumni grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {filtered.map(a => (
                <AlumniCard key={a.id} alumni={a} onPhotoClick={openLightbox} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged photo: ${lightbox.alt}`}
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, background: 'rgba(0,0,0,0.9)',
            cursor: 'zoom-out', animation: 'fadeIn 0.18s ease-out',
          }}
        >
          <button
            type="button"
            aria-label="Close enlarged photo"
            onClick={closeLightbox}
            style={{
              position: 'fixed', top: 18, right: 22,
              width: 42, height: 42, border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, background: 'rgba(255,255,255,0.14)',
              color: '#fff', fontSize: '1.35rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain',
              borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </div>
  );
}

function AlumniCard({ alumni: a, onPhotoClick }) {
  const photoSrc = a.photo_url ? getImageUrl(a.photo_url) : null;

  return (
    <article
      className="card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}
    >
      {/* Photo */}
      <div style={{ padding: '20px 20px 0' }}>
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={a.full_name}
            onClick={() => onPhotoClick(photoSrc, a.full_name)}
            style={{
              width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
              border: '3px solid var(--red-pale, #fce8e8)',
              cursor: 'zoom-in', display: 'block',
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--red-pale, #fce8e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
          }}>
            🎓
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card-body" style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--gray-900, #111)', margin: 0 }}>
          {a.full_name}
        </p>
        {a.batch_year && (
          <p style={{ fontSize: '0.76rem', color: 'var(--red-dark, #991b1b)', fontWeight: 600, margin: 0 }}>
            Batch {a.batch_year}
          </p>
        )}
        {a.course_profession && (
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-700, #374151)', margin: 0 }}>
            {a.course_profession}
          </p>
        )}
        {a.company && (
          <p style={{ fontSize: '0.77rem', color: 'var(--gray-500, #6b7280)', margin: 0 }}>
            {a.company}
          </p>
        )}
        {a.location && (
          <p style={{ fontSize: '0.74rem', color: 'var(--gray-400, #9ca3af)', margin: 0 }}>
            📍 {a.location}
          </p>
        )}
        {a.bio && (
          <p style={{ fontSize: '0.78rem', color: 'var(--gray-500, #6b7280)', fontStyle: 'italic', marginTop: 6, marginBottom: 0 }}>
            "{a.bio}"
          </p>
        )}
        {a.facebook_url && (
          <a
            href={a.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: 5, fontSize: '0.78rem', color: 'var(--red-primary, #dc2626)',
              fontWeight: 600, textDecoration: 'none',
            }}
          >
            Facebook Profile →
          </a>
        )}
      </div>
    </article>
  );
}
