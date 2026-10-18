import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import './HomePage.css';

/* ════════════════════════════════════════════════════════════
   THEME — carries the Header's identity into the page without
   touching any stylesheet: crimson + golden legal pad, ruled
   lines, red margin, stamp, marker highlight, taped polaroid.
   Colour vars come from Header.css (--green-* holds the crimson).
   ════════════════════════════════════════════════════════════ */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
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
/* Plain hex for SVG charts (presentation attributes) */
const CH = { red: '#A8161B', deep: '#5E0B10', gold: '#E8B923', rose: '#D9575C', tan: '#B98B5E' };

const paperBg = {
  backgroundColor: C.paper,
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${C.rule} 35px, ${C.rule} 36px), linear-gradient(180deg, #FFF4C7 0%, #FFE88F 100%)`,
};
const secStyle = () => ({ background: C.cream }); /* one background colour for every section */
const card = {
  background: '#fff',
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  boxShadow: '0 1px 2px rgba(94, 11, 16, 0.06), 0 6px 16px rgba(94, 11, 16, 0.06)',
  color: C.ink,
};
const cardTop = card;
const panel = { ...card, padding: 28 };
const chip = { background: '#FBE3E3', color: C.red };
const pill = {
  background: '#fff',
  color: C.ink,
  border: '1px solid rgba(142, 18, 24, 0.25)',
  fontWeight: 700,
};
const marker = {
  background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))',
  color: '#fff',
  border: 'none',
  borderRadius: '0.3em 0.6em 0.35em 0.55em',
  boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)',
  transform: 'rotate(-1.5deg)',
  fontWeight: 800,
};
/* Section number: a small crimson numeral followed by the header's double red margin line */
const secNum = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  alignSelf: 'stretch',
  flex: 'none',
  minWidth: 44,
  paddingRight: 16,
  marginRight: 18,
  borderRight: `5px double ${C.margin}`,
  color: C.red,
  fontSize: '1.05rem',
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
};

/* ─── Extra motion + depth (kept in this file; respects reduced motion) ─── */
const FX = `
@keyframes hp-letter { from { opacity: 0; transform: translateY(.55em) rotate(7deg); } to { opacity: 1; transform: none; } }
@keyframes hp-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes hp-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(26px,-20px) scale(1.08); } }
@keyframes hp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.hp-letter { display: inline-block; animation: hp-letter .85s cubic-bezier(.2,.8,.2,1) both; }
.hp-underline { position: absolute; left: -.02em; right: -.02em; bottom: .07em; height: .17em; z-index: -1; border-radius: 3px; background: #E8B923; opacity: .8; transform-origin: left; animation: hp-draw .9s cubic-bezier(.2,.7,.2,1) 1s both; }
.hp-blob { position: absolute; border-radius: 50%; pointer-events: none; animation: hp-drift 14s ease-in-out infinite; }
.hp-chip { animation: hp-float 6s ease-in-out infinite; }
.hp-ghost { position: absolute; top: -34px; right: 0; z-index: 0; pointer-events: none; user-select: none; font-weight: 800; letter-spacing: -0.06em; line-height: 1; font-size: clamp(5.5rem, 13vw, 10rem); color: transparent; -webkit-text-stroke: 1.5px rgba(142, 18, 24, 0.13); font-variant-numeric: tabular-nums; }
.hp-active { color: #A8161B !important; box-shadow: inset 0 -3px 0 #A8161B; }
.hero-split { isolation: isolate; }
.hero-split::before { content: ''; position: absolute; z-index: -1; width: min(48vw, 700px); height: min(48vw, 700px); right: -12vw; top: -18vw; border-radius: 50%; background: radial-gradient(circle at 38% 40%, rgba(232,185,35,.56), rgba(232,185,35,.16) 48%, rgba(232,185,35,0) 72%); pointer-events: none; }
.hero-split::after { content: ''; position: absolute; z-index: -1; width: min(54vw, 760px); height: min(20vw, 260px); left: 31%; bottom: -12%; border-radius: 50%; background: rgba(196,30,36,.08); transform: rotate(-8deg); filter: blur(2px); pointer-events: none; }
.hero-panel { position: relative; }
.hero-panel::after { content: ''; position: absolute; left: 12%; bottom: -32px; width: 190px; height: 18px; border-top: 4px solid rgba(168,22,27,.25); border-radius: 50%; transform: rotate(-5deg); pointer-events: none; }
.hero-headline { position: relative; }
.hero-headline::before { content: ''; position: absolute; left: -24px; top: -26px; width: 76px; height: 76px; border: 2px dashed rgba(168,22,27,.24); border-radius: 50%; transform: rotate(18deg); pointer-events: none; }
.hero-media { isolation: isolate; }
.hero-media::before { content: ''; position: absolute; z-index: -1; inset: 12px -18px -18px 18px; border-radius: 18px; background: #E8B923; transform: rotate(-4deg); opacity: .72; }
.hero-media::after { content: ''; position: absolute; z-index: -1; inset: -18px 18px 18px -18px; border-radius: 18px; border: 2px solid rgba(168,22,27,.18); transform: rotate(4deg); pointer-events: none; }
.dash-card, .rate-card, .kpi-card { transition: transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s ease, border-color .28s ease; }
.dash-card:hover, .rate-card:hover, .kpi-card:hover { transform: translateY(-7px) rotate(-.35deg); border-color: rgba(168,22,27,.28); box-shadow: 0 18px 34px rgba(94,11,16,.14); }
.dash-section:nth-of-type(odd) .dash-card:hover { transform: translateY(-7px) rotate(.35deg); }
.dash-nav-bar { position: sticky; top: 0; z-index: 30; transition: box-shadow .25s ease, background .25s ease; }
.dash-nav-bar::after { content: ''; display: block; height: 3px; background: linear-gradient(90deg, #5E0B10, #A8161B 54%, #E8B923); opacity: .9; }
/* PPAs: keep the existing content, but give every card one dependable rhythm. */
.ppa-section .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: stretch; gap: 22px; }
.ppa-section .ppa-card { position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 100%; overflow: hidden; border-radius: 14px; color: #5E0B10; text-decoration: none; transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease, border-color .3s ease; }
.ppa-section .ppa-card::after { content: ''; position: absolute; left: 18px; right: 18px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: linear-gradient(90deg, #A8161B, #E8B923); transform: scaleX(0); transform-origin: left; transition: transform .3s ease; }
.ppa-section .ppa-card:hover { transform: translateY(-8px) rotate(-.35deg); border-color: rgba(168,22,27,.3); box-shadow: 0 20px 38px rgba(94,11,16,.15); }
.ppa-section .ppa-card:nth-child(3n+2):hover { transform: translateY(-8px) rotate(.35deg); }
.ppa-section .ppa-card:hover::after { transform: scaleX(1); }
.ppa-section .ppa-card-feature { border-top: 5px solid #E8B923; }
.ppa-section .ppa-image-wrap { position: relative; flex: none; aspect-ratio: 16 / 9; overflow: hidden; background: linear-gradient(135deg, #FBE3E3, #FFF4C7); }
.ppa-section .ppa-image { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .65s cubic-bezier(.2,.7,.2,1), filter .35s ease; }
.ppa-section .ppa-card:hover .ppa-image { transform: scale(1.055); filter: saturate(1.06); }
.ppa-section .ppa-image-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(94,11,16,0) 42%, rgba(94,11,16,.38) 100%); pointer-events: none; }
.ppa-section .ppa-image-tag { position: absolute; left: 14px; bottom: 13px; z-index: 1; box-shadow: 0 6px 14px rgba(94,11,16,.15); }
.ppa-section .ppa-body { display: flex; flex: 1; flex-direction: column; align-items: flex-start; padding: 20px 20px 22px; background: #fff; }
.ppa-section .ppa-name { display: -webkit-box; margin: 0 0 8px; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; font-size: 1.08rem; font-weight: 800; letter-spacing: -.025em; line-height: 1.25; }
.ppa-section .ppa-body > p:not(.ppa-name) { display: -webkit-box; margin: 0; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-height: 1.55; }
.ppa-section .ppa-link { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 18px; font-size: .84rem; font-weight: 800; }
.ppa-section .ppa-link-icon { width: 15px; height: 15px; transition: transform .25s ease; }
.ppa-section .ppa-card:hover .ppa-link-icon { transform: translateX(4px); }
@media (max-width: 900px) { .ppa-section .feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
@media (max-width: 600px) { .ppa-section .feature-grid { grid-template-columns: 1fr; gap: 16px; } .ppa-section .ppa-image-wrap { aspect-ratio: 16 / 10; } .ppa-section .ppa-body { padding: 18px 18px 20px; } }
@media (max-width: 760px) {
  .hero-split::before { width: 420px; height: 420px; right: -220px; top: -130px; }
  .hero-split::after { left: 8%; width: 92%; height: 110px; bottom: -50px; }
  .hero-panel::after, .hero-headline::before { display: none; }
  .hero-media::before { inset: 10px -8px -10px 8px; }
  .hero-media::after { inset: -10px 8px 10px -8px; }
}
@media (max-width: 760px) { .hp-ghost { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .hp-letter, .hp-underline, .hp-blob, .hp-chip { animation: none; }
  .dash-card, .rate-card, .kpi-card, .hero-media::before, .hero-media::after { transition: none; transform: none; }
}
`;
function HomeFx() { return <style>{FX}</style>; }

