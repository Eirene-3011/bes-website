import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../utils/api';
import { IconCalendar, IconRepeat, IconClipboard } from '../../components/Icons';

/* ═══ Shared page kit (same look as PPAsPage; kept in this file) ═══ */
const C = {
  red: 'var(--green-800, #A8161B)', deep: 'var(--green-900, #8E1218)', ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923', goldText: '#8A5A00', paper: '#FFF4C7', cream: '#FFFBEA', tint: '#FBE3E3',
  muted: '#6B4A44', line: 'rgba(142, 18, 24, 0.14)', rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)', up: '#1a7f37',
};
const GRAD = 'var(--grad-masthead, linear-gradient(135deg, #5E0B10, #A8161B))';
const paperBg = {
  backgroundColor: C.paper,
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${C.rule} 35px, ${C.rule} 36px), linear-gradient(180deg, #FFF4C7 0%, #FFE88F 100%)`,
};
const card = {
  background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14,
  boxShadow: '0 1px 2px rgba(94, 11, 16, 0.06), 0 8px 20px rgba(94, 11, 16, 0.06)', color: C.ink,
};
const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '48px 0 0' : '32px 0 0' });
const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });
const pageShell = (wide) => ({ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 });

const CSS = `
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: 2px; border-radius: 6px; }
.bes-reveal { opacity: 0; transform: translateY(22px); transition: opacity .65s cubic-bezier(.2,.7,.2,1), transform .65s cubic-bezier(.2,.7,.2,1); }
.bes-reveal.in { opacity: 1; transform: none; }
.bes-rise { animation: bes-rise .75s cubic-bezier(.2,.7,.2,1) both; }
@keyframes bes-rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes bes-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bes-pop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
@keyframes bes-float { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-8px) rotate(calc(var(--rot, 0deg) * .35)); } }
@keyframes bes-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(26px,-20px) scale(1.08); } }
@keyframes bes-shimmer { to { background-position: -200% 0; } }
@keyframes bes-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.bes-grow { transform-origin: bottom; animation: bes-grow .8s cubic-bezier(.2,.7,.2,1) both; }
.bes-ticket { animation: bes-float 7s ease-in-out infinite; transform: rotate(var(--rot, 0deg)); }
.bes-blob { position: absolute; border-radius: 50%; pointer-events: none; animation: bes-drift 14s ease-in-out infinite; }
.bes-lift { transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease; }
.bes-lift:hover { transform: translateY(-6px); border-color: rgba(142,18,24,.3); box-shadow: 0 2px 4px rgba(94,11,16,.06), 0 22px 40px rgba(94,11,16,.16); }
.bes-media { position: relative; overflow: hidden; }
.bes-media img { transition: transform .7s cubic-bezier(.2,.7,.2,1); }
.bes-lift:hover .bes-media img, .bes-zoom:hover img { transform: scale(1.04); }
.bes-zoom { position: relative; display: block; width: 100%; padding: 0; border: 0; background: none; overflow: hidden; cursor: zoom-in; }
.bes-zoom img { transition: transform .7s cubic-bezier(.2,.7,.2,1); }
.bes-hint { opacity: 0; transform: translateY(6px); transition: opacity .25s ease, transform .25s ease; }
.bes-zoom:hover .bes-hint, .bes-zoom:focus-visible .bes-hint { opacity: 1; transform: none; }
.bes-filter { padding: 9px 18px; border-radius: 999px; cursor: pointer; font: inherit; font-weight: 700; font-size: 13.5px; color: var(--green-950, #5E0B10); background: #fff; border: 1px solid rgba(142,18,24,.14); display: inline-flex; align-items: center; gap: 8px; transition: background .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease; }
.bes-filter:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(94,11,16,.12); }
.bes-filter[aria-pressed="true"] { color: #fff; background: linear-gradient(100deg, #5E0B10, #A8161B); border-color: transparent; box-shadow: 0 8px 18px rgba(94,11,16,.28); }
.bes-filter .bes-count { font-size: 11.5px; min-width: 20px; padding: 1px 7px; border-radius: 999px; background: rgba(142,18,24,.1); text-align: center; }
.bes-filter[aria-pressed="true"] .bes-count { background: rgba(255,255,255,.22); }
.bes-search { position: relative; display: flex; align-items: center; gap: 10px; padding: 0 16px; background: #fff; border: 1px solid rgba(142,18,24,.18); border-radius: 12px; transition: border-color .2s ease, box-shadow .2s ease; }
.bes-search:focus-within { border-color: #A8161B; box-shadow: 0 0 0 4px rgba(168,22,27,.12); }
.bes-search input { border: none; outline: none; background: transparent; font: inherit; font-size: .95rem; padding: 13px 0; width: 100%; color: var(--green-950, #5E0B10); }
.bes-link { transition: gap .2s ease, color .2s ease; display: inline-flex; align-items: center; gap: 6px; }
.bes-lift:hover .bes-link { gap: 12px; }
.bes-skel { background: linear-gradient(90deg, #f6e9c6 0%, #fff6d8 50%, #f6e9c6 100%); background-size: 200% 100%; animation: bes-shimmer 1.4s linear infinite; border-radius: 8px; }
.bes-lb-btn { display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.14); color: #fff; cursor: pointer; backdrop-filter: blur(6px); transition: background .2s ease, transform .2s ease; }
.bes-lb-btn:hover { background: rgba(255,255,255,.28); }
@media (prefers-reduced-motion: reduce) {
  .bes-reveal { opacity: 1; transform: none; transition: none; }
  .bes-rise, .bes-ticket, .bes-blob, .bes-skel, .bes-grow { animation: none; }
  .bes-lift, .bes-lift:hover, .bes-media img, .bes-zoom img, .bes-filter { transition: none; transform: none; }
  .bes-lift:hover .bes-media img, .bes-zoom:hover img { transform: none; }
}
`;

