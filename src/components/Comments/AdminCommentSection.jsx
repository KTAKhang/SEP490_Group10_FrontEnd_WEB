import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { MessageSquare, Filter, Eye, EyeOff, AlertCircle } from 'lucide-react';
import * as commentApi from '../../utils/commentApi';

const AdminCommentSection = ({ newsId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, VISIBLE, HIDDEN, DELETED
  const [showHidden, setShowHidden] = useState(true);

  // Admin always has full permissions
  const isAdmin = true;

  // Load root comments (including hidden ones for admin)
  const loadComments = useCallback(async () => {
    if (!newsId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await commentApi.getComments(newsId, null);

      if (response.status === 'OK') {
        const rootComments = response.data || [];
        setComments(rootComments);

        // Load replies for each comment
        const repliesData = {};
        for (const comment of rootComments) {
          try {
            const repliesResponse = await commentApi.getComments(newsId, comment._id);
            if (repliesResponse.status === 'OK') {
              repliesData[comment._id] = repliesResponse.data || [];
            }
          } catch (err) {
            console.error(`Error loading replies for comment ${comment._id}:`, err);
            repliesData[comment._id] = [];
          }
        }
        setReplies(repliesData);
      } else {
        setError(response.message || 'Không thể tải bình luận');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tải bình luận';
      setError(errorMessage);
      
      if (err.response?.status === 404) {
        toast.error('API endpoint không tồn tại. Vui lòng kiểm tra backend có route /api/news-comments/:newsId hoặc /news-comments/:newsId');
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
        toast.success(parentId ? 'Đăng phản hồi thành công' : 'Đăng bình luận thành công');
        await loadComments();
      } else {
        toast.error(response.message || 'Không thể đăng bình luận');
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      let errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra backend có route POST /api/news-comments/:newsId hoặc /news-comments/:newsId';
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Update comment (admin can edit any comment)
  const handleUpdateComment = async (commentId, newContent) => {
    try {
      setSubmitting(true);

      const response = await commentApi.updateComment(commentId, newContent);

      if (response.status === 'OK') {
        toast.success('Chỉnh sửa comment thành công');
        await loadComments();
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

  // Delete comment (admin can delete any comment)
  const handleDeleteComment = async (commentId) => {
    try {
      setSubmitting(true);

      const response = await commentApi.deleteComment(commentId);

      if (response.status === 'OK') {
        toast.success('Xóa bình luận thành công');
        await loadComments();
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

  // Moderate comment
  const handleModerateComment = async (commentId, newStatus) => {
    try {
      setSubmitting(true);

      const response = await commentApi.moderateComment(commentId, newStatus);

      if (response.status === 'OK') {
        toast.success(newStatus === 'HIDDEN' ? 'Ẩn comment thành công' : 'Hiển thị comment thành công');
        await loadComments();
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

  // Statistics
  const stats = {
    total: comments.length,
    visible: comments.filter(c => c.status === 'VISIBLE').length,
    hidden: comments.filter(c => c.status === 'HIDDEN').length,
    deleted: comments.filter(c => c.status === 'DELETED').length,
  };

  const filteredComments = filterComments(comments);

  if (loading) {
    return (
      <div className="admin-comment-section py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tải bình luận...</p>
          </div>
        </div>
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
            Quản lý Bình luận ({stats.total})
          </h3>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Tổng số</div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Đang hiển thị</div>
            <div className="text-2xl font-bold text-green-900">{stats.visible}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium mb-1">Đã ẩn</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.hidden}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">Đã xóa</div>
            <div className="text-2xl font-bold text-red-900">{stats.deleted}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'ALL'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất cả
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
              Đang hiển thị
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
              Đã ẩn
            </button>
            <button
              onClick={() => setFilterStatus('DELETED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'DELETED'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Đã xóa
            </button>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8 bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Thêm bình luận mới</h4>
        <CommentForm
          onSubmit={(content) => handleCreateComment(content, null)}
          placeholder="Viết bình luận..."
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
            {filterStatus === 'ALL' ? 'Chưa có bình luận nào' : `Không có bình luận ${filterStatus === 'VISIBLE' ? 'đang hiển thị' : filterStatus === 'HIDDEN' ? 'đã ẩn' : 'đã xóa'}`}
          </p>
        </div>
      ) : (
        <div className="comments-list space-y-6">
          {filteredComments.map((comment) => (
            <div key={comment._id} className="comment-wrapper">
              <CommentItem
                comment={comment}
                currentUser={user}
                isReply={false}
                onReply={handleReply}
                onEdit={handleUpdateComment}
                onDelete={handleDeleteComment}
                onModerate={handleModerateComment}
                isLoading={submitting}
                isAdmin={isAdmin}
                adminMode={true} // Enable admin mode
              />

              {/* Replies */}
              {replies[comment._id] && replies[comment._id].length > 0 && (
                <div className="replies-container ml-8 mt-4 space-y-4">
                  {filterComments(replies[comment._id]).map((reply) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      currentUser={user}
                      isReply={true}
                      onReply={handleReply}
                      onEdit={handleUpdateComment}
                      onDelete={handleDeleteComment}
                      onModerate={handleModerateComment}
                      isLoading={submitting}
                      isAdmin={isAdmin}
                      adminMode={true} // Enable admin mode
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommentSection;
