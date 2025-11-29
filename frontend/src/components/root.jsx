import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { getCurrentUser } from '../actions/session_actions';

import App from './App';

const Root = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.session.currentUser);

  useEffect(() => {
      dispatch(getCurrentUser());
  }, []);

  return (
    <HashRouter>
      <App/>
    </HashRouter>
  )
};

export default Root;
