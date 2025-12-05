import { describe, it, expect } from 'vitest';
import selectProjectRewards from '../project_rewards';

// Mock the sort utility
vi.mock('../../utils/sort_util', () => ({
  sortByAscendingAmount: vi.fn((arr) => {
    // Simple mock implementation that sorts by amount
    return [...arr].sort((a, b) => (a.amount || 0) - (b.amount || 0));
  })
}));

import { sortByAscendingAmount } from '../../utils/sort_util';

describe('selectProjectRewards', () => {
  const mockState = {
    entities: {
      backings: {},
      projects: {},
      rewards: {
        100: { id: 100, project_id: 10, title: 'Reward A', amount: 50 },
        101: { id: 101, project_id: 10, title: 'Reward B', amount: 100 },
        102: { id: 102, project_id: 20, title: 'Reward C', amount: 25 },
        103: { id: 103, project_id: 10, title: 'Reward D', amount: 75 },
        104: { id: 104, project_id: 30, title: 'Reward E', amount: 150 },
        105: { id: 105, project_id: 10, title: 'Reward F', amount: 1000 }
      },
      users: {}
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all rewards for the specified project', () => {
    const selector = selectProjectRewards(10);
    const result = selector(mockState);

    expect(result).toHaveLength(4);
    expect(result).toContainEqual({ id: 100, project_id: 10, title: 'Reward A', amount: 50 });
    expect(result).toContainEqual({ id: 101, project_id: 10, title: 'Reward B', amount: 100 });
    expect(result).toContainEqual({ id: 103, project_id: 10, title: 'Reward D', amount: 75 });
    expect(result).toContainEqual({ id: 105, project_id: 10, title: 'Reward F', amount: 1000 });
  });

  it('returns empty array for project with no rewards', () => {
    const selector = selectProjectRewards(40); // Project with no rewards
    const result = selector(mockState);

    expect(result).toEqual([]);
  });

  it('returns empty array when rewards object is empty', () => {
    const stateWithNoRewards = {
      entities: {
        rewards: {},
        projects: {},
        users: {}
      }
    };

    const selector = selectProjectRewards(10);
    const result = selector(stateWithNoRewards);

    expect(result).toEqual([]);
  });

  it('sorts rewards by ascending amount using helper function', () => {
    const selector = selectProjectRewards(10);
    const result = selector(mockState);

    expect(sortByAscendingAmount).toHaveBeenCalledTimes(1);
    
    expect(result[0].amount).toBe(50);
    expect(result[1].amount).toBe(75);
    expect(result[2].amount).toBe(100);
    expect(result[3].amount).toBe(1000);
  });

  it('memoizes results when state does not change', () => {
    const selector = selectProjectRewards(10);
    const result1 = selector(mockState);
    const result2 = selector(mockState);

    expect(result1).toBe(result2); // Same reference
    expect(sortByAscendingAmount).toHaveBeenCalledTimes(1); // Only called once due to memoization
  });

  it('returns new result when relevant state changes', () => {
    const selector = selectProjectRewards(10);
    const result1 = selector(mockState);

    const updatedState = {
      ...mockState,
      entities: {
        ...mockState.entities,
        rewards: {
          ...mockState.entities.rewards,
          106: { id: 106, project_id: 10, title: 'Reward G', amount: 60 }
        }
      }
    };

    const result2 = selector(updatedState);

    expect(result1).not.toBe(result2);
    expect(result2).toHaveLength(5);
    expect(sortByAscendingAmount).toHaveBeenCalledTimes(2);
  });

  it('returns correctly sorted array even when only one reward exists', () => {
    const selector = selectProjectRewards(30);
    const result = selector(mockState);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({ id: 104, project_id: 30, title: 'Reward E', amount: 150 });
    expect(sortByAscendingAmount).toHaveBeenCalledWith([{ id: 104, project_id: 30, title: 'Reward E', amount: 150 }]);
  });
});