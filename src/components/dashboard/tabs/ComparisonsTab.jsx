import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Plus, Trash2, ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import { getUserComparisonSets, deleteComparisonSet } from '../../../services/comparisons';
import { TEMP_USER_ID } from '../../../lib/constants';
import ComparisonCard from './ComparisonCard';
import CreateComparison from './CreateComparison';

const ComparisonsTab = () => {
  const { currentTheme } = useTheme();
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchComparisons();
  }, []);

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const data = await getUserComparisonSets();
      setComparisons(data);
    } catch (err) {
      setError('Failed to fetch comparisons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (setId) => {
    if (!window.confirm('Are you sure you want to delete this comparison?')) return;

    try {
      await deleteComparisonSet(setId);
      await fetchComparisons();
    } catch (err) {
      setError('Failed to delete comparison');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.colors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.error + '20', color: currentTheme.colors.error }}>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
          My Comparisons
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.buttonText
          }}
        >
          <Plus size={16} />
          <span>Create Comparison</span>
        </button>
      </div>

      {comparisons.length === 0 ? (
        <div 
          className="p-8 text-center rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.cardBackground,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <p style={{ color: currentTheme.colors.textSecondary }}>
            You haven't created any comparisons yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((comparison) => (
            <ComparisonCard 
              key={comparison.id} 
              comparison={comparison}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateComparison
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchComparisons}
      />
    </div>
  );
};

export default ComparisonsTab; 