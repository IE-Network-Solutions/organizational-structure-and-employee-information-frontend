'use client';
/* eslint-disable local-rules/data-cy-required */

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { MdOutlineFileDownload } from 'react-icons/md';
import { Select, Skeleton } from 'antd';
import {
  useGetCandidateById,
  useGetCandidates,
  useGetStages,
} from '@/store/server/features/recruitment/candidate/queries';
import { useUpdateCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import HtmlStringDisplayer from '@/components/HtmlStringDisplayer';
import CustomBreadcrumb from '@/components/common/breadCramp';
import TalentAcquisitionFullBleedHeaderRule from '@/app/(afterLogin)/(recruitment)/recruitment/_components/TalentAcquisitionFullBleedHeaderRule';

const CandidateDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const candidateId = params?.candidateId as string;
  const userId = useAuthenticationStore.getState().userId;

  const { data: candidate, isLoading } = useGetCandidateById(candidateId);
  const { data: statusStage } = useGetStages();
  const { mutate: updateCandidate } = useUpdateCandidate();

  const { data: candidateList } = useGetCandidates(
    jobId || '',
    '',
    '',
    '',
    '',
    '',
    100,
    1,
  );
  const candidates = candidateList?.items ?? [];
  const currentIndex = candidates.findIndex((c: any) => c?.id === candidateId);
  const prevCandidate = currentIndex > 0 ? candidates[currentIndex - 1] : null;
  const nextCandidate =
    currentIndex >= 0 && currentIndex < candidates.length - 1
      ? candidates[currentIndex + 1]
      : null;

  const handleBack = () => {
    router.push(`/recruitment/jobs/${jobId}`);
  };

  const stageId = candidate?.jobCandidate?.[0]?.applicantStatusStageId ?? null;
  const stageTitle =
    candidate?.jobCandidate?.[0]?.applicantStatusStage?.title ?? 'Applied';

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const currentStageId = selectedStageId ?? stageId;
  const currentStageTitle =
    statusStage?.items?.find((s: any) => s.id === currentStageId)?.title ??
    stageTitle;

  const handleStageChange = (value: string) => {
    setSelectedStageId(value);
    updateCandidate({
      data: { applicantStatusStageId: value, updatedBy: userId },
      id: candidateId,
    });
  };

  const jobTitle = candidate?.jobCandidate
    ?.map((item: any) => item?.jobInformation?.jobTitle)
    .filter(Boolean)
    .join(', ');

  const handleDownload = () => {
    if (candidate?.resumeUrl) {
      const link = document.createElement('a');
      link.href = candidate.resumeUrl;
      link.download = candidate?.documentName ?? 'CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div
        id="candidate-detail-loading"
        className="min-h-screen w-full bg-white p-6 font-['Calibri']"
        data-cy="candidate-detail-loading"
      >
        <Skeleton active />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div
        id="candidate-detail-not-found"
        className="min-h-screen w-full bg-white p-6 font-['Calibri']"
        data-cy="candidate-detail-not-found"
      >
        <p className="text-[14px] text-[rgba(0,0,0,0.7)]">
          Candidate not found.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-2 text-[14px] text-[#1677FF] underline"
        >
          Back to Job Details
        </button>
      </div>
    );
  }

  return (
    <div
      id="talent-acquisition-candidate-detail-page"
      className="min-h-screen w-full max-w-full bg-white font-['Calibri']"
      data-cy="talent-acquisition-candidate-detail-page"
    >
      {/* ── Page header — identical to job details page ─────── */}
      <header className="w-full">
        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="candidate-detail-back"
              onClick={handleBack}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-solid border-[#D9D9D9] bg-white text-[rgba(0,0,0,0.45)] hover:bg-[#FAFAFA]"
              data-cy="talent-acquisition-candidate-detail-back"
              aria-label="Back to jobs"
            >
              <IoIosArrowBack className="h-4 w-4" />
            </button>
            <CustomBreadcrumb
              data-cy="talent-acquisition-candidate-detail-breadcrumb"
              title={
                <span data-cy="talent-acquisition-candidate-detail-title">
                  Candidate Detail
                </span>
              }
              subtitle={
                <>
                  <span className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]">
                    Talent Acquisition
                  </span>
                  <span className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]">
                    {' '}
                    /{' '}
                  </span>
                  <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                    Candidates
                  </span>
                </>
              }
              subtitleClassName="!font-normal !text-inherit sm:!leading-snug"
              compact
              rootClassName="!py-0 !gap-1 min-w-0 flex-1"
              titleClassName="!text-2xl !font-bold !leading-tight !text-gray-900"
            />
          </div>
        </div>
        <TalentAcquisitionFullBleedHeaderRule
          className="mt-3 sm:mt-4"
          borderClassName="border-[#E5E7EB]"
          dataCy="talent-acquisition-candidate-detail-header-divider"
        />
      </header>

      <div className="overflow-x-hidden p-4 sm:p-6">
        {/* ── Summary card ───────────────────────────────────── */}
        <div
          id="candidate-detail-summary-card"
          className="mb-5 rounded-[8px] border border-solid border-[#D9D9D9] bg-white p-6"
          data-cy="candidate-detail-summary-card"
        >
          {/* top row: name + nav arrows */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id="candidate-detail-name"
                className="mb-3 text-[20px] font-bold leading-none text-black"
                data-cy="candidate-detail-name"
              >
                {candidate?.fullName ?? '—'}
              </h2>

              {/* Stage selector */}
              <Select
                id="candidate-detail-stage-select"
                data-cy="candidate-detail-stage-select"
                value={currentStageId ?? undefined}
                placeholder={currentStageTitle}
                onChange={handleStageChange}
                className="[&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!rounded-[6px] [&_.ant-select-selector]:!border [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-[#D9D9D9] [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-3 [&_.ant-select-selection-item]:!text-[14px] [&_.ant-select-selection-item]:!font-normal [&_.ant-select-selection-item]:!leading-[30px] [&_.ant-select-selection-item]:!text-black [&_.ant-select-selection-placeholder]:!text-[14px] [&_.ant-select-selection-placeholder]:!leading-[30px] [&_.ant-select-selection-placeholder]:!text-black"
                popupMatchSelectWidth={false}
              >
                {statusStage?.items?.map((stage: any) => (
                  <Select.Option
                    key={stage.id}
                    value={stage.id}
                    id={`candidate-detail-stage-option-${stage.id}`}
                    data-cy={`candidate-detail-stage-option-${stage.id}`}
                  >
                    {stage.title}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Prev / Next navigation */}
            <div
              className="flex shrink-0 items-center gap-1"
              id="candidate-detail-nav"
              data-cy="candidate-detail-nav"
            >
              <button
                type="button"
                id="candidate-detail-prev"
                onClick={() =>
                  prevCandidate &&
                  router.push(
                    `/recruitment/jobs/${jobId}/candidates/${prevCandidate.id}`,
                  )
                }
                disabled={!prevCandidate}
                className="flex h-6 w-6 items-center justify-center rounded-[17px] border border-solid border-[#D9D9D9] bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous candidate"
                data-cy="candidate-detail-prev"
              >
                <IoIosArrowBack className="h-3.5 w-3.5 text-[rgba(0,0,0,0.65)]" />
              </button>
              <button
                type="button"
                id="candidate-detail-next"
                onClick={() =>
                  nextCandidate &&
                  router.push(
                    `/recruitment/jobs/${jobId}/candidates/${nextCandidate.id}`,
                  )
                }
                disabled={!nextCandidate}
                className="flex h-6 w-6 items-center justify-center rounded-[17px] border border-solid border-[#D9D9D9] bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next candidate"
                data-cy="candidate-detail-next"
              >
                <IoIosArrowForward className="h-4 w-4 text-[rgba(0,0,0,0.65)]" />
              </button>
            </div>
          </div>

          {/* Contact info row */}
          <div
            id="candidate-detail-contact-grid"
            className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4"
            data-cy="candidate-detail-contact-grid"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]">
                Email
              </span>
              <span className="text-[14px] font-normal text-black">
                {candidate?.email ?? '—'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]">
                Phone Number
              </span>
              <span className="text-[14px] font-normal text-black">
                {candidate?.phone ?? '—'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]">
                Job
              </span>
              <span className="text-[14px] font-normal text-black">
                {jobTitle || '—'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]">
                CGPA
              </span>
              <span className="text-[14px] font-normal text-black">
                {candidate?.CGPA ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── CV file row ─────────────────────────────────────── */}
        {(candidate?.documentName || candidate?.resumeUrl) && (
          <div
            id="candidate-detail-cv-row"
            className="mb-4 flex items-center justify-between gap-4"
            data-cy="candidate-detail-cv-row"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-bold text-black">
                {candidate?.documentName ?? 'CV'}
              </span>
              <span className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]">
                3MB
              </span>
            </div>
            <button
              type="button"
              id="candidate-detail-download-cv"
              onClick={handleDownload}
              className="flex h-8 items-center gap-2 rounded-[6px] border border-solid border-[#D9D9D9] bg-white px-4 text-[14px] font-normal text-[rgba(0,0,0,0.7)] hover:border-[#1677FF] hover:text-[#1677FF]"
              data-cy="candidate-detail-download-cv"
            >
              <MdOutlineFileDownload size={16} />
              Download
            </button>
          </div>
        )}

        {/* ── CV / Cover-letter content ───────────────────────── */}
        <div
          id="candidate-detail-cv-content"
          className="overflow-x-hidden rounded-[8px] border border-solid border-[#D9D9D9] bg-white p-6"
          data-cy="candidate-detail-cv-content"
        >
          {candidate?.jobCandidate?.[0]?.coverLetter ? (
            <div
              className="max-w-full overflow-x-hidden text-[14px] font-normal leading-relaxed text-black"
              id="candidate-detail-cover-letter"
              data-cy="candidate-detail-cover-letter"
            >
              <HtmlStringDisplayer
                htmlString={candidate.jobCandidate[0].coverLetter}
              />
            </div>
          ) : (
            <p className="text-[14px] italic text-[rgba(0,0,0,0.45)]">
              No cover letter available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
