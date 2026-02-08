import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import CommentForm from './CommentForm';
import CommentTreeNode, { getTailAndDepth, getBranchReplyCount } from './CommentTreeNode';
import * as commentApi from '../../utils/commentApi';

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
        setError(response.message || 'Không thể tải bình luận');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      let errorMessage = err.response?.data?.message || 'Không thể tải bình luận.';

      if (err.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng:\n1. Kiểm tra backend đã được restart chưa\n2. Kiểm tra route /api/news-comments/:newsId đã được register\n3. Kiểm tra server đang chạy ở đúng port (3001)';
        console.error('🔴 404 Error - Backend route not found:', {
          endpoint: `/api/news-comments/${newsId}`,
          suggestion: 'Check if backend server is running and routes are registered'
        });
      }

      setError(errorMessage);

      if (err.response?.status === 404) {
        toast.error('Không tìm thấy API endpoint. Vui lòng kiểm tra backend server.', {
          autoClose: 5000,
        });
      } else if (err.response?.status !== 404) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Create new comment
  const handleCreateComment = async (content, parentId = null) => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    try {
      setSubmitting(true);

      const response = await commentApi.createComment(newsId, content, parentId);

      if (response.status === 'OK') {
        toast.success(parentId ? 'Đăng phản hồi thành công' : 'Đăng bình luận thành công');
        await loadComments(); // Refresh comments
      } else {
        toast.error(response.message || 'Không thể đăng bình luận');
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      let errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      
      // Handle 404 specifically with helpful message
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng:\n1. Restart backend server\n2. Kiểm tra route POST /api/news-comments/:newsId\n3. Kiểm tra server đang chạy ở port 3001';
        console.error('🔴 404 Error - Backend route not found:', {
          endpoint: `POST /api/news-comments/${newsId}`,
          suggestion: 'Backend needs to be restarted after adding routes'
        });
        toast.error('Không tìm thấy API endpoint. Vui lòng kiểm tra backend server đã được restart chưa.', {
          autoClose: 6000,
        });
        return; // Don't show duplicate error
      }
      
      // Handle spam error with special message
      if (errorMessage.includes('quá nhanh')) {
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
        toast.success('Chỉnh sửa thành công');
        await loadComments(); // Refresh comments
      } else {
        toast.error(response.message || 'Không thể chỉnh sửa bình luận');
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      let errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra backend có route PUT /api/news-comments/:id hoặc /news-comments/:id';
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
        toast.success('Xóa bình luận thành công');
        await loadComments(); // Refresh comments
      } else {
        toast.error(response.message || 'Không thể xóa bình luận');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      let errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra backend có route DELETE /api/news-comments/:id hoặc /news-comments/:id';
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
        toast.success(newStatus === 'HIDDEN' ? 'Ẩn comment thành công' : 'Hiển thị comment thành công');
        await loadComments(); // Refresh comments
      } else {
        toast.error(response.message || 'Không thể thực hiện thao tác');
      }
    } catch (err) {
      console.error('Error moderating comment:', err);
      let errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra backend có route PUT /api/news-comments/:id/moderate hoặc /news-comments/:id/moderate';
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
            <p className="text-gray-600">Đang tải bình luận...</p>
          </div>
        </div>
      </div>
    );
  }

  // Bài đã xóa mềm / không tồn tại: không hiển thị form comment (theo spec soft delete)
  if (error && (error.includes('không tồn tại') || error.includes('Bài viết không tồn tại'))) {
    return (
      <div className="comment-section py-8 border-t border-gray-200 mt-12">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="comment-section py-8 border-t border-gray-200 mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Bình luận ({comments.length})
      </h3>

      {/* Comment Form */}
      {isAuthenticated() ? (
        <div className="mb-8">
          <CommentForm
            onSubmit={(content) => handleCreateComment(content, null)}
            placeholder="Viết bình luận..."
            isLoading={submitting}
          />
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            Vui lòng{' '}
            <a href="/login" className="text-green-600 hover:text-green-700 font-semibold">
              đăng nhập
            </a>{' '}
            để bình luận
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
          <p className="text-gray-600 text-lg mb-2">Chưa có bình luận nào</p>
          <p className="text-gray-500">Hãy là người đầu tiên bình luận!</p>
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
