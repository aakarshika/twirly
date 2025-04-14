import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Plus, Trash2, ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import { TEMP_USER_ID } from '../../../lib/constants';

const ComparisonCard = ({ comparison, onDelete }) => {
    const { currentTheme } = useTheme();
  
    const getVoteCount = (itemId) => {
      return comparison.votes.filter(vote => vote.item_id === itemId).length;
    };
  
    const getCommentCount = () => {
      return comparison.comparison_set_comments.length;
    };
  
    // Define the number of placeholders needed
    const placeholdersNeeded = 3 - comparison.comparison_set_items.length;
  
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
          <div className="flex justify-between items-start mb-4">
            <h3 
              className="font-medium text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {comparison.name}
            </h3>
            <button
              onClick={() => onDelete(comparison.id)}
              className="p-1 rounded-full hover:bg-gray-100"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              <Trash2 size={16} />
            </button>
          </div>
  
          <div className="space-y-3">
            {comparison.comparison_set_items.map((setItem) => {
              const [imgSrc, setImgSrc] = useState(setItem.item.image_url);
  
              return (
                <div
                  key={setItem.id}
                  className="flex items-center space-x-3 p-3 rounded-lg"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={setItem.item.name}
                    onError={() => setImgSrc('https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p 
                        className="text-sm font-medium truncate"
                        style={{ color: currentTheme.colors.text }}
                      >
                        {setItem.item.name}
                      </p>
                      {setItem.item.user_id === TEMP_USER_ID && (
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
                      {setItem.item.category && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ 
                            backgroundColor: currentTheme.colors.background,
                            color: currentTheme.colors.textSecondary
                          }}
                        >
                          {setItem.item.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp size={14} style={{ color: currentTheme.colors.textSecondary }} />
                        <span 
                          className="text-xs"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {getVoteCount(setItem.item.id)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
  
            {/* Render placeholders if there are fewer than 3 items */}
            {placeholdersNeeded > 0 && Array.from({ length: placeholdersNeeded }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="flex items-center space-x-3 p-3 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  border: `1px dashed ${currentTheme.colors.border}`,
                  height: '48px' // Adjust height as needed
                }}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-200" /> {/* Placeholder for image */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-400">Placeholder Item</p>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        <div 
          className="px-4 py-3 flex items-center justify-between border-t"
          style={{ 
            borderColor: currentTheme.colors.border,
            backgroundColor: currentTheme.colors.background
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageSquare size={14} style={{ color: currentTheme.colors.textSecondary }} />
              <span 
                className="text-xs"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {getCommentCount()} comments
              </span>
            </div>
          </div>
          <a
            href={`/comparison/${comparison.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm"
            style={{ color: currentTheme.colors.primary }}
          >
            <ExternalLink size={14} />
            <span>View</span>
          </a>
        </div>
      </div>
    );
  };
export default ComparisonCard; 
  