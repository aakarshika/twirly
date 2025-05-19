import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Sparkles, CupSoda } from 'lucide-react';
import { splitAndJoin, getRGB, getPublicUrlItems, darkenColor } from '../../lib/utils';

const ComparisonCircle = ({ item, index, isMobile = false, winner, runnerUp, totalVotes }) => {
    const itemColor = getRGB(item.item_color_string);
    const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);

    const badgeClasses = isMobile ? {
        container: "absolute top-1 left-1 transform -translate-x-1/2 z-10",
        badge: "flex justify-between items-center gap-1.5 rounded-lg px-3 py-1.5 shadow-lg",
        icon: "w-6 h-6",
        text: "text-xs font-semibold",
        sparkles: "w-3 h-3"
    } : {
        container: "absolute top-4 left-1/2 transform -translate-x-1/2 z-10",
        badge: "flex justify-between items-center gap-2 rounded-lg px-4 py-2 shadow-lg",
        icon: "w-6 h-6",
        text: "text-sm font-semibold",
        sparkles: "w-4 h-4"
    };

    return (
        <div
            key={item.id}
            className="relative w-full h-full flex flex-col items-center"
        >
            <motion.div 
                className="relative bg-white w-full h-full rounded-xl shadow-lg overflow-hidden"
                style={{
                    backgroundColor: winner && winner.id !== item.id ? 
                        itemColor.substring(0, itemColor.length - 1) + ', 0.2)' : 
                        itemColor.substring(0, itemColor.length - 1) + ', 0.5)',
                    border: `4px solid ${winner && winner.id !== item.id ? 
                        itemColor.substring(0, itemColor.length - 1) + ', 0.3)' : 
                        itemColor}`
                }}
                animate={winner && winner.id === item.id ? {
                    boxShadow: [
                        "0 0 0 0 rgba(234, 179, 8, 0.4)",
                        "0 0 20px 10px rgba(234, 179, 8, 0.2)",
                        "0 0 0 0 rgba(234, 179, 8, 0.4)"
                    ],
                    scale: [1, 1.02, 1],
                    rotate: [0, 0.5, 0]
                } : runnerUp && runnerUp.id === item.id ? {
                    boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.4)",
                        "0 0 15px 5px rgba(59, 130, 246, 0.2)",
                        "0 0 0 0 rgba(59, 130, 246, 0.4)"
                    ],
                    scale: [1, 1.01, 1]
                } : {}}
                transition={winner && winner.id === item.id ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : runnerUp && runnerUp.id === item.id ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : {}}
            >
                {/* Status Badge - Winner or Runner Up */}
                {(winner?.id === item.id || runnerUp?.id === item.id) && (
                    <motion.div 
                        className={badgeClasses.container}
                        initial={{ scale: 0.8, y: -10 }}
                        animate={{ 
                            scale: [1, 1.05, 1],
                            y: [0, -5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.div 
                            className={`${badgeClasses.badge} ${
                                winner?.id === item.id 
                                    ? 'flex bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400'
                                    : 'flex bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400'
                            }`}
                            animate={{ 
                                boxShadow: winner?.id === item.id ? [
                                    "0 0 0 0 rgba(234, 179, 8, 0.4)",
                                    "0 0 20px 10px rgba(234, 179, 8, 0.2)",
                                    "0 0 0 0 rgba(234, 179, 8, 0.4)"
                                ] : [
                                    "0 0 0 0 rgba(59, 130, 246, 0.4)",
                                    "0 0 15px 5px rgba(59, 130, 246, 0.2)",
                                    "0 0 0 0 rgba(59, 130, 246, 0.4)"
                                ],
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                backgroundSize: '200% 100%'
                            }}
                        >
                            {winner?.id === item.id ? (
                                <>
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 10, 0, -10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Trophy className={`${badgeClasses.icon} text-white`} />
                                    </motion.div>
                                    <span className={`${badgeClasses.text} text-white`}>Winner Cup</span>
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Sparkles className={`${badgeClasses.sparkles} text-white`} />
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 5, 0, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <CupSoda className={`${badgeClasses.icon} text-white`} />
                                    </motion.div>
                                    <span className={`${badgeClasses.text} text-white`}>Runner Cup</span>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                <div className={`p-6 ${isMobile ? 'pt-12' : 'pt-16'}`}>
                    {/* Image or Fallback */}
                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                        {itemImage ? (
                            <>
                                <img
                                    src={itemImage}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-black/70 to-transparent">
                                    <h3 className="text-lg font-bold text-white text-center line-clamp-2">
                                        {item.name}
                                    </h3>
                                </div>
                            </>
                        ) : (
                            <div 
                                className="w-full h-full flex flex-col items-center justify-center"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <h3 className="text-xl font-bold text-center" style={{ color: darkenColor(item.item_color_string, 40) }}>
                                        {item.name}
                                    </h3>
                                </div>
                                {item.votes?.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {item.votes.length} votes
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Leading Metrics */}
                    {item.leadingMetrics && item.leadingMetrics.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {item.leadingMetrics.map((metric) => (
                                <motion.div 
                                    key={metric.metric_name}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Target className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-700">
                                            {splitAndJoin(metric.metric_name)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ComparisonCircle; 