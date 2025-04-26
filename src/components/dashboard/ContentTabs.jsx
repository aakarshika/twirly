import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ProductsTab from './tabs/ProductsTab';
import ComparisonsTab from './tabs/ComparisonsTab';
import ReviewsTab from './tabs/ReviewsTab';
import VotesTab from './tabs/VotesTab';
import CommentsTab from './tabs/CommentsTab';
import OverviewTab from './tabs/OverviewTab';


const ContentTabs = ({ activeTab, setActiveTab }) => {
  const { currentTheme } = useTheme();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'comparisons', label: 'Comparisons' },
    { id: 'comments', label: 'Reviews' },
    { id: 'votes', label: 'Votes' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab />;
      case 'overview':
        return <OverviewTab />;
      case 'comparisons':
        return <ComparisonsTab />;
      // case 'reviews':
      //   return <ReviewsTab />;
      case 'votes':
        return <VotesTab />;
      case 'comments':
        return <CommentsTab />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div 
        className="flex space-x-4 mb-6 overflow-x-auto"
        style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2'
                : 'opacity-50 hover:opacity-75'
            }`}
            style={{
              color: currentTheme.colors.text,
              borderColor: activeTab === tab.id ? currentTheme.colors.primary : 'transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div 
        className="p-6 rounded-lg"
        style={{ backgroundColor: currentTheme.colors.cardBackground }}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ContentTabs; 