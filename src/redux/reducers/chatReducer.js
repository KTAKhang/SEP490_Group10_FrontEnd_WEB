import {
  GET_CHAT_ROOMS_ADMIN_REQUEST,
  GET_CHAT_ROOMS_ADMIN_SUCCESS,
  GET_CHAT_ROOMS_ADMIN_FAILURE,
  GET_ROOM_DETAIL_ADMIN_REQUEST,
  GET_ROOM_DETAIL_ADMIN_SUCCESS,
  GET_ROOM_DETAIL_ADMIN_FAILURE,
  GET_USER_CHAT_ROOMS_REQUEST,
  GET_USER_CHAT_ROOMS_SUCCESS,
  GET_USER_CHAT_ROOMS_FAILURE,
  GET_STAFF_CHAT_ROOMS_REQUEST,
  GET_STAFF_CHAT_ROOMS_SUCCESS,
  GET_STAFF_CHAT_ROOMS_FAILURE,
  CLEAR_CHAT_MESSAGES,
  CLEAR_CHAT_ROOM_MESSAGES,
  GET_CHAT_ROOM_MESSAGES_REQUEST,
  GET_CHAT_ROOM_MESSAGES_SUCCESS,
  GET_CHAT_ROOM_MESSAGES_FAILURE,
  CREATE_CHAT_ROOM_REQUEST,
  CREATE_CHAT_ROOM_SUCCESS,
  CREATE_CHAT_ROOM_FAILURE,
  CLEAR_CHAT_CREATE_ROOM_RESULT,
  SEND_CHAT_MESSAGE_REQUEST,
  SEND_CHAT_MESSAGE_SUCCESS,
  SEND_CHAT_MESSAGE_FAILURE,
  CLEAR_CHAT_SEND_MESSAGE_RESULT,
  MARK_CHAT_ROOM_AS_READ_REQUEST,
  MARK_CHAT_ROOM_AS_READ_SUCCESS,
  MARK_CHAT_ROOM_AS_READ_FAILURE,
  RECEIVE_CHAT_MESSAGE,
} from "../actions/chatActions";

