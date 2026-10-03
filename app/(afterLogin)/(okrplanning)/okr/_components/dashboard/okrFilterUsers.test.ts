import { describe, expect, it } from '@jest/globals';
import {
  extractDepartmentUserIds,
  resolveCompanyFilterUserIds,
  resolveEmployeeDepartmentId,
  resolveTeamViewerUserId,
  selectValueOrUndefined,
} from './okrFilterUsers';

describe('okrFilterUsers', () => {
  const departments = [
    { id: 'dept-a', users: [{ id: 'u1' }, { id: 'u2' }] },
    { id: 'dept-b', users: ['u3'] },
    { id: 'dept-empty', users: [] },
  ];

  describe('selectValueOrUndefined', () => {
    it('maps empty values to undefined for Ant Select placeholders', () => {
      expect(selectValueOrUndefined('')).toBeUndefined();
      expect(selectValueOrUndefined(null)).toBeUndefined();
      expect(selectValueOrUndefined(undefined)).toBeUndefined();
      expect(selectValueOrUndefined('abc')).toBe('abc');
    });
  });

  describe('resolveEmployeeDepartmentId', () => {
    it('prefers departmentId then nested department.id', () => {
      expect(resolveEmployeeDepartmentId({ departmentId: 'd1' })).toBe('d1');
      expect(resolveEmployeeDepartmentId({ department: { id: 'd2' } })).toBe(
        'd2',
      );
      expect(
        resolveEmployeeDepartmentId({
          departmentId: 'd1',
          department: { id: 'd2' },
        }),
      ).toBe('d1');
      expect(resolveEmployeeDepartmentId(undefined)).toBeUndefined();
    });
  });

  describe('extractDepartmentUserIds', () => {
    it('returns unique user ids for a department', () => {
      expect(extractDepartmentUserIds(departments, 'dept-a')).toEqual([
        'u1',
        'u2',
      ]);
      expect(extractDepartmentUserIds(departments, 'dept-b')).toEqual(['u3']);
      expect(extractDepartmentUserIds(departments, 'missing')).toEqual([]);
      expect(extractDepartmentUserIds(departments, '')).toEqual([]);
    });
  });

  describe('resolveTeamViewerUserId', () => {
    it('uses employee filter first, then department member, then self', () => {
      expect(
        resolveTeamViewerUserId({
          filterUserId: 'picked',
          filterDepartmentId: 'dept-a',
          currentUserId: 'me',
          departments,
        }),
      ).toBe('picked');

      expect(
        resolveTeamViewerUserId({
          filterUserId: '',
          filterDepartmentId: 'dept-a',
          currentUserId: 'me',
          departments,
        }),
      ).toBe('u1');

      expect(
        resolveTeamViewerUserId({
          filterUserId: '',
          filterDepartmentId: '',
          currentUserId: 'me',
          departments,
        }),
      ).toBe('me');
    });
  });

  describe('resolveCompanyFilterUserIds', () => {
    it('returns [] when no employee/department filter (company-wide)', () => {
      expect(
        resolveCompanyFilterUserIds({
          filterUserId: '',
          filterDepartmentId: '',
          departments,
        }),
      ).toEqual([]);
    });

    it('scopes to department users and optional all-level ids', () => {
      expect(
        resolveCompanyFilterUserIds({
          filterDepartmentId: 'dept-a',
          departments,
          allLevelDepartmentUserIds: ['u9'],
        }),
      ).toEqual(['u9', 'u1', 'u2']);
    });

    it('narrows to employee when both employee and department are set', () => {
      expect(
        resolveCompanyFilterUserIds({
          filterUserId: 'u2',
          filterDepartmentId: 'dept-a',
          departments,
        }),
      ).toEqual(['u2']);
      expect(
        resolveCompanyFilterUserIds({
          filterUserId: 'outside',
          filterDepartmentId: 'dept-a',
          departments,
        }),
      ).toEqual(['outside']);
    });

    it('scopes to a single employee when only employee is set', () => {
      expect(
        resolveCompanyFilterUserIds({
          filterUserId: 'solo',
          filterDepartmentId: '',
          departments,
        }),
      ).toEqual(['solo']);
    });
  });
});
