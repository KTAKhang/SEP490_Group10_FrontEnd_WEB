import React, { useState } from 'react';
import { formatRelativeTime, formatAbsoluteTime } from '../../utils/commentUtils';
import CommentForm from './CommentForm';
import { MoreVertical, Edit, Trash2, Reply, Eye, EyeOff, Shield } from 'lucide-react';

const CommentItem = ({
  comment,
  currentUser,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  onModerate,
  isLoading = false,
  isAdmin = false,
  adminMode = false, // Admin mode: admin can edit/delete any comment
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showFullTime, setShowFullTime] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = currentUser && currentUser._id === comment.user_id._id;
  const isDeleted = comment.status === 'DELETED';
  const isHidden = comment.status === 'HIDDEN';

  // In admin mode, admin can edit/delete any comment
  const canEdit = adminMode ? isAdmin : isOwner;
  const canDelete = adminMode ? isAdmin : isOwner;

  // Don't show hidden comments to non-admin users (unless in admin mode)
  if (isHidden && !isAdmin && !adminMode) {
    return null;
  }

  const handleEdit = (newContent) => {
    onEdit(comment._id, newContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      onDelete(comment._id);
    }
  };

  const handleReply = (content) => {
    onReply(comment._id, content, comment.user_id.user_name);
    setShowReplyForm(false);
  };

  const handleModerate = () => {
    const newStatus = comment.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    onModerate(comment._id, newStatus);
    setShowActionsMenu(false);
  };

  return (
    <div className={`comment-item ${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={comment.user_id?.avatar || '/default-avatar.png'}
            alt={comment.user_id?.user_name || 'User'}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.user_id?.user_name || 'User');
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">
                {comment.user_id?.user_name || 'Người dùng'}
              </span>
              <span
                className="text-sm text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => setShowFullTime(!showFullTime)}
                title={formatAbsoluteTime(comment.createdAt)}
              >
                {showFullTime ? formatAbsoluteTime(comment.createdAt) : formatRelativeTime(comment.createdAt)}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-gray-400 italic" title={`Chỉnh sửa lúc ${formatAbsoluteTime(comment.updatedAt)}`}>
                  Đã chỉnh sửa
                </span>
              )}
            </div>

            {/* Status Badge (Admin Mode) */}
            {adminMode && (
              <div className="flex items-center space-x-2">
                {comment.status === 'VISIBLE' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    VISIBLE
                  </span>
                )}
                {comment.status === 'HIDDEN' && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center">
                    <EyeOff className="w-3 h-3 mr-1" />
                    HIDDEN
                  </span>
                )}
                {comment.status === 'DELETED' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center">
                    <Trash2 className="w-3 h-3 mr-1" />
                    DELETED
                  </span>
                )}
                {adminMode && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    ADMIN VIEW
                  </span>
                )}
              </div>
            )}

            {/* Actions Menu */}
            {((canEdit || canDelete || isAdmin) && !isDeleted) || (adminMode && isDeleted) ? (
              <div className="relative">
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showActionsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActionsMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                      {currentUser && !isReply && !isDeleted && (
                        <button
                          onClick={() => {
                            setShowReplyForm(true);
                            setShowActionsMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Trả lời</span>
                        </button>
                      )}
                      {canEdit && !isDeleted && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowActionsMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>{adminMode ? 'Chỉnh sửa (Admin)' : 'Chỉnh sửa'}</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowActionsMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{adminMode ? 'Xóa (Admin)' : 'Xóa'}</span>
                        </button>
                      )}
                      {isAdmin && !isDeleted && (
                        <button
                          onClick={handleModerate}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          {comment.status === 'VISIBLE' ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span>Ẩn comment</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>Hiện comment</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Comment Content */}
          {isDeleted ? (
            <div className="text-gray-400 italic py-2 border-l-4 border-red-300 pl-4">
              <div className="mb-1">Bình luận đã bị xóa</div>
              {adminMode && (
                <div className="text-xs text-gray-500 mt-1">
                  Nội dung gốc: {comment.content}
                </div>
              )}
            </div>
          ) : isEditing ? (
            <CommentForm
              initialContent={comment.content}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              placeholder="Chỉnh sửa bình luận..."
              isLoading={isLoading}
            />
          ) : (
            <>
              <div className="text-gray-700 mb-2 whitespace-pre-wrap break-words">
                {comment.content}
              </div>

              {/* Quick Reply Button (if not deleted, user is logged in, and not a reply) */}
              {currentUser && !isDeleted && !isReply && (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                  title="Chỉ có thể trả lời comment gốc"
                >
                  Trả lời
                </button>
              )}
            </>
          )}

          {/* Reply Form - Only show for root comments (not replies) */}
          {showReplyForm && currentUser && !isDeleted && !isReply && (
            <div className="mt-4">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`@${comment.user_id?.user_name} Viết phản hồi...`}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
