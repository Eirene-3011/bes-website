import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  IconBuilding, IconBook, IconCoins, IconPhone, IconMonitor, IconCheck, IconCalendar,
} from '../../components/Icons';

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

function Chip({ children, strong }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '5px 13px', borderRadius: 999, background: C.cream, border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
      {children}{strong && <strong style={{ color: C.ink }}>{strong}</strong>}
    </span>
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

/* ─── Content (unchanged) ─── */
const CHARTER_INFO = {
  office: 'Bacao Elementary School',
  classification: 'Simple',
  transactionType: 'G2C (Government to Citizen)',
  whoMayAvail: 'Learners / Parents / Guardians',
};

// No BES online enrollment form supplied yet: falls back to the Contact page. Set via school info when available.
const DEFAULT_ONLINE_ENROLLMENT_LINK = '/contact';

// Standard enrollment requirements per DepEd policy
const STANDARD_REQUIREMENTS = [
  { doc: 'Basic Education Enrollment Form (BEEF) — One (1) scanned copy (digital copy)', where: 'Downloadable from the school or the DepEd enrollment platform' },
  { doc: 'Confirmation Slip — One (1) scanned copy (digital copy)', where: 'School' },
  { doc: 'PSA Birth Certificate (formerly NSO) — One (1) original copy and one (1) photocopy', where: 'Philippine Statistics Authority / Local Civil Registrar' },
];

const ALTERNATIVE_REQUIREMENTS = [
  'National ID — One (1) original copy for verification, and one (1) photocopy',
  'Certificate of Live Birth (Local Civil Registry) — One (1) original copy and one (1) photocopy',
  'PhilHealth ID — One (1) original copy for verification, and one (1) photocopy',
  'Marriage Certificate of parents — One (1) original copy for verification, and one (1) photocopy',
  'PWD ID — One (1) original copy for verification, and one (1) photocopy',
  'Barangay certification establishing the child\'s identity (name, date of birth, sex, and name of parents)',
  'Affidavit of undertaking to be executed by parents — One (1) original copy and one (1) photocopy',
  'Baptismal Certificate — One (1) original copy and one (1) photocopy',
];

const SPECIAL_CASE_REQUIREMENTS = [
  { condition: 'Displaced learners due to calamities or conflict', doc: 'SF9 or SF10, subject to availability', where: 'School' },
  {
    condition: 'Persons Deprived of Liberty (PDLs) enrolling in ALS',
    doc: 'Certificate of PDL\'s Identity — One (1) original copy (if PSA Birth Certificate or secondary documents are not available)',
    where: 'Bureau of Jail Management and Penology — Office of the Warden',
  },
];

const PROCESS_STEPS = [
  {
    clientStep: 'Submit complete documents through the School\'s official platform or email address, along with the filled-out BEEF.',
    actions: [
      { action: 'Download and print received documents, and check for completion.', note: 'If requirements are incomplete, tag as temporarily enrolled.', fee: 'None', time: '1 hour', responsible: 'Registrar / Teacher-in-Charge / Adviser' },
      { action: 'Provide client with the status of enrollment.', fee: 'None', time: '5 minutes', responsible: 'Registrar / Teacher-in-Charge / Adviser' },
      { action: 'Endorse the list of enrollees to the school records/registrar team for Kinder–Grade 6 and transferee processing.', fee: 'None', time: '5 minutes', responsible: 'Registrar / Teacher-in-Charge / Adviser' },
    ],
  },
];

const TOTAL_PROCESSING = { fee: 'None', time: '1 hour, 10 minutes' };

const QUICK_NAV = [
  { id: 'requirements', num: '01', label: 'Requirements' },
  { id: 'process', num: '02', label: 'Process' },
  { id: 'schedule', num: '03', label: 'Schedule' },
  { id: 'apply', num: '04', label: 'Apply' },
];

function ChevronIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Accordion({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...card, marginTop: 20, overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', background: open ? C.paper : C.cream, border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: C.ink, transition: 'background 0.2s ease' }}>
        <span>
          <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{title}</span>
          {subtitle && <span style={{ display: 'block', fontSize: 12.5, color: C.muted, marginTop: 2 }}>{subtitle}</span>}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div style={{ padding: '8px 18px 18px', animation: 'bes-fade .25s ease-out' }}>{children}</div>}
    </div>
  );
}

