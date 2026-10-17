import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function CareersPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get('/content/careers')
      .then(({ data }) => setContent(data?.find(block => block.section_key === 'job_vacancies') || data?.[0] || null))
      .catch(() => {});
  }, []);

  const fallback = '<p><strong>Coming soon.</strong> BES job vacancy announcements and application instructions will be posted here after official confirmation.</p>';

  return (
    <div className="careers-page">
      <div className="page-header">
        <div className="container">
          <h1>Careers &amp; Job Vacancies</h1>
          <p>Employment opportunities at Bacao Elementary School</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Work with BES</h2>
          <p className="section-subtitle">
            Join a caring school community committed to helping every learner grow, belong, and excel.
          </p>

          <div className="grid-auto">
            <article className="card card-body">
              <span className="section-eyebrow">Current opportunities</span>
              <h2 className="section-title">{content?.title || 'Job Vacancies'}</h2>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: content?.body_richtext || fallback }}
              />
            </article>

            <aside className="card card-body">
              <span className="section-eyebrow">Official information</span>
              <h3>Meaningful work begins with service.</h3>
              <p>
                BES welcomes dedicated professionals who share a commitment to children, learning, and community.
              </p>
              <div className="divider-stitch" />
              <p>
                Official announcements and application instructions will be posted here after confirmation by the school.
              </p>
              <a className="btn btn-primary btn-sm" href="mailto:107957@deped.gov.ph">
                Contact the school <span aria-hidden="true">→</span>
              </a>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
