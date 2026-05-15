import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Image, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { PaperGrain } from '@components/riso';
import { feedbackService } from '../../../services/feedbackService';
import Modal from '@components/common/Modal';

const ADMIN_EMAILS = ['aakarshika93@gmail.com', 'great.shivam19@gmail.com'];
const STATUSES = ['pending', 'in_progress', 'resolved', 'closed'];
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
const EASE = [0.16, 1, 0.3, 1];

const statusLabel = s =>
  s === 'in_progress' ? 'In progress' : s.charAt(0).toUpperCase() + s.slice(1);

const priorityColor = (priority, t) => {
  if (priority === 'high') return t.red;
  if (priority === 'medium') return t.mustard;
  return t.blue;
};

const FeedbackManagement = () => {
  const { themeId } = useTheme();
  const t = themes[themeId];
  const { user } = useAuth();

  const [feedbackList, setFeedbackList] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [showResolved, setShowResolved] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    pageRoute: 'all',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!isAdmin) return;
    feedbackService
      .getFeedbackList()
      .then(setFeedbackList)
      .catch(err => console.error('Failed to load feedback:', err));
  }, [isAdmin]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await feedbackService.updateFeedbackStatus(id, newStatus);
      setFeedbackList(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item)),
      );
      toast.success(`Marked as ${statusLabel(newStatus)}`);
      if ((newStatus === 'resolved' || newStatus === 'closed') && !showResolved) {
        setShowResolved(true);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleEdit = async e => {
    e.preventDefault();
    try {
      await feedbackService.updateFeedbackStatus(editTarget.id, editTarget.status);
      setFeedbackList(prev =>
        prev.map(item => (item.id === editTarget.id ? { ...item, ...editTarget } : item)),
      );
      toast.success('Feedback updated');
      setEditTarget(null);
    } catch (err) {
      console.error('Failed to update feedback:', err);
      toast.error('Failed to save changes');
    }
  };

  const handleDelete = async () => {
    try {
      await feedbackService.deleteFeedback(deleteTarget.id);
      setFeedbackList(prev => prev.filter(item => item.id !== deleteTarget.id));
      toast.success('Feedback deleted');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete feedback:', err);
      toast.error('Failed to delete feedback');
    }
  };

  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const uniquePageRoutes = ['all', ...new Set(feedbackList.map(f => f.page_route).filter(Boolean))];
  const uniqueTypes = ['all', ...new Set(feedbackList.map(f => f.type))];
  const uniquePriorities = ['all', ...new Set(feedbackList.map(f => f.priority))];

  const visible = feedbackList
    .filter(f => {
      const resolved = f.status === 'resolved' || f.status === 'closed';
      return (
        (showResolved ? resolved : !resolved) &&
        (filters.status === 'all' || f.status === filters.status) &&
        (filters.type === 'all' || f.type === filters.type) &&
        (filters.priority === 'all' || f.priority === filters.priority) &&
        (filters.pageRoute === 'all' || f.page_route === filters.pageRoute)
      );
    })
    .sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'created_at')
        return dir * (new Date(a.created_at) - new Date(b.created_at));
      if (sortConfig.key === 'priority')
        return dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      return dir * (a[sortConfig.key]?.localeCompare(b[sortConfig.key]) ?? 0);
    });

  if (!isAdmin) return <Navigate to="/" replace />;

  const field = {
    width: '100%',
    padding: '8px 12px',
    background: t.bgDeep,
    border: `1.5px solid ${t.ink}25`,
    borderRadius: 6,
    color: t.ink,
    fontFamily: '"Fraunces", serif',
    fontSize: 13,
    outline: 'none',
  };

  const lbl = {
    display: 'block',
    fontFamily: '"Fraunces", serif',
    fontSize: 11,
    color: t.ink,
    opacity: 0.55,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  };

  const thCell = {
    padding: '10px 16px',
    fontFamily: '"Fraunces", serif',
    fontSize: 11,
    color: t.ink,
    opacity: 0.55,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  const tdCell = {
    padding: '12px 16px',
    fontFamily: '"Fraunces", serif',
    fontSize: 13,
    color: t.ink,
    verticalAlign: 'middle',
  };

  const SortArrow = ({ k }) =>
    sortConfig.key === k ? (
      <span style={{ opacity: 0.45, fontSize: 10, marginLeft: 3 }}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    ) : null;

  const iconBtn = color => ({
    background: 'none',
    border: 'none',
    color,
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    borderRadius: 4,
  });

  return (
    <div
      style={{
        background: t.bg,
        color: t.ink,
        minHeight: '100vh',
        fontFamily: '"Fraunces", serif',
      }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />

      <div className="relative z-10 px-5 sm:px-10 pt-24 pb-16 max-w-screen-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: '"Caveat", cursive',
                fontSize: 18,
                color: t.ink,
                opacity: 0.5,
                marginBottom: 2,
              }}
            >
              admin only
            </p>
            <h1
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(28px, 6vw, 44px)',
                lineHeight: 0.96,
                color: t.ink,
                margin: 0,
              }}
            >
              Feedback
            </h1>
          </div>

          <button
            onClick={() => setShowResolved(v => !v)}
            style={{
              padding: '7px 18px',
              background: showResolved ? t.ink : 'transparent',
              border: `1.5px solid ${t.ink}`,
              borderRadius: 6,
              fontFamily: '"Fraunces", serif',
              fontSize: 13,
              color: showResolved ? t.bg : t.ink,
              cursor: 'pointer',
            }}
          >
            {showResolved ? 'Show unresolved' : 'Show resolved'}
          </button>
        </motion.div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key: 'status', options: ['all', ...STATUSES], label: 'Status' },
            { key: 'type', options: uniqueTypes, label: 'Type' },
            { key: 'priority', options: uniquePriorities, label: 'Priority' },
            { key: 'pageRoute', options: uniquePageRoutes, label: 'Page' },
          ].map(({ key, options, label }) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <select
                value={filters[key]}
                onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                style={field}
              >
                {options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt === 'all' ? `All ${label}s` : statusLabel(opt)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            background: t.bgDeep,
            border: `1.5px solid ${t.ink}15`,
            borderRadius: 10,
            overflow: 'hidden',
          }}
          className="overflow-x-auto"
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.ink}15` }}>
                <th
                  style={{ ...thCell, cursor: 'pointer' }}
                  onClick={() => handleSort('priority')}
                >
                  Priority <SortArrow k="priority" />
                </th>
                <th style={thCell}>Message</th>
                <th
                  style={{ ...thCell, cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  Status <SortArrow k="status" />
                </th>
                <th
                  style={{ ...thCell, cursor: 'pointer' }}
                  onClick={() => handleSort('created_at')}
                >
                  Date <SortArrow k="created_at" />
                </th>
                <th
                  style={{ ...thCell, cursor: 'pointer' }}
                  onClick={() => handleSort('name')}
                >
                  Source <SortArrow k="name" />
                </th>
                <th style={thCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {visible.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: item.status === 'resolved' || item.status === 'closed' ? 0.55 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    style={{ borderBottom: `1px solid ${t.ink}10` }}
                  >
                    <td style={tdCell}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: priorityColor(item.priority, t),
                        }}
                      />
                    </td>

                    <td style={{ ...tdCell, maxWidth: 300 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: expandedMessages[item.id] ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.message}
                      </p>
                      {item.message?.length > 100 && (
                        <button
                          onClick={() =>
                            setExpandedMessages(prev => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            color: t.blue,
                            fontSize: 12,
                            fontFamily: '"Fraunces", serif',
                            cursor: 'pointer',
                            padding: '2px 0',
                            marginTop: 2,
                          }}
                        >
                          {expandedMessages[item.id] ? 'Show less' : 'Show more'}
                        </button>
                      )}
                      {item.image_url && (
                        <a
                          href={item.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: t.blue,
                            fontSize: 12,
                            fontFamily: '"Fraunces", serif',
                            marginTop: 4,
                            textDecoration: 'none',
                          }}
                        >
                          <Image size={11} /> View screenshot
                        </a>
                      )}
                    </td>

                    <td style={tdCell}>
                      <select
                        value={item.status}
                        onChange={e => handleStatusChange(item.id, e.target.value)}
                        style={{ ...field, width: 'auto', fontSize: 12, padding: '4px 8px' }}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ ...tdCell, fontSize: 12, opacity: 0.55, whiteSpace: 'nowrap' }}>
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </td>

                    <td style={{ ...tdCell, fontSize: 12 }}>
                      <div>{item.name}</div>
                      {item.page_route && (
                        <button
                          onClick={() =>
                            window.open(item.page_route, '_blank', 'noopener,noreferrer')
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'none',
                            border: 'none',
                            color: t.blue,
                            fontSize: 12,
                            fontFamily: '"Fraunces", serif',
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: 2,
                          }}
                        >
                          {item.page_route} <ExternalLink size={11} />
                        </button>
                      )}
                    </td>

                    <td style={tdCell}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => setEditTarget(item)}
                          style={iconBtn(t.blue)}
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          style={iconBtn(t.red)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {visible.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: '"Caveat", cursive',
                  fontSize: 20,
                  color: t.ink,
                  opacity: 0.38,
                }}
              >
                {showResolved ? 'no resolved feedback yet' : 'nothing pending — all quiet!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete feedback"
        size="sm"
      >
        <p
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 14,
            color: t.ink,
            opacity: 0.8,
            marginBottom: 24,
          }}
        >
          This action cannot be undone. Delete this feedback?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={() => setDeleteTarget(null)}
            style={{
              padding: '7px 18px',
              background: 'transparent',
              border: `1.5px solid ${t.ink}30`,
              borderRadius: 6,
              fontFamily: '"Fraunces", serif',
              fontSize: 13,
              color: t.ink,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '7px 18px',
              background: t.red,
              border: 'none',
              borderRadius: 6,
              fontFamily: '"Fraunces", serif',
              fontSize: 13,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit feedback"
        size="md"
      >
        {editTarget && (
          <form onSubmit={handleEdit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Name</label>
                <input
                  type="text"
                  value={editTarget.name}
                  onChange={e => setEditTarget(prev => ({ ...prev, name: e.target.value }))}
                  style={field}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Type</label>
                  <select
                    value={editTarget.type}
                    onChange={e => setEditTarget(prev => ({ ...prev, type: e.target.value }))}
                    style={field}
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Priority</label>
                  <select
                    value={editTarget.priority}
                    onChange={e => setEditTarget(prev => ({ ...prev, priority: e.target.value }))}
                    style={field}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}>Status</label>
                <select
                  value={editTarget.status}
                  onChange={e => setEditTarget(prev => ({ ...prev, status: e.target.value }))}
                  style={field}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Message</label>
                <textarea
                  value={editTarget.message}
                  onChange={e => setEditTarget(prev => ({ ...prev, message: e.target.value }))}
                  style={{ ...field, resize: 'vertical' }}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label style={lbl}>Page route</label>
                <input
                  type="text"
                  value={editTarget.page_route ?? ''}
                  onChange={e =>
                    setEditTarget(prev => ({ ...prev, page_route: e.target.value }))
                  }
                  style={field}
                  placeholder="e.g. /compare"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  style={{
                    padding: '7px 18px',
                    background: 'transparent',
                    border: `1.5px solid ${t.ink}30`,
                    borderRadius: 6,
                    fontFamily: '"Fraunces", serif',
                    fontSize: 13,
                    color: t.ink,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '7px 18px',
                    background: t.ink,
                    border: 'none',
                    borderRadius: 6,
                    fontFamily: '"Fraunces", serif',
                    fontSize: 13,
                    color: t.bg,
                    cursor: 'pointer',
                  }}
                >
                  Save changes
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackManagement;
