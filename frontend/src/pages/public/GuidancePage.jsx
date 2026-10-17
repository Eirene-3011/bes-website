import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function GuidancePage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get('/content/guidance')
      .then(({ data }) => setContent(data?.find(block => block.section_key === 'student_services') || data?.[0] || null))
      .catch(() => {});
  }, []);

  const fallback = '<p><strong>Coming soon.</strong> BES guidance, counselling, referral, and student-support information will be published here after official confirmation.</p>';

  return (
    <div className="guidance-page">
      <div className="page-header">
        <div className="container">
          <h1>Guidance, Counselling &amp; Student Services</h1>
          <p>Support services for BES learners and families</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Support for every learner</h2>
          <p className="section-subtitle">
            Helping learners and families navigate school life through care, guidance, referral, and responsive support.
          </p>

          <div className="grid-auto">
            <article className="card card-body">
              <span className="section-eyebrow">Student services</span>
              <h2 className="section-title">{content?.title || 'Student Services'}</h2>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: content?.body_richtext || fallback }}
              />
            </article>

            <aside className="card card-body">
              <span className="section-eyebrow">A caring pathway</span>
              <h3>Support starts with listening.</h3>
              <p>
                BES works with learners and families to encourage wellbeing, positive participation, and continued growth.
              </p>
              <div className="divider-stitch" />
              <p>
                Official guidance, counselling, referral, and student-support updates will be posted here after confirmation.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
