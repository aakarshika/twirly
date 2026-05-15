import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, LogOut } from 'lucide-react';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { userPreferences } from '@services/userPreferences';

const EASE = [0.16, 1, 0.3, 1];
const DRAFT_KEY = 'twirly.onboarding-draft';
const TOTAL_STEPS = 4;

const CATEGORIES = [
  { id: '1', name: 'Technology', icon: '💻' },
  { id: '2', name: 'Fashion', icon: '👗' },
  { id: '3', name: 'Home & Living', icon: '🏠' },
  { id: '4', name: 'Beauty', icon: '💄' },
  { id: '5', name: 'Food & Beverages', icon: '🍽️' },
  { id: '6', name: 'Sports', icon: '⚽' },
  { id: '7', name: 'Books', icon: '📚' },
  { id: '8', name: 'Gaming', icon: '🎮' },
];

const NOTIFICATIONS = [
  { id: 'new-comparisons', label: 'New comparisons in my categories' },
  { id: 'votes', label: 'When someone votes on my comparisons' },
  { id: 'comments', label: 'When someone comments on my comparisons' },
  { id: 'trending', label: 'Trending comparisons' },
  { id: 'weekly-digest', label: 'Weekly digest' },
];

const loadDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
};

const saveDraft = draft => localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

const stepVariants = {
  enter: dir => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0 },
  exit: dir => ({ opacity: 0, x: dir * -36 }),
};

const WelcomeStep = ({ t }) => (
  <div>
    <p
      style={{
        fontFamily: '"Caveat", cursive',
        fontSize: 18,
        color: t.ink,
        opacity: 0.6,
        marginBottom: 6,
      }}
    >
      hey there.
    </p>
    <h1
      style={{
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        fontSize: 'clamp(36px, 9vw, 60px)',
        lineHeight: 0.96,
        color: t.ink,
        marginBottom: 18,
      }}
    >
      welcome to Twirly.
    </h1>
    <p
      style={{
        fontFamily: '"Fraunces", serif',
        fontSize: 16,
        lineHeight: 1.55,
        color: t.ink,
        opacity: 0.72,
        maxWidth: 380,
        margin: 0,
      }}
    >
      A place where opinions live and die by the vote. Let&apos;s get you set up in about a minute.
    </p>
  </div>
);

const UsernameStep = ({ username, onChange, error, t }) => (
  <div>
    <p
      style={{
        fontFamily: '"Caveat", cursive',
        fontSize: 16,
        color: t.ink,
        opacity: 0.55,
        marginBottom: 6,
      }}
    >
      step 2 of {TOTAL_STEPS}.
    </p>
    <h2
      style={{
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        fontSize: 'clamp(28px, 7vw, 48px)',
        lineHeight: 1,
        color: t.ink,
        marginBottom: 22,
      }}
    >
      pick a name.
    </h2>
    <input
      type="text"
      value={username}
      onChange={e => onChange(e.target.value.toLowerCase())}
      placeholder="your_username"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck="false"
      style={{
        width: '100%',
        padding: '12px 14px',
        fontFamily: '"Fraunces", serif',
        fontSize: 16,
        color: t.ink,
        background: t.bgDeep,
        border: `1.5px solid ${error ? t.red : t.ink}${error ? '' : '28'}`,
        borderRadius: 6,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s ease',
      }}
      onFocus={e => {
        if (!error) e.target.style.borderColor = `${t.ink}70`;
      }}
      onBlur={e => {
        if (!error) e.target.style.borderColor = `${t.ink}28`;
      }}
    />
    {error && (
      <p
        style={{
          fontFamily: '"Caveat", cursive',
          color: t.red,
          fontSize: 14,
          marginTop: 6,
        }}
      >
        {error}
      </p>
    )}
    <p
      style={{
        fontFamily: '"Caveat", cursive',
        color: t.ink,
        opacity: 0.45,
        fontSize: 13,
        marginTop: 8,
      }}
    >
      lowercase · numbers · underscores only. can&apos;t change this later.
    </p>
  </div>
);

const CategoriesStep = ({ selected, onToggle, t }) => (
  <div>
    <p
      style={{
        fontFamily: '"Caveat", cursive',
        fontSize: 16,
        color: t.ink,
        opacity: 0.55,
        marginBottom: 6,
      }}
    >
      step 3 of {TOTAL_STEPS}.
    </p>
    <h2
      style={{
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        fontSize: 'clamp(28px, 7vw, 48px)',
        lineHeight: 1,
        color: t.ink,
        marginBottom: 8,
      }}
    >
      what&apos;s your thing?
    </h2>
    <p
      style={{
        fontFamily: '"Fraunces", serif',
        fontSize: 15,
        color: t.ink,
        opacity: 0.65,
        marginBottom: 18,
      }}
    >
      Pick at least one. More is better.
    </p>
    <div className="grid grid-cols-2 gap-2.5">
      {CATEGORIES.map(cat => {
        const active = selected.includes(cat.id);
        return (
          <motion.button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 12px',
              borderRadius: 6,
              border: active ? `2px solid ${t.ink}` : `1.5px solid ${t.ink}22`,
              background: active ? t.ink : t.bgDeep,
              color: active ? t.bg : t.ink,
              cursor: 'pointer',
              fontFamily: '"Fraunces", serif',
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              textAlign: 'left',
              minHeight: 44,
            }}
          >
            <span style={{ fontSize: 17, flexShrink: 0 }}>{cat.icon}</span>
            <span style={{ flex: 1 }}>{cat.name}</span>
            {active && <Check size={12} style={{ flexShrink: 0 }} />}
          </motion.button>
        );
      })}
    </div>
  </div>
);

