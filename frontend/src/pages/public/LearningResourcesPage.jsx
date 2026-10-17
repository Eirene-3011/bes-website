import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBook, IconAbc, IconRuler, IconLibrary, IconFileText, IconDownload, IconSearch } from '../../components/Icons';

const CATS = [
  { key: 'ARAL', label: 'ARAL Program', Icon: IconBook },
  { key: 'KS1', label: 'Key Stage 1', Icon: IconAbc },
  { key: 'KS2', label: 'Key Stage 2', Icon: IconRuler },
  { key: 'Supplementary', label: 'Supplementary', Icon: IconLibrary },
];

/* ─── Theme: same identity as Header, HomePage and AdmissionsPage ─── */
const C = {
  red: 'var(--green-800, #A8161B)',
  deep: 'var(--green-900, #8E1218)',
  ink: 'var(--green-950, #5E0B10)',
  goldText: '#8A5A00',
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
.bes-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 14px; border-radius: 8px; border: 2px solid transparent; font: inherit; font-weight: 800; font-size: .82rem; text-decoration: none; cursor: pointer; transition: transform .15s ease; }
.bes-btn:hover { transform: translateY(-1px); }
.bes-btn-primary { background: var(--green-800, #A8161B); color: #fff; box-shadow: 0 6px 14px rgba(94,11,16,.25); }
@media (prefers-reduced-motion: reduce) { .bes-lift, .bes-btn { transition: none; } .bes-lift:hover, .bes-btn:hover { transform: none; } }
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

function EmptyState({ Icon, children }) {
  return (
    <div style={{ ...card, boxShadow: 'none', border: `2px dashed ${C.line}`, padding: '36px 24px', textAlign: 'center' }}>
      <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 48, height: 48, borderRadius: 12, background: C.tint, color: C.red, marginBottom: 12 }}><Icon size={22} /></span>
      <p style={{ margin: 0, color: C.muted, fontSize: '0.98rem', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function LearningResourcesPage() {
  const wide = useWide();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ARAL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/resources').then((r) => setResources(r.data)).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = {};
    CATS.forEach((cat) => { c[cat.key] = 0; });
    resources.forEach((r) => { if (c[r.category] !== undefined) c[r.category] += 1; });
    return c;
  }, [resources]);

  const activeCat = CATS.find((c) => c.key === activeTab);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (r.category !== activeTab) return false;
      if (!q) return true;
      return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    });
  }, [resources, activeTab, query]);

  return (
    <div className="bes-page" style={{ background: C.cream, color: C.ink, minHeight: '60vh', paddingBottom: wide ? 96 : 64 }}>
      <style>{CSS}</style>

      <Hero
        wide={wide}
        eyebrow="Learning Resources"
        title="Free materials for every learner."
        subtitle="ARAL program materials, Key Stage resources, and supplementary learning materials."
        aside={
          <Ticket wide={wide} Icon={IconLibrary} label="Resources available" value={loading ? '…' : resources.length} note="Download and print at home"
            rows={CATS.map((c) => ({ Icon: c.Icon, label: c.label, value: loading ? '…' : counts[c.key] }))} />
        }
      />

      {/* Sticky category tabs */}
      <nav aria-label="Resource category" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
        <div className="container" role="tablist" aria-label="Resource category" style={{ maxWidth: 960, display: 'flex', gap: wide ? 8 : 2, overflowX: 'auto', padding: '0 16px' }}>
          {CATS.map((c) => {
            const on = activeTab === c.key;
            return (
              <button key={c.key} type="button" role="tab" aria-selected={on} onClick={() => { setActiveTab(c.key); setQuery(''); }}
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, padding: '16px 14px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${on ? C.red : 'transparent'}`, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: on ? C.ink : C.muted, transition: 'color 0.2s ease, border-color 0.2s ease' }}>
                <c.Icon size={16} />
                {c.label}
                {!loading && !!counts[c.key] && (
                  <span style={{ padding: '1px 8px', borderRadius: 999, background: on ? C.tint : C.cream, color: C.red, fontSize: 12, fontWeight: 800 }}>{counts[c.key]}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="container" style={{ maxWidth: 960, padding: wide ? '40px 24px 0' : '28px 16px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {!loading && resources.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 340, padding: '0 14px', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10 }}>
            <IconSearch size={16} style={{ color: C.muted, flexShrink: 0 }} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${activeCat.label}…`} aria-label="Search resources"
              style={{ border: 'none', outline: 'none', background: 'transparent', font: 'inherit', fontSize: '0.92rem', padding: '12px 0', width: '100%', color: C.ink }} />
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ ...card, padding: '16px 20px' }}>
                <div className="skeleton" style={{ width: '50%', height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '80%', height: 10 }} />
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState Icon={IconLibrary}>No resources have been posted yet. Check back soon.</EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState Icon={activeCat.Icon}>
            {query ? `No ${activeCat.label} resources match “${query}”. Try a different keyword.` : 'No resources in this category yet. Check back soon.'}
          </EmptyState>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((r) => (
              <li key={r.id} className="bes-lift" style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', flexWrap: 'wrap' }}>
                <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', flex: 'none', width: 44, height: 44, borderRadius: 10, background: C.tint, color: C.red }}>
                  <IconFileText size={20} />
                </span>
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>{r.title}</h3>
                  {r.description && <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '0.88rem', lineHeight: 1.55 }}>{r.description}</p>}
                </div>
                {r.file_url ? (
                  <a href={getImageUrl(r.file_url)} target="_blank" rel="noopener noreferrer" className="bes-btn bes-btn-primary">
                    <IconDownload size={14} /> Download
                  </a>
                ) : (
                  <span style={{ padding: '3px 11px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: '#FFF1BF', color: C.goldText }}>Uploading soon</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
