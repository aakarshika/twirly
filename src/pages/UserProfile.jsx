import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import ProfileHeader from '../components/dashboard/ProfileHeader';
import ContentTabs from '../components/dashboard/ContentTabs';
import { useHeader } from '../contexts/HeaderContext';

const UserProfile = () => {
  const { username } = useParams();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // First get the user_id from the username
        const { data: userPrefs, error: userError } = await supabase
          .from('user_preferences')
          .select('user_id, username, display_name, bio, profile_image_url, created_at')
          .eq('display_name', username)
          .single();

        if (userError) throw userError;
        if (!userPrefs) throw new Error('User not found');

        // Then get the activity summary
        const { data: activitySummary, error: summaryError } = await supabase
          .from('user_activity_summary')
          .select('total_votes, total_reviews, total_products, total_comparisons, total_likes_received')
          .eq('user_id', userPrefs.user_id)
          .single();

        if (summaryError) throw summaryError;

        setUserData({
          profile: userPrefs,
          votes_count: activitySummary.total_votes,
          reviews_count: activitySummary.total_reviews,
          products_count: activitySummary.total_products,
          comparisons_count: activitySummary.total_comparisons,
          likes_count: activitySummary.total_likes_received
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div 
        className="min-h-screen p-4 p-y-8 md:p-8 flex items-center justify-center"
        style={{ 
          backgroundColor: currentTheme.colors.background,
          position: 'relative',
          top: isHeaderVisible ? '64px' : '0px',
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4" style={{ color: currentTheme.colors.text }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ 
          backgroundColor: currentTheme.colors.background,
          position: 'relative',
          top: isHeaderVisible ? '64px' : '0px',
        }}
      >
        <div className="text-center">
          <p style={{ color: currentTheme.colors.error }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div 
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ 
          backgroundColor: currentTheme.colors.background,
          position: 'relative',
          top: isHeaderVisible ? '64px' : '0px',
        }}
      >
        <div className="text-center">
          <p style={{ color: currentTheme.colors.text }}>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{ 
        backgroundColor: currentTheme.colors.background,
        position: 'relative',
        top: isHeaderVisible ? '64px' : '0px',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <ProfileHeader userData={userData} isPublic={true} />
        
        <div className="mt-8">
          <ContentTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            userId={userData.profile.user_id}
            username={userData.profile.display_name}
            isPublic={true}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 