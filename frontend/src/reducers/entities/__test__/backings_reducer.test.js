import { describe, it, expect } from 'vitest';
import backingsReducer from '../backings_reducer';
import {
  RECEIVE_BACKING,
  RECEIVE_BACKING_ERRORS
} from '../../../actions/backing_actions';
import { RECEIVE_PROJECT } from '../../../actions/project_actions';
import { RECEIVE_USER } from '../../../actions/user_actions';

describe('backingsReducer', () => {
  it('returns the initial state by default', () => {
    const result = backingsReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(result).toEqual({});
  });

  describe('RECEIVE_BACKING', () => {
    it('adds a new backing to the state', () => {
      const initialState = {};
      const backing = { id: 1, user_id: 5, reward_id: 10 };
      const action = { type: RECEIVE_BACKING, backing };

      const result = backingsReducer(initialState, action);

      expect(result).toEqual({ 1: backing });
    });

    it('adds a backing to existing state without mutating', () => {
      const initialState = { 
        1: { id: 1, user_id: 5, reward_id: 10 }
      };
      const newBacking = { id: 2, user_id: 6, reward_id: 11 };
      const action = { type: RECEIVE_BACKING, backing: newBacking };

      const result = backingsReducer(initialState, action);

      expect(result).toEqual({
        1: { id: 1, user_id: 5, reward_id: 10 },
        2: { id: 2, user_id: 6, reward_id: 11 }
      });
      expect(initialState).toEqual({ 1: { id: 1, user_id: 5, reward_id: 10 } });
    });
  });

  describe('RECEIVE_PROJECT', () => {
    it('merges backings from project response', () => {
      const initialState = { 
        1: { id: 1, user_id: 5, reward_id: 10 }
      };
      const backings = {
        2: { id: 2, user_id: 6, reward_id: 11 },
        3: { id: 3, user_id: 7, reward_id: 12 }
      };
      const action = { type: RECEIVE_PROJECT, backings };

      const result = backingsReducer(initialState, action);

      expect(result).toEqual({
        1: { id: 1, user_id: 5, reward_id: 10 },
        2: { id: 2, user_id: 6, reward_id: 11 },
        3: { id: 3, user_id: 7, reward_id: 12 }
      });
    });

    it('handles project with no backings', () => {
      const initialState = { 
        1: { id: 1, user_id: 5, reward_id: 10 }
      };
      const action = { type: RECEIVE_PROJECT };

      const result = backingsReducer(initialState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('RECEIVE_USER', () => {
    it('merges backings from user response', () => {
      const initialState = { 
        1: { id: 1, user_id: 5, reward_id: 10 }
      };
      const backings = {
        2: { id: 2, user_id: 6, reward_id: 11 }
      };
      const action = { type: RECEIVE_USER, backings };

      const result = backingsReducer(initialState, action);

      expect(result).toEqual({
        1: { id: 1, user_id: 5, reward_id: 10 },
        2: { id: 2, user_id: 6, reward_id: 11 }
      });
    });

    it('handles user with no backings', () => {
      const initialState = { 
        1: { id: 1, user_id: 5, reward_id: 10 }
      };
      const action = { type: RECEIVE_USER };

      const result = backingsReducer(initialState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('RECEIVE_BACKING_ERRORS', () => {
    it('returns the state unchanged', () => {
      const initialState = { 
        1: { id: 1, user_id: 5, reward_id: 10 }
      };
      const action = { type: RECEIVE_BACKING_ERRORS, errors: ['error'] };

      const result = backingsReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('does not generate an error', () => {
    const initialState = Object.freeze({ 
      1: { id: 1, user_id: 5, reward_id: 10 }
    });
    const backing = { id: 2, user_id: 6, reward_id: 11 };
    const action = { type: RECEIVE_BACKING, backing };

    expect(() => {
      backingsReducer(initialState, action);
    }).not.toThrow();
  });
});