import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRight, ChartArea, Heart, MessageSquare } from 'lucide-react';
import Button from '../common/Button';
import { getPublicUrl } from '../../lib/utils';
import Comment from './Comment';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';
import LoadingOrError from '../common/LoadingOrError';
import CommentHeader from './CommentHeader';
import { useNavigate } from 'react-router-dom';
const ComparisonSetAspectsCommentsSection = ({ userVoted, aspectSetId, items, aspectSet }) => {
  const { user } = useAuth();
  const {
    comments,
    loading,
    error,
    commentVisibility,
    setCommentVisibility,
    handleSubmitComment,
    handleLikeComment,
    loadMore,
    setLoading,
    setError,
    fetchComments,
    handleReply,
    setPage,
    hasMore
  } = useComments(aspectSetId, user?.id);
  const { currentTheme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [userPreferences, setUserPreferences] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user preferences
        const { data: profile, error: profileError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        setUserPreferences(profile);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    // Fetch users for mentions
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id, display_name, username')
        .limit(10);

      if (!error && data) {
        setUsers(data.map(user => ({
          id: user.user_id,
          display: user.display_name || user.username,
          username: user.username
        })));
      }
    };

    fetchUsers();
  }, []);

  const onSubmitComment = () => {
    console.log('onSubmitComment', newComment);
    handleSubmitComment(newComment);
    setNewComment('');
  };
  useEffect(() => {
    if (aspectSetId) {
      setPage(1);
      fetchComments();
    }
  }, [aspectSetId]);

  if (loading) {
    return (
      <LoadingOrError type="loading" />
    );
  }

  if (error) {
    return (
      <LoadingOrError type="error" />
    );
  }

  return (
    <div className="space-y-2" >
      <div className="text-center w-full" >
        <div className="flex  w-full">
          <div className="flex-1 text-md">
            <CommentHeader
              type="Comment"
              comment={aspectSet}
              onLike={handleLikeComment}
              replyClicked={() => {
              }}
              profile_image_url={aspectSet?.comparison_sets?.user?.profile_image_url}
              display_name={aspectSet?.comparison_sets?.user?.display_name}
              created_at={aspectSet?.comparison_sets?.created_at}
              text={aspectSet?.comparison_sets?.description}
              userReaction={aspectSet?.comparison_sets?.userReaction}
              reactions={aspectSet?.comparison_sets?.reactions}
              numReplies={comments?.length}
            />
          </div>
          {userVoted && (<button
            onClick={() => navigate('/comparison/' + aspectSet?.comparison_sets?.id)}
            className=" w-auto pull-right rounded-md "
          >
            <span className="flex text-sm items-center gap-2" style={{ color: currentTheme.colors.primary }}>See <br></br>Comparison
              <ChartArea size={16} /></span>
          </button>)}
        </div>
        {userVoted && (<CommentForm
          newComment={newComment}
          setNewComment={setNewComment}
          handleSubmitComment={onSubmitComment}
          users={users}
          itemsssss={items}
          userPreferences={userPreferences}
          type="Comment"
        />)}
        {userVoted && (comments.map((comment) => {
          const toggleVisibility = () => {
            setCommentVisibility(prev => ({
              ...prev,
              [comment.id]: !prev[comment.id]
            }));
          };
          return (
            <div key={comment.id}>

              <Comment
                comment={comment}
                onLike={handleLikeComment}
                onToggleVisibility={toggleVisibility}
                isVisible={commentVisibility[comment.id]}
                items={items}
                users={users}
                handleReply={handleReply}
                userPreferences={userPreferences}
              />
            </div>
          )
        }))}

        {hasMore && (
          <div className="text-start ml-4 mb-4" style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <Button onClick={loadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonSetAspectsCommentsSection;
