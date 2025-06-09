import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserGroupIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { OtherChart } from './OtherChart';
import { useAuth } from '../../../contexts/AuthContext';
import { MessageSquare, Play, ThumbsUp } from 'lucide-react';

const AppearancesTab = ({ item, comparisonSets }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedChart, setSelectedChart] = useState('radar');
  const [userVotedSets, setUserVotedSets] = useState({});

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!user || !comparisonSets) return;
      
      const votesMap = {};
      for (const set of comparisonSets) {
        const { data: userVoted, error: userVotedError } = await supabase
          .from('votes')
          .select('*')
          .eq('user_id', user.id)
          .eq('set_id', set.id);
        
        if (!userVotedError) {
          votesMap[set.id] = userVoted?.length > 0;
        }
      }
      // console.log('votesMap', votesMap);
      setUserVotedSets(votesMap);
    };

    fetchUserVotes();
  }, [user, comparisonSets]);

  return (
    <div className="space-y-4" style={{color: currentTheme.colors.text}}>
      {/* <div className="flex justify-end mb-4">
        <div className="flex flex-row justify-end mb-4">
          <h2 className="text-sm font-semibold mr-4">Visuals:</h2>
          {['radar', 'line', 'bar'].map((item) => (
            <button
              key={item}
              onClick={() => setSelectedChart(item)}
              style={{backgroundColor: selectedChart === item ? currentTheme.colors.primary : 'lightgray', color: selectedChart === item ? 'white' : 'black'}}
              className={`px-4 py-1 rounded-md text-sm`}
            >
              {item}
            </button>
          ))}
        </div>
      </div> */}
      {comparisonSets?.map((set) => (
        <div 
          key={set.id} 
          className="flex flex-col p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          style={{ backgroundColor: currentTheme.colors.card }}
          onClick={() => navigate(`/compare/${set.id}`)}
        >
          <div className="flex flex-col items-start mb-4">
            <h3 className="font-semibold text-lg hover:text-blue-400 transition-colors"
              style={{ color: currentTheme.colors.text }}
            >
              {set.name}
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1.5 opacity-60" />
                <div className="flex items-baseline">
                  <span className="text-base font-semibold mr-1">
                    {set.votes?.length}
                  </span>
                  <span className="text-xs opacity-60">votes</span>
                </div>
              </div>
              <div className="flex items-center" style={{ color: currentTheme.colors.textSecondary }}>
                <MessageSquare className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{set.comparison_set_comments?.length} </span>
              </div>
            </div>
          </div>

          {userVotedSets[set.id] && (
            <div className="m-2 rounded-lg p-4">
              <OtherChart 
                selectedChart={selectedChart}
                data={[{
                  setTitle: set.title,
                  aspects: [{name: set.name, description: set.description}],
                  items: set.allitems.map(item => ({
                    id: item.items.id,
                    name: item.items.name,
                    item_color_string: item.items.item_color_string,
                    metrics: {
                      [set.name]: item.items.votes?.length / set.votes?.length * 100
                    }
                    // metrics: set.comparison_set_aspects.reduce((acc, aspect) => {
                    //   const totalVotes = aspect.votes?.length;
                    //   const itemVotes = aspect.votes.filter(vote => vote.item_id === item.items.id)?.length;
                    //   acc[aspect.metric_name] = (itemVotes / totalVotes) * 100;
                    //   return acc;
                    // }, {})
                  }))
                }]}
              />
            </div>
          )}
          {!userVotedSets[set.id] && (
            <div className="m-2 rounded-lg p-4 flex flex-row items-center"
              style={{ backgroundColor: 'white', color: currentTheme.colors.primary }}>
              <p>Play to unlock</p>
              <Play size={24} />
            </div>
          )}
        </div>
      ))}
      {(!comparisonSets || comparisonSets?.length === 0) && (
        <div className="text-center py-8">
          <p className="text-lg" style={{ color: currentTheme.colors.textSecondary }}>
            No comparison history available
          </p>
        </div>
      )}
    </div>
  );
};

export default AppearancesTab; 