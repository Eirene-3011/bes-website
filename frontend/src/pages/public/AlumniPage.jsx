import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBook, IconBuilding, IconMapPin, IconSearch } from '../../components/Icons';

/* ═══ Shared page helpers (kept in this file) ═══ */
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
  borderRadius: 14,
  boxShadow: '0 1px 2px rgba(94, 11, 16, 0.06), 0 8px 20px rgba(94, 11, 16, 0.06)',
  color: C.ink,
};

const CSS = `
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: 2px; border-radius: 6px; }

/* entrance + scroll reveal */
.bes-reveal { opacity: 0; transform: translateY(22px); transition: opacity .65s cubic-bezier(.2,.7,.2,1), transform .65s cubic-bezier(.2,.7,.2,1); }
.bes-reveal.in { opacity: 1; transform: none; }
.bes-rise { animation: bes-rise .75s cubic-bezier(.2,.7,.2,1) both; }
@keyframes bes-rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes bes-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bes-pop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
@keyframes bes-float { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-8px) rotate(calc(var(--rot, 0deg) * .35)); } }
@keyframes bes-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(26px,-20px) scale(1.08); } }
@keyframes bes-shimmer { to { background-position: -200% 0; } }

.bes-ticket { animation: bes-float 7s ease-in-out infinite; transform: rotate(var(--rot, 0deg)); }
.bes-blob { position: absolute; border-radius: 50%; pointer-events: none; animation: bes-drift 14s ease-in-out infinite; }

/* cards */
.bes-lift { transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease; }
.bes-lift:hover { transform: translateY(-6px); border-color: rgba(142,18,24,.3); box-shadow: 0 2px 4px rgba(94,11,16,.06), 0 22px 40px rgba(94,11,16,.16); }
.bes-media { position: relative; overflow: hidden; }
.bes-media img { transition: transform .7s cubic-bezier(.2,.7,.2,1); }
.bes-lift:hover .bes-media img, .bes-zoom:hover img { transform: scale(1.07); }
.bes-zoom { position: relative; display: block; width: 100%; padding: 0; border: 0; background: none; overflow: hidden; cursor: zoom-in; }
.bes-zoom img { transition: transform .7s cubic-bezier(.2,.7,.2,1); }
.bes-hint { opacity: 0; transform: translateY(6px); transition: opacity .25s ease, transform .25s ease; }
.bes-zoom:hover .bes-hint, .bes-zoom:focus-visible .bes-hint { opacity: 1; transform: none; }

/* controls */
.bes-filter { padding: 9px 18px; border-radius: 999px; cursor: pointer; font: inherit; font-weight: 700; font-size: 13.5px; color: var(--green-950, #5E0B10); background: #fff; border: 1px solid rgba(142,18,24,.14); display: inline-flex; align-items: center; gap: 8px; transition: background .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease; }
.bes-filter:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(94,11,16,.12); }
.bes-filter[aria-pressed="true"] { color: #fff; background: linear-gradient(100deg, #5E0B10, #A8161B); border-color: transparent; box-shadow: 0 8px 18px rgba(94,11,16,.28); }
.bes-filter .bes-count { font-size: 11.5px; min-width: 20px; padding: 1px 7px; border-radius: 999px; background: rgba(142,18,24,.1); text-align: center; }
.bes-filter[aria-pressed="true"] .bes-count { background: rgba(255,255,255,.22); }
.bes-search { display: flex; align-items: center; gap: 10px; padding: 0 16px; background: #fff; border: 1px solid rgba(142,18,24,.18); border-radius: 12px; transition: border-color .2s ease, box-shadow .2s ease; }
.bes-search:focus-within { border-color: #A8161B; box-shadow: 0 0 0 4px rgba(168,22,27,.12); }
.bes-search input { border: none; outline: none; background: transparent; font: inherit; font-size: .95rem; padding: 13px 0; width: 100%; color: var(--green-950, #5E0B10); }
.bes-field { box-sizing: border-box; padding: 13px 14px; border: 1px solid rgba(142,18,24,.18); border-radius: 12px; background: #fff; font: inherit; font-size: .95rem; color: var(--green-950, #5E0B10); transition: border-color .2s ease, box-shadow .2s ease; }
.bes-field:focus { outline: none; border-color: #A8161B; box-shadow: 0 0 0 4px rgba(168,22,27,.12); }
.bes-link { transition: gap .2s ease, color .2s ease; display: inline-flex; align-items: center; gap: 6px; }
.bes-lift:hover .bes-link { gap: 12px; }

.bes-mark { background: linear-gradient(transparent 60%, rgba(232,185,35,.6) 60%, rgba(232,185,35,.6) 92%, transparent 92%); padding: 0 .08em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.bes-skel { background: linear-gradient(90deg, #f6e9c6 0%, #fff6d8 50%, #f6e9c6 100%); background-size: 200% 100%; animation: bes-shimmer 1.4s linear infinite; border-radius: 8px; }
.bes-lb-btn { display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.14); color: #fff; cursor: pointer; backdrop-filter: blur(6px); transition: background .2s ease, transform .2s ease; }
.bes-lb-btn:hover { background: rgba(255,255,255,.28); }

@media (prefers-reduced-motion: reduce) {
  .bes-reveal { opacity: 1; transform: none; transition: none; }
  .bes-rise, .bes-ticket, .bes-blob, .bes-skel { animation: none; }
  .bes-lift, .bes-lift:hover, .bes-media img, .bes-zoom img, .bes-filter { transition: none; transform: none; }
  .bes-lift:hover .bes-media img, .bes-zoom:hover img { transform: none; }
}
`;

