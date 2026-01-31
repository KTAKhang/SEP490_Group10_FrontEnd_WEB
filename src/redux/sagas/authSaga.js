// sagas/authSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
    LOGIN_GOOGLE_REQUEST,
    loginGoogleSuccess,
    loginGoogleFailure,
    LOGIN_REQUEST,
    loginSuccess,
    loginFailure,
    REGISTER_SEND_OTP_REQUEST,
    registerSendOTPSuccess,
    registerSendOTPFailure,
    REGISTER_CONFIRM_OTP_REQUEST,
    registerConfirmOTPSuccess,
    registerConfirmOTPFailure,
    LOGOUT_REQUEST,
    logoutSuccess,
    logoutFailure,
    FORGOT_PASSWORD_REQUEST,
    forgotPasswordSuccess,
    forgotPasswordFailure,
    RESET_PASSWORD_REQUEST,
    resetPasswordSuccess,
    resetPasswordFailure
} from "../actions/authActions";
import axios from "axios";
// import apiClient from "../../utils/axiosConfigNoCredentials";

const API_BASE_URL = 'http://localhost:3001';

const apiLogout = async () => {
    const response = await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},

        { withCredentials: true }
    );
    return response.data;

};

function* handleLogout() {
    try {
        const response = yield call(apiLogout);

        // clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        yield put(logoutSuccess(response.message));
        toast.success(response.message || "Logout successful");
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Logout failed";
        yield put(logoutFailure(errorMessage));
        toast.error(errorMessage);
    }
}

// API call for register send otp
const apiRegisterSendOTP = async ({ user_name, email, password, phone, address,birthday,gender }) => {
    const response = await axios.post(
        `${API_BASE_URL}/auth/register/send-otp`,
        { user_name, email, password, phone, address,birthday,gender },
        {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        },

    );
    return response.data;
};

function* registerSendOTP(action) {
    try {
        const { user_name, email, password, phone, address, birthday,gender } = action.payload;
        const response = yield call(apiRegisterSendOTP, { user_name, email, password, phone, address,birthday,gender });

        if (response.status === 'OK') {
            yield put(registerSendOTPSuccess(response.message));
            toast.success(response.message || 'OTP đã được gửi qua email!');
        } else {
            throw new Error(response.message || 'Gửi OTP thất bại');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Gửi OTP thất bại';
        yield put(registerSendOTPFailure(errorMessage));
        toast.error(errorMessage);
    }
}

// API call for register confirm otp
const apiRegisterConfirmOTP = async (email, otp) => {
    console.log("Email", email, "OTP", otp);
    const response = await axios.post(
        `${API_BASE_URL}/auth/register/confirm`,
        { email, otp: String(otp) },
        {
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};



function* registerConfirmOTP(action) {
    try {
        const { email, otp } = action.payload;
        const response = yield call(apiRegisterConfirmOTP, email, otp);

        if (response.status === "OK") {
            yield put(registerConfirmOTPSuccess(response.message));
            toast.success(response.message);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        yield put(registerConfirmOTPFailure(errorMessage));
        toast.error(errorMessage);
    }
}



// API call for Google login
const apiLoginByGoogle = async (idToken) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/auth/google`,
            { idToken }, // gửi idToken thay vì email/password
            {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to login with Google");
    }
};

const apiLogin = async (credentials) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/auth/sign-in`,
            credentials,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                withCredentials: true,
            }

        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to login");
    }
};

// API call for forgot password
const apiForgotPassword = async (email) => {
    const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email },
        {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

// API call for reset password
const apiResetPassword = async (email, otp, newPassword) => {
    const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        { email, otp, newPassword },
        {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

// Login saga
function* loginGoogleSaga(action) {
    try {
        const { idToken } = action.payload;
        const data = yield call(apiLoginByGoogle, idToken);

        localStorage.setItem("token", data.token.access_token);
        localStorage.setItem("role", data.data.role_name);
        localStorage.setItem("user", JSON.stringify(data.data));

        yield put(loginGoogleSuccess(data));
        toast.success(data.message || "Login successful");
    } catch (error) {
        yield put(loginGoogleFailure(error.message));
        toast.error(error.message);
    }
}

// Login saga
function* loginSaga(action) {
    try {
        const { email, password } = action.payload;
        const data = yield call(apiLogin, { email, password });

        // Store in localStorage
        localStorage.setItem("token", data.token.access_token);
        localStorage.setItem("role", data.data.role_name);
        localStorage.setItem("user", JSON.stringify(data.data));

        yield put(loginSuccess(data));
        toast.success(data.message || "Login successful");
    } catch (error) {
        yield put(loginFailure(error.message));
        toast.error(error.message);
    }
}

// Forgot password saga
function* forgotPasswordSaga(action) {
    try {
        const { email } = action.payload;
        const response = yield call(apiForgotPassword, email);

        if (response.status === 'OK') {
            yield put(forgotPasswordSuccess(response.message));
            toast.success(response.message || 'OTP đã được gửi qua email!');
        } else {
            throw new Error(response.message || 'Gửi OTP thất bại');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Gửi OTP thất bại';
        yield put(forgotPasswordFailure(errorMessage));
        toast.error(errorMessage);
    }
}

// Reset password saga
function* resetPasswordSaga(action) {
    try {
        const { email, otp, newPassword } = action.payload;
        const response = yield call(apiResetPassword, email, otp, newPassword);

        if (response.status === 'OK') {
            yield put(resetPasswordSuccess(response.message));
            toast.success(response.message || 'Mật khẩu đã được đặt lại thành công!');
        } else {
            throw new Error(response.message || 'Đặt lại mật khẩu thất bại');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Đặt lại mật khẩu thất bại';
        yield put(resetPasswordFailure(errorMessage));
        toast.error(errorMessage);
    }
}


// Root saga
export default function* authSaga() {
    yield takeLatest(LOGIN_GOOGLE_REQUEST, loginGoogleSaga);
    yield takeLatest(LOGIN_REQUEST, loginSaga);
    yield takeLatest(REGISTER_SEND_OTP_REQUEST, registerSendOTP);
    yield takeLatest(REGISTER_CONFIRM_OTP_REQUEST, registerConfirmOTP);
    yield takeLatest(LOGOUT_REQUEST, handleLogout);
    yield takeLatest(FORGOT_PASSWORD_REQUEST, forgotPasswordSaga);
    yield takeLatest(RESET_PASSWORD_REQUEST, resetPasswordSaga);
}
