import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faqs').then(r => setFaqs(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> › <Link to="/contact">Contact</Link> › FAQ</div>
          <h1>Frequently Asked Questions</h1>
          <p>Answers to common questions about BES</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card" style={{ padding: '16px 20px' }}>
                  <div className="skeleton" style={{ width: '70%', height: 16 }} />
                </div>
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="alert alert-info">No FAQs have been posted yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqs.map((faq, i) => (
                <div key={faq.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '16px 20px',
                      background: open === i ? 'var(--red-pale)' : 'white',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      gap: 12, fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)'
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{ flexShrink: 0, color: 'var(--red-primary)' }}>{open === i ? '▲' : '▼'}</span>
                  </button>
                  {open === i && (
  <div
    style={{ padding: '14px 20px 18px', borderTop: '1px solid var(--gray-200)', background: 'white', fontSize: '0.88rem', color: 'var(--gray-700)', lineHeight: 1.7 }}
    dangerouslySetInnerHTML={{ __html: faq.answer_richtext }}
  />
)}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ color: 'var(--gray-500)', marginBottom: 12, fontSize: '0.88rem' }}>Can't find the answer you're looking for?</p>
            <Link to="/contact" className="btn btn-primary">Contact the School</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
