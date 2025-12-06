import {
  RECEIVE_BACKING,
  RECEIVE_BACKING_ERRORS,
} from '../../actions/backing_actions';
import { RECEIVE_CURRENT_USER } from '../../actions/session_actions';

const backingsErrorsReducer = (oldState = [], action) => {
  Object.freeze(oldState);

  switch(action.type) {
    case RECEIVE_BACKING:
      return [];
    case RECEIVE_BACKING_ERRORS:
      return action.errors;
    case RECEIVE_CURRENT_USER:
      return [];
    default:
      return oldState;
  }
};

export default backingsErrorsReducer;
