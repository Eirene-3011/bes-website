-- ============================================================
-- Bacao Elementary School Website — MySQL/TiDB Schema
-- Bacao Elementary School (School ID: 107957)
-- FIXED: TEXT/BLOB/JSON columns cannot have literal DEFAULT values
--        in MySQL/TiDB. Affected columns changed to VARCHAR(500).
-- ============================================================

CREATE DATABASE IF NOT EXISTS bes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bes_db;

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  role ENUM('admin','super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Single-row school settings
CREATE TABLE IF NOT EXISTS school_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL DEFAULT 'Bacao Elementary School',
  school_id_no VARCHAR(50) DEFAULT '107957',
  school_type VARCHAR(100) DEFAULT 'Public Elementary',
  address VARCHAR(500) DEFAULT 'Purok 7, Bacao 2, General Trias City, Cavite',
  region VARCHAR(100) DEFAULT 'Region IV-A CALABARZON',
  province VARCHAR(100) DEFAULT 'Cavite',
  city VARCHAR(100) DEFAULT 'General Trias City',
  district_division VARCHAR(150) DEFAULT 'Schools Division Office of General Trias City',
  year_established VARCHAR(20) DEFAULT '1915',
  principal_name VARCHAR(255) DEFAULT 'Myra P. Aro',
  principal_title VARCHAR(150) DEFAULT 'Principal I',
  motto TEXT,
  landline VARCHAR(50) DEFAULT '',
  mobile VARCHAR(50) DEFAULT '0966-486-1467',
  email VARCHAR(255) DEFAULT '107957@deped.gov.ph',
  domain VARCHAR(255) DEFAULT 'DepEd Bacao Elementary School',
  office_hours VARCHAR(255) DEFAULT 'Monday–Friday, 8:00 AM – 5:00 PM',
  google_maps_link VARCHAR(500) DEFAULT '',
  facebook_url VARCHAR(500) DEFAULT '',
  youtube_url VARCHAR(500) DEFAULT '',
  instagram_url VARCHAR(500) DEFAULT '',
  tiktok_url VARCHAR(500) DEFAULT '',
  logo_url VARCHAR(500) DEFAULT '',
  principal_photo_url VARCHAR(500) DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed the motto (TEXT columns can't carry an inline DEFAULT, so set it explicitly)
INSERT INTO school_info (motto)
VALUES ('Be Your Best at BES');

-- Content blocks (Vision, Mission, History, Core Values, Goals, etc.)
CREATE TABLE IF NOT EXISTS content_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_slug VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  body_richtext LONGTEXT,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_block (page_slug, section_key)
);

-- Homepage banner slider
-- observance_tag: optional tag linking this slide to a seasonal observance (e.g. 'teachers_month')
-- observance_label: human-readable label for the observance (e.g. 'National Teachers Month')
CREATE TABLE IF NOT EXISTS banner_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(500),
  sort_order INT DEFAULT 0,
  type VARCHAR(50) DEFAULT 'general',
  is_active TINYINT(1) DEFAULT 1,
  observance_tag VARCHAR(100) DEFAULT NULL,
  observance_label VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School / building photos
CREATE TABLE IF NOT EXISTS school_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(500),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Org chart
CREATE TABLE IF NOT EXISTS org_chart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Officials
CREATE TABLE IF NOT EXISTS officials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  department_office VARCHAR(255),
  photo_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Faculty & Staff Directory
CREATE TABLE IF NOT EXISTS staff_directory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  position_subject VARCHAR(255),
  section_name VARCHAR(255),
  department_grade_level VARCHAR(100),
  years_in_service INT DEFAULT 0,
  contact_no VARCHAR(100),
  photo_url VARCHAR(500),
  photo_match_status ENUM('matched','unmatched') DEFAULT 'unmatched',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Committees
CREATE TABLE IF NOT EXISTS committees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  committee_name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Committee members — photo_url added for visual identification on public page
CREATE TABLE IF NOT EXISTS committee_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  committee_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  contact_no VARCHAR(100),
  photo_url VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (committee_id) REFERENCES committees(id) ON DELETE CASCADE
);

