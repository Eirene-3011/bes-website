import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconLayers, IconUsers, IconUser, IconBook } from '../../components/Icons';

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

// Highlights the section in view; returns [activeId, scrollTo]
function useScrollSpy(ids, enabled = true) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    if (!enabled || !ids.length) return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  const scrollTo = (id) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  return [active, scrollTo];
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

function FilterChip({ on, onClick, children, count }) {
  return (
    <button type="button" className="bes-filter" aria-pressed={on} onClick={onClick}>
      {children}
      {count !== undefined && <span className="bes-count">{count}</span>}
    </button>
  );
}

function SearchBox({ value, onChange, placeholder, label }) {
  return (
    <label className="bes-search" style={{ marginBottom: 18 }}>
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
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 8, padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
              {it.num && <span style={{ color: C.red, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{it.num}</span>}{it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23FBE3E3"/><circle cx="40" cy="30" r="16" fill="%23C98A8D"/><ellipse cx="40" cy="62" rx="24" ry="16" fill="%23C98A8D"/></svg>';

function Avatar({ src, name, size = 72, ring = true }) {
  const style = { width: size, height: size, borderRadius: '50%', flex: 'none', objectFit: 'cover', background: C.tint, border: ring ? '3px solid #fff' : 'none', boxShadow: ring ? `0 0 0 1px ${C.line}` : 'none' };
  return src
    ? <img src={src} alt={name} style={style} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_AVATAR; }} />
    : <span aria-hidden="true" style={{ ...style, display: 'grid', placeItems: 'center', color: C.red }}><IconUser size={size * 0.45} /></span>;
}

/* ─── Lightbox: items = [{ src, alt, caption? }] ─── */
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
        style={{ maxWidth: '92vw', maxHeight: '76vh', objectFit: 'contain', borderRadius: 12, background: '#fff', boxShadow: '0 30px 90px rgba(0,0,0,.65)', cursor: 'default', animation: 'bes-pop .25s ease-out' }} />
      <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', color: '#fff', cursor: 'default', maxWidth: '70ch' }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{item.alt}</p>
        {item.caption && <p style={{ margin: '4px 0 0', fontSize: '.9rem', color: 'rgba(255,255,255,.75)' }}>{item.caption}</p>}
        {many && <p style={{ margin: '8px 0 0', fontSize: '.8rem', color: 'rgba(255,255,255,.6)' }}>{index + 1} / {items.length}</p>}
      </div>
    </div>
  );
}

const GRADE_LEVELS = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'SPED', 'Non-Teaching'];

function LeaderCard({ role, name, position, photo, onOpen }) {
  return (
    <button type="button" className="bes-lift" onClick={onOpen} aria-label={`View profile for ${name}`}
      style={{ ...card, display: 'flex', alignItems: 'center', gap: 20, padding: '22px 24px', textAlign: 'left', cursor: 'pointer', font: 'inherit', borderLeft: `4px solid ${C.gold}`, width: '100%' }}>
      <Avatar size={80} name={name} src={photo ? getImageUrl(photo) : null} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.red }}>{role}</span>
        <span style={{ display: 'block', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', margin: '2px 0' }}>{name}</span>
        {position && <span style={{ display: 'block', fontSize: 14, color: C.muted }}>{position}</span>}
      </span>
    </button>
  );
}

