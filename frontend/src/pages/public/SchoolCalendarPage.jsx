import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { IconCalendar, IconSearch, IconRepeat, IconClipboard } from '../../components/Icons';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CATEGORY_LABELS = {
  event: 'Event',
  academic: 'Academic',
  holiday: 'Holiday',
  special: 'Special',
  general: 'General',
};

/* ─── Theme: same identity as Header, HomePage and AdmissionsPage ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
  ink: 'var(--green-950, #5E0B10)',
  paper: '#FFF4C7',
  cream: '#FFFBEA',
  tint: '#FBE3E3',
  muted: '#6B4A44',
  line: 'rgba(142, 18, 24, 0.14)',
  rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)',
};
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
const CSS = `
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: 2px; }
.bes-lift { transition: transform .18s ease, box-shadow .18s ease; }
.bes-lift:hover { transform: translateY(-3px); box-shadow: 0 2px 4px rgba(94,11,16,.06), 0 16px 32px rgba(94,11,16,.12); }
.bes-pillbtn { padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(142,18,24,.14); background: #fff; color: #6B4A44; font: inherit; font-weight: 700; font-size: .85rem; cursor: pointer; transition: background .2s ease, color .2s ease; }
.bes-pillbtn[aria-pressed="true"] { background: var(--green-800, #A8161B); border-color: var(--green-800, #A8161B); color: #fff; }
@media (prefers-reduced-motion: reduce) { .bes-lift, .bes-pillbtn { transition: none; } .bes-lift:hover { transform: none; } }
`;

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

const fmtDate = (d, opts = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-PH', opts) : '';

/* ─── Small pieces ─── */
function Hero({ wide, eyebrow, title, subtitle, aside }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '56px 24px 56px 96px' : '32px 20px 36px 40px' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{eyebrow}</span>
          <h1 style={{ margin: '20px 0 14px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, fontSize: 'clamp(2.3rem, 5.4vw, 3.8rem)' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: '50ch', fontSize: '1.08rem', lineHeight: 1.6, color: C.muted }}>{subtitle}</p>
        </div>
        {aside}
      </div>
    </header>
  );
}

function Ticket({ wide, Icon, label, value, note, rows = [] }) {
  return (
    <aside aria-label={label} style={{ position: 'relative', ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
      <div style={{ padding: '24px 28px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 52, height: 52, borderRadius: 12, background: C.tint, color: C.red }}><Icon size={26} /></span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>{label}</p>
          <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{value}</p>
          {note && <p style={{ margin: 0, fontSize: '0.85rem', color: C.muted }}>{note}</p>}
        </div>
      </div>
      {rows.length > 0 && (
        <>
          <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
          </div>
          <dl style={{ margin: 0, padding: '8px 28px 16px' }}>
            {rows.map(({ Icon: RowIcon, label: l, value: v }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <span style={{ color: C.red, display: 'flex' }}><RowIcon size={18} /></span>
                <dt style={{ flex: 1, fontSize: '0.88rem', color: C.muted }}>{l}</dt>
                <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </aside>
  );
}

/* Month heading: the month number sits in the red margin rule */
function MonthHead({ num, eyebrow, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 18 }}>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'stretch', flex: 'none', minWidth: 44, paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red, fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{num}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem' }}>{eyebrow}</p>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)' }}>{title}</h2>
      </div>
    </div>
  );
}

function EmptyState({ Icon, children }) {
  return (
    <div style={{ ...card, boxShadow: 'none', border: `2px dashed ${C.line}`, padding: '36px 24px', textAlign: 'center' }}>
      <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 48, height: 48, borderRadius: 12, background: C.tint, color: C.red, marginBottom: 12 }}><Icon size={22} /></span>
      <p style={{ margin: 0, color: C.muted, fontSize: '0.98rem', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function SchoolCalendarPage() {
  const wide = useWide();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    api.get('/calendar').then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((e) => { if (e.category) set.add(e.category); });
    return ['all', ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
      const matchesQuery = !q || e.event_name?.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [events, query, activeCategory]);

  const next = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((e) => e.start_date && new Date(e.start_date) >= today)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
  }, [events]);

  // Group filtered events by the month of their start_date
  const grouped = {};
  filtered.forEach((e) => {
    if (!e.start_date) return;
    const m = new Date(e.start_date).getMonth();
    if (Number.isNaN(m)) return;
    if (!grouped[m]) grouped[m] = [];
    grouped[m].push(e);
  });

  return (
    <div className="bes-page" style={{ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 }}>
      <style>{CSS}</style>

      <Hero
        wide={wide}
        eyebrow="School Calendar"
        title="Important dates for the school year."
        subtitle="Events, holidays, and academic dates, grouped by month."
        aside={
          <Ticket wide={wide} Icon={IconCalendar} label="Next event"
            value={loading ? '…' : next ? fmtDate(next.start_date, { month: 'short', day: 'numeric' }) : 'None set'}
            note={next ? next.event_name : 'No upcoming dates posted'}
            rows={[
              { Icon: IconClipboard, label: 'Events posted', value: loading ? '…' : events.length },
              { Icon: IconRepeat, label: 'Recurring yearly', value: loading ? '…' : events.filter((e) => !!e.is_recurring).length },
            ]} />
        }
      />

      <main className="container" style={{ maxWidth: 820, padding: wide ? '40px 24px 0' : '28px 16px 0', display: 'flex', flexDirection: 'column', gap: wide ? 40 : 32 }}>
        {!loading && events.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 220px', maxWidth: 300, padding: '0 14px', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10 }}>
              <IconSearch size={16} style={{ color: C.muted, flexShrink: 0 }} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events…" aria-label="Search events"
                style={{ border: 'none', outline: 'none', background: 'transparent', font: 'inherit', fontSize: '0.92rem', padding: '12px 0', width: '100%', color: C.ink }} />
            </div>
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Filter by category">
                {categories.map((c) => (
                  <button key={c} type="button" className="bes-pillbtn" aria-pressed={activeCategory === c} onClick={() => setActiveCategory(c)}>
                    {c === 'all' ? 'All' : (CATEGORY_LABELS[c] || c)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ ...card, padding: '16px 20px' }}>
                <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '70%', height: 10 }} />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState Icon={IconCalendar}>No calendar events have been posted yet.</EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState Icon={IconSearch}>No events match your search or filter. Clear them to see the full calendar.</EmptyState>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => +a - +b).map(([month, evs]) => (
            <section key={month} aria-label={MONTHS_FULL[+month]}>
              <MonthHead num={String(+month + 1).padStart(2, '0')} eyebrow={`${evs.length} ${evs.length === 1 ? 'event' : 'events'}`} title={MONTHS_FULL[+month]} />
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...evs].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map((ev) => {
                  const startDate = new Date(ev.start_date);
                  const hasRange = ev.end_date && ev.end_date !== ev.start_date;
                  return (
                    <li key={ev.id} className="bes-lift" style={{ ...card, display: 'flex', gap: 16, padding: '14px 18px', alignItems: 'center' }}>
                      <div aria-hidden="true" style={{ flex: 'none', width: 56, textAlign: 'center', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.line}`, background: C.paper }}>
                        <p style={{ margin: 0, padding: '3px 0', background: C.red, color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>{MONTHS[+month]}</p>
                        <p style={{ margin: 0, padding: '6px 0 7px', color: C.ink, fontSize: '1.45rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>{startDate.getDate()}</p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.35 }}>{ev.event_name}</h3>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          {ev.category && (
                            <span style={{ padding: '3px 11px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: C.tint, color: C.deep }}>{CATEGORY_LABELS[ev.category] || ev.category}</span>
                          )}
                          {hasRange && <span style={{ fontSize: '0.84rem', color: C.muted }}>{fmtDate(ev.start_date)} to {fmtDate(ev.end_date)}</span>}
                          {!!ev.is_recurring && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: C.muted }}>
                              <IconRepeat size={13} /> Recurring yearly
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
