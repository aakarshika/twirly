import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ComparisonItemCardAspect from '../comparison-aspect-page/ComparisonItemCard/ComparisonItemCardAspect';
import ComparisonSetAspectsCommentsSection from '../comparison-aspect-page/ComparisonSetAspectsCommentsSection';
import { useComparisonAspectData } from '../../hooks/useComparisonAspectData';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';
import { changeColorAlpha } from '../../lib/utils';
import CommentHeader from '../../components/common/comments/CommentHeader';

const CompareAspectView = ({ onVoteChange, onNextClick, celebratingAspectId, isResultsPage, currentAspect, nextUnvotedAspect }) => {
  const { aspectId } = useParams();
  const { currentTheme } = useTheme();
  
  useEffect(() => {
    console.log("Dsfghj", celebratingAspectId);
  }, [celebratingAspectId]);
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
  } = useComparisonAspectData(aspectId);

  // Wrap the vote handlers to notify parent
  const handleVoteWithUpdate = async (itemId) => {
    console.log('CompareAspectView: handleVoteWithUpdate called with itemId:', itemId);
    const success = await handleVote(itemId);
    console.log('CompareAspectView: handleVote success:', success);
    if (success) {
      console.log('CompareAspectView: calling onVoteChange with aspectId:', aspectId);
      onVoteChange(aspectId, true, itemId);
    }
  };

  const handleRevertVoteWithUpdate = async () => {
    console.log('CompareAspectView: handleRevertVoteWithUpdate called');
    const success = await handleRevertVote();
    console.log('CompareAspectView: handleRevertVote success:', success);
    if (success) {
      console.log('CompareAspectView: calling onVoteChange with aspectId:', aspectId);
      onVoteChange(aspectId, false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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

  return (
    <div className="flex flex-col">
      <div className="shadow-md rounded-md p-3 mobile-friendly-margin-bottom"
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

        {celebratingAspectId && (
          <div className='flex-row mt-2'>
          <div className='flex flex-col w-full items-center justify-center bg-amber-300 ml-10'>
            <h2 className='text-md p-1 ' style={{ color: 'rgb(255, 255, 255)' }}>Next Aspect</h2>
            <motion.div
              className="h-1"
              style={{ backgroundColor: currentTheme.colors.secondary }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: SHOW_RESULTS_DURATION, ease: "linear" }}
            />
          </div>
          <div className='flex flex-col items-center justify-center bg-gray-300 mr-4'>
            <h2 className='text-md p-1 ' style={{ color: 'rgb(255, 255, 255)' }}>Cancel</h2>
          </div>
          
          </div>
        )}
        <div className="pt-1" >
          <div >
        <CommentHeader
          type="Comment"
          comment={currentAspectSet}
          replyClicked={() => {}}
          profile_image_url={currentAspectSet?.comparison_sets?.user?.profile_image_url}
          display_name={currentAspectSet?.comparison_sets?.user?.display_name}
          created_at={currentAspectSet?.comparison_sets?.created_at}
          userReaction={currentAspectSet?.userReaction}
          reactions={currentAspectSet?.reactions}
          objectId={currentAspectSet?.id}
          numReplies={currentAspectSet?.comments?.length}
          items={items}
        />
        </div>
        </div>

        {!isResultsPage && currentAspect && (
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 1, -1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: currentAspect?.userVoted ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                      className="relative"
                    >
                        <>
                          <div className="relative">
                            {celebratingAspectId && (
                              <motion.svg
                                className="absolute -inset-1"
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                              >
                                <motion.circle
                                  cx="20"
                                  cy="20"
                                  r="18"
                                  fill="none"
                                  stroke="lightgray"
                                  strokeWidth="4"
                                  strokeDasharray="125"
                                  strokeDashoffset="125"
                                  initial={{ strokeDashoffset: 125 }}
                                  animate={{ strokeDashoffset: 0 }}
                                  transition={{ duration: SHOW_RESULTS_DURATION, ease: "linear" }}
                                />
                              </motion.svg>
                            )}
                      {!nextUnvotedAspect && (
                            <ChevronRight 
                              className="bg-yellow-300 rounded-full w-8 h-8 text-amber-800 p-1 mt-2 cursor-pointer relative z-10"
                              onClick={(e) => {
                                
                              onNextClick();
                              }}
                            />
                      )}
                      {nextUnvotedAspect && (
                        
                            <ChevronRight 
                            className="rounded-full w-8 h-8 text-white p-1 mt-2 cursor-pointer relative z-10" 
                            style={{ backgroundColor: celebratingAspectId ?  currentTheme.colors.secondary:  changeColorAlpha(currentTheme.colors.secondary, 0.5) }}
                            onClick={(e) => {
                              
                              onNextClick();
                            }}
                            />
                      )}
                          </div>
                        </>
                    </motion.div>
                  )}
      </div>



      <div className="text-center animate-fadeIn" style={{ backgroundColor: 'white' }}>
        <div className="w-full p-4" style={{ marginBottom: '100px' }}>
          <ComparisonSetAspectsCommentsSection
            userVoted={userVoted}
            aspectSetId={aspectId}
            items={items}
            aspectSet={currentAspectSet}
          />
        </div>
        <span className="text-2xl animate-bounce" >. . .</span>
      </div>
    </div>
  );
};

export default CompareAspectView; 