import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import OrgStructurePage from './pages/public/OrgStructurePage';
import CitizensCharterPage from './pages/public/CitizensCharterPage';
import CommitteesPage from './pages/public/CommitteesPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import EnrollmentStatisticsPage from './pages/public/EnrollmentStatisticsPage';
import PPAsPage from './pages/public/PPAsPage';
import StudentsCornerPage from './pages/public/StudentsCornerPage';
import AccomplishmentsPage from './pages/public/AccomplishmentsPage';
import LearningResourcesPage from './pages/public/LearningResourcesPage';
import IssuancesPage from './pages/public/IssuancesPage';
import SchoolCalendarPage from './pages/public/SchoolCalendarPage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import NewsPage from './pages/public/NewsPage';
import AlumniPage from './pages/public/AlumniPage';
import CareersPage from './pages/public/CareersPage';
import GuidancePage from './pages/public/GuidancePage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSchoolInfo from './pages/admin/AdminSchoolInfo';
import AdminBanners from './pages/admin/AdminBanners';
import AdminContent from './pages/admin/AdminContent';
import AdminStaff from './pages/admin/AdminStaff';
import AdminOfficials from './pages/admin/AdminOfficials';
import AdminCommittees from './pages/admin/AdminCommittees';
import AdminPPAs from './pages/admin/AdminPPAs';
import AdminStudents from './pages/admin/AdminStudents';
import AdminResources from './pages/admin/AdminResources';
import AdminIssuances from './pages/admin/AdminIssuances';
import AdminInternalForms from './pages/admin/AdminInternalForms';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminContact from './pages/admin/AdminContact';
import AdminEnrollment from './pages/admin/AdminEnrollment';
import AdminCharter from './pages/admin/AdminCharter';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminOrgChart from './pages/admin/AdminOrgChart';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminExternalLinks from './pages/admin/AdminExternalLinks';
import AdminEnrollmentStats from './pages/admin/AdminEnrollmentStats';
import AdminSchoolDashboard from './pages/admin/AdminSchoolDashboard';
import AdminAccomplishments from './pages/admin/AdminAccomplishments';
import AdminSchoolHeads from './pages/admin/AdminSchoolHeads';
// ✅ NEW
import AdminAlumni from './pages/admin/AdminAlumni';
import AdminNewsAndUpdates from './pages/admin/AdminNewsAndUpdates';
import RequireAuth from './components/admin/RequireAuth';
import AdminComingSoon from './pages/admin/AdminComingSoon';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/organizational-structure" element={<OrgStructurePage />} />
          <Route path="/about/citizens-charter" element={<CitizensCharterPage />} />
          <Route path="/about/committees" element={<CommitteesPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/admissions/enrollment-statistics" element={<EnrollmentStatisticsPage />} />
          <Route path="/ppas" element={<PPAsPage />} />
          <Route path="/students-corner" element={<StudentsCornerPage />} />
          <Route path="/accomplishments" element={<AccomplishmentsPage />} />
          <Route path="/learning-resources" element={<LearningResourcesPage />} />
          <Route path="/issuances" element={<IssuancesPage />} />
          <Route path="/school-calendar" element={<SchoolCalendarPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/alumni" element={<AlumniPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/guidance" element={<GuidancePage />} />
        </Route>

        {/* Admin Login (magic link) */}
        <Route path="/admin/login/:code" element={<AdminLogin />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="school-info" element={<AdminSchoolInfo />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="officials" element={<AdminOfficials />} />
          <Route path="org-chart" element={<AdminOrgChart />} />
          <Route path="committees" element={<AdminCommittees />} />
          <Route path="ppas" element={<AdminPPAs />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="accomplishments" element={<AdminAccomplishments />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="issuances" element={<AdminIssuances />} />
          <Route path="internal-forms" element={<AdminInternalForms />} />
          <Route path="faqs" element={<AdminFAQs />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="enrollment" element={<AdminEnrollment />} />
          <Route path="enrollment-stats" element={<AdminEnrollmentStats />} />
          <Route path="charter" element={<AdminCharter />} />
          <Route path="photos" element={<AdminPhotos />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="external-links" element={<AdminExternalLinks />} />
          <Route path="school-dashboard" element={<AdminSchoolDashboard />} />
          <Route path="school-heads" element={<AdminSchoolHeads />} />
          {/* ✅ NEW */}
          <Route path="alumni" element={<AdminAlumni />} />
          <Route path="news-updates" element={<AdminNewsAndUpdates />} />
           <Route path="careers" element={<AdminComingSoon title="Careers & Job Vacancies" description="Prepare and publish BES employment opportunity information." />} />
           <Route path="guidance" element={<AdminComingSoon title="Guidance, Counselling & Student Services" description="Prepare and publish BES learner-support information." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
