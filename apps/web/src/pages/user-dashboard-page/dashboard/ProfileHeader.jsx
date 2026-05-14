import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Pencil, Sparkles, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPublicUrl } from '../../../lib/utils';
import Avatar from '../../../components/common/Avatar';
import { karmaService } from '../../../services/karmaService';
import { motion } from 'framer-motion';
import { formatDate } from 'date-fns';

const _FloatingShape = ({ delay, children }) => (
  <motion.div
    initial={{ y: 0, x: 0 }}
    animate={{
      y: [0, -15, 0],
      x: [0, 10, 0],
      rotate: [0, 5, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

const KarmaBox = ({ points, isLoading, theme }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const getKarmaLevel = points => {
    if (points >= 1000) return { level: 'Legend', color: 'from-purple-500 to-pink-500' };
    if (points >= 500) return { level: 'Pro', color: 'from-blue-500 to-teal-500' };
    if (points >= 100) return { level: 'Rising Star', color: 'from-green-500 to-emerald-500' };
    return { level: 'Newbie', color: 'from-gray-500 to-slate-500' };
  };

  const karmaLevel = getKarmaLevel(points);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        setIsHovered(true);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setIsHovered(false);
        }, 1000);
      }}
      onHoverStart={() => {
        setIsHovered(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1000);
      }}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full md:w-auto"
    >
      <div
        className="flex flex-col items-center p-4 rounded-2xl backdrop-blur-md w-full md:w-[200px]"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}10)`,
          border: `1px solid ${theme.colors.primary}30`,
        }}
      >
        <div className="flex flex-row items-center justify-center">
        <motion.div
          animate={{
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.5 }}
          className="mb-2 inline-block"
        >
          <HeartHandshake className="inline-block" size={24} style={{ color: theme.colors.primary }} />
        </motion.div>

        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {isLoading ? '...' : points}
          </h3>
          <span className={`text-xs font-medium bg-gradient-to-r ${karmaLevel.color} bg-clip-text text-transparent`}>
            {karmaLevel.level}
          </span>
        </div>
        </div>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles size={16} style={{ color: theme.colors.primary }} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

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
    fetchKarmaPoints();
  }, [userData?.profile?.user_id]);

  const isNewUser = () => {
    if (!userData?.profile?.created_at) return false;
    const createdDate = new Date(userData.profile.created_at);
    const today = new Date();
    return createdDate.toDateString() === today.toDateString();
  };

  return (
    <div className="">

      <div className="">
        <div className="">
          <div className="flex flex-col w-full">
            {/* Top Section: Avatar, Name, and Karma */}
            <div className="flex flex-row w-full">
              {/* Left: Avatar */}
                <div className="flex flex-col w-full justify-center p-4">
                  <div className="flex flex-row w-full justify-between">
                    <div className="relative items-center">
                    <Avatar
                      profileImageUrl={userData?.profile?.profile_image_url ? getPublicUrl(userData.profile.profile_image_url) : null}
                      displayName={userData?.profile?.display_name}
                      username={userData?.profile?.username}
                      size="lg"
                    />

                    {!isPublic && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/settings')}
                        className="absolute right-0 top-0 p-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: currentTheme.colors.primary,
                          color: 'white',
                        }}
                      >
                        <Pencil size={14} />
                      </motion.button>
                    )}
                    </div>
                    {/* Right: Karma Box */}
                    <div className="">
                      <KarmaBox points={karmaPoints+100} isLoading={isLoadingKarma} theme={currentTheme} />
                    </div>
                  </div>
                  <div className="w-80">
                   <div className="overflow-x-auto scrollbar-hide" style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          WebkitOverflowScrolling: 'touch',
                          scrollBehavior: 'smooth',
                          width: '100%',
                          display: 'block',
                       }}>
                       <div className="inline-block whitespace-nowrap text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent cursor-grab active:cursor-grabbing">
                        {userData?.profile?.display_name}
                     </div>
                   </div>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs font-bold"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Since {formatDate(userData?.profile?.created_at, 'MMM d, yyyy')}
                  </motion.p>

                </div>

            </div>

            {/* Bottom Section: Member Since, Bio, and Congratulations */}
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Left: Member Since */}
              {/* Center: Bio */}
              {userData?.profile?.bio && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm flex-1 text-center md:text-left"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {userData.profile.bio}
                </motion.p>
              )}

              {/* Right: Congratulations Message */}
              {!isPublic && isNewUser() && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center md:items-end"
                >
                  <div
                    className="px-2 py-1 rounded-xl text-sm font-medium flex items-center space-x-2"
                    style={{
                      backgroundColor: currentTheme.colors.success + '20',
                      border: `1px solid ${currentTheme.colors.success}`,
                      color: currentTheme.colors.success,
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Congratulations! You earned 100 karma for signing up! 🎉</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
