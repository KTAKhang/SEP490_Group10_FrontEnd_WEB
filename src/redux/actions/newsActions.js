// News Actions
export const NEWS_GET_NEWS_REQUEST = "NEWS_GET_NEWS_REQUEST";
export const NEWS_GET_NEWS_SUCCESS = "NEWS_GET_NEWS_SUCCESS";
export const NEWS_GET_NEWS_FAILURE = "NEWS_GET_NEWS_FAILURE";

export const NEWS_GET_NEWS_BY_ID_REQUEST = "NEWS_GET_NEWS_BY_ID_REQUEST";
export const NEWS_GET_NEWS_BY_ID_SUCCESS = "NEWS_GET_NEWS_BY_ID_SUCCESS";
export const NEWS_GET_NEWS_BY_ID_FAILURE = "NEWS_GET_NEWS_BY_ID_FAILURE";

export const NEWS_CREATE_NEWS_REQUEST = "NEWS_CREATE_NEWS_REQUEST";
export const NEWS_CREATE_NEWS_SUCCESS = "NEWS_CREATE_NEWS_SUCCESS";
export const NEWS_CREATE_NEWS_FAILURE = "NEWS_CREATE_NEWS_FAILURE";

export const NEWS_UPDATE_NEWS_REQUEST = "NEWS_UPDATE_NEWS_REQUEST";
export const NEWS_UPDATE_NEWS_SUCCESS = "NEWS_UPDATE_NEWS_SUCCESS";
export const NEWS_UPDATE_NEWS_FAILURE = "NEWS_UPDATE_NEWS_FAILURE";

export const NEWS_DELETE_NEWS_REQUEST = "NEWS_DELETE_NEWS_REQUEST";
export const NEWS_DELETE_NEWS_SUCCESS = "NEWS_DELETE_NEWS_SUCCESS";
export const NEWS_DELETE_NEWS_FAILURE = "NEWS_DELETE_NEWS_FAILURE";

export const NEWS_GET_FEATURED_REQUEST = "NEWS_GET_FEATURED_REQUEST";
export const NEWS_GET_FEATURED_SUCCESS = "NEWS_GET_FEATURED_SUCCESS";
export const NEWS_GET_FEATURED_FAILURE = "NEWS_GET_FEATURED_FAILURE";

export const NEWS_CLEAR_MESSAGES = "NEWS_CLEAR_MESSAGES";

export const NEWS_UPLOAD_CONTENT_IMAGE_REQUEST = "NEWS_UPLOAD_CONTENT_IMAGE_REQUEST";
export const NEWS_UPLOAD_CONTENT_IMAGE_SUCCESS = "NEWS_UPLOAD_CONTENT_IMAGE_SUCCESS";
export const NEWS_UPLOAD_CONTENT_IMAGE_FAILURE = "NEWS_UPLOAD_CONTENT_IMAGE_FAILURE";

// Action Creators
export const newsGetNewsRequest = (params) => ({
  type: NEWS_GET_NEWS_REQUEST,
  payload: params,
});

export const newsGetNewsSuccess = (data) => ({
  type: NEWS_GET_NEWS_SUCCESS,
  payload: data,
});

export const newsGetNewsFailure = (error) => ({
  type: NEWS_GET_NEWS_FAILURE,
  payload: error,
});

export const newsGetNewsByIdRequest = (newsId) => ({
  type: NEWS_GET_NEWS_BY_ID_REQUEST,
  payload: newsId,
});

export const newsGetNewsByIdSuccess = (news) => ({
  type: NEWS_GET_NEWS_BY_ID_SUCCESS,
  payload: news,
});

export const newsGetNewsByIdFailure = (error) => ({
  type: NEWS_GET_NEWS_BY_ID_FAILURE,
  payload: error,
});

export const newsCreateNewsRequest = (formData) => ({
  type: NEWS_CREATE_NEWS_REQUEST,
  payload: formData,
});

export const newsCreateNewsSuccess = (data) => ({
  type: NEWS_CREATE_NEWS_SUCCESS,
  payload: data,
});

export const newsCreateNewsFailure = (error) => ({
  type: NEWS_CREATE_NEWS_FAILURE,
  payload: error,
});

export const newsUpdateNewsRequest = (newsId, formData) => ({
  type: NEWS_UPDATE_NEWS_REQUEST,
  payload: { newsId, formData },
});

export const newsUpdateNewsSuccess = (data) => ({
  type: NEWS_UPDATE_NEWS_SUCCESS,
  payload: data,
});

export const newsUpdateNewsFailure = (error) => ({
  type: NEWS_UPDATE_NEWS_FAILURE,
  payload: error,
});

export const newsDeleteNewsRequest = (newsId) => ({
  type: NEWS_DELETE_NEWS_REQUEST,
  payload: newsId,
});

export const newsDeleteNewsSuccess = () => ({
  type: NEWS_DELETE_NEWS_SUCCESS,
});

export const newsDeleteNewsFailure = (error) => ({
  type: NEWS_DELETE_NEWS_FAILURE,
  payload: error,
});

export const newsGetFeaturedRequest = () => ({
  type: NEWS_GET_FEATURED_REQUEST,
});

export const newsGetFeaturedSuccess = (data) => ({
  type: NEWS_GET_FEATURED_SUCCESS,
  payload: data,
});

export const newsGetFeaturedFailure = (error) => ({
  type: NEWS_GET_FEATURED_FAILURE,
  payload: error,
});

export const newsClearMessages = () => ({
  type: NEWS_CLEAR_MESSAGES,
});

export const newsUploadContentImageRequest = (file) => ({
  type: NEWS_UPLOAD_CONTENT_IMAGE_REQUEST,
  payload: file,
});

export const newsUploadContentImageSuccess = (data) => ({
  type: NEWS_UPLOAD_CONTENT_IMAGE_SUCCESS,
  payload: data,
});

export const newsUploadContentImageFailure = (error) => ({
  type: NEWS_UPLOAD_CONTENT_IMAGE_FAILURE,
  payload: error,
});
