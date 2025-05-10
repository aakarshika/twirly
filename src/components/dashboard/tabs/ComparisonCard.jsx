import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Plus, Trash2, ExternalLink, MessageSquare, ThumbsUp, Settings } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ComparisonItem = ({ item, user, getVoteCount, getCommentCount }) => {
  const { currentTheme } = useTheme();
  const [imgSrc, setImgSrc] = useState(item?.image_url);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="flex items-center space-x-3 p-3 rounded-lg"
      style={{
        backgroundColor: currentTheme.colors.background,
        border: `1px solid ${currentTheme.colors.border}`
      }}
    >
      <div className="relative">
        {item.image_url && !imageError && (<img
          src={item.image_url}
          alt={item.name}
          className="w-24 h-24 object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
            setImageError(true);
          }}
        />)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">

          <div
            className="w-4 h-4 object-cover"
            style={{ backgroundColor: item.item_color_string }}
          >
          </div>
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
        <div className="text-sm text-gray-500">
          {item.description}
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
        </div>
      </div>
    </div>
  );
};

const ComparisonCard = ({ comparison, onDelete, isPublic }) => {
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
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        backgroundColor: currentTheme.colors.card,
        border: `1px solid ${currentTheme.colors.border}`,
        color: currentTheme.colors.text
      }}
    >
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-4" 
      onClick={() => handleComparisonClick(comparison)}>
          <h3
            className="font-medium text-lg"
            style={{ color: currentTheme.colors.text }}
          >
            {comparison?.name || 'Unnamed Comparison'}
          </h3>
          {(!isPublic && <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-comparison/${comparison.id}`);
              }}
              className="p-2 rounded-full hover:bg-gray-700 z-10"
              title="Edit Metrics"
            >
              <Settings size={18} style={{ color: currentTheme.colors.textSecondary }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(comparison.id);
              }}
              className="p-2 rounded-full hover:bg-gray-700 z-10"
              title="Delete Comparison"
            >
              <Trash2 size={18} style={{ color: currentTheme.colors.error }} />
            </button>
          </div>)}
        </div>

        <div className="space-y-3">
          {comparison?.items?.map((setItem) => {
            console.log(setItem, comparison.id + "_" + setItem.item_id);
            return (
            <ComparisonItem
              key={comparison.id + "_" + setItem.id}
              item={setItem.item}
              user={user}
              getVoteCount={getVoteCount}
              getCommentCount={getCommentCount}
            />
          )})}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
