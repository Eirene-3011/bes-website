import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { IconMessageSquare } from '../../components/Icons';

/* ═══ Shared page kit (same look as PPAsPage; kept in this file) ═══ */
const C = {
  red: 'var(--green-800, #A8161B)', deep: 'var(--green-900, #8E1218)', ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923', goldText: '#8A5A00', paper: '#FFF4C7', cream: '#FFFBEA', tint: '#FBE3E3',
  muted: '#6B4A44', line: 'rgba(142, 18, 24, 0.14)', rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)', danger: '#B3261E',
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

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

const pageShell = (wide) => ({ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 });

const stripTags = (h) => String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const CSS = `
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: 2px; border-radius: 6px; }
.bes-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* accordion: height animates open/closed */
.bes-acc { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
.bes-acc[data-open="true"] { grid-template-rows: 1fr; }
.bes-acc > div { min-height: 0; overflow: hidden; visibility: hidden; transition: visibility .3s; }
.bes-acc[data-open="true"] > div { visibility: visible; }

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

function EmptyState({ Icon, title, children, action }) {
  return (
    <div className="bes-reveal in" style={{ ...card, boxShadow: 'none', border: `2px dashed ${C.line}`, padding: '44px 24px', textAlign: 'center' }}>
      <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red, marginBottom: 14 }}><Icon size={24} /></span>
      {title && <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.1rem' }}>{title}</p>}
      {children && <p style={{ margin: '0 auto', maxWidth: '44ch', color: C.muted, fontSize: '0.98rem', lineHeight: 1.6 }}>{children}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder, label, style }) {
  return (
    <label className="bes-search" style={{ marginBottom: 18, ...style }}>
      <span className="bes-sr">{label}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flex: 'none' }}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value && <button type="button" className="bes-clear" aria-label="Clear search" onClick={() => onChange('')}>&times;</button>}
    </label>
  );
}

/* Highlights the first match of `q` (already lower-cased) in `text` */
function Mark({ text, q }) {
  if (!q || !text) return text || null;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<mark className="bes-mark">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

/* Polite result count for screen readers + a quiet visible line */
function ResultCount({ shown, total, noun, visible = true }) {
  const msg = shown === total ? `${total} ${noun}` : `Showing ${shown} of ${total} ${noun}`;
  return (
    <p role="status" aria-live="polite" className={visible ? undefined : 'bes-sr'} style={visible ? { margin: '0 0 14px', fontSize: '0.88rem', color: C.muted } : undefined}>{msg}</p>
  );
}

function SkeletonGrid({ min = 280, count = 3, height = 300 }) {
  return (
    <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`, gap: 22 }}>
      {Array.from({ length: count }).map((_, i) => <div key={i} className="bes-skel" style={{ height, borderRadius: 14 }} />)}
    </div>
  );
}

