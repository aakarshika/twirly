import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ProfileHeader from './dashboard/ProfileHeader';
import ContentTabs from './dashboard/ContentTabs';
import { useHeader } from '../../contexts/HeaderContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLoading } from '../../contexts/LoadingContext';
import { motion, useAnimation } from 'framer-motion';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const { setLoading, setError: setGlobalError } = useLoading();
  const controls = useAnimation();

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

  const handleDragEnd = async (event, info) => {
    if (info.offset.x > 100) { // Only trigger if swiped more than 100px
      await controls.start({ x: '100%', transition: { duration: 0.3 } });
      navigate(-1);
    } else {
      controls.start({ x: 0, transition: { duration: 0.3 } });
    }
  };

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
    <motion.div 
      className="min-h-screen p-4 md:p-8"
      style={{ 
        position: 'relative',
        top: isHeaderVisible ? '64px' : '0px',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
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
    </motion.div>
  );
};

export default UserProfile; 