import { fetchWrapper } from "./base_api_util";

export const signin = user => {
  return fetchWrapper('/api/session', {
    method: 'POST',
    body: JSON.stringify({ user })
  });
};

export const signout = () => {
  return fetchWrapper('/api/session', {
    method: 'DELETE',
  });
};

export const signup = user => {
  return fetchWrapper('/api/users', {
    method: 'POST',
    body: JSON.stringify({ user })
  });
};