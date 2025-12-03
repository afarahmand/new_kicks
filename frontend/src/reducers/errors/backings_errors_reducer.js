import {
  RECEIVE_BACKING,
  RECEIVE_BACKING_ERRORS,
} from '../../actions/backing_actions';

const backingsErrorsReducer = (oldState = [], action) => {
  Object.freeze(oldState);

  switch(action.type) {
    case RECEIVE_BACKING:
      return [];
    case RECEIVE_BACKING_ERRORS:
      return action.errors;
    default:
      return [];
  }
};

export default backingsErrorsReducer;
