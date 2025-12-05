import { describe, it, expect } from 'vitest';
import rewardsReducer from '../rewards_reducer';
import {
    RECEIVE_REWARD,
    RECEIVE_REWARD_ERRORS,
    REMOVE_REWARD
} from '../../../actions/reward_actions';
import { RECEIVE_PROJECT } from '../../../actions/project_actions';
import { RECEIVE_USER } from '../../../actions/user_actions';

describe('rewardsReducer', () => {
    it('returns the initial state by default', () => {
        const result = rewardsReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual({});
    });

    describe('RECEIVE_USER', () => {
        it('merges rewards from user response into existing state', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            };
            const rewards = {
                2: { id: 2, title: 'User Reward 1', amount: 50 },
                3: { id: 3, title: 'User Reward 2', amount: 100 }
            };
            const action = { type: RECEIVE_USER, rewards };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Existing Reward', amount: 25 },
                2: { id: 2, title: 'User Reward 1', amount: 50 },
                3: { id: 3, title: 'User Reward 2', amount: 100 }
            });
        });

        it('updates existing rewards when IDs overlap', () => {
            const initialState = {
                1: { id: 1, title: 'Old Title', amount: 25 },
                2: { id: 2, title: 'Reward 2', amount: 50 }
            };
            const rewards = {
                1: { id: 1, title: 'Updated Title', amount: 75 },
                3: { id: 3, title: 'New Reward', amount: 100 }
            };
            const action = { type: RECEIVE_USER, rewards };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Updated Title', amount: 75 },
                2: { id: 2, title: 'Reward 2', amount: 50 },
                3: { id: 3, title: 'New Reward', amount: 100 }
            });
        });

        it('handles user with no rewards', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            };
            const action = { type: RECEIVE_USER };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });

        it('handles user with empty rewards object', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            };
            const action = { type: RECEIVE_USER, rewards: {} };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });

        it('does not mutate the original state', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            };
            const rewards = {
                2: { id: 2, title: 'New Reward', amount: 50 }
            };
            const action = { type: RECEIVE_USER, rewards };

            const result = rewardsReducer(initialState, action);

            expect(result).not.toBe(initialState);
            expect(initialState).toEqual({
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            });
        });
    });

    describe('RECEIVE_PROJECT', () => {
        it('merges rewards from project response into existing state', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 },
                2: { id: 2, title: 'Another Existing', amount: 50 }
            };
            const rewards = {
                3: { id: 3, title: 'Project Reward 1', amount: 75 },
                4: { id: 4, title: 'Project Reward 2', amount: 100 }
            };
            const action = { type: RECEIVE_PROJECT, rewards };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Existing Reward', amount: 25 },
                2: { id: 2, title: 'Another Existing', amount: 50 },
                3: { id: 3, title: 'Project Reward 1', amount: 75 },
                4: { id: 4, title: 'Project Reward 2', amount: 100 }
            });
        });

        it('updates existing rewards when IDs overlap', () => {
            const initialState = {
                1: { id: 1, title: 'Old Title', amount: 25 },
                2: { id: 2, title: 'Reward 2', amount: 50 }
            };
            const rewards = {
                1: { id: 1, title: 'Updated Title', amount: 75 },
                3: { id: 3, title: 'New Reward', amount: 100 }
            };
            const action = { type: RECEIVE_PROJECT, rewards };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Updated Title', amount: 75 },
                2: { id: 2, title: 'Reward 2', amount: 50 },
                3: { id: 3, title: 'New Reward', amount: 100 }
            });
        });

        it('handles project with no rewards property', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            };
            const action = { type: RECEIVE_PROJECT };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });

        it('handles project with empty rewards object', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            };
            const action = { type: RECEIVE_PROJECT, rewards: {} };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });

        it('does not mutate the original state', () => {
            const initialState = {
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            };
            const rewards = {
                2: { id: 2, title: 'Project Reward', amount: 50 }
            };
            const action = { type: RECEIVE_PROJECT, rewards };

            const result = rewardsReducer(initialState, action);

            expect(result).not.toBe(initialState);
            expect(initialState).toEqual({
                1: { id: 1, title: 'Existing Reward', amount: 25 }
            });
        });

        it('preserves existing rewards while merging new ones', () => {
            const initialState = {
                1: { id: 1, title: 'Keep This', amount: 25 }
            };
            const rewards = {
                2: { id: 2, title: 'Add This', amount: 50 }
            };
            const action = { type: RECEIVE_PROJECT, rewards };

            const result = rewardsReducer(initialState, action);

            expect(result).toHaveProperty('1');
            expect(result).toHaveProperty('2');
            expect(result[1]).toEqual({ id: 1, title: 'Keep This', amount: 25 });
            expect(result[2]).toEqual({ id: 2, title: 'Add This', amount: 50 });
        });
    });

    describe('RECEIVE_REWARD', () => {
        it('adds a new reward to the state', () => {
            const initialState = {};
            const reward = { id: 1, title: 'New Reward', amount: 25 };
            const action = { type: RECEIVE_REWARD, reward };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({ 1: reward });
        });

        it('adds a reward to existing state without mutating', () => {
            const initialState = {
                1: { id: 1, title: 'Reward 1', amount: 25 }
            };
            const newReward = { id: 2, title: 'Reward 2', amount: 50 };
            const action = { type: RECEIVE_REWARD, reward: newReward };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'Reward 1', amount: 25 },
                2: { id: 2, title: 'Reward 2', amount: 50 }
            });
            expect(initialState).toEqual({
                1: { id: 1, title: 'Reward 1', amount: 25 }
            });
        });

        it('updates an existing reward when reward ID already exists', () => {
            const initialState = {
                1: { id: 1, title: 'Old Title', amount: 25 }
            };
            const updatedReward = { id: 1, title: 'New Title', amount: 75 };
            const action = { type: RECEIVE_REWARD, reward: updatedReward };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({
                1: { id: 1, title: 'New Title', amount: 75 }
            });
        });
    });

    describe('REMOVE_REWARD', () => {
        it('removes a reward from the state', () => {
            const initialState = {
                1: { id: 1, title: 'Reward 1', amount: 25 },
                2: { id: 2, title: 'Reward 2', amount: 50 }
            };
            const action = { type: REMOVE_REWARD, rewardId: 1 };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual({
                2: { id: 2, title: 'Reward 2', amount: 50 }
            });
            expect(result).not.toHaveProperty('1');
        });

        it('does nothing when removing non-existent reward', () => {
            const initialState = {
                1: { id: 1, title: 'Reward 1', amount: 25 }
            };
            const action = { type: REMOVE_REWARD, rewardId: 999 };

            const result = rewardsReducer(initialState, action);

            expect(result).toEqual(initialState);
        });

        it('does not mutate the original state', () => {
            const initialState = {
                1: { id: 1, title: 'Reward 1', amount: 25 },
                2: { id: 2, title: 'Reward 2', amount: 50 }
            };
            const action = { type: REMOVE_REWARD, rewardId: 1 };

            const result = rewardsReducer(initialState, action);

            expect(result).not.toBe(initialState);
            expect(initialState).toEqual({
                1: { id: 1, title: 'Reward 1', amount: 25 },
                2: { id: 2, title: 'Reward 2', amount: 50 }
            });
        });
    });

    describe('RECEIVE_REWARD_ERRORS', () => {
        it('returns the state unchanged', () => {
            const initialState = {
                1: { id: 1, title: 'Reward 1', amount: 25 }
            };
            const action = { type: RECEIVE_REWARD_ERRORS, errors: ['error'] };

            const result = rewardsReducer(initialState, action);

            expect(result).toBe(initialState);
        });
    });

    it('maintains correct behavior across action sequence', () => {
        let state = {};
        
        // Add a reward
        const reward1 = { id: 1, title: 'Reward 1', amount: 25 };
        state = rewardsReducer(state, { type: RECEIVE_REWARD, reward: reward1 });
        expect(state).toEqual({ 1: reward1 });

        // Add another reward
        const reward2 = { id: 2, title: 'Reward 2', amount: 50 };
        state = rewardsReducer(state, { type: RECEIVE_REWARD, reward: reward2 });
        expect(state).toEqual({ 1: reward1, 2: reward2 });

        // Merge rewards from user
        const userRewards = {
            3: { id: 3, title: 'User Reward', amount: 100 }
        };
        state = rewardsReducer(state, { type: RECEIVE_USER, rewards: userRewards });
        expect(state).toEqual({
            1: reward1,
            2: reward2,
            3: { id: 3, title: 'User Reward', amount: 100 }
        });

        // Merge rewards from project (now merges instead of replacing)
        const projectRewards = {
            4: { id: 4, title: 'Project Reward', amount: 150 },
            2: { id: 2, title: 'Updated Reward 2', amount: 75 } // Update existing
        };
        state = rewardsReducer(state, { type: RECEIVE_PROJECT, rewards: projectRewards });
        expect(state).toEqual({
            1: reward1,
            2: { id: 2, title: 'Updated Reward 2', amount: 75 }, // Updated
            3: { id: 3, title: 'User Reward', amount: 100 },
            4: { id: 4, title: 'Project Reward', amount: 150 }
        });

        // Remove a reward
        state = rewardsReducer(state, { type: REMOVE_REWARD, rewardId: 1 });
        expect(state).toEqual({
            2: { id: 2, title: 'Updated Reward 2', amount: 75 },
            3: { id: 3, title: 'User Reward', amount: 100 },
            4: { id: 4, title: 'Project Reward', amount: 150 }
        });
    });

    it('handles mixed action types correctly', () => {
        const initialState = {
            1: { id: 1, title: 'Reward 1', amount: 10 },
            2: { id: 2, title: 'Reward 2', amount: 20 }
        };

        // Update existing and add new via RECEIVE_USER
        const userAction = {
            type: RECEIVE_USER,
            rewards: {
                2: { id: 2, title: 'Updated Reward 2', amount: 25 },
                3: { id: 3, title: 'New Reward 3', amount: 30 }
            }
        };
        const afterUser = rewardsReducer(initialState, userAction);
        expect(afterUser).toEqual({
            1: { id: 1, title: 'Reward 1', amount: 10 },
            2: { id: 2, title: 'Updated Reward 2', amount: 25 },
            3: { id: 3, title: 'New Reward 3', amount: 30 }
        });

        // Merge rewards from project (preserves existing, updates/merges new)
        const projectAction = {
            type: RECEIVE_PROJECT,
            rewards: {
                3: { id: 3, title: 'Project Updated Reward 3', amount: 40 },
                4: { id: 4, title: 'Project Reward 4', amount: 100 }
            }
        };
        const afterProject = rewardsReducer(afterUser, projectAction);
        expect(afterProject).toEqual({
            1: { id: 1, title: 'Reward 1', amount: 10 },
            2: { id: 2, title: 'Updated Reward 2', amount: 25 },
            3: { id: 3, title: 'Project Updated Reward 3', amount: 40 },
            4: { id: 4, title: 'Project Reward 4', amount: 100 }
        });

        // Remove reward
        const removeAction = { type: REMOVE_REWARD, rewardId: 1 };
        const afterRemove = rewardsReducer(afterProject, removeAction);
        expect(afterRemove).toEqual({
            2: { id: 2, title: 'Updated Reward 2', amount: 25 },
            3: { id: 3, title: 'Project Updated Reward 3', amount: 40 },
            4: { id: 4, title: 'Project Reward 4', amount: 100 }
        });

        // Add new reward via RECEIVE_REWARD
        const newRewardAction = {
            type: RECEIVE_REWARD,
            reward: { id: 5, title: 'Single Reward', amount: 200 }
        };
        const afterNewReward = rewardsReducer(afterRemove, newRewardAction);
        expect(afterNewReward).toEqual({
            2: { id: 2, title: 'Updated Reward 2', amount: 25 },
            3: { id: 3, title: 'Project Updated Reward 3', amount: 40 },
            4: { id: 4, title: 'Project Reward 4', amount: 100 },
            5: { id: 5, title: 'Single Reward', amount: 200 }
        });
    });
});