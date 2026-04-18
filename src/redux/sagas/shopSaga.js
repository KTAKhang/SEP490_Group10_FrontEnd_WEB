import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import apiClientNoCredentials from "../../utils/axiosConfigNoCredentials";
import { normalizeShopPayload } from "../../utils/shopUtils";
import {
  GET_SHOP_INFO_REQUEST,
  getShopInfoSuccess,
  getShopInfoFailure,
  GET_SHOP_INFO_PUBLIC_REQUEST,
  getShopInfoPublicRequest,
  getShopInfoPublicSuccess,
  getShopInfoPublicFailure,
  UPDATE_SHOP_BASIC_INFO_REQUEST,
  updateShopBasicInfoSuccess,
  updateShopBasicInfoFailure,
  UPDATE_SHOP_DESCRIPTION_REQUEST,
  updateShopDescriptionSuccess,
  updateShopDescriptionFailure,
  UPDATE_SHOP_WORKING_HOURS_REQUEST,
  updateShopWorkingHoursSuccess,
  updateShopWorkingHoursFailure,
  UPDATE_SHOP_IMAGES_REQUEST,
  updateShopImagesSuccess,
  updateShopImagesFailure,
} from "../actions/shopActions";

// ===== API CALLS =====
const apiGetShopInfo = async () => {
  const response = await apiClient.get("/admin/shop");
  return response.data;
};

const apiGetShopInfoPublic = async () => {
  // Try public endpoint first, fallback to regular endpoint
  try {
    const response = await apiClientNoCredentials.get("/shop/public");
    return response.data;
  } catch {
    // Fallback to regular endpoint if public doesn't exist
    const response = await apiClientNoCredentials.get("/shop");
    return response.data;
  }
};

const apiUpdateShopBasicInfo = async (formData) => {
  const response = await apiClient.put("/admin/shop/basic-info", formData);
  return response.data;
};

const apiUpdateShopDescription = async (description) => {
  const response = await apiClient.put("/admin/shop/description", { description });
  return response.data;
};

const apiUpdateShopWorkingHours = async (workingHours) => {
  const response = await apiClient.put("/admin/shop/working-hours", { workingHours });
  return response.data;
};

const apiUpdateShopImages = async (images, imagePublicIds) => {
  const response = await apiClient.put("/admin/shop/images", {
    images,
    imagePublicIds,
  });
  return response.data;
};

// ===== SAGAS =====
function* getShopInfoSaga() {
  try {
    const response = yield call(apiGetShopInfo);
    if (response.status === "OK") {
      yield put(getShopInfoSuccess(normalizeShopPayload(response.data)));
    } else {
      throw new Error(response.message || "Unable to load shop information");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unable to load shop information";
    yield put(getShopInfoFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getShopInfoPublicSaga() {
  try {
    const response = yield call(apiGetShopInfoPublic);
    if (response.status === "OK") {
      // console.log('✅ Public shop info loaded:', response.data);
      // console.log('📸 Logo URL:', response.data?.logo);
      // Dùng đúng data từ public API, không gọi GET /admin/shop (chỉ dành cho admin).
      // Nếu public API không trả logo (vd: đã xóa logo) thì logo để trống, tránh 403 khi user là customer.
      const publicData = normalizeShopPayload(response.data);
      yield put(getShopInfoPublicSuccess(publicData));
    } else {
      throw new Error(response.message || "Unable to load shop information");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unable to load shop information";
    yield put(getShopInfoPublicFailure(errorMessage));
    // Don't show toast for public requests to avoid annoying users
    console.error("Failed to load public shop info:", errorMessage);
  }
}

function* updateShopBasicInfoSaga(action) {
  try {
    const formData = action.payload;
    console.log('🔄 Updating shop basic info:', formData);
    const response = yield call(apiUpdateShopBasicInfo, formData);
    if (response.status === "OK") {
      console.log('✅ Shop info updated successfully:', response.data);
      console.log('📸 Logo in response:', response.data?.logo);
      
      // WORKAROUND: Nếu backend không trả về logo, thêm logo từ request vào response
      let updatedData = normalizeShopPayload(response.data);
      if (!updatedData.logo && formData.logo) {
        console.warn('⚠️ Backend không trả về logo, sử dụng logo từ request:', formData.logo);
        updatedData = normalizeShopPayload({
          ...updatedData,
          logo: formData.logo
        });
      }
      
      yield put(updateShopBasicInfoSuccess(updatedData));
      
      // Also update public shop info với logo nếu có
      if (formData.logo) {
        yield put(getShopInfoPublicSuccess(normalizeShopPayload({
          ...updatedData,
          logo: formData.logo
        })));
      }
      
      // Also refresh public shop info to sync Header/Footer
      // Add small delay to ensure backend has processed the update
      yield new Promise(resolve => setTimeout(resolve, 300));
      yield put(getShopInfoPublicRequest());
      // Toast is handled in component
    } else {
      throw new Error(response.message || "Unable to update shop information");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unable to update shop information";
    yield put(updateShopBasicInfoFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateShopDescriptionSaga(action) {
  try {
    const { description } = action.payload;
    const response = yield call(apiUpdateShopDescription, description);
    if (response.status === "OK") {
      yield put(updateShopDescriptionSuccess(response.data));
      // Toast is handled in component
    } else {
      throw new Error(response.message || "Unable to update shop description");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unable to update shop description";
    yield put(updateShopDescriptionFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateShopWorkingHoursSaga(action) {
  try {
    const { workingHours } = action.payload;
    const response = yield call(apiUpdateShopWorkingHours, workingHours);
    if (response.status === "OK") {
      yield put(updateShopWorkingHoursSuccess(response.data));
      // Toast is handled in component
    } else {
      throw new Error(response.message || "Unable to update working hours");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unable to update working hours";
    yield put(updateShopWorkingHoursFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateShopImagesSaga(action) {
  try {
    const { images, imagePublicIds } = action.payload;
    const response = yield call(apiUpdateShopImages, images, imagePublicIds);
    if (response.status === "OK") {
      yield put(updateShopImagesSuccess(response.data));
      // Toast is handled in component
    } else {
      throw new Error(response.message || "Unable to update shop images");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unable to update shop images";
    yield put(updateShopImagesFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== ROOT SAGA =====
export default function* shopSaga() {
  yield takeLatest(GET_SHOP_INFO_REQUEST, getShopInfoSaga);
  yield takeLatest(GET_SHOP_INFO_PUBLIC_REQUEST, getShopInfoPublicSaga);
  yield takeLatest(UPDATE_SHOP_BASIC_INFO_REQUEST, updateShopBasicInfoSaga);
  yield takeLatest(UPDATE_SHOP_DESCRIPTION_REQUEST, updateShopDescriptionSaga);
  yield takeLatest(UPDATE_SHOP_WORKING_HOURS_REQUEST, updateShopWorkingHoursSaga);
  yield takeLatest(UPDATE_SHOP_IMAGES_REQUEST, updateShopImagesSaga);
}
