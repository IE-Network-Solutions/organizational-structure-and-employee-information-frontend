'use client';
import { Button, Spin, Tabs } from 'antd';
import type { RenderTabBar } from 'rc-tabs/es/interface';
import React, { useEffect, useMemo, useState } from 'react';
import ObjectiveCard from '../objectivecard';
import ObjectiveBasic from '../objectiveBasic';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import {
  useGetCompanyObjective,
  useGetTeamObjective,
  useGetUserObjective,
} from '@/store/server/features/okrplanning/okr/objective/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetDepartmentUsersAllLevels } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { EmptyImage } from '@/components/emptyIndicator';
import ObjectiveCardSkeleton from '@/components/okr/objectiveCardSkeleton';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import EmployeeOKRTable from '../EmployeeOkr';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  OKR_STATUS_PILLS,
  toKeyResultDeadlineFilter,
} from '../../../_constants/okrStatusPills';
import {
  extractDepartmentUserIds,
  extractUserIdsFromPayload,
  resolveCompanyFilterUserIds,
  resolveEmployeeDepartmentId,
  resolveTeamViewerUserId,
} from '../okrFilterUsers';
import { useObjectiveTypesStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';
import { useObjectiveTypeAllocationStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypeAllocationStore';
import { buildPrototypeMockObjectives } from '../../../_constants/prototypeMockObjectives';

/** Prototype mock badges on cards use these labels when API meta is missing. */
const MOCK_OBJECTIVE_TYPE_NAME = 'Business';
const MOCK_BSC_PILLAR_ID = 'financial';

/** When true, My OKR list merges local prototype objectives (Business/Strategic + KR combos). */
const USE_PROTOTYPE_MY_OKR_MOCKS = true;

const TAB_CONFIG = [
  { key: '1', label: 'My OKR' },
  { key: '2', label: 'Team OKR' },
  { key: '3', label: 'Company OKR' },
  { key: '4', label: 'All Employees OKR' },
];

interface OkrTabProps {
  filterComponent?: React.ReactNode;
  'data-cy'?: string;
}

export default function OkrTab({
  filterComponent,
  'data-cy': dataCy,
}: OkrTabProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('1');
  const { userId } = useAuthenticationStore();
  const { data: departmentUsers } = useGetUserDepartment();
  const { data: userData } = useGetEmployee(userId);
  const isBasicOkr = useIsBasicOkr();
  const myDepartmentId = resolveEmployeeDepartmentId(
    userData?.employeeJobInformation?.[0],
  );

  const {
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    searchObjParams,
    fiscalYearId,
    sessionIds,
    setTeamCurrentPage,
    setTeamPageSize,
    teamCurrentPage,
    teamPageSize,
    setCompanyCurrentPage,
    setCompanyPageSize,
    companyCurrentPage,
    companyPageSize,
    okrTab,
    setOkrTab,
    okrStatusPillId,
    setOkrStatusPillId,
  } = useOKRStore();
  const { isMobile, isTablet } = useIsMobile();

  const filterDepartmentId = searchObjParams?.departmentId || '';
  const filterUserId = searchObjParams?.userId || '';
  const filterObjectiveTypeId = searchObjParams?.objectiveTypeId || '';
  const filterBscPillarId = searchObjParams?.bscPillarId || '';
  const objectiveTypes = useObjectiveTypesStore((s) => s.types);
  const addTypes = useObjectiveTypesStore((s) => s.addTypes);
  const getAllocationForObjective = useObjectiveTypeAllocationStore(
    (s) => s.getAllocationForObjective,
  );
  const addAllocation = useObjectiveTypeAllocationStore((s) => s.addAllocation);
  const allocations = useObjectiveTypeAllocationStore((s) => s.allocations);

  // Ensure catalog has Business + Strategic for prototype demos
  useEffect(() => {
    if (!USE_PROTOTYPE_MY_OKR_MOCKS) return;
    const hasNonStrategic = objectiveTypes.some((t) => !t.isStrategic);
    const hasStrategic = objectiveTypes.some((t) => t.isStrategic);
    const toAdd: { name: string; isStrategic: boolean }[] = [];
    if (!hasNonStrategic) toAdd.push({ name: 'Business', isStrategic: false });
    if (!hasStrategic) toAdd.push({ name: 'Strategic', isStrategic: true });
    if (toAdd.length) addTypes(toAdd);
  }, [objectiveTypes, addTypes]);

  const prototypeObjectives = useMemo(() => {
    if (!USE_PROTOTYPE_MY_OKR_MOCKS || !userId) return [];
    const hasNonStrategic = objectiveTypes.some((t) => !t.isStrategic);
    const hasStrategic = objectiveTypes.some((t) => t.isStrategic);
    // Wait until catalog types exist so badges resolve to real names
    if (!hasNonStrategic || !hasStrategic) return [];
    return buildPrototypeMockObjectives({
      userId,
      types: objectiveTypes,
    });
  }, [userId, objectiveTypes]);

  // Seed prototype allocations so Type / BSC badges resolve
  useEffect(() => {
    if (!USE_PROTOTYPE_MY_OKR_MOCKS || !prototypeObjectives.length) return;
    const removeAllocationByObjectiveId =
      useObjectiveTypeAllocationStore.getState().removeAllocationByObjectiveId;
    prototypeObjectives.forEach((obj) => {
      if (!obj.id || !obj.objectiveTypeId) return;
      const existing = getAllocationForObjective(obj.id, obj.title);
      if (
        existing &&
        existing.objectiveTypeId === obj.objectiveTypeId &&
        (existing.bscPillarId || null) === (obj.bscPillarId ?? null)
      ) {
        return;
      }
      if (existing) removeAllocationByObjectiveId(obj.id);
      addAllocation({
        objectiveId: obj.id,
        title: obj.title,
        objectiveTypeId: obj.objectiveTypeId,
        bscPillarId: obj.bscPillarId ?? null,
        weight: Number(obj.weight || 0) || 1,
      });
    });
  }, [
    prototypeObjectives,
    getAllocationForObjective,
    addAllocation,
    allocations.length,
  ]);

  const matchesObjectiveMetaFilters = (obj: any) => {
    if (!filterObjectiveTypeId && !filterBscPillarId) return true;
    const allocation = getAllocationForObjective(obj?.id, obj?.title);
    const typeId = obj?.objectiveTypeId || allocation?.objectiveTypeId || null;
    const bscId = obj?.bscPillarId || allocation?.bscPillarId || null;

    const selectedTypeName = objectiveTypes.find(
      (t) => t.id === filterObjectiveTypeId,
    )?.name;

    const typeOk =
      !filterObjectiveTypeId ||
      typeId === filterObjectiveTypeId ||
      // mock card badges fallback
      (!typeId && selectedTypeName === MOCK_OBJECTIVE_TYPE_NAME);

    const bscOk =
      !filterBscPillarId ||
      bscId === filterBscPillarId ||
      (!bscId && filterBscPillarId === MOCK_BSC_PILLAR_ID);

    return Boolean(typeOk && bscOk);
  };

  const { data: allLevelDepartmentUsers, isFetching: isDeptUsersFetching } =
    useGetDepartmentUsersAllLevels(filterDepartmentId || null);
  const allLevelDepartmentUserIds = useMemo(
    () => extractUserIdsFromPayload(allLevelDepartmentUsers),
    [allLevelDepartmentUsers],
  );

  const teamViewerUserId = useMemo(
    () =>
      resolveTeamViewerUserId({
        filterUserId,
        filterDepartmentId,
        currentUserId: userId,
        departments: departmentUsers,
      }),
    [filterUserId, filterDepartmentId, userId, departmentUsers],
  );

  /** Kept for API body compatibility; Team backend scopes by header userId. */
  const teamUsersFallback = useMemo(() => {
    const fromMyDept = extractDepartmentUserIds(
      departmentUsers,
      myDepartmentId,
    );
    return fromMyDept.length > 0
      ? fromMyDept
      : teamViewerUserId
        ? [teamViewerUserId]
        : [];
  }, [departmentUsers, myDepartmentId, teamViewerUserId]);

  const companyFilterUserIds = useMemo(
    () =>
      resolveCompanyFilterUserIds({
        filterUserId,
        filterDepartmentId,
        departments: departmentUsers,
        allLevelDepartmentUserIds,
      }),
    [
      filterUserId,
      filterDepartmentId,
      departmentUsers,
      allLevelDepartmentUserIds,
    ],
  );

  const companyDeptFilterEmpty =
    !!filterDepartmentId &&
    !filterUserId &&
    !isDeptUsersFetching &&
    companyFilterUserIds.length === 0;

  const companyQueryEnabled =
    String(activeKey) === '3' &&
    !companyDeptFilterEmpty &&
    (!filterDepartmentId || !isDeptUsersFetching || !!filterUserId);

  const keyResultDeadlineFilter = useMemo(
    () =>
      String(okrTab) === '1'
        ? toKeyResultDeadlineFilter(okrStatusPillId)
        : undefined,
    [okrStatusPillId, okrTab],
  );

  useEffect(() => {
    if (String(okrTab) !== '1') {
      setOkrStatusPillId(null);
    }
  }, [okrTab, setOkrStatusPillId]);

  const {
    data: userObjectives,
    isLoading,
    refetch: userRefetch,
  } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    searchObjParams?.metricTypeId,
    fiscalYearId,
    sessionIds,
    keyResultDeadlineFilter,
    { enabled: String(activeKey) === '1' },
  );

  const myOkrItems = useMemo(() => {
    const apiItems = userObjectives?.items ?? [];
    if (!USE_PROTOTYPE_MY_OKR_MOCKS) return apiItems;
    const apiIds = new Set(apiItems.map((o: any) => String(o?.id)));
    const mocks = prototypeObjectives.filter(
      (o) => o.id && !apiIds.has(String(o.id)),
    );
    return [...mocks, ...apiItems];
  }, [userObjectives?.items, prototypeObjectives]);

  const {
    data: teamObjective,
    isLoading: teamLoading,
    refetch,
  } = useGetTeamObjective(
    teamPageSize,
    teamCurrentPage,
    teamUsersFallback,
    teamViewerUserId,
    searchObjParams?.metricTypeId || '',
    fiscalYearId,
    sessionIds,
    undefined,
    { enabled: String(activeKey) === '2' && !!teamViewerUserId },
  );

  const {
    data: companyObjective,
    isLoading: companyLoading,
    refetch: CompanyRefetch,
  } = useGetCompanyObjective(
    userId,
    companyPageSize,
    companyCurrentPage,
    companyFilterUserIds,
    filterUserId,
    searchObjParams?.metricTypeId || '',
    fiscalYearId,
    sessionIds,
    undefined,
    {
      enabled: companyQueryEnabled,
    },
  );

  const isUserLoading = isLoading;
  const isTeamLoading = teamLoading;
  const isCompanyLoading =
    companyLoading ||
    (String(activeKey) === '3' && !!filterDepartmentId && isDeptUsersFetching);

  const canVieTeamOkr = AccessGuard.checkAccess({
    permissions: [Permissions.ViewTeamOkr],
  });
  const canVieCompanyOkr = AccessGuard.checkAccess({
    permissions: [Permissions.ViewCompanyOkr],
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && String(activeKey) === '1') {
      userRefetch();
    }
  }, [pageSize, currentPage, isMounted, activeKey]);

  useEffect(() => {
    if (isMounted && String(activeKey) === '2') {
      refetch();
    }
  }, [teamPageSize, teamCurrentPage, isMounted, activeKey]);

  // Refetch Team OKR when year/session/people filters change
  useEffect(() => {
    if (isMounted && String(activeKey) === '2') {
      refetch();
    }
  }, [
    fiscalYearId,
    sessionIds,
    teamViewerUserId,
    isMounted,
    activeKey,
    refetch,
  ]);

  const companyFilterUserIdsKey = companyFilterUserIds.join(',');

  useEffect(() => {
    if (isMounted && String(activeKey) === '3') {
      CompanyRefetch();
    }
  }, [
    companyPageSize,
    companyCurrentPage,
    companyFilterUserIdsKey,
    filterUserId,
    fiscalYearId,
    sessionIds,
    isMounted,
    activeKey,
  ]);

  useEffect(() => {
    setActiveKey(String(okrTab));
  }, [okrTab]);

  // Return null or loading state during SSR
  if (!isMounted) {
    return (
      <div
        className="mt-6 flex justify-center items-center min-h-[200px]"
        data-cy="okr-tab-loading-container"
      >
        <Spin size="large" />
      </div>
    );
  }

  const handleTabChange = (key: string) => {
    setOkrTab(key);
    setActiveKey(key);
  };

  const visibleTabs = TAB_CONFIG.filter((tab) => {
    if (tab.key === '2' && !canVieTeamOkr) return false;
    if ((tab.key === '3' || tab.key === '4') && !canVieCompanyOkr) return false;
    return true;
  });

  const tabContent = [
    {
      key: '1',
      label: 'My OKR',
      children: (
        <div id="my-okr-tab-content" data-cy="okr-my-okr-tab-content">
          {isUserLoading && myOkrItems.length === 0 ? (
            <ObjectiveCardSkeleton
              data-cy="okr-my-okr-loading-skeleton"
              count={Math.min(Number(pageSize || 3), 6)}
              showAssignee={false}
            />
          ) : null}
          {myOkrItems.length !== 0 && (
            <div
              id="my-okr-objectives-list"
              data-cy="okr-my-okr-objectives-list"
            >
              {myOkrItems
                ?.filter(matchesObjectiveMetaFilters)
                ?.map((obj: any) =>
                  isBasicOkr ? (
                    <ObjectiveBasic
                      data-cy={`okr-my-okr-objective-basic-card-${obj?.id}`}
                      key={obj.id}
                      myOkr={true}
                      objective={obj}
                    />
                  ) : (
                    <ObjectiveCard
                      data-cy={`okr-my-okr-objective-card-${obj?.id}`}
                      key={obj.id}
                      myOkr={true}
                      objective={obj}
                    />
                  ),
                )}
              {isMobile || isTablet ? (
                <CustomMobilePagination
                  data-cy="okr-my-okr-mobile-pagination"
                  totalResults={
                    (userObjectives?.meta?.totalItems ?? 0) +
                    (USE_PROTOTYPE_MY_OKR_MOCKS
                      ? prototypeObjectives.length
                      : 0)
                  }
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onChange={(page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                  }}
                  onShowSizeChange={(size) => {
                    setPageSize(size);
                  }}
                />
              ) : (
                <CustomPagination
                  current={userObjectives?.meta?.currentPage || 1}
                  total={
                    (userObjectives?.meta?.totalItems || 0) +
                    (USE_PROTOTYPE_MY_OKR_MOCKS
                      ? prototypeObjectives.length
                      : 0)
                  }
                  pageSize={pageSize}
                  onChange={(page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                  }}
                  onShowSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>
          )}
          {myOkrItems.length === 0 && !isUserLoading && (
            <div
              id="my-okr-empty-state"
              data-cy="okr-my-okr-empty-state"
              className="flex justify-center"
            >
              <EmptyImage />
            </div>
          )}
        </div>
      ),
    },
    ...(canVieTeamOkr
      ? [
          {
            key: '2',
            label: 'Team OKR',
            children: (
              <div id="team-okr-tab-content" data-cy="okr-team-okr-tab-content">
                {isTeamLoading ? (
                  <ObjectiveCardSkeleton
                    data-cy="okr-team-okr-loading-skeleton"
                    count={Math.min(Number(teamPageSize || 3), 6)}
                    showAssignee={true}
                  />
                ) : null}
                {teamObjective?.items?.length !== 0 && (
                  <div
                    id="team-okr-objectives-list"
                    data-cy="okr-team-okr-objectives-list"
                  >
                    {teamObjective?.items?.map((obj: any) =>
                      isBasicOkr ? (
                        <ObjectiveBasic
                          key={obj.id}
                          myOkr={false}
                          objective={obj}
                        />
                      ) : (
                        <ObjectiveCard
                          key={obj.id}
                          myOkr={false}
                          objective={obj}
                        />
                      ),
                    )}
                    {isMobile || isTablet ? (
                      <CustomMobilePagination
                        data-cy="okr-team-okr-mobile-pagination"
                        totalResults={teamObjective?.meta?.totalItems ?? 0}
                        pageSize={teamPageSize}
                        currentPage={teamCurrentPage}
                        onChange={(page, pageSize) => {
                          setTeamCurrentPage(page);
                          setTeamPageSize(pageSize);
                        }}
                        onShowSizeChange={(size) => {
                          setTeamPageSize(size);
                        }}
                      />
                    ) : (
                      <CustomPagination
                        data-cy="okr-team-okr-pagination"
                        current={teamObjective?.meta?.currentPage || 1}
                        total={teamObjective?.meta?.totalItems || 1}
                        pageSize={teamPageSize}
                        onChange={(page, pageSize) => {
                          setTeamCurrentPage(page);
                          setTeamPageSize(pageSize);
                        }}
                        onShowSizeChange={(size) => {
                          setTeamPageSize(size);
                          setTeamCurrentPage(1);
                        }}
                      />
                    )}
                  </div>
                )}
                {teamObjective?.items?.length === 0 && (
                  <div
                    id="team-okr-empty-state"
                    data-cy="okr-team-okr-empty-state"
                    className="flex justify-center"
                  >
                    <EmptyImage data-cy="okr-team-okr-empty-image" />
                  </div>
                )}
              </div>
            ),
          },
        ]
      : []),
    ...(canVieCompanyOkr
      ? [
          {
            key: '3',
            label: 'Company OKR',
            children: (
              <div
                id="company-okr-tab-content"
                data-cy="okr-company-okr-tab-content"
              >
                {isCompanyLoading ? (
                  <ObjectiveCardSkeleton
                    data-cy="okr-company-okr-loading-skeleton"
                    count={Math.min(Number(companyPageSize || 3), 6)}
                    showAssignee={true}
                  />
                ) : null}
                {companyObjective?.items?.length !== 0 &&
                  !companyDeptFilterEmpty && (
                    <div
                      id="company-okr-objectives-list"
                      data-cy="okr-company-okr-objectives-list"
                    >
                      {companyObjective?.items?.map((obj: any) =>
                        isBasicOkr ? (
                          <ObjectiveBasic
                            data-cy={`okr-company-okr-objective-basic-card-${obj?.id}`}
                            key={obj.id}
                            myOkr={false}
                            objective={obj}
                          />
                        ) : (
                          <ObjectiveCard
                            data-cy={`okr-company-okr-objective-card-${obj?.id}`}
                            key={obj.id}
                            myOkr={false}
                            objective={obj}
                          />
                        ),
                      )}
                      {isMobile || isTablet ? (
                        <CustomMobilePagination
                          data-cy="okr-company-okr-mobile-pagination"
                          totalResults={companyObjective?.meta?.totalItems ?? 0}
                          pageSize={companyPageSize}
                          currentPage={companyCurrentPage}
                          onChange={(page, pageSize) => {
                            setCompanyCurrentPage(page);
                            setCompanyPageSize(pageSize);
                          }}
                          onShowSizeChange={(size) => {
                            setCompanyPageSize(size);
                          }}
                        />
                      ) : (
                        <CustomPagination
                          data-cy="okr-company-okr-pagination"
                          current={companyObjective?.meta?.currentPage || 1}
                          total={companyObjective?.meta?.totalItems || 1}
                          pageSize={companyPageSize}
                          onChange={(page, pageSize) => {
                            setCompanyCurrentPage(page);
                            setCompanyPageSize(pageSize);
                          }}
                          onShowSizeChange={(size) => {
                            setCompanyPageSize(size);
                            setCompanyCurrentPage(1);
                          }}
                        />
                      )}
                    </div>
                  )}
                {(companyDeptFilterEmpty ||
                  companyObjective?.items?.length === 0) &&
                  !isCompanyLoading && (
                    <div
                      id="company-okr-empty-state"
                      data-cy="okr-company-okr-empty-state"
                      className="flex justify-center"
                    >
                      <EmptyImage data-cy="okr-company-okr-empty-image" />
                    </div>
                  )}
              </div>
            ),
          },
          {
            key: '4',
            label: 'All Employees OKR',
            children: (
              <div
                id="all-employee-okr-tab-content"
                data-cy="okr-all-employee-okr-tab-content"
              >
                <EmployeeOKRTable data-cy="okr-all-employee-okr-table" />
              </div>
            ),
          },
        ]
      : []),
  ];

  const contentByKey = new Map(
    tabContent.map((entry) => [entry.key, entry.children]),
  );

  const tabItems = visibleTabs.map((tab) => ({
    key: tab.key,
    label: (
      <div
        className={`text-base font-normal m-0 ${
          activeKey === tab.key
            ? 'text-okr-primary font-semibold'
            : 'text-gray-800'
        }`}
        data-cy={`okr-tab-${tab.key}`}
        id={`okr-tab-label-${tab.key}`}
      >
        {tab.label}
      </div>
    ),
    children: contentByKey.get(tab.key) ?? null,
  }));

  const statusPillButtons = OKR_STATUS_PILLS.map((pill) => {
    const isSelected = okrStatusPillId === pill.id;
    return (
      <Button
        key={pill.id}
        type="default"
        size="small"
        data-cy={`okr-status-pill-${pill.id}`}
        onClick={() =>
          setOkrStatusPillId(okrStatusPillId === pill.id ? null : pill.id)
        }
        className={
          isSelected
            ? '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-okr-primary text-okr-primary !bg-[#FAFAFA] hover:!bg-[#FAFAFA] hover:!border-okr-primary hover:!text-okr-primary'
            : '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-[#D9D9D9] text-gray-700 !bg-[#FAFAFA] hover:!bg-[#F0F0F0] hover:!border-[#D9D9D9] hover:!text-gray-800'
        }
      >
        {pill.label}
      </Button>
    );
  });

  const isCompactTabBar = isMobile || isTablet;

  /** Mobile/tablet: same pattern as employee settings — scrollable tabs + filter only in `right` extra (always visible). */
  const compactTabBarExtra =
    activeKey !== '4' && filterComponent ? (
      <div className="ml-4 flex shrink-0" data-cy="okr-filter-inline-container">
        {filterComponent}
      </div>
    ) : null;

  const tabBarExtraContent = isCompactTabBar ? (
    compactTabBarExtra ? (
      { right: compactTabBarExtra }
    ) : undefined
  ) : (
    <div
      className="flex max-w-full flex-wrap items-center justify-end gap-1"
      data-cy="okr-tab-bar-extra"
    >
      {activeKey === '1' ? (
        <div
          className="flex flex-wrap items-center gap-2"
          data-cy="okr-status-pills-row"
        >
          {statusPillButtons}
        </div>
      ) : null}
      {activeKey !== '4' ? (
        <div className="flex-shrink-0" data-cy="okr-filter-inline-container">
          {filterComponent}
        </div>
      ) : null}
    </div>
  );

  const tabsClassName = [
    '[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0 [&_.ant-tabs-content-holder]:mt-6',
    isCompactTabBar
      ? '[&_.ant-tabs-nav]:min-w-0 [&_.ant-tabs-nav-wrap]:min-w-0 [&_.ant-tabs-nav-list]:!flex-nowrap [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-wrap]:scrollbar-none [&_.ant-tabs-extra-content]:!shrink-0'
      : '',
  ]
    .filter(Boolean)
    .join(' ');
  //eslint-disable-next-line
  const compactRenderTabBar: RenderTabBar = (tabBarProps, DefaultTabBar) => {
    const TabNavList = DefaultTabBar;
    return (
      <div className="w-full min-w-0" data-cy="okr-mobile-tab-bar-stack">
        <TabNavList {...tabBarProps} />
      </div>
    );
  };

  const renderTabBar: RenderTabBar | undefined = isCompactTabBar
    ? compactRenderTabBar
    : undefined;

  return (
    <div
      id="okr-tab-container"
      data-cy={dataCy || 'okr-tab-container'}
      className={isCompactTabBar ? 'min-w-0 w-full' : undefined}
    >
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={tabItems}
        moreIcon={false}
        tabBarStyle={{
          marginBottom: 0,
          marginLeft: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }}
        tabBarExtraContent={tabBarExtraContent}
        renderTabBar={renderTabBar}
        className={tabsClassName}
        data-cy="okr-tabs"
        id="okr-tabs"
        destroyInactiveTabPane
      />
    </div>
  );
}
