-- ============================================================
-- Bacao Elementary School (BES) — Reset Seed
-- School ID: 107957 | Region IV-A CALABARZON | SDO General Trias City
--
-- This script intentionally clears old/demo records before
-- loading BES content. Run schema.sql first.
-- ============================================================
USE bes_db;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM committee_members;
DELETE FROM committees;
DELETE FROM admin_users;
DELETE FROM school_info;
DELETE FROM content_blocks;
DELETE FROM banner_images;
DELETE FROM school_photos;
DELETE FROM org_chart;
DELETE FROM officials;
DELETE FROM staff_directory;
DELETE FROM ppas;
DELETE FROM student_features;
DELETE FROM accomplishments;
DELETE FROM learning_resources;
DELETE FROM issuances;
DELETE FROM internal_forms;
DELETE FROM external_links;
DELETE FROM citizens_charter;
DELETE FROM charter_documents;
DELETE FROM faqs;
DELETE FROM calendar_events;
DELETE FROM feedback_links;
DELETE FROM enrollment_stats;
DELETE FROM contact_messages;
DELETE FROM school_dashboard;
DELETE FROM school_dashboard_grades;
DELETE FROM school_head_chronology;
DELETE FROM news_and_updates;
DELETE FROM alumni;
DELETE FROM visitor_tokens;
DELETE FROM visitor_stats;

-- Optional: reset auto-increment counters so new rows start at id 1
ALTER TABLE committee_members AUTO_INCREMENT = 1;
ALTER TABLE committees AUTO_INCREMENT = 1;
ALTER TABLE admin_users AUTO_INCREMENT = 1;
ALTER TABLE school_info AUTO_INCREMENT = 1;
ALTER TABLE content_blocks AUTO_INCREMENT = 1;
ALTER TABLE banner_images AUTO_INCREMENT = 1;
ALTER TABLE school_photos AUTO_INCREMENT = 1;
ALTER TABLE org_chart AUTO_INCREMENT = 1;
ALTER TABLE officials AUTO_INCREMENT = 1;
ALTER TABLE staff_directory AUTO_INCREMENT = 1;
ALTER TABLE ppas AUTO_INCREMENT = 1;
ALTER TABLE student_features AUTO_INCREMENT = 1;
ALTER TABLE accomplishments AUTO_INCREMENT = 1;
ALTER TABLE learning_resources AUTO_INCREMENT = 1;
ALTER TABLE issuances AUTO_INCREMENT = 1;
ALTER TABLE internal_forms AUTO_INCREMENT = 1;
ALTER TABLE external_links AUTO_INCREMENT = 1;
ALTER TABLE citizens_charter AUTO_INCREMENT = 1;
ALTER TABLE charter_documents AUTO_INCREMENT = 1;
ALTER TABLE faqs AUTO_INCREMENT = 1;
ALTER TABLE calendar_events AUTO_INCREMENT = 1;
ALTER TABLE feedback_links AUTO_INCREMENT = 1;
ALTER TABLE enrollment_stats AUTO_INCREMENT = 1;
ALTER TABLE contact_messages AUTO_INCREMENT = 1;
ALTER TABLE school_dashboard AUTO_INCREMENT = 1;
ALTER TABLE school_dashboard_grades AUTO_INCREMENT = 1;
ALTER TABLE school_head_chronology AUTO_INCREMENT = 1;
ALTER TABLE news_and_updates AUTO_INCREMENT = 1;
ALTER TABLE alumni AUTO_INCREMENT = 1;
ALTER TABLE visitor_tokens AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Admin accounts (magic-link login only; the private code is set in the
-- backend ADMIN_MAGIC_CODE environment variable, never in this file).
-- Website content manager named in the BES information form: Jamaika S. Evangelista.
INSERT INTO admin_users (username, email, role) VALUES
('bes-admin', '107957@deped.gov.ph', 'super_admin'),
('jamaika-evangelista', NULL, 'admin');

