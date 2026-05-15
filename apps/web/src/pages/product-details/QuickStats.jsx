import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const EASE = [0.16, 1, 0.3, 1];

const countUp = (target, setter) => {
  const steps = 40;
  const stepMs = 800 / steps;
  let step = 0;
  const id = setInterval(() => {
    step++;
    setter(Math.round(target * (step / steps)));
    if (step >= steps) clearInterval(id);
  }, stepMs);
  return () => clearInterval(id);
};

const QuickStats = ({ comparisonSets, item }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;

  const totalComparisons = comparisonSets.length;
  const winRate = totalComparisons > 0
    ? Math.round(
        (comparisonSets.filter(s => (s.itemVotes ?? 0) > (s.totalVotes ?? 0) / 2).length
          / totalComparisons) * 100,
      )
    : 0;

  const [dispComparisons, setDispComparisons] = useState(0);
  const [dispWinRate, setDispWinRate] = useState(0);

  useEffect(() => {
    const c1 = countUp(totalComparisons, setDispComparisons);
    const c2 = countUp(winRate, setDispWinRate);
    return () => { c1(); c2(); };
  }, [totalComparisons, winRate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex flex-wrap gap-3"
    >
      <div style={{
        background: t.bgDeep,
        border: `2px solid ${t.red}`,
        borderRadius: 8,
        padding: '14px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 110,
      }}>
        <BarChart2 size={15} style={{ color: t.red }} />
        <p style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 30, lineHeight: 1, color: t.ink, margin: 0 }}>
          {dispComparisons}
        </p>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: t.ink, opacity: 0.6, margin: 0 }}>
          comparisons
        </p>
      </div>

      {totalComparisons > 0 && (
        <div style={{
          background: t.bgDeep,
          border: `2px solid ${t.blue}`,
          borderRadius: 8,
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          minWidth: 110,
        }}>
          <TrendingUp size={15} style={{ color: t.blue }} />
          <p style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 30, lineHeight: 1, color: t.ink, margin: 0 }}>
            {dispWinRate}%
          </p>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: t.ink, opacity: 0.6, margin: 0 }}>
            win rate
          </p>
        </div>
      )}

      {item?.category_name && (
        <div style={{
          background: t.bgDeep,
          border: `1px solid ${t.ink}15`,
          borderRadius: 8,
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 4,
          minWidth: 110,
        }}>
          <p style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', fontSize: 18, lineHeight: 1.2, color: t.ink, margin: 0 }}>
            {item.category_name}
          </p>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: t.ink, opacity: 0.6, margin: 0 }}>
            category
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default QuickStats;
