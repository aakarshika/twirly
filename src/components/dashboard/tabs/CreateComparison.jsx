import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getUserProducts, searchProducts } from '../../../services/products';
import { createComparison } from '../../../services/comparisons';
import { useAuth } from '../../../contexts/AuthContext';
import { X, Check, Search, User, Trash2 } from 'lucide-react';

const CreateComparison = ({ onClose, onSuccess }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setError('You must be logged in to create a comparison');
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getUserProducts(user.id);
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
    if (!user) {
      setError('You must be logged in to create a comparison');
      return;
    }

    if (selectedProducts.length < 2) {
      setError('Please select at least 2 products');
      return;
    }

    try {
      setLoading(true);
      const comparisonData = {
        name: `Comparison of ${selectedProducts.map(p => p.name).join(', ')}`,
        categoryId: null, // You can add category selection if needed
        items: selectedProducts
      };

      await createComparison(comparisonData, user.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
        style={{ backgroundColor: currentTheme.colors.background }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Create New Comparison
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div 
            className="mb-4 p-3 rounded-lg"
            style={{ 
              backgroundColor: currentTheme.colors.error + '20',
              color: currentTheme.colors.error
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
            />
            <Search 
              size={20} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: currentTheme.colors.textSecondary }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-4 rounded-lg cursor-pointer ${
                    selectedProducts.some(p => p.id === product.id) ? 'ring-2' : ''
                  }`}
                  style={{ 
                    backgroundColor: currentTheme.colors.card,
                    border: `1px solid ${currentTheme.colors.border}`,
                    color: currentTheme.colors.text,
                    ...(selectedProducts.some(p => p.id === product.id) && {
                      ringColor: currentTheme.colors.primary
                    })
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p 
                        className="text-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {product.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-4 rounded-lg cursor-pointer ${
                    selectedProducts.some(p => p.id === product.id) ? 'ring-2' : ''
                  }`}
                  style={{ 
                    backgroundColor: currentTheme.colors.card,
                    border: `1px solid ${currentTheme.colors.border}`,
                    color: currentTheme.colors.text,
                    ...(selectedProducts.some(p => p.id === product.id) && {
                      ringColor: currentTheme.colors.primary
                    })
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p 
                        className="text-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {product.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: currentTheme.colors.card,
                color: currentTheme.colors.text
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedProducts.length < 2}
              className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.buttonText,
                opacity: loading || selectedProducts.length < 2 ? 0.5 : 1
              }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: currentTheme.colors.buttonText }}></div>
              ) : (
                <>
                  <Check size={16} />
                  <span>Create Comparison</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComparison; 