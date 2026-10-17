import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconScroll, IconDownload, IconScale, IconExternalLink } from '../../components/Icons';

/* ─── Admissions-style helpers (kept in this file) ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
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

// Highlights the section in view; returns [activeId, scrollTo]
function useScrollSpy(ids, enabled = true) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    if (!enabled || !ids.length) return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  const scrollTo = (id) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  return [active, scrollTo];
}

function PageHero({ tag, title, intro, aside, extra, wide }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide && aside ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '72px 24px 72px 96px' : '40px 20px 40px 40px' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{tag}</span>
          <h1 style={{ margin: '22px 0 16px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: '46ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>{intro}</p>
          {extra && <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>{extra}</div>}
        </div>
        {aside}
      </div>
    </header>
  );
}

// The torn "ticket" card: one headline fact + a few supporting rows
function Ticket({ Icon, label, value, sub, rows = [], wide, ariaLabel }) {
  return (
    <aside aria-label={ariaLabel || label} style={{ ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
      <div style={{ padding: '26px 28px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 52, height: 52, borderRadius: 12, background: '#FBE3E3', color: C.red }}><Icon size={26} /></span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>{label}</p>
          <p style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15 }}>{value}</p>
          {sub && <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: C.muted }}>{sub}</p>}
        </div>
      </div>
      {rows.length > 0 && (
        <>
          <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
          </div>
          <dl style={{ margin: 0, padding: '8px 28px 18px' }}>
            {rows.map(({ Icon: RI, label: l, value: v }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <span style={{ color: C.red, display: 'flex', width: 18, justifyContent: 'center' }}><RI size={18} /></span>
                <dt style={{ flex: 1, fontSize: '0.88rem', color: C.muted }}>{l}</dt>
                <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right', minWidth: 0 }}>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </aside>
  );
}

function TabBar({ items, active, onSelect, label = 'Page sections' }) {
  return (
    <nav aria-label={label} style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
      <div className="container" style={{ maxWidth: 960, display: 'flex', gap: 4, overflowX: 'auto', padding: '0 16px' }}>
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} type="button" onClick={() => onSelect(it.id)} aria-current={on ? 'true' : undefined}
              style={{ whiteSpace: 'nowrap', padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Heading with an icon in the red double-rule "notebook margin"
function SectionHead({ Icon, title, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', flex: 'none', paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red }}>
        <Icon size={22} />
      </span>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.1 }}>{title}</h2>
        {note && <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: C.muted }}>{note}</p>}
      </div>
    </div>
  );
}

function Notice({ Icon, title, children }) {
  return (
    <div style={{ ...card, padding: '24px 26px', borderLeft: `4px solid ${C.gold}`, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      {Icon && <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 44, height: 44, borderRadius: 10, background: '#FBE3E3', color: C.red }}><Icon size={20} /></span>}
      <div>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{title}</p>
        {children && <p style={{ margin: '6px 0 0', maxWidth: '58ch', lineHeight: 1.6, color: C.muted }}>{children}</p>}
      </div>
    </div>
  );
}

function Chip({ children, strong }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline', padding: '5px 13px', borderRadius: 999, background: C.cream, border: `1px solid ${C.line}`, fontSize: 13, color: C.muted, whiteSpace: 'nowrap' }}>
      {children}{strong && <strong style={{ color: C.ink }}>{strong}</strong>}
    </span>
  );
}

const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '56px 0 0' : '40px 0 0' });

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

const TOTAL_DOCS = 16;

export default function CitizensCharterPage() {
  const wide = useWide();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/charter')
      .then((r) => setDocuments(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [active, go] = useScrollSpy(['documents', 'legal'], !loading);
  const q = query.trim().toLowerCase();
  const shown = q ? documents.filter((d) => `${d.title} ${d.description || ''}`.toLowerCase().includes(q)) : documents;
  const withPdf = documents.filter((d) => d.pdf_url).length;

  const ticket = (
    <Ticket wide={wide} Icon={IconScroll} ariaLabel="Charter documents at a glance"
      label="Charter documents posted"
      value={loading ? '…' : `${documents.length} of ${TOTAL_DOCS}`}
      sub={!loading && documents.length > 0 ? `${withPdf} with a downloadable PDF` : undefined}
      rows={[
        { Icon: IconScale, label: 'Law', value: 'RA 11032' },
        { Icon: IconScale, label: 'Agency', value: 'ARTA' },
      ]} />
  );

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
      <PageHero wide={wide} tag="Citizen's Charter" title="Our service standards, in the open."
        intro="What each school service needs, how long it takes, and what it costs, as required by law." aside={ticket}
        extra={<><Chip>RA 11032</Chip><Chip>Anti-Red Tape Act</Chip></>} />

      <TabBar items={[{ id: 'documents', label: 'Documents' }, { id: 'legal', label: 'Legal basis' }]} active={active} onSelect={go} />

      <main className="container" style={mainBox(wide)}>
        <section id="documents" style={{ ...sectionPad(wide), paddingTop: wide ? 48 : 32 }}>
          <SectionHead Icon={IconScroll} title="Charter documents"
            note={!loading && documents.length > 0 ? `${documents.length} of ${TOTAL_DOCS} documents available` : undefined} />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 12 }} />)}
            </div>
          ) : documents.length === 0 ? (
            <Notice Icon={IconScroll} title="Charter documents are being prepared.">
              Check back soon, or contact the school office to ask for a copy.
            </Notice>
          ) : (
            <>
              {documents.length > 5 && (
                <label style={{ display: 'block', marginBottom: 18 }}>
                  <span style={{ position: 'absolute', left: -9999 }}>Search charter documents</span>
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px', font: 'inherit', color: C.ink, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, outlineColor: C.red }} />
                </label>
              )}
              {shown.length === 0 ? (
                <Notice title={`No documents match "${query}".`}>Try a shorter word, or clear the search.</Notice>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {shown.map((doc) => (
                    <article key={doc.id} style={{ ...card, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10, borderLeft: `4px solid ${doc.pdf_url ? C.red : C.line}` }}>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', lineHeight: 1.35, letterSpacing: '-0.01em' }}>{doc.title}</h3>
                      {doc.description && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: C.muted }}>{doc.description}</p>}
                      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                        {doc.pdf_url ? (
                          <a href={getImageUrl(doc.pdf_url)} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 9, background: C.red, color: '#fff', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                            <IconDownload size={15} /> View or download PDF
                          </a>
                        ) : (
                          <Chip>PDF not uploaded yet</Chip>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section id="legal" style={sectionPad(wide)}>
          <SectionHead Icon={IconScale} title="Legal basis" />
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ height: 6, background: GRAD }} />
            <div style={{ padding: wide ? '28px 32px' : '22px 20px', lineHeight: 1.7, fontSize: 15.5 }}>
              <p style={{ margin: '0 0 14px', maxWidth: '68ch' }}>
                Republic Act No. 11032 (Ease of Doing Business and Efficient Government Service Delivery Act of 2018), Section 6, requires government agencies, including public schools, to publish their Citizen's Charter on their official website.
              </p>
              <p style={{ margin: '0 0 14px', maxWidth: '68ch', color: C.muted }}>
                The requirement builds on the earlier Anti-Red Tape Act (RA 9485) and is consistent with Executive Order No. 2, s. 2016 on Freedom of Information.
              </p>
              <p style={{ margin: 0 }}>
                The official DepEd Citizen's Charter is at{' '}
                <a href="https://www.deped.gov.ph" target="_blank" rel="noopener noreferrer"
                  style={{ color: C.red, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  www.deped.gov.ph <IconExternalLink size={13} />
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
