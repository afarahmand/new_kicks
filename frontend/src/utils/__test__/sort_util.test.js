import { describe, it, expect } from 'vitest';
import { sortByAscendingAmount } from '../sort_util';

describe('sortByAscendingAmount', () => {
  it('sorts an array of rewards by amount in ascending order', () => {
    const rewards = [
      { id: 1, title: 'Reward A', amount: 100 },
      { id: 2, title: 'Reward B', amount: 50 },
      { id: 3, title: 'Reward C', amount: 75 }
    ];

    const result = sortByAscendingAmount(rewards);
    
    expect(result).toEqual([
      { id: 2, title: 'Reward B', amount: 50 },
      { id: 3, title: 'Reward C', amount: 75 },
      { id: 1, title: 'Reward A', amount: 100 }
    ]);
  });

  it('handles decimal amounts correctly', () => {
    const rewards = [
      { id: 1, amount: 10.5 },
      { id: 2, amount: 5.25 },
      { id: 3, amount: 10.0 },
      { id: 4, amount: 5.5 }
    ];

    const result = sortByAscendingAmount(rewards);
    
    expect(result).toEqual([
      { id: 2, amount: 5.25 },
      { id: 4, amount: 5.5 },
      { id: 3, amount: 10.0 },
      { id: 1, amount: 10.5 }
    ]);
  });

  it('returns a sorted array (mutates the original)', () => {
    const rewards = [
      { id: 1, amount: 100 },
      { id: 2, amount: 50 },
      { id: 3, amount: 75 }
    ];
    
    const originalReference = rewards;
    const result = sortByAscendingAmount(rewards);
    
    // The function should mutate the original array
    expect(result).toBe(rewards); // Same reference
    expect(originalReference).toEqual([
      { id: 2, amount: 50 },
      { id: 3, amount: 75 },
      { id: 1, amount: 100 }
    ]);
  });

  it('handles empty array', () => {
    const rewards = [];
    const result = sortByAscendingAmount(rewards);
    
    expect(result).toEqual([]);
    expect(result).toBe(rewards); // Same reference
  });

  it('handles single element array', () => {
    const rewards = [{ id: 1, amount: 100 }];
    const result = sortByAscendingAmount(rewards);
    
    expect(result).toEqual([{ id: 1, amount: 100 }]);
    expect(result).toBe(rewards); // Same reference
  });

  it('sorts large numbers correctly', () => {
    const rewards = [
      { id: 1, amount: 1000000 },
      { id: 2, amount: 999999 },
      { id: 3, amount: 1000001 }
    ];

    const result = sortByAscendingAmount(rewards);
    
    expect(result).toEqual([
      { id: 2, amount: 999999 },
      { id: 1, amount: 1000000 },
      { id: 3, amount: 1000001 }
    ]);
  });

  it('maintains stable sort for equal amounts', () => {
    const rewards = [
      { id: 1, amount: 50, title: 'First 50' },
      { id: 2, amount: 100, title: 'First 100' },
      { id: 3, amount: 50, title: 'Second 50' },
      { id: 4, amount: 100, title: 'Second 100' }
    ];

    const result = sortByAscendingAmount(rewards);
    
    // Items with equal amounts should maintain their relative order
    expect(result[0].id).toBe(1); // First 50
    expect(result[1].id).toBe(3); // Second 50
    expect(result[2].id).toBe(2); // First 100
    expect(result[3].id).toBe(4); // Second 100
  });
});