// ===== CHAT ACTIONS =====
export const GET_CHAT_ROOMS_ADMIN_REQUEST = "GET_CHAT_ROOMS_ADMIN_REQUEST";
export const GET_CHAT_ROOMS_ADMIN_SUCCESS = "GET_CHAT_ROOMS_ADMIN_SUCCESS";
export const GET_CHAT_ROOMS_ADMIN_FAILURE = "GET_CHAT_ROOMS_ADMIN_FAILURE";

export const GET_ROOM_DETAIL_ADMIN_REQUEST = "GET_ROOM_DETAIL_ADMIN_REQUEST";
export const GET_ROOM_DETAIL_ADMIN_SUCCESS = "GET_ROOM_DETAIL_ADMIN_SUCCESS";
export const GET_ROOM_DETAIL_ADMIN_FAILURE = "GET_ROOM_DETAIL_ADMIN_FAILURE";

// Customer rooms history
export const GET_USER_CHAT_ROOMS_REQUEST = "GET_USER_CHAT_ROOMS_REQUEST";
export const GET_USER_CHAT_ROOMS_SUCCESS = "GET_USER_CHAT_ROOMS_SUCCESS";
export const GET_USER_CHAT_ROOMS_FAILURE = "GET_USER_CHAT_ROOMS_FAILURE";

// Staff rooms list
export const GET_STAFF_CHAT_ROOMS_REQUEST = "GET_STAFF_CHAT_ROOMS_REQUEST";
export const GET_STAFF_CHAT_ROOMS_SUCCESS = "GET_STAFF_CHAT_ROOMS_SUCCESS";
export const GET_STAFF_CHAT_ROOMS_FAILURE = "GET_STAFF_CHAT_ROOMS_FAILURE";

// ===== CLEAR MESSAGES =====
export const CLEAR_CHAT_MESSAGES = "CLEAR_CHAT_MESSAGES";

// ===== CHAT ACTION CREATORS =====
export const getChatRoomsAdminRequest = (params = {}) => ({
  type: GET_CHAT_ROOMS_ADMIN_REQUEST,
  payload: params,
});

export const getChatRoomsAdminSuccess = (data) => ({
  type: GET_CHAT_ROOMS_ADMIN_SUCCESS,
  payload: data,
});

export const getChatRoomsAdminFailure = (error) => ({
  type: GET_CHAT_ROOMS_ADMIN_FAILURE,
  payload: error,
});

export const getRoomDetailAdminRequest = (roomId, params = {}) => ({
  type: GET_ROOM_DETAIL_ADMIN_REQUEST,
  payload: { roomId, params, append: params.append === true },
});

export const getRoomDetailAdminSuccess = (data, append = false) => ({
  type: GET_ROOM_DETAIL_ADMIN_SUCCESS,
  payload: { data, append },
});

export const getRoomDetailAdminFailure = (error) => ({
  type: GET_ROOM_DETAIL_ADMIN_FAILURE,
  payload: error,
});

// Customer rooms
export const getUserChatRoomsRequest = () => ({
  type: GET_USER_CHAT_ROOMS_REQUEST,
});

export const getUserChatRoomsSuccess = (rooms) => ({
  type: GET_USER_CHAT_ROOMS_SUCCESS,
  payload: rooms,
});

export const getUserChatRoomsFailure = (error) => ({
  type: GET_USER_CHAT_ROOMS_FAILURE,
  payload: error,
});

// Staff rooms
export const getStaffChatRoomsRequest = () => ({
  type: GET_STAFF_CHAT_ROOMS_REQUEST,
});

export const getStaffChatRoomsSuccess = (rooms) => ({
  type: GET_STAFF_CHAT_ROOMS_SUCCESS,
  payload: rooms,
});

export const getStaffChatRoomsFailure = (error) => ({
  type: GET_STAFF_CHAT_ROOMS_FAILURE,
  payload: error,
});

// ===== CLEAR MESSAGES =====
export const clearChatMessages = () => ({
  type: CLEAR_CHAT_MESSAGES,
});
