'use client';

import React, { useMemo } from 'react';
import { Tag } from 'antd';
import EmptyState from '@/components/empty';
import {
  useGetBscKpiLibrary,
  useGetBscPerspectiveCatalog,
} from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import PerspectiveModal from './PerspectiveModal';
import PerspectiveKpiModal from './PerspectiveKpiModal';

export default function PerspectivesCatalog() {
  const { openCreatePerspective, openViewPerspectiveKpis } = useBscUiStore();
  const { data: catalog, isLoading } = useGetBscPerspectiveCatalog();
  const { data: kpis, isLoading: kpisLoading } = useGetBscKpiLibrary();

  const kpiCountByPerspective = useMemo(() => {
    const map = new Map<string, number>();
    for (const kpi of kpis || []) {
      const key = kpi.perspective || '';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [kpis]);

  const loading = isLoading || kpisLoading;

  return (
    <div className="w-full" data-cy="bsc-perspectives-page">
      <div
        data-cy="okr-settings-bsc-perspectives-page-tsx-page-div-19"
        className="rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
      >
        {loading ? (
          <div
            data-cy="okr-settings-bsc-perspectives-page-tsx-page-div-21"
            className="py-16 text-center text-gray-400"
          >
            Loading…
          </div>
        ) : !catalog?.length ? (
          <div
            data-cy="okr-settings-bsc-perspectives-page-tsx-page-div-23"
            className="flex min-h-[280px] items-center justify-center py-8"
          >
            <EmptyState
              title="No perspectives yet"
              description="Add a perspective and optionally attach KPIs, then assign them to roles."
              actionText="Add Perspective"
              onAction={openCreatePerspective}
            />
          </div>
        ) : (
          <div
            data-cy="okr-settings-bsc-perspectives-page-tsx-page-div-32"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {catalog.map((item) => {
              const count = kpiCountByPerspective.get(item.name) || 0;
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openViewPerspectiveKpis(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openViewPerspectiveKpis(item);
                    }
                  }}
                  className="flex min-h-[140px] flex-col rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-5 cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                  data-cy={`bsc-perspective-card-${item.id}`}
                >
                  <div
                    className="flex flex-wrap items-center gap-2"
                    data-cy="-okrplanning-okr-settings-bsc-perspectives-perspectivescatalog-div-1"
                  >
                    <p
                      data-cy="okr-settings-bsc-perspectives-page-tsx-page-p-40"
                      className="m-0 text-[15px] font-semibold text-[#262626]"
                    >
                      {item.name}
                    </p>
                    <Tag className="m-0 rounded-md border-none bg-[#EEF2FF] text-[#3730A3]">
                      {count} KPI{count === 1 ? '' : 's'}
                    </Tag>
                  </div>
                  {item.description ? (
                    <p
                      data-cy="okr-settings-bsc-perspectives-page-tsx-page-p-44"
                      className="m-0 mt-2 text-[13px] leading-5 text-[#8F94A3] line-clamp-3"
                    >
                      {item.description}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <PerspectiveModal />
      <PerspectiveKpiModal />
    </div>
  );
}
