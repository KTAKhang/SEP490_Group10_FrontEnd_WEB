/**
 * Utility functions for comment system
 */

// Bài đã xóa mềm / không tồn tại: text lỗi từ API comment (dùng để ẩn form)
export function isNewsUnavailableCommentError(message) {
  if (!message || typeof message !== 'string') return false;
  return (
    message.includes('không tồn tại') ||
    message.includes('Bài viết không tồn tại') ||
    message.includes('News article not found') ||
    /article not found/i.test(message)
  );
}

/* ======================================================
   TIME FORMATTERS
====================================================== */

/**
 * Format date to relative time (Vietnamese)
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

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  if (years >= 1) return `${years}y ago`;

  return date.toLocaleDateString('en-US');
};

/**
 * Format date to absolute time
 */
export const formatAbsoluteTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ======================================================
   SAFE CHARACTER FILTER (UNICODE SAFE)
====================================================== */

/**
 * Filter content to only allow safe characters
 * Unicode-safe, IME-safe, emoji-safe
 */
export const filterSafeCharacters = (content) => {
  if (!content) return '';

  let filtered = '';

  // 🔥 for...of duyệt theo Unicode code point (KHÔNG vỡ IME)
  for (const char of content) {
    const codePoint = char.codePointAt(0);
    let isSafe = false;

    // Latin letters
    if (/[A-Za-z]/.test(char)) {
      isSafe = true;
    }
    // All letters (Vietnamese, accented, etc.)
    else if (/\p{L}/u.test(char)) {
      isSafe = true;
    }
    // Combining marks (IME Vietnamese accents)
    else if (/\p{M}/u.test(char)) {
      isSafe = true;
    }
    // Numbers
    else if (/\p{N}/u.test(char)) {
      isSafe = true;
    }
    // Whitespace (space, newline, tab)
    else if (/\s/.test(char)) {
      isSafe = true;
    }
    // Basic punctuation
    else if (/[.,?!:;\-()[\]"'/\\]/.test(char)) {
      isSafe = true;
    }
    // Emoji & symbols (Unicode ranges)
    else if (
      (codePoint >= 0x1F300 && codePoint <= 0x1FAFF) || // Emojis
      (codePoint >= 0x2600 && codePoint <= 0x27BF) ||   // Symbols & Dingbats
      (codePoint >= 0x2190 && codePoint <= 0x21FF) ||   // Arrows
      (codePoint >= 0x2300 && codePoint <= 0x23FF) ||   // Technical
      (codePoint >= 0xFE00 && codePoint <= 0xFE0F) ||   // Variation Selectors
      (codePoint === 0x200D) ||                          // Zero Width Joiner
      (codePoint === 0x20E3)                             // Keycap
    ) {
      isSafe = true;
    }

    if (isSafe) {
      filtered += char;
    }
  }

  return filtered;
};

/* ======================================================
   VALIDATION
====================================================== */

/**
 * Validate comment content
 */
export const validateCommentContent = (content) => {
  const trimmed = content.trim();

  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: 'Comment must be at least 5 characters',
      filteredContent: trimmed,
    };
  }

  if (trimmed.length > 1000) {
    return {
      isValid: false,
      error: 'Comment must not exceed 1000 characters',
      filteredContent: trimmed,
    };
  }

  // Block HTML tags
  const htmlTagRegex = /<[^>]*>/g;
  if (htmlTagRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Comments cannot contain HTML or formatting markup',
      filteredContent: trimmed,
    };
  }

  const filtered = filterSafeCharacters(trimmed);

  if (filtered !== trimmed) {
    return {
      isValid: false,
      error:
        'Comment contains invalid characters. Only letters, numbers, basic punctuation, and emoji are allowed.',
      filteredContent: filtered,
    };
  }

  return {
    isValid: true,
    error: null,
    filteredContent: filtered,
  };
};

/* ======================================================
   SANITIZE
====================================================== */

/**
 * Sanitize content (remove HTML + unsafe characters)
 */
export const sanitizeContent = (content) => {
  if (!content) return '';

  let sanitized = content.replace(/<[^>]*>/g, '');
  sanitized = filterSafeCharacters(sanitized);

  return sanitized.trim();
};
