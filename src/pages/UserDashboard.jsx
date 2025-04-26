import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ProfileHeader from '../components/dashboard/ProfileHeader';
import ActivityOverview from '../components/dashboard/ActivityOverview';
import ContentTabs from '../components/dashboard/ContentTabs';
import { getUserProfile } from '../services/users';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
          <ContentTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            userId={userData.id}
          />
        </div>

      </div>
    </div>
  );
};

export default UserDashboard; 