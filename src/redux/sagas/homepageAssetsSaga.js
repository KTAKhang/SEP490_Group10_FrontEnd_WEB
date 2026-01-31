import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import apiClientNoCredentials from "../../utils/axiosConfigNoCredentials";
import {
  GET_HOMEPAGE_ASSETS_REQUEST,
  getHomepageAssetsSuccess,
  getHomepageAssetsFailure,
  GET_HOMEPAGE_ASSETS_PUBLIC_REQUEST,
  getHomepageAssetsPublicSuccess,
  getHomepageAssetsPublicFailure,
  UPDATE_HOMEPAGE_ASSET_REQUEST,
  updateHomepageAssetSuccess,
  updateHomepageAssetFailure,
} from "../actions/homepageAssetsActions";

// ===== API CALLS =====
const apiGetHomepageAssets = async () => {
  // GET /api/admin/homepage-assets or /admin/homepage-assets
  // Try with /api prefix first, fallback without prefix
  try {
    const response = await apiClient.get("/api/admin/homepage-assets");
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Fallback without /api prefix
      console.log("Trying /admin/homepage-assets without /api prefix...");
      const response = await apiClient.get("/admin/homepage-assets");
      return response.data;
    }
    throw error;
  }
};

const apiGetHomepageAssetsPublic = async () => {
  // GET /api/homepage-assets/public
  // Try public endpoint first, fallback to regular endpoint
  try {
    const response = await apiClientNoCredentials.get("/api/homepage-assets/public");
    return response.data;
  } catch {
    // Fallback to regular endpoint if public doesn't exist
    try {
      const response = await apiClientNoCredentials.get("/api/homepage-assets");
      return response.data;
    } catch {
      // Last fallback without /api prefix
      const response = await apiClientNoCredentials.get("/homepage-assets/public");
      return response.data;
    }
  }
};

const apiUpdateHomepageAsset = async (key, imageUrl, altText) => {
  // PUT /api/admin/homepage-assets or /admin/homepage-assets
  // Try with /api prefix first, fallback without prefix
  try {
    const response = await apiClient.put("/api/admin/homepage-assets", {
      key,
      imageUrl,
      altText,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Fallback without /api prefix
      console.log("Trying PUT /admin/homepage-assets without /api prefix...");
      const response = await apiClient.put("/admin/homepage-assets", {
        key,
        imageUrl,
        altText,
      });
      return response.data;
    }
    throw error;
  }
};

// ===== SAGAS =====
function* getHomepageAssetsSaga() {
  try {
    const response = yield call(apiGetHomepageAssets);
    if (response.status === "OK") {
      yield put(getHomepageAssetsSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải hình ảnh homepage");
    }
  } catch (error) {
    let errorMessage = "Không thể tải hình ảnh homepage";
    
    if (error.response?.status === 404) {
      errorMessage = "Endpoint GET /api/admin/homepage-assets hoặc /admin/homepage-assets không tồn tại. Vui lòng kiểm tra backend.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error("Error loading homepage assets:", error);
    yield put(getHomepageAssetsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getHomepageAssetsPublicSaga() {
  try {
    const response = yield call(apiGetHomepageAssetsPublic);
    if (response.status === "OK") {
      yield put(getHomepageAssetsPublicSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải hình ảnh homepage");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải hình ảnh homepage";
    yield put(getHomepageAssetsPublicFailure(errorMessage));
    // Don't show toast for public requests to avoid annoying users
    console.error("Failed to load public homepage assets:", errorMessage);
  }
}

function* updateHomepageAssetSaga(action) {
  try {
    const { key, imageUrl, altText } = action.payload;
    const response = yield call(apiUpdateHomepageAsset, key, imageUrl, altText);
    if (response.status === "OK") {
      yield put(updateHomepageAssetSuccess(response.data));
      // Toast shown in component via success state to avoid duplicate
    } else {
      throw new Error(response.message || "Không thể cập nhật hình ảnh");
    }
  } catch (error) {
    let errorMessage = "Không thể cập nhật hình ảnh";
    
    if (error.response?.status === 404) {
      errorMessage = "Endpoint PUT /api/admin/homepage-assets hoặc /admin/homepage-assets không tồn tại. Vui lòng kiểm tra backend có implement endpoint này không.";
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra key, imageUrl và altText.";
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản admin.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error("Error updating homepage asset:", error);
    yield put(updateHomepageAssetFailure(errorMessage));
    toast.error(errorMessage, { autoClose: 6000 });
  }
}

// ===== ROOT SAGA =====
export default function* homepageAssetsSaga() {
  yield takeLatest(GET_HOMEPAGE_ASSETS_REQUEST, getHomepageAssetsSaga);
  yield takeLatest(GET_HOMEPAGE_ASSETS_PUBLIC_REQUEST, getHomepageAssetsPublicSaga);
  yield takeLatest(UPDATE_HOMEPAGE_ASSET_REQUEST, updateHomepageAssetSaga);
}
