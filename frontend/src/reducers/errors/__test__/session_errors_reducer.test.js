import { describe, it, expect } from 'vitest';
import sessionErrorsReducer from '../session_errors_reducer';
import {
    RECEIVE_CURRENT_USER,
    RECEIVE_SESSION_ERRORS
} from '../../../actions/session_actions';

describe('sessionErrorsReducer', () => {
    it('returns the initial state by default', () => {
        const result = sessionErrorsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual([]);
    });

    describe('RECEIVE_CURRENT_USER', () => {
        it('returns empty array when receiving current user', () => {
            const initialState = ['Invalid credentials', 'Network error'];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('clears errors from previous state', () => {
            const initialState = [
                'Email already exists',
                'Password too short',
                'Invalid email format'
            ];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('returns empty array even when no errors existed', () => {
            const initialState = [];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Error 1', 'Error 2'];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('RECEIVE_SESSION_ERRORS', () => {
        it('replaces state with new errors array', () => {
            const initialState = ['Old error'];
            const errors = ['Invalid email', 'Password too short'];
            const action = { type: RECEIVE_SESSION_ERRORS, errors };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).not.toEqual(initialState);
        });

        it('handles single error in array', () => {
            const initialState = [];
            const errors = ['Invalid credentials'];
            const action = { type: RECEIVE_SESSION_ERRORS, errors };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toEqual(['Invalid credentials']);
            expect(result).toHaveLength(1);
        });

        it('handles multiple errors in array', () => {
            const initialState = ['Previous error'];
            const errors = [
                'Email is required',
                'Password must be at least 6 characters',
                'Email already exists'
            ];
            const action = { type: RECEIVE_SESSION_ERRORS, errors };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).toHaveLength(3);
        });

        it('handles empty errors array', () => {
            const initialState = ['Some error'];
            const errors = [];
            const action = { type: RECEIVE_SESSION_ERRORS, errors };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Old error'];
            const errors = ['New error'];
            const action = { type: RECEIVE_SESSION_ERRORS, errors };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Old error']);
        });

        it('returns exact error array from action', () => {
            const initialState = [];
            const errors = ['Custom error message'];
            const action = { type: RECEIVE_SESSION_ERRORS, errors };
            
            const result = sessionErrorsReducer(initialState, action);
            
            expect(result).toBe(errors); // Should return same reference
            expect(result).toEqual(['Custom error message']);
        });
    });

    it('maintains correct behavior across action sequence', () => {
        let state = [];
        
        // Start with no errors
        expect(state).toEqual([]);
        
        // Receive session errors
        state = sessionErrorsReducer(state, { 
            type: RECEIVE_SESSION_ERRORS, 
            errors: ['Invalid email', 'Password required'] 
        });
        expect(state).toEqual(['Invalid email', 'Password required']);
        
        // Clear errors by receiving current user
        state = sessionErrorsReducer(state, { type: RECEIVE_CURRENT_USER });
        expect(state).toEqual([]);
        
        // Receive new session errors
        state = sessionErrorsReducer(state, { 
            type: RECEIVE_SESSION_ERRORS, 
            errors: ['Email already exists'] 
        });
        expect(state).toEqual(['Email already exists']);
        
        // Clear errors again
        state = sessionErrorsReducer(state, { type: RECEIVE_CURRENT_USER });
        expect(state).toEqual([]);
        
        // Receive empty errors array
        state = sessionErrorsReducer(state, { 
            type: RECEIVE_SESSION_ERRORS, 
            errors: [] 
        });
        expect(state).toEqual([]);
    });

    it('handles error lifecycle correctly', () => {
        const initialState = [];
        
        // First error
        const action1 = { 
            type: RECEIVE_SESSION_ERRORS, 
            errors: ['Login failed'] 
        };
        const state1 = sessionErrorsReducer(initialState, action1);
        expect(state1).toEqual(['Login failed']);
        
        // Clear on successful login
        const action2 = { type: RECEIVE_CURRENT_USER };
        const state2 = sessionErrorsReducer(state1, action2);
        expect(state2).toEqual([]);
        
        // New error after cleared
        const action3 = { 
            type: RECEIVE_SESSION_ERRORS, 
            errors: ['Session expired'] 
        };
        const state3 = sessionErrorsReducer(state2, action3);
        expect(state3).toEqual(['Session expired']);
        
        // Clear again
        const action4 = { type: RECEIVE_CURRENT_USER };
        const state4 = sessionErrorsReducer(state3, action4);
        expect(state4).toEqual([]);
    });
});