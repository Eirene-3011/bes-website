import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconScroll, IconCalendar, IconFlag, IconSearch } from '../../components/Icons';

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

const fmtDate = (d, opts = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-PH', opts) : '';

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

const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '48px 0 0' : '32px 0 0' });

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

const pageShell = (wide) => ({ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 });


const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'update', label: 'Updates' },
  { value: 'event', label: 'Events' },
];

// Categories keep distinct tints so they stay scannable
const CATEGORY_BADGE = {
  news: { bg: '#FBE3E3', color: '#8E1218' },
  announcement: { bg: '#FEF3C7', color: '#8A5A00' },
  update: { bg: '#DCFCE7', color: '#15803D' },
  event: { bg: '#E0F2FE', color: '#0369A1' },
};

const readTime = (text) => Math.max(1, Math.round((text || '').split(/\s+/).filter(Boolean).length / 200));

function Badge({ category, overlay }) {
  const b = CATEGORY_BADGE[category] || CATEGORY_BADGE.news;
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, background: b.bg, color: b.color, textTransform: 'capitalize', boxShadow: overlay ? '0 4px 12px rgba(0,0,0,.18)' : 'none' }}>
      {category}
    </span>
  );
}

function PostCard({ post, featured, onOpen }) {
  const src = post.image_url ? getImageUrl(post.image_url) : null;
  return (
    <article className="bes-lift" role="button" tabIndex={0} onClick={() => onOpen(post)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(post); } }}
      style={{ ...card, overflow: 'hidden', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: featured ? 'row' : 'column', flexWrap: featured ? 'wrap' : 'nowrap', ...(featured ? { borderTop: `4px solid ${C.gold}` } : {}) }}>
      <div className="bes-media" style={{ flex: featured ? '1 1 340px' : 'none', minHeight: featured ? 280 : 190, height: featured ? 'auto' : 190, background: `linear-gradient(135deg, ${C.tint}, #FFE9A8)`, display: 'grid', placeItems: 'center', color: C.red }}>
        {src
          ? <img src={src} alt={post.title} style={{ position: featured ? 'absolute' : 'static', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          : <IconScroll size={38} />}
        <span style={{ position: 'absolute', top: 12, left: 12 }}><Badge category={post.category} overlay /></span>
        {featured && <span style={{ position: 'absolute', bottom: 12, left: 12, padding: '4px 12px', borderRadius: 999, background: C.gold, color: C.ink, fontWeight: 800, fontSize: 12 }}>Latest</span>}
      </div>
      <div style={{ flex: featured ? '1 1 340px' : 1, padding: featured ? '30px 32px' : '18px 22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: C.muted }}>
          {post.published_date && <span>{fmtDate(post.published_date)}</span>}
          {post.published_date && post.content && <span aria-hidden="true">•</span>}
          {post.content && <span>{readTime(post.content)} min read</span>}
        </div>
        <h3 style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25, fontSize: featured ? 'clamp(1.5rem, 2.8vw, 2.05rem)' : '1.1rem' }}>{post.title}</h3>
        {post.excerpt && (
          <p style={{ margin: 0, flex: 1, color: C.muted, lineHeight: 1.6, fontSize: featured ? 15.5 : 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: featured ? 4 : 3, WebkitBoxOrient: 'vertical' }}>{post.excerpt}</p>
        )}
        <span className="bes-link" style={{ color: C.red, fontWeight: 800, fontSize: 14 }}>Read the full post <span aria-hidden="true">→</span></span>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const wide = useWide();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(0);
  const savedY = useRef(0);

  useEffect(() => {
    setLoading(true);
    api.get(filterCat ? `/news-updates?category=${filterCat}` : '/news-updates')
      .then((r) => setPosts(r.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [filterCat]);

  // Reading progress bar in article view
  useEffect(() => {
    if (!selected) return undefined;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [selected]);

  const open = (post) => { savedY.current = window.scrollY; setSelected(post); window.scrollTo({ top: 0 }); };
  const close = () => { setSelected(null); requestAnimationFrame(() => window.scrollTo({ top: savedY.current })); };

  const catLabel = CATEGORIES.find((c) => c.value === filterCat)?.label || 'All';
  const q = query.trim().toLowerCase();
  const shown = q ? posts.filter((p) => `${p.title} ${p.excerpt || ''}`.toLowerCase().includes(q)) : posts;
  const latest = posts.find((p) => p.published_date)?.published_date;

  /* ── Article view ── */
  if (selected) {
    const src = selected.image_url ? getImageUrl(selected.image_url) : null;
    const related = posts.filter((p) => p.id !== selected.id).slice(0, 3);
    const paragraphs = (selected.content || '').split(/\n{2,}/).filter((s) => s.trim());
    return (
      <div className="bes-page" style={pageShell(wide)}>
        <BesStyles />
        <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, height: 4, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.red})`, zIndex: 50, transition: 'width .1s linear' }} />
        <nav aria-label="Article" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
          <div className="container" style={{ maxWidth: 960, padding: '0 16px' }}>
            <button type="button" onClick={close}
              style={{ padding: '16px 6px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${C.red}`, cursor: 'pointer', font: 'inherit', fontWeight: 800, fontSize: 14, color: C.ink }}>
              ← Back to all news
            </button>
          </div>
        </nav>

        <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
          <div className="container bes-rise" style={{ position: 'relative', maxWidth: 960, padding: wide ? '56px 24px 84px 96px' : '32px 20px 60px 40px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <Badge category={selected.category} />
              {selected.published_date && <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>{fmtDate(selected.published_date)}</span>}
              {selected.content && <span style={{ fontSize: 14, color: C.muted }}>• {readTime(selected.content)} min read</span>}
            </div>
            <h1 style={{ margin: 0, maxWidth: '22ch', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.04, fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>{selected.title}</h1>
            {selected.excerpt && <p style={{ margin: '18px 0 0', maxWidth: '56ch', fontSize: '1.12rem', lineHeight: 1.6, color: C.muted }}>{selected.excerpt}</p>}
          </div>
          <svg aria-hidden="true" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: wide ? 34 : 20, display: 'block' }}>
            <path d="M0 40V20C120 6 240 0 360 8c140 10 260 28 420 26 160-2 300-26 460-28 80-1 150 4 200 10v24z" fill={C.cream} />
          </svg>
        </header>

        <main className="container" style={{ ...mainBox(wide), position: 'relative', marginTop: wide ? -28 : -12 }}>
          <article className="bes-rise" style={{ ...card, overflow: 'hidden', boxShadow: '0 24px 50px rgba(94, 11, 16, 0.14)' }}>
            {src && <img src={src} alt={selected.title} style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            {paragraphs.length > 0 && (
              <div style={{ padding: wide ? '36px 48px 44px' : '24px 20px 30px', fontSize: 17, lineHeight: 1.85, maxWidth: '70ch' }}>
                {paragraphs.map((para, i) => (
                  <p key={i} style={{ margin: '0 0 1.2em', whiteSpace: 'pre-wrap' }}>{para}</p>
                ))}
              </div>
            )}
          </article>

          {related.length > 0 && (
            <section style={{ ...sectionPad(wide), paddingTop: wide ? 64 : 44 }}>
              <SectionHead eyebrow="Keep reading" title="More from BES" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {related.map((p, i) => (
                  <Reveal key={p.id} delay={i * 80}><PostCard post={p} onOpen={open} /></Reveal>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  /* ── List view ── */
  const ticket = (
    <Ticket wide={wide} Icon={IconScroll} ariaLabel="Posts at a glance"
      label={filterCat ? `${catLabel} posts` : 'Posts published'}
      value={loading ? '…' : posts.length > 0 ? posts.length : 'None yet'}
      rows={[
        !loading && latest && { Icon: IconCalendar, label: 'Latest post', value: fmtDate(latest) },
        { Icon: IconFlag, label: 'Showing', value: catLabel },
      ].filter(Boolean)} />
  );

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <Hero wide={wide} eyebrow="News & Updates" title="What is happening at BES."
        subtitle="News, announcements, updates and events from our school." aside={ticket} />

      <main className="container" style={mainBox(wide)}>
        <section style={sectionPad(wide)}>
          <SectionHead Icon={IconScroll} title="Latest posts"
            note={!loading && posts.length > 0 ? `${shown.length} ${shown.length === 1 ? 'post' : 'posts'}${q ? ' match your search' : ''}` : undefined} />

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28 }}>
            <div role="group" aria-label="Filter by category" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: '1 1 320px' }}>
              {CATEGORIES.map((c) => (
                <FilterChip key={c.value} on={filterCat === c.value} onClick={() => setFilterCat(c.value)}>{c.label}</FilterChip>
              ))}
            </div>
            <SearchBox value={query} onChange={setQuery} placeholder="Search posts…" label="Search posts" style={{ flex: '1 1 220px', maxWidth: 340 }} />
          </div>

          {loading ? (
            <SkeletonGrid min={290} count={3} height={310} />
          ) : posts.length === 0 ? (
            <EmptyState Icon={IconScroll} title={filterCat ? `No ${catLabel.toLowerCase()} posts yet.` : 'No posts have been published yet.'}>
              {filterCat ? 'Try another category, or check back soon.' : 'Check back soon for news from BES.'}
            </EmptyState>
          ) : shown.length === 0 ? (
            <EmptyState Icon={IconScroll} title="No posts match your search.">Try a different word, or clear the search box.</EmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 22 }}>
              {shown.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 6) * 70} style={wide && i === 0 ? { gridColumn: '1 / -1' } : undefined}>
                  <PostCard post={p} featured={wide && i === 0} onOpen={open} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
