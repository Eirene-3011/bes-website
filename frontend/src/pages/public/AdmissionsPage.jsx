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

/* ─── Content (unchanged) ─────────────────────────────────── */
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
  { id: 'requirements', num: '01', label: 'Requirements' },
  { id: 'process', num: '02', label: 'Process' },
  { id: 'schedule', num: '03', label: 'Schedule' },
  { id: 'apply', num: '04', label: 'Apply' },
];

/* ─── Theme: same identity as the Header and HomePage ──────── */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
  ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923',
  goldText: '#8A5A00',
  paper: '#FFF4C7',
  cream: '#FFFBEA',
  muted: '#6B4A44',
  line: 'rgba(142, 18, 24, 0.14)',
  rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)',
};
const GRAD = 'var(--grad-masthead, linear-gradient(135deg, #5E0B10, #A8161B))';
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
const secNum = {
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'stretch', flex: 'none',
  minWidth: 44, paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`,
  color: C.red, fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
};

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

/* ─── Small pieces ─────────────────────────────────────────── */
function ChevronIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHead({ num, eyebrow, title, Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 28 }}>
      <span aria-hidden="true" style={secNum}>{num}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={15} />}{eyebrow}
        </p>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', lineHeight: 1.1 }}>{title}</h2>
      </div>
    </div>
  );
}

function Accordion({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, marginTop: 20, overflow: 'hidden', background: '#fff' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', background: open ? C.paper : C.cream, border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: C.ink, transition: 'background 0.2s ease' }}>
        <span>
          <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{title}</span>
          {subtitle && <span style={{ display: 'block', fontSize: 12.5, color: C.muted, marginTop: 2 }}>{subtitle}</span>}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div style={{ padding: '8px 18px 18px' }}>{children}</div>}
    </div>
  );
}

function CheckRow({ checked, onToggle, children, sub }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={onToggle}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%', textAlign: 'left', padding: '16px 18px', marginBottom: 10, font: 'inherit', color: C.ink, cursor: 'pointer',
        background: checked ? C.cream : '#fff', border: `1px solid ${checked ? 'rgba(142, 18, 24, 0.3)' : C.line}`, borderRadius: 10, transition: 'background 0.2s ease, border-color 0.2s ease' }}>
      <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 26, height: 26, marginTop: 1, borderRadius: 8,
        border: `2px solid ${checked ? C.red : 'rgba(142, 18, 24, 0.35)'}`, background: checked ? C.red : '#fff', color: '#fff', transition: 'all 0.2s ease' }}>
        {checked && <IconCheck size={14} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14.5, lineHeight: 1.5, fontWeight: 600, textDecoration: checked ? 'line-through' : 'none', textDecorationColor: 'rgba(142, 18, 24, 0.4)', opacity: checked ? 0.75 : 1 }}>{children}</span>
        {sub && <span style={{ display: 'block', fontSize: 13, color: C.muted, marginTop: 4 }}>Where to get it: {sub}</span>}
      </span>
    </button>
  );
}

function Chip({ label, value }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline', padding: '4px 12px', borderRadius: 999, background: C.cream, border: `1px solid ${C.line}`, fontSize: 12.5, color: C.muted, whiteSpace: 'nowrap' }}>
      {label}<strong style={{ color: C.ink }}>{value}</strong>
    </span>
  );
}

function ApplyLink({ href, style, children }) {
  return href.startsWith('/')
    ? <Link to={href} style={style}>{children}</Link>
    : <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{children}</a>;
}

/* ════════════════════════════════════════════════════════════ */
export default function AdmissionsPage() {
  const wide = useWide();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [ready, setReady] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    api.get('/enrollment')
      .then((r) => setInfo(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    QUICK_NAV.forEach(({ id }) => { const el = sectionRefs.current[id]; if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading]);

  const scrollToSection = (id) => sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const toggle = (i) => setReady((r) => ({ ...r, [i]: !r[i] }));

  const readyCount = STANDARD_REQUIREMENTS.filter((_, i) => ready[i]).length;
  const allReady = readyCount === STANDARD_REQUIREMENTS.length;
  const contact = loading ? '…' : (info?.contact_number || '(046) 472-5307');
  const onlineEnrollmentLink = info?.online_enrollment_link || DEFAULT_ONLINE_ENROLLMENT_LINK;

  const ticketRows = [
    { Icon: IconBuilding, label: 'School type', value: 'Public Elementary' },
    { Icon: IconBook, label: 'Grade levels', value: 'Kinder to Grade 6' },
    { Icon: IconCalendar, label: 'Processing time', value: TOTAL_PROCESSING.time },
    { Icon: IconPhone, label: 'Contact', value: contact },
  ];
  const charter = [
    ['Office', CHARTER_INFO.office],
    ['Classification', CHARTER_INFO.classification],
    ['Transaction', CHARTER_INFO.transactionType],
    ['Who may avail', CHARTER_INFO.whoMayAvail],
  ];
  const sectionStyle = { scrollMarginTop: 72, padding: wide ? '64px 0 0' : '44px 0 0' };
  const bigBtn = { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 28px', borderRadius: 10, fontWeight: 800, fontSize: '1rem', textDecoration: 'none', background: '#fff', color: C.ink, boxShadow: '0 10px 22px rgba(0, 0, 0, 0.25)' };

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: wide ? 96 : 120 }}>

      {/* ══ HERO: legal pad + the "enrollment ticket" ══ */}
      <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
        <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '72px 24px 72px 96px' : '40px 20px 40px 40px' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>
              Admissions &amp; Enrollment
            </span>
            <h2 style={{ margin: '22px 0 16px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, fontSize: 'clamp(2.6rem, 6.4vw, 4.6rem)' }}>
              Enrolling is easy, and it is free.
            </h2>
            <p style={{ margin: '0 0 28px', maxWidth: '46ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>
              Everything you need to enroll at Bacao Elementary School: what to prepare, how we process it, and where to apply.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button type="button" onClick={() => scrollToSection('requirements')}
                style={{ padding: '14px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 800, color: '#fff', background: C.red, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.25)' }}>
                See what to prepare
              </button>
              <ApplyLink href={onlineEnrollmentLink} style={{ padding: '12px 24px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', color: C.ink, border: `2px solid ${C.ink}` }}>
                Go to online enrollment
              </ApplyLink>
            </div>
          </div>

          {/* The ticket */}
          <aside aria-label="Enrollment at a glance" style={{ position: 'relative', ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
            <div style={{ padding: '26px 28px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 12, background: '#FBE3E3', color: C.red }}><IconCoins size={26} /></span>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>Enrollment fee</p>
                <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>₱0</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: C.muted }}>Public school, no fees to be paid</p>
              </div>
            </div>
            <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
              <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
            </div>
            <dl style={{ margin: 0, padding: '8px 28px 18px' }}>
              {ticketRows.map(({ Icon, label, value }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                  <span style={{ color: C.red, display: 'flex' }}><Icon size={18} /></span>
                  <dt style={{ flex: 1, fontSize: '0.88rem', color: C.muted }}>{label}</dt>
                  <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right' }}>{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </header>

      {/* ══ Sticky section tabs ══ */}
      <nav aria-label="Admissions sections" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
        <div className="container" style={{ maxWidth: 960, display: 'flex', gap: wide ? 8 : 2, overflowX: 'auto', padding: '0 16px' }}>
          {QUICK_NAV.map((item) => {
            const on = activeSection === item.id;
            return (
              <button key={item.id} type="button" onClick={() => scrollToSection(item.id)} aria-current={on ? 'true' : undefined}
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 8, padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
                <span style={{ color: C.red, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{item.num}</span>{item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="container" style={{ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' }}>

        {/* Charter details */}
        <dl style={{ margin: wide ? '40px 0 0' : '28px 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 0, ...card }}>
          {charter.map(([k, v], i) => (
            <div key={k} style={{ padding: '18px 22px', borderLeft: i && wide ? `1px solid ${C.line}` : 'none', borderTop: i && !wide ? `1px solid ${C.line}` : 'none' }}>
              <dt style={{ fontSize: '0.8rem', fontWeight: 700, color: C.muted }}>{k}</dt>
              <dd style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '0.95rem' }}>{v}</dd>
            </div>
          ))}
        </dl>

        {/* 01 Requirements */}
        <section id="requirements" ref={(el) => (sectionRefs.current.requirements = el)} style={sectionStyle}>
          <SectionHead num="01" eyebrow="Prepare these" title="Enrollment Requirements" Icon={IconClipboard} />
          {info?.requirements_richtext ? (
            <div className="rich-content" style={{ ...card, padding: wide ? 32 : 20 }} dangerouslySetInnerHTML={{ __html: info.requirements_richtext }} />
          ) : (
            <div>
              <div style={{ ...card, padding: wide ? '22px 26px' : '18px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 220px' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{allReady ? 'You have everything ready.' : 'Tick off what you already have.'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13.5, color: C.muted }}>{readyCount} of {STANDARD_REQUIREMENTS.length} required documents ready</p>
                </div>
                <div role="progressbar" aria-valuemin={0} aria-valuemax={STANDARD_REQUIREMENTS.length} aria-valuenow={readyCount} style={{ flex: '1 1 180px', height: 12, borderRadius: 6, background: '#F3EAE8', overflow: 'hidden' }}>
                  <div style={{ width: `${(readyCount / STANDARD_REQUIREMENTS.length) * 100}%`, height: '100%', background: GRAD, borderRadius: 6, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                </div>
              </div>

              {STANDARD_REQUIREMENTS.map((item, i) => (
                <CheckRow key={item.doc} checked={!!ready[i]} onToggle={() => toggle(i)} sub={item.where}>{item.doc}</CheckRow>
              ))}

              <Accordion title="If a PSA Birth Certificate is not available" subtitle={`Tap to see ${ALTERNATIVE_REQUIREMENTS.length} accepted alternatives`}>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {ALTERNATIVE_REQUIREMENTS.map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 12, padding: '11px 0', borderTop: `1px solid ${C.line}`, fontSize: 14, lineHeight: 1.5 }}>
                      <span style={{ color: C.red, marginTop: 2, display: 'flex' }}><IconCheck size={14} /></span>{item}
                    </li>
                  ))}
                </ul>
              </Accordion>

              <h3 style={{ margin: '32px 0 12px', fontSize: '1.05rem', fontWeight: 800 }}>Special cases</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {SPECIAL_CASE_REQUIREMENTS.map((sc) => (
                  <div key={sc.condition} style={{ ...card, padding: '18px 20px', borderLeft: `4px solid ${C.red}` }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 14.5 }}>{sc.condition}</p>
                    <p style={{ margin: '0 0 6px', fontSize: 13.5, lineHeight: 1.5 }}>Required: {sc.doc}</p>
                    <p style={{ margin: 0, fontSize: 12.5, color: C.muted }}>Where to get it: {sc.where}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 02 Process */}
        <section id="process" ref={(el) => (sectionRefs.current.process = el)} style={sectionStyle}>
          <SectionHead num="02" eyebrow="What happens next" title="Enrollment Process" Icon={IconListOrdered} />
          {info?.process_richtext ? (
            <div className="rich-content" style={{ ...card, padding: wide ? 32 : 20 }} dangerouslySetInnerHTML={{ __html: info.process_richtext }} />
          ) : (
            <div>
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} style={{ ...card, overflow: 'hidden' }}>
                  <div style={{ padding: wide ? '22px 28px' : '18px 18px', background: GRAD, color: '#fff' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, opacity: 0.85 }}>Your step {idx + 1}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.05rem', lineHeight: 1.5, fontWeight: 600 }}>{step.clientStep}</p>
                  </div>
                  <ol style={{ margin: 0, padding: wide ? '8px 28px' : '4px 18px', listStyle: 'none' }}>
                    {step.actions.map((a, ai) => (
                      <li key={ai} style={{ display: 'flex', gap: 16, padding: '20px 0', borderTop: ai ? `1px solid ${C.line}` : 'none' }}>
                        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 32, height: 32, borderRadius: '50%', background: C.paper, color: C.deep, fontWeight: 800, fontSize: 14 }}>{ai + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, lineHeight: 1.5 }}>{a.action}</p>
                          {a.note && <p style={{ margin: '6px 0 0', fontSize: 13.5, color: C.goldText }}>Note: {a.note}</p>}
                          <p style={{ margin: '6px 0 12px', fontSize: 13, color: C.muted }}>Handled by: {a.responsible}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <Chip label="Fee " value={a.fee} />
                            <Chip label="Time " value={a.time} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, borderRadius: 12, background: C.paper, border: `1px solid ${C.line}`, fontWeight: 800 }}>
                <span>Total</span>
                <span>Fee: {TOTAL_PROCESSING.fee} · Processing time: {TOTAL_PROCESSING.time}</span>
              </div>
            </div>
          )}
        </section>

        {/* 03 Schedule */}
        <section id="schedule" ref={(el) => (sectionRefs.current.schedule = el)} style={sectionStyle}>
          <SectionHead num="03" eyebrow="Mark your calendar" title="Enrollment Schedule" Icon={IconCalendar} />
          {(info?.schedule || !loading) && (
            <div style={{ ...card, padding: wide ? '26px 30px' : '20px 18px', display: 'flex', gap: 18, alignItems: 'flex-start', borderLeft: `4px solid ${info?.schedule ? C.red : C.line}` }}>
              <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 44, height: 44, borderRadius: 10, background: '#FBE3E3', color: C.red }}><IconCalendar size={20} /></span>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: info?.schedule ? C.ink : C.muted }}>
                {info?.schedule || 'No schedule has been posted yet. Check back soon, or contact the school directly.'}
              </p>
            </div>
          )}
        </section>

        {/* 04 Apply */}
        <section id="apply" ref={(el) => (sectionRefs.current.apply = el)} style={sectionStyle}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, color: '#fff', background: GRAD, boxShadow: '0 24px 48px rgba(94, 11, 16, 0.28)' }}>
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(255, 255, 255, 0.07) 35px, rgba(255, 255, 255, 0.07) 36px)' }} />
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 40 : 14, width: 5, boxSizing: 'border-box', borderLeft: '1px solid rgba(255, 255, 255, 0.4)', borderRight: '1px solid rgba(255, 255, 255, 0.4)' }} />
            <div style={{ position: 'relative', padding: wide ? '52px 48px 52px 88px' : '36px 22px 36px 40px' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, opacity: 0.85 }}>04 · Apply</p>
              <h2 style={{ margin: '8px 0 12px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, fontSize: 'clamp(2rem, 4.6vw, 3.2rem)' }}>
                {allReady ? 'You are all set. Let’s enroll.' : 'Ready when you are.'}
              </h2>
              <p style={{ margin: '0 0 26px', maxWidth: '46ch', fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9 }}>
                Submit your documents through the official online enrollment portal. The school will update you on your status within about an hour.
              </p>
              <ApplyLink href={onlineEnrollmentLink} style={bigBtn}>
                <IconMonitor size={20} />
                Online Enrollment Portal
              </ApplyLink>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile floating apply button */}
      {!wide && (
        <ApplyLink href={onlineEnrollmentLink}
          style={{ position: 'fixed', bottom: 20, left: 16, right: 16, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 20px', borderRadius: 12, background: C.red, color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 22px rgba(94, 11, 16, 0.35)' }}>
          <IconMonitor size={18} />
          Apply for Enrollment
        </ApplyLink>
      )}
    </div>
  );
}
