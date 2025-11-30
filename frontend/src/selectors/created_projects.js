export const selectCreatedProjects = (user) => (
    state => {
        let project;
        let createdProjects = [];

        for (const projectId in state.entities.projects) {
            project = state.entities.projects[projectId];
            if (project.user_id === user.id) {
                createdProjects.push(project);
            }
        }

        return createdProjects;
    }
)