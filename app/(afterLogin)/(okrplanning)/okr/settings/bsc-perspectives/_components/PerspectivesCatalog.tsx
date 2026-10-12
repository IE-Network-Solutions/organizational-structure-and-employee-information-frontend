'use client';

import React, { useMemo, useState } from 'react';
import { Tag } from 'antd';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import {
  useGetBscKpiLibrary,
  useGetBscPerspectiveCatalog,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  computePerspectiveRollup,
  formatScore,
  latestScorecardsByEmployee,
} from '@/utils/bsc/rollup';
import PerspectiveModal from './PerspectiveModal';
import PerspectiveKpiModal from './PerspectiveKpiModal';

export default function PerspectivesCatalog() {
  const router = useRouter();
  const { openCreatePerspective } = useBscUiStore();
  const [search, setSearch] = useState('');
  const { data: catalog, isLoading } = useGetBscPerspectiveCatalog();
  const { data: kpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: scorecards } = useGetBscScorecards();

  const latest = useMemo(
    () => latestScorecardsByEmployee(scorecards),
    [scorecards],
  );

  const kpiCountByPerspective = useMemo(() => {
    const map = new Map<string, number>();
    for (const kpi of kpis || []) {
      const key = kpi.perspective || '';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [kpis]);

  const avgByPerspective = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of catalog || []) {
      map.set(
        item.name,
        computePerspectiveRollup(latest, item.name).averageScore,
      );
    }
    return map;
  }, [catalog, latest]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog || [];
    return (catalog || []).filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q),
    );
  }, [catalog, search]);

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
          <>
            <div
              className="flex justify-between gap-4 mb-4"
              data-cy="bsc-perspectives-toolbar"
            >
              <BscSearchInput
                placeholder="Search perspectives"
                value={search}
                onChange={setSearch}
                data-cy="bsc-perspectives-search"
              />
            </div>
            {!filteredCatalog.length ? (
              <div
                className="py-12 text-center text-gray-400"
                data-cy="bsc-perspectives-search-empty"
              >
                No perspectives match your search
              </div>
            ) : (
              <div
                data-cy="okr-settings-bsc-perspectives-page-tsx-page-div-32"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredCatalog.map((item) => {
                  const count = kpiCountByPerspective.get(item.name) || 0;
                  const avg = avgByPerspective.get(item.name) || 0;
                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        router.push(
                          `/bsc/perspectives/${encodeURIComponent(item.id)}`,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(
                            `/bsc/perspectives/${encodeURIComponent(item.id)}`,
                          );
                        }
                      }}
                      className="flex min-h-[96px] flex-col rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                      data-cy={`bsc-perspective-card-${item.id}`}
                    >
                      <div
                        className="flex flex-wrap items-center gap-2"
                        data-cy="-okrplanning-okr-settings-bsc-perspectives-perspectivescatalog-div-1"
                      >
                        <p
                          data-cy="okr-settings-bsc-perspectives-page-tsx-page-p-40"
                          className="m-0 text-[13px] font-semibold text-[#262626]"
                        >
                          {item.name}
                        </p>
                        <Tag className="m-0 h-5 rounded border-none bg-[#EEF2FF] px-1.5 text-[11px] font-normal leading-5 text-[#3730A3]">
                          {count} KPI{count === 1 ? '' : 's'}
                        </Tag>
                        <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                          {formatScore(avg)}%
                        </Tag>
                      </div>
                      {item.description ? (
                        <p
                          data-cy="okr-settings-bsc-perspectives-page-tsx-page-p-44"
                          className="m-0 mt-1.5 text-[12px] leading-4 text-[#8F94A3] line-clamp-2"
                        >
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <PerspectiveModal />
      <PerspectiveKpiModal />
    </div>
  );
}
