import { fetchWrapper } from './base_api_util';

export const fetchDiscoveryResults = (category, sort, numProjects) => {
  const params = new URLSearchParams({
    'discovery[category]': category,
    'discovery[sort]': sort,
    'discovery[numProjects]': numProjects
  });

  return fetchWrapper(`/api/project_discovery?${params}`, {
    method: 'GET',
  });
};

export const fetchSearchResults = searchQuery => {
  const params = new URLSearchParams({
    'search[query]': searchQuery
  });

  return fetchWrapper(`/api/project_searches?${params}`, {
    method: 'GET',
  });
};

export const fetchProjects = () => {
  return fetchWrapper('api/projects', {
    method: 'GET',
  });
};

export const fetchProject = id => {
  return fetchWrapper(`api/projects/${id}`, {
    method: 'GET',
  });
};

export const createProject = project => {
  return fetchWrapper('api/projects', {
    method: 'POST',
    body: JSON.stringify({ project })
  });
};

export const updateProject = project => {
  return fetchWrapper(`api/projects/${project.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ project })
  });
};

export const deleteProject = id => {
  return fetchWrapper(`api/projects/${id}`, {
    method: 'DELETE',
  });
};