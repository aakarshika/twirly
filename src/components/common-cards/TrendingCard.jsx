import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { splitAndJoin } from '../../lib/utils';

const TrendingCard = ({set, from}) => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userVoted, setUserVoted] = useState(false);
    const [voted_item_id, setVotedItemId] = useState(null);

    const { currentTheme } = useTheme();

    const handleSetClick = (set) => {
        navigate(`/comparison-aspect/${set.aspect_set_id}`);
      };
    
  useEffect(() => {
    const getUserVoted = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('votes')
          .select(`
            *
          `)
          .eq('user_id', user.id)
          .eq('set_id', set.aspect_set_id);

        if (error) {
          throw error;
        }
        setUserVoted(data);
          set.voted = data;
          setVotedItemId(data && data.length > 0 ? data[0].item_id : null);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };
    if (from === 'search') {
      getUserVoted();
    }
  }, [user]);


  return (
    <div
      key={set.id}
      onClick={() => handleSetClick(set)}
      className="cursor-pointer rounded-lg hover:bg-gray-50 transition-colors"
      style={{
        backgroundColor: currentTheme.colors.card,
        borderColor: currentTheme.colors.border,
        border: '1px solid'
      }}
    >
      <div className="p-4">
        <h3 className="font-medium mb-2" style={{ color: currentTheme.colors.text }}>
          {set.name}
        </h3>
        <h4 className="text-sm rounded-full px-2 py-1" style={{ color: 'white', backgroundColor: currentTheme.colors.primary, marginBottom: '10px' }}>{splitAndJoin(set.metric_name)}</h4>
        <div className="grid grid-cols-2 gap-2">
          {set.comparison_set_items?.slice(0, 4).map((it, index) => {
            set.imageError = false;
            const item = it.items;
            return (
              <div
                key={item.id}
                className={`relative rounded-lg overflow-hidden ${
                  voted_item_id ? '' : index >= 2 ? 'blur-sm' : ''
                }`}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                    set.imageError = true;
                  }}
                />
                {(!item.image_url || set.imageError )&& (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                    style={{ color: 'black', backgroundColor: voted_item_id ?  item.item_color_string : 'white' }}
                  >
                    {item.name}
                  </div>
                )}
                {item.image_url && !set.imageError && index < 2 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                    <p className="text-white text-sm truncate">{item.name}</p>
                  </div>
                )}
                {voted_item_id == item.id && (<div className="absolute top-0 right-0 bg-gray-100 bg-opacity-50 p-1 rounded-full m-1">
                  <ThumbsUp size={16} className="m-1" />
                </div>)}
              </div>
            );
          })}
        </div>
        {set.description && (
          <p className="text-sm mt-2" style={{ color: currentTheme.colors.textSecondary }}>
            {set.description} 
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            {(set.total_comments || 0) > 0 && (<div className="flex items-center">
              <MessageSquare size={16} className="mr-1" />
              <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                {set.total_comments || 0}
              </span>
            </div>)}
            {(set.total_votes || 0) > 0 && (<div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                {set.total_votes || 0}
              </span>
            </div>)}
          </div>
          <div className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            {new Date(set.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
};

export default TrendingCard; 