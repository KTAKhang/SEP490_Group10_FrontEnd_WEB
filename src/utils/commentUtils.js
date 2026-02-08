/**
 * Utility functions for comment system
 */

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
      error: 'Nội dung comment phải có ít nhất 5 ký tự',
      filteredContent: trimmed,
    };
  }

  if (trimmed.length > 1000) {
    return {
      isValid: false,
      error: 'Nội dung comment không được vượt quá 1000 ký tự',
      filteredContent: trimmed,
    };
  }

  // Block HTML tags
  const htmlTagRegex = /<[^>]*>/g;
  if (htmlTagRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Comment không được chứa HTML tags hoặc ký tự định dạng',
      filteredContent: trimmed,
    };
  }

  const filtered = filterSafeCharacters(trimmed);

  if (filtered !== trimmed) {
    return {
      isValid: false,
      error:
        'Comment chứa ký tự không hợp lệ. Chỉ cho phép chữ cái, số, dấu câu cơ bản và emoji.',
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
