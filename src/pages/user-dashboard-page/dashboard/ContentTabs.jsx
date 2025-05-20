import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductsTab from './tabs/ProductsTab';
import ComparisonsTab from './tabs/ComparisonsTab';
import ReviewsTab from './tabs/ReviewsTab';
import VotesTab from './tabs/VotesTab';
import CommentsTab from './tabs/CommentsTab';
import OverviewTab from './tabs/OverviewTab';
import { getUserProfile } from '../../../services/users';
import { 
  ChartBarSquareIcon, 
  ChatBubbleLeftRightIcon, 
  CubeIcon, 
  StarIcon,
  HeartIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

const FloatingShape = ({ delay, children }) => (
  <motion.div
    initial={{ y: 0, x: 0 }}
    animate={{
      y: [0, -15, 0],
      x: [0, 10, 0],
      rotate: [0, 5, 0]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

const TabIcon = ({ icon: Icon, isActive, theme }) => (
  <motion.div
    whileHover={{ scale: 1.1, rotate: 5 }}
    className={`p-2 rounded-full ${isActive ? 'bg-opacity-100' : 'bg-opacity-20'}`}
    style={{ 
      backgroundColor: isActive ? theme.colors.primary : theme.colors.primary + '20',
      color: isActive ? theme.colors.buttonText : theme.colors.primary
    }}
  >
    <Icon className="w-5 h-5" />
  </motion.div>
);

const ContentTabs = ({ activeTab, setActiveTab, userId, username, isPublic = true }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const tabsRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const userProfile = await getUserProfile(userId);
        setUserData(userProfile);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab, activeTab, setActiveTab]);

  const tabs = isPublic ? [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: ChartBarSquareIcon,
      count: null
    },
    { 
      id: 'comparisons', 
      label: 'Comparisons', 
      icon: CubeIcon,
      count: userData?.comparisons_count || 0
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: StarIcon,
      count: userData?.products_count || 0
    },
    { 
      id: 'comments', 
      label: 'Reviews', 
      icon: ChatBubbleLeftRightIcon,
      count: userData?.reviews_count || 0
    },
  ] : [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: ChartBarSquareIcon,
      count: null
    },
    { 
      id: 'comparisons', 
      label: 'Comparisons', 
      icon: CubeIcon,
      count: userData?.comparisons_count || 0
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: StarIcon,
      count: userData?.products_count || 0
    },
    { 
      id: 'comments', 
      label: 'Reviews', 
      icon: ChatBubbleLeftRightIcon,
      count: userData?.reviews_count || 0
    },
    { 
      id: 'votes', 
      label: 'Votes', 
      icon: HeartIcon,
      count: userData?.votes_count || 0
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (isPublic) {
      navigate(`/user/${username}/${tabId}`);
    } else {
      navigate(`/dashboard/${tabId}`);
    }
    
    // Scroll to tabs with offset to account for any fixed headers
    setTimeout(() => {
      const tabsElement = tabsRef.current;
      if (tabsElement) {
        const headerOffset = 80; // Adjust this value based on your header height
        const elementPosition = tabsElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab userId={userId} isPublic={isPublic} />;
      case 'overview':
        return <OverviewTab userId={userId} isPublic={isPublic} />;
      case 'comparisons':
        return <ComparisonsTab userId={userId} isPublic={isPublic} />;
      case 'votes':
        return isPublic ? null : <VotesTab userId={userId} isPublic={isPublic} />;
      case 'comments':
        return <CommentsTab userId={userId} isPublic={isPublic} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Background decorative elements */}
      <FloatingShape delay={0}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl" />
      </FloatingShape>
      <FloatingShape delay={1}>
        <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-xl" />
      </FloatingShape>

      <div className="relative z-10">
        {/* Sticky Tabs Container */}
        <div 
          ref={tabsRef}
          className=" mb-6 md:mb-8"
          style={{ 
            paddingTop: '1rem',
            paddingBottom: '1rem',
            marginTop: '-1rem',
            marginBottom: '1rem'
          }}
        >
          <div className="flex justify-center">
            <div className="relative p-2 rounded-2xl backdrop-blur-md w-full max-w-4xl" style={{ backgroundColor: currentTheme.colors.card + '80' }}>
              <div className='flex flex-col'>
              <div className="flex flex-wrap justify-center gap-2">
                {tabs.map(tab => (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={` px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all duration-300 flex-1 min-w-[120px] max-w-[200px] ${
                      activeTab === tab.id ? ' sticky top-0 z-30 text-white' : 'relative text-gray-600'
                    }`}
                    style={{
                      backgroundColor: activeTab === tab.id ? currentTheme.colors.primary : 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <TabIcon icon={tab.icon} isActive={activeTab === tab.id} theme={currentTheme} />
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm md:text-base">{tab.label}</span>
                        {tab.count !== null && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: activeTab === tab.id 
                                ? currentTheme.colors.buttonText + '20'
                                : currentTheme.colors.primary + '20',
                              color: activeTab === tab.id 
                                ? currentTheme.colors.buttonText
                                : currentTheme.colors.primary
                            }}
                          >
                            {tab.count}
                          </motion.span>
                        )}
                      </div>
                    </div>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl"
                        style={{ 
                          backgroundColor: currentTheme.colors.primary,
                          zIndex: -1
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 rounded-2xl backdrop-blur-md"
            style={{ backgroundColor: currentTheme.colors.cardBackground }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContentTabs; 