import { describe, expect, it } from '@jest/globals';
import {
  buildAssigneeRoster,
  buildSubordinatePickerRoster,
  defaultSelectedUserIds,
  isAllRosterSelected,
  mergeMeWithPickerSelection,
  resolveEmployeeProfileImageUrl,
  toggleAssigneeChipSelection,
  toggleMeInSelection,
} from './assigneeChipRoster';

describe('assigneeChipRoster', () => {
  const employeeData = {
    items: [
      {
        id: 'mgr',
        firstName: 'Manager',
        lastName: 'One',
        reportingTo: null,
      },
      {
        id: 'rep-a',
        firstName: 'Alice',
        lastName: 'Zed',
        reportingTo: { id: 'mgr' },
      },
      {
        id: 'rep-b',
        firstName: 'Bob',
        lastName: 'Young',
        reportingTo: { id: 'mgr' },
      },
    ],
  };

  it('builds roster with me first then alphabetical reports', () => {
    const roster = buildAssigneeRoster(employeeData, 'mgr');
    expect(roster.map((c) => c.userId)).toEqual(['mgr', 'rep-a', 'rep-b']);
    expect(roster[0].label).toBe('Me');
  });

  it('toggles chip selection without deselecting the last chip', () => {
    const rosterIds = ['mgr', 'rep-a', 'rep-b'];
    const all = defaultSelectedUserIds(
      rosterIds.map((id) => ({
        userId: id,
        label: id,
        initials: 'AB',
        isSelf: id === 'mgr',
      })),
    );
    const minusBob = toggleAssigneeChipSelection(all, rosterIds, 'rep-b');
    expect(minusBob).toEqual(['mgr', 'rep-a']);
    const lastOnly = toggleAssigneeChipSelection(['mgr'], rosterIds, 'mgr');
    expect(lastOnly).toEqual(['mgr']);
  });

  it('detects when full roster is selected', () => {
    expect(isAllRosterSelected(['mgr', 'rep-a'], ['mgr', 'rep-a'])).toBe(true);
    expect(isAllRosterSelected(['mgr'], ['mgr', 'rep-a'])).toBe(false);
  });

  it('resolves profile image URLs like the employee table', () => {
    expect(
      resolveEmployeeProfileImageUrl('https://cdn.example.com/a.jpg'),
    ).toBe('https://cdn.example.com/a.jpg');
    expect(
      resolveEmployeeProfileImageUrl(
        JSON.stringify({ url: 'https://cdn.example.com/b.jpg' }),
      ),
    ).toBe('https://cdn.example.com/b.jpg');
    expect(resolveEmployeeProfileImageUrl('not-a-url')).toBeUndefined();
  });

  it('builds subordinate picker roster without me', () => {
    const list = buildSubordinatePickerRoster(employeeData, 'mgr');
    expect(list.every((c) => c.userId !== 'mgr')).toBe(true);
    expect(list.map((c) => c.userId)).toEqual(['rep-a', 'rep-b']);
  });

  it('toggles me without clearing last remaining selection', () => {
    expect(toggleMeInSelection(['mgr'], 'mgr')).toEqual(['mgr']);
    expect(toggleMeInSelection(['mgr', 'rep-a'], 'mgr')).toEqual(['rep-a']);
    expect(toggleMeInSelection(['rep-a'], 'mgr')).toEqual(['mgr', 'rep-a']);
  });

  it('merges me with picker selection', () => {
    expect(mergeMeWithPickerSelection(true, ['rep-a'], 'mgr')).toEqual([
      'mgr',
      'rep-a',
    ]);
    expect(mergeMeWithPickerSelection(false, ['rep-a'], 'mgr')).toEqual([
      'rep-a',
    ]);
    expect(mergeMeWithPickerSelection(false, [], 'mgr')).toEqual(['mgr']);
  });

  it('maps employee profile images onto roster chips', () => {
    const roster = buildAssigneeRoster(
      {
        items: [
          {
            id: 'mgr',
            firstName: 'Manager',
            lastName: 'One',
            reportingTo: null,
            profileImage: JSON.stringify({
              url: 'https://cdn.example.com/mgr.jpg',
            }),
          },
        ],
      },
      'mgr',
    );
    expect(roster[0].avatar).toBe('https://cdn.example.com/mgr.jpg');
  });
});
