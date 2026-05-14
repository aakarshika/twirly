import React from 'react';
import ComparisonCircle from './ComparisonCircle';
import { motion } from 'framer-motion';

const CenterStage = ({ item, isMobile, comparison, winner, runnerUp, totalVotes }) => {
    return (
        <motion.div
            className="relative w-50 h-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
                scale: 0.5,
                x: isMobile ? '-45vw' : '-20vw',
                y: isMobile ? '20vh' : '25vh',
                transition: {
                    duration: 0.5,
                    ease: "easeInOut",
                },
            }}
        >
            <div className="flex items-center justify-center">
                <div style={{ width: isMobile ? '90vw' : '40vw' }}>
                    <ComparisonCircle
                        item={item}
                        index={0}
                        isMobile={isMobile}
                        comparison={comparison}
                        winner={winner}
                        runnerUp={runnerUp}
                        totalVotes={totalVotes}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default CenterStage;
