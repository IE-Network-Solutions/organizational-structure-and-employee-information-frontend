jest.mock(
  '@/store/uistate/features/authentication',
  () => ({
    useAuthenticationStore: {
      getState: jest.fn(() => ({ userData: {} })),
    },
  }),
  { virtual: true },
);

jest.mock('@/utils/permissionGuard', () => ({
  __esModule: true,
  default: { checkAccess: jest.fn(() => false) },
}));

jest.mock(
  '@/types/commons/permissionEnum',
  () => ({
    Permissions: {
      ViewSuccessionPlanning: 'view-succession-planning',
      SubmitSuccessionEvaluation: 'submit-succession-evaluation',
    },
  }),
  { virtual: true },
);

import {
  findMostSpecificMatchingRoute,
  getRoutesWithPermissions,
  isRouteMatch,
  type RouteWithPermissions,
} from '@/utils/routePermissions';
import { Permissions } from '@/types/commons/permissionEnum';

describe('route permission matching', () => {
  const routes = getRoutesWithPermissions();

  it.each([
    '/employees/succession-planning',
    '/employees/succession-planning/critical-role-id',
    '/employees/succession-planning/evaluate/role-id/successor-id',
  ])('selects the succession policy for %s', (pathname) => {
    expect(findMostSpecificMatchingRoute(routes, pathname)).toEqual({
      route: '/employees/succession-planning',
      permissions: [
        Permissions.ViewSuccessionPlanning,
        Permissions.SubmitSuccessionEvaluation,
      ],
      requireAny: true,
    });
  });

  it('keeps the employees parent policy for other employee paths', () => {
    expect(findMostSpecificMatchingRoute(routes, '/employees')).toEqual({
      route: '/employees',
      permissions: ['view_employees'],
    });
  });

  it('prefers a matching dynamic route over its static parent', () => {
    const dynamicRoutes: RouteWithPermissions[] = [
      { route: '/employees/manage-employees', permissions: ['parent'] },
      { route: '/employees/manage-employees/[id]', permissions: ['detail'] },
    ];
    const employeeId = '123e4567-e89b-12d3-a456-426614174000';

    expect(
      findMostSpecificMatchingRoute(
        dynamicRoutes,
        `/employees/manage-employees/${employeeId}/job-information`,
      ),
    ).toEqual(dynamicRoutes[1]);
    expect(
      isRouteMatch(
        '/employees/manage-employees/[id]',
        `/employees/manage-employees/${employeeId}/job-information`,
      ),
    ).toBe(true);
  });
});
