'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Flex, Spin } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CourseCategorySidebar from './_components/courseSidebar';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';
import {
  useGetCoursesManagement,
  useGetMyCourses,
} from '@/store/server/features/tna/management/queries';
import CourseFilter from '@/app/(afterLogin)/(tna)/tna/management/_components/courseFilter';
import { CommonObject } from '@/types/commons/commonObject';
import { useDebounce } from '@/utils/useDebounce';
import { CourseManagementRequestBody } from '@/store/server/features/tna/management/interface';
import CourseCard from '@/app/(afterLogin)/(tna)/tna/management/_components/courseCard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { localUserID } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const TnaManagementPage = () => {
  const { setIsShowCourseSidebar, isShowCourseSidebar, setCourseCategory } =
    useTnaManagementStore();
  const { userId } = useAuthenticationStore();
  const { data: categoryData, isFetching } = useGetCourseCategory({});
  const [filter, setFilter] = useState<Partial<CourseManagementRequestBody>>(
    {},
  );

  // Check if user has ViewAllCourse permission
  const hasViewAllCoursePermission = AccessGuard.checkAccess({
    permissions: [Permissions.ViewAllCourse],
  });

  // Fetch all courses for users with ViewAllCourse permission
  const {
    data: allCoursesData,
    isFetching: isFetchingAllCourses,
    isLoading: isLoadingAllCourses,
    refetch: refetchAllCourses,
  } = useGetCoursesManagement(filter, true, hasViewAllCoursePermission);

  // Fetch only assigned courses for users without ViewAllCourse permission
  const {
    data: myCoursesData,
    isFetching: isFetchingMyCourses,
    isLoading: isLoadingMyCourses,
    refetch: refetchMyCourses,
  } = useGetMyCourses(userId ?? '', !hasViewAllCoursePermission);

  // Use the appropriate data based on permission
  // Note: /learning/course returns {items: [...]} but /my-courses returns [...] directly
  const isFetchingCourse = hasViewAllCoursePermission ? isFetchingAllCourses : isFetchingMyCourses;
  const isLoading = hasViewAllCoursePermission ? isLoadingAllCourses : isLoadingMyCourses;
  const refetch = hasViewAllCoursePermission ? refetchAllCourses : refetchMyCourses;

  // Normalize the data format - handle both {items: [...]} and direct array [...]
  const normalizedCourses = hasViewAllCoursePermission
    ? allCoursesData?.items ?? []
    : Array.isArray(myCoursesData) ? myCoursesData : myCoursesData?.items ?? [];

  useEffect(() => {
    if (!isShowCourseSidebar) {
      refetch();
    }
  }, [isShowCourseSidebar, refetch]);

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
            {normalizedCourses.map((item) => {
              // Users with ViewAllCourse permission can see ALL courses including drafts
              if (hasViewAllCoursePermission) {
                return (
                  <CourseCard
                    item={item}
                    key={item.id}
                    refetch={refetch}
                    data-cy={`tna-management-course-card-${item.id}`}
                  />
                );
              }

              // Users without ViewAllCourse permission:
              // - Can only see their own drafts
              // - Can see all published courses they are assigned to
              if (item.isDraft) {
                return item.preparedBy === localUserID ? (
                  <CourseCard
                    item={item}
                    key={item.id}
                    refetch={refetch}
                    data-cy={`tna-management-course-card-${item.id}`}
                  />
                ) : null;
              }

              return (
                <CourseCard
                  item={item}
                  key={item.id}
                  refetch={refetch}
                  data-cy={`tna-management-course-card-${item.id}`}
                />
              );
            })}
          </div>
        </Spin>
      )}

      <CourseCategorySidebar data-cy="tna-management-course-category-sidebar" />
    </div>
  );
};

export default TnaManagementPage;
