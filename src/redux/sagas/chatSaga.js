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
  GET_CHAT_ROOM_MESSAGES_REQUEST,
  getChatRoomMessagesSuccess,
  getChatRoomMessagesFailure,
  CREATE_CHAT_ROOM_REQUEST,
  createChatRoomSuccess,
  createChatRoomFailure,
  SEND_CHAT_MESSAGE_REQUEST,
  sendChatMessageSuccess,
  sendChatMessageFailure,
  MARK_CHAT_ROOM_AS_READ_REQUEST,
  markChatRoomAsReadSuccess,
  markChatRoomAsReadFailure,
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

const apiGetChatRoomMessages = async (roomId, { before = null, limit = 6 } = {}) => {
  const params = { limit };
  if (before) params.before = before;
  const response = await apiClient.get(`/chat/room/${roomId}/messages`, {
    params,
  });
  return response.data;
};

const apiCreateChatRoom = async ({ staffId } = {}) => {
  const response = await apiClient.post("/chat/room", { staffId });
  return response.data;
};

const apiSendChatMessage = async ({
  roomId,
  senderRole,
  content = "",
  images = [],
} = {}) => {
  const formData = new FormData();
  formData.append("roomId", roomId);
  formData.append("content", content);
  formData.append("senderRole", senderRole);
  images.forEach((file) => formData.append("images", file));

  const response = await apiClient.post("/chat/message", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

const apiMarkChatRoomAsRead = async (roomId) => {
  const response = await apiClient.get(`/chat/room/${roomId}/mark-as-read`);
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

function* getChatRoomMessagesSaga(action) {
  try {
    const { roomId, before = null, limit = 6, prepend = false } =
      action.payload || {};
    if (!roomId) return;

    const response = yield call(apiGetChatRoomMessages, roomId, {
      before,
      limit,
    });

    // Match the component logic:
    // const payload = res.data?.data ?? res.data;
    const payload = response?.data?.data ?? response?.data ?? response;
    const fetched = Array.isArray(payload)
      ? payload
      : payload.messages || [];

    const more =
      typeof payload === "object" && payload.hasMore !== undefined
        ? payload.hasMore
        : fetched.length === limit;
    const oldest =
      typeof payload === "object" && payload.oldestMessageId
        ? payload.oldestMessageId
        : fetched.length > 0
          ? fetched[0]._id
          : null;

    yield put(
      getChatRoomMessagesSuccess(roomId, {
        messages: fetched,
        hasMore: !!more,
        oldestMessageId: oldest,
        prepend,
      }),
    );
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Lấy tin nhắn thất bại";
    const roomId = action.payload?.roomId;
    yield put(getChatRoomMessagesFailure(roomId, errorMessage));
    toast.error(errorMessage);
  }
}

function* createChatRoomSaga(action) {
  try {
    const { staffId } = action.payload || {};
    const response = yield call(apiCreateChatRoom, { staffId });

    // Theo page: const createdRoom = res.data.data;
    const createdRoom =
      response?.data?.data ?? response?.data ?? response;
    yield put(createChatRoomSuccess(createdRoom));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Tạo phòng chat thất bại";
    yield put(createChatRoomFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* sendChatMessageSaga(action) {
  try {
    const { roomId, senderRole, content = "", images = [] } =
      action.payload || {};
    if (!roomId) return;

    const response = yield call(apiSendChatMessage, {
      roomId,
      senderRole,
      content,
      images,
    });

    // Theo page: const newMessage = res.data.data;
    const message =
      response?.data?.data ?? response?.data ?? response;

    yield put(sendChatMessageSuccess(roomId, message));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Gửi tin nhắn thất bại";
    const roomId = action.payload?.roomId;
    yield put(sendChatMessageFailure(roomId, errorMessage));
    toast.error(errorMessage);
  }
}

function* markChatRoomAsReadSaga(action) {
  try {
    const { roomId } = action.payload || {};
    if (!roomId) return;
    yield call(apiMarkChatRoomAsRead, roomId);
    yield put(markChatRoomAsReadSuccess(roomId));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Đánh dấu đã đọc thất bại";
    const roomId = action.payload?.roomId;
    yield put(markChatRoomAsReadFailure(roomId, errorMessage));
    toast.error(errorMessage);
  }
}

// ===== ROOT CHAT SAGA =====
export default function* chatSaga() {
  yield takeLatest(GET_CHAT_ROOMS_ADMIN_REQUEST, getChatRoomsAdminSaga);
  yield takeLatest(GET_ROOM_DETAIL_ADMIN_REQUEST, getRoomDetailAdminSaga);
  yield takeLatest(GET_USER_CHAT_ROOMS_REQUEST, getUserChatRoomsSaga);
  yield takeLatest(GET_STAFF_CHAT_ROOMS_REQUEST, getStaffChatRoomsSaga);

  yield takeLatest(GET_CHAT_ROOM_MESSAGES_REQUEST, getChatRoomMessagesSaga);
  yield takeLatest(CREATE_CHAT_ROOM_REQUEST, createChatRoomSaga);
  yield takeLatest(SEND_CHAT_MESSAGE_REQUEST, sendChatMessageSaga);
  yield takeLatest(MARK_CHAT_ROOM_AS_READ_REQUEST, markChatRoomAsReadSaga);
}
