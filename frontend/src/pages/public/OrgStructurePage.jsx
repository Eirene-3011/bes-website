import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconLayers, IconUsers, IconUser, IconBook } from '../../components/Icons';

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

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23FBE3E3"/><circle cx="40" cy="30" r="16" fill="%23C98A8D"/><ellipse cx="40" cy="62" rx="24" ry="16" fill="%23C98A8D"/></svg>';

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

function Avatar({ src, name, size = 72, ring = true }) {
  const style = { width: size, height: size, borderRadius: '50%', flex: 'none', objectFit: 'cover', background: '#FBE3E3', border: ring ? `3px solid #fff` : 'none', boxShadow: ring ? `0 0 0 1px ${C.line}` : 'none' };
  return src
    ? <img src={src} alt={name} style={style} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_AVATAR; }} />
    : <span aria-hidden="true" style={{ ...style, display: 'grid', placeItems: 'center', color: C.red }}><IconUser size={size * 0.45} /></span>;
}

const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '56px 0 0' : '40px 0 0' });

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

const GRADE_LEVELS = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'SPED', 'Non-Teaching'];

function LeaderCard({ role, name, position, photo, onOpen }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`View profile for ${name}`}
      style={{ ...card, display: 'flex', alignItems: 'center', gap: 20, padding: '22px 24px', textAlign: 'left', cursor: 'pointer', font: 'inherit', borderLeft: `4px solid ${C.red}` }}>
      <Avatar size={80} name={name} src={photo ? getImageUrl(photo) : null} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.red }}>{role}</span>
        <span style={{ display: 'block', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', margin: '2px 0' }}>{name}</span>
        {position && <span style={{ display: 'block', fontSize: 14, color: C.muted }}>{position}</span>}
      </span>
    </button>
  );
}

