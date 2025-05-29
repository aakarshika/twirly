import React, { useState } from 'react';
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
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ 
        color: currentTheme.colors.text
      }}
    >
      {showFirstTimeDashboard && (
        <FirstTimeDashboard onComplete={handleTourComplete} />
      )}
      <main className="w-full" style={{ paddingTop: isHeaderVisible ? '20px': '0px', backgroundColor: currentTheme.colors.background + '20' }}>
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
    </div>
  );
};

export default UserDashboard; 