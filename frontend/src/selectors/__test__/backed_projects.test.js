import { describe, it, expect } from 'vitest';
import selectBackedProjects from '../backed_projects';

describe('selectBackedProjects', () => {
  const mockState = {
    entities: {
      backings: {
        1: { id: 1, user_id: 5, reward_id: 100 },
        2: { id: 2, user_id: 5, reward_id: 101 },
        3: { id: 3, user_id: 6, reward_id: 102 }
      },
      projects: {
        10: { id: 10, title: 'Project A' },
        20: { id: 20, title: 'Project B' },
        30: { id: 30, title: 'Project C' }
      },
      rewards: {
        100: { id: 100, project_id: 10 },
        101: { id: 101, project_id: 20 },
        102: { id: 102, project_id: 30 }
      },
      users: {
        5: { id: 5, name: 'Alice' },
        6: { id: 6, name: 'Bob' }
      }
    }
  };

  it('returns all projects backed by the specified user', () => {
    const selector = selectBackedProjects(5);
    const result = selector(mockState);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ id: 10, title: 'Project A' });
    expect(result).toContainEqual({ id: 20, title: 'Project B' });
  });

  it('returns only projects for the specified user', () => {
    const selector = selectBackedProjects(6);
    const result = selector(mockState);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({ id: 30, title: 'Project C' });
  });

  it('returns empty array if user does not exist', () => {
    const selector = selectBackedProjects(999);
    const result = selector(mockState);

    expect(result).toEqual([]);
  });

  it('returns empty array if user has no backings', () => {
    const stateWithNoBackings = {
      ...mockState,
      entities: {
        ...mockState.entities,
        backings: {},
        users: {
          5: { id: 5, name: 'Alice' }
        }
      }
    };

    const selector = selectBackedProjects(5);
    const result = selector(stateWithNoBackings);

    expect(result).toEqual([]);
  });

  it('handles missing reward gracefully', () => {
    const stateWithMissingReward = {
      entities: {
        backings: {
          1: { id: 1, user_id: 5, reward_id: 999 }
        },
        projects: {
          10: { id: 10, title: 'Project A' }
        },
        rewards: {},
        users: {
          5: { id: 5, name: 'Alice' }
        }
      }
    };

    const selector = selectBackedProjects(5);
    const result = selector(stateWithMissingReward);

    expect(result).toEqual([]);
  });

  it('memoizes results when state does not change', () => {
    const selector = selectBackedProjects(5);
    const result1 = selector(mockState);
    const result2 = selector(mockState);

    expect(result1).toBe(result2); // Same reference, not just equal
  });

  it('returns new result when relevant state changes', () => {
    const selector = selectBackedProjects(5);
    const result1 = selector(mockState);

    const updatedState = {
      ...mockState,
      entities: {
        ...mockState.entities,
        backings: {
          ...mockState.entities.backings,
          4: { id: 4, user_id: 5, reward_id: 102 }
        }
      }
    };

    const result2 = selector(updatedState);

    expect(result1).not.toBe(result2);
    expect(result2).toHaveLength(3);
  });
});