const BASE_URL_KICKS_API = import.meta.env.BASE_URL_KICKS_API || '';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

const DEFAULT_OPTIONS = {
  credentials: 'include',
};

export const fetchWrapper = (url, options = {}) => {
  const fullUrl = `${BASE_URL_KICKS_API}${url}`;
  
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  };

  return fetch(fullUrl, config).then(handleFetchResponse);
};

const handleFetchResponse = response => {
  if (!response.ok) {
    return response.json().then(err => Promise.reject(err));
  }
  return response.json();
};