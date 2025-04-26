import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Check, AlertCircle } from 'lucide-react';

const CreateComparisonModal = ({ isOpen, onClose, onSubmit, products }) => {
  const { currentTheme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedItems: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.selectedItems.length < 2) {
      setError('Please select at least 2 products');
      return;
    }

    if (formData.selectedItems.length > 4) {
      setError('You can select at most 4 products');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to create comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (productId) => {
    setFormData(prev => {
      const isSelected = prev.selectedItems.includes(productId);
      if (isSelected) {
        return {
          ...prev,
          selectedItems: prev.selectedItems.filter(id => id !== productId)
        };
      } else {
        if (prev.selectedItems.length >= 4) {
          setError('You can select at most 4 products');
          return prev;
        }
        return {
          ...prev,
          selectedItems: [...prev.selectedItems, productId]
        };
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-lg p-6"
        style={{ backgroundColor: currentTheme.colors.cardBackground }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Create New Comparison
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div 
            className="mb-4 p-3 rounded-lg flex items-center space-x-2"
            style={{ 
              backgroundColor: currentTheme.colors.error + '20',
              color: currentTheme.colors.error
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: currentTheme.colors.text }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>
              Search Products
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded"
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text }}
            >
              Select Products (2-4) *
            </label>
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {products
                  .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleItemSelect(product.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.selectedItems.includes(product.id) ? 'ring-2' : ''
                      }`}
                      style={{ 
                        backgroundColor: currentTheme.colors.background,
                        border: `1px solid ${currentTheme.colors.border}`,
                        ...(formData.selectedItems.includes(product.id) && {
                          borderColor: currentTheme.colors.primary,
                          backgroundColor: currentTheme.colors.primary + '10'
                        })
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-sm font-medium truncate"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {product.name}
                          </p>
                          {product.price && (
                            <p 
                              className="text-xs"
                              style={{ color: currentTheme.colors.textSecondary }}
                            >
                              ${product.price}
                            </p>
                          )}
                        </div>
                        {formData.selectedItems.includes(product.id) && (
                          <div 
                            className="p-1 rounded-full"
                            style={{ backgroundColor: currentTheme.colors.primary }}
                          >
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
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
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.buttonText,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Check size={16} />
              )}
              <span>Create Comparison</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComparisonModal; 