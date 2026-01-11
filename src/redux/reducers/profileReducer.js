import {
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAILURE,
    CHANGE_PASSWORD_REQUEST,
    CHANGE_PASSWORD_SUCCESS,
    CHANGE_PASSWORD_FAILURE,
    GET_PROFILE_REQUEST,
    GET_PROFILE_SUCCESS,
    GET_PROFILE_FAILURE,
    CLEAR_PROFILE_MESSAGES,
} from "../actions/profileAction";

const initialState = {
    user: null,
    loading: false,
    error: null,
    message: null,

    // phân biệt theo action
    updateLoading: false,
    updateError: null,
    updateMessage: null,
    updateSuccess: false,

    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordMessage: null,
    changePasswordSuccess: false,

    getProfileLoading: false,
    getProfileError: null,
};

const profileReducer = (state = initialState, action) => {
    switch (action.type) {
        // ===== UPDATE PROFILE =====
        case UPDATE_PROFILE_REQUEST:
            return { ...state, updateLoading: true, updateError: null, updateMessage: null, updateSuccess: false, };
        case UPDATE_PROFILE_SUCCESS:
            return {
                ...state,
                updateLoading: false,
                user: {
                    ...state.user,          // giữ lại token, role, email...
                    ...action.payload.data, // chỉ cập nhật field được thay đổi
                },
                updateMessage: action.payload.message,
                updateSuccess: true,
            };

        case UPDATE_PROFILE_FAILURE:
            return { ...state, updateLoading: false, updateError: true, updateMessage: action.payload, updateSuccess: false };

        // ===== CHANGE PASSWORD =====
        case CHANGE_PASSWORD_REQUEST:
            return { ...state, changePasswordLoading: true, changePasswordError: null, changePasswordMessage: null, changePasswordSuccess: false };
        case CHANGE_PASSWORD_SUCCESS:
            return { ...state, changePasswordLoading: false, changePasswordMessage: action.payload, changePasswordSuccess: true };
        case CHANGE_PASSWORD_FAILURE:
            return { ...state, changePasswordLoading: false, changePasswordError: action.payload, changePasswordSuccess: false };

        // ===== GET PROFILE =====
        case GET_PROFILE_REQUEST:
            return { ...state, getProfileLoading: true, getProfileError: null };
        case GET_PROFILE_SUCCESS:
            return { ...state, getProfileLoading: false, user: action.payload };
        case GET_PROFILE_FAILURE:
            return { ...state, getProfileLoading: false, getProfileError: action.payload };

        // ===== CLEAR MESSAGES =====
        case CLEAR_PROFILE_MESSAGES:
            return {
                ...state,
                updateMessage: null,
                updateError: null,
                changePasswordMessage: null,
                changePasswordError: null,
                updateSuccess: false,
                changePasswordSuccess: false
            };

        default:
            return state;
    }
};

export default profileReducer;
