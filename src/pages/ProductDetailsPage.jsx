import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { RadarChart } from '../components/results/visualizations';

const ProductDetailsPage = () => {
  const { itemId } = useParams();
  const { currentTheme } = useTheme();
  const [item, setItem] = useState(null);
  const [comparisonSets, setComparisonSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetailsPage = async () => {
      try {
        // Fetch item details
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*')
          .eq('id', itemId)
          .single();

        if (itemError) throw itemError;
        if (!itemData) {
          setError('Item not found');
          setLoading(false);
          return;
        }
        setItem(itemData);

        // Fetch comparison sets where this item appears
        const { data: setsData, error: setsError } = await supabase
          .from('comparison_sets')
          .select(`
            *,
            currentitem:comparison_set_items!inner(items(*)),
            allitems:comparison_set_items(items(*)),
            comparison_set_aspects(
                *,
                comparison_set_comments(*),
                votes(*)
            )
          `)
          .eq('comparison_set_items.item_id', itemId);

        if (setsError) throw setsError;
        
        console.log(setsData);
        
        // Process the data for radar chart
        const processRadarData = (set) => {
          const items = set.allitems.map(item => item.items);
          const aspects = set.comparison_set_aspects;
          
          const radarData = items.map(item => {
            const metrics = {};
            aspects.forEach(aspect => {
              const totalVotes = aspect.votes.length;
              const itemVotes = aspect.votes.filter(vote => vote.item_id === item.id).length;
              metrics[aspect.metric_name] = (itemVotes / totalVotes) * 100;
            });
            return {
              id: item.id,
              name: item.name,
              metrics
            };
          });
          
          return {
            setTitle: set.name,
            aspects: aspects.map(aspect => ({
              name: aspect.metric_name,
              description: aspect.description
            })),
            items: radarData
          };
        };

        const processedData = setsData.map(processRadarData);
        console.log('Processed Radar Data:', processedData);
        
        setComparisonSets(setsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductDetailsPage();
  }, [itemId]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!item) return <div className="p-4">Product not found</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
          {item.name}
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Comparison Analysis
          </h2>
          <div className="grid gap-4">
            {comparisonSets.map((set) => (
              <div key={set.id} className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.card }}>
                <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                  {set.name}
                </p>
                <p className="text-xs mt-2" style={{ color: currentTheme.colors.textSecondary }}>
                  {set?.comparison_set_aspects?.length || 0} aspects compared • 
                  {set?.comparison_set_aspects.reduce((acc, aspect) => {
                          const totalVotes = aspect.votes.length;
                          return totalVotes;
                        }, {})} votes
                </p>
                <div className="mt-4">
                  <RadarChart 
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
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Mentioned In
          </h2>
          <div className="grid gap-4">
            {comparisonSets.map((set) => (
              <div key={set.id} className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.card }}>
                <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                  {set.description}
                </p>
                <p className="text-xs mt-2" style={{ color: currentTheme.colors.textSecondary }}>
                  {set.comparison_set_comments?.length || 0} comments
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage; 