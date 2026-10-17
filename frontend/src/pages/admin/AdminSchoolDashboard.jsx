import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

/* ─── Grade levels supported by the dashboard ──────────────── */
const GRADE_LEVELS = [
  { key: 'Kinder',  label: 'Kinder',  sort: 1 },
  { key: 'Grade 1', label: 'Grade 1', sort: 2 },
  { key: 'Grade 2', label: 'Grade 2', sort: 3 },
  { key: 'Grade 3', label: 'Grade 3', sort: 4 },
  { key: 'Grade 4', label: 'Grade 4', sort: 5 },
  { key: 'Grade 5', label: 'Grade 5', sort: 6 },
  { key: 'Grade 6', label: 'Grade 6', sort: 7 },
  { key: 'SPED', label: 'SPED', sort: 8 },
];

/* ─── Accountability items ──────────────────────────────────── */
const ACC_ITEMS = [
  { key: 'acc_transparency_seal', label: 'Transparency Seal' },
  { key: 'acc_aip_wfp_app',       label: 'AIP / WFP / APP' },
  { key: 'acc_saln',              label: 'SALN' },
  { key: 'acc_philgeps',          label: 'PhilGEPS' },
  { key: 'acc_coa_aom',           label: 'COA / AOM' },
  { key: 'acc_foi',               label: 'FOI' },
  { key: 'acc_arta',              label: 'ARTA' },
  { key: 'acc_ccsr_csm',          label: 'CCSR / CSM' },
  { key: 'acc_8888_ccb',          label: '8888 / CCB' },
];

const STATUS_OPTIONS = ['Completed', 'In Progress', 'Pending', 'Overdue'];

/* ─── Tab configuration ─────────────────────────────────────── */
const TABS = [
  { id: 'overview',    label: '📊 Overview',     icon: '📊' },
  { id: 'access',      label: '📋 Access',        icon: '📋' },
  { id: 'quality',     label: '📈 Quality',       icon: '📈' },
  { id: 'equity',      label: '♿ Equity',        icon: '♿' },
  { id: 'wellbeing',   label: '❤️ Well-Being',   icon: '❤️' },
  { id: 'hr',          label: '👥 Human Resource',icon: '👥' },
  { id: 'governance',  label: '🏛️ Governance',   icon: '🏛️' },
  { id: 'accountability', label: '✅ Accountability', icon: '✅' },
  { id: 'grades',      label: '🏫 Grade Levels',  icon: '🏫' },
];

