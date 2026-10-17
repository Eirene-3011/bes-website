import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconFlag, IconCalendar } from '../../components/Icons';

/* ─── Admissions-style helpers (kept in this file) ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923',
  goldText: '#8A5A00',
  paper: '#FFF4C7',
  cream: '#FFFBEA',
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

function PageHero({ tag, title, intro, aside, extra, wide }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide && aside ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '72px 24px 72px 96px' : '40px 20px 40px 40px' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{tag}</span>
          <h1 style={{ margin: '22px 0 16px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: '46ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>{intro}</p>
          {extra && <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>{extra}</div>}
        </div>
        {aside}
      </div>
    </header>
  );
}

// The torn "ticket" card: one headline fact + a few supporting rows
function Ticket({ Icon, label, value, sub, rows = [], wide, ariaLabel }) {
  return (
    <aside aria-label={ariaLabel || label} style={{ ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
      <div style={{ padding: '26px 28px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 52, height: 52, borderRadius: 12, background: '#FBE3E3', color: C.red }}><Icon size={26} /></span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>{label}</p>
          <p style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15 }}>{value}</p>
          {sub && <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: C.muted }}>{sub}</p>}
        </div>
      </div>
      {rows.length > 0 && (
        <>
          <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
          </div>
          <dl style={{ margin: 0, padding: '8px 28px 18px' }}>
            {rows.map(({ Icon: RI, label: l, value: v }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <span style={{ color: C.red, display: 'flex', width: 18, justifyContent: 'center' }}><RI size={18} /></span>
                <dt style={{ flex: 1, fontSize: '0.88rem', color: C.muted }}>{l}</dt>
                <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </aside>
  );
}

// Heading with an icon in the red double-rule "notebook margin"
function SectionHead({ Icon, title, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', flex: 'none', paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red }}>
        <Icon size={22} />
      </span>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.1 }}>{title}</h2>
        {note && <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: C.muted }}>{note}</p>}
      </div>
    </div>
  );
}

function Notice({ Icon, title, children }) {
  return (
    <div style={{ ...card, padding: '24px 26px', borderLeft: `4px solid ${C.gold}`, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      {Icon && <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 44, height: 44, borderRadius: 10, background: '#FBE3E3', color: C.red }}><Icon size={20} /></span>}
      <div>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{title}</p>
        {children && <p style={{ margin: '6px 0 0', maxWidth: '58ch', lineHeight: 1.6, color: C.muted }}>{children}</p>}
      </div>
    </div>
  );
}

function Chip({ children, strong }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline', padding: '5px 13px', borderRadius: 999, background: C.cream, border: `1px solid ${C.line}`, fontSize: 13, color: C.muted, whiteSpace: 'nowrap' }}>
      {children}{strong && <strong style={{ color: C.ink }}>{strong}</strong>}
    </span>
  );
}

const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '56px 0 0' : '40px 0 0' });

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

function Lightbox({ item, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Enlarged image: ${item.alt}`} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, background: 'rgba(40, 6, 9, 0.93)', cursor: 'zoom-out' }}>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close image"
        style={{ position: 'fixed', top: 16, right: 20, width: 42, height: 42, borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: 22, cursor: 'pointer' }}>&times;</button>
      <img src={item.src} alt={item.alt} onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', cursor: 'default' }} />
      <p style={{ margin: 0, color: '#fff', fontWeight: 700, textAlign: 'center' }}>{item.alt}</p>
    </div>
  );
}

export default function PPAsPage() {
  const wide = useWide();
  const [ppas, setPpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/ppas').then((r) => setPpas(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const freqs = [...new Set(ppas.map((p) => p.frequency).filter(Boolean))];
  const shown = filter === 'All' ? ppas : ppas.filter((p) => p.frequency === filter);

  const ticket = (
    <Ticket wide={wide} Icon={IconFlag} ariaLabel="Programs at a glance"
      label="Programs and activities"
      value={loading ? '…' : ppas.length > 0 ? ppas.length : 'Being updated'}
      rows={freqs.length > 0 ? [{ Icon: IconCalendar, label: 'Schedules', value: freqs.length === 1 ? freqs[0] : `${freqs.length} kinds` }] : []} />
  );

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
      <PageHero wide={wide} tag="Programs, Projects & Activities" title="What learners do at BES."
        intro="School programs, annual projects and learning activities." aside={ticket} />

      <main className="container" style={mainBox(wide)}>
        <section style={{ ...sectionPad(wide), paddingTop: wide ? 48 : 32 }}>
          <SectionHead Icon={IconFlag} title="Our programs" note={ppas.length > 0 ? 'Select a photo to enlarge it.' : undefined} />

          {freqs.length > 1 && (
            <div role="group" aria-label="Filter by schedule" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {['All', ...freqs].map((k) => {
                const on = filter === k;
                return (
                  <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={on}
                    style={{ padding: '8px 16px', borderRadius: 999, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 13.5, color: on ? '#fff' : C.ink, background: on ? C.red : '#fff', border: `1px solid ${on ? C.red : C.line}`, transition: 'background 0.2s ease, color 0.2s ease' }}>{k}</button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 12 }} />)}
            </div>
          ) : ppas.length === 0 ? (
            <Notice Icon={IconFlag} title="No programs or activities have been posted yet.">Check back soon.</Notice>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {shown.map((ppa) => {
                const src = ppa.image_url ? getImageUrl(ppa.image_url) : null;
                return (
                  <article key={ppa.id} style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {src ? (
                      <button type="button" onClick={() => setLightbox({ src, alt: ppa.name })} aria-label={`Enlarge image: ${ppa.name}`}
                        style={{ position: 'relative', padding: 0, border: 'none', background: C.cream, cursor: 'zoom-in', display: 'block' }}>
                        <img src={src} alt={ppa.name} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
                        <span style={{ position: 'absolute', right: 10, bottom: 10, padding: '4px 10px', borderRadius: 7, background: 'rgba(94, 11, 16, 0.75)', color: '#fff', fontSize: 12, fontWeight: 700 }}>Enlarge</span>
                      </button>
                    ) : (
                      <div style={{ height: 110, display: 'grid', placeItems: 'center', background: C.cream, color: C.red }}><IconFlag size={30} /></div>
                    )}
                    <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{ppa.name}</h3>
                      {ppa.frequency && <span style={{ alignSelf: 'flex-start' }}><Chip>{ppa.frequency}</Chip></span>}
                      {ppa.short_description && <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: C.muted }}>{ppa.short_description}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
