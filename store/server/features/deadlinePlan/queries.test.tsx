import React from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import {
  DeadlineTask,
  DeadlineTaskPage,
  DeadlineTaskSearchFilter,
} from './interface';
import { DEADLINE_TASKS_QUERY_KEY, useDeadlinePlanLockState } from './queries';

jest.mock('@/utils/crudRequest', () => ({ crudRequest: jest.fn() }));
jest.mock('@/utils/constants', () => ({ OKR_URL: 'https://okr.example.test' }));
jest.mock('@/utils/getCurrentToken', () => ({
  getCurrentToken: async () => 'token',
}));
jest.mock('@/store/uistate/features/authentication', () => ({
  useAuthenticationStore: { getState: () => ({ tenantId: 'tenant' }) },
}));

const filter = {
  assigneeIds: ['employee'],
  from: '2026-10-14',
  to: '2026-10-31',
  includeOverdue: true,
  status: 'all' as const,
};
const task = (id: string, overrides: Partial<DeadlineTask> = {}) =>
  ({
    id,
    assigneeId: 'employee',
    parentTaskId: null,
    status: 'active',
    approvalStatus: 'open',
    isLocked: true,
    ...overrides,
  }) as DeadlineTask;
const page = (items: DeadlineTask[], totalPages = 1): DeadlineTaskPage => ({
  items,
  meta: {
    totalItems: items.length * totalPages,
    itemCount: items.length,
    itemsPerPage: 100,
    totalPages,
    currentPage: 1,
  },
});
let client: QueryClient;
beforeEach(() => {
  jest.mocked(crudRequest).mockReset();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => client.clear());
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('selected plan lock state', () => {
  it('shows locked only after checking every page of eligible active parents', async () => {
    jest
      .mocked(crudRequest)
      .mockResolvedValueOnce(
        page(
          [
            task('locked'),
            task('child', { parentTaskId: 'locked', isLocked: false }),
            task('other', { assigneeId: 'other', isLocked: false }),
            task('reported', { status: 'reported', isLocked: false }),
            task('closed', { approvalStatus: 'closed', isLocked: false }),
          ],
          2,
        ),
      )
      .mockResolvedValueOnce(page([task('last')], 2));
    const { result } = renderHook(() => useDeadlinePlanLockState(filter), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBe('locked'));
    expect(crudRequest).toHaveBeenCalledTimes(2);
    expect(crudRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: 'https://okr.example.test/deadline-tasks/search?page=2&limit=100',
        data: { ...filter, status: 'active' },
      }),
    );
  });

  it('keeps the Lock action available when a later page contains an unlocked task', async () => {
    jest
      .mocked(crudRequest)
      .mockResolvedValueOnce(page([task('locked')], 2))
      .mockResolvedValueOnce(page([task('unlocked', { isLocked: false })], 2));
    const { result } = renderHook(() => useDeadlinePlanLockState(filter), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBe('unlocked'));
    expect(crudRequest).toHaveBeenCalledTimes(2);
  });

  it('does not treat a selection without active parents as locked', async () => {
    jest.mocked(crudRequest).mockResolvedValue(page([]));
    const { result } = renderHook(() => useDeadlinePlanLockState(filter), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBe('empty'));
  });

  it('updates the action state when task changes invalidate the shared task cache', async () => {
    jest
      .mocked(crudRequest)
      .mockResolvedValue(page([task('one', { isLocked: false })]));
    const { result } = renderHook(() => useDeadlinePlanLockState(filter), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBe('unlocked'));
    jest.mocked(crudRequest).mockResolvedValue(page([task('one')]));
    await act(async () => {
      await client.invalidateQueries(DEADLINE_TASKS_QUERY_KEY);
    });
    await waitFor(() => expect(result.current.data).toBe('locked'));
  });

  it('does not query active plan locks in the reported view or without managed assignees', async () => {
    const { rerender } = renderHook(
      ({ searchFilter }) => useDeadlinePlanLockState(searchFilter),
      {
        wrapper,
        initialProps: {
          searchFilter: {
            ...filter,
            status: 'reported',
          } as DeadlineTaskSearchFilter,
        },
      },
    );
    rerender({ searchFilter: { ...filter, assigneeIds: [] } });
    expect(crudRequest).not.toHaveBeenCalled();
  });
});
