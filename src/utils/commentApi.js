/**
 * Helper functions for comment API calls with fallback
 * Tries /api/news-comments first (correct endpoint), falls back to /news-comments if 404
 * 
 * IMPORTANT: Backend routes should be registered as:
 * app.use("/news-comments", NewsCommentRouter);
 * 
 * This will create endpoints at: /api/news-comments/:newsId
 */

import apiClient from './axiosConfig';

/**
 * Make API request with fallback
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - URL path (without /api prefix)
 * @param {object|null} data - Request body data
 * @returns {Promise} - Axios response
 */
const apiRequestWithFallback = async (method, url, data = null) => {
  // Primary endpoint: /api/news-comments (correct according to backend)
  const primaryUrl = `/api${url}`;
  
  try {
    const config = {
      method,
      url: primaryUrl,
    };
    if (data) {
      config.data = data;
    }
    
    console.log(`📤 Comment API Request: ${method} ${primaryUrl}`, data || '');
    const response = await apiClient(config);
    console.log(`✅ Comment API Success: ${method} ${primaryUrl}`, response.data?.status || 'OK');
    return response;
  } catch (err) {
    // If 404, try without /api prefix as fallback
    if (err.response?.status === 404) {
      console.warn(`⚠️ Primary endpoint failed (404), trying fallback: ${url}`);
      const fallbackConfig = {
        method,
        url: url, // Without /api prefix
      };
      if (data) {
        fallbackConfig.data = data;
      }
      
      try {
        const fallbackResponse = await apiClient(fallbackConfig);
        console.log(`✅ Fallback endpoint worked: ${method} ${url}`);
        return fallbackResponse;
      } catch (fallbackErr) {
        // Both failed, throw original error with helpful message
        console.error(`❌ Both endpoints failed. Primary: ${primaryUrl}, Fallback: ${url}`);
        throw err; // Throw original error
      }
    }
    // For non-404 errors, throw immediately
    throw err;
  }
};

/**
 * Get comments for a news article
 */
export const getComments = async (newsId, parentId = null) => {
  const queryParam = parentId ? `?parent_id=${parentId}` : '?parent_id=null';
  const response = await apiRequestWithFallback('GET', `/news-comments/${newsId}${queryParam}`);
  return response.data;
};

/**
 * Create a new comment or reply
 */
export const createComment = async (newsId, content, parentId = null) => {
  const response = await apiRequestWithFallback('POST', `/news-comments/${newsId}`, {
    content: content.trim(),
    parent_id: parentId,
  });
  return response.data;
};

/**
 * Update a comment
 */
export const updateComment = async (commentId, content) => {
  const response = await apiRequestWithFallback('PUT', `/news-comments/${commentId}`, {
    content: content.trim(),
  });
  return response.data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId) => {
  const response = await apiRequestWithFallback('DELETE', `/news-comments/${commentId}`);
  return response.data;
};

/**
 * Moderate a comment (admin only)
 */
export const moderateComment = async (commentId, status) => {
  const response = await apiRequestWithFallback('PUT', `/news-comments/${commentId}/moderate`, {
    status,
  });
  return response.data;
};
