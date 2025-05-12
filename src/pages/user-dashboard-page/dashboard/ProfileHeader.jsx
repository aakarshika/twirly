import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Pencil, User, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPublicUrl } from '../../../lib/utils';
import Avatar from '../../../components/common/Avatar';
import { karmaService } from '../../../services/karmaService';

const ProfileHeader = ({ userData, isPublic = false }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [karmaPoints, setKarmaPoints] = useState(0);
  const [isLoadingKarma, setIsLoadingKarma] = useState(true);

  useEffect(() => {
    const fetchKarmaPoints = async () => {
      if (userData?.profile?.user_id) {
        setIsLoadingKarma(true);
        try {
          const points = await karmaService.getUserKarmaPoints(userData.profile.user_id);
          setKarmaPoints(points);
        } catch (error) {
          console.error('Error fetching karma points:', error);
        } finally {
          setIsLoadingKarma(false);
        }
      }
    };
    console.log('userData', userData);
    fetchKarmaPoints();
  }, [userData?.profile?.user_id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const isNewUser = () => {
    if (!userData?.profile?.created_at) return false;
    const createdDate = new Date(userData.profile.created_at);
    const today = new Date();
    return createdDate.toDateString() === today.toDateString();
  };

  return (
    <div
      className="p-6 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="flex flex-col md:flex-row justify-between">
        {/* Main Content Area */}
        <div className="flex items-start space-x-4">
          <Avatar
            profileImageUrl={userData?.profile?.profile_image_url ? getPublicUrl(userData.profile.profile_image_url) : null}
            displayName={userData?.profile?.display_name}
            username={userData?.profile?.username}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1
                className="text-2xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                {userData?.profile?.display_name}
              </h1>
              {!isPublic && (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center space-x-1 px-2 py-1 rounded-lg text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.primary + '20',
                    color: currentTheme.colors.primary
                  }}
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            {/* User Stats Row */}
            <div className="flex items-center space-x-4 mt-2">
              <p
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Member since {userData?.profile?.created_at ? formatDate(userData.profile.created_at) : 'Unknown'}
              </p>
              <div className="w-px h-4" style={{ backgroundColor: currentTheme.colors.border }}></div>
              <div 
                className="flex items-center space-x-1.5 rounded-lg px-2 py-1"
                style={{ color: currentTheme.colors.primary, backgroundColor: currentTheme.colors.primary + '20', border: `1px solid ${currentTheme.colors.primary}` }}
              >
                <Coins size={16} />
                <span className="text-sm font-medium">
                  {isLoadingKarma ? '...' : `${karmaPoints} KARMA`}
                </span>
              </div>
            </div>

            {userData?.profile?.bio && (
              <p
                className="mt-3 text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {userData.profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Right Side Area - Only for Congratulations Message */}
        {!isPublic && isNewUser() && (
          <div className="flex flex-col items-end mt-4 md:mt-0">
            <div 
              className="px-4 py-2 rounded-lg text-sm"
              style={{ 
                backgroundColor: currentTheme.colors.success + '20',
                border: `1px solid ${currentTheme.colors.success}`,
                color: currentTheme.colors.success
              }}
            >
              🎉 Congratulations! You earned 100 karma for signing up!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader; 