-- Verified school identity from the BES Website Content & Information Form.
-- Logo, principal photo and map link were not supplied and remain blank
-- so the UI shows its placeholder state.
INSERT INTO school_info (
  id, school_name, school_id_no, school_type, address, region, province, city,
  district_division, year_established, principal_name, principal_title, motto,
  landline, mobile, email, domain, office_hours, google_maps_link, facebook_url,
  logo_url, principal_photo_url
) VALUES (
  1,
  'Bacao Elementary School',
  '107957',
  'Public Elementary',
  'Purok 7, Bacao 2, General Trias City, Cavite',
  'Region IV-A CALABARZON',
  'Cavite',
  'General Trias City',
  'Schools Division Office of General Trias City',
  '1915',
  'Myra P. Aro',
  'Principal I',
  'Be Your Best at BES',
  '(046) 230 3506',
  '0966-486-1467',
  '107957@deped.gov.ph',
  'DepEd Bacao Elementary School',
  'Monday–Friday, 8:00 AM–5:00 PM',
  '',
  'https://web.facebook.com/DepEdTayoBES107957',
  '',
  ''
);

-- About content based on the BES information form.
-- Vision, mission and goals were left blank on the form, so they show
-- the DepEd statements plus a "Coming soon" note.
INSERT INTO content_blocks (page_slug, section_key, title, body_richtext, sort_order) VALUES
('about', 'vision', 'Vision Statement',
 '<h3>DepEd Vision</h3><p>We dream of Filipinos who passionately love their country and whose values and competencies enable them to realize their full potential and contribute meaningfully to building the nation.</p><p><strong>BES school vision:</strong> Coming soon. The school vision statement will be published here after official confirmation.</p>', 1),
('about', 'mission', 'Mission Statement',
 '<h3>DepEd Mission</h3><p>To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where learners learn in a child-friendly, gender-sensitive, safe, and motivating environment.</p><p><strong>BES school mission:</strong> Coming soon. The school mission statement will be published here after official confirmation.</p>', 2),
('about', 'core_values', 'Core Values',
 '<p>Bacao Elementary School upholds the four DepEd core values:</p><ul><li><strong>Maka-Diyos</strong></li><li><strong>Maka-tao</strong></li><li><strong>Makakalikasan</strong></li><li><strong>Makabansa</strong></li></ul>', 3),
('about', 'goals', 'School Goals & Objectives',
 '<p>BES school goals and objectives are <strong>Coming soon</strong> pending official school confirmation.</p>', 4),
('about', 'history', 'School History',
 '<p>Bacao Elementary School is a public, non-central elementary school of the Department of Education, Schools Division Office of General Trias City, located in Purok 7, Bacao 2, General Trias City. The school is dedicated to quality basic education and to developing learners who are academically competent, morally upright, responsible, and prepared for a changing society.</p><p>The school carries a deep historical legacy anchored by its <strong>millennial Acacia tree</strong> and the historic <strong>Gabaldon Building, built in 1915</strong>, enduring witnesses to the passage of time. Its foundation is also a testament to community generosity: the land was donated by the City Government and the late Feliza Pagkaliwangan Reyes.</p><p>Situated in a low-lying area near the Ilang-Ilang river, the campus is prone to seasonal flooding during the rainy months. Rather than dampen its spirit, these challenges have shaped Bacao Elementary School into a symbol of resilience and hope for the community.</p><p>With the support of school administrators, teachers, parents, the local government, and other stakeholders, the school keeps strengthening programs for learners'' academic, social, emotional, and physical development, including research and innovation, academic remediation, numeracy development, inclusive education, stakeholder partnerships, curriculum improvement, and quality management. For SY 2026–2027, the school has planned the launch of a <strong>Special Science Class</strong>.</p><p><em>Land area: Coming soon.</em></p>', 0),
('about', 'community_profile', 'Community Profile',
 '<p>The campus sits beside a network of residential areas, commercial establishments, and private schools, including Antel Grand Village Subdivision, Lancaster Subdivision, Lavanya Subdivision, the Philippine Export Processing Zone, Metro Bank, RCBC, Save More, Unida Nehemia Academy, and Southville Monarchs International School. The school also provides access to Antel Grand Village Subdivision.</p><p>Residents work as factory workers, vendors, and overseas Filipino workers (OFWs) from middle-class and lower-income backgrounds. Learners speak a variety of languages, such as Ilocano, Pangasinense, Cebuano, Bisaya, and Bicol, united under Filipino as the language of instruction.</p>', 5),
