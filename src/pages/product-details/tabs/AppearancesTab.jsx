import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserGroupIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { OtherChart } from './OtherChart';
import { useAuth } from '../../../contexts/AuthContext';

const AppearancesTab = ({ item, comparisonSets }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedChart, setSelectedChart] = useState('radar');

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">

      <div className="flex flex-row justify-center mb-4">
        <h2 className="text-lg font-semibold mr-4">Visuals:</h2>
        {['radar', 'line', 'bar'
        // , 'pie', 'bubble', 'polar'
      ].map((item) => (
          <button
            key={item}
            onClick={() => setSelectedChart(item)}
            style={{backgroundColor: selectedChart === item ? currentTheme.colors.primary : 'lightgray', color: selectedChart === item ? 'white' : 'black'}}
            className={`px-4 py-2 rounded-md`}
          >
            {item}
          </button>
        ))}
      </div>
      </div>
      {comparisonSets?.map((set) => 
      {
        const [userVoted, setUserVoted] = useState(false);
        // fetch user voted for this set
        const fetchUserVoted = async () => {
          const { data: userVoted, error: userVotedError } = await supabase
            .from('votes')
            .select('*')
            .eq('user_id', user.id)
            .in('set_id', set.comparison_set_aspects.map(aspect => aspect.id))
            .select();
          return userVoted;
        };
        fetchUserVoted().then(data => {
          setUserVoted(data.length == set.comparison_set_aspects.length);
        });
        return (
        <div 
          key={set.id} 
          className="flex flex-col p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          style={{ backgroundColor: currentTheme.colors.card }}
          onClick={() => navigate(`/comparison/${set.id}`)}
        >
          <div className="flex flex-col items-start mb-4"
          // onClick={() => navigate(`/comparison/${set.id}`)}
          >
            <h3 className="font-semibold text-lg hover:text-blue-400 transition-colors"
              style={{ color: currentTheme.colors.text }}
            >
              {set.name}
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1.5 opacity-60" />
                <div className="flex items-baseline">
                  <span className="text-base font-semibold mr-1">
                    {set.comparison_set_aspects.reduce((acc, aspect) => acc + aspect.votes.length, 0)}
                  </span>
                  <span className="text-xs opacity-60">votes</span>
                </div>
              </div>
              <div className="flex items-center" style={{ color: currentTheme.colors.textSecondary }}>
                <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{set.comparison_set_aspects.reduce((acc, aspect) => acc + aspect.comparison_set_comments.length, 0)} </span>
              </div>
            </div>
          </div>

                {userVoted && (<div className="m-2 rounded-lg p-4"
          style={{ backgroundColor: 'white' }}>
                  <OtherChart 
                    selectedChart={selectedChart}
                    data={[{
                      setTitle: set.title,
                      aspects: set.comparison_set_aspects.map(aspect => ({
                        name: aspect.metric_name,
                        description: aspect.description
                      })),
                      items: set.allitems.map(item => ({
                        id: item.items.id,
                        name: item.items.name,
                        item_color_string: item.items.item_color_string,
                        metrics: set.comparison_set_aspects.reduce((acc, aspect) => {
                          const totalVotes = aspect.votes.length;
                          const itemVotes = aspect.votes.filter(vote => vote.item_id === item.items.id).length;
                          acc[aspect.metric_name] = (itemVotes / totalVotes) * 100;
                          return acc;
                        }, {})
                      }))
                    }]}
                  />
                </div>)}
                {!userVoted && (<div className="m-2 rounded-lg p-4"
          style={{ backgroundColor: 'white', color: currentTheme.colors.primary }}>
                  <p>Play all to unlock metrics</p>
                </div>)}
        </div>
      )})}
      {(!comparisonSets || comparisonSets.length === 0) && (
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