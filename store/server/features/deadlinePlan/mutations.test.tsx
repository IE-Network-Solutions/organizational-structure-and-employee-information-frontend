import React from 'react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useApproveDeadlineTasks,
  useReportDeadlineTasks,
  useUnreportDeadlineTasks,
  useLockDeadlinePlans,
} from './mutations';
import { crudRequest } from '@/utils/crudRequest';
import { searchDeadlineTasks } from './queries';
import { DeadlineTask, DeadlineTaskPage } from './interface';

jest.mock('@/utils/crudRequest', () => ({ crudRequest: jest.fn() }));
jest.mock('@/utils/constants', () => ({ OKR_URL: 'https://okr.example.test' }));
jest.mock('@/components/common/notification/notificationMessage', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));
jest.mock('./queries', () => ({
  DEADLINE_TASKS_QUERY_KEY: 'deadlineTasks',
  DEADLINE_KEY_RESULTS_QUERY_KEY: 'deadlinePlanKeyResults',
  deadlinePlanHeaders: async () => ({}),
  searchDeadlineTasks: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});
const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};

const activeTask = (id: string, overrides: Partial<DeadlineTask> = {}) =>
  ({
    id,
    assigneeId: 'employee',
    parentTaskId: null,
    status: 'active',
    approvalStatus: 'open',
    isLocked: false,
    ...overrides,
  }) as DeadlineTask;
const taskPage = (
  items: DeadlineTask[],
  totalPages = 1,
  currentPage = 1,
): DeadlineTaskPage => ({
  items,
  meta: {
    totalItems: items.length * totalPages,
    itemCount: items.length,
    itemsPerPage: 100,
    totalPages,
    currentPage,
  },
});