('about', 'demographics', 'Demographics',
 '<p>For <strong>SY 2026–2027</strong>, Bacao Elementary School serves <strong>1,155 pupils</strong> (586 male and 569 female) from Kindergarten to Grade 6, together with the <strong>Alternative Learning System (ALS)</strong> and <strong>Special Needs Education (SPED)</strong> programs.</p><ul><li><strong>Principal I:</strong> 1</li><li><strong>Teachers:</strong> 33, including 32 nationally funded (4 male, 28 female): 17 in Key Stage 1 (Kinder–Grade 3) and 16 in Key Stage 2 (Grades 4–6); 30 class advisers, 2 Master Teachers, and 3 Special Teachers</li><li><strong>Non-teaching personnel:</strong> 3 (1 Administrative Officer II, 1 PDO, 1 Guidance Advocate)</li><li><strong>Support staff:</strong> 12 LGU-funded school guards, 2 Blue Guards, 2 MOOE-funded utility workers, and 2 canteen helpers</li><li><strong>Classrooms:</strong> 17 currently, with a target of 36 between 2025 and 2028</li></ul>', 6);

-- No calendar events were supplied on the BES form. The calendar page will
-- show its empty state until the school provides dates; add them from
-- Admin > School Calendar.

-- Official links; unavailable BES feedback destinations are not invented.
INSERT INTO external_links (label, url, sort_order) VALUES
('DepEd Central Office', 'https://www.deped.gov.ph', 1),
('DepEd Orders', 'https://www.deped.gov.ph/orders/', 2),
('DepEd Memoranda', 'https://www.deped.gov.ph/memoranda/', 3),
('DepEd CALABARZON', 'https://depedcalabarzon.ph/', 4);

INSERT INTO feedback_links (type, label, url) VALUES
('general_feedback', 'BES General Feedback Form — Coming soon', NULL),
('csm_survey', 'BES Client Satisfaction Measurement Survey — Coming soon', NULL);

INSERT INTO citizens_charter (body_richtext) VALUES
('<p>The BES Citizen''s Charter document is <strong>Coming soon</strong>. Please contact the school office for current service requirements and processing information.</p>');

INSERT INTO faqs (question, answer_richtext, sort_order) VALUES
('What grade levels does BES offer?', '<p>Bacao Elementary School offers <strong>Kindergarten to Grade 6</strong>, together with the <strong>Alternative Learning System (ALS)</strong> and <strong>Special Needs Education (SPED)</strong> programs.</p>', 1),
('Is BES a public school?', '<p>Yes. BES is a <strong>public elementary school</strong> under the Department of Education, Schools Division Office of General Trias City.</p>', 2),
('Where is BES located?', '<p>Bacao Elementary School is at <strong>Purok 7, Bacao 2, General Trias City, Cavite</strong>.</p>', 3),
('Is there a Special Science Class?', '<p>The school has planned the launch of a <strong>Special Science Class</strong> for SY 2026–2027. Please contact the school for the latest details.</p>', 4),
('How do I contact BES?', '<p>Landline: <strong>(046) 230 3506</strong><br />Mobile: <strong>0966-486-1467</strong><br />Email: <strong>107957@deped.gov.ph</strong><br />Office hours: <strong>Monday–Friday, 8:00 AM–5:00 PM</strong></p>', 5);

-- School head from the BES form.
INSERT INTO officials (full_name, position, department_office, sort_order)
VALUES ('Myra P. Aro', 'Principal I', 'School Administration', 1);

