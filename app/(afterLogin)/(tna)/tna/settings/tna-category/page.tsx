'use client';
import React, { useEffect, useMemo } from 'react';
import TnaCategoryCard from './_components/categoryCard';
import TnaCategorySidebar from './_components/categorySidebar';
import TnaCategoryPageSkeleton from './_components/tnaCategoryPageSkeleton';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';
import EmptyState from '@/components/empty';

const TnaCategoryPage = () => {
  const { isShowTnaCategorySidebar, setIsShowTnaCategorySidebar } =
    useTnaSettingsStore();
  const { data, isLoading: isTnaCategoryLoading, refetch } = useGetTnaCategory(
    {},
  );

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const canCreateTnaCategory = AccessGuard.checkAccess({
    permissions: [Permissions.CreateTnaCategory],
  });

  useEffect(() => {
    if (!isShowTnaCategorySidebar) {
      refetch();
    }
  }, [isShowTnaCategorySidebar, refetch]);

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="tnaCategoryPageId"
      data-cy="tna-category-page"
    >
      {isTnaCategoryLoading ? (
        <TnaCategoryPageSkeleton />
      ) : (
        <>
          <div
            className="flex justify-between mb-4"
            id="tnaCategoryPageHeaderId"
            data-cy="tna-category-page-header"
          >
            <h1
              className="text-lg text-bold"
              id="tnaCategoryPageTitleId"
              data-cy="tna-category-page-title"
            >
              TNA Category
            </h1>
            <AccessGuard
              permissions={[Permissions.CreateTnaCategory]}
              data-cy="tna-category-page-create-guard"
              id="tnaCategoryPageCreateGuardId"
            >
              <Button
                id="tnaNewCategoryButtonId"
                data-cy="tna-new-category-button"
                icon={
                  <FaPlus
                    data-cy="tna-new-category-icon"
                    id="tnaNewCategoryIcon"
                  />
                }
                type="primary"
                size="large"
                onClick={() => {
                  setIsShowTnaCategorySidebar(true);
                }}
              >
                <span
                  className="hidden lg:inline"
                  data-cy="tna-category-page-new-button-text"
                  id="tnaCategoryPageNewButtonTextId"
                >
                  New Category
                </span>
              </Button>
            </AccessGuard>
          </div>

          {items.length === 0 ? (
            <div
              className="w-full min-h-[240px] flex items-center justify-center"
              id="tnaCategoryPageEmptyId"
              data-cy="tna-category-page-empty"
            >
              <EmptyState
                title="No TNA categories yet"
                description="Create a category to organize training needs."
                actionText={
                  canCreateTnaCategory ? 'New Category' : undefined
                }
                onAction={
                  canCreateTnaCategory
                    ? () => setIsShowTnaCategorySidebar(true)
                    : undefined
                }
              />
            </div>
          ) : (
            items.map((item) => (
              <TnaCategoryCard
                key={item.id}
                item={item}
                data-cy={`tna-category-card-${item.id}`}
              />
            ))
          )}
        </>
      )}

      <TnaCategorySidebar data-cy="tna-category-sidebar" />
    </div>
  );
};

export default TnaCategoryPage;
