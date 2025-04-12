import React, { useState, useEffect } from 'react';
import { User, ThumbsUp, MessageSquare, BarChart2, Clock, Heart, Settings, Edit2 } from 'lucide-react';
import { getUserProfile } from '../services/users';
import { getUserVotes } from '../services/voting';
import { getUserReviews } from '../services/reviews';
import { getUserPolls } from '../services/polls';
import { TEMP_USER_ID } from '../lib/constants';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('votes');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVotes, setUserVotes] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [userPolls, setUserPolls] = useState([]);
  const [votesLoading, setVotesLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [pollsLoading, setPollsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      switch (activeTab) {
        case 'votes':
          setVotesLoading(true);
          try {
            const votes = await getUserVotes(TEMP_USER_ID);
            setUserVotes(votes);
          } catch (err) {
            console.error('Failed to fetch user votes:', err);
          } finally {
            setVotesLoading(false);
          }
          break;
        case 'reviews':
          setReviewsLoading(true);
          try {
            const reviews = await getUserReviews(TEMP_USER_ID);
            setUserReviews(reviews);
          } catch (err) {
            console.error('Failed to fetch user reviews:', err);
          } finally {
            setReviewsLoading(false);
          }
          break;
        case 'polls':
          setPollsLoading(true);
          try {
            const polls = await getUserPolls(TEMP_USER_ID);
            setUserPolls(polls);
          } catch (err) {
            console.error('Failed to fetch user polls:', err);
          } finally {
            setPollsLoading(false);
          }
          break;
      }
    };

    fetchUserData();
  }, [activeTab]);

  if (loading) return <div className="min-h-screen bg-black text-white p-6">Loading profile...</div>;
  if (error) return <div className="min-h-screen bg-black text-white p-6">{error}</div>;
  if (!profile) return <div className="min-h-screen bg-black text-white p-6">No profile data found</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'votes':
        if (votesLoading) return <div className="text-center py-8">Loading votes...</div>;
        if (userVotes.length === 0) return <div className="text-center py-8">No votes yet</div>;
        
        return (
          <div className="space-y-4">
            {userVotes.map((vote) => (
              <div key={vote.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{vote.title}</h3>
                    <p className="text-gray-400 text-sm">Voted for: {vote.votedFor}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-400/10 text-amber-400 rounded-full text-xs">
                    {vote.category}
                  </span>
                </div>
                <div className="flex items-center text-gray-400 text-sm mt-2">
                  <Clock size={14} className="mr-1" />
                  {formatDate(vote.date)}
                </div>
              </div>
            ))}
          </div>
        );

      case 'reviews':
        if (reviewsLoading) return <div className="text-center py-8">Loading reviews...</div>;
        if (userReviews.length === 0) return <div className="text-center py-8">No reviews yet</div>;
        
        return (
          <div className="space-y-4">
            {userReviews.map((review) => (
              <div key={review.id} className="bg-gray-900 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{review.title}</h3>
                <p className="text-gray-300 mb-3">{review.content}</p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-400">
                    <Clock size={14} className="mr-1" />
                    {formatDate(review.date)}
                  </div>
                  <div className="flex items-center text-amber-400">
                    <Heart size={14} className="mr-1" />
                    {review.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'polls':
        if (pollsLoading) return <div className="text-center py-8">Loading polls...</div>;
        if (userPolls.length === 0) return <div className="text-center py-8">No polls yet</div>;
        
        return (
          <div className="space-y-4">
            {userPolls.map((poll) => (
              <div key={poll.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{poll.title}</h3>
                    <p className="text-gray-400 text-sm">{poll.votes} votes</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    poll.status === 'active' 
                      ? 'bg-green-400/10 text-green-400' 
                      : 'bg-gray-400/10 text-gray-400'
                  }`}>
                    {poll.status}
                  </span>
                </div>
                <div className="flex items-center text-gray-400 text-sm mt-2">
                  <Clock size={14} className="mr-1" />
                  {formatDate(poll.date)}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <p className="text-gray-400">{profile.email}</p>
                <p className="text-gray-300 mt-2">{profile.bio || 'No bio yet'}</p>
                <p className="text-gray-400 text-sm mt-2">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
              <Settings size={20} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.votes_count || 0}</div>
              <div className="text-gray-400 text-sm">Votes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.reviews_count || 0}</div>
              <div className="text-gray-400 text-sm">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.polls_count || 0}</div>
              <div className="text-gray-400 text-sm">Polls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.likes_count || 0}</div>
              <div className="text-gray-400 text-sm">Likes</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('votes')}
            className={`pb-2 px-4 ${
              activeTab === 'votes'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <ThumbsUp size={18} className="mr-2" />
              Votes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 px-4 ${
              activeTab === 'reviews'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <MessageSquare size={18} className="mr-2" />
              Reviews
            </div>
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`pb-2 px-4 ${
              activeTab === 'polls'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <BarChart2 size={18} className="mr-2" />
              Polls
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile; 