/* ─── Icons (one helper, same stroke style as the header) ───── */
const mk = (body, { fill = 'none', sw = 1.8 } = {}) => (p) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{body}</svg>
);
const UsersIcon = mk(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>);
const UserCheckIcon = mk(<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></>);
const BuildingIcon = mk(<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></>);
const TrendingUpIcon = mk(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>);
const SchoolIcon = mk(<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>);
const ClipboardIcon = mk(<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>);
const TrophyIcon = mk(<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>);
const StarIcon = mk(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>);
const PhoneIcon = mk(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>);
const ArrowRightIcon = mk(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>, { sw: 2 });
const ChevronLeftIcon = mk(<polyline points="15 18 9 12 15 6"/>, { sw: 2 });
const ChevronRightIcon = mk(<polyline points="9 18 15 12 9 6"/>, { sw: 2 });
const ChevronDownIcon = mk(<polyline points="6 9 12 15 18 9"/>, { sw: 2 });
const PauseIcon = mk(<><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>, { fill: 'currentColor' });
const PlayIcon = mk(<path d="M8 5v14l11-7z"/>, { fill: 'currentColor' });
const CalendarIcon = mk(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>);
const BookOpenIcon = mk(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>);
const PieChartIcon = mk(<><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></>);
const HeartIcon = mk(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>);
const ShieldIcon = mk(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>);
const CheckCircleIcon = mk(<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>);
const AlertCircleIcon = mk(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>);
const ClockIcon = mk(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>);
const ActivityIcon = mk(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>);
const BarChartIcon = mk(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>);
const AwardIcon = mk(<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>);
const ZapIcon = mk(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>);
const RefreshIcon = mk(<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>, { sw: 2 });

const QUICK_LINKS = [
  { code: 'AB', label: 'About BES', desc: 'School profile & history', path: '/about', Icon: SchoolIcon },
  { code: 'AD', label: 'Admissions', desc: 'Enrollment information', path: '/admissions', Icon: ClipboardIcon },
  { code: 'PR', label: 'Programs & Activities', desc: 'PPAs and events', path: '/ppas', Icon: CalendarIcon },
  { code: 'AC', label: 'Accomplishments', desc: 'Awards & achievements', path: '/accomplishments', Icon: TrophyIcon },
  { code: 'SC', label: "Students' Corner", desc: 'Featured students', path: '/students-corner', Icon: StarIcon },
  { code: 'CT', label: 'Contact Us', desc: 'Get in touch', path: '/contact', Icon: PhoneIcon },
];

const ACCOUNTABILITY_LABELS = {
  acc_transparency_seal: 'Transparency Seal',
  acc_aip_wfp_app: 'AIP / WFP / APP',
  acc_saln: 'SALN',
  acc_philgeps: 'PhilGEPS',
  acc_coa_aom: 'COA / AOM',
  acc_foi: 'FOI',
  acc_arta: 'ARTA',
  acc_ccsr_csm: 'CCSR / CSM',
  acc_8888_ccb: '8888 / CCB',
};

const DASH_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'access', label: 'Access' },
  { id: 'quality', label: 'Quality' },
  { id: 'equity', label: 'Equity' },
  { id: 'wellbeing', label: 'Well-Being' },
  { id: 'hr', label: 'HR' },
  { id: 'governance', label: 'Governance' },
  { id: 'accountability', label: 'Accountability' },
];
const DASH_IDS = DASH_SECTIONS.map((t) => t.id);

/* ─── Hooks ─────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const [node, setNode] = useState(null);
  const [inView, setInView] = useState(false);
  const ref = useCallback((el) => { if (el) setNode(el); }, []);
  useEffect(() => {
    if (!node || inView) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setInView(true); obs.unobserve(e.target); } });
    }, { threshold, rootMargin: '0px 0px -50px 0px' });
    obs.observe(node);
    return () => obs.disconnect();
  }, [node, threshold, inView]);
  return [ref, inView];
}

function useCountUp(target, start, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || typeof target !== 'number' || Number.isNaN(target)) return;
    let raf, startTime = null;
    const step = (ts) => {
      if (startTime === null) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

function useDesktop() {
  const q = '(min-width: 941px)';
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? true : window.matchMedia(q).matches));
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return match;
}

/* One staggered page-load sequence for the hero. Skipped when reduced motion is on. */
function useEntrance() {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (on) return undefined;
    const id = setTimeout(() => setOn(true), 40);
    return () => clearTimeout(id);
  }, [on]);
  return (i = 0) => ({
    opacity: on ? 1 : 0,
    transform: on ? 'none' : 'translateY(16px)',
    transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`,
  });
}

/* Which dashboard section is on screen (drives the nav highlight) */
function useScrollSpy(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    els.forEach((el) => obs.observe(el));
    const onScroll = () => { if (window.scrollY < 300) setActive(''); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [ids]);
  return active;
}

function getOrCreateToken(key) {
  let t = null;
  try { t = localStorage.getItem(key); } catch (_) { /* storage blocked */ }
  if (!t) {
    t = Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
    try { localStorage.setItem(key, t); } catch (_) { /* storage blocked */ }
  }
  return t;
}

/* ─── Small components ──────────────────────────────────────── */

/* Hero word: letters drop in one by one, then a marker line is drawn under it */
function HeroWord({ text }) {
  return (
    <span aria-label={text} style={{ position: 'relative', display: 'inline-block', isolation: 'isolate' }}>
      {text.split('').map((ch, i) => (
        <span key={i} aria-hidden="true" className="hp-letter" style={{ animationDelay: `${0.2 + i * 0.07}s` }}>{ch}</span>
      ))}
      <span aria-hidden="true" className="hp-underline" />
    </span>
  );
}

/* Round back-to-top button whose ring fills as you read down the page */
function ScrollTop() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  const R = 22;
  const Circ = 2 * Math.PI * R;
  const show = p > 0.04;
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <button type="button" aria-label="Back to top" tabIndex={show ? 0 : -1} onClick={toTop}
      style={{
        position: 'fixed', right: 18, bottom: 18, zIndex: 60, width: 52, height: 52, padding: 0, border: 0, borderRadius: '50%',
        display: 'grid', placeItems: 'center', background: '#fff', color: CH.red, cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(94, 11, 16, 0.25)',
        opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(12px) scale(.9)', pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="26" cy="26" r={R} fill="none" stroke="#F3EAE8" strokeWidth="3" />
        <circle cx="26" cy="26" r={R} fill="none" stroke={CH.red} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${Circ * p} ${Circ}`} transform="rotate(-90 26 26)" />
      </svg>
      <ArrowRightIcon style={{ position: 'relative', width: 18, height: 18, transform: 'rotate(-90deg)' }} />
    </button>
  );
}

