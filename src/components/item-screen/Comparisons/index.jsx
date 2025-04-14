import React from 'react';
import TopComparisons from './TopComparisons';
import RelatedComparisons from './RelatedComparisons';

const Comparisons = ({ comparisons }) => {
  // Create placeholder comparisons if none exist
  const placeholderComparisons = [
    {
      id: 'placeholder1',
      name: 'Top Gaming Laptops',
      vote_count: 150,
      items: [
        { id: 1, name: 'Dell XPS 15', image: 'https://via.placeholder.com/100' },
        { id: 2, name: 'MacBook Pro', image: 'https://via.placeholder.com/100' },
        { id: 3, name: 'Lenovo Legion', image: 'https://via.placeholder.com/100' }
      ]
    },
    {
      id: 'placeholder2',
      name: 'Best Smartphones 2024',
      vote_count: 120,
      items: [
        { id: 4, name: 'iPhone 15', image: 'https://via.placeholder.com/100' },
        { id: 5, name: 'Samsung S24', image: 'https://via.placeholder.com/100' },
        { id: 6, name: 'Google Pixel 8', image: 'https://via.placeholder.com/100' }
      ]
    },
    {
      id: 'placeholder3',
      name: 'Top Wireless Earbuds',
      vote_count: 90,
      items: [
        { id: 7, name: 'AirPods Pro', image: 'https://via.placeholder.com/100' },
        { id: 8, name: 'Sony WF-1000XM5', image: 'https://via.placeholder.com/100' },
        { id: 9, name: 'Bose QuietComfort', image: 'https://via.placeholder.com/100' }
      ]
    }
  ];

  // Use placeholder comparisons if no real comparisons exist
  const effectiveComparisons = placeholderComparisons;

  // Sort comparisons by vote count to get top comparisons
  const topComparisons = [...effectiveComparisons]
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 3);

  // Get IDs of top comparisons
  const topComparisonIds = topComparisons.map(comp => comp.id);

  // Get related comparisons (excluding top comparisons)
  const relatedComparisons = effectiveComparisons
    .filter(comp => !topComparisonIds.includes(comp.id))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Comparisons</h2>
      <div className="space-y-8">
        <div className="flex overflow-x-auto pb-4 space-x-4">
          {topComparisons.map((comparison) => (
            <div key={"topComparisons"+comparison.id} className="flex-shrink-0 w-80">
              <TopComparisons comparisons={[comparison]} />
            </div>
          ))}
        </div>
        <div className="flex overflow-x-auto pb-4 space-x-4">
          {relatedComparisons.map((comparison) => (
            <div key={"relatedComparisons"+comparison.id} className="flex-shrink-0 w-80">
              <RelatedComparisons comparisons={[comparison]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comparisons; 