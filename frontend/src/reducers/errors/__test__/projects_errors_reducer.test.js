import { describe, it, expect } from 'vitest';
import projectsErrorsReducer from '../projects_errors_reducer';
import {
    RECEIVE_ALL_PROJECTS,
    RECEIVE_PROJECT,
    REMOVE_PROJECT,
    RECEIVE_PROJECT_ERRORS
} from '../../../actions/project_actions';

describe('projectsErrorsReducer', () => {
    it('returns the initial state by default', () => {
        const result = projectsErrorsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual([]);
    });

    describe('RECEIVE_ALL_PROJECTS', () => {
        it('returns the state unchanged', () => {
            const initialState = ['Load error', 'Network issue'];
            const action = { type: RECEIVE_ALL_PROJECTS };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(result).toEqual(['Load error', 'Network issue']);
        });

        it('handles empty error state', () => {
            const initialState = [];
            const action = { type: RECEIVE_ALL_PROJECTS };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(result).toEqual([]);
        });

        it('does not clear existing errors', () => {
            const initialState = ['Project load failed'];
            const action = { type: RECEIVE_ALL_PROJECTS };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual(['Project load failed']);
        });
    });

    describe('RECEIVE_PROJECT', () => {
        it('returns the state unchanged', () => {
            const initialState = ['Creation error', 'Invalid data'];
            const action = { type: RECEIVE_PROJECT };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(result).toEqual(['Creation error', 'Invalid data']);
        });

        it('handles empty error state', () => {
            const initialState = [];
            const action = { type: RECEIVE_PROJECT };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toBe(initialState);
            expect(result).toEqual([]);
        });

        it('does not clear existing errors on project creation/update', () => {
            const initialState = ['Title required', 'Invalid goal amount'];
            const action = { type: RECEIVE_PROJECT };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual(['Title required', 'Invalid goal amount']);
        });
    });

    describe('REMOVE_PROJECT', () => {
        it('returns empty array when removing project', () => {
            const initialState = ['Deletion failed', 'Permission denied'];
            const action = { type: REMOVE_PROJECT };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('clears errors from previous state', () => {
            const initialState = [
                'Cannot delete active project',
                'Project has backers',
                'Admin permission required'
            ];
            const action = { type: REMOVE_PROJECT };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('returns empty array even when no errors existed', () => {
            const initialState = [];
            const action = { type: REMOVE_PROJECT };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Error 1', 'Error 2'];
            const action = { type: REMOVE_PROJECT };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('RECEIVE_PROJECT_ERRORS', () => {
        it('replaces state with new errors array', () => {
            const initialState = ['Old error'];
            const errors = ['Invalid title', 'Goal too low'];
            const action = { type: RECEIVE_PROJECT_ERRORS, errors };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).not.toEqual(initialState);
        });

        it('handles single error in array', () => {
            const initialState = [];
            const errors = ['Description required'];
            const action = { type: RECEIVE_PROJECT_ERRORS, errors };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual(['Description required']);
            expect(result).toHaveLength(1);
        });

        it('handles multiple errors in array', () => {
            const initialState = ['Previous error'];
            const errors = [
                'Title is required',
                'Goal must be positive',
                'End date invalid',
                'Category required'
            ];
            const action = { type: RECEIVE_PROJECT_ERRORS, errors };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual(errors);
            expect(result).toHaveLength(4);
        });

        it('handles empty errors array', () => {
            const initialState = ['Some error'];
            const errors = [];
            const action = { type: RECEIVE_PROJECT_ERRORS, errors };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('does not mutate the original state', () => {
            const initialState = ['Old error'];
            const errors = ['New error'];
            const action = { type: RECEIVE_PROJECT_ERRORS, errors };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).not.toBe(initialState);
            expect(initialState).toEqual(['Old error']);
        });

        it('returns exact error array from action', () => {
            const initialState = [];
            const errors = ['Project validation failed'];
            const action = { type: RECEIVE_PROJECT_ERRORS, errors };
            
            const result = projectsErrorsReducer(initialState, action);
            
            expect(result).toBe(errors); // Should return same reference
            expect(result).toEqual(['Project validation failed']);
        });
    });

    describe('default case', () => {
        it('returns the state unchanged for unknown actions', () => {
            const initialState = ['Existing error'];
            
            const actions = [
                { type: 'UNKNOWN_ACTION' },
                { type: 'SOME_OTHER_ACTION', payload: {} },
                { type: 'RECEIVE_USER' },
                { type: 'RECEIVE_REWARD' },
                { type: 'ANOTHER_UNKNOWN' }
            ];
            
            actions.forEach(action => {
                const result = projectsErrorsReducer(initialState, action);
                expect(result).toBe(initialState);
                expect(result).toEqual(['Existing error']);
            });
        });

        it('returns empty array for unknown actions when state is empty', () => {
            const initialState = [];
            
            const result = projectsErrorsReducer(initialState, { type: 'RANDOM_ACTION' });
            
            expect(result).toBe(initialState);
            expect(result).toEqual([]);
        });
    });

    it('maintains correct behavior across action sequence', () => {
        let state = [];
        
        // Start with no errors
        expect(state).toEqual([]);
        
        // Receive project errors
        state = projectsErrorsReducer(state, { 
            type: RECEIVE_PROJECT_ERRORS, 
            errors: ['Invalid title', 'Goal too low'] 
        });
        expect(state).toEqual(['Invalid title', 'Goal too low']);
        
        // State unchanged when receiving all projects
        state = projectsErrorsReducer(state, { type: RECEIVE_ALL_PROJECTS });
        expect(state).toEqual(['Invalid title', 'Goal too low']);
        
        // State unchanged when receiving single project
        state = projectsErrorsReducer(state, { type: RECEIVE_PROJECT });
        expect(state).toEqual(['Invalid title', 'Goal too low']);
        
        // Clear errors by removing project
        state = projectsErrorsReducer(state, { type: REMOVE_PROJECT });
        expect(state).toEqual([]);
        
        // Receive new project errors
        state = projectsErrorsReducer(state, { 
            type: RECEIVE_PROJECT_ERRORS, 
            errors: ['Deletion failed'] 
        });
        expect(state).toEqual(['Deletion failed']);
        
        // Unknown action returns state unchanged
        state = projectsErrorsReducer(state, { type: 'SOME_UNRELATED_ACTION' });
        expect(state).toEqual(['Deletion failed']);
        
        // Clear errors again by removing project
        state = projectsErrorsReducer(state, { type: REMOVE_PROJECT });
        expect(state).toEqual([]);
    });

    it('handles error lifecycle correctly with different actions', () => {
        let state = [];
        
        // Initial: no errors
        expect(state).toEqual([]);
        
        // Error on project creation
        state = projectsErrorsReducer(state, {
            type: RECEIVE_PROJECT_ERRORS,
            errors: ['Title required', 'Invalid category']
        });
        expect(state).toEqual(['Title required', 'Invalid category']);
        
        // Successful project load doesn't clear errors
        state = projectsErrorsReducer(state, { type: RECEIVE_ALL_PROJECTS });
        expect(state).toEqual(['Title required', 'Invalid category']);
        
        // Successful project creation doesn't clear errors
        state = projectsErrorsReducer(state, { type: RECEIVE_PROJECT });
        expect(state).toEqual(['Title required', 'Invalid category']);
        
        // Error on deletion
        state = projectsErrorsReducer(state, {
            type: RECEIVE_PROJECT_ERRORS,
            errors: ['Cannot delete funded project']
        });
        expect(state).toEqual(['Cannot delete funded project']);
        
        // Successful deletion clears errors
        state = projectsErrorsReducer(state, { type: REMOVE_PROJECT });
        expect(state).toEqual([]);
        
        // New creation error
        state = projectsErrorsReducer(state, {
            type: RECEIVE_PROJECT_ERRORS,
            errors: ['Invalid end date']
        });
        expect(state).toEqual(['Invalid end date']);
        
        // Unknown action preserves errors
        state = projectsErrorsReducer(state, { type: 'UNRELATED_UPDATE' });
        expect(state).toEqual(['Invalid end date']);
    });

    it('preserves state reference for unchanged actions', () => {
        const initialState = ['Some error'];
        
        // These should return same reference
        const result1 = projectsErrorsReducer(initialState, { type: RECEIVE_ALL_PROJECTS });
        const result2 = projectsErrorsReducer(initialState, { type: RECEIVE_PROJECT });
        const result3 = projectsErrorsReducer(initialState, { type: 'UNKNOWN' });
        
        expect(result1).toBe(initialState);
        expect(result2).toBe(initialState);
        expect(result3).toBe(initialState);
        
        // These should return different reference
        const result4 = projectsErrorsReducer(initialState, { type: REMOVE_PROJECT });
        const result5 = projectsErrorsReducer(initialState, { 
            type: RECEIVE_PROJECT_ERRORS, 
            errors: ['New'] 
        });
        
        expect(result4).not.toBe(initialState);
        expect(result5).not.toBe(initialState);
    });
});