function BesStyles() {
  return <style>{CSS}</style>;
}

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

/* Fades + lifts its children in when scrolled into view */
function Reveal({ children, delay = 0, style, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (seen) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return (
    <div ref={ref} className={`bes-reveal${seen ? ' in' : ''}`} style={{ transitionDelay: seen ? `${delay}ms` : '0ms', ...style }} {...rest}>
      {children}
    </div>
  );
}

/* Counts up to a number; strings pass straight through */
function CountUp({ value }) {
  const isNum = typeof value === 'number';
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!isNum) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value === 0) { setN(value); return undefined; }
    let raf;
    const t0 = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, isNum]);
  return <>{isNum ? n : value}</>;
}

/* ─── Hero ─── */
function Hero({ wide, eyebrow, title, subtitle, aside, extra }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" className="bes-blob" style={{ top: -120, right: wide ? -60 : -140, width: 380, height: 380, background: 'radial-gradient(circle at 35% 35%, rgba(232,185,35,.5), rgba(232,185,35,0) 70%)' }} />
      <span aria-hidden="true" className="bes-blob" style={{ bottom: -160, left: wide ? '30%' : -120, width: 340, height: 340, background: 'radial-gradient(circle at 50% 50%, rgba(196,30,36,.16), rgba(196,30,36,0) 70%)', animationDelay: '-6s' }} />
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide && aside ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '64px 24px 84px 96px' : '36px 20px 56px 40px' }}>
        <div className="bes-rise">
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{eyebrow}</span>
          <h1 style={{ margin: '20px 0 14px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, fontSize: 'clamp(2.3rem, 5.6vw, 4rem)' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: '48ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>{subtitle}</p>
          {extra && <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>{extra}</div>}
        </div>
        {aside && <div className="bes-rise" style={{ animationDelay: '.18s' }}>{aside}</div>}
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: wide ? 34 : 20, display: 'block' }}>
        <path d="M0 40V20C120 6 240 0 360 8c140 10 260 28 420 26 160-2 300-26 460-28 80-1 150 4 200 10v24z" fill={C.cream} />
      </svg>
    </header>
  );
}

