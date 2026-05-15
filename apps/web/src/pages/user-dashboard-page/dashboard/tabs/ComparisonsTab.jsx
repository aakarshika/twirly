import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { getUserComparisons, deleteComparisonSet } from '@services/comparisons';
import ComparisonCard from './ComparisonCard';

const EASE = [0.16, 1, 0.3, 1];

const SkeletonCard = ({ t }) => (
  <motion.div
    animate={{ opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      background: t.bgDeep,
      borderRadius: 8,
      border: `1px solid ${t.ink}12`,
      overflow: 'hidden',
    }}
  >
    <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${t.ink}08` }}>
      <div style={{ height: 20, width: '68%', background: `color-mix(in srgb, ${t.ink} 8%, transparent)`, borderRadius: 4 }} />
    </div>
    <div style={{ padding: '10px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ aspectRatio: '1', background: `color-mix(in srgb, ${t.ink} 7%, transparent)`, borderRadius: 4 }} />
      ))}
    </div>
    <div style={{ padding: '8px 16px 12px', height: 32 }} />
  </motion.div>
);

const ComparisonsTab = ({ userId, isPublic }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserComparisons(userId);
      setComparisons(data);
    } catch (err) {
      setError('Failed to load comparisons.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchComparisons();
    } else {
      setError('Sign in to view comparisons.');
      setLoading(false);
    }
  }, [userId]);

  const handleDelete = async setId => {
    if (!window.confirm('Delete this comparison?')) return;
    try {
      await deleteComparisonSet(setId);
      setComparisons(prev => prev.filter(c => c.id !== setId));
    } catch (err) {
      setError('Failed to delete comparison.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => <SkeletonCard key={i} t={t} />)}
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.red, padding: '16px 0' }}>
        {error}
      </p>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      {!isPublic && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/new-comparison')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: '"Fraunces", serif',
              fontSize: 14,
              background: t.ink,
              color: t.bg,
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            new comparison
          </button>
        </div>
      )}

      {comparisons.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: t.ink, opacity: 0.5, marginBottom: 8 }}>
            no comparisons yet.
          </p>
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: 15, color: t.ink, opacity: 0.45 }}>
            {isPublic
              ? "This user hasn't created any comparisons."
              : 'Create your first one to get started.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((comparison, i) => (
            <motion.div
              key={comparison.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
            >
              <ComparisonCard
                comparison={comparison}
                onDelete={handleDelete}
                isPublic={isPublic}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComparisonsTab;
