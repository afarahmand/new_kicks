import { describe, it, expect } from 'vitest';
import backingsReducer, { receiveBacking, receiveBackings, createBacking } from '../backings_slice';

describe('backingsSlice', () => {
    it('returns the initial state by default', () => {
        const result = backingsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual({});
    });

    describe('receiveBacking reducer', () => {
        it('adds a new backing to the state', () => {
            const initialState = {};
            const backing = { id: 1, amount: 10, projectId: 100, userId: 1 };
            const action = receiveBacking(backing);
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toEqual({ [backing.id]: backing });
        });

        it('updates an existing backing in the state', () => {
            const existingBacking = { id: 1, amount: 10, projectId: 100, userId: 1 };
            const initialState = { [existingBacking.id]: existingBacking };
            const updatedBacking = { ...existingBacking, amount: 20 };
            const action = receiveBacking(updatedBacking);
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toEqual({ [updatedBacking.id]: updatedBacking });
        });

        it('does not mutate the original state', () => {
            const initialState = { 1: { id: 1, amount: 10 } };
            const backing = { id: 2, amount: 20 };
            const action = receiveBacking(backing);
            
            const result = backingsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual({ 1: { id: 1, amount: 10 } });
        });
    });

    describe('receiveBackings reducer', () => {
        it('adds multiple new backings to the state', () => {
            const initialState = {};
            const backings = {
                1: { id: 1, amount: 10, projectId: 100, userId: 1 },
                2: { id: 2, amount: 20, projectId: 100, userId: 1 }
            };
            const action = receiveBackings(backings);
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toEqual(backings);
        });

        it('merges new backings with existing state', () => {
            const existingBacking = { id: 1, amount: 10, projectId: 100, userId: 1 };
            const initialState = { [existingBacking.id]: existingBacking };
            const newBackings = {
                2: { id: 2, amount: 20, projectId: 100, userId: 1 },
                3: { id: 3, amount: 30, projectId: 101, userId: 2 }
            };
            const action = receiveBackings(newBackings);
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toEqual({ ...initialState, ...newBackings });
        });

        it('updates existing backings when merging', () => {
            const existingBacking = { id: 1, amount: 10, projectId: 100, userId: 1 };
            const initialState = { [existingBacking.id]: existingBacking };
            const updatedBacking = { id: 1, amount: 15, projectId: 100, userId: 1 };
            const newBackings = { [updatedBacking.id]: updatedBacking };
            const action = receiveBackings(newBackings);
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toEqual({ [updatedBacking.id]: updatedBacking });
        });

        it('does not mutate the original state', () => {
            const initialState = { 1: { id: 1, amount: 10 } };
            const newBackings = { 2: { id: 2, amount: 20 } };
            const action = receiveBackings(newBackings);
            
            const result = backingsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual({ 1: { id: 1, amount: 10 } });
        });
    });

    describe('createBacking.fulfilled extra reducer', () => {
        it('adds the new backing to the state on fulfillment', () => {
            const initialState = {};
            const backing = { id: 1, amount: 10, projectId: 100, userId: 1 };
            const action = createBacking.fulfilled(backing, '', {});
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toEqual({ [backing.id]: backing });
        });

        it('updates an existing backing on fulfillment', () => {
            const existingBacking = { id: 1, amount: 10, projectId: 100, userId: 1 };
            const initialState = { [existingBacking.id]: existingBacking };
            const updatedBacking = { ...existingBacking, amount: 20 };
            const action = createBacking.fulfilled(updatedBacking, '', {});
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toEqual({ [updatedBacking.id]: updatedBacking });
        });

        it('does not mutate the original state on fulfillment', () => {
            const initialState = { 1: { id: 1, amount: 10 } };
            const backing = { id: 2, amount: 20 };
            const action = createBacking.fulfilled(backing, '', {});
            
            const result = backingsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual({ 1: { id: 1, amount: 10 } });
        });
    });

    describe('createBacking.rejected extra reducer', () => {
        it('returns the state unchanged on rejection', () => {
            const initialState = { 1: { id: 1, amount: 10 } };
            const errors = ['Invalid amount'];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(result).toEqual(initialState);
        });

        it('does not mutate the original state on rejection', () => {
            const initialState = { 1: { id: 1, amount: 10 } };
            const errors = ['Invalid amount'];
            const action = {
                type: createBacking.rejected.type,
                payload: errors,
                error: { message: 'Rejected' },
                meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
            };
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(initialState).toEqual({ 1: { id: 1, amount: 10 } });
        });
    });

    describe('unknown actions', () => {
        it('returns the state unchanged for unknown actions', () => {
            const initialState = { 1: { id: 1, amount: 10 } };
            const action = { type: 'UNKNOWN_ACTION' };
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(result).toEqual(initialState);
        });

        it('returns empty object for unknown actions when state is empty', () => {
            const initialState = {};
            const action = { type: 'RANDOM_ACTION' };
            
            const result = backingsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(result).toEqual({});
        });
    });

    it('maintains correct behavior across action sequence', () => {
        let state = {};
        
        // Add a backing
        const backing1 = { id: 1, amount: 10, projectId: 100, userId: 1 };
        state = backingsReducer(state, receiveBacking(backing1));
        expect(state).toEqual({ 1: backing1 });
        
        // Add multiple backings
        const backings2 = {
            2: { id: 2, amount: 20, projectId: 100, userId: 1 },
            3: { id: 3, amount: 30, projectId: 101, userId: 2 }
        };
        state = backingsReducer(state, receiveBackings(backings2));
        expect(state).toEqual({ 1: backing1, ...backings2 });
        
        // Update an existing backing via fulfilled action
        const updatedBacking1 = { ...backing1, amount: 15 };
        state = backingsReducer(state, createBacking.fulfilled(updatedBacking1, '', {}));
        expect(state).toEqual({ 1: updatedBacking1, ...backings2 });
        
        // Attempt to create a backing that is rejected (state should not change)
        const rejectedAction = {
            type: createBacking.rejected.type,
            payload: ['Error'],
            error: { message: 'Rejected' },
            meta: { arg: {}, requestId: '', rejectedWithValue: true, requestStatus: 'rejected', aborted: false, condition: false }
        };
        const stateBeforeRejection = { ...state };
        state = backingsReducer(state, rejectedAction);
        expect(state).toEqual(stateBeforeRejection);
        
        // Unknown action (state should not change)
        state = backingsReducer(state, { type: 'SOME_UNRELATED_ACTION' });
        expect(state).toEqual(stateBeforeRejection);
    });
});