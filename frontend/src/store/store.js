import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers/root_reducer';

const createStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export default createStore;