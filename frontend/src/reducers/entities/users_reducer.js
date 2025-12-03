import {
  RECEIVE_ALL_PROJECTS,
  RECEIVE_PROJECT
} from '../../actions/project_actions';

import { RECEIVE_USER } from '../../actions/user_actions';

const usersReducer = (oldState = {}, action) => {
  Object.freeze(oldState);

  switch(action.type) {
    case RECEIVE_ALL_PROJECTS:
      return action.users;

    case RECEIVE_PROJECT:
      return { ...oldState, [action.user.id]: action.user }

    case RECEIVE_USER:
      return { ...oldState, [action.user.id]: action.user }

    default:
      return oldState;
  }
};

export default usersReducer;
