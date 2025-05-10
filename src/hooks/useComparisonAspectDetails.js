import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getVoteCount, hasUserVoted } from '../services/voting';
import { getItemReviews, getItemAverageMetrics } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

export const useComparisonAspectDetails = (id) => {
  
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentSet, setCurrentSet] = useState(null);
  const [currentAspectSet, setCurrentAspectSet] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageMetrics, setAverageMetrics] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVoted, setUserVoted] = useState(false);
  const [votedItemId, setVotedItemId] = useState(null);
  const fetchComparisonDetails = async () => {
    try {
      setLoading(true);
      console.log('id fetchComparisonDetails', id);
      const comparisonId = parseInt(id);
      if (isNaN(comparisonId)) {
        throw new Error('Invalid comparison aspect set ID');
      }
      
      const defaultMetrics = {
        quality: 3.5,
        value: 3.5,
        design: 3.5,
        performance: 3.5
      };
      console.log('comparisonId', comparisonId);
      const { data, error } = await supabase
        .from('comparison_set_aspects')
        .select(`
          *,
          reactions:comparison_set_comment_reactions(reaction_type, user_id),
          comparison_sets(
            *,
            user:user_preferences(*),
            comparison_set_items(
              *,
              items(*,votes(*))
            )
          )
        `)
        .eq('id', comparisonId)
        .eq('comparison_sets.comparison_set_items.items.votes.set_id', comparisonId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Comparison not found');

      setCurrentSet(data.comparison_sets);
      setCurrentAspectSet({...data, userReaction: data.reactions.find(r => r.user_id === user.id)?.reaction_type});
      setItems(data.comparison_sets.comparison_set_items);
      setTotalVotes(data.comparison_sets.comparison_set_items.reduce((acc, item) => acc + item.items.votes.length, 0));
      
      // Only check user votes if user is logged in
      if (user) {
        const userVoted = data.comparison_sets.comparison_set_items.some(item => 
          item.items.votes.some(vote => vote.user_id === user.id)
        );
        const votedItemId = data.comparison_sets.comparison_set_items.find(item => 
          item.items.votes.some(vote => vote.user_id === user.id)
        )?.items.id;

        setUserVoted(userVoted);
        setVotedItemId(votedItemId);
      } else {
        setUserVoted(false);
        setVotedItemId(null);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  //handle vote - update votes table using user id, item id and set id = comparisonId
  const handleVote = async (itemId) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          item_id: itemId,
          set_id: id
        })
        .select();
      if (error) throw error;
      console.log('Vote inserted:', data);  
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      //update userVoted and votedItemId
      setUserVoted(true);
      setVotedItemId(itemId);
      setItems(items.map(item => item.items.id === itemId ? {...item, items: {...item.items, votes: [...item.items.votes, {user_id: user.id, item_id: itemId, set_id: id}]}} : item));
      setTotalVotes(items.reduce((acc, item) => acc + item.items.votes.length, 0));
    }
  };
  const handleLikeComparisonAspectSet = async (id, type) => {
    console.log('handleLikeComparisonAspectSet', id, type);
    const hasLiked = currentAspectSet.reactions?.find(r => r.user_id === user.id)?.reaction_type === 'like';
    if (hasLiked) {
      await supabase
        .from('comparison_set_comment_reactions')
        .delete()
        .eq('aspect_set_id', id)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('comparison_set_comment_reactions')
        .insert([{ aspect_set_id: id, user_id: user.id, reaction_type: 'like' }]);
    }
    setCurrentAspectSet(prev => ({...prev, 
      userReaction: hasLiked ? null : 'like',
      reactions: hasLiked ? prev.reactions.filter(r => r.user_id !== user.id) : [...prev.reactions, {user_id: user.id, reaction_type: 'like'}]
    }));
  };
  const handleRevertVote = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', votedItemId)
        .eq('set_id', id)
        .select();
      if (error) throw error;
      console.log('Vote reverted:', data);
    } catch (error) {
      console.error('Error reverting vote:', error);
    } finally {
      setUserVoted(false);
      setVotedItemId(null);
      setItems(items.map(item => ({...item, items: {...item.items, votes: item.items.votes.filter(vote => vote.user_id !== user.id)}})));
      setTotalVotes(items.reduce((acc, item) => acc + item.items.votes.length, 0));
    }
  };
  return { loading, error, items, currentSet, currentAspectSet, reviews, averageMetrics, totalVotes, userVoted, votedItemId, handleVote, handleRevertVote, fetchComparisonDetails, handleLikeComparisonAspectSet };
}; 