describe('visible plan lock actions', () => {
  const filter = {
    assigneeIds: ['employee'],
    status: 'all' as const,
    from: '2026-10-14',
    to: '2026-10-31',
    includeOverdue: true,
  };

  it('locks all matching pages and excludes finished, locked, child and out-of-scope tasks', async () => {
    jest
      .mocked(searchDeadlineTasks)
      .mockResolvedValueOnce(
        taskPage(
          [
            activeTask('one'),
            activeTask('locked', { isLocked: true }),
            activeTask('reported', { status: 'reported' }),
            activeTask('closed', { approvalStatus: 'closed' }),
            activeTask('child', { parentTaskId: 'one' }),
            activeTask('other', { assigneeId: 'other' }),
          ],
          2,
        ),
      )
      .mockResolvedValueOnce(
        taskPage([activeTask('two'), activeTask('one')], 2, 2),
      );
    jest.mocked(crudRequest).mockResolvedValue({ affected: 2 });
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useLockDeadlinePlans(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ filter, isLocked: true });
    });
    expect(searchDeadlineTasks).toHaveBeenNthCalledWith(
      1,
      { ...filter, status: 'active' },
      1,
      100,
    );
    expect(searchDeadlineTasks).toHaveBeenNthCalledWith(
      2,
      { ...filter, status: 'active' },
      2,
      100,
    );
    expect(crudRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://okr.example.test/deadline-tasks/lock',
        data: { taskIds: ['one', 'two'], isLocked: true },
      }),
    );
    client.clear();
  });

  it('unlocks only locked active tasks in the selected plans', async () => {
    jest
      .mocked(searchDeadlineTasks)
      .mockResolvedValue(
        taskPage([
          activeTask('locked', { isLocked: true }),
          activeTask('open'),
          activeTask('finished', { status: 'reported', isLocked: true }),
        ]),
      );
    jest.mocked(crudRequest).mockResolvedValue({ affected: 1 });
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useLockDeadlinePlans(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ filter, isLocked: false });
    });
    expect(crudRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { taskIds: ['locked'], isLocked: false },
      }),
    );
    client.clear();
  });

  it('handles plans with more than one hundred tasks', async () => {
    const tasks = Array.from({ length: 205 }, (unused, index) =>
      activeTask(`task-${index}`),
    );
    jest
      .mocked(searchDeadlineTasks)
      .mockResolvedValueOnce(taskPage(tasks.slice(0, 100), 3))
      .mockResolvedValueOnce(taskPage(tasks.slice(100, 200), 3, 2))
      .mockResolvedValueOnce(taskPage(tasks.slice(200), 3, 3));
    jest
      .mocked(crudRequest)
      .mockImplementation(async (request: any) => ({
        affected: request.data.taskIds.length,
      }));
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useLockDeadlinePlans(), { wrapper });
    let affected = 0;
    await act(async () => {
      affected = (await result.current.mutateAsync({ filter, isLocked: true }))
        .affected;
    });
    expect(affected).toBe(205);
    expect(
      jest
        .mocked(crudRequest)
        .mock.calls.map(([request]: any) => request.data.taskIds.length),
    ).toEqual([100, 100, 5]);
    client.clear();
  });

  it('does not send an empty lock request when no tasks need changing', async () => {
    jest
      .mocked(searchDeadlineTasks)
      .mockResolvedValue(taskPage([activeTask('locked', { isLocked: true })]));
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useLockDeadlinePlans(), { wrapper });
    await act(async () => {
      expect(
        await result.current.mutateAsync({ filter, isLocked: true }),
      ).toEqual({ affected: 0 });
    });
    expect(crudRequest).not.toHaveBeenCalled();
    client.clear();
  });

  it('does not fetch or change hidden active tasks while viewing reported plans or an empty selection', async () => {
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useLockDeadlinePlans(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        filter: { ...filter, status: 'reported' },
        isLocked: true,
      });
      await result.current.mutateAsync({
        filter: { ...filter, assigneeIds: [] },
        isLocked: true,
      });
    });
    expect(searchDeadlineTasks).not.toHaveBeenCalled();
    expect(crudRequest).not.toHaveBeenCalled();
    client.clear();
  });
});
describe('Deadline report refresh', () => {
  it('submits manager feedback with the approval and refreshes tasks', async () => {
    jest.mocked(crudRequest).mockResolvedValue({ affected: 2 });
    const { client, wrapper } = setup();
    const invalidations = jest.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useApproveDeadlineTasks(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        taskIds: ['one', 'two'],
        comment: 'Good work',
      });
    });
    expect(crudRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'patch',
        data: { taskIds: ['one', 'two'], comment: 'Good work' },
        url: 'https://okr.example.test/deadline-tasks/approve',
      }),
    );
    expect(invalidations).toHaveBeenCalledWith('deadlineTasks');
    client.clear();
  });
  it('refreshes shared OKR, plan/report, dashboard and VP views after reporting', async () => {
    jest.useFakeTimers();
    jest.mocked(crudRequest).mockResolvedValue([]);
    const { client, wrapper } = setup();
    const invalidations = jest.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useReportDeadlineTasks(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync([
        { taskId: 'task', outcome: 'done', actualValue: 70 },
      ]);
    });
    const keys = invalidations.mock.calls.map(([key]) =>
      Array.isArray(key) ? key[0] : key,
    );
    for (const key of [
      'deadlineTasks',
      'deadlinePlanKeyResults',
      'ObjectiveInformation',
      'fetchObjectives',
      'okrPlansKrPanel',
      'okrReportsKrPanel',
      'ObjectiveDashboard',
      'VPScores',
    ])
      expect(keys).toContain(key);
    const before = invalidations.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(invalidations.mock.calls.length).toBeGreaterThan(before);
    client.clear();
  });

  it('updates parent and subtask tags from the undo response before the next fetch', async () => {
    const { client, wrapper } = setup();
    const parent = {
      id: 'parent',
      status: 'reported',
      subTasks: [{ id: 'child', status: 'reported', outcome: 'done' }],
    };
    const reset = {
      ...parent,
      status: 'active',
      subTasks: [{ id: 'child', status: 'active', outcome: null }],
    };
    const key = ['deadlineTasks', { assigneeIds: ['me'] }, 20];
    client.setQueryData(key, {
      pages: [{ items: [parent, { id: 'other', status: 'reported' }] }],
      pageParams: [1],
    });
    jest.mocked(crudRequest).mockResolvedValue([reset]);
    const { result } = renderHook(() => useUnreportDeadlineTasks(), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync(['parent']);
    });
    expect((client.getQueryData(key) as any).pages[0].items).toEqual([
      reset,
      { id: 'other', status: 'reported' },
    ]);
    client.clear();
  });
});
