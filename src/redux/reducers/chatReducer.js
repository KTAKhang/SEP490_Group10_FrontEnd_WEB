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

    default:
      return state;
  }
};

export default chatReducer;
