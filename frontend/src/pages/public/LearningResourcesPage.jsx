import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBook, IconAbc, IconRuler, IconLibrary, IconFileText, IconDownload } from '../../components/Icons';

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

function TabBar({ items, active, onSelect, label = 'Page sections' }) {
  return (
    <nav aria-label={label} style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
      <div className="container" style={{ maxWidth: 960, display: 'flex', gap: 4, overflowX: 'auto', padding: '0 16px' }}>
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} type="button" onClick={() => onSelect(it.id)} aria-current={on ? 'true' : undefined}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
              {it.Icon && <it.Icon size={16} />}{it.num && <span style={{ color: C.red, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{it.num}</span>}{it.label}{!!it.count && <span style={{ padding: '1px 8px', borderRadius: 999, background: on ? C.tint : C.cream, color: C.red, fontSize: 12, fontWeight: 800 }}>{it.count}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const CATS = [
  { key: 'ARAL', label: 'ARAL Program', Icon: IconBook },
  { key: 'KS1', label: 'Key Stage 1', Icon: IconAbc },
  { key: 'KS2', label: 'Key Stage 2', Icon: IconRuler },
  { key: 'Supplementary', label: 'Supplementary', Icon: IconLibrary },
];

export default function LearningResourcesPage() {
  const wide = useWide();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ARAL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/resources').then((r) => setResources(r.data)).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = {};
    CATS.forEach((cat) => { c[cat.key] = 0; });
    resources.forEach((r) => { if (c[r.category] !== undefined) c[r.category] += 1; });
    return c;
  }, [resources]);

  const activeCat = CATS.find((c) => c.key === activeTab);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (r.category !== activeTab) return false;
      if (!q) return true;
      return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    });
  }, [resources, activeTab, query]);

  const ticket = (
    <Ticket wide={wide} Icon={IconLibrary} ariaLabel="Learning resources at a glance" label="Resources available"
      value={loading ? '…' : resources.length} note="Download and print at home"
      rows={CATS.map((c) => ({ Icon: c.Icon, label: c.label, value: loading ? '…' : counts[c.key] }))} />
  );

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <style>{BTN_CSS}</style>
      <Hero wide={wide} eyebrow="Learning Resources" title="Free materials for every learner."
        subtitle="ARAL program materials, Key Stage resources, and supplementary learning materials." aside={ticket} />

      <TabBar label="Resource category" active={activeTab} onSelect={(k) => { setActiveTab(k); setQuery(''); }}
        items={CATS.map((c) => ({ id: c.key, label: c.label, Icon: c.Icon, count: loading ? undefined : counts[c.key] }))} />

      <main className="container" style={{ ...mainBox(wide), paddingTop: wide ? 40 : 28 }}>
        {!loading && resources.length > 0 && (
          <SearchBox value={query} onChange={setQuery} label="Search resources" placeholder={`Search ${activeCat.label}…`} style={{ maxWidth: 360 }} />
        )}

        {loading ? (
          <SkeletonGrid min={280} count={6} height={170} />
        ) : resources.length === 0 ? (
          <EmptyState Icon={IconLibrary} title="No resources have been posted yet.">Check back soon.</EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState Icon={activeCat.Icon} title={query ? 'No matches.' : 'Nothing here yet.'}>
            {query ? `No ${activeCat.label} resources match “${query}”. Try a different keyword.` : 'No resources in this category yet. Check back soon.'}
          </EmptyState>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {filtered.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i, 6) * 60}>
                <article className="bes-lift" style={{ ...card, padding: '22px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10, borderTop: `4px solid ${r.file_url ? C.red : C.line}` }}>
                  <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red }}><IconFileText size={20} /></span>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.02rem', letterSpacing: '-0.02em', lineHeight: 1.35 }}>{r.title}</h3>
                  {r.description && <p style={{ margin: 0, color: C.muted, fontSize: 14.5, lineHeight: 1.6 }}>{r.description}</p>}
                  <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                    {r.file_url ? (
                      <a href={getImageUrl(r.file_url)} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-primary bes-btn-sm"><IconDownload size={14} /> Download</a>
                    ) : <Chip>Uploading soon</Chip>}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
