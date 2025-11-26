import { fetchWrapper } from './base_api_util';

export const createBacking = backing => {
  return fetchWrapper(`/api/projects/${backing.projectId}/rewards/${backing.rewardId}/backings`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}