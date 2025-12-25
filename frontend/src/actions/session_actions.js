import * as SessionApiUtil from '../utils/session_api_util';

export const RECEIVE_CURRENT_USER = "RECEIVE_CURRENT_USER";
export const RECEIVE_SESSION_ERRORS = "RECEIVE_SESSION_ERRORS";
export const LOADING = "LOADING";

const receiveCurrentUser = user => ({
  type: RECEIVE_CURRENT_USER,
  user
});

export const receiveSessionErrors = errors => ({
  type: RECEIVE_SESSION_ERRORS,
  errors
});

const loading = () => ({
  type: LOADING
});

const handleGetCurrentUser = (currentUser, dispatch) => {
  if (Object.keys(currentUser).length > 2) {
    return dispatch(receiveCurrentUser(currentUser));
  }

  if (sessionStorage.getItem("accessToken")) {
    sessionStorage.removeItem("accessToken")
  }

  return dispatch(receiveCurrentUser(null));
}

const handleSignin = (userAccessData, dispatch) => {
  sessionStorage.setItem("accessToken", userAccessData["token"]);
  sessionStorage.setItem("refreshToken", userAccessData["refresh"]);
  const currentUser = userAccessData["user"];

  return dispatch(receiveCurrentUser(currentUser));
}

const handleSignout = dispatch => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");

  return dispatch(receiveCurrentUser(null));
}

export const getCurrentUser = () => dispatch => {
  dispatch(loading());

  return SessionApiUtil.getCurrentUser().then(
    currentUser => handleGetCurrentUser(currentUser, dispatch),
    err => dispatch(receiveSessionErrors(err))
  )
}

export const signin = user => dispatch => (
  SessionApiUtil.signin(user).then(
    response => handleSignin(response, dispatch),
    err => (dispatch(receiveSessionErrors(err)))
  )
)

export const signout = () => dispatch => {
  const refreshToken = sessionStorage.getItem("refreshToken");

  return SessionApiUtil.signout(refreshToken).then(
    () => handleSignout(dispatch),
    err => dispatch(receiveSessionErrors(err))
  )
}

export const signup = user => dispatch => (
  SessionApiUtil.signup(user).then(
    currentUser => dispatch(receiveCurrentUser(currentUser)),
    err => dispatch(receiveSessionErrors(err))
  )
)