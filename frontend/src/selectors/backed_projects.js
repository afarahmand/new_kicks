export const selectBackedProjects = (userId) => (
    state => {
        const user = state.entities.users[userId];
        let backing, reward;
        let backedProjects = [];

        if (user === undefined) { return []; }
        
        for (const backingId in state.entities.backings) {
            backing = state.entities.backings[backingId];
            if (backing.user_id === user.id) {
                reward = state.entities.rewards[backing.reward_id];
                if (reward) {
                    backedProjects.push(state.entities.projects[reward.project_id]);
                }
            }
        }

        return backedProjects;
    }
)