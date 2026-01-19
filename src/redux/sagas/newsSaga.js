// sagas/newsSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  NEWS_GET_NEWS_REQUEST,
  newsGetNewsSuccess,
  newsGetNewsFailure,
  NEWS_GET_NEWS_BY_ID_REQUEST,
  newsGetNewsByIdSuccess,
  newsGetNewsByIdFailure,
  NEWS_CREATE_NEWS_REQUEST,
  newsCreateNewsSuccess,
  newsCreateNewsFailure,
  NEWS_UPDATE_NEWS_REQUEST,
  newsUpdateNewsSuccess,
  newsUpdateNewsFailure,
  NEWS_DELETE_NEWS_REQUEST,
  newsDeleteNewsSuccess,
  newsDeleteNewsFailure,
  NEWS_GET_FEATURED_REQUEST,
  newsGetFeaturedSuccess,
  newsGetFeaturedFailure,
  NEWS_UPLOAD_CONTENT_IMAGE_REQUEST,
  newsUploadContentImageSuccess,
  newsUploadContentImageFailure,
} from "../actions/newsActions";
import apiClient from "../../utils/axiosConfig";
import apiClientNoCredentials from "../../utils/axiosConfigNoCredentials";

// API call for getting news list (public or authenticated)
const apiGetNews = async (params = {}, isPublic = false) => {
  const queryParams = new URLSearchParams();
  
  // For public endpoint, add public=true to ensure only PUBLISHED news are returned
  if (isPublic) {
    queryParams.append("public", "true");
  }
  
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.is_featured !== undefined) queryParams.append("is_featured", params.is_featured);
  if (params.author_id) queryParams.append("author_id", params.author_id);

  const client = isPublic ? apiClientNoCredentials : apiClient;
  const endpoint = isPublic ? `/news/public` : `/news`;
  const response = await client.get(`${endpoint}?${queryParams.toString()}`);
  return response.data;
};

// API call for getting news by ID (public or authenticated)
const apiGetNewsById = async (newsId, isPublic = false) => {
  // For public endpoint, use noCredentials client and public path
  // For authenticated endpoint, use regular client
  if (isPublic) {
    const response = await apiClientNoCredentials.get(`/news/public/${newsId}`);
    return response.data;
  } else {
    const response = await apiClient.get(`/news/${newsId}`);
    return response.data;
  }
};

