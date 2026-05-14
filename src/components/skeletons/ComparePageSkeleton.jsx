import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import NotVotedCard from '../../pages/comparison-aspect-page/ComparisonItemCard/NotVotedCard';

const ComparePageSkeleton = () => {
  const { currentTheme } = useTheme();

  return (
    // <div className="min-h-screen max-w-7xl mx-auto overflow-x-hidden">
    //   <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
    //     {/* Progress Bar Skeleton */}
    //     <div className="w-full mb-4">
    //       <div className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: currentTheme.colors.background}} />
    //     </div>

    //     {/* Main Content Skeleton */}
    //     <div className="flex-grow md:px-60 lg:px-60">
    //       {/* Items Grid Skeleton */}
    //       <div className="grid grid-cols-2 gap-4 mb-4">
    //         {[1, 2].map((i) => (
    //           <div key={i} className="rounded-lg h-64 animate-pulse" style={{ backgroundColor: currentTheme.colors.background}} />
    //         ))}
    //       </div>

    //       {/* Next Button Skeleton */}
    //       <div className="h-12 rounded-lg animate-pulse mb-4" style={{ backgroundColor: currentTheme.colors.background}} />

    //       {/* Comments Section Skeleton */}
    //       <div className="space-y-4">
    //         {[1, 2, 3].map((i) => (
    //           <div key={i} className="h-20 rounded-lg animate-pulse" style={{ backgroundColor: currentTheme.colors.background}} />
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    // </div>

<div className="min-h-screen max-w-7xl mx-auto overflow-x-hidden">
<div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
  <div className="lg:py-4"></div>
  <div className="">
    <div className="w-full">
      <motion.div
        className="text-white"
      >
        <div className="w-full mb-4">
    <div className=" rounded-lg animate-pulse" style={{ height: '150px', backgroundColor: currentTheme.colors.background, opacity: 0.3 }} />
         </div>

      </motion.div>
    </div>
  </div>

  <div className="flex-grow md:px-60 lg:px-60">
      <div className="flex-grow">
         {/* Main Content Skeleton */}
         <div className="flex-grow md:px-60 lg:px-60">
           {/* Items Grid Skeleton */}
           <div className="grid grid-cols-2 gap-4 m-4">
             {[1, 2,3,4].map(i => (
              <div key={"not-voted-card-" + i}  style={{ opacity: 0.3 }} >
              <NotVotedCard item={{ name: ' ' }} />
              </div>
             ))}
           </div>
         </div>

      </div>
  </div>
</div>
</div>
  );
};

export default ComparePageSkeleton;
