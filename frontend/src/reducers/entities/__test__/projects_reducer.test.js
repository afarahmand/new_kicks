import { describe, it, expect } from 'vitest';
import projectsReducer from '../projects_reducer';
import {
    RECEIVE_ALL_PROJECTS,
    RECEIVE_PROJECT,
    RECEIVE_PROJECT_ERRORS,
    REMOVE_PROJECT
} from '../../../actions/project_actions';
import { RECEIVE_USER } from '../../../actions/user_actions';

describe('projectsReducer', () => {
    it('returns the initial state by default', () => {
        const result = projectsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual({});
    });

    describe('RECEIVE_ALL_PROJECTS', () => {
        it('replaces state with projects from response', () => {
            const initialState = {
                1: { id: 1, title: 'Old Project', description: 'Old description' }
            };
            const projects = {
                2: { id: 2, title: 'Project 2', description: 'Description 2' },
                3: { id: 3, title: 'Project 3', description: 'Description 3' }
            };
            const action = { type: RECEIVE_ALL_PROJECTS, projects };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual(projects);
            expect(result).not.toEqual(initialState);
        });

        it('handles empty projects object in action', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' }
            };
            const action = { type: RECEIVE_ALL_PROJECTS, projects: {} };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({});
        });
    });

    describe('RECEIVE_PROJECT', () => {
        it('adds a new project to the state', () => {
            const initialState = {};
            const project = { id: 1, title: 'New Project', description: 'New description' };
            const action = { type: RECEIVE_PROJECT, project };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({ 1: project });
        });

        it('adds a project to existing state without mutating', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' }
            };
            const newProject = { id: 2, title: 'Project 2', description: 'Description 2' };
            const action = { type: RECEIVE_PROJECT, project: newProject };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Project 1', description: 'Description 1' },
                2: { id: 2, title: 'Project 2', description: 'Description 2' }
            });
            expect(initialState).toEqual({
                1: { id: 1, title: 'Project 1', description: 'Description 1' }
            });
        });

        it('updates an existing project when project ID already exists', () => {
            const initialState = {
                1: { id: 1, title: 'Old Title', description: 'Old description' }
            };
            const updatedProject = { id: 1, title: 'New Title', description: 'New description' };
            const action = { type: RECEIVE_PROJECT, project: updatedProject };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'New Title', description: 'New description' }
            });
        });
    });

    describe('REMOVE_PROJECT', () => {
        it('removes a project from the state', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' },
                2: { id: 2, title: 'Project 2', description: 'Description 2' }
            };
            const action = { type: REMOVE_PROJECT, projectId: 1 };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({
                2: { id: 2, title: 'Project 2', description: 'Description 2' }
            });
            expect(result).not.toHaveProperty('1');
        });

        it('does nothing when removing non-existent project', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' }
            };
            const action = { type: REMOVE_PROJECT, projectId: 999 };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });

        it('does not mutate the original state', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' },
                2: { id: 2, title: 'Project 2', description: 'Description 2' }
            };
            const action = { type: REMOVE_PROJECT, projectId: 1 };

            const result = projectsReducer(initialState, action);

            expect(result).not.toBe(initialState);
            expect(initialState).toEqual({
                1: { id: 1, title: 'Project 1', description: 'Description 1' },
                2: { id: 2, title: 'Project 2', description: 'Description 2' }
            });
        });
    });

    describe('RECEIVE_USER', () => {
        it('merges backed_projects from user response', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Project', description: 'Existing description' }
            };
            const backedProjects = {
                2: { id: 2, title: 'Backed Project', description: 'Backed description' },
                3: { id: 3, title: 'Another Backed', description: 'Another description' }
            };
            const action = { type: RECEIVE_USER, backed_projects: backedProjects };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Existing Project', description: 'Existing description' },
                2: { id: 2, title: 'Backed Project', description: 'Backed description' },
                3: { id: 3, title: 'Another Backed', description: 'Another description' }
            });
        });

        it('merges created_projects from user response', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Project', description: 'Existing description' }
            };
            const createdProjects = {
                4: { id: 4, title: 'Created Project', description: 'Created description' }
            };
            const action = { type: RECEIVE_USER, created_projects: createdProjects };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Existing Project', description: 'Existing description' },
                4: { id: 4, title: 'Created Project', description: 'Created description' }
            });
        });

        it('merges both backed_projects and created_projects', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Project', description: 'Existing description' }
            };
            const backedProjects = {
                2: { id: 2, title: 'Backed Project', description: 'Backed description' }
            };
            const createdProjects = {
                3: { id: 3, title: 'Created Project', description: 'Created description' }
            };
            const action = {
                type: RECEIVE_USER,
                backed_projects: backedProjects,
                created_projects: createdProjects
            };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Existing Project', description: 'Existing description' },
                2: { id: 2, title: 'Backed Project', description: 'Backed description' },
                3: { id: 3, title: 'Created Project', description: 'Created description' }
            });
        });

        it('updates existing projects when IDs overlap', () => {
            const initialState = {
                1: { id: 1, title: 'Old Title', description: 'Old description' }
            };
            const backedProjects = {
                1: { id: 1, title: 'Updated Title', description: 'Updated description' },
                2: { id: 2, title: 'New Project', description: 'New description' }
            };
            const action = { type: RECEIVE_USER, backed_projects: backedProjects };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Updated Title', description: 'Updated description' },
                2: { id: 2, title: 'New Project', description: 'New description' }
            });
        });

        it('handles user with no backed or created projects', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' }
            };
            const action = { type: RECEIVE_USER };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });

        it('handles user with empty backed and created projects', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' }
            };
            const action = {
                type: RECEIVE_USER,
                backed_projects: {},
                created_projects: {}
            };

            const result = projectsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });
    });

    describe('RECEIVE_PROJECT_ERRORS', () => {
        it('returns the state unchanged', () => {
            const initialState = {
                1: { id: 1, title: 'Project 1', description: 'Description 1' }
            };
            const action = { type: RECEIVE_PROJECT_ERRORS, errors: ['error'] };

            const result = projectsReducer(initialState, action);

            expect(result).toBe(initialState);
        });
    });

    it('maintains immutability across actions', () => {
        let state = {};
        const project1 = { id: 1, title: 'Project 1', description: 'Description 1' };
        const project2 = { id: 2, title: 'Project 2', description: 'Description 2' };
        const backedProjects = {
            3: { id: 3, title: 'Backed Project', description: 'Backed description' }
        };

        state = projectsReducer(state, { type: RECEIVE_PROJECT, project: project1 });
        expect(state).toEqual({ 1: project1 });

        state = projectsReducer(state, { type: RECEIVE_PROJECT, project: project2 });
        expect(state).toEqual({ 1: project1, 2: project2 });

        state = projectsReducer(state, { type: RECEIVE_USER, backed_projects: backedProjects });
        expect(state).toEqual({
            1: project1,
            2: project2,
            3: { id: 3, title: 'Backed Project', description: 'Backed description' }
        });

        state = projectsReducer(state, { type: REMOVE_PROJECT, projectId: 1 });
        expect(state).toEqual({
            2: project2,
            3: { id: 3, title: 'Backed Project', description: 'Backed description' }
        });
    });
});