function CheckRow({ checked, onToggle, children, sub }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={onToggle} className="bes-lift"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%', textAlign: 'left', padding: '16px 18px', marginBottom: 12, font: 'inherit', color: C.ink, cursor: 'pointer',
        background: checked ? C.cream : '#fff', border: `1px solid ${checked ? 'rgba(142, 18, 24, 0.3)' : C.line}`, borderRadius: 12 }}>
      <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 26, height: 26, marginTop: 1, borderRadius: 8,
        border: `2px solid ${checked ? C.red : 'rgba(142, 18, 24, 0.35)'}`, background: checked ? C.red : '#fff', color: '#fff', transition: 'all 0.2s ease' }}>
        {checked && <IconCheck size={14} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14.5, lineHeight: 1.5, fontWeight: 600, textDecoration: checked ? 'line-through' : 'none', textDecorationColor: 'rgba(142, 18, 24, 0.4)', opacity: checked ? 0.75 : 1 }}>{children}</span>
        {sub && <span style={{ display: 'block', fontSize: 13, color: C.muted, marginTop: 4 }}>Where to get it: {sub}</span>}
      </span>
    </button>
  );
}

function ApplyLink({ href, style, children }) {
  return href.startsWith('/')
    ? <Link to={href} style={style}>{children}</Link>
    : <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{children}</a>;
}

