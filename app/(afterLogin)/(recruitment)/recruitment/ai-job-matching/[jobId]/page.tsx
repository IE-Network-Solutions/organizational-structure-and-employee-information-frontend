'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Empty,
  Progress,
  Spin,
  Tag,
  Button,
  Modal,
  Pagination,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter, useParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import JobApplicantsList from '../_components/JobApplicantsList';
import { useAIJobMatchingStore } from '@/store/uistate/features/recruitment/ai-job-matching';
import {
  useGetAIMatchedCandidates,
  useGetAIMatchDetails,
} from '@/store/server/features/recruitment/ai-job-matching/queries';

dayjs.extend(relativeTime);

const JOB_CANDIDATES_PER_PAGE = 5;

const AIJobMatchingJobDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  const {
    minMatchScore,
    setMinMatchScore,
    matchDetailsDrawerOpen,
    setMatchDetailsDrawerOpen,
    selectedCandidateId,
    setSelectedCandidateId,
  } = useAIJobMatchingStore();

  const [candidatePage, setCandidatePage] = useState(1);

  // Fetch ALL candidates from Azure (no filtering - Azure returns all analyzed candidates)
  const {
    data: matchResponse,
    isLoading: isMatchesLoading,
  } = useGetAIMatchedCandidates(
    jobId,
    {}, // No minMatchScore - Azure returns ALL candidates
    Boolean(jobId),
  );

  // Extract job details from Azure response (no backend call needed)
  const jobDetails = matchResponse ? {
    jobTitle: matchResponse.jobTitle,
    jobStatus: 'active',
    department: { name: matchResponse.department || 'N/A' },
    jobLocation: matchResponse.location || 'Remote',
    createdAt: matchResponse.analysisTimestamp,
  } : null;
  
  const isJobLoading = isMatchesLoading;

  const {
    data: matchDetails,
    isLoading: isDetailsLoading,
  } = useGetAIMatchDetails(
    jobId,
    selectedCandidateId,
    matchDetailsDrawerOpen,
  );

  // Azure returns ALL candidates - filter by threshold client-side
  const allCandidates = matchResponse?.matchedCandidates ?? [];
  const matchedCandidates = allCandidates.filter(
    (candidate) => candidate.matchScore >= minMatchScore,
  );

  // Reset pagination to page 1 when threshold changes
  useEffect(() => {
    setCandidatePage(1);
  }, [minMatchScore]);

  const paginatedCandidates = matchedCandidates.slice(
    (candidatePage - 1) * JOB_CANDIDATES_PER_PAGE,
    candidatePage * JOB_CANDIDATES_PER_PAGE,
  );

  const handleOpenDetails = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setMatchDetailsDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setMatchDetailsDrawerOpen(false);
    setSelectedCandidateId(null);
  };

  const renderDetailsModal = () => (
    <Modal
      title="AI Match Analysis"
      open={matchDetailsDrawerOpen}
      onCancel={handleCloseDetails}
      footer={null}
      width={640}
      centered
    >
      {isDetailsLoading && (
        <div className="flex items-center justify-center h-40">
          <Spin />
        </div>
      )}
      {!isDetailsLoading && !matchDetails && (
        <Empty description="No analysis available" />
      )}
      {!isDetailsLoading && matchDetails && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500">Overall Match Score</p>
            <div className="flex items-center gap-3 mt-2">
              <Progress
                type="circle"
                percent={matchDetails.matchScore}
                width={72}
                strokeColor="#4F46E5"
              />
              <div>
                <p className="text-sm text-gray-700">
                  Candidate is a strong match for this role based on skills,
                  experience, education, and location.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Last analyzed:{' '}
                  {dayjs(matchDetails.analysisTimestamp).format(
                    'DD MMM YYYY, HH:mm',
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-indigo-50">
              <p className="font-semibold text-indigo-900 mb-1">Skills</p>
              <p className="text-gray-600">
                {matchDetails.detailedAnalysis.skillsMatch.score}% match
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <p className="font-semibold text-emerald-900 mb-1">Experience</p>
              <p className="text-gray-600">
                {matchDetails.detailedAnalysis.experienceMatch.score}% match
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50">
              <p className="font-semibold text-sky-900 mb-1">Education</p>
              <p className="text-gray-600">
                {matchDetails.detailedAnalysis.educationMatch.score}% match
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <p className="font-semibold text-amber-900 mb-1">Location</p>
              <p className="text-gray-600">
                {matchDetails.detailedAnalysis.locationMatch.score}% match
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Recommended next steps
            </p>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
              {matchDetails.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-semibold text-gray-700 mb-2">Strengths</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {matchDetails.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Concerns</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {matchDetails.concerns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Empty description="Job not found" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#f5f5f5]">
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CustomBreadcrumb
          title="AI Job Matching"
          subtitle={`Job details & AI matches`}
        />
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/recruitment/ai-job-matching')}
          className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-800"
        >
          Back to all jobs
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
            {isJobLoading ? (
              <div className="flex items-center justify-center h-40">
                <Spin />
              </div>
            ) : !jobDetails ? (
              <Empty description="Job details not found" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                      {jobDetails.jobTitle}
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                      {jobDetails.department?.name || '—'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {jobDetails.jobLocation || jobDetails.location || '—'}
                      </span>
                      {jobDetails.createdAt && (
                        <span className="flex items-center gap-1">
                          <MdOutlineAccessTime className="text-gray-400" />
                          Posted{' '}
                          {dayjs(jobDetails.createdAt).format('DD MMM YYYY')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Tag
                    color={
                      jobDetails.jobStatus?.toLowerCase() === 'active'
                        ? 'green'
                        : 'default'
                    }
                    className="text-xs"
                  >
                    {jobDetails.jobStatus || 'Draft'}
                  </Tag>
                </div>

                {matchResponse && (
                  <div className="grid grid-cols-2 gap-3 text-xs mt-2">
                    <Card size="small" className="rounded-xl">
                      <p className="text-[11px] text-gray-500">AI matches</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        {matchResponse.totalMatches}
                      </p>
                    </Card>
                    <Card size="small" className="rounded-xl">
                      <p className="text-[11px] text-gray-500">
                        Last analyzed
                      </p>
                      <p className="text-xs font-medium text-gray-800">
                        {matchResponse.analysisTimestamp
                          ? dayjs(matchResponse.analysisTimestamp).fromNow()
                          : '—'}
                      </p>
                    </Card>
                  </div>
                )}

                <div className="mt-3">
                  <p className="text-[11px] text-gray-500 mb-1">
                    Minimum match score
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                    <span>Broader</span>
                    <span className="font-semibold text-gray-800">
                      {minMatchScore}%
                    </span>
                    <span>Stricter</span>
                  </div>
                </div>
              </div>
            )}
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  AI Matched Candidates
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ranked candidates based on skills, experience, and fit for
                  this job.
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {matchedCandidates.length > 0
                  ? `${matchedCandidates.length} candidates above ${minMatchScore}%`
                  : 'No candidates match the current filter'}
              </div>
            </div>

            {isMatchesLoading ? (
              <div className="flex items-center justify-center py-10">
                <Spin />
              </div>
            ) : matchedCandidates.length === 0 ? (
              <div className="py-8">
                <Empty description="No AI matches found for this job" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedCandidates.map((candidate) => {
                    const stage =
                      candidate.jobCandidate?.applicantStatusStage?.title ||
                      '—';
                    const location =
                      candidate.candidate.city ||
                      candidate.candidate.country ||
                      '—';
                    const score = candidate.matchScore;

                    return (
                      <Card
                        key={candidate.candidateId}
                        className="rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow duration-200"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">
                                {candidate.candidate.fullName || '—'}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {location}
                              </p>
                            </div>
                            <Tag color="blue" className="text-[11px]">
                              {stage}
                            </Tag>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <div className="flex-1 mr-3">
                              <p className="text-[11px] text-gray-500 mb-1">
                                Match score
                              </p>
                              <Progress
                                percent={score}
                                size="small"
                                showInfo={false}
                                strokeColor={
                                  score >= 80
                                    ? '#22c55e'
                                    : score >= 65
                                      ? '#4f46e5'
                                      : '#f59e0b'
                                }
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {score}%
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {(candidate.matchReasons || [])
                              .slice(0, 3)
                              .map((reason) => (
                                <Tag
                                  key={reason}
                                  color="default"
                                  className="text-[11px]"
                                >
                                  {reason}
                                </Tag>
                              ))}
                          </div>

                          <div className="mt-2 flex justify-end">
                            <Button
                              size="small"
                              type="link"
                              onClick={() =>
                                handleOpenDetails(candidate.candidateId)
                              }
                            >
                              View insight
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {matchedCandidates.length > JOB_CANDIDATES_PER_PAGE && (
                  <div className="mt-3 flex justify-center">
                    <Pagination
                      size="small"
                      current={candidatePage}
                      pageSize={JOB_CANDIDATES_PER_PAGE}
                      total={matchedCandidates.length}
                      onChange={(page) => setCandidatePage(page)}
                    />
                  </div>
                )}
              </>
            )}
        </Card>

        {/* JobApplicantsList removed - AI matching uses Azure Function data only */}
      </div>

      {renderDetailsModal()}
    </div>
  );
};

export default AIJobMatchingJobDetailPage;


