'use client';
import { useEffect, useState } from 'react';
import { Button, Divider, Spin } from 'antd';
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
    isLoading: isLoadingAllCourses,
    refetch: refetchAllCourses,
  } = useGetCoursesManagement(filter, true, hasViewAllCoursePermission);

  // Fetch only assigned courses for users without ViewAllCourse permission
  const {
    data: myCoursesData,
    isLoading: isLoadingMyCourses,
    refetch: refetchMyCourses,
  } = useGetMyCourses(userId ?? '', !hasViewAllCoursePermission);

  // Use the appropriate data based on permission
  // Note: /learning/course returns {items: [...]} but /my-courses returns [...] directly
  const isLoading = hasViewAllCoursePermission
    ? isLoadingAllCourses
    : isLoadingMyCourses;
  const refetch = hasViewAllCoursePermission
    ? refetchAllCourses
    : refetchMyCourses;

  // Normalize the data format - handle both {items: [...]} and direct array [...]
  const normalizedCourses = hasViewAllCoursePermission
    ? (allCoursesData?.items ?? [])
    : Array.isArray(myCoursesData)
      ? myCoursesData
      : (myCoursesData?.items ?? []);

  useEffect(() => {
    if (!isShowCourseSidebar) {
      refetch();
    }
  }, [isShowCourseSidebar, refetch]);

  useEffect(() => {
    if (categoryData?.items) {
      setCourseCategory(categoryData.items);
    }
  }, [categoryData, setCourseCategory]);

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
    <div
      className="page-wrap bg-white -mx-2 w-[calc(100%+1rem)] max-w-none sm:-mx-4 sm:w-[calc(100%+2rem)]"
      id="tnaManagementPageId"
      data-cy="tna-management-page"
    >
      <div
        className="flex w-1130 mx-auto flex-col items-center gap-5 px-3 py-6 sm:px-4 md:items-start"
        data-cy="tna-management-page-frame"
      >
        <header
          className="flex w-full max-w-[408px] flex-col items-center gap-4 md:max-w-none"
          data-cy="tna-management-page-header-band"
        >
          <div
            className="flex min-h-[58px] w-full flex-row items-center justify-between gap-4"
            data-cy="tna-management-page-header-row"
          >
            <div
              className="flex min-w-0 flex-col items-start gap-1 md:max-w-none"
              data-cy="tna-management-page-header-content"
            >
              <h1
                className="m-0 text-2xl font-bold leading-8 text-black font-[Calibri,sans-serif]"
                data-cy="tna-management-page-title"
              >
                Learning and Growth
              </h1>
              <nav
                className="flex flex-row flex-wrap items-center text-sm leading-[22px] font-[Calibri,sans-serif]"
                aria-label="Breadcrumb"
                data-cy="tna-management-page-breadcrumb"
              >
                <span
                  className="text-black/45"
                  data-cy="tna-management-page-breadcrumb-segment-first"
                >
                  Learning and Growth
                </span>
                <span
                  className="text-black/45 px-2"
                  data-cy="tna-management-page-breadcrumb-separator"
                >
                  /
                </span>
                <span
                  className="text-black/70"
                  data-cy="tna-management-page-breadcrumb-segment-current"
                >
                  Learning Management
                </span>
              </nav>
            </div>
            <div
              id="tnaManagementPageHeaderActionsId"
              className="shrink-0"
              data-cy="tna-management-page-header-actions"
            >
              <AccessGuard
                permissions={[Permissions.CreateCourse]}
                data-cy="tna-management-create-course-guard"
                id="tna-management-create-course-guard"
              >
                <Button
                  id="tnaAddCourseActionButtonId"
                  data-cy="tna-add-course-action-button"
                  type="primary"
                  size="large"
                  className="!flex !h-10 !w-10 !min-w-10 !items-center !justify-center !rounded-lg !border-none !bg-[#1E40AF] !p-0 !text-white shadow-none md:!h-10 md:!min-w-[135px] md:!w-auto md:!px-[15px] font-[Calibri,sans-serif] [&_.ant-btn-icon]:text-white md:text-base md:font-normal md:leading-6"
                  icon={<LuPlus size={18} className="text-white" />}
                  loading={isFetching}
                  onClick={() => setIsShowCourseSidebar(true)}
                >
                  <span
                    className="hidden md:inline"
                    data-cy="tna-management-add-course-button-text"
                  >
                    New Course
                  </span>
                </Button>
              </AccessGuard>
            </div>
          </div>
          <Divider
            className="!m-0 w-full border-[#EEEEEE]"
            style={{ margin: 0, borderColor: '#EEEEEE' }}
            data-cy="tna-management-page-header-divider"
          />
        </header>

        <div
          className="box-border flex w-full max-w-[404px] flex-col gap-4 rounded-lg border border-[#D9D9D9] p-3 md:max-w-none"
          data-cy="tna-management-main-panel"
        >
          <div className="w-full" data-cy="tna-management-filter-wrap">
            <CourseFilter
              onChange={onFilterChange}
              data-cy="tna-management-filter"
            />
          </div>

          {isLoading ? (
            <div
              className="flex justify-center py-10 w-full"
              id="tnaManagementLoadingId"
              data-cy="tna-management-loading"
            >
              <Spin data-cy="tna-management-spinner-spin" />
            </div>
          ) : (
            <div
              className="col-span-12 "
              data-cy="settings-recognition-tabs-container"
              id="settingsRecognitionTabsContainer"
            >
              <div
                className="grid w-full max-w-[380px] grid-cols-1 gap-[32px] md:max-w-none md:grid-cols-2 xl:grid-cols-3"
                data-cy="settings-recognition-grid"
              >
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
            </div>
          )}
        </div>

        <CourseCategorySidebar data-cy="tna-management-course-category-sidebar" />
      </div>
    </div>
  );
};

export default TnaManagementPage;
