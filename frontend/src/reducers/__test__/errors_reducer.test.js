import { describe, it, expect, vi } from 'vitest';
import errorsReducer from '../errors_reducer';
import backingsErrorsReducer from '../errors/backings_errors_reducer';
import projectsErrorsReducer from '../errors/projects_errors_reducer';
import rewardsErrorsReducer from '../errors/rewards_errors_reducer';
import sessionErrorsReducer from '../errors/session_errors_reducer';

// Mock child reducers to test combineReducers behavior
vi.mock('../errors/backings_errors_reducer', () => ({
    default: vi.fn((state = []) => state)
}));

vi.mock('../errors/projects_errors_reducer', () => ({
    default: vi.fn((state = []) => state)
}));

vi.mock('../errors/rewards_errors_reducer', () => ({
    default: vi.fn((state = []) => state)
}));

vi.mock('../errors/session_errors_reducer', () => ({
    default: vi.fn((state = []) => state)
}));

describe('errorsReducer', () => {
    const initialState = {
        backings: [],
        projects: [],
        rewards: [],
        session: []
    };

    beforeEach(() => {
        // Reset all mocks before each test
        backingsErrorsReducer.mockClear();
        projectsErrorsReducer.mockClear();
        rewardsErrorsReducer.mockClear();
        sessionErrorsReducer.mockClear();
        
        // Set default return values
        backingsErrorsReducer.mockImplementation((state = []) => state);
        projectsErrorsReducer.mockImplementation((state = []) => state);
        rewardsErrorsReducer.mockImplementation((state = []) => state);
        sessionErrorsReducer.mockImplementation((state = []) => state);
    });

    it('returns the initial state structure', () => {
        const result = errorsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        
        expect(result).toEqual(initialState);
        expect(Object.keys(result)).toEqual([
            'backings',
            'projects',
            'rewards',
            'session'
        ]);
    });

    it('calls each child reducer with their slice of state', () => {
        const currentState = {
            backings: ['backing error 1'],
            projects: ['project error 1'],
            rewards: ['reward error 1'],
            session: ['session error 1']
        };
        const action = { type: 'SOME_ACTION' };
        
        const result = errorsReducer(currentState, action);
        
        expect(backingsErrorsReducer).toHaveBeenCalledWith(currentState.backings, action);
        expect(projectsErrorsReducer).toHaveBeenCalledWith(currentState.projects, action);
        expect(rewardsErrorsReducer).toHaveBeenCalledWith(currentState.rewards, action);
        expect(sessionErrorsReducer).toHaveBeenCalledWith(currentState.session, action);
    });

    it('passes undefined state to child reducers when their slice is undefined', () => {
        const action = { type: 'SOME_ACTION' };
        
        errorsReducer(undefined, action);
        
        expect(backingsErrorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(projectsErrorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(rewardsErrorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(sessionErrorsReducer).toHaveBeenCalledWith(undefined, action);
    });

    it('combines results from all child reducers', () => {
        const currentState = {
            backings: ['old backing error'],
            projects: ['old project error'],
            rewards: ['old reward error'],
            session: ['old session error']
        };
        
        // Mock each reducer to return specific values
        backingsErrorsReducer.mockReturnValue(['new backing error']);
        projectsErrorsReducer.mockReturnValue(['new project error']);
        rewardsErrorsReducer.mockReturnValue(['new reward error']);
        sessionErrorsReducer.mockReturnValue(['new session error']);
        
        const action = { type: 'UPDATE_ALL_ERRORS' };
        const result = errorsReducer(currentState, action);
        
        expect(result).toEqual({
            backings: ['new backing error'],
            projects: ['new project error'],
            rewards: ['new reward error'],
            session: ['new session error']
        });
    });

    it('handles actions that only affect some error reducers', () => {
        const currentState = {
            backings: ['backing error'],
            projects: ['project error'],
            rewards: ['reward error'],
            session: ['session error']
        };
        
        // Only session reducer returns new state
        backingsErrorsReducer.mockReturnValue(currentState.backings); // Same reference
        projectsErrorsReducer.mockReturnValue(currentState.projects); // Same reference
        rewardsErrorsReducer.mockReturnValue(currentState.rewards); // Same reference
        sessionErrorsReducer.mockReturnValue(['updated session error']);
        
        const action = { type: 'SESSION_ERROR_ACTION' };
        const result = errorsReducer(currentState, action);
        
        expect(result).toEqual({
            backings: ['backing error'],
            projects: ['project error'],
            rewards: ['reward error'],
            session: ['updated session error']
        });
        
        // Verify backings, projects, rewards returned same references
        expect(result.backings).toBe(currentState.backings);
        expect(result.projects).toBe(currentState.projects);
        expect(result.rewards).toBe(currentState.rewards);
        
        // Verify session returned new reference
        expect(result.session).not.toBe(currentState.session);
    });

    it('handles empty error arrays correctly', () => {
        const emptyState = {
            backings: [],
            projects: [],
            rewards: [],
            session: []
        };
        
        // All reducers return empty arrays
        backingsErrorsReducer.mockReturnValue([]);
        projectsErrorsReducer.mockReturnValue([]);
        rewardsErrorsReducer.mockReturnValue([]);
        sessionErrorsReducer.mockReturnValue([]);
        
        const action = { type: 'CLEAR_ALL_ERRORS' };
        const result = errorsReducer(emptyState, action);
        
        expect(result).toEqual(emptyState);
    });

    it('handles multiple errors in each reducer', () => {
        const multiErrorState = {
            backings: ['Invalid amount', 'Payment failed'],
            projects: ['Title required', 'Invalid goal'],
            rewards: ['Amount too low', 'Description required'],
            session: ['Invalid email', 'Password too short']
        };
        
        // Mock reducers to add more errors
        backingsErrorsReducer.mockReturnValue([...multiErrorState.backings, 'New backing error']);
        projectsErrorsReducer.mockReturnValue(multiErrorState.projects); // Unchanged
        rewardsErrorsReducer.mockReturnValue([...multiErrorState.rewards, 'New reward error']);
        sessionErrorsReducer.mockReturnValue(multiErrorState.session); // Unchanged
        
        const action = { type: 'ADD_ERRORS' };
        const result = errorsReducer(multiErrorState, action);
        
        expect(result).toEqual({
            backings: ['Invalid amount', 'Payment failed', 'New backing error'],
            projects: ['Title required', 'Invalid goal'],
            rewards: ['Amount too low', 'Description required', 'New reward error'],
            session: ['Invalid email', 'Password too short']
        });
    });

    it('does not generate an error when state is frozen', () => {
        const frozenState = Object.freeze({
            backings: [],
            projects: [],
            rewards: [],
            session: []
        });
        const action = { type: 'ANY_ACTION' };
        
        expect(() => {
            errorsReducer(frozenState, action);
        }).not.toThrow();
    });

    it('preserves error reducer independence', () => {
        const currentState = {
            backings: ['b1'],
            projects: ['p1'],
            rewards: ['r1'],
            session: ['s1']
        };
        
        // Each reducer returns completely different error arrays
        backingsErrorsReducer.mockReturnValue(['backing only']);
        projectsErrorsReducer.mockReturnValue(['project only']);
        rewardsErrorsReducer.mockReturnValue(['reward only']);
        sessionErrorsReducer.mockReturnValue(['session only']);
        
        const action = { type: 'INDEPENDENT_UPDATE' };
        const result = errorsReducer(currentState, action);
        
        expect(result).toEqual({
            backings: ['backing only'],
            projects: ['project only'],
            rewards: ['reward only'],
            session: ['session only']
        });
    });

    it('returns same reference when no child reducers change state', () => {
        const currentState = {
            backings: ['error1'],
            projects: ['error2'],
            rewards: ['error3'],
            session: ['error4']
        };
        
        // All reducers return the same state they received
        backingsErrorsReducer.mockImplementation((state) => state);
        projectsErrorsReducer.mockImplementation((state) => state);
        rewardsErrorsReducer.mockImplementation((state) => state);
        sessionErrorsReducer.mockImplementation((state) => state);
        
        const action = { type: 'NO_CHANGE_ACTION' };
        const result = errorsReducer(currentState, action);
        
        expect(result).toBe(currentState);
    });

    it('handles partial state updates correctly', () => {
        // Test when only part of the state is provided
        const partialState = {
            backings: ['backing error'],
            // Missing other slices
        };
        
        const action = { type: 'PARTIAL_ACTION' };
        
        // This should work because combineReducers handles missing slices
        expect(() => {
            errorsReducer(partialState, action);
        }).not.toThrow();
        
        // Each reducer should receive their slice or undefined
        expect(backingsErrorsReducer).toHaveBeenCalledWith(partialState.backings, action);
        expect(projectsErrorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(rewardsErrorsReducer).toHaveBeenCalledWith(undefined, action);
        expect(sessionErrorsReducer).toHaveBeenCalledWith(undefined, action);
    });

    it('simulates real-world error flow scenarios', () => {
        let state = initialState;
        
        // Simulate session login error
        sessionErrorsReducer.mockReturnValue(['Invalid credentials']);
        state = errorsReducer(state, { type: 'RECEIVE_SESSION_ERRORS' });
        expect(state).toEqual({
            backings: [],
            projects: [],
            rewards: [],
            session: ['Invalid credentials']
        });
        
        // Simulate project creation error
        projectsErrorsReducer.mockReturnValue(['Title required', 'Goal too low']);
        state = errorsReducer(state, { type: 'RECEIVE_PROJECT_ERRORS' });
        expect(state).toEqual({
            backings: [],
            projects: ['Title required', 'Goal too low'],
            rewards: [],
            session: ['Invalid credentials']
        });
        
        // Simulate backing error
        backingsErrorsReducer.mockReturnValue(['Payment failed']);
        state = errorsReducer(state, { type: 'RECEIVE_BACKING_ERRORS' });
        expect(state).toEqual({
            backings: ['Payment failed'],
            projects: ['Title required', 'Goal too low'],
            rewards: [],
            session: ['Invalid credentials']
        });
        
        // Simulate successful login clears session errors
        sessionErrorsReducer.mockReturnValue([]);
        state = errorsReducer(state, { type: 'RECEIVE_CURRENT_USER' });
        expect(state).toEqual({
            backings: ['Payment failed'],
            projects: ['Title required', 'Goal too low'],
            rewards: [],
            session: []
        });
        
        // Simulate reward error
        rewardsErrorsReducer.mockReturnValue(['Amount must be positive']);
        state = errorsReducer(state, { type: 'RECEIVE_REWARD_ERRORS' });
        expect(state).toEqual({
            backings: ['Payment failed'],
            projects: ['Title required', 'Goal too low'],
            rewards: ['Amount must be positive'],
            session: []
        });
    });

    it('handles error clearing scenarios', () => {
        const errorState = {
            backings: ['Payment failed'],
            projects: ['Title required'],
            rewards: ['Amount too low'],
            session: ['Login failed']
        };
        
        // Reset mocks
        backingsErrorsReducer.mockClear();
        projectsErrorsReducer.mockClear();
        rewardsErrorsReducer.mockClear();
        sessionErrorsReducer.mockClear();
        
        // Test clearing session errors only
        // Set up mocks to handle RECEIVE_CURRENT_USER
        sessionErrorsReducer.mockImplementation((state = [], action) => {
            if (action.type === 'RECEIVE_CURRENT_USER') {
                return [];
            }
            return state; // Default: return state unchanged
        });
        
        // Other reducers should return state unchanged for RECEIVE_CURRENT_USER
        backingsErrorsReducer.mockImplementation((state = []) => state);
        projectsErrorsReducer.mockImplementation((state = []) => state);
        rewardsErrorsReducer.mockImplementation((state = []) => state);
        
        const afterSessionClear = errorsReducer(errorState, { type: 'RECEIVE_CURRENT_USER' });
        expect(afterSessionClear.session).toEqual([]);
        expect(afterSessionClear.backings).toBe(errorState.backings);
        expect(afterSessionClear.projects).toBe(errorState.projects);
        expect(afterSessionClear.rewards).toBe(errorState.rewards);
        
        // Reset mocks for the second test
        backingsErrorsReducer.mockClear();
        projectsErrorsReducer.mockClear();
        rewardsErrorsReducer.mockClear();
        sessionErrorsReducer.mockClear();
        
        // Test clearing backing errors only
        // Set up mocks to handle RECEIVE_BACKING
        backingsErrorsReducer.mockImplementation((state = [], action) => {
            if (action.type === 'RECEIVE_BACKING') {
                return [];
            }
            return state; // Default: return state unchanged
        });
        
        // Other reducers should return state unchanged for RECEIVE_BACKING
        projectsErrorsReducer.mockImplementation((state = []) => state);
        rewardsErrorsReducer.mockImplementation((state = []) => state);
        sessionErrorsReducer.mockImplementation((state = []) => state);
        
        const afterBackingClear = errorsReducer(errorState, { type: 'RECEIVE_BACKING' });
        expect(afterBackingClear.backings).toEqual([]);
        expect(afterBackingClear.session).toBe(errorState.session); // Should still be ['Login failed']
        expect(afterSessionClear.projects).toBe(errorState.projects);
        expect(afterSessionClear.rewards).toBe(errorState.rewards);
    });

    it('maintains proper combineReducers behavior with error-specific actions', () => {
        // Test that actions are passed to all reducers even if only some handle them
        const action = { type: 'RECEIVE_SESSION_ERRORS', errors: ['test'] };
        
        errorsReducer(initialState, action);
        
        // All reducers should receive the action, even if they don't handle it
        expect(backingsErrorsReducer).toHaveBeenCalledWith([], action);
        expect(projectsErrorsReducer).toHaveBeenCalledWith([], action);
        expect(rewardsErrorsReducer).toHaveBeenCalledWith([], action);
        expect(sessionErrorsReducer).toHaveBeenCalledWith([], action);
    });

    it('handles concurrent error updates independently', () => {
        const state1 = {
            backings: ['error1'],
            projects: ['error2'],
            rewards: ['error3'],
            session: ['error4']
        };
        
        const state2 = {
            backings: ['different1'],
            projects: ['different2'],
            rewards: ['different3'],
            session: ['different4']
        };
        
        // Update state1 - only session errors change
        sessionErrorsReducer.mockReturnValue(['updated session error']);
        const updatedState1 = errorsReducer(state1, { type: 'UPDATE_SESSION' });
        expect(updatedState1.session).toEqual(['updated session error']);
        expect(updatedState1.backings).toBe(state1.backings);

        // Reset mocks
        backingsErrorsReducer.mockClear();
        projectsErrorsReducer.mockClear();
        rewardsErrorsReducer.mockClear();
        sessionErrorsReducer.mockClear();
        
        // Test clearing session errors only
        // Set up mocks to handle RECEIVE_CURRENT_USER
        sessionErrorsReducer.mockImplementation((state = [], action) => {
            if (action.type === 'RECEIVE_CURRENT_USER') {
                return [];
            }
            return state; // Default: return state unchanged
        });
        
        // Update state2 - only backings errors change
        backingsErrorsReducer.mockReturnValue(['updated backing error']);
        const updatedState2 = errorsReducer(state2, { type: 'UPDATE_BACKING' });
        expect(updatedState2.backings).toEqual(['updated backing error']);
        expect(updatedState2.session).toBe(state2.session);
        
        // Original states should be unchanged
        expect(state1.session).toEqual(['error4']);
        expect(state2.backings).toEqual(['different1']);
    });
});