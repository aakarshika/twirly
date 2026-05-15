import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import Avatar from '@components/common/Avatar';
import { getUserProfile, updateUserProfile, uploadProfilePic } from '@services/users';
import { userPreferences } from '@services/userPreferences';

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

const underlineInput = (t, error, disabled) => ({
  fontFamily: '"Fraunces", serif',
  fontSize: 15,
  color: disabled ? `${t.ink}55` : t.ink,
  background: 'transparent',
  outline: 'none',
  width: '100%',
  borderBottom: `1px solid ${error ? t.red : disabled ? `${t.ink}18` : `${t.ink}35`}`,
  paddingBottom: 6,
  paddingTop: 2,
  resize: 'none',
  cursor: disabled ? 'default' : 'text',
});

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

const ProfileSettings = () => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.id).then(data => {
      if (data?.profile) {
        setDisplayName(data.profile.display_name ?? '');
        setBio(data.profile.bio ?? '');
        setAvatarUrl(data.profile.profile_image_url ?? '');
      }
      setLoaded(true);
    });
  }, [user]);

  const validateDisplayName = value => {
    if (!value) return 'Display name is required';
    if (value.length < 2) return 'At least 2 characters';
    if (value.length > 32) return 'Max 32 characters';
    return '';
  };

  const handleDisplayNameChange = async e => {
    const val = e.target.value.toLowerCase().replace(/\s/g, '');
    setDisplayName(val);
    const err = validateDisplayName(val);
    setDisplayNameError(err);

    if (!err && val.length >= 3) {
      const available = await userPreferences.checkUsernameAvailability(val).catch(() => true);
      if (!available) setDisplayNameError('Already taken');
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadProfilePic(file);
      setAvatarUrl(url);
      await updateUserProfile({ profile_image_url: url });
      toast.success('Profile picture updated');
    } catch {
      toast.error('Upload failed — try again');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    const err = validateDisplayName(displayName);
    if (err) { setDisplayNameError(err); return; }

    setSaving(true);
    try {
      await updateUserProfile({ display_name: displayName, bio, profile_image_url: avatarUrl });
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save — try again');
    } finally {
      setSaving(false);
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
      {/* Avatar */}
      <Section title="your face." eyebrow="photo">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar
              profileImageUrl={avatarUrl}
              displayName={displayName}
              username={user?.name}
              size="lg"
            />
            <button
              type="button"
              aria-label="Change profile picture"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
              style={{
                width: 30,
                height: 30,
                background: t.red,
                color: '#fff',
                border: `2px solid ${t.bg}`,
                cursor: uploadingAvatar ? 'wait' : 'pointer',
              }}
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.75, lineHeight: 1.5 }}>
              {uploadingAvatar ? 'uploading…' : 'tap to change your photo. jpg, png, or gif.'}
            </p>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}45`, marginTop: 2 }}>
              shown on your comparisons + profile
            </p>
          </div>
        </div>
      </Section>

      {/* Info */}
      <Section title="about you." eyebrow="profile">
        <Field label="Display name" error={displayNameError}>
          <input
            type="text"
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder="how_you_sign_off"
            style={underlineInput(t, displayNameError, false)}
          />
        </Field>

        <Field label="Email" error="">
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            style={underlineInput(t, '', true)}
          />
        </Field>

        <Field label="Bio" error="">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="what are you into?"
            rows={3}
            maxLength={160}
            style={underlineInput(t, '', false)}
          />
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 12, color: `${t.ink}38`, textAlign: 'right', marginTop: 2 }}>
            {bio.length}/160
          </p>
        </Field>

        <div className="flex justify-end pt-1">
          <motion.button
            type="button"
            onClick={handleSave}
            disabled={saving || !!displayNameError}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-sm"
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 14,
              background: saving || displayNameError ? `${t.ink}15` : t.red,
              color: saving || displayNameError ? `${t.ink}45` : '#fff',
              minHeight: 44,
              cursor: saving || displayNameError ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {saving ? 'saving…' : 'save profile'}
          </motion.button>
        </div>
      </Section>
    </motion.div>
  );
};

export default ProfileSettings;