export default function OrgStructurePage() {
  const wide = useWide();
  const [orgChart, setOrgChart] = useState(null);
  const [staff, setStaff] = useState([]);
  const [info, setInfo] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [chartFailed, setChartFailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/org-chart'),
      api.get('/staff'),
      api.get('/school-info'),
      api.get('/officials').catch(() => ({ data: [] })),
    ]).then(([o, s, i, off]) => {
      setOrgChart(o.data);
      setStaff(s.data);
      setInfo(i.data);
      setOfficials(off.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // School Head & Admin Officer come from the officials table (that is where photo_url lives)
  const schoolHead = officials.find((o) => o.full_name === info?.principal_name)
    || officials.find((o) => o.position && o.position.toLowerCase().includes('principal'));
  const adminOfficer = officials.find((o) => o.position && o.position.toLowerCase().includes('administrative officer'));
  const fromOfficial = (o) => ({ full_name: o.full_name, position_subject: o.position, section_name: o.department_office, photo_url: o.photo_url });
  const leaders = [
    info?.principal_name && {
      role: 'School Head', name: info.principal_name, position: info.principal_title, photo: schoolHead?.photo_url,
      profile: schoolHead ? fromOfficial(schoolHead) : { full_name: info.principal_name, position_subject: info.principal_title },
    },
    adminOfficer && { role: 'Admin Officer', name: adminOfficer.full_name, position: adminOfficer.position, photo: adminOfficer.photo_url, profile: fromOfficial(adminOfficer) },
  ].filter(Boolean);

  // Profile modal: Escape closes, background scroll locked, focus moves to the close button
  const onKey = useCallback((e) => { if (e.key === 'Escape') setSelected(null); }, []);
  useEffect(() => {
    if (!selected) return undefined;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const d = dialogRef.current;
    if (d) {
      d.style.setProperty('background', '#FFFFFF', 'important');
      d.style.setProperty('color', '#5E0B10', 'important');
      d.style.setProperty('color-scheme', 'light');
    }
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [selected, onKey]);

  // Group by grade level, then apply the search
  const grouped = {};
  GRADE_LEVELS.forEach((gl) => { const m = staff.filter((x) => x.department_grade_level === gl); if (m.length) grouped[gl] = m; });
  [...new Set(staff.map((m) => m.department_grade_level).filter((k) => k && !GRADE_LEVELS.includes(k)))]
    .forEach((k) => { grouped[k] = staff.filter((m) => m.department_grade_level === k); });
  const groupKeys = Object.keys(grouped);
  const needle = query.trim().toLowerCase();
  const matches = (m) => !needle || `${m.full_name} ${m.position_subject || ''} ${m.section_name || ''}`.toLowerCase().includes(needle);
  const visibleKeys = (filter === 'All' ? groupKeys : groupKeys.filter((k) => k === filter)).filter((k) => grouped[k].some(matches));

  const chartItems = orgChart?.image_url && !chartFailed ? [{ src: getImageUrl(orgChart.image_url), alt: 'BES organizational chart' }] : [];
  const tabs = [
    { id: 'chart', label: 'Org chart' },
    ...(leaders.length ? [{ id: 'leaders', label: 'School leaders' }] : []),
    { id: 'directory', label: 'Faculty & staff' },
  ];
  const [active, go] = useScrollSpy(tabs.map((t) => t.id), !loading);

  const ticket = (
    <Ticket wide={wide} Icon={IconUsers} ariaLabel="Faculty and staff at a glance"
      label="Faculty and staff listed"
      value={loading ? '…' : staff.length > 0 ? staff.length : 'Being updated'}
      rows={!loading ? [
        info?.principal_name && { Icon: IconUser, label: 'School head', value: info.principal_name },
        groupKeys.length > 0 && { Icon: IconBook, label: 'Grade levels and units', value: groupKeys.length },
      ].filter(Boolean) : []} />
  );

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <Hero wide={wide} eyebrow="Organizational Structure" title="Who leads and teaches at BES."
        subtitle="School governance, the org chart, and our faculty and staff." aside={ticket} />

      {!loading && <TabBar items={tabs} active={active} onSelect={go} label="Page sections" />}

      <main className="container" style={mainBox(wide)}>
        {loading ? (
          <div style={{ paddingTop: 40 }}><SkeletonGrid min={300} count={2} height={220} /></div>
        ) : (
          <>
            <section id="chart" style={sectionPad(wide)}>
              <Reveal>
                <SectionHead Icon={IconLayers} title="Org chart" note={chartItems.length ? 'Select the chart to enlarge it.' : undefined} />
                {chartItems.length ? (
                  <div style={{ ...card, overflow: 'hidden' }}>
                    <button type="button" className="bes-zoom" onClick={() => setZoom(true)} aria-label="Enlarge the organizational chart">
                      <img src={chartItems[0].src} alt={chartItems[0].alt} onError={() => setChartFailed(true)} style={{ width: '100%', height: 'auto', display: 'block' }} />
                      <span className="bes-hint" style={{ position: 'absolute', right: 12, bottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(94, 11, 16, 0.85)', color: '#fff', fontSize: 12.5, fontWeight: 700 }}>Enlarge</span>
                    </button>
                  </div>
                ) : (
                  <EmptyState Icon={IconLayers} title="The org chart has not been uploaded yet.">Check back soon.</EmptyState>
                )}
              </Reveal>
            </section>

            {leaders.length > 0 && (
              <section id="leaders" style={sectionPad(wide)}>
                <Reveal>
                  <SectionHead Icon={IconUser} title="School leaders" note="Select a card to see their profile." />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
                    {leaders.map((l) => <LeaderCard key={l.role} {...l} onOpen={() => setSelected(l.profile)} />)}
                  </div>
                </Reveal>
              </section>
            )}

            <section id="directory" style={sectionPad(wide)}>
              <SectionHead Icon={IconUsers} title="Faculty & staff" note="Teaching and non-teaching personnel, grouped by grade level." />
              {staff.length === 0 ? (
                <EmptyState Icon={IconUsers} title="The faculty and staff directory is being updated.">Check back soon.</EmptyState>
              ) : (
                <>
                  <SearchBox value={query} onChange={setQuery} label="Search faculty and staff" placeholder="Search by name, position or section" />
                  {groupKeys.length > 1 && (
                    <div role="group" aria-label="Filter by grade level" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                      <FilterChip on={filter === 'All'} onClick={() => setFilter('All')} count={staff.length}>All</FilterChip>
                      {groupKeys.map((k) => <FilterChip key={k} on={filter === k} onClick={() => setFilter(k)} count={grouped[k].length}>{k}</FilterChip>)}
                    </div>
                  )}

                  {visibleKeys.length === 0 ? (
                    <EmptyState Icon={IconUsers} title={`No one matches "${query}".`}>Try a shorter word, or clear the search.</EmptyState>
                  ) : visibleKeys.map((k) => {
                    const list = grouped[k].filter(matches);
                    return (
                      <Reveal key={k} style={{ marginBottom: 36 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14, paddingLeft: 12, borderLeft: `5px double ${C.margin}` }}>
                          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{k}</h3>
                          <span style={{ fontSize: 13, color: C.muted }}>{list.length} {list.length === 1 ? 'member' : 'members'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                          {list.map((m) => (
                            <button key={m.id} type="button" className="bes-lift" onClick={() => setSelected(m)} aria-label={`View profile for ${m.full_name}`}
                              style={{ ...card, padding: '22px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', cursor: 'pointer', font: 'inherit' }}>
                              <Avatar size={88} name={m.full_name} src={m.photo_url ? getImageUrl(m.photo_url) : null} />
                              <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>{m.full_name}</span>
                              {m.position_subject && <span style={{ fontSize: 13, color: C.red, fontWeight: 600 }}>{m.position_subject}</span>}
                              {m.section_name && <span style={{ fontSize: 12.5, color: C.muted }}>{m.section_name}</span>}
                            </button>
                          ))}
                        </div>
                      </Reveal>
                    );
                  })}
                </>
              )}
            </section>
          </>
        )}
      </main>

      {zoom && chartItems.length > 0 && <Lightbox items={chartItems} index={0} onIndex={() => {}} onClose={() => setZoom(false)} />}

      {/* Profile modal */}
      {selected && (
        <div onClick={() => setSelected(null)} role="presentation"
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(94, 11, 16, 0.55)', animation: 'bes-fade .2s ease-out' }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${selected.full_name} profile`} onClick={(e) => e.stopPropagation()}
            style={{ ...card, backgroundColor: '#FFFFFF', position: 'relative', width: '100%', maxWidth: 400, overflow: 'hidden', textAlign: 'center', boxShadow: '0 30px 60px rgba(94, 11, 16, 0.35)', animation: 'bes-pop .25s ease-out' }}>
            <div style={{ height: 96, background: GRAD }} />
            <button ref={closeRef} type="button" onClick={() => setSelected(null)} aria-label="Close profile"
              style={{ position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 24, lineHeight: 1 }}>
              &times;
            </button>
            <div style={{ marginTop: -56, display: 'flex', justifyContent: 'center' }}>
              <Avatar size={112} name={selected.full_name} src={selected.photo_url ? getImageUrl(selected.photo_url) : null} />
            </div>
            <div style={{ padding: '14px 28px 28px', backgroundColor: '#FFFFFF' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em', color: C.ink }}>{selected.full_name}</h3>
              <p style={{ margin: '4px 0 0', color: C.red, fontWeight: 700 }}>{selected.position_subject || 'Position not listed'}</p>
              <dl style={{ margin: '20px 0 0', textAlign: 'left' }}>
                {[
                  selected.section_name && ['Section', selected.section_name],
                  selected.department_grade_level && ['Grade level', selected.department_grade_level],
                  !!selected.years_in_service && ['Years in service', selected.years_in_service],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderTop: `1px solid ${C.line}` }}>
                    <dt style={{ fontSize: 13.5, color: C.muted }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.ink }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
