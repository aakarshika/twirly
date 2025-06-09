import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dot, MessageSquare, ThumbsUp, Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { changeColorAlpha, getPublicUrl, getPublicUrlItems, splitAndJoin } from '../../../lib/utils';
import { userActivityService, ACTIVITY_TYPES, ENTITY_TYPES } from '../../../services/userActivityService';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../Avatar';

const TrendingCard = ({set, from}) => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userVoted, setUserVoted] = useState(false);
    const [votedItems, setVotedItems] = useState([]);
    const [imageErrors, setImageErrors] = useState({});
    const [currentMetricIndex, setCurrentMetricIndex] = useState(0);

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
                activityType: ACTIVITY_TYPES.COMPARISON_SET_VIEW,
                entityType: ENTITY_TYPES.COMPARISON_SET,
                entityId: set.set_id,
                pageName: '/trending',
                metadata: { 
                    setId: set.set_id,
                    setTitle: set.name
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
                        *
                    `)
                    .eq('user_id', user.id)
                    .eq('set_id', set.set_id);

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
        getUserVoted();
    }, [user, set]);

    const handleImageError = (itemId) => {
        setImageErrors(prev => ({
            ...prev,
            [itemId]: true
        }));
    };

    return (
        <div
            className='rounded-lg'
            key={set.id}
            onClick={(e) => handleSetClick(set, e)}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
        >
            <div className="p-4">
                <div className="mb-2">
                    <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                        {set.name}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {set.comparison_set_items?.slice(0, 4).map((it, index) => {
                        const item = it.items;
                        const itemImage = !item.image_url || (item.image_url && item.image_url.startsWith('http')) ? item.image_url : getPublicUrlItems(item.image_url);
                        const hasImageError = imageErrors[item.id];
                        
                        return (
                            <div
                                key={item.id}
                                className={`relative rounded-lg overflow-hidden text-black ${
                                    userVoted ? '' : index >= 2 ? 'blur-sm' : ''
                                }`}
                            >
                                {itemImage && !hasImageError ? (
                                    <img
                                        src={itemImage}
                                        alt={item.name}
                                        className="w-full h-24 object-cover"
                                        onError={() => handleImageError(item.id)}
                                    />
                                ) : (
                                    <div className="w-full h-24" />
                                )}
                                {((!itemImage) || hasImageError) && (
                                    <div
                                        className="absolute inset-0 flex text-center items-center justify-center text-lg font-bold pl-1 pr-1"
                                        style={{ 
                                            color: currentTheme.colors.text, 
                                            backgroundColor: !userVoted ? currentTheme.colors.card : changeColorAlpha(item.item_color_string, 0.5) 
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                )}
                                {itemImage && !hasImageError && (index < 2 || userVoted) && (
                                    <div 
                                        className="bg-black bg-opacity-50 p-1 flex items-center justify-center" 
                                        style={{ 
                                            backgroundColor: !userVoted ? currentTheme.colors.card : item.item_color_string, 
                                            color: currentTheme.colors.text 
                                        }}
                                    >
                                        <p className="text-sm truncate text-center">{item.name}</p>
                                    </div>
                                )}
                                {votedItems?.some(votedItem => votedItem.item_id === item.id) && (
                                    <div 
                                        className="absolute top-0 right-0 bg-gray-100 bg-opacity-50 p-1 rounded-full m-1" 
                                        style={{ color: currentTheme.colors.text }}
                                    >
                                        <ThumbsUp size={16} className="m-1" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center justify-between mt-4" style={{ color: currentTheme.colors.text }}>
                    <div className="flex">
                        <Avatar
                            profileImageUrl={set.user?.profile_image_url ? getPublicUrl(set.user?.profile_image_url) : null}
                            displayName={set.user?.display_name}
                            size="sm"
                            className="mr-2"
                        />
                        <div className="items-start">
                            <div className="flex flex-col">
                                <span 
                                    className="text-sm"
                                    style={{textAlign: 'start', color: currentTheme.colors.text}}
                                    onClick={() => {
                                        navigate(`/user/${set.user?.display_name}`);
                                    }}
                                >
                                    {set.user?.display_name || 'Anonymous'}
                                </span>
                                {set.end_date && (<div className="flex items-center">
                                    <span className="text-xs ">
                                        {'Ends '} <span className='font-semibold'>{formatDistanceToNow(new Date(set.end_date), { addSuffix: true })}</span>
                                    </span>
                                </div>)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4" style={{ color: currentTheme.colors.text }}>
                        {(set.total_comments || 0) > 0 && (
                            <div className="flex items-center">
                                <MessageSquare size={16} className="mr-1" />
                                <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                                    {set.total_comments || 0}
                                </span>
                            </div>
                        )}
                        {(set.total_votes || 0) > 0 && (
                            <div className="flex items-center">
                                <Users size={16} className="mr-1" />
                                <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                                    {set.total_votes || 0}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingCard; 