/* ─── Reusable field component ──────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: '0.73rem', color: 'var(--gray-400)', marginTop: 3 }}>{hint}</p>}
    </div>
  );
}

function NumField({ label, hint, value, onChange, min = 0, step = 1 }) {
  return (
    <Field label={label} hint={hint}>
      <input type="number" className="form-control" min={min} step={step}
        value={value ?? ''} onChange={e => onChange(+e.target.value)} />
    </Field>
  );
}

function PctField({ label, hint, value, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <div style={{ position: 'relative' }}>
        <input type="number" className="form-control" min={0} max={100} step={0.1}
          value={value ?? ''} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ paddingRight: 36 }} />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', color: 'var(--gray-400)', fontWeight: 600 }}>%</span>
      </div>
    </Field>
  );
}

function TxtField({ label, hint, value, onChange, placeholder = '' }) {
  return (
    <Field label={label} hint={hint}>
      <input type="text" className="form-control" placeholder={placeholder}
        value={value ?? ''} onChange={e => onChange(e.target.value)} />
    </Field>
  );
}

function SelectField({ label, hint, value, onChange, options }) {
  return (
    <Field label={label} hint={hint}>
      <select className="form-control" value={value ?? ''} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
}

/* ─── Status select ─────────────────────────────────────────── */
function StatusSelect({ label, value, onChange }) {
  const colors = {
    Completed:   { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
    'In Progress': { bg: '#eff6ff', border: '#bfdbfe', color: '#1565C0' },
    Pending:     { bg: '#fffbeb', border: '#fde68a', color: '#D97706' },
    Overdue:     { bg: '#fef2f2', border: '#fecaca', color: '#DC2626' },
  };
  const c = colors[value] || colors.Pending;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--gray-800)' }}>{label}</span>
        <select
          value={value || 'Pending'}
          onChange={e => onChange(e.target.value)}
          style={{
            padding: '4px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.75rem',
            border: `1px solid ${c.border}`, background: c.bg, color: c.color, cursor: 'pointer',
          }}
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ─── Section card ──────────────────────────────────────────── */
function SectionCard({ title, children }) {
  return (
    <div className="admin-card" style={{ marginBottom: 20 }}>
      <h3 className="admin-card-title">{title}</h3>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
const EMPTY_STATS = {
  // Overview
  active_school_year: '', enrollment_status: 'Open',
  enrollment_count: 0, performance_indicator: '',
  // HR
  teaching_personnel: 0, non_teaching_personnel: 0,
  administrative_staff: 0, vacant_positions: 0,
  // Access
  male_count: 0, female_count: 0,
  retention_rate: 0, dropout_rate: 0, transition_completion_rate: 0,
  // Quality
  overall_proficiency: 0, english_readers: 0, filipino_readers: 0,
  math_numeracy: 0, science_literacy: 0,
  // Equity
  learners_with_disabilities: 0, disadvantaged_learners: 0,
  // Well-Being
  bmi_normal: 0, bmi_overweight: 0, bmi_obese: 0, bmi_wasted: 0,
  health_assessment_done: 0, child_protection_cases: 0,
  // Governance
  sbm_level: '', opcrf_rating: 0,
  classroom_ratio: '', teacher_ratio: '', seat_ratio: '',
  internet_speed: '', functional_facilities_count: 0, total_facilities_count: 0,
  // Accountability
  acc_transparency_seal: 'Pending', acc_aip_wfp_app: 'Pending',
  acc_saln: 'Pending', acc_philgeps: 'Pending', acc_coa_aom: 'Pending',
  acc_foi: 'Pending', acc_arta: 'Pending', acc_ccsr_csm: 'Pending',
  acc_8888_ccb: 'Pending', digitalization_status: 'In Progress',
};

export default function AdminSchoolDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(EMPTY_STATS);
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(false);
  const [savingGrade, setSavingGrade] = useState(null);
  const [dirty, setDirty] = useState(false);

  /* ── Load ──────────────────────────────────────────────── */
  const load = () => {
    api.get('/school-dashboard').then(r => {
      if (r.data.stats) setStats(prev => ({ ...EMPTY_STATS, ...r.data.stats }));
      const gradeMap = {};
      (r.data.grades || []).forEach(g => { gradeMap[g.grade_level] = g; });
      setGrades(gradeMap);
      setDirty(false);
    }).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  /* ── Field setters ─────────────────────────────────────── */
  const set = (field) => (val) => {
    setStats(s => ({ ...s, [field]: val }));
    setDirty(true);
  };

  /* ── Save main stats ───────────────────────────────────── */
  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await api.put('/school-dashboard/stats', stats);
      toast.success('School dashboard saved successfully!');
      setDirty(false);
    } catch { toast.error('Error saving dashboard data.'); }
    finally { setSaving(false); }
  };

  /* ── Save grade ────────────────────────────────────────── */
  const handleSaveGrade = async (gradeLevel) => {
    setSavingGrade(gradeLevel);
    const g = grades[gradeLevel] || {};
    const idx = GRADE_LEVELS.findIndex(x => x.key === gradeLevel);
    try {
      await api.put(`/school-dashboard/grades/${encodeURIComponent(gradeLevel)}`, {
        sections_count: g.sections_count || 0,
        classrooms_count: g.classrooms_count || 0,
        male_count: g.male_count || 0,
        female_count: g.female_count || 0,
        sort_order: idx,
      });
      toast.success(`${gradeLevel} saved!`);
    } catch { toast.error('Error saving grade data.'); }
    finally { setSavingGrade(null); }
  };

  const updateGrade = (key, field, val) => {
    setGrades(g => ({ ...g, [key]: { ...(g[key] || {}), [field]: +val } }));
  };

  /* ── Save button ────────────────────────────────────────── */
  const SaveBtn = ({ label = '💾 Save Changes', style = {} }) => (
    <div style={{ display: 'flex', gap: 10, marginTop: 8, ...style }}>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : label}
      </button>
      {dirty && <span style={{ fontSize: '0.78rem', color: '#D97706', alignSelf: 'center', fontWeight: 600 }}>● Unsaved changes</span>}
    </div>
  );

  /* ── Tab content ─────────────────────────────────────────── */
  const renderTab = () => {
    switch (activeTab) {

      /* ── OVERVIEW ─────────────────────────────────────────── */
      case 'overview':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="📅 School Year & Status">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
                <TxtField label="Active School Year" value={stats.active_school_year} onChange={set('active_school_year')} placeholder="e.g. 2024-2025" hint="Displayed on the homepage hero banner." />
                <SelectField label="Enrollment Status" value={stats.enrollment_status} onChange={set('enrollment_status')} options={['Open', 'Closed', 'Ongoing', 'Incoming']} />
              </div>
            </SectionCard>
            <SectionCard title="📊 Enrollment & Performance">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
                <NumField label="Total Enrollment Count" value={stats.enrollment_count} onChange={set('enrollment_count')} />
                <TxtField label="Performance Indicator" value={stats.performance_indicator} onChange={set('performance_indicator')} placeholder="e.g. MPS 87.5% | NAT Average 82.3%" hint="Short summary shown on the homepage dashboard." />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── ACCESS ───────────────────────────────────────────── */
      case 'access':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="👥 Gender Distribution (Overall)">
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 16 }}>Enter aggregate male/female counts across all grade levels. Per-grade counts are managed in the "Grade Levels" tab.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                <NumField label="Total Male Learners" value={stats.male_count} onChange={set('male_count')} />
                <NumField label="Total Female Learners" value={stats.female_count} onChange={set('female_count')} />
              </div>
            </SectionCard>
            <SectionCard title="📉 Transition & Dropout Rates">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                <PctField label="Retention Rate (%)" value={stats.retention_rate} onChange={set('retention_rate')} hint="Percentage of learners who remain enrolled." />
                <PctField label="Dropout Rate (%)" value={stats.dropout_rate} onChange={set('dropout_rate')} hint="Percentage of learners who dropped out." />
                <PctField label="Transition / Completion Rate (%)" value={stats.transition_completion_rate} onChange={set('transition_completion_rate')} hint="Percentage who transitioned to the next level." />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── QUALITY ──────────────────────────────────────────── */
      case 'quality':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="📈 Academic Proficiency Indicators">
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 16 }}>Enter percentage values (0–100). These appear as progress bars and gauge charts on the homepage.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                <PctField label="Overall Proficiency (%)" value={stats.overall_proficiency} onChange={set('overall_proficiency')} />
                <PctField label="English Independent Readers (%)" value={stats.english_readers} onChange={set('english_readers')} />
                <PctField label="Filipino Independent Readers (%)" value={stats.filipino_readers} onChange={set('filipino_readers')} />
                <PctField label="Math Numeracy (%)" value={stats.math_numeracy} onChange={set('math_numeracy')} />
                <PctField label="Science Literacy (%)" value={stats.science_literacy} onChange={set('science_literacy')} />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── EQUITY ───────────────────────────────────────────── */
      case 'equity':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="♿ Inclusive Education Data">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                <NumField label="Learners with Disabilities (SPED)" value={stats.learners_with_disabilities} onChange={set('learners_with_disabilities')} hint="Total number of learners with special needs." />
                <NumField label="Disadvantaged Learners" value={stats.disadvantaged_learners} onChange={set('disadvantaged_learners')} hint="Includes IP, rebel returnees, etc." />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── WELL-BEING ───────────────────────────────────────── */
      case 'wellbeing':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="⚖️ BMI Status">
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 16 }}>Enter the number of learners in each BMI category. These feed the donut chart on the homepage.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                <NumField label="Normal BMI" value={stats.bmi_normal} onChange={set('bmi_normal')} />
                <NumField label="Overweight" value={stats.bmi_overweight} onChange={set('bmi_overweight')} />
                <NumField label="Obese" value={stats.bmi_obese} onChange={set('bmi_obese')} />
                <NumField label="Wasted (Underweight)" value={stats.bmi_wasted} onChange={set('bmi_wasted')} />
              </div>
            </SectionCard>
            <SectionCard title="🏥 Health & Safety">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                <NumField label="Health Assessment Done (count)" value={stats.health_assessment_done} onChange={set('health_assessment_done')} hint="Number of learners who received health assessment." />
                <NumField label="Child Protection Cases" value={stats.child_protection_cases} onChange={set('child_protection_cases')} hint="Number of active or reported cases." />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── HUMAN RESOURCE ───────────────────────────────────── */
      case 'hr':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="👥 Personnel Count">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                <NumField label="Teaching Personnel" value={stats.teaching_personnel} onChange={set('teaching_personnel')} hint="All licensed teachers and faculty." />
                <NumField label="Non-Teaching Personnel" value={stats.non_teaching_personnel} onChange={set('non_teaching_personnel')} hint="Utility, custodial, and support staff." />
                <NumField label="Administrative Staff" value={stats.administrative_staff} onChange={set('administrative_staff')} hint="Office administrators, clerks, etc." />
                <NumField label="Vacant Positions" value={stats.vacant_positions} onChange={set('vacant_positions')} hint="Positions currently unfilled." />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── GOVERNANCE ───────────────────────────────────────── */
      case 'governance':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="🏛️ School-Based Management (SBM)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                <TxtField label="SBM Level" value={stats.sbm_level} onChange={set('sbm_level')} placeholder="e.g. Level 1, Level 2, Level 3" hint="Current SBM accreditation level." />
                <PctField label="OPCRF Rating (%)" value={stats.opcrf_rating} onChange={set('opcrf_rating')} hint="Office Performance Commitment and Review Form rating." />
              </div>
            </SectionCard>
            <SectionCard title="📐 Ratios">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                <TxtField label="Classroom Ratio" value={stats.classroom_ratio} onChange={set('classroom_ratio')} placeholder="e.g. 1:40" hint="Number of classrooms per students." />
                <TxtField label="Teacher Ratio" value={stats.teacher_ratio} onChange={set('teacher_ratio')} placeholder="e.g. 1:35" hint="Teachers to students ratio." />
                <TxtField label="Seat Ratio" value={stats.seat_ratio} onChange={set('seat_ratio')} placeholder="e.g. 1:1" hint="Seats to students ratio." />
              </div>
            </SectionCard>
            <SectionCard title="🌐 Infrastructure & Resources">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                <TxtField label="Internet Speed" value={stats.internet_speed} onChange={set('internet_speed')} placeholder="e.g. 100 Mbps" hint="Current internet connection speed." />
                <NumField label="Functional Facilities (count)" value={stats.functional_facilities_count} onChange={set('functional_facilities_count')} hint="Number of facilities currently functional." />
                <NumField label="Total Facilities (count)" value={stats.total_facilities_count} onChange={set('total_facilities_count')} hint="Total number of school facilities." />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── ACCOUNTABILITY ───────────────────────────────────── */
      case 'accountability':
        return (
          <form onSubmit={handleSave}>
            <SectionCard title="✅ Compliance Status">
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 20 }}>
                Set the compliance status for each accountability item. These appear as color-coded badges on the homepage.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 2 }}>
                {ACC_ITEMS.map(({ key, label }) => (
                  <StatusSelect key={key} label={label} value={stats[key]} onChange={set(key)} />
                ))}
                <StatusSelect label="Digitalization Status" value={stats.digitalization_status} onChange={set('digitalization_status')} />
              </div>
            </SectionCard>
            <SaveBtn />
          </form>
        );

      /* ── GRADE LEVELS ─────────────────────────────────────── */
      case 'grades':
        return (
          <div>
            <SectionCard title="🏫 Sections, Classrooms & Gender per Grade Level">
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 20 }}>
                Enter the number of sections, classrooms, and male/female counts for each grade level.
                Save each row individually. The data feeds the enrollment chart on the homepage.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GRADE_LEVELS.map(gl => {
                  const g = grades[gl.key] || { sections_count: 0, classrooms_count: 0, male_count: 0, female_count: 0 };
                  return (
                    <div key={gl.key} style={{
                      display: 'flex', gap: 12, alignItems: 'flex-end',
                      padding: '14px 16px', background: 'var(--gray-50)',
                      borderRadius: 8, border: '1px solid var(--gray-200)', flexWrap: 'wrap',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)', minWidth: 80, alignSelf: 'center' }}>{gl.label}</span>
                      <div style={{ display: 'flex', gap: 10, flex: 1, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        {[
                          { field: 'sections_count', label: 'Sections' },
                          { field: 'classrooms_count', label: 'Classrooms' },
                          { field: 'male_count', label: 'Male' },
                          { field: 'female_count', label: 'Female' },
                        ].map(({ field, label }) => (
                          <div key={field} className="form-group" style={{ margin: 0, flex: '0 0 120px' }}>
                            <label className="form-label" style={{ marginBottom: 4 }}>{label}</label>
                            <input type="number" className="form-control" min={0}
                              value={g[field] ?? 0}
                              onChange={e => updateGrade(gl.key, field, e.target.value)} />
                          </div>
                        ))}
                        <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', marginBottom: 0, flexShrink: 0 }}
                          disabled={savingGrade === gl.key}
                          onClick={() => handleSaveGrade(gl.key)}>
                          {savingGrade === gl.key ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📊 School Performance Dashboard</h1>
          <p className="admin-page-sub">
            Manage all public-facing school dashboard data — enrollment, academic performance, well-being,
            human resources, governance, and compliance. All changes reflect immediately on the homepage.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">🌐 View Homepage</a>
      </div>

      {/* Info banner */}
      <div style={{ padding: '12px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: '#1D4ED8', marginBottom: 22, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
        <div>
          <strong>How to use:</strong> Select a section tab below, update the fields, then click "Save Changes."
          Each section covers a different part of the homepage performance dashboard.
          Grade-level data (sections, classrooms, enrollment by grade) is in the "Grade Levels" tab.
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22, borderBottom: '1px solid var(--gray-200)', paddingBottom: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.82rem',
              border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === t.id ? 'var(--blue-primary)' : 'white',
              borderColor: activeTab === t.id ? 'var(--blue-primary)' : 'var(--gray-200)',
              color: activeTab === t.id ? 'white' : 'var(--gray-600)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        {renderTab()}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
