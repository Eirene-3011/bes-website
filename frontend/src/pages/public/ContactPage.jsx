import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useSchoolInfo } from '../../hooks/useSchoolInfo';
import { IconMapPin, IconPhone, IconMail, IconClock, IconClipboard, IconMessageSquare, IconSend } from '../../components/Icons';

export default function ContactPage() {
  const { info } = useSchoolInfo();
  const [feedbackLinks, setFeedbackLinks] = useState([]);
  const [form, setForm] = useState({ sender_name: '', sender_email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/feedback').then(r => setFeedbackLinks(r.data)).catch(() => {});
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

  const csmLink = feedbackLinks.find(f => f.type === 'csm_survey');
  const feedbackLink = feedbackLinks.find(f => f.type === 'general_feedback');

  const contactDetails = [
    { Icon: IconMapPin, label: 'Address', val: info?.address || 'Purok 7, Bacao 2, General Trias City, Cavite' },
    { Icon: IconPhone, label: 'Mobile', val: info?.mobile || '(046) 230 3506 / 0966-486-1467' },
    { Icon: IconMail, label: 'Email', val: info?.email || '107957@deped.gov.ph' },
    { Icon: IconClock, label: 'Office Hours', val: info?.office_hours || 'Monday–Friday, 8:00 AM–5:00 PM' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> › Contact Us</div>
          <h1>Contact Us</h1>
          <p>Reach out to Bacao Elementary School</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact info */}
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 24 }}>Get in Touch</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {contactDetails.map(c => (
                  <div key={c.label} className="contact-info-row">
                    <span className="contact-info-icon" aria-hidden="true"><c.Icon size={18} /></span>
                    <div>
                      <p className="contact-info-label">{c.label}</p>
                      <p className="contact-info-value">{c.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Google Maps */}
              <div style={{ marginTop: 24, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                {info?.google_maps_link ? (
                  <iframe
                    src={info.google_maps_link}
                    width="100%" height="250" style={{ border: 0, display: 'block' }}
                    allowFullScreen loading="lazy" title="BES location map"
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                ) : (
                  <div style={{ minHeight: 180, display: 'grid', placeItems: 'center', padding: 24, background: 'var(--gold-pale)', color: 'var(--gray-700)', textAlign: 'center' }}>
                    <div>
                      <IconMapPin size={28} />
                      <p style={{ marginTop: 8, fontWeight: 700 }}>Google Maps location coming soon</p>
                      <p style={{ marginTop: 4, fontSize: '0.82rem' }}>The school address above is the verified location information currently available.</p>
                    </div>
                  </div>
                )}
              </div>
              {info?.google_maps_link && (
                <a href={info.google_maps_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                  <IconMapPin size={16} />
                  Open in Google Maps
                </a>
              )}

              {/* Feedback links */}
              {(csmLink?.url || feedbackLink?.url) && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Feedback & Surveys</h3>
                  {csmLink?.url && (
                    <a href={csmLink.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                      <IconClipboard size={16} />
                      Client Satisfaction Survey (CSM)
                    </a>
                  )}
                  {feedbackLink?.url && (
                    <a href={feedbackLink.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                      <IconMessageSquare size={16} />
                      General Feedback Form
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact form */}
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Send Us a Message</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 24 }}>Fill out the form and we'll get back to you as soon as possible.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-control" placeholder="Enter your full name"
                    value={form.sender_name} onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" placeholder="your@email.com"
                    value={form.sender_email} onChange={e => setForm(f => ({ ...f, sender_email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-control" placeholder="What is your message about?"
                    value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-control" rows="5" placeholder="Type your message here..."
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? 'Sending...' : (<><IconSend size={16} /> Send Message</>)}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}