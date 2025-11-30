export const selectProjectRewards = (project) => (
    (state) => {
        let tempProjectRewards = [];
        let reward;

        for (const rewardId in state.entities.rewards) {
            reward = state.entities.rewards[rewardId];
            if (reward.project_id === project.id) {
                tempProjectRewards.push(reward);
            }
        }

        return tempProjectRewards;
    }
)