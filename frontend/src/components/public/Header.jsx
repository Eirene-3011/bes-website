import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSchoolInfo } from '../../hooks/useSchoolInfo';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import './Header.css';

const ChevronDownIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparkleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
  </svg>
);

const MenuIcon = ({ open }) => (
  <span className={`menu-icon${open ? ' is-open' : ''}`} aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

/* Navigation is unchanged: same items, same order, same dropdowns. */
const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about', children: [
    { label: 'School Profile', path: '/about' },
    { label: 'Organizational Structure', path: '/about/organizational-structure' },
    { label: "Citizen's Charter", path: '/about/citizens-charter' },
    { label: 'Committees & Councils', path: '/about/committees' },
  ] },
  { label: 'Admissions', path: '/admissions', children: [
    { label: 'Enrollment Info', path: '/admissions' },
    { label: 'Enrollment Statistics', path: '/admissions/enrollment-statistics' },
  ] },
  { label: 'Careers', path: '/careers' },
  { label: 'Student Services', path: '/guidance' },
  { label: 'News & Updates', path: '/news' },
  { label: 'PPAs', path: '/ppas' },
  { label: "Students' Corner", path: '/students-corner' },
  { label: 'Accomplishments', path: '/accomplishments' },
  { label: 'Alumni', path: '/alumni' },
  { label: 'Learning Resources', path: '/learning-resources' },
  { label: 'Issuances', path: '/issuances', children: [
    { label: 'DepEd Orders', path: '/issuances?type=deped_order' },
    { label: 'Procurement Postings', path: '/issuances?type=procurement' },
    { label: 'School Memos', path: '/issuances?type=memo' },
    { label: 'External Links', path: '/issuances#external' },
  ] },
  { label: 'Calendar', path: '/school-calendar' },
  { label: 'Contact Us', path: '/contact', children: [
    { label: 'Contact & Feedback', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ] },
];

