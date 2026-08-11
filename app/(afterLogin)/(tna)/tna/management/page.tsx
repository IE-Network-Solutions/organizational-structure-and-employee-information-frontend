'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'antd';
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
import TnaManagementSkeleton from './_components/tnaManagementSkeleton';
import EmptyState from '@/components/empty';
import CustomBreadcrumb from '@/components/common/breadCramp';
import ExternalTnaCard from '@/app/(afterLogin)/(tna)/tna/management/_components/externalTnaCard';
import MyCommitmentsPanel from '@/app/(afterLogin)/(tna)/tna/management/_components/myCommitmentsPanel';
import { useExternalTrainingStore } from '@/store/uistate/features/tna/externalTraining';
import {
  useGetTrainingRequests,
  useGetTrainingRequestsByUser,
} from '@/store/server/features/tna/externalTraining/queries';
import { useGetTrainingApprovalsAllStatus } from '@/store/server/features/tna/trainingApproval/queries';
import { TnaSourceType } from '@/types/tna/externalTna';

const TnaManagementPage = () => {
  const {
    setIsShowCourseSidebar,
    isShowCourseSidebar,
    setCourseCategory,
    setCourseId,
  } = useTnaManagementStore();
  const {
    sourceTypeFilter,
    setSourceTypeFilter,
    setCreateModalTab,
    setTrainingRequestId,
  } = useExternalTrainingStore();
  const { userId } = useAuthenticationStore();
  const { data: categoryData, isFetching } = useGetCourseCategory({});
  const [filter, setFilter] = useState<Partial<CourseManagementRequestBody>>(
    {},
  );

  // Check if user has ViewAllCourse permission
  const hasViewAllCoursePermission = AccessGuard.checkAccess({
    permissions: [Permissions.ViewAllCourse],
  });

  const canCreateCourse = AccessGuard.checkAccess({
    permissions: [Permissions.CreateCourse],
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

  // External (non-catalogue) TNAs: admins see everything, employees see their own.
  const hasViewAllTnaPermission = AccessGuard.checkAccess({
    permissions: [Permissions.ViewAllTna],
  });

  const canCreateExternalTna = AccessGuard.checkAccess({
    permissions: [Permissions.CreateExternalTna],
  });

  const externalSearch = filter.modifiers?.search
    ? { modifiers: { search: filter.modifiers.search } }
    : {};

  const {
    data: allExternalData,
    isLoading: isLoadingAllExternal,
    refetch: refetchAllExternal,
  } = useGetTrainingRequests(
    { page: 1, limit: 200 },
    externalSearch,
    hasViewAllTnaPermission,
  );

  const {
    data: myExternalData,
    isLoading: isLoadingMyExternal,
    refetch: refetchMyExternal,
  } = useGetTrainingRequestsByUser(userId ?? '', !hasViewAllTnaPermission);

  /**
   * Requests routed to this user as an approver. Approval duty is workflow
   * data, not a permission, so this is the only thing that decides whether an
   * approver may see someone else's external TNA. The all-status feed keeps
   * returning a request after it has been decided, so an approver retains a
   * read-only view of their own decisions.
   */
  const { data: approverExternalData, refetch: refetchApproverExternal } =
    useGetTrainingApprovalsAllStatus(userId ?? '', 1, 200);

  // `by-user` returns a bare array; the paginated list returns `{ items }`.
  const externalItems = useMemo(() => {
    if (hasViewAllTnaPermission) return allExternalData?.items ?? [];

    const own = myExternalData ?? [];
    const toApprove =
      approverExternalData?.data?.items ?? approverExternalData?.items ?? [];

    // A user can be both requester and approver on different requests.
    const byId = new Map<string, any>();
    [...own, ...toApprove].forEach((item: any) => {
      if (item?.id && !byId.has(item.id)) byId.set(item.id, item);
    });
    return Array.from(byId.values());
  }, [
    hasViewAllTnaPermission,
    allExternalData?.items,
    myExternalData,
    approverExternalData,
  ]);
  const isLoadingExternal = hasViewAllTnaPermission
    ? isLoadingAllExternal
    : isLoadingMyExternal;
  // Memoised: an effect below depends on this, so a fresh function identity
  // each render would put it into a refetch loop.
  const refetchExternal = useCallback(() => {
    if (hasViewAllTnaPermission) {
      refetchAllExternal();
      return;
    }
    // Non-admins draw on two feeds — their own requests and the ones they
    // approve — so both have to be refreshed.
    refetchMyExternal();
    refetchApproverExternal();
  }, [
    hasViewAllTnaPermission,
    refetchAllExternal,
    refetchMyExternal,
    refetchApproverExternal,
  ]);

  const displayCourses = useMemo(() => {
    if (sourceTypeFilter === TnaSourceType.EXTERNAL) return [];
    return normalizedCourses.filter((item) => {
      if (hasViewAllCoursePermission) return true;
      if (item.isDraft) return item.preparedBy === localUserID;
      return true;
    });
  }, [normalizedCourses, hasViewAllCoursePermission, sourceTypeFilter]);

  const displayExternalTnas = useMemo(() => {
    if (sourceTypeFilter === TnaSourceType.INTERNAL) return [];
    // Course categories are a catalogue concept, so that filter excludes externals.
    if (filter.filter?.courseCategoryId?.length) return [];
    return externalItems;
  }, [externalItems, sourceTypeFilter, filter.filter?.courseCategoryId]);

  const totalResults = displayCourses.length + displayExternalTnas.length;

  const hasActiveFilters = Boolean(
    filter.modifiers?.search ||
    filter.filter?.courseCategoryId?.length ||
    sourceTypeFilter,
  );

  const openCreateModal = (tab: TnaSourceType) => {
    setCourseId(null);
    setTrainingRequestId(null);
    setCreateModalTab(tab);
    setIsShowCourseSidebar(true);
  };

  useEffect(() => {
    if (!isShowCourseSidebar) {
      refetch();
      refetchExternal();
    }
  }, [isShowCourseSidebar, refetch, refetchExternal]);

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
      className="tna-page-wrap bg-white -mx-2 w-[calc(100%+1rem)] max-w-none sm:-mx-4 sm:w-[calc(100%+2rem)]"
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
            className="min-h-[58px] w-full"
            data-cy="tna-management-page-header-row"
          >
            <div
              className="min-w-0 w-full md:max-w-none"
              data-cy="tna-management-page-header-content"
            >
              <CustomBreadcrumb
                title={
                  <span data-cy="tna-management-page-title">
                    Learning and Growth
                  </span>
                }
                subtitle={
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
                }
                titleExtra={
                  <div
                    id="tnaManagementPageHeaderActionsId"
                    className="shrink-0"
                    data-cy="tna-management-page-header-actions"
                  >
                    <AccessGuard
                      permissions={[
                        Permissions.CreateCourse,
                        Permissions.CreateExternalTna,
                      ]}
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
                        onClick={() =>
                          openCreateModal(
                            canCreateCourse
                              ? TnaSourceType.INTERNAL
                              : TnaSourceType.EXTERNAL,
                          )
                        }
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
                }
              />
            </div>
          </div>
        </header>

        <div
          className="box-border flex w-full max-w-[404px] flex-col gap-4 md:max-w-none"
          data-cy="tna-management-main-panel"
        >
          <MyCommitmentsPanel data-cy="tna-management-my-commitments" />

          <div className="w-full" data-cy="tna-management-filter-wrap">
            <CourseFilter
              onChange={onFilterChange}
              sourceType={sourceTypeFilter}
              onSourceTypeChange={setSourceTypeFilter}
              data-cy="tna-management-filter"
            />
          </div>

          {isLoading || isLoadingExternal ? (
            <div
              className="w-full"
              id="tnaManagementLoadingId"
              data-cy="tna-management-loading"
            >
              <TnaManagementSkeleton />
            </div>
          ) : totalResults === 0 ? (
            <div
              className="w-full"
              data-cy="tna-management-courses-empty"
              id="tnaManagementCoursesEmptyId"
            >
              <EmptyState
                title="No TNAs found"
                description={
                  hasActiveFilters
                    ? 'Try adjusting your search, type or category filter.'
                    : 'When courses and training requests are available, they will appear here.'
                }
                actionText={
                  canCreateCourse || canCreateExternalTna
                    ? 'New TNA'
                    : undefined
                }
                onAction={
                  canCreateCourse || canCreateExternalTna
                    ? () =>
                        openCreateModal(
                          canCreateCourse
                            ? TnaSourceType.INTERNAL
                            : TnaSourceType.EXTERNAL,
                        )
                    : undefined
                }
              />
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
                {displayExternalTnas.map((item) => (
                  <ExternalTnaCard
                    item={item}
                    key={item.id}
                    refetch={refetchExternal}
                    onEdit={(request) => {
                      setTrainingRequestId(request.id);
                      setCreateModalTab(TnaSourceType.EXTERNAL);
                      setIsShowCourseSidebar(true);
                    }}
                  />
                ))}
                {displayCourses.map((item) => (
                  <CourseCard
                    item={item}
                    key={item.id}
                    refetch={refetch}
                    data-cy={`tna-management-course-card-${item.id}`}
                  />
                ))}
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
