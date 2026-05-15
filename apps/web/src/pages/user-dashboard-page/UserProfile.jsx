import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { getUserProfileByUsername } from '@services/users';
import ProfileHeader from './dashboard/ProfileHeader';
import ContentTabs from './dashboard/ContentTabs';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const controls = useAnimation();

  const [activeTab, setActiveTab] = useState('comparisons');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const profile = await getUserProfileByUsername(username);
        if (!cancelled) {
          if (!profile) setError('User not found.');
          else setUserData(profile);
        }
      } catch (err) {
        console.error('UserProfile load error:', err);
        if (!cancelled) setError(err.response?.data?.error?.message ?? err.message);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [username]);

  const handleDragEnd = async (_event, info) => {
    if (info.offset.x > 100) {
      await controls.start({ x: '100%', transition: { duration: 0.3 } });
      navigate(-1);
    } else {
      controls.start({ x: 0, transition: { duration: 0.3 } });
    }
  };

  if (error) {
    return (
      <div
        style={{ background: t.bg, color: t.ink, minHeight: '100vh' }}
        className="flex items-center justify-center"
      >
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 16, opacity: 0.5 }}>{error}</p>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />
      <motion.div
        className="relative z-10"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        <main className="max-w-screen-xl mx-auto px-5 sm:px-10 pt-6 pb-16">
          <ProfileHeader userData={userData} isPublic />
          <div className="mt-6">
            <ContentTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userId={userData.profile.user_id}
              username={userData.profile.username}
              isPublic
            />
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default UserProfile;
