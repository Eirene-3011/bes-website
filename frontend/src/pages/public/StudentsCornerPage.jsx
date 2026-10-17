import React, { useCallback, useEffect, useState } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

export default function StudentsCornerPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/students?type=featured_student')
      .then(response => setStudents(response.data))
      .catch(() => setStudents([]))
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

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Featured Students</h1>
          <p>Celebrating the inspiring achievements of our BES learners</p>
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
              Student Spotlight
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card" style={{ overflow: 'hidden' }}>
                  <div className="skeleton" style={{ width: '100%', height: 220 }} />
                  <div className="card-body" style={{ padding: '18px 20px' }}>
                    <div className="skeleton" style={{ width: '68%', height: 17, marginBottom: 10 }} />
                    <div className="skeleton" style={{ width: '92%', height: 10, marginBottom: 7 }} />
                    <div className="skeleton" style={{ width: '76%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="alert alert-info">
              No featured students have been posted yet. Please check back soon.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {students.map(student => {
                const title = student.title || student.student_name;
                const imageSrc = student.image_url ? getImageUrl(student.image_url) : null;

                return (
                  <article
                    key={student.id}
                    className="card"
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  >
                    {imageSrc && (
                      <div
                        role="button"
                        tabIndex={0}
                        title="Click to enlarge"
                        aria-label={`Enlarge image: ${title}`}
                        onClick={() => openLightbox(imageSrc, title)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openLightbox(imageSrc, title);
                          }
                        }}
                        style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }}
                      >
                        <img
                          src={imageSrc}
                          alt={title}
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
                          🔍 View photo
                        </span>
                      </div>
                    )}

                    <div style={{ padding: '18px 20px 20px', flex: 1 }}>
                      <h2 style={{
                        margin: '0 0 7px', color: 'var(--gray-900)',
                        fontSize: '1rem', fontWeight: 750, lineHeight: 1.35,
                      }}>
                        {title}
                      </h2>
                      {student.description && (
                        <p style={{
                          margin: 0, color: 'var(--gray-600)',
                          fontSize: '0.84rem', lineHeight: 1.65,
                        }}>
                          {student.description}
                        </p>
                      )}
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
