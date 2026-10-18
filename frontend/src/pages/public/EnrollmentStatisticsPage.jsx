import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBuilding, IconBook, IconCalendar, IconListOrdered, IconClipboard, IconUsers } from '../../components/Icons';

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

function SkeletonGrid({ min = 280, count = 3, height = 300 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 22 }}>
      {Array.from({ length: count }).map((_, i) => <div key={i} className="bes-skel" style={{ height, borderRadius: 14 }} />)}
    </div>
  );
}

function TabBar({ items, active, onSelect, label = 'Page sections' }) {
  return (
    <nav aria-label={label} style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
      <div className="container" style={{ maxWidth: 960, display: 'flex', gap: 4, overflowX: 'auto', padding: '0 16px' }}>
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} type="button" onClick={() => onSelect(it.id)} aria-current={on ? 'true' : undefined}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 8, padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
              {it.num && <span style={{ color: C.red, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{it.num}</span>}{it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const LEVELS = [
  { key: 'kinder', label: 'Kinder', short: 'K' },
  { key: 'grade1', label: 'Grade 1', short: 'G1' },
  { key: 'grade2', label: 'Grade 2', short: 'G2' },
  { key: 'grade3', label: 'Grade 3', short: 'G3' },
  { key: 'grade4', label: 'Grade 4', short: 'G4' },
  { key: 'grade5', label: 'Grade 5', short: 'G5' },
  { key: 'grade6', label: 'Grade 6', short: 'G6' },
];

const num = (v) => Number(v) || 0;
const fmt = (n) => num(n).toLocaleString();
const hasData = (y) => num(y.grand_total) > 0;
const gradeTotal = (y, k) => num(y[`${k}_male`]) + num(y[`${k}_female`]);

function Legend() {
  const item = (color, label) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: C.muted }}>
      <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: color }} />{label}
    </span>
  );
  return <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>{item(C.red, 'Male')}{item(C.gold, 'Female')}</div>;
}

