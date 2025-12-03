export const selectCreatedProjects = (userId) => (
    state => {
        const user = state.entities.users[userId];
        let project;
        let createdProjects = [];

        if (user === undefined) { return []; }

        for (const projectId in state.entities.projects) {
            project = state.entities.projects[projectId];
            if (project.user_id === user.id) {
                createdProjects.push(project);
            }
        }

        return createdProjects;
    }
)