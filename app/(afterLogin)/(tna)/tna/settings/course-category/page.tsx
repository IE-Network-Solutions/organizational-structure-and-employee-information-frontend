'use client';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import React, { useEffect } from 'react';
import { Button, Spin } from 'antd';
import CourseCategorySidebar from './_components/categorySidebar';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';
import CourseCategoryCard from './_components/categoryCard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const TnaCourseCategoryPage = () => {
  const { isShowCourseCategorySidebar, setIsShowCourseCategorySidebar } =
    useTnaSettingsStore();
  const { data, isFetching, refetch } = useGetCourseCategory({});

  useEffect(() => {
    if (!isShowCourseCategorySidebar) {
      refetch();
    }
  }, [isShowCourseCategorySidebar]);

  return (
    <div className="p-5 rounded-2xl bg-white h-full" id="tnaCourseCategoryPageId" data-cy="tna-course-category-page">
      <div className="flex justify-between mb-4 " id="tnaCourseCategoryPageHeaderId" data-cy="tna-course-category-page-header">
        <h1 className="text-lg text-bold" id="tnaCourseCategoryPageTitleId" data-cy="tna-course-category-page-title">Course Category</h1>
        <AccessGuard permissions={[Permissions.CreateCourseCategory]} data-cy="tna-course-category-page-create-guard" id="tnaCourseCategoryPageCreateGuardId">
          <Button
            icon={<FaPlus />}
            type="primary"
            size="large"
            id="tnaCourseCategoryPageNewButtonId"
            data-cy="tna-course-category-page-new-button"
            onClick={() => {
              setIsShowCourseCategorySidebar(true);
            }}
          >
            <span className="hidden lg:inline" data-cy="tna-course-category-page-new-button-text" id="tnaCourseCategoryPageNewButtonTextId">New Category</span>
          </Button>
        </AccessGuard>
      </div>

      <Spin spinning={isFetching} data-cy="tna-course-category-page-spinner">
        {data?.items ? (
          data.items.map((item) => (
            <CourseCategoryCard key={item.id} item={item} data-cy={`tna-course-category-card-${item.id}`} />
          ))
        ) : (
          <div className="p-5" id="tnaCourseCategoryPageEmptyId" data-cy="tna-course-category-page-empty"></div>
        )}
      </Spin>

      <CourseCategorySidebar data-cy="tna-course-category-page-sidebar" />
    </div>
  );
};

export default TnaCourseCategoryPage;
