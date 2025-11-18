import { Navigate } from 'react-router-dom';

export function Redirect({ to, ...props }) {
  return <Navigate to={to} replace {...props} />;
}