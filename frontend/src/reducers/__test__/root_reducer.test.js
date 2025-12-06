import { describe, it, expect, vi } from 'vitest';
import rootReducer from '../root_reducer';
import entitiesReducer from '../entities_reducer';
import errorsReducer from '../errors_reducer';
import sessionReducer from '../session_reducer';

// Mock child reducers to test combineReducers behavior
vi.mock('../entities_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

vi.mock('../errors_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

vi.mock('../session_reducer', () => ({
    default: vi.fn((state = {}) => state)
}));

describe('rootReducer', () => {
    const initialState = {
        entities: {},
        errors: {},
        session: {
            currentUser: null,
            loading: false
        }
    };

    beforeEach(() => {
        // Reset all mocks before each test
        entitiesReducer.mockClear();
        errorsReducer.mockClear();
        sessionReducer.mockClear();
        
        // Set default return values
        entitiesReducer.mockImplementation((state = {}) => state);
        errorsReducer.mockImplementation((state = {}) => state);
        sessionReducer.mockImplementation((state = initialState.session) => state);
    });

    it('returns the initial state structure when passed an unknown action', () => {
        const result = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
        
        expect(result).toEqual(initialState);
        expect(Object.keys(result)).toEqual([
            'entities',
            'errors',
            'session'
        ]);
    });

    it('has correct nested structure for initial state', () => {
        const result = rootReducer(undefined, { type: '@@INIT' });
        
        expect(result.entities).toEqual({});
        expect(result.errors).toEqual({});
        expect(result.session).toEqual({
            currentUser: null,
            loading: false
        });
    });

    it('calls each child reducer with their slice of state', () => {
        const currentState = {
            entities: {
                users: { 1: { id: 1, username: 'test' } },
                projects: { 1: { id: 1, title: 'Project' } }
            },
            errors: {
                session: ['Invalid credentials'],
                projects: ['Title required']
            },
            session: {
                currentUser: { id: 1, username: 'test' },
                loading: false
            }
        };
        const action = { type: 'SOME_ACTION' };
        
        const result = rootReducer(currentState, action);
        
        expect(entitiesReducer).toHaveBeenCalledWith(currentState.entities, action);
        expect(errorsReducer).toHaveBeenCalledWith(currentState.errors, action);
        expect(sessionReducer).toHaveBeenCalledWith(currentState.session, action);
    });

    it('passes undefined state to child reducers when their slice is undefined', () => {
        const action = { type: 'SOME_ACTION' };
        
        rootReducer(undefined, action);
        
        expect(entitiesReducer).toHaveBeenCalledWith(undefined, action);
        expect(errorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(sessionReducer).toHaveBeenCalledWith(undefined, action);
    });

    it('combines results from all child reducers', () => {
        const currentState = {
            entities: { old: 'entity' },
            errors: { old: 'error' },
            session: { old: 'session' }
        };
        
        // Mock each reducer to return specific values
        entitiesReducer.mockReturnValue({ entities: 'updated' });
        errorsReducer.mockReturnValue({ errors: 'updated' });
        sessionReducer.mockReturnValue({ session: 'updated' });
        
        const action = { type: 'UPDATE_ALL' };
        const result = rootReducer(currentState, action);
        
        expect(result).toEqual({
            entities: { entities: 'updated' },
            errors: { errors: 'updated' },
            session: { session: 'updated' }
        });
    });

    it('handles actions that only affect some reducers', () => {
        const currentState = {
            entities: { users: { 1: { id: 1 } } },
            errors: { session: [] },
            session: {
                currentUser: null,
                loading: false
            }
        };
        
        // Only session reducer returns new state
        entitiesReducer.mockReturnValue(currentState.entities); // Same reference
        errorsReducer.mockReturnValue(currentState.errors); // Same reference
        sessionReducer.mockReturnValue({
            currentUser: { id: 1, username: 'loggedin' },
            loading: false
        });
        
        const action = { type: 'RECEIVE_CURRENT_USER', user: { id: 1, username: 'loggedin' } };
        const result = rootReducer(currentState, action);
        
        expect(result).toEqual({
            entities: { users: { 1: { id: 1 } } },
            errors: { session: [] },
            session: {
                currentUser: { id: 1, username: 'loggedin' },
                loading: false
            }
        });
        
        // Verify entities and errors returned same references
        expect(result.entities).toBe(currentState.entities);
        expect(result.errors).toBe(currentState.errors);
        
        // Verify session returned new reference
        expect(result.session).not.toBe(currentState.session);
    });

    it('simulates real-world application flow scenarios', () => {
        let state = initialState;
        
        // 1. User logs in
        sessionReducer.mockReturnValue({
            currentUser: { id: 1, username: 'testuser' },
            loading: false
        });
        state = rootReducer(state, { type: 'RECEIVE_CURRENT_USER', user: { id: 1, username: 'testuser' } });
        expect(state.session.currentUser).toEqual({ id: 1, username: 'testuser' });
        
        // 2. Load projects (entities updated)
        entitiesReducer.mockReturnValue({
            projects: { 1: { id: 1, title: 'Project 1' } },
            users: {},
            backings: {},
            categories: {},
            rewards: {}
        });
        state = rootReducer(state, { type: 'RECEIVE_ALL_PROJECTS' });
        expect(state.entities.projects).toEqual({ 1: { id: 1, title: 'Project 1' } });
        
        // 3. Create project with error
        errorsReducer.mockReturnValue({
            projects: ['Title required', 'Goal too low'],
            session: [],
            backings: [],
            rewards: []
        });
        state = rootReducer(state, { type: 'RECEIVE_PROJECT_ERRORS', errors: ['Title required', 'Goal too low'] });
        expect(state.errors.projects).toEqual(['Title required', 'Goal too low']);
        
        // 4. Fix and create project successfully
        entitiesReducer.mockReturnValue({
            projects: { 
                1: { id: 1, title: 'Project 1' },
                2: { id: 2, title: 'Valid Project' }
            },
            users: {},
            backings: {},
            categories: {},
            rewards: {}
        });
        errorsReducer.mockReturnValue({
            projects: [],
            session: [],
            backings: [],
            rewards: []
        });
        state = rootReducer(state, { 
            type: 'RECEIVE_PROJECT', 
            project: { id: 2, title: 'Valid Project' } 
        });
        expect(state.entities.projects[2]).toEqual({ id: 2, title: 'Valid Project' });
        expect(state.errors.projects).toEqual([]);
    });

    it('handles loading state transitions', () => {
        let state = initialState;
        
        // Start loading
        sessionReducer.mockReturnValue({
            currentUser: null,
            loading: true
        });
        state = rootReducer(state, { type: 'LOADING' });
        expect(state.session.loading).toBe(true);
        
        // Loading complete with success
        sessionReducer.mockReturnValue({
            currentUser: { id: 1, username: 'user' },
            loading: false
        });
        state = rootReducer(state, { type: 'RECEIVE_CURRENT_USER', user: { id: 1, username: 'user' } });
        expect(state.session.loading).toBe(false);
        expect(state.session.currentUser).toEqual({ id: 1, username: 'user' });
        
        // Start loading again
        sessionReducer.mockReturnValue({
            currentUser: { id: 1, username: 'user' },
            loading: true
        });
        state = rootReducer(state, { type: 'LOADING' });
        expect(state.session.loading).toBe(true);
        
        // Loading complete with error (session errors go to errors reducer, not session reducer)
        sessionReducer.mockReturnValue({
            currentUser: { id: 1, username: 'user' },
            loading: false
        });
        errorsReducer.mockReturnValue({
            session: ['Action failed'],
            projects: [],
            backings: [],
            rewards: []
        });
        state = rootReducer(state, { type: 'RECEIVE_SESSION_ERRORS', errors: ['Action failed'] });
        expect(state.session.loading).toBe(false);
        expect(state.errors.session).toEqual(['Action failed']);
    });

    it('maintains independent state slices', () => {
        const complexState = {
            entities: {
                users: { 1: { id: 1, username: 'alice' } },
                projects: { 
                    1: { id: 1, title: 'Project A', userId: 1 },
                    2: { id: 2, title: 'Project B', userId: 2 }
                },
                backings: {
                    1: { id: 1, projectId: 1, userId: 2 }
                },
                categories: { 1: { id: 1, name: 'Technology' } },
                rewards: { 1: { id: 1, projectId: 1, amount: 25 } }
            },
            errors: {
                session: [],
                projects: ['Some project error'],
                backings: [],
                rewards: []
            },
            session: {
                currentUser: { id: 1, username: 'alice' },
                loading: false
            }
        };
        
        // Update only the session slice
        sessionReducer.mockReturnValue({
            currentUser: null,
            loading: false
        });
        
        const action = { type: 'RECEIVE_CURRENT_USER', user: null };
        const result = rootReducer(complexState, action);
        
        // Session changed
        expect(result.session.currentUser).toBe(null);
        
        // Entities unchanged (same reference)
        expect(result.entities).toBe(complexState.entities);
        expect(result.entities.users[1]).toEqual({ id: 1, username: 'alice' });
        expect(result.entities.projects[1]).toEqual({ id: 1, title: 'Project A', userId: 1 });
        
        // Errors unchanged (same reference)
        expect(result.errors).toBe(complexState.errors);
        expect(result.errors.projects).toEqual(['Some project error']);
    });

    it('returns same reference when no child reducers change state', () => {
        const currentState = {
            entities: { test: 'data' },
            errors: { test: 'errors' },
            session: { test: 'session' }
        };
        
        // All reducers return the same state they received
        entitiesReducer.mockImplementation((state) => state);
        errorsReducer.mockImplementation((state) => state);
        sessionReducer.mockImplementation((state) => state);
        
        const action = { type: 'NO_CHANGE_ACTION' };
        const result = rootReducer(currentState, action);
        
        expect(result).toBe(currentState);
    });

    it('handles partial state correctly', () => {
        // Test when state has missing slices (edge case)
        const partialState = {
            entities: { users: {} }
            // Missing errors and session
        };
        
        const action = { type: 'PARTIAL_ACTION' };
        
        expect(() => {
            rootReducer(partialState, action);
        }).not.toThrow();
        
        // Each reducer should receive their slice or undefined
        expect(entitiesReducer).toHaveBeenCalledWith(partialState.entities, action);
        expect(errorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(sessionReducer).toHaveBeenCalledWith(undefined, action);
    });

    it('preserves Redux combineReducers contract', () => {
        // Test fundamental combineReducers behavior
        const action = { type: 'TEST_ACTION' };
        
        // Initial call
        const initResult = rootReducer(undefined, action);
        
        // Verify all child reducers were called
        expect(entitiesReducer).toHaveBeenCalledWith(undefined, action);
        expect(errorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(sessionReducer).toHaveBeenCalledWith(undefined, action);
        
        // Structure should match initialState
        expect(Object.keys(initResult)).toEqual(Object.keys(initialState));
    });

    it('handles nested updates across reducers', () => {
        // Simulate a complex action that affects multiple reducers
        const currentState = {
            entities: {
                users: { 1: { id: 1, username: 'user' } },
                projects: {},
                backings: {},
                categories: {},
                rewards: {}
            },
            errors: {
                session: [],
                projects: [],
                backings: [],
                rewards: []
            },
            session: {
                currentUser: { id: 1, username: 'user' },
                loading: false
            }
        };
        
        // Action: User creates a project
        const project = { id: 1, title: 'New Project', userId: 1 };
        const action = { type: 'RECEIVE_PROJECT', project };
        
        // Mock responses
        entitiesReducer.mockReturnValue({
            ...currentState.entities,
            projects: { 1: project }
        });
        
        sessionReducer.mockReturnValue({
            ...currentState.session,
            loading: false
        });
        
        const result = rootReducer(currentState, action);
        
        // Entities updated with new project
        expect(result.entities.projects[1]).toEqual(project);
        
        // Session loading set to false
        expect(result.session.loading).toBe(false);
        
        // Errors unchanged
        expect(result.errors).toBe(currentState.errors);
    });

    it('handles error scenarios across reducers', () => {
        const currentState = {
            entities: {},
            errors: {},
            session: {
                currentUser: null,
                loading: true
            }
        };
        
        // Action: Login fails
        const action = { type: 'RECEIVE_SESSION_ERRORS', errors: ['Invalid credentials'] };
        
        // Mock responses
        sessionReducer.mockReturnValue({
            ...currentState.session,
            loading: false
        });
        
        errorsReducer.mockReturnValue({
            session: ['Invalid credentials'],
            projects: [],
            backings: [],
            rewards: []
        });
        
        const result = rootReducer(currentState, action);
        
        // Session loading stopped
        expect(result.session.loading).toBe(false);
        
        // Error recorded in errors reducer (not session reducer)
        expect(result.errors.session).toEqual(['Invalid credentials']);
        
        // Entities unchanged
        expect(result.entities).toBe(currentState.entities);
    });

    it('maintains performance with unchanged slices', () => {
        const largeState = {
            entities: {
                users: Array.from({ length: 1000 }, (_, i) => ({ id: i, username: `user${i}` }))
                    .reduce((acc, user) => ({ ...acc, [user.id]: user }), {}),
                projects: Array.from({ length: 500 }, (_, i) => ({ id: i, title: `Project ${i}` }))
                    .reduce((acc, project) => ({ ...acc, [project.id]: project }), {}),
                backings: {},
                categories: {},
                rewards: {}
            },
            errors: {
                session: [],
                projects: [],
                backings: [],
                rewards: []
            },
            session: {
                currentUser: { id: 1, username: 'user1' },
                loading: false
            }
        };
        
        // Action that only affects session
        const action = { type: 'LOADING' };
        
        sessionReducer.mockReturnValue({
            ...largeState.session,
            loading: true
        });
        
        // Ensure other reducers return same references
        entitiesReducer.mockImplementation((state) => state);
        errorsReducer.mockImplementation((state) => state);
        
        const result = rootReducer(largeState, action);
        
        // Session updated
        expect(result.session.loading).toBe(true);
        
        // Large entities slice unchanged (same reference for performance)
        expect(result.entities).toBe(largeState.entities);
        
        // Errors unchanged
        expect(result.errors).toBe(largeState.errors);
    });

    it('clearly separates session state from session errors', () => {
        const state = initialState;
        
        // Action that triggers both session state change and session error
        const action = { type: 'RECEIVE_SESSION_ERRORS', errors: ['Login failed'] };
        
        // Session reducer handles loading state only
        sessionReducer.mockReturnValue({
            currentUser: null,
            loading: false
        });
        
        // Errors reducer handles the actual error messages
        errorsReducer.mockReturnValue({
            session: ['Login failed'],
            projects: [],
            backings: [],
            rewards: []
        });
        
        const result = rootReducer(state, action);
        
        // Session state contains user and loading info only
        expect(result.session).toEqual({
            currentUser: null,
            loading: false
        });
        
        // Session errors are in the errors branch
        expect(result.errors.session).toEqual(['Login failed']);
        
        // No errors array in session state
        expect(result.session.errors).toBeUndefined();
    });

    it('handles successful login flow with proper state separation', () => {
        let state = initialState;
        
        // 1. Start loading login
        sessionReducer.mockReturnValue({
            currentUser: null,
            loading: true
        });
        state = rootReducer(state, { type: 'LOADING' });
        expect(state.session.loading).toBe(true);
        expect(state.session.currentUser).toBe(null);
        
        // 2. Login successful
        const user = { id: 1, username: 'testuser', email: 'test@example.com' };
        sessionReducer.mockReturnValue({
            currentUser: user,
            loading: false
        });
        state = rootReducer(state, { type: 'RECEIVE_CURRENT_USER', user });
        expect(state.session.currentUser).toEqual(user);
        expect(state.session.loading).toBe(false);
        
        // 3. Session errors cleared on successful login (via errors reducer)
        errorsReducer.mockReturnValue({
            session: [],
            projects: [],
            backings: [],
            rewards: []
        });
        state = rootReducer(state, { type: 'RECEIVE_CURRENT_USER', user });
        expect(state.errors.session).toEqual([]);
        
        // Verify clean separation
        expect(state.session).toEqual({
            currentUser: user,
            loading: false
        });
        expect(state.session.errors).toBeUndefined();
    });
});