-- Teaching staff listed in Section D of the BES form. Grade-level and section
-- assignments were not supplied, so everyone is grouped as 'Teaching Staff'
-- until the admin assigns grade levels in Admin > Staff Directory.
INSERT INTO staff_directory (full_name, position_subject, department_grade_level, years_in_service, sort_order, photo_match_status) VALUES
('Sarah Sheryl P. Gomez', 'Master Teacher I', 'Teaching Staff', 0, 1, 'unmatched'),
('Mary Alanie P. Lastimoso', 'Master Teacher I', 'Teaching Staff', 0, 2, 'unmatched'),
('Jamaika S. Evangelista', 'Teacher VI', 'Teaching Staff', 0, 3, 'unmatched'),
('Lorena A. Pecaña', 'Teacher VI', 'Teaching Staff', 0, 4, 'unmatched'),
('Lora J. Tiangson', 'Teacher V', 'Teaching Staff', 0, 5, 'unmatched'),
('Gia L. Gamuza', 'Teacher V', 'Teaching Staff', 0, 6, 'unmatched'),
('Nelisa D. Irugin', 'Teacher V', 'Teaching Staff', 0, 7, 'unmatched'),
('Annie Belle L. Dapar', 'Teacher V', 'Teaching Staff', 0, 8, 'unmatched'),
('Rhea Fe N. Hijalga', 'Teacher IV', 'Teaching Staff', 0, 9, 'unmatched'),
('Albert S. Tarucan', 'Teacher IV', 'Teaching Staff', 0, 10, 'unmatched'),
('Lucinda T. Navera', 'Teacher III', 'Teaching Staff', 0, 11, 'unmatched'),
('Ma. Lourdes E. Deniega', 'Teacher III', 'Teaching Staff', 0, 12, 'unmatched'),
('Jaynes C. Nocon', 'Teacher III', 'Teaching Staff', 0, 13, 'unmatched'),
('Victoria A. Lacuarin', 'Teacher III', 'Teaching Staff', 0, 14, 'unmatched'),
('Arvin E. Deniega', 'Teacher III', 'Teaching Staff', 0, 15, 'unmatched'),
('Jeffrey N. Monreal', 'Teacher III', 'Teaching Staff', 0, 16, 'unmatched'),
('Cheryll R. Padua', 'Teacher III', 'Teaching Staff', 0, 17, 'unmatched'),
('Noralyn A. Valles', 'Teacher III', 'Teaching Staff', 0, 18, 'unmatched'),
('Lyka M. Tizon', 'Teacher II', 'Teaching Staff', 0, 19, 'unmatched'),
('Michelle C. Nocon', 'Teacher II', 'Teaching Staff', 0, 20, 'unmatched'),
('Mary Rose B. Escueta', 'Teacher I', 'Teaching Staff', 0, 21, 'unmatched'),
('Genadel L. Andres', 'Teacher I', 'Teaching Staff', 0, 22, 'unmatched'),
('Janmark R. Barasi', 'Teacher I', 'Teaching Staff', 0, 23, 'unmatched'),
('Mharni Thea A. Sarreal', 'Teacher I', 'Teaching Staff', 0, 24, 'unmatched'),
('Janeth L. Panganiban', 'Teacher I', 'Teaching Staff', 0, 25, 'unmatched'),
('Jesel L. Villaester', 'Teacher I', 'Teaching Staff', 0, 26, 'unmatched'),
('Jisa P. Villarin', 'Teacher I', 'Teaching Staff', 0, 27, 'unmatched'),
('Myla A. Gernade', 'Teacher I', 'Teaching Staff', 0, 28, 'unmatched'),
('Anereen S. Ballano', 'Teacher I', 'Teaching Staff', 0, 29, 'unmatched'),
('Donna S. Teoxon', 'Teacher I', 'Teaching Staff', 0, 30, 'unmatched'),
('Riza M. Panaga', 'Teacher I', 'Teaching Staff', 0, 31, 'unmatched'),
('Hazel Joyce V. Fermalino', 'Teacher I', 'Teaching Staff', 0, 32, 'unmatched'),
('Ariane M. Alo', 'Teacher I', 'Teaching Staff', 0, 33, 'unmatched'),
('Loricar B. Villacorte', 'Teacher I', 'Teaching Staff', 0, 34, 'unmatched');

