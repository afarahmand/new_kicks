import { combineReducers } from 'redux';
import projectsErrorsReducer from './errors/projects_errors_reducer';
import rewardsErrorsReducer from './errors/rewards_errors_reducer';
import sessionErrorsReducer from './errors/session_errors_reducer';

const errorsReducer = combineReducers({
  projects: projectsErrorsReducer,
  rewards: rewardsErrorsReducer,
  session: sessionErrorsReducer
});

export default errorsReducer;
