import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getUserVotes } from '../../../services/votes';
import { useAuth } from '../../../contexts/AuthContext';

const VoteCard = ({ vote }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 
              className="font-semibold text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {vote.comparisonSetName}
            </h3>
            <p 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {vote.category}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {new Date(vote.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span 
            className="text-sm"
            style={{ color: currentTheme.colors.text }}
          >
            Voted for:
          </span>
          <span 
            className="font-medium"
            style={{ color: currentTheme.colors.primary }}
          >
            {vote.votedItem}
          </span>
        </div>
      </div>
    </div>
  );
};

const VotesTab = ({  }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!user) {
        setError('You must be logged in to view your votes');
        setLoading(false);
        return;
      }

      try {
        const data = await getUserVotes(user.id);
        setVotes(data);
      } catch (err) {
        setError('Failed to fetch votes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          Your Votes
        </h2>
      </div>

      <div className="space-y-4">
        {votes.map((vote) => (
          <VoteCard key={vote.id} vote={vote} />
        ))}
      </div>
    </div>
  );
};

export default VotesTab; 