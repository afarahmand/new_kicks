export const selectAlreadyBacked = (projectRewardIds, currentUser) => (
    (state) => {
        if (currentUser) {
            for (const backingId in state.entities.backings) {
                let backing = state.entities.backings[backingId];
                if ((projectRewardIds.includes(backing.reward_id)) && (backing.user_id === currentUser.id)) {
                    return true;
                }
            }

            return false;
        } else {
            return false;
        }
    }
)