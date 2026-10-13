import React from 'react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useReportDeadlineTasks, useUnreportDeadlineTasks } from './mutations';
import { crudRequest } from '@/utils/crudRequest';

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
describe('Deadline report refresh', () => {
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