-- Programs, Projects & Activities
CREATE TABLE IF NOT EXISTS ppas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_description TEXT,
  frequency VARCHAR(100),
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students' Corner
CREATE TABLE IF NOT EXISTS student_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('commendation','featured_student','accomplishment') NOT NULL,
  student_name VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  date_posted DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School-wide Accomplishments (separate from Students' Corner)
CREATE TABLE IF NOT EXISTS accomplishments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  award_date DATE,
  awarding_body VARCHAR(500),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('ARAL','KS1','KS2','Supplementary') NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issuances (public-facing)
CREATE TABLE IF NOT EXISTS issuances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('memo','notice_of_meeting','procurement','form','deped_order') NOT NULL,
  title VARCHAR(500) NOT NULL,
  file_url VARCHAR(500),
  do_number VARCHAR(100),
  school_year VARCHAR(20),
  date_issued DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Internal Forms & Memos (admin-only)
CREATE TABLE IF NOT EXISTS internal_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  file_url VARCHAR(500),
  category ENUM('monitoring','planning','committee_memo','contingency_plan','other') DEFAULT 'other',
  uploaded_by VARCHAR(100),
  is_public TINYINT(1) DEFAULT 0,
  date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- External DepEd reference links
CREATE TABLE IF NOT EXISTS external_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Citizen's Charter — now a list of up to 16 individual PDF documents
-- (replaces the old single-row citizens_charter table)
CREATE TABLE IF NOT EXISTS citizens_charter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  body_richtext LONGTEXT,
  pdf_file_url VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS charter_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  pdf_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- FAQ
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(1000) NOT NULL,
  answer_richtext LONGTEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School Calendar
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(500) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_recurring TINYINT(1) DEFAULT 0,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback / Survey links
CREATE TABLE IF NOT EXISTS feedback_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  url TEXT,
  type ENUM('csm_survey','general_feedback','qr_code_image') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOSY Enrollment Statistics (Kinder through Grade 6)
CREATE TABLE IF NOT EXISTS enrollment_stats (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  school_year     VARCHAR(20) NOT NULL UNIQUE,
  sort_order      INT DEFAULT 0,
  chart_image_url VARCHAR(500) DEFAULT NULL,
  kinder_male     INT NOT NULL DEFAULT 0,
  kinder_female   INT NOT NULL DEFAULT 0,
  grade1_male     INT NOT NULL DEFAULT 0,
  grade1_female   INT NOT NULL DEFAULT 0,
  grade2_male     INT NOT NULL DEFAULT 0,
  grade2_female   INT NOT NULL DEFAULT 0,
  grade3_male     INT NOT NULL DEFAULT 0,
  grade3_female   INT NOT NULL DEFAULT 0,
  grade4_male     INT NOT NULL DEFAULT 0,
  grade4_female   INT NOT NULL DEFAULT 0,
  grade5_male     INT NOT NULL DEFAULT 0,
  grade5_female   INT NOT NULL DEFAULT 0,
  grade6_male     INT NOT NULL DEFAULT 0,
  grade6_female   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) DEFAULT 0
);

