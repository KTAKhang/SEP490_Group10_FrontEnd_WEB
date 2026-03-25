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

// ===== CHAT ROOM MESSAGES (Customer/Staff) =====
export const CLEAR_CHAT_ROOM_MESSAGES = "CLEAR_CHAT_ROOM_MESSAGES";

export const GET_CHAT_ROOM_MESSAGES_REQUEST =
  "GET_CHAT_ROOM_MESSAGES_REQUEST";
export const GET_CHAT_ROOM_MESSAGES_SUCCESS =
  "GET_CHAT_ROOM_MESSAGES_SUCCESS";
export const GET_CHAT_ROOM_MESSAGES_FAILURE =
  "GET_CHAT_ROOM_MESSAGES_FAILURE";

// ===== CREATE ROOM (Customer -> Staff) =====
export const CREATE_CHAT_ROOM_REQUEST = "CREATE_CHAT_ROOM_REQUEST";
export const CREATE_CHAT_ROOM_SUCCESS = "CREATE_CHAT_ROOM_SUCCESS";
export const CREATE_CHAT_ROOM_FAILURE = "CREATE_CHAT_ROOM_FAILURE";
export const CLEAR_CHAT_CREATE_ROOM_RESULT = "CLEAR_CHAT_CREATE_ROOM_RESULT";

// ===== SEND MESSAGE =====
export const SEND_CHAT_MESSAGE_REQUEST = "SEND_CHAT_MESSAGE_REQUEST";
export const SEND_CHAT_MESSAGE_SUCCESS = "SEND_CHAT_MESSAGE_SUCCESS";
export const SEND_CHAT_MESSAGE_FAILURE = "SEND_CHAT_MESSAGE_FAILURE";
export const CLEAR_CHAT_SEND_MESSAGE_RESULT = "CLEAR_CHAT_SEND_MESSAGE_RESULT";

// ===== MARK AS READ (Staff) =====
export const MARK_CHAT_ROOM_AS_READ_REQUEST =
  "MARK_CHAT_ROOM_AS_READ_REQUEST";
export const MARK_CHAT_ROOM_AS_READ_SUCCESS =
  "MARK_CHAT_ROOM_AS_READ_SUCCESS";
export const MARK_CHAT_ROOM_AS_READ_FAILURE =
  "MARK_CHAT_ROOM_AS_READ_FAILURE";

// ===== SOCKET / UPSERT MESSAGE =====
export const RECEIVE_CHAT_MESSAGE = "RECEIVE_CHAT_MESSAGE";

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

// ===== Clear room messages =====
export const clearChatRoomMessages = (roomId) => ({
  type: CLEAR_CHAT_ROOM_MESSAGES,
  payload: { roomId },
});

// ===== Load room messages =====
export const getChatRoomMessagesRequest = (
  roomId,
  { before = null, limit = 6, prepend = false } = {},
) => ({
  type: GET_CHAT_ROOM_MESSAGES_REQUEST,
  payload: { roomId, before, limit, prepend },
});

export const getChatRoomMessagesSuccess = (
  roomId,
  { messages = [], hasMore = false, oldestMessageId = null, prepend = false },
) => ({
  type: GET_CHAT_ROOM_MESSAGES_SUCCESS,
  payload: { roomId, messages, hasMore, oldestMessageId, prepend },
});

export const getChatRoomMessagesFailure = (roomId, error) => ({
  type: GET_CHAT_ROOM_MESSAGES_FAILURE,
  payload: { roomId, error },
});

// ===== Create room =====
export const createChatRoomRequest = (staffId) => ({
  type: CREATE_CHAT_ROOM_REQUEST,
  payload: { staffId },
});

export const createChatRoomSuccess = (room) => ({
  type: CREATE_CHAT_ROOM_SUCCESS,
  payload: { room },
});

export const createChatRoomFailure = (error) => ({
  type: CREATE_CHAT_ROOM_FAILURE,
  payload: { error },
});

export const clearChatCreateRoomResult = () => ({
  type: CLEAR_CHAT_CREATE_ROOM_RESULT,
});

// ===== Send message =====
export const sendChatMessageRequest = ({
  roomId,
  senderRole,
  content = "",
  images = [],
}) => ({
  type: SEND_CHAT_MESSAGE_REQUEST,
  payload: { roomId, senderRole, content, images },
});

export const sendChatMessageSuccess = (roomId, message) => ({
  type: SEND_CHAT_MESSAGE_SUCCESS,
  payload: { roomId, message },
});

export const sendChatMessageFailure = (roomId, error) => ({
  type: SEND_CHAT_MESSAGE_FAILURE,
  payload: { roomId, error },
});

export const clearChatSendMessageResult = () => ({
  type: CLEAR_CHAT_SEND_MESSAGE_RESULT,
});

// ===== Mark as read =====
export const markChatRoomAsReadRequest = (roomId) => ({
  type: MARK_CHAT_ROOM_AS_READ_REQUEST,
  payload: { roomId },
});

export const markChatRoomAsReadSuccess = (roomId) => ({
  type: MARK_CHAT_ROOM_AS_READ_SUCCESS,
  payload: { roomId },
});

export const markChatRoomAsReadFailure = (roomId, error) => ({
  type: MARK_CHAT_ROOM_AS_READ_FAILURE,
  payload: { roomId, error },
});

// ===== Receive message =====
export const receiveChatMessage = ({ roomId, message }) => ({
  type: RECEIVE_CHAT_MESSAGE,
  payload: { roomId, message },
});
