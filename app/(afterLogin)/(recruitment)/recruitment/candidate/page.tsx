'use client';
import React, { useEffect, useState } from 'react';
import WhatYouNeed from '../jobs/[id]/_components/candidateSearch/whatYouNeed';
import CustomButton from '@/components/common/buttons/customButton';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CreateCandidate from '../jobs/[id]/_components/createCandidate';
import AllCandidateTable from './_components/allCandidateTable';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { IoIosShareAlt } from 'react-icons/io';
import { usePathname } from 'next/navigation';
import { Button, DatePicker, Row, Col, Select, Popover } from 'antd';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useDebounce } from '@/utils/useDebounce';
import dayjs, { Dayjs } from 'dayjs';

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
  const [filtersVersion, setFiltersVersion] = useState(0);

  const handleSearchCandidate = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSelectChange = handleSearchCandidate;
  const onSearchChange = useDebounce(handleSearchCandidate, 2000);

  const handleSearchByDateRange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dates[1]).format('YYYY-MM-DD');
      const dateRange = `${startDate} to ${endDate}`;
      onSearchChange(dateRange, 'dateRange');
    } else {
      onSearchChange('', 'dateRange');
    }
  };

  const handleJobChange = (value: string) => {
    onSelectChange(value, 'selectedJob');
  };

  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'selectedDepartment');
  };

  const handleStageChange = (value: string) => {
    onSelectChange(value, 'selectedStage');
  };

  const handleResetFilters = () => {
    setSearchParams('whatYouNeed', '');
    setSearchParams('dateRange', '');
    setSearchParams('selectedJob', '');
    setSearchParams('selectedStage', '');
    setSearchParams('selectedDepartment', '');
    setFiltersVersion((prev) => prev + 1);
  };

  const filterContent = (
    <div className="px-6 py-5">
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
        key={filtersVersion}
        id="talent-acquisition-candidate-search-options-div-container"
        data-cy="talent-acquisition-candidate-search-options-div-container"
      >
        {/* Row 1: Department / Job */}
        <Row gutter={[16, 16]} className="mb-2">
          <Col lg={12} sm={24} xs={24}>
            <div className="mb-1 text-sm text-gray-600">Department</div>
            <Select
              id={`selectDepartment${searchParams.selectedDepartment}`}
              data-cy="talent-acquisition-job-candidate-search-select-department"
              placeholder="Select Department"
              onChange={handleDepartmentChange}
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
            <div className="mb-1 text-sm text-gray-600">Job</div>
            <Select
              id={`selectJobs${searchParams.selectedJob}`}
              data-cy="talent-acquisition-job-candidate-search-select-job"
              placeholder="Select Job"
              onChange={handleJobChange}
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
          <Col lg={12} sm={24} xs={24}>
            <div className="mb-1 text-sm text-gray-600">Stage</div>
            <Select
              id={`selectStage${searchParams.selectedStage}`}
              data-cy="talent-acquisition-job-candidate-search-select-stage"
              placeholder="Select Stage"
              onChange={handleStageChange}
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
        <div className="mt-2">
          <div className="mb-1 text-sm text-gray-600">Date</div>
          <RangePicker
            id={`inputDateRange${searchParams.dateRange}`}
            data-cy="talent-acquisition-job-candidate-search-date-picker"
            onChange={(dates: any) => handleSearchByDateRange(dates)}
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
          onClick={() => setShowFilters(false)}
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
      className="h-auto w-full p-4 sm:p-6"
    >
      <div
        id="talent-acquisition-candidate-page-div-header"
        data-cy="talent-acquisition-candidate-page-div-header"
        className="flex flex-wrap justify-between items-center"
      >
        <div
          className="grow shrink basis-0 flex flex-col justify-start items-start gap-1 py-4"
          id="talent-acquisition-candidate-page-breadcrumb"
          data-cy="talent-acquisition-candidate-page-breadcrumb"
        >
          <h1
            className="text-gray-900 text-3xl font-bold leading-tight m-0"
            data-cy="talent-acquisition-candidate-page-title"
          >
            Candidates
          </h1>
          <p
            className="text-gray-500 text-sm font-normal leading-snug m-0"
            data-cy="talent-acquisition-candidate-page-breadcrumb-trail"
          >
            Talent Acquisition / Candidates
          </p>
        </div>
        <div
          id="talent-acquisition-candidate-page-div-buttons"
          data-cy="talent-acquisition-candidate-page-div-buttons"
          className="flex items-center justify-between my-4 "
        >
          {selectedCandidate?.length > 0 && (
            <div
              id="talent-acquisition-candidate-page-div-move-button"
              data-cy="talent-acquisition-candidate-page-div-move-button"
              className="mr-4"
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
                icon={<IoIosShareAlt className="md:mr-0 ml-2" size={20} />}
                onClick={handleMoveToTalentsPool}
                className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
              />
            </div>
          )}
          <AccessGuard permissions={[Permissions.CreateCandidate]}>
            <CustomButton
              title={
                !(isMobile || isTablet) && (
                  <span
                    data-cy="-recruitment-recruitment-candidate-page-tsx-page-span-100"
                    className="hidden sm:inline"
                  >
                    Add candidate
                  </span>
                )
              }
              id="createUserButton"
              data-cy="talent-acquisition-candidate-button-add"
              icon={<PersonAddOutlinedIcon className="md:mr-0 ml-2" fontSize="medium" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
            />
            <CreateCandidate
              data-cy="talent-acquisition-candidate-page-create-candidate"
              onClose={onClose}
            />
          </AccessGuard>
        </div>
      </div>
      <div
        id="talent-acquisition-candidate-page-div-table"
        data-cy="talent-acquisition-candidate-page-div-table"
        className="mt-6 w-full h-auto bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden"
      >
        <div
          className="px-4 py-4 border-b border-gray-100 bg-white"
          id="talent-acquisition-candidate-page-table-toolbar"
          data-cy="talent-acquisition-candidate-page-table-toolbar"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              className="flex-1 min-w-0 max-w-sm"
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
              placement="bottomRight"
              overlayStyle={{ padding: 0 }}
              overlayInnerStyle={{
                padding: 0,
                borderRadius: 16,
                width: 524,
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
                className="h-10 flex items-center gap-2 border border-gray-200 text-gray-700 bg-white text-sm transition-colors hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF] shrink-0"
                id="talent-acquisition-candidate-page-filter-button"
                data-cy="talent-acquisition-candidate-page-filter-button"
              >
                Filter
              </Button>
            </Popover>
          </div>
          <Modal
            open={showFilters}
            onCancel={() => setShowFilters(false)}
            footer={null}
            centered={false}
            width={524}
            bodyStyle={{ padding: 0 }}
            style={{ top: 120 }}
            maskStyle={{ backgroundColor: 'rgba(15,23,42,0.15)' }}
            className="talent-acquisition-candidate-filter-modal"
            id="talent-acquisition-candidate-page-filter-modal"
            data-cy="talent-acquisition-candidate-page-filter-modal"
          >
            <div className="px-6 py-5">
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
                key={filtersVersion}
                id="talent-acquisition-candidate-search-options-div-container"
                data-cy="talent-acquisition-candidate-search-options-div-container"
              >
                {/* Row 1: Department / Job */}
                <Row gutter={[16, 16]} className="mb-2">
                  <Col lg={12} sm={24} xs={24}>
                    <div className="mb-1 text-sm text-gray-600">Department</div>
                    <Select
                      id={`selectDepartment${searchParams.selectedDepartment}`}
                      data-cy="talent-acquisition-job-candidate-search-select-department"
                      placeholder="Select Department"
                      onChange={handleDepartmentChange}
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
                    <div className="mb-1 text-sm text-gray-600">Job</div>
                    <Select
                      id={`selectJobs${searchParams.selectedJob}`}
                      data-cy="talent-acquisition-job-candidate-search-select-job"
                      placeholder="Select Job"
                      onChange={handleJobChange}
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

                {/* Row 2: Stage (single field, left-aligned to match design grid) */}
                <Row gutter={[16, 16]} className="mb-2">
                  <Col lg={12} sm={24} xs={24}>
                    <div className="mb-1 text-sm text-gray-600">Stage</div>
                    <Select
                      id={`selectStage${searchParams.selectedStage}`}
                      data-cy="talent-acquisition-job-candidate-search-select-stage"
                      placeholder="Select Stage"
                      onChange={handleStageChange}
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
                <div className="mt-2">
                  <div className="mb-1 text-sm text-gray-600">Date</div>
                  <RangePicker
                    id={`inputDateRange${searchParams.dateRange}`}
                    data-cy="talent-acquisition-job-candidate-search-date-picker"
                    onChange={(dates: any) => handleSearchByDateRange(dates)}
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
                  onClick={() => setShowFilters(false)}
                  className="px-4"
                  data-cy="talent-acquisition-candidate-page-filter-modal-save-button"
                >
                  Save Filter
                </Button>
              </div>
            </div>
          </Modal>
        </div>
        <div
          className="px-4 pb-4"
          id="talent-acquisition-candidate-page-table-container"
          data-cy="talent-acquisition-candidate-page-table-container"
        >
          <AllCandidateTable data-cy="talent-acquisition-candidate-page-table" />
        </div>
      </div>
    </div>
  );
};

export default AllCandidates;
