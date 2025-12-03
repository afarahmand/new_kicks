import { combineReducers } from 'redux';
import backingsReducer from './entities/backings_reducer';
import categoriesReducer from './entities/categories_reducer';
import projectsReducer from './entities/projects_reducer';
import rewardsReducer from './entities/rewards_reducer';
import usersReducer from './entities/users_reducer';

const entitiesReducer = combineReducers({
  backings: backingsReducer,
  categories: categoriesReducer,
  projects: projectsReducer,
  rewards: rewardsReducer,
  users: usersReducer
});

export default entitiesReducer;
