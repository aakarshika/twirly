import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useComparisonDraft } from '../../../../contexts/ComparisonDraftContext';
import { searchProducts, searchCategories } from '../../../../services/products';
import { createComparison, getUnpublishedComparison, updateComparison, getComparison } from '../../../../services/comparisons';
import { X, Check, Search, User, Trash2, Plus, PlusIcon, PlusCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHeader } from '../../../../contexts/HeaderContext';
import ItemCard from '../../../../components/common-cards/ItemCard';

const CreateComparison = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    draft, 
    addItem, 
    addCategory,
    removeItem, 
    addAspect, 
    removeAspect, 
    updateDraft, 
    clearDraft 
  } = useComparisonDraft();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');
  const [searchCategoryResults, setSearchCategoryResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newAspect, setNewAspect] = useState({ metric_name: '', description: '', weight: 1 });
  const [existingComparisonId, setExistingComparisonId] = useState(null);
  const hasLoadedData = useRef(false);
  
  const { isHeaderVisible } = useHeader();

  useEffect(() => {
    const loadComparisonData = async () => {
      if (!user || hasLoadedData.current) return;

      try {
        setLoading(true);
        let comparisonData;

        if (id) {
          // Load existing comparison for editing
          comparisonData = await getComparison(id, user.id);
          console.log(comparisonData, 'comparisonData', id);
          setExistingComparisonId(id);
        } else {
          // Load unpublished comparison for new creation
          comparisonData = await getUnpublishedComparison(user.id);
          if (comparisonData) {
            setExistingComparisonId(comparisonData.id);
          }
        }
        console.log(comparisonData, 'comparisonData', id);
        if (comparisonData) {
          // Transform the data to match the draft format
          updateDraft({
            title: comparisonData.name,
            description: comparisonData.description,
            category_id: comparisonData.category_id,
            items: comparisonData.comparison_set_items.map(item => item.items),
            aspects: comparisonData.comparison_set_aspects.map(aspect => ({
              id: aspect.id,
              metric_name: aspect.metric_name,
              description: aspect.description,
              weight: aspect.weight || 1
            })),
            isPublished: comparisonData.isPublished || false
          });
        }
        hasLoadedData.current = true;
      } catch (err) {
        setError('Failed to load comparison data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [user, id]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      if (searchCategoryQuery.length < 1) {
        setSearchCategoryResults([]);
        return;
      }

      try {
        setLoading(true);
        const results = await searchCategories(searchCategoryQuery);
        setSearchCategoryResults(results);
      } catch (err) {
        setError('Failed to search categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCategories, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchCategoryQuery]);

  const handleSaveDraft = async () => {
    if (!validateDraft()) return;

    try {
      setLoading(true);
      if (existingComparisonId) {
        await updateComparison(existingComparisonId, {
          ...draft,
          user_id: user.id,
          isPublished: false,
          items: draft.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            image_url: item.image_url,
            item_color_string: item.item_color_string
          }))
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
          isPublished: true,
          items: draft.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            image_url: item.image_url,
            item_color_string: item.item_color_string
          }))
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
    <div className="max-w-4xl mx-auto p-4" style={{ backgroundColor: currentTheme.colors.card, paddingTop: isHeaderVisible ? '64px' : '0px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
          Describe your set
        </h1>
        <div className="flex flex-row space-x-2">
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

        {/* <div>
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
        </div> */}

        <div>
          <div className="relative">
            <input
              type="text"
              value={searchCategoryQuery}
              onChange={(e) => setSearchCategoryQuery(e.target.value)}
              className="w-full p-3 pl-10"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                borderBottom: `1px solid ${currentTheme.colors.border}`
              }}
              placeholder="Add category tags..."
            />
            <PlusCircle className="absolute left-3 top-3.5" size={20} style={{ color: currentTheme.colors.textSecondary }} />
          </div>
          {searchCategoryResults.length > 0 && (
            <div className="border w-auto"
             style={{ backgroundColor: currentTheme.colors.background }}
             onClick={() => {
              addCategory(searchCategoryResults);
              setSearchCategoryQuery('');
             }}
             >
              {searchCategoryResults.map((category) => (
                <div key={category.id} className="p-3 hover:bg-opacity-5 cursor-pointer flex-row items-center">
                  <div className=" items-start">
                    <p className="text-sm">{category.name}</p>
                  </div>
                  <Plus size={20} />
                </div>
              ))}
            </div>
          )}
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
              placeholder="Search items..."
            />
            <Search className="absolute left-3 top-3.5" size={20} style={{ color: currentTheme.colors.textSecondary }} />
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
                    onClick={() => {
                      addItem(product);
                      setSearchQuery('');
                    }}
                  >
                    {product.image_url && product.image_url != '' && (<img src={product.image_url} className="w-10 h-10 rounded" onError={(e) => {
                      e.target.src = '/images/default-product-image.png';
                    }} />)}
                    {!product.image_url && product.image_url != '' && (<img src={'/images/default-product-image.png'}  className="w-10 h-10 rounded" />)}
                    <div className="flex w-full ml-2 flex-col align-left" style={{ color: currentTheme.colors.text }}>
                      <p className="text-sm">{product.name}</p>
                      <p className="text-xs">{product.description}</p></div>
                    <Plus size={20} />
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

        <div>
          <div className={`grid ${
          draft.items.length === 1 ? 'grid-cols-1' :
          draft.items.length === 2 ? 'grid-cols-2' :
          draft.items.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 rounded-lg gap-2 p-2'
        }`} 
        style={{
          backgroundColor: currentTheme.colors.background,
          border: `1px solid ${currentTheme.colors.border}`,
          borderRadius: '10px'
        }}
        >
            {draft.items.map((item) => (
              <div
                key={item.id}
                className="items-center relative w-full h-full"
              >
                <ItemCard item={item} />
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded-full bg-white-50 absolute top-2 right-2 z-10"
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