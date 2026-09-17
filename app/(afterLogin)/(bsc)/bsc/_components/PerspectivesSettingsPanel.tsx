'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Modal, Spin, Table, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import EmptyState from '@/components/empty';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useIsMobile } from '@/hooks/useIsMobile';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import PerspectiveModal from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-perspectives/_components/PerspectiveModal';
import { useDeleteBscPerspective } from '@/store/server/features/bsc/mutation';
import { useGetBscPerspectiveCatalog } from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { BscPerspectiveDefinition } from '@/types/bsc';
import { TableColumnsType } from '@/types/table/table';

const tableHeaderClassName = 'text-[#4d4d4d] text-base font-bold';
const tableCellClassName = 'text-[#4d4d4d] text-sm font-normal';
const systemTagClassName =
  'm-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';

export default function PerspectivesSettingsPanel() {
  const { openCreatePerspective, openEditPerspective } = useBscUiStore();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isMobile, isTablet } = useIsMobile();
  const { data: catalog, isLoading } = useGetBscPerspectiveCatalog();
  const deletePerspective = useDeleteBscPerspective();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...(catalog || [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    if (!q) return list;
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q),
    );
  }, [catalog, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, catalog?.length]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  const confirmDeletePerspective = useCallback(
    (row: BscPerspectiveDefinition) => {
      Modal.confirm({
        title: 'Delete this perspective?',
        content: `"${row.name}" will be removed. KPIs using it will keep the tag.`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => deletePerspective.mutateAsync(row.id),
      });
    },
    [deletePerspective],
  );

  const perspectiveMenuItems = useCallback(
    (row: BscPerspectiveDefinition): MenuProps['items'] => {
      const items: MenuProps['items'] = [
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => openEditPerspective(row),
        },
      ];
      if (!row.isSystem) {
        items.push(
          { type: 'divider' },
          {
            key: 'delete',
            label: 'Delete',
            danger: true,
            onClick: () => confirmDeletePerspective(row),
          },
        );
      }
      return items;
    },
    [confirmDeletePerspective, openEditPerspective],
  );

  const columns: TableColumnsType<BscPerspectiveDefinition> = [
    {
      title: (
        <span
          data-cy="perspectivessettingspanel-span-97"
          className={tableHeaderClassName}
        >
          Perspective
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <div
          data-cy="perspectivessettingspanel-div-101"
          className="flex flex-col gap-1"
        >
          <div
            data-cy="perspectivessettingspanel-div-102"
            className="flex flex-wrap items-center gap-2"
          >
            <span
              data-cy="perspectivessettingspanel-span-103"
              className={tableCellClassName}
            >
              {name}
            </span>
            {row.isSystem ? (
              <Tag className={systemTagClassName}>System</Tag>
            ) : null}
          </div>
          {row.description ? (
            <span
              data-cy="perspectivessettingspanel-span-109"
              className="text-[12px] text-[#8F94A3]"
            >
              {row.description}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'menu',
      width: 48,
      fixed: 'right',
      align: 'center',
      render: (unused, row) => (
        <Dropdown
          menu={{ items: perspectiveMenuItems(row) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined className="text-lg" />}
            className="text-[#595959]"
            onClick={(e) => e.stopPropagation()}
            data-cy={`bsc-settings-perspective-menu-${row.id}`}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="w-full" data-cy="bsc-perspectives-settings">
      <div data-cy="perspectivessettingspanel-div-142" className="mb-4">
        <BscSearchInput
          placeholder="Search perspectives"
          value={search}
          onChange={setSearch}
          data-cy="bsc-settings-perspective-search"
        />
      </div>

      <Spin spinning={isLoading}>
        {isLoading ? (
          <TableSkeleton columns={columns} />
        ) : !catalog?.length ? (
          <div
            data-cy="perspectivessettingspanel-div-155"
            className="flex min-h-[240px] items-center justify-center py-8"
          >
            <EmptyState
              title="No perspectives yet"
              description="Add perspectives such as Customer, Internal Process, and Learning & Growth."
              actionText="Add perspective"
              onAction={openCreatePerspective}
            />
          </div>
        ) : !filtered.length ? (
          <div
            data-cy="perspectivessettingspanel-div-164"
            className="py-12 text-center text-gray-400"
          >
            No perspectives match your search
          </div>
        ) : (
          <>
            <div
              data-cy="perspectivessettingspanel-div-169"
              className="flex w-full overflow-x-auto scrollbar-none"
            >
              <Table
                className="w-full [&_.ant-table]:!border-[#D9D9D9]"
                columns={columns}
                dataSource={paginated}
                pagination={false}
                rowKey="id"
                scroll={{ x: 480 }}
                data-cy="bsc-settings-perspective-table"
              />
            </div>
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={filtered.length}
                pageSize={pageSize}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                onShowSizeChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                data-cy="bsc-settings-perspective-mobile-pagination"
              />
            ) : (
              <CustomPagination
                current={currentPage}
                total={filtered.length}
                pageSize={pageSize}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                onShowSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                data-cy="bsc-settings-perspective-pagination"
              />
            )}
          </>
        )}
      </Spin>
      <PerspectiveModal perspectivesOnly />
    </div>
  );
}
