import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, Trash2, ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import { getUserComparisonSets, createComparisonSet, addItemsToComparisonSet, deleteComparisonSet } from '../../services/comparisons';
import { getUserProducts } from '../../services/products';
import CreateComparisonModal from './CreateComparisonModal';

const ComparisonsTab = () => {
  const { currentTheme } = useTheme();
  const [comparisons, setComparisons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [comparisonSets, userProducts] = await Promise.all([
        getUserComparisonSets(),
        getUserProducts()
      ]);
      setComparisons(comparisonSets);
      setProducts(userProducts);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComparison = async (comparisonData) => {
    try {
      const newSet = await createComparisonSet({
        title: comparisonData.title,
        description: comparisonData.description
      });

      await addItemsToComparisonSet(newSet.id, comparisonData.selectedItems);
      await fetchData();
      setShowCreateModal(false);
    } catch (err) {
      setError('Failed to create comparison');
      console.error(err);
    }
  };

  const handleDeleteComparison = async (setId) => {
    if (!window.confirm('Are you sure you want to delete this comparison?')) return;

    try {
      await deleteComparisonSet(setId);
      await fetchData();
    } catch (err) {
      setError('Failed to delete comparison');
      console.error(err);
    }
  };

  const getVoteCount = (comparison, itemId) => {
    return comparison.votes.filter(vote => vote.item_id === itemId).length;
  };

  const getCommentCount = (comparison) => {
    return comparison.comments.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.colors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.error + '20', color: currentTheme.colors.error }}>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
          My Comparisons
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.buttonText
          }}
        >
          <Plus size={16} />
          <span>Create Comparison</span>
        </button>
      </div>

      {comparisons.length === 0 ? (
        <div 
          className="p-8 text-center rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.cardBackground,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <p style={{ color: currentTheme.colors.textSecondary }}>
            You haven't created any comparisons yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((comparison) => (
            <div
              key={comparison.id}
              className="rounded-lg overflow-hidden"
              style={{ 
                backgroundColor: currentTheme.colors.cardBackground,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 
                    className="font-medium text-lg"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {comparison.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteComparison(comparison.id)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p 
                  className="text-sm mb-4"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {comparison.description}
                </p>

                <div className="space-y-3">
                  {comparison.comparison_set_items.map((setItem) => (
                    <div
                      key={setItem.id}
                      className="flex items-center space-x-3 p-3 rounded-lg"
                      style={{ 
                        backgroundColor: currentTheme.colors.background,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      {setItem.item.image_url && (
                        <img
                          src={setItem.item.image_url}
                          alt={setItem.item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
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
                          {setItem.item.company && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded"
                              style={{ 
                                backgroundColor: currentTheme.colors.background,
                                color: currentTheme.colors.textSecondary
                              }}
                            >
                              {setItem.item.company.name}
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
                              {getVoteCount(comparison, setItem.item.id)}
                            </span>
                          </div>
                        </div>
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
                      {getCommentCount(comparison)} comments
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
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateComparisonModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateComparison}
          products={products}
        />
      )}
    </div>
  );
};

export default ComparisonsTab; 