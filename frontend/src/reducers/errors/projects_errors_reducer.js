import {
  RECEIVE_ALL_PROJECTS,
  RECEIVE_PROJECT,
  REMOVE_PROJECT,
  RECEIVE_PROJECT_ERRORS
} from '../../actions/project_actions';

const projectsErrorsReducer = (oldState = [], action) => {
  Object.freeze(oldState);

  switch(action.type) {
    case RECEIVE_ALL_PROJECTS:
      return oldState;
    case RECEIVE_PROJECT:
      return oldState;
    case REMOVE_PROJECT:
      return [];
    case RECEIVE_PROJECT_ERRORS:
      return action.errors;
    default:
      return oldState;
  }
};

export default projectsErrorsReducer;
