'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IoIosArrowBack } from 'react-icons/io';
import { Button, Tabs, Skeleton } from 'antd';
import { MdOutlineFileDownload } from 'react-icons/md';
import {
  useGetCandidateById,
  useGetCandidates,
} from '@/store/server/features/recruitment/candidate/queries';
import CoverLetter from '../../_components/tabs/coverLetter';

const CandidateDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const candidateId = params?.candidateId as string;

  const { data: candidate, isLoading } = useGetCandidateById(candidateId);
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

  const stageTitle =
    candidate?.jobCandidate?.[0]?.applicantStatusStage?.title ?? 'Applied';

  const items = [
    {
      key: '1',
      label: (
        <span
          id="candidate-detail-tab-cover-letter"
          className="font-semibold"
          data-cy="candidate-detail-tab-cover-letter"
        >
          Cover Letter
        </span>
      ),
      children: <CoverLetter selectedCandidate={candidate} />,
    },
  ];

  if (isLoading) {
    return (
      <div
        id="candidate-detail-loading"
        className="min-h-screen w-full p-4 sm:p-6 bg-[#f9fafb]"
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
        className="min-h-screen w-full p-4 sm:p-6 bg-[#f9fafb]"
        data-cy="candidate-detail-not-found"
      >
        <p className="text-gray-500">Candidate not found.</p>
        <Button
          type="link"
          id="candidate-detail-back-to-jobs"
          onClick={handleBack}
          data-cy="candidate-detail-back-to-jobs"
        >
          Back to Job Details
        </Button>
      </div>
    );
  }

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

  const jobTitle = candidate?.jobCandidate
    ?.map((item: any) => item?.jobInformation?.jobTitle)
    .filter(Boolean)
    .join(', ');

  return (
    <div
      id="talent-acquisition-candidate-detail-page"
      className="min-h-screen w-full p-4 sm:p-6 bg-[#f9fafb]"
      data-cy="talent-acquisition-candidate-detail-page"
    >
      <div
        className="flex items-center gap-3 mb-2"
        id="candidate-detail-header"
        data-cy="candidate-detail-header"
      >
        <button
          type="button"
          id="candidate-detail-back"
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shrink-0"
          data-cy="talent-acquisition-candidate-detail-back"
        >
          <IoIosArrowBack className="w-5 h-5" />
        </button>
        <div className="flex flex-col min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 font-['Manrope']">
            Job Details
          </h1>
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-slate-500 font-medium font-['Manrope'] text-left hover:underline"
          >
            Talent Acquisition / Jobs
          </button>
        </div>
      </div>

      <div
        id="candidate-detail-summary-card"
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
        data-cy="candidate-detail-summary-card"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2
              id="candidate-detail-name"
              className="text-xl font-bold text-gray-900 mb-2"
              data-cy="candidate-detail-name"
            >
              {candidate?.fullName ?? '—'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                id="candidate-detail-status"
                className="inline-flex items-center text-xs font-medium rounded-md px-3 py-1 text-gray-700 border border-gray-200 bg-transparent"
                data-cy="candidate-detail-status"
              >
                {stageTitle}
              </span>
            </div>
            <div
              id="candidate-detail-contact-grid"
              className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm"
              data-cy="candidate-detail-contact-grid"
            >
              <div className="flex flex-col">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-900 mt-0.5">
                  {candidate?.email ?? '—'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Phone Number:</span>
                <span className="text-gray-900 mt-0.5">
                  {candidate?.phone ?? '—'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Job:</span>
                <span className="text-gray-900 mt-0.5">{jobTitle || '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">CGPA:</span>
                <span className="text-gray-900 mt-0.5">
                  {candidate?.CGPA ?? '—'}
                </span>
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-1 shrink-0"
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
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous candidate"
              data-cy="candidate-detail-prev"
            >
              <IoIosArrowBack className="w-4 h-4" />
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
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next candidate"
              data-cy="candidate-detail-next"
            >
              <IoIosArrowBack className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>

        {(candidate?.documentName || candidate?.resumeUrl) && (
          <div
            className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2"
            id="candidate-detail-cv"
            data-cy="candidate-detail-cv"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {candidate?.documentName ?? 'CV'}
              </span>
              <span className="text-xs text-gray-500">3MB</span>
            </div>
            <Button
              type="default"
              id="candidate-detail-download-cv"
              icon={<MdOutlineFileDownload size={18} />}
              onClick={handleDownload}
              className="flex items-center gap-2"
              data-cy="candidate-detail-download-cv"
            >
              Download
            </Button>
          </div>
        )}
      </div>

      <div
        id="candidate-detail-tabs"
        className="bg-white rounded-lg border border-gray-200 p-6 talent-acquisition-candidate-detail-tabs"
        data-cy="candidate-detail-tabs"
      >
        <Tabs
          items={items}
          size="small"
          tabBarStyle={{ marginBottom: 16 }}
          className="[&_.ant-tabs-tab]:font-semibold [&_.ant-tabs-tab-active]:font-semibold [&_.ant-tabs-ink-bar]:!bg-[#6366F1] [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#6366F1]"
        />
      </div>
    </div>
  );
};

export default CandidateDetailPage;
