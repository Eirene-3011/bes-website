import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconUsers, IconDownload, IconUser } from '../../components/Icons';

/* ─── Admissions-style helpers (kept in this file) ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  ink: 'var(--green-950, #5E0B10)',
  gold: '#E8B923',
  goldText: '#8A5A00',
  paper: '#FFF4C7',
  cream: '#FFFBEA',
  muted: '#6B4A44',
  line: 'rgba(142, 18, 24, 0.14)',
  rule: 'rgba(142, 18, 24, 0.15)',
  margin: 'rgba(196, 30, 36, 0.65)',
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

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23FBE3E3"/><circle cx="40" cy="30" r="16" fill="%23C98A8D"/><ellipse cx="40" cy="62" rx="24" ry="16" fill="%23C98A8D"/></svg>';

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

// Highlights the section in view; returns [activeId, scrollTo]
function useScrollSpy(ids, enabled = true) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    if (!enabled || !ids.length) return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  const scrollTo = (id) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  return [active, scrollTo];
}

function PageHero({ tag, title, intro, aside, extra, wide }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
      <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: wide && aside ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: wide ? 56 : 32, alignItems: 'center', padding: wide ? '72px 24px 72px 96px' : '40px 20px 40px 40px' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3em 0.9em', background: 'linear-gradient(100deg, var(--green-950, #5E0B10), var(--green-800, #A8161B))', color: '#fff', fontWeight: 800, fontSize: '0.88rem', borderRadius: '0.3em 0.6em 0.35em 0.55em', boxShadow: '0 4px 10px rgba(94, 11, 16, 0.25)', transform: 'rotate(-1.5deg)' }}>{tag}</span>
          <h1 style={{ margin: '22px 0 16px', color: C.ink, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.98, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: '46ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>{intro}</p>
          {extra && <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>{extra}</div>}
        </div>
        {aside}
      </div>
    </header>
  );
}

// The torn "ticket" card: one headline fact + a few supporting rows
function Ticket({ Icon, label, value, sub, rows = [], wide, ariaLabel }) {
  return (
    <aside aria-label={ariaLabel || label} style={{ ...card, borderRadius: 14, boxShadow: '0 22px 44px rgba(94, 11, 16, 0.2)', transform: wide ? 'rotate(1.2deg)' : 'none' }}>
      <div style={{ padding: '26px 28px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 52, height: 52, borderRadius: 12, background: '#FBE3E3', color: C.red }}><Icon size={26} /></span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: C.muted }}>{label}</p>
          <p style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15 }}>{value}</p>
          {sub && <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: C.muted }}>{sub}</p>}
        </div>
      </div>
      {rows.length > 0 && (
        <>
          <div style={{ position: 'relative', borderTop: `2px dashed ${C.line}` }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, left: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
            <span aria-hidden="true" style={{ position: 'absolute', top: -13, right: -13, width: 24, height: 24, borderRadius: '50%', background: C.paper }} />
          </div>
          <dl style={{ margin: 0, padding: '8px 28px 18px' }}>
            {rows.map(({ Icon: RI, label: l, value: v }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                <span style={{ color: C.red, display: 'flex', width: 18, justifyContent: 'center' }}><RI size={18} /></span>
                <dt style={{ flex: 1, fontSize: '0.88rem', color: C.muted }}>{l}</dt>
                <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right', minWidth: 0 }}>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </aside>
  );
}

function TabBar({ items, active, onSelect, label = 'Page sections' }) {
  return (
    <nav aria-label={label} style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
      <div className="container" style={{ maxWidth: 960, display: 'flex', gap: 4, overflowX: 'auto', padding: '0 16px' }}>
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} type="button" onClick={() => onSelect(it.id)} aria-current={on ? 'true' : undefined}
              style={{ whiteSpace: 'nowrap', padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Notice({ Icon, title, children }) {
  return (
    <div style={{ ...card, padding: '24px 26px', borderLeft: `4px solid ${C.gold}`, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      {Icon && <span style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 44, height: 44, borderRadius: 10, background: '#FBE3E3', color: C.red }}><Icon size={20} /></span>}
      <div>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{title}</p>
        {children && <p style={{ margin: '6px 0 0', maxWidth: '58ch', lineHeight: 1.6, color: C.muted }}>{children}</p>}
      </div>
    </div>
  );
}

function Avatar({ src, name, size = 72, ring = true }) {
  const style = { width: size, height: size, borderRadius: '50%', flex: 'none', objectFit: 'cover', background: '#FBE3E3', border: ring ? `3px solid #fff` : 'none', boxShadow: ring ? `0 0 0 1px ${C.line}` : 'none' };
  return src
    ? <img src={src} alt={name} style={style} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_AVATAR; }} />
    : <span aria-hidden="true" style={{ ...style, display: 'grid', placeItems: 'center', color: C.red }}><IconUser size={size * 0.45} /></span>;
}

const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '56px 0 0' : '40px 0 0' });

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

// Group members by section_name, keeping order of first appearance.
function groupBySection(members) {
  const groups = [];
  const byKey = {};
  (members || []).forEach((m) => {
    const key = m.section_name || '__none__';
    if (!byKey[key]) {
      byKey[key] = { section: m.section_name || null, adviser: m.adviser_name || null, members: [] };
      groups.push(byKey[key]);
    }
    byKey[key].members.push(m);
  });
  return groups;
}

function MemberCard({ m }) {
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 10, padding: '16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
      <Avatar size={64} name={m.full_name} src={m.photo_url ? getImageUrl(m.photo_url) : null} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 13.5, lineHeight: 1.3 }}>{m.full_name}</p>
        {m.role && <p style={{ margin: '3px 0 0', fontSize: 12.5, color: C.red, fontWeight: 600 }}>{m.role}</p>}
        {m.contact_no && <p style={{ margin: '3px 0 0', fontSize: 12, color: C.muted }}>{m.contact_no}</p>}
      </div>
    </div>
  );
}

export default function CommitteesPage() {
  const wide = useWide();
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/committees').then((r) => setCommittees(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const ids = committees.map((c) => `c-${c.id}`);
  const [active, go] = useScrollSpy(ids, !loading);
  const totalMembers = committees.reduce((n, c) => n + (c.members?.length || 0), 0);

  const ticket = (
    <Ticket wide={wide} Icon={IconUsers} ariaLabel="Committees at a glance"
      label="Committees and councils"
      value={loading ? '…' : committees.length > 0 ? committees.length : 'Being updated'}
      rows={!loading && committees.length > 0 ? [{ Icon: IconUser, label: 'Listed members', value: totalMembers }] : []} />
  );

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
      <PageHero wide={wide} tag="Committees & Councils" title="The people who help run BES."
        intro="PTA, SPTA, SSG and other school governance bodies, with their members and advisers." aside={ticket} />

      {!loading && committees.length > 1 && (
        <TabBar items={committees.map((c) => ({ id: `c-${c.id}`, label: c.committee_name }))} active={active} onSelect={go} label="Committees" />
      )}

      <main className="container" style={mainBox(wide)}>
        {loading ? (
          <div style={{ paddingTop: 40 }}>
            {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 12, marginBottom: 24 }} />)}
          </div>
        ) : committees.length === 0 ? (
          <div style={{ ...sectionPad(wide), paddingTop: 40 }}>
            <Notice Icon={IconUsers} title="Committee information is being updated.">
              Check back soon, or contact the school office.
            </Notice>
          </div>
        ) : (
          committees.map((c, idx) => {
            const groups = groupBySection(c.members);
            return (
              <section key={c.id} id={`c-${c.id}`} style={{ ...sectionPad(wide), paddingTop: idx === 0 ? (wide ? 48 : 32) : sectionPad(wide).padding.split(' ')[0] }}>
                <article style={{ ...card, overflow: 'hidden' }}>
                  <div style={{ background: GRAD, color: '#fff', padding: wide ? '22px 28px' : '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(1.2rem, 2.6vw, 1.55rem)', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <IconUsers size={22} />{c.committee_name}
                    </h2>
                    {c.file_url && (
                      <a href={getImageUrl(c.file_url)} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 9, background: '#fff', color: C.ink, fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                        <IconDownload size={15} /> Download file
                      </a>
                    )}
                  </div>

                  <div style={{ padding: wide ? '26px 28px 8px' : '20px 18px 6px' }}>
                    {c.description && <p style={{ margin: '0 0 22px', maxWidth: '68ch', lineHeight: 1.65, color: C.muted }}>{c.description}</p>}

                    {groups.length > 0 ? groups.map((g, gi) => (
                      <div key={g.section || `none-${gi}`} style={{ marginBottom: 26 }}>
                        {g.section && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12, paddingLeft: 12, borderLeft: `5px double ${C.margin}` }}>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>{g.section}</h3>
                            {g.adviser && <span style={{ fontSize: 13, color: C.muted }}>Adviser: {g.adviser}</span>}
                          </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
                          {g.members.map((m) => <MemberCard key={m.id} m={m} />)}
                        </div>
                      </div>
                    )) : (
                      <p style={{ margin: '0 0 22px', fontSize: 14.5, color: C.muted }}>The member list has not been posted yet.</p>
                    )}
                  </div>
                </article>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
