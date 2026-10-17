import React, { useCallback, useEffect, useState } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconClipboard, IconCalendar, IconFileText } from '../../components/Icons';

/* ─── Theme: same identity as Header, HomePage and AdmissionsPage ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
  ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923',
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
.bes-zoom { position: relative; display: block; width: 100%; padding: 0; border: 0; background: none; overflow: hidden; cursor: zoom-in; }
.bes-zoom img { transition: transform .3s ease; }
.bes-zoom:hover img { transform: scale(1.04); }
@keyframes bes-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .bes-lift, .bes-zoom img { transition: none; } .bes-lift:hover, .bes-zoom:hover img { transform: none; } }
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

const fmtDate = (d, opts = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-PH', opts) : '';

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

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Enlarged image: ${alt}`} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(40, 4, 7, 0.92)', cursor: 'zoom-out', animation: 'bes-fade 0.18s ease-out' }}>
      <button type="button" aria-label="Close enlarged image" onClick={onClose}
        style={{ position: 'fixed', top: 18, right: 22, width: 44, height: 44, border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.65)', cursor: 'default' }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function AccomplishmentsPage() {
  const wide = useWide();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/accomplishments')
      .then((response) => setItems(response.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = useCallback((src, alt) => setLightbox({ src, alt }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const withPhotos = items.filter((i) => i.image_url).length;
  const latest = items.reduce((m, i) => (i.award_date ? Math.max(m, new Date(i.award_date).getTime()) : m), 0);

  return (
    <div className="bes-page" style={{ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 }}>
      <style>{CSS}</style>

      <Hero
        wide={wide}
        eyebrow="School Accomplishments"
        title="Awards and milestones we are proud of."
        subtitle="Awards, recognitions, and milestones achieved by BES."
        aside={
          <Ticket wide={wide} Icon={IconClipboard} label="Recognitions posted" value={loading ? '…' : items.length} note="Awards, citations and milestones"
            rows={[
              { Icon: IconCalendar, label: 'Most recent', value: latest ? fmtDate(latest, { month: 'short', year: 'numeric' }) : 'None yet' },
              { Icon: IconFileText, label: 'With photos', value: loading ? '…' : withPhotos },
            ]} />
        }
      />

      <main className="container" style={{ maxWidth: 960, padding: wide ? '40px 24px 0' : '28px 16px 0' }}>
        <section>
          <SectionHead eyebrow="Awards and Recognitions" title="Our record" />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ ...card, overflow: 'hidden' }}>
                  <div className="skeleton" style={{ width: '100%', height: 220 }} />
                  <div style={{ padding: '18px 22px' }}>
                    <div className="skeleton" style={{ width: '68%', height: 17, marginBottom: 10 }} />
                    <div className="skeleton" style={{ width: '92%', height: 10, marginBottom: 7 }} />
                    <div className="skeleton" style={{ width: '60%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState Icon={IconClipboard}>No accomplishments have been posted yet. Check back soon.</EmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {items.map((item) => {
                const imageSrc = item.image_url ? getImageUrl(item.image_url) : null;
                return (
                  <article key={item.id} className="bes-lift" style={{ ...card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {imageSrc && (
                      <button type="button" className="bes-zoom" aria-label={`Enlarge image: ${item.title}`} onClick={() => openLightbox(imageSrc, item.title)}>
                        <img src={imageSrc} alt={item.title}
                          onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                          style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                        <span style={{ position: 'absolute', right: 10, bottom: 10, padding: '5px 10px', borderRadius: 7, background: 'rgba(94, 11, 16, 0.78)', color: '#fff', fontSize: '0.74rem', fontWeight: 700, pointerEvents: 'none' }}>View photo</span>
                      </button>
                    )}
                    <div style={{ flex: 1, padding: '20px 22px 4px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{item.title}</h3>
                      {item.description && <p style={{ margin: 0, color: C.muted, fontSize: '0.9rem', lineHeight: 1.65 }}>{item.description}</p>}
                    </div>
                    {(item.awarding_body || item.award_date) && (
                      <div style={{ margin: '16px 0 0', padding: '12px 22px 16px', borderTop: `2px dashed ${C.line}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {item.awarding_body && <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>{item.awarding_body}</p>}
                        {item.award_date && <p style={{ margin: 0, fontSize: '0.8rem', color: C.muted }}>{fmtDate(item.award_date)}</p>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={closeLightbox} />}
    </div>
  );
}
