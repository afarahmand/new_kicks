import { fetchWrapper } from "./base_api_util";

export const fetchUser = id => {
  return fetchWrapper(`api/users/${id}`, {
    method: 'GET',
  });
};