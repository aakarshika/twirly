import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileHeader from './dashboard/ProfileHeader';
import ContentTabs from './dashboard/ContentTabs';
import { getUserProfile } from '../../services/users';
import { useAuth } from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import FirstTimeDashboard from './dashboard/FirstTimeDashboard';
import { useDataFetching } from '../../hooks/useDataFetching';
import LoadingScreen from '../../components/common/LoadingScreen';
import ErrorScreen from '../../components/common/ErrorScreen';

const UserDashboard = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { isHeaderVisible } = useHeader();
  const [userData, setUserData] = useState(null);
  const [showFirstTimeDashboard, setShowFirstTimeDashboard] = useState(false);

  const { isLoading, error } = useDataFetching(
    'userDashboard',
    async () => {
      if (!user) return;
      
      const userProfile = await getUserProfile(user.id);
      setUserData(userProfile);
      
      // Check if this is the user's first time
      const isFirstTime = !localStorage.getItem('dashboard_tour_completed');
      setShowFirstTimeDashboard(isFirstTime);
    },
    [user]
  );

  const handleTourComplete = () => {
    localStorage.setItem('dashboard_tour_completed', 'true');
    setShowFirstTimeDashboard(false);
  };

  if (isLoading) {
    return <LoadingScreen showLogo={true} message="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;
  }

  if (!userData) {
    return (
      <div 
        className="min-h-screen p-4 md:p-8 lg:p-32 flex flex-col items-center justify-center transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text)'
        }}
      >
        <div className="text-center">
          <p>No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col mx-auto transition-all duration-200 ease-in-out"
      style={{ 
        backgroundColor: 'var(--color-background)',
        position: 'relative',
        color: currentTheme.colors.text,
        top: isHeaderVisible ? '64px' : '0px'
      }}
    >
      {showFirstTimeDashboard && (
        <FirstTimeDashboard onComplete={handleTourComplete} />
      )}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
        <ProfileHeader userData={userData} isPublic={false} />
        
        <div className="mt-8 md:mt-12 lg:mt-16">
          <ContentTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            userId={user.id}
            username={user.username}
            isPublic={false}
          />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 