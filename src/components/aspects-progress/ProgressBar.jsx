import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ duration = 3 }) => {
  return (
    <motion.div
      className="absolute bottom-0 left-0 h-1 bg-white"
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration, ease: "linear" }}
    />
  );
};

export default ProgressBar; 