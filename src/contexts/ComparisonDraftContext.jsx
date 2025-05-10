import React, { createContext, useContext, useState } from 'react';

const ComparisonDraftContext = createContext();

export const useComparisonDraft = () => {
  const context = useContext(ComparisonDraftContext);
  if (!context) {
    throw new Error('useComparisonDraft must be used within a ComparisonDraftProvider');
  }
  return context;
};

export const ComparisonDraftProvider = ({ children }) => {
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    category_id: null,
    items: [],
    aspects: [],
    isPublished: false
  });

  const addItem = (item) => {
    if (!draft.items.find(i => i.id === item.id)) {
      setDraft(prev => ({
        ...prev,
        items: [...prev.items, item]
      }));
    }
  };

  const addCategory = (category) => {
    setDraft(prev => ({
      ...prev,
      category_id: category.id
    }));
  };

  const removeItem = (itemId) => {
    setDraft(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const addAspect = (aspect) => {
    setDraft(prev => ({
      ...prev,
      aspects: [...prev.aspects, aspect]
    }));
  };

  const removeAspect = (aspectId) => {
    setDraft(prev => ({
      ...prev,
      aspects: prev.aspects.filter(aspect => aspect.id !== aspectId)
    }));
  };

  const updateDraft = (updates) => {
    setDraft(prev => ({
      ...prev,
      ...updates
    }));
  };

  const clearDraft = () => {
    setDraft({
      title: '',
      description: '',
      category_id: null,
      items: [],
      aspects: [],
      isPublished: false
    });
  };

  const value = {
    draft,
    addItem,
    addCategory,
    removeItem,
    addAspect,
    removeAspect,
    updateDraft,
    clearDraft
  };

  return (
    <ComparisonDraftContext.Provider value={value}>
      {children}
    </ComparisonDraftContext.Provider>
  );
}; 