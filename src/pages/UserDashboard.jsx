import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ProfileHeader from '../components/dashboard/ProfileHeader';
import ActivityStats from '../components/dashboard/ActivityStats';
import ContentTabs from '../components/dashboard/ContentTabs';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import { getUserProfile } from '../services/users';

const UserDashboard = () => {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('products');
  const [showSettings, setShowSettings] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setUserData(data);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div 
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4" style={{ color: currentTheme.colors.text }}>Loading dashboard...</p>
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
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div className="max-w-7xl mx-auto">
        <ProfileHeader userData={userData} />
        
        <div className="mt-8">
          <ActivityStats 
            votesCount={userData.votes_count}
            reviewsCount={userData.reviews_count}
            pollsCount={userData.polls_count}
            likesCount={userData.likes_count}
          />
        </div>

        <div className="mt-8">
          <ContentTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            userId={userData.id}
          />
        </div>

        <div className="mt-8">
          <AnalyticsSection userId={userData.id} />
        </div>

        {showSettings && (
          <div className="mt-8">
            <SettingsPanel 
              userData={userData}
              onClose={() => setShowSettings(false)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 