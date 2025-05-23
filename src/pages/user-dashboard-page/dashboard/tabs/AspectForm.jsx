import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Check, Pencil, Trash2, X } from 'lucide-react';

const AspectForm = ({ 
  aspect, 
  isEditing, 
  onUpdate, 
  onDelete, 
  onCancel, 
  onSave, 
  aspectData, 
  setAspectData 
}) => {
  const { currentTheme } = useTheme();
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  const placeholders = [
    "✨ how bright the screen is",
    "🎯 how fast the processor is",
    "📊 how much memory it has",
    "if it has a good camera",
    "how much storage it has",
    "🎨 can you play games on it",
    "the price",
    "your favorite feature",
    "your heart's desire",
    "what you've been dreaming of",
    "what you've been wishing for",
    
  ];

  useEffect(() => {
    if (isEditing) {
      const interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isEditing]);

  if (!isEditing) {
    return (
      <div className="w-full flex flex-row justify-between items-center text-sm rounded-md py-1 px-2 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm" 
        style={{ 
          color: 'whitesmoke', 

          background: `${currentTheme.colors.secondary}90`,          border: `1px solid ${currentTheme.colors.primary}30`,
          boxShadow: `0 4px 15px ${currentTheme.colors.primary}20`
        }}>
        <span className="font-medium">{aspect.metric_name}</span>
        <div className="flex flex-row gap-2 items-center">
          <button
            onClick={() => onDelete(aspect.id)}
            className="p-2 hover:scale-110 transition-all duration-200 rounded-full"
            style={{
              background: `${currentTheme.colors.secondary}90`,
              color: 'whitesmoke'
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center text-sm rounded-md py-1 px-1 backdrop-blur-sm animate-fadeIn" 
      style={{ 
        color: 'black', 
        background: `${currentTheme.colors.secondary}90`,
        border: `1px solid ${currentTheme.colors.secondary}30`,
        boxShadow: `0 4px 15px ${currentTheme.colors.primary}20`
      }}>
      <div className="flex flex-row w-full">
        <input
          type="text"
          autoFocus
          value={aspectData.metric_name}
          onChange={(e) => setAspectData(prev => ({ ...prev, metric_name: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(aspect.id);
            }
          }}
          className="w-full p-1 rounded-lg transition-all duration-300 focus:scale-[1.01]"
          style={{
            backgroundColor: `${currentTheme.colors.background}80`,
            color: 'whitesmoke',
            border: `1px solid ${currentTheme.colors.border}50`,
            backdropFilter: 'blur(10px)'
          }}
          placeholder={placeholders[currentPlaceholder]}
        />
        {/* <textarea
          value={aspectData.description}
          onChange={(e) => setAspectData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            color: currentTheme.colors.text,
            border: `1px solid ${currentTheme.colors.border}`
          }}
          placeholder="Aspect description"
          rows={2}
        /> */}
        <div className="flex flex-row items-center">
          <button
            onClick={() => onSave(aspect.id)}
            className="flex-1 p-1 font-medium "
            style={{
              color: currentTheme.colors.buttonText,
            }}
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AspectForm; 