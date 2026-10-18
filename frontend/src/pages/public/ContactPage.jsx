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
    if (Object.keys(e).length) {
      const first = ['sender_name', 'sender_email', 'message'].find((k) => e[k]);
      document.getElementById(`contact-${first}`)?.focus();
    }
    return Object.keys(e).length === 0;
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

  const phoneLinks = String(mobile).split('/').map((s) => s.trim()).filter(Boolean)
    .map((p) => ({ text: p, href: `tel:${p.replace(/[^\d+]/g, '')}` }));

  const contactDetails = [
    { Icon: IconMapPin, label: 'Address', node: address },
    {
      Icon: IconPhone, label: 'Mobile',
      node: phoneLinks.map((p, i) => (
        <React.Fragment key={p.href}>{i > 0 && <span aria-hidden="true"> / </span>}<a className="bes-textlink" href={p.href}>{p.text}</a></React.Fragment>
      )),
    },
    { Icon: IconMail, label: 'Email', node: <a className="bes-textlink" href={`mailto:${email}`}>{email}</a> },
    { Icon: IconClock, label: 'Office hours', node: hours },
  ];

  const labelStyle = { display: 'block', margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 700 };
  const errStyle = { margin: '6px 0 0', fontSize: '0.84rem', fontWeight: 600, color: C.danger };

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
        subtitle="Reach out to Bacao Elementary School by phone, email, or the message form." aside={ticket} />

      <main className="container" style={{ ...mainBox(wide), paddingTop: wide ? 40 : 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1fr) minmax(0, 1.1fr)' : 'minmax(0, 1fr)', gap: wide ? 40 : 36, alignItems: 'start' }}>
          {/* On phones the form comes first: it is the main job of this page */}
          <section aria-label="Send a message" style={{ order: wide ? 2 : 1 }}>
            <Reveal delay={80}>
              <SectionHead eyebrow="We reply as soon as we can" title="Send us a message" />
              {sent ? (
                <div role="status" style={{ ...card, padding: 'clamp(24px, 5vw, 40px)', borderTop: `4px solid ${C.gold}`, textAlign: 'center' }}>
                  <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red, marginBottom: 14 }}><IconSend size={24} /></span>
                  <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Message sent.</p>
                  <p style={{ margin: '0 auto 20px', maxWidth: '40ch', color: C.muted, lineHeight: 1.6 }}>Thank you. The school will reply as soon as possible.</p>
                  <button type="button" className="bes-btn bes-btn-outline bes-btn-sm" onClick={() => setSent(false)}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate style={{ ...card, padding: 'clamp(20px, 4vw, 32px)', borderTop: `4px solid ${C.gold}` }}>
                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="contact-sender_name" style={labelStyle}>Full name (required)</label>
                    <input id="contact-sender_name" type="text" autoComplete="name" className="bes-field" placeholder="Enter your full name" value={form.sender_name} onChange={set('sender_name')}
                      aria-required="true" aria-invalid={!!errors.sender_name} aria-describedby={errors.sender_name ? 'err-name' : undefined} />
                    {errors.sender_name && <p id="err-name" role="alert" style={errStyle}>{errors.sender_name}</p>}
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="contact-sender_email" style={labelStyle}>Email address (so we can reply)</label>
                    <input id="contact-sender_email" type="email" autoComplete="email" className="bes-field" placeholder="your@email.com" value={form.sender_email} onChange={set('sender_email')}
                      aria-invalid={!!errors.sender_email} aria-describedby={errors.sender_email ? 'err-email' : undefined} />
                    {errors.sender_email && <p id="err-email" role="alert" style={errStyle}>{errors.sender_email}</p>}
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="contact-subject" style={labelStyle}>Subject</label>
                    <input id="contact-subject" type="text" className="bes-field" placeholder="What is your message about?" value={form.subject} onChange={set('subject')} />
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label htmlFor="contact-message" style={labelStyle}>Message (required)</label>
                    <textarea id="contact-message" className="bes-field" rows="5" placeholder="Type your message here…" value={form.message} onChange={set('message')} style={{ resize: 'vertical' }}
                      aria-required="true" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'err-message' : undefined} />
                    {errors.message && <p id="err-message" role="alert" style={errStyle}>{errors.message}</p>}
                  </div>
                  <button type="submit" className="bes-btn bes-btn-primary" style={{ width: '100%' }} disabled={submitting}>
                    {submitting ? 'Sending…' : (<><IconSend size={16} /> Send message</>)}
                  </button>
                </form>
              )}
            </Reveal>
          </section>

          <section aria-label="School contact details" style={{ order: wide ? 1 : 2 }}>
            <Reveal>
              <SectionHead eyebrow="Visit or call" title="Get in touch" />
              <div style={{ ...card, padding: '6px 22px' }}>
                {contactDetails.map((c, i) => (
                  <div key={c.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                    <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${C.tint}, #FFE3A3)`, color: C.red }}><c.Icon size={18} /></span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: C.muted }}>{c.label}</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.5, overflowWrap: 'anywhere' }}>{c.node}</p>
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
        </div>
      </main>
    </div>
  );
}
