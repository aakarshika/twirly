// File: src/components/comparison/CustomForm.jsx

import React from 'react';
import { PlusCircle, XCircle } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import Button from '../common/Button';

/**
 * Form for creating custom comparison sets
 */
const CustomForm = () => {
  const { 
    customItems, 
    handleCustomItemChange,
    handleCustomSubmit,
    setCustomMode
  } = useComparison();
  
  // Handle form submission
  const onSubmit = () => {
    const success = handleCustomSubmit();
    if (!success) {
      // Show error message or validation
      alert("Please add at least 2 items to compare");
    }
  };
  
  // Cancel custom mode
  const cancelCustomMode = () => {
    setCustomMode(false);
  };
  
  return (
    <div className="border border-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Your Comparison</h2>
      <p className="text-center mb-6 text-gray-400">Add 2-4 items you want to compare</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customItems.map((item, index) => (
          <div key={index} className="border border-gray-800 p-5 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-400">
                Item Name {index < 2 && <span className="text-red-500">*</span>}
              </label>
              <input 
                type="text" 
                value={item.name}
                onChange={(e) => handleCustomItemChange(index, 'name', e.target.value)}
                placeholder="Enter item name"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-white text-white"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-400">Description</label>
              <textarea 
                value={item.description}
                onChange={(e) => handleCustomItemChange(index, 'description', e.target.value)}
                placeholder="Add a description"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-white text-white"
                rows="2"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2 text-gray-400">Category</label>
              <input 
                type="text" 
                value={item.category}
                onChange={(e) => handleCustomItemChange(index, 'category', e.target.value)}
                placeholder="E.g., Movies, Games, etc."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-white text-white"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={cancelCustomMode}
        >
          Cancel
        </Button>
        
        <Button
          variant="primary"
          onClick={onSubmit}
          leftIcon={<PlusCircle size={16} />}
        >
          Create Comparison
        </Button>
      </div>
    </div>
  );
};

export default CustomForm;