import { createSelector } from 'reselect';
import {
    selectBackings, selectProjects, selectRewards, selectUsers
} from './entities';

const selectBackedProjects = userId => createSelector(
    [selectBackings, selectProjects, selectRewards, selectUsers],
    (backings, projects, rewards, users) => {
    const user = users[userId];
    let backing, reward;
    let backedProjects = [];

    if (user === undefined) { return []; }
    
    for (const backingId in backings) {
        backing = backings[backingId];
        if (backing.user_id === user.id) {
            reward = rewards[backing.reward_id];
            if (reward) {
                backedProjects.push(projects[reward.project_id]);
            }
        }
    }

    return backedProjects;
})

export default selectBackedProjects;