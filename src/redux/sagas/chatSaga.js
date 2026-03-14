import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_CHAT_ROOMS_ADMIN_REQUEST,
  getChatRoomsAdminSuccess,
  getChatRoomsAdminFailure,
  GET_ROOM_DETAIL_ADMIN_REQUEST,
  getRoomDetailAdminSuccess,
  getRoomDetailAdminFailure,
  GET_USER_CHAT_ROOMS_REQUEST,
  getUserChatRoomsSuccess,
  getUserChatRoomsFailure,
  GET_STAFF_CHAT_ROOMS_REQUEST,
  getStaffChatRoomsSuccess,
  getStaffChatRoomsFailure,
} from "../actions/chatActions";

// ===== CHAT API CALLS =====
const apiGetChatRoomsAdmin = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `/chat/admin/rooms?${queryString}` : "/chat/admin/rooms";
  const response = await apiClient.get(url);
  return response.data;
};

const apiGetRoomDetailAdmin = async (roomId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.before) queryParams.append("before", params.before);

  const queryString = queryParams.toString();
  const url = queryString
    ? `/chat/admin/room/${roomId}?${queryString}`
    : `/chat/admin/room/${roomId}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiGetUserChatRooms = async () => {
  const response = await apiClient.get("/chat/user/rooms");
  return response.data;
};

const apiGetStaffChatRooms = async () => {
  const response = await apiClient.get("/chat/staff/rooms");
  return response.data;
};

// ===== CHAT SAGAS =====
function* getChatRoomsAdminSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetChatRoomsAdmin, params);
    if (response.status === "OK") {
      yield put(getChatRoomsAdminSuccess(response));
    } else {
      throw new Error(response.message || "Lấy danh sách phòng chat thất bại");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Lấy danh sách phòng chat thất bại";
    yield put(getChatRoomsAdminFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getRoomDetailAdminSaga(action) {
  try {
    const { roomId, params, append } = action.payload;
    const response = yield call(apiGetRoomDetailAdmin, roomId, params || {});
    if (response.status === "OK") {
      // Backend trả về: { status, message, data: { room, messages, hasMore, oldestMessageId } }
      const data = response.data;
      yield put(getRoomDetailAdminSuccess(data, append));
    } else {
      throw new Error(response.message || "Lấy chi tiết phòng chat thất bại");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Lấy chi tiết phòng chat thất bại";
    yield put(getRoomDetailAdminFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Customer rooms history
function* getUserChatRoomsSaga() {
  try {
    const response = yield call(apiGetUserChatRooms);
    const rooms = response.data || [];
    yield put(getUserChatRoomsSuccess(rooms));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể tải lịch sử phòng chat khách hàng";
    yield put(getUserChatRoomsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Staff rooms list
function* getStaffChatRoomsSaga() {
  try {
    const response = yield call(apiGetStaffChatRooms);
    const rooms = response.data || [];
    yield put(getStaffChatRoomsSuccess(rooms));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách phòng chat của nhân viên";
    yield put(getStaffChatRoomsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== ROOT CHAT SAGA =====
export default function* chatSaga() {
  yield takeLatest(GET_CHAT_ROOMS_ADMIN_REQUEST, getChatRoomsAdminSaga);
  yield takeLatest(GET_ROOM_DETAIL_ADMIN_REQUEST, getRoomDetailAdminSaga);
  yield takeLatest(GET_USER_CHAT_ROOMS_REQUEST, getUserChatRoomsSaga);
  yield takeLatest(GET_STAFF_CHAT_ROOMS_REQUEST, getStaffChatRoomsSaga);
}
