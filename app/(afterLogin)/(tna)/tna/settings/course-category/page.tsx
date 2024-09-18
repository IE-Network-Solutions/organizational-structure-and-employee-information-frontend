'use client';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import CustomButton from '@/components/common/buttons/customButton';
import { LuPlus } from 'react-icons/lu';
import { Spin } from 'antd';
import CourseCategorySidebar from './_components/categorySidebar';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';
import CourseCategoryCard from './_components/categoryCard';

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
        <CustomButton
          title="New Category"
          icon={<LuPlus size={18} />}
          type="primary"
          size="large"
          onClick={() => {
            setIsShowCourseCategorySidebar(true);
          }}
        />
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
