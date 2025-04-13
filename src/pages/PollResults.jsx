import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComparison } from '../contexts/ComparisonContext';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart, RadarChart, HeatMap, CombinedBarChart, StackedBarChart, SideBySideBarChart } from '../components/results/visualizations';
import { supabase } from '../lib/supabase'; // Import supabase for data fetching
import { getItemAverageMetrics } from '../services/reviews';
import ComparisonGrid from '../components/comparison/ComparisonGrid';

const PollResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    items,
    setItems ,
    userVoted,
    setUserVoted,
    votedItemId,
    setVotedItemId,
    setCurrentSetId,
  } = useComparison();
  const { currentTheme } = useTheme();
  const [activeVisualization, setActiveVisualization] = useState('radar');
  const [loading, setLoading] = useState(true);
  const [comparisonName, setComparisonName] = useState('');
  const [error, setError] = useState(null);

  // If user hasn't voted, redirect to comparison page
  // if (!userVoted) {
  //   navigate(`/comparison/${id}`);
  //   return null;
  // }

  // Fetch comparison set data
  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
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
                company_id,
                companies(name)
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Set the comparison name
        if (data.name) {
          setComparisonName(data.name);
          console.log('Set comparisonName to:', data.name);
        } else {
          console.warn('No name found for comparison set:', data.id);
          setComparisonName('Untitled Comparison');
        }
        // Transform the data to match our UI structure
        const processedItems = await Promise.all(data.comparison_set_items.map(async setItem => {
          const item = setItem.items;
          const averageMetrics = await getItemAverageMetrics(item.id);
          
          // Transform metrics to match the expected structure
          const transformedMetrics = {};
          Object.entries(averageMetrics).forEach(([metricName, metricData]) => {
            transformedMetrics[metricName] = {
              average: ((metricData.average-3 )*5/2) || 0,
              originalAverage: ((metricData.average)) || 0,
              totalReviews: metricData.totalReviews || 0
            };
          });

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.image_url,
            company: item.companies?.name || 'Unknown Company',
            averageMetrics: transformedMetrics,
            category: data.categories?.name || 'Uncategorized'
          };
        }));

        // Sort items by average rating
        processedItems.sort((a, b) => {
          const ratingA = a.averageMetrics.rating?.average || 0;
          const ratingB = b.averageMetrics.rating?.average || 0;
          return ratingB - ratingA;
        });

        setItems(processedItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [id]);

  const visualizations = [
    { id: 'radar', name: 'Radar Chart', component: RadarChart },
    { id: 'bar', name: 'Bar Chart', component: BarChart },
    { id: 'combined-bar', name: 'Combined Bar Chart', component: CombinedBarChart },
    { id: 'stacked-bar', name: 'Stacked Bar Chart', component: StackedBarChart },
    { id: 'side-by-side-bar', name: 'Side By Side Bar Chart', component: SideBySideBarChart },
    { id: 'heatmap', name: 'Heat Map', component: HeatMap },
    // { id: 'scorecard', name: 'Score Cards', component: ScoreCard },
    // { id: 'timeline', name: 'Metric Timeline', component: MetricTimeline }
  ];

  const ActiveVisualization = visualizations.find(v => v.id === activeVisualization)?.component;

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      <main className="p-6 max-w-7xl mx-auto">

        {/* Show comparison grid with title */}
        <div className="max-w-4xl mx-auto">
          <ComparisonGrid title={comparisonName} />
        </div>
        {/* Loading State */}
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}

        {/* Visualization Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {visualizations.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => setActiveVisualization(id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeVisualization === id
                  ? 'bg-amber-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Active Visualization */}
        {ActiveVisualization && (
          <div className="bg-gray-900 rounded-xl p-6">
            <ActiveVisualization items={items} />
          </div>
        )}
      </main>
    </div>
  );
};

export default PollResults; 