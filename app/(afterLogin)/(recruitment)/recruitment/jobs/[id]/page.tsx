'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React, { useEffect } from 'react';
import { FaDownload, FaPlus, FaUser, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import CreateCandidate from './_components/createCandidate';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CandidateTable from './_components/candidateTable';
import EditJob from '../_components/modals/editJob/editModal';
import WhatYouNeed from './_components/candidateSearch/whatYouNeed';
import SearchOptions from './_components/candidateSearch/candidateSearchOptions';
import {
  useGetJobsByID,
  downloadJobCandidatesExcel,
} from '@/store/server/features/recruitment/job/queries';
import { useGetCandidates } from '@/store/server/features/recruitment/candidate/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { IoIosArrowBack, IoIosShareAlt } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, Tabs, notification, Progress } from 'antd';
import { usePathname } from 'next/navigation';
import dayjs from 'dayjs';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { IoHourglassOutline } from 'react-icons/io5';

interface Params {
  id: string;
}

interface CandidateProps {
  params: Params;
}

const Candidates = ({ params: { id } }: CandidateProps) => {
  const router = useRouter();
  const {
    selectedCandidate,
    setCreateJobDrawer,
    setMoveToTalentPoolModal,
    setSelectedCandidate,
    setSelectedRowKeys,
    searchParams,
    isDownloading,
    setIsDownloading,
    currentPage,
    pageSize,
  } = useCandidateState();
  const { data: jobById } = useGetJobsByID(id);
  const { data: departments } = useGetDepartments();
  const { setEditModalVisible, setSelectedJob } = useJobState();
  const { data: candidateList } = useGetCandidates(
    id,
    searchParams?.whatYouNeed || '',
    searchParams?.dateRange || '',
    searchParams?.selectedJob || '',
    searchParams?.selectedStage || '',
    searchParams?.selectedDepartment || '',
    pageSize,
    currentPage,
  );
  const { isMobile, isTablet } = useIsMobile();
  const pathname = usePathname();

  const candidateCount = candidateList?.meta?.totalItems ?? 0;

  const getDepartmentName = (departmentId: string | undefined) => {
    if (!departmentId) return null;
    const dep = departments?.find((d: any) => d.id === departmentId);
    return dep?.name ?? null;
  };

  const showDrawer = () => {
    setCreateJobDrawer(true);
  };
  const onClose = () => {
    setCreateJobDrawer(false);
  };

  const handleMoveToTalentsPool = () => {
    setMoveToTalentPoolModal(true);
    setSelectedCandidate(selectedCandidate);
  };

  useEffect(() => {
    setSelectedCandidate([]);
    try {
      setSelectedRowKeys?.([] as any);
    } catch {}
  }, [pathname]);

  const handleDownloadExcel = () => {
    setIsDownloading(true);
    const downloadParams = {
      name: searchParams?.whatYouNeed || '',
      dateRange: searchParams?.dateRange || '',
      jobInformationId: id,
      applicantStatusStageId: searchParams?.selectedStage || '',
      departmentId: searchParams?.selectedDepartment || '',
      limit: 10,
      page: 1,
    };
    downloadJobCandidatesExcel(id, downloadParams)
      .then(
        (response: {
          message: string;
          downloadUrl: string;
          fileName: string;
          totalCandidates: number;
        }) => {
          const link = document.createElement('a');
          link.href = response.downloadUrl;
          link.setAttribute('download', response.fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          notification.success({
            message: 'Download Successful',
            description: `${response.message}. Total candidates: ${response.totalCandidates}. File: ${response.fileName}`,
            duration: 4,
            placement: 'topRight',
          });
        },
      )
      .catch((error: any) => {
        notification.error({
          message: 'Download Failed',
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Failed to download Excel file. Please try again.',
          duration: 5,
          placement: 'topRight',
        });
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const handleBackClick = () => {
    router.push('/recruitment/jobs');
  };

  const handleEditJob = () => {
    if (jobById) {
      setSelectedJob(jobById);
      setEditModalVisible(true);
    }
  };

  const jobStatus = jobById?.status ?? 'Open';
  const displayStatus = jobStatus === 'Closed' ? 'Closed' : 'Open';

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!jobById?.jobDeadline) return null;
    const deadline = dayjs(jobById.jobDeadline);
    const today = dayjs();
    const daysDiff = deadline.diff(today, 'day');
    return daysDiff >= 0 ? daysDiff : 0;
  };

  const daysRemaining = calculateDaysRemaining();
  const totalDays = jobById?.jobDeadline && jobById?.createdAt
    ? dayjs(jobById.jobDeadline).diff(dayjs(jobById.createdAt), 'day')
    : 30; // Default to 30 days if not available
  const progressPercent = totalDays > 0 && daysRemaining !== null
    ? Math.round((daysRemaining / totalDays) * 100)
    : 0;

  return (
    <div
      id="talent-acquisition-job-detail-page-div-container"
      data-cy="talent-acquisition-job-detail-page-div-container"
      className="min-h-screen w-full p-4 sm:p-6 bg-[#f9fafb]"
    >
      {/* Header: back + title + breadcrumb */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={handleBackClick}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shrink-0"
          data-cy="talent-acquisition-job-detail-button-back"
          aria-label="Back to jobs"
        >
          <IoIosArrowBack className="w-5 h-5" />
        </button>
        <div className="flex flex-col min-w-0">
          <h1
            className="text-2xl font-bold text-gray-900 font-['Manrope']"
            data-cy="talent-acquisition-job-detail-title"
          >
            Job Details
          </h1>
          <button
            type="button"
            onClick={handleBackClick}
            className="text-sm text-slate-500 font-medium font-['Manrope'] text-left hover:underline"
            data-cy="talent-acquisition-job-detail-breadcrumb"
          >
            Talent Acquisition / Jobs
          </button>
        </div>
      </div>

      {/* Job information card */}
      <div
        className="bg-white rounded-lg border border-gray-200 p-5 mb-6 relative"
        data-cy="talent-acquisition-job-detail-card"
      >
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <span
            className={`inline-flex items-center text-xs font-medium rounded-full px-3 py-1 ${
              displayStatus === 'Closed'
                ? 'bg-gray-200 text-gray-600'
                : 'bg-emerald-100 text-emerald-700'
            }`}
            data-cy="talent-acquisition-job-detail-status"
          >
            {displayStatus}
          </span>
          <button
            type="button"
            onClick={handleEditJob}
            className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
            data-cy="talent-acquisition-job-detail-edit-card"
          >
            <FaEdit className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-900 pr-24 mb-4" data-cy="talent-acquisition-job-detail-job-title">
          {jobById?.jobTitle ?? '—'}
        </h2>
        <div className="flex flex-wrap justify-between gap-y-4 max-w-6xl">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Department</span>
            <span className="text-sm font-medium text-gray-900 mt-0.5">
              {getDepartmentName(jobById?.departmentId) ?? '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Employment type</span>
            <span className="text-sm font-medium text-gray-900 mt-0.5">
              {jobById?.employmentType ?? '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Location</span>
            <span className="text-sm font-medium text-gray-900 mt-0.5">
              {jobById?.jobLocation ?? '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Created at</span>
            <span className="text-sm font-medium text-gray-900 mt-0.5">
              {jobById?.createdAt
                ? dayjs(jobById.createdAt).format('DD MMMM, YYYY')
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + action buttons */}
      <div className="mb-4">
        <Tabs
          defaultActiveKey="candidates"
          className="talent-acquisition-job-detail-tabs"
          tabBarExtraContent={
            <div className="flex items-center gap-2">
              <Button
                icon={<FaDownload size={16} className="!fill-current" />}
                onClick={handleDownloadExcel}
                loading={isDownloading}
                className="!h-11 !border-gray-300 text-gray-700"
                data-cy="talent-acquisition-job-detail-button-download-excel"
              >
                Download
              </Button>
              <CustomButton
                title={<span className="hidden sm:inline">Add Candidate</span>}
                id="createUserButton"
                data-cy="talent-acquisition-job-detail-button-add-candidate"
                icon={
                  <span className="inline-flex items-center gap-0.5 sm:mr-2">
                    <FaPlus className="w-3.5 h-3.5 shrink-0 fill-current" />
                    <FaUser className="w-4 h-4 shrink-0 fill-current -ml-0.5" />
                  </span>
                }
                onClick={showDrawer}
                className="!bg-[#6366F1] hover:!bg-[#4F46E5] !h-11 !border-0"
              />
            </div>
          }
          items={[
            {
              key: 'candidates',
              label: (
                <span className="flex items-center gap-2" data-cy="talent-acquisition-job-detail-tab-candidates">
                  Candidates
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    {candidateCount}
                  </span>
                </span>
              ),
              children: (
                <div className="pt-4">
                  {/* Search + Filter row: search left, Filter button right */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex-1 max-w-md">
                      <WhatYouNeed placeholder="Search Employee" />
                    </div>
                    <div className="flex items-center justify-end sm:shrink-0">
                      <SearchOptions jobId={id} />
                    </div>
                  </div>
                  {/* Move to Talent Pool when selection */}
                  {selectedCandidate?.length > 0 && (
                    <div className="mb-3">
                      <CustomButton
                        title={
                          !(isMobile || isTablet) && (
                            <span className="hidden sm:inline">Move to Talent Pool</span>
                          )
                        }
                        id="createUserButton"
                        data-cy="talent-acquisition-job-detail-button-move-talent-pool"
                        icon={<IoIosShareAlt className="md:mr-0 ml-2" size={20} />}
                        onClick={handleMoveToTalentsPool}
                        className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <CandidateTable
                      data-cy="talent-acquisition-job-detail-candidate-table"
                      jobId={id}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'information',
              label: (
                <span data-cy="talent-acquisition-job-detail-tab-information">Information</span>
              ),
              children: (
                <div className="pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Job Description */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
                        <button
                          type="button"
                          onClick={handleEditJob}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          data-cy="talent-acquisition-job-detail-edit-description"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {jobById?.description ? (
                          <div dangerouslySetInnerHTML={{ __html: jobById.description }} />
                        ) : (
                          <p className="text-gray-400 italic">No job description available.</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Closing Date + Preferences */}
                    <div className="space-y-6">
                      {/* Job Vacancy Closing Date */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Job Vacancy Closing Date</h3>
                          <button
                            type="button"
                            onClick={handleEditJob}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            data-cy="talent-acquisition-job-detail-edit-closing-date"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm text-gray-500">Closed Date</span>
                            <p className="text-gray-900 font-medium mt-1">
                              {jobById?.jobDeadline
                                ? dayjs(jobById.jobDeadline).format('DD MMMM, YYYY')
                                : 'Not set'}
                            </p>
                          </div>
                          {daysRemaining !== null && jobById?.jobDeadline && (
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">Days Remaining</span>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-[#6366F1]">
                                  <IoHourglassOutline className="w-5 h-5 shrink-0" />
                                  {daysRemaining} Days to go
                                </span>
                              </div>
                              <Progress
                                percent={progressPercent}
                                strokeColor="#6366F1"
                                showInfo={false}
                                className="mb-0"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Job Preference */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Preference</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">Quantity: </span>
                            <span className="text-gray-900 font-medium">
                              {jobById?.quantity ?? '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Years of Experience: </span>
                            <span className="text-gray-900 font-medium">
                              {jobById?.yearOfExperience
                                ? typeof jobById.yearOfExperience === 'string'
                                  ? jobById.yearOfExperience
                                  : `${jobById.yearOfExperience} years`
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Compensation: </span>
                            <span className="text-gray-900 font-medium">
                              {jobById?.compensation ?? '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      <CreateCandidate jobId={id} onClose={onClose} />
      <EditJob />
    </div>
  );
};

export default Candidates;
