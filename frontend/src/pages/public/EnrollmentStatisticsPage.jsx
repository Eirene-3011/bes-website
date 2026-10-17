import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBuilding, IconBook, IconCalendar, IconListOrdered, IconClipboard } from '../../components/Icons';

/* ─── Content ─────────────────────────────────────────────── */
const LEVELS = [
  { key: 'kinder', label: 'Kinder' },
  { key: 'grade1', label: 'Grade 1' },
  { key: 'grade2', label: 'Grade 2' },
  { key: 'grade3', label: 'Grade 3' },
  { key: 'grade4', label: 'Grade 4' },
  { key: 'grade5', label: 'Grade 5' },
  { key: 'grade6', label: 'Grade 6' },
];

/* ─── Theme: same identity as Header, HomePage and AdmissionsPage ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
  ink: 'var(--green-950, #5E0B10)',
  goldText: '#8A5A00',
  paper: '#FFF4C7',
  cream: '#FFFBEA',
  muted: '#6B4A44',
  line: 'rgba(142, 18, 24, 0.14)',
  rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)',
  up: '#1a7f37',
};
const GRAD = 'var(--grad-masthead, linear-gradient(135deg, #5E0B10, #A8161B))';
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
const secNum = {
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'stretch', flex: 'none',
  minWidth: 44, paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`,
  color: C.red, fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
};

const fmt = (n) => Number(n || 0).toLocaleString();

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

/* ─── Small pieces ─────────────────────────────────────────── */
function SectionHead({ num, eyebrow, title, Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 28 }}>
      <span aria-hidden="true" style={secNum}>{num}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={15} />}{eyebrow}
        </p>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', lineHeight: 1.1 }}>{title}</h2>
      </div>
    </div>
  );
}

function Delta({ diff }) {
  if (diff === null) return <span style={{ color: C.muted }}>First year on record</span>;
  if (diff === 0) return <span style={{ color: C.muted }}>No change from last year</span>;
  return (
    <span style={{ color: diff > 0 ? C.up : C.red, fontWeight: 700 }}>
      {diff > 0 ? '▲ +' : '▼ '}{fmt(diff)} from last year
    </span>
  );
}

function Chip({ label, value, dot }) {
  return (
    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '6px 14px', borderRadius: 999, background: C.cream, border: `1px solid ${C.line}`, fontSize: 13, color: C.muted, whiteSpace: 'nowrap' }}>
      {dot && <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: dot }} />}
      {label}<strong style={{ color: C.ink }}>{value}</strong>
    </span>
  );
}

