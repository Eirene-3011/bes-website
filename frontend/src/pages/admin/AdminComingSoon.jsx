import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminComingSoon({ title, description }) {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          <p className="admin-page-sub">{description}</p>
        </div>
      </div>
      <div className="admin-card" style={{ maxWidth: 760 }}>
        <h2 className="admin-card-title">Coming soon</h2>
        <p style={{ color: 'var(--gray-600)', lineHeight: 1.7 }}>
          This destination is ready for BES content, but verified source material has not been supplied yet.
          Use the Content Editor when the school provides the official text, links, documents, or announcements.
        </p>
        <Link to="/admin/content" className="btn btn-primary" style={{ marginTop: 20 }}>Open Content Editor</Link>
      </div>
    </div>
  );
}