import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getUserProducts, searchProducts } from '../../../services/products';
import { createComparisonSet } from '../../../services/comparisons';
import { TEMP_USER_ID } from '../../../lib/constants';
import { X, Check, Search, User, Trash2 } from 'lucide-react';

const CreateComparison = ({ isOpen, onClose, onSuccess }) => {
  const { currentTheme } = useTheme();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getUserProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      // If product is already selected, remove it
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      // If less than 4 products are selected, add the new one
      if (prev.length < 4) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length < 2) {
      setError('Please select at least 2 products');
      return;
    }

    try {
      setLoading(true);
      const comparisonData = {
        name: `Comparison of ${selectedProducts.map(p => p.name).join(', ')}`,
        user_id: TEMP_USER_ID,
        items: selectedProducts.map(p => p.id)
      };

      await createComparisonSet(comparisonData);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl rounded-lg p-6"
        style={{ 
          backgroundColor: currentTheme.colors.card,
          color: currentTheme.colors.text
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New Comparison</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-red-500" style={{ backgroundColor: currentTheme.colors.error + '20' }}>
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Selected Products ({selectedProducts.length}/4)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-start space-x-4 p-4 rounded-lg relative"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  <img
                    src={product.image_url || 'https://via.placeholder.com/80'}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-lg">{product.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <User size={12} style={{ color: currentTheme.colors.textSecondary }} />
                          <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                            {product.user_id === TEMP_USER_ID ? 'You' : `User ${product.user_id}`}
                          </span>
                          {product.user_id === TEMP_USER_ID && (
                            <span 
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ 
                                backgroundColor: currentTheme.colors.primary + '20',
                                color: currentTheme.colors.primary
                              }}
                            >
                              Your Product
                            </span>
                          )}
                        </div>
                        {product.price && (
                          <p className="text-sm mt-2" style={{ color: currentTheme.colors.textSecondary }}>
                            ${product.price}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectProduct(product)}
                        className="p-1 rounded-full hover:bg-gray-100"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.colors.primary }}></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center p-4 text-gray-500">No products found</div>
          ) : (
            searchResults.map(product => (
              <div
                key={product.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  selectedProducts.some(p => p.id === product.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectProduct(product)}
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/40'}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/40';
                    }}
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <User size={12} style={{ color: currentTheme.colors.textSecondary }} />
                      <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                        {product.user_id === TEMP_USER_ID ? 'You' : `User ${product.user_id}`}
                      </span>
                      {product.user_id === TEMP_USER_ID && (
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: currentTheme.colors.primary + '20',
                            color: currentTheme.colors.primary
                          }}
                        >
                          Your Product
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {selectedProducts.some(p => p.id === product.id) && (
                  <Check size={20} style={{ color: currentTheme.colors.primary }} />
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.text
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedProducts.length < 2 || loading}
            className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            style={{ 
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.buttonText
            }}
          >
            {loading ? 'Creating...' : 'Create Comparison'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateComparison; 