import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileHeader from './dashboard/ProfileHeader';
import ContentTabs from './dashboard/ContentTabs';
import { getUserProfile } from '../../services/users';
import { useAuth } from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import FirstTimeDashboard from './dashboard/FirstTimeDashboard';

const UserDashboard = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isHeaderVisible } = useHeader();
  const [userData, setUserData] = useState(null);
  const [showFirstTimeDashboard, setShowFirstTimeDashboard] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          userProfile
        ] = await Promise.all([
          getUserProfile(user.id),
        ]);

        setUserData(userProfile);
        
        // Check if this is the user's first time
        const isFirstTime = !localStorage.getItem('dashboard_tour_completed');
        setShowFirstTimeDashboard(isFirstTime);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data in dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleTourComplete = () => {
    localStorage.setItem('dashboard_tour_completed', 'true');
    setShowFirstTimeDashboard(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src="/public_logo_transparent.png" alt="logo" className="h-100 w-100 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div 
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <p style={{ color: currentTheme.colors.text }}>No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: currentTheme.colors.background,
        position: 'relative',
        top: isHeaderVisible ? '64px' : '0px',
      }}
    >
      {showFirstTimeDashboard && (
        <FirstTimeDashboard onComplete={handleTourComplete} />
      )}
      <div className="max-w-7xl mx-auto">
        <ProfileHeader userData={userData} isPublic={false} />
        
        <div className="mt-8">
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