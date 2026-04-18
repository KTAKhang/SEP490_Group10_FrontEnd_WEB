import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import CommentForm from './CommentForm';
import CommentTreeNode, { getTailAndDepth, getBranchReplyCount } from './CommentTreeNode';
import { MessageSquare, Filter, Eye, EyeOff } from 'lucide-react';
import * as commentApi from '../../utils/commentApi';
import { isNewsUnavailableCommentError } from '../../utils/commentUtils';

const MAX_REPLY_DEPTH = 5;

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

const AdminCommentSection = ({ newsId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedReplies, setExpandedReplies] = useState({});

  const isAdmin = true;

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
      const errorMessage = err.response?.data?.message || 'Unable to load comments';
      setError(errorMessage);

      if (err.response?.status === 404) {
        toast.error('API endpoint not found. Check that the backend exposes GET /api/news-comments/:newsId or /news-comments/:newsId');
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

  // Filter comments by status
  const filterComments = (commentList) => {
    if (filterStatus === 'ALL') return commentList;
    return commentList.filter(comment => comment.status === filterStatus);
  };

  // Create new comment (admin can create comments)
  const handleCreateComment = async (content, parentId = null) => {
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
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Check POST /api/news-comments/:newsId or /news-comments/:newsId';
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Update comment — chỉ chủ comment (PUT); admin không sửa thay nội dung comment khách
  const handleUpdateComment = async (commentId, newContent) => {
    try {
      setSubmitting(true);

      const response = await commentApi.updateComment(commentId, newContent);

      if (response.status === 'OK') {
        toast.success('Comment updated successfully');
        await loadComments();
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
        errorMessage = 'API endpoint not found. Check PUT /api/news-comments/:id or /news-comments/:id';
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // No-op for delete: admin chỉ ẩn (moderate), không xóa mềm
  const handleDeleteCommentNoOp = () => {};

  // Moderate comment (ẩn / hiện)
  const handleModerateComment = async (commentId, newStatus) => {
    try {
      setSubmitting(true);

      const response = await commentApi.moderateComment(commentId, newStatus);

      if (response.status === 'OK') {
        toast.success(newStatus === 'HIDDEN' ? 'Comment hidden successfully' : 'Comment shown successfully');
        await loadComments();
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

  // Statistics: VISIBLE / HIDDEN; DELETED kept for legacy data display
  const stats = {
    total: comments.length,
    visible: comments.filter(c => c.status === 'VISIBLE').length,
    hidden: comments.filter(c => c.status === 'HIDDEN').length,
  };

  const filteredComments = filterComments(comments);

  if (loading) {
    return (
      <div className="admin-comment-section py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && isNewsUnavailableCommentError(error)) {
    return (
      <div className="admin-comment-section py-8 border-t border-gray-200 mt-8">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-comment-section py-8 border-t border-gray-200 mt-8">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            Comment management ({stats.total})
          </h3>
        </div>

        {/* Statistics Cards (chỉ Tổng / Đang hiển thị / Đã ẩn) */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Total</div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Visible</div>
            <div className="text-2xl font-bold text-green-900">{stats.visible}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium mb-1">Hidden</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.hidden}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'ALL'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('VISIBLE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'VISIBLE'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Visible
            </button>
            <button
              onClick={() => setFilterStatus('HIDDEN')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'HIDDEN'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <EyeOff className="w-4 h-4 inline mr-1" />
              Hidden
            </button>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8 bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add a new comment</h4>
        <CommentForm
          onSubmit={(content) => handleCreateComment(content, null)}
          placeholder="Write a comment..."
          isLoading={submitting}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            {filterStatus === 'ALL' ? 'No comments yet' : `No ${filterStatus === 'VISIBLE' ? 'visible' : 'hidden'} comments`}
          </p>
        </div>
      ) : (
        <div className="comments-list space-y-6">
          {filteredComments.map((comment) => {
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
                onDelete={handleDeleteCommentNoOp}
                onModerate={handleModerateComment}
                currentUser={user}
                isAdmin={isAdmin}
                adminMode={true}
                isLoading={submitting}
                filterComments={filterComments}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCommentSection;
