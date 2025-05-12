import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import CommentForm from '../../components/common/comments/CommentForm';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRight, ChartArea, Heart, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import { getPublicUrl } from '../../lib/utils';
import Comment from '../../components/common/comments/Comment';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';
import LoadingOrError from '../../components/common/LoadingOrError';
import CommentHeader from '../../components/common/comments/CommentHeader';
import { useNavigate } from 'react-router-dom';
const ComparisonSetAspectsCommentsSection = ({ userVoted, aspectSetId, items, aspectSet, handleLikeComparisonAspectSet }) => {
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
          display:  user.display_name,
          email: user.username
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

  console.log('userReaction', aspectSet);
  console.log('reactions', aspectSet);
  return (
    <div className="space-y-2" >
      <div className="text-center w-full" >
        <div className="flex flex-col w-full">
          <div className="flex  w-full">
            <div className="flex-1 text-md">

              <CommentHeader
                type="Comment"
                comment={aspectSet}
                onLike={handleLikeComparisonAspectSet}
                replyClicked={() => {
                }}
                profile_image_url={aspectSet?.comparison_sets?.user?.profile_image_url}
                display_name={aspectSet?.comparison_sets?.user?.display_name}
                created_at={aspectSet?.comparison_sets?.created_at}
                text={aspectSet?.description}
                userReaction={aspectSet?.userReaction}
                reactions={aspectSet?.reactions}
                objectId={aspectSetId}
                numReplies={comments?.length}
                items={items}
              />
              {userVoted && (<div className="flex-1 text-md">
                <div
                  onClick={() => navigate('/comparison/' + aspectSet?.comparison_sets?.id)}
                  className=" flex justify-between  rounded-md p-2"
                  style={{ backgroundColor: currentTheme.colors.backgroundColor, color: currentTheme.colors.primary }}
                >
                  <span className="text-sm text-bold" style={{ color: currentTheme.colors.primary }}>See Comparison
                    </span>
                    <ChartArea size={20} style={{ color: currentTheme.colors.primary }} />
                </div>
              </div>)}
            </div>
          </div>
          <div className="flex bg-gray-200 h-1 w-full"></div>

        </div>
        {
        userVoted && 
        (<CommentForm
          newComment={newComment}
          setNewComment={setNewComment}
          handleSubmitComment={onSubmitComment}
          users={users}
          items={items}
          userPreferences={userPreferences}
          type="Comment"
        />)}
        {
        userVoted && 
        (comments.map((comment) => {
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
              {loading ? 'Loading comments...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonSetAspectsCommentsSection;
