import { describe, it, expect } from 'vitest';
import entitiesReducer from '../entities_reducer';
import backingsReducer from '../entities/backings_reducer';
import categoriesReducer from '../entities/categories_reducer';
import projectsReducer from '../entities/projects_reducer';
import rewardsReducer from '../entities/rewards_reducer';
import usersReducer from '../entities/users_reducer';

// Mock child reducers to test combineReducers behavior
vi.mock('../entities/backings_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

vi.mock('../entities/categories_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

vi.mock('../entities/projects_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

vi.mock('../entities/rewards_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

vi.mock('../entities/users_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

describe('entitiesReducer', () => {
    const initialState = {
        backings: {},
        categories: {},
        projects: {},
        rewards: {},
        users: {}
    };

    beforeEach(() => {
        // Reset all mocks before each test
        backingsReducer.mockClear();
        categoriesReducer.mockClear();
        projectsReducer.mockClear();
        rewardsReducer.mockClear();
        usersReducer.mockClear();
        
        // Set default return values
        backingsReducer.mockImplementation((state = {}) => state);
        categoriesReducer.mockImplementation((state = {}) => state);
        projectsReducer.mockImplementation((state = {}) => state);
        rewardsReducer.mockImplementation((state = {}) => state);
        usersReducer.mockImplementation((state = {}) => state);
    });

    it('returns the initial state structure', () => {
        const result = entitiesReducer(undefined, { type: 'UNKNOWN_ACTION' });
        
        expect(result).toEqual(initialState);
        expect(Object.keys(result)).toEqual([
            'backings',
            'categories', 
            'projects',
            'rewards',
            'users'
        ]);
    });

    it('calls each child reducer with their slice of state', () => {
        const currentState = {
            backings: { 1: { id: 1 } },
            categories: { 1: { id: 1, name: 'Tech' } },
            projects: { 1: { id: 1, title: 'Project' } },
            rewards: { 1: { id: 1, amount: 25 } },
            users: { 1: { id: 1, username: 'user' } }
        };
        const action = { type: 'SOME_ACTION' };
        
        const result = entitiesReducer(currentState, action);
        
        expect(backingsReducer).toHaveBeenCalledWith(currentState.backings, action);
        expect(categoriesReducer).toHaveBeenCalledWith(currentState.categories, action);
        expect(projectsReducer).toHaveBeenCalledWith(currentState.projects, action);
        expect(rewardsReducer).toHaveBeenCalledWith(currentState.rewards, action);
        expect(usersReducer).toHaveBeenCalledWith(currentState.users, action);
    });

    it('passes undefined state to child reducers when their slice is undefined', () => {
        const action = { type: 'SOME_ACTION' };
        
        entitiesReducer(undefined, action);
        
        expect(backingsReducer).toHaveBeenCalledWith(undefined, action);
        expect(categoriesReducer).toHaveBeenCalledWith(undefined, action);
        expect(projectsReducer).toHaveBeenCalledWith(undefined, action);
        expect(rewardsReducer).toHaveBeenCalledWith(undefined, action);
        expect(usersReducer).toHaveBeenCalledWith(undefined, action);
    });

    it('combines results from all child reducers', () => {
        const currentState = {
            backings: { old: 'backing' },
            categories: { old: 'category' },
            projects: { old: 'project' },
            rewards: { old: 'reward' },
            users: { old: 'user' }
        };
        
        // Mock each reducer to return specific values
        backingsReducer.mockReturnValue({ backing: 'updated' });
        categoriesReducer.mockReturnValue({ category: 'updated' });
        projectsReducer.mockReturnValue({ project: 'updated' });
        rewardsReducer.mockReturnValue({ reward: 'updated' });
        usersReducer.mockReturnValue({ user: 'updated' });
        
        const action = { type: 'UPDATE_ALL' };
        const result = entitiesReducer(currentState, action);
        
        expect(result).toEqual({
            backings: { backing: 'updated' },
            categories: { category: 'updated' },
            projects: { project: 'updated' },
            rewards: { reward: 'updated' },
            users: { user: 'updated' }
        });
    });

    it('handles actions that only affect some reducers', () => {
        const currentState = {
            backings: { 1: { id: 1 } },
            categories: { 1: { id: 1, name: 'Tech' } },
            projects: { 1: { id: 1, title: 'Project' } },
            rewards: { 1: { id: 1, amount: 25 } },
            users: { 1: { id: 1, username: 'user' } }
        };
        
        // Only backings and projects reducers return new state
        backingsReducer.mockReturnValue({ 1: { id: 1, updated: true } });
        categoriesReducer.mockReturnValue(currentState.categories); // Same reference
        projectsReducer.mockReturnValue({ 1: { id: 1, title: 'Updated' } });
        rewardsReducer.mockReturnValue(currentState.rewards); // Same reference
        usersReducer.mockReturnValue(currentState.users); // Same reference
        
        const action = { type: 'UPDATE_SOME' };
        const result = entitiesReducer(currentState, action);
        
        expect(result).toEqual({
            backings: { 1: { id: 1, updated: true } },
            categories: { 1: { id: 1, name: 'Tech' } },
            projects: { 1: { id: 1, title: 'Updated' } },
            rewards: { 1: { id: 1, amount: 25 } },
            users: { 1: { id: 1, username: 'user' } }
        });
        
        // Verify categories, rewards, and users returned same references
        expect(result.categories).toBe(currentState.categories);
        expect(result.rewards).toBe(currentState.rewards);
        expect(result.users).toBe(currentState.users);
        
        // Verify backings and projects returned new references
        expect(result.backings).not.toBe(currentState.backings);
        expect(result.projects).not.toBe(currentState.projects);
    });

    it('does not generate an error when state is frozen', () => {
        const frozenState = Object.freeze({
            backings: {},
            categories: {},
            projects: {},
            rewards: {},
            users: {}
        });
        const action = { type: 'ANY_ACTION' };
        
        expect(() => {
            entitiesReducer(frozenState, action);
        }).not.toThrow();
    });

    it('preserves reducer independence', () => {
        const currentState = {
            backings: { b1: 'backing1' },
            categories: { c1: 'category1' },
            projects: { p1: 'project1' },
            rewards: { r1: 'reward1' },
            users: { u1: 'user1' }
        };
        
        // Each reducer returns completely different structures
        backingsReducer.mockReturnValue({ backingOnly: 'value' });
        categoriesReducer.mockReturnValue({ categoryOnly: 'value' });
        projectsReducer.mockReturnValue({ projectOnly: 'value' });
        rewardsReducer.mockReturnValue({ rewardOnly: 'value' });
        usersReducer.mockReturnValue({ userOnly: 'value' });
        
        const action = { type: 'INDEPENDENT_UPDATE' };
        const result = entitiesReducer(currentState, action);
        
        expect(result).toEqual({
            backings: { backingOnly: 'value' },
            categories: { categoryOnly: 'value' },
            projects: { projectOnly: 'value' },
            rewards: { rewardOnly: 'value' },
            users: { userOnly: 'value' }
        });
    });

    it('handles nested state updates correctly', () => {
        const deeplyNestedState = {
            backings: {
                1: { id: 1, nested: { prop: 'value' } },
                2: { id: 2, nested: { prop: 'other' } }
            },
            categories: {
                1: { id: 1, name: 'Tech', tags: ['a', 'b'] }
            },
            projects: {
                1: { id: 1, title: 'Project', details: { complex: true } }
            },
            rewards: {
                1: { id: 1, amount: 25, description: 'Reward' }
            },
            users: {
                1: { id: 1, username: 'user', profile: { bio: 'test' } }
            }
        };
        
        // Mock reducers to return modified nested state
        backingsReducer.mockReturnValue({
            ...deeplyNestedState.backings,
            1: { ...deeplyNestedState.backings[1], updated: true }
        });
        
        const action = { type: 'UPDATE_NESTED' };
        const result = entitiesReducer(deeplyNestedState, action);
        
        // Verify backings was updated
        expect(result.backings[1].updated).toBe(true);
        expect(result.backings[1].nested.prop).toBe('value'); // Other nested props preserved
        expect(result.backings[2]).toEqual({ id: 2, nested: { prop: 'other' } }); // Unchanged
        
        // Other reducers should have been called but returned same state (default mock)
        expect(result.categories).toBe(deeplyNestedState.categories);
        expect(result.projects).toBe(deeplyNestedState.projects);
        expect(result.rewards).toBe(deeplyNestedState.rewards);
        expect(result.users).toBe(deeplyNestedState.users);
    });

    it('returns same reference when no child reducers change state', () => {
        const currentState = {
            backings: {},
            categories: {},
            projects: {},
            rewards: {},
            users: {}
        };
        
        // All reducers return the same state they received
        backingsReducer.mockImplementation((state) => state);
        categoriesReducer.mockImplementation((state) => state);
        projectsReducer.mockImplementation((state) => state);
        rewardsReducer.mockImplementation((state) => state);
        usersReducer.mockImplementation((state) => state);
        
        const action = { type: 'NO_CHANGE_ACTION' };
        const result = entitiesReducer(currentState, action);
        
        expect(result).toBe(currentState);
    });

    it('handles partial state updates correctly', () => {
        // Test when only part of the state is provided
        const partialState = {
            backings: { 1: { id: 1 } },
            // Missing other slices
        };
        
        const action = { type: 'PARTIAL_ACTION' };
        
        // This should work because combineReducers handles missing slices
        expect(() => {
            entitiesReducer(partialState, action);
        }).not.toThrow();
        
        // Each reducer should receive their slice or undefined
        expect(backingsReducer).toHaveBeenCalledWith(partialState.backings, action);
        expect(categoriesReducer).toHaveBeenCalledWith(undefined, action);
        expect(projectsReducer).toHaveBeenCalledWith(undefined, action);
        expect(rewardsReducer).toHaveBeenCalledWith(undefined, action);
        expect(usersReducer).toHaveBeenCalledWith(undefined, action);
    });

    it('maintains proper combineReducers behavior', () => {
        // This test verifies the fundamental behavior of combineReducers
        const action = { type: 'TEST' };
        
        // Call with undefined state
        const initialStateResult = entitiesReducer(undefined, action);
        
        // Call with defined state
        const definedState = {
            backings: { test: 'backing' },
            categories: { test: 'category' },
            projects: { test: 'project' },
            rewards: { test: 'reward' },
            users: { test: 'user' }
        };
        const definedStateResult = entitiesReducer(definedState, action);
        
        // Both should call reducers with appropriate states
        expect(backingsReducer).toHaveBeenCalledTimes(2);
        expect(backingsReducer).toHaveBeenCalledWith(undefined, action);
        expect(backingsReducer).toHaveBeenCalledWith(definedState.backings, action);
        
        // Results should have same structure
        expect(Object.keys(initialStateResult)).toEqual(Object.keys(definedStateResult));
    });
});