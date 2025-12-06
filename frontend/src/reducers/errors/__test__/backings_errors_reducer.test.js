import { describe, it, expect } from 'vitest';
import backingsErrorsReducer from '../backings_errors_reducer';
import {
    RECEIVE_BACKING,
    RECEIVE_BACKING_ERRORS
} from '../../../actions/backing_actions';
import { RECEIVE_CURRENT_USER } from '../../../actions/session_actions';

describe('backingsErrorsReducer', () => {
    it('returns the initial state by default', () => {
        const result = backingsErrorsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual([]);
    });

    describe('RECEIVE_BACKING', () => {
        it('returns empty array when receiving backing', () => {
            const initialState = ['Invalid amount', 'Reward unavailable'];
            const action = { type: RECEIVE_BACKING };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('clears errors from previous state', () => {
            const initialState = [
                'Payment failed',
                'Insufficient funds',
                'Invalid reward selection'
            ];
            const action = { type: RECEIVE_BACKING };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('returns empty array even when no errors existed', () => {
            const initialState = [];
            const action = { type: RECEIVE_BACKING };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Error 1', 'Error 2'];
            const action = { type: RECEIVE_BACKING };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('RECEIVE_BACKING_ERRORS', () => {
        it('replaces state with new errors array', () => {
            const initialState = ['Old error'];
            const errors = ['Invalid amount', 'Reward unavailable'];
            const action = { type: RECEIVE_BACKING_ERRORS, errors };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).not.toEqual(initialState);
        });

        it('handles single error in array', () => {
            const initialState = [];
            const errors = ['Payment failed'];
            const action = { type: RECEIVE_BACKING_ERRORS, errors };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual(['Payment failed']);
            expect(result).toHaveLength(1);
        });

        it('handles multiple errors in array', () => {
            const initialState = ['Previous error'];
            const errors = [
                'Amount must be positive',
                'Reward is sold out',
                'Invalid payment method'
            ];
            const action = { type: RECEIVE_BACKING_ERRORS, errors };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).toHaveLength(3);
        });

        it('handles empty errors array', () => {
            const initialState = ['Some error'];
            const errors = [];
            const action = { type: RECEIVE_BACKING_ERRORS, errors };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Old error'];
            const errors = ['New error'];
            const action = { type: RECEIVE_BACKING_ERRORS, errors };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Old error']);
        });

        it('returns exact error array from action', () => {
            const initialState = [];
            const errors = ['Backing creation failed'];
            const action = { type: RECEIVE_BACKING_ERRORS, errors };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toBe(errors); // Should return same reference
            expect(result).toEqual(['Backing creation failed']);
        });
    });

    describe('RECEIVE_CURRENT_USER', () => {
        it('returns empty array when receiving backing', () => {
            const initialState = ['You must be signed in to back projects'];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('clears errors from previous state', () => {
            const initialState = [
                'Payment failed',
                'Insufficient funds',
                'Invalid reward selection'
            ];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('returns empty array even when no errors existed', () => {
            const initialState = [];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Error 1', 'Error 2'];
            const action = { type: RECEIVE_CURRENT_USER };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('default case', () => {
        it('returns the state unchanged for unknown actions', () => {
            const initialState = ['Existing error'];
            
            const actions = [
                { type: 'UNKNOWN_ACTION' },
                { type: 'SOME_OTHER_ACTION', payload: {} },
                { type: 'RECEIVE_PROJECT' },
                { type: 'RECEIVE_USER' },
                { type: 'ANOTHER_UNKNOWN' }
            ];
            
            actions.forEach(action => {
                const result = backingsErrorsReducer(initialState, action);
                expect(result).toBe(initialState);
                expect(result).toEqual(['Existing error']);
            });
        });

        it('returns empty array for unknown actions when state is empty', () => {
            const initialState = [];
            
            const result = backingsErrorsReducer(initialState, { type: 'RANDOM_ACTION' });
            
            expect(result).toBe(initialState);
            expect(result).toEqual([]);
        });
    });

    it('maintains correct behavior across action sequence', () => {
        let state = [];
        
        // Start with no errors (default)
        expect(state).toEqual([]);
        
        // Receive backing errors
        state = backingsErrorsReducer(state, { 
            type: RECEIVE_BACKING_ERRORS, 
            errors: ['Invalid amount', 'Reward unavailable'] 
        });
        expect(state).toEqual(['Invalid amount', 'Reward unavailable']);
        
        // Clear errors by receiving backing
        state = backingsErrorsReducer(state, { type: RECEIVE_BACKING });
        expect(state).toEqual([]);
        
        // Receive new backing errors
        state = backingsErrorsReducer(state, { 
            type: RECEIVE_BACKING_ERRORS, 
            errors: ['Payment failed'] 
        });
        expect(state).toEqual(['Payment failed']);
        
        // Clear errors again
        state = backingsErrorsReducer(state, { type: RECEIVE_BACKING });
        expect(state).toEqual([]);
        
        // Unknown action returns empty array
        state = backingsErrorsReducer(state, { type: 'SOME_UNRELATED_ACTION' });
        expect(state).toEqual([]);
        
        // Can receive empty errors array
        state = backingsErrorsReducer(state, { 
            type: RECEIVE_BACKING_ERRORS, 
            errors: [] 
        });
        expect(state).toEqual([]);
    });

    it('handles error lifecycle correctly', () => {
        const initialState = [];
        
        // First backing error
        const action1 = { 
            type: RECEIVE_BACKING_ERRORS, 
            errors: ['Backing creation failed'] 
        };
        const state1 = backingsErrorsReducer(initialState, action1);
        expect(state1).toEqual(['Backing creation failed']);
        
        // Clear on successful backing
        const action2 = { type: RECEIVE_BACKING };
        const state2 = backingsErrorsReducer(state1, action2);
        expect(state2).toEqual([]);
        
        // Unknown action returns empty array
        const action3 = { type: 'UNRELATED_ACTION' };
        const state3 = backingsErrorsReducer(state2, action3);
        expect(state3).toEqual([]);
        
        // New error after cleared
        const action4 = { 
            type: RECEIVE_BACKING_ERRORS, 
            errors: ['Reward limit exceeded'] 
        };
        const state4 = backingsErrorsReducer(state3, action4);
        expect(state4).toEqual(['Reward limit exceeded']);
        
        // Clear again
        const action5 = { type: RECEIVE_BACKING };
        const state5 = backingsErrorsReducer(state4, action5);
        expect(state5).toEqual([]);
    });
});