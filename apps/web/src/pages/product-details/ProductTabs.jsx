import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import AppearancesTab from './tabs/AppearancesTab';
import CommentAppearancesTab from './tabs/CommentAppearancesTab';
import ReviewsTab from './tabs/ReviewsTab';

const TABS = [
  { id: 'comparisons', label: 'comparisons' },
  { id: 'mentions',    label: 'mentions'    },
  { id: 'reviews',     label: 'reviews'     },
];

const EASE = [0.16, 1, 0.3, 1];

const ProductTabs = ({ activeTab, setActiveTab, item, comparisonSets }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const navigate = useNavigate();
  const { itemId, tab } = useParams();

  useEffect(() => {
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [tab, activeTab, setActiveTab]);

  const handleTabClick = id => {
    setActiveTab(id);
    navigate(`/item/${itemId}/${id}`);
  };

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-1 sticky top-0 z-10 pb-1"
        style={{ background: t.bg }}
      >
        {TABS.map(({ id, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 14,
                color: active ? t.bg : t.ink,
                background: active ? t.ink : 'transparent',
                border: `1px solid ${t.ink}${active ? 'ff' : '25'}`,
                borderRadius: 6,
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="mt-6"
      >
        {activeTab === 'comparisons' && (
          <AppearancesTab comparisonSets={comparisonSets} item={item} />
        )}
        {activeTab === 'mentions' && (
          <CommentAppearancesTab comparisonSets={comparisonSets} item={item} />
        )}
        {activeTab === 'reviews' && (
          <ReviewsTab item={item} />
        )}
      </motion.div>
    </div>
  );
};

export default ProductTabs;
