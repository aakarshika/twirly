import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserGroupIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { OtherChart } from '../../results/visualizations';
const AppearancesTab = ({ item, comparisonSets }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {comparisonSets?.map((set) => (
        console.log("set",set),
        <div 
          key={set.id} 
          className="flex flex-col p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          style={{ backgroundColor: currentTheme.colors.background }}
          // onClick={() => navigate(`/comparison/${set.id}`)}
        >
          <div className="flex justify-between items-start mb-4"
          onClick={() => navigate(`/comparison/${set.id}`)}
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
                    {set.votes}
                  </span>
                  <span className="text-xs opacity-60">votes</span>
                </div>
              </div>
              <div className="flex items-center" style={{ color: currentTheme.colors.textSecondary }}>
                <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-1.5" />
                <span className="text-sm">{set.comments?.length || 0} </span>
              </div>
            </div>
          </div>

                <div className="mt-4">
                  <OtherChart 
                    data={[{
                      setTitle: set.title,
                      aspects: set.comparison_set_aspects.map(aspect => ({
                        name: aspect.metric_name,
                        description: aspect.description
                      })),
                      items: set.allitems.map(item => ({
                        id: item.items.id,
                        name: item.items.name,
                        metrics: set.comparison_set_aspects.reduce((acc, aspect) => {
                          const totalVotes = aspect.votes.length;
                          const itemVotes = aspect.votes.filter(vote => vote.item_id === item.items.id).length;
                          acc[aspect.metric_name] = (itemVotes / totalVotes) * 100;
                          return acc;
                        }, {})
                      }))
                    }]}
                  />
                </div>
          {set.metrics?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Total Metrics Progress
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {set.metrics.map((metric) => (
                  <div key={metric.name} className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        {metric.name}
                      </span>
                      <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                        {metric.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                    {metric.description && (
                      <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                        {metric.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
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