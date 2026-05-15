import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { userPreferences } from '@services/userPreferences';

const DEFAULTS = {
  emailNotifications:   true,
  pushNotifications:    true,
  commentNotifications: true,
  marketingEmails:      false,
};

const Toggle = ({ checked, onChange, label, description, t }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <div className="flex-1 min-w-0">
      <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, lineHeight: 1.3 }}>
        {label}
      </p>
      {description && (
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}50`, marginTop: 1 }}>
          {description}
        </p>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative shrink-0 flex items-center"
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? t.red : `${t.ink}22`,
        transition: 'background 0.2s',
        minWidth: 44,
        minHeight: 44,
      }}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
          display: 'block',
          flexShrink: 0,
        }}
      />
    </button>
  </div>
);

const Section = ({ title, eyebrow, children, t }) => (
  <div
    className="rounded-sm p-5 sm:p-6 flex flex-col gap-4"
    style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
  >
    <div>
      {eyebrow && (
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50`, marginBottom: 2 }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 1.1 }}>
        {title}
      </h2>
    </div>
    <div
      className="flex flex-col gap-3"
      style={{ borderTop: `1px solid ${t.ink}0e`, paddingTop: 12 }}
    >
      {children}
    </div>
  </div>
);

const NotificationsSettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    userPreferences.getUserNotificationSettings().then(data => {
      if (data) {
        setPrefs({
          emailNotifications:   data.email_notifications   ?? DEFAULTS.emailNotifications,
          pushNotifications:    data.push_notifications    ?? DEFAULTS.pushNotifications,
          commentNotifications: data.comment_notifications ?? DEFAULTS.commentNotifications,
          marketingEmails:      data.marketing_emails      ?? DEFAULTS.marketingEmails,
        });
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const toggle = async key => {
    const prev = prefs[key];
    const next = { ...prefs, [key]: !prev };
    setPrefs(next);
    try {
      await userPreferences.saveNotificationPrefs(next);
    } catch {
      setPrefs(p => ({ ...p, [key]: prev }));
      toast.error('Failed to save — try again');
    }
  };

  if (!loaded) {
    return (
      <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: `${t.ink}45` }}>
        loading…
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      <Section title="activity." eyebrow="notify me about" t={t}>
        <Toggle
          checked={prefs.emailNotifications}
          onChange={() => toggle('emailNotifications')}
          label="New comparisons"
          description="when someone you follow posts"
          t={t}
        />
        <Toggle
          checked={prefs.pushNotifications}
          onChange={() => toggle('pushNotifications')}
          label="Votes on your comparisons"
          description="when someone weighs in"
          t={t}
        />
        <Toggle
          checked={prefs.commentNotifications}
          onChange={() => toggle('commentNotifications')}
          label="Comments &amp; replies"
          description="when someone responds to you"
          t={t}
        />
      </Section>

      <Section title="marketing." eyebrow="from us" t={t}>
        <Toggle
          checked={prefs.marketingEmails}
          onChange={() => toggle('marketingEmails')}
          label="Weekly digest"
          description="trending comparisons, top votes"
          t={t}
        />
      </Section>
    </motion.div>
  );
};

export default NotificationsSettings;
