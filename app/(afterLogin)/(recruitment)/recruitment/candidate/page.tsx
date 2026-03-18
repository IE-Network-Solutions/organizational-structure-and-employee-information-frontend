'use client';
import React, { useEffect, useState } from 'react';
import WhatYouNeed from '../jobs/[id]/_components/candidateSearch/whatYouNeed';
import CustomButton from '@/components/common/buttons/customButton';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ForwardIcon from '@mui/icons-material/Forward';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CreateCandidate from '../jobs/[id]/_components/createCandidate';
import AllCandidateTable from './_components/allCandidateTable';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname } from 'next/navigation';
import { Button, Card, DatePicker, Row, Col, Select, Popover } from 'antd';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import dayjs, { Dayjs } from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AllCandidates: React.FC = () => {
  const {
    selectedCandidate,
    setSelectedCandidate,
    setMoveToTalentPoolModal,
    setCreateJobDrawer,
    setSelectedRowKeys,
    searchParams,
    setSearchParams,
    currentPage,
    pageSize,
  } = useCandidateState();

  const { isMobile, isTablet } = useIsMobile();
  const pathname = usePathname();

  const { data: employeeDepartments } = useEmployeeDepartments();
  const { data: jobList } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
  );
  const { data: stageList } = useGetStages();

  const showDrawer = () => {
    setCreateJobDrawer(true);
  };

  const handleMoveToTalentsPool = () => {
    setMoveToTalentPoolModal(true);
    setSelectedCandidate(selectedCandidate);
  };
  // Reset selected candidates and row keys on route change
  useEffect(() => {
    setSelectedCandidate([]);
    setSelectedRowKeys([] as any);
  }, [pathname]);
  const onClose = () => {
    setCreateJobDrawer(false);
  };

  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(
    searchParams.selectedDepartment || undefined,
  );
  const [jobFilter, setJobFilter] = useState<string | undefined>(
    searchParams.selectedJob || undefined,
  );
  const [stageFilter, setStageFilter] = useState<string | undefined>(
    searchParams.selectedStage || undefined,
  );
  const [dateRangeFilter, setDateRangeFilter] = useState<[Dayjs, Dayjs] | null>(
    searchParams.dateRange
      ? (() => {
          const [start, end] = searchParams.dateRange.split(' to ');
          if (start && end) {
            return [dayjs(start), dayjs(end)] as [Dayjs, Dayjs];
          }
          return null;
        })()
      : null,
  );

  useEffect(() => {
    if (showFilters) {
      setDepartmentFilter(searchParams.selectedDepartment || undefined);
      setJobFilter(searchParams.selectedJob || undefined);
      setStageFilter(searchParams.selectedStage || undefined);
      if (searchParams.dateRange) {
        const [start, end] = searchParams.dateRange.split(' to ');
        if (start && end) {
          setDateRangeFilter([dayjs(start), dayjs(end)] as [Dayjs, Dayjs]);
        } else {
          setDateRangeFilter(null);
        }
      } else {
        setDateRangeFilter(null);
      }
    }
  }, [showFilters, searchParams]);

  const handleResetFilters = () => {
    setDepartmentFilter(undefined);
    setJobFilter(undefined);
    setStageFilter(undefined);
    setDateRangeFilter(null);
    setSearchParams('whatYouNeed', '');
    setSearchParams('dateRange', '');
    setSearchParams('selectedJob', '');
    setSearchParams('selectedStage', '');
    setSearchParams('selectedDepartment', '');
  };

  const handleSaveFilters = () => {
    setSearchParams('selectedDepartment', departmentFilter || '');
    setSearchParams('selectedJob', jobFilter || '');
    setSearchParams('selectedStage', stageFilter || '');

    if (dateRangeFilter && dateRangeFilter.length === 2) {
      const startDate = dayjs(dateRangeFilter[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dateRangeFilter[1]).format('YYYY-MM-DD');
      const dateRange = `${startDate} to ${endDate}`;
      setSearchParams('dateRange', dateRange);
    } else {
      setSearchParams('dateRange', '');
    }

    setShowFilters(false);
  };

  const filterContent = (
    <div
      className={`px-4 sm:px-6 py-4 sm:py-5 ${isMobile ? 'max-h-[70vh] overflow-y-auto' : ''}`}
      data-cy="talent-acquisition-candidate-page-filter-content"
    >
      <div
        className="mb-4"
        data-cy="talent-acquisition-candidate-page-filter-modal-header"
      >
        <h3
          className="text-lg font-semibold text-gray-900 m-0"
          data-cy="talent-acquisition-candidate-page-filter-modal-title"
        >
          Filter
        </h3>
        <p
          className="text-sm text-gray-500 mt-1 mb-0"
          data-cy="talent-acquisition-candidate-page-filter-modal-subtitle"
        >
          Select all filters that apply
        </p>
      </div>
      <div
        id="talent-acquisition-candidate-search-options-div-container"
        data-cy="talent-acquisition-candidate-search-options-div-container"
      >
        {/* Row 1: Department / Job */}
        <Row gutter={[16, 16]} className="mb-2">
          <Col lg={12} sm={24} xs={24}>
            <div
              className="mb-1 text-sm text-gray-600"
              data-cy="talent-acquisition-candidate-page-filter-department-label"
            >
              Department
            </div>
            <Select
              id={`selectDepartment${searchParams.selectedDepartment}`}
              data-cy="talent-acquisition-job-candidate-search-select-department"
              placeholder="Select Department"
              value={departmentFilter}
              onChange={(value: string | undefined) =>
                setDepartmentFilter(value)
              }
              allowClear
              className="w-full h-10"
            >
              {employeeDepartments?.map((item: any) => (
                <Option
                  key={item?.id}
                  value={item?.id}
                  id={`talent-acquisition-job-candidate-search-option-department-${item?.id}`}
                  data-cy={`talent-acquisition-job-candidate-search-option-department-${item?.id}`}
                >
                  {item?.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col lg={12} sm={24} xs={24}>
            <div
              className="mb-1 text-sm text-gray-600"
              data-cy="talent-acquisition-candidate-page-filter-job-label"
            >
              Job
            </div>
            <Select
              id={`selectJobs${searchParams.selectedJob}`}
              data-cy="talent-acquisition-job-candidate-search-select-job"
              placeholder="Select Job"
              value={jobFilter}
              onChange={(value: string | undefined) => setJobFilter(value)}
              allowClear
              className="w-full h-10"
            >
              {jobList?.items?.map((job: any) => (
                <Option
                  key={job?.id}
                  value={job?.id}
                  id={`talent-acquisition-job-candidate-search-option-job-${job?.id}`}
                  data-cy={`talent-acquisition-job-candidate-search-option-job-${job?.id}`}
                >
                  {job?.jobTitle}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Row 2: Stage */}
        <Row gutter={[16, 16]} className="mb-2">
          <Col lg={24} sm={24} xs={24}>
            <div
              className="mb-1 text-sm text-gray-600"
              data-cy="talent-acquisition-candidate-page-filter-stage-label"
            >
              Stage
            </div>
            <Select
              id={`selectStage${searchParams.selectedStage}`}
              data-cy="talent-acquisition-job-candidate-search-select-stage"
              placeholder="Select Stage"
              value={stageFilter}
              onChange={(value: string | undefined) => setStageFilter(value)}
              allowClear
              className="w-full h-10"
            >
              {stageList?.items?.map((item: any) => (
                <Option
                  key={item?.id}
                  value={item?.id}
                  id={`talent-acquisition-job-candidate-search-option-stage-${item?.id}`}
                  data-cy={`talent-acquisition-job-candidate-search-option-stage-${item?.id}`}
                >
                  {item?.title}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Row 3: Date range */}
        <div
          className="mt-2"
          data-cy="talent-acquisition-candidate-page-filter-date-wrapper"
        >
          <div
            className="mb-1 text-sm text-gray-600"
            data-cy="talent-acquisition-candidate-page-filter-date-label"
          >
            Date
          </div>
          <RangePicker
            id={`inputDateRange${searchParams.dateRange}`}
            data-cy="talent-acquisition-job-candidate-search-date-picker"
            value={dateRangeFilter as [Dayjs, Dayjs] | null}
            onChange={(dates) =>
              setDateRangeFilter(
                dates && Array.isArray(dates) && dates[0] && dates[1]
                  ? ([dates[0], dates[1]] as [Dayjs, Dayjs])
                  : null,
              )
            }
            className="w-full h-10"
            allowClear
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          />
        </div>
      </div>
      <div
        className="flex justify-end gap-2 pt-4"
        data-cy="talent-acquisition-candidate-page-filter-modal-actions"
      >
        <Button
          onClick={handleResetFilters}
          className="px-4"
          data-cy="talent-acquisition-candidate-page-filter-modal-reset-button"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={handleSaveFilters}
          className="px-4"
          data-cy="talent-acquisition-candidate-page-filter-modal-save-button"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      id="talent-acquisition-candidate-page-div-container"
      data-cy="talent-acquisition-candidate-page-div-container"
      className="h-auto w-full py-4 sm:py-6"
    >
      <Card
        data-cy="talent-acquisition-candidate-card"
        className="w-full border-none [&_.ant-card-head]:flex-wrap [&_.ant-card-head]:gap-2 [&_.ant-card-head]:px-0 [&_.ant-card-head]:py-1.5 [&_.ant-card-head]:min-h-0 [&_.ant-card-head-title]:w-full [&_.ant-card-body]:px-0"
        title={
          <div
            className="py-0.5"
            data-cy="talent-acquisition-candidate-breadcrumb-container"
          >
            <CustomBreadcrumb
              compact
              title={
                <span
                  className="text-lg sm:text-2xl font-bold text-[#000000B2]"
                  data-cy="talent-acquisition-candidate-breadcrumb-title"
                >
                  Candidates
                </span>
              }
              subtitle={
                <>
                  <span
                    className="text-slate-500"
                    data-cy="talent-acquisition-candidate-breadcrumb-prefix"
                  >
                    Talent Acquisition /{' '}
                  </span>
                  <span
                    className="text-[#000000B2]"
                    data-cy="talent-acquisition-candidate-breadcrumb-current"
                  >
                    Candidates
                  </span>
                </>
              }
              data-cy="talent-acquisition-candidate-breadcrumb"
            />
          </div>
        }
        extra={
          <div
            id="talent-acquisition-candidate-page-div-buttons"
            data-cy="talent-acquisition-candidate-page-div-buttons"
            className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 my-2 sm:my-4 px-4 sm:px-6"
          >
          {selectedCandidate?.length > 0 && (
            <div
              id="talent-acquisition-candidate-page-div-move-button"
              data-cy="talent-acquisition-candidate-page-div-move-button"
              className="sm:mr-0"
            >
              <CustomButton
                title={
                  !(isMobile || isTablet) && (
                    <span
                      data-cy="-recruitment-recruitment-candidate-page-tsx-page-span-83"
                      className="hidden sm:inline"
                    >
                      Move to Talent Pool
                    </span>
                  )
                }
                id="createUserButton"
                data-cy="talent-acquisition-candidate-button-move-talent-pool"
                icon={
                  <ForwardIcon className="md:mr-0 ml-2" fontSize="medium" />
                }
                  onClick={handleMoveToTalentsPool}
                  style={{ height: 40 }}
                  className="h-10 w-[152px] rounded-lg border border-[#1E40AF] bg-[#1E40AF] hover:border-[#1E40AF] hover:bg-[#4096FF] text-white"
              />
            </div>
          )}
          <AccessGuard permissions={[Permissions.CreateCandidate]}>
            <CustomButton
              title={
                !(isMobile || isTablet) && (
                  <span
                    data-cy="-recruitment-recruitment-candidate-page-tsx-page-span-100"
                    className="hidden sm:inline text-sm font-medium text-white"
                  >
                    Add candidate
                  </span>
                )
              }
              id="createUserButton"
              data-cy="talent-acquisition-candidate-button-add"
              icon={
                <PersonAddOutlinedIcon
                  className="md:mr-0 ml-2"
                  fontSize="medium"
                />
              }
              onClick={showDrawer}
              style={{ height: 40 }}
              className="h-10 w-[152px] rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white"
            />
            <CreateCandidate
              data-cy="talent-acquisition-candidate-page-create-candidate"
              onClose={onClose}
            />
          </AccessGuard>
          </div>
        }
      >
        <div
          id="talent-acquisition-candidate-page-div-table"
          data-cy="talent-acquisition-candidate-page-div-table"
          className="mt-0 sm:mt-2 w-full h-auto bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden"
        >
        <div
          className="px-0 sm:px-0 py-4 bg-white"
          id="talent-acquisition-candidate-page-table-toolbar"
          data-cy="talent-acquisition-candidate-page-table-toolbar"
          style={{ borderBottom: 'none' }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-4"
            data-cy="talent-acquisition-candidate-page-toolbar-inner"
          >
            <div
              className="flex-1 min-w-0 w-full sm:max-w-sm"
              id="talent-acquisition-candidate-page-search-wrap"
              data-cy="talent-acquisition-candidate-page-search-wrap"
            >
              <WhatYouNeed
                placeholder="Search candidate"
                pill
                className="w-full rounded-md"
              />
            </div>
            <Popover
              content={filterContent}
              trigger="click"
              open={showFilters}
              onOpenChange={setShowFilters}
              placement={isMobile ? 'bottom' : 'bottomRight'}
              overlayStyle={{ padding: 0 }}
              overlayInnerStyle={{
                padding: 0,
                borderRadius: 16,
                width: isMobile ? 'calc(100vw - 24px)' : 524,
                maxWidth: 524,
              }}
              getPopupContainer={() => document.body}
              id="talent-acquisition-candidate-page-filter-popover"
              data-cy="talent-acquisition-candidate-page-filter-popover"
            >
              <Button
                type="default"
                icon={
                  <FilterAltOutlinedIcon
                    style={{ fontSize: 14 }}
                    className="text-gray-600"
                  />
                }
                className="h-8 sm:h-10 flex items-center gap-2 rounded-lg border border-[#D9D9D9] text-gray-700 bg-white text-xs sm:text-sm transition-colors hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF] shrink-0"
                id="talent-acquisition-candidate-page-filter-button"
                data-cy="talent-acquisition-candidate-page-filter-button"
              >
                {!(isMobile || isTablet) && (
                  <span
                    className="font-normal"
                    data-cy="talent-acquisition-candidate-page-filter-button-text"
                  >
                    Filter
                  </span>
                )}
              </Button>
            </Popover>
          </div>
        </div>
        <div
          className="px-0 sm:px-0 pb-4"
          id="talent-acquisition-candidate-page-table-container"
          data-cy="talent-acquisition-candidate-page-table-container"
        >
          <AllCandidateTable data-cy="talent-acquisition-candidate-page-table" />
        </div>
        </div>
      </Card>
    </div>
  );
};

export default AllCandidates;
