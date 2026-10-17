import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBuilding, IconBook, IconCalendar, IconListOrdered, IconClipboard } from '../../components/Icons';

/* ─── Content ─────────────────────────────────────────────── */
const LEVELS = [
  { key: 'kinder', label: 'Kinder', short: 'K' },
  { key: 'grade1', label: 'Grade 1', short: 'G1' },
  { key: 'grade2', label: 'Grade 2', short: 'G2' },
  { key: 'grade3', label: 'Grade 3', short: 'G3' },
  { key: 'grade4', label: 'Grade 4', short: 'G4' },
  { key: 'grade5', label: 'Grade 5', short: 'G5' },
  { key: 'grade6', label: 'Grade 6', short: 'G6' },
];

/* ─── Theme: same identity as Header, HomePage and AdmissionsPage ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923',
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

const num = (v) => Number(v) || 0;
const fmt = (n) => num(n).toLocaleString();
const hasData = (y) => num(y.grand_total) > 0;
const gradeTotal = (y, k) => num(y[`${k}_male`]) + num(y[`${k}_female`]);

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
// Section heading: icon sits in the red double-rule margin, like a note in a notebook margin
function SectionHead({ title, note, Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', flex: 'none', paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red }}>
        <Icon size={22} />
      </span>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1.1 }}>{title}</h2>
        {note && <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: C.muted }}>{note}</p>}
      </div>
    </div>
  );
}

function Legend() {
  const item = (color, label) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: C.muted }}>
      <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: color }} />{label}
    </span>
  );
  return <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>{item(C.red, 'Male')}{item(C.gold, 'Female')}</div>;
}

function EmptyYear({ year }) {
  return (
    <div style={{ ...card, padding: '28px 28px 28px 32px', borderLeft: `4px solid ${C.gold}`, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 44, height: 44, borderRadius: 10, background: '#FBE3E3', color: C.red }}><IconClipboard size={20} /></span>
      <div>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>Enrollment is still being counted for SY {year}.</p>
        <p style={{ margin: '6px 0 0', maxWidth: '56ch', lineHeight: 1.6, color: C.muted }}>
          The numbers will appear here once the school posts them. Enrollment is open now, so this count will keep growing.
        </p>
      </div>
    </div>
  );
}

/* Learners per grade: stacked columns, male at the bottom, female on top */
function GradeColumns({ row, wide }) {
  const max = Math.max(...LEVELS.map((l) => gradeTotal(row, l.key)), 1);
  const H = wide ? 220 : 180;
  return (
    <div style={{ ...card, padding: wide ? '26px 30px 22px' : '20px 14px 18px', ...paperBg, backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${C.rule} 35px, ${C.rule} 36px)`, backgroundColor: '#fff' }}>
      <div style={{ marginBottom: 18 }}><Legend /></div>
      <div role="list" style={{ display: 'grid', gridTemplateColumns: `repeat(${LEVELS.length}, minmax(0, 1fr))`, gap: wide ? 16 : 6, alignItems: 'end' }}>
        {LEVELS.map((l) => {
          const m = num(row[`${l.key}_male`]);
          const f = num(row[`${l.key}_female`]);
          const t = m + f;
          const h = (t / max) * H;
          return (
            <div key={l.key} role="listitem" aria-label={`${l.label}: ${t} learners, ${m} male, ${f} female`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: H + 54 }}>
              <span style={{ fontWeight: 800, fontSize: wide ? '1.15rem' : '0.95rem', letterSpacing: '-0.03em', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{t}</span>
              <div style={{ width: '100%', maxWidth: 64, height: Math.max(h, 4), display: 'flex', flexDirection: 'column', borderRadius: '8px 8px 0 0', overflow: 'hidden', transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div style={{ flex: f, background: C.gold }} />
                <div style={{ flex: m, background: GRAD }} />
              </div>
              <span style={{ width: '100%', textAlign: 'center', marginTop: 8, paddingTop: 8, borderTop: `2px solid ${C.margin}`, fontWeight: 700, fontSize: wide ? 13.5 : 12, color: C.muted }}>
                {wide ? l.label : l.short}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Compact table, tucked away so the page stays clean */
function EnrollTable({ row }) {
  const th = { padding: '12px 18px', fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap' };
  const td = { padding: '12px 18px', fontSize: 14.5, fontVariantNumeric: 'tabular-nums' };
  return (
    <details style={{ ...card, marginTop: 18, overflow: 'hidden' }}>
      <summary style={{ cursor: 'pointer', padding: '16px 20px', fontWeight: 800, fontSize: 14.5, background: C.cream, listStylePosition: 'inside' }}>
        View the full table
      </summary>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <caption style={{ position: 'absolute', left: -9999 }}>Enrollment per grade level, SY {row.school_year}</caption>
          <thead>
            <tr style={{ background: GRAD, color: '#fff' }}>
              <th scope="col" style={{ ...th, textAlign: 'left' }}>Grade level</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>Male</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>Female</th>
              <th scope="col" style={{ ...th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((l, i) => (
              <tr key={l.key} style={{ background: i % 2 ? C.cream : '#fff', borderTop: `1px solid ${C.line}` }}>
                <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{l.label}</th>
                <td style={{ ...td, textAlign: 'right', color: C.muted }}>{num(row[`${l.key}_male`])}</td>
                <td style={{ ...td, textAlign: 'right', color: C.muted }}>{num(row[`${l.key}_female`])}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: C.red }}>{gradeTotal(row, l.key)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.paper, borderTop: `2px solid ${C.line}`, fontWeight: 800 }}>
              <th scope="row" style={{ ...td, textAlign: 'left' }}>Total</th>
              <td style={{ ...td, textAlign: 'right' }}>{num(row.total_male)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{num(row.total_female)}</td>
              <td style={{ ...td, textAlign: 'right', color: C.red }}>{fmt(row.grand_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  );
}

/* Year-over-year line of totals, only shown when 2+ years have data */
function TrendBars({ list, selectedId, onSelect, wide }) {
  const max = Math.max(...list.map((y) => num(y.grand_total)), 1);
  return (
    <div style={{ ...card, padding: wide ? '26px 30px 18px' : '20px 14px 14px' }}>
      <div role="list" style={{ display: 'flex', alignItems: 'flex-end', gap: wide ? 18 : 8, height: 230, overflowX: 'auto' }}>
        {list.map((y, i) => {
          const prev = list[i - 1];
          const diff = prev ? num(y.grand_total) - num(prev.grand_total) : null;
          const on = y.id === selectedId;
          return (
            <button key={y.id} type="button" role="listitem" onClick={() => onSelect(y.id)} aria-current={on ? 'true' : undefined}
              aria-label={`SY ${y.school_year}, ${fmt(y.grand_total)} learners`}
              style={{ flex: '1 1 0', minWidth: 76, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: C.ink, padding: 0 }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>{fmt(y.grand_total)}</span>
              <span style={{ width: '100%', maxWidth: 80, height: Math.max((num(y.grand_total) / max) * 140, 6), borderRadius: '8px 8px 2px 2px', background: on ? GRAD : 'rgba(142, 18, 24, 0.18)', transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? C.red : C.muted, borderBottom: `3px solid ${on ? C.red : 'transparent'}`, paddingBottom: 2 }}>SY {y.school_year}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, minHeight: 16, color: !diff ? C.muted : diff > 0 ? C.up : C.red }}>
                {diff === null ? '' : diff === 0 ? '—' : `${diff > 0 ? '▲ +' : '▼ '}${fmt(diff)}`}
              </span>
            </button>
          );
        })}
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

  useEffect(() => {
    api.get('/enrollment-stats')
      .then((r) => { setYears(r.data); if (r.data?.length) setSelectedId(r.data[0].id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current = years[0]; // newest school year
  const selected = years.find((y) => y.id === selectedId) || current;
  const withData = [...years].filter(hasData).reverse(); // oldest → newest
  const lastRecorded = years.find(hasData);
  const showTrend = withData.length >= 2;
  const currentHasData = current && hasData(current);

  const biggest = selected && hasData(selected)
    ? LEVELS.map((l) => ({ label: l.label, t: gradeTotal(selected, l.key) })).sort((a, b) => b.t - a.t)[0]
    : null;

  const maleShare = selected && hasData(selected) ? Math.round((num(selected.total_male) / num(selected.grand_total)) * 100) : 0;

  const sectionStyle = { padding: wide ? '56px 0 0' : '40px 0 0' };
  const main = { maxWidth: 960, padding: wide ? '0 24px' : '0 16px' };

  const ticketRows = current ? [
    { Icon: IconCalendar, label: 'School year', value: `SY ${current.school_year}` },
    { Icon: IconBook, label: 'Grade levels', value: 'Kinder to Grade 6' },
    currentHasData
      ? { dot: true, label: 'Male / Female', value: `${num(current.total_male)} / ${num(current.total_female)}` }
      : { Icon: IconListOrdered, label: 'Last recorded', value: lastRecorded ? `${fmt(lastRecorded.grand_total)} (SY ${lastRecorded.school_year})` : 'None yet' },
  ] : [];

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>

      {/* ══ HERO ══ */}
      <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
        <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide && current ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '72px 24px 72px 96px' : '40px 20px 40px 40px' }}>
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

          {current && (
            <aside aria-label="Current school year at a glance" style={{ ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
              <div style={{ padding: '26px 28px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 52, height: 52, borderRadius: 12, background: '#FBE3E3', color: C.red }}><IconBuilding size={26} /></span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>
                    {currentHasData ? `Learners enrolled, SY ${current.school_year}` : `SY ${current.school_year}`}
                  </p>
                  <p style={{ margin: 0, fontSize: currentHasData ? '2.2rem' : '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15 }}>
                    {currentHasData ? fmt(current.grand_total) : 'Count in progress'}
                  </p>
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
                      {Icon ? <Icon size={18} /> : <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: C.red }} />}
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
        <main className="container" style={{ ...main, paddingTop: 40 }}>
          <div className="skeleton" style={{ width: '100%', height: 300, borderRadius: 12 }} />
        </main>
      ) : years.length === 0 ? (
        <main className="container" style={{ ...main, paddingTop: 40 }}>
          <EmptyYear year="this school year" />
        </main>
      ) : (
        <>
          {/* Year tabs: only when there is more than one year to choose from */}
          {years.length > 1 && (
            <nav aria-label="School years" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
              <div className="container" style={{ maxWidth: 960, display: 'flex', gap: wide ? 8 : 2, overflowX: 'auto', padding: '0 16px' }}>
                {years.map((y) => {
                  const on = y.id === selected.id;
                  return (
                    <button key={y.id} type="button" onClick={() => setSelectedId(y.id)} aria-current={on ? 'true' : undefined}
                      style={{ whiteSpace: 'nowrap', padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
                      SY {y.school_year}
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          <main className="container" style={main}>

            {/* Learners per grade (the main view) */}
            <section style={{ ...sectionStyle, paddingTop: wide ? 48 : 32 }} aria-live="polite">
              <SectionHead Icon={IconClipboard} title={`Learners per grade, SY ${selected.school_year}`}
                note={hasData(selected) ? `${fmt(selected.grand_total)} learners in total` + (biggest ? `. ${biggest.label} is the largest level.` : '') : undefined} />

              {hasData(selected) ? (
                <>
                  <GradeColumns row={selected} wide={wide} />

                  <div style={{ ...card, padding: wide ? '20px 26px' : '16px 18px', marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12, fontWeight: 800 }}>
                      <span>{num(selected.total_male)} male <span style={{ color: C.muted, fontWeight: 600 }}>({maleShare}%)</span></span>
                      <span>{num(selected.total_female)} female <span style={{ color: C.muted, fontWeight: 600 }}>({100 - maleShare}%)</span></span>
                    </div>
                    <div role="img" aria-label={`${maleShare}% male, ${100 - maleShare}% female`} style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', background: C.gold }}>
                      <div style={{ width: `${maleShare}%`, background: GRAD, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
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
                </>
              ) : (
                <EmptyYear year={selected.school_year} />
              )}
            </section>

            {/* Trend: only when there are at least two years with real numbers */}
            {showTrend && (
              <section style={sectionStyle}>
                <SectionHead Icon={IconListOrdered} title="Year-over-year" note="Select a bar to open that school year." />
                <TrendBars list={withData} selectedId={selected.id} onSelect={setSelectedId} wide={wide} />
              </section>
            )}
          </main>
        </>
      )}
    </div>
  );
}