function DonutChart({ data, size = 160 }) {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const R = size / 2 - 14;
  const r = R * 0.56;
  const Circ = 2 * Math.PI * R;
  let acc = 0;
  const segs = data.map((d) => {
    const pct = total ? d.value / total : 0;
    const seg = { ...d, dash: `${Circ * pct} ${Circ}`, offset: -Circ * acc };
    acc += pct;
    return seg;
  });
  const cx = size / 2 + 8, cy = size / 2 + 8;
  return (
    <svg width={size + 16} height={size + 16} viewBox={`0 0 ${size + 16} ${size + 16}`} className="donut-chart" role="img" aria-label={`Total ${total}`}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3EAE8" strokeWidth={R - r} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth={R - r}
          strokeDasharray={s.dash} strokeDashoffset={s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)', transitionDelay: `${i * 0.15}s` }} />
      ))}
      <text x={cx} y={cy - 7} textAnchor="middle" fill={CH.deep} fontSize="17" fontWeight="800">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="#6B4A44" fontSize="8" fontWeight="700" letterSpacing="0.06em">TOTAL</text>
    </svg>
  );
}

function DonutLegend({ data, empty }) {
  return (
    <div className="donut-legend">
      {data.map((d, i) => (
        <div key={i} className="donut-legend-item">
          <span className="legend-dot" style={{ background: d.color }} />
          <span className="donut-legend-name">{d.name}</span>
          <span className="donut-legend-val">{d.value.toLocaleString()}</span>
        </div>
      ))}
      {!data.length && <p className="chart-empty">{empty}</p>}
    </div>
  );
}

