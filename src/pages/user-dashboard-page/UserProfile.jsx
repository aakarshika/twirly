import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ProfileHeader from './dashboard/ProfileHeader';
import ContentTabs from './dashboard/ContentTabs';
import { useHeader } from '../../contexts/HeaderContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLoading } from '../../contexts/LoadingContext';

const UserProfile = () => {
  const { username } = useParams();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const { setLoading, setError: setGlobalError } = useLoading();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading('global', true, 'Loading profile...');
        
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
        setGlobalError('global', err.message, () => window.location.reload());
      } finally {
        setLoading('global', false);
      }
    };

    fetchUserData();
  }, [username]);

  if (error) {
    return null; // Error screen is now handled by LoadingContext
  }

  if (!userData) {
    return (
      <div 
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ 
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
        position: 'relative',
        top: isHeaderVisible ? '64px' : '0px',
      }}
    >
      <ProfileHeader userData={userData} isPublic={true} />
      <div className="mt-8">
        <ContentTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userId={userData.profile.user_id}
          username={userData.profile.username}
          isPublic={true}
        />
      </div>
    </div>
  );
};

export default UserProfile; 