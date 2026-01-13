import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3001';

// Tạo axios instance KHÔNG sử dụng withCredentials để tránh CORS issues
const apiClientNoCredentials = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Tắt credentials để tránh CORS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Helper function để lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function để cập nhật token mới
const updateToken = (newToken) => {
  console.log('🔄 Updating token in localStorage:', newToken ? `${newToken.substring(0, 20)}...` : 'null');
  localStorage.setItem('token', newToken);
};

// Helper function để logout user
const logoutUser = () => {
  console.log('🚪 Logging out user due to token refresh failure');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  // Có thể dispatch logout action ở đây nếu cần
  window.location.href = '/login';
};

// Request interceptor - KHÔNG thêm token cho public API
apiClientNoCredentials.interceptors.request.use(
  (config) => {
    // ✅ FIX: Public API không cần token, chỉ thêm token nếu URL yêu cầu
    // Các endpoint public như /about/about, /founder/founders không nên gửi token
    const publicEndpoints = ['/about/about', '/founder/founders', '/product/products', '/news/news'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isPublicEndpoint) {
      // Chỉ thêm token cho các endpoint không phải public
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 Request sent with token:', token ? `${token.substring(0, 20)}...` : 'no token');
        console.log('📤 Authorization header:', config.headers.Authorization);
      } else {
        console.log('⚠️ No token found in localStorage');
      }
    } else {
      console.log('🌐 Public endpoint detected, not sending token');
    }
    
    // ✅ FIX: Không set Content-Type cho FormData, để browser tự set
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📤 FormData detected, letting browser set Content-Type');
      console.log('📤 Final headers:', config.headers);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý token refresh
apiClientNoCredentials.interceptors.response.use(
  (response) => {
    // Kiểm tra nếu có New-Access-Token header từ backend
    const newToken = response.headers['new-access-token'];
    if (newToken) {
      console.log('🔄 Received new token from backend:', newToken ? `${newToken.substring(0, 20)}...` : 'null');
      updateToken(newToken);
    }
    return response;
  },
  async (error) => {
    console.log('🔍 Response interceptor error:', error.response?.status, error.response?.data);
    console.log('🔍 Error details:', error.message);
    console.log('🔍 Error code:', error.code);
    
    const originalRequest = error.config;
    
    // Kiểm tra nếu là public endpoint
    const publicEndpoints = ['/about/about', '/founder/founders', '/product/products', '/news/news'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
    
    // Nếu lỗi 401 và chưa retry VÀ KHÔNG PHẢI public endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      originalRequest._retry = true;
      
      console.log('🔄 Token expired, attempting refresh...');
      console.log('🔄 Original request URL:', originalRequest.url);
      console.log('🔄 Original request method:', originalRequest.method);
      console.log('🔄 Original request headers:', originalRequest.headers);
      
      try {
        // Gọi refresh token endpoint với withCredentials = true
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { 
            withCredentials: true, // Chỉ refresh token mới cần credentials
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Token refresh successful:', refreshResponse.data);
        
        if (refreshResponse.data?.token?.access_token) {
          const newToken = refreshResponse.data.token.access_token;
          updateToken(newToken);
          
          // Retry original request với token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('🔄 Retrying original request with new token');
          console.log('🔄 Retry headers:', originalRequest.headers);
          console.log('🔄 Retry data type:', originalRequest.data instanceof FormData ? 'FormData' : 'JSON');
          return apiClientNoCredentials(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.response?.data || refreshError.message);
        
        // Nếu refresh thất bại, logout user
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
          toastId: "auth-expired-401"
        });
        
        setTimeout(() => {
          logoutUser();
        }, 2000);
        
        return Promise.reject(refreshError);
      }
    }
    
    // Nếu là public endpoint và lỗi 401, chỉ log không redirect
    if (error.response?.status === 401 && isPublicEndpoint) {
      console.log('🌐 Public endpoint returned 401, ignoring (no authentication required)');
      return Promise.reject(error);
    }
    
    // Xử lý các lỗi khác
    if (error.response?.status === 403) {
      console.log('🚫 Access denied - insufficient permissions');
      toast.error("Không có quyền truy cập. Vui lòng kiểm tra lại quyền của bạn!");
    } else if (error.response?.status >= 500) {
      console.log('🔥 Server error:', error.response?.status);
      toast.error("Lỗi máy chủ. Vui lòng thử lại sau!");
    }
    
    return Promise.reject(error);
  }
);

export default apiClientNoCredentials;
