import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const SupabaseTest = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log('Attempting to fetch items from Supabase...');
        
        const { data, error } = await supabase
          .from('test_items')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Supabase response:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          throw new Error('No data returned from Supabase');
        }

        setItems(data);
      } catch (err) {
        console.error('Error in fetchItems:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="text-white">
        <p>Loading...</p>
        <p className="text-sm text-gray-400">Connecting to Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <p className="text-sm mt-2">
          Please check your Supabase configuration and make sure the test_items table exists.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-4">Supabase Test</h2>
      {items.length === 0 ? (
        <p className="text-gray-400">No items found in the database.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-white">{item.name}</h3>
              <p className="text-gray-400">{item.description}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupabaseTest; 