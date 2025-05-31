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
import NotVotedCard from '../comparison-aspect-page/ComparisonItemCard/NotVotedCard';

const CompareAspectView = ({ onVoteChange, onNextClick, celebratingAspectId, isResultsPage, currentAspect, nextUnvotedAspect }) => {
  const { id: setId } = useParams();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [isCelebrating, setIsCelebrating] = useState(false);
  
  const {
    currentSet,
    currentAspectSet,
    items,
    totalVotes,
    userVoted,
    votedItemId,
    handleVote,
    handleRevertVote,
    loading,
    error
  } = useComparisonAspectData(currentAspect?.id, setId);

  // Effect to handle celebration state
  useEffect(() => {
    if (celebratingAspectId === currentAspect?.id) {
      setIsCelebrating(true);
    } else {
      setIsCelebrating(false);
    }
  }, [celebratingAspectId, currentAspect?.id]);


  // Wrap the vote handlers to notify parent
  const handleVoteWithUpdate = async (itemId) => {
    try {
      console.log('CompareAspectView: handleVoteWithUpdate called with itemId:', itemId);
      const success = await handleVote(itemId);
      console.log('CompareAspectView: handleVote success:', success);
      if (success) {
        console.log('CompareAspectView: calling onVoteChange with aspectId:', currentAspect?.id);
        onVoteChange(currentAspect?.id, true, itemId);
      }
    } catch (error) {
      console.error('Error in handleVoteWithUpdate:', error);
    }
  };

  const handleRevertVoteWithUpdate = async () => {
    try {
      console.log('CompareAspectView: handleRevertVoteWithUpdate called');
      const success = await handleRevertVote();
      console.log('CompareAspectView: handleRevertVote success:', success);
      if (success) {
        console.log('CompareAspectView: calling onVoteChange with aspectId:', currentAspect?.id);
        onVoteChange(currentAspect?.id, false);
      }
    } catch (error) {
      console.error('Error in handleRevertVoteWithUpdate:', error);
    }
  };

  const handleNextClick = () => {
    if (!celebratingAspectId) {
      onNextClick();
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex-grow md:px-60 lg:px-60">
          <div className="flex-grow">
             {/* Main Content Skeleton */}
             <div className="flex-grow md:px-60 lg:px-60">
               {/* Items Grid Skeleton */}
               <div className="grid grid-cols-2 gap-4 m-4">
                 {[1, 2,3,4].map((i) => (
                  <div key={"not-voted-card-" + i}  style={{ opacity: 0.3}} >
                  <NotVotedCard item={{name: ' '}} />
                  </div>
                 ))}
               </div>
             </div>
    
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-3 mobile-friendly-margin-bottom"
        style={{
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
              <div key={item.id} className="w-full">
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
            className={`flex flex-col w-full items-center justify-center ml-10`}
            onClick={handleNextClick}
            style={{
              backgroundColor: celebratingAspectId ? currentTheme.colors.primary : changeColorAlpha(currentTheme.colors.primary, 0.5),
              color: 'white',
            }}
          >
            <h2 className='text-md p-1 text-center' style={{ color: 'rgb(255, 255, 255)' }}>
              {celebratingAspectId ? 'Next Aspect...' : 'Next Aspect'}
            </h2>
            {celebratingAspectId && (
              <motion.div
                className="h-1"
                style={{ backgroundColor: changeColorAlpha(currentTheme.colors.secondary, 0.2) }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: SHOW_RESULTS_DURATION-1.5, 
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

      <div className="text-center animate-fadeIn">
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
        <span className="text-2xl text-gray-500 animate-bounce">. . .</span>
      </div>
    </div>
  );
};

export default CompareAspectView; 