const basePath = (path) => path.split(/[?#]/)[0];

const pathMatches = (pathname, path) => {
  const base = basePath(path);
  if (base === '/') return pathname === '/';
  return pathname === base || pathname.startsWith(`${base}/`);
};

/* A dropdown parent is also active when any of its child pages is open (e.g. /faq under Contact Us). */
const isItemActive = (item, pathname) =>
  pathMatches(pathname, item.path) ||
  Boolean(item.children?.some((child) => pathMatches(pathname, child.path)));

const getGreeting = (date) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

/* Philippine school years start around June. */
const getSchoolYear = (date) => {
  const year = date.getFullYear();
  return date.getMonth() >= 5 ? `${year}\u2013${year + 1}` : `${year - 1}\u2013${year}`;
};

const getInitials = (name) =>
  name.split(/\s+/).filter((word) => /^[A-Z]/.test(word)).map((word) => word[0]).join('').slice(0, 3);

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

/*
  Masthead styles. The masthead is a golden legal pad that sits between the
  crimson utility bar and the crimson nav: ruled lines, a red double margin,
  a crimson highlighter label for the motto, and a tear-off calendar.
  Everything is inline and uses the colour variables from Header.css, so the
  stylesheet itself is untouched.
*/
function buildStyles(vw, photoBlock) {
  const desk = vw > 940;
  const small = vw <= 600;
  const pitch = small ? 28 : 36;
  const marginX = desk ? 64 : small ? 14 : 24;
  const stampSize = desk ? 88 : small ? 52 : 68;
  const rule = 'rgba(142, 18, 24, 0.15)';
  const redLine = '1px solid rgba(196, 30, 36, 0.65)';

  return {
    desk,
    paper: {
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${pitch - 1}px, ${rule} ${pitch - 1}px, ${rule} ${pitch}px), linear-gradient(180deg, #FFF4C7 0%, #FFE88F 100%)`,
    },
    inner: {
      position: 'relative',
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: desk ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
      alignItems: 'center',
      columnGap: 40,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
      padding: desk
        ? `26px 36px 26px ${marginX + 41}px`
        : small
          ? `18px 16px 18px ${marginX + 19}px`
          : `22px 24px 22px ${marginX + 25}px`,
    },
    marginLine: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: marginX,
      boxSizing: 'border-box',
      width: 5,
      borderLeft: redLine,
      borderRight: redLine,
      pointerEvents: 'none',
    },
    nameRow: { display: 'flex', alignItems: 'center', gap: desk ? 24 : 14, minWidth: 0 },
    stamp: {
      flex: 'none',
      display: 'grid',
      placeItems: 'center',
      width: stampSize,
      height: stampSize,
      boxSizing: 'border-box',
      border: '3px solid var(--green-900)',
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 0 0 4px #FFF4C7, 0 0 0 6px var(--green-900), 0 10px 22px rgba(94, 11, 16, 0.25)',
      transform: 'rotate(-6deg)',
    },
    stampLogo: { width: '72%', height: '72%', objectFit: 'contain', transform: 'rotate(6deg)' },
    stampInitials: {
      color: 'var(--green-900)',
      fontSize: stampSize * 0.3,
      fontWeight: 800,
      letterSpacing: '-0.04em',
      transform: 'rotate(6deg)',
    },
    h1: {
      margin: 0,
      color: 'var(--green-950)',
      fontSize: desk ? 'clamp(2.1rem, 3.9vw, 3.1rem)' : small ? '1.4rem' : '1.9rem',
      fontWeight: 800,
      letterSpacing: '-0.035em',
      lineHeight: 1.05,
      textWrap: 'balance',
      textShadow: 'none',
    },
    mottoRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px', marginTop: desk ? 12 : 9 },
    marker: {
      display: 'inline-block',
      padding: '0.25em 0.8em',
      background: 'linear-gradient(100deg, var(--green-950), var(--green-800))',
      borderRadius: '0.3em 0.6em 0.35em 0.55em',
      boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)',
      color: '#fff',
      fontSize: desk ? '0.98rem' : '0.86rem',
      fontWeight: 800,
      transform: 'rotate(-1.5deg)',
    },
    tagline: { color: '#6B4A44', fontSize: desk ? '0.98rem' : '0.88rem', lineHeight: 1.4 },
    noteRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', marginTop: 12 },
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      maxWidth: '100%',
      padding: '5px 11px',
      border: '1px solid rgba(142, 18, 24, 0.25)',
      borderRadius: 999,
      background: '#fff',
      color: 'var(--green-950)',
      fontSize: '0.78rem',
      fontWeight: 700,
    },
    recog: { display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--green-900)', fontSize: '0.78rem', fontWeight: 700 },
    diamond: { width: 7, height: 7, borderRadius: 2, background: 'var(--green-500)', transform: 'rotate(45deg)' },
    side: {
      position: 'relative',
      boxSizing: 'border-box',
      width: photoBlock ? 260 : 124,
      padding: photoBlock ? '14px 6px 30px 34px' : '0 6px',
    },
    polaroid: (lifted) => ({
      position: 'relative',
      transform: lifted ? 'rotate(0deg) translateY(-4px)' : 'rotate(2.5deg)',
      transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
    tape: {
      position: 'absolute',
      top: -12,
      left: '50%',
      zIndex: 2,
      width: 88,
      height: 24,
      background: 'rgba(168, 22, 27, 0.55)',
      transform: 'translateX(-50%) rotate(-3deg)',
    },
    figure: {
      margin: 0,
      padding: '10px 10px 0',
      border: '1px solid rgba(142, 18, 24, 0.12)',
      background: '#fff',
      boxShadow: '0 18px 36px rgba(94, 11, 16, 0.25), 0 2px 6px rgba(94, 11, 16, 0.12)',
    },
    photoBox: { width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', background: 'var(--red-soft)' },
    photo: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
    photoSkeleton: { width: '100%', height: '100%', background: 'var(--red-soft)', animation: 'pulse 1.8s ease-in-out infinite' },
    caption: {
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      padding: '10px 6px 14px',
      color: 'var(--green-900)',
      fontSize: '0.85rem',
      fontWeight: 700,
      lineHeight: 1.35,
      textAlign: 'center',
    },
    calendar: (onPhoto) => ({
      position: onPhoto ? 'absolute' : 'relative',
      left: onPhoto ? 0 : 'auto',
      bottom: onPhoto ? -4 : 'auto',
      zIndex: 3,
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: 104,
      borderRadius: 10,
      background: '#fff',
      boxShadow: '0 12px 26px rgba(94, 11, 16, 0.3), 0 2px 6px rgba(94, 11, 16, 0.15)',
      color: 'var(--green-950)',
      textAlign: 'center',
      transform: 'rotate(-5deg)',
    }),
    calHead: {
      position: 'relative',
      padding: '7px 0 6px',
      background: 'var(--grad-masthead)',
      color: '#fff',
      fontSize: '0.74rem',
      fontWeight: 800,
      letterSpacing: '0.04em',
    },
    calHole: (side) => ({
      position: 'absolute',
      top: 4,
      [side]: 10,
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#FFF4C7',
      boxShadow: 'inset 0 1px 2px rgba(94, 11, 16, 0.45)',
    }),
    calDay: { padding: '8px 0 0', fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 },
    calWeekday: { padding: '2px 0 8px', color: 'var(--green-700)', fontSize: '0.8rem', fontWeight: 700 },
    calFoot: { padding: '5px 0', background: 'var(--yellow-soft)', color: 'var(--green-900)', fontSize: '0.68rem', fontWeight: 800 },
  };
}

function NavItem({ item, isActivePath, isOpen, onToggle, onNavigate }) {
  const hasChildren = Boolean(item.children);

  return (
    <div className={`nav-item${hasChildren ? ' has-children' : ''}${isOpen ? ' is-open' : ''}`}>
      {hasChildren ? (
        <button type="button" className={`nav-link nav-trigger${isActivePath ? ' is-active' : ''}`} onClick={() => onToggle(item.label)} aria-haspopup="true" aria-expanded={isOpen}>
          <span>{item.label}</span>
          <ChevronDownIcon className={`nav-caret${isOpen ? ' is-flipped' : ''}`} />
        </button>
      ) : (
        <Link to={item.path} className={`nav-link${isActivePath ? ' is-active' : ''}`} aria-current={isActivePath ? 'page' : undefined} onClick={onNavigate}>
          <span>{item.label}</span>
        </Link>
      )}

      {hasChildren && (
        <div className={`nav-dropdown${isOpen ? ' is-open' : ''}`}>
          <div className="dropdown-panel">
            <div className="dropdown-heading"><span>{item.label}</span><span /></div>
            {item.children.map((child) => (
              <Link key={child.label} to={child.path} className="dropdown-item" onClick={onNavigate}>
                <span>{child.label}</span>
                <ArrowRightIcon className="dropdown-arrow" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Tear-off calendar: today's date and the school year. Not a link. */
function TearOffCalendar({ now, schoolYear, styles, onPhoto }) {
  const month = now.toLocaleDateString('en-PH', { month: 'long' });
  const weekday = now.toLocaleDateString('en-PH', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={styles.calendar(onPhoto)} role="img" aria-label={`Today is ${fullDate}`}>
      <div style={styles.calHead}>
        <span style={styles.calHole('left')} />
        <span style={styles.calHole('right')} />
        {month}
      </div>
      <div style={styles.calDay}>{now.getDate()}</div>
      <div style={styles.calWeekday}>{weekday}</div>
      <div style={styles.calFoot}>SY {schoolYear}</div>
    </div>
  );
}

export default function Header() {
  const { info } = useSchoolInfo();
  const location = useLocation();
  const navRef = useRef(null);
  const viewportWidth = useViewportWidth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerImageFailed, setBannerImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [photoLifted, setPhotoLifted] = useState(false);

  useEffect(() => {
    api.get('/banners')
      .then((response) => {
        const data = response.data || [];
        setBanner(data.find((item) => item.type === 'general') || null);
      })
      .catch((error) => console.error('Banner fetch failed:', error))
      .finally(() => setBannerLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenSection(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setOpenSection(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenSection(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenSection(null);
  }, []);

  const toggleSection = useCallback((label) => {
    setOpenSection((current) => (current === label ? null : label));
  }, []);

  const schoolName = info?.school_name || 'Bacao Elementary School';
  const motto = info?.motto || 'Be Your Best at BES';
  const now = new Date();
  const greeting = getGreeting(now);
  const schoolYear = getSchoolYear(now);
  const showLogo = Boolean(info?.logo_url) && !logoFailed;
  const hasPhoto = Boolean(banner?.image_url) && !bannerImageFailed;
  const isDesktop = viewportWidth > 940;
  const showPhotoBlock = isDesktop && (bannerLoading || hasPhoto);
  const showPill = Boolean(banner?.title) && !showPhotoBlock;
  const S = buildStyles(viewportWidth, showPhotoBlock);

  return (
    <>
      <header className={`site-header${scrolled ? ' has-scrolled' : ''}`}>
        <div className="utility-bar">
          <div className="header-container utility-inner">
            <span className="utility-kicker"><span className="status-dot" /> {greeting}, welcome to our school community</span>
            <div className="utility-meta">
              <span>Public Elementary School</span>
              <span className="utility-divider" />
              <span>School Year {schoolYear}</span>
              <span className="utility-divider" />
              <span className="recognition"><span className="recognition-mark" /> DepEd Recognized</span>
            </div>
          </div>
        </div>

        <section style={S.paper} aria-label="School identity">
          <div style={S.inner}>
            <span style={S.marginLine} aria-hidden="true" />

            <div style={{ minWidth: 0 }}>
              <div style={S.nameRow}>
                <div style={S.stamp}>
                  {showLogo ? (
                    <img src={getImageUrl(info.logo_url)} alt="School Logo" style={S.stampLogo} onError={() => setLogoFailed(true)} />
                  ) : (
                    <span style={S.stampInitials} aria-hidden="true">{getInitials(schoolName)}</span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={S.h1}>{schoolName}</h1>
                  <div style={S.mottoRow}>
                    <span style={S.marker}>{motto}</span>
                    <span style={S.tagline}>A place to learn, grow, and belong.</span>
                  </div>
                </div>
              </div>

              {(showPill || !S.desk) && (
                <div style={S.noteRow}>
                  {showPill && <span style={S.pill}><SparkleIcon style={{ width: 14, height: 14, flex: 'none' }} /> {banner.title}</span>}
                  {!S.desk && <span style={S.recog}><span style={S.diamond} /> DepEd Recognized</span>}
                </div>
              )}
            </div>

            {S.desk && (
              <div style={S.side}>
                {showPhotoBlock ? (
                  <div
                    style={S.polaroid(photoLifted)}
                    onMouseEnter={() => setPhotoLifted(true)}
                    onMouseLeave={() => setPhotoLifted(false)}
                  >
                    <span style={S.tape} aria-hidden="true" />
                    <figure style={S.figure}>
                      <div style={S.photoBox}>
                        {bannerLoading ? (
                          <div style={S.photoSkeleton} />
                        ) : (
                          <img src={getImageUrl(banner.image_url)} alt="" style={S.photo} onError={() => setBannerImageFailed(true)} />
                        )}
                      </div>
                      <figcaption style={S.caption}>{banner?.title || 'Our school community'}</figcaption>
                    </figure>
                    <TearOffCalendar now={now} schoolYear={schoolYear} styles={S} onPhoto />
                  </div>
                ) : (
                  <TearOffCalendar now={now} schoolYear={schoolYear} styles={S} onPhoto={false} />
                )}
              </div>
            )}
          </div>
        </section>

        <nav className={`nav-bar${scrolled ? ' is-sticky' : ''}`} ref={navRef} aria-label="Main navigation">
          <div className="header-container nav-inner">
            <div className="nav-mobile-title"><span className="nav-mobile-line" /> Explore the school</div>
            <div className={`nav-main${menuOpen ? ' is-mobile-open' : ''}`}>
              <div className="nav-links">
                <div className="nav-drawer-brand">
                  {showLogo && <img src={getImageUrl(info.logo_url)} alt="" className="nav-drawer-logo" />}
                  <span>{schoolName}</span>
                </div>
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.label}
                    item={item}
                    isActivePath={isItemActive(item, location.pathname)}
                    isOpen={openSection === item.label}
                    onToggle={toggleSection}
                    onNavigate={closeMenu}
                  />
                ))}
              </div>
            </div>
            <button type="button" className={`menu-button${menuOpen ? ' is-active' : ''}`} onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle navigation menu" aria-expanded={menuOpen}>
              <MenuIcon open={menuOpen} /><span className="menu-button-text">Menu</span>
            </button>
          </div>
        </nav>
      </header>
      {menuOpen && <button type="button" className="mobile-backdrop" aria-label="Close navigation menu" onClick={closeMenu} />}
    </>
  );
}
