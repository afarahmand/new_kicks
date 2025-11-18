const KICKS_API_BASE_URL = import.meta.env.KICKS_API_BASE_URL || '';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

const DEFAULT_OPTIONS = {
  credentials: 'include',
};

export const fetchWrapper = (url, options = {}) => {
  const fullUrl = `${KICKS_API_BASE_URL}${url}`;
  
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