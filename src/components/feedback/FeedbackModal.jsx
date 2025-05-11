import React, { useState, useEffect } from 'react';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { feedbackService } from '../../services/feedbackService';

const FeedbackModal = () => {
  const { isFeedbackModalOpen, closeFeedbackModal } = useFeedback();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: 'suggestion',
    priority: 'medium',
    message: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Autofill name: user email if authenticated, else 'Anonymous'
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, name: user.email }));
    } else {
      setFormData(prev => ({ ...prev, name: 'Anonymous' }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await feedbackService.submitFeedback(formData);
      closeFeedbackModal();
      setFormData({
        name: user?.email || 'Anonymous',
        type: 'suggestion',
        priority: 'medium',
        message: '',
        image: null
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClose = () => {
    closeFeedbackModal();
    setFormData({
      name: user?.email || 'Anonymous',
      type: 'suggestion',
      priority: 'medium',
      message: '',
      image: null
    });
    setPreviewUrl(null);
  };

  if (!isFeedbackModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md my-8"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
          Send Feedback
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
              required
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
            >
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Screenshot (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 rounded border"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text
              }}
            />
            {previewUrl && (
              <div className="mt-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.secondary,
                color: currentTheme.colors.text
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.background
              }}
            >
              {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal; 