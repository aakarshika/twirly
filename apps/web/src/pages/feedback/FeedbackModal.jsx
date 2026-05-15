import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { feedbackService } from '../../services/feedbackService';
import Modal from '@components/common/Modal';

const INITIAL_FORM = {
  name: '',
  type: 'suggestion',
  priority: 'medium',
  message: '',
  image: null,
};

const FeedbackModal = () => {
  const { isFeedbackModalOpen, closeFeedbackModal } = useFeedback();
  const { themeId } = useTheme();
  const t = themes[themeId];
  const { user } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    setFormData(prev => ({ ...prev, name: user?.email ?? 'Anonymous' }));
  }, [user]);

  const reset = () => {
    setFormData({ ...INITIAL_FORM, name: user?.email ?? 'Anonymous' });
    setPreviewUrl(null);
  };

  const handleClose = () => {
    closeFeedbackModal();
    reset();
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackService.submitFeedback(formData);
      handleClose();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const field = {
    width: '100%',
    padding: '8px 12px',
    background: t.bgDeep,
    border: `1.5px solid ${t.ink}25`,
    borderRadius: 6,
    color: t.ink,
    fontFamily: '"Fraunces", serif',
    fontSize: 14,
    outline: 'none',
  };

  const label = {
    display: 'block',
    fontFamily: '"Fraunces", serif',
    fontSize: 11,
    color: t.ink,
    opacity: 0.55,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  };

  return (
    <Modal isOpen={isFeedbackModalOpen} onClose={handleClose} title="Send feedback" size="md">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={label}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={field}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={label}>Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                style={field}
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={label}>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                style={field}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label style={label}>Message</label>
            <textarea
              value={formData.message}
              onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
              style={{ ...field, resize: 'vertical' }}
              rows={4}
              required
            />
          </div>

          <div>
            <label style={label}>Screenshot (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={field}
            />
            {previewUrl && (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={previewUrl}
                alt="Preview"
                style={{
                  marginTop: 8,
                  width: 88,
                  height: 88,
                  objectFit: 'cover',
                  borderRadius: 6,
                  border: `1.5px solid ${t.ink}20`,
                }}
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                border: `1.5px solid ${t.ink}30`,
                borderRadius: 6,
                fontFamily: '"Fraunces", serif',
                fontSize: 14,
                color: t.ink,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 20px',
                background: t.ink,
                border: 'none',
                borderRadius: 6,
                fontFamily: '"Fraunces", serif',
                fontSize: 14,
                color: t.bg,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.65 : 1,
              }}
            >
              {submitting ? 'Sending…' : 'Send feedback'}
            </button>
          </div>

        </div>
      </form>
    </Modal>
  );
};

export default FeedbackModal;
