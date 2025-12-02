'use client';
import React, { useEffect } from 'react';
import TnaCategoryCard from './_components/categoryCard';
import TnaCategorySidebar from './_components/categorySidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import { Button, Spin } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const TnaCategoryPage = () => {
  const { isShowTnaCategorySidebar, setIsShowTnaCategorySidebar } =
    useTnaSettingsStore();
  const { data, isFetching, refetch } = useGetTnaCategory({});

  useEffect(() => {
    if (!isShowTnaCategorySidebar) {
      refetch();
    }
  }, [isShowTnaCategorySidebar]);

  return (
    <div className="p-5 rounded-2xl bg-white h-full" id="tnaCategoryPageId" data-cy="tna-category-page">
      <div className="flex justify-between mb-4" id="tnaCategoryPageHeaderId" data-cy="tna-category-page-header">
        <h1 className="text-lg text-bold" id="tnaCategoryPageTitleId" data-cy="tna-category-page-title">TNA Category</h1>
        <AccessGuard permissions={[Permissions.CreateTnaCategory]} data-cy="tna-category-page-create-guard" id="tnaCategoryPageCreateGuardId">
          <Button
            id="tnaNewCategoryButtonId"
            data-cy="tna-new-category-button"
            icon={<FaPlus data-cy="tna-new-category-icon" id="tnaNewCategoryIcon" />}
            type="primary"
            size="large"
            onClick={() => {
              setIsShowTnaCategorySidebar(true);
            }}
          >
            <span className="hidden lg:inline" data-cy="tna-category-page-new-button-text" id="tnaCategoryPageNewButtonTextId">New Category</span>
          </Button>
        </AccessGuard>
      </div>

      <Spin spinning={isFetching} data-cy="tna-category-page-spinner">
        {data?.items ? (
          data.items.map((item) => (
            <TnaCategoryCard key={item.id} item={item} data-cy={`tna-category-card-${item.id}`} />
          ))
        ) : (
          <div className="p-5" id="tnaCategoryPageEmptyId" data-cy="tna-category-page-empty"></div>
        )}
      </Spin>

      <TnaCategorySidebar data-cy="tna-category-sidebar" />
    </div>
  );
};

export default TnaCategoryPage;
