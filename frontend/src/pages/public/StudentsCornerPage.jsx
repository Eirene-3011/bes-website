import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconGem, IconUser } from '../../components/Icons';

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

export default function StudentsCornerPage() {
  const wide = useWide();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/students?type=featured_student')
      .then((r) => setStudents(r.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const ticket = (
    <Ticket wide={wide} Icon={IconGem} ariaLabel="Featured learners at a glance"
      label="Featured learners"
      value={loading ? '…' : students.length > 0 ? students.length : 'Coming soon'} />
  );

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
      <PageHero wide={wide} tag="Featured Students" title="Our learners, in the spotlight."
        intro="Celebrating the achievements of BES learners." aside={ticket} />

      <main className="container" style={mainBox(wide)}>
        <section style={{ ...sectionPad(wide), paddingTop: wide ? 48 : 32 }}>
          <SectionHead Icon={IconGem} title="Student spotlight" note={students.length > 0 ? 'Select a photo to enlarge it.' : undefined} />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 12 }} />)}
            </div>
          ) : students.length === 0 ? (
            <Notice Icon={IconGem} title="No featured students have been posted yet.">Check back soon to meet our learners.</Notice>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {students.map((s) => {
                const title = s.title || s.student_name;
                const src = s.image_url ? getImageUrl(s.image_url) : null;
                return (
                  <article key={s.id} style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {src ? (
                      <button type="button" onClick={() => setLightbox({ src, alt: title })} aria-label={`Enlarge image: ${title}`}
                        style={{ position: 'relative', padding: 0, border: 'none', background: C.cream, cursor: 'zoom-in', display: 'block' }}>
                        <img src={src} alt={title} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
                        <span style={{ position: 'absolute', right: 10, bottom: 10, padding: '4px 10px', borderRadius: 7, background: 'rgba(94, 11, 16, 0.75)', color: '#fff', fontSize: 12, fontWeight: 700 }}>Enlarge</span>
                      </button>
                    ) : (
                      <div style={{ height: 120, display: 'grid', placeItems: 'center', background: C.cream, color: C.red }}><IconUser size={34} /></div>
                    )}
                    <div style={{ padding: '18px 20px 22px', borderTop: `4px solid ${C.red}`, flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{title}</h3>
                      {s.description && <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: C.muted }}>{s.description}</p>}
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
