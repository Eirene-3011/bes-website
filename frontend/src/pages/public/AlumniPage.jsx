import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBook, IconBuilding, IconMapPin, IconSearch } from '../../components/Icons';

/* ─── Theme: same identity as Header, HomePage and AdmissionsPage ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
  ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923',
  goldText: '#8A5A00',
  paper: '#FFF4C7',
  cream: '#FFFBEA',
  tint: '#FBE3E3',
  muted: '#6B4A44',
  line: 'rgba(142, 18, 24, 0.14)',
  rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)',
};
const paperBg = {
  backgroundColor: C.paper,
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${C.rule} 35px, ${C.rule} 36px), linear-gradient(180deg, #FFF4C7 0%, #FFE88F 100%)`,
};
const card = {
  background: '#fff',
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  boxShadow: '0 1px 2px rgba(94, 11, 16, 0.06), 0 8px 20px rgba(94, 11, 16, 0.06)',
  color: C.ink,
};
const CSS = `
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: 2px; }
.bes-lift { transition: transform .18s ease, box-shadow .18s ease; }
.bes-lift:hover { transform: translateY(-3px); box-shadow: 0 2px 4px rgba(94,11,16,.06), 0 16px 32px rgba(94,11,16,.12); }
.bes-field { box-sizing: border-box; padding: 12px 14px; border: 1px solid rgba(142,18,24,.22); border-radius: 10px; background: #fff; font: inherit; font-size: .95rem; color: var(--green-950, #5E0B10); }
.bes-field:focus { outline: none; border-color: var(--green-800, #A8161B); box-shadow: 0 0 0 3px rgba(168,22,27,.15); }
@keyframes bes-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .bes-lift { transition: none; } .bes-lift:hover { transform: none; } }
`;

function useWide() {
  const q = '(min-width: 761px)';
  const [m, setM] = useState(() => (typeof window === 'undefined' ? true : window.matchMedia(q).matches));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

/* ─── Small pieces ─── */
function Hero({ wide, eyebrow, title, subtitle, aside }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '56px 24px 56px 96px' : '32px 20px 36px 40px' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{eyebrow}</span>
          <h1 style={{ margin: '20px 0 14px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, fontSize: 'clamp(2.3rem, 5.4vw, 3.8rem)' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: '50ch', fontSize: '1.08rem', lineHeight: 1.6, color: C.muted }}>{subtitle}</p>
        </div>
        {aside}
      </div>
    </header>
  );
}

function Ticket({ wide, Icon, label, value, note, rows = [] }) {
  return (
    <aside aria-label={label} style={{ position: 'relative', ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
      <div style={{ padding: '24px 28px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 52, height: 52, borderRadius: 12, background: C.tint, color: C.red }}><Icon size={26} /></span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>{label}</p>
          <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{value}</p>
          {note && <p style={{ margin: 0, fontSize: '0.85rem', color: C.muted }}>{note}</p>}
        </div>
      </div>
      {rows.length > 0 && (
        <>
          <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
          </div>
          <dl style={{ margin: 0, padding: '8px 28px 16px' }}>
            {rows.map(({ Icon: RowIcon, label: l, value: v }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <span style={{ color: C.red, display: 'flex' }}><RowIcon size={18} /></span>
                <dt style={{ flex: 1, fontSize: '0.88rem', color: C.muted }}>{l}</dt>
                <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </aside>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 26 }}>
      <span aria-hidden="true" style={{ alignSelf: 'stretch', flex: 'none', marginRight: 18, borderRight: `5px double ${C.margin}` }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem' }}>{eyebrow}</p>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.7rem, 3vw, 2.2rem)' }}>{title}</h2>
      </div>
    </div>
  );
}

function EmptyState({ Icon, children }) {
  return (
    <div style={{ ...card, boxShadow: 'none', border: `2px dashed ${C.line}`, padding: '36px 24px', textAlign: 'center' }}>
      <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 48, height: 48, borderRadius: 12, background: C.tint, color: C.red, marginBottom: 12 }}><Icon size={22} /></span>
      <p style={{ margin: 0, color: C.muted, fontSize: '0.98rem', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

function Pill({ children, gold }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 11px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: gold ? '#FFF1BF' : C.tint, color: gold ? C.goldText : C.deep }}>{children}</span>
  );
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Enlarged photo: ${alt}`} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(40, 4, 7, 0.92)', cursor: 'zoom-out', animation: 'bes-fade 0.18s ease-out' }}>
      <button type="button" aria-label="Close enlarged photo" onClick={onClose}
        style={{ position: 'fixed', top: 18, right: 22, width: 44, height: 44, border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.65)', cursor: 'default' }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function AlumniPage() {
  const wide = useWide();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/alumni')
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = useCallback((src, alt) => setLightbox({ src, alt }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const batchYears = [...new Set(items.map((a) => a.batch_year).filter(Boolean))].sort((a, b) => b - a);

  const filtered = items.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${a.full_name} ${a.course_profession} ${a.company} ${a.location}`.toLowerCase().includes(q);
    const matchYear = !filterYear || String(a.batch_year) === filterYear;
    return matchSearch && matchYear;
  });

  const featured = items.filter((a) => a.is_featured);
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 };

  return (
    <div className="bes-page" style={{ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 }}>
      <style>{CSS}</style>

      <Hero
        wide={wide}
        eyebrow="Alumni"
        title="Proud graduates of Bacao Elementary."
        subtitle="See where our alumni are today, and look up classmates by name, batch, or profession."
        aside={
          <Ticket wide={wide} Icon={IconBook} label="Alumni profiles" value={loading ? '…' : items.length} note="Graduates of Bacao Elementary School"
            rows={[
              { Icon: IconBuilding, label: 'Batches listed', value: loading ? '…' : batchYears.length },
              { Icon: IconBook, label: 'Featured alumni', value: loading ? '…' : featured.length },
            ]} />
        }
      />

      <main className="container" style={{ maxWidth: 960, padding: wide ? '40px 24px 0' : '28px 16px 0', display: 'flex', flexDirection: 'column', gap: wide ? 56 : 40 }}>
        {!loading && featured.length > 0 && (
          <section>
            <SectionHead eyebrow="Spotlight" title="Featured alumni" />
            <div style={grid}>
              {featured.map((a) => <AlumniCard key={a.id} alumni={a} featured onPhotoClick={openLightbox} />)}
            </div>
          </section>
        )}

        <section>
          <SectionHead eyebrow="Directory" title="All alumni" />

          {!loading && items.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 240px', maxWidth: 460, padding: '0 14px', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10 }}>
                <IconSearch size={16} style={{ color: C.muted, flexShrink: 0 }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, profession, or company…" aria-label="Search alumni"
                  style={{ border: 'none', outline: 'none', background: 'transparent', font: 'inherit', fontSize: '0.92rem', padding: '12px 0', width: '100%', color: C.ink }} />
              </div>
              {batchYears.length > 0 && (
                <select className="bes-field" aria-label="Filter by batch" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ minWidth: 160, cursor: 'pointer' }}>
                  <option value="">All batches</option>
                  {batchYears.map((y) => <option key={y} value={y}>Batch {y}</option>)}
                </select>
              )}
            </div>
          )}

          {loading && (
            <div style={grid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div className="skeleton" style={{ width: 84, height: 84, borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: '70%', height: 14 }} />
                  <div className="skeleton" style={{ width: '50%', height: 11 }} />
                  <div className="skeleton" style={{ width: '80%', height: 10 }} />
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <EmptyState Icon={IconBook}>
              {items.length === 0 ? 'No alumni profiles have been added yet. Check back soon.' : 'No alumni match your search. Try a different name or batch.'}
            </EmptyState>
          )}

          {!loading && filtered.length > 0 && (
            <div style={grid}>
              {filtered.map((a) => <AlumniCard key={a.id} alumni={a} onPhotoClick={openLightbox} />)}
            </div>
          )}
        </section>
      </main>

      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={closeLightbox} />}
    </div>
  );
}

function AlumniCard({ alumni: a, featured = false, onPhotoClick }) {
  const photoSrc = a.photo_url ? getImageUrl(a.photo_url) : null;
  const [broken, setBroken] = useState(false);
  const initials = (a.full_name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const ring = `3px solid ${featured ? C.gold : C.tint}`;

  return (
    <article className="bes-lift" style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden', ...(featured ? { borderTop: `4px solid ${C.gold}` } : {}) }}>
      <div style={{ padding: '22px 20px 0' }}>
        {photoSrc && !broken ? (
          <button type="button" onClick={() => onPhotoClick(photoSrc, a.full_name)} aria-label={`Enlarge photo of ${a.full_name}`}
            style={{ padding: 0, border: 0, background: 'none', cursor: 'zoom-in', display: 'block', borderRadius: '50%' }}>
            <img src={photoSrc} alt={a.full_name} onError={() => setBroken(true)}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: ring, display: 'block' }} />
          </button>
        ) : (
          <div aria-hidden="true" style={{ width: 84, height: 84, borderRadius: '50%', border: ring, background: C.paper, color: C.deep, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
            {initials || '?'}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>{a.full_name}</h3>
        {a.batch_year && <div style={{ margin: '2px 0' }}><Pill gold={featured}>Batch {a.batch_year}</Pill></div>}
        {a.course_profession && <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>{a.course_profession}</p>}
        {a.company && <p style={{ margin: 0, fontSize: '0.84rem', color: C.muted }}>{a.company}</p>}
        {a.location && (
          <p style={{ margin: 0, fontSize: '0.8rem', color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconMapPin size={13} /> {a.location}
          </p>
        )}
        {a.bio && <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.5 }}>“{a.bio}”</p>}
        {a.facebook_url && (
          <a href={a.facebook_url} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10, fontSize: '0.84rem', color: C.red, fontWeight: 800, textDecoration: 'none' }}>
            Facebook profile →
          </a>
        )}
      </div>
    </article>
  );
}
