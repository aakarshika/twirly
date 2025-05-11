import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import ProductsTab from './tabs/ProductsTab';
import ComparisonsTab from './tabs/ComparisonsTab';
import ReviewsTab from './tabs/ReviewsTab';
import VotesTab from './tabs/VotesTab';
import CommentsTab from './tabs/CommentsTab';
import OverviewTab from './tabs/OverviewTab';

const ContentTabs = ({ activeTab, setActiveTab, userId,username, isPublic = true }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { tab } = useParams();
  console.log(tab, username, userId, isPublic);
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab, activeTab, setActiveTab]);

  const tabs = isPublic ? [
    { id: 'overview', label: 'Overview' },
    { id: 'comments', label: 'Reviews' },
    { id: 'products', label: 'Products' },
    { id: 'comparisons', label: 'Comparisons' }
  ] : [
    { id: 'overview', label: 'Overview' },
    { id: 'comments', label: 'Reviews' },
    { id: 'products', label: 'Products' },
    { id: 'comparisons', label: 'Comparisons' },
    { id: 'votes', label: 'Votes' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (isPublic) {
      navigate(`/user/${username}/${tabId}`);
    } else {
      navigate(`/dashboard/${tabId}`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab userId={userId} isPublic={isPublic} />;
      case 'overview':
        return <OverviewTab userId={userId} isPublic={isPublic} />;
      case 'comparisons':
        return <ComparisonsTab userId={userId} isPublic={isPublic} />;
      // case 'reviews':
      //   return <ReviewsTab />;
      case 'votes':
        return isPublic ? null : <VotesTab userId={userId} isPublic={isPublic} />;
      case 'comments':
        return <CommentsTab userId={userId} isPublic={isPublic} />;
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
            onClick={() => handleTabClick(tab.id)}
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