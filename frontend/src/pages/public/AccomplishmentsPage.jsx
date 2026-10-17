import React, { useCallback, useEffect, useState } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

export default function AccomplishmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/accomplishments')
      .then(response => setItems(response.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lightbox) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape') setLightbox(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  const openLightbox = useCallback((src, alt) => {
    setLightbox({ src, alt });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>School Accomplishments</h1>
          <p>Awards, recognitions, and milestones achieved by BES</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 28 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 12px', borderRadius: 999,
              background: 'var(--red-pale)', color: 'var(--red-dark)',
              fontSize: '0.78rem', fontWeight: 700,
            }}>
              Awards and Recognitions
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card" style={{ overflow: 'hidden' }}>
                  <div className="skeleton" style={{ width: '100%', height: 220 }} />
                  <div className="card-body" style={{ padding: '18px 22px' }}>
                    <div className="skeleton" style={{ width: '68%', height: 17, marginBottom: 10 }} />
                    <div className="skeleton" style={{ width: '92%', height: 10, marginBottom: 7 }} />
                    <div className="skeleton" style={{ width: '60%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="alert alert-info">
              No accomplishments have been posted yet. Please check back soon.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {items.map(item => {
                const imageSrc = item.image_url ? getImageUrl(item.image_url) : null;

                return (
                  <article
                    key={item.id}
                    className="card"
                    style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  >
                    {imageSrc && (
                      <div
                        role="button"
                        tabIndex={0}
                        title="Click to enlarge"
                        aria-label={`Enlarge image: ${item.title}`}
                        onClick={() => openLightbox(imageSrc, item.title)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openLightbox(imageSrc, item.title);
                          }
                        }}
                        style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }}
                      >
                        <img
                          src={imageSrc}
                          alt={item.title}
                          onError={event => { event.currentTarget.parentElement.style.display = 'none'; }}
                          onMouseOver={event => { event.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseOut={event => { event.currentTarget.style.transform = 'scale(1)'; }}
                          style={{
                            width: '100%', height: 220, objectFit: 'cover', display: 'block',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                        <span style={{
                          position: 'absolute', right: 10, bottom: 10,
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 9px', borderRadius: 7,
                          background: 'rgba(0, 0, 0, 0.62)', color: '#fff',
                          fontSize: '0.72rem', fontWeight: 600,
                          backdropFilter: 'blur(4px)', pointerEvents: 'none',
                        }}>
                          View photo
                        </span>
                      </div>
                    )}

                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 8, padding: '18px 22px 20px' }}>
                      <h2 style={{
                        margin: '0 0 7px', color: 'var(--gray-900)',
                        fontSize: '1rem', fontWeight: 750, lineHeight: 1.4,
                      }}>
                        {item.title}
                      </h2>
                      {item.description && (
                        <p style={{
                          margin: 0, color: 'var(--gray-600)',
                          fontSize: '0.85rem', lineHeight: 1.65,
                        }}>
                          {item.description}
                        </p>
                      )}
                      <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {item.awarding_body && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: 0 }}>
                            {item.awarding_body}
                          </p>
                        )}
                        {item.award_date && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', margin: 0 }}>
                            {formatDate(item.award_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged image: ${lightbox.alt}`}
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, background: 'rgba(0, 0, 0, 0.9)',
            cursor: 'zoom-out', animation: 'fadeIn 0.18s ease-out',
          }}
        >
          <button
            type="button"
            aria-label="Close enlarged image"
            onClick={closeLightbox}
            style={{
              position: 'fixed', top: 18, right: 22,
              width: 42, height: 42, border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, background: 'rgba(255,255,255,0.14)',
              color: '#fff', fontSize: '1.35rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s ease',
            }}
            onMouseOver={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
            onMouseOut={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={event => event.stopPropagation()}
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
