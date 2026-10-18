import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useSchoolInfo } from '../../hooks/useSchoolInfo';
import { IconMapPin, IconPhone, IconMail, IconClock, IconClipboard, IconMessageSquare, IconSend, IconExternalLink } from '../../components/Icons';

/* ═══ Shared page kit (same look as PPAsPage; kept in this file) ═══ */
const C = {
  red: 'var(--green-800, #A8161B)', deep: 'var(--green-900, #8E1218)', ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923', goldText: '#8A5A00', paper: '#FFF4C7', cream: '#FFFBEA', tint: '#FBE3E3',
  muted: '#6B4A44', line: 'rgba(142, 18, 24, 0.14)', rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)', danger: '#B3261E',
};

const paperBg = {
  backgroundColor: C.paper,
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${C.rule} 35px, ${C.rule} 36px), linear-gradient(180deg, #FFF4C7 0%, #FFE88F 100%)`,
};

const card = {
  background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14,
  boxShadow: '0 1px 2px rgba(94, 11, 16, 0.06), 0 8px 20px rgba(94, 11, 16, 0.06)', color: C.ink,
};

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

const pageShell = (wide) => ({ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 });

const CSS = `
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: 2px; border-radius: 6px; }
.bes-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* entrance */
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

/* cards (hover lift only on devices that can hover) */
.bes-lift { transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease; }
@media (hover: hover) {
  .bes-lift:hover { transform: translateY(-6px); border-color: rgba(142,18,24,.3); box-shadow: 0 2px 4px rgba(94,11,16,.06), 0 22px 40px rgba(94,11,16,.16); }
  .bes-lift:hover .bes-media img, .bes-zoom:hover img { transform: scale(1.06); }
  .bes-lift:hover .bes-link { gap: 12px; }
}
.bes-media { position: relative; overflow: hidden; }
.bes-media img, .bes-zoom img { transition: transform .7s cubic-bezier(.2,.7,.2,1); }
.bes-zoom { position: relative; display: block; width: 100%; padding: 0; border: 0; background: none; overflow: hidden; cursor: zoom-in; }
.bes-hint { opacity: 0; transform: translateY(6px); transition: opacity .25s ease, transform .25s ease; }
.bes-zoom:hover .bes-hint, .bes-zoom:focus-visible .bes-hint { opacity: 1; transform: none; }
.bes-link { transition: gap .2s ease, color .2s ease; display: inline-flex; align-items: center; gap: 6px; }

/* controls */
.bes-filter { padding: 9px 18px; border-radius: 999px; cursor: pointer; font: inherit; font-weight: 700; font-size: 13.5px; color: var(--green-950, #5E0B10); background: #fff; border: 1px solid rgba(142,18,24,.14); display: inline-flex; align-items: center; gap: 8px; transition: background .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease; }
.bes-filter:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(94,11,16,.12); }
.bes-filter[aria-pressed="true"] { color: #fff; background: linear-gradient(100deg, #5E0B10, #A8161B); border-color: transparent; box-shadow: 0 8px 18px rgba(94,11,16,.28); }
.bes-filter .bes-count { font-size: 11.5px; min-width: 20px; padding: 1px 7px; border-radius: 999px; background: rgba(142,18,24,.1); text-align: center; }
.bes-filter[aria-pressed="true"] .bes-count { background: rgba(255,255,255,.22); }
.bes-search { position: relative; display: flex; align-items: center; gap: 10px; padding: 0 12px 0 16px; background: #fff; border: 1px solid rgba(142,18,24,.18); border-radius: 12px; transition: border-color .2s ease, box-shadow .2s ease; }
.bes-search:focus-within { border-color: #A8161B; box-shadow: 0 0 0 4px rgba(168,22,27,.12); }
.bes-search input { border: none; outline: none; background: transparent; font: inherit; font-size: .95rem; padding: 13px 0; width: 100%; color: var(--green-950, #5E0B10); -webkit-appearance: none; appearance: none; }
.bes-search input::-webkit-search-cancel-button { display: none; }
.bes-clear { display: grid; place-items: center; flex: none; width: 28px; height: 28px; border: 0; border-radius: 50%; background: rgba(142,18,24,.1); color: var(--green-950, #5E0B10); font-size: 18px; line-height: 1; cursor: pointer; transition: background .2s ease; }
.bes-clear:hover { background: rgba(142,18,24,.2); }
.bes-field { width: 100%; box-sizing: border-box; padding: 13px 14px; border: 1px solid rgba(142,18,24,.18); border-radius: 12px; background: #fff; font: inherit; font-size: .95rem; color: var(--green-950, #5E0B10); transition: border-color .2s ease, box-shadow .2s ease; }
.bes-field:focus { outline: none; border-color: #A8161B; box-shadow: 0 0 0 4px rgba(168,22,27,.12); }
.bes-field[aria-invalid="true"] { border-color: #B3261E; box-shadow: 0 0 0 4px rgba(179,38,30,.1); }
.bes-iconbtn { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; border: 1px solid rgba(142,18,24,.2); background: #fff; color: var(--green-950, #5E0B10); font: inherit; font-size: 1.3rem; line-height: 1; cursor: pointer; transition: background .2s ease, transform .2s ease; }
.bes-iconbtn:hover { background: #FFF4C7; transform: translateY(-1px); }

.bes-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 24px; border-radius: 12px; border: 2px solid transparent; font: inherit; font-weight: 800; font-size: .95rem; text-decoration: none; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease; }
.bes-btn:hover { transform: translateY(-2px); }
.bes-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.bes-btn-primary { background: var(--green-800, #A8161B); color: #fff; box-shadow: 0 8px 18px rgba(94,11,16,.28); }
.bes-btn-outline { background: transparent; color: var(--green-950, #5E0B10); border-color: var(--green-950, #5E0B10); }
.bes-btn-outline:hover { background: var(--green-950, #5E0B10); color: #fff; }
.bes-btn-white { background: #fff; color: var(--green-950, #5E0B10); box-shadow: 0 10px 22px rgba(0,0,0,.25); }
.bes-btn-sm { padding: 9px 16px; font-size: .84rem; border-radius: 10px; }

.bes-mark { background: linear-gradient(transparent 60%, rgba(232,185,35,.6) 60%, rgba(232,185,35,.6) 92%, transparent 92%); color: inherit; padding: 0 .08em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.bes-skel { background: linear-gradient(90deg, #f6e9c6 0%, #fff6d8 50%, #f6e9c6 100%); background-size: 200% 100%; animation: bes-shimmer 1.4s linear infinite; border-radius: 8px; }
.bes-lb-btn { display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.14); color: #fff; cursor: pointer; backdrop-filter: blur(6px); transition: background .2s ease; }
.bes-lb-btn:hover { background: rgba(255,255,255,.28); }
.bes-textlink { color: inherit; text-decoration: underline; text-decoration-color: rgba(142,18,24,.35); text-underline-offset: 3px; transition: text-decoration-color .2s ease, color .2s ease; }
.bes-textlink:hover { color: var(--green-800, #A8161B); text-decoration-color: currentColor; }

/* accordion: height animates open/closed */
.bes-acc { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
.bes-acc[data-open="true"] { grid-template-rows: 1fr; }
.bes-acc > div { min-height: 0; overflow: hidden; visibility: hidden; transition: visibility .3s; }
.bes-acc[data-open="true"] > div { visibility: visible; }

.bes-hero-glow { position: absolute; inset: auto auto -72px -72px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.8), rgba(255,255,255,0) 68%); pointer-events: none; filter: blur(2px); }
.bes-kicker { display: inline-flex; align-items: center; gap: 8px; color: var(--green-800, #A8161B); font-weight: 800; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; }
.bes-kicker::before { content: ''; width: 28px; height: 2px; background: #E8B923; }
.bes-form-card { position: relative; overflow: hidden; background: linear-gradient(145deg, #fff 0%, #fffdfa 72%, #fff7dc 100%); }
.bes-form-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, var(--green-950, #5E0B10), var(--green-800, #A8161B), #E8B923); }
.bes-form-card::after { content: ''; position: absolute; width: 150px; height: 150px; right: -75px; bottom: -75px; border-radius: 50%; border: 1px solid rgba(232,185,35,.24); box-shadow: 0 0 0 18px rgba(232,185,35,.06), 0 0 0 36px rgba(232,185,35,.04); pointer-events: none; }
.bes-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.bes-form-grid > .bes-form-full { grid-column: 1 / -1; }
.bes-field-wrap { position: relative; }
.bes-field-wrap:focus-within label { color: var(--green-800, #A8161B); }
.bes-field-wrap .bes-field { background: rgba(255,255,255,.88); }
.bes-field-wrap .bes-field::placeholder { color: #9b7f77; }
.bes-field-meta { display: flex; justify-content: space-between; gap: 12px; margin-top: 6px; color: #6B4A44; font-size: .78rem; }
.bes-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding-top: 4px; }
.bes-private-note { display: flex; align-items: center; gap: 8px; color: #6B4A44; font-size: .8rem; line-height: 1.4; }
.bes-private-note span { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #FBE3E3; color: var(--green-800, #A8161B); font-size: .75rem; font-weight: 800; }
.bes-contact-card { background: linear-gradient(145deg, #fff 0%, #fff 62%, #fff4c7 100%); }
.bes-contact-card .bes-contact-row { transition: background .2s ease, padding-left .2s ease; border-radius: 12px; }
.bes-contact-card .bes-contact-row:hover { background: rgba(251,227,227,.45); padding-left: 8px; }
.bes-contact-card .bes-contact-icon { box-shadow: 0 5px 12px rgba(94,11,16,.08); }
.bes-trust-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
.bes-trust-item { padding: 13px 10px; border: 1px solid rgba(142, 18, 24, 0.14); border-radius: 12px; background: rgba(255,255,255,.62); text-align: center; }
.bes-trust-item strong { display: block; color: var(--green-950, #5E0B10); font-size: .78rem; }
.bes-trust-item span { display: block; margin-top: 3px; color: #6B4A44; font-size: .72rem; }
.bes-success { background: linear-gradient(145deg, #fff 0%, #fff9df 100%); border: 1px solid rgba(232,185,35,.42); }
@media (max-width: 620px) {
  .bes-form-grid { grid-template-columns: 1fr; gap: 16px; }
  .bes-form-grid > .bes-form-full { grid-column: auto; }
  .bes-form-footer { align-items: stretch; flex-direction: column; }
  .bes-trust-strip { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .bes-reveal { opacity: 1; transform: none; transition: none; }
  .bes-rise, .bes-ticket, .bes-blob, .bes-skel { animation: none; }
  .bes-lift, .bes-lift:hover, .bes-media img, .bes-zoom img, .bes-filter, .bes-btn, .bes-btn:hover, .bes-iconbtn, .bes-acc, .bes-acc > div { transition: none; transform: none; }
  .bes-lift:hover .bes-media img, .bes-zoom:hover img { transform: none; }
}
`;

