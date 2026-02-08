import React from 'react';
import CommentItem from './CommentItem';

const REPLY_COLLAPSE_THRESHOLD = 3;
const REPLY_INITIAL_VISIBLE = 1;
const MAX_REPLY_DEPTH = 5; // độ sâu tối đa vẫn render thêm reply
/** Ẩn nút Trả lời khi reply ở mức 4 (đã có 4 tầng reply: depth 1,2,3,4) */
const REPLY_HIDE_AT_LEVEL = 4;

/**
 * Trả về comment "đuôi" của nhánh và độ sâu của nó (số tầng reply từ gốc).
 */
function getTailAndDepth(comment, replies, depth = 0) {
  const children = replies[comment._id];
  if (!children || children.length === 0) return { tail: comment, depth };
  const last = children[children.length - 1];
  return getTailAndDepth(last, replies, depth + 1);
}

/**
 * Đếm tổng số reply trong nhánh (để ẩn nút Trả lời khi đủ 5 dù backend trả flat hay nested).
 */
function getBranchReplyCount(comment, replies) {
  const children = replies[comment._id];
  if (!children || children.length === 0) return 0;
  let count = children.length;
  for (const child of children) {
    count += getBranchReplyCount(child, replies);
  }
  return count;
}

function getTail(comment, replies) {
  return getTailAndDepth(comment, replies).tail;
}

/**
 * Render một node comment và cây reply đệ quy, có thu gọn/mở rộng khi ≥ 3 reply.
 * - Thụt lề: chỉ 1 cấp cho cả nhánh (ml-8 chỉ khi depth === 0).
 * - Reply: chỉ node tail (reply mới nhất) mới có nút Reply (tailId).
 */
const CommentTreeNode = ({
  comment,
  depth = 0,
  tailId = null,
  tailDepth = 0,
  branchReplyCount = null,
  replies,
  expandedReplies = {},
  onToggleExpand,
  onReply,
  onEdit,
  onDelete,
  onModerate,
  currentUser,
  isAdmin,
  adminMode = false,
  isLoading,
  filterComments = (list) => list,
}) => {
  const childList = replies[comment._id];
  const filteredChildren = childList ? filterComments(childList) : [];
  const hasChildren = filteredChildren.length > 0;
  const canHaveNestedReplies = depth < REPLY_HIDE_AT_LEVEL;

  const shouldCollapse = filteredChildren.length >= REPLY_COLLAPSE_THRESHOLD;
  const isExpanded = expandedReplies[comment._id];
  const visibleChildren = shouldCollapse && !isExpanded
    ? filteredChildren.slice(0, REPLY_INITIAL_VISIBLE)
    : filteredChildren;
  const hiddenCount = filteredChildren.length - visibleChildren.length;

  // Ẩn nút Trả lời khi reply ở mức 4: tailDepth >= 4 hoặc tổng reply trong nhánh >= 4
  const maxDepthReached = tailDepth >= REPLY_HIDE_AT_LEVEL || (typeof branchReplyCount === 'number' && branchReplyCount >= REPLY_HIDE_AT_LEVEL);
  const canShowReply = comment._id === tailId && !maxDepthReached;

  return (
    <div className={depth > 0 ? 'comment-wrapper mt-4' : 'comment-wrapper'}>
      <CommentItem
        comment={comment}
        currentUser={currentUser}
        isReply={depth > 0}
        depth={depth}
        canShowReply={canShowReply}
        maxDepthReached={maxDepthReached}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onModerate={onModerate}
        isLoading={isLoading}
        isAdmin={isAdmin}
        adminMode={adminMode}
      />

      {hasChildren && canHaveNestedReplies && (
        <div className={`replies-container mt-4 space-y-4 ${depth === 0 ? 'ml-8' : ''}`}>
          {visibleChildren.map((child) => (
            <CommentTreeNode
              key={child._id}
              comment={child}
              depth={depth + 1}
              tailId={tailId}
              tailDepth={tailDepth}
              branchReplyCount={branchReplyCount}
              replies={replies}
              expandedReplies={expandedReplies}
              onToggleExpand={onToggleExpand}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onModerate={onModerate}
              currentUser={currentUser}
              isAdmin={isAdmin}
              adminMode={adminMode}
              isLoading={isLoading}
              filterComments={filterComments}
            />
          ))}

          {shouldCollapse && (
            <button
              type="button"
              onClick={() => onToggleExpand(comment._id)}
              className="text-sm text-green-600 hover:text-green-700 font-medium mt-1"
            >
              {isExpanded
                ? 'Thu gọn'
                : `Xem thêm ${hiddenCount} phản hồi`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentTreeNode;
export { getTail, getTailAndDepth, getBranchReplyCount, REPLY_COLLAPSE_THRESHOLD, REPLY_INITIAL_VISIBLE, MAX_REPLY_DEPTH, REPLY_HIDE_AT_LEVEL };