/* Learners per grade: stacked columns, male at the bottom, female on top */
function GradeColumns({ row, wide }) {
  const max = Math.max(...LEVELS.map((l) => gradeTotal(row, l.key)), 1);
  const H = wide ? 220 : 180;
  return (
    <div style={{ ...card, padding: wide ? '26px 30px 22px' : '20px 14px 18px', backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${C.rule} 35px, ${C.rule} 36px)` }}>
      <div style={{ marginBottom: 18 }}><Legend /></div>
      <div role="list" style={{ display: 'grid', gridTemplateColumns: `repeat(${LEVELS.length}, minmax(0, 1fr))`, gap: wide ? 16 : 6, alignItems: 'end' }}>
        {LEVELS.map((l, i) => {
          const m = num(row[`${l.key}_male`]);
          const f = num(row[`${l.key}_female`]);
          const t = m + f;
          return (
            <div key={l.key} role="listitem" aria-label={`${l.label}: ${t} learners, ${m} male, ${f} female`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: H + 54 }}>
              <span style={{ fontWeight: 800, fontSize: wide ? '1.15rem' : '0.95rem', letterSpacing: '-0.03em', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{t}</span>
              <div className="bes-grow" style={{ width: '100%', maxWidth: 64, height: Math.max((t / max) * H, 4), display: 'flex', flexDirection: 'column', borderRadius: '8px 8px 0 0', overflow: 'hidden', animationDelay: `${i * 70}ms` }}>
                <div style={{ flex: f, background: C.gold }} />
                <div style={{ flex: m, background: GRAD }} />
              </div>
              <span style={{ width: '100%', textAlign: 'center', marginTop: 8, paddingTop: 8, borderTop: `2px solid ${C.margin}`, fontWeight: 700, fontSize: wide ? 13.5 : 12, color: C.muted }}>{wide ? l.label : l.short}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Compact table, tucked away so the page stays clean */
function EnrollTable({ row }) {
  const th = { padding: '12px 18px', fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap' };
  const td = { padding: '12px 18px', fontSize: 14.5, fontVariantNumeric: 'tabular-nums' };
  return (
    <details style={{ ...card, marginTop: 18, overflow: 'hidden' }}>
      <summary style={{ cursor: 'pointer', padding: '16px 20px', fontWeight: 800, fontSize: 14.5, background: C.cream, listStylePosition: 'inside' }}>View the full table</summary>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <caption style={{ position: 'absolute', left: -9999 }}>Enrollment per grade level, SY {row.school_year}</caption>
          <thead>
            <tr style={{ background: GRAD, color: '#fff' }}>
              <th scope="col" style={{ ...th, textAlign: 'left' }}>Grade level</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>Male</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>Female</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((l, i) => (
              <tr key={l.key} style={{ background: i % 2 ? C.cream : '#fff', borderTop: `1px solid ${C.line}` }}>
                <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{l.label}</th>
                <td style={{ ...td, textAlign: 'right', color: C.muted }}>{num(row[`${l.key}_male`])}</td>
                <td style={{ ...td, textAlign: 'right', color: C.muted }}>{num(row[`${l.key}_female`])}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: C.red }}>{gradeTotal(row, l.key)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.paper, borderTop: `2px solid ${C.line}`, fontWeight: 800 }}>
              <th scope="row" style={{ ...td, textAlign: 'left' }}>Total</th>
              <td style={{ ...td, textAlign: 'right' }}>{num(row.total_male)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{num(row.total_female)}</td>
              <td style={{ ...td, textAlign: 'right', color: C.red }}>{fmt(row.grand_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  );
}

/* Year-over-year bars, shown only when 2+ years have data */
function TrendBars({ list, selectedId, onSelect, wide }) {
  const max = Math.max(...list.map((y) => num(y.grand_total)), 1);
  return (
    <div style={{ ...card, padding: wide ? '26px 30px 18px' : '20px 14px 14px' }}>
      <div role="list" style={{ display: 'flex', alignItems: 'flex-end', gap: wide ? 18 : 8, height: 230, overflowX: 'auto' }}>
        {list.map((y, i) => {
          const prev = list[i - 1];
          const diff = prev ? num(y.grand_total) - num(prev.grand_total) : null;
          const on = y.id === selectedId;
          return (
            <button key={y.id} type="button" role="listitem" onClick={() => onSelect(y.id)} aria-current={on ? 'true' : undefined}
              aria-label={`SY ${y.school_year}, ${fmt(y.grand_total)} learners`}
              style={{ flex: '1 1 0', minWidth: 76, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: C.ink, padding: 0 }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>{fmt(y.grand_total)}</span>
              <span className="bes-grow" style={{ width: '100%', maxWidth: 80, height: Math.max((num(y.grand_total) / max) * 140, 6), borderRadius: '8px 8px 2px 2px', background: on ? GRAD : 'rgba(142, 18, 24, 0.18)', animationDelay: `${i * 80}ms`, transition: 'background .25s ease' }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? C.red : C.muted, borderBottom: `3px solid ${on ? C.red : 'transparent'}`, paddingBottom: 2 }}>SY {y.school_year}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, minHeight: 16, color: !diff ? C.muted : diff > 0 ? C.up : C.red }}>
                {diff === null ? '' : diff === 0 ? '—' : `${diff > 0 ? '▲ +' : '▼ '}${fmt(diff)}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function EnrollmentStatisticsPage() {
  const wide = useWide();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.get('/enrollment-stats')
      .then((r) => { setYears(r.data); if (r.data?.length) setSelectedId(r.data[0].id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current = years[0]; // newest school year
  const selected = years.find((y) => y.id === selectedId) || current;
  const withData = [...years].filter(hasData).reverse(); // oldest → newest
  const lastRecorded = years.find(hasData);
  const currentHasData = current && hasData(current);
  const selHas = selected && hasData(selected);
  const biggest = selHas ? LEVELS.map((l) => ({ label: l.label, t: gradeTotal(selected, l.key) })).sort((a, b) => b.t - a.t)[0] : null;
  const maleShare = selHas ? Math.round((num(selected.total_male) / num(selected.grand_total)) * 100) : 0;

  const ticket = current && (
    <Ticket wide={wide} Icon={IconBuilding} ariaLabel="Current school year at a glance"
      label={currentHasData ? `Learners enrolled, SY ${current.school_year}` : `SY ${current.school_year}`}
      value={currentHasData ? num(current.grand_total) : 'Count in progress'}
      rows={[
        { Icon: IconCalendar, label: 'School year', value: `SY ${current.school_year}` },
        { Icon: IconBook, label: 'Grade levels', value: 'Kinder to Grade 6' },
        currentHasData
          ? { Icon: IconUsers, label: 'Male / Female', value: `${num(current.total_male)} / ${num(current.total_female)}` }
          : { Icon: IconListOrdered, label: 'Last recorded', value: lastRecorded ? `${fmt(lastRecorded.grand_total)} (SY ${lastRecorded.school_year})` : 'None yet' },
      ]} />
  );

  const emptyYear = (year) => (
    <EmptyState Icon={IconClipboard} title={`Enrollment is still being counted for SY ${year}.`}>
      The numbers will appear here once the school posts them. Enrollment is open now, so this count will keep growing.
    </EmptyState>
  );

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <Hero wide={wide} eyebrow="Enrollment Statistics" title="Our learners, year by year."
        subtitle="See how many learners enroll at Bacao Elementary School each school year, by grade level and by gender." aside={ticket} />

      {loading ? (
        <main className="container" style={{ ...mainBox(wide), paddingTop: 40 }}><SkeletonGrid min={300} count={1} height={320} /></main>
      ) : years.length === 0 ? (
        <main className="container" style={{ ...mainBox(wide), paddingTop: 40 }}>{emptyYear('this school year')}</main>
      ) : (
        <>
          {years.length > 1 && (
            <TabBar label="School years" active={String(selected.id)} onSelect={(id) => setSelectedId(years.find((y) => String(y.id) === id).id)}
              items={years.map((y) => ({ id: String(y.id), label: `SY ${y.school_year}` }))} />
          )}

          <main className="container" style={mainBox(wide)}>
            <section style={sectionPad(wide)} aria-live="polite">
              <SectionHead Icon={IconClipboard} title={`Learners per grade, SY ${selected.school_year}`}
                note={selHas ? `${fmt(selected.grand_total)} learners in total` + (biggest ? `. ${biggest.label} is the largest level.` : '') : undefined} />

              {selHas ? (
                <>
                  <GradeColumns key={selected.id} row={selected} wide={wide} />

                  <Reveal>
                    <div style={{ ...card, padding: wide ? '20px 26px' : '16px 18px', marginTop: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12, fontWeight: 800 }}>
                        <span>{num(selected.total_male)} male <span style={{ color: C.muted, fontWeight: 600 }}>({maleShare}%)</span></span>
                        <span>{num(selected.total_female)} female <span style={{ color: C.muted, fontWeight: 600 }}>({100 - maleShare}%)</span></span>
                      </div>
                      <div role="img" aria-label={`${maleShare}% male, ${100 - maleShare}% female`} style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', background: C.gold }}>
                        <div style={{ width: `${maleShare}%`, background: GRAD, transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                      </div>
                    </div>
                  </Reveal>

                  <Reveal><EnrollTable row={selected} /></Reveal>

                  {selected.chart_image_url && (
                    <Reveal>
                      <figure style={{ margin: '18px 0 0', ...card, overflow: 'hidden' }}>
                        <figcaption style={{ padding: '14px 20px', fontWeight: 800, fontSize: 14, borderBottom: `1px solid ${C.line}`, background: C.cream }}>Enrollment chart, SY {selected.school_year}</figcaption>
                        <img src={getImageUrl(selected.chart_image_url)} alt={`Enrollment chart SY ${selected.school_year}`} style={{ width: '100%', display: 'block' }} />
                      </figure>
                    </Reveal>
                  )}
                </>
              ) : emptyYear(selected.school_year)}
            </section>

            {withData.length >= 2 && (
              <section style={sectionPad(wide)}>
                <Reveal>
                  <SectionHead Icon={IconListOrdered} title="Year-over-year" note="Select a bar to open that school year." />
                  <TrendBars list={withData} selectedId={selected.id} onSelect={setSelectedId} wide={wide} />
                </Reveal>
              </section>
            )}
          </main>
        </>
      )}
    </div>
  );
}
