import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ItemPolls = ({ itemId }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('recent');

  // This would be fetched from your API
  const polls = {
    recent: [
      {
        id: 1,
        title: 'Recent Poll 1',
        totalVotes: 150,
        itemVotes: 75,
        otherItem: 'Competitor A',
        isRevealed: false
      },
      {
        id: 2,
        title: 'Recent Poll 2',
        totalVotes: 200,
        itemVotes: 120,
        otherItem: 'Competitor B',
        isRevealed: true
      }
    ],
    top: [
      {
        id: 3,
        title: 'Top Poll 1',
        totalVotes: 500,
        itemVotes: 300,
        otherItem: 'Competitor C',
        isRevealed: true
      }
    ],
    ongoing: [
      {
        id: 4,
        title: 'Ongoing Poll 1',
        totalVotes: 100,
        itemVotes: 40,
        otherItem: 'Competitor D',
        isRevealed: false
      }
    ]
  };

  const handleVote = (pollId) => {
    // Handle vote logic here
    console.log('Voting for poll:', pollId);
  };

  const PollCard = ({ poll }) => {
    const percentage = poll.isRevealed ? Math.round((poll.itemVotes / poll.totalVotes) * 100) : null;

    return (
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {poll.title}
        </h3>
        <div className="mt-2">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            vs {poll.otherItem}
          </p>
          {poll.isRevealed ? (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {percentage}% voted for this item
                </span>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {poll.itemVotes} votes
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className={`h-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleVote(poll.id)}
              className={`mt-2 px-4 py-2 rounded-full text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Vote to Reveal
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['recent', 'top', 'ongoing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-blue-600 border-b-2 border-blue-600'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {polls[activeTab].map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
};

export default ItemPolls; 