import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const BillingSettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      {/* Current plan */}
      <div
        className="rounded-sm p-5 sm:p-6 flex flex-col gap-2"
        style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
      >
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50` }}>
          your plan
        </p>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 26, color: t.ink, lineHeight: 1.05 }}>
          free.
        </h2>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.65, lineHeight: 1.5 }}>
          All core features — comparisons, votes, comments — are free forever.
        </p>
      </div>

      {/* Upgrade coming soon */}
      <div
        className="rounded-sm p-5 sm:p-6 flex flex-col gap-4"
        style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
      >
        <div>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50`, marginBottom: 2 }}>
            coming soon
          </p>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 1.1 }}>
            more, eventually.
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {[
            'Advanced analytics on your comparisons',
            'Priority support',
            'Early access to new features',
          ].map(item => (
            <div key={item} className="flex items-start gap-2.5">
              <Sparkles
                size={14}
                style={{ color: t.mustard, flexShrink: 0, marginTop: 3 }}
              />
              <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.7, lineHeight: 1.45 }}>
                {item}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}42`, marginTop: 4 }}>
          billing + subscriptions — not wired yet
        </p>
      </div>
    </motion.div>
  );
};

export default BillingSettings;
