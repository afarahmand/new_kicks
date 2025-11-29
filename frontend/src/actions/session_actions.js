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

export const getCurrentUser = () => dispatch => {
  dispatch(loading());

  return SessionApiUtil.getCurrentUser().then(
    currentUser => {
      if (Object.keys(currentUser).length > 2) {
        return dispatch(receiveCurrentUser(currentUser));
      } else {
        return dispatch(receiveCurrentUser(null));
      }
    },
    err => dispatch(receiveSessionErrors(err.responseJSON))
  )
}

export const signin = user => dispatch => (
  SessionApiUtil.signin(user).then(
    currentUser => dispatch(receiveCurrentUser(currentUser)),
    err => dispatch(receiveSessionErrors(err.responseJSON))
  )
);

export const signout = () => dispatch => (
  SessionApiUtil.signout().then(
    () => dispatch(receiveCurrentUser(null)),
    err => dispatch(receiveSessionErrors(err.responseJSON))
  )
);

export const signup = user => dispatch => (
  SessionApiUtil.signup(user).then(
    currentUser => dispatch(receiveCurrentUser(currentUser)),
    err => dispatch(receiveSessionErrors(err.responseJSON))
  )
);
