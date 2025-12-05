import { describe, it, expect } from 'vitest';
import rewardsErrorsReducer from '../rewards_errors_reducer';
import {
    RECEIVE_REWARD,
    RECEIVE_REWARD_ERRORS
} from '../../../actions/reward_actions';

describe('rewardsErrorsReducer', () => {
    it('returns the initial state by default', () => {
        const result = rewardsErrorsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual([]);
    });

    describe('RECEIVE_REWARD', () => {
        it('returns empty array when receiving reward', () => {
            const initialState = ['Invalid amount', 'Title required'];
            const action = { type: RECEIVE_REWARD };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('clears errors from previous state', () => {
            const initialState = [
                'Amount must be positive',
                'Description too short',
                'Invalid delivery date'
            ];
            const action = { type: RECEIVE_REWARD };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('returns empty array even when no errors existed', () => {
            const initialState = [];
            const action = { type: RECEIVE_REWARD };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Error 1', 'Error 2'];
            const action = { type: RECEIVE_REWARD };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('RECEIVE_REWARD_ERRORS', () => {
        it('replaces state with new errors array', () => {
            const initialState = ['Old error'];
            const errors = ['Invalid amount', 'Title required'];
            const action = { type: RECEIVE_REWARD_ERRORS, errors };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).not.toEqual(initialState);
        });

        it('handles single error in array', () => {
            const initialState = [];
            const errors = ['Amount too low'];
            const action = { type: RECEIVE_REWARD_ERRORS, errors };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toEqual(['Amount too low']);
            expect(result).toHaveLength(1);
        });

        it('handles multiple errors in array', () => {
            const initialState = ['Previous error'];
            const errors = [
                'Title is required',
                'Amount must be positive',
                'Delivery date invalid',
                'Limited quantity required'
            ];
            const action = { type: RECEIVE_REWARD_ERRORS, errors };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).toHaveLength(4);
        });

        it('handles empty errors array', () => {
            const initialState = ['Some error'];
            const errors = [];
            const action = { type: RECEIVE_REWARD_ERRORS, errors };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Old error'];
            const errors = ['New error'];
            const action = { type: RECEIVE_REWARD_ERRORS, errors };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Old error']);
        });

        it('returns exact error array from action', () => {
            const initialState = [];
            const errors = ['Reward validation failed'];
            const action = { type: RECEIVE_REWARD_ERRORS, errors };
            
            const result = rewardsErrorsReducer(initialState, action);
            
            expect(result).toBe(errors); // Should return same reference
            expect(result).toEqual(['Reward validation failed']);
        });
    });

    describe('default case', () => {
        it('returns the state unchanged for unknown actions', () => {
            const initialState = ['Existing reward error'];
            
            const actions = [
                { type: 'UNKNOWN_ACTION' },
                { type: 'SOME_OTHER_ACTION', payload: {} },
                { type: 'RECEIVE_PROJECT' },
                { type: 'RECEIVE_USER' },
                { type: 'ANOTHER_UNKNOWN' }
            ];
            
            actions.forEach(action => {
                const result = rewardsErrorsReducer(initialState, action);
                expect(result).toBe(initialState);
                expect(result).toEqual(['Existing reward error']);
            });
        });

        it('returns empty array for unknown actions when state is empty', () => {
            const initialState = [];
            
            const result = rewardsErrorsReducer(initialState, { type: 'RANDOM_ACTION' });
            
            expect(result).toBe(initialState);
            expect(result).toEqual([]);
        });

        it('preserves different error states for unknown actions', () => {
            const testCases = [
                { initialState: [], expected: [] },
                { initialState: ['Single error'], expected: ['Single error'] },
                { initialState: ['Error 1', 'Error 2'], expected: ['Error 1', 'Error 2'] },
                { initialState: ['Complex error with details'], expected: ['Complex error with details'] }
            ];
            
            testCases.forEach(({ initialState, expected }) => {
                const result = rewardsErrorsReducer(initialState, { type: 'ANY_UNKNOWN_ACTION' });
                expect(result).toBe(initialState);
                expect(result).toEqual(expected);
            });
        });
    });

    it('maintains correct behavior across action sequence', () => {
        let state = [];
        
        // Start with no errors
        expect(state).toEqual([]);
        
        // Receive reward errors
        state = rewardsErrorsReducer(state, { 
            type: RECEIVE_REWARD_ERRORS, 
            errors: ['Amount too low', 'Title required'] 
        });
        expect(state).toEqual(['Amount too low', 'Title required']);
        
        // Clear errors by receiving reward
        state = rewardsErrorsReducer(state, { type: RECEIVE_REWARD });
        expect(state).toEqual([]);
        
        // Receive new reward errors
        state = rewardsErrorsReducer(state, { 
            type: RECEIVE_REWARD_ERRORS, 
            errors: ['Invalid delivery date'] 
        });
        expect(state).toEqual(['Invalid delivery date']);
        
        // Unknown action preserves errors
        state = rewardsErrorsReducer(state, { type: 'SOME_UNRELATED_ACTION' });
        expect(state).toEqual(['Invalid delivery date']);
        
        // Clear errors again
        state = rewardsErrorsReducer(state, { type: RECEIVE_REWARD });
        expect(state).toEqual([]);
        
        // Can receive empty errors array
        state = rewardsErrorsReducer(state, { 
            type: RECEIVE_REWARD_ERRORS, 
            errors: [] 
        });
        expect(state).toEqual([]);
        
        // Unknown action preserves empty state
        state = rewardsErrorsReducer(state, { type: 'ANOTHER_ACTION' });
        expect(state).toEqual([]);
    });

    it('handles error lifecycle correctly', () => {
        const initialState = [];
        
        // First reward error
        const action1 = { 
            type: RECEIVE_REWARD_ERRORS, 
            errors: ['Reward creation failed'] 
        };
        const state1 = rewardsErrorsReducer(initialState, action1);
        expect(state1).toEqual(['Reward creation failed']);
        
        // Clear on successful reward creation/update
        const action2 = { type: RECEIVE_REWARD };
        const state2 = rewardsErrorsReducer(state1, action2);
        expect(state2).toEqual([]);
        
        // Unrelated action doesn't affect empty state
        const action3 = { type: 'UNRELATED_ACTION' };
        const state3 = rewardsErrorsReducer(state2, action3);
        expect(state3).toEqual([]);
        
        // New error after cleared
        const action4 = { 
            type: RECEIVE_REWARD_ERRORS, 
            errors: ['Reward limit exceeded'] 
        };
        const state4 = rewardsErrorsReducer(state3, action4);
        expect(state4).toEqual(['Reward limit exceeded']);
        
        // Unrelated action preserves errors
        const action5 = { type: 'PROJECT_LOADED' };
        const state5 = rewardsErrorsReducer(state4, action5);
        expect(state5).toEqual(['Reward limit exceeded']);
        
        // Clear again
        const action6 = { type: RECEIVE_REWARD };
        const state6 = rewardsErrorsReducer(state5, action6);
        expect(state6).toEqual([]);
    });

    it('maintains immutability with mixed actions', () => {
        const originalState = ['Initial error'];
        
        // RECEIVE_REWARD should return new array
        const afterReceiveReward = rewardsErrorsReducer(originalState, { type: RECEIVE_REWARD });
        expect(afterReceiveReward).not.toBe(originalState);
        expect(originalState).toEqual(['Initial error']);
        
        // RECEIVE_REWARD_ERRORS should return new array
        const afterReceiveErrors = rewardsErrorsReducer(originalState, { 
            type: RECEIVE_REWARD_ERRORS, 
            errors: ['New error'] 
        });
        expect(afterReceiveErrors).not.toBe(originalState);
        expect(originalState).toEqual(['Initial error']);
        
        // Default case should return same reference
        const afterDefault = rewardsErrorsReducer(originalState, { type: 'UNKNOWN' });
        expect(afterDefault).toBe(originalState);
        expect(originalState).toEqual(['Initial error']);
    });

    it('handles concurrent error states correctly', () => {
        // Test that errors don't leak between different states
        const state1 = ['Error for project 1'];
        const state2 = ['Error for project 2'];
        
        // Clear errors for state1
        const clearedState1 = rewardsErrorsReducer(state1, { type: RECEIVE_REWARD });
        expect(clearedState1).toEqual([]);
        expect(state1).toEqual(['Error for project 1']); // Original unchanged
        
        // Update errors for state2
        const updatedState2 = rewardsErrorsReducer(state2, { 
            type: RECEIVE_REWARD_ERRORS, 
            errors: ['Updated error'] 
        });
        expect(updatedState2).toEqual(['Updated error']);
        expect(state2).toEqual(['Error for project 2']); // Original unchanged
        
        // Unknown action preserves state2's errors
        const preservedState2 = rewardsErrorsReducer(updatedState2, { type: 'UNRELATED' });
        expect(preservedState2).toBe(updatedState2);
        expect(preservedState2).toEqual(['Updated error']);
    });
});