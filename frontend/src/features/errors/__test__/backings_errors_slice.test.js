import { describe, it, expect } from 'vitest';
import backingsErrorsReducer, { clearBackingErrors } from '../backings_errors_slice';
import { createBacking } from '../../entities/backings/backings_slice';

describe('backingsErrorsSlice', () => {
    it('returns the initial state by default', () => {
        const result = backingsErrorsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual([]);
    });

    describe('clearBackingErrors', () => {
        it('returns empty array when clearing backing errors', () => {
            const initialState = ['Invalid amount', 'Reward unavailable'];
            const action = clearBackingErrors();
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('clears errors from previous state', () => {
            const initialState = [
                'Payment failed',
                'Insufficient funds',
                'Invalid reward selection'
            ];
            const action = clearBackingErrors();
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('returns empty array even when no errors existed', () => {
            const initialState = [];
            const action = clearBackingErrors();
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Error 1', 'Error 2'];
            const action = clearBackingErrors();
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('createBacking.fulfilled', () => {
        it('returns empty array on successful backing creation', () => {
            const initialState = ['Invalid amount', 'Reward unavailable'];
            const action = createBacking.fulfilled({}, '', {});
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('clears errors from previous state on successful backing creation', () => {
            const initialState = [
                'Payment failed',
                'Insufficient funds',
                'Invalid reward selection'
            ];
            const action = createBacking.fulfilled({}, '', {});
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('returns empty array even when no errors existed on successful backing creation', () => {
            const initialState = [];
            const action = createBacking.fulfilled({}, '', {});
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('does not mutate the original state on successful backing creation', () => {
            const initialState = ['Error 1', 'Error 2'];
            const action = createBacking.fulfilled({}, '', {});
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('createBacking.rejected', () => {
        it('replaces state with new errors array on rejected backing creation', () => {
            const initialState = ['Old error'];
            const errors = ['Invalid amount', 'Reward unavailable'];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).not.toEqual(initialState);
        });

        it('handles single error in array on rejected backing creation', () => {
            const initialState = [];
            const errors = ['Payment failed'];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual(['Payment failed']);
            expect(result).toHaveLength(1);
        });

        it('handles multiple errors in array on rejected backing creation', () => {
            const initialState = ['Previous error'];
            const errors = [
                'Amount must be positive',
                'Reward is sold out',
                'Invalid payment method'
            ];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).toHaveLength(3);
        });

        it('handles empty errors array on rejected backing creation', () => {
            const initialState = ['Some error'];
            const errors = [];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('does not mutate the original state on rejected backing creation', () => {
            const initialState = ['Old error'];
            const errors = ['New error'];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Old error']);
        });

        it('returns exact error array from action on rejected backing creation', () => {
            const initialState = [];
            const errors = ['Backing creation failed'];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsErrorsReducer(initialState, action);
            
            expect(result).toBe(errors); // Should return same reference
            expect(result).toEqual(['Backing creation failed']);
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
            type: createBacking.rejected.type,
            payload: ['Invalid amount', 'Reward unavailable'],
            error: { message: 'Rejected' },
            meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
        });
        expect(state).toEqual(['Invalid amount', 'Reward unavailable']);
        
        // Clear errors by receiving backing
        state = backingsErrorsReducer(state, clearBackingErrors());
        expect(state).toEqual([]);
        
        // Receive new backing errors
        state = backingsErrorsReducer(state, {
            type: createBacking.rejected.type,
            payload: ['Payment failed'],
            error: { message: 'Rejected' },
            meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
        });
        expect(state).toEqual(['Payment failed']);
        
        // Clear errors again
        state = backingsErrorsReducer(state, clearBackingErrors());
        expect(state).toEqual([]);
        
        // Unknown action returns empty array
        state = backingsErrorsReducer(state, { type: 'SOME_UNRELATED_ACTION' });
        expect(state).toEqual([]);
        
        // Can receive empty errors array
        state = backingsErrorsReducer(state, {
            type: createBacking.rejected.type,
            payload: [],
            error: { message: 'Rejected' },
            meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
        });
        expect(state).toEqual([]);
    });

    it('handles error lifecycle correctly', () => {
        const initialState = [];
        
        // First backing error
        const action1 = {
            type: createBacking.rejected.type,
            payload: ['Backing creation failed'],
            error: { message: 'Rejected' },
            meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
        };
        const state1 = backingsErrorsReducer(initialState, action1);
        expect(state1).toEqual(['Backing creation failed']);
        
        // Clear on successful backing
        const action2 = clearBackingErrors();
        const state2 = backingsErrorsReducer(state1, action2);
        expect(state2).toEqual([]);
        
        // Unknown action returns empty array
        const action3 = { type: 'UNRELATED_ACTION' };
        const state3 = backingsErrorsReducer(state2, action3);
        expect(state3).toEqual([]);
        
        // New error after cleared
        const action4 = {
            type: createBacking.rejected.type,
            payload: ['Reward limit exceeded'],
            error: { message: 'Rejected' },
            meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
        };
        const state4 = backingsErrorsReducer(state3, action4);
        expect(state4).toEqual(['Reward limit exceeded']);
        
        // Clear again
        const action5 = clearBackingErrors();
        const state5 = backingsErrorsReducer(state4, action5);
        expect(state5).toEqual([]);
    });
});