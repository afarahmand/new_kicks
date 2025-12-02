import { sortByAscendingAmount } from "../utils/sort_util";

export const selectProjectRewards = (projectId) => (
    (state) => {
        let projectRewards = [];
        let reward;

        for (const rewardId in state.entities.rewards) {
            reward = state.entities.rewards[rewardId];
            if (reward.project_id === projectId) {
                projectRewards.push(reward);
            }
        }

        return sortByAscendingAmount(projectRewards);
    }
)