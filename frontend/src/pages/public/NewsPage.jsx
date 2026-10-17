import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconScroll, IconCalendar, IconFlag } from '../../components/Icons';

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
                <dd style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </aside>
  );
}

// Heading with an icon in the red double-rule "notebook margin"
function SectionHead({ Icon, title, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', flex: 'none', paddingRight: 16, marginRight: 18, borderRight: `5px double ${C.margin}`, color: C.red }}>
        <Icon size={22} />
      </span>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, color: C.ink, fontWeight: 800, letterSpacing: '-0.035em', fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.1 }}>{title}</h2>
        {note && <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: C.muted }}>{note}</p>}
      </div>
    </div>
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

const sectionPad = (wide) => ({ scrollMarginTop: 72, padding: wide ? '56px 0 0' : '40px 0 0' });

const mainBox = (wide) => ({ maxWidth: 960, padding: wide ? '0 24px' : '0 16px' });

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'update', label: 'Updates' },
  { value: 'event', label: 'Events' },
];

// Categories keep distinct tints so they stay scannable
const CATEGORY_BADGE = {
  news: { bg: '#FBE3E3', color: '#8E1218' },
  announcement: { bg: '#FEF3C7', color: '#8A5A00' },
  update: { bg: '#DCFCE7', color: '#15803D' },
  event: { bg: '#E0F2FE', color: '#0369A1' },
};

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function Badge({ category }) {
  const b = CATEGORY_BADGE[category] || CATEGORY_BADGE.news;
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, background: b.bg, color: b.color, textTransform: 'capitalize' }}>
      {category}
    </span>
  );
}

function PostCard({ post, featured, onOpen }) {
  const src = post.image_url ? getImageUrl(post.image_url) : null;
  return (
    <article role="button" tabIndex={0} onClick={() => onOpen(post)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(post); } }}
      style={{ ...card, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: featured ? 'row' : 'column', flexWrap: featured ? 'wrap' : 'nowrap', gridColumn: featured ? '1 / -1' : 'auto' }}>
      <div style={{ flex: featured ? '1 1 340px' : 'none', minHeight: featured ? 260 : 180, height: featured ? 'auto' : 180, background: C.cream, display: 'grid', placeItems: 'center', color: C.red, overflow: 'hidden' }}>
        {src
          ? <img src={src} alt={post.title} style={{ width: '100%', height: '100%', minHeight: 'inherit', objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          : <IconScroll size={36} />}
      </div>
      <div style={{ flex: featured ? '1 1 340px' : 1, padding: featured ? '28px 30px' : '18px 22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge category={post.category} />
          {post.published_date && <span style={{ fontSize: 13, color: C.muted }}>{formatDate(post.published_date)}</span>}
        </div>
        <h3 style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25, fontSize: featured ? 'clamp(1.4rem, 2.6vw, 1.9rem)' : '1.05rem' }}>{post.title}</h3>
        {post.excerpt && (
          <p style={{ margin: 0, flex: 1, color: C.muted, lineHeight: 1.6, fontSize: featured ? 15.5 : 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: featured ? 4 : 3, WebkitBoxOrient: 'vertical' }}>{post.excerpt}</p>
        )}
        <span style={{ color: C.red, fontWeight: 800, fontSize: 14 }}>Read the full post</span>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const wide = useWide();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(filterCat ? `/news-updates?category=${filterCat}` : '/news-updates')
      .then((r) => setPosts(r.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [filterCat]);

  const open = (post) => { setSelected(post); window.scrollTo({ top: 0 }); };
  const catLabel = CATEGORIES.find((c) => c.value === filterCat)?.label || 'All';
  const latest = posts.find((p) => p.published_date)?.published_date;

  /* ── Article view ── */
  if (selected) {
    const src = selected.image_url ? getImageUrl(selected.image_url) : null;
    return (
      <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
        <nav aria-label="Article" style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 6px 14px rgba(94, 11, 16, 0.06)' }}>
          <div className="container" style={{ maxWidth: 960, padding: '0 16px' }}>
            <button type="button" onClick={() => setSelected(null)}
              style={{ padding: '16px 6px 13px', background: 'none', border: 'none', borderBottom: `3px solid ${C.red}`, cursor: 'pointer', font: 'inherit', fontWeight: 800, fontSize: 14, color: C.ink }}>
              Back to all news
            </button>
          </div>
        </nav>

        <header style={{ position: 'relative', overflow: 'hidden', ...paperBg }}>
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: wide ? 48 : 16, width: 5, boxSizing: 'border-box', borderLeft: `1px solid ${C.margin}`, borderRight: `1px solid ${C.margin}`, pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', maxWidth: 960, padding: wide ? '56px 24px 48px 96px' : '32px 20px 32px 40px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <Badge category={selected.category} />
              {selected.published_date && <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>{formatDate(selected.published_date)}</span>}
            </div>
            <h1 style={{ margin: 0, maxWidth: '22ch', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.04, fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>{selected.title}</h1>
            {selected.excerpt && <p style={{ margin: '18px 0 0', maxWidth: '56ch', fontSize: '1.1rem', lineHeight: 1.6, color: C.muted }}>{selected.excerpt}</p>}
          </div>
        </header>

        <main className="container" style={{ ...mainBox(wide), paddingTop: wide ? 40 : 24 }}>
          <article style={{ ...card, overflow: 'hidden' }}>
            {src && <img src={src} alt={selected.title} style={{ width: '100%', maxHeight: 440, objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            {selected.content && (
              <div style={{ padding: wide ? '32px 40px' : '22px 20px', fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap', maxWidth: '70ch' }}>{selected.content}</div>
            )}
          </article>
        </main>
      </div>
    );
  }

  /* ── List view ── */
  const ticket = (
    <Ticket wide={wide} Icon={IconScroll} ariaLabel="Posts at a glance"
      label={filterCat ? `${catLabel} posts` : 'Posts published'}
      value={loading ? '…' : posts.length > 0 ? posts.length : 'None yet'}
      rows={[
        !loading && latest && { Icon: IconCalendar, label: 'Latest post', value: formatDate(latest) },
        { Icon: IconFlag, label: 'Showing', value: catLabel },
      ].filter(Boolean)} />
  );

  return (
    <div style={{ background: C.cream, color: C.ink, paddingBottom: 96 }}>
      <PageHero wide={wide} tag="News & Updates" title="What is happening at BES."
        intro="News, announcements, updates and events from our school." aside={ticket} />

      <main className="container" style={mainBox(wide)}>
        <section style={{ ...sectionPad(wide), paddingTop: wide ? 48 : 32 }}>
          <SectionHead Icon={IconScroll} title="Latest posts" />

          <div role="group" aria-label="Filter by category" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {CATEGORIES.map((c) => {
              const on = filterCat === c.value;
              return (
                <button key={c.value} type="button" onClick={() => setFilterCat(c.value)} aria-pressed={on}
                  style={{ padding: '8px 18px', borderRadius: 999, cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 13.5, color: on ? '#fff' : C.ink, background: on ? C.red : '#fff', border: `1px solid ${on ? C.red : C.line}`, transition: 'background 0.2s ease, color 0.2s ease' }}>
                  {c.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
              {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 12 }} />)}
            </div>
          ) : posts.length === 0 ? (
            <Notice Icon={IconScroll} title={filterCat ? `No ${catLabel.toLowerCase()} posts yet.` : 'No posts have been published yet.'}>
              {filterCat ? 'Try another category, or check back soon.' : 'Check back soon for news from BES.'}
            </Notice>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
              {posts.map((p, i) => <PostCard key={p.id} post={p} featured={wide && i === 0} onOpen={open} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
