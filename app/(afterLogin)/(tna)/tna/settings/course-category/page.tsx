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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4 ">
        <h1 className="text-lg text-bold">Course Category</h1>
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
      </div>

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
    </div>
  );
};

export default TnaCourseCategoryPage;
