import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { feedbackService } from '../../../services/feedbackService';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { FiImage, FiTrash2, FiExternalLink, FiEdit2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';
import { useLoading } from '../../../contexts/LoadingContext';
import { formatDistanceToNow } from 'date-fns';
const ADMIN_EMAILS = ['aakarshika93@gmail.com', 'great.shivam19@gmail.com'];

const FeedbackManagement = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [error, setError] = useState(null);
  const { setLoading, setError: setGlobalError } = useLoading();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [feedbackToEdit, setFeedbackToEdit] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  
  // New state for filters and sorting
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    pageRoute: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  const [showResolved, setShowResolved] = useState(false);

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

  // Get unique values for filters
  const uniquePageRoutes = ['all', ...new Set(feedbackList.map(f => f.page_route).filter(Boolean))];
  const uniqueTypes = ['all', ...new Set(feedbackList.map(f => f.type))];
  const uniquePriorities = ['all', ...new Set(feedbackList.map(f => f.priority))];
  const uniqueStatuses = ['all', 'pending', 'in_progress', 'resolved', 'closed'];

  // Filter and sort feedback
  const filteredAndSortedFeedback = feedbackList
    .filter(feedback => {
      const matchesFilters = (
        (filters.status === 'all' || feedback.status === filters.status) &&
        (filters.type === 'all' || feedback.type === filters.type) &&
        (filters.priority === 'all' || feedback.priority === filters.priority) &&
        (filters.pageRoute === 'all' || feedback.page_route === filters.pageRoute)
      );
      
      // Separate resolved and unresolved
      const isResolved = feedback.status === 'resolved' || feedback.status === 'closed';
      return matchesFilters && (showResolved ? isResolved : !isResolved);
    })
    .sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortConfig.key === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortConfig.direction === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key]?.localeCompare(b[sortConfig.key])
        : b[sortConfig.key]?.localeCompare(a[sortConfig.key]);
    });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return null; // Error screen is now handled by LoadingContext
  }

  const handlePageRouteClick = (route) => {
    window.open(route, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8" style={{ backgroundColor: currentTheme.colors.background, paddingTop: '104px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
          Feedback Management
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="px-4 py-2 rounded border"
            style={{
              backgroundColor: showResolved ? currentTheme.colors.primary : currentTheme.colors.background,
              borderColor: currentTheme.colors.border,
              color: showResolved ? 'white' : currentTheme.colors.text,
            }}
          >
            {showResolved ? 'Show Unresolved' : 'Show Resolved'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="p-2 rounded border"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text,
          }}
        >
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="p-2 rounded border"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text,
          }}
        >
          {uniqueTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="p-2 rounded border"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text,
          }}
        >
          {uniquePriorities.map(priority => (
            <option key={priority} value={priority}>
              {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.pageRoute}
          onChange={(e) => handleFilterChange('pageRoute', e.target.value)}
          className="p-2 rounded border"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text,
          }}
        >
          {uniquePageRoutes.map(route => (
            <option key={route} value={route}>
              {route === 'all' ? 'All Pages' : route}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort('priority')}>
                   {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              <th 
                className="px-2 py-2 text-left"
              >
                Message
              </th>
              <th 
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Source {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedFeedback.map((item) => (
              <tr 
                key={item.id} 
                className={`border-b hover:bg-gray-50 transition-colors ${
                  item.status === 'resolved' || item.status === 'closed' 
                    ? 'opacity-60 hover:opacity-100' 
                    : ''
                }`}
              >
                <td className='px-4 py-2'>
                  <div className='flex items-center gap-2 rounded-full h-4 w-4' style={{ backgroundColor: item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f59e0b' : '#34d399' }}>
                  </div>
                </td>
                <td className="px-2 py-2 capitalize">
                  <div className="max-w-md text-black">
                    <p className={!expandedMessages[item.id] ? "line-clamp-2" : ""} style={{ color: currentTheme.colors.text }}>
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
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleStatusChange(item.id, newStatus);
                      // If status is changed to resolved or closed, switch to resolved view
                      if ((newStatus === 'resolved' || newStatus === 'closed') && !showResolved) {
                        // setShowResolved(true);
                        console.log('Thanks!')
                      }
                    }}
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
                  {formatDistanceToNow(item.created_at)}
                </td>
                <td className="px-4 py-2">{item.name}
                  {item.page_route ? (
                    <button
                      onClick={() => handlePageRouteClick(item.page_route)}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                      title={`Open ${item.page_route} in new tab`}
                    >
                      {item.page_route}
                      <FiExternalLink className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
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