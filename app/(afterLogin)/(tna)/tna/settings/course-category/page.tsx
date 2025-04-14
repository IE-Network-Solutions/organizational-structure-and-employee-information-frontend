'use client';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
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
    <>
      <PageHeader title="Course Category" size="small">
        <AccessGuard permissions={[Permissions.CreateCourseCategory]}>
          <Button
            icon={<FaPlus />}
            type="primary"
            size="large"
            onClick={() => {
              setIsShowCourseCategorySidebar(true);
            }}
          >
            <span className="hidden lg:inline">New Category</span>
          </Button>
        </AccessGuard>
      </PageHeader>

      <Spin spinning={isFetching}>
        {data?.items ? (
          data.items.map((item) => (
            <CourseCategoryCard key={item.id} item={item} />
          ))
        ) : (
          <div className="p-5"></div>
        )}
      </Spin>

      <CourseCategorySidebar />
    </>
  );
};

export default TnaCourseCategoryPage;
