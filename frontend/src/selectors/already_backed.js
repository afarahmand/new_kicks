import { createSelector } from 'reselect';
import { selectBackings } from './entities';

const selectAlreadyBacked = (projectRewardIds, currentUser) => createSelector(
    [selectBackings], (backings) => {
        if (!currentUser) { return false; }

        for (const backingId in backings) {
            const backing = backings[backingId];
            if (
                projectRewardIds.includes(backing.reward_id) &&
                backing.user_id === currentUser.id
            ) {
                return true;
            }
        }

        return false;
    }
);

export default selectAlreadyBacked;