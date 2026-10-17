import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  IconCompass, IconTarget, IconGem, IconFlag, IconClock, IconLayers, IconScroll,
  IconUsers, IconBuilding, IconHash, IconMapPin, IconCalendar, IconGlobe, IconUser,
} from '../../components/Icons';
import {
  C, card, useWide, useScrollSpy, PageHero, Ticket, TabBar, SectionHead, Notice, sectionPad, mainBox,
} from '../../components/PaperKit';

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