/* ─── "Ticket" stat card ─── */
function Ticket({ wide, Icon, label, value, note, rows = [], ariaLabel }) {
  return (
    <aside aria-label={ariaLabel || label} className="bes-ticket" style={{ position: 'relative', ...card, '--rot': wide ? '1.2deg' : '0deg', borderRadius: 16, boxShadow: '0 28px 54px rgba(94, 11, 16, 0.22)' }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: -11, right: 30, width: 68, height: 22, background: 'rgba(232,185,35,.8)', transform: 'rotate(4deg)', borderRadius: 3, boxShadow: '0 2px 6px rgba(94,11,16,.18)' }} />
      <div style={{ padding: '26px 28px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red }}><Icon size={26} /></span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>{label}</p>
          <p style={{ margin: 0, fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}><CountUp value={value} /></p>
          {note && <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: C.muted }}>{note}</p>}
        </div>
      </div>
      {rows.length > 0 && (
        <>
          <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
          </div>
          <dl style={{ margin: 0, padding: '8px 28px 18px' }}>
            {rows.map(({ Icon: RowIcon, label: l, value: v }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <span style={{ color: C.red, display: 'flex', width: 18, justifyContent: 'center' }}><RowIcon size={18} /></span>
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

/* ─── Section heading in the red double-rule "notebook margin" ─── */
function SectionHead({ Icon, eyebrow, title, note, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 26, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', flex: '1 1 260px', minWidth: 0 }}>
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', flex: 'none', paddingRight: Icon ? 16 : 0, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red, minWidth: Icon ? 0 : 0 }}>
          {Icon && <Icon size={22} />}
        </span>
        <div style={{ minWidth: 0 }}>
          {eyebrow && <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem' }}>{eyebrow}</p>}
          <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>{title}</h2>
          {note && <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: C.muted }}>{note}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function EmptyState({ Icon, title, children }) {
  return (
    <div className="bes-reveal in" style={{ ...card, boxShadow: 'none', border: `2px dashed ${C.line}`, padding: '44px 24px', textAlign: 'center' }}>
      <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red, marginBottom: 14 }}><Icon size={24} /></span>
      {title && <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.1rem' }}>{title}</p>}
      {children && <p style={{ margin: '0 auto', maxWidth: '44ch', color: C.muted, fontSize: '0.98rem', lineHeight: 1.6 }}>{children}</p>}
    </div>
  );
}

function Pill({ children, gold }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 11px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, background: gold ? '#FFF1BF' : C.tint, color: gold ? C.goldText : C.deep }}>{children}</span>
  );
}

function SearchBox({ value, onChange, placeholder, label, style }) {
  return (
    <div className="bes-search" style={style}>
      <IconSearch size={17} style={{ color: C.muted, flexShrink: 0 }} />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search"
          style={{ border: 'none', background: C.tint, color: C.red, width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', fontSize: 14, lineHeight: 1, flex: 'none' }}>&times;</button>
      )}
    </div>
  );
}

/* Grid skeleton used while loading */
function SkeletonGrid({ min = 280, count = 3, height = 300 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 22 }}>
      {Array.from({ length: count }).map((_, i) => <div key={i} className="bes-skel" style={{ height, borderRadius: 14 }} />)}
    </div>
  );
}

/* ─── Lightbox gallery: items = [{ src, alt, caption? }] ─── */
function Lightbox({ items, index, onClose, onIndex }) {
  const item = items[index];
  const many = items.length > 1;
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const go = useCallback((d) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    const opener = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      if (opener && opener.focus) opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (many && e.key === 'ArrowLeft') go(-1);
      else if (many && e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, go, many]);

  if (!item) return null;
  const nav = (side, d, label, glyph) => (
    <button type="button" className="bes-lb-btn" aria-label={label} onClick={(e) => { e.stopPropagation(); go(d); }}
      style={{ position: 'fixed', top: '50%', [side]: 16, transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', fontSize: 22 }}>{glyph}</button>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={`Enlarged image: ${item.alt}`} onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx > 0 ? -1 : 1);
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, background: 'radial-gradient(circle at 50% 40%, rgba(70,8,12,.94), rgba(30,3,5,.97))', cursor: 'zoom-out', animation: 'bes-fade .2s ease-out' }}>
      <button ref={closeRef} type="button" className="bes-lb-btn" aria-label="Close image" onClick={onClose}
        style={{ position: 'fixed', top: 16, right: 20, width: 44, height: 44, borderRadius: 12, fontSize: 22 }}>&times;</button>
      {many && nav('left', -1, 'Previous image', '‹')}
      {many && nav('right', 1, 'Next image', '›')}
      <img key={item.src} src={item.src} alt={item.alt} onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '76vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 30px 90px rgba(0,0,0,.65)', cursor: 'default', animation: 'bes-pop .25s ease-out' }} />
      <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', color: '#fff', cursor: 'default', maxWidth: '70ch' }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{item.alt}</p>
        {item.caption && <p style={{ margin: '4px 0 0', fontSize: '.9rem', color: 'rgba(255,255,255,.75)' }}>{item.caption}</p>}
        {many && <p style={{ margin: '8px 0 0', fontSize: '.8rem', color: 'rgba(255,255,255,.6)' }}>{index + 1} / {items.length}</p>}
      </div>
    </div>
  );
}

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

const pageShell = (wide) => ({ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 });


export default function AlumniPage() {
  const wide = useWide();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [lb, setLb] = useState(null);

  useEffect(() => {
    api.get('/alumni')
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const batchYears = [...new Set(items.map((a) => a.batch_year).filter(Boolean))].sort((a, b) => b - a);

  const filtered = items.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || `${a.full_name} ${a.course_profession} ${a.company} ${a.location}`.toLowerCase().includes(q);
    const matchYear = !filterYear || String(a.batch_year) === filterYear;
    return matchSearch && matchYear;
  });

  const featured = items.filter((a) => a.is_featured);
  const filtering = Boolean(search.trim() || filterYear);

  const gallery = useMemo(() => items.filter((a) => a.photo_url).map((a) => ({
    id: a.id,
    src: getImageUrl(a.photo_url),
    alt: a.full_name,
    caption: [a.course_profession, a.company].filter(Boolean).join(' · '),
  })), [items]);
  const openPhoto = (id) => { const i = gallery.findIndex((g) => g.id === id); if (i >= 0) setLb(i); };

  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 22 };

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />

      <Hero wide={wide} eyebrow="Alumni" title="Proud graduates of Bacao Elementary."
        subtitle="See where our alumni are today, and look up classmates by name, batch, or profession."
        aside={
          <Ticket wide={wide} Icon={IconBook} label="Alumni profiles" value={loading ? '…' : items.length} note="Graduates of Bacao Elementary School"
            rows={[
              { Icon: IconBuilding, label: 'Batches listed', value: loading ? '…' : batchYears.length },
              { Icon: IconBook, label: 'Featured alumni', value: loading ? '…' : featured.length },
            ]} />
        } />

      <main className="container" style={{ ...mainBox(wide), display: 'flex', flexDirection: 'column', gap: wide ? 64 : 44, paddingTop: wide ? 48 : 32 }}>
        {!loading && featured.length > 0 && (
          <section>
            <SectionHead eyebrow="Spotlight" title="Featured alumni" />
            <div style={grid}>
              {featured.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i, 6) * 70}><AlumniCard alumni={a} featured onPhotoClick={openPhoto} /></Reveal>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHead eyebrow="Directory" title="All alumni"
            note={!loading && items.length > 0 ? `${filtered.length} of ${items.length} ${items.length === 1 ? 'profile' : 'profiles'}` : undefined} />

          {!loading && items.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 26, flexWrap: 'wrap', alignItems: 'center' }}>
              <SearchBox value={search} onChange={setSearch} placeholder="Search by name, profession, or company…" label="Search alumni" style={{ flex: '1 1 260px', maxWidth: 460 }} />
              {batchYears.length > 0 && (
                <select className="bes-field" aria-label="Filter by batch" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ minWidth: 170, cursor: 'pointer' }}>
                  <option value="">All batches</option>
                  {batchYears.map((y) => <option key={y} value={y}>Batch {y}</option>)}
                </select>
              )}
              {filtering && (
                <button type="button" onClick={() => { setSearch(''); setFilterYear(''); }}
                  style={{ border: 'none', background: 'none', color: C.red, fontWeight: 800, fontSize: 14, cursor: 'pointer', padding: '8px 4px', font: 'inherit' }}>Clear filters</button>
              )}
            </div>
          )}

          {loading && <SkeletonGrid min={230} count={8} height={260} />}

          {!loading && filtered.length === 0 && (
            <EmptyState Icon={IconBook} title={items.length === 0 ? 'No alumni profiles yet.' : 'No alumni match your search.'}>
              {items.length === 0 ? 'No alumni profiles have been added yet. Check back soon.' : 'Try a different name or batch.'}
            </EmptyState>
          )}

          {!loading && filtered.length > 0 && (
            <div style={grid} aria-live="polite">
              {filtered.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i, 8) * 50}><AlumniCard alumni={a} onPhotoClick={openPhoto} /></Reveal>
              ))}
            </div>
          )}
        </section>
      </main>

      {lb !== null && gallery[lb] && <Lightbox items={gallery} index={lb} onIndex={setLb} onClose={() => setLb(null)} />}
    </div>
  );
}

