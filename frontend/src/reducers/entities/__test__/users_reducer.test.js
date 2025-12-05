import { describe, it, expect } from 'vitest';
import usersReducer from '../users_reducer';
import {
  RECEIVE_ALL_PROJECTS,
  RECEIVE_PROJECT
} from '../../../actions/project_actions';
import { RECEIVE_USER } from '../../../actions/user_actions';

describe('usersReducer', () => {
    it('returns the initial state by default', () => {
        const result = usersReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual({});
    });

    describe('RECEIVE_ALL_PROJECTS', () => {
        it('replaces state with users from projects response', () => {
            const initialState = { 
                1: { id: 1, username: 'user1', email: 'user1@test.com' }
            };
            const users = {
                2: { id: 2, username: 'user2', email: 'user2@test.com' },
                3: { id: 3, username: 'user3', email: 'user3@test.com' }
            };
            const action = { type: RECEIVE_ALL_PROJECTS, users };

            const result = usersReducer(initialState, action);

            expect(result).toEqual(users);
            expect(result).not.toEqual(initialState);
        });

        it('handles empty users object in action', () => {
            const initialState = { 
                1: { id: 1, username: 'user1', email: 'user1@test.com' }
            };
            const action = { type: RECEIVE_ALL_PROJECTS, users: {} };

            const result = usersReducer(initialState, action);

            expect(result).toEqual({});
        });
    });

    describe('RECEIVE_PROJECT', () => {
        it('adds a user from the project to existing state without mutating', () => {
            const initialState = { 
                1: { id: 1, username: 'user1', email: 'user1@test.com' }
            };
            const newUser = { id: 2, username: 'user2', email: 'user2@test.com' };
            const action = { type: RECEIVE_PROJECT, user: newUser };

            const result = usersReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, username: 'user1', email: 'user1@test.com' },
                2: { id: 2, username: 'user2', email: 'user2@test.com' }
            });
            expect(initialState).toEqual({ 1: { id: 1, username: 'user1', email: 'user1@test.com' } });
        });

        it('updates an existing user when user ID already exists', () => {
            const initialState = { 
                1: { id: 1, username: 'oldUsername', email: 'old@test.com' }
            };
            const updatedUser = { id: 1, username: 'newUsername', email: 'new@test.com' };
            const action = { type: RECEIVE_PROJECT, user: updatedUser };

            const result = usersReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, username: 'newUsername', email: 'new@test.com' }
            });
        });
    });

    describe('RECEIVE_USER', () => {
        it('adds a new user to the state', () => {
            const initialState = {};
            const user = { id: 1, username: 'user1', email: 'user1@test.com' };
            const action = { type: RECEIVE_USER, user };

            const result = usersReducer(initialState, action);

            expect(result).toEqual({ 1: user });
        });

        it('adds a user to existing state without mutating', () => {
            const initialState = { 
                1: { id: 1, username: 'user1', email: 'user1@test.com' }
            };
            const newUser = { id: 2, username: 'user2', email: 'user2@test.com' };
            const action = { type: RECEIVE_USER, user: newUser };

            const result = usersReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, username: 'user1', email: 'user1@test.com' },
                2: { id: 2, username: 'user2', email: 'user2@test.com' }
            });
            expect(initialState).toEqual({ 1: { id: 1, username: 'user1', email: 'user1@test.com' } });
        });

        it('updates an existing user when user ID already exists', () => {
            const initialState = { 
                1: { id: 1, username: 'oldUsername', email: 'old@test.com' }
            };
            const updatedUser = { id: 1, username: 'newUsername', email: 'new@test.com' };
            const action = { type: RECEIVE_USER, user: updatedUser };

            const result = usersReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, username: 'newUsername', email: 'new@test.com' }
            });
        });
    });
});