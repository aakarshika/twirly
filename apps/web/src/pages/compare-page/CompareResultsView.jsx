import React from 'react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import PollScreen from '../comparison-results-page/PollScreen';

const CompareResultsView = ({ items, currentSetId, currentSet, celebratingResults }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  if (!items || !currentSetId || !currentSet) {
    return (
      <div className="grid grid-cols-2 gap-2 p-3">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{ aspectRatio: '1/1', background: t.bgDeep }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <PollScreen
        items={items}
        currentSetId={currentSetId}
        currentSet={currentSet}
        celebratingResults={celebratingResults}
      />
    </div>
  );
};

export default CompareResultsView;
