import { createSelector } from 'reselect';
import { selectRewards } from './entities';
import { sortByAscendingAmount } from '../utils/sort_util';

const selectProjectRewards = projectId => createSelector(
    [selectRewards],
    (rewards) => {
        let projectRewards = [];
        let reward;

        for (const rewardId in rewards) {
            reward = rewards[rewardId];
            if (reward.project_id === projectId) {
                projectRewards.push(reward);
            }
        }

        return sortByAscendingAmount(projectRewards);
    }
)

export default selectProjectRewards;