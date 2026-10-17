import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { IconMessageSquare } from '../../components/Icons';

/* ─── Theme: same identity as Header, HomePage and AdmissionsPage ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
  ink: 'var(--green-950, #5E0B10)',
  paper: '#FFF4C7',
  cream: '#FFFBEA',
  tint: '#FBE3E3',
  muted: '#6B4A44',
  line: 'rgba(142, 18, 24, 0.14)',
  rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)',
};
const GRAD = 'var(--grad-masthead, linear-gradient(135deg, #5E0B10, #A8161B))';
const paperBg = {
  backgroundColor: C.paper,
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${C.rule} 35px, ${C.rule} 36px), linear-gradient(180deg, #FFF4C7 0%, #FFE88F 100%)`,
};
const card = {
  background: '#fff',
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  boxShadow: '0 1px 2px rgba(94, 11, 16, 0.06), 0 8px 20px rgba(94, 11, 16, 0.06)',
  color: C.ink,
};
const CSS = `
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: 2px; }
.bes-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 24px; border-radius: 10px; border: 2px solid transparent; font: inherit; font-weight: 800; font-size: .95rem; text-decoration: none; cursor: pointer; transition: transform .15s ease; }
.bes-btn:hover { transform: translateY(-1px); }
.bes-btn-white { background: #fff; color: var(--green-950, #5E0B10); box-shadow: 0 10px 22px rgba(0,0,0,.25); }
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

/* ─── Small pieces ─── */
function ChevronIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Hero({ wide, aside }) {
  const crumbs = [{ label: 'Home', to: '/' }, { label: 'Contact', to: '/contact' }, { label: 'FAQ' }];
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '56px 24px 56px 96px' : '32px 20px 36px 40px' }}>
        <div>
          <nav aria-label="Breadcrumb" style={{ marginBottom: 14, fontSize: '0.85rem', color: C.muted }}>
            {crumbs.map((c, i) => (
              <span key={c.label}>
                {i > 0 && <span aria-hidden="true"> › </span>}
                {c.to ? <Link to={c.to} style={{ color: C.red, fontWeight: 700, textDecoration: 'none' }}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>FAQ</span>
          <h1 style={{ margin: '20px 0 14px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, fontSize: 'clamp(2.3rem, 5.4vw, 3.8rem)' }}>Answers to common questions.</h1>
          <p style={{ margin: 0, maxWidth: '50ch', fontSize: '1.08rem', lineHeight: 1.6, color: C.muted }}>Quick answers about Bacao Elementary School. Tap a question to read the answer.</p>
        </div>
        {aside}
      </div>
    </header>
  );
}

function Ticket({ wide, value }) {
  return (
    <aside aria-label="Questions answered" style={{ position: 'relative', ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
      <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 52, height: 52, borderRadius: 12, background: C.tint, color: C.red }}><IconMessageSquare size={26} /></span>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>Questions answered</p>
          <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{value}</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: C.muted }}>Can’t find yours? Ask the school.</p>
        </div>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function FAQPage() {
  const wide = useWide();
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faqs').then((r) => setFaqs(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bes-page" style={{ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 }}>
      <style>{CSS}</style>

      <Hero wide={wide} aside={<Ticket wide={wide} value={loading ? '…' : faqs.length} />} />

      <main className="container" style={{ maxWidth: 820, padding: wide ? '40px 24px 0' : '28px 16px 0', display: 'flex', flexDirection: 'column', gap: wide ? 48 : 36 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ ...card, padding: '18px 22px' }}>
                <div className="skeleton" style={{ width: '70%', height: 16 }} />
              </div>
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div style={{ ...card, boxShadow: 'none', border: `2px dashed ${C.line}`, padding: '36px 24px', textAlign: 'center' }}>
            <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 48, height: 48, borderRadius: 12, background: C.tint, color: C.red, marginBottom: 12 }}><IconMessageSquare size={22} /></span>
            <p style={{ margin: 0, color: C.muted, fontSize: '0.98rem', lineHeight: 1.6 }}>No FAQs have been posted yet. Use the contact page to ask the school directly.</p>
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <li key={faq.id} style={{ ...card, overflow: 'hidden', borderLeft: `4px solid ${isOpen ? C.red : C.line}`, transition: 'border-color 0.2s ease' }}>
                  <h3 style={{ margin: 0 }}>
                    <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-panel-${faq.id}`}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '18px 20px', background: isOpen ? C.paper : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.015em', lineHeight: 1.4, color: C.ink, transition: 'background 0.2s ease' }}>
                      <span>{faq.question}</span>
                      <span style={{ color: C.red, display: 'flex' }}><ChevronIcon open={isOpen} /></span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={`faq-panel-${faq.id}`} className="rich-content" role="region"
                      style={{ padding: '16px 20px 20px', borderTop: `1px solid ${C.line}`, background: '#fff', fontSize: '0.95rem', color: C.ink, lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: faq.answer_richtext }} />
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Call to action */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, color: '#fff', background: GRAD, boxShadow: '0 24px 48px rgba(94, 11, 16, 0.28)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(255, 255, 255, 0.07) 35px, rgba(255, 255, 255, 0.07) 36px)' }} />
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 40 : 14, width: 5, boxSizing: 'border-box', borderLeft: '1px solid rgba(255, 255, 255, 0.4)', borderRight: '1px solid rgba(255, 255, 255, 0.4)' }} />
          <div style={{ position: 'relative', padding: wide ? '44px 48px 44px 88px' : '32px 22px 32px 40px' }}>
            <h2 style={{ margin: '0 0 10px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, fontSize: 'clamp(1.6rem, 3.6vw, 2.4rem)' }}>Can’t find the answer you’re looking for?</h2>
            <p style={{ margin: '0 0 24px', maxWidth: '46ch', fontSize: '1.02rem', lineHeight: 1.6, opacity: 0.9 }}>Send the school a message and we will get back to you as soon as possible.</p>
            <Link to="/contact" className="bes-btn bes-btn-white">Contact the school</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
