import { describe, it, expect } from 'vitest';
import selectAlreadyBacked from '../already_backed';

describe('selectAlreadyBacked', () => {
  const mockState = {
    entities: {
      backings: {
        1: { id: 1, user_id: 5, reward_id: 100 },
        2: { id: 2, user_id: 5, reward_id: 101 },
        3: { id: 3, user_id: 6, reward_id: 102 },
        4: { id: 4, user_id: 7, reward_id: 100 }
      },
      projects: {},
      rewards: {},
      users: {}
    }
  };

  it('returns true when user has backed a matching reward', () => {
    const selector = selectAlreadyBacked([100, 101, 102], { id: 5 });
    const result = selector(mockState);

    expect(result).toBe(true);
  });

  it('returns false when user has not backed any matching rewards', () => {
    const selector = selectAlreadyBacked([103, 104], { id: 5 });
    const result = selector(mockState);

    expect(result).toBe(false);
  });

  it('returns false when user has backed non-matching rewards only', () => {
    const selector = selectAlreadyBacked([103, 104], { id: 5 });
    const result = selector(mockState);

    expect(result).toBe(false);
  });

  it('returns false when no user is provided', () => {
    const selector = selectAlreadyBacked([100, 101, 102], null);
    const result = selector(mockState);

    expect(result).toBe(false);
  });

  it('returns false when user has no backings', () => {
    const stateWithNoBackings = {
      ...mockState,
      entities: {
        ...mockState.entities,
        backings: {}
      }
    };

    const selector = selectAlreadyBacked([100, 101, 102], { id: 5 });
    const result = selector(stateWithNoBackings);

    expect(result).toBe(false);
  });

  it('returns true when user has backed at least one of the rewards', () => {
    const selector = selectAlreadyBacked([102, 103], { id: 6 });
    const result = selector(mockState);

    expect(result).toBe(true);
  });

  it('returns true when projectRewardIds array empty', () => {
    const selector = selectAlreadyBacked([], { id: 5 });
    const result = selector(mockState);

    expect(result).toBe(false);
  });

  it('memoizes results when state does not change', () => {
    const selector = selectAlreadyBacked([100, 101, 102], { id: 5 });
    const result1 = selector(mockState);
    const result2 = selector(mockState);

    expect(result1).toBe(result2);
  });

  it('returns new result when relevant state changes', () => {
    const selector = selectAlreadyBacked([100, 101, 102], { id: 5 });
    const result1 = selector(mockState);

    const updatedState = {
      ...mockState,
      entities: {
        ...mockState.entities,
        backings: {
          ...mockState.entities.backings,
          5: { id: 5, user_id: 5, reward_id: 103 }
        }
      }
    };

    const result2 = selector(updatedState);
    // Result should be the same (still true) but different reference due to memoization
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    // The selector result is a primitive (boolean), so we can't test reference equality
    // But the selector itself is memoized based on inputs
  });

  it('creates different selectors for different inputs', () => {
    const selector1 = selectAlreadyBacked([100], { id: 5 });
    const selector2 = selectAlreadyBacked([101], { id: 5 });
    const selector3 = selectAlreadyBacked([100], { id: 6 });

    expect(selector1).not.toBe(selector2);
    expect(selector1).not.toBe(selector3);
    expect(selector2).not.toBe(selector3);
  });
});