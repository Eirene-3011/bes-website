import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useSchoolInfo } from '../../hooks/useSchoolInfo';
import { IconMapPin, IconPhone, IconMail, IconClock, IconClipboard, IconMessageSquare, IconSend } from '../../components/Icons';

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
.bes-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.bes-btn-primary { background: var(--green-800, #A8161B); color: #fff; box-shadow: 0 6px 14px rgba(94,11,16,.25); }
.bes-btn-outline { background: transparent; color: var(--green-950, #5E0B10); border-color: var(--green-950, #5E0B10); }
.bes-field { width: 100%; box-sizing: border-box; padding: 12px 14px; border: 1px solid rgba(142,18,24,.22); border-radius: 10px; background: #fff; font: inherit; font-size: .95rem; color: var(--green-950, #5E0B10); }
.bes-field:focus { outline: none; border-color: var(--green-800, #A8161B); box-shadow: 0 0 0 3px rgba(168,22,27,.15); }
.bes-grid-2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 40px; align-items: start; }
@media (max-width: 760px) { .bes-grid-2 { grid-template-columns: minmax(0, 1fr); gap: 36px; } }
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
function Hero({ wide, crumbs, eyebrow, title, subtitle }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', padding: wide ? '56px 24px 56px 96px' : '32px 20px 36px 40px' }}>
        <nav aria-label="Breadcrumb" style={{ marginBottom: 14, fontSize: '0.85rem', color: C.muted }}>
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {i > 0 && <span aria-hidden="true"> › </span>}
              {c.to ? <Link to={c.to} style={{ color: C.red, fontWeight: 700, textDecoration: 'none' }}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{eyebrow}</span>
        <h1 style={{ margin: '20px 0 14px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, fontSize: 'clamp(2.3rem, 5.4vw, 3.8rem)' }}>{title}</h1>
        <p style={{ margin: 0, maxWidth: '50ch', fontSize: '1.08rem', lineHeight: 1.6, color: C.muted }}>{subtitle}</p>
      </div>
    </header>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 18 }}>
      <span aria-hidden="true" style={{ alignSelf: 'stretch', flex: 'none', marginRight: 18, borderRight: `5px double ${C.margin}` }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem' }}>{eyebrow}</p>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)' }}>{title}</h2>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
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
    <div className="bes-page" style={{ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 }}>
      <style>{CSS}</style>

      <Hero
        wide={wide}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]}
        eyebrow="Contact Us"
        title="We would love to hear from you."
        subtitle="Reach out to Bacao Elementary School by phone, email, or the message form."
      />

      <main className="container" style={{ maxWidth: 960, padding: wide ? '40px 24px 0' : '28px 16px 0' }}>
        <div className="bes-grid-2">
          {/* Left: details, map, feedback */}
          <section aria-label="School contact details">
            <SectionHead eyebrow="Visit or call" title="Get in touch" />
            <div style={{ ...card, padding: '6px 22px' }}>
              {contactDetails.map((c, i) => (
                <div key={c.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                  <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 40, height: 40, borderRadius: 10, background: C.tint, color: C.red }}><c.Icon size={18} /></span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: C.muted }}>{c.label}</p>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.5, overflowWrap: 'anywhere' }}>{c.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...card, marginTop: 20, overflow: 'hidden' }}>
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

            {(csmLink?.url || feedbackLink?.url) && (
              <div style={{ marginTop: 32 }}>
                <SectionHead eyebrow="Tell us how we did" title="Feedback and surveys" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {csmLink?.url && (
                    <a href={csmLink.url} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-primary">
                      <IconClipboard size={16} /> Client Satisfaction Survey (CSM)
                    </a>
                  )}
                  {feedbackLink?.url && (
                    <a href={feedbackLink.url} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-outline">
                      <IconMessageSquare size={16} /> General Feedback Form
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Right: message form */}
          <section aria-label="Send a message">
            <SectionHead eyebrow="We reply as soon as we can" title="Send us a message" />
            <form onSubmit={handleSubmit} style={{ ...card, padding: 'clamp(20px, 4vw, 32px)' }}>
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
          </section>
        </div>
      </main>
    </div>
  );
}
