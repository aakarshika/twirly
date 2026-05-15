import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useFeedback } from '../../contexts/FeedbackContext';

const FloatingFeedbackButton = () => {
  const { openFeedbackModal } = useFeedback();
  const { themeId } = useTheme();
  const t = themes[themeId];

  return (
    <motion.button
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.08 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={openFeedbackModal}
      className="fixed bottom-6 right-6 z-50"
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: t.ink,
        color: t.bg,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        touchAction: 'none',
        boxShadow: `0 4px 20px ${t.ink}45`,
      }}
      aria-label="Send feedback"
    >
      <MessageSquare size={21} strokeWidth={1.8} />
    </motion.button>
  );
};

export default FloatingFeedbackButton;
