import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import CommentForm from './CommentForm';
import CommentTreeNode, { getTailAndDepth, getBranchReplyCount } from './CommentTreeNode';
import * as commentApi from '../../utils/commentApi';
import { isNewsUnavailableCommentError } from '../../utils/commentUtils';

const MAX_REPLY_DEPTH = 5;

/** Load replies đệ quy đến tối đa 5 tầng (dừng khi currentDepth > 5), lưu repliesData[parentId] = Comment[] */
const loadRepliesRecursive = async (newsId, parentId, currentDepth, repliesData) => {
  if (currentDepth > MAX_REPLY_DEPTH) return;
  try {
    const res = await commentApi.getComments(newsId, parentId);
    const children = res.status === 'OK' ? (res.data || []) : [];
    repliesData[parentId] = children;
    for (const child of children) {
      await loadRepliesRecursive(newsId, child._id, currentDepth + 1, repliesData);
    }
  } catch (err) {
    console.error(`Error loading replies for comment ${parentId}:`, err);
    repliesData[parentId] = repliesData[parentId] || [];
  }
};

const CommentSection = ({ newsId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const isAdmin = user?.role === 'admin' || localStorage.getItem('role') === 'admin';

  const handleToggleExpand = useCallback((commentId) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  }, []);

  const loadComments = useCallback(async () => {
    if (!newsId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await commentApi.getComments(newsId, null);

      if (response.status === 'OK') {
        const rootComments = response.data || [];
        setComments(rootComments);

        const repliesData = {};
        for (const comment of rootComments) {
          await loadRepliesRecursive(newsId, comment._id, 1, repliesData);
        }
        setReplies(repliesData);
      } else {
        setError(response.message || 'Unable to load comments');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      let errorMessage = err.response?.data?.message || 'Unable to load comments.';

      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please:\n1. Restart the backend if needed\n2. Ensure route /api/news-comments/:newsId is registered\n3. Confirm the server is running on the correct port (3001)';
        console.error('🔴 404 Error - Backend route not found:', {
          endpoint: `/api/news-comments/${newsId}`,
          suggestion: 'Check if backend server is running and routes are registered'
        });
      }

      setError(errorMessage);

      if (err.response?.status === 404) {
        toast.error('API endpoint not found. Please check that the backend server is running.', {
          autoClose: 5000,
        });
      } else if (err.response?.status !== 404) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [newsId]);

  const refreshRepliesSubtree = useCallback(
    async (parentId) => {
      if (!newsId || !parentId) return;
      const subtree = {};
      await loadRepliesRecursive(newsId, parentId, 1, subtree);
      setReplies((prev) => ({ ...prev, ...subtree }));
    },
    [newsId]
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Create new comment
  const handleCreateComment = async (content, parentId = null) => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to comment');
      return;
    }

    try {
      setSubmitting(true);

      const response = await commentApi.createComment(newsId, content, parentId);

      if (response.status === 'OK') {
        toast.success(parentId ? 'Reply posted successfully' : 'Comment posted successfully');
        if (parentId) {
          await refreshRepliesSubtree(parentId);
        } else {
          await loadComments();
        }
      } else {
        toast.error(response.message || 'Unable to post comment');
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      let errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      
      // Handle 404 specifically with helpful message
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please:\n1. Restart the backend server\n2. Check route POST /api/news-comments/:newsId\n3. Confirm the server is running on port 3001';
        console.error('🔴 404 Error - Backend route not found:', {
          endpoint: `POST /api/news-comments/${newsId}`,
          suggestion: 'Backend needs to be restarted after adding routes'
        });
        toast.error('API endpoint not found. Please check that the backend server has been restarted.', {
          autoClose: 6000,
        });
        return; // Don't show duplicate error
      }
      
      // Handle spam error with special message
      if (errorMessage.includes('quá nhanh') || /too fast|too quickly|rate limit/i.test(errorMessage)) {
        toast.error(errorMessage, {
          autoClose: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId, newContent) => {
    try {
      setSubmitting(true);

      const response = await commentApi.updateComment(commentId, newContent);

      if (response.status === 'OK') {
        toast.success('Comment updated successfully');
        await loadComments(); // Refresh comments
      } else {
        toast.error(response.message || 'Unable to update comment');
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      let errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Something went wrong. Please try again.';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Check that the backend exposes PUT /api/news-comments/:id or /news-comments/:id';
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      setSubmitting(true);

      const response = await commentApi.deleteComment(commentId);

      if (response.status === 'OK') {
        toast.success('Comment deleted successfully');
        await loadComments(); // Refresh comments
      } else {
        toast.error(response.message || 'Unable to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      let errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Check that the backend exposes DELETE /api/news-comments/:id or /news-comments/:id';
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Moderate comment (admin only)
  const handleModerateComment = async (commentId, newStatus) => {
    try {
      setSubmitting(true);

      const response = await commentApi.moderateComment(commentId, newStatus);

      if (response.status === 'OK') {
        toast.success(newStatus === 'HIDDEN' ? 'Comment hidden successfully' : 'Comment shown successfully');
        await loadComments(); // Refresh comments
      } else {
        toast.error(response.message || 'Unable to complete action');
      }
    } catch (err) {
      console.error('Error moderating comment:', err);
      let errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Check PUT /api/news-comments/:id/moderate or /news-comments/:id/moderate';
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply
  const handleReply = async (parentId, content, parentUserName) => {
    await handleCreateComment(content, parentId);
  };

  if (loading) {
    return (
      <div className="comment-section py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Bài đã xóa mềm / không tồn tại: không hiển thị form comment (theo spec soft delete)
  if (error && isNewsUnavailableCommentError(error)) {
    return (
      <div className="comment-section py-8 border-t border-gray-200 mt-12">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="comment-section py-8 border-t border-gray-200 mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {isAuthenticated() ? (
        <div className="mb-8">
          <CommentForm
            onSubmit={(content) => handleCreateComment(content, null)}
            placeholder="Write a comment..."
            isLoading={submitting}
          />
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            Please{' '}
            <a href="/login" className="text-green-600 hover:text-green-700 font-semibold">
              sign in
            </a>{' '}
            to comment
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-2">No comments yet</p>
          <p className="text-gray-500">Be the first to comment!</p>
        </div>
      ) : (
        <div className="comments-list space-y-6">
          {comments.map((comment) => {
            const { tail, depth: tailDepth } = getTailAndDepth(comment, replies);
            const branchReplyCount = getBranchReplyCount(comment, replies);
            return (
              <CommentTreeNode
                key={comment._id}
                comment={comment}
                depth={0}
                tailId={tail._id}
                tailDepth={tailDepth}
                branchReplyCount={branchReplyCount}
                replies={replies}
                expandedReplies={expandedReplies}
                onToggleExpand={handleToggleExpand}
                onReply={handleReply}
                onEdit={handleUpdateComment}
                onDelete={handleDeleteComment}
                onModerate={handleModerateComment}
                currentUser={user}
                isAdmin={isAdmin}
                adminMode={false}
                isLoading={submitting}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
