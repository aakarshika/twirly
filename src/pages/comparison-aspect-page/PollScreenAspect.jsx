import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHeader } from '../../contexts/HeaderContext';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight, Globe2, Trophy } from 'lucide-react';
import ComparisonItemCardAspect from './ComparisonItemCard/ComparisonItemCardAspect';
import { splitAndJoin } from '../../lib/utils';
import { usePollScreenAspect } from '../../hooks/usePollScreenAspect';
import './PollScreenAspect.css';
import ComparisonSetAspectsCommentsSection from './ComparisonSetAspectsCommentsSection';
import Trending from '../trending-page/Trending';
import AspectsProgressBar from '../comparison-results-page/AspectsProgressBar';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useComparisonAspectData } from '../../hooks/useComparisonAspectData';
// Add Google Fonts
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap');
`;

const PollScreenAspect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { isHeaderVisible } = useHeader();

  const {
    loading,
    error,
    currentSet,
    currentAspectSet,
    items,
    totalVotes,
    userVoted,
    votedItemId,
    comparisonMetrics,
    handleVote,
    handleRevertVote,
  } = useComparisonAspectData(id);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextAspect = comparisonMetrics.find(metric => !metric.userVoted);
      if (nextAspect) {
        navigate(`/comparison-aspect/${nextAspect.id}`);
      } else {
        navigate(`/comparison/${currentSet.id}`);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false },
    trackTouch: true,
    rotationAngle: 0,
  });

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{fontStyles}</style>
      <div className="min-h-screen h-full flex flex-col max-w-4xl mx-auto font-outfit"
        style={{
          paddingTop: isHeaderVisible ? '64px' : '0px',
          paddingBottom: '80px'
        }}>

        <div className="h-full flex flex-col animate-fadeIn" {...handlers}>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center text-amber-500 space-x-2 bg-amber-100 rounded-lg m-2 p-2"
            >
              <div className='flex flex-row items-center'>
                <h4 className='text-sm'>{currentSet?.name}</h4>
              </div>
            </motion.div>

            <AspectsProgressBar
              comparisonMetrics={comparisonMetrics}
              onAspectClick={(aspect) => {
                navigate(`/comparison-aspect/${aspect.id}`);
              }}
            />

            <div className="shadow-md rounded-md p-4 mobile-friendly-margin-bottom"
              style={{
                backgroundColor: currentTheme.colors.card,
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
                    <div key={item.id} className="transform transition-all duration-300 hover:scale-105">
                      <ComparisonItemCardAspect
                        key={item.id}
                        item={item}
                        index={i}
                        height="100"
                        totalVotes={totalVotes}
                        userVoted={userVoted}
                        votedItemId={votedItemId}
                        handleVote={handleVote}
                        handleRevertVote={handleRevertVote}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center animate-fadeIn" style={{ backgroundColor: 'white' }}>
            <div className="w-full" style={{ marginBottom: '300px' }}>
              <ComparisonSetAspectsCommentsSection
                userVoted={userVoted}
                aspectSetId={id}
                items={items}
                aspectSet={currentAspectSet}
              />
            </div>
            <span className="text-2xl animate-bounce">. . .</span>
          </div>
        </div>

      </div>
    </>
  );
};

export default PollScreenAspect; 