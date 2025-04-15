import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Plus, Trash2, ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ComparisonItem = ({ item, user, getVoteCount, getCommentCount }) => {
  const { currentTheme } = useTheme();
  const [imgSrc, setImgSrc] = useState(item?.image_url);

  return (
    <div
      className="flex items-center space-x-3 p-3 rounded-lg"
      style={{ 
        backgroundColor: currentTheme.colors.background,
        border: `1px solid ${currentTheme.colors.border}`
      }}
    >
      <img
        src={imgSrc}
        alt={item?.name || 'Item'}
        onError={() => setImgSrc('https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')}
        className="w-12 h-12 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p 
            className="text-sm font-medium truncate"
            style={{ color: currentTheme.colors.text }}
          >
            {item?.name || 'Unnamed Item'}
          </p>
          {user && item?.user_id === user.id && (
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.primary + '20',
                color: currentTheme.colors.primary
              }}
            >
              Your Product
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          {item?.price && (
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.textSecondary
              }}
            >
              ${item.price.toFixed(2)}
            </span>
          )}
          <div className="flex items-center space-x-1">
            <ThumbsUp size={14} style={{ color: currentTheme.colors.textSecondary }} />
            <span 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {getVoteCount(item?.id)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare size={14} style={{ color: currentTheme.colors.textSecondary }} />
            <span 
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {getCommentCount()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonCard = ({ comparison, onDelete }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getVoteCount = (itemId) => {
    if (!comparison?.votes) return 0;
    return comparison.votes.filter(vote => vote.item_id === itemId).length;
  };

  const getCommentCount = () => {
    if (!comparison?.comparison_set_comments) return 0;
    return comparison.comparison_set_comments.length;
  };

  const handleComparisonClick = (comparison) => {
    navigate(`/comparison/${comparison.id}`);
  };

  // Define the number of placeholders needed
  const placeholdersNeeded = 3 - (comparison?.items?.length || 0);

  return (
    <div 
      onClick={() => handleComparisonClick(comparison)}
      className="rounded-lg overflow-hidden flex flex-col"
      style={{ 
        backgroundColor: currentTheme.colors.card,
        border: `1px solid ${currentTheme.colors.border}`,
        color: currentTheme.colors.text
      }}
    >
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 
            className="font-medium text-lg"
            style={{ color: currentTheme.colors.text }}
          >
            {comparison?.name || 'Unnamed Comparison'}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(comparison.id);
            }}
            className="p-1 rounded-full hover:bg-gray-100"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {comparison?.items?.map((setItem) => (
            <ComparisonItem
              key={setItem.item.id}
              item={setItem.item}
              user={user}
              getVoteCount={getVoteCount}
              getCommentCount={getCommentCount}
            />
          ))}

          {[...Array(Math.max(0, placeholdersNeeded))].map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="flex items-center space-x-3 p-3 rounded-lg"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard; 
  