/**
 * Utility functions for comment system
 */

/**
 * Format date to relative time (Vietnamese)
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  if (weeks < 4) return `${weeks} tuần trước`;
  if (months < 12) return `${months} tháng trước`;
  if (years >= 1) return `${years} năm trước`;
  
  return date.toLocaleDateString('vi-VN');
};

/**
 * Format date to absolute time (Vietnamese)
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted absolute time
 */
export const formatAbsoluteTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Filter content to only allow safe characters
 * Allows: letters, numbers, basic punctuation, Vietnamese characters, emojis, newlines
 * @param {string} content - Content to filter
 * @returns {string} - Filtered content
 */
export const filterSafeCharacters = (content) => {
  if (!content) return '';
  
  // Split content into characters and filter
  let filtered = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const codePoint = char.codePointAt(0);
    
    // Check if character is safe
    let isSafe = false;
    
    // Allow letters (including Vietnamese with diacritics)
    // Using regex to check if it's a letter (works with Unicode)
    if (/[\p{L}]/u.test(char)) {
      isSafe = true;
    }
    // Allow numbers
    else if (/[\p{N}]/u.test(char)) {
      isSafe = true;
    }
    // Allow whitespace (space, tab, newline)
    else if (/\s/.test(char)) {
      isSafe = true;
    }
    // Allow basic punctuation: . , ? ! : ; - ( ) [ ] " ' / \
    else if (/[.,?!:;\-()\[\]"'/\\]/.test(char)) {
      isSafe = true;
    }
    // Allow emojis and symbols (check by Unicode code point ranges)
    else if (
      // Emoticons, Misc Symbols, Transport & Map
      (codePoint >= 0x1F300 && codePoint <= 0x1F9FF) ||
      // Miscellaneous Symbols
      (codePoint >= 0x2600 && codePoint <= 0x26FF) ||
      // Dingbats
      (codePoint >= 0x2700 && codePoint <= 0x27BF) ||
      // Regional Indicator Symbols (flags)
      (codePoint >= 0x1F1E0 && codePoint <= 0x1F1FF) ||
      // Supplemental Symbols and Pictographs
      (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||
      // Symbols and Pictographs Extended-A
      (codePoint >= 0x1FA00 && codePoint <= 0x1FAFF) ||
      // Arrows
      (codePoint >= 0x2190 && codePoint <= 0x21FF) ||
      // Miscellaneous Technical
      (codePoint >= 0x2300 && codePoint <= 0x23FF) ||
      // Stars
      (codePoint >= 0x2B50 && codePoint <= 0x2B55) ||
      // Variation Selectors (for emoji variants)
      (codePoint >= 0xFE00 && codePoint <= 0xFE0F) ||
      // Zero Width Joiner (for emoji combinations)
      (codePoint === 0x200D) ||
      // Combining Enclosing Keycap
      (codePoint === 0x20E3) ||
      // Common emoji ranges
      (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
      (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport & Map
      (codePoint >= 0x1F700 && codePoint <= 0x1F77F) || // Alchemical Symbols
      (codePoint >= 0x1F780 && codePoint <= 0x1F7FF) || // Geometric Shapes Extended
      (codePoint >= 0x1F800 && codePoint <= 0x1F8FF) || // Supplemental Arrows-C
      (codePoint >= 0x1FA70 && codePoint <= 0x1FAFF)    // Symbols and Pictographs Extended-A
    ) {
      isSafe = true;
    }
    
    if (isSafe) {
      filtered += char;
    }
  }
  
  return filtered;
};

/**
 * Validate comment content
 * @param {string} content - Comment content
 * @returns {{isValid: boolean, error: string|null, filteredContent: string}}
 */
export const validateCommentContent = (content) => {
  const trimmed = content.trim();
  
  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: 'Nội dung comment phải có ít nhất 5 ký tự',
      filteredContent: trimmed
    };
  }
  
  if (trimmed.length > 1000) {
    return {
      isValid: false,
      error: 'Nội dung comment không được vượt quá 1000 ký tự',
      filteredContent: trimmed
    };
  }
  
  // Check for HTML tags
  const htmlTagRegex = /<[^>]*>/g;
  if (htmlTagRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Comment không được chứa HTML tags hoặc ký tự định dạng',
      filteredContent: trimmed
    };
  }
  
  // Filter unsafe characters
  const filtered = filterSafeCharacters(trimmed);
  
  // Check if any characters were removed
  if (filtered !== trimmed) {
    return {
      isValid: false,
      error: 'Comment chứa ký tự không hợp lệ. Chỉ cho phép chữ cái, số, dấu câu cơ bản và emoji.',
      filteredContent: filtered
    };
  }
  
  return {
    isValid: true,
    error: null,
    filteredContent: filtered
  };
};

/**
 * Sanitize content (remove HTML tags and filter unsafe characters)
 * @param {string} content - Content to sanitize
 * @returns {string} - Sanitized content
 */
export const sanitizeContent = (content) => {
  if (!content) return '';
  // Remove HTML tags first
  let sanitized = content.replace(/<[^>]*>/g, '');
  // Then filter unsafe characters
  sanitized = filterSafeCharacters(sanitized);
  return sanitized.trim();
};
