import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3001';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Quan trọng để gửi cookie refreshToken
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

// Request interceptor - thêm token vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('📤 Request sent with token:', token ? `${token.substring(0, 20)}...` : 'no token');
    }
    
    // If sending FormData, remove Content-Type header to let axios set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý token refresh
apiClient.interceptors.response.use(
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
    
    // Xử lý CORS errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
      console.log('🌐 CORS error detected, trying without credentials...');
      
      // Thử lại request mà không có withCredentials
      const retryConfig = { ...error.config };
      retryConfig.withCredentials = false;
      
      try {
        const retryResponse = await axios(retryConfig);
        console.log('✅ CORS retry successful');
        return retryResponse;
      } catch (retryError) {
        console.log('❌ CORS retry failed:', retryError.message);
      }
    }
    
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Token expired, attempting refresh...');
      
      try {
        // Gọi refresh token endpoint
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { 
            withCredentials: true,
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
          return apiClient(originalRequest);
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

export default apiClient;
