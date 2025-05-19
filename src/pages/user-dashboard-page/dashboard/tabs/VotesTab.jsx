import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getUserVotes } from '../../../../services/votes';
import { useAuth } from '../../../../contexts/AuthContext';
import { splitAndJoin } from '../../../../lib/utils';
import { useNavigate } from 'react-router-dom';
const VoteCard = ({ vote }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div
            onClick={() => {
              navigate(`/compare/${vote.comparison_set_aspects?.set_id}/aspect/${vote.comparison_set_aspects?.id}`);
            }}
          >
            <h3 
              className="font-semibold text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {vote.comparison_set_aspects?.comparison_sets?.name}
            </h3>

            <h4 
              className="text-sm rounded-full px-2 py-1"
              style={{ color: 'white', backgroundColor: currentTheme.colors.primary, marginBottom: '10px'}}
            >
              Based on: {splitAndJoin(vote.comparison_set_aspects?.metric_name)}
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {new Date(vote.created_at).toLocaleDateString()}
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
            {vote.voted_for?.name}
          </span>
        </div>
      </div>
    </div>
  );
};

const VotesTab = ({ userId, isPublic }) => {
  const { currentTheme } = useTheme();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!userId) {
        setError('You must be logged in to view your votes');
        setLoading(false);
        return;
      }

      try {
        const data = await getUserVotes(userId);
        setVotes(data);
      } catch (err) {
        setError('Failed to fetch votes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [userId]);

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