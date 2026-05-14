import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import AppearancesTab from './tabs/AppearancesTab';
import CommentAppearancesTab from './tabs/CommentAppearancesTab';

const ProductTabs = ({
  activeTab,
  setActiveTab,
  item,
  comparisonSets,
}) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { itemId, tab } = useParams();

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab, activeTab, setActiveTab]);

  const handleTabClick = tabId => {
    setActiveTab(tabId);
    navigate(`/item/${itemId}/${tabId}`);
  };

  return (
    <div className="mb-8">
      <div className="flex space-x-4 border-b border-gray-700 sticky top-0 z-10">
        {['mentions', 'comparisons'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            style={{ color: activeTab === tab ? currentTheme.colors.primary : currentTheme.colors.textSecondary }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'mentions' && (
          <CommentAppearancesTab
            comparisonSets={comparisonSets}
            item={item}
          />
        )}
        {activeTab === 'comparisons' && (
          <AppearancesTab
            comparisonSets={comparisonSets}
            item={item}
          />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