-- Programs, Projects & Activities from Section L of the BES form.
INSERT INTO ppas (name, short_description, frequency, sort_order) VALUES
('Project YIELD', 'Year-Long Intervention and Enhancement Activities for Learners (Reading Development). Through Project YIELD, the school provides sustained reading intervention and enrichment activities to improve learners'' reading fluency, comprehension, vocabulary, and overall literacy skills.', 'Year-round', 1),
('Project SAGIP-HANAP', 'HAnapin ang NAwawala at Pabalikin. This project focuses on SAGIPIN ang SARDO''s at LARGO''s, pupils at risk of dropping out or who have stopped attending school, and on implementing appropriate strategies to encourage their return and continued participation in education.', 'Year-round', 2),
('Project DRRM-DREAM', 'Disaster Resilient through Empowerment, Adaptation and Mitigation. Project DREAM promotes disaster preparedness, risk reduction, and resilience among learners, teachers, and other school stakeholders. The School Contingency Plan strengthens the school''s capacity to manage emergencies effectively.', 'Quarterly drill exercises', 3),
('Project PUSO-SAFE', 'Strengthening Awareness and Fostering Empowerment. Project SAFE supports the establishment of a secure, protective, and supportive school environment where learners can learn and develop free from harm.', 'Year-round', 4),
('Project SALIKSIK-RISE', 'Research Innovation Strategies Excellence. Promotes research-based practices, innovative strategies, and evidence-informed decision-making to improve teaching and learning outcomes. It encourages teachers and school personnel to identify educational challenges, conduct relevant action research, and develop effective interventions based on learners'' needs.', 'Year-round', 5),
('Project EMPOWER', 'Equality, Mutual Respect, Participation, Opportunity and Wellness, Empowering Responsibility. Project EMPOWER aims to develop a school environment where equality, mutual respect, active participation, and shared responsibility are valued and practiced. It promotes the well-being of learners and personnel through positive relationships, inclusivity, collaboration, and respect for individual differences, and seeks to give learners equal opportunities to participate in school activities, express themselves, and build confidence in their abilities.', 'Year-round', 6),
('Project READY', 'Reinforcing Essential Academic Responsibility. Project READY strengthens learners'' essential academic skills and sense of responsibility toward their education. It supports learners who need additional help acquiring foundational competencies in reading, writing, numeracy, and other key learning areas through targeted interventions, guided practice, remediation, and continuous progress monitoring, while encouraging discipline, perseverance, active participation, and independent learning.', 'Year-round', 7),
('Project SMART', 'Solve, Multiply, Add, Reduce (Subtract), Test yourself. Project SMART strengthens learners'' mathematical abilities, particularly in solving problems and performing fundamental operations. Through regular exercises, interactive activities, assessment, and immediate feedback, it builds accuracy, confidence, logical reasoning, and critical thinking, making mathematics more accessible and meaningful for academic success and everyday life.', 'Year-round', 8),
('Project INSPIRE', 'Innovating Network and Strengthening Partnership through Inclusive Responsive Engagement. Project INSPIRE highlights strong partnerships and collaborative engagement among the school, parents, community members, local government units, and other education stakeholders. It develops networks that provide resources, technical assistance, and meaningful support for school programs and learner development, through inclusive and responsive approaches that recognize the different needs and circumstances of learners and their families.', 'Year-round', 9),
('Project HUMANE', 'Description coming soon.', 'Year-round', 10),
('Project OK', 'Description coming soon.', NULL, 11),
('Project FIND', 'Description coming soon.', NULL, 12),
('Project GAP Analysis', 'Description coming soon.', NULL, 13),
('Project LINGAP', 'Description coming soon.', NULL, 14),
('Project Gulayan', 'Description coming soon.', NULL, 15),
('Project Brigada Eskwela', 'Description coming soon.', NULL, 16),
('Project One DepEd, One QMS, One GOAL', 'Gearing Operations Aligned with Learning. Promotes unity, consistency, and accountability in school operations by aligning administrative processes and quality management practices with the shared goal of improving learning outcomes. It emphasizes following established standards, policies, procedures, and performance indicators so that school services are efficient, transparent, and responsive, and encourages collaboration, systematic documentation, continuous monitoring, and evidence-based decision-making among school personnel.', 'Year-round', 17);

-- SY 2026–2027 dashboard facts from the BES form: 1,155 pupils (586 male,
-- 569 female), 33 teachers, 3 non-teaching personnel. Section/classroom
-- counts per grade level stay zero until verified data is supplied.
INSERT INTO school_dashboard (
  active_school_year, enrollment_status, enrollment_count, performance_indicator,
  teaching_personnel, non_teaching_personnel, male_count, female_count
) VALUES ('2026-2027', 'Ongoing', 1155, 'Current reported pupil count: 1,155', 33, 3, 586, 569);

INSERT INTO school_dashboard_grades (grade_level, sections_count, classrooms_count, sort_order) VALUES
('Kinder', 0, 0, 1),
('Grade 1', 0, 0, 2),
('Grade 2', 0, 0, 3),
('Grade 3', 0, 0, 4),
('Grade 4', 0, 0, 5),
('Grade 5', 0, 0, 6),
('Grade 6', 0, 0, 7),
('SPED', 0, 0, 8);

-- The form gives total male/female pupils only, not a Kinder–Grade 6 split,
-- so the per-grade enrollment row stays at zero until verified values exist.
INSERT INTO enrollment_stats (
  school_year, sort_order,
  kinder_male, kinder_female, grade1_male, grade1_female,
  grade2_male, grade2_female, grade3_male, grade3_female,
  grade4_male, grade4_female, grade5_male, grade5_female,
  grade6_male, grade6_female
) VALUES ('2026-2027', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

INSERT INTO visitor_stats (total_visits, today_visits, today_date, unique_visitors)
VALUES (0, 0, CURRENT_DATE, 0);
