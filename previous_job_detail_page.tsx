'use client';

import React, { useState, useEffect } from 'react';
import { Card, Empty, Tag, Button, Avatar, Skeleton } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter, useParams } from 'next/navigation';
import { useAIJobMatchingStore } from '@/store/uistate/features/recruitment/ai-job-matching';
import {
  useGetAIMatchedCandidates,
  useGetAIMatchDetails,
} from '@/store/server/features/recruitment/ai-job-matching/queries';
import type { AIMatchedCandidate } from '@/store/server/features/recruitment/ai-job-matching/interface';

dayjs.extend(relativeTime);

const AIJobMatchingJobDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  const {
    matchDetailsDrawerOpen,
    setMatchDetailsDrawerOpen,
    selectedCandidateId,
    setSelectedCandidateId,
  } = useAIJobMatchingStore();

  const [selectedCandidate, setSelectedCandidate] =
    useState<AIMatchedCandidate | null>(null);

  // Control how many candidates we show in the left list
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  // Local toggles for "show more" behaviour in Skill Analysis
  const [showAllMatchedSkills, setShowAllMatchedSkills] = useState(false);
  const [showAllMissingSkills, setShowAllMissingSkills] = useState(false);
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [showAllConcerns, setShowAllConcerns] = useState(false);

  // Reset drawer state on page load or job change
  useEffect(() => {
    setMatchDetailsDrawerOpen(false);
    setSelectedCandidateId(null);
    setSelectedCandidate(null);
  }, [jobId, setMatchDetailsDrawerOpen, setSelectedCandidateId]);

  // Fetch ALL candidates from Azure
  const { data: matchResponse, isLoading: isMatchesLoading } =
    useGetAIMatchedCandidates(jobId, {}, Boolean(jobId));

  // Fetch match details for selected candidate
  const { data: matchDetails, isLoading: isDetailsLoading } =
    useGetAIMatchDetails(jobId, selectedCandidateId, matchDetailsDrawerOpen);

  // Extract job details from Azure response
  const jobDetails = matchResponse
    ? {
        jobTitle: matchResponse.jobTitle,
        department: matchResponse.department || 'N/A',
        // Use backend value when available; otherwise show a neutral label
        // instead of implying "Remote" when we don't actually know.
        location: matchResponse.location || 'Location not specified',
        createdAt: matchResponse.analysisTimestamp,
      }
    : null;

  // Use all candidates returned from Azure for the UI
  const allCandidates = matchResponse?.matchedCandidates ?? [];
  const sortedCandidates = [...allCandidates].sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  const MAX_VISIBLE_CANDIDATES = 5;
  const hasMoreCandidates = sortedCandidates.length > MAX_VISIBLE_CANDIDATES;
  const visibleCandidates = showAllCandidates
    ? sortedCandidates
    : sortedCandidates.slice(0, MAX_VISIBLE_CANDIDATES);

  // Always show top-ranked candidate on the right when data is available
  useEffect(() => {
    if (
      sortedCandidates.length > 0 &&
      !selectedCandidate &&
      !selectedCandidateId
    ) {
      const top = sortedCandidates[0];
      setSelectedCandidate(top);
      setSelectedCandidateId(top.candidateId);
      setMatchDetailsDrawerOpen(true);
    }
  }, [
    sortedCandidates,
    selectedCandidate,
    selectedCandidateId,
    setSelectedCandidateId,
    setMatchDetailsDrawerOpen,
  ]);

  // Helper values for detail panel
  const matchedSkillsAll =
    matchDetails?.matchedSkills ??
    matchDetails?.detailedAnalysis?.skillsMatch?.matchedSkills ??
    selectedCandidate?.matchedSkills ??
    [];
  const missingSkillsAll =
    matchDetails?.missingSkills ??
    matchDetails?.detailedAnalysis?.skillsMatch?.missingSkills ??
    [];
  const strengthsAll = matchDetails?.strengths ?? [];
  const concernsAll = matchDetails?.concerns ?? [];

  const matchedSkillsVisibleCount = showAllMatchedSkills
    ? matchedSkillsAll.length
    : 5;
  const missingSkillsVisibleCount = showAllMissingSkills
    ? missingSkillsAll.length
    : 5;
  const strengthsVisibleCount = showAllStrengths ? strengthsAll.length : 5;
  const concernsVisibleCount = showAllConcerns ? concernsAll.length : 5;

  const visibleMatchedSkills = matchedSkillsAll.slice(
    0,
    matchedSkillsVisibleCount,
  );
  const extraMatchedSkills = Math.max(
    0,
    matchedSkillsAll.length - visibleMatchedSkills.length,
  );

  const visibleMissingSkills = missingSkillsAll.slice(
    0,
    missingSkillsVisibleCount,
  );
  const extraMissingSkills = Math.max(
    0,
    missingSkillsAll.length - visibleMissingSkills.length,
  );

  const visibleStrengths = strengthsAll.slice(0, strengthsVisibleCount);
  const extraStrengths = Math.max(
    0,
    strengthsAll.length - visibleStrengths.length,
  );

  const visibleConcerns = concernsAll.slice(0, concernsVisibleCount);
  const extraConcerns = Math.max(
    0,
    concernsAll.length - visibleConcerns.length,
  );

  const handleOpenDetails = (candidate: AIMatchedCandidate) => {
    setSelectedCandidate(candidate);
    setSelectedCandidateId(candidate.candidateId);
    setMatchDetailsDrawerOpen(true);
  };

  if (!jobId) {
    return (
      <div
        data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-160"
        className="flex items-center justify-center min-h-96"
      >
        <Empty description="Job not found" />
      </div>
    );
  }

  if (isMatchesLoading) {
    return (
      <div
        data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-168"
        className="flex items-center justify-center min-h-screen bg-gray-50"
      >
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-cy="ai-job-detail-page">
      {/* Header */}
      <div
        className="bg-white px-6 py-4 border-b border-gray-200"
        data-cy="ai-job-detail-header"
      >
        <div
          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-181"
          className="flex items-center gap-4"
        >
          <Button
            type="text"
            onClick={() => router.push('/recruitment/ai-job-matching')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            G�� Back
          </Button>
          <div
            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-189"
            className="flex-1"
          >
            <h1
              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-h1-190"
              className="text-xl font-semibold text-gray-900"
            >
              AI Job Matching
            </h1>
            <p
              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-193"
              className="text-sm text-gray-500"
            >
              Match candidates to jobs using AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      <div
        data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-200"
        className="p-6 space-y-6"
      >
        {/* Job Info Card */}
        {jobDetails && (
          <Card
            className="rounded-2xl border border-gray-200 shadow-sm"
            data-cy="ai-job-detail-summary-card"
          >
            <div
              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-207"
              className="flex items-start justify-between mb-4"
            >
              <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-208">
                <h2
                  data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-h2-209"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {jobDetails.jobTitle}
                </h2>
                <div
                  data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-212"
                  className="flex flex-wrap items-center gap-4 text-sm text-gray-600"
                >
                  {jobDetails.location && (
                    <span data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-213">
                      {jobDetails.location}
                    </span>
                  )}
                  <span data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-214">
                    G��
                  </span>
                  <span data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-215">
                    Posted {dayjs(jobDetails.createdAt).format('DD MMM YYYY')}
                  </span>
                </div>
              </div>
              <div
                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-220"
                className="flex flex-col items-end gap-2"
              >
                <Tag color="green" className="text-sm px-3 py-1 rounded">
                  Active
                </Tag>
                <span
                  data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-224"
                  className="text-xs text-gray-500"
                >
                  Last Analyzed G��{' '}
                  {dayjs(matchResponse?.analysisTimestamp).fromNow()}
                </span>
              </div>
            </div>
            {/* No hard-coded description: job description can be added here once available from backend */}
          </Card>
        )}

        {/* Candidates + Detail layout */}
        <div
          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-235"
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Candidates List - Left */}
          <div
            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-237"
            className="w-full lg:w-1/2 space-y-4"
          >
            {sortedCandidates.length === 0 ? (
              <Empty description="No candidates available yet" />
            ) : (
              visibleCandidates.map((candidate) => {
                const isSelected =
                  selectedCandidateId &&
                  selectedCandidateId === candidate.candidateId;
                const borderColor = isSelected
                  ? 'border-green-500'
                  : 'border-gray-200';
                const bgColor = isSelected ? 'bg-green-50' : 'bg-white';
                const scoreColor = isSelected
                  ? 'text-green-700'
                  : 'text-gray-700';

                // Always give a subtle green hover to make interaction obvious
                const hoverClasses =
                  'hover:border-green-400 hover:bg-green-50/60';

                const primaryReason =
                  (candidate.matchReasons && candidate.matchReasons[0]) ||
                  'No summary available yet for this candidate.';

                const topMatchedSkills =
                  candidate.matchedSkills?.slice(0, 5) ?? [];

                return (
                  <Card
                    key={candidate.candidateId}
                    data-cy={`ai-candidate-card-${candidate.candidateId}`}
                    className={`rounded-2xl border-2 ${borderColor} ${bgColor} cursor-pointer hover:shadow-lg ${hoverClasses} transition-all`}
                    onClick={() => handleOpenDetails(candidate)}
                  >
                    <div
                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-271"
                      className="flex items-start gap-4"
                    >
                      {/* Avatar */}
                      <Avatar size={56} className="bg-blue-500 flex-shrink-0" />

                      {/* Candidate Info */}
                      <div
                        data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-276"
                        className="flex-1 min-w-0"
                      >
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-277"
                          className="flex items-start justify-between mb-3"
                        >
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-278"
                            className="flex-1 min-w-0"
                          >
                            <h3
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-h3-279"
                              className="text-lg font-semibold text-gray-900"
                            >
                              {candidate.candidate.fullName}
                            </h3>
                            <p
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-282"
                              className="text-sm text-gray-600"
                            >
                              {candidate.candidate.email}
                            </p>
                            <p
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-285"
                              className="text-sm text-gray-600"
                            >
                              {candidate.candidate.phone}
                            </p>
                          </div>
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-289"
                            className="text-right flex-shrink-0 ml-4"
                          >
                            <div
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-290"
                              className={`text-3xl font-bold ${scoreColor}`}
                            >
                              {candidate.matchScore}%
                            </div>
                          </div>
                        </div>

                        {/* Short summary from Azure matchReasons */}
                        <p
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-297"
                          className="text-sm text-gray-700 mb-4"
                        >
                          {primaryReason}
                        </p>

                        {/* Matched skills from Azure (up to 5) */}
                        {topMatchedSkills.length > 0 && (
                          <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-303">
                            <div
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-304"
                              className="text-xs font-medium text-gray-700 mb-2"
                            >
                              Matched skills
                            </div>
                            <div
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-307"
                              className="flex flex-wrap gap-2"
                            >
                              {topMatchedSkills.map((skill, idx) => (
                                <Tag
                                  key={idx}
                                  color="blue"
                                  className="text-xs px-3 py-1 rounded-full m-0 max-w-full truncate"
                                >
                                  {skill}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}

            {hasMoreCandidates && !showAllCandidates && (
              <Button
                type="default"
                className="w-full mt-2 border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => setShowAllCandidates(true)}
              >
                View more candidates (
                {sortedCandidates.length - MAX_VISIBLE_CANDIDATES} more)
              </Button>
            )}
          </div>

          {/* Details Panel - Right (only when there are candidates) */}
          {sortedCandidates.length > 0 && (
            <div
              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-341"
              className="w-full lg:w-1/2 shrink-0"
            >
              <Card
                className="rounded-2xl border border-gray-200 shadow-sm h-full"
                data-cy="ai-candidate-detail-panel"
              >
                {!selectedCandidate || isDetailsLoading || !matchDetails ? (
                  <div
                    className="flex flex-col items-center justify-center h-full text-center space-y-3"
                    data-cy="ai-candidate-detail-empty"
                  >
                    {isDetailsLoading ? (
                      <Skeleton />
                    ) : (
                      <>
                        <p
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-355"
                          className="text-sm font-medium text-gray-700"
                        >
                          Select a candidate on the left to view AI match
                          details
                        </p>
                        <p
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-359"
                          className="text-xs text-gray-500"
                        >
                          You can compare different candidates by clicking their
                          cards.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-367"
                    className="h-full flex flex-col"
                  >
                    {/* Header */}
                    <div
                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-369"
                      className="pb-4 border-b border-gray-200"
                    >
                      <div
                        data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-370"
                        className="flex items-start justify-between gap-3"
                      >
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-371"
                          className="flex items-center gap-3 flex-1"
                        >
                          <Avatar
                            size={48}
                            className="bg-blue-500 flex-shrink-0"
                          />
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-376"
                            className="flex-1 min-w-0"
                          >
                            <h3
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-h3-377"
                              className="text-lg font-semibold text-gray-900 truncate"
                            >
                              {selectedCandidate.candidate.fullName ||
                                'Name not provided'}
                            </h3>
                            <div
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-381"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                            >
                              <span data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-382">
                                {selectedCandidate.matchScore}% Overall Match
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="primary"
                          className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                          href={
                            selectedCandidate.candidate.resumeUrl || undefined
                          }
                          disabled={!selectedCandidate.candidate.resumeUrl}
                          target={
                            selectedCandidate.candidate.resumeUrl
                              ? '_blank'
                              : undefined
                          }
                          data-cy="ai-candidate-resume-button"
                        >
                          Resume
                        </Button>
                      </div>

                      {/* Contact Info */}
                      <div
                        data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-407"
                        className="mt-4 space-y-2 text-sm text-gray-700"
                      >
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-408"
                          className="flex items-center gap-2"
                        >
                          <span
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-409"
                            className="text-gray-400"
                          >
                            @
                          </span>
                          <span
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-410"
                            className="truncate"
                          >
                            {selectedCandidate.candidate.email ||
                              'Email not provided'}
                          </span>
                        </div>
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-415"
                          className="flex items-center gap-2"
                        >
                          <span
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-416"
                            className="text-gray-400"
                          >
                            =��P
                          </span>
                          <span data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-417">
                            {selectedCandidate.candidate.phone ||
                              'Phone number not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div
                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-426"
                      className="flex-1 overflow-y-auto pt-4 space-y-6"
                    >
                      {/* Candidate Overview (from Azure data) */}
                      <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-428">
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-429"
                          className="flex items-center gap-2 mb-3"
                        >
                          <span
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-430"
                            className="text-gray-600"
                          >
                            =���
                          </span>
                          <span
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-431"
                            className="font-semibold text-gray-900"
                          >
                            Candidate overview
                          </span>
                        </div>
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-435"
                          className="space-y-2 text-sm text-gray-700"
                        >
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-436"
                            className="flex items-center justify-between gap-2"
                          >
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-437"
                              className="text-gray-600"
                            >
                              Stage
                            </span>
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-438"
                              className="font-medium"
                            >
                              {selectedCandidate.jobCandidate
                                ?.applicantStatusStage?.title ||
                                'No stage information'}
                            </span>
                          </div>
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-444"
                            className="flex items-center justify-between gap-2"
                          >
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-445"
                              className="text-gray-600"
                            >
                              Location
                            </span>
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-446"
                              className="font-medium"
                            >
                              {[
                                matchDetails?.candidate?.city,
                                matchDetails?.candidate?.country,
                              ]
                                .filter(Boolean)
                                .join(', ') || 'Location not provided'}
                            </span>
                          </div>
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-455"
                            className="flex items-center justify-between gap-2"
                          >
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-456"
                              className="text-gray-600"
                            >
                              CGPA
                            </span>
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-457"
                              className="font-medium"
                            >
                              {matchDetails?.candidate?.CGPA != null
                                ? matchDetails.candidate.CGPA
                                : 'Not provided in resume'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Experience Section (from Azure blob data) */}
                      <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-467">
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-468"
                          className="border-t border-gray-200"
                        />
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-469"
                          className="pt-4"
                        >
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-470"
                            className="flex items-center gap-2 mb-3"
                          >
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-471"
                              className="text-gray-700"
                            >
                              =��+
                            </span>
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-472"
                              className="font-semibold text-gray-900"
                            >
                              Experience
                            </span>
                          </div>
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-476"
                            className="space-y-3 text-sm text-gray-700"
                          >
                            {(matchDetails?.candidate?.experience?.length ??
                              0) === 0 && (
                              <p
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-479"
                                className="text-xs text-gray-500"
                              >
                                No experience information provided.
                              </p>
                            )}
                            {(matchDetails?.candidate?.experience ?? []).map(
                              (exp, idx) => (
                                <div
                                  key={idx}
                                  data-cy={`previous-job-detail-page-tsx-previous_job_detail_page-div-694-${idx}`}
                                  className="flex items-start justify-between gap-2"
                                >
                                  <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-489">
                                    <p
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-490"
                                      className="font-medium text-gray-900"
                                    >
                                      {exp.role || 'Role not specified'}
                                    </p>
                                    <p
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-493"
                                      className="text-gray-600"
                                    >
                                      {exp.company || 'Company not specified'}
                                    </p>
                                  </div>
                                  <span
                                    data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-497"
                                    className="text-xs text-gray-500 whitespace-nowrap"
                                  >
                                    {[exp.startDate, exp.endDate]
                                      .filter(Boolean)
                                      .join(' - ') || 'Dates not provided'}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Education Section (from Azure blob data) */}
                      <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-510">
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-511"
                          className="border-t border-gray-200"
                        />
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-512"
                          className="pt-4"
                        >
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-513"
                            className="flex items-center gap-2 mb-3"
                          >
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-514"
                              className="text-gray-700"
                            >
                              =���
                            </span>
                            <span
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-515"
                              className="font-semibold text-gray-900"
                            >
                              Education
                            </span>
                          </div>
                          <div
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-519"
                            className="space-y-3 text-sm text-gray-700"
                          >
                            {(matchDetails?.candidate?.education?.length ??
                              0) === 0 && (
                              <p
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-522"
                                className="text-xs text-gray-500"
                              >
                                No education information provided.
                              </p>
                            )}
                            {(matchDetails?.candidate?.education ?? []).map(
                              (edu, idx) => (
                                <div
                                  key={idx}
                                  data-cy={`previous-job-detail-page-tsx-previous_job_detail_page-div-769-${idx}`}
                                  className="flex items-start justify-between gap-2"
                                >
                                  <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-532">
                                    <p
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-533"
                                      className="font-medium text-gray-900"
                                    >
                                      {edu.degree || 'Education'}
                                    </p>
                                    <p
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-536"
                                      className="text-gray-600"
                                    >
                                      {edu.institution ||
                                        'Institution not specified'}
                                    </p>
                                  </div>
                                  <span
                                    data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-541"
                                    className="text-xs text-gray-500 whitespace-nowrap"
                                  >
                                    {[edu.startYear, edu.endYear]
                                      .filter(Boolean)
                                      .join(' - ') || 'Years not provided'}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-553"
                        className="border-t border-gray-200"
                      />

                      {/* Skill Analysis Section */}
                      <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-556">
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-557"
                          className="flex items-center gap-2 mb-3"
                        >
                          <span
                            data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-558"
                            className="font-semibold text-gray-900"
                          >
                            Skill Analysis
                          </span>
                        </div>
                        <div
                          data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-562"
                          className="space-y-2 text-sm"
                        >
                          {/* Matched skills */}
                          {visibleMatchedSkills.length > 0 && (
                            <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-565">
                              <p
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-566"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Matched skills
                              </p>
                              <div
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-569"
                                className="flex flex-wrap gap-2"
                              >
                                {visibleMatchedSkills.map((skill, idx) => (
                                  <div
                                    key={`matched-skill-${idx}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1"
                                    data-cy="ai-skill-matched"
                                  >
                                    <span
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-576"
                                      className="text-green-600 text-xs"
                                    >
                                      G��
                                    </span>
                                    <span
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-579"
                                      className="text-gray-800 text-xs"
                                    >
                                      {skill}
                                    </span>
                                  </div>
                                ))}
                                {extraMatchedSkills > 0 &&
                                  !showAllMatchedSkills && (
                                    <button
                                      type="button"
                                      className="text-xs font-medium text-blue-600 hover:underline"
                                      data-cy="ai-skill-matched-more"
                                      onClick={() =>
                                        setShowAllMatchedSkills(true)
                                      }
                                    >
                                      +{extraMatchedSkills} more
                                    </button>
                                  )}
                                {showAllMatchedSkills &&
                                  matchedSkillsAll.length > 5 && (
                                    <button
                                      type="button"
                                      className="text-xs font-medium text-blue-600 hover:underline"
                                      data-cy="ai-skill-matched-less"
                                      onClick={() =>
                                        setShowAllMatchedSkills(false)
                                      }
                                    >
                                      Show less
                                    </button>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* Missing skills */}
                          {visibleMissingSkills.length > 0 && (
                            <div data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-616">
                              <p
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-617"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Missing skills
                              </p>
                              <div
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-620"
                                className="flex flex-wrap gap-2"
                              >
                                {visibleMissingSkills.map((skill, idx) => (
                                  <div
                                    key={`missing-skill-${idx}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1"
                                    data-cy="ai-skill-missing"
                                  >
                                    <span
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-627"
                                      className="text-red-600 text-xs"
                                    >
                                      !
                                    </span>
                                    <span
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-span-630"
                                      className="text-gray-800 text-xs"
                                    >
                                      {skill}
                                    </span>
                                  </div>
                                ))}
                                {extraMissingSkills > 0 &&
                                  !showAllMissingSkills && (
                                    <button
                                      type="button"
                                      className="text-xs font-medium text-blue-600 hover:underline"
                                      data-cy="ai-skill-missing-more"
                                      onClick={() =>
                                        setShowAllMissingSkills(true)
                                      }
                                    >
                                      +{extraMissingSkills} more
                                    </button>
                                  )}
                                {showAllMissingSkills &&
                                  missingSkillsAll.length > 5 && (
                                    <button
                                      type="button"
                                      className="text-xs font-medium text-blue-600 hover:underline"
                                      data-cy="ai-skill-missing-less"
                                      onClick={() =>
                                        setShowAllMissingSkills(false)
                                      }
                                    >
                                      Show less
                                    </button>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* Strengths */}
                          {visibleStrengths.length > 0 && (
                            <div
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-667"
                              className="pt-1"
                            >
                              <p
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-668"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Strengths
                              </p>
                              <div
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-671"
                                className="space-y-1.5"
                              >
                                {visibleStrengths.map((item, idx) => (
                                  <div
                                    key={`strength-${idx}`}
                                    className="flex items-start gap-2"
                                    data-cy="ai-strength"
                                  >
                                    <div
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-678"
                                      className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500"
                                    />
                                    <p
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-679"
                                      className="text-xs text-gray-800"
                                    >
                                      {item}
                                    </p>
                                  </div>
                                ))}
                                {extraStrengths > 0 && !showAllStrengths && (
                                  <button
                                    type="button"
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                    data-cy="ai-strength-more"
                                    onClick={() => setShowAllStrengths(true)}
                                  >
                                    +{extraStrengths} more
                                  </button>
                                )}
                                {showAllStrengths &&
                                  strengthsAll.length > 5 && (
                                    <button
                                      type="button"
                                      className="text-xs font-medium text-blue-600 hover:underline"
                                      data-cy="ai-strength-less"
                                      onClick={() => setShowAllStrengths(false)}
                                    >
                                      Show less
                                    </button>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* Concerns */}
                          {visibleConcerns.length > 0 && (
                            <div
                              data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-711"
                              className="pt-1"
                            >
                              <p
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-712"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Areas to review
                              </p>
                              <div
                                data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-715"
                                className="space-y-1.5"
                              >
                                {visibleConcerns.map((item, idx) => (
                                  <div
                                    key={`concern-${idx}`}
                                    className="flex items-start gap-2"
                                    data-cy="ai-concern"
                                  >
                                    <div
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-div-722"
                                      className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"
                                    />
                                    <p
                                      data-cy="desktop-pep-organizational-structure-and-employee-information-frontend-previous-job-detail-page-tsx-previous_job_detail_page-p-723"
                                      className="text-xs text-gray-800"
                                    >
                                      {item}
                                    </p>
                                  </div>
                                ))}
                                {extraConcerns > 0 && !showAllConcerns && (
                                  <button
                                    type="button"
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                    data-cy="ai-concern-more"
                                    onClick={() => setShowAllConcerns(true)}
                                  >
                                    +{extraConcerns} more
                                  </button>
                                )}
                                {showAllConcerns && concernsAll.length > 5 && (
                                  <button
                                    type="button"
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                    data-cy="ai-concern-less"
                                    onClick={() => setShowAllConcerns(false)}
                                  >
                                    Show less
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIJobMatchingJobDetailPage;
