import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  IconBuilding,
  IconBook,
  IconCoins,
  IconPhone,
  IconClipboard,
  IconListOrdered,
  IconMonitor,
  IconCheck,
  IconCalendar,
} from '../../components/Icons';

const CHARTER_INFO = {
  office: 'Bacao Elementary School',
  classification: 'Simple',
  transactionType: 'G2C (Government to Citizen)',
  whoMayAvail: 'Learners / Parents / Guardians',
};

// No BES online enrollment form supplied yet: falls back to the Contact page. Set via school info when available.
const DEFAULT_ONLINE_ENROLLMENT_LINK = '/contact';

// Standard enrollment requirements per DepEd policy
const STANDARD_REQUIREMENTS = [
  {
    doc: 'Basic Education Enrollment Form (BEEF) — One (1) scanned copy (digital copy)',
    where: 'Downloadable from the school or the DepEd enrollment platform',
  },
  {
    doc: 'Confirmation Slip — One (1) scanned copy (digital copy)',
    where: 'School',
  },
  {
    doc: 'PSA Birth Certificate (formerly NSO) — One (1) original copy and one (1) photocopy',
    where: 'Philippine Statistics Authority / Local Civil Registrar',
  },
];

const ALTERNATIVE_REQUIREMENTS = [
  'National ID — One (1) original copy for verification, and one (1) photocopy',
  'Certificate of Live Birth (Local Civil Registry) — One (1) original copy and one (1) photocopy',
  'PhilHealth ID — One (1) original copy for verification, and one (1) photocopy',
  'Marriage Certificate of parents — One (1) original copy for verification, and one (1) photocopy',
  'PWD ID — One (1) original copy for verification, and one (1) photocopy',
  'Barangay certification establishing the child\'s identity (name, date of birth, sex, and name of parents)',
  'Affidavit of undertaking to be executed by parents — One (1) original copy and one (1) photocopy',
  'Baptismal Certificate — One (1) original copy and one (1) photocopy',
];

const SPECIAL_CASE_REQUIREMENTS = [
  {
    condition: 'Displaced learners due to calamities or conflict',
    doc: 'SF9 or SF10, subject to availability',
    where: 'School',
  },
  {
    condition: 'Persons Deprived of Liberty (PDLs) enrolling in ALS',
    doc: 'Certificate of PDL\'s Identity — One (1) original copy (if PSA Birth Certificate or secondary documents are not available)',
    where: 'Bureau of Jail Management and Penology — Office of the Warden',
  },
];

const PROCESS_STEPS = [
  {
    clientStep: 'Submit complete documents through the School\'s official platform or email address, along with the filled-out BEEF.',
    actions: [
      {
        action: 'Download and print received documents, and check for completion.',
        note: 'If requirements are incomplete, tag as temporarily enrolled.',
        fee: 'None',
        time: '1 hour',
        responsible: 'Registrar / Teacher-in-Charge / Adviser',
      },
      {
        action: 'Provide client with the status of enrollment.',
        fee: 'None',
        time: '5 minutes',
        responsible: 'Registrar / Teacher-in-Charge / Adviser',
      },
      {
        action: 'Endorse the list of enrollees to the school records/registrar team for Kinder–Grade 6 and transferee processing.',
        fee: 'None',
        time: '5 minutes',
        responsible: 'Registrar / Teacher-in-Charge / Adviser',
      },
    ],
  },
];

const TOTAL_PROCESSING = { fee: 'None', time: '1 hour, 10 minutes' };

const QUICK_NAV = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'process', label: 'Process' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'apply', label: 'Apply' },
];

function ChevronIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 180ms ease',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Accordion({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        border: '1px solid var(--gray-200)',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          background: 'var(--gray-50)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        <span>
          <span style={{ display: 'block', fontWeight: 600, fontSize: 13 }}>{title}</span>
          {subtitle && (
            <span style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 2 }}>{subtitle}</span>
          )}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div style={{ padding: '16px' }}>{children}</div>}
    </div>
  );
}

export default function AdmissionsPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    api.get('/enrollment')
      .then(r => setInfo(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    QUICK_NAV.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const stats = [
    { Icon: IconBuilding, label: 'School Type', value: 'Public Elementary' },
    { Icon: IconBook, label: 'Grade Levels', value: 'Kinder through Grade 6' },
    { Icon: IconCoins, label: 'Fees to be Paid', value: 'None — Public School', highlight: true },
    { Icon: IconPhone, label: 'Contact', value: info?.contact_number || '(046) 472-5307' },
  ];

  const onlineEnrollmentLink = info?.online_enrollment_link || DEFAULT_ONLINE_ENROLLMENT_LINK;

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Admissions &amp; Enrollment</h1>
          <p>Everything you need to know about enrolling at Bacao Elementary School</p>
        </div>
      </div>

      {/* Sticky quick-nav */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#fff',
          borderBottom: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: 900,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '10px 24px',
          }}
        >
          {QUICK_NAV.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                borderColor: activeSection === item.id ? 'var(--red-primary)' : 'var(--gray-200)',
                background: activeSection === item.id ? 'var(--red-primary)' : '#fff',
                color: activeSection === item.id ? '#fff' : 'var(--gray-700)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>

          {/* Quick stats */}
          <div className="stat-grid">
            {stats.map(s => (
              <div key={s.label} className={`stat-card${s.highlight ? ' stat-card-highlight' : ''}`}>
                <div className="stat-card-icon" aria-hidden="true"><s.Icon size={22} /></div>
                <p className="stat-card-label">{s.label}</p>
                {loading && s.label === 'Contact' ? (
                  <div className="skeleton" style={{ width: '70%', height: 14, margin: '0 auto' }} />
                ) : (
                  <p className="stat-card-value">{s.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Charter metadata */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <p className="stat-card-label">Office / Division</p>
                <p className="stat-card-value" style={{ fontSize: 14 }}>{CHARTER_INFO.office}</p>
              </div>
              <div>
                <p className="stat-card-label">Classification</p>
                <p className="stat-card-value" style={{ fontSize: 14 }}>{CHARTER_INFO.classification}</p>
              </div>
              <div>
                <p className="stat-card-label">Type of Transaction</p>
                <p className="stat-card-value" style={{ fontSize: 14 }}>{CHARTER_INFO.transactionType}</p>
              </div>
              <div>
                <p className="stat-card-label">Who May Avail</p>
                <p className="stat-card-value" style={{ fontSize: 14 }}>{CHARTER_INFO.whoMayAvail}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div
            id="requirements"
            ref={el => (sectionRefs.current.requirements = el)}
            className="card"
            style={{ padding: 32, marginBottom: 24, scrollMarginTop: 72 }}
          >
            <h2 className="section-card-title">
              <span className="section-card-title-icon"><IconClipboard size={18} /></span>
              Enrollment Requirements
            </h2>

            {info?.requirements_richtext ? (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: info.requirements_richtext }} />
            ) : (
              <div>
                <h3 className="stat-card-label" style={{ marginBottom: 8 }}>Standard Requirements</h3>
                <ul className="checklist" style={{ marginBottom: 24 }}>
                  {STANDARD_REQUIREMENTS.map(item => (
                    <li key={item.doc}>
                      <span className="checklist-icon" aria-hidden="true"><IconCheck size={13} /></span>
                      <span>
                        {item.doc}
                        <br />
                        <span style={{ opacity: 0.7, fontSize: 13 }}>Where to secure: {item.where}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <Accordion
                  title="If a PSA Birth Certificate is not available"
                  subtitle="Tap to see 8 accepted alternatives"
                >
                  <ul className="checklist">
                    {ALTERNATIVE_REQUIREMENTS.map(item => (
                      <li key={item}>
                        <span className="checklist-icon" aria-hidden="true"><IconCheck size={13} /></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Accordion>

                <h3 className="stat-card-label" style={{ marginBottom: 8, marginTop: 24 }}>Special Cases</h3>
                {SPECIAL_CASE_REQUIREMENTS.map(sc => (
                  <div
                    key={sc.condition}
                    style={{
                      marginBottom: 12,
                      padding: '12px 16px',
                      background: 'var(--gray-50)',
                      borderRadius: 8,
                      border: '1px solid var(--gray-200)',
                      borderLeft: '3px solid var(--red-primary)',
                    }}
                  >
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{sc.condition}</p>
                    <p style={{ fontSize: 13, marginBottom: 3 }}>Required: {sc.doc}</p>
                    <p style={{ fontSize: 12, opacity: 0.7 }}>Where to secure: {sc.where}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrollment Process */}
          <div
            id="process"
            ref={el => (sectionRefs.current.process = el)}
            className="card"
            style={{ padding: 32, marginBottom: 24, scrollMarginTop: 72 }}
          >
            <h2 className="section-card-title">
              <span className="section-card-title-icon"><IconListOrdered size={18} /></span>
              Enrollment Process
            </h2>

            {info?.process_richtext ? (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: info.process_richtext }} />
            ) : (
              <div>
                {PROCESS_STEPS.map((step, idx) => (
                  <div key={idx} style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
                    {/* Timeline rail */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'var(--red-primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>
                      {idx < PROCESS_STEPS.length - 1 && (
                        <div style={{ flex: 1, width: 2, background: 'var(--gray-200)', marginTop: 4 }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          padding: '10px 16px',
                          background: 'var(--red-pale)',
                          borderRadius: 8,
                          marginBottom: 16,
                          border: '1px solid var(--red-light)',
                        }}
                      >
                        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--red-dark)' }}>Client Step {idx + 1}</p>
                        <p style={{ fontSize: 14, color: 'var(--red-dark)' }}>{step.clientStep}</p>
                      </div>

                      <div>
                        {step.actions.map((a, ai) => (
                          <div
                            key={ai}
                            className="process-action-row"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto auto',
                              gap: '10px 20px',
                              padding: '12px 0',
                              borderBottom: '1px solid var(--gray-100)',
                              fontSize: 13,
                            }}
                          >
                            <div>
                              <p style={{ fontWeight: 600, marginBottom: 4 }}>Step {ai + 1}: {a.action}</p>
                              {a.note && <p style={{ opacity: 0.7, fontSize: 12 }}>Note: {a.note}</p>}
                              <p style={{ opacity: 0.7, fontSize: 12 }}>By: {a.responsible}</p>
                            </div>
                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <span className="process-action-label">Fee: </span>
                              <span style={{ fontWeight: 600 }}>{a.fee}</span>
                            </div>
                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <span className="process-action-label">Time: </span>
                              <span style={{ fontWeight: 600 }}>{a.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <span>Total</span>
                  <span>Fee: {TOTAL_PROCESSING.fee} · Processing Time: {TOTAL_PROCESSING.time}</span>
                </div>
              </div>
            )}
          </div>

          {/* Enrollment schedule (from admin if set) */}
          <div
            id="schedule"
            ref={el => (sectionRefs.current.schedule = el)}
            style={{ scrollMarginTop: 72 }}
          >
            {info?.schedule ? (
              <div className="note-panel" style={{ marginBottom: 24 }}>
                <div className="note-panel-icon"><IconCalendar size={18} /></div>
                <div>
                  <h3 className="note-panel-title">Enrollment Schedule</h3>
                  <p>{info.schedule}</p>
                </div>
              </div>
            ) : (
              !loading && (
                <div className="note-panel" style={{ marginBottom: 24, opacity: 0.75 }}>
                  <div className="note-panel-icon"><IconCalendar size={18} /></div>
                  <div>
                    <h3 className="note-panel-title">Enrollment Schedule</h3>
                    <p>No schedule has been posted yet. Check back soon, or contact the school directly.</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Primary CTA — Online Enrollment only */}
          <div id="apply" ref={el => (sectionRefs.current.apply = el)} style={{ scrollMarginTop: 72 }}>
            <a
              href={onlineEnrollmentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <IconMonitor size={18} />
              Online Enrollment Portal
            </a>
          </div>

          <div className="divider" />

        </div>
      </section>

      {/* Mobile floating apply button */}
      <a
        href={onlineEnrollmentLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-apply-fab"
        style={{
          position: 'fixed',
          bottom: 20,
          left: 16,
          right: 16,
          zIndex: 30,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '14px 20px',
          borderRadius: 12,
          background: 'var(--red-primary)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        }}
      >
        <IconMonitor size={18} />
        Apply for Enrollment
      </a>

      <style>{`
        @media (max-width: 640px) {
          .process-action-row {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
          }
          .process-action-row > div:nth-child(2),
          .process-action-row > div:nth-child(3) {
            text-align: left !important;
          }
          .mobile-apply-fab {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