// API call for creating news
const apiCreateNews = async (formData) => {
  const data = new FormData();
  
  data.append("title", formData.title);
  data.append("content", formData.content);
  if (formData.excerpt) data.append("excerpt", formData.excerpt);
  if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);
  if (formData.status) data.append("status", formData.status);
  if (formData.is_featured !== undefined) {
    data.append("is_featured", formData.is_featured);
  }

  const response = await apiClient.post("/news", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// API call for updating news
const apiUpdateNews = async (newsId, formData) => {
  const data = new FormData();
  
  if (formData.title !== undefined) data.append("title", formData.title);
  if (formData.content !== undefined) data.append("content", formData.content);
  if (formData.excerpt !== undefined) {
    // Only append excerpt if it's provided (can be empty string to clear)
    data.append("excerpt", formData.excerpt);
  }
  // Only append thumbnail if a new file is provided
  if (formData.thumbnail && formData.thumbnail instanceof File) {
    data.append("thumbnail", formData.thumbnail);
  }
  if (formData.status !== undefined) data.append("status", formData.status);
  if (formData.is_featured !== undefined) {
    data.append("is_featured", formData.is_featured);
  }

  const response = await apiClient.put(`/news/${newsId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// API call for deleting news
const apiDeleteNews = async (newsId) => {
  const response = await apiClient.delete(`/news/${newsId}`);
  return response.data;
};

// API call for getting featured news (public)
const apiGetFeaturedNews = async () => {
  const response = await apiClientNoCredentials.get("/news/public/featured");
  return response.data;
};

// Saga for getting news list
function* newsGetNewsSaga(action) {
  try {
    const params = action.payload || {};
    const isPublic = params.public === true || params.public === "true";
    const response = yield call(apiGetNews, params, isPublic);
    
    if (response.status === "OK") {
      yield put(newsGetNewsSuccess({
        data: response.data || [],
        pagination: response.pagination || null,
      }));
    } else {
      throw new Error(response.message || "Failed to load news");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load news";
    yield put(newsGetNewsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting news by ID
function* newsGetNewsByIdSaga(action) {
  try {
    const { newsId, isPublic = false } = typeof action.payload === 'object' 
      ? action.payload 
      : { newsId: action.payload, isPublic: false };
    
    const response = yield call(apiGetNewsById, newsId, isPublic);
    
    if (response.status === "OK" && response.data) {
      yield put(newsGetNewsByIdSuccess(response.data));
    } else {
      throw new Error(response.message || "News not found");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load news";
    yield put(newsGetNewsByIdFailure(errorMessage));
    if (error.response?.status !== 404) {
      toast.error(errorMessage);
    }
  }
}

// Saga for creating news
function* newsCreateNewsSaga(action) {
  try {
    const formData = action.payload;
    const response = yield call(apiCreateNews, formData);
    
    if (response.status === "OK" && response.data) {
      yield put(newsCreateNewsSuccess(response));
      // Toast is handled in NewsFormPage component
    } else {
      throw new Error(response.message || "Failed to create news");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create news. Please try again.";
    yield put(newsCreateNewsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for updating news
function* newsUpdateNewsSaga(action) {
  try {
    const { newsId, formData } = action.payload;
    const response = yield call(apiUpdateNews, newsId, formData);
    
    if (response.status === "OK" && response.data) {
      yield put(newsUpdateNewsSuccess(response));
      // Toast is handled in NewsFormPage component
    } else {
      throw new Error(response.message || "Failed to update news");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to update news. Please try again.";
    yield put(newsUpdateNewsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for deleting news
function* newsDeleteNewsSaga(action) {
  try {
    const newsId = action.payload;
    const response = yield call(apiDeleteNews, newsId);
    
    if (response.status === "OK") {
      yield put(newsDeleteNewsSuccess(response));
      toast.success(response.message || "News deleted successfully");
    } else {
      throw new Error(response.message || "Failed to delete news");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete news. Please try again.";
    yield put(newsDeleteNewsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting featured news
function* newsGetFeaturedSaga() {
  try {
    const response = yield call(apiGetFeaturedNews);
    
    if (response.status === "OK") {
      yield put(newsGetFeaturedSuccess(response.data || []));
    } else {
      throw new Error(response.message || "Failed to load featured news");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load featured news";
    yield put(newsGetFeaturedFailure(errorMessage));
    // Don't show toast for public endpoints to avoid spam
  }
}

// API call for uploading content image
const apiUploadContentImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  
  // Don't set Content-Type header - let browser set it with boundary
  const response = await apiClient.post("/news/upload-content-image", formData);
  return response.data;
};

// Saga for uploading content image
function* newsUploadContentImageSaga(action) {
  try {
    const file = action.payload;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and WebP images are allowed");
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }
    
    const response = yield call(apiUploadContentImage, file);
    
    if (response.status === "OK" && response.data?.url) {
      yield put(newsUploadContentImageSuccess(response.data));
      toast.success("Image uploaded successfully!");
    } else {
      throw new Error(response.message || "Failed to upload image");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to upload image. Please try again.";
    yield put(newsUploadContentImageFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Root saga
export default function* newsSaga() {
  yield takeLatest(NEWS_GET_NEWS_REQUEST, newsGetNewsSaga);
  yield takeLatest(NEWS_GET_NEWS_BY_ID_REQUEST, newsGetNewsByIdSaga);
  yield takeLatest(NEWS_CREATE_NEWS_REQUEST, newsCreateNewsSaga);
  yield takeLatest(NEWS_UPDATE_NEWS_REQUEST, newsUpdateNewsSaga);
  yield takeLatest(NEWS_DELETE_NEWS_REQUEST, newsDeleteNewsSaga);
  yield takeLatest(NEWS_GET_FEATURED_REQUEST, newsGetFeaturedSaga);
  yield takeLatest(NEWS_UPLOAD_CONTENT_IMAGE_REQUEST, newsUploadContentImageSaga);
}
