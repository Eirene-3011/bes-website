import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

/**
 * PPAsPage — Programs, Projects & Activities
 * Includes a click-to-enlarge lightbox for PPA images.
 */
export default function PPAsPage() {
  const [ppas, setPpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { src, alt }

  useEffect(() => {
    api.get('/ppas').then(r => setPpas(r.data)).finally(() => setLoading(false));
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const openLightbox = useCallback((src, alt) => setLightbox({ src, alt }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Programs, Projects &amp; Activities</h1>
          <p>School programs, annual projects, and learning activities at BES</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ width: '100%', height: 200 }} />
                  <div className="card-body" style={{ padding: '16px 20px' }}>
                    <div className="skeleton" style={{ width: '70%', height: 16, marginBottom: 10 }} />
                    <div className="skeleton" style={{ width: '90%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : ppas.length === 0 ? (
            <div className="alert alert-info">No programs or activities have been posted yet. Please check back soon.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {ppas.map(ppa => (
                <div key={ppa.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {ppa.image_url ? (
                    <div style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }}
                      onClick={() => openLightbox(getImageUrl(ppa.image_url), ppa.name)}
                      title="Click to enlarge"
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(getImageUrl(ppa.image_url), ppa.name); }}
                      aria-label={`Enlarge image: ${ppa.name}`}
                    >
                      <img
                        src={getImageUrl(ppa.image_url)}
                        alt={ppa.name}
                        style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', transition: 'transform 0.25s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={e => e.target.style.display = 'none'}
                      />
                      <div style={{
                        position: 'absolute', bottom: 8, right: 8,
                        background: 'rgba(0,0,0,0.55)', color: '#fff',
                        borderRadius: 6, padding: '3px 8px', fontSize: '0.7rem',
                        display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'none'
                      }}>
                        🔍 View
                      </div>
                    </div>
                  ) : null}
                  <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-900)', margin: 0 }}>{ppa.name}</h3>
                    {ppa.frequency && (
                      <span style={{
                        display: 'inline-block', fontSize: '0.72rem', fontWeight: 600,
                        background: 'var(--red-pale)', color: 'var(--red-dark)',
                        borderRadius: 4, padding: '2px 8px', alignSelf: 'flex-start'
                      }}>{ppa.frequency}</span>
                    )}
                    {ppa.short_description && (
                      <p style={{ fontSize: '0.84rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.6 }}>
                        {ppa.short_description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Overlay */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged image: ${lightbox.alt}`}
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 24,
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close image"
            style={{
              position: 'fixed', top: 18, right: 22,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', borderRadius: 8, width: 40, height: 40,
              fontSize: '1.4rem', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '88vh',
              objectFit: 'contain', borderRadius: 10,
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </div>
  );
}
