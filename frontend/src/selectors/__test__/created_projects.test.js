import { describe, it, expect } from 'vitest';
import selectCreatedProjects from '../created_projects';

describe('selectCreatedProjects', () => {
  const mockState = {
    entities: {
      backings: {},
      projects: {
        10: { id: 10, title: 'Project A', user_id: 5 },
        20: { id: 20, title: 'Project B', user_id: 6 },
        30: { id: 30, title: 'Project C', user_id: 5 },
        40: { id: 40, title: 'Project D', user_id: 7 },
        50: { id: 50, title: 'Project E', user_id: 5 }
      },
      rewards: {},
      users: {
        5: { id: 5, name: 'Alice' },
        6: { id: 6, name: 'Bob' },
        7: { id: 7, name: 'Charlie' },
        8: { id: 8, name: 'Dan' }
      }
    }
  };

  it('returns all projects created by the specified user', () => {
    const selector = selectCreatedProjects(5);
    const result = selector(mockState);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ id: 10, title: 'Project A', user_id: 5 });
    expect(result).toContainEqual({ id: 30, title: 'Project C', user_id: 5 });
    expect(result).toContainEqual({ id: 50, title: 'Project E', user_id: 5 });
  });

  it('returns empty array if user does not exist', () => {
    const selector = selectCreatedProjects(999);
    const result = selector(mockState);

    expect(result).toEqual([]);
  });

  it('returns empty array when user exists but has no projects', () => {
    const selector = selectCreatedProjects(8);
    const result = selector(mockState);

    expect(result).toEqual([]);
  });

  it('memoizes results when state does not change', () => {
    const selector = selectCreatedProjects(5);
    const result1 = selector(mockState);
    const result2 = selector(mockState);

    expect(result1).toBe(result2); // Same reference
  });

  it('returns new result when relevant state changes', () => {
    const selector = selectCreatedProjects(5);
    const result1 = selector(mockState);

    const updatedState = {
      ...mockState,
      entities: {
        ...mockState.entities,
        projects: {
          ...mockState.entities.projects,
          60: { id: 60, title: 'Project F', user_id: 5 }
        }
      }
    };

    const result2 = selector(updatedState);

    expect(result1).not.toBe(result2);
    expect(result2).toHaveLength(4);
    expect(result2).toContainEqual({ id: 60, title: 'Project F', user_id: 5 });
  });

  it('handles empty projects object', () => {
    const stateWithNoProjects = {
      entities: {
        projects: {},
        users: {
          5: { id: 5, name: 'Alice' }
        }
      }
    };

    const selector = selectCreatedProjects(5);
    const result = selector(stateWithNoProjects);

    expect(result).toEqual([]);
  });
});