import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiImage, FiTrash2, FiExternalLink } from 'react-icons/fi';

const ADMIN_EMAILS = ['aakarshika93@gmail.com', 'great.shivam19@gmail.com'];

const FeedbackManagement = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [selectedPageRoute, setSelectedPageRoute] = useState('all');

  // Get base URL from current window location
  const baseUrl = window.location.origin;

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

  const toggleMessage = (id) => {
    setExpandedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openDeleteModal = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setFeedbackToDelete(null);
  };

  const handleDelete = async () => {
    if (!feedbackToDelete) return;
    
    try {
      await feedbackService.deleteFeedback(feedbackToDelete.id);
      setFeedbackList(prev => prev.filter(item => item.id !== feedbackToDelete.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  // Get unique page routes for filtering
  const pageRoutes = ['all', ...new Set(feedbackList.map(f => f.page_route).filter(Boolean))];

  // Filter feedback based on selected page route
  const filteredFeedback = selectedPageRoute === 'all' 
    ? feedbackList 
    : feedbackList.filter(f => f.page_route === selectedPageRoute);

  // Separate resolved and unresolved feedback
  const resolvedFeedback = filteredFeedback.filter(f => f.status === 'resolved' || f.status === 'closed');
  const unresolvedFeedback = filteredFeedback.filter(f => f.status !== 'resolved' && f.status !== 'closed');

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handlePageRouteClick = (route) => {
    // Open in new tab
    window.open(route, '_blank', 'noopener,noreferrer');
  };

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

  const renderFeedbackTable = (feedback) => (
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left">Type</th>
          <th className="px-4 py-2 text-left">Priority</th>
          <th className="px-4 py-2 text-left w-1/3">Message</th>
          <th className="px-4 py-2 text-left">Image</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2 text-left">Page</th>
          <th className="px-4 py-2 text-left">Date</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {feedback.map((item) => (
          <tr key={item.id} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2">{item.name}</td>
            <td className="px-4 py-2 capitalize">{item.type}</td>
            <td className="px-4 py-2 capitalize">
              <div className='flex items-center gap-2 rounded-full px-2 py-1' style={{ backgroundColor: item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f59e0b' : '#34d399' }}>
                {item.priority}
              </div>
            </td>
            <td className="px-4 py-2">
              <div className="max-w-md">
                <p className={!expandedMessages[item.id] ? "line-clamp-2" : ""}>
                  {item.message}
                </p>
                {item.message.length > 100 && (
                  <button
                    onClick={() => toggleMessage(item.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                  >
                    {expandedMessages[item.id] ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </td>
            <td className="px-4 py-2">
              {item.image_url ? (
                <a
                  href={item.image_url}
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
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value)}
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
            <td className="px-4 py-2 text-sm text-gray-600">
              {item.page_route ? (
                <button
                  onClick={() => handlePageRouteClick(item.page_route)}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                  title={`Open ${item.page_route} in new tab`}
                >
                  {item.page_route}
                  <FiExternalLink className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </td>
            <td className="px-4 py-2 text-xs text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </td>
            <td className="px-4 py-2">
              <button
                onClick={() => openDeleteModal(item)}
                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                title="Delete feedback"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
          Feedback Management
        </h1>
        <select
          value={selectedPageRoute}
          onChange={(e) => setSelectedPageRoute(e.target.value)}
          className="p-2 rounded border"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text,
          }}
        >
          {pageRoutes.map(route => (
            <option key={route} value={route}>
              {route === 'all' ? 'All Pages' : route}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-8">
        {/* Unresolved Feedback Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Unresolved Feedback ({unresolvedFeedback.length})
          </h2>
          <div className="overflow-x-auto">
            {renderFeedbackTable(unresolvedFeedback)}
          </div>
        </div>

        {/* Resolved Feedback Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Resolved Feedback ({resolvedFeedback.length})
          </h2>
          <div className="overflow-x-auto">
            {renderFeedbackTable(resolvedFeedback)}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: currentTheme.colors.background }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
              Delete Feedback
            </h3>
            <p className="mb-6" style={{ color: currentTheme.colors.text }}>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded"
                style={{ 
                  backgroundColor: currentTheme.colors.secondary,
                  color: currentTheme.colors.text
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#ef4444' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement; 