function HBarChart({ data, animate, keys, colors, labels }) {
  if (!data?.length) return null;
  const maxVal = Math.max(...data.flatMap((d) => keys.map((k) => d[k] || 0)), 1);
  return (
    <div className="h-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="h-bar-row">
          <div className="h-bar-label">{d.name}</div>
          <div className="h-bar-tracks">
            {keys.map((k, ki) => (
              <div key={ki} className="h-bar-track">
                <div className="h-bar-fill" style={{ width: animate ? `${((d[k] || 0) / maxVal) * 100}%` : '0%', background: colors[ki], transitionDelay: `${i * 0.05 + ki * 0.08}s` }}>
                  <span className="h-bar-num">{d[k] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="h-bar-legend">
        {keys.map((k, ki) => (
          <span key={ki} className="legend-item"><span className="legend-dot" style={{ background: colors[ki] }} />{labels[ki]}</span>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max = 100, color, animate }) {
  const pct = Math.min(100, Math.max(0, max ? (value / max) * 100 : 0));
  return (
    <div className="prog-row">
      <div className="prog-meta">
        <span className="prog-label">{label}</span>
        <span className="prog-val" style={{ color: C.ink }}>{typeof value === 'number' ? `${value.toFixed(1)}%` : value}</span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: animate ? `${pct}%` : '0%', background: color }} />
      </div>
    </div>
  );
}

const BADGES = {
  Completed: { style: { background: C.paper, color: C.ink, border: '1px solid rgba(142, 18, 24, 0.25)' }, icon: CheckCircleIcon },
  'In Progress': { style: { background: '#FFF1B8', color: C.goldText, border: '1px solid rgba(138, 90, 0, 0.25)' }, icon: ClockIcon },
  Pending: { style: { background: '#F3EAE8', color: C.muted, border: '1px solid rgba(107, 74, 68, 0.2)' }, icon: AlertCircleIcon },
  Overdue: { style: { background: CH.red, color: '#fff', border: '1px solid transparent' }, icon: AlertCircleIcon },
};
function StatusBadge({ status }) {
  const b = BADGES[status] || BADGES.Pending;
  const I = b.icon;
  return <span className="status-badge" style={b.style}><I style={{ width: 12, height: 12 }} />{status}</span>;
}

/* Section header: small numeral + double margin line, with a large outlined ghost numeral behind */
function SectionHeader({ num, eyebrow, title, sub, aside, inView }) {
  return (
    <div className={`reveal${inView ? ' in-view' : ''}`} style={{ position: 'relative', display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: '12px 0', marginBottom: 40 }}>
      <span aria-hidden="true" className="hp-ghost">{num}</span>
      <span aria-hidden="true" style={{ ...secNum, position: 'relative', zIndex: 1 }}>{num}</span>
      <div style={{ position: 'relative', zIndex: 1, flex: '1 1 320px', minWidth: 0 }}>
        <p style={{ margin: '0 0 6px', color: C.red, fontWeight: 700, fontSize: '0.9rem' }}>{eyebrow}</p>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', lineHeight: 1.1 }}>{title}</h2>
        {sub && <p style={{ margin: '10px 0 0', color: C.muted, maxWidth: '62ch', lineHeight: 1.6 }}>{sub}</p>}
      </div>
      {aside && <div style={{ position: 'relative', zIndex: 1, alignSelf: 'center', marginLeft: 'auto', paddingLeft: 16 }}>{aside}</div>}
    </div>
  );
}

function KpiCard({ icon: IconComp, label, value, accent, start, suffix = '', prefix = '', extra }) {
  const isNum = typeof value === 'number';
  const count = useCountUp(isNum ? value : 0, start && isNum);
  return (
    <div className={`kpi-card accent-${accent}`} style={card}>
      <div className="kpi-card-icon" style={chip}><IconComp /></div>
      <div className="kpi-card-body">
        <p className="kpi-card-value" style={{ color: C.ink }}>{prefix}{isNum ? count.toLocaleString() : (value || '—')}{suffix}</p>
        <p className="kpi-card-label" style={{ color: C.muted }}>{label}</p>
        {extra && <p className="kpi-card-extra">{extra}</p>}
      </div>
    </div>
  );
}

function GaugeChart({ value, max = 100, color, label, animate }) {
  const pct = Math.min(1, Math.max(0, value / max));
  const Circ = Math.PI * 48;
  return (
    <div className="gauge-wrap">
      <svg width="120" height="72" viewBox="0 0 120 72" className="gauge-svg" role="img" aria-label={`${label} ${value}%`}>
        <path d="M 12 64 A 48 48 0 0 1 108 64" fill="none" stroke="#F3EAE8" strokeWidth="10" strokeLinecap="round" />
        <path d="M 12 64 A 48 48 0 0 1 108 64" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={animate ? `${Circ * pct} ${Circ}` : `0 ${Circ}`} style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)' }} />
        <text x="60" y="58" textAnchor="middle" fill={CH.deep} fontSize="14" fontWeight="800">{value}%</text>
      </svg>
      <p className="gauge-label" style={{ color: C.muted }}>{label}</p>
    </div>
  );
}

/* Live visitor popover, docked in the dashboard nav */
function VisitorPulse({ stats, refreshing }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const STATS = [
    { key: 'active', label: 'Active now', icon: ZapIcon, active: true },
    { key: 'total', label: 'Total visits', icon: TrendingUpIcon },
    { key: 'today', label: 'Today', icon: CalendarIcon },
    { key: 'unique', label: 'Unique', icon: UsersIcon },
  ];

  return (
    <div className="nav-pulse-wrap" ref={wrapRef}>
      <button type="button" className="nav-pulse-trigger" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}
        style={{ background: C.paper, color: C.ink, border: '1px solid rgba(142, 18, 24, 0.25)' }}>
        <span className="nav-pulse-dot" style={{ background: CH.red }} />
        <span className="nav-pulse-num" style={{ color: C.ink, fontWeight: 800 }}>{(stats.active || 0).toLocaleString()}</span>
        <span className="nav-pulse-word" style={{ color: C.muted, fontWeight: 700 }}>Online</span>
        <ChevronDownIcon className="nav-pulse-chevron" style={{ color: C.muted }} />
      </button>

      {open && (
        <div className="nav-pulse-panel" role="dialog" aria-label="Live site traffic" style={{ ...card, background: '#fff' }}>
          <div className="npp-header">
            <div className="npp-title">
              <span className="npp-title-dot" style={{ background: CH.red }} />
              <span className="npp-title-text" style={{ color: C.ink }}>Live Site Traffic</span>
            </div>
            <RefreshIcon className={`npp-refresh${refreshing ? ' spinning' : ''}`} />
          </div>
          <div className="npp-grid">
            {STATS.map(({ key, label, icon: IconComp, active }) => (
              <div key={key} className={`npp-stat${active ? ' npp-stat-active' : ''}`} style={active ? { background: C.paper } : undefined}>
                <span className="npp-stat-icon" style={{ color: C.red }}><IconComp /></span>
                <div>
                  <div className="npp-stat-num" style={{ color: C.ink }}>{(stats[key] || 0).toLocaleString()}</div>
                  <div className="npp-stat-label" style={{ color: C.muted }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="npp-footer" style={{ color: C.muted }}>Updates every 30s · Active window: 2 min</div>
        </div>
      )}
    </div>
  );
}

function EnrollmentBand({ s, start, isDesk, sections, classrooms }) {
  const total = useCountUp(Number(s.enrollment_count) || 0, start);
  const items = [
    { I: UserCheckIcon, n: Number(s.teaching_personnel) || 0, l: 'Teachers' },
    { I: BuildingIcon, n: Number(s.non_teaching_personnel) || 0, l: 'Non-teaching staff' },
    { I: BookOpenIcon, n: sections, l: 'Sections' },
    { I: SchoolIcon, n: classrooms, l: 'Classrooms' },
  ];
  const hair = '1px solid rgba(255, 255, 255, 0.2)';
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 12, color: '#fff', marginBottom: 28,
      background: 'var(--grad-masthead, linear-gradient(135deg, #5E0B10, #A8161B))',
      boxShadow: '0 24px 48px rgba(94, 11, 16, 0.28)',
      display: 'grid', gridTemplateColumns: isDesk ? 'minmax(0, 1.1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
    }}>
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(255, 255, 255, 0.07) 35px, rgba(255, 255, 255, 0.07) 36px)' }} />
      <span aria-hidden="true" className="hp-blob" style={{ top: -110, left: isDesk ? '18%' : -60, width: 340, height: 340, background: 'radial-gradient(circle at 40% 40%, rgba(232,185,35,.38), rgba(232,185,35,0) 70%)' }} />
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: isDesk ? 40 : 16, width: 5, boxSizing: 'border-box',
        borderLeft: '1px solid rgba(255, 255, 255, 0.4)', borderRight: '1px solid rgba(255, 255, 255, 0.4)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', padding: isDesk ? '48px 40px 48px 80px' : '32px 24px 28px 44px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, opacity: 0.85 }}>
          Total enrollment{s.active_school_year ? `, SY ${s.active_school_year}` : ''}
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 'clamp(3.6rem, 9vw, 6.5rem)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {total.toLocaleString()}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '1.05rem', opacity: 0.85 }}>learners in our school community</p>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignContent: 'stretch', borderTop: isDesk ? 'none' : hair }}>
        {items.map(({ I, n, l }, i) => (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, padding: '22px 28px',
            borderLeft: isDesk || i % 2 ? hair : 'none', borderTop: i > 1 ? hair : 'none' }}>
            <I style={{ width: 20, height: 20, opacity: 0.8 }} />
            <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{n.toLocaleString()}</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickCard({ label, desc, path, Icon: I }) {
  const [hover, setHover] = useState(false);
  return (
    <Link to={path}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', textDecoration: 'none',
        background: '#fff', color: C.ink, borderRadius: 10,
        border: `1px solid ${hover ? CH.red : C.line}`,
        boxShadow: hover ? '0 14px 28px rgba(94, 11, 16, 0.14)' : card.boxShadow,
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}>
      <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 48, height: 48, borderRadius: 10, background: hover ? CH.red : C.paper, color: hover ? '#fff' : C.deep, transition: 'background 0.25s ease, color 0.25s ease' }}>
        <I style={{ width: 22, height: 22 }} />
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontWeight: 800, fontSize: '1.02rem', color: C.ink }}>{label}</span>
        <span style={{ fontSize: '0.85rem', color: C.muted }}>{desc}</span>
      </span>
      <ArrowRightIcon style={{ width: 18, height: 18, flex: 'none', color: CH.red, transform: hover ? 'translateX(3px)' : 'none', transition: 'transform 0.25s ease' }} />
    </Link>
  );
}

function ParityBar({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return <p className="chart-empty">No data</p>;
  return (
    <div>
      <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: '#F3EAE8' }}>
        {data.map((d) => <span key={d.name} style={{ width: `${(d.value / total) * 100}%`, background: d.color }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.85rem', fontWeight: 700, color: C.ink }}>
        {data.map((d) => <span key={d.name}>{d.name} {Math.round((d.value / total) * 100)}%</span>)}
      </div>
    </div>
  );
}

const Skeleton = () => (
  <div className="dashboard-skeleton">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="skel-card">
        <div className="skeleton skel-icon" />
        <div className="skeleton skel-num" />
        <div className="skeleton skel-label" />
      </div>
    ))}
  </div>
);

