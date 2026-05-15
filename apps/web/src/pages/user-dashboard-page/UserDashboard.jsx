import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { getUserProfile } from '@services/users';
import { useDataFetching } from '@hooks/useDataFetching';
import PullToRefresh from '@components/common/PullToRefresh';
import ProfileHeader from './dashboard/ProfileHeader';
import ContentTabs from './dashboard/ContentTabs';
import FirstTimeDashboard from './dashboard/FirstTimeDashboard';

const UserDashboard = () => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [showFirstTimeDashboard, setShowFirstTimeDashboard] = useState(false);

  const { isLoading, error, fetchData } = useDataFetching(
    'userDashboard',
    async () => {
      if (!user) return;
      const userProfile = await getUserProfile(user.id);
      setUserData(userProfile);
      setShowFirstTimeDashboard(!localStorage.getItem('dashboard_tour_completed'));
    },
    [user],
    {
      useGlobalLoading: true,
      loadingMessage: 'Loading your dashboard...',
      useGlobalError: true,
      retryFunction: () => window.location.reload(),
    },
  );

  if (isLoading || error) return null;

  if (!userData) {
    return (
      <div
        style={{ background: t.bg, color: t.ink, minHeight: '100vh' }}
        className="flex items-center justify-center"
      >
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 16, opacity: 0.5 }}>No user data found.</p>
      </div>
    );
  }

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />
      <PullToRefresh onRefresh={fetchData}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          {showFirstTimeDashboard && (
            <FirstTimeDashboard onComplete={() => {
              localStorage.setItem('dashboard_tour_completed', 'true');
              setShowFirstTimeDashboard(false);
            }} />
          )}
          <main className="max-w-screen-xl mx-auto px-5 sm:px-10 pt-6 pb-16">
            <ProfileHeader userData={userData} isPublic={false} />
            <div className="mt-6">
              <ContentTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userId={user.id}
                username={user.username}
                isPublic={false}
              />
            </div>
          </main>
        </motion.div>
      </PullToRefresh>
    </div>
  );
};

export default UserDashboard;
