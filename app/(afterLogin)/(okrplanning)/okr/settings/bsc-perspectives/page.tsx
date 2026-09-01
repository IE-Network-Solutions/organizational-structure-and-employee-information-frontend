'use client';

import React from 'react';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import EmptyState from '@/components/empty';
import { useGetBscPerspectiveCatalog } from '@/store/server/features/bsc/queries';
import { useDeleteBscPerspective } from '@/store/server/features/bsc/mutation';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import PerspectiveModal from './_components/PerspectiveModal';

export default function BscPerspectivesPage() {
  const { openCreatePerspective, openEditPerspective } = useBscUiStore();
  const { data: catalog, isLoading } = useGetBscPerspectiveCatalog();
  const deletePerspective = useDeleteBscPerspective();

  return (
    <div className="w-full" data-cy="bsc-perspectives-page">
      <div className="rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">Loading…</div>
        ) : !catalog?.length ? (
          <div className="flex min-h-[280px] items-center justify-center py-8">
            <EmptyState
              title="No perspectives yet"
              description="Add perspectives here, then assign them to roles on Perspective Assignment."
              actionText="Add Perspective"
              onAction={openCreatePerspective}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-[12px] bg-[#F9FAFB] p-5"
                data-cy={`bsc-perspective-card-${item.id}`}
              >
                <div className="min-w-0">
                  <p className="m-0 text-[15px] font-semibold text-[#262626]">
                    {item.name}
                  </p>
                  {item.description ? (
                    <p className="m-0 mt-1 text-[13px] text-[#8F94A3]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditPerspective(item)}
                    data-cy={`bsc-perspective-edit-${item.id}`}
                  />
                  {!item.isSystem && (
                    <Popconfirm
                      title="Delete this perspective?"
                      okText="Delete"
                      onConfirm={() => deletePerspective.mutate(item.id)}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        data-cy={`bsc-perspective-delete-${item.id}`}
                      />
                    </Popconfirm>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <PerspectiveModal />
    </div>
  );
}
