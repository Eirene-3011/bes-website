import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'update', label: 'Updates' },
  { value: 'event', label: 'Events' },
];

const CATEGORY_BADGE = {
  news: { bg: 'var(--red-pale, #fce8e8)', color: 'var(--red-dark, #991b1b)' },
  announcement: { bg: '#fef9c3', color: '#a16207' },
  update: { bg: '#dcfce7', color: '#15803d' },
  event: { bg: '#e0f2fe', color: '#0369a1' },
};

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const url = filterCat ? `/news-updates?category=${filterCat}` : '/news-updates';
    setLoading(true);
    api.get(url)
      .then(r => setPosts(r.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [filterCat]);

  // Scroll lock when article is open
  useEffect(() => {
    if (!selected) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [selected]);

  const openPost = useCallback(post => {
    setSelected(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closePost = useCallback(() => setSelected(null), []);

  // ── Article detail view ──────────────────────────────────────────────
  if (selected) {
    const badge = CATEGORY_BADGE[selected.category] || CATEGORY_BADGE.news;
    return (
      <div>
        <div className="page-header">
          <div className="container">
            <h1>News & Updates</h1>
            <p>Latest news, announcements, and events from BES</p>
          </div>
        </div>
        <section className="section">
          <div className="container">
            <button
              onClick={closePost}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--red-primary, #dc2626)', fontWeight: 600,
                fontSize: '0.88rem', marginBottom: 28, padding: 0,
                fontFamily: 'inherit',
              }}
            >
              ← Back to News
            </button>

            <div className="card" style={{ overflow: 'hidden' }}>
              {selected.image_url && (
                <img
                  src={getImageUrl(selected.image_url)}
                  alt={selected.title}
                  style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="card-body" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 12px', borderRadius: 999,
                    fontSize: '0.75rem', fontWeight: 700,
                    background: badge.bg, color: badge.color,
                    textTransform: 'capitalize',
                  }}>
                    {selected.category}
                  </span>
                  {selected.published_date && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-400, #9ca3af)' }}>
                      {formatDate(selected.published_date)}
                    </span>
                  )}
                </div>

                <h2 style={{
                  fontSize: '1.5rem', fontWeight: 800,
                  color: 'var(--gray-900, #111)',
                  marginBottom: 18, lineHeight: 1.35,
                }}>
                  {selected.title}
                </h2>

                {selected.excerpt && (
                  <p style={{
                    fontSize: '1rem', color: 'var(--gray-600, #4b5563)',
                    fontStyle: 'italic', marginBottom: 18,
                    borderLeft: '3px solid var(--red-primary, #dc2626)',
                    paddingLeft: 14, lineHeight: 1.6,
                  }}>
                    {selected.excerpt}
                  </p>
                )}

                {selected.content && (
                  <div style={{
                    fontSize: '0.95rem', color: 'var(--gray-700, #374151)',
                    lineHeight: 1.8, whiteSpace: 'pre-wrap',
                  }}>
                    {selected.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── News list view ───────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>News & Updates</h1>
          <p>Latest news, announcements, and events from BES</p>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => {
              const active = filterCat === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setFilterCat(c.value)}
                  style={{
                    padding: '7px 18px', borderRadius: 999,
                    border: `1px solid ${active ? 'var(--red-primary, #dc2626)' : 'var(--gray-200, #e5e7eb)'}`,
                    background: active ? 'var(--red-primary, #dc2626)' : '#fff',
                    color: active ? '#fff' : 'var(--gray-700, #374151)',
                    fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <div className="skeleton" style={{ width: '100%', height: 180 }} />
                  <div className="card-body" style={{ padding: '18px 22px' }}>
                    <div className="skeleton" style={{ width: '30%', height: 10, marginBottom: 12 }} />
                    <div className="skeleton" style={{ width: '90%', height: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: '70%', height: 10, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '85%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && posts.length === 0 && (
            <div className="alert alert-info">
              No posts have been published yet. Please check back soon.
            </div>
          )}

          {/* Post cards */}
          {!loading && posts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {posts.map(post => {
                const badge = CATEGORY_BADGE[post.category] || CATEGORY_BADGE.news;
                const imageSrc = post.image_url ? getImageUrl(post.image_url) : null;

                return (
                  <article
                    key={post.id}
                    className="card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openPost(post)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openPost(post); }}
                    style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={post.title}
                        style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', flexShrink: 0 }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: 100, flexShrink: 0,
                        background: 'var(--red-pale, #fce8e8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem',
                      }}>
                        📰
                      </div>
                    )}

                    <div className="card-body" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '3px 10px', borderRadius: 999,
                          fontSize: '0.72rem', fontWeight: 700,
                          background: badge.bg, color: badge.color,
                          textTransform: 'capitalize',
                        }}>
                          {post.category}
                        </span>
                        {post.published_date && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--gray-400, #9ca3af)' }}>
                            {formatDate(post.published_date)}
                          </span>
                        )}
                      </div>

                      <h3 style={{
                        fontSize: '0.97rem', fontWeight: 700,
                        color: 'var(--gray-900, #111)',
                        margin: '0 0 8px', lineHeight: 1.45,
                      }}>
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p style={{
                          fontSize: '0.82rem', color: 'var(--gray-500, #6b7280)',
                          margin: 0, flex: 1,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.6,
                        }}>
                          {post.excerpt}
                        </p>
                      )}

                      <p style={{
                        fontSize: '0.8rem', fontWeight: 600,
                        color: 'var(--red-primary, #dc2626)',
                        margin: '12px 0 0',
                      }}>
                        Read more →
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
