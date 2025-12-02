import { fetchWrapper } from "./base_api_util";

export const getCurrentUser = () => (
  fetchWrapper('api/session', {
    method: 'GET',
  })
)

export const signin = user => (
  fetchWrapper('api/session', {
    method: 'POST',
    body: JSON.stringify({ user })
  })
)

export const signout = () => (
  fetchWrapper('api/session', {
    method: 'DELETE',
  })
)

export const signup = user => (
  fetchWrapper('api/users', {
    method: 'POST',
    body: JSON.stringify({ user })
  })
)