function BesStyles() {
  return <style>{CSS}</style>;
}

const BTN_CSS = `
.bes-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 24px; border-radius: 12px; border: 2px solid transparent; font: inherit; font-weight: 800; font-size: .95rem; text-decoration: none; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
.bes-btn:hover { transform: translateY(-2px); }
.bes-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.bes-btn-primary { background: var(--green-800, #A8161B); color: #fff; box-shadow: 0 8px 18px rgba(94,11,16,.28); }
.bes-btn-outline { background: transparent; color: var(--green-950, #5E0B10); border-color: var(--green-950, #5E0B10); }
.bes-btn-outline:hover { background: var(--green-950, #5E0B10); color: #fff; }
.bes-btn-white { background: #fff; color: var(--green-950, #5E0B10); box-shadow: 0 10px 22px rgba(0,0,0,.25); }
.bes-btn-sm { padding: 9px 16px; font-size: .84rem; border-radius: 10px; }
.bes-field { width: 100%; box-sizing: border-box; padding: 13px 14px; border: 1px solid rgba(142,18,24,.18); border-radius: 12px; background: #fff; font: inherit; font-size: .95rem; color: var(--green-950, #5E0B10); transition: border-color .2s ease, box-shadow .2s ease; }
.bes-field:focus { outline: none; border-color: #A8161B; box-shadow: 0 0 0 4px rgba(168,22,27,.12); }
@media (prefers-reduced-motion: reduce) { .bes-btn { transition: none; } .bes-btn:hover { transform: none; } }
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
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, isNum]);
  return <>{isNum ? n.toLocaleString() : value}</>;
}

/* ─── Hero: legal pad, drifting light, margin line, wave edge ─── */
function Hero({ wide, above, eyebrow, title, subtitle, aside, extra }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" className="bes-blob" style={{ top: -120, right: wide ? -60 : -140, width: 380, height: 380, background: 'radial-gradient(circle at 35% 35%, rgba(232,185,35,.5), rgba(232,185,35,0) 70%)' }} />
      <span aria-hidden="true" className="bes-blob" style={{ bottom: -160, left: wide ? '30%' : -120, width: 340, height: 340, background: 'radial-gradient(circle at 50% 50%, rgba(196,30,36,.16), rgba(196,30,36,0) 70%)', animationDelay: '-6s' }} />
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide && aside ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '64px 24px 84px 96px' : '36px 20px 56px 40px' }}>
        <div className="bes-rise">
          {above}
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{eyebrow}</span>
          <h1 style={{ margin: '20px 0 14px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, fontSize: 'clamp(2.3rem, 5.6vw, 4rem)' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: '48ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>{subtitle}</p>
          {extra && <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>{extra}</div>}
        </div>
        {aside && <div className="bes-rise" style={{ animationDelay: '.18s' }}>{aside}</div>}
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: wide ? 34 : 20, display: 'block' }}>
        <path d="M0 40V20C120 6 240 0 360 8c140 10 260 28 420 26 160-2 300-26 460-28 80-1 150 4 200 10v24z" fill={C.cream} />
      </svg>
    </header>
  );
}

/* ─── "Ticket" stat card: one headline fact + supporting rows ─── */
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
function SectionHead({ Icon, num, eyebrow, title, note, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 26, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', flex: '1 1 260px', minWidth: 0 }}>
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'stretch', flex: 'none', minWidth: num ? 44 : 0, paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red, fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
          {num || (Icon && <Icon size={22} />)}
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

function Chip({ children, strong }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '5px 13px', borderRadius: 999, background: C.cream, border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
      {children}{strong && <strong style={{ color: C.ink }}>{strong}</strong>}
    </span>
  );
}

function FilterChip({ on, onClick, children, count }) {
  return (
    <button type="button" className="bes-filter" aria-pressed={on} onClick={onClick}>
      {children}
      {count !== undefined && <span className="bes-count">{count}</span>}
    </button>
  );
}

function SearchBox({ value, onChange, placeholder, label, style }) {
  return (
    <label className="bes-search" style={{ marginBottom: 18, ...style }}>
      <span style={{ position: 'absolute', left: -9999 }}>{label}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function SkeletonGrid({ min = 280, count = 3, height = 300 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 22 }}>
      {Array.from({ length: count }).map((_, i) => <div key={i} className="bes-skel" style={{ height, borderRadius: 14 }} />)}
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORY_LABELS = { event: 'Event', academic: 'Academic', holiday: 'Holiday', special: 'Special', general: 'General' };
const ymKey = (y, m) => `${y}-${m}`;

const CAL_CSS = `
.bes-iconbtn { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; border: 1px solid rgba(142,18,24,.2); background: #fff; color: var(--green-950, #5E0B10); font: inherit; font-size: 1.3rem; line-height: 1; cursor: pointer; transition: background .2s ease, transform .2s ease; }
.bes-iconbtn:hover { background: #FFF4C7; transform: translateY(-1px); }
.bes-cal-weekdays, .bes-cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.bes-cal-weekdays { background: #FFF4C7; border-bottom: 1px solid rgba(142,18,24,.14); }
.bes-cal-weekday { text-align: center; padding: 11px 0; font-size: .8rem; font-weight: 800; color: #6B4A44; }
.bes-cal-cell { position: relative; box-sizing: border-box; height: 78px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; border-right: 1px solid rgba(142,18,24,.08); border-bottom: 1px solid rgba(142,18,24,.08); background: #fff; font: inherit; color: var(--green-950, #5E0B10); }
.bes-cal-cell:nth-child(7n) { border-right: 0; }
.bes-cal-empty { background: #FFFBEA; }
.bes-cal-num { font-size: .95rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.bes-cal-has { cursor: pointer; background: #FBE3E3; transition: background .15s ease, transform .15s ease; }
.bes-cal-has .bes-cal-num { font-weight: 800; color: var(--green-900, #8E1218); }
.bes-cal-has:hover { background: #F7CFCF; }
.bes-cal-today { box-shadow: inset 0 0 0 2px var(--green-800, #A8161B); }
.bes-cal-selected, .bes-cal-selected:hover { background: var(--green-800, #A8161B); }
.bes-cal-selected .bes-cal-num { color: #fff; }
.bes-cal-dots { display: flex; gap: 3px; }
.bes-cal-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-800, #A8161B); }
.bes-cal-selected .bes-cal-dot { background: #fff; }
.bes-cal-grid { animation: bes-fade .35s ease-out; }
@media (max-width: 480px) { .bes-cal-cell { height: 54px; gap: 3px; } .bes-cal-num { font-size: .82rem; } }
@media (prefers-reduced-motion: reduce) { .bes-cal-has, .bes-iconbtn, .bes-cal-grid { transition: none; animation: none; } }
`;

const fmtDate = (d, opts = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-PH', opts) : '';
const DAY_MS = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

// Left accent per category, kept inside the school palette
const ACCENT = { event: C.red, academic: C.deep, holiday: '#E8B923', special: C.ink, general: C.margin };

// Where an event sits relative to today
function eventStatus(ev) {
  const t = startOfDay(new Date()).getTime();
  const s = startOfDay(ev.start_date).getTime();
  const e = startOfDay(ev.end_date || ev.start_date).getTime();
  if (t > e) return { key: 'past', label: 'Ended' };
  if (t >= s) return { key: 'now', label: s === e ? 'Today' : 'Happening now' };
  const days = Math.round((s - t) / DAY_MS);
  return { key: 'soon', label: days === 1 ? 'Tomorrow' : `In ${days} days` };
}

const STATUS_STYLE = {
  now: { background: C.red, color: '#fff' },
  soon: { background: '#FFF1BF', color: '#8A5A00' },
  past: { background: C.cream, color: C.muted, border: `1px solid ${C.line}` },
};

function AgendaRow({ ev }) {
  const start = new Date(ev.start_date);
  const end = ev.end_date ? new Date(ev.end_date) : start;
  const hasRange = startOfDay(end).getTime() > startOfDay(start).getTime();
  const days = Math.round((startOfDay(end) - startOfDay(start)) / DAY_MS) + 1;
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const status = eventStatus(ev);
  const short = { weekday: 'short', month: 'short', day: 'numeric' };
  const chipMonth = hasRange && !sameMonth ? `${MONTHS_SHORT[start.getMonth()]}–${MONTHS_SHORT[end.getMonth()]}` : MONTHS_SHORT[start.getMonth()];
  const chipDay = hasRange ? `${start.getDate()}–${end.getDate()}` : `${start.getDate()}`;

  return (
    <li className="bes-lift" style={{ ...card, display: 'flex', gap: 16, padding: '16px 18px', alignItems: 'center', flexWrap: 'wrap', borderLeft: `4px solid ${ACCENT[ev.category] || C.margin}`, opacity: status.key === 'past' ? 0.75 : 1 }}>
      <div aria-hidden="true" style={{ flex: 'none', minWidth: 64, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.line}`, background: C.paper }}>
        <span style={{ display: 'block', padding: '4px 8px', background: GRAD, color: '#fff', fontSize: '0.74rem', fontWeight: 800, textAlign: 'center' }}>{chipMonth}</span>
        <span style={{ display: 'block', padding: '7px 8px 8px', color: C.ink, fontSize: hasRange ? '1.3rem' : '1.6rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', textAlign: 'center', whiteSpace: 'nowrap' }}>{chipDay}</span>
      </div>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{ev.event_name}</h3>
        <div style={{ display: 'flex', gap: '6px 12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {ev.category && <Chip>{CATEGORY_LABELS[ev.category] || ev.category}</Chip>}
          <span style={{ fontSize: '0.86rem', color: C.muted }}>
            {hasRange ? `${fmtDate(start, short)} to ${fmtDate(end, short)} (${days} days)` : fmtDate(start, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          {!!ev.is_recurring && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: C.muted }}><IconRepeat size={13} /> Recurring yearly</span>}
        </div>
      </div>
      <span style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap', ...STATUS_STYLE[status.key] }}>{status.label}</span>
    </li>
  );
}

export default function SchoolCalendarPage() {
  const wide = useWide();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewDate, setViewDate] = useState(() => { const t = new Date(); return { year: t.getFullYear(), month: t.getMonth() }; });
  const [selectedDay, setSelectedDay] = useState(null);
  const initializedRef = useRef(false);
  const today = new Date();

  useEffect(() => {
    api.get('/calendar').then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  // On first load, jump to the nearest month that actually has events
  useEffect(() => {
    if (initializedRef.current || events.length === 0) return;
    initializedRef.current = true;
    const monthsSet = new Set();
    events.forEach((e) => {
      if (!e.start_date) return;
      const d = new Date(e.start_date);
      monthsSet.add(ymKey(d.getFullYear(), d.getMonth()));
    });
    const monthsArr = Array.from(monthsSet)
      .map((k) => { const [y, m] = k.split('-').map(Number); return { y, m }; })
      .sort((a, b) => a.y - b.y || a.m - b.m);
    const upcoming = monthsArr.find((x) => x.y > today.getFullYear() || (x.y === today.getFullYear() && x.m >= today.getMonth()));
    const chosen = upcoming || monthsArr[0];
    if (chosen) setViewDate({ year: chosen.y, month: chosen.m });
  }, [events]); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((e) => { if (e.category) set.add(e.category); });
    return ['all', ...Array.from(set)];
  }, [events]);

  const byCategory = useMemo(() => events.filter((e) => activeCategory === 'all' || e.category === activeCategory), [events, activeCategory]);

  const next = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return events.filter((e) => e.start_date && new Date(e.start_date) >= t).sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
  }, [events]);

  const searchMode = query.trim().length > 0;

  // Search mode: agenda grouped by month and year
  const searchResults = useMemo(() => {
    if (!searchMode) return {};
    const q = query.trim().toLowerCase();
    const grouped = {};
    byCategory.filter((e) => e.event_name?.toLowerCase().includes(q)).forEach((e) => {
      if (!e.start_date) return;
      const d = new Date(e.start_date);
      const key = ymKey(d.getFullYear(), d.getMonth());
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    });
    return grouped;
  }, [searchMode, query, byCategory]);

  // Month-jump options come from all events (ignores the category filter)
  const monthOptions = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (!e.start_date) return;
      const d = new Date(e.start_date);
      set.add(ymKey(d.getFullYear(), d.getMonth()));
    });
    return Array.from(set).map((k) => { const [y, m] = k.split('-').map(Number); return { y, m }; }).sort((a, b) => a.y - b.y || a.m - b.m);
  }, [events]);

  // Events overlapping the viewed month
  const monthEvents = useMemo(() => {
    const monthStart = new Date(viewDate.year, viewDate.month, 1);
    const monthEnd = new Date(viewDate.year, viewDate.month + 1, 0);
    return byCategory.filter((e) => {
      if (!e.start_date) return false;
      const s = new Date(e.start_date);
      const en = e.end_date ? new Date(e.end_date) : s;
      return s <= monthEnd && en >= monthStart;
    });
  }, [byCategory, viewDate]);

  // Day of month -> events covering that day
  const eventsByDay = useMemo(() => {
    const map = {};
    const monthStart = new Date(viewDate.year, viewDate.month, 1);
    const monthEnd = new Date(viewDate.year, viewDate.month + 1, 0);
    monthEvents.forEach((e) => {
      const s = new Date(e.start_date);
      const en = e.end_date ? new Date(e.end_date) : s;
      const cur = s < monthStart ? new Date(monthStart) : new Date(s);
      const last = en > monthEnd ? monthEnd : en;
      while (cur <= last) {
        const day = cur.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [monthEvents, viewDate]);

  const gridCells = useMemo(() => {
    const startWeekday = new Date(viewDate.year, viewDate.month, 1).getDay();
    const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewDate]);

  const isCurrentRealMonth = viewDate.year === today.getFullYear() && viewDate.month === today.getMonth();
  const goToMonth = (year, month) => { setViewDate({ year, month }); setSelectedDay(null); };
  const shiftMonth = (delta) => {
    let { year, month } = viewDate;
    month += delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    goToMonth(year, month);
  };

  const agendaList = selectedDay ? (eventsByDay[selectedDay] || []) : monthEvents;
  const agendaSorted = [...agendaList].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const plural = (n) => `${n} ${n === 1 ? 'event' : 'events'}`;

  const ticket = (
    <Ticket wide={wide} Icon={IconCalendar} ariaLabel="Next event" label="Next event"
      value={loading ? '…' : next ? fmtDate(next.start_date, { month: 'short', day: 'numeric' }) : 'None set'}
      note={next ? next.event_name : 'No upcoming dates posted'}
      rows={[
        { Icon: IconClipboard, label: 'Events posted', value: loading ? '…' : events.length },
        { Icon: IconRepeat, label: 'Recurring yearly', value: loading ? '…' : events.filter((e) => !!e.is_recurring).length },
      ]} />
  );

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <style>{BTN_CSS}</style>
      <style>{CAL_CSS}</style>
      <Hero wide={wide} eyebrow="School Calendar" title="Important dates for the school year."
        subtitle="Browse the month, tap a highlighted day to see what is happening, or search by event name." aside={ticket} />

      <main className="container" style={{ ...mainBox(wide), maxWidth: 860, paddingTop: wide ? 40 : 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {!loading && events.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <SearchBox value={query} onChange={setQuery} label="Search events" placeholder="Search events by name…" style={{ marginBottom: 0, flex: '1 1 220px', maxWidth: 320 }} />
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Filter by category">
                {categories.map((c) => <FilterChip key={c} on={activeCategory === c} onClick={() => setActiveCategory(c)}>{c === 'all' ? 'All' : (CATEGORY_LABELS[c] || c)}</FilterChip>)}
              </div>
            )}
          </div>
        )}

        {/* Month navigator: hidden while searching, since search shows an agenda across all months */}
        {!loading && events.length > 0 && !searchMode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" className="bes-iconbtn" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
              <h2 aria-live="polite" style={{ margin: 0, minWidth: wide ? 230 : 170, textAlign: 'center', color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.35rem, 3vw, 1.8rem)' }}>{MONTHS[viewDate.month]} {viewDate.year}</h2>
              <button type="button" className="bes-iconbtn" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
            </div>
            {monthOptions.length > 0 && (
              <select className="bes-field" style={{ width: 'auto', fontWeight: 700, cursor: 'pointer' }} aria-label="Jump to month" value={ymKey(viewDate.year, viewDate.month)}
                onChange={(e) => { const [y, m] = e.target.value.split('-').map(Number); goToMonth(y, m); }}>
                {!monthOptions.some(({ y, m }) => y === viewDate.year && m === viewDate.month) && <option value={ymKey(viewDate.year, viewDate.month)}>{MONTHS[viewDate.month]} {viewDate.year}</option>}
                {monthOptions.map(({ y, m }) => <option key={ymKey(y, m)} value={ymKey(y, m)}>{MONTHS[m]} {y}</option>)}
              </select>
            )}
          </div>
        )}

        {loading ? (
          <SkeletonGrid min={500} count={4} height={96} />
        ) : events.length === 0 ? (
          <EmptyState Icon={IconCalendar} title="No events yet.">No calendar events have been posted yet.</EmptyState>
        ) : searchMode ? (
          Object.keys(searchResults).length === 0 ? (
            <EmptyState Icon={IconCalendar} title="No matches.">No events match your search or filter. Clear the search to return to the calendar.</EmptyState>
          ) : (
            Object.entries(searchResults)
              .sort(([a], [b]) => { const [ay, am] = a.split('-').map(Number); const [by, bm] = b.split('-').map(Number); return ay - by || am - bm; })
              .map(([key, evs]) => {
                const [y, m] = key.split('-').map(Number);
                return (
                  <section key={key} aria-label={`${MONTHS[m]} ${y}`}>
                    <Reveal>
                      <SectionHead num={String(m + 1).padStart(2, '0')} eyebrow={plural(evs.length)} title={`${MONTHS[m]} ${y}`} />
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[...evs].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map((ev) => <AgendaRow key={ev.id} ev={ev} />)}
                      </ul>
                    </Reveal>
                  </section>
                );
              })
          )
        ) : (
          <>
            <Reveal>
              <div style={{ ...card, overflow: 'hidden' }}>
                <div className="bes-cal-weekdays">{WEEKDAYS.map((w) => <div key={w} className="bes-cal-weekday">{w}</div>)}</div>
                <div className="bes-cal-grid" key={ymKey(viewDate.year, viewDate.month)}>
                  {gridCells.map((day, i) => {
                    if (day === null) return <div key={i} className="bes-cal-cell bes-cal-empty" aria-hidden="true" />;
                    const dayEvents = eventsByDay[day] || [];
                    const hasEvents = dayEvents.length > 0;
                    const isToday = isCurrentRealMonth && day === today.getDate();
                    const isSelected = selectedDay === day;
                    const cls = ['bes-cal-cell', hasEvents && 'bes-cal-has', isSelected && 'bes-cal-selected', isToday && 'bes-cal-today'].filter(Boolean).join(' ');
                    if (!hasEvents) return <div key={i} className={cls} aria-current={isToday ? 'date' : undefined}><span className="bes-cal-num">{day}</span></div>;
                    return (
                      <button key={i} type="button" className={cls} aria-pressed={isSelected} aria-current={isToday ? 'date' : undefined}
                        aria-label={`${MONTHS[viewDate.month]} ${day}, ${plural(dayEvents.length)}`} onClick={() => setSelectedDay(isSelected ? null : day)}>
                        <span className="bes-cal-num">{day}</span>
                        <span className="bes-cal-dots" aria-hidden="true">{dayEvents.slice(0, 3).map((_, di) => <span key={di} className="bes-cal-dot" />)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <section aria-label="Event list">
              <SectionHead num={agendaSorted.length}
                eyebrow={selectedDay ? (agendaSorted.length === 1 ? 'event on this day' : 'events on this day') : (agendaSorted.length === 1 ? 'event this month' : 'events this month')}
                title={selectedDay ? `${MONTHS[viewDate.month]} ${selectedDay}, ${viewDate.year}` : `${MONTHS[viewDate.month]} ${viewDate.year}`}
                right={selectedDay ? <button type="button" className="bes-btn bes-btn-outline bes-btn-sm" style={{ alignSelf: 'center' }} onClick={() => setSelectedDay(null)}>Show whole month</button> : null} />
              {agendaSorted.length === 0 ? (
                <EmptyState Icon={IconCalendar} title="Nothing scheduled.">No events {selectedDay ? 'on this day' : 'this month'}.</EmptyState>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {agendaSorted.map((ev, i) => <Reveal key={ev.id} delay={Math.min(i, 5) * 50}><AgendaRow ev={ev} /></Reveal>)}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
