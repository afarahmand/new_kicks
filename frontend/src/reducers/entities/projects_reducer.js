import merge from 'deepmerge';
import {
  RECEIVE_ALL_PROJECTS,
  RECEIVE_PROJECT,
  RECEIVE_PROJECT_ERRORS,
  REMOVE_PROJECT
} from '../../actions/project_actions';

import { RECEIVE_USER } from '../../actions/user_actions';

const projectsReducer = (oldState = {}, action) => {
  Object.freeze(oldState);
  let newState;

  switch(action.type) {

    case RECEIVE_ALL_PROJECTS:
      return action.projects;

    case RECEIVE_PROJECT:
      return { ...oldState, [action.project.id]: action.project };

    case REMOVE_PROJECT:
      newState = merge({}, oldState);
      delete newState[action.projectId];
      return newState;

    case RECEIVE_USER:
      newState = merge({}, oldState);
      if (action.backed_projects) {
        Object.keys(action.backed_projects).forEach(projectId => {
          newState[projectId] = action.backed_projects[projectId];
        });
      }
      if (action.created_projects) {
        Object.keys(action.created_projects).forEach(projectId => {
          newState[projectId] = action.created_projects[projectId];
        });
      }
      return newState;

    case RECEIVE_PROJECT_ERRORS:
      return oldState;

    default:
      return oldState;
  }
};

export default projectsReducer;
