import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, MessageSquare, Play } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { checkUserVotedSet } from '@services/votes';
import OtherChart from './OtherChart';

const AppearancesTab = ({ _item, comparisonSets }) => {
  const navigate = useNavigate();
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const { user } = useAuth();
  const [userVotedSets, setUserVotedSets] = useState({});

  useEffect(() => {
    if (!user || !comparisonSets?.length) return;
    let cancelled = false;
    const checkAll = async () => {
      const results = await Promise.all(
        comparisonSets.map(set =>
          checkUserVotedSet(set.id)
            .then(voted => [set.id, voted])
            .catch(() => [set.id, false]),
        ),
      );
      if (!cancelled) setUserVotedSets(Object.fromEntries(results));
    };
    checkAll();
    return () => { cancelled = true; };
  }, [user, comparisonSets]);

  if (!comparisonSets?.length) {
    return (
      <div className="py-12 text-center">
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 20, color: t.ink, opacity: 0.4, marginBottom: 6 }}>
          no comparisons yet.
        </p>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 14, color: t.ink, opacity: 0.35 }}>
          This item hasn&apos;t been added to any comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comparisonSets.map(set => {
        const voted = userVotedSets[set.id];
        const totalVotes = set.votes?.length ?? 0;

        return (
          <motion.div
            key={set.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/compare/${set.id}`)}
            className="cursor-pointer rounded-xl overflow-hidden"
            style={{ background: t.bgDeep, border: `1px solid ${t.ink}18` }}
          >
            <div className="p-4">
              <h3 style={{ fontFamily: '"Fraunces", serif', fontSize: 15, fontWeight: 600, color: t.ink }}>
                {set.name}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <span
                  className="flex items-center gap-1"
                  style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}65` }}
                >
                  <BarChart2 size={11} />
                  {totalVotes} votes
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: `${t.ink}65` }}
                >
                  <MessageSquare size={11} />
                  {set.comparison_set_comments?.length ?? 0}
                </span>
              </div>
            </div>

            {voted ? (
              <div className="px-4 pb-4">
                {set.allitems ? (
                  <OtherChart allitems={set.allitems} totalVotes={totalVotes} />
                ) : (
                  <span style={{ fontFamily: '"Caveat", cursive', fontSize: 13, color: t.blue }}>
                    You voted!
                  </span>
                )}
              </div>
            ) : (
              <div
                className="mx-4 mb-4 rounded-lg px-4 py-3 flex items-center gap-2"
                style={{ background: `${t.mustard}1A`, border: `1px solid ${t.mustard}55` }}
              >
                <Play size={13} style={{ color: t.mustard }} />
                <span style={{ fontFamily: '"Fraunces", serif', fontSize: 13, color: t.ink, opacity: 0.55 }}>
                  Vote to unlock the chart
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AppearancesTab;
