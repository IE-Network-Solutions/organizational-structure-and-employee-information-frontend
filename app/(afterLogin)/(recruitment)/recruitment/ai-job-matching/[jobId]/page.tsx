'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Skeleton, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter, useParams } from 'next/navigation';
import { useAIJobMatchingStore } from '@/store/uistate/features/recruitment/ai-job-matching';
import {
  useGetAIMatchedCandidates,
  useGetAIMatchDetails,
} from '@/store/server/features/recruitment/ai-job-matching/queries';
import type { AIMatchedCandidate } from '@/store/server/features/recruitment/ai-job-matching/interface';
import EmptyState from '@/components/empty';

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
        // Use jobPostedAt from function response (preferred) or fallback to postedAt
        postedAt: matchResponse.jobPostedAt || matchResponse.postedAt || null,
        // Keep analysis timestamp separately for "Last analyzed" label
        analyzedAt: matchResponse.analysisTimestamp,
        jobStatus: matchResponse.jobStatus,
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
        id="ai-job-detail-not-found"
        data-cy="ai-job-detail-not-found"
        className="flex items-center justify-center min-h-96"
      >
        <div
          id="ai-job-detail-not-found-empty"
          data-cy="ai-job-detail-not-found-empty"
        >
          <EmptyState />
        </div>
      </div>
    );
  }

  if (isMatchesLoading) {
    return (
      <div
        id="ai-job-detail-loading"
        data-cy="ai-job-detail-loading"
        className="flex items-center justify-center min-h-screen bg-gray-50"
      >
        <div
          id="ai-job-detail-loading-spinner"
          data-cy="ai-job-detail-loading-spinner"
        >
          <Skeleton active />
        </div>
      </div>
    );
  }

  return (
    <div
      id="ai-job-detail-page"
      className="min-h-screen bg-gray-50"
      data-cy="ai-job-detail-page"
    >
      {/* Header */}
      <div
        id="ai-job-detail-header"
        className="bg-white px-6 py-4 border-b border-gray-200"
        data-cy="ai-job-detail-header"
      >
        <div
          data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-209"
          className="flex items-center gap-4"
        >
          <Button
            id="ai-job-detail-back-button"
            data-cy="ai-job-detail-back-button"
            type="text"
            onClick={() => router.push('/recruitment/ai-job-matching')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>
          <div
            data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-219"
            id="ai-job-detail-header-content"
            className="flex-1"
          >
            <h1
              id="ai-job-detail-title"
              data-cy="ai-job-detail-title"
              className="text-xl font-semibold text-gray-900"
            >
              AI Job Matching
            </h1>
            <p
              id="ai-job-detail-subtitle"
              data-cy="ai-job-detail-subtitle"
              className="text-sm text-gray-500"
            >
              Match candidates to jobs using AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      <div
        id="ai-job-detail-content"
        data-cy="ai-job-detail-content"
        className="p-6 space-y-6"
      >
        {/* Job Info Card */}
        {jobDetails && (
          <Card
            id="ai-job-detail-summary-card"
            className="rounded-2xl border border-gray-200 shadow-sm"
            data-cy="ai-job-detail-summary-card"
          >
            <div
              data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-250"
              className="flex items-start justify-between mb-4"
            >
              <div
                id="ai-job-detail-summary-left"
                data-cy="ai-job-detail-summary-left"
              >
                <h2
                  id="ai-job-detail-summary-title"
                  data-cy="ai-job-detail-summary-title"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {jobDetails.jobTitle}
                </h2>
                <div
                  id="ai-job-detail-summary-meta"
                  data-cy="ai-job-detail-summary-meta"
                  className="flex flex-wrap items-center gap-4 text-sm text-gray-600"
                >
                  {jobDetails.location && (
                    <span
                      id="ai-job-detail-summary-location"
                      data-cy="ai-job-detail-summary-location"
                    >
                      {jobDetails.location}
                    </span>
                  )}
                  {jobDetails.postedAt && (
                    <>
                      <span
                        id="ai-job-detail-summary-separator"
                        data-cy="ai-job-detail-summary-separator"
                      >
                        •
                      </span>
                      <span
                        id="ai-job-detail-summary-posted-date"
                        data-cy="ai-job-detail-summary-posted-date"
                      >
                        Posted{' '}
                        {dayjs(jobDetails.postedAt).format('DD MMM YYYY')}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div
                id="ai-job-detail-summary-right"
                data-cy="ai-job-detail-summary-right"
                className="flex flex-col items-end gap-2"
              >
                <Tag
                  id="ai-job-detail-summary-status"
                  data-cy="ai-job-detail-summary-status"
                  color="green"
                  className="text-sm px-3 py-1 rounded"
                >
                  Active
                </Tag>
                <span
                  id="ai-job-detail-summary-analyzed"
                  data-cy="ai-job-detail-summary-analyzed"
                  className="text-xs text-gray-500"
                >
                  Last analyzed •{' '}
                  {jobDetails.analyzedAt
                    ? dayjs(jobDetails.analyzedAt).fromNow()
                    : 'N/A'}
                </span>
              </div>
            </div>
            {/* No hard-coded description: job description can be added here once available from backend */}
          </Card>
        )}

        {/* Candidates + Detail layout */}
        <div
          id="ai-job-detail-layout"
          data-cy="ai-job-detail-layout"
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Candidates List - Left */}
          <div
            id="ai-job-detail-candidates-list"
            data-cy="ai-job-detail-candidates-list"
            className="w-full lg:w-1/2 space-y-4"
          >
            {sortedCandidates.length === 0 ? (
              <div
                id="ai-job-detail-candidates-empty"
                data-cy="ai-job-detail-candidates-empty"
              >
                <div
                  id="ai-job-detail-candidates-empty-state"
                  data-cy="ai-job-detail-candidates-empty-state"
                >
                  <EmptyState />
                </div>
              </div>
            ) : (
              visibleCandidates.map((candidate) => {
                const isSelected =
                  selectedCandidateId &&
                  selectedCandidateId === candidate.candidateId;

                // Styling rules:
                // - Background always white
                // - Hover background always gray
                // - Selected: green border + green score
                // - Not selected: blue border + blue score
                // NOTE: Ant Design `Card` can override Tailwind border colors; use inline style for border.
                const borderHex = isSelected ? '#22c55e' : '#3b82f6'; // green-500 / blue-500

                const primaryReason =
                  (candidate.matchReasons && candidate.matchReasons[0]) ||
                  'No summary available yet for this candidate.';

                // Get category scores directly from candidate (from function response)
                // Show only 3: Skill, Education, Experience
                const skillScore = candidate.skillMatch;
                const educationScore = candidate.educationMatch;
                const experienceScore = candidate.experienceMatch;

                // Get initials for avatar
                const initials =
                  candidate.candidate.fullName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || '';

                return (
                  <Card
                    key={candidate.candidateId}
                    id={`ai-candidate-card-${candidate.candidateId}`}
                    data-cy={`ai-candidate-card-${candidate.candidateId}`}
                    className="group rounded-2xl cursor-pointer transition-all shadow-[0_4px_20px_rgba(16,24,40,0.06)] hover:shadow-[0_8px_28px_rgba(16,24,40,0.10)]"
                    style={{
                      borderColor: borderHex,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      background: '#fff',
                    }}
                    bodyStyle={{ padding: 0 }}
                    onClick={() => handleOpenDetails(candidate)}
                  >
                    <div
                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-395"
                      className="rounded-2xl bg-white p-5 transition-colors group-hover:bg-gray-50"
                    >
                      <div
                        data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-396"
                        className="flex items-start gap-4"
                      >
                        {/* Avatar with initials */}
                        <div
                          id={`ai-candidate-avatar-${candidate.candidateId}`}
                          data-cy={`ai-candidate-avatar-${candidate.candidateId}`}
                        >
                          <Avatar
                            size={64}
                            className="bg-gray-400 text-white font-bold flex-shrink-0"
                            style={{ fontSize: '20px' }}
                          >
                            {initials}
                          </Avatar>
                        </div>

                        {/* Candidate Info */}
                        <div
                          id={`ai-candidate-info-${candidate.candidateId}`}
                          data-cy={`ai-candidate-info-${candidate.candidateId}`}
                          className="flex-1 min-w-0"
                        >
                          <div
                            data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-417"
                            className="flex items-start justify-between mb-3 gap-4"
                          >
                            <div
                              id={`ai-candidate-basic-info-${candidate.candidateId}`}
                              data-cy={`ai-candidate-basic-info-${candidate.candidateId}`}
                              className="flex-1 min-w-0"
                            >
                              <h3
                                id={`ai-candidate-name-${candidate.candidateId}`}
                                className="text-lg font-bold text-gray-900 mb-1"
                                data-cy={`ai-candidate-name-${candidate.candidateId}`}
                              >
                                {candidate.candidate.fullName}
                              </h3>
                              <p
                                id={`ai-candidate-email-${candidate.candidateId}`}
                                className="text-sm text-gray-600 mb-0.5"
                                data-cy={`ai-candidate-email-${candidate.candidateId}`}
                              >
                                {candidate.candidate.email}
                              </p>
                              <p
                                id={`ai-candidate-phone-${candidate.candidateId}`}
                                className="text-sm text-gray-600"
                                data-cy={`ai-candidate-phone-${candidate.candidateId}`}
                              >
                                {candidate.candidate.phone}
                              </p>
                            </div>
                            <div
                              id={`ai-candidate-score-container-${candidate.candidateId}`}
                              data-cy={`ai-candidate-score-container-${candidate.candidateId}`}
                              className="flex flex-col items-end justify-center flex-shrink-0"
                            >
                              <div
                                id={`ai-candidate-score-badge-${candidate.candidateId}`}
                                data-cy={`ai-candidate-score-badge-${candidate.candidateId}`}
                                className={`inline-flex items-center justify-center rounded-full px-5 py-2 border ${
                                  isSelected
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-blue-50 border-blue-200'
                                }`}
                              >
                                <span
                                  id={`ai-candidate-score-${candidate.candidateId}`}
                                  className="text-xl font-bold"
                                  style={{
                                    color: isSelected ? '#15803d' : '#1d4ed8', // green-700 / blue-700
                                  }}
                                  data-cy={`ai-candidate-score-${candidate.candidateId}`}
                                >
                                  {candidate.matchScore}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Short summary from Azure matchReasons - max 3 lines */}
                          <p
                            id={`ai-candidate-summary-${candidate.candidateId}`}
                            data-cy={`ai-candidate-summary-${candidate.candidateId}`}
                            className="text-sm text-gray-700 mb-4 line-clamp-3"
                          >
                            {primaryReason}
                          </p>

                          {/* Match score breakdown (Skill / Education / Experience) - use full width, left aligned */}
                          <div
                            id={`ai-candidate-score-breakdown-${candidate.candidateId}`}
                            className="mb-4 flex w-full flex-wrap items-start justify-start gap-x-10 gap-y-3"
                            data-cy={`ai-candidate-score-breakdown-${candidate.candidateId}`}
                          >
                            <div
                              id={`ai-candidate-skill-score-container-${candidate.candidateId}`}
                              data-cy={`ai-candidate-skill-score-container-${candidate.candidateId}`}
                              className="flex flex-col items-start"
                            >
                              <span
                                id={`ai-candidate-skill-label-${candidate.candidateId}`}
                                data-cy={`ai-candidate-skill-label-${candidate.candidateId}`}
                                className="text-xs text-gray-500 mb-1.5"
                              >
                                Skill
                              </span>
                              <span
                                id={`ai-candidate-skill-score-${candidate.candidateId}`}
                                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold min-w-[50px]"
                                style={{
                                  backgroundColor: isSelected
                                    ? '#dcfce7' // green-100-ish
                                    : '#dbeafe', // blue-100-ish
                                  color: isSelected ? '#15803d' : '#1d4ed8', // green-700 / blue-700
                                }}
                                data-cy={`ai-candidate-skill-score-${candidate.candidateId}`}
                              >
                                {skillScore != null
                                  ? `${Math.round(skillScore)}%`
                                  : '—'}
                              </span>
                            </div>
                            <div
                              id={`ai-candidate-education-score-container-${candidate.candidateId}`}
                              data-cy={`ai-candidate-education-score-container-${candidate.candidateId}`}
                              className="flex flex-col items-start"
                            >
                              <span
                                id={`ai-candidate-education-label-${candidate.candidateId}`}
                                data-cy={`ai-candidate-education-label-${candidate.candidateId}`}
                                className="text-xs text-gray-500 mb-1.5"
                              >
                                Education
                              </span>
                              <span
                                id={`ai-candidate-education-score-${candidate.candidateId}`}
                                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold min-w-[50px]"
                                style={{
                                  backgroundColor: isSelected
                                    ? '#dcfce7'
                                    : '#dbeafe',
                                  color: isSelected ? '#15803d' : '#1d4ed8',
                                }}
                                data-cy={`ai-candidate-education-score-${candidate.candidateId}`}
                              >
                                {educationScore != null
                                  ? `${Math.round(educationScore)}%`
                                  : '—'}
                              </span>
                            </div>
                            <div
                              id={`ai-candidate-experience-score-container-${candidate.candidateId}`}
                              data-cy={`ai-candidate-experience-score-container-${candidate.candidateId}`}
                              className="flex flex-col items-start"
                            >
                              <span
                                id={`ai-candidate-experience-label-${candidate.candidateId}`}
                                data-cy={`ai-candidate-experience-label-${candidate.candidateId}`}
                                className="text-xs text-gray-500 mb-1.5"
                              >
                                Experience
                              </span>
                              <span
                                id={`ai-candidate-experience-score-${candidate.candidateId}`}
                                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold min-w-[50px]"
                                style={{
                                  backgroundColor: isSelected
                                    ? '#dcfce7'
                                    : '#dbeafe',
                                  color: isSelected ? '#15803d' : '#1d4ed8',
                                }}
                                data-cy={`ai-candidate-experience-score-${candidate.candidateId}`}
                              >
                                {experienceScore != null
                                  ? `${Math.round(experienceScore)}%`
                                  : '—'}
                              </span>
                            </div>
                          </div>

                          {/* Skill Matching - 3 skills, styled like Figma (full-width pill rows) */}
                          {candidate.matchedSkills &&
                            candidate.matchedSkills.length > 0 && (
                              <div
                                id={`ai-candidate-skill-matching-${candidate.candidateId}`}
                                className="mt-2"
                                data-cy={`ai-candidate-skill-matching-${candidate.candidateId}`}
                              >
                                <div
                                  id={`ai-candidate-skill-matching-label-${candidate.candidateId}`}
                                  data-cy={`ai-candidate-skill-matching-label-${candidate.candidateId}`}
                                  className="text-sm font-semibold text-gray-900 mb-2"
                                >
                                  Skill Matching
                                </div>
                                <div
                                  id={`ai-candidate-skill-chips-${candidate.candidateId}`}
                                  data-cy={`ai-candidate-skill-chips-${candidate.candidateId}`}
                                  className="flex flex-col gap-2"
                                >
                                  {(() => {
                                    const desired = [
                                      'Strong analytical abilities',
                                      'Effective communication',
                                      'Decision-making skills',
                                    ];

                                    const normalized = (s: string) =>
                                      s.trim().toLowerCase();
                                    const available =
                                      candidate.matchedSkills ?? [];

                                    const picked = desired
                                      .filter((d) =>
                                        available.some(
                                          (a) =>
                                            normalized(a) === normalized(d),
                                        ),
                                      )
                                      .slice(0, 3);

                                    const finalSkills =
                                      picked.length === 3
                                        ? picked
                                        : available.slice(0, 3);

                                    return finalSkills.map((skill, idx) => (
                                      <span
                                        key={`${skill}-${idx}`}
                                        id={`ai-candidate-skill-chip-${candidate.candidateId}-${idx}`}
                                        className="w-full rounded-2xl bg-[#E8E9FF] px-4 py-2 text-sm font-medium text-[#3F51F5]"
                                        data-cy={`ai-candidate-skill-chip-${candidate.candidateId}-${idx}`}
                                      >
                                        {skill}
                                      </span>
                                    ));
                                  })()}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}

            {hasMoreCandidates && !showAllCandidates && (
              <Button
                id="ai-job-detail-view-more-candidates"
                data-cy="ai-job-detail-view-more-candidates"
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
              id="ai-candidate-detail-panel-container"
              data-cy="ai-candidate-detail-panel-container"
              className="w-full lg:w-1/2 shrink-0"
            >
              <Card
                id="ai-candidate-detail-panel"
                className="rounded-2xl border border-gray-200 shadow-sm h-full"
                data-cy="ai-candidate-detail-panel"
              >
                {!selectedCandidate || isDetailsLoading || !matchDetails ? (
                  <div
                    id="ai-candidate-detail-empty"
                    className="flex flex-col items-center justify-center h-full text-center space-y-3"
                    data-cy="ai-candidate-detail-empty"
                  >
                    {isDetailsLoading ? (
                      <div
                        id="ai-candidate-detail-loading-spinner"
                        data-cy="ai-candidate-detail-loading-spinner"
                      >
                        <Skeleton active />
                      </div>
                    ) : (
                      <>
                        <p
                          id="ai-candidate-detail-empty-message"
                          data-cy="ai-candidate-detail-empty-message"
                          className="text-sm font-medium text-gray-700"
                        >
                          Select a candidate on the left to view AI match
                          details
                        </p>
                        <p
                          id="ai-candidate-detail-empty-hint"
                          data-cy="ai-candidate-detail-empty-hint"
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
                    id="ai-candidate-detail-content"
                    data-cy="ai-candidate-detail-content"
                    className="h-full flex flex-col"
                  >
                    {/* Header */}
                    <div
                      id="ai-candidate-detail-header"
                      data-cy="ai-candidate-detail-header"
                      className="pb-4 border-b border-gray-200"
                    >
                      <div
                        data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-714"
                        className="flex items-start justify-between gap-3"
                      >
                        <div
                          id="ai-candidate-detail-header-left"
                          data-cy="ai-candidate-detail-header-left"
                          className="flex items-center gap-3 flex-1"
                        >
                          <div
                            id="ai-candidate-detail-avatar"
                            data-cy="ai-candidate-detail-avatar"
                          >
                            <Avatar
                              size={48}
                              className="bg-blue-500 text-white font-semibold flex-shrink-0"
                            >
                              {selectedCandidate.candidate.fullName
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase() || ''}
                            </Avatar>
                          </div>
                          <div
                            id="ai-candidate-detail-header-info"
                            data-cy="ai-candidate-detail-header-info"
                            className="flex-1 min-w-0"
                          >
                            <h3
                              id="ai-candidate-detail-name"
                              data-cy="ai-candidate-detail-name"
                              className="text-lg font-semibold text-gray-900 truncate"
                            >
                              {selectedCandidate.candidate.fullName ||
                                'Name not provided'}
                            </h3>
                            <div
                              id="ai-candidate-detail-overall-match"
                              data-cy="ai-candidate-detail-overall-match"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 mt-1"
                            >
                              <span data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-754">
                                {selectedCandidate.matchScore}% Overall Match
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          id="ai-candidate-resume-button"
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
                          icon={
                            <DownloadOutlined
                              id="ai-candidate-resume-button-icon"
                              data-cy="ai-candidate-resume-button-icon"
                            />
                          }
                        >
                          Resume
                        </Button>
                      </div>

                      {/* Contact Info */}
                      <div
                        id="ai-candidate-detail-contact"
                        data-cy="ai-candidate-detail-contact"
                        className="mt-4 space-y-2 text-sm text-gray-700"
                      >
                        <div
                          id="ai-candidate-detail-email"
                          data-cy="ai-candidate-detail-email"
                          className="flex items-center gap-2"
                        >
                          <span
                            data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-791"
                            className="text-gray-400"
                          >
                            @
                          </span>
                          <span
                            data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-792"
                            className="truncate"
                          >
                            {selectedCandidate.candidate.email ||
                              'Email not provided'}
                          </span>
                        </div>
                        <div
                          id="ai-candidate-detail-phone"
                          data-cy="ai-candidate-detail-phone"
                          className="flex items-center gap-2"
                        >
                          <span
                            data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-802"
                            className="text-gray-400"
                          >
                            📞
                          </span>
                          <span data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-803">
                            {selectedCandidate.candidate.phone ||
                              'Phone number not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div
                      id="ai-candidate-detail-scrollable"
                      data-cy="ai-candidate-detail-scrollable"
                      className="flex-1 overflow-y-auto pt-4 space-y-6"
                    >
                      {/* Candidate Overview (from Azure data) */}
                      <div
                        id="ai-candidate-detail-overview"
                        data-cy="ai-candidate-detail-overview"
                      >
                        <div
                          id="ai-candidate-detail-overview-header"
                          data-cy="ai-candidate-detail-overview-header"
                          className="flex items-center gap-2 mb-3"
                        >
                          <span
                            id="ai-candidate-detail-overview-icon"
                            data-cy="ai-candidate-detail-overview-icon"
                            className="text-gray-600"
                          >
                            👤
                          </span>
                          <span
                            id="ai-candidate-detail-overview-title"
                            data-cy="ai-candidate-detail-overview-title"
                            className="font-semibold text-gray-900"
                          >
                            Candidate overview
                          </span>
                        </div>
                        <div
                          id="ai-candidate-detail-overview-content"
                          data-cy="ai-candidate-detail-overview-content"
                          className="space-y-2 text-sm text-gray-700"
                        >
                          <div
                            id="ai-candidate-detail-stage"
                            data-cy="ai-candidate-detail-stage"
                            className="flex items-center justify-between gap-2"
                          >
                            <span
                              id="ai-candidate-detail-stage-label"
                              data-cy="ai-candidate-detail-stage-label"
                              className="text-gray-600"
                            >
                              Stage
                            </span>
                            <span
                              id="ai-candidate-detail-stage-value"
                              data-cy="ai-candidate-detail-stage-value"
                              className="font-medium"
                            >
                              {selectedCandidate.jobCandidate
                                ?.applicantStatusStage?.title ||
                                'No stage information'}
                            </span>
                          </div>
                          <div
                            id="ai-candidate-detail-location"
                            data-cy="ai-candidate-detail-location"
                            className="flex items-center justify-between gap-2"
                          >
                            <span
                              id="ai-candidate-detail-location-label"
                              data-cy="ai-candidate-detail-location-label"
                              className="text-gray-600"
                            >
                              Location
                            </span>
                            <span
                              id="ai-candidate-detail-location-value"
                              data-cy="ai-candidate-detail-location-value"
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
                            id="ai-candidate-detail-cgpa"
                            data-cy="ai-candidate-detail-cgpa"
                            className="flex items-center justify-between gap-2"
                          >
                            <span
                              id="ai-candidate-detail-cgpa-label"
                              data-cy="ai-candidate-detail-cgpa-label"
                              className="text-gray-600"
                            >
                              CGPA
                            </span>
                            <span
                              id="ai-candidate-detail-cgpa-value"
                              data-cy="ai-candidate-detail-cgpa-value"
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
                      <div
                        id="ai-candidate-detail-experience"
                        data-cy="ai-candidate-detail-experience"
                      >
                        <div
                          data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-924"
                          className="border-t border-gray-200"
                        />
                        <div
                          data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-925"
                          className="pt-4"
                        >
                          <div
                            id="ai-candidate-detail-experience-header"
                            data-cy="ai-candidate-detail-experience-header"
                            className="flex items-center gap-2 mb-3"
                          >
                            <span
                              id="ai-candidate-detail-experience-icon"
                              data-cy="ai-candidate-detail-experience-icon"
                              className="text-gray-700"
                            >
                              💼
                            </span>
                            <span
                              id="ai-candidate-detail-experience-title"
                              data-cy="ai-candidate-detail-experience-title"
                              className="font-semibold text-gray-900"
                            >
                              Experience
                            </span>
                            {matchDetails?.candidate?.experience && (
                              <span
                                id="ai-candidate-detail-experience-count"
                                data-cy="ai-candidate-detail-experience-count"
                                className="text-xs text-gray-500"
                              >
                                • {matchDetails.candidate.experience.length}{' '}
                                {matchDetails.candidate.experience.length === 1
                                  ? 'entry'
                                  : 'entries'}
                              </span>
                            )}
                          </div>
                          <div
                            id="ai-candidate-detail-experience-list"
                            data-cy="ai-candidate-detail-experience-list"
                            className="space-y-3 text-sm text-gray-700"
                          >
                            {(matchDetails?.candidate?.experience?.length ??
                              0) === 0 && (
                              <p
                                id="ai-candidate-detail-experience-empty"
                                data-cy="ai-candidate-detail-experience-empty"
                                className="text-xs text-gray-500"
                                data-cy="recruitment-recruitment-ai-job-matching-jobid-page-tsx-p-1006"
                              >
                                No experience information provided.
                              </p>
                            )}
                            {/* Deduplicate experience entries by role+company+dates */}
                            {(() => {
                              const experiences =
                                matchDetails?.candidate?.experience ?? [];
                              const seen = new Set<string>();
                              const unique = experiences.filter((exp) => {
                                const key = `${exp.role || ''}_${exp.company || ''}_${exp.startDate || ''}_${exp.endDate || ''}`;
                                if (seen.has(key)) return false;
                                seen.add(key);
                                return true;
                              });
                              return unique.map((exp, idx) => {
                                // Format dates - handle both string and number formats
                                const formatDate = (
                                  date: string | number | null | undefined,
                                ) => {
                                  if (!date) return null;
                                  if (typeof date === 'number') {
                                    return date.toString();
                                  }
                                  return date;
                                };
                                const startDate = formatDate(exp.startDate);
                                const endDate = formatDate(exp.endDate);
                                const dateRange =
                                  [startDate, endDate]
                                    .filter(Boolean)
                                    .join(' - ') || 'Dates not provided';

                                const expKey = `${exp.role || ''}_${exp.company || ''}_${startDate || ''}_${endDate || ''}_${idx}`;
                                return (
                                  <div
                                    key={expKey}
                                    id={`ai-candidate-experience-item-${idx}`}
                                    data-cy={`ai-candidate-experience-item-${idx}`}
                                    className="flex items-start justify-between gap-2"
                                  >
                                    <div
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-1009"
                                      className="flex-1"
                                    >
                                      <p
                                        id={`ai-candidate-experience-role-${idx}`}
                                        data-cy={`recruitment-ai-job-matching-jobid-page-tsx-page-p-1055`}
                                        className="font-medium text-gray-900"
                                      >
                                        {exp.role || 'Role not specified'}
                                      </p>
                                      <p
                                        id={`ai-candidate-experience-company-${idx}`}
                                        data-cy={`recruitment-ai-job-matching-jobid-page-tsx-page-p-1061`}
                                        className="text-gray-600"
                                      >
                                        {exp.company || 'Company not specified'}
                                      </p>
                                    </div>
                                    <span
                                      id={`ai-candidate-experience-dates-${idx}`}
                                      data-cy={`recruitment-ai-job-matching-jobid-page-tsx-page-span-1068`}
                                      className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0"
                                    >
                                      {dateRange}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Education Section (from Azure blob data) */}
                      <div
                        id="ai-candidate-detail-education"
                        data-cy="ai-candidate-detail-education"
                      >
                        <div
                          data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-1042"
                          className="border-t border-gray-200"
                        />
                        <div
                          data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-1043"
                          className="pt-4"
                        >
                          <div
                            id="ai-candidate-detail-education-header"
                            data-cy="ai-candidate-detail-education-header"
                            className="flex items-center gap-2 mb-3"
                          >
                            <span
                              id="ai-candidate-detail-education-icon"
                              data-cy="ai-candidate-detail-education-icon"
                              className="text-gray-700"
                            >
                              🎓
                            </span>
                            <span
                              id="ai-candidate-detail-education-title"
                              data-cy="ai-candidate-detail-education-title"
                              className="font-semibold text-gray-900"
                            >
                              Education
                            </span>
                            {matchDetails?.candidate?.education && (
                              <span
                                id="ai-candidate-detail-education-count"
                                data-cy="ai-candidate-detail-education-count"
                                className="text-xs text-gray-500"
                              >
                                • {matchDetails.candidate.education.length}{' '}
                                {matchDetails.candidate.education.length === 1
                                  ? 'entry'
                                  : 'entries'}
                              </span>
                            )}
                          </div>
                          <div
                            id="ai-candidate-detail-education-list"
                            data-cy="ai-candidate-detail-education-list"
                            className="space-y-3 text-sm text-gray-700"
                          >
                            {(matchDetails?.candidate?.education?.length ??
                              0) === 0 && (
                              <p
                                id="ai-candidate-detail-education-empty"
                                data-cy="ai-candidate-detail-education-empty"
                                className="text-xs text-gray-500"
                                data-cy="recruitment-recruitment-ai-job-matching-jobid-page-tsx-p-1133"
                              >
                                No education information provided.
                              </p>
                            )}
                            {/* Deduplicate education entries by degree+institution+years */}
                            {(() => {
                              const educations =
                                matchDetails?.candidate?.education ?? [];
                              const seen = new Set<string>();
                              const unique = educations.filter((edu) => {
                                const key = `${edu.degree || ''}_${edu.institution || ''}_${edu.startYear || ''}_${edu.endYear || ''}`;
                                if (seen.has(key)) return false;
                                seen.add(key);
                                return true;
                              });
                              return unique.map((edu, idx) => {
                                const yearRange =
                                  [edu.startYear, edu.endYear]
                                    .filter(Boolean)
                                    .join(' - ') || 'Years not provided';

                                const eduKey = `${edu.degree || ''}_${edu.institution || ''}_${edu.startYear || ''}_${edu.endYear || ''}_${idx}`;
                                return (
                                  <div
                                    key={eduKey}
                                    id={`ai-candidate-education-item-${idx}`}
                                    data-cy={`ai-candidate-education-item-${idx}`}
                                    className="flex items-start justify-between gap-2"
                                  >
                                    <div
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-1115"
                                      className="flex-1"
                                    >
                                      <p
                                        id={`ai-candidate-education-degree-${idx}`}
                                        data-cy={`ai-candidate-education-degree-${idx}`}
                                        className="font-medium text-gray-900"
                                        data-cy="recruitment-recruitment-ai-job-matching-jobid-page-tsx-p-1169"
                                      >
                                        {edu.degree || 'Education'}
                                      </p>
                                      <p
                                        id={`ai-candidate-education-institution-${idx}`}
                                        data-cy={`ai-candidate-education-institution-${idx}`}
                                        className="text-gray-600"
                                        data-cy="recruitment-recruitment-ai-job-matching-jobid-page-tsx-p-1175"
                                      >
                                        {edu.institution ||
                                          'Institution not specified'}
                                      </p>
                                      {edu.cgpa && (
                                        <p
                                          id={`ai-candidate-education-cgpa-${idx}`}
                                          data-cy={`ai-candidate-education-cgpa-${idx}`}
                                          className="text-xs text-gray-500 mt-1"
                                          data-cy="recruitment-recruitment-ai-job-matching-jobid-page-tsx-p-1183"
                                        >
                                          CGPA: {edu.cgpa}
                                        </p>
                                      )}
                                    </div>
                                    <span
                                      id={`ai-candidate-education-years-${idx}`}
                                      data-cy={`ai-candidate-education-years-${idx}`}
                                      className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0"
                                      data-cy="recruitment-recruitment-ai-job-matching-jobid-page-tsx-span-1191"
                                    >
                                      {yearRange}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>

                      <div
                        data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-1152"
                        className="border-t border-gray-200"
                      />

                      {/* Skill Analysis Section */}
                      <div
                        id="ai-candidate-detail-skill-analysis"
                        data-cy="ai-candidate-detail-skill-analysis"
                      >
                        <div
                          id="ai-candidate-detail-skill-analysis-header"
                          data-cy="ai-candidate-detail-skill-analysis-header"
                          className="flex items-center gap-2 mb-3"
                        >
                          <span
                            id="ai-candidate-detail-skill-analysis-title"
                            data-cy="ai-candidate-detail-skill-analysis-title"
                            className="font-semibold text-gray-900"
                          >
                            Skill Analysis
                          </span>
                        </div>
                        <div
                          id="ai-candidate-detail-skill-analysis-content"
                          data-cy="ai-candidate-detail-skill-analysis-content"
                          className="space-y-2 text-sm"
                        >
                          {/* Matched skills */}
                          {visibleMatchedSkills.length > 0 && (
                            <div
                              id="ai-candidate-detail-matched-skills"
                              data-cy="ai-candidate-detail-matched-skills"
                            >
                              <p
                                id="ai-candidate-detail-matched-skills-label"
                                data-cy="ai-candidate-detail-matched-skills-label"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Matched skills
                              </p>
                              <div
                                id="ai-candidate-detail-matched-skills-list"
                                data-cy="ai-candidate-detail-matched-skills-list"
                                className="flex flex-wrap gap-2"
                              >
                                {visibleMatchedSkills.map((skill, idx) => (
                                  <div
                                    key={`matched-skill-${idx}`}
                                    id={`ai-skill-matched-${idx}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1"
                                    data-cy={`ai-skill-matched-${idx}`}
                                  >
                                    <span
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-1202"
                                      className="text-green-600 text-xs"
                                    >
                                      ✓
                                    </span>
                                    <span
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-1205"
                                      className="text-gray-800 text-xs"
                                    >
                                      {skill}
                                    </span>
                                  </div>
                                ))}
                                {extraMatchedSkills > 0 &&
                                  !showAllMatchedSkills && (
                                    <button
                                      id="ai-skill-matched-more-button"
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
                                      id="ai-skill-matched-less-button"
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
                            <div
                              id="ai-candidate-detail-missing-skills"
                              data-cy="ai-candidate-detail-missing-skills"
                            >
                              <p
                                id="ai-candidate-detail-missing-skills-label"
                                data-cy="ai-candidate-detail-missing-skills-label"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Missing skills
                              </p>
                              <div
                                id="ai-candidate-detail-missing-skills-list"
                                data-cy="ai-candidate-detail-missing-skills-list"
                                className="flex flex-wrap gap-2"
                              >
                                {visibleMissingSkills.map((skill, idx) => (
                                  <div
                                    key={`missing-skill-${idx}`}
                                    id={`ai-skill-missing-${idx}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1"
                                    data-cy={`ai-skill-missing-${idx}`}
                                  >
                                    <span
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-1267"
                                      className="text-red-600 text-xs"
                                    >
                                      !
                                    </span>
                                    <span
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-span-1270"
                                      className="text-gray-800 text-xs"
                                    >
                                      {skill}
                                    </span>
                                  </div>
                                ))}
                                {extraMissingSkills > 0 &&
                                  !showAllMissingSkills && (
                                    <button
                                      id="ai-skill-missing-more-button"
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
                                      id="ai-skill-missing-less-button"
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
                              id="ai-candidate-detail-strengths"
                              data-cy="ai-candidate-detail-strengths"
                              className="pt-1"
                            >
                              <p
                                id="ai-candidate-detail-strengths-label"
                                data-cy="ai-candidate-detail-strengths-label"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Strengths
                              </p>
                              <div
                                id="ai-candidate-detail-strengths-list"
                                data-cy="ai-candidate-detail-strengths-list"
                                className="space-y-1.5"
                              >
                                {visibleStrengths.map((item, idx) => (
                                  <div
                                    key={`strength-${idx}`}
                                    id={`ai-strength-${idx}`}
                                    className="flex items-start gap-2"
                                    data-cy={`ai-strength-${idx}`}
                                  >
                                    <div
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-1333"
                                      className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500"
                                    />
                                    <p
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-p-1334"
                                      className="text-xs text-gray-800"
                                    >
                                      {item}
                                    </p>
                                  </div>
                                ))}
                                {extraStrengths > 0 && !showAllStrengths && (
                                  <button
                                    id="ai-strength-more-button"
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
                                      id="ai-strength-less-button"
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
                              id="ai-candidate-detail-concerns"
                              data-cy="ai-candidate-detail-concerns"
                              className="pt-1"
                            >
                              <p
                                id="ai-candidate-detail-concerns-label"
                                data-cy="ai-candidate-detail-concerns-label"
                                className="text-xs font-semibold text-gray-700 mb-1"
                              >
                                Areas to review
                              </p>
                              <div
                                id="ai-candidate-detail-concerns-list"
                                data-cy="ai-candidate-detail-concerns-list"
                                className="space-y-1.5"
                              >
                                {visibleConcerns.map((item, idx) => (
                                  <div
                                    key={`concern-${idx}`}
                                    id={`ai-concern-${idx}`}
                                    className="flex items-start gap-2"
                                    data-cy={`ai-concern-${idx}`}
                                  >
                                    <div
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-div-1392"
                                      className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"
                                    />
                                    <p
                                      data-cy="recruitment-ai-job-matching-jobid-page-tsx-page-p-1393"
                                      className="text-xs text-gray-800"
                                    >
                                      {item}
                                    </p>
                                  </div>
                                ))}
                                {extraConcerns > 0 && !showAllConcerns && (
                                  <button
                                    id="ai-concern-more-button"
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
                                    id="ai-concern-less-button"
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
