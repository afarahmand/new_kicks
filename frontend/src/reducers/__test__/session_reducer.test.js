import { describe, it, expect } from 'vitest';
import sessionReducer from '../session_reducer';
import {
    LOADING,
    RECEIVE_CURRENT_USER,
    RECEIVE_SESSION_ERRORS
} from '../../actions/session_actions';

describe('sessionReducer', () => {
    const initialState = {
        currentUser: null,
        loading: false
    };

    it('returns the initial state by default', () => {
        const result = sessionReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual(initialState);
    });

    describe('LOADING', () => {
        it('sets loading to true while preserving other state', () => {
            const stateWithUser = {
                currentUser: { id: 1, username: 'testuser' },
                loading: false
            };
            const action = { type: LOADING };
            
            const result = sessionReducer(stateWithUser, action);
            
            expect(result).toEqual({
                currentUser: { id: 1, username: 'testuser' },
                loading: true
            });
        });

        it('sets loading to true from initial state', () => {
            const action = { type: LOADING };
            
            const result = sessionReducer(initialState, action);
            
            expect(result).toEqual({
                currentUser: null,
                loading: true
            });
        });

        it('sets loading to true when already loading', () => {
            const loadingState = {
                currentUser: null,
                loading: true
            };
            const action = { type: LOADING };
            
            const result = sessionReducer(loadingState, action);
            
            expect(result).toEqual({
                currentUser: null,
                loading: true
            });
        });

        it('does not mutate the original state', () => {
            const originalState = {
                currentUser: { id: 1, username: 'user' },
                errors: ['some error'],
                loading: false
            };
            const action = { type: LOADING };
            
            const result = sessionReducer(originalState, action);
            
            expect(result).not.toBe(originalState);
            expect(originalState).toEqual({
                currentUser: { id: 1, username: 'user' },
                errors: ['some error'],
                loading: false
            });
        });

        it('preserves errors array reference if unchanged', () => {
            const stateWithErrors = {
                currentUser: null,
                errors: ['error1', 'error2'],
                loading: false
            };
            const action = { type: LOADING };
            
            const result = sessionReducer(stateWithErrors, action);
            
            expect(result.errors).toBe(stateWithErrors.errors);
            expect(result.errors).toEqual(['error1', 'error2']);
        });
    });

    describe('RECEIVE_CURRENT_USER', () => {
        it('sets currentUser and sets loading to false', () => {
            const loadingState = {
                currentUser: null,
                loading: true
            };
            const user = { id: 1, username: 'testuser', email: 'test@example.com' };
            const action = { type: RECEIVE_CURRENT_USER, user };
            
            const result = sessionReducer(loadingState, action);
            
            expect(result).toEqual({
                currentUser: user,
                loading: false
            });
        });

        it('replaces existing currentUser with new user', () => {
            const existingState = {
                currentUser: { id: 1, username: 'olduser' },
                loading: false
            };
            const newUser = { id: 2, username: 'newuser', email: 'new@example.com' };
            const action = { type: RECEIVE_CURRENT_USER, user: newUser };
            
            const result = sessionReducer(existingState, action);
            
            expect(result).toEqual({
                currentUser: newUser,
                loading: false
            });
        });

        it('sets loading to false even when not loading', () => {
            const notLoadingState = {
                currentUser: null,
                loading: false
            };
            const user = { id: 1, username: 'testuser' };
            const action = { type: RECEIVE_CURRENT_USER, user };
            
            const result = sessionReducer(notLoadingState, action);
            
            expect(result.loading).toBe(false);
        });

        it('preserves errors array when receiving user', () => {
            const stateWithErrors = {
                currentUser: null,
                errors: ['previous error'],
                loading: true
            };
            const user = { id: 1, username: 'testuser' };
            const action = { type: RECEIVE_CURRENT_USER, user };
            
            const result = sessionReducer(stateWithErrors, action);
            
            expect(result).toEqual({
                currentUser: user,
                errors: ['previous error'],
                loading: false
            });
            expect(result.errors).toBe(stateWithErrors.errors);
        });

        it('handles null user (logout scenario)', () => {
            const loggedInState = {
                currentUser: { id: 1, username: 'testuser' },
                loading: false
            };
            const action = { type: RECEIVE_CURRENT_USER, user: null };
            
            const result = sessionReducer(loggedInState, action);
            
            expect(result).toEqual({
                currentUser: null,
                loading: false
            });
        });

        it('does not mutate the original state', () => {
            const originalState = {
                currentUser: { id: 1, username: 'olduser' },
                errors: ['some error'],
                loading: true
            };
            const user = { id: 2, username: 'newuser' };
            const action = { type: RECEIVE_CURRENT_USER, user };
            
            const result = sessionReducer(originalState, action);
            
            expect(result).not.toBe(originalState);
            expect(originalState).toEqual({
                currentUser: { id: 1, username: 'olduser' },
                errors: ['some error'],
                loading: true
            });
        });
    });

    describe('RECEIVE_SESSION_ERRORS', () => {
        it('sets loading to false while preserving other state', () => {
            const loadingState = {
                currentUser: null,
                loading: true
            };
            const action = { type: RECEIVE_SESSION_ERRORS, errors: ['some error'] };
            
            const result = sessionReducer(loadingState, action);
            
            expect(result).toEqual({
                currentUser: null,
                loading: false
            });
        });

        it('sets loading to false even when not loading', () => {
            const notLoadingState = {
                currentUser: { id: 1, username: 'testuser' },
                loading: false
            };
            const action = { type: RECEIVE_SESSION_ERRORS, errors: ['new error'] };
            
            const result = sessionReducer(notLoadingState, action);
            
            expect(result.loading).toBe(false);
        });

        it('does not update errors array (handled by separate reducer)', () => {
            const stateWithErrors = {
                currentUser: null,
                errors: ['old error'],
                loading: true
            };
            const action = { type: RECEIVE_SESSION_ERRORS, errors: ['new error'] };
            
            const result = sessionReducer(stateWithErrors, action);
            
            expect(result.errors).toEqual(['old error']);
            expect(result.errors).toBe(stateWithErrors.errors);
        });

        it('preserves currentUser when receiving errors', () => {
            const loggedInState = {
                currentUser: { id: 1, username: 'testuser' },
                loading: false
            };
            const action = { type: RECEIVE_SESSION_ERRORS, errors: ['login failed'] };
            
            const result = sessionReducer(loggedInState, action);
            
            expect(result.currentUser).toEqual({ id: 1, username: 'testuser' });
            expect(result.currentUser).toBe(loggedInState.currentUser);
        });

        it('does not mutate the original state', () => {
            const originalState = {
                currentUser: { id: 1, username: 'user' },
                errors: ['old error'],
                loading: true
            };
            const action = { type: RECEIVE_SESSION_ERRORS, errors: ['new error'] };
            
            const result = sessionReducer(originalState, action);
            
            expect(result).not.toBe(originalState);
            expect(originalState).toEqual({
                currentUser: { id: 1, username: 'user' },
                errors: ['old error'],
                loading: true
            });
        });
    });

    describe('default case', () => {
        it('returns the state unchanged for unknown actions', () => {
            const customState = {
                currentUser: { id: 1, username: 'testuser' },
                errors: ['some error'],
                loading: true
            };
            
            const actions = [
                { type: 'UNKNOWN_ACTION' },
                { type: 'SOME_OTHER_ACTION', payload: {} },
                { type: 'RECEIVE_PROJECT' },
                { type: 'RECEIVE_USER' },
                { type: 'ANOTHER_UNKNOWN' }
            ];
            
            actions.forEach(action => {
                const result = sessionReducer(customState, action);
                expect(result).toBe(customState);
                expect(result).toEqual(customState);
            });
        });

        it('returns initial state for unknown actions when undefined', () => {
            const result = sessionReducer(undefined, { type: 'RANDOM_ACTION' });
            
            expect(result).toEqual(initialState);
        });
    });

    it('does not generate an error when state is frozen', () => {
        const frozenState = Object.freeze({
            currentUser: { id: 1, username: 'testuser' },
            loading: false
        });
        
        const actions = [
            { type: LOADING },
            { type: RECEIVE_CURRENT_USER, user: { id: 2, username: 'newuser' } },
            { type: RECEIVE_SESSION_ERRORS, errors: ['error'] }
        ];
        
        actions.forEach(action => {
            expect(() => {
                sessionReducer(frozenState, action);
            }).not.toThrow();
        });
    });

    it('maintains correct behavior across login flow sequence', () => {
        let state = initialState;
        
        // Start loading login
        state = sessionReducer(state, { type: LOADING });
        expect(state).toEqual({
            currentUser: null,
            loading: true
        });
        
        // Login successful
        const user = { id: 1, username: 'testuser', email: 'test@example.com' };
        state = sessionReducer(state, { type: RECEIVE_CURRENT_USER, user });
        expect(state).toEqual({
            currentUser: user,
            loading: false
        });
        
        // Start loading logout
        state = sessionReducer(state, { type: LOADING });
        expect(state).toEqual({
            currentUser: user,
            loading: true
        });
        
        // Logout successful (null user)
        state = sessionReducer(state, { type: RECEIVE_CURRENT_USER, user: null });
        expect(state).toEqual({
            currentUser: null,
            loading: false
        });
    });

    it('handles login error flow correctly', () => {
        let state = initialState;
        
        // Start loading login
        state = sessionReducer(state, { type: LOADING });
        expect(state.loading).toBe(true);
        
        // Login fails (note: errors are handled by separate reducer)
        state = sessionReducer(state, { 
            type: RECEIVE_SESSION_ERRORS, 
            errors: ['Invalid credentials'] 
        });
        expect(state).toEqual({
            currentUser: null,
            loading: false
        });
        
        // Try again - start loading
        state = sessionReducer(state, { type: LOADING });
        expect(state.loading).toBe(true);
        
        // Login successful
        const user = { id: 1, username: 'testuser' };
        state = sessionReducer(state, { type: RECEIVE_CURRENT_USER, user });
        expect(state).toEqual({
            currentUser: user,
            loading: false
        });
    });

    it('preserves object references when fields unchanged', () => {
        const originalState = {
            currentUser: { id: 1, username: 'user' },
            errors: ['error1', 'error2'],
            loading: false
        };
        
        // LOADING preserves currentUser and errors references
        const afterLoading = sessionReducer(originalState, { type: LOADING });
        expect(afterLoading.currentUser).toBe(originalState.currentUser);
        expect(afterLoading.errors).toBe(originalState.errors);
        
        // RECEIVE_SESSION_ERRORS preserves currentUser and errors references
        const afterErrors = sessionReducer(originalState, { 
            type: RECEIVE_SESSION_ERRORS, 
            errors: ['new error'] 
        });
        expect(afterErrors.currentUser).toBe(originalState.currentUser);
        expect(afterErrors.errors).toBe(originalState.errors);
        
        // RECEIVE_CURRENT_USER with same user preserves errors reference
        const afterSameUser = sessionReducer(originalState, { 
            type: RECEIVE_CURRENT_USER, 
            user: { id: 1, username: 'user' } 
        });
        expect(afterSameUser.errors).toBe(originalState.errors);
        
        // Default action preserves all references
        const afterDefault = sessionReducer(originalState, { type: 'UNKNOWN' });
        expect(afterDefault).toBe(originalState);
        expect(afterDefault.currentUser).toBe(originalState.currentUser);
        expect(afterDefault.errors).toBe(originalState.errors);
    });

    it('handles concurrent state updates correctly', () => {
        const state1 = {
            currentUser: { id: 1, username: 'user1' },
            errors: ['error1'],
            loading: false
        };
        
        const state2 = {
            currentUser: { id: 2, username: 'user2' },
            errors: ['error2'],
            loading: true
        };
        
        // Update state1
        const updatedState1 = sessionReducer(state1, { type: LOADING });
        expect(updatedState1.loading).toBe(true);
        expect(updatedState1.currentUser).toBe(state1.currentUser);
        expect(state1.loading).toBe(false); // Original unchanged
        
        // Update state2
        const updatedState2 = sessionReducer(state2, { type: RECEIVE_CURRENT_USER, user: null });
        expect(updatedState2.currentUser).toBe(null);
        expect(updatedState2.loading).toBe(false);
        expect(state2.currentUser).toEqual({ id: 2, username: 'user2' }); // Original unchanged
    });
});