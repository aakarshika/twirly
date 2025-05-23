import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { COMPARISON_COLOR_SET } from '../../../lib/constants';
import ComparisonCommentsInshort from './ComparisonCommentsInshort';
import Button from '../../../components/common/Button';
import { Info, MessageSquareShare, Play, Share, Star, Target, ThumbsUp, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ComparisonSetAspectsCommentsSection from '../../comparison-aspect-page/ComparisonSetAspectsCommentsSection';

const MetricCard = ({ metric, items, getMetricAverageVotes, currentTheme, userVoted }) => {
  const totalVotes = metric.votes.length;
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-sm"
    onClick={() => {
      navigate(`/compare/${metric.set_id}`);
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5" style={{ color: currentTheme.colors.secondary }} />
          <h3 className="text-lg font-semibold text-gray-800">{metric.metric_name.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}</h3>
        </div>
        {userVoted && (<div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{totalVotes} votes</span>
          </div>
        </div>)}

        {(!userVoted && <div className='flex flex-row justify-end items-center'>
          <button className='bg-blue-500 text-white px-4 py-2 rounded-md'
          
          >
            <span className='flex items-center'>Play <Play className='w-4 h-4 ml-2' /></span>
          </button>
        </div>)}
      </div>
      
      <div className="space-y-1">
        {items.map((item, i) => {
          const value = getMetricAverageVotes(item.id, metric.metric_name);
          const percentage = (value / (totalVotes || 1)) * 100;
          
          return userVoted ? (
            <div key={item.id} className="flex flex-row items-center">
              <div className="flex flex-row w-full">
                <div className="flex  w-32">
                  <span className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</span>
                </div>
                <span className=' text-sm text-white-500 ml-2 w-6'>{value} </span>
                <div className="flex w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="flex rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: item.item_color_string
                    }}
                  >
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

const BarChart = ({ items,  comparisonMetrics }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();


  const getMetricAverageVotes = (itemId, metricName) => {
    var itemVotes = 0;
    comparisonMetrics.forEach(metric => {
      metric.votes.forEach(vote => {
        if (vote.item_id === itemId && metric.metric_name === metricName) {
          itemVotes++;
        }
      });
    });
    return itemVotes;
  };

  return (
    <div className="w-full p-4">
      <div  className={`grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2`}
                  style={{
                    gap: '1vh'
                  }}>
        {comparisonMetrics.map((metric, index) => {

          return (
          <div key={metric.metric_name}>
          <MetricCard
            key={metric.metric_name}
            metric={metric}
            items={items}
            getMetricAverageVotes={getMetricAverageVotes}
            currentTheme={currentTheme}
            userVoted={metric.userVoted}
          />
          <div className='pl-4'>

          <ComparisonSetAspectsCommentsSection
            userVoted={true}
            aspectSetId={metric.id}
            items={items}
            aspectSet={metric}
          />
          </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default BarChart; 