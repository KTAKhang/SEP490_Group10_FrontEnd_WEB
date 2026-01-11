// ===== ACTION TYPES =====
export const UPDATE_PROFILE_REQUEST = "UPDATE_PROFILE_REQUEST";
export const UPDATE_PROFILE_SUCCESS = "UPDATE_PROFILE_SUCCESS";
export const UPDATE_PROFILE_FAILURE = "UPDATE_PROFILE_FAILURE";

export const CHANGE_PASSWORD_REQUEST = "CHANGE_PASSWORD_REQUEST";
export const CHANGE_PASSWORD_SUCCESS = "CHANGE_PASSWORD_SUCCESS";
export const CHANGE_PASSWORD_FAILURE = "CHANGE_PASSWORD_FAILURE";

export const GET_PROFILE_REQUEST = "GET_PROFILE_REQUEST";
export const GET_PROFILE_SUCCESS = "GET_PROFILE_SUCCESS";
export const GET_PROFILE_FAILURE = "GET_PROFILE_FAILURE";

export const CLEAR_PROFILE_MESSAGES = "CLEAR_PROFILE_MESSAGES";

// ===== ACTION CREATORS =====
export const updateProfileRequest = (formData) => ({
    type: UPDATE_PROFILE_REQUEST,
    payload: formData,
});

export const updateProfileSuccess = (message, data) => ({
    type: UPDATE_PROFILE_SUCCESS,
    payload: { message, data },
});

export const updateProfileFailure = (error) => ({
    type: UPDATE_PROFILE_FAILURE,
    payload: error,
});

export const changePasswordRequest = (data) => ({
    type: CHANGE_PASSWORD_REQUEST,
    payload: data,
});

export const changePasswordSuccess = (message) => ({
    type: CHANGE_PASSWORD_SUCCESS,
    payload: message,
});

export const changePasswordFailure = (error) => ({
    type: CHANGE_PASSWORD_FAILURE,
    payload: error,
});

export const getProfileRequest = () => ({
    type: GET_PROFILE_REQUEST,
});

export const getProfileSuccess = (data) => ({
    type: GET_PROFILE_SUCCESS,
    payload: data,
});

export const getProfileFailure = (error) => ({
    type: GET_PROFILE_FAILURE,
    payload: error,
});

export const clearProfileMessages = () => ({
    type: CLEAR_PROFILE_MESSAGES,
});
