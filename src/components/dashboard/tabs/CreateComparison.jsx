import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useComparisonDraft } from '../../../contexts/ComparisonDraftContext';
import { searchProducts } from '../../../services/products';
import { createComparison, getUnpublishedComparison, updateComparison } from '../../../services/comparisons';
import { X, Check, Search, User, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateComparison = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    draft, 
    addItem, 
    removeItem, 
    addAspect, 
    removeAspect, 
    updateDraft, 
    clearDraft 
  } = useComparisonDraft();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newAspect, setNewAspect] = useState({ metric_name: '', description: '', weight: 1 });
  const [existingComparisonId, setExistingComparisonId] = useState(null);
  const hasLoadedData = useRef(false);

  useEffect(() => {
    const loadUnpublishedComparison = async () => {
      if (!user || hasLoadedData.current) return;

      try {
        setLoading(true);
        const unpublishedData = await getUnpublishedComparison(user.id);
        
        if (unpublishedData) {
          setExistingComparisonId(unpublishedData.id);
          // Transform the data to match the draft format
          updateDraft({
            title: unpublishedData.name,
            description: unpublishedData.description,
            category_id: unpublishedData.category_id,
            items: unpublishedData.comparison_set_items.map(item => item.items),
            aspects: unpublishedData.comparison_set_aspects.map(aspect => ({
              id: aspect.id,
              metric_name: aspect.metric_name,
              description: aspect.description,
              weight: aspect.weight || 1
            })),
            isPublished: false
          });
        }
        hasLoadedData.current = true;
      } catch (err) {
        setError('Failed to load unpublished comparison');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUnpublishedComparison();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
      } catch (err) {
        setError('Failed to search products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSaveDraft = async () => {
    if (!validateDraft()) return;

    try {
      setLoading(true);
      if (existingComparisonId) {
        await updateComparison(existingComparisonId, {
          ...draft,
          user_id: user.id,
          isPublished: false
        });
      } else {
        await createComparison({
          ...draft,
          user_id: user.id,
          isPublished: false
        });
      }
      clearDraft();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save draft');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateDraft()) return;

    try {
      setLoading(true);
      if (existingComparisonId) {
        await updateComparison(existingComparisonId, {
          ...draft,
          user_id: user.id,
          isPublished: true
        });
      } else {
        await createComparison({
          ...draft,
          user_id: user.id,
          isPublished: true
        });
      }
      clearDraft();
      navigate('/dashboard/comparisons');
    } catch (err) {
      setError('Failed to publish comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateDraft = () => {
    if (!draft.title) {
      setError('Title is required');
      return false;
    }
    // if (!draft.category_id) {
    //   setError('Category is required');
    //   return false;
    // }
    // if (draft.items.length < 2) {
    //   setError('At least 2 items are required');
    //   return false;
    // }
    if (draft.aspects.length === 0) {
      setError('At least one aspect is required');
      return false;
    }
    return true;
  };

  const handleAddAspect = () => {
    if (!newAspect.metric_name) {
      setError('Aspect name is required');
      return;
    }
    addAspect({
      id: Date.now(),
      ...newAspect
    });
    setNewAspect({ metric_name: '', description: '', weight: 1 });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
          Create New Comparison
        </h1>
        <div className="space-x-2">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 font-medium border"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text,
              borderColor: currentTheme.colors.border
            }}
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 font-medium"
            style={{ 
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.buttonText
            }}
          >
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 border-l-4" style={{ 
          backgroundColor: currentTheme.colors.error + '10',
          borderColor: currentTheme.colors.error,
          color: currentTheme.colors.error
        }}>
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            className="w-full p-3 text-xl"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text,
              borderBottom: `1px solid ${currentTheme.colors.border}`
            }}
            placeholder="Title"
          />
        </div>

        <div>
          <textarea
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            className="w-full p-3"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text,
              borderBottom: `1px solid ${currentTheme.colors.border}`
            }}
            placeholder="Description"
            rows={3}
          />
        </div>

        <div>
          <select
            value={draft.category_id || ''}
            onChange={(e) => updateDraft({ category_id: e.target.value })}
            className="w-full p-3"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text,
              borderBottom: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <option value="">Select a category</option>
            {/* Add categories here */}
          </select>
        </div>

        <div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                borderBottom: `1px solid ${currentTheme.colors.border}`
              }}
              placeholder="Search products..."
            />
            <Search className="absolute left-3 top-3.5" size={20} style={{ color: currentTheme.colors.textSecondary }} />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1 border" style={{ backgroundColor: currentTheme.colors.background }}>
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="p-3 hover:bg-opacity-5 cursor-pointer flex justify-between items-center"
                  style={{ 
                    backgroundColor: currentTheme.colors.primary + '10',
                    color: currentTheme.colors.text,
                    borderBottom: `1px solid ${currentTheme.colors.border}`
                  }}
                  onClick={() => addItem(product)}
                >
                  <span>{product.name}</span>
                  <Plus size={20} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2" style={{ color: currentTheme.colors.text }}>
            Selected Items ({draft.items.length})
          </h2>
          <div className="border" style={{ backgroundColor: currentTheme.colors.background }}>
            {draft.items.map((item) => (
              <div
                key={item.id}
                className="p-3 flex justify-between items-center"
                style={{ 
                  borderBottom: `1px solid ${currentTheme.colors.border}`,
                  color: currentTheme.colors.text
                }}
              >
                <span>{item.name}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 hover:bg-opacity-5"
                  style={{ 
                    backgroundColor: currentTheme.colors.error + '10',
                    color: currentTheme.colors.error
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2" style={{ color: currentTheme.colors.text }}>
            Comparison Aspects
          </h2>
          <div className="space-y-4">
            {draft.aspects.map((aspect) => (
              <div
                key={aspect.id}
                className="p-4 border"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium" style={{ color: currentTheme.colors.text }}>{aspect.metric_name}</h3>
                  <button
                    onClick={() => removeAspect(aspect.id)}
                    className="p-1 hover:bg-opacity-5"
                    style={{ 
                      backgroundColor: currentTheme.colors.error + '10',
                      color: currentTheme.colors.error
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm mb-2" style={{ color: currentTheme.colors.textSecondary }}>{aspect.description}</p>
                <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  Weight: {aspect.weight}
                </span>
              </div>
            ))}

            <div className="p-4 border" style={{ 
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.border
            }}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newAspect.metric_name}
                  onChange={(e) => setNewAspect(prev => ({ ...prev, metric_name: e.target.value }))}
                  className="w-full p-3"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text,
                    borderBottom: `1px solid ${currentTheme.colors.border}`
                  }}
                  placeholder="Aspect name"
                />
                <textarea
                  value={newAspect.description}
                  onChange={(e) => setNewAspect(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text,
                    borderBottom: `1px solid ${currentTheme.colors.border}`
                  }}
                  placeholder="Aspect description"
                  rows={2}
                />
                <div className="flex items-center space-x-2">
                  <span style={{ color: currentTheme.colors.text }}>Weight:</span>
                  <input
                    type="number"
                    value={newAspect.weight}
                    onChange={(e) => setNewAspect(prev => ({ ...prev, weight: Number(e.target.value) }))}
                    className="w-20 p-2"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text,
                      borderBottom: `1px solid ${currentTheme.colors.border}`
                    }}
                    min="1"
                    max="10"
                  />
                </div>
                <button
                  onClick={handleAddAspect}
                  className="w-full p-3 font-medium"
                  style={{ 
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.buttonText
                  }}
                >
                  Add Aspect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateComparison; 