function AlumniCard({ alumni: a, featured = false, onPhotoClick }) {
  const photoSrc = a.photo_url ? getImageUrl(a.photo_url) : null;
  const [broken, setBroken] = useState(false);
  const initials = (a.full_name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const ring = `4px solid #fff`;
  const banner = featured
    ? 'linear-gradient(120deg, #E8B923, #FFD95A 55%, #F3C640)'
    : 'linear-gradient(120deg, #5E0B10, #A8161B 60%, #C41E24)';

  return (
    <article className="bes-lift" style={{ ...card, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', height: 70, background: banner, flex: 'none' }}>
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 120%, rgba(255,255,255,.25) 0, transparent 45%), radial-gradient(circle at 85% -20%, rgba(255,255,255,.22) 0, transparent 40%)' }} />
        {featured && <span style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', borderRadius: 999, background: C.ink, color: '#FFE88F', fontWeight: 800, fontSize: 11.5 }}>Featured</span>}
      </div>

      <div style={{ marginTop: -44 }}>
        {photoSrc && !broken ? (
          <button type="button" className="bes-zoom" onClick={() => onPhotoClick(a.id)} aria-label={`Enlarge photo of ${a.full_name}`}
            style={{ width: 88, height: 88, borderRadius: '50%', boxShadow: '0 8px 20px rgba(94,11,16,.28)' }}>
            <img src={photoSrc} alt={a.full_name} onError={() => setBroken(true)}
              style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: ring, display: 'block', boxSizing: 'border-box' }} />
          </button>
        ) : (
          <div aria-hidden="true" style={{ width: 88, height: 88, borderRadius: '50%', border: ring, boxSizing: 'border-box', background: C.paper, color: C.deep, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em', boxShadow: '0 8px 20px rgba(94,11,16,.2)' }}>
            {initials || '?'}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 18px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>{a.full_name}</h3>
        {a.batch_year && <div style={{ margin: '3px 0' }}><Pill gold={featured}>Batch {a.batch_year}</Pill></div>}
        {a.course_profession && <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{a.course_profession}</p>}
        {a.company && <p style={{ margin: 0, fontSize: '0.85rem', color: C.muted }}>{a.company}</p>}
        {a.location && (
          <p style={{ margin: 0, fontSize: '0.8rem', color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconMapPin size={13} /> {a.location}
          </p>
        )}
        {a.bio && <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.55 }}>“{a.bio}”</p>}
        {a.facebook_url && (
          <a href={a.facebook_url} target="_blank" rel="noopener noreferrer" className="bes-link" style={{ marginTop: 'auto', paddingTop: 12, fontSize: '0.85rem', color: C.red, fontWeight: 800, textDecoration: 'none' }}>
            Facebook profile <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  );
}
