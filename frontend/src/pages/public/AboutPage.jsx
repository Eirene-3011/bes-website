import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  IconCompass, IconTarget, IconGem, IconFlag, IconClock, IconLayers, IconScroll,
  IconUsers, IconBuilding, IconHash, IconMapPin, IconCalendar, IconGlobe, IconUser,
} from '../../components/Icons';

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

const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '56px 0 0' : '40px 0 0' });

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

// Ordered as a narrative: where the school came from, who it is today, the community it serves.
const SECTIONS = [
  { key: 'history', label: 'School History', Icon: IconClock },
  { key: 'historical_development', label: 'Historical Development', Icon: IconLayers },
  { key: 'chronology_of_school_heads', label: 'School Heads', Icon: IconUser },
  { key: 'vision', label: 'Vision', Icon: IconCompass },
  { key: 'mission', label: 'Mission', Icon: IconTarget },
  { key: 'core_values', label: 'Core Values', Icon: IconGem },
  { key: 'goals', label: 'Goals & Objectives', Icon: IconFlag },
  { key: 'community_profile', label: 'Community Profile', Icon: IconUsers },
  { key: 'demographics', label: 'Demographics', Icon: IconBuilding },
];
const FULL_TITLES = {
  historical_development: 'Historical Development of BES',
  chronology_of_school_heads: 'Chronology of School Heads',
};

const SUB_PAGES = [
  { label: 'Organizational Structure', path: '/about/organizational-structure', Icon: IconLayers, desc: 'School org chart, officials, faculty and staff' },
  { label: "Citizen's Charter", path: '/about/citizens-charter', Icon: IconScroll, desc: 'Our service standards under RA 11032' },
  { label: 'Committees & Councils', path: '/about/committees', Icon: IconUsers, desc: 'PTA, SPTA, SSG and more' },
];

const hasBody = (b) => !!b?.body_richtext && b.body_richtext.replace(/<[^>]*>/g, '').trim().length > 0;

export default function AboutPage() {
  const wide = useWide();
  const [content, setContent] = useState({});
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/content/about'), api.get('/school-info')])
      .then(([c, s]) => {
        const map = {};
        c.data.forEach((b) => { map[b.section_key] = b; });
        setContent(map);
        setInfo(s.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Only sections that have text get a tab and a block; the rest are listed once at the end.
  const filled = SECTIONS.filter((s) => hasBody(content[s.key]));
  const pending = SECTIONS.filter((s) => !hasBody(content[s.key]));
  const [active, go] = useScrollSpy(filled.map((s) => s.key), !loading);

  const head = info?.principal_name ? [info.principal_name, info.principal_title].filter(Boolean).join(', ') : null;
  const infoRows = info ? [
    { label: 'School name', val: info.school_name, Icon: IconBuilding },
    { label: 'School ID', val: info.school_id_no, Icon: IconHash },
    { label: 'School type', val: info.school_type, Icon: IconBuilding },
    { label: 'Address', val: info.address, Icon: IconMapPin },
    { label: 'Year established', val: info.year_established, Icon: IconCalendar },
    { label: 'Division', val: info.district_division, Icon: IconLayers },
    { label: 'Region', val: info.region, Icon: IconGlobe },
    { label: 'School head', val: head, Icon: IconUser },
  ].filter((r) => r.val) : [];

  const ticket = info && (
    <Ticket wide={wide} Icon={IconBuilding} ariaLabel="School at a glance"
      label={info.year_established ? 'Serving learners since' : 'Public elementary school'}
      value={info.year_established || info.school_name}
      rows={[
        info.school_id_no && { Icon: IconHash, label: 'School ID', value: info.school_id_no },
        info.district_division && { Icon: IconLayers, label: 'Division', value: info.district_division },
        head && { Icon: IconUser, label: 'School head', value: info.principal_name },
      ].filter(Boolean)} />
  );

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
      <PageHero wide={wide} tag="About BES" title="The story of Bacao Elementary School."
        intro="Where we came from, what we stand for, and the community we serve." aside={ticket} />

      {!loading && filled.length > 1 && <TabBar items={filled.map((s) => ({ id: s.key, label: s.label }))} active={active} onSelect={go} label="About sections" />}

      <main className="container" style={mainBox(wide)}>
        {loading ? (
          <div style={{ paddingTop: 40 }}>
            {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 20 }} />)}
          </div>
        ) : (
          <>
            {infoRows.length > 0 && (
              <dl style={{ margin: wide ? '40px 0 0' : '28px 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', ...card, overflow: 'hidden' }}>
                {infoRows.map(({ label, val, Icon }) => (
                  <div key={label} style={{ padding: '16px 22px', borderTop: `1px solid ${C.line}`, marginTop: -1, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: C.red, marginTop: 2, display: 'flex' }}><Icon size={16} /></span>
                    <div style={{ minWidth: 0 }}>
                      <dt style={{ fontSize: '0.8rem', fontWeight: 700, color: C.muted }}>{label}</dt>
                      <dd style={{ margin: '3px 0 0', fontWeight: 700, fontSize: '0.95rem' }}>{val}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}

            {filled.length === 0 && (
              <div style={sectionPad(wide)}>
                <Notice Icon={IconClock} title="The school profile has not been posted yet.">
                  Check back soon, or visit the school office to learn more about BES.
                </Notice>
              </div>
            )}

            {filled.map((s) => (
              <section key={s.key} id={s.key} style={sectionPad(wide)}>
                <SectionHead Icon={s.Icon} title={FULL_TITLES[s.key] || s.label} />
                <div className="rich-content" style={{ ...card, padding: wide ? 32 : 20 }}
                  dangerouslySetInnerHTML={{ __html: content[s.key].body_richtext }} />
              </section>
            ))}

            {pending.length > 0 && filled.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <Notice Icon={IconClock} title="Still being written">
                  {pending.map((p) => p.label).join(', ')}.
                </Notice>
              </div>
            )}

            <section style={sectionPad(wide)}>
              <SectionHead Icon={IconLayers} title="More about BES" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {SUB_PAGES.map((l) => (
                  <Link key={l.path} to={l.path} style={{ ...card, padding: '22px 22px', textDecoration: 'none', display: 'block', borderTop: `4px solid ${C.red}` }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 10, background: '#FBE3E3', color: C.red, marginBottom: 14 }}><l.Icon size={22} /></span>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>{l.label}</h3>
                    <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: C.muted }}>{l.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
