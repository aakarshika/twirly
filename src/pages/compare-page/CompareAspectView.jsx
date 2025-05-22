import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ComparisonItemCardAspect from '../comparison-aspect-page/ComparisonItemCard/ComparisonItemCardAspect';
import ComparisonSetAspectsCommentsSection from '../comparison-aspect-page/ComparisonSetAspectsCommentsSection';
import { useComparisonAspectData } from '../../hooks/useComparisonAspectData';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';
import { changeColorAlpha } from '../../lib/utils';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

const CompareAspectView = ({ onVoteChange, onNextClick, celebratingAspectId, isResultsPage, currentAspect, nextUnvotedAspect }) => {
  const { id: setId } = useParams();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [isCelebrating, setIsCelebrating] = useState(false);
  
  const {
    loading,
    error,
    currentSet,
    currentAspectSet,
    items,
    totalVotes,
    userVoted,
    votedItemId,
    handleVote,
    handleRevertVote,
  } = useComparisonAspectData(currentAspect?.id, setId);

  // Effect to handle celebration state
  useEffect(() => {
    if (celebratingAspectId === currentAspect?.id) {
      setIsCelebrating(true);
    } else {
      setIsCelebrating(false);
    }
  }, [celebratingAspectId, currentAspect?.id]);

  // Function to update user category preferences
  const updateUserCategoryPreferences = async (categoryId) => {
    try {
      const preferences = await userService.getUserPreferences(user.id);
      const categoryPreferences = await userService.getUserCategoryPreferences(user.id);
      const notificationPreferences = await userService.getUserNotificationSettings(user.id);

      const hasCategory = categoryPreferences.some(pref => pref.category_id === categoryId);
      
      if (!hasCategory) {
        const updatedCategories = [...categoryPreferences.map(p => p.category_id), categoryId];
        
        await userService.saveUserPreferences(user.id, {
          display_name: preferences?.display_name || '',
          id: preferences?.id || null,
          categories: updatedCategories,
          notifications: notificationPreferences?.notifications || [],
          notifId: notificationPreferences?.id || null,
        });
      }
    } catch (error) {
      console.error('Error updating category preferences:', error);
    }
  };

  // Wrap the vote handlers to notify parent
  const handleVoteWithUpdate = async (itemId) => {
    console.log('CompareAspectView: handleVoteWithUpdate called with itemId:', itemId);
    const success = await handleVote(itemId);
    console.log('CompareAspectView: handleVote success:', success);
    if (success) {
      console.log('CompareAspectView: calling onVoteChange with aspectId:', currentAspect?.id);
      onVoteChange(currentAspect?.id, true, itemId);
      
      if (currentSet?.category_id) {
        await updateUserCategoryPreferences(currentSet.category_id);
      }
    }
  };

  const handleRevertVoteWithUpdate = async () => {
    console.log('CompareAspectView: handleRevertVoteWithUpdate called');
    const success = await handleRevertVote();
    console.log('CompareAspectView: handleRevertVote success:', success);
    if (success) {
      console.log('CompareAspectView: calling onVoteChange with aspectId:', currentAspect?.id);
      onVoteChange(currentAspect?.id, false);
    }
  };

  const handleNextClick = () => {
    if (!celebratingAspectId) {
      onNextClick();
    }
  };

  if (!currentAspect || !setId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading aspect...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No items available for comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-3 mobile-friendly-margin-bottom"
        style={{
          backgroundColor: currentTheme.colors.background,
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease-in-out',
        }}>
        <div>
          <div className={`grid ${items.length === 1 ? 'grid-cols-1' :
            items.length === 2 ? 'grid-cols-2' :
              items.length % 3 === 0 ? 'grid-cols-3' :
                'grid-cols-2'
            }`}
            style={{
              gap: '1vh'
            }}
          >
            {items.map((item, i) => (
              <div key={item.id} className="">
                <ComparisonItemCardAspect
                  key={item.id}
                  item={item}
                  index={i}
                  height="100"
                  totalVotes={totalVotes}
                  userVoted={userVoted}
                  votedItemId={votedItemId}
                  handleVote={handleVoteWithUpdate}
                  handleRevertVote={handleRevertVoteWithUpdate}
                />
              </div>
            ))}
          </div>
        </div>

        <div className='flex-row mt-2'>
          <div 
            className={`flex flex-col w-full items-center justify-center ${celebratingAspectId ? 'bg-amber-400' : 'bg-amber-300'} ml-10`}
            onClick={handleNextClick}
          >
            <h2 className='text-md p-1' style={{ color: 'rgb(255, 255, 255)' }}>
              {celebratingAspectId ? 'Celebrating...' : 'Next Aspect'}
            </h2>
            {celebratingAspectId && (
              <motion.div
                className="h-1"
                style={{ backgroundColor: currentTheme.colors.secondary }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: SHOW_RESULTS_DURATION, 
                  ease: "linear"
                }}
              />
            )}
          </div>
          <div className='flex flex-col items-center justify-center bg-gray-300 mr-4'>
            {celebratingAspectId && (
              <h2 className='text-md p-1' style={{ color: 'rgb(255, 255, 255)' }}>Cancel</h2>
            )}
          </div>
        </div>
      </div>

      <div className="text-center animate-fadeIn" style={{ backgroundColor: 'white' }}>
        {userVoted && (
          <div className="w-full p-4" style={{ marginBottom: '100px' }}>
            <ComparisonSetAspectsCommentsSection
              userVoted={userVoted}
              aspectSetId={currentAspect?.id}
              items={items}
              aspectSet={currentAspectSet}
            />
          </div>
        )}
        <span className="text-2xl animate-bounce">. . .</span>
      </div>
    </div>
  );
};

export default CompareAspectView; 