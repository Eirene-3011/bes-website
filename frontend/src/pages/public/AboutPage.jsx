import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import {
  IconCompass,
  IconTarget,
  IconGem,
  IconFlag,
  IconClock,
  IconLayers,
  IconScroll,
  IconUsers,
  IconBuilding,
  IconHash,
  IconMapPin,
  IconCalendar,
  IconGlobe,
  IconUser,
} from '../../components/Icons';

// Ordered as a narrative: where the school came from, who it is today,
// then the community it serves — instead of an arbitrary list.
const SECTIONS = [
  { key: 'history', label: 'School History', Icon: IconClock },
  { key: 'historical_development', label: 'Historical Development of BES', Icon: IconLayers },
  { key: 'chronology_of_school_heads', label: 'Chronology of School Heads', Icon: IconUser },
  { key: 'vision', label: 'Vision', Icon: IconCompass },
  { key: 'mission', label: 'Mission', Icon: IconTarget },
  { key: 'core_values', label: 'Core Values', Icon: IconGem },
  { key: 'goals', label: 'Goals & Objectives', Icon: IconFlag },
  { key: 'community_profile', label: 'Community Profile', Icon: IconUsers },
  { key: 'demographics', label: 'Demographics', Icon: IconBuilding },
];

const SUB_PAGES = [
  { label: 'Organizational Structure', path: '/about/organizational-structure', Icon: IconLayers, desc: 'School org chart and officials' },
  { label: "Citizen's Charter", path: '/about/citizens-charter', Icon: IconScroll, desc: 'Our service standards per RA 11032' },
  { label: 'Committees & Councils', path: '/about/committees', Icon: IconUsers, desc: 'PTA, SPTA, SSG, and more' },
];

export default function AboutPage() {
  const [content, setContent] = useState({});
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);
  const revealScope = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    Promise.all([
      api.get('/content/about'),
      api.get('/school-info'),
    ]).then(([c, s]) => {
      const map = {};
      c.data.forEach(b => { map[b.section_key] = b; });
      setContent(map);
      setInfo(s.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Progressive-enhancement scroll reveal. If JS never runs (or a user
  // prefers reduced motion), everything is already visible by default —
  // elements only dim/lift once we've confirmed we can animate them back in.
  useEffect(() => {
    if (loading || !revealScope.current) return;

    const targets = revealScope.current.querySelectorAll('.reveal-target');
    if (!targets.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    targets.forEach(el => el.classList.add('reveal-pending'));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('reveal-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  // Scroll-spy: highlights the current section in the table of contents.
  useEffect(() => {
    if (loading) return;

    const els = SECTIONS
      .map(sec => sectionRefs.current[sec.key])
      .filter(Boolean);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0, rootMargin: '-15% 0px -70% 0px' }
    );

    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  const registerSectionRef = useCallback((key) => (el) => {
    if (el) sectionRefs.current[key] = el;
  }, []);

  const infoRows = info ? [
    { label: 'School Name', val: info.school_name, Icon: IconBuilding },
    { label: 'School ID', val: info.school_id_no, mono: true, Icon: IconHash },
    { label: 'School Type', val: info.school_type, badge: true, Icon: IconBuilding },
    { label: 'Address', val: info.address, Icon: IconMapPin },
    { label: 'Year Established', val: info.year_established, mono: true, Icon: IconCalendar },
    { label: 'Division', val: info.district_division, Icon: IconLayers },
    { label: 'Region', val: info.region, Icon: IconGlobe },
    { label: 'School Head', val: `${info.principal_name}, ${info.principal_title}`, Icon: IconUser },
  ] : [];

  return (
    <div ref={revealScope}>
      {/* Hero */}
      <div className="page-header">
        <div className="container">
          <h1>About BES</h1>
        </div>
      </div>

      {/* School Profile: sidebar table of contents + section cards */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">School Profile</h2>
          <p className="section-subtitle">
            The story, identity, and community that define Bacao Elementary School.
          </p>

          {loading ? (
            <div style={{ maxWidth: 720 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ marginBottom: 32 }}>
                  <div className="skeleton" style={{ width: '30%', height: 20, marginBottom: 14 }} />
                  <div className="skeleton" style={{ width: '100%', height: 60 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="about-layout">
              <aside className="about-toc" aria-label="Section navigation">
                <p className="about-toc-title">On this page</p>
                <ul className="about-toc-list">
                  {SECTIONS.map(sec => (
                    <li key={sec.key}>
                      <a
                        href={`#${sec.key}`}
                        className={`about-toc-link${activeSection === sec.key ? ' about-toc-link-active' : ''}`}
                      >
                        <sec.Icon size={15} />
                        <span>{sec.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="about-sections">
                {SECTIONS.map((sec, i) => (
                  <div
                    key={sec.key}
                    id={sec.key}
                    ref={registerSectionRef(sec.key)}
                    className="about-section card reveal-target"
                    style={{ transitionDelay: `${(i % 4) * 60}ms` }}
                  >
                    <div className="about-section-header">
                      <span className="about-section-icon"><sec.Icon size={18} /></span>
                      <h2 className="about-section-title">{sec.label}</h2>
                    </div>
                    <div
                      className="rich-content"
                      dangerouslySetInnerHTML={{
                        __html: content[sec.key]?.body_richtext || '<p><em>Content coming soon.</em></p>',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-page links */}
          <div className="divider-stitch" />
          <div className="grid-auto">
            {SUB_PAGES.map((l, i) => (
              <Link
                key={l.label}
                to={l.path}
                className="card subpage-card card-body reveal-target"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="subpage-icon" aria-hidden="true">
                  <l.Icon size={22} />
                </div>
                <h3 className="subpage-title">
                  {l.label}
                  <span className="subpage-arrow">→</span>
                </h3>
                <p className="subpage-desc">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
