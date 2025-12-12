import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers/root_reducer';

const createStore = (preloadedState = {}) => (
    configureStore({
      reducer: rootReducer,
      preloadedState,
    })
  )

export default createStore;