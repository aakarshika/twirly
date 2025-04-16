import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import { Plus, X } from 'lucide-react';

const ComparisonSetMetricsForm = ({ setId, onComplete }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([{ name: '', description: '' }]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddMetric = () => {
    setMetrics([...metrics, { name: '', description: '' }]);
  };

  const handleRemoveMetric = (index) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleMetricChange = (index, field, value) => {
    const updatedMetrics = [...metrics];
    updatedMetrics[index] = {
      ...updatedMetrics[index],
      [field]: value
    };
    setMetrics(updatedMetrics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate metrics
      const validMetrics = metrics.filter(metric => metric.name.trim());
      if (validMetrics.length === 0) {
        throw new Error('Please add at least one metric');
      }

      // Insert metrics
      const metricsToInsert = validMetrics.map(metric => ({
        set_id: setId,
        metric_name: metric.name.trim(),
        description: metric.description.trim() || null
      }));

      const { error: insertError } = await supabase
        .from('comparison_set_aspects')
        .insert(metricsToInsert);

      if (insertError) throw insertError;

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Add Comparison Metrics</h3>
        <p className="text-sm text-gray-400">
          Define the aspects that users will rate for each item in this comparison set.
        </p>

        {error && (
          <div className="p-3 bg-red-900/50 text-red-200 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={metric.name}
                  onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                  placeholder="Metric name (e.g., Quality, Price, Design)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
                <input
                  type="text"
                  value={metric.description}
                  onChange={(e) => handleMetricChange(index, 'description', e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMetric(index)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddMetric}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <Plus size={16} />
          Add Another Metric
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={loading || metrics.every(m => !m.name.trim())}
          className="px-6"
        >
          {loading ? 'Saving...' : 'Save Metrics'}
        </Button>
      </div>
    </form>
  );
};

export default ComparisonSetMetricsForm; 