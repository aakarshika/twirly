import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon as VoteIcon,
  CubeIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';


const QuickStats = ({ comparisonSets, reviews, item }) => {
  const { currentTheme } = useTheme();
  const [animatedComparisons, setAnimatedComparisons] = useState(0);
  const [animatedWinRate, setAnimatedWinRate] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const totalVotes = comparisonSets.reduce((sum, set) => sum + (set.itemVotes || 0), 0);
  const winRate = comparisonSets.length > 0 
    ? Math.round((comparisonSets.filter(set => (set.itemVotes || 0) > (set.totalVotes || 0) / 2).length / comparisonSets.length) * 100)
    : 0;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedComparisons(Math.round(comparisonSets.length * progress));
      setAnimatedWinRate(Math.round(winRate * progress));
      
      if (currentStep >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [comparisonSets.length, winRate]);

  return (
    <div className="relative min-h-[300px] p-8 overflow-hidden">
      {/* Background decorative elements */}
      
      {/* Main content */}
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent"
          >
            {item.name}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Comparisons Card */}
          
          {/* Win Rate Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, rotate: -1 }}
            className="relative p-6 rounded-2xl backdrop-blur-md hover:shadow-2xl transition-all duration-300"
            style={{ backgroundColor: currentTheme.colors.card + '80' }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center"
            >
              <SparklesIcon className="w-6 h-6 text-white" />
            </motion.div>

            <div className="flex items-center justify-center space-x-4">
              <div>
                <p className="text-lg font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                  Win Rate 💪
                </p>
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent"
                >
                  {animatedWinRate}%
                </motion.p>
              </div>
            </div>
            <div className='flex flex-row items-center justify-between'>
                <p className="text-md font-semibold mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                  Comparisons 
                </p>
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-md font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                >
                  {animatedComparisons}
                </motion.p>
              </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats; 