'use client';
import React, { useEffect, useState } from 'react';

import JobCard from './_components/jobCard/jobCard';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import CreateJobs from './_components/createJobs';
import CustomButton from '@/components/common/buttons/customButton';
import ShareToSocialMedia from './_components/modals/share';
import AddFormResult from './_components/modals/result';
import JobsFilterModal from './_components/modals/filter';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Input } from 'antd';
import { AiOutlineSearch } from 'react-icons/ai';
import { useDebounce } from '@/utils/useDebounce';
import dayjs, { Dayjs } from 'dayjs';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  AddJobButtonIcon,
  FunnelFilterIcon,
} from '../_components/recruitmentIcons';

const RecruitmentPage: React.FC = () => {
  const { setAddNewDrawer, searchParams, setSearchParams, setCurrentPage } =
    useJobState();
  const { data: departments } = useGetDepartments();
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const departmentName =
    departments?.find((dep: { id: string; name: string }) => {
      return dep.id === searchParams.department;
    })?.name ?? searchParams.department;

  const activeFilterChips = [
    {
      key: 'department',
      label: departmentName,
    },
    {
      key: 'employmentType',
      label: searchParams.employmentType,
    },
    {
      key: 'status',
      label: searchParams.status,
    },
    {
      key: 'location',
      label: searchParams.location,
    },
    {
      key: 'createdDate',
      label: searchParams.createdDate
        ? dayjs(searchParams.createdDate).format('DD MMM YYYY')
        : '',
    },
    {
      key: 'closedDate',
      label: searchParams.closedDate
        ? dayjs(searchParams.closedDate).format('DD MMM YYYY')
        : '',
    },
  ].filter((chip) => Boolean(chip.label));

  const handleAddNewDrawer = () => {
    setAddNewDrawer(true);
  };

  const handleSearchJobs = (value: string | boolean) => {
    setSearchParams('whatYouNeed', String(value));
    setCurrentPage(1);
  };

  const onSearchChange = useDebounce(handleSearchJobs, 500);

  useEffect(() => {
    setSearchValue(searchParams.whatYouNeed);
  }, [searchParams.whatYouNeed]);

  const handleFilterSave = (values: Record<string, unknown>) => {
    setSearchParams('department', String(values.department ?? ''));
    setSearchParams('employmentType', String(values.employmentType ?? ''));
    setSearchParams('status', String(values.status ?? ''));
    setSearchParams('location', String(values.location ?? ''));
    setSearchParams(
      'createdDate',
      values.createdDate
        ? (values.createdDate as Dayjs).format('YYYY-MM-DD')
        : '',
    );
    setSearchParams(
      'closedDate',
      values.closedDate
        ? (values.closedDate as Dayjs).format('YYYY-MM-DD')
        : '',
    );
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setSearchParams('department', '');
    setSearchParams('employmentType', '');
    setSearchParams('status', '');
    setSearchParams('location', '');
    setSearchParams('createdDate', '');
    setSearchParams('closedDate', '');
    setCurrentPage(1);
  };

  const handleRemoveFilterChip = (
    key:
      | 'department'
      | 'employmentType'
      | 'status'
      | 'location'
      | 'createdDate'
      | 'closedDate',
  ) => {
    setSearchParams(key, '');
    setCurrentPage(1);
  };

  return (
    <div
      id="talent-acquisition-jobs-page-div-container"
      data-cy="talent-acquisition-jobs-page-div-container"
      className="min-h-screen max-w-full overflow-x-hidden bg-white font-['Calibri']"
    >
      <header className="w-full" data-cy="talent-acquisition-jobs-page-header">
        <div
          className="px-2 pt-4 sm:px-3 sm:pt-5 md:px-4"
          data-cy="talent-acquisition-jobs-page-header-inner"
        >
          <div
            id="talent-acquisition-jobs-page-div-header"
            data-cy="talent-acquisition-jobs-page-div-header"
            className="flex flex-row flex-nowrap items-center justify-between gap-3 sm:gap-4"
          >
            <CustomBreadcrumb
              data-cy="talent-acquisition-jobs-page-breadcrumb"
              title={
                <span
                  id="talent-acquisition-jobs-page-title"
                  data-cy="talent-acquisition-jobs-page-title"
                >
                  Jobs
                </span>
              }
              subtitle={
                <>
                  <span
                    className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]"
                    data-cy="talent-acquisition-jobs-breadcrumb-talent-acquisition"
                  >
                    Talent Acquisition
                  </span>
                  <span
                    className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]"
                    data-cy="talent-acquisition-jobs-breadcrumb-separator"
                  >
                    {' '}
                    /{' '}
                  </span>
                  <span
                    className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                    data-cy="talent-acquisition-jobs-breadcrumb-jobs"
                  >
                    Jobs
                  </span>
                </>
              }
              subtitleClassName="!font-normal !text-inherit sm:!leading-snug"
              compact
              rootClassName="!py-0 !gap-1 min-w-0 flex-1"
              titleClassName="!text-2xl !font-bold !leading-tight !text-gray-900"
            />
            <AccessGuard
              data-cy="talent-acquisition-jobs-page-access-guard"
              permissions={[Permissions.CreateJobDescription]}
            >
              <div
                className="shrink-0"
                data-cy="talent-acquisition-jobs-add-job-wrap"
              >
                <CustomButton
                  title={
                    <span
                      id="talent-acquisition-jobs-add-job-label"
                      data-cy="talent-acquisition-jobs-add-job-label"
                      className="hidden sm:inline"
                    >
                      Add Job
                    </span>
                  }
                  id="talent-acquisition-jobs-button-add-job"
                  data-cy="talent-acquisition-jobs-button-add-new"
                  icon={
                    <span
                      className="inline-flex shrink-0 items-center justify-center leading-none"
                      aria-hidden
                      data-cy="talent-acquisition-jobs-button-add-icon"
                    >
                      <AddJobButtonIcon />
                    </span>
                  }
                  onClick={() => handleAddNewDrawer()}
                  className="!bg-[#1E40AF] hover:!bg-[#1D4ED8] w-10 sm:w-auto sm:px-5 !h-11 px-5 py-5 rounded-lg border-0 shrink-0 !items-center"
                  aria-label="Add Job"
                />
              </div>
            </AccessGuard>
          </div>
        </div>
        <div
          className="relative left-1/2 mt-3 w-[calc(100vw-16px)] -translate-x-1/2 border-0 border-b border-solid border-gray-200 sm:mt-4"
          aria-hidden
          data-cy="talent-acquisition-jobs-page-header-divider"
        />
      </header>
      <div
        className="px-2 pb-4 sm:px-3 sm:pb-5 md:px-4"
        data-cy="talent-acquisition-jobs-page-main"
      >
        <div
          id="talent-acquisition-jobs-page-div-job-card"
          data-cy="talent-acquisition-jobs-page-div-job-card"
          className="mt-4 sm:mt-6 bg-white border border-gray-200 rounded-xl p-4 sm:p-5"
        >
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 mb-4"
            data-cy="talent-acquisition-jobs-page-toolbar"
          >
            <div
              className="flex items-center gap-3 w-full justify-between"
              data-cy="talent-acquisition-jobs-page-search-row"
            >
              <div
                className="min-w-0 flex-1 sm:flex-none sm:w-full sm:max-w-[440px]"
                data-cy="talent-acquisition-jobs-page-search-wrap"
              >
                <Input
                  id="inputTalentAcquisitionJobsSearch"
                  data-cy="talent-acquisition-jobs-page-what-you-need"
                  placeholder="Search Jobs"
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    onSearchChange(value.trim());
                  }}
                  className="w-full h-11 rounded-lg border-gray-300"
                  allowClear
                  suffix={
                    <span
                      className="inline-flex items-center h-full min-h-[1.5rem] border-l border-gray-200 pl-2.5 ml-0"
                      data-cy="talent-acquisition-jobs-search-suffix"
                    >
                      <AiOutlineSearch className="text-gray-400 w-4 h-4 shrink-0" />
                    </span>
                  }
                />
              </div>
              <div
                className="flex items-center gap-2 shrink-0"
                data-cy="talent-acquisition-jobs-toolbar-actions"
              >
                <div
                  className="hidden sm:flex items-center gap-2 flex-wrap justify-end"
                  data-cy="talent-acquisition-jobs-filter-chip-list"
                >
                  {activeFilterChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-[6px] border border-solid border-[#D9D9D9] bg-white text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                      data-cy={`talent-acquisition-jobs-filter-chip-${chip.key}`}
                    >
                      <span
                        data-cy={`talent-acquisition-jobs-filter-chip-label-${chip.key}`}
                      >
                        {chip.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFilterChip(
                            chip.key as
                              | 'department'
                              | 'employmentType'
                              | 'status'
                              | 'location'
                              | 'createdDate'
                              | 'closedDate',
                          )
                        }
                        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700"
                        aria-label={`Remove ${chip.key} filter`}
                        data-cy={`talent-acquisition-jobs-filter-chip-remove-${chip.key}`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          data-cy={`talent-acquisition-jobs-filter-chip-remove-icon-${chip.key}`}
                        >
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            data-cy={`talent-acquisition-jobs-filter-chip-remove-path-${chip.key}`}
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <JobsFilterModal
                  asPopover
                  open={filterModalOpen}
                  onOpenChange={(visible) => setFilterModalOpen(visible)}
                  onClose={() => setFilterModalOpen(false)}
                  onSaveFilter={handleFilterSave}
                  onResetFilter={handleFilterReset}
                  initialValues={{
                    department: searchParams.department || undefined,
                    employmentType: searchParams.employmentType || undefined,
                    status: searchParams.status || undefined,
                    location: searchParams.location || undefined,
                    createdDate: searchParams.createdDate
                      ? dayjs(searchParams.createdDate)
                      : undefined,
                    closedDate: searchParams.closedDate
                      ? dayjs(searchParams.closedDate)
                      : undefined,
                  }}
                >
                  <button
                    type="button"
                    className="flex w-[84px] h-8 items-center justify-center gap-1.5 rounded-[6px] border border-solid border-[#D9D9D9] bg-white hover:bg-gray-50 shrink-0 transition-colors px-0"
                    data-cy="talent-acquisition-jobs-filter-button"
                  >
                    <FunnelFilterIcon className="shrink-0" />
                    <span
                      className="text-[14px] font-normal leading-none text-[rgba(0,0,0,0.7)]"
                      data-cy="talent-acquisition-jobs-filter-button-label"
                    >
                      Filter
                    </span>
                  </button>
                </JobsFilterModal>
              </div>
            </div>
          </div>
          <div data-cy="talent-acquisition-jobs-page-content">
            <JobCard />
          </div>
        </div>
        <CreateJobs data-cy="talent-acquisition-jobs-page-create-jobs" />
        <AddFormResult data-cy="talent-acquisition-jobs-page-add-form-result" />
        <ShareToSocialMedia data-cy="talent-acquisition-jobs-page-share-to-social-media" />
      </div>
    </div>
  );
};

export default RecruitmentPage;
