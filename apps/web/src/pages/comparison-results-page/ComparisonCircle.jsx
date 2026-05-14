import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import VotedCard from '../comparison-aspect-page/ComparisonItemCard/VotedCard';

const ComparisonCircle = ({ item, _index, _isMobile = false, winner, runnerUp, totalVotes, userVotedAll }) => {

    const titleRef = useRef(null);

    useEffect(() => {
      if (titleRef.current) {
        const titleElement = titleRef.current;
        const wordCount = item.name.trim().split(/\s+/).length;

        if (wordCount > 10) {
          titleElement.style.fontSize = '0.875rem';
        } else {
          titleElement.style.fontSize = '1.5rem';
        }
      }
    }, [item.name]);

    return (
        <div
            key={item.id}
            className="relative flex flex-col items-center"
        >

            <motion.div
                className="w-full h-full rounded-xl overflow-hidden"
                style={{
                }}
                transition={winner && winner.id === item.id ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                } : runnerUp && runnerUp.id === item.id ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                } : {}}
            >

                <VotedCard
                    item={item}
                    userVotedAll={userVotedAll}
                    totalVotes={totalVotes}
                    votes={item.votes}
                    leadingMetrics={item.leadingMetrics}
                    winner={winner}
                    runnerUp={runnerUp}
                />

            </motion.div>

        </div>
    );
};

export default ComparisonCircle;
