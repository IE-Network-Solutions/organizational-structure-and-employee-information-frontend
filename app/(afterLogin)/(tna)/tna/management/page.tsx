'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Flex, Spin } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CourseCategorySidebar from './_components/courseSidebar';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';
import { useGetCoursesManagement } from '@/store/server/features/tna/management/queries';
import CourseFilter from '@/app/(afterLogin)/(tna)/tna/management/_components/courseFilter';
import { CommonObject } from '@/types/commons/commonObject';
import { useDebounce } from '@/utils/useDebounce';
import { CourseManagementRequestBody } from '@/store/server/features/tna/management/interface';
import CourseCard from '@/app/(afterLogin)/(tna)/tna/management/_components/courseCard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { localUserID } from '@/utils/constants';

const TnaManagementPage = () => {
  const { setIsShowCourseSidebar, isShowCourseSidebar, setCourseCategory } =
    useTnaManagementStore();
  const { data: categoryData, isFetching } = useGetCourseCategory({});
  const [filter, setFilter] = useState<Partial<CourseManagementRequestBody>>(
    {},
  );
  const {
    data: coursesData,
    isFetching: isFetchingCourse,
    isLoading,
    refetch,
  } = useGetCoursesManagement(filter);

  useEffect(() => {
    if (!isShowCourseSidebar) {
      refetch();
    }
  }, [isShowCourseSidebar]);

  useEffect(() => {
    if (categoryData?.items) {
      setCourseCategory(categoryData.items);
    }
  }, [categoryData]);

  const onFilterChange = useDebounce((value: CommonObject) => {
    const nFilter: Partial<CourseManagementRequestBody> = {};

    if (value.search && value.search.trim().length > 0) {
      nFilter['modifiers'] = {
        search: `%${value.search.trim()}%`,
      };
    }

    if (value.courseCategoryId) {
      nFilter['filter'] = {
        courseCategoryId: [value.courseCategoryId],
      };
    }

    setFilter(nFilter);
  }, 500);

  return (
    <div className="page-wrap bg-[#f5f5f5] mt-4 " id="tnaManagementPageId" data-cy="tna-management-page">
      <PageHeader
        title="Training & Learning"
        description="Training and Learning module"
        data-cy="tna-management-page-header"
      >
        <Flex gap={16} className="pt-4" id="tnaManagementPageHeaderActionsId" data-cy="tna-management-page-header-actions">
          <CourseFilter onChange={onFilterChange} data-cy="tna-management-filter" />
          <AccessGuard permissions={[Permissions.CreateCourse]} data-cy="tna-management-create-course-guard" id="tna-management-create-course-guard">
            <Button
              id="tnaAddCourseActionButtonId"
              data-cy="tna-add-course-action-button"
              size="large"
              type="primary"
              className="h-[50px]"
              icon={<LuPlus size={16} />}
              loading={isFetching}
              onClick={() => setIsShowCourseSidebar(true)}
            >
              <span className="hidden sm:block" data-cy="tna-management-add-course-button-text">Add Course</span>
            </Button>
          </AccessGuard>
        </Flex>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center p-5" id="tnaManagementLoadingId" data-cy="tna-management-loading">
          <Spin data-cy="tna-management-spinner-spin" />
        </div>
      ) : (
        <Spin spinning={isFetchingCourse} data-cy="tna-management-spinner-spinning">
          <div className="grid grid-cols-course-list gap-6 mt-8" id="tnaManagementCourseGridId" data-cy="tna-management-course-grid">
            {coursesData?.items?.map((item) =>
              item.isDraft ? (
                item.preparedBy === localUserID ? (
                  <CourseCard item={item} key={item.id} refetch={refetch} data-cy={`tna-management-course-card-${item.id}`} />
                ) : null
              ) : (
                <CourseCard item={item} key={item.id} refetch={refetch} data-cy={`tna-management-course-card-${item.id}`} />
              ),
            )}
          </div>
        </Spin>
      )}

      <CourseCategorySidebar data-cy="tna-management-course-category-sidebar" />
    </div>
  );
};

export default TnaManagementPage;
