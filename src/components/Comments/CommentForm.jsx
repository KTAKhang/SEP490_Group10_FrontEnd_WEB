import React, { useState } from 'react';
import { validateCommentContent, filterSafeCharacters } from '../../utils/commentUtils';

const CommentForm = ({ onSubmit, onCancel, placeholder = 'Viết bình luận...', initialContent = '', isLoading = false }) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setWarning(null);

    const validation = validateCommentContent(content);
    if (!validation.isValid) {
      setError(validation.error);
      // If content was filtered, update it
      if (validation.filteredContent !== content.trim()) {
        setContent(validation.filteredContent);
      }
      return;
    }

    onSubmit(validation.filteredContent);
  };

  const handleChange = (e) => {
    let newContent = e.target.value;
    
    // Filter unsafe characters in real-time
    const filtered = filterSafeCharacters(newContent);
    
    // If content was filtered, show warning
    if (filtered !== newContent) {
      setWarning('Một số ký tự không hợp lệ đã được loại bỏ');
      // Remove warning after 3 seconds
      setTimeout(() => setWarning(null), 3000);
    } else {
      setWarning(null);
    }
    
    setContent(filtered);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const isSubmitDisabled = content.trim().length < 5 || content.trim().length > 1000 || isLoading;

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="mb-3">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
          maxLength={1000}
          className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 ${
            error ? 'border-red-500' : warning ? 'border-yellow-400' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {warning && !error && (
          <p className="mt-1 text-sm text-yellow-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {warning}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Cho phép: chữ cái, số, dấu câu cơ bản (. , ? ! : ; -) và emoji 😊
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-sm ${content.length > 1000 ? 'text-red-600' : 'text-gray-500'}`}>
          {content.length}/1000
        </span>
        
        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isSubmitDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng...
              </span>
            ) : (
              'Đăng'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
