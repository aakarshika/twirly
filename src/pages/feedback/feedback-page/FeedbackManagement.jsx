import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { feedbackService } from '../../../services/feedbackService';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiImage, FiTrash2, FiExternalLink, FiEdit2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';

const ADMIN_EMAILS = ['aakarshika93@gmail.com', 'great.shivam19@gmail.com'];

const FeedbackManagement = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [feedbackToEdit, setFeedbackToEdit] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
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

  const handleEdit = async (updatedFeedback) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .update({
          name: updatedFeedback.name,
          type: updatedFeedback.type,
          priority: updatedFeedback.priority,
          message: updatedFeedback.message,
          status: updatedFeedback.status,
          page_route: updatedFeedback.page_route,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedFeedback.id);

      if (error) throw error;

      setFeedbackList(prev => 
        prev.map(item => 
          item.id === updatedFeedback.id ? { ...item, ...updatedFeedback } : item
        )
      );
      setEditModalOpen(false);
      setFeedbackToEdit(null);
    } catch (error) {
      console.error('Error updating feedback:', error);
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

  const openEditModal = (feedback) => {
    setFeedbackToEdit(feedback);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setFeedbackToEdit(null);
  };

  const toggleSection = (page) => {
    setExpandedSections(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  // Get unique page routes for filtering
  const pageRoutes = ['all', ...new Set(feedbackList.map(f => f.page_route).filter(Boolean))];

  // Filter feedback based on selected page route
  const filteredFeedback = selectedPageRoute === 'all' 
    ? feedbackList 
    : feedbackList.filter(f => f.page_route === selectedPageRoute);

  // Group feedback by page route
  const groupedFeedback = filteredFeedback.reduce((acc, feedback) => {
    const page = feedback.page_route || 'No Page';
    if (!acc[page]) {
      acc[page] = {
        unresolved: [],
        resolved: []
      };
    }
    if (feedback.status === 'resolved' || feedback.status === 'closed') {
      acc[page].resolved.push(feedback);
    } else {
      acc[page].unresolved.push(feedback);
    }
    return acc;
  }, {});

  // Sort pages by number of unresolved feedback
  const sortedPages = Object.entries(groupedFeedback)
    .sort(([, a], [, b]) => b.unresolved.length - a.unresolved.length);

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
          <th className="px-4 py-2 text-left">Date</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {feedback.map((item) => (
          <tr 
            key={item.id} 
            className={`border-b hover:bg-gray-50 transition-colors ${
              item.status === 'resolved' || item.status === 'closed' 
                ? 'opacity-60 hover:opacity-100' 
                : ''
            }`}
          >
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
            <td className="px-4 py-2 text-xs text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </td>
            <td className="px-4 py-2">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Edit feedback"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openDeleteModal(item)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  title="Delete feedback"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
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
        {sortedPages.map(([page, { unresolved, resolved }]) => (
          <div key={page} className="bg-white rounded-lg shadow p-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection(page)}
            >
              <div className="flex items-center gap-2">
                {expandedSections[page] ? <FiChevronUp /> : <FiChevronDown />}
                <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                  {page === 'No Page' ? 'No Page Specified' : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageRouteClick(page);
                      }}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                      title={`Open ${page} in new tab`}
                    >
                      {page}
                      <FiExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </h2>
              </div>
              <div className="flex gap-4">
                <span className="text-sm text-gray-600">
                  {unresolved.length} unresolved
                </span>
                <span className="text-sm text-gray-600">
                  {resolved.length} resolved
                </span>
              </div>
            </div>

            {expandedSections[page] && (
              <>
                {/* Unresolved Feedback Section */}
                {unresolved.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                      Unresolved Feedback
                    </h3>
                    <div className="overflow-x-auto">
                      {renderFeedbackTable(unresolved)}
                    </div>
                  </div>
                )}

                {/* Resolved Feedback Section */}
                {resolved.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                      Resolved Feedback
                    </h3>
                    <div className="overflow-x-auto">
                      {renderFeedbackTable(resolved)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
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

      {/* Edit Modal */}
      {editModalOpen && feedbackToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
            style={{ backgroundColor: currentTheme.colors.background }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
              Edit Feedback
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEdit(feedbackToEdit);
            }} className="space-y-4">
              <div>
                <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Name</label>
                <input
                  type="text"
                  value={feedbackToEdit.name}
                  onChange={(e) => setFeedbackToEdit(prev => ({ ...prev, name: e.target.value }))}
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
                  value={feedbackToEdit.type}
                  onChange={(e) => setFeedbackToEdit(prev => ({ ...prev, type: e.target.value }))}
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
                  value={feedbackToEdit.priority}
                  onChange={(e) => setFeedbackToEdit(prev => ({ ...prev, priority: e.target.value }))}
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
                  value={feedbackToEdit.message}
                  onChange={(e) => setFeedbackToEdit(prev => ({ ...prev, message: e.target.value }))}
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
                <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Page Route</label>
                <input
                  type="text"
                  value={feedbackToEdit.page_route || ''}
                  onChange={(e) => setFeedbackToEdit(prev => ({ ...prev, page_route: e.target.value }))}
                  className="w-full p-2 rounded border"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Enter page route"
                />
              </div>

              <div>
                <label className="block mb-1" style={{ color: currentTheme.colors.text }}>Status</label>
                <select
                  value={feedbackToEdit.status}
                  onChange={(e) => setFeedbackToEdit(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 rounded border"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
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
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement; 