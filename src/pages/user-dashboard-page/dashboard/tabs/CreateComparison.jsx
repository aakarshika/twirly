import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useComparisonDraft } from '../../../../contexts/ComparisonDraftContext';
import { searchProducts, searchCategories } from '../../../../services/products';
import { createComparison, getUnpublishedComparison, updateComparison, getComparison } from '../../../../services/comparisons';
import { X, Check, Search, User, Trash2, Plus, PlusIcon, PlusCircle, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHeader } from '../../../../contexts/HeaderContext';
import VotedCard from '../../../../pages/comparison-aspect-page/ComparisonItemCard/VotedCard';
import AspectForm from './AspectForm';
import ItemCardEditable from '../../../comparison-aspect-page/ComparisonItemCard/ItemCardEditable';

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
    updateAspect,
    updateDraft,
    clearDraft
  } = useComparisonDraft();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');
  const [searchCategoryResults, setSearchCategoryResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [editAspectExpanded, setEditAspectExpanded] = useState(null);
  const [newAspectExpanded, setNewAspectExpanded] = useState(false);
  const [editingAspect, setEditingAspect] = useState({ metric_name: '', description: '', weight: 1, id: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newAspect, setNewAspect] = useState({ metric_name: '', description: '', weight: 1 });
  const [existingComparisonId, setExistingComparisonId] = useState(null);
  const hasLoadedData = useRef(false);

  const { isHeaderVisible } = useHeader();
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
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

  useEffect(() => {
    // Auto-collapse search when more than 2 items are added
    if (draft.items.length > 2) {
      setIsSearchExpanded(false);
    } else {
      setIsSearchExpanded(true);
    }
  }, [draft.items.length]);

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
      navigate('/dashboard/comparisons');
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
      ...newAspect
    });
    setNewAspect({ metric_name: '', description: '', weight: 1 });
    setNewAspectExpanded(false);
  };

  const handleUpdateAspect = (aspectId) => {
    if (!editingAspect.metric_name) {
      setError('Aspect name is required');
      return;
    }
    updateAspect(editingAspect);
    setEditingAspect({ metric_name: '', description: '', weight: 1, id: null });
    setEditAspectExpanded(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4" style={{ backgroundColor: currentTheme.colors.background, paddingTop: isHeaderVisible ? '64px' : '0px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
          Create Comparison
        </h1>
        <div className="flex flex-row space-x-2">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 font-medium border rounded-lg"
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
            className="px-4 py-2 font-medium rounded-lg"
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
        <div className="p-3 mb-4 border-l-4 rounded-lg" style={{
          backgroundColor: currentTheme.colors.error + '10',
          borderColor: currentTheme.colors.error,
          color: currentTheme.colors.error
        }}>
          {error}
        </div>
      )}

      <div className={`shadow-md rounded-md p-4 `}
        style={{ backgroundColor: currentTheme.colors.card }}>

        <div className="space-y-2">
          <div>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              className="w-full p-3 text-md font-bold rounded-lg"
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.primary
              }}
              placeholder="Enter comparison title..."
            />
          </div>
          {draft.aspects.length > 0 && draft.aspects.map((aspect) => (
            <div key={aspect.id}>
              <AspectForm
                aspect={aspect}
                isEditing={editAspectExpanded === aspect.id}
                onUpdate={(aspect) => {
                  setEditAspectExpanded(aspect.id);
                  setEditingAspect(aspect);
                  setNewAspectExpanded(false);
                }}
                onDelete={removeAspect}
                onCancel={() => {
                  setEditAspectExpanded(null);
                  setEditingAspect({ metric_name: '', description: '', weight: 1, id: null });
                }}
                onSave={handleUpdateAspect}
                aspectData={editingAspect}
                setAspectData={setEditingAspect}
              />
            </div>
          ))}
          {!newAspectExpanded && (
            <div className="flex flex-row items-center">
              <button
                onClick={() => {
                  setNewAspectExpanded(true);
                  setEditAspectExpanded(null);
                  setNewAspect({ metric_name: '', description: '', weight: 1 });
                }}
                className="w-full p-2 font-medium rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  color: 'whitesmoke'
                }}
              >
                + Add Aspect
              </button>
            </div>
          )}
          {newAspectExpanded && (
            <AspectForm
              aspect={{ id: null }}
              isEditing={true}
              onUpdate={() => {}}
              onDelete={() => {}}
              onCancel={() => setNewAspectExpanded(false)}
              onSave={handleAddAspect}
              aspectData={newAspect}
              setAspectData={setNewAspect}
            />
          )}

          <div>
            <div className="grid grid-cols-2 gap-2">
              {draft.items.map((item) => (
                <div key={item.id} className="relative">
                  <VotedCard item={item} newHeight="250px" />
                  <div className="absolute top-2 right-2 z-100 flex space-x-2">
                    {user && item.user_id === user.id && (
                      <button
                        onClick={() => console.log("edit item", item)}
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: currentTheme.colors.primary + '10',
                          color: currentTheme.colors.primary
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: currentTheme.colors.error + '10',
                        color: currentTheme.colors.error
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex flex-row rounded-lg items-center justify-center" style={{ backgroundColor: currentTheme.colors.background, height: '250px' }}>
                <button
                  onClick={() => {
                    //focus on the input
                    setIsSearchExpanded(true);

                  }}
                  style={{  color: currentTheme.colors.buttonText }}
                >
                  +
                  </button>
              </div>
            </div>
          </div>

          {isSearchExpanded ? (
            <div className="relative mb-4">
              <input
                id="item-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
                placeholder="Search items to compare..."
              />
              <Search className="absolute left-3 top-3.5" size={20} style={{ color: currentTheme.colors.textSecondary }} />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }}
                className="absolute right-3 top-3.5 p-1 rounded-full hover:bg-opacity-10"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.textSecondary
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="mb-4 p-3 rounded-lg flex items-center gap-2"
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <Search size={20} />
              <span>Add more items...</span>
            </button>
          )}

          <div>

            {searchResults.length > 0 && (
              <div className="mt-1 border rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                {searchResults.map((product) =>{
                  console.log("result product", product);
                  return (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-opacity-5 cursor-pointer flex justify-between items-center"
                    style={{
                      backgroundColor: product.item_color_string,
                      color: currentTheme.colors.text,
                      borderBottom: `1px solid ${currentTheme.colors.border}`
                    }}
                    onClick={() => {
                      console.log("added product", product);
                      addItem(product);
                      setSearchQuery('');
                    }}
                  >
                    {product.image_url && product.image_url != '' && (<img src={product.image_url} className="w-10 h-10 rounded" onError={(e) => {
                      e.target.src = '/images/default-product-image.png';
                    }} />)}
                    {!product.image_url && product.image_url != '' && (<img src={'/images/default-product-image.png'} className="w-10 h-10 rounded" />)}
                    <div className="flex w-full ml-2 flex-col align-left"
                      style={{ color: currentTheme.colors.text }}>
                      <p className="text-sm">{product.name}</p>
                      <p className="text-xs">{product.description}</p></div>
                    <Plus size={20} />
                  </div>
                )})}
              </div>
            )}
            {isSearchExpanded && searchQuery.length > 0 && searchResults.length === 0 && !addItemModalOpen && (
              <div className="flex flex-row items-center gap-2 mt-1 border rounded-lg p-3" style={{ backgroundColor: currentTheme.colors.background }}>
                <p className="text-sm">No results found</p>
                <button
                  onClick={() => {
                    //focus on the input
                    setAddItemModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.buttonText }}
                >
                  + Create 
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {addItemModalOpen && (
        <ItemCardEditable
          item={{
            name: searchQuery
          }}
          onSave={(item) => {
            console.log("saved item", item);
            addItem(item);
            setAddItemModalOpen(false);
          }}
          onCancel={() => setAddItemModalOpen(false)}
        />
      )}
      {/* {editItemModalOpen && (
        <ItemCardEditable
          item={editItem}
          onSave={(item) => {
            console.log("saved item", item);
            setEditItemModalOpen(false);
          }}
          onCancel={() => setEditItemModalOpen(false)}
        />
      )} */}
    </div>
  );
};

export default CreateComparison; 