const initialState = {
  // Admin rooms
  rooms: [],
  roomsLoading: false,
  roomsError: null,
  roomsPagination: null,

  // Admin room detail
  roomDetail: null,
  roomDetailLoading: false,
  roomDetailLoadMore: false,
  roomDetailError: null,

  // Customer chat history
  userRooms: [],
  userRoomsLoading: false,
  userRoomsError: null,

  // Staff chat rooms
  staffRooms: [],
  staffRoomsLoading: false,
  staffRoomsError: null,

  // ===== Room messages (Customer/Staff) =====
  // { [roomId]: { messages, hasMore, oldestMessageId, loading, loadingMore, error } }
  roomMessagesById: {},

  // Customer: create room
  createRoom: {
    loading: false,
    data: null,
    error: null,
  },

  // Customer/Staff: send message
  sendMessage: {
    loading: false,
    data: null, // message object
    error: null,
    roomId: null,
  },

  // Staff: mark chat room as read
  markAsRead: {
    loading: false,
    error: null,
  },
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== GET CHAT ROOMS ADMIN =====
    case GET_CHAT_ROOMS_ADMIN_REQUEST:
      return {
        ...state,
        roomsLoading: true,
        roomsError: null,
      };
    case GET_CHAT_ROOMS_ADMIN_SUCCESS:
      return {
        ...state,
        rooms: action.payload.data || [],
        roomsPagination: action.payload.pagination || null,
        roomsLoading: false,
        roomsError: null,
      };
    case GET_CHAT_ROOMS_ADMIN_FAILURE:
      return {
        ...state,
        roomsLoading: false,
        roomsError: action.payload,
      };

    // ===== GET ROOM DETAIL ADMIN =====
    case GET_ROOM_DETAIL_ADMIN_REQUEST:
      return {
        ...state,
        roomDetailLoading: action.payload.append ? false : true,
        roomDetailLoadMore: action.payload.append || false,
        roomDetailError: null,
      };
    case GET_ROOM_DETAIL_ADMIN_SUCCESS: {
      const { data, append } = action.payload;
      // data: { room, messages, hasMore, oldestMessageId }
      if (append && state.roomDetail && data?.messages) {
        const existingMessages = state.roomDetail.messages || [];
        const newMessages = data.messages || [];
        const merged = [...newMessages, ...existingMessages];
        return {
          ...state,
          roomDetail: {
            ...state.roomDetail,
            messages: merged,
            hasMore: data.hasMore,
            oldestMessageId: data.oldestMessageId,
          },
          roomDetailLoadMore: false,
          roomDetailError: null,
        };
      }
      return {
        ...state,
        roomDetail: data,
        roomDetailLoading: false,
        roomDetailLoadMore: false,
        roomDetailError: null,
      };
    }

    // ===== CUSTOMER CHAT ROOMS (HISTORY) =====
    case GET_USER_CHAT_ROOMS_REQUEST:
      return {
        ...state,
        userRoomsLoading: true,
        userRoomsError: null,
      };
    case GET_USER_CHAT_ROOMS_SUCCESS:
      return {
        ...state,
        userRooms: action.payload || [],
        userRoomsLoading: false,
        userRoomsError: null,
      };
    case GET_USER_CHAT_ROOMS_FAILURE:
      return {
        ...state,
        userRoomsLoading: false,
        userRoomsError: action.payload,
      };

    // ===== STAFF CHAT ROOMS =====
    case GET_STAFF_CHAT_ROOMS_REQUEST:
      return {
        ...state,
        staffRoomsLoading: true,
        staffRoomsError: null,
      };
    case GET_STAFF_CHAT_ROOMS_SUCCESS:
      return {
        ...state,
        staffRooms: action.payload || [],
        staffRoomsLoading: false,
        staffRoomsError: null,
      };
    case GET_STAFF_CHAT_ROOMS_FAILURE:
      return {
        ...state,
        staffRoomsLoading: false,
        staffRoomsError: action.payload,
      };
    case GET_ROOM_DETAIL_ADMIN_FAILURE:
      return {
        ...state,
        roomDetailLoading: false,
        roomDetailError: action.payload,
      };

    // ===== CLEAR MESSAGES =====
    case CLEAR_CHAT_MESSAGES:
      return {
        ...state,
        roomsError: null,
        roomDetailError: null,
      };

    // ===== CLEAR ROOM MESSAGES =====
    case CLEAR_CHAT_ROOM_MESSAGES: {
      const { roomId } = action.payload || {};
      if (!roomId) return state;
      const key = String(roomId);
      return {
        ...state,
        roomMessagesById: {
          ...state.roomMessagesById,
          [key]: {
            messages: [],
            hasMore: false,
            oldestMessageId: null,
            loading: false,
            loadingMore: false,
            error: null,
          },
        },
      };
    }

    case GET_CHAT_ROOM_MESSAGES_REQUEST: {
      const { roomId, prepend = false } = action.payload || {};
      if (!roomId) return state;
      const key = String(roomId);
      const existing = state.roomMessagesById[key] || {};
      return {
        ...state,
        roomMessagesById: {
          ...state.roomMessagesById,
          [key]: {
            ...existing,
            error: null,
            loading: !prepend,
            loadingMore: prepend,
          },
        },
      };
    }

    case GET_CHAT_ROOM_MESSAGES_SUCCESS: {
      const {
        roomId,
        messages = [],
        hasMore = false,
        oldestMessageId = null,
        prepend = false,
      } = action.payload || {};
      if (!roomId) return state;
      const key = String(roomId);
      const existing = state.roomMessagesById[key] || {};
      const existingMessages = Array.isArray(existing.messages)
        ? existing.messages
        : [];

      // Merge fetched payload with any existing messages.
      // This avoids losing "live" socket messages that arrived while the API request was in-flight.
      const merged = [...messages, ...existingMessages];

      // De-dup by _id to avoid duplicates when socket overlaps.
      const seen = new Set();
      const unique = [];
      for (const m of merged) {
        const id = m?._id ?? m?.id;
        const dedupKey = id != null ? String(id) : null;
        if (dedupKey) {
          if (seen.has(dedupKey)) continue;
          seen.add(dedupKey);
        }
        unique.push(m);
      }

      return {
        ...state,
        roomMessagesById: {
          ...state.roomMessagesById,
          [key]: {
            ...existing,
            messages: unique,
            hasMore: !!hasMore,
            oldestMessageId,
            loading: false,
            loadingMore: false,
            error: null,
          },
        },
      };
    }

    case GET_CHAT_ROOM_MESSAGES_FAILURE: {
      const { roomId, error } = action.payload || {};
      if (!roomId) return state;
      const key = String(roomId);
      const existing = state.roomMessagesById[key] || {};
      return {
        ...state,
        roomMessagesById: {
          ...state.roomMessagesById,
          [key]: {
            ...existing,
            loading: false,
            loadingMore: false,
            error,
          },
        },
      };
    }

    // ===== CREATE ROOM =====
    case CREATE_CHAT_ROOM_REQUEST:
      return {
        ...state,
        createRoom: { loading: true, data: null, error: null },
      };

    case CREATE_CHAT_ROOM_SUCCESS:
      return {
        ...state,
        createRoom: {
          loading: false,
          data: action.payload?.room ?? null,
          error: null,
        },
      };

    case CREATE_CHAT_ROOM_FAILURE:
      return {
        ...state,
        createRoom: {
          loading: false,
          data: null,
          error: action.payload?.error ?? null,
        },
      };

    case CLEAR_CHAT_CREATE_ROOM_RESULT:
      return {
        ...state,
        createRoom: { loading: false, data: null, error: null },
      };

    // ===== SEND MESSAGE =====
    case SEND_CHAT_MESSAGE_REQUEST:
      return {
        ...state,
        sendMessage: {
          loading: true,
          data: null,
          error: null,
          roomId: action.payload?.roomId ?? null,
        },
      };

    case SEND_CHAT_MESSAGE_SUCCESS: {
      const { roomId, message } = action.payload || {};
      if (!roomId) {
        return {
          ...state,
          sendMessage: {
            loading: false,
            data: message ?? null,
            error: null,
            roomId: null,
          },
        };
      }

      const key = String(roomId);
      const existing = state.roomMessagesById[key] || {};
      const existingMessages = Array.isArray(existing.messages)
        ? existing.messages
        : [];

      const messageId = message?._id ?? message?.id;
      const messageKey = messageId != null ? String(messageId) : null;
      const alreadyExists =
        messageKey != null &&
        existingMessages.some(
          (m) => String(m?._id ?? m?.id) === messageKey,
        );

      const nextMessages = alreadyExists
        ? existingMessages
        : [...existingMessages, message];

      return {
        ...state,
        sendMessage: {
          loading: false,
          data: message ?? null,
          error: null,
          roomId: key,
        },
        roomMessagesById: {
          ...state.roomMessagesById,
          [key]: {
            ...existing,
            messages: nextMessages,
          },
        },
      };
    }

    case SEND_CHAT_MESSAGE_FAILURE:
      return {
        ...state,
        sendMessage: {
          loading: false,
          data: null,
          error: action.payload?.error ?? null,
          roomId: action.payload?.roomId ?? null,
        },
      };

    case CLEAR_CHAT_SEND_MESSAGE_RESULT:
      return {
        ...state,
        sendMessage: { loading: false, data: null, error: null, roomId: null },
      };

    // ===== MARK AS READ =====
    case MARK_CHAT_ROOM_AS_READ_REQUEST:
      return { ...state, markAsRead: { loading: true, error: null } };

    case MARK_CHAT_ROOM_AS_READ_SUCCESS:
      return { ...state, markAsRead: { loading: false, error: null } };

    case MARK_CHAT_ROOM_AS_READ_FAILURE:
      return {
        ...state,
        markAsRead: { loading: false, error: action.payload?.error ?? null },
      };

    // ===== SOCKET RECEIVE (upsert) =====
    case RECEIVE_CHAT_MESSAGE: {
      const { roomId, message } = action.payload || {};
      if (!roomId || !message) return state;
      const key = String(roomId);
      const existing = state.roomMessagesById[key] || {};
      const existingMessages = Array.isArray(existing.messages) ? existing.messages : [];

      const messageId = message?._id ?? message?.id;
      const messageKey = messageId != null ? String(messageId) : null;
      const alreadyExists =
        messageKey != null &&
        existingMessages.some(
          (m) => String(m?._id ?? m?.id) === messageKey,
        );

      const nextMessages = alreadyExists
        ? existingMessages
        : [...existingMessages, message];

      return {
        ...state,
        roomMessagesById: {
          ...state.roomMessagesById,
          [key]: {
            ...existing,
            messages: nextMessages,
          },
        },
      };
    }

    default:
      return state;
  }
};

export default chatReducer;
