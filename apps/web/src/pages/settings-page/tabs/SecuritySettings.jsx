import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, Shield } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { authClient } from '@utils/authClient';

const underlineInput = (t, error) => ({
  fontFamily: '"Fraunces", serif',
  fontSize: 15,
  color: t.ink,
  background: 'transparent',
  outline: 'none',
  width: '100%',
  borderBottom: `1px solid ${error ? t.red : `${t.ink}35`}`,
  paddingBottom: 6,
  paddingTop: 2,
});

const Field = ({ label, error, children }) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: `${t.ink}60`, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.red }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const Section = ({ title, eyebrow, children }) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  return (
    <div
      className="rounded-sm p-5 sm:p-6 flex flex-col gap-5"
      style={{ background: t.bgDeep, border: `1px solid ${t.ink}0f` }}
    >
      {(title || eyebrow) && (
        <div>
          {eyebrow && (
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50`, marginBottom: 2 }}>
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 1.1 }}>
              {title}
            </h2>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

const EMPTY_PW = { current: '', next: '', confirm: '' };

const SecuritySettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const { user } = useAuth();
  const [pw, setPw] = useState(EMPTY_PW);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const hasPasswordAuth = !user?.app_metadata?.provider || user.app_metadata.provider === 'email';

  const handleChange = field => e => {
    setPw(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleUpdatePassword = async () => {
    if (pw.next !== pw.confirm) { setError('New passwords don\'t match'); return; }
    if (pw.next.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (!pw.current) { setError('Enter your current password'); return; }

    setSaving(true);
    try {
      const result = await authClient.changePassword({
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      if (result?.error) throw new Error(result.error.message);
      setPw(EMPTY_PW);
      toast.success('Password updated');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      {/* 2FA */}
      <Section title="two-factor auth." eyebrow="coming soon">
        <div className="flex items-start gap-3 opacity-50">
          <Shield size={18} style={{ color: t.blue, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, lineHeight: 1.5 }}>
              Enable two-factor authentication for an extra layer of account protection.
            </p>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}50`, marginTop: 4 }}>
              not wired yet — check back soon
            </p>
          </div>
        </div>
      </Section>

      {/* Password */}
      <Section title="change password." eyebrow="security">
        {hasPasswordAuth ? (
          <>
            <Field label="Current password" error="">
              <input
                type="password"
                value={pw.current}
                onChange={handleChange('current')}
                placeholder="••••••••"
                style={underlineInput(t, '')}
              />
            </Field>

            <Field label="New password" error="">
              <input
                type="password"
                value={pw.next}
                onChange={handleChange('next')}
                placeholder="at least 8 characters"
                style={underlineInput(t, '')}
              />
            </Field>

            <Field label="Confirm new password" error={error}>
              <input
                type="password"
                value={pw.confirm}
                onChange={handleChange('confirm')}
                placeholder="same again"
                style={underlineInput(t, error)}
              />
            </Field>

            <div className="flex justify-end pt-1">
              <motion.button
                type="button"
                onClick={handleUpdatePassword}
                disabled={saving}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-sm"
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontSize: 14,
                  background: saving ? `${t.ink}15` : t.red,
                  color: saving ? `${t.ink}45` : '#fff',
                  minHeight: 44,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {saving ? 'updating…' : 'update password'}
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-3">
            <Lock size={18} style={{ color: `${t.ink}45`, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.65, lineHeight: 1.5 }}>
              Your account is secured through{' '}
              <span style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic' }}>
                {user?.app_metadata?.provider ?? 'social login'}
              </span>
              . Password management is not available for social accounts.
            </p>
          </div>
        )}
      </Section>
    </motion.div>
  );
};

export default SecuritySettings;
