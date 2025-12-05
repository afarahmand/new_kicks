import { describe, it, expect } from 'vitest';
import categoriesReducer from '../categories_reducer';

describe('categoriesReducer', () => {
    it('returns the initial state by default', () => {
        const result = categoriesReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual({});
    });

    it('always returns the same state unchanged', () => {
        const initialState = {
            1: { id: 1, name: 'Technology' },
            2: { id: 2, name: 'Design' }
        };
        
        const actions = [
            { type: 'SOME_ACTION' },
            { type: 'ANOTHER_ACTION', payload: { data: 'test' } },
            { type: 'RECEIVE_CATEGORIES' },
            { type: 'RECEIVE_PROJECT' },
            { type: 'RECEIVE_USER' }
        ];

        actions.forEach(action => {
            const result = categoriesReducer(initialState, action);
            expect(result).toBe(initialState);
            expect(result).toEqual(initialState);
        });
    });
});