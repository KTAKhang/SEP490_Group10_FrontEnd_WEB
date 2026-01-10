// actions/authActions.js
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const LOGIN_GOOGLE_REQUEST = "LOGIN_GOOGLE_REQUEST";
export const LOGIN_GOOGLE_SUCCESS = "LOGIN_GOOGLE_SUCCESS";
export const LOGIN_GOOGLE_FAILURE = "LOGIN_GOOGLE_FAILURE";
export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGOUT_FAILURE = "LOGOUT_FAILURE";
export const SET_USER = "SET_USER";

export const REGISTER_SEND_OTP_REQUEST = "REGISTER_SEND_OTP_REQUEST";
export const REGISTER_SEND_OTP_SUCCESS = "REGISTER_SEND_OTP_SUCCESS";
export const REGISTER_SEND_OTP_FAILURE = "REGISTER_SEND_OTP_FAILURE";

export const REGISTER_CONFIRM_OTP_REQUEST = "REGISTER_CONFIRM_OTP_REQUEST";
export const REGISTER_CONFIRM_OTP_SUCCESS = "REGISTER_CONFIRM_OTP_SUCCESS";
export const REGISTER_CONFIRM_OTP_FAILURE = "REGISTER_CONFIRM_OTP_FAILURE";

// Forgot Password Actions
export const FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST';
export const FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS';
export const FORGOT_PASSWORD_FAILURE = 'FORGOT_PASSWORD_FAILURE';

// Reset Password Actions
export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE';

// Clear messages
export const CLEAR_AUTH_MESSAGES = 'CLEAR_AUTH_MESSAGES';

export const loginRequest = (credentials) => ({
    type: LOGIN_REQUEST,
    payload: credentials,
});

export const loginSuccess = (data) => ({
    type: LOGIN_SUCCESS,
    payload: data,
});

export const loginFailure = (error) => ({
    type: LOGIN_FAILURE,
    payload: error,
});

export const loginGoogleRequest = (credentials) => ({
    type: LOGIN_GOOGLE_REQUEST,
    payload: credentials,
});

export const loginGoogleSuccess = (data) => ({
    type: LOGIN_GOOGLE_SUCCESS,
    payload: data,
});

export const loginGoogleFailure = (error) => ({
    type: LOGIN_GOOGLE_FAILURE,
    payload: error,
});

export const logoutRequest = () => ({
    type: LOGOUT_REQUEST,
});

export const logoutSuccess = (message) => ({
    type: LOGOUT_SUCCESS,
    payload: message,
});

export const logoutFailure = (error) => ({
    type: LOGOUT_FAILURE,
    payload: error,
});

export const registerSendOTPRequest = (credentials) => ({
    type: REGISTER_SEND_OTP_REQUEST,
    payload: credentials,
});

export const registerSendOTPSuccess = (data) => ({
    type: REGISTER_SEND_OTP_SUCCESS,
    payload: data,
});

export const registerSendOTPFailure = (error) => ({
    type: REGISTER_SEND_OTP_FAILURE,
    payload: error,
});

export const registerConfirmOTPRequest = ({ email, otp }) => ({
    type: REGISTER_CONFIRM_OTP_REQUEST,
    payload: { email, otp },
});

export const registerConfirmOTPSuccess = (data) => ({
    type: REGISTER_CONFIRM_OTP_SUCCESS,
    payload: data,
});

export const registerConfirmOTPFailure = (error) => ({
    type: REGISTER_CONFIRM_OTP_FAILURE,
    payload: error,
});



// Forgot Password Action Creators
export const forgotPasswordRequest = (email) => ({
    type: FORGOT_PASSWORD_REQUEST,
    payload: { email }
});

export const forgotPasswordSuccess = (message) => ({
    type: FORGOT_PASSWORD_SUCCESS,
    payload: { message }
});

export const forgotPasswordFailure = (error) => ({
    type: FORGOT_PASSWORD_FAILURE,
    payload: { error }
});

// Reset Password Action Creators
export const resetPasswordRequest = (email, otp, newPassword) => ({
    type: RESET_PASSWORD_REQUEST,
    payload: { email, otp, newPassword }
});

export const resetPasswordSuccess = (message) => ({
    type: RESET_PASSWORD_SUCCESS,
    payload: { message }
});

export const resetPasswordFailure = (error) => ({
    type: RESET_PASSWORD_FAILURE,
    payload: { error }
});

// Clear messages
export const clearAuthMessages = () => ({
    type: CLEAR_AUTH_MESSAGES
});