const fmtDate = (d) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return null; }
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const isDesk = useDesktop();
  const enter = useEntrance();
  const activeSection = useScrollSpy(DASH_IDS);
  const mediaRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);
  const [ppas, setPpas] = useState([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [visitorStats, setVisitorStats] = useState({ active: 0, total: 0, today: 0, unique: 0 });
  const [vcRefreshing, setVcRefreshing] = useState(false);

  useEffect(() => {
    api.get('/school-dashboard').then((r) => {
      setDashboard(r.data);
      if (r.data?.stats?.updated_at) setLastUpdated(r.data.stats.updated_at);
    }).catch(() => {}).finally(() => setLoadingDash(false));
    api.get('/ppas').then((r) => setPpas(r.data.slice(0, 3))).catch(() => {});
    api.get('/banners').then((r) => {
      setBanners((r.data || []).filter((b) => b.type !== 'general'));
    }).catch(() => {}).finally(() => setBannersLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || !autoplay) return;
    const t = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length, autoplay]);

  useEffect(() => {
    const sessionToken = getOrCreateToken('_bes_sess');
    const visitorToken = getOrCreateToken('_bes_vid');
    const ping = () => { api.post('/visitor-stats/ping', { sessionToken, visitorToken }).catch(() => {}); };
    const fetchStats = () => {
      setVcRefreshing(true);
      api.get('/visitor-stats')
        .then((r) => setVisitorStats(r.data || { active: 0, total: 0, today: 0, unique: 0 }))
        .catch(() => {})
        .finally(() => setVcRefreshing(false));
    };
    ping();
    fetchStats();
    const pingTimer = setInterval(ping, 30000);
    const statsTimer = setInterval(fetchStats, 30000);
    return () => { clearInterval(pingTimer); clearInterval(statsTimer); };
  }, []);

  const goToBanner = useCallback((i) => { setCurrentBanner(i); setAutoplay(false); }, []);
  const prevBanner = useCallback(() => setCurrentBanner((p) => (p - 1 + banners.length) % banners.length), [banners.length]);
  const nextBanner = useCallback(() => setCurrentBanner((p) => (p + 1) % banners.length), [banners.length]);
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* Photo drifts a little against the pointer (desktop, motion allowed) */
  const onHeroMove = useCallback((e) => {
    const el = mediaRef.current;
    if (!el || !isDesk || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.translate = `${(-x * 14).toFixed(1)}px ${(-y * 10).toFixed(1)}px`;
    el.style.rotate = `${(1.2 + x * 1.6).toFixed(2)}deg`;
  }, [isDesk]);
  const onHeroLeave = useCallback(() => {
    if (banners.length > 1) setAutoplay(true);
    const el = mediaRef.current;
    if (el) { el.style.translate = '0px 0px'; el.style.rotate = isDesk ? '1.2deg' : '0deg'; }
  }, [banners.length, isDesk]);

  const s = dashboard?.stats || {};
  const grades = dashboard?.grades || [];
  const heroLearners = useCountUp(Number(s.enrollment_count) || 0, !loadingDash);

  const computed = useMemo(() => {
    const totalSections = grades.reduce((a, g) => a + (Number(g.sections_count) || 0), 0);
    const totalClassrooms = grades.reduce((a, g) => a + (Number(g.classrooms_count) || 0), 0);
    const enrollment = Number(s.enrollment_count) || 0;
    const totalTeaching = Number(s.teaching_personnel) || 0;
    const totalNonTeaching = Number(s.non_teaching_personnel) || 0;
    const totalAdmin = Number(s.administrative_staff) || 0;
    const accItems = Object.keys(ACCOUNTABILITY_LABELS);
    return {
      totalSections, totalClassrooms,
      avgSection: totalSections > 0 ? Math.round((enrollment / totalSections) * 10) / 10 : 0,
      totalTeaching, totalNonTeaching, totalAdmin,
      totalPersonnel: totalTeaching + totalNonTeaching + totalAdmin,
      accCompleted: accItems.filter((k) => s[k] === 'Completed').length,
      accTotal: accItems.length,
    };
  }, [s, grades]);

  const gradeChartData = useMemo(() => grades.map((g) => ({
    name: g.grade_level.replace('Grade ', 'G'),
    sections: Number(g.sections_count) || 0,
    classrooms: Number(g.classrooms_count) || 0,
  })), [grades]);

  /* Every series now has its own colour (Teaching/Non-Teaching used to match). */
  const personnelDonut = useMemo(() => [
    { name: 'Teaching', value: computed.totalTeaching, color: CH.red },
    { name: 'Non-Teaching', value: computed.totalNonTeaching, color: CH.deep },
    { name: 'Admin', value: computed.totalAdmin, color: CH.gold },
  ].filter((d) => d.value > 0), [computed]);

  const bmiDonut = useMemo(() => [
    { name: 'Normal', value: Number(s.bmi_normal) || 0, color: CH.deep },
    { name: 'Overweight', value: Number(s.bmi_overweight) || 0, color: CH.gold },
    { name: 'Obese', value: Number(s.bmi_obese) || 0, color: CH.red },
    { name: 'Wasted', value: Number(s.bmi_wasted) || 0, color: CH.rose },
  ].filter((d) => d.value > 0), [s]);

  const genderDonut = useMemo(() => [
    { name: 'Male', value: Number(s.male_count) || 0, color: CH.deep },
    { name: 'Female', value: Number(s.female_count) || 0, color: CH.gold },
  ].filter((d) => d.value > 0), [s]);

  const [overviewRef, overviewInView] = useInView(0.1);
  const [accessRef, accessInView] = useInView(0.1);
  const [qualityRef, qualityInView] = useInView(0.1);
  const [equityRef, equityInView] = useInView(0.1);
  const [wellRef, wellInView] = useInView(0.1);
  const [hrRef, hrInView] = useInView(0.1);
  const [govRef, govInView] = useInView(0.1);
  const [accRef, accInView] = useInView(0.1);
  const [quickRef, quickInView] = useInView(0.1);
  const [ppaRef, ppaInView] = useInView(0.1);

  const banner = banners[currentBanner];
  const hasBanners = banners.length > 0;
  const pct = (v, d = 1) => (Number(v) > 0 ? `${Number(v).toFixed(d)}%` : '—');
  const hrBar = (n, color) => ({ '--fill': `${computed.totalPersonnel ? (n / computed.totalPersonnel) * 100 : 0}%`, '--color': color });
  const navBtn = { background: '#fff', color: C.ink, border: `1px solid ${C.line}` };
  const mediaBase = enter(2);

  return (
    <div className="homepage" style={{ background: C.cream, color: C.ink }}>
      <HomeFx />
      <ScrollTop />

      {/* ══ HERO — the header's legal pad continues here: ruled paper,
          red margin, and the slideshow as a taped polaroid ══ */}
      <section className="hero-split" style={{ ...paperBg, position: 'relative', overflow: 'hidden' }}
        onMouseEnter={() => banners.length > 1 && setAutoplay(false)}
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}>
        <span aria-hidden="true" className="hp-blob" style={{ top: -120, right: isDesk ? '-4%' : -140, width: 420, height: 420, background: 'radial-gradient(circle at 35% 35%, rgba(232,185,35,.5), rgba(232,185,35,0) 70%)' }} />
        <span aria-hidden="true" className="hp-blob" style={{ bottom: -170, left: isDesk ? '26%' : -120, width: 360, height: 360, background: 'radial-gradient(circle at 50% 50%, rgba(196,30,36,.16), rgba(196,30,36,0) 70%)', animationDelay: '-6s' }} />

        <div className="hero-panel" style={{ position: 'relative', background: 'transparent', color: C.ink, paddingLeft: isDesk ? 96 : 40 }}>
          <span aria-hidden="true" style={{
            position: 'absolute', top: 0, bottom: 0, left: isDesk ? 48 : 16, width: 5, boxSizing: 'border-box',
            borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none',
          }} />
          {/* "Public Elementary School", "DepEd Recognized" and the school year already live in the header,
              so the hero keeps only what is new: enrollment status. */}
          {s.enrollment_status && (
            <div className="hero-badge-row" style={enter(0)}>
              <span className="hero-badge-pill" style={{ ...marker, display: 'inline-block', padding: '0.25em 0.8em' }}>
                {s.enrollment_status === 'Open' ? 'Enrollment is open' : `Enrollment ${String(s.enrollment_status).toLowerCase()}`}
              </span>
            </div>
          )}
          <h2 className="hero-headline" style={{ color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95, textShadow: 'none', margin: '0 0 20px', ...enter(1) }}>
            <span style={{ display: 'block', fontSize: 'clamp(3.2rem, 8vw, 6rem)' }}><HeroWord text="Bacao" /></span>{' '}
            <span style={{ display: 'block', fontSize: 'clamp(1.5rem, 3.2vw, 2.4rem)', letterSpacing: '-0.025em', marginTop: 8 }}>Elementary School</span>
          </h2>
          <p className="hero-tagline" style={{ color: C.muted, fontSize: '1.1rem', maxWidth: '46ch', ...enter(2) }}>Guiding every learner toward academic excellence, character, and community — one school year at a time.</p>
          <div className="hero-panel-actions" style={enter(3)}>
            <Link to="/admissions" className="btn btn-primary" style={{ background: CH.red, borderColor: CH.red, color: '#fff', boxShadow: '0 6px 14px rgba(94, 11, 16, 0.25)' }}>
              <span>Enroll Now</span><ArrowRightIcon className="btn-icon" />
            </Link>
            <button type="button" className="btn btn-outline-light" onClick={() => scrollTo('overview')}
              style={{ background: 'transparent', color: C.ink, border: `2px solid ${CH.deep}` }}>View Dashboard</button>
          </div>
        </div>

        <div className="hero-media" ref={mediaRef} style={{ ...mediaBase,
          transition: `${mediaBase.transition}, translate 0.6s cubic-bezier(.2,.7,.2,1), rotate 0.6s cubic-bezier(.2,.7,.2,1)`,
          rotate: isDesk ? '1.2deg' : '0deg',
          position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
          border: '10px solid #fff', borderRadius: 4, background: '#FBE3E3',
          boxShadow: '0 22px 44px rgba(94, 11, 16, 0.24), 0 2px 6px rgba(94, 11, 16, 0.1)',
          margin: isDesk ? 28 : '16px 16px 24px',
        }}>
          {bannersLoading ? <div className="hero-skeleton" /> : hasBanners && banner ? (
            <>
              <div className="hero-slide-track" style={{ overflow: 'hidden' }}>
                {banners.map((b, i) => (
                  <div key={b.id ?? i} className={`hero-slide${i === currentBanner ? ' active' : ''}`}>
                    <img src={getImageUrl(b.image_url)} alt={b.title || ''} className="hero-slide-img" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div className="hero-slide-overlay" style={{ background: 'linear-gradient(to top, rgba(94, 11, 16, 0.3), transparent 45%)' }} />
                  </div>
                ))}
              </div>
              {banners.length > 1 && (<>
                <button type="button" className="hero-nav hero-nav-prev" onClick={prevBanner} aria-label="Previous slide" style={navBtn}><ChevronLeftIcon /></button>
                <button type="button" className="hero-nav hero-nav-next" onClick={nextBanner} aria-label="Next slide" style={navBtn}><ChevronRightIcon /></button>
                <div className="hero-controls">
                  <button type="button" className="hero-toggle" onClick={() => setAutoplay((a) => !a)} aria-label={autoplay ? 'Pause slideshow' : 'Play slideshow'} style={navBtn}>
                    {autoplay ? <PauseIcon className="hero-toggle-icon" /> : <PlayIcon className="hero-toggle-icon" />}
                  </button>
                  <div className="hero-dots">
                    {banners.map((_, i) => (
                      <button type="button" key={i} aria-label={`Go to slide ${i + 1}`} className={`hero-dot${i === currentBanner ? ' active' : ''}`} onClick={() => goToBanner(i)}
                        style={{ background: i === currentBanner ? '#E8B923' : 'rgba(255,255,255,0.65)' }} />
                    ))}
                  </div>
                </div>
              </>)}
            </>
          ) : (
            <div className="hero-fallback-media"><div className="hero-fallback-pattern" /></div>
          )}

          <span className="hp-hero-ribbon" aria-hidden="true">BES • {s.active_school_year || 'School Year'}</span>

          {/* Live learners chip, pinned like a sticker on the photo */}
          {isDesk && Number(s.enrollment_count) > 0 && (
            <div className="hp-chip" style={{
              position: 'absolute', left: 16, top: 16, zIndex: 3, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px 10px 12px',
              background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(6px)', borderRadius: 12,
              border: `1px solid ${C.line}`, boxShadow: '0 12px 26px rgba(94, 11, 16, 0.22)',
            }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 10, background: C.paper, color: CH.red }}><UsersIcon style={{ width: 20, height: 20 }} /></span>
              <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{heroLearners.toLocaleString()}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.muted }}>learners enrolled</span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ══ DASHBOARD NAV — ruled tab strip with the crimson top edge ══ */}
      <nav className="dash-nav-bar" aria-label="Dashboard sections" style={{ background: '#fff', borderTop: `3px solid ${CH.red}`, borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.08)' }}>
        <div className="container">
          <div className="dash-nav-row">
            <div className="dash-nav-inner" style={{ WebkitMaskImage: 'none', maskImage: 'none' }}>
              <span className="dash-nav-label" style={{ color: C.deep, fontWeight: 800, textTransform: 'none', letterSpacing: 0 }}>Dashboard</span>
              {DASH_SECTIONS.map((t) => {
                const on = activeSection === t.id;
                return (
                  <button key={t.id} type="button" className={`dash-nav-btn${on ? ' hp-active' : ''}`} onClick={() => scrollTo(t.id)}
                    aria-current={on ? 'true' : undefined} style={on ? undefined : { color: C.ink }}>{t.label}</button>
                );
              })}
            </div>
            <div className="dash-nav-right">
              {lastUpdated && <span className="dash-updated" style={{ color: C.muted }}>Updated {fmtDate(lastUpdated)}</span>}
              <VisitorPulse stats={visitorStats} refreshing={vcRefreshing} />
            </div>
          </div>
        </div>
      </nav>

      {/* ══ 01. OVERVIEW ══ */}
      <section id="overview" className="section dash-section" ref={overviewRef} style={secStyle(false)}>
        <div className="container">
          <SectionHeader num="01" eyebrow="At a glance" title="School Overview"
            sub="Key statistics and indicators for the current school year."
            inView={overviewInView}
            aside={<span className="dash-live-badge" style={pill}><span className="dash-live-dot" style={{ background: CH.red }} />Live Data</span>}
          />

          {loadingDash ? <Skeleton /> : (
            <div className={`reveal${overviewInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.15s' }}>
              <EnrollmentBand s={s} start={overviewInView} isDesk={isDesk} sections={computed.totalSections} classrooms={computed.totalClassrooms} />

              <div className="stat-card-grid">
                <KpiCard icon={ActivityIcon} label="Avg Students / Section" value={computed.avgSection} accent="blue2" start={overviewInView} />
                <KpiCard icon={AwardIcon} label="Performance Indicator" value={s.performance_indicator || '—'} accent="purple" start={overviewInView} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ 02. ACCESS ══ */}
      <section id="access" className="section dash-section dash-section-alt" ref={accessRef} style={secStyle(true)}>
        <div className="container">
          <SectionHeader num="02" eyebrow="Enrollment & participation" title="Access"
            sub="Enrollment breakdown by grade level, gender distribution, and transition rates."
            inView={accessInView} />

          <div className={`dash-grid-2 reveal${accessInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="dash-card" style={panel}>
              <div className="dash-card-header">
                <div className="dash-card-title" style={{ color: C.ink }}><CalendarIcon className="dash-card-icon" style={{ color: CH.red }} /><span>Sections & Classrooms by Grade</span></div>
              </div>
              {gradeChartData.length > 0 ? (
                <HBarChart data={gradeChartData} animate={accessInView} keys={['sections', 'classrooms']} colors={[CH.red, CH.gold]} labels={['Sections', 'Classrooms']} />
              ) : <div className="chart-empty">No grade data available</div>}
            </div>

            <div className="dash-card" style={panel}>
              <div className="dash-card-header">
                <div className="dash-card-title" style={{ color: C.ink }}><PieChartIcon className="dash-card-icon" style={{ color: CH.red }} /><span>Gender Distribution</span></div>
              </div>
              <div className="donut-center-layout">
                <DonutChart data={genderDonut} />
                <DonutLegend data={genderDonut} empty="No gender data" />
              </div>
            </div>
          </div>

          <div className={`rate-cards reveal${accessInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.25s' }}>
            {[
              { I: TrendingUpIcon, color: CH.deep, v: s.retention_rate, l: 'Retention Rate' },
              { I: ActivityIcon, color: CH.red, v: s.dropout_rate, l: 'Dropout Rate' },
              { I: SchoolIcon, color: C.goldText, v: s.transition_completion_rate, l: 'Completion Rate' },
            ].map(({ I, color, v, l }) => (
              <div key={l} className="rate-card" style={card}>
                <I className="rate-icon" style={{ color }} />
                <div className="rate-val" style={{ color }}>{pct(v)}</div>
                <div className="rate-label" style={{ color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 03. QUALITY ══ */}
      <section id="quality" className="section dash-section" ref={qualityRef} style={secStyle(false)}>
        <div className="container">
          <SectionHeader num="03" eyebrow="Academic performance" title="Quality"
            sub="Proficiency levels across key learning areas and literacy indicators."
            inView={qualityInView} />

          <div className={`reveal${qualityInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="quality-grid">
              <div className="dash-card quality-card-main" style={panel}>
                <div className="dash-card-header">
                  <div className="dash-card-title" style={{ color: C.ink }}><BarChartIcon className="dash-card-icon" style={{ color: CH.red }} /><span>Proficiency Overview</span></div>
                </div>
                <div className="quality-bars">
                  <ProgressBar label="Overall Proficiency" value={Number(s.overall_proficiency) || 0} color={CH.red} animate={qualityInView} />
                  <ProgressBar label="English Independent Readers" value={Number(s.english_readers) || 0} color={CH.deep} animate={qualityInView} />
                  <ProgressBar label="Filipino Independent Readers" value={Number(s.filipino_readers) || 0} color={CH.gold} animate={qualityInView} />
                  <ProgressBar label="Math Numeracy" value={Number(s.math_numeracy) || 0} color={CH.rose} animate={qualityInView} />
                  <ProgressBar label="Science Literacy" value={Number(s.science_literacy) || 0} color={CH.tan} animate={qualityInView} />
                </div>
              </div>
              <div className="quality-gauges">
                {[
                  { label: 'Overall', value: Number(s.overall_proficiency) || 0, color: CH.red },
                  { label: 'English', value: Number(s.english_readers) || 0, color: CH.deep },
                  { label: 'Math', value: Number(s.math_numeracy) || 0, color: CH.gold },
                ].map((g) => (
                  <div key={g.label} className="gauge-card" style={card}>
                    <GaugeChart value={g.value} color={g.color} label={g.label} animate={qualityInView} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 04. EQUITY ══ */}
      <section id="equity" className="section dash-section dash-section-alt" ref={equityRef} style={secStyle(true)}>
        <div className="container">
          <SectionHeader num="04" eyebrow="Inclusive education" title="Equity"
            sub="Data on learners with special needs, disadvantaged backgrounds, and gender parity."
            inView={equityInView} />

          <div className={`equity-grid reveal${equityInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <KpiCard icon={HeartIcon} label="Learners with Disabilities" value={Number(s.learners_with_disabilities) || 0} accent="blue" start={equityInView} />
            <KpiCard icon={ShieldIcon} label="Disadvantaged Learners" value={Number(s.disadvantaged_learners) || 0} accent="purple" start={equityInView} />
            <div className="dash-card equity-gender-card" style={card}>
              <div className="dash-card-header">
                <div className="dash-card-title" style={{ color: C.ink }}><PieChartIcon className="dash-card-icon" style={{ color: CH.red }} /><span>Gender Parity</span></div>
              </div>
              <ParityBar data={genderDonut} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 05. WELL-BEING ══ */}
      <section id="wellbeing" className="section dash-section" ref={wellRef} style={secStyle(false)}>
        <div className="container">
          <SectionHeader num="05" eyebrow="Student wellness" title="Well-Being"
            sub="BMI status, health assessments, and child protection case monitoring."
            inView={wellInView} />

          <div className={`reveal${wellInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="wellbeing-grid">
              <div className="dash-card" style={panel}>
                <div className="dash-card-header">
                  <div className="dash-card-title" style={{ color: C.ink }}><HeartIcon className="dash-card-icon" style={{ color: CH.red }} /><span>BMI Status Distribution</span></div>
                </div>
                <div className="donut-center-layout">
                  <DonutChart data={bmiDonut} />
                  <DonutLegend data={bmiDonut} empty="No BMI data" />
                </div>
              </div>
              <div className="wellbeing-kpis">
                {[
                  { cls: 'wb-green', I: HeartIcon, n: Number(s.bmi_normal) || 0, l: 'Normal BMI' },
                  { cls: 'wb-yellow', I: AlertCircleIcon, n: (Number(s.bmi_overweight) || 0) + (Number(s.bmi_obese) || 0), l: 'Overweight / Obese' },
                  { cls: 'wb-purple', I: ActivityIcon, n: Number(s.bmi_wasted) || 0, l: 'Wasted' },
                  { cls: 'wb-blue', I: CheckCircleIcon, n: Number(s.health_assessment_done) || 0, l: 'Health Assessed' },
                  { cls: 'wb-red', I: ShieldIcon, n: Number(s.child_protection_cases) || 0, l: 'Child Protection Cases' },
                ].map(({ cls, I, n, l }) => (
                  <div key={l} className={`wb-kpi-card ${cls}`} style={card}>
                    <I className="wb-icon" style={{ color: CH.red }} />
                    <div className="wb-num" style={{ color: C.ink }}>{n}</div>
                    <div className="wb-label" style={{ color: C.muted }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 06. HUMAN RESOURCE ══ */}
      <section id="hr" className="section dash-section dash-section-alt" ref={hrRef} style={secStyle(true)}>
        <div className="container">
          <SectionHeader num="06" eyebrow="Personnel overview" title="Human Resource"
            sub="Teaching, non-teaching, and administrative staff distribution and vacancies."
            inView={hrInView} />

          <div className={`reveal${hrInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="hr-grid">
              <div className="dash-card" style={panel}>
                <div className="dash-card-header">
                  <div className="dash-card-title" style={{ color: C.ink }}><PieChartIcon className="dash-card-icon" style={{ color: CH.red }} /><span>Personnel Mix</span></div>
                </div>
                <div className="donut-center-layout">
                  <DonutChart data={personnelDonut} />
                  <DonutLegend data={personnelDonut} empty="No personnel data" />
                </div>
              </div>
              <div className="hr-kpis">
                {[
                  { I: UserCheckIcon, n: computed.totalTeaching, l: 'Teaching Personnel', color: CH.red },
                  { I: BuildingIcon, n: computed.totalNonTeaching, l: 'Non-Teaching Personnel', color: CH.deep },
                  { I: ClipboardIcon, n: computed.totalAdmin, l: 'Administrative Staff', color: CH.gold },
                ].map(({ I, n, l, color }) => (
                  <div key={l} className="hr-kpi-row" style={card}>
                    <I className="hr-kpi-icon" style={{ color }} />
                    <div>
                      <div className="hr-kpi-num" style={{ color: C.ink }}>{n}</div>
                      <div className="hr-kpi-label" style={{ color: C.muted }}>{l}</div>
                    </div>
                    <div className="hr-kpi-bar" style={hrBar(n, color)} />
                  </div>
                ))}
                <div className="hr-kpi-row hr-kpi-row-vacant" style={card}>
                  <AlertCircleIcon className="hr-kpi-icon" style={{ color: CH.red }} />
                  <div>
                    <div className="hr-kpi-num" style={{ color: C.ink }}>{Number(s.vacant_positions) || 0}</div>
                    <div className="hr-kpi-label" style={{ color: C.muted }}>Vacant Positions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 07. GOVERNANCE ══ */}
      <section id="governance" className="section dash-section" ref={govRef} style={secStyle(false)}>
        <div className="container">
          <SectionHeader num="07" eyebrow="School management" title="Governance & Infrastructure"
            sub="SBM level, performance ratings, facility ratios, and resource availability."
            inView={govInView} />

          <div className={`gov-grid reveal${govInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            {[
              { I: AwardIcon, color: CH.red, v: s.sbm_level || '—', l: 'SBM Level' },
              { I: TrendingUpIcon, color: CH.deep, v: pct(s.opcrf_rating, 2), l: 'OPCRF Rating' },
              { I: SchoolIcon, color: C.goldText, v: s.classroom_ratio || '—', l: 'Classroom Ratio' },
              { I: UserCheckIcon, color: CH.red, v: s.teacher_ratio || '—', l: 'Teacher Ratio' },
              { I: BookOpenIcon, color: CH.deep, v: s.seat_ratio || '—', l: 'Seat Ratio' },
              { I: ZapIcon, color: CH.rose, v: s.internet_speed || '—', l: 'Internet Speed' },
            ].map(({ I, color, v, l }) => (
              <div key={l} className="gov-kpi-card" style={card}>
                <I className="gov-kpi-icon" style={{ color }} />
                <div className="gov-kpi-num" style={{ color: C.ink }}>{v}</div>
                <div className="gov-kpi-label" style={{ color: C.muted }}>{l}</div>
              </div>
            ))}
            <div className="gov-kpi-card gov-kpi-wide" style={card}>
              <BuildingIcon className="gov-kpi-icon" style={{ color: CH.rose }} />
              <div>
                <div className="gov-kpi-num" style={{ color: C.ink }}>
                  {Number(s.functional_facilities_count) || 0}
                  {Number(s.total_facilities_count) > 0 && <span className="gov-kpi-of"> / {Number(s.total_facilities_count)}</span>}
                </div>
                <div className="gov-kpi-label" style={{ color: C.muted }}>Functional Facilities</div>
                {Number(s.total_facilities_count) > 0 && (
                  <div className="gov-fac-bar">
                    <div className="gov-fac-fill" style={{ width: `${(Number(s.functional_facilities_count) / Number(s.total_facilities_count)) * 100}%`, background: CH.red }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 08. ACCOUNTABILITY ══ */}
      <section id="accountability" className="section dash-section dash-section-alt" ref={accRef} style={secStyle(true)}>
        <div className="container">
          <SectionHeader num="08" eyebrow="Compliance monitoring" title="Agency Accountabilities"
            sub="Status of transparency, accountability, and digitalization requirements."
            inView={accInView}
            aside={
              <div className="acc-summary-badge" style={pill}>
                <CheckCircleIcon style={{ width: 14, height: 14, color: CH.red }} />
                <span>{computed.accCompleted} / {computed.accTotal} Completed</span>
              </div>
            }
          />
          <div className={`acc-grid reveal${accInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            {Object.entries(ACCOUNTABILITY_LABELS).map(([key, label]) => (
              <div key={key} className="acc-card" style={card}>
                <div className="acc-card-label" style={{ color: C.ink }}>{label}</div>
                <StatusBadge status={s[key] || 'Pending'} />
              </div>
            ))}
            <div className="acc-card acc-card-digitalization" style={card}>
              <div className="acc-card-label" style={{ color: C.ink }}>Digitalization Status</div>
              <StatusBadge status={s.digitalization_status || 'In Progress'} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ QUICK ACCESS — no stylesheet classes, so no CSS rule can darken it ══ */}
      <section id="access-nav" ref={quickRef} style={{ background: C.cream, padding: isDesk ? '88px 0' : '56px 0' }}>
        <div className="container">
          <SectionHeader num="09" eyebrow="Explore" title="Quick Access"
            sub="Jump directly to the most visited sections of our portal."
            inView={quickInView} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {QUICK_LINKS.map((l, i) => (
              <div key={l.label} className={`reveal${quickInView ? ' in-view' : ''}`} style={{ transitionDelay: `${i * 70}ms` }}>
                <QuickCard {...l} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LATEST PPAs ══ */}
      {ppas.length > 0 && (
        <section className="section ppa-section" ref={ppaRef} style={secStyle(true)}>
          <div className="container">
            <SectionHeader num="10" eyebrow="Programs & activities" title="Latest PPAs"
              sub="Recent programs, projects, and activities."
              inView={ppaInView}
              aside={<Link to="/ppas" className="view-all-link" style={{ color: CH.red, fontWeight: 700 }}><span>View all</span> <ArrowRightIcon className="view-all-icon" /></Link>} />
            <div className={`feature-grid reveal${ppaInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.15s' }}>
              {ppas.map((p, i) => (
                <Link key={p.id} to="/ppas" className={`ppa-card${i === 0 ? ' ppa-card-feature' : ''}`} style={i === 0 ? cardTop : card}>
                  {p.image_url && (
                    <div className="ppa-image-wrap">
                      <img src={getImageUrl(p.image_url)} alt={p.name} className="ppa-image" onError={(e) => { e.target.parentNode.style.display = 'none'; }} />
                      <div className="ppa-image-overlay" />
                      {p.frequency && <span className="ppa-image-tag" style={{ ...pill, fontSize: '0.75rem' }}>{p.frequency}</span>}
                    </div>
                  )}
                  <div className="ppa-body">
                    <p className="ppa-name" style={{ color: C.ink }}>{p.name}</p>
                    {p.short_description && <p style={{ fontSize: '0.85rem', color: C.muted, lineHeight: 1.6 }}>{p.short_description}</p>}
                    <span className="ppa-link" style={{ color: CH.red }}>Learn more <ArrowRightIcon className="ppa-link-icon" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
