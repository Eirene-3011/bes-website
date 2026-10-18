import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useSchoolInfo } from '../../hooks/useSchoolInfo';
import { IconMapPin, IconPhone, IconMail, IconClock, IconClipboard, IconMessageSquare, IconSend } from '../../components/Icons';

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

export default function ContactPage() {
  const wide = useWide();
  const { info } = useSchoolInfo();
  const [feedbackLinks, setFeedbackLinks] = useState([]);
  const [form, setForm] = useState({ sender_name: '', sender_email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/feedback').then((r) => setFeedbackLinks(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sender_name || !form.message) { toast.error('Please fill in your name and message.'); return; }
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      toast.success('Your message has been sent! We will get back to you as soon as possible.');
      setForm({ sender_name: '', sender_email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const csmLink = feedbackLinks.find((f) => f.type === 'csm_survey');
  const feedbackLink = feedbackLinks.find((f) => f.type === 'general_feedback');

  const contactDetails = [
    { Icon: IconMapPin, label: 'Address', val: info?.address || 'Purok 7, Bacao 2, General Trias City, Cavite' },
    { Icon: IconPhone, label: 'Mobile', val: info?.mobile || '(046) 230 3506 / 0966-486-1467' },
    { Icon: IconMail, label: 'Email', val: info?.email || '107957@deped.gov.ph' },
    { Icon: IconClock, label: 'Office hours', val: info?.office_hours || 'Monday–Friday, 8:00 AM–5:00 PM' },
  ];
  const labelStyle = { display: 'block', margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 700 };

  return (
    <div className="bes-page" style={pageShell(wide)}>
      <BesStyles />
      <style>{BTN_CSS}</style>
      <Hero wide={wide} above={<Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]} />}
        eyebrow="Contact Us" title="We would love to hear from you."
        subtitle="Reach out to Bacao Elementary School by phone, email, or the message form." />

      <main className="container" style={{ ...mainBox(wide), paddingTop: wide ? 40 : 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1fr) minmax(0, 1.1fr)' : 'minmax(0, 1fr)', gap: wide ? 40 : 36, alignItems: 'start' }}>
          <section aria-label="School contact details">
            <Reveal>
              <SectionHead eyebrow="Visit or call" title="Get in touch" />
              <div style={{ ...card, padding: '6px 22px' }}>
                {contactDetails.map((c, i) => (
                  <div key={c.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                    <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red }}><c.Icon size={18} /></span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: C.muted }}>{c.label}</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.5, overflowWrap: 'anywhere' }}>{c.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100} style={{ marginTop: 20 }}>
              <div style={{ ...card, overflow: 'hidden' }}>
                {info?.google_maps_link ? (
                  <iframe src={info.google_maps_link} width="100%" height="250" style={{ border: 0, display: 'block' }}
                    allowFullScreen loading="lazy" title="BES location map" referrerPolicy="no-referrer-when-downgrade" />
                ) : (
                  <div style={{ minHeight: 180, display: 'grid', placeItems: 'center', padding: 24, background: C.paper, textAlign: 'center' }}>
                    <div>
                      <span style={{ color: C.red }}><IconMapPin size={28} /></span>
                      <p style={{ margin: '8px 0 0', fontWeight: 800 }}>Map coming soon</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: C.muted }}>For now, use the school address above.</p>
                    </div>
                  </div>
                )}
              </div>
              {info?.google_maps_link && (
                <a href={info.google_maps_link} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-outline" style={{ marginTop: 12, width: '100%', boxSizing: 'border-box' }}>
                  <IconMapPin size={16} /> Open in Google Maps
                </a>
              )}
            </Reveal>

            {(csmLink?.url || feedbackLink?.url) && (
              <Reveal delay={150} style={{ marginTop: 32 }}>
                <SectionHead eyebrow="Tell us how we did" title="Feedback and surveys" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {csmLink?.url && <a href={csmLink.url} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-primary"><IconClipboard size={16} /> Client Satisfaction Survey (CSM)</a>}
                  {feedbackLink?.url && <a href={feedbackLink.url} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-outline"><IconMessageSquare size={16} /> General Feedback Form</a>}
                </div>
              </Reveal>
            )}
          </section>

          <section aria-label="Send a message">
            <Reveal delay={80}>
              <SectionHead eyebrow="We reply as soon as we can" title="Send us a message" />
              <form onSubmit={handleSubmit} style={{ ...card, padding: 'clamp(20px, 4vw, 32px)', borderTop: `4px solid ${C.gold}` }}>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="contact-name" style={labelStyle}>Full name *</label>
                  <input id="contact-name" type="text" className="bes-field" placeholder="Enter your full name" value={form.sender_name} onChange={set('sender_name')} required />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="contact-email" style={labelStyle}>Email address</label>
                  <input id="contact-email" type="email" className="bes-field" placeholder="your@email.com" value={form.sender_email} onChange={set('sender_email')} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="contact-subject" style={labelStyle}>Subject</label>
                  <input id="contact-subject" type="text" className="bes-field" placeholder="What is your message about?" value={form.subject} onChange={set('subject')} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label htmlFor="contact-message" style={labelStyle}>Message *</label>
                  <textarea id="contact-message" className="bes-field" rows="5" placeholder="Type your message here…" value={form.message} onChange={set('message')} required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="bes-btn bes-btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Sending…' : (<><IconSend size={16} /> Send message</>)}
                </button>
              </form>
            </Reveal>
          </section>
        </div>
      </main>
    </div>
  );
}
