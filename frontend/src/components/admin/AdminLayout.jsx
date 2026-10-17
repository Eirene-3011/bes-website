import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const MENU = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/admin/school-info', label: 'School Info', icon: '🏫' },
  { path: '/admin/school-dashboard', label: 'School Dashboard', icon: '📊' },
  { path: '/admin/banners', label: 'Slideshow Banners', icon: '🖼️' },
  { path: '/admin/photos', label: 'School Photos', icon: '📷' },
  { path: '/admin/content', label: 'About Us Content', icon: '📝' },
  { path: '/admin/school-heads', label: 'Chronology of School Heads', icon: '👤' },
  { path: '/admin/org-chart', label: 'Org Chart', icon: '🏛️' },
  { path: '/admin/officials', label: 'Officials', icon: '👔' },
  { path: '/admin/staff', label: 'Faculty & Staff', icon: '👨‍🏫' },
  { path: '/admin/committees', label: 'Committees', icon: '👥' },
  { path: '/admin/enrollment', label: 'Admissions', icon: '📋' },
  { path: '/admin/enrollment-stats', label: 'Enrollment Statistics', icon: '📈' },
  { path: '/admin/ppas', label: 'Programs (PPAs)', icon: '🎓' },
  { path: '/admin/students', label: "Students' Corner", icon: '⭐' },
  { path: '/admin/accomplishments', label: 'Accomplishments', icon: '🏆' },
  { path: '/admin/alumni', label: 'Alumni', icon: '🎓' },          // ✅ NEW
  { path: '/admin/news-updates', label: 'News & Updates', icon: '📰' }, // ✅ NEW
  { path: '/admin/careers', label: 'Careers / Job Vacancies', icon: '💼' },
  { path: '/admin/guidance', label: 'Guidance & Student Services', icon: '🧭' },
  { path: '/admin/resources', label: 'Learning Resources', icon: '📚' },
  { path: '/admin/issuances', label: 'Issuances', icon: '📢' },
  { path: '/admin/internal-forms', label: 'Internal Forms', icon: '🔒' },
  { path: '/admin/external-links', label: 'External Links', icon: '🔗' },
  { path: '/admin/charter', label: "Citizen's Charter", icon: '📜' },
  { path: '/admin/faqs', label: 'FAQs', icon: '❓' },
  { path: '/admin/calendar', label: 'School Calendar', icon: '📅' },
  { path: '/admin/contact', label: 'Contact Messages', icon: '✉️' },
  { path: '/admin/feedback', label: 'Feedback / CSM Links', icon: '📊' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('bes_admin_token');
    navigate('/admin/login/BES-ADMIN-CHANGE-ME');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className={`admin-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
           <img src="/uploads/logo.png" alt="BES logo placeholder" className="admin-sidebar-logo" onError={e => e.target.style.display='none'} />
          {sidebarOpen && (
            <div>
               <p className="admin-sidebar-title">BES Admin</p>
               <p className="admin-sidebar-sub">School ID: 107957</p>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="admin-nav">
          {MENU.map(item => (
            <Link key={item.path} to={item.path}
              className={`admin-nav-item${isActive(item) ? ' active' : ''}`}
              title={!sidebarOpen ? item.label : ''}>
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item" title="View Public Site">
            <span className="nav-icon">🌐</span>
            {sidebarOpen && <span className="nav-label">View Public Site</span>}
          </a>
          <button onClick={handleLogout} className="admin-nav-item admin-logout" title="Logout">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
