import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { themes } from '@styles/themes';
import { PaperGrain } from '@components/riso';
import { useTheme } from '@contexts/ThemeContext';
import { getItem, getItemComparisonSets } from '@services/items';
import PullToRefresh from '@components/common/PullToRefresh';
import ProductHeader from './ProductHeader';
import QuickStats from './QuickStats';
import ProductTabs from './ProductTabs';

const ProductDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const controls = useAnimation();

  const [item, setItem] = useState(null);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [activeTab, setActiveTab] = useState('comparisons');
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [itemData, sets] = await Promise.all([
        getItem(itemId),
        getItemComparisonSets(itemId),
      ]);
      if (!itemData) {
        setError('Item not found.');
        return;
      }
      setItem(itemData);
      setComparisonSets(sets);
    } catch (err) {
      console.error('ProductDetails load error:', err);
      setError(err.response?.data?.error?.message ?? err.message);
    }
  };

  useEffect(() => {
    load();
  }, [itemId]);

  const handleDragEnd = async (_event, info) => {
    if (info.offset.x > 100) {
      await controls.start({ x: '100%', transition: { duration: 0.3 } });
      navigate(-1);
    } else {
      controls.start({ x: 0, transition: { duration: 0.3 } });
    }
  };

  if (error) {
    return (
      <div
        style={{ background: t.bg, color: t.ink, minHeight: '100vh' }}
        className="flex items-center justify-center"
      >
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 16, opacity: 0.5 }}>{error}</p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div
      style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }}
      className="relative overflow-x-hidden"
    >
      <PaperGrain blend={t.blend} />
      <PullToRefresh onRefresh={load}>
        <motion.div
          className="relative z-10"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          <main className="max-w-screen-xl mx-auto px-5 sm:px-10 pt-6 pb-16 space-y-6">
            <ProductHeader item={item} />
            <QuickStats comparisonSets={comparisonSets} item={item} />
            <ProductTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              item={item}
              comparisonSets={comparisonSets}
            />
          </main>
        </motion.div>
      </PullToRefresh>
    </div>
  );
};

export default ProductDetails;
