import React from 'react';
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

  if (!isEditing) {
    return (
      <div className="flex justify-between items-center text-sm text-gray-500 rounded-full py-1 px-2" 
        style={{ color: 'whitesmoke', backgroundColor: currentTheme.colors.primary }}>
        {aspect.metric_name}
        <div className="flex-row items-center">
          <button
            onClick={() => onUpdate(aspect)}
            className="p-1 hover:bg-opacity-5 rounded-full"
            style={{
              backgroundColor: currentTheme.colors.error + '10',
              color: currentTheme.colors.error
            }}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(aspect.id)}
            className="p-1 hover:bg-opacity-5 rounded-full"
            style={{
              backgroundColor: currentTheme.colors.error + '10',
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
    <div className="flex justify-between items-center text-sm text-gray-500 rounded-lg py-1 px-2" 
      style={{ color: 'whitesmoke', backgroundColor: currentTheme.colors.primary }}>
      <div className="space-y-3">
        <input
          type="text"
          value={aspectData.metric_name}
          onChange={(e) => setAspectData(prev => ({ ...prev, metric_name: e.target.value }))}
          className="w-full p-2 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            color: currentTheme.colors.text,
            border: `1px solid ${currentTheme.colors.border}`
          }}
          placeholder="Aspect name"
        />
        <textarea
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
        />
        <button
          onClick={() => onSave(aspect.id)}
          className="w-full p-2 font-medium rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.buttonText
          }}
        >
          {aspect.id ? 'Update Aspect' : 'Add Aspect'}
        </button>
        <button
          onClick={onCancel}
          className="w-full bg-gray-500 p-2 font-medium rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.error,
            color: 'whitesmoke'
          }}
        >
          X Cancel
        </button>
      </div>
    </div>
  );
};

export default AspectForm; 