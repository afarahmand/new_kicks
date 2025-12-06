import {
  LOADING,
  RECEIVE_CURRENT_USER,
  RECEIVE_SESSION_ERRORS
} from '../actions/session_actions';

const sessionReducer = (oldState = { currentUser: null, loading: false }, action) => {
  Object.freeze(oldState);

  switch(action.type) {
    case LOADING:
      return { ...oldState, loading: true };
    case RECEIVE_CURRENT_USER:
      return { ...oldState, currentUser: action.user, loading: false };
    case RECEIVE_SESSION_ERRORS:
      return { ...oldState, loading: false };
    default:
      return oldState;
  }
};

export default sessionReducer;