export default function OrgStructurePage() {
  const wide = useWide();
  const [orgChart, setOrgChart] = useState(null);
  const [staff, setStaff] = useState([]);
  const [info, setInfo] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [chartFailed, setChartFailed] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/org-chart'),
      api.get('/staff'),
      api.get('/school-info'),
      api.get('/officials').catch(() => ({ data: [] })),
    ]).then(([o, s, i, off]) => {
      setOrgChart(o.data);
      setStaff(s.data);
      setInfo(i.data);
      setOfficials(off.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // School Head & Admin Officer come from the officials table (that is where photo_url lives)
  const schoolHead = officials.find((o) => o.full_name === info?.principal_name)
    || officials.find((o) => o.position && o.position.toLowerCase().includes('principal'));
  const adminOfficer = officials.find((o) => o.position && o.position.toLowerCase().includes('administrative officer'));

  const fromOfficial = (o) => ({ full_name: o.full_name, position_subject: o.position, section_name: o.department_office, photo_url: o.photo_url });
  const leaders = [
    info?.principal_name && {
      role: 'School Head', name: info.principal_name, position: info.principal_title, photo: schoolHead?.photo_url,
      profile: schoolHead ? fromOfficial(schoolHead) : { full_name: info.principal_name, position_subject: info.principal_title },
    },
    adminOfficer && { role: 'Admin Officer', name: adminOfficer.full_name, position: adminOfficer.position, photo: adminOfficer.photo_url, profile: fromOfficial(adminOfficer) },
  ].filter(Boolean);

  // Modal: Escape closes, background scroll locked, focus moves to the close button
  const onKey = useCallback((e) => { if (e.key === 'Escape') setSelected(null); }, []);
  useEffect(() => {
    if (!selected) return undefined;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [selected, onKey]);

  // Group staff by grade level
  const grouped = GRADE_LEVELS.reduce((acc, gl) => {
    const members = staff.filter((m) => m.department_grade_level === gl);
    if (members.length) acc[gl] = members;
    return acc;
  }, {});
  [...new Set(staff.map((m) => m.department_grade_level).filter((k) => k && !GRADE_LEVELS.includes(k)))]
    .forEach((k) => { grouped[k] = staff.filter((m) => m.department_grade_level === k); });
  const groupKeys = Object.keys(grouped);
  const visibleKeys = filter === 'All' ? groupKeys : groupKeys.filter((k) => k === filter);

  const tabs = [
    { id: 'chart', label: 'Org chart' },
    ...(leaders.length ? [{ id: 'leaders', label: 'School leaders' }] : []),
    { id: 'directory', label: 'Faculty & staff' },
  ];
  const [active, go] = useScrollSpy(tabs.map((t) => t.id), !loading);

  const ticket = (
    <Ticket wide={wide} Icon={IconUsers} ariaLabel="Faculty and staff at a glance"
      label="Faculty and staff listed"
      value={loading ? '…' : staff.length > 0 ? staff.length : 'Being updated'}
      rows={!loading ? [
        info?.principal_name && { Icon: IconUser, label: 'School head', value: info.principal_name },
        groupKeys.length > 0 && { Icon: IconBook, label: 'Grade levels and units', value: groupKeys.length },
      ].filter(Boolean) : []} />
  );

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
      <PageHero wide={wide} tag="Organizational Structure" title="Who leads and teaches at BES."
        intro="School governance, the org chart, and our faculty and staff." aside={ticket} />

      {!loading && <TabBar items={tabs} active={active} onSelect={go} label="Page sections" />}

      <main className="container" style={mainBox(wide)}>
        {loading ? (
          <div style={{ paddingTop: 40 }}>
            <div className="skeleton" style={{ height: 320, borderRadius: 12, marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 110, borderRadius: 12 }} />
          </div>
        ) : (
          <>
            <section id="chart" style={{ ...sectionPad(wide), paddingTop: wide ? 48 : 32 }}>
              <SectionHead Icon={IconLayers} title="Org chart" />
              {orgChart?.image_url && !chartFailed ? (
                <div style={{ ...card, overflow: 'hidden' }}>
                  <img src={getImageUrl(orgChart.image_url)} alt="BES organizational chart" onError={() => setChartFailed(true)}
                    style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              ) : (
                <Notice Icon={IconLayers} title="The org chart has not been uploaded yet.">Check back soon.</Notice>
              )}
            </section>

            {leaders.length > 0 && (
              <section id="leaders" style={sectionPad(wide)}>
                <SectionHead Icon={IconUser} title="School leaders" note="Select a card to see their profile." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                  {leaders.map((l) => <LeaderCard key={l.role} {...l} onOpen={() => setSelected(l.profile)} />)}
                </div>
              </section>
            )}

            <section id="directory" style={sectionPad(wide)}>
              <SectionHead Icon={IconUsers} title="Faculty & staff" note="Teaching and non-teaching personnel, grouped by grade level. Select a profile to learn more." />

              {staff.length === 0 ? (
                <Notice Icon={IconUsers} title="The faculty and staff directory is being updated.">Check back soon.</Notice>
              ) : (
                <>
                  {groupKeys.length > 1 && (
                    <div role="group" aria-label="Filter by grade level" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                      {['All', ...groupKeys].map((k) => {
                        const on = filter === k;
                        return (
                          <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={on}
                            style={{ padding: '8px 16px', borderRadius: 999, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 13.5, color: on ? '#fff' : C.ink, background: on ? C.red : '#fff', border: `1px solid ${on ? C.red : C.line}`, transition: 'background 0.2s ease, color 0.2s ease' }}>
                            {k}{k !== 'All' && <span style={{ opacity: 0.75, fontWeight: 600 }}> {grouped[k].length}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {visibleKeys.map((k) => (
                    <div key={k} style={{ marginBottom: 36 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14, paddingLeft: 12, borderLeft: `5px double ${C.margin}` }}>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{k}</h3>
                        <span style={{ fontSize: 13, color: C.muted }}>{grouped[k].length} {grouped[k].length === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                        {grouped[k].map((m) => (
                          <button key={m.id} type="button" onClick={() => setSelected(m)} aria-label={`View profile for ${m.full_name}`}
                            style={{ ...card, padding: '20px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', cursor: 'pointer', font: 'inherit' }}>
                            <Avatar size={88} name={m.full_name} src={m.photo_url ? getImageUrl(m.photo_url) : null} />
                            <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>{m.full_name}</span>
                            {m.position_subject && <span style={{ fontSize: 13, color: C.red, fontWeight: 600 }}>{m.position_subject}</span>}
                            {m.section_name && <span style={{ fontSize: 12.5, color: C.muted }}>{m.section_name}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </section>
          </>
        )}
      </main>

      {/* Profile modal */}
      {selected && (
        <div onClick={() => setSelected(null)} role="presentation"
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(94, 11, 16, 0.55)' }}>
          <div role="dialog" aria-modal="true" aria-label={`${selected.full_name} profile`} onClick={(e) => e.stopPropagation()}
            style={{ ...card, position: 'relative', width: '100%', maxWidth: 400, overflow: 'hidden', textAlign: 'center', boxShadow: '0 30px 60px rgba(94, 11, 16, 0.35)' }}>
            <div style={{ height: 96, background: GRAD }} />
            <button ref={closeRef} type="button" onClick={() => setSelected(null)} aria-label="Close profile"
              style={{ position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 24, lineHeight: 1 }}>
              &times;
            </button>
            <div style={{ marginTop: -56, display: 'flex', justifyContent: 'center' }}>
              <Avatar size={112} name={selected.full_name} src={selected.photo_url ? getImageUrl(selected.photo_url) : null} />
            </div>
            <div style={{ padding: '14px 28px 28px' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em' }}>{selected.full_name}</h3>
              <p style={{ margin: '4px 0 0', color: C.red, fontWeight: 700 }}>{selected.position_subject || 'Position not listed'}</p>
              <dl style={{ margin: '20px 0 0', textAlign: 'left' }}>
                {[
                  selected.section_name && ['Section', selected.section_name],
                  selected.department_grade_level && ['Grade level', selected.department_grade_level],
                  !!selected.years_in_service && ['Years in service', selected.years_in_service],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderTop: `1px solid ${C.line}` }}>
                    <dt style={{ fontSize: 13.5, color: C.muted }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
