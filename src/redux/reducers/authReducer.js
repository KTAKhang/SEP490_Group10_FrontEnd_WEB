import {
    LOGIN_GOOGLE_REQUEST,
    LOGIN_GOOGLE_SUCCESS,
    LOGIN_GOOGLE_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE,
    SET_USER,
    REGISTER_SEND_OTP_REQUEST,
    REGISTER_SEND_OTP_SUCCESS,
    REGISTER_SEND_OTP_FAILURE,
    REGISTER_CONFIRM_OTP_REQUEST,
    REGISTER_CONFIRM_OTP_SUCCESS,
    REGISTER_CONFIRM_OTP_FAILURE,
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAILURE,
    RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_FAILURE,
    CLEAR_AUTH_MESSAGES
} from "../actions/authActions";

const initialState = {
    user: null,
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    error: null,
    loading: false,
    isAuthenticated: !!localStorage.getItem("token"),

    // Register states
    registerLoading: false,
    registerMessage: null,
    registerError: null,
    confirmRegisterLoading: false,
    confirmRegisterMessage: null,
    confirmRegisterSuccess: null,
    confirmRegisterError: null,

    // Forgot password states
    forgotPasswordLoading: false,
    forgotPasswordMessage: null,
    forgotPasswordError: null,

    // Reset password states
    resetPasswordLoading: false,
    resetPasswordMessage: null,
    resetPasswordError: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        // ===== LOGIN GOOGLE =====
        case LOGIN_GOOGLE_REQUEST:
            return { ...state, error: null, loading: true };
        case LOGIN_GOOGLE_SUCCESS:
            return {
                ...state,
                user: action.payload.data,
                token: action.payload.token.access_token,
                role: action.payload.data.role_name,
                error: null,
                loading: false,
                isAuthenticated: true,
            };
        case LOGIN_GOOGLE_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                role: null,
                error: action.payload,
                loading: false,
                isAuthenticated: false,
            };

        // ===== LOGIN NORMAL =====
        case LOGIN_REQUEST:
            return { ...state, error: null, loading: true };
        case LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.data,
                token: action.payload.token.access_token,
                role: action.payload.data.role_name,
                error: null,
                loading: false,
                isAuthenticated: true,
            };
        case LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                role: null,
                error: action.payload,
                loading: false,
                isAuthenticated: false,
            };

        case LOGOUT_SUCCESS:
            return {
                ...state,
                user: null,
                token: null,
                role: null,
                error: null,
                loading: false,
                isAuthenticated: false,
            };
        case LOGOUT_FAILURE:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case SET_USER:
            return { ...state, user: action.payload };

        // ===== REGISTER SEND OTP =====
        case REGISTER_SEND_OTP_REQUEST:
            return {
                ...state,
                registerLoading: true,
                registerError: null,
                registerMessage: null,
            };
        case REGISTER_SEND_OTP_SUCCESS:
            return {
                ...state,
                registerLoading: false,
                registerMessage: action.payload,
                registerError: null,
            };
        case REGISTER_SEND_OTP_FAILURE:
            return {
                ...state,
                registerLoading: false,
                registerError: action.payload,
                registerMessage: null,
            };

        // ===== REGISTER CONFIRM OTP =====
        case REGISTER_CONFIRM_OTP_REQUEST:
            return {
                ...state,
                confirmRegisterLoading: true,
                confirmRegisterError: null,
                confirmRegisterMessage: null,
            };
        case REGISTER_CONFIRM_OTP_SUCCESS:
            return {
                ...state,
                confirmRegisterLoading: false,
                confirmRegisterMessage: action.payload,
                confirmRegisterSuccess: true,
                confirmRegisterError: null,
            };
        case REGISTER_CONFIRM_OTP_FAILURE:
            return {
                ...state,
                confirmRegisterLoading: false,
                confirmRegisterError: action.payload,
                confirmRegisterMessage: null,
            };

        // ===== FORGOT PASSWORD =====
        case FORGOT_PASSWORD_REQUEST:
            return {
                ...state,
                forgotPasswordLoading: true,
                forgotPasswordError: null,
                forgotPasswordMessage: null,
            };
        case FORGOT_PASSWORD_SUCCESS:
            return {
                ...state,
                forgotPasswordLoading: false,
                forgotPasswordMessage: action.payload.message,
                forgotPasswordError: null,
            };
        case FORGOT_PASSWORD_FAILURE:
            return {
                ...state,
                forgotPasswordLoading: false,
                forgotPasswordError: action.payload.error,
                forgotPasswordMessage: null,
            };

        // ===== RESET PASSWORD =====
        case RESET_PASSWORD_REQUEST:
            return {
                ...state,
                resetPasswordLoading: true,
                resetPasswordError: null,
                resetPasswordMessage: null,
            };
        case RESET_PASSWORD_SUCCESS:
            return {
                ...state,
                resetPasswordLoading: false,
                resetPasswordMessage: action.payload.message,
                resetPasswordError: null,
            };
        case RESET_PASSWORD_FAILURE:
            return {
                ...state,
                resetPasswordLoading: false,
                resetPasswordError: action.payload.error,
                resetPasswordMessage: null,
            };

        // ===== CLEAR MESSAGES =====
        case CLEAR_AUTH_MESSAGES:
            return {
                ...state,
                error: null,
                registerMessage: null,
                registerError: null,
                confirmRegisterMessage: null,
                confirmRegisterError: null,
                forgotPasswordMessage: null,
                forgotPasswordError: null,
                resetPasswordMessage: null,
                resetPasswordError: null,
                confirmRegisterSuccess: false,
            };

        default:
            return state;
    }
};

export default authReducer;
