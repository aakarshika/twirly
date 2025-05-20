import React from 'react';
import { motion } from 'framer-motion';
import { SHOW_RESULTS_DURATION } from '../../lib/constants';
import { useTheme } from '../../contexts/ThemeContext';
const ProgressBar = ({ duration = SHOW_RESULTS_DURATION }) => {
  const { currentTheme } = useTheme();
  return (
    <motion.div
      className="absolute bottom-0 left-0 h-2"
      style={{ backgroundColor: currentTheme.colors.primary }}
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration, ease: "linear" }}
    />
  );
};

export default ProgressBar; 