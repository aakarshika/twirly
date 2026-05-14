import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const VoteCelebration = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute right-0 top-0 transform -translate-x-1/2 -translate-y-1/2 z-10"
    >
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: 0,
          ease: "easeInOut",
        }}
      >
        <CheckCircle className="w-8 h-8 text-yellow-400" />
      </motion.div>
    </motion.div>
  );
};

export default VoteCelebration;
