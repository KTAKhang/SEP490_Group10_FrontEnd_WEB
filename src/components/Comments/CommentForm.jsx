import React, { useState, useRef } from 'react';
import { validateCommentContent } from '../../utils/commentUtils';

const CommentForm = ({
  onSubmit,
  onCancel,
  placeholder = 'Viết bình luận...',
  initialContent = '',
  isLoading = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const isComposingRef = useRef(false);

  // --------------------
  // CHANGE – RAW ONLY
  // --------------------
  const handleChange = (e) => {
    if (isComposingRef.current) return;
    setContent(e.target.value);
    if (error) setError(null);
  };

  // --------------------
  // IME EVENTS
  // --------------------
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e) => {
    isComposingRef.current = false;
    setContent(e.target.value);
  };

  // --------------------
  // SUBMIT – FILTER HERE
  // --------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setWarning(null);

    const validation = validateCommentContent(content);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    onSubmit(validation.filteredContent);
    setContent('');
  };

  const isSubmitDisabled =
    content.trim().length < 5 ||
    content.trim().length > 1000 ||
    isLoading;

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        rows={3}
        maxLength={1000}
        disabled={isLoading}
        className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-500">
          {content.length}/1000
        </span>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`px-6 py-2 rounded-lg ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500'
              : 'bg-green-600 text-white'
          }`}
        >
          {isLoading ? 'Đang đăng...' : 'Đăng'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
