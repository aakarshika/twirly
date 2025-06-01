import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
const ComparisonDraftContext = createContext();

export const useComparisonDraft = () => {
  const context = useContext(ComparisonDraftContext);
  if (!context) {
    throw new Error('useComparisonDraft must be used within a ComparisonDraftProvider');
  }
  return context;
};

export const ComparisonDraftProvider = ({ children }) => {
  const { user } = useAuth();
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    category_id: null,
    items: [],
    aspects: [],
    isPublished: false
  });

  const updateItem = (item) => {
    item.user_id = user.id;
    setDraft(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === item.id ? item : i)
    }));
  };

  const addItem = (item) => {
    console.log(item);
    if (!draft.items.find(i => i.id === item.id)) {
      setDraft(prev => ({
        ...prev,
        items: [...prev.items, item]
      }));
    }
    console.log(draft.items);
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

  const updateAspect = (aspect) => {
    setDraft(prev => ({
      ...prev,
      aspects: prev.aspects.map(a => a.id === aspect.id ? aspect : a)
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
    updateItem,
    updateDraft,
    clearDraft,
    updateAspect
  };

  return (
    <ComparisonDraftContext.Provider value={value}>
      {children}
    </ComparisonDraftContext.Provider>
  );
}; 