-- School Dashboard Stats (single-row, admin-editable)
CREATE TABLE IF NOT EXISTS school_dashboard (
  id INT AUTO_INCREMENT PRIMARY KEY,
  active_school_year VARCHAR(20) DEFAULT '',
  enrollment_status VARCHAR(50) DEFAULT 'Open',
  enrollment_count INT DEFAULT 0,
  performance_indicator VARCHAR(500) DEFAULT '',
  teaching_personnel INT DEFAULT 0,
  non_teaching_personnel INT DEFAULT 0,
  administrative_staff INT DEFAULT 0,
  vacant_positions INT DEFAULT 0,
  male_count INT DEFAULT 0,
  female_count INT DEFAULT 0,
  retention_rate DECIMAL(5,2) DEFAULT 0,
  dropout_rate DECIMAL(5,2) DEFAULT 0,
  transition_completion_rate DECIMAL(5,2) DEFAULT 0,
  overall_proficiency DECIMAL(5,2) DEFAULT 0,
  english_readers DECIMAL(5,2) DEFAULT 0,
  filipino_readers DECIMAL(5,2) DEFAULT 0,
  math_numeracy DECIMAL(5,2) DEFAULT 0,
  science_literacy DECIMAL(5,2) DEFAULT 0,
  learners_with_disabilities INT DEFAULT 0,
  disadvantaged_learners INT DEFAULT 0,
  bmi_normal INT DEFAULT 0,
  bmi_overweight INT DEFAULT 0,
  bmi_obese INT DEFAULT 0,
  bmi_wasted INT DEFAULT 0,
  health_assessment_done INT DEFAULT 0,
  child_protection_cases INT DEFAULT 0,
  sbm_level VARCHAR(100) DEFAULT '',
  opcrf_rating DECIMAL(5,2) DEFAULT 0,
  classroom_ratio VARCHAR(100) DEFAULT '',
  teacher_ratio VARCHAR(100) DEFAULT '',
  seat_ratio VARCHAR(100) DEFAULT '',
  internet_speed VARCHAR(100) DEFAULT '',
  functional_facilities_count INT DEFAULT 0,
  total_facilities_count INT DEFAULT 0,
  acc_transparency_seal VARCHAR(50) DEFAULT 'Pending',
  acc_aip_wfp_app VARCHAR(50) DEFAULT 'Pending',
  acc_saln VARCHAR(50) DEFAULT 'Pending',
  acc_philgeps VARCHAR(50) DEFAULT 'Pending',
  acc_coa_aom VARCHAR(50) DEFAULT 'Pending',
  acc_foi VARCHAR(50) DEFAULT 'Pending',
  acc_arta VARCHAR(50) DEFAULT 'Pending',
  acc_ccsr_csm VARCHAR(50) DEFAULT 'Pending',
  acc_8888_ccb VARCHAR(50) DEFAULT 'Pending',
  digitalization_status VARCHAR(50) DEFAULT 'In Progress',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- School Dashboard: sections and classrooms per grade level
CREATE TABLE IF NOT EXISTS school_dashboard_grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grade_level VARCHAR(50) NOT NULL UNIQUE,
  sections_count INT DEFAULT 0,
  classrooms_count INT DEFAULT 0,
  male_count INT DEFAULT 0,
  female_count INT DEFAULT 0,
  sort_order INT DEFAULT 0
);

-- Chronology of School Heads
CREATE TABLE IF NOT EXISTS school_head_chronology (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  years_served VARCHAR(100),
  photo_url VARCHAR(500) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News and updates
CREATE TABLE IF NOT EXISTS news_and_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content LONGTEXT,
  excerpt TEXT,
  image_url VARCHAR(500),
  category VARCHAR(100) DEFAULT 'news',
  published_date DATE,
  is_published TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alumni records (kept empty until BES provides verified alumni information)
CREATE TABLE IF NOT EXISTS alumni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  batch_year VARCHAR(20),
  course_profession VARCHAR(255),
  company VARCHAR(255),
  location VARCHAR(255),
  bio TEXT,
  email VARCHAR(255),
  facebook_url VARCHAR(500),
  photo_url VARCHAR(500),
  is_featured TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Homepage visitor counter
CREATE TABLE IF NOT EXISTS visitor_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_visits INT NOT NULL DEFAULT 0,
  today_visits INT NOT NULL DEFAULT 0,
  today_date DATE NOT NULL,
  unique_visitors INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visitor_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);