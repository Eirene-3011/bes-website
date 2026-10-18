import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../utils/api';
import { IconCalendar, IconSearch, IconRepeat, IconClipboard } from '../../components/Icons';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_LABELS = {
  event: 'Event',
  academic: 'Academic',
  holiday: 'Holiday',
  special: 'Special',
  general: 'General',
};

function ymKey(y, m) { return `${y}-${m}`; }

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
.bes-page :focus-visible { outline: 3px solid #E8B923; outline-offset: -2px; }
.bes-lift { transition: transform .18s ease, box-shadow .18s ease; }
.bes-lift:hover { transform: translateY(-3px); box-shadow: 0 2px 4px rgba(94,11,16,.06), 0 16px 32px rgba(94,11,16,.12); }
.bes-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 14px; border-radius: 8px; border: 2px solid var(--green-950, #5E0B10); background: transparent; color: var(--green-950, #5E0B10); font: inherit; font-weight: 800; font-size: .82rem; cursor: pointer; transition: transform .15s ease; }
.bes-btn:hover { transform: translateY(-1px); }
.bes-pillbtn { padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(142,18,24,.14); background: #fff; color: #6B4A44; font: inherit; font-weight: 700; font-size: .85rem; cursor: pointer; transition: background .2s ease, color .2s ease; }
.bes-pillbtn[aria-pressed="true"] { background: var(--green-800, #A8161B); border-color: var(--green-800, #A8161B); color: #fff; }
.bes-iconbtn { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(142,18,24,.2); background: #fff; color: var(--green-950, #5E0B10); font: inherit; font-size: 1.3rem; line-height: 1; cursor: pointer; transition: background .2s ease; }
.bes-iconbtn:hover { background: #FFF4C7; }
.bes-field { box-sizing: border-box; padding: 10px 14px; border: 1px solid rgba(142,18,24,.22); border-radius: 10px; background: #fff; font: inherit; font-size: .92rem; font-weight: 600; color: var(--green-950, #5E0B10); cursor: pointer; }
.bes-field:focus { outline: none; border-color: var(--green-800, #A8161B); box-shadow: 0 0 0 3px rgba(168,22,27,.15); }

.bes-cal-weekdays, .bes-cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.bes-cal-weekdays { background: #FFF4C7; border-bottom: 1px solid rgba(142,18,24,.14); }
.bes-cal-weekday { text-align: center; padding: 10px 0; font-size: .8rem; font-weight: 800; color: #6B4A44; }
.bes-cal-cell { position: relative; box-sizing: border-box; height: 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; border-right: 1px solid rgba(142,18,24,.08); border-bottom: 1px solid rgba(142,18,24,.08); background: #fff; font: inherit; color: var(--green-950, #5E0B10); }
.bes-cal-cell:nth-child(7n) { border-right: 0; }
.bes-cal-empty { background: #FFFBEA; }
.bes-cal-num { font-size: .95rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.bes-cal-has { cursor: pointer; background: #FBE3E3; transition: background .15s ease; }
.bes-cal-has .bes-cal-num { font-weight: 800; color: var(--green-900, #8E1218); }
.bes-cal-has:hover { background: #F7CFCF; }
.bes-cal-today { box-shadow: inset 0 0 0 2px var(--green-800, #A8161B); }
.bes-cal-selected, .bes-cal-selected:hover { background: var(--green-800, #A8161B); }
.bes-cal-selected .bes-cal-num { color: #fff; }
.bes-cal-dots { display: flex; gap: 3px; }
.bes-cal-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-800, #A8161B); }
.bes-cal-selected .bes-cal-dot { background: #fff; }
@media (max-width: 480px) { .bes-cal-cell { height: 54px; gap: 3px; } .bes-cal-num { font-size: .82rem; } }
@media (prefers-reduced-motion: reduce) { .bes-lift, .bes-btn, .bes-pillbtn, .bes-cal-has { transition: none; } .bes-lift:hover, .bes-btn:hover { transform: none; } }
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

/* Heading with the red double margin rule; the number (month or day) sits in the rule */
function MarginHead({ num, eyebrow, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'stretch', flex: 'none', minWidth: 44, paddingRight: 16, borderRight: `5px double ${C.margin}`, color: C.red, fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{num}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: '0 0 4px', color: C.red, fontWeight: 700, fontSize: '0.9rem' }}>{eyebrow}</p>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)' }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div style={{ ...card, boxShadow: 'none', border: `2px dashed ${C.line}`, padding: '32px 24px', textAlign: 'center' }}>
      <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 48, height: 48, borderRadius: 12, background: C.tint, color: C.red, marginBottom: 12 }}><IconCalendar size={22} /></span>
      <p style={{ margin: 0, color: C.muted, fontSize: '0.98rem', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

const DAY_MS = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

// Left accent per category, kept inside the school palette
const ACCENT = { event: C.red, academic: C.deep, holiday: '#E8B923', special: C.ink, general: C.margin };

// Where an event sits relative to today
function eventStatus(ev) {
  const t = startOfDay(new Date()).getTime();
  const s = startOfDay(ev.start_date).getTime();
  const e = startOfDay(ev.end_date || ev.start_date).getTime();
  if (t > e) return { key: 'past', label: 'Ended' };
  if (t >= s) return { key: 'now', label: s === e ? 'Today' : 'Happening now' };
  const days = Math.round((s - t) / DAY_MS);
  return { key: 'soon', label: days === 1 ? 'Tomorrow' : `In ${days} days` };
}

const STATUS_STYLE = {
  now: { background: C.red, color: '#fff' },
  soon: { background: '#FFF1BF', color: '#8A5A00' },
  past: { background: C.cream, color: C.muted, border: `1px solid ${C.line}` },
};

function AgendaRow({ ev }) {
  const start = new Date(ev.start_date);
  const end = ev.end_date ? new Date(ev.end_date) : start;
  const hasRange = startOfDay(end).getTime() > startOfDay(start).getTime();
  const days = Math.round((startOfDay(end) - startOfDay(start)) / DAY_MS) + 1;
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const status = eventStatus(ev);
  const short = { weekday: 'short', month: 'short', day: 'numeric' };

  const chipMonth = hasRange && !sameMonth ? `${MONTHS_SHORT[start.getMonth()]}–${MONTHS_SHORT[end.getMonth()]}` : MONTHS_SHORT[start.getMonth()];
  const chipDay = hasRange ? `${start.getDate()}–${end.getDate()}` : `${start.getDate()}`;

  return (
    <li className="bes-lift" style={{ ...card, display: 'flex', gap: 16, padding: '16px 18px', alignItems: 'center', flexWrap: 'wrap', borderLeft: `4px solid ${ACCENT[ev.category] || C.margin}`, opacity: status.key === 'past' ? 0.75 : 1 }}>
      {/* Calendar-leaf date chip */}
      <div aria-hidden="true" style={{ flex: 'none', minWidth: 64, display: 'flex', flexDirection: 'column', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.line}`, background: C.paper }}>
        <span style={{ display: 'block', padding: '4px 8px', background: C.red, color: '#fff', fontSize: '0.74rem', fontWeight: 800, textAlign: 'center' }}>{chipMonth}</span>
        <span style={{ display: 'block', padding: '7px 8px 8px', color: C.ink, fontSize: hasRange ? '1.3rem' : '1.6rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', textAlign: 'center', whiteSpace: 'nowrap' }}>{chipDay}</span>
      </div>

      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{ev.event_name}</h3>
        <div style={{ display: 'flex', gap: '6px 12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {ev.category && (
            <span style={{ padding: '3px 11px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: C.tint, color: C.deep }}>{CATEGORY_LABELS[ev.category] || ev.category}</span>
          )}
          <span style={{ fontSize: '0.86rem', color: C.muted }}>
            {hasRange ? `${fmtDate(start, short)} to ${fmtDate(end, short)} (${days} days)` : fmtDate(start, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          {!!ev.is_recurring && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: C.muted }}>
              <IconRepeat size={13} /> Recurring yearly
            </span>
          )}
        </div>
      </div>

      <span style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap', ...STATUS_STYLE[status.key] }}>{status.label}</span>
    </li>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function SchoolCalendarPage() {
  const wide = useWide();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewDate, setViewDate] = useState(() => {
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const initializedRef = useRef(false);
  const today = new Date();

  useEffect(() => {
    api.get('/calendar').then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  // On first load, jump to the nearest month that actually has events
  useEffect(() => {
    if (initializedRef.current || events.length === 0) return;
    initializedRef.current = true;
    const monthsSet = new Set();
    events.forEach((e) => {
      if (!e.start_date) return;
      const d = new Date(e.start_date);
      monthsSet.add(ymKey(d.getFullYear(), d.getMonth()));
    });
    const monthsArr = Array.from(monthsSet)
      .map((k) => { const [y, m] = k.split('-').map(Number); return { y, m }; })
      .sort((a, b) => a.y - b.y || a.m - b.m);
    const upcoming = monthsArr.find((x) => x.y > today.getFullYear() || (x.y === today.getFullYear() && x.m >= today.getMonth()));
    const chosen = upcoming || monthsArr[0];
    if (chosen) setViewDate({ year: chosen.y, month: chosen.m });
  }, [events]); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((e) => { if (e.category) set.add(e.category); });
    return ['all', ...Array.from(set)];
  }, [events]);

  const byCategory = useMemo(
    () => events.filter((e) => activeCategory === 'all' || e.category === activeCategory),
    [events, activeCategory]
  );

  const next = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return events
      .filter((e) => e.start_date && new Date(e.start_date) >= t)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
  }, [events]);

  const searchMode = query.trim().length > 0;

  // Search mode: agenda grouped by month and year
  const searchResults = useMemo(() => {
    if (!searchMode) return {};
    const q = query.trim().toLowerCase();
    const grouped = {};
    byCategory.filter((e) => e.event_name?.toLowerCase().includes(q)).forEach((e) => {
      if (!e.start_date) return;
      const d = new Date(e.start_date);
      const key = ymKey(d.getFullYear(), d.getMonth());
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    });
    return grouped;
  }, [searchMode, query, byCategory]);

  // Month-jump options come from all events (ignores the category filter)
  const monthOptions = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (!e.start_date) return;
      const d = new Date(e.start_date);
      set.add(ymKey(d.getFullYear(), d.getMonth()));
    });
    return Array.from(set)
      .map((k) => { const [y, m] = k.split('-').map(Number); return { y, m }; })
      .sort((a, b) => a.y - b.y || a.m - b.m);
  }, [events]);

  // Events overlapping the viewed month
  const monthEvents = useMemo(() => {
    const monthStart = new Date(viewDate.year, viewDate.month, 1);
    const monthEnd = new Date(viewDate.year, viewDate.month + 1, 0);
    return byCategory.filter((e) => {
      if (!e.start_date) return false;
      const s = new Date(e.start_date);
      const en = e.end_date ? new Date(e.end_date) : s;
      return s <= monthEnd && en >= monthStart;
    });
  }, [byCategory, viewDate]);

  // Day of month -> events covering that day
  const eventsByDay = useMemo(() => {
    const map = {};
    const monthStart = new Date(viewDate.year, viewDate.month, 1);
    const monthEnd = new Date(viewDate.year, viewDate.month + 1, 0);
    monthEvents.forEach((e) => {
      const s = new Date(e.start_date);
      const en = e.end_date ? new Date(e.end_date) : s;
      const cur = s < monthStart ? new Date(monthStart) : new Date(s);
      const last = en > monthEnd ? monthEnd : en;
      while (cur <= last) {
        const day = cur.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [monthEvents, viewDate]);

  const gridCells = useMemo(() => {
    const startWeekday = new Date(viewDate.year, viewDate.month, 1).getDay();
    const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewDate]);

  const isCurrentRealMonth = viewDate.year === today.getFullYear() && viewDate.month === today.getMonth();

  const goToMonth = (year, month) => { setViewDate({ year, month }); setSelectedDay(null); };
  const shiftMonth = (delta) => {
    let { year, month } = viewDate;
    month += delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    goToMonth(year, month);
  };

  const agendaList = selectedDay ? (eventsByDay[selectedDay] || []) : monthEvents;
  const agendaSorted = [...agendaList].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const plural = (n) => `${n} ${n === 1 ? 'event' : 'events'}`;

  return (
    <div className="bes-page" style={{ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 }}>
      <style>{CSS}</style>

      <Hero
        wide={wide}
        eyebrow="School Calendar"
        title="Important dates for the school year."
        subtitle="Browse the month, tap a highlighted day to see what is happening, or search by event name."
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

      <main className="container" style={{ maxWidth: 860, padding: wide ? '40px 24px 0' : '28px 16px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Search + category filter */}
        {!loading && events.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 220px', maxWidth: 320, padding: '0 14px', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10 }}>
              <IconSearch size={16} style={{ color: C.muted, flexShrink: 0 }} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events by name…" aria-label="Search events"
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

        {/* Month navigator: hidden while searching, since search shows an agenda across all months */}
        {!loading && events.length > 0 && !searchMode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" className="bes-iconbtn" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
              <h2 aria-live="polite" style={{ margin: 0, minWidth: wide ? 220 : 170, textAlign: 'center', color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, fontSize: 'clamp(1.35rem, 3vw, 1.8rem)' }}>
                {MONTHS[viewDate.month]} {viewDate.year}
              </h2>
              <button type="button" className="bes-iconbtn" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
            </div>
            {monthOptions.length > 0 && (
              <select className="bes-field" aria-label="Jump to month" value={ymKey(viewDate.year, viewDate.month)}
                onChange={(e) => { const [y, m] = e.target.value.split('-').map(Number); goToMonth(y, m); }}>
                {!monthOptions.some(({ y, m }) => y === viewDate.year && m === viewDate.month) && (
                  <option value={ymKey(viewDate.year, viewDate.month)}>{MONTHS[viewDate.month]} {viewDate.year}</option>
                )}
                {monthOptions.map(({ y, m }) => (
                  <option key={ymKey(y, m)} value={ymKey(y, m)}>{MONTHS[m]} {y}</option>
                ))}
              </select>
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
          <EmptyState>No calendar events have been posted yet.</EmptyState>
        ) : searchMode ? (
          /* Search results: agenda grouped by month and year */
          Object.keys(searchResults).length === 0 ? (
            <EmptyState>No events match your search or filter. Clear the search to return to the calendar.</EmptyState>
          ) : (
            Object.entries(searchResults)
              .sort(([a], [b]) => {
                const [ay, am] = a.split('-').map(Number);
                const [by, bm] = b.split('-').map(Number);
                return ay - by || am - bm;
              })
              .map(([key, evs]) => {
                const [y, m] = key.split('-').map(Number);
                return (
                  <section key={key} aria-label={`${MONTHS[m]} ${y}`}>
                    <MarginHead num={String(m + 1).padStart(2, '0')} eyebrow={plural(evs.length)} title={`${MONTHS[m]} ${y}`} />
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[...evs].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map((ev) => <AgendaRow key={ev.id} ev={ev} />)}
                    </ul>
                  </section>
                );
              })
          )
        ) : (
          /* Real month-grid calendar */
          <>
            <div style={{ ...card, overflow: 'hidden' }}>
              <div className="bes-cal-weekdays">
                {WEEKDAYS.map((w) => <div key={w} className="bes-cal-weekday">{w}</div>)}
              </div>
              <div className="bes-cal-grid">
                {gridCells.map((day, i) => {
                  if (day === null) return <div key={i} className="bes-cal-cell bes-cal-empty" aria-hidden="true" />;
                  const dayEvents = eventsByDay[day] || [];
                  const hasEvents = dayEvents.length > 0;
                  const isToday = isCurrentRealMonth && day === today.getDate();
                  const isSelected = selectedDay === day;
                  const cls = ['bes-cal-cell', hasEvents && 'bes-cal-has', isSelected && 'bes-cal-selected', isToday && 'bes-cal-today'].filter(Boolean).join(' ');

                  if (!hasEvents) {
                    return (
                      <div key={i} className={cls} aria-current={isToday ? 'date' : undefined}>
                        <span className="bes-cal-num">{day}</span>
                      </div>
                    );
                  }
                  return (
                    <button key={i} type="button" className={cls} aria-pressed={isSelected} aria-current={isToday ? 'date' : undefined}
                      aria-label={`${MONTHS[viewDate.month]} ${day}, ${plural(dayEvents.length)}`}
                      onClick={() => setSelectedDay(isSelected ? null : day)}>
                      <span className="bes-cal-num">{day}</span>
                      <span className="bes-cal-dots" aria-hidden="true">
                        {dayEvents.slice(0, 3).map((_, di) => <span key={di} className="bes-cal-dot" />)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <section aria-label="Event list">
              <MarginHead
                num={agendaSorted.length}
                eyebrow={selectedDay ? (agendaSorted.length === 1 ? 'event on this day' : 'events on this day') : (agendaSorted.length === 1 ? 'event this month' : 'events this month')}
                title={selectedDay ? `${MONTHS[viewDate.month]} ${selectedDay}, ${viewDate.year}` : `${MONTHS[viewDate.month]} ${viewDate.year}`}
                action={selectedDay ? (
                  <button type="button" className="bes-btn" style={{ alignSelf: 'center' }} onClick={() => setSelectedDay(null)}>Show whole month</button>
                ) : null}
              />
              {agendaSorted.length === 0 ? (
                <EmptyState>No events {selectedDay ? 'on this day' : 'this month'}.</EmptyState>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {agendaSorted.map((ev) => <AgendaRow key={ev.id} ev={ev} />)}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
