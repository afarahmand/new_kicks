import merge from 'deepmerge';

import {
  RECEIVE_BACKING,
  RECEIVE_BACKING_ERRORS
} from '../../actions/backing_actions';
import { RECEIVE_PROJECT } from '../../actions/project_actions';
import { RECEIVE_USER } from '../../actions/user_actions';

const backingsReducer = (oldState = {}, action) => {
    Object.freeze(oldState);
    let newState;

    switch(action.type) {
      case RECEIVE_BACKING:
        return { ...oldState, [action.backing.id]: action.backing };

      case RECEIVE_PROJECT:
        newState = merge({}, oldState);
        if (action.backings) {
          Object.keys(action.backings).forEach(backingId => {
            newState[backingId] = action.backings[backingId];
          });
        }
        return newState;

      case RECEIVE_USER:
        newState = merge({}, oldState);
        if (action.backings) {
          Object.keys(action.backings).forEach(backingId => {
            newState[backingId] = action.backings[backingId];
          });
        }
        return newState;

      case RECEIVE_BACKING_ERRORS:
        return oldState;

      default:
        return oldState;
    }
};

export default backingsReducer;
