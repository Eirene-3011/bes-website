import React from 'react';
import { useSchoolInfo } from '../../hooks/useSchoolInfo';
import { getImageUrl } from '../../utils/helpers';
import './Footer.css';

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="icon" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="icon" aria-hidden="true">
    <path d="M20.01 15.38c-1.23 0-2.42-.18-3.53-.56-.35-.12-.74-.03-1.01.24l-2.17 2.17c-2.83-1.44-5.15-3.75-6.59-6.59l2.17-2.17c.27-.27.36-.66.24-1.01-.38-1.11-.56-2.3-.56-3.53 0-.55-.45-1-1-1H3.5c-.55 0-1 .45-1 1C2.5 13.91 10.09 21.5 19.5 21.5c.55 0 1-.45 1-1v-4.01c0-.55-.45-1-1-1z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="icon" aria-hidden="true">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="icon" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="icon" aria-hidden="true">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.73 9-4.72 9-9.95z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="icon" aria-hidden="true">
    <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

function FooterHeading({ children }) {
  return <h2 className="footer-heading">{children}</h2>;
}

export default function Footer() {
  const { info } = useSchoolInfo();
  const year = new Date().getFullYear();
  const schoolName = info?.school_name || 'Bacao Elementary School';
  const motto = info?.motto || 'Be Your Best at BES';
  const logoSrc = getImageUrl(info?.logo_url) || '/uploads/logo.png';

  const contactDetails = [
    { Icon: LocationIcon, label: 'Visit us', value: info?.address || 'Purok 7, Bacao 2, General Trias City, Cavite' },
    { Icon: PhoneIcon, label: 'Call us', value: info?.mobile || '(046) 230 3506 / 0966-486-1467' },
    { Icon: EmailIcon, label: 'Email us', value: info?.email || '107957@deped.gov.ph' },
    { Icon: ClockIcon, label: 'Office hours', value: info?.office_hours || 'Mon–Fri, 8:00 AM–5:00 PM' },
  ];

  return (
    <footer className="footer" aria-label="School footer">
      <div className="footer-ambient footer-ambient-one" aria-hidden="true" />
      <div className="footer-ambient footer-ambient-two" aria-hidden="true" />

      <div className="footer-top">
        <div className="container footer-grid">
          <section className="footer-brand-col" aria-labelledby="footer-brand-title">
            <div className="footer-brand-mark">
              <img
                src={logoSrc}
                alt="Bacao Elementary School logo"
                className="footer-logo"
                onError={(event) => {
                  if (event.currentTarget.src.endsWith('/uploads/logo.png')) event.currentTarget.style.display = 'none';
                  else event.currentTarget.src = '/uploads/logo.png';
                }}
              />
              <span className="footer-brand-rule" aria-hidden="true" />
            </div>
            <p id="footer-brand-title" className="footer-kicker">Official school website</p>
            <p className="footer-school-name">{schoolName}</p>
            <p className="footer-motto">“{motto}”</p>
            <div className="social-links" aria-label="Social media links">
              {info?.facebook_url && (
                <a href={info.facebook_url} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
                  <FacebookIcon /> Facebook
                </a>
              )}
              {info?.youtube_url && (
                <a href={info.youtube_url} target="_blank" rel="noopener noreferrer" className="social-btn youtube" aria-label="YouTube">
                  <YouTubeIcon /> YouTube
                </a>
              )}
            </div>
          </section>

          <section className="footer-info-col" aria-label="School contact and official links">
            <div className="footer-info-grid">
              <div className="footer-contact-section">
                <FooterHeading>Contact information</FooterHeading>
                <ul className="contact-list">
                  {contactDetails.map(({ Icon, label, value }) => (
                    <li key={label} className="footer-contact-item">
                      <span className="footer-contact-icon"><Icon /></span>
                      <span className="footer-contact-copy">
                        <span className="footer-contact-label">{label}</span>
                        <span className="footer-contact-value">{value}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-deped-section">
                <FooterHeading>DepEd links</FooterHeading>
                <nav className="deped-links" aria-label="DepEd links">
                  <a href="https://www.deped.gov.ph" target="_blank" rel="noopener noreferrer">DepEd Central Office <span aria-hidden="true">↗</span></a>
                  <a href="https://www.depedcalabarzonnews.com" target="_blank" rel="noopener noreferrer">DepEd Region IV-A <span aria-hidden="true">↗</span></a>
                  <a href="https://www.depedgeneraltrias.com" target="_blank" rel="noopener noreferrer">DepEd Division GenTrias <span aria-hidden="true">↗</span></a>
                </nav>
                <p className="footer-service-note"><span className="footer-service-dot" aria-hidden="true" />Public elementary school · DepEd recognized</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} {schoolName}. All rights reserved.</p>
          <p className="footer-bottom-note">Made for learners, families, and the BES community.</p>
        </div>
      </div>
    </footer>
  );
}
