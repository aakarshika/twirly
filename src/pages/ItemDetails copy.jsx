import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ComparisonGrid from '../components/comparison/ComparisonGrid';
import ResultsPanel from '../components/comparison/ResultsPanel';
import ReviewModal from '../components/comparison/ReviewModal';
import ComparisonHeader from '../components/comparison/ComparisonHeader';
import ComparisonGridSkeleton from '../components/skeletons/ComparisonGridSkeleton';
import ResultsPanelSkeleton from '../components/skeletons/ResultsPanelSkeleton';
import { useComparison } from '../contexts/ComparisonContext';
import { getVoteCount, hasUserVoted } from '../services/voting';
import { TEMP_USER_ID } from '../lib/constants';
import { useComparisonDetails } from '../hooks/useComparisonDetails';
import { useTheme } from '../contexts/ThemeContext';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    items, 
    setItems, 
    customMode, 
    completedSets, 
    activeReviewItem, 
    userVoted, 
    setUserVoted,
    votedItemId,
    setVotedItemId,
    setCurrentSetId,
    currentSetId
  } = useComparison();
  const { nextPollId } = useComparisonDetails(id);
  const [comparisonName, setComparisonName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTheme } = useTheme();

  // Function to fetch and update vote counts for all items
  const fetchVoteCounts = async (setId) => {
    try {
      const updatedItems = await Promise.all(items.map(async item => {
        const voteCount = await getVoteCount(item.id, setId);
        return {
          ...item,
          votes: voteCount || 0
        };
      }));
      setItems(updatedItems);
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  useEffect(() => {
    const fetchComparisonDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert id to integer
        const comparisonId = parseInt(id);
        if (isNaN(comparisonId)) {
          throw new Error('Invalid comparison ID');
        }
        
        // Fetch comparison details with related data
        const { data, error } = await supabase
          .from('comparison_sets')
          .select(`
            id,
            name,
            category_id,
            created_at,
            categories(name),
            comparison_set_items(
              item_id,
              items(
                id,
                name,
                description,
                image_url,
                item_metrics(
                  views,
                  comparisons,
                  reviews,
                  rating
                )
              )
            )
          `)
          .eq('id', comparisonId)
          .single();

        if (error) {
          console.error('Error fetching comparison:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Comparison not found');
        }

        console.log('Fetched comparison data:', data);
        
        // Set the comparison name
        if (data.name) {
          setComparisonName(data.name);
          console.log('Set comparisonName to:', data.name);
        } else {
          console.warn('No name found for comparison set:', data.id);
          setComparisonName('Untitled Comparison');
        }

        // Set the current set ID
        setCurrentSetId(data.id);
        console.log('Set currentSetId to:', data.id);

        // Transform the data to match our UI structure
        const items = await Promise.all(data.comparison_set_items?.map(async setItem => {
          try {
            // Get the vote count for this item
            const voteCount = await getVoteCount(setItem.items.id, data.id);
            
            return {
              id: setItem.items.id,
              name: setItem.items.name,
              description: setItem.items.description,
              image: setItem.items.image_url,
              category: data.categories?.name || 'Uncategorized',
              votes: voteCount || 0
            };
          } catch (err) {
            console.error('Error fetching data for item:', err);
            return null;
          }
        }) || []);

        // Filter out any null items and set the items
        setItems(items.filter(item => item !== null));
        
        // Check if user has already voted
        const hasVoted = await hasUserVoted(data.id);
        setUserVoted(hasVoted);
        
        if (hasVoted) {
          const { data: voteData } = await supabase
            .from('votes')
            .select('item_id')
            .eq('user_id', TEMP_USER_ID)
            .eq('set_id', data.id)
            .single();
            
          if (voteData) {
            setVotedItemId(voteData.item_id);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error in fetchComparisonDetails:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchComparisonDetails();
    }
  }, [id, setItems, setUserVoted, setVotedItemId, setCurrentSetId]);

  const handleNextPoll = () => {
    if (nextPollId) {
      navigate(`/comparison/${nextPollId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
        <main className="p-6 max-w-6xl mx-auto w-full flex-1">
          <ComparisonHeader nextPollId={nextPollId} />
          <ComparisonGridSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
        <main className="p-6 max-w-6xl mx-auto w-full flex-1">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }}>
      <main className="p-6 max-w-6xl mx-auto w-full flex-1">
        <ComparisonHeader nextPollId={nextPollId} />

        {/* Show completed results if any exist */}
        {completedSets.length > 0 && !customMode && (
          <ResultsPanel />
        )}
        
        {/* Show comparison grid with title */}
        <ComparisonGrid title={comparisonName} />

        {/* Show review modal when active */}
        <ReviewModal />
      </main>
    </div>
  );
};

export default ItemDetails; 