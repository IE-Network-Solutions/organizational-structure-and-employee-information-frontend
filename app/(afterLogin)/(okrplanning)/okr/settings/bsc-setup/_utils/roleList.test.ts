import { BscPerspective } from '@/types/bsc';
import { buildRoleList } from './roleList';

describe('buildRoleList', () => {
  it('includes roles that only have a perspective assignment', () => {
    const roles = buildRoleList([], [], [
      {
        id: 'rp-new',
        evaluationConfigId: 'config-1',
        positionId: 'pos-new',
        positionTitle: 'Product Lead',
        departmentName: 'Product',
        weights: {
          [BscPerspective.Customer]: 40,
          [BscPerspective.InternalProcess]: 30,
          [BscPerspective.LearningGrowth]: 30,
        },
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(roles).toHaveLength(1);
    expect(roles[0].key).toBe('pos-new');
    expect(roles[0].positionTitle).toBe('Product Lead');
    expect(roles[0].departmentNames).toEqual(['Product']);
    expect(roles[0].evaluationConfigId).toBe('config-1');
    expect(roles[0].kpiCount).toBe(0);
  });
});