const NotificationsStep = ({ selected, onToggle, t }) => (
  <div>
    <p
      style={{
        fontFamily: '"Caveat", cursive',
        fontSize: 16,
        color: t.ink,
        opacity: 0.55,
        marginBottom: 6,
      }}
    >
      step 4 of {TOTAL_STEPS}.
    </p>
    <h2
      style={{
        fontFamily: '"DM Serif Display", serif',
        fontStyle: 'italic',
        fontSize: 'clamp(28px, 7vw, 48px)',
        lineHeight: 1,
        color: t.ink,
        marginBottom: 8,
      }}
    >
      how loud do we get?
    </h2>
    <p
      style={{
        fontFamily: '"Fraunces", serif',
        fontSize: 15,
        color: t.ink,
        opacity: 0.65,
        marginBottom: 18,
      }}
    >
      Skip all of these. We won&apos;t judge.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {NOTIFICATIONS.map(notif => {
        const active = selected.includes(notif.id);
        return (
          <motion.button
            key={notif.id}
            onClick={() => onToggle(notif.id)}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 6,
              border: `1.5px solid ${active ? `${t.ink}80` : `${t.ink}18`}`,
              background: active ? `${t.ink}07` : t.bgDeep,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              minHeight: 44,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                flexShrink: 0,
                border: active ? 'none' : `1.5px solid ${t.ink}40`,
                background: active ? t.ink : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {active && <Check size={11} color={t.bg} />}
            </div>
            <span
              style={{
                fontFamily: '"Fraunces", serif',
                color: t.ink,
                fontSize: 14,
                flex: 1,
                lineHeight: 1.4,
              }}
            >
              {notif.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const { user, signOut } = useAuth();
  const t = themes[themeId] ?? themes.light;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [initializing, setInitializing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [initError, setInitError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const savedPrefsRef = useRef(null);
  const savedNotifRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setInitializing(true);

    (async () => {
      try {
        const [prefs, notif, cats] = await Promise.all([
          userPreferences.getUserPreferences(user.id),
          userPreferences.getUserNotificationSettings(user.id),
          userPreferences.getUserCategoryPreferences(user.id),
        ]);

        if (cancelled) return;

        savedPrefsRef.current = prefs;
        savedNotifRef.current = notif;

        // Already done — skip onboarding
        const complete =
          prefs?.display_name &&
          cats?.length > 0 &&
          notif?.created_at !== notif?.updated_at;

        if (complete) {
          navigate('/dashboard', { replace: true });
          return;
        }

        const draft = loadDraft();

        // Notifications: prefer draft, else server state
        setSelectedNotifications(draft?.notifications ?? notif?.notifications ?? []);

        if (prefs?.display_name) {
          setUsername(draft?.username ?? prefs.display_name);
          if (cats?.length > 0) {
            setSelectedCategories(
              draft?.categories ?? cats.map(c => String(c.category_id)),
            );
            setStep(4);
          } else {
            setSelectedCategories(draft?.categories ?? []);
            setStep(3);
          }
        } else {
          setUsername(draft?.username ?? '');
          setSelectedCategories(draft?.categories ?? []);
          setStep(1);
        }
      } catch (err) {
        if (!cancelled) setInitError(err.message || 'Failed to load preferences');
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  useEffect(() => {
    if (initializing) return;
    saveDraft({ username, categories: selectedCategories, notifications: selectedNotifications });
  }, [username, selectedCategories, selectedNotifications, initializing]);

  const validateUsername = async () => {
    if (!username) {
      setUsernameError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setUsernameError('Must be at least 3 characters');
      return false;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setUsernameError('Only lowercase letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    setBusy(true);
    try {
      const available = await userPreferences.checkUsernameAvailability(username);
      if (!available) {
        setUsernameError('That username is taken');
        return false;
      }
      return true;
    } catch {
      setUsernameError('Could not check availability');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const goNext = async () => {
    setSubmitError('');
    if (step === 2) {
      const valid = await validateUsername();
      if (!valid) return;
    }
    if (step === 3 && selectedCategories.length === 0) {
      setSubmitError('Pick at least one category');
      return;
    }
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      await handleComplete();
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
    setSubmitError('');
    setUsernameError('');
  };

  const handleComplete = async () => {
    setBusy(true);
    setSubmitError('');
    try {
      await userPreferences.saveUserPreferences(user.id, {
        display_name: username,
        id: savedPrefsRef.current?.id ?? null,
        categories: selectedCategories,
        notifications: selectedNotifications,
        notifId: savedNotifRef.current?.id ?? null,
      });
      clearDraft();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'Failed to save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const toggleCategory = id =>
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );

  const toggleNotification = id =>
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id],
    );

  const handleUsernameChange = value => {
    setUsername(value);
    setUsernameError('');
  };

  const nextDisabled =
    busy ||
    (step === 2 && !username) ||
    (step === 3 && selectedCategories.length === 0);

  if (initializing) {
    return (
      <div
        style={{
          background: t.bg,
          color: t.ink,
          minHeight: '100vh',
          fontFamily: '"Fraunces", serif',
        }}
        className="relative overflow-x-hidden"
      >
        <PaperGrain blend={t.blend} />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-5">
          <motion.div
            animate={{ opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '100%',
              maxWidth: 480,
              height: 280,
              background: t.bgDeep,
              borderRadius: 8,
            }}
          />
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div
        style={{
          background: t.bg,
          color: t.ink,
          minHeight: '100vh',
          fontFamily: '"Fraunces", serif',
        }}
        className="relative overflow-x-hidden flex items-center justify-center px-5"
      >
        <PaperGrain blend={t.blend} />
        <div className="relative z-10 text-center" style={{ maxWidth: 380 }}>
          <p
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 7vw, 44px)',
              color: t.ink,
              marginBottom: 10,
            }}
          >
            something went wrong.
          </p>
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              color: t.red,
              fontSize: 16,
              marginBottom: 24,
            }}
          >
            {initError}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 15,
              padding: '12px 28px',
              borderRadius: 4,
              border: `2px solid ${t.ink}`,
              background: t.ink,
              color: t.bg,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            try again
          </button>
        </div>
      </div>
    );
  }

  // ——— Main flow ———
  return (
    <div
      style={{
        background: t.bg,
        color: t.ink,
        minHeight: '100vh',
        fontFamily: '"Fraunces", serif',
      }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 sm:px-10 py-12">
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Step progress */}
          <div className="flex items-center gap-3 mb-10">
            <span
              style={{
                fontFamily: '"Caveat", cursive',
                color: t.ink,
                opacity: 0.5,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {step} / {TOTAL_STEPS}
            </span>
            <div className="flex gap-1.5 flex-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    flex: i === step - 1 ? 3 : 1,
                    background:
                      i < step
                        ? i === step - 1
                          ? t.red
                          : t.ink
                        : `${t.ink}18`,
                  }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{ height: 3, borderRadius: 2 }}
                />
              ))}
            </div>
          </div>

          {/* Animated step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: EASE }}
            >
              {step === 1 && <WelcomeStep t={t} />}
              {step === 2 && (
                <UsernameStep
                  username={username}
                  onChange={handleUsernameChange}
                  error={usernameError}
                  t={t}
                />
              )}
              {step === 3 && (
                <CategoriesStep
                  selected={selectedCategories}
                  onToggle={toggleCategory}
                  t={t}
                />
              )}
              {step === 4 && (
                <NotificationsStep
                  selected={selectedNotifications}
                  onToggle={toggleNotification}
                  t={t}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Inline error (step validation, submit failure) */}
          {submitError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: '"Caveat", cursive',
                color: t.red,
                fontSize: 15,
                marginTop: 12,
              }}
            >
              {submitError}
            </motion.p>
          )}

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 32,
            }}
          >
            {step === 1 ? (
              <button
                onClick={() => { signOut(); navigate('/landing'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: '"Caveat", cursive',
                  fontSize: 15,
                  color: t.ink,
                  opacity: 0.5,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  minHeight: 44,
                }}
              >
                <LogOut size={13} />
                sign out
              </button>
            ) : (
              <button
                onClick={goBack}
                style={{
                  fontFamily: '"Caveat", cursive',
                  fontSize: 16,
                  color: t.ink,
                  opacity: 0.55,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  minHeight: 44,
                }}
              >
                ← back
              </button>
            )}

            <button
              onClick={goNext}
              disabled={nextDisabled}
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 15,
                padding: '12px 28px',
                borderRadius: 4,
                border: `2px solid ${t.ink}`,
                background: nextDisabled ? 'transparent' : t.ink,
                color: nextDisabled ? `${t.ink}50` : t.bg,
                cursor: nextDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                minHeight: 44,
                minWidth: 100,
              }}
            >
              {busy
                ? '…'
                : step === 1
                  ? "let's go →"
                  : step === TOTAL_STEPS
                    ? 'finish'
                    : 'next →'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
