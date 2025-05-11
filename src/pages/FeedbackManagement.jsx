import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { FiImage } from 'react-icons/fi';

const ADMIN_EMAILS = ['aakarshika93@gmail.com', 'great.shivam19@gmail.com'];

const FeedbackManagement = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (isAdmin) {
      loadFeedback();
    }
  }, [isAdmin]);

  const loadFeedback = async () => {
    try {
      const data = await feedbackService.getFeedbackList();
      setFeedbackList(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await feedbackService.updateFeedbackStatus(id, newStatus);
      setFeedbackList(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: currentTheme.colors.text }}>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: currentTheme.colors.background }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text }}>
        Feedback Management
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Message</th>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.map((feedback) => (
              <tr key={feedback.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{feedback.name}</td>
                <td className="px-4 py-2 capitalize">{feedback.type}</td>
                <td className="px-4 py-2 capitalize">{feedback.priority}</td>
                <td className="px-4 py-2 max-w-xs truncate" title={feedback.message}>{feedback.message}</td>
                <td className="px-4 py-2">
                  {feedback.image_url ? (
                    <a
                      href={feedback.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FiImage /> View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={feedback.status}
                    onChange={(e) => handleStatusChange(feedback.id, e.target.value)}
                    className="p-1 rounded border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {new Date(feedback.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackManagement; 