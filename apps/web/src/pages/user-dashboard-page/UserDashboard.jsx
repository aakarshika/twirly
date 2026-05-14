import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileHeader from './dashboard/ProfileHeader';
import ContentTabs from './dashboard/ContentTabs';
import { getUserProfile } from '../../services/users';
import { useAuth } from '../../contexts/AuthContext';
import FirstTimeDashboard from './dashboard/FirstTimeDashboard';
import { useDataFetching } from '../../hooks/useDataFetching';
import PullToRefresh from '../../components/common/PullToRefresh';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const { currentTheme } = useTheme();
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

      const isFirstTime = !localStorage.getItem('dashboard_tour_completed');
      setShowFirstTimeDashboard(isFirstTime);
    },
    [user],
    {
      useGlobalLoading: true,
      loadingMessage: 'Loading your dashboard...',
      useGlobalError: true,
      retryFunction: () => window.location.reload(),
    },
  );

  const handleRefresh = async () => {
    await fetchData();
  };

  const handleTourComplete = () => {
    localStorage.setItem('dashboard_tour_completed', 'true');
    setShowFirstTimeDashboard(false);
  };

  if (isLoading) {
    return null; // Loading screen is now handled by LoadingContext
  }

  if (error) {
    return null; // Error screen is now handled by LoadingContext
  }

  if (!userData) {
    return (
      <div
        className="min-h-screen p-4 md:p-8 lg:p-32 flex flex-col items-center justify-center overflow-x-hidden"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <p>No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div
        className=""
        style={{
          color: currentTheme.colors.text,
        }}
      >
        {showFirstTimeDashboard && (
          <FirstTimeDashboard onComplete={handleTourComplete} />
        )}
        <main className="w-full" style={{ paddingTop: '20px', backgroundColor: currentTheme.colors.background + '20' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <ProfileHeader userData={userData} isPublic={false} />
            <div className="md:mt-4 lg:mt-8">
              <ContentTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userId={user.id}
                username={user.username}
                isPublic={false}
              />
            </div>
          </div>
        </main>
      </motion.div>
    </PullToRefresh>
  );
};

export default UserDashboard;
