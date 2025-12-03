import { connect, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const Auth = ({ children, signedIn }) => {
  return !signedIn ? children : <Navigate to="/" replace />;
};

const Protected = ({ children, signedIn }) => {
  const loading = useSelector(state => state.session.loading);
  return (signedIn || loading) ? children : <Navigate to="/signin" replace />;
};

const mapStateToProps = state => {
  return { signedIn: Boolean(state.session.currentUser) };
};

export const AuthRoute = connect(mapStateToProps, null)(Auth);
export const ProtectedRoute = connect(mapStateToProps, null)(Protected);