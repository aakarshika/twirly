import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AtSign, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@services/users';
import { userPreferences } from '@services/userPreferences';

const Field = ({ label, children, aside }) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: `${t.ink}60`, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </label>
        {aside && (
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}45` }}>
            {aside}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

const TextInput = ({ value, onChange, placeholder, disabled, error, type = 'text' }) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent outline-none"
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 15,
          color: disabled ? `${t.ink}55` : t.ink,
          borderBottom: `1px solid ${error ? t.red : disabled ? `${t.ink}18` : `${t.ink}35`}`,
          paddingBottom: 6,
          paddingTop: 2,
          cursor: disabled ? 'default' : 'text',
          transition: 'border-color 0.15s',
        }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.red, marginTop: 4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const Section = ({ children, title, eyebrow }) => {
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

const AccountSettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const { user } = useAuth();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [memberSince, setMemberSince] = useState(null);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.id).then(data => {
      if (data?.profile) {
        setUsername(data.profile.username ?? '');
        if (data.profile.created_at) setMemberSince(new Date(data.profile.created_at));
      }
    });
  }, [user]);

  const validateUsername = value => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'At least 3 characters';
    if (!/^[a-z0-9_]+$/.test(value)) return 'Lowercase letters, numbers, underscores only';
    return '';
  };

  const handleUsernameChange = e => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    setUsernameError(validateUsername(val));
    setChecking(false);
  };

  const handleSave = async () => {
    const err = validateUsername(username);
    if (err) { setUsernameError(err); return; }

    setSaving(true);
    setChecking(true);
    try {
      const available = await userPreferences.checkUsernameAvailability(username);
      if (!available) {
        setUsernameError('Username is already taken');
        return;
      }
      await updateUserProfile({ username });
      toast.success('Username updated');
    } catch {
      toast.error('Failed to save — try again');
    } finally {
      setSaving(false);
      setChecking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 max-w-lg"
    >
      {/* Identity */}
      <Section title="your handle." eyebrow="identity">
        <Field label="Username" aside={checking ? 'checking…' : null}>
          <div className="flex items-center gap-2">
            <AtSign size={14} style={{ color: `${t.ink}45`, flexShrink: 0, marginBottom: 6 }} />
            <div className="flex-1">
              <TextInput
                value={username}
                onChange={handleUsernameChange}
                placeholder="your_handle"
                error={usernameError}
              />
            </div>
          </div>
        </Field>

        <Field label="Email" aside="managed by auth">
          <div className="flex items-center gap-2">
            <Mail size={14} style={{ color: `${t.ink}45`, flexShrink: 0, marginBottom: 6 }} />
            <div className="flex-1">
              <TextInput value={user?.email ?? ''} disabled />
            </div>
          </div>
        </Field>

        {memberSince && (
          <Field label="Member since">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: `${t.ink}45`, flexShrink: 0, marginBottom: 6 }} />
              <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: `${t.ink}55`, paddingBottom: 6, borderBottom: `1px solid ${t.ink}18` }} className="flex-1">
                {format(memberSince, 'MMMM d, yyyy')}
              </p>
            </div>
          </Field>
        )}

        <div className="flex justify-end pt-1">
          <motion.button
            type="button"
            onClick={handleSave}
            disabled={saving || !!usernameError}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-sm"
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 14,
              background: saving || usernameError ? `${t.ink}15` : t.red,
              color: saving || usernameError ? `${t.ink}45` : '#fff',
              minHeight: 44,
              cursor: saving || usernameError ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {saving ? 'saving…' : 'save username'}
          </motion.button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="danger zone." eyebrow="account">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} style={{ color: t.red, flexShrink: 0, marginTop: 2 }} />
          <div className="flex flex-col gap-3">
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, lineHeight: 1.5, opacity: 0.75 }}>
              Deleting your account is permanent. All comparisons, votes, and reviews disappear immediately.
            </p>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: `${t.ink}50` }}>
              account deletion — coming soon
            </p>
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default AccountSettings;
