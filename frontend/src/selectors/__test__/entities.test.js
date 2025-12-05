import { describe, it, expect } from 'vitest';
import {
    selectBackings, selectProjects, selectRewards, selectUsers
} from '../entities';

describe('entity selectors', () => {
  const mockState = {
    entities: {
      backings: { 1: { id: 1 }, 2: { id: 2 } },
      projects: { 10: { id: 10 }, 20: { id: 20 } },
      rewards: { 100: { id: 100 } },
      users: { 5: { id: 5 } }
    },
    errors: {},
    session: {}
  };

  describe('selectBackings', () => {
    it('returns the backings object from state', () => {
      const result = selectBackings(mockState);
      expect(result).toEqual({ 1: { id: 1 }, 2: { id: 2 } });
    });

    it('returns empty object if backings is empty', () => {
      const emptyState = { entities: { backings: {} } };
      const result = selectBackings(emptyState);
      expect(result).toEqual({});
    });
  });

  describe('selectProjects', () => {
    it('returns the projects object from state', () => {
      const result = selectProjects(mockState);
      expect(result).toEqual({ 10: { id: 10 }, 20: { id: 20 } });
    });

    it('returns empty object if projects is empty', () => {
      const emptyState = { entities: { projects: {} } };
      const result = selectProjects(emptyState);
      expect(result).toEqual({});
    });
  });

  describe('selectRewards', () => {
    it('returns the rewards object from state', () => {
      const result = selectRewards(mockState);
      expect(result).toEqual({ 100: { id: 100 } });
    });

    it('returns empty object if rewards is empty', () => {
      const emptyState = { entities: { rewards: {} } };
      const result = selectRewards(emptyState);
      expect(result).toEqual({});
    });
  });

  describe('selectUsers', () => {
    it('returns the users object from state', () => {
      const result = selectUsers(mockState);
      expect(result).toEqual({ 5: { id: 5 } });
    });

    it('returns empty object if users is empty', () => {
      const emptyState = { entities: { users: {} } };
      const result = selectUsers(emptyState);
      expect(result).toEqual({});
    });
  });
});