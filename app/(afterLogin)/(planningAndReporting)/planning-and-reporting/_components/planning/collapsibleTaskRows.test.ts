import { buildHierarchicalTaskRows } from './collapsibleTaskRows';

describe('buildHierarchicalTaskRows', () => {
  const flat = [
    { id: 'week-1', parentId: null },
    { id: 'daily-1', parentId: 'week-1' },
    { id: 'daily-2', parentId: 'week-1' },
  ];

  it('keeps daily view flat', () => {
    const rows = buildHierarchicalTaskRows(flat, 'daily');
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.treeDepth === 0)).toBe(true);
  });

  it('nests subtasks under parents for week view', () => {
    const rows = buildHierarchicalTaskRows(flat, 'week');
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('week-1');
    expect(rows[0].children).toHaveLength(2);
    expect(rows[0].children?.[0].treeDepth).toBe(1);
  });
});