function BesStyles() { return <style>{CSS}</style>; }

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

/* Fades + lifts its child in once, when scrolled into view. Use `as="li"` inside lists. */
function Reveal({ as: Tag = 'div', children, delay = 0, style, ...rest }) {
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
    <Tag ref={ref} className={`bes-reveal${seen ? ' in' : ''}`} style={{ transitionDelay: seen ? `${delay}ms` : '0ms', ...style }} {...rest}>
      {children}
    </Tag>
  );
}

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

function Crumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 14, fontSize: '0.85rem', color: C.muted }}>
      {items.map((c, i) => (
        <span key={c.label}>
          {i > 0 && <span aria-hidden="true"> › </span>}
          {c.to ? <Link to={c.to} style={{ color: C.red, fontWeight: 700, textDecoration: 'none' }}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/* Hero: legal pad, drifting light, margin line, wave edge */
function Hero({ wide, above, eyebrow, title, subtitle, aside, extra }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" className="bes-hero-glow" />
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

/* "Ticket" stat card: one headline fact + supporting rows */
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

/* Section heading in the red double-rule "notebook margin" */
function SectionHead({ Icon, num, eyebrow, title, note, right, level = 2 }) {
  const H = `h${level}`;
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 26, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', flex: '1 1 260px', minWidth: 0 }}>
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'stretch', flex: 'none', minWidth: num !== undefined ? 44 : 0, paddingRight: Icon || num !== undefined ? 16 : 0, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red, fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
          {num !== undefined ? num : (Icon && <Icon size={22} />)}
        </span>
        <div style={{ minWidth: 0 }}>
          {eyebrow && <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem' }}>{eyebrow}</p>}
          <H style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>{title}</H>
          {note && <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: C.muted }}>{note}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}


const EMPTY = { sender_name: '', sender_email: '', subject: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const wide = useWide();
  const { info } = useSchoolInfo();
  const [feedbackLinks, setFeedbackLinks] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/feedback').then((r) => setFeedbackLinks(r.data)).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.sender_name.trim()) e.sender_name = 'Enter your full name.';
    if (form.sender_email && !EMAIL_RE.test(form.sender_email.trim())) e.sender_email = 'Enter an email like name@example.com, or leave it blank.';
    if (!form.message.trim()) e.message = 'Write a short message so the school knows how to help.';
    setErrors(e);
    const first = ['sender_name', 'sender_email', 'message'].find((k) => e[k]);
    if (first) document.getElementById(`contact-${first}`)?.focus();
    return !first;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      toast.success('Your message has been sent! We will get back to you as soon as possible.');
      setForm(EMPTY);
      setSent(true);
    } catch {
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };
  const csmLink = feedbackLinks.find((f) => f.type === 'csm_survey');
  const feedbackLink = feedbackLinks.find((f) => f.type === 'general_feedback');

  const address = info?.address || 'Purok 7, Bacao 2, General Trias City, Cavite';
  const mobile = info?.mobile || '(046) 230 3506 / 0966-486-1467';
  const email = info?.email || '107957@deped.gov.ph';
  const hours = info?.office_hours || 'Monday–Friday, 8:00 AM–5:00 PM';
  const mapsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Bacao Elementary School, ${address}`)}`;
  const mapsEmbed = info?.google_maps_embed_link
    || (info?.google_maps_link && info.google_maps_link.includes('/embed') ? info.google_maps_link : null)
    || `https://www.google.com/maps?q=${encodeURIComponent(`Bacao Elementary School, ${address}`)}&output=embed`;

  const phoneLinks = String(mobile).split('/').map((x) => x.trim()).filter(Boolean)
    .map((n) => ({ text: n, href: `tel:${n.replace(/[^\d+]/g, '')}` }));

  const labelStyle = { display: 'block', margin: '0 0 7px', fontSize: '0.9rem', fontWeight: 700 };
  const hintStyle = { fontWeight: 500, color: C.muted };
  const errStyle = { margin: '6px 0 0', fontSize: '0.84rem', fontWeight: 600, color: C.danger };
  const linkStyle = { color: C.red, textDecoration: 'none' };

  const contactDetails = [
    { Icon: IconPhone, label: 'Mobile', node: phoneLinks.map((n, i) => (
      <React.Fragment key={n.href}>{i > 0 && <span aria-hidden="true"> / </span>}<a style={linkStyle} href={n.href}>{n.text}</a></React.Fragment>
    )) },
    { Icon: IconMail, label: 'Email', node: <a style={linkStyle} href={`mailto:${email}`}>{email}</a> },
    { Icon: IconClock, label: 'Office hours', node: hours },
    { Icon: IconMapPin, label: 'Address', node: address },
  ];

  const ticket = (
    <Ticket wide={wide} Icon={IconMessageSquare} ariaLabel="School contact at a glance"
      label="Reach the school" value="Call or write"
      rows={[
        { Icon: IconClock, label: 'Office hours', value: hours },
        { Icon: IconMail, label: 'Email', value: email },
      ]} />
  );

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <Hero wide={wide} above={<Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]} />}
        eyebrow="Contact Us" title="We would love to hear from you."
        subtitle="Reach out to Bacao Elementary School by phone, email, or the message form."
        extra={<><span className="bes-btn bes-btn-sm bes-btn-outline" style={{ pointerEvents: 'none', borderColor: 'rgba(94,11,16,.35)' }}>Friendly support</span><span className="bes-btn bes-btn-sm bes-btn-white" style={{ pointerEvents: 'none' }}>We are here to help</span></>} aside={ticket} />

      <main className="container" style={{ ...mainBox(wide), paddingTop: wide ? 44 : 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1fr) minmax(0, 1.2fr)' : 'minmax(0, 1fr)', gap: wide ? 44 : 36, alignItems: 'start' }}>

          {/* Form first on phones: it is the main job of this page */}
          <section aria-label="Send a message" style={{ order: wide ? 2 : 1 }}>
            <Reveal delay={80}>
              <SectionHead title="Send us a message" note="We reply as soon as we can." />
              {sent ? (
                <div role="status" className="bes-success" style={{ ...card, padding: 'clamp(28px, 6vw, 48px)', textAlign: 'center' }}>
                  <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red, marginBottom: 16 }}><IconSend size={26} /></span>
                  <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.025em' }}>Message sent.</p>
                  <p style={{ margin: '0 auto 22px', maxWidth: '38ch', color: C.muted, lineHeight: 1.6 }}>Thank you. The school will reply as soon as possible.</p>
                  <button type="button" className="bes-btn bes-btn-outline bes-btn-sm" onClick={() => setSent(false)}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="bes-form-card" style={{ ...card, padding: 'clamp(22px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p className="bes-kicker" style={{ margin: '0 0 8px' }}>Start a conversation</p>
                    <p style={{ margin: 0, color: C.muted, fontSize: '.92rem', lineHeight: 1.55 }}>A few details will help us route your message to the right person.</p>
                  </div>
                  <div className="bes-form-grid" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="bes-field-wrap">
                      <label htmlFor="contact-sender_name" style={labelStyle}>Full name <span style={{ color: C.red }}>*</span></label>
                      <input id="contact-sender_name" type="text" autoComplete="name" className="bes-field" placeholder="Juan Dela Cruz" value={form.sender_name} onChange={set('sender_name')} aria-required="true" aria-invalid={!!errors.sender_name} aria-describedby={errors.sender_name ? 'err-name' : undefined} />
                      {errors.sender_name && <p id="err-name" role="alert" style={errStyle}>{errors.sender_name}</p>}
                    </div>
                    <div className="bes-field-wrap">
                      <label htmlFor="contact-sender_email" style={labelStyle}>Email <span style={hintStyle}>(optional)</span></label>
                      <input id="contact-sender_email" type="email" autoComplete="email" className="bes-field" placeholder="name@email.com" value={form.sender_email} onChange={set('sender_email')} aria-invalid={!!errors.sender_email} aria-describedby={errors.sender_email ? 'err-email' : undefined} />
                      {errors.sender_email && <p id="err-email" role="alert" style={errStyle}>{errors.sender_email}</p>}
                    </div>
                    <div className="bes-field-wrap bes-form-full">
                      <label htmlFor="contact-subject" style={labelStyle}>Subject <span style={hintStyle}>(optional)</span></label>
                      <input id="contact-subject" type="text" className="bes-field" placeholder="What is your message about?" value={form.subject} onChange={set('subject')} />
                    </div>
                    <div className="bes-field-wrap bes-form-full">
                      <label htmlFor="contact-message" style={labelStyle}>Message <span style={{ color: C.red }}>*</span></label>
                      <textarea id="contact-message" className="bes-field" rows="5" maxLength={1000} placeholder="Tell us how we can help…" value={form.message} onChange={set('message')} style={{ resize: 'vertical', minHeight: 142, lineHeight: 1.6 }} aria-required="true" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'err-message' : 'message-count'} />
                      <div className="bes-field-meta"><span>{errors.message ? <span style={{ color: C.danger }}>{errors.message}</span> : 'Please avoid sharing sensitive information.'}</span><span id="message-count">{form.message.length}/1000</span></div>
                    </div>
                  </div>
                  <div className="bes-form-footer" style={{ position: 'relative', zIndex: 1 }}>
                    <p className="bes-private-note" style={{ margin: 0 }}><span aria-hidden="true">✓</span> Your message is sent securely to the school office.</p>
                    <button type="submit" className="bes-btn bes-btn-primary" style={{ minWidth: 154 }} disabled={submitting}>{submitting ? 'Sending…' : (<><IconSend size={16} /> Send message</>)}</button>
                  </div>
                </form>
              )}
            </Reveal>
          </section>

          <section aria-label="School contact details" style={{ order: wide ? 1 : 2 }}>
            <Reveal>
              <SectionHead title="Get in touch" note="Visit, call or email the school office." />
              <div className="bes-contact-card" style={{ ...card, padding: '6px 22px' }}>
                {contactDetails.map((c, i) => (
                  <div className="bes-contact-row" key={c.label} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                    <span aria-hidden="true" className="bes-contact-icon" style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 38, height: 38, borderRadius: 11, background: C.tint, color: C.red }}><c.Icon size={17} /></span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: C.muted }}>{c.label}</p>
                      <p style={{ margin: '1px 0 0', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.45, overflowWrap: 'anywhere' }}>{c.node}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bes-trust-strip" aria-label="Contact benefits">
                <div className="bes-trust-item"><strong>Helpful</strong><span>Real school support</span></div>
                <div className="bes-trust-item"><strong>Direct</strong><span>No middleman</span></div>
                <div className="bes-trust-item"><strong>Open</strong><span>Mon–Fri office hours</span></div>
              </div>
            </Reveal>

            <Reveal delay={100} style={{ marginTop: 16 }}>
              <div style={{ ...card, overflow: 'hidden', marginBottom: 12, background: '#FBE3E3' }}>
                <iframe src={mapsEmbed} width="100%" height={wide ? 280 : 240} style={{ border: 0, display: 'block' }}
                  allowFullScreen loading="lazy" title="Bacao Elementary School location map" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <a href={info?.google_maps_link || mapsSearch} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-outline" style={{ width: '100%', boxSizing: 'border-box' }}>
                <IconExternalLink size={16} /> Open in Google Maps
              </a>
            </Reveal>

            {(csmLink?.url || feedbackLink?.url) && (
              <Reveal delay={150} style={{ marginTop: 36 }}>
                <SectionHead title="Feedback and surveys" note="Tell us how we did." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {csmLink?.url && <a href={csmLink.url} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-primary"><IconClipboard size={16} /> Client Satisfaction Survey (CSM)</a>}
                  {feedbackLink?.url && <a href={feedbackLink.url} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-outline"><IconMessageSquare size={16} /> General Feedback Form</a>}
                </div>
              </Reveal>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
