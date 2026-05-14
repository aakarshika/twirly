import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
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

        const { data: resp } = await apiClient.get(`/api/users/by-username/${encodeURIComponent(username)}`);
        const userPrefs = resp.data;
        if (!userPrefs) throw new Error('User not found');

        const { data: profileResp } = await apiClient.get(`/api/users/${userPrefs.user_id}`);
        const profile = profileResp.data;

        setUserData({
          profile: userPrefs,
          votes_count: profile?.total_votes ?? 0,
          reviews_count: profile?.total_reviews ?? 0,
          products_count: profile?.total_products ?? 0,
          comparisons_count: profile?.total_comparisons ?? 0,
          likes_count: profile?.total_likes_received ?? 0,
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.error?.message ?? err.message);
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
