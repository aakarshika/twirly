import React, { useState } from 'react';
import ActivityOverview from '../ActivityOverview';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserProfile } from '../../../services/users';
import { getWeeklyActivity, getCategoryDistribution, getRecentActivities, getActivityTrends } from '../../../services/activity';

const OverviewTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({});

  const [activityData, setActivityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [trends, setTrends] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          userProfile,
          weeklyActivity,
          categoryDistribution,
          recentActivitiesData,
          activityTrends
        ] = await Promise.all([
          getUserProfile(user.id),
          getWeeklyActivity(user.id),
          getCategoryDistribution(user.id),
          getRecentActivities(user.id),
          getActivityTrends(user.id)
        ]);

        setUserData(userProfile);
        setActivityData(weeklyActivity);
        setCategoryData(categoryDistribution);
        setRecentActivities(recentActivitiesData);
        setTrends(activityTrends);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    
    <div className="mt-8">
    <ActivityOverview
      votesCount={userData.votes_count}
      reviewsCount={userData.reviews_count}
      productsCount={userData.products_count}
      comparisonsCount={userData.comparisons_count}
      likesCount={userData.likes_count}
      recentActivities={recentActivities}
      trends={trends}
      activityData={activityData}
      categoryData={categoryData}
    />
  </div>
  );
};

export default OverviewTab; 