import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Pencil, Trash2 } from 'lucide-react';

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
      <div className="w-full flex flex-row justify-between items-center text-sm rounded-full py-2 px-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm" 
        style={{ 
          color: 'whitesmoke', 
          background: `linear-gradient(135deg, ${currentTheme.colors.primary}40, ${currentTheme.colors.primary}80)`,
          border: `1px solid ${currentTheme.colors.primary}30`,
          boxShadow: `0 4px 15px ${currentTheme.colors.primary}20`
        }}>
        <span className="font-medium">{aspect.metric_name}</span>
        <div className="flex flex-row gap-2 items-center">
          <button
            onClick={() => onUpdate(aspect)}
            className="p-2 hover:scale-110 transition-all duration-200 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.error}20, ${currentTheme.colors.error}40)`,
              color: currentTheme.colors.error
            }}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(aspect.id)}
            className="p-2 hover:scale-110 transition-all duration-200 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.error}20, ${currentTheme.colors.error}40)`,
              color: currentTheme.colors.error
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center text-sm rounded-xl py-4 px-4 backdrop-blur-sm animate-fadeIn" 
      style={{ 
        color: 'whitesmoke', 
        background: `linear-gradient(135deg, ${currentTheme.colors.primary}40, ${currentTheme.colors.primary}80)`,
        border: `1px solid ${currentTheme.colors.primary}30`,
        boxShadow: `0 4px 15px ${currentTheme.colors.primary}20`
      }}>
      <div className="flex flex-col space-y-4 w-full">
        <input
          type="text"
          value={aspectData.metric_name}
          onChange={(e) => setAspectData(prev => ({ ...prev, metric_name: e.target.value }))}
          className="w-full p-3 rounded-xl transition-all duration-300 focus:scale-[1.01]"
          style={{
            backgroundColor: `${currentTheme.colors.background}80`,
            color: currentTheme.colors.text,
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
        <div className="flex flex-row gap-3 items-center">
          <button
            onClick={() => onSave(aspect.id)}
            className="flex-1 p-3 font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.primary}80)`,
              color: currentTheme.colors.buttonText,
              boxShadow: `0 4px 15px ${currentTheme.colors.primary}30`
            }}
          >
            {aspect.id ? '✨ Update' : '✨ Add'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 p-3 font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.error}, ${currentTheme.colors.error}80)`,
              color: 'whitesmoke',
              boxShadow: `0 4px 15px ${currentTheme.colors.error}30`
            }}
          >
            ✖️ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AspectForm; 