/* Year-over-year bars: click a bar to open that school year */
function TrendBars({ list, selectedId, onSelect, wide }) {
  const max = Math.max(...list.map((y) => Number(y.grand_total) || 0), 1);
  return (
    <div style={{ ...card, padding: wide ? '28px 30px 22px' : '20px 16px 16px' }}>
      <div role="list" style={{ display: 'flex', alignItems: 'flex-end', gap: wide ? 18 : 8, height: 220, overflowX: 'auto' }}>
        {list.map((y, i) => {
          const prev = list[i - 1];
          const diff = prev ? y.grand_total - prev.grand_total : null;
          const on = y.id === selectedId;
          const h = Math.max(((Number(y.grand_total) || 0) / max) * 150, 8);
          return (
            <button key={y.id} type="button" role="listitem" onClick={() => onSelect(y.id)} aria-current={on ? 'true' : undefined}
              aria-label={`School year ${y.school_year}, ${fmt(y.grand_total)} learners`}
              style={{ flex: '1 1 0', minWidth: 72, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: C.ink, padding: 0 }}>
              <span style={{ fontWeight: 800, fontSize: wide ? '1.15rem' : '1rem', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{fmt(y.grand_total)}</span>
              <span style={{ width: '100%', maxWidth: 84, height: h, borderRadius: '8px 8px 2px 2px', background: on ? GRAD : 'rgba(142, 18, 24, 0.18)', transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease' }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? C.red : C.muted, borderBottom: `3px solid ${on ? C.red : 'transparent'}`, paddingBottom: 2 }}>SY {y.school_year}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: diff === null ? C.muted : diff >= 0 ? (diff === 0 ? C.muted : C.up) : C.red, minHeight: 16 }}>
                {diff === null ? '' : diff === 0 ? '—' : `${diff > 0 ? '▲ +' : '▼ '}${fmt(diff)}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EnrollTable({ row }) {
  const maxTotal = Math.max(...LEVELS.map((l) => Number(row[`${l.key}_male`] || 0) + Number(row[`${l.key}_female`] || 0)), 1);
  const th = { padding: '14px 18px', textAlign: 'left', fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap' };
  const td = { padding: '13px 18px', fontSize: 14.5 };
  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <caption style={{ position: 'absolute', left: -9999 }}>Enrollment count per grade level, SY {row.school_year}</caption>
          <thead>
            <tr style={{ background: GRAD, color: '#fff' }}>
              <th scope="col" style={th}>Grade level</th>
              <th scope="col" style={{ ...th, textAlign: 'center' }}>Male</th>
              <th scope="col" style={{ ...th, textAlign: 'center' }}>Female</th>
              <th scope="col" style={{ ...th, minWidth: 180 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((l, i) => {
              const m = Number(row[`${l.key}_male`] || 0);
              const f = Number(row[`${l.key}_female`] || 0);
              const t = m + f;
              return (
                <tr key={l.key} style={{ background: i % 2 ? C.cream : '#fff', borderTop: `1px solid ${C.line}` }}>
                  <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{l.label}</th>
                  <td style={{ ...td, textAlign: 'center', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{m}</td>
                  <td style={{ ...td, textAlign: 'center', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{f}</td>
                  <td style={td}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <strong style={{ minWidth: 34, color: C.red, fontVariantNumeric: 'tabular-nums' }}>{t}</strong>
                      <span aria-hidden="true" style={{ flex: 1, height: 8, borderRadius: 4, background: '#F3EAE8', overflow: 'hidden' }}>
                        <span style={{ display: 'block', width: `${(t / maxTotal) * 100}%`, height: '100%', background: GRAD, borderRadius: 4 }} />
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: C.paper, borderTop: `2px solid ${C.line}`, fontWeight: 800 }}>
              <th scope="row" style={{ ...td, textAlign: 'left' }}>Total</th>
              <td style={{ ...td, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{row.total_male}</td>
              <td style={{ ...td, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{row.total_female}</td>
              <td style={{ ...td, color: C.red, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>{fmt(row.grand_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function EnrollmentStatisticsPage() {
  const wide = useWide();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    api.get('/enrollment-stats')
      .then((r) => { setYears(r.data); if (r.data?.length) setSelectedId(r.data[0].id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // API returns newest-first; trend reads oldest → newest
  const trend = [...years].reverse();
  const selected = years.find((y) => y.id === selectedId) || years[0];
  const latest = years[0];
  const prevOfLatest = years[1];
  const latestDiff = latest && prevOfLatest ? latest.grand_total - prevOfLatest.grand_total : null;

  const largest = latest
    ? LEVELS.map((l) => ({ label: l.label, t: Number(latest[`${l.key}_male`] || 0) + Number(latest[`${l.key}_female`] || 0) })).sort((a, b) => b.t - a.t)[0]
    : null;

  const pick = (id) => {
    setSelectedId(id);
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalLearners = selected ? Number(selected.grand_total) || 0 : 0;
  const malePct = totalLearners ? Math.round((Number(selected.total_male) / totalLearners) * 100) : 0;

  const sectionStyle = { scrollMarginTop: 72, padding: wide ? '64px 0 0' : '44px 0 0' };

  const ticketRows = latest ? [
    { Icon: IconCalendar, label: 'School year', value: `SY ${latest.school_year}` },
    { dot: C.red, label: 'Male', value: fmt(latest.total_male) },
    { dot: '#E8B923', label: 'Female', value: fmt(latest.total_female) },
    { Icon: IconBook, label: 'Largest level', value: largest ? `${largest.label} (${largest.t})` : '—' },
  ] : [];

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>

      {/* ══ HERO: legal pad + the "headcount ticket" ══ */}
      <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
        <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide && latest ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '72px 24px 72px 96px' : '40px 20px 40px 40px' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>
              Enrollment Statistics
            </span>
            <h1 style={{ margin: '22px 0 16px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, fontSize: 'clamp(2.6rem, 6.4vw, 4.6rem)' }}>
              Our learners, year by year.
            </h1>
            <p style={{ margin: 0, maxWidth: '46ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>
              See how many learners enroll at Bacao Elementary School each school year, by grade level and by gender.
            </p>
          </div>

          {latest && (
            <aside aria-label="Latest enrollment at a glance" style={{ position: 'relative', ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
              <div style={{ padding: '26px 28px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 12, background: '#FBE3E3', color: C.red }}><IconBuilding size={26} /></span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>Learners enrolled, SY {latest.school_year}</p>
                  <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{fmt(latest.grand_total)}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}><Delta diff={latestDiff} /></p>
                </div>
              </div>
              <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
                <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
                <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
              </div>
              <dl style={{ margin: 0, padding: '8px 28px 18px' }}>
                {ticketRows.map(({ Icon, dot, label, value }, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                    <span style={{ color: C.red, display: 'flex', width: 18, justifyContent: 'center' }}>
                      {Icon ? <Icon size={18} /> : <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: dot }} />}
                    </span>
                    <dt style={{ flex: 1, fontSize: '0.88rem', color: C.muted }}>{label}</dt>
                    <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </header>

      {loading ? (
        <main className="container" style={{ maxWidth: 960, padding: wide ? '40px 24px 0' : '28px 16px 0' }}>
          <div className="skeleton" style={{ width: '100%', height: 300, borderRadius: 12 }} />
        </main>
      ) : years.length === 0 ? (
        <main className="container" style={{ maxWidth: 960, padding: wide ? '40px 24px 0' : '28px 16px 0' }}>
          <div style={{ ...card, padding: '22px 26px', borderLeft: `4px solid ${C.line}`, color: C.muted, lineHeight: 1.6 }}>
            Enrollment statistics have not been posted yet. Check back soon, or contact the school directly.
          </div>
        </main>
      ) : (
        <>
          {/* ══ Sticky school-year tabs ══ */}
          <nav aria-label="School years" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
            <div className="container" style={{ maxWidth: 960, display: 'flex', gap: wide ? 8 : 2, overflowX: 'auto', padding: '0 16px' }}>
              {years.map((y) => {
                const on = y.id === selected.id;
                return (
                  <button key={y.id} type="button" onClick={() => pick(y.id)} aria-current={on ? 'true' : undefined}
                    style={{ whiteSpace: 'nowrap', padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
                    SY {y.school_year}
                  </button>
                );
              })}
            </div>
          </nav>

          <main className="container" style={{ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' }}>

            {/* 01 Trend */}
            <section style={{ ...sectionStyle, paddingTop: wide ? 48 : 32 }}>
              <SectionHead num="01" eyebrow="Compare the years" title="Enrollment Trend" Icon={IconListOrdered} />
              <TrendBars list={trend} selectedId={selected.id} onSelect={pick} wide={wide} />
              <p style={{ margin: '12px 4px 0', fontSize: 13, color: C.muted }}>Tap a bar to see that school year in detail.</p>
            </section>

            {/* 02 Detail for the selected year */}
            <section ref={detailRef} style={sectionStyle} aria-live="polite">
              <SectionHead num="02" eyebrow={`SY ${selected.school_year}`} title="Enrollment Count" Icon={IconClipboard} />

              {/* Gender split */}
              <div style={{ ...card, padding: wide ? '22px 26px' : '18px', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                  <p style={{ margin: 0, flex: '1 1 200px', fontWeight: 800, fontSize: '1.05rem' }}>
                    {fmt(selected.grand_total)} learners enrolled
                  </p>
                  <Chip dot={C.red} label="Male " value={fmt(selected.total_male)} />
                  <Chip dot="#E8B923" label="Female " value={fmt(selected.total_female)} />
                </div>
                <div role="img" aria-label={`${malePct}% male, ${100 - malePct}% female`} style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', background: '#F3EAE8' }}>
                  <div style={{ width: `${malePct}%`, background: GRAD, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  <div style={{ flex: 1, background: '#E8B923' }} />
                </div>
              </div>

              <EnrollTable row={selected} />

              {selected.chart_image_url && (
                <figure style={{ margin: '18px 0 0', ...card, overflow: 'hidden' }}>
                  <figcaption style={{ padding: '14px 20px', fontWeight: 800, fontSize: 14, borderBottom: `1px solid ${C.line}`, background: C.cream }}>
                    Enrollment chart, SY {selected.school_year}
                  </figcaption>
                  <img src={getImageUrl(selected.chart_image_url)} alt={`Enrollment chart SY ${selected.school_year}`} style={{ width: '100%', display: 'block' }} />
                </figure>
              )}
            </section>
          </main>
        </>
      )}
    </div>
  );
}
