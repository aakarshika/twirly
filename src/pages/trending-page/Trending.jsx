import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import { MessageSquare, TrendingUp, Users } from 'lucide-react';
import { COMPARISON_COLOR_SET } from '../../lib/constants';
import { randomPastelColor, splitAndJoin } from '../../lib/utils';
import TrendingCard from '../../components/common/common-cards/TrendingCard';
import TrendingCardCommon from '../../components/common/common-cards/TrendingCardCommon';

const Trending = () => {
  const [trendingSets, setTrendingSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isHeaderVisible } = useHeader();

  useEffect(() => {
    const fetchTrendingSets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .rpc('fetch_popular_aspect_sets_for_user', { v_user_id: user.id })
          // .from('popular_comparison_sets')
          .select(`
            *,
            user:user_preferences(*),
            comparison_set_items (
            
              items (
                id,
                name,
                image_url,
                item_color_string
              )
            )
          `)
          // .eq('user_id_voted', user.id)
          .limit(20);

        if (error) throw error;
        


        setTrendingSets(data);
      } catch (err) {
        console.error('Error fetching trending sets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingSets();
  }, []);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto transition-transform duration-300" 
               style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4" style={{ color: 'var(--color-text)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center animate-fade-in">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen mx-auto transition-all duration-200 ease-in-out"
      style={{ 
        position: 'relative',
        backgroundColor: 'var(--color-background)'
      }}
    >
      <div 
        className="container mx-auto transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: 'var(--color-card)'
        }}
      >
        <div 
          className="border-b transition-colors duration-200" 
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="space-y-4 p-4 md:p-6 lg:p-8">
            {trendingSets.map((set) => (
              <div 
                key={set.aspect_set_id}
                className="transition-transform duration-200 hover:scale-[1.02]"
              >
                <TrendingCardCommon set={set} from={'trending'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending; 