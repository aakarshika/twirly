import React from 'react';
import { motion } from 'framer-motion';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';

const ProgressBar = ({ duration = SHOW_RESULTS_DURATION }) => {
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