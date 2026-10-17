import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

const LEVELS = [
  { key: 'kinder', label: 'Kinder' },
  { key: 'grade1', label: 'Grade 1' },
  { key: 'grade2', label: 'Grade 2' },
  { key: 'grade3', label: 'Grade 3' },
  { key: 'grade4', label: 'Grade 4' },
  { key: 'grade5', label: 'Grade 5' },
  { key: 'grade6', label: 'Grade 6' },
];

function EnrollTable({ row }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--gray-100)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', minWidth: 480 }}>
        <thead>
          <tr style={{ background: 'var(--red-primary)', color: 'white' }}>
            <th style={th}>Grade Level</th>
            <th style={{ ...th, textAlign: 'center' }}>Male</th>
            <th style={{ ...th, textAlign: 'center' }}>Female</th>
            <th style={{ ...th, textAlign: 'center' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {LEVELS.map((l, i) => {
            const m = Number(row[`${l.key}_male`]   || 0);
            const f = Number(row[`${l.key}_female`] || 0);
            const t = m + f;
            return (
              <tr
                key={l.key}
                style={{
                  background: i % 2 === 0 ? 'white' : 'var(--gray-50)',
                  borderBottom: '1px solid var(--gray-100)',
                }}
              >
                <td style={{ ...td, fontWeight: 600, color: 'var(--gray-900)' }}>{l.label}</td>
                <td style={{ ...td, textAlign: 'center', color: 'var(--gray-700)' }}>{m}</td>
                <td style={{ ...td, textAlign: 'center', color: 'var(--gray-700)' }}>{f}</td>
                <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: 'var(--red-primary)' }}>{t}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: 'var(--gray-50)', fontWeight: 700 }}>
            <td style={{ ...td, borderBottom: 'none' }}>Total</td>
            <td style={{ ...td, textAlign: 'center', borderBottom: 'none' }}>{row.total_male}</td>
            <td style={{ ...td, textAlign: 'center', borderBottom: 'none' }}>{row.total_female}</td>
            <td style={{ ...td, textAlign: 'center', color: 'var(--red-primary)', fontSize: '1rem', borderBottom: 'none' }}>
              {row.grand_total}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const th = { padding: '12px 16px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' };
const td = { padding: '10px 16px' };

export default function EnrollmentStatisticsPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollment-stats')
      .then(r => setYears(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // API returns newest-first (sort_order DESC); reverse for oldest-first trend arrows
  const totalsStrip = [...years].reverse();

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Enrollment Statistics</h1>
          <p>Historical enrollment data for Bacao Elementary School</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 960 }}>

          {loading ? (
            <div className="skeleton" style={{ width: '100%', height: 300, borderRadius: 10 }} />
          ) : years.length === 0 ? (
            <div className="alert alert-info">Enrollment statistics are being compiled. Please check back soon.</div>
          ) : (
            <>
              {/* Year-over-year summary strip */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
                {totalsStrip.map((y, i) => {
                  const prev = totalsStrip[i - 1];
                  const diff = prev ? y.grand_total - prev.grand_total : null;
                  return (
                    <div
                      key={y.id}
                      className="stat-card"
                      style={{
                        flex: '1 1 160px',
                        minWidth: 140,
                        padding: '16px 18px',
                        borderRadius: 12,
                        border: '1px solid var(--gray-100)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      <p style={{ fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#999', marginBottom: 6, fontWeight: 600 }}>
                        SY {y.school_year}
                      </p>
                      <p style={{ fontSize: '1.9rem', lineHeight: 1, fontWeight: 800, color: 'var(--gray-900)' }}>
                        {Number(y.grand_total).toLocaleString()}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        marginTop: 8,
                        fontWeight: 600,
                        color: diff === null ? '#888' : diff > 0 ? '#1a7f37' : diff < 0 ? 'var(--red-primary)' : '#888',
                      }}>
                        {diff !== null
                          ? (diff > 0 ? `▲ +${diff} from prev. SY` : diff < 0 ? `▼ ${diff} from prev. SY` : '— No change')
                          : 'Learners enrolled'}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* One card per school year (newest first) */}
              {years.map(y => (
                <div
                  key={y.id}
                  className="card"
                  style={{
                    padding: 32,
                    marginBottom: 32,
                    borderRadius: 14,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <h2 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--red-primary)',
                    marginBottom: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span style={{
                      background: 'var(--red-primary)',
                      color: '#fff',
                      borderRadius: 6,
                      padding: '3px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}>
                      SY {y.school_year}
                    </span>
                    Enrollment Count
                  </h2>

                  <EnrollTable row={y} />

                  <div style={{
                    marginTop: 16,
                    marginBottom: y.chart_image_url ? 28 : 0,
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap',
                    fontSize: '0.85rem',
                    color: 'var(--gray-700)',
                  }}>
                    <span>👨 <strong>{y.total_male}</strong> Male</span>
                    <span>👩 <strong>{y.total_female}</strong> Female</span>
                    <span style={{ fontWeight: 700, color: 'var(--red-primary)' }}>
                      Total: {Number(y.grand_total).toLocaleString()}
                    </span>
                  </div>

                  {y.chart_image_url && (
                    <div>
                      <div style={{ height: 1, background: 'var(--gray-100)', marginBottom: 24 }} />
                      <p style={{
                        fontSize: '0.72rem',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: '#999',
                        fontWeight: 600,
                        marginBottom: 10,
                      }}>
                        Enrollment Chart
                      </p>
                      <div style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid var(--gray-100)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      }}>
                        <img
                          src={getImageUrl(y.chart_image_url)}
                          alt={`Enrollment chart SY ${y.school_year}`}
                          style={{ width: '100%', display: 'block' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
