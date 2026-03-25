'use client';
import React, { useEffect, useState } from 'react';

import JobCard from './_components/jobCard/jobCard';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import CreateJobs from './_components/createJobs';
import CustomButton from '@/components/common/buttons/customButton';
import { CgFileDocument } from 'react-icons/cg';
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
      className="min-h-screen bg-[#f9fafb] p-4 sm:p-6"
    >
      <div
        id="talent-acquisition-jobs-page-div-header"
        data-cy="talent-acquisition-jobs-page-div-header"
        className="flex flex-row flex-wrap justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3"
      >
        <CustomBreadcrumb
          data-cy="talent-acquisition-jobs-page-breadcrumb"
          title="Jobs"
          subtitle="Talent Acquisition / Jobs"
        />
        <AccessGuard
          data-cy="talent-acquisition-jobs-page-access-guard"
          permissions={[Permissions.CreateJobDescription]}
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
                className="relative inline-flex shrink-0 w-5 h-5 items-center justify-center sm:mr-2 ml-0"
                aria-hidden
                data-cy="talent-acquisition-jobs-button-add-icon"
              >
                <CgFileDocument className="w-5 h-5 shrink-0 text-white" />
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-transparent text-white pointer-events-none"
                  data-cy="talent-acquisition-jobs-button-add-badge"
                >
                  <svg
                    className="w-2.5 h-2.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                    stroke="none"
                    data-cy="talent-acquisition-jobs-button-add-badge-svg"
                  >
                    <path
                      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                      data-cy="talent-acquisition-jobs-button-add-badge-path"
                    />
                  </svg>
                </span>
              </span>
            }
            onClick={() => handleAddNewDrawer()}
            className="!bg-[#6366F1] hover:!bg-[#4F46E5] w-10 sm:w-auto sm:px-5 !h-11 px-5 py-5 rounded-lg border-0"
            aria-label="Add Job"
          />
        </AccessGuard>
      </div>
      <div
        className="flex flex-col gap-4"
        data-cy="talent-acquisition-jobs-page-content"
      >
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
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
                  <span className="inline-flex items-center h-full min-h-[1.5rem] border-l border-gray-200 pl-2.5 ml-0">
                    <AiOutlineSearch className="text-gray-400 w-4 h-4 shrink-0" />
                  </span>
                }
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-gray-200 bg-white text-xs text-gray-600"
                    data-cy={`talent-acquisition-jobs-filter-chip-${chip.key}`}
                  >
                    <span>{chip.label}</span>
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
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
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
                  className={`flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shrink-0 transition-colors ${
                    filterModalOpen
                      ? '!bg-[#6366F1] !text-white !border-[#6366F1] hover:!bg-[#4F46E5]'
                      : ''
                  }`}
                  data-cy="talent-acquisition-jobs-filter-button"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    data-cy="talent-acquisition-jobs-filter-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      data-cy="talent-acquisition-jobs-filter-icon-path"
                    />
                  </svg>
                  <span data-cy="talent-acquisition-jobs-filter-button-label">
                    Filter
                  </span>
                </button>
              </JobsFilterModal>
            </div>
          </div>
        </div>
        <div
          id="talent-acquisition-jobs-page-div-job-card"
          data-cy="talent-acquisition-jobs-page-div-job-card"
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          <JobCard />
        </div>
      </div>
      <CreateJobs data-cy="talent-acquisition-jobs-page-create-jobs" />
      <AddFormResult data-cy="talent-acquisition-jobs-page-add-form-result" />
      <ShareToSocialMedia data-cy="talent-acquisition-jobs-page-share-to-social-media" />
    </div>
  );
};

export default RecruitmentPage;