/* Full-width closing banner (the maroon "legal pad" panel) */
function PageBanner({ wide, title, text, children }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, color: '#fff', background: GRAD, boxShadow: '0 24px 48px rgba(94, 11, 16, 0.28)' }}>
      <span aria-hidden="true" className="bes-blob" style={{ top: -90, right: -60, width: 300, height: 300, background: 'radial-gradient(circle at 40% 40%, rgba(232,185,35,.35), rgba(232,185,35,0) 70%)' }} />
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(255, 255, 255, 0.07) 35px, rgba(255, 255, 255, 0.07) 36px)' }} />
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 40 : 14, width: 5, boxSizing: 'border-box', borderLeft: '1px solid rgba(255, 255, 255, 0.4)', borderRight: '1px solid rgba(255, 255, 255, 0.4)' }} />
      <div style={{ position: 'relative', padding: wide ? '44px 48px 44px 88px' : '32px 22px 32px 40px' }}>
        <h2 style={{ margin: '0 0 10px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, fontSize: 'clamp(1.6rem, 3.6vw, 2.4rem)' }}>{title}</h2>
        <p style={{ margin: '0 0 24px', maxWidth: '46ch', fontSize: '1.02rem', lineHeight: 1.6, opacity: 0.92 }}>{text}</p>
        {children}
      </div>
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FAQPage() {
  const wide = useWide();
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/faqs').then((r) => setFaqs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const q = query.trim().toLowerCase();
  const shown = faqs.filter((f) => !q || f.question?.toLowerCase().includes(q) || stripTags(f.answer_richtext).toLowerCase().includes(q));
  // While searching, open the single best match so the answer is visible right away
  const openId = q && shown.length === 1 ? shown[0].id : open;

  const ticket = (
    <Ticket wide={wide} Icon={IconMessageSquare} ariaLabel="Questions answered" label="Questions answered"
      value={loading ? '…' : faqs.length} note="Can’t find yours? Ask the school." />
  );

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <Hero wide={wide} above={<Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact', to: '/contact' }, { label: 'FAQ' }]} />}
        eyebrow="FAQ" title="Answers to common questions."
        subtitle="Quick answers about Bacao Elementary School. Tap a question to read the answer." aside={ticket} />

      <main className="container" style={{ ...mainBox(wide), maxWidth: 820, paddingTop: wide ? 40 : 28, display: 'flex', flexDirection: 'column', gap: wide ? 48 : 36 }}>
        <div>
          {!loading && faqs.length > 6 && (
            <>
              <SearchBox value={query} onChange={setQuery} label="Search questions" placeholder="Search questions…" style={{ maxWidth: 380, marginBottom: 10 }} />
              {q && <ResultCount shown={shown.length} total={faqs.length} noun="questions" />}
            </>
          )}

          {loading ? (
            <SkeletonGrid min={500} count={5} height={64} />
          ) : faqs.length === 0 ? (
            <EmptyState Icon={IconMessageSquare} title="No FAQs yet."
              action={<Link to="/contact" className="bes-btn bes-btn-outline bes-btn-sm">Ask the school</Link>}>
              No FAQs have been posted yet. Use the contact page to ask the school directly.
            </EmptyState>
          ) : shown.length === 0 ? (
            <EmptyState Icon={IconMessageSquare} title="No matches."
              action={<button type="button" className="bes-btn bes-btn-outline bes-btn-sm" onClick={() => setQuery('')}>Clear search</button>}>
              No questions match “{query.trim()}”. Try a different word.
            </EmptyState>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {shown.map((faq, i) => {
                const isOpen = openId === faq.id;
                return (
                  <Reveal as="li" key={faq.id} delay={Math.min(i, 5) * 50}>
                    <div style={{ ...card, overflow: 'hidden', borderLeft: `4px solid ${isOpen ? C.red : C.gold}`, transition: 'border-color 0.2s ease, box-shadow 0.2s ease', boxShadow: isOpen ? '0 14px 30px rgba(94, 11, 16, 0.12)' : card.boxShadow }}>
                      <h3 style={{ margin: 0 }}>
                        <button type="button" id={`faq-btn-${faq.id}`} onClick={() => setOpen(isOpen ? null : faq.id)} aria-expanded={isOpen} aria-controls={`faq-panel-${faq.id}`}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '18px 20px', background: isOpen ? C.paper : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.015em', lineHeight: 1.4, color: C.ink, transition: 'background 0.2s ease' }}>
                          <span><Mark text={faq.question} q={q} /></span>
                          <span style={{ color: C.red, display: 'flex' }}><ChevronIcon open={isOpen} /></span>
                        </button>
                      </h3>
                      <div className="bes-acc" data-open={isOpen}>
                        <div id={`faq-panel-${faq.id}`} role="region" aria-labelledby={`faq-btn-${faq.id}`}>
                          <div className="rich-content"
                            style={{ padding: '16px 20px 20px', borderTop: `1px solid ${C.line}`, background: '#fff', fontSize: '0.95rem', color: C.ink, lineHeight: 1.7 }}
                            dangerouslySetInnerHTML={{ __html: faq.answer_richtext }} />
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>

        <Reveal>
          <PageBanner wide={wide} title="Can’t find the answer you’re looking for?" text="Send the school a message and we will get back to you as soon as possible.">
            <Link to="/contact" className="bes-btn bes-btn-white">Contact the school</Link>
          </PageBanner>
        </Reveal>
      </main>
    </div>
  );
}