export default function AdmissionsPage() {
  const wide = useWide();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [ready, setReady] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    api.get('/enrollment')
      .then((r) => setInfo(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    QUICK_NAV.forEach(({ id }) => { const el = sectionRefs.current[id]; if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading]);

  const scrollToSection = (id) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRefs.current[id]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  const toggle = (i) => setReady((r) => ({ ...r, [i]: !r[i] }));

  const readyCount = STANDARD_REQUIREMENTS.filter((_, i) => ready[i]).length;
  const allReady = readyCount === STANDARD_REQUIREMENTS.length;
  const contact = loading ? '…' : (info?.contact_number || '(046) 472-5307');
  const onlineEnrollmentLink = info?.online_enrollment_link || DEFAULT_ONLINE_ENROLLMENT_LINK;
  const charter = [
    ['Office', CHARTER_INFO.office], ['Classification', CHARTER_INFO.classification],
    ['Transaction', CHARTER_INFO.transactionType], ['Who may avail', CHARTER_INFO.whoMayAvail],
  ];
  const bigBtn = { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 28px', borderRadius: 12, fontWeight: 800, fontSize: '1rem', textDecoration: 'none', background: '#fff', color: C.ink, boxShadow: '0 10px 22px rgba(0, 0, 0, 0.25)' };

  const ticket = (
    <Ticket wide={wide} Icon={IconCoins} ariaLabel="Enrollment at a glance" label="Enrollment fee" value="₱0" note="Public school, no fees to be paid"
      rows={[
        { Icon: IconBuilding, label: 'School type', value: 'Public Elementary' },
        { Icon: IconBook, label: 'Grade levels', value: 'Kinder to Grade 6' },
        { Icon: IconCalendar, label: 'Processing time', value: TOTAL_PROCESSING.time },
        { Icon: IconPhone, label: 'Contact', value: contact },
      ]} />
  );

  return (
    <div className="bes-page" style={{ ...pageShell(wide), paddingBottom: wide ? 96 : 120 }}>
      <BesStyles />
      <Hero wide={wide} eyebrow="Admissions & Enrollment" title="Enrolling is easy, and it is free."
        subtitle="Everything you need to enroll at Bacao Elementary School: what to prepare, how we process it, and where to apply." aside={ticket}
        extra={<>
          <button type="button" onClick={() => scrollToSection('requirements')}
            style={{ padding: '14px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 800, color: '#fff', background: C.red, boxShadow: '0 8px 18px rgba(94, 11, 16, 0.28)' }}>
            See what to prepare
          </button>
          <ApplyLink href={onlineEnrollmentLink} style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', color: C.ink, border: `2px solid ${C.ink}` }}>
            Go to online enrollment
          </ApplyLink>
        </>} />

      <TabBar items={QUICK_NAV} active={activeSection} onSelect={scrollToSection} label="Admissions sections" />

      <main className="container" style={mainBox(wide)}>
        <Reveal style={{ marginTop: wide ? 40 : 28 }}>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', ...card }}>
            {charter.map(([k, v], i) => (
              <div key={k} style={{ padding: '18px 22px', borderLeft: i && wide ? `1px solid ${C.line}` : 'none', borderTop: i && !wide ? `1px solid ${C.line}` : 'none' }}>
                <dt style={{ fontSize: '0.8rem', fontWeight: 700, color: C.muted }}>{k}</dt>
                <dd style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '0.95rem' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* 01 Requirements */}
        <section id="requirements" ref={(el) => (sectionRefs.current.requirements = el)} style={sectionPad(wide)}>
          <Reveal>
            <SectionHead num="01" eyebrow="Prepare these" title="Enrollment Requirements" />
            {info?.requirements_richtext ? (
              <div className="rich-content" style={{ ...card, padding: wide ? 32 : 20 }} dangerouslySetInnerHTML={{ __html: info.requirements_richtext }} />
            ) : (
              <div>
                <div style={{ ...card, padding: wide ? '22px 26px' : '18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 220px' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{allReady ? 'You have everything ready.' : 'Tick off what you already have.'}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 13.5, color: C.muted }}>{readyCount} of {STANDARD_REQUIREMENTS.length} required documents ready</p>
                  </div>
                  <div role="progressbar" aria-valuemin={0} aria-valuemax={STANDARD_REQUIREMENTS.length} aria-valuenow={readyCount} style={{ flex: '1 1 180px', height: 12, borderRadius: 6, background: '#F3EAE8', overflow: 'hidden' }}>
                    <div style={{ width: `${(readyCount / STANDARD_REQUIREMENTS.length) * 100}%`, height: '100%', background: GRAD, borderRadius: 6, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                </div>

                {STANDARD_REQUIREMENTS.map((item, i) => (
                  <CheckRow key={item.doc} checked={!!ready[i]} onToggle={() => toggle(i)} sub={item.where}>{item.doc}</CheckRow>
                ))}

                <Accordion title="If a PSA Birth Certificate is not available" subtitle={`Tap to see ${ALTERNATIVE_REQUIREMENTS.length} accepted alternatives`}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {ALTERNATIVE_REQUIREMENTS.map((item) => (
                      <li key={item} style={{ display: 'flex', gap: 12, padding: '11px 0', borderTop: `1px solid ${C.line}`, fontSize: 14, lineHeight: 1.5 }}>
                        <span style={{ color: C.red, marginTop: 2, display: 'flex' }}><IconCheck size={14} /></span>{item}
                      </li>
                    ))}
                  </ul>
                </Accordion>

                <h3 style={{ margin: '32px 0 12px', fontSize: '1.05rem', fontWeight: 800 }}>Special cases</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {SPECIAL_CASE_REQUIREMENTS.map((sc) => (
                    <div key={sc.condition} className="bes-lift" style={{ ...card, padding: '18px 20px', borderLeft: `4px solid ${C.gold}` }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 14.5 }}>{sc.condition}</p>
                      <p style={{ margin: '0 0 6px', fontSize: 13.5, lineHeight: 1.5 }}>Required: {sc.doc}</p>
                      <p style={{ margin: 0, fontSize: 12.5, color: C.muted }}>Where to get it: {sc.where}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </section>

        {/* 02 Process */}
        <section id="process" ref={(el) => (sectionRefs.current.process = el)} style={sectionPad(wide)}>
          <Reveal>
            <SectionHead num="02" eyebrow="What happens next" title="Enrollment Process" />
            {info?.process_richtext ? (
              <div className="rich-content" style={{ ...card, padding: wide ? 32 : 20 }} dangerouslySetInnerHTML={{ __html: info.process_richtext }} />
            ) : (
              <div>
                {PROCESS_STEPS.map((step, idx) => (
                  <div key={idx} style={{ ...card, overflow: 'hidden' }}>
                    <div style={{ padding: wide ? '22px 28px' : '18px', background: GRAD, color: '#fff' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, opacity: 0.85 }}>Your step {idx + 1}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '1.05rem', lineHeight: 1.5, fontWeight: 600 }}>{step.clientStep}</p>
                    </div>
                    <ol style={{ margin: 0, padding: wide ? '8px 28px' : '4px 18px', listStyle: 'none' }}>
                      {step.actions.map((a, ai) => (
                        <li key={ai} style={{ display: 'flex', gap: 16, padding: '20px 0', borderTop: ai ? `1px solid ${C.line}` : 'none' }}>
                          <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 32, height: 32, borderRadius: '50%', background: C.paper, color: C.deep, fontWeight: 800, fontSize: 14 }}>{ai + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, lineHeight: 1.5 }}>{a.action}</p>
                            {a.note && <p style={{ margin: '6px 0 0', fontSize: 13.5, color: C.goldText }}>Note: {a.note}</p>}
                            <p style={{ margin: '6px 0 12px', fontSize: 13, color: C.muted }}>Handled by: {a.responsible}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              <Chip strong={a.fee}>Fee</Chip>
                              <Chip strong={a.time}>Time</Chip>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, borderRadius: 14, background: C.paper, border: `1px solid ${C.line}`, fontWeight: 800 }}>
                  <span>Total</span>
                  <span>Fee: {TOTAL_PROCESSING.fee} · Processing time: {TOTAL_PROCESSING.time}</span>
                </div>
              </div>
            )}
          </Reveal>
        </section>

        {/* 03 Schedule */}
        <section id="schedule" ref={(el) => (sectionRefs.current.schedule = el)} style={sectionPad(wide)}>
          <Reveal>
            <SectionHead num="03" eyebrow="Mark your calendar" title="Enrollment Schedule" />
            {(info?.schedule || !loading) && (
              <div style={{ ...card, padding: wide ? '26px 30px' : '20px 18px', display: 'flex', gap: 18, alignItems: 'flex-start', borderLeft: `4px solid ${info?.schedule ? C.red : C.line}` }}>
                <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red }}><IconCalendar size={22} /></span>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: info?.schedule ? C.ink : C.muted }}>
                  {info?.schedule || 'No schedule has been posted yet. Check back soon, or contact the school directly.'}
                </p>
              </div>
            )}
          </Reveal>
        </section>

        {/* 04 Apply */}
        <section id="apply" ref={(el) => (sectionRefs.current.apply = el)} style={sectionPad(wide)}>
          <Reveal>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, color: '#fff', background: GRAD, boxShadow: '0 24px 48px rgba(94, 11, 16, 0.28)' }}>
              <span aria-hidden="true" className="bes-blob" style={{ top: -90, right: -60, width: 300, height: 300, background: 'radial-gradient(circle at 40% 40%, rgba(232,185,35,.35), rgba(232,185,35,0) 70%)' }} />
              <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(255, 255, 255, 0.07) 35px, rgba(255, 255, 255, 0.07) 36px)' }} />
              <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 40 : 14, width: 5, boxSizing: 'border-box', borderLeft: '1px solid rgba(255, 255, 255, 0.4)', borderRight: '1px solid rgba(255, 255, 255, 0.4)' }} />
              <div style={{ position: 'relative', padding: wide ? '52px 48px 52px 88px' : '36px 22px 36px 40px' }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, opacity: 0.85 }}>04 · Apply</p>
                <h2 style={{ margin: '8px 0 12px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, fontSize: 'clamp(2rem, 4.6vw, 3.2rem)' }}>
                  {allReady ? 'You are all set. Let’s enroll.' : 'Ready when you are.'}
                </h2>
                <p style={{ margin: '0 0 26px', maxWidth: '46ch', fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9 }}>
                  Submit your documents through the official online enrollment portal. The school will update you on your status within about an hour.
                </p>
                <ApplyLink href={onlineEnrollmentLink} style={bigBtn}><IconMonitor size={20} />Online Enrollment Portal</ApplyLink>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Mobile floating apply button */}
      {!wide && (
        <ApplyLink href={onlineEnrollmentLink}
          style={{ position: 'fixed', bottom: 20, left: 16, right: 16, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 20px', borderRadius: 14, background: C.red, color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 22px rgba(94, 11, 16, 0.35)' }}>
          <IconMonitor size={18} />Apply for Enrollment
        </ApplyLink>
      )}
    </div>
  );
}
