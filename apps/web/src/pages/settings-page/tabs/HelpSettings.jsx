import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Mail, Search } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const FAQS = [
  {
    q: 'How do I create a comparison?',
    a: 'Tap the "+" icon in the bottom nav (mobile) or "Create" in the sidebar (desktop). Add up to 4 items, pick a category, write a title, and publish. Others can vote and comment immediately.',
  },
  {
    q: 'How does voting work?',
    a: 'On any comparison, tap the item you think wins. Your vote is recorded instantly. You can change it anytime — we track your latest pick, not your history.',
  },
  {
    q: 'How do I change my username?',
    a: 'Go to Settings → Account. Your username must be lowercase letters, numbers, and underscores only — no spaces. We check availability in real time.',
  },
  {
    q: 'How do I update my profile picture?',
    a: 'Go to Settings → Profile and tap the camera button on your avatar. We accept jpg, png, and gif. The upload goes directly to our storage — no third-party hosts.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Settings → Security. You\'ll need your current password to set a new one. Passwords must be at least 8 characters. If you signed up via Google, password change isn\'t available.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Account deletion is coming soon. Until then, email us and we\'ll handle it manually within 48 hours.',
  },
  {
    q: 'Why can\'t I see my vote on a comparison?',
    a: 'Votes update in real time on the comparison page. If you don\'t see yours, try refreshing. If the issue persists, the comparison may have been deleted by its author.',
  },
  {
    q: 'How do I report a comparison or comment?',
    a: 'Long-press (mobile) or right-click (desktop) any comparison or comment to access the report option. We review all reports manually.',
  },
];

const FaqItem = ({ faq, t }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: `1px solid ${t.ink}0e` }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-start justify-between gap-3 w-full text-left py-4"
        style={{ minHeight: 44 }}
      >
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, lineHeight: 1.4, flex: 1 }}>
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}
        >
          <ChevronDown size={15} style={{ color: `${t.ink}55` }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 14,
                color: t.ink,
                opacity: 0.72,
                lineHeight: 1.6,
                paddingBottom: 16,
              }}
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpSettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(f =>
      f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      {/* Search */}
      <div
        className="rounded-sm p-5 sm:p-6"
        style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
      >
        <div className="flex items-center gap-2.5">
          <Search size={15} style={{ color: `${t.ink}50`, flexShrink: 0 }} />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="search the FAQ…"
            className="flex-1 bg-transparent outline-none"
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 15,
              color: t.ink,
            }}
          />
        </div>
      </div>

      {/* FAQ */}
      <div
        className="rounded-sm px-5 sm:px-6 pt-2"
        style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
      >
        <div className="pb-1">
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50`, marginBottom: 2 }}>
            faq
          </p>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 1.1 }}>
            {query.trim() ? `results for "${query.trim()}"` : 'common questions.'}
          </h2>
        </div>

        {filtered.length > 0 ? (
          filtered.map(faq => <FaqItem key={faq.q} faq={faq} t={t} />)
        ) : (
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 16,
              color: `${t.ink}45`,
              paddingTop: 12,
              paddingBottom: 20,
            }}
          >
            nothing matched — try different words
          </p>
        )}
      </div>

      {/* Contact */}
      <div
        className="rounded-sm p-5 sm:p-6 flex flex-col gap-2"
        style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
      >
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50` }}>
          still stuck?
        </p>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 1.1 }}>
          reach us.
        </h2>
        <a
          href="mailto:hello@twirly.app"
          className="flex items-center gap-2 mt-1"
          style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.blue, textDecoration: 'none', minHeight: 44, alignSelf: 'flex-start' }}
        >
          <Mail size={14} />
          hello@twirly.app
        </a>
      </div>
    </motion.div>
  );
};

export default HelpSettings;
