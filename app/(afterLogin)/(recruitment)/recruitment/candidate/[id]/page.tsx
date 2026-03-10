'use client';

import {
  useGetCandidateById,
  useGetStages,
} from '@/store/server/features/recruitment/candidate/queries';
import { useChangeCandidateStatus } from '@/store/server/features/recruitment/candidate/mutation';
import { useGetAllCandidates } from '@/store/server/features/recruitment/candidate/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import HtmlStringDisplayer from '@/components/HtmlStringDisplayer';
import { Button, Select } from 'antd';
import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import SaveAltOutlinedIcon from '@mui/icons-material/SaveAltOutlined';
import CustomBreadcrumb from '@/components/common/breadCramp';

const CandidateDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const candidateId = typeof params?.id === 'string' ? params.id : '';
  const { data: selectedCandidate, isLoading } =
    useGetCandidateById(candidateId);
  const { data: statusStages } = useGetStages();
  const queryClient = useQueryClient();
  const { mutate: updateJobStatus } = useChangeCandidateStatus();
  const userId = useAuthenticationStore.getState().userId;

  const { data: allCandidatesData } = useGetAllCandidates(
    '',
    '',
    '',
    '',
    '',
    100,
    1,
  );
  const allItems = allCandidatesData?.items ?? [];
  const currentIndex = allItems.findIndex((c: any) => c.id === candidateId);
  const prevCandidateId =
    currentIndex > 0 ? allItems[currentIndex - 1]?.id : null;
  const nextCandidateId =
    currentIndex >= 0 && currentIndex < allItems.length - 1
      ? allItems[currentIndex + 1]?.id
      : null;

  const jobCandidate = selectedCandidate?.jobCandidate?.[0];
  const currentStageId = jobCandidate?.applicantStatusStage?.id;
  const jobCandidateId = jobCandidate?.id;

  const handleStatusChange = (applicantStatusStageId: string) => {
    if (!jobCandidateId) return;
    updateJobStatus(
      {
        data: { applicantStatusStageId, updatedBy: userId },
        id: jobCandidateId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['candidate', candidateId]);
        },
      },
    );
  };

  const cvFileName =
    selectedCandidate?.documentName ||
    (selectedCandidate?.resumeUrl
      ? selectedCandidate.resumeUrl.split('/').pop() || 'CV.pdf'
      : null);

  if (!candidateId) {
    return (
      <div
        className="px-2 sm:px-6 py-4 sm:py-6"
        data-cy="talent-acquisition-candidate-detail-page-missing-id"
      >
        <p
          className="text-gray-500"
          data-cy="talent-acquisition-candidate-detail-page-invalid-message"
        >
          Invalid candidate.
        </p>
        <Link
          href="/recruitment/candidate"
          className="text-primary hover:underline"
          data-cy="talent-acquisition-candidate-detail-page-back-link"
        >
          Back to Candidates
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="px-2 sm:px-6 py-4 sm:py-6"
        data-cy="talent-acquisition-candidate-detail-page-loading"
      >
        <div
          className="animate-pulse space-y-4"
          data-cy="talent-acquisition-candidate-detail-page-loading-skeleton"
        >
          <div
            className="h-8 w-48 bg-gray-200 rounded"
            data-cy="talent-acquisition-candidate-detail-page-loading-line-1"
          />
          <div
            className="h-4 w-full bg-gray-200 rounded"
            data-cy="talent-acquisition-candidate-detail-page-loading-line-2"
          />
          <div
            className="h-32 w-full bg-gray-200 rounded"
            data-cy="talent-acquisition-candidate-detail-page-loading-line-3"
          />
        </div>
      </div>
    );
  }

  if (!selectedCandidate) {
    return (
      <div
        className="px-2 sm:px-6 py-4 sm:py-6"
        data-cy="talent-acquisition-candidate-detail-page-not-found"
      >
        <p
          className="text-gray-500"
          data-cy="talent-acquisition-candidate-detail-page-not-found-message"
        >
          Candidate not found.
        </p>
        <Button
          type="link"
          onClick={() => router.push('/recruitment/candidate')}
          className="p-0"
          data-cy="talent-acquisition-candidate-detail-page-back-button"
        >
          Back to Candidates
        </Button>
      </div>
    );
  }

  const cardClassName =
    'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden';

  return (
    <div
      className="w-full px-2 sm:px-6 py-4 sm:py-6 space-y-4"
      id="talent-acquisition-candidate-detail-page"
      data-cy="talent-acquisition-candidate-detail-page"
    >
      <div
        className="flex flex-col gap-2 mb-2 sm:mb-4"
        data-cy="talent-acquisition-candidate-detail-page-header-top"
      >
        <div
          className="flex flex-wrap items-center gap-2"
          data-cy="talent-acquisition-candidate-detail-page-header-actions"
        >
          <Button
            type="text"
            icon={<KeyboardArrowLeftIcon className="text-lg" />}
            onClick={() => router.push('/recruitment/candidate')}
            className="!flex items-center justify-center p-0 h-8 w-8 min-w-[32px] rounded-lg bg-white border border-gray-200 text-gray-800 hover:border-[#4096FF] [&_.ant-btn-icon]:flex [&_.ant-btn-icon]:items-center [&_.ant-btn-icon]:justify-center"
            data-cy="talent-acquisition-candidate-detail-page-back"
          />
          <CustomBreadcrumb
            title={
              <span
                className="text-base sm:text-lg"
                data-cy="talent-acquisition-candidate-detail-page-breadcrumb-title"
              >
                Candidate Detail
              </span>
            }
            subtitle="Talent Acquisition / Candidates"
          />
        </div>
      </div>

      {/* Section 1: Candidate header (name, status, nav, contact grid) */}
      <div
        className={cardClassName}
        data-cy="talent-acquisition-candidate-detail-page-card-header"
      >
        <div
          className="p-4 sm:p-6"
          data-cy="talent-acquisition-candidate-detail-page-card-inner"
        >
          <div
            className="flex flex-col gap-4"
            data-cy="talent-acquisition-candidate-detail-page-header"
          >
            <div
              className="flex flex-wrap items-start justify-between gap-3 sm:gap-4"
              data-cy="talent-acquisition-candidate-detail-page-header-row"
            >
              <div
                className="flex flex-col gap-2 min-w-0 flex-1"
                data-cy="talent-acquisition-candidate-detail-page-header-left"
              >
                <h1
                  className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 m-0 break-words"
                  data-cy="talent-acquisition-candidate-detail-page-header-name"
                >
                  {selectedCandidate.fullName}
                </h1>
                <Select
                  value={currentStageId}
                  onChange={handleStatusChange}
                  suffixIcon={
                    <KeyboardArrowDownOutlinedIcon className="text-gray-400 text-sm" />
                  }
                  className="w-full sm:w-[180px] [&_.ant-select-selector]:!border-gray-200 hover:[&_.ant-select-selector]:!border-[#4096FF] [&_.ant-select-selection-item]:text-gray-800 hover:[&_.ant-select-selection-item]:text-[#4096FF]"
                  options={statusStages?.items?.map((stage: any) => ({
                    value: stage.id,
                    label: stage.title,
                  }))}
                  id="talent-acquisition-candidate-detail-page-status-select"
                  data-cy="talent-acquisition-candidate-detail-page-status-select"
                />
              </div>
              <div
                className="flex items-center gap-0.5 sm:gap-1 shrink-0"
                data-cy="talent-acquisition-candidate-detail-page-nav-buttons"
              >
                <Button
                  type="text"
                  icon={
                    <KeyboardArrowLeftIcon className="!text-xs sm:!text-sm" />
                  }
                  disabled={!prevCandidateId}
                  onClick={() =>
                    prevCandidateId &&
                    router.push(`/recruitment/candidate/${prevCandidateId}`)
                  }
                  className="!flex !items-center !justify-center !p-0 !h-6 !w-6 !min-h-6 !min-w-6 !max-h-6 !max-w-6 sm:!h-8 sm:!w-8 sm:!min-h-8 sm:!min-w-8 sm:!max-h-8 sm:!max-w-8 !rounded-full !border !border-gray-200 !bg-white text-gray-800 hover:!border-[#4096FF] hover:!text-[#4096FF] !shadow-none [&_.ant-btn-icon]:!flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center disabled:!opacity-50"
                  data-cy="talent-acquisition-candidate-detail-page-prev"
                />
                <Button
                  type="text"
                  icon={
                    <KeyboardArrowRightIcon className="!text-xs sm:!text-sm" />
                  }
                  disabled={!nextCandidateId}
                  onClick={() =>
                    nextCandidateId &&
                    router.push(`/recruitment/candidate/${nextCandidateId}`)
                  }
                  className="!flex !items-center !justify-center !p-0 !h-6 !w-6 !min-h-6 !min-w-6 !max-h-6 !max-w-6 sm:!h-8 sm:!w-8 sm:!min-h-8 sm:!min-w-8 sm:!max-h-8 sm:!max-w-8 !rounded-full !border !border-gray-200 !bg-white text-gray-800 hover:!border-[#4096FF] hover:!text-[#4096FF] !shadow-none [&_.ant-btn-icon]:!flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center disabled:!opacity-50"
                  data-cy="talent-acquisition-candidate-detail-page-next"
                />
              </div>
            </div>

            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3 sm:gap-4 pt-2 border-t border-gray-100"
              data-cy="talent-acquisition-candidate-detail-page-info-grid"
            >
              <div
                className="flex flex-col gap-0.5"
                data-cy="talent-acquisition-candidate-detail-page-header-email"
              >
                <span
                  className="text-xs text-gray-400"
                  data-cy="talent-acquisition-candidate-detail-page-email-label"
                >
                  Email
                </span>
                <a
                  href={
                    selectedCandidate.email
                      ? `mailto:${selectedCandidate.email}`
                      : undefined
                  }
                  className="text-sm text-gray-800 hover:text-primary break-all"
                  data-cy="talent-acquisition-candidate-detail-page-email-value"
                >
                  {selectedCandidate.email ?? '—'}
                </a>
              </div>
              <div
                className="flex flex-col gap-0.5"
                data-cy="talent-acquisition-candidate-detail-page-header-phone"
              >
                <span
                  className="text-xs text-gray-400"
                  data-cy="talent-acquisition-candidate-detail-page-phone-label"
                >
                  Phone Number
                </span>
                <span
                  className="text-sm text-gray-800"
                  data-cy="talent-acquisition-candidate-detail-page-phone-value"
                >
                  {selectedCandidate.phone ?? '—'}
                </span>
              </div>
              <div
                className="flex flex-col gap-0.5"
                data-cy="talent-acquisition-candidate-detail-page-header-job"
              >
                <span
                  className="text-xs text-gray-400"
                  data-cy="talent-acquisition-candidate-detail-page-job-label"
                >
                  Job
                </span>
                <span
                  className="text-sm text-gray-800"
                  data-cy="talent-acquisition-candidate-detail-page-job-value"
                >
                  {selectedCandidate.jobCandidate
                    ?.map((item: any) => item?.jobInformation?.jobTitle)
                    .filter(Boolean)
                    .join(', ') || '—'}
                </span>
              </div>
              <div
                className="flex flex-col gap-0.5"
                data-cy="talent-acquisition-candidate-detail-page-header-cgpa"
              >
                <span
                  className="text-xs text-gray-400"
                  data-cy="talent-acquisition-candidate-detail-page-cgpa-label"
                >
                  CGPA
                </span>
                <span
                  className="text-sm text-gray-800"
                  data-cy="talent-acquisition-candidate-detail-page-cgpa-value"
                >
                  {selectedCandidate.CGPA ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: CV (file name on left, download icon on right) */}
      <div
        className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
        data-cy="talent-acquisition-candidate-detail-page-cv-section"
      >
        <div
          className="p-4 sm:p-6 flex flex-row items-center justify-between gap-3"
          data-cy="talent-acquisition-candidate-detail-page-cv-inner"
        >
          <div
            className="flex flex-col gap-0.5 min-w-0 flex-1"
            data-cy="talent-acquisition-candidate-detail-page-cv-left"
          >
            <span
              className="text-base font-semibold text-gray-900 truncate"
              data-cy="talent-acquisition-candidate-detail-page-cv-filename"
            >
              {cvFileName ?? 'No CV uploaded'}
            </span>
          </div>
          {selectedCandidate.resumeUrl && (
            <a
              href={selectedCandidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#4096FF] hover:text-[#4096FF] text-sm font-medium shrink-0"
              data-cy="talent-acquisition-candidate-detail-page-cv-download"
              title="Download"
            >
              <SaveAltOutlinedIcon className="text-lg" />
              <span
                className="hidden sm:inline"
                data-cy="talent-acquisition-candidate-detail-page-cv-download-text"
              >
                Download
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Section 3: Professional Summary */}
      <div
        className={cardClassName}
        data-cy="talent-acquisition-candidate-detail-page-cover-letter-card"
      >
        <div
          className="p-4 sm:p-6"
          data-cy="talent-acquisition-candidate-detail-page-cover-letter-inner"
        >
          <h2
            className="text-base font-bold text-gray-900 mb-3"
            data-cy="talent-acquisition-candidate-detail-page-cover-letter-title"
          >
            Cover Letter
          </h2>
          <div
            className="text-sm text-gray-700 leading-relaxed"
            data-cy="talent-acquisition-candidate-detail-page-cover-letter"
          >
            <HtmlStringDisplayer
              htmlString={
                jobCandidate?.coverLetter ?? 'No cover letter provided.'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
