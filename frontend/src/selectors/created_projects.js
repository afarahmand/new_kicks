import { createSelector } from 'reselect';
import { selectProjects, selectUsers } from './entities';

const selectCreatedProjects = userId => createSelector(
    [selectProjects, selectUsers], (projects, users) => {
        const user = users[userId];
        let project;
        let createdProjects = [];

        if (user === undefined) { return []; }

        for (const projectId in projects) {
            project = projects[projectId];
            if (project.user_id === user.id) {
                createdProjects.push(project);
            }
        }

        return createdProjects;
    }
)

export default selectCreatedProjects;