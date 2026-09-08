'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, Modal, Spin, Table, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import EmptyState from '@/components/empty';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useIsMobile } from '@/hooks/useIsMobile';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import { useDeleteBscKpi } from '@/store/server/features/bsc/mutation';
import {
  useGetBscKpiLibrary,
  useGetBscPerspectiveCatalog,
} from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { KpiLibraryItem, TargetLogic } from '@/types/bsc';
import { TableColumnsType } from '@/types/table/table';
import { cadenceLabel, checkInDayLabel } from '@/utils/bsc/checkInSchedule';
import { measurementUnitLabel } from '@/utils/bsc/measurementUnit';
import { unitTagClassName } from '@/app/(afterLogin)/(bsc)/bsc/_components/TargetValueCell';
import {
  bscTableCellClassName as tableCellClassName,
  bscTableClassName as tableClassName,
  bscTableHeaderClassName as tableHeaderClassName,
  bscTableRowClassName,
} from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import KpiCatalogFormModal from './KpiCatalogFormModal';

const blueTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';
const unknownPerspectiveTagClassName =
  'm-0 h-5 rounded border border-[#FFD591] bg-[#FFF7E6] px-1.5 text-[11px] font-normal leading-5 text-[#D46B08]';

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

export default function KpiCatalog() {
  const { openCatalogKpiForm } = useBscUiStore();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isMobile, isTablet } = useIsMobile();
  const { data: kpis, isLoading } = useGetBscKpiLibrary();
  const { data: catalog } = useGetBscPerspectiveCatalog();
  const deleteKpi = useDeleteBscKpi();

  const catalogNames = useMemo(
    () => new Set((catalog || []).map((p) => p.name.toLowerCase())),
    [catalog],
  );

  const filteredKpis = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...(kpis || [])].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (kpi) =>
        kpi.name.toLowerCase().includes(q) ||
        kpi.perspective.toLowerCase().includes(q) ||
        (kpi.description || '').toLowerCase().includes(q) ||
        (kpi.measurementUnit || '').toLowerCase().includes(q),
    );
  }, [kpis, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, kpis?.length]);

  const paginatedKpis = useMemo(
    () =>
      filteredKpis.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredKpis, currentPage, pageSize],
  );

  const hasPerspectives = (catalog || []).length > 0;

  const confirmDeleteKpi = useCallback(
    (row: KpiLibraryItem) => {
      Modal.confirm({
        title: 'Delete this KPI?',
        content: `"${row.name}" will be removed from the catalog.`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => deleteKpi.mutateAsync(row.id),
      });
    },
    [deleteKpi],
  );

  const kpiMenuItems = useCallback(
    (row: KpiLibraryItem): MenuProps['items'] => [
      {
        key: 'edit',
        label: 'Edit',
        onClick: () => openCatalogKpiForm(row),
      },
      {
        key: 'delete',
        label: 'Delete',
        danger: true,
        onClick: () => confirmDeleteKpi(row),
      },
    ],
    [confirmDeleteKpi, openCatalogKpiForm],
  );

  const columns: TableColumnsType<KpiLibraryItem> = [
    {
      title: (
        <span data-cy="kpicatalog-span-113" className={tableHeaderClassName}>
          KPI
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <div data-cy="kpicatalog-div-117" className="flex flex-col gap-1">
          <span data-cy="kpicatalog-span-118" className={tableCellClassName}>
            {name}
          </span>
          {row.description ? (
            <span
              data-cy="kpicatalog-span-120"
              className="text-[12px] text-[#8F94A3]"
            >
              {row.description}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: (
        <span data-cy="kpicatalog-span-128" className={tableHeaderClassName}>
          Perspective
        </span>
      ),
      dataIndex: 'perspective',
      key: 'perspective',
      width: 160,
      render: (perspective: string) =>
        perspective ? (
          <Tag
            className={
              catalogNames.has(perspective.toLowerCase())
                ? blueTagClassName
                : unknownPerspectiveTagClassName
            }
          >
            {perspective}
          </Tag>
        ) : (
          <span data-cy="kpicatalog-span-144" className={tableCellClassName}>
            —
          </span>
        ),
    },
    {
      title: (
        <span data-cy="kpicatalog-span-148" className={tableHeaderClassName}>
          Unit
        </span>
      ),
      dataIndex: 'measurementUnit',
      key: 'measurementUnit',
      width: 120,
      render: (unit: string) => {
        const label = measurementUnitLabel(unit);
        return label ? (
          <Tag className={unitTagClassName}>{label}</Tag>
        ) : (
          <span data-cy="kpicatalog-span-157" className={tableCellClassName}>
            —
          </span>
        );
      },
    },
    {
      title: (
        <span data-cy="kpicatalog-span-162" className={tableHeaderClassName}>
          Target logic
        </span>
      ),
      dataIndex: 'targetLogic',
      key: 'targetLogic',
      width: 150,
      render: (logic: TargetLogic) => (
        <span data-cy="kpicatalog-span-167" className={tableCellClassName}>
          {targetLogicLabel(logic)}
        </span>
      ),
    },
    {
      title: (
        <span data-cy="kpicatalog-span-171" className={tableHeaderClassName}>
          Default target
        </span>
      ),
      key: 'defaultTarget',
      width: 160,
      render: (unused, row) => (
        <span data-cy="kpicatalog-span-175" className={tableCellClassName}>
          {row.defaultTarget != null ? row.defaultTarget : '—'}
        </span>
      ),
    },
    {
      title: (
        <span data-cy="kpicatalog-span-181" className={tableHeaderClassName}>
          Check-in
        </span>
      ),
      key: 'checkIn',
      width: 160,
      render: (unused, row) => {
        const cadence = cadenceLabel(row.cadence);
        const day = checkInDayLabel(row.cadence, row.checkInDay);
        if (!cadence) {
          return (
            <span data-cy="kpicatalog-span-188" className={tableCellClassName}>
              —
            </span>
          );
        }
        return (
          <span data-cy="kpicatalog-span-191" className={tableCellClassName}>
            {cadence}
            {day ? ` · ${day}` : ''}
          </span>
        );
      },
    },
    {
      key: 'menu',
      width: 48,
      fixed: 'right',
      align: 'center',
      render: (unused, row) => (
        <Dropdown
          menu={{ items: kpiMenuItems(row) }}
          trigger={['click']}
          placement="bottomRight"
          overlayClassName="okr-actions-dropdown"
        >
          <button
            type="button"
            aria-label="KPI actions"
            className="flex h-8 w-8 items-center justify-center border-none bg-transparent text-[#8c8c8c] transition-colors hover:text-[#262626] cursor-pointer"
            onClick={(e) => e.stopPropagation()}
            data-cy={`bsc-kpi-catalog-menu-${row.id}`}
          >
            <EllipsisOutlined style={{ fontSize: 14 }} />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="w-full" data-cy="bsc-kpi-catalog-page">
      {!hasPerspectives && !isLoading ? (
        <div
          data-cy="kpicatalog-div-225"
          className="flex min-h-[240px] items-center justify-center py-8"
        >
          <EmptyState
            title="No perspectives defined"
            description="Add perspectives under BSC → Settings, then create KPIs here."
          />
        </div>
      ) : (
        <>
          <div data-cy="kpicatalog-div-233" className="mb-4">
            <BscSearchInput
              placeholder="Search KPIs"
              value={search}
              onChange={setSearch}
              data-cy="bsc-kpi-catalog-search"
            />
          </div>

          <Spin spinning={isLoading}>
            {isLoading ? (
              <TableSkeleton columns={columns} />
            ) : !kpis?.length ? (
              <div
                data-cy="kpicatalog-div-246"
                className="flex min-h-[240px] items-center justify-center py-8"
              >
                <EmptyState
                  title="No KPIs yet"
                  description="Add KPIs from the catalog and tag each one with a perspective."
                  actionText="Add KPI"
                  onAction={() => openCatalogKpiForm()}
                />
              </div>
            ) : !filteredKpis.length ? (
              <div
                data-cy="kpicatalog-div-255"
                className="py-12 text-center text-gray-400"
              >
                No KPIs match your search
              </div>
            ) : (
              <>
                <div
                  data-cy="kpicatalog-div-260"
                  className="flex w-full overflow-x-auto scrollbar-none"
                >
                  <Table
                    className={tableClassName}
                    columns={columns}
                    dataSource={paginatedKpis}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 1020 }}
                    rowClassName={(unused, index) =>
                      bscTableRowClassName(index)
                    }
                    data-cy="bsc-kpi-catalog-table"
                  />
                </div>
                {isMobile || isTablet ? (
                  <CustomMobilePagination
                    totalResults={filteredKpis.length}
                    pageSize={pageSize}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                    onShowSizeChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                    data-cy="bsc-kpi-catalog-mobile-pagination"
                  />
                ) : (
                  <CustomPagination
                    current={currentPage}
                    total={filteredKpis.length}
                    pageSize={pageSize}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                    onShowSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    data-cy="bsc-kpi-catalog-pagination"
                  />
                )}
              </>
            )}
          </Spin>
        </>
      )}
      <KpiCatalogFormModal />
    </div>
  );
}
