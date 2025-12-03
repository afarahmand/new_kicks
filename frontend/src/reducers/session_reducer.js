import merge from 'deepmerge';

import {
  LOADING,
  RECEIVE_CURRENT_USER,
  RECEIVE_SESSION_ERRORS
} from '../actions/session_actions';

const sessionReducer = (oldState = { currentUser: null, errors: [], loading: false }, action) => {
  Object.freeze(oldState);
  let newState;

  switch(action.type) {
    case LOADING:
      newState = merge({}, oldState);
      newState.loading = true;
      return newState;
    case RECEIVE_CURRENT_USER:
      newState = merge({}, oldState);
      newState.currentUser = action.user;
      newState.loading = false;
      return newState;
    case RECEIVE_SESSION_ERRORS:
      newState = merge({}, oldState);
      newState.loading = false;
      return newState;
    default:
      return oldState;
  }
};

export default sessionReducer;
