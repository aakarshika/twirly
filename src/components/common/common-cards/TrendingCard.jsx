import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dot, MessageSquare, ThumbsUp, Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { getPublicUrl, getPublicUrlItems, splitAndJoin } from '../../../lib/utils';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../../../services/userActivityService';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../Avatar';

const TrendingCard = ({set, from}) => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userVoted, setUserVoted] = useState(false);
    const [votedItems, setVotedItems] = useState([]);

    const { currentTheme } = useTheme();

    const handleSetClick = async (set, event) => {
        try {
            // Get the exact card element that was clicked
            const cardElement = event.currentTarget;
            const cardRect = cardElement.getBoundingClientRect();
            const cardTop = cardRect.top + window.scrollY;

            // Save both scroll position and card position
            sessionStorage.setItem('trending_scroll_position', window.scrollY.toString());
            sessionStorage.setItem('trending_card_position', cardTop.toString());

            // Log the aspect set view activity
            await userActivityService.logActivity({
                userId: user.id,
                activityType: ACTIVITY_TYPES.ASPECT_SET_VIEW,
                entityType: ENTITY_TYPES.ASPECT_SET,
                entityId: set.aspect_set_id,
                pageName: '/trending',
                metadata: { 
                    aspectSetId: set.aspect_set_id,
                    aspectSetTitle: set.title
                }
            });

            navigate(`/compare/${set.set_id}`);
        } catch (error) {
            console.error('Error logging aspect set view:', error);
            navigate(`/compare/${set.set_id}`);
        }
    };
    
  useEffect(() => {
    const getUserVoted = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('votes')
          .select(`
            comparison_set_aspects!inner(id),
            *
          `)
          .eq('user_id', user.id)
          .eq('comparison_set_aspects.set_id', set.set_id);

        if (error) {
          throw error;
        }
        setUserVoted(data.length > 0);
          set.voted = data;
          setVotedItems(data && data.length > 0 ? data : null);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };
    // if (from === 'search') {
      getUserVoted();
    // }
  }, [user]);


  return (
    <div
      key={set.id}
      onClick={(e) => handleSetClick(set, e)}
      style={{ backgroundColor: 'white' }}
    >
      <div className="p-4 mx-auto max-w-2xl"
      style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="mb-2">
        <span className="font-medium" style={{ color: currentTheme.colors.text }}>
          {set.name}
        </span> 
        {/* <span className="px-2 text-sm" style={{ color: currentTheme.colors.disabled }}>based on </span>
         <span className="text-sm rounded-full px-2 py-1" style={{ color: 'white', backgroundColor: currentTheme.colors.primary }}>{splitAndJoin(set.metric_name)}</span>
         <span className="px-2 text-sm" style={{ color: currentTheme.colors.disabled }}>? </span> */}
         </div>
        <div className="grid grid-cols-2 gap-2">
          {set.comparison_set_items?.slice(0, 4).map((it, index) => {
            set.imageError = false;
            const item = it.items;
            const itemImage = item.image_url && item.image_url.startsWith('http') ? item.image_url : getPublicUrlItems(item.image_url);
            return (
              <div
                key={item.id}
                className={`relative rounded-lg overflow-hidden ${
                  userVoted? '' : index >= 2 ? 'blur-sm' : ''
                }`}
              >
                <img
                  src={itemImage}
                  alt={item.name}
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                    set.imageError = true;
                  }}
                />
                {(!itemImage || set.imageError )&& (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                    style={{ color: 'black', backgroundColor: 'white' }}
                  >
                    {item.name}
                  </div>
                )}
                {itemImage && !set.imageError && (index < 2 || userVoted) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                    <p className="text-white text-sm truncate">{item.name}</p>
                  </div>
                )}
                {votedItems?.some(votedItem => votedItem.item_id === item.id) && (<div className="absolute top-0 right-0 bg-gray-100 bg-opacity-50 p-1 rounded-full m-1">
                  <ThumbsUp size={16} className="m-1" />
                </div>)}
              </div>
            );
          })}
        </div>
        {/* {set.description && (
          <p className="text-sm mt-2" style={{ color: currentTheme.colors.textSecondary }}>
            {set.description} 
          </p>
        )} */}
        <div className="flex items-center justify-between mt-4">
      <div className="flex" >
        <Avatar
          profileImageUrl={set.user?.profile_image_url ? getPublicUrl(set.user?.profile_image_url) : null}
          displayName={set.user?.display_name}
          size="sm"
          className="mr-2"
        />
        <div className="items-start">
          <div className="flex flex-col">
            <span className="text-sm"
              style={{textAlign: 'start', color: currentTheme.colors.text}}
              onClick={() => {
                navigate(`/user/${set.user?.display_name}`);
              }}
              >{set.user?.display_name || 'Anonymous'}
            </span>
            <div className="flex items-center">
            <span className="text-xs text-gray-400 dark:text-gray-300" >
              {formatDistanceToNow(new Date(set.created_at), { addSuffix: true })}
            </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
            {(set.total_comments || 0) > 0 && (<div className="flex items-center">
              <MessageSquare size={16} className="mr-1" />
              <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                {set.total_comments || 0}
              </span>
            </div>)}
            {(set.total_votes || 0) > 0 && (<div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                {set.total_votes || 0}
              </span>
            </div>)}
          </div>

        </div>
      </div>
    </div>
  )
};

export default TrendingCard; 