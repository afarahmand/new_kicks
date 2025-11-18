import { fetchWrapper } from "./base_api_util";

export const createReward = reward => {
  return fetchWrapper(`api/projects/${reward.project_id}/rewards`, {
    method: 'POST',
    body: JSON.stringify({ reward })
  });
};

export const updateReward = reward => {
  return fetchWrapper(`api/projects/${reward.project_id}/rewards/${reward.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ reward })
  });
};

export const deleteReward = reward => {
  return fetchWrapper(`api/projects/${reward.project_id}/rewards/${reward.id}`, {
    method: 'DELETE',
  });
};