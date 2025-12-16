'use client';

import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Tag, Button, Avatar } from 'antd';
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
      <div className="flex items-center justify-center min-h-96">
        <Empty description="Job not found" />
      </div>
    );
  }

  if (isMatchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-cy="ai-job-detail-page">
      {/* Header */}
      <div
        className="bg-white px-6 py-4 border-b border-gray-200"
        data-cy="ai-job-detail-header"
      >
        <div className="flex items-center gap-4">
          <Button
            type="text"
            onClick={() => router.push('/recruitment/ai-job-matching')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              AI Job Matching
            </h1>
            <p className="text-sm text-gray-500">
              Match candidates to jobs using AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Job Info Card */}
        {jobDetails && (
          <Card
            className="rounded-2xl border border-gray-200 shadow-sm"
            data-cy="ai-job-detail-summary-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {jobDetails.jobTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {jobDetails.location && <span>{jobDetails.location}</span>}
                  {jobDetails.postedAt && (
                    <>
                      <span>•</span>
                      <span>
                        Posted{' '}
                        {dayjs(jobDetails.postedAt).format('DD MMM YYYY')}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Tag color="green" className="text-sm px-3 py-1 rounded">
                  Active
                </Tag>
                <span className="text-xs text-gray-500">
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Candidates List - Left */}
          <div className="w-full lg:w-1/2 space-y-4">
            {sortedCandidates.length === 0 ? (
              <Empty description="No candidates available yet" />
            ) : (
              visibleCandidates.map((candidate) => {
                const isSelected =
                  selectedCandidateId &&
                  selectedCandidateId === candidate.candidateId;
                // Use green border for all cards to match design
                const borderColor = 'border-green-500';
                const bgColor = isSelected ? 'bg-green-50' : 'bg-white';

                // Always give a subtle green hover to make interaction obvious
                const hoverClasses =
                  'hover:border-green-600 hover:bg-green-50/80';

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
                    data-cy={`ai-candidate-card-${candidate.candidateId}`}
                    className={`rounded-2xl border-2 ${borderColor} ${bgColor} cursor-pointer hover:shadow-lg ${hoverClasses} transition-all`}
                    bodyStyle={{ padding: 16 }}
                    onClick={() => handleOpenDetails(candidate)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with initials */}
                      <Avatar
                        size={64}
                        className="bg-gray-400 text-white font-bold flex-shrink-0"
                        style={{ fontSize: '20px' }}
                      >
                        {initials}
                      </Avatar>

                      {/* Candidate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3 gap-4">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-lg font-bold text-gray-900 mb-1"
                              data-cy={`ai-candidate-name-${candidate.candidateId}`}
                            >
                              {candidate.candidate.fullName}
                            </h3>
                            <p
                              className="text-sm text-gray-600 mb-0.5"
                              data-cy={`ai-candidate-email-${candidate.candidateId}`}
                            >
                              {candidate.candidate.email}
                            </p>
                            <p
                              className="text-sm text-gray-600"
                              data-cy={`ai-candidate-phone-${candidate.candidateId}`}
                            >
                              {candidate.candidate.phone}
                            </p>
                          </div>
                          <div className="flex flex-col items-end justify-center flex-shrink-0">
                            <div className="inline-flex items-center justify-center rounded-full bg-green-50 px-4 py-2 border border-green-200">
                              <span
                                className="text-xl font-bold text-green-700"
                                data-cy={`ai-candidate-score-${candidate.candidateId}`}
                              >
                                {candidate.matchScore}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Short summary from Azure matchReasons - max 3 lines */}
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                          {primaryReason}
                        </p>

                        {/* Match score breakdown (Skill / Education / Experience) - use full width, left aligned */}
                        <div
                          className="mb-4 flex w-full flex-wrap items-start justify-start gap-x-12 gap-y-3"
                          data-cy={`ai-candidate-score-breakdown-${candidate.candidateId}`}
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 mb-1.5">
                              Skill
                            </span>
                            <span
                              className="inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 min-w-[50px]"
                              data-cy={`ai-candidate-skill-score-${candidate.candidateId}`}
                            >
                              {skillScore != null
                                ? `${Math.round(skillScore)}%`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 mb-1.5">
                              Education
                            </span>
                            <span
                              className="inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 min-w-[50px]"
                              data-cy={`ai-candidate-education-score-${candidate.candidateId}`}
                            >
                              {educationScore != null
                                ? `${Math.round(educationScore)}%`
                                : '—'}
                            </span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 mb-1.5">
                              Experience
                            </span>
                            <span
                              className="inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 min-w-[50px]"
                              data-cy={`ai-candidate-experience-score-${candidate.candidateId}`}
                            >
                              {experienceScore != null
                                ? `${Math.round(experienceScore)}%`
                                : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Skill Matching - 3 skills, wrap to use all available space (no horizontal scroll) */}
                        {candidate.matchedSkills &&
                          candidate.matchedSkills.length > 0 && (
                            <div
                              className="mt-2"
                              data-cy={`ai-candidate-skill-matching-${candidate.candidateId}`}
                            >
                              <div className="text-sm font-semibold text-gray-900 mb-2">
                                Skill Matching
                              </div>
                              <div className="flex flex-wrap gap-2">
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
                                        (a) => normalized(a) === normalized(d),
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
                                      className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
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
            <div className="w-full lg:w-1/2 shrink-0">
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
                      <Spin size="large" />
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700">
                          Select a candidate on the left to view AI match
                          details
                        </p>
                        <p className="text-xs text-gray-500">
                          You can compare different candidates by clicking their
                          cards.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
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
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {selectedCandidate.candidate.fullName ||
                                'Name not provided'}
                            </h3>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 mt-1">
                              <span>
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
                      <div className="mt-4 space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">@</span>
                          <span className="truncate">
                            {selectedCandidate.candidate.email ||
                              'Email not provided'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📞</span>
                          <span>
                            {selectedCandidate.candidate.phone ||
                              'Phone number not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto pt-4 space-y-6">
                      {/* Candidate Overview (from Azure data) */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-gray-600">👤</span>
                          <span className="font-semibold text-gray-900">
                            Candidate overview
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-600">Stage</span>
                            <span className="font-medium">
                              {selectedCandidate.jobCandidate
                                ?.applicantStatusStage?.title ||
                                'No stage information'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-600">Location</span>
                            <span className="font-medium">
                              {[
                                matchDetails?.candidate?.city,
                                matchDetails?.candidate?.country,
                              ]
                                .filter(Boolean)
                                .join(', ') || 'Location not provided'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-600">CGPA</span>
                            <span className="font-medium">
                              {matchDetails?.candidate?.CGPA != null
                                ? matchDetails.candidate.CGPA
                                : 'Not provided in resume'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Experience Section (from Azure blob data) */}
                      <div>
                        <div className="border-t border-gray-200" />
                        <div className="pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-gray-700">💼</span>
                            <span className="font-semibold text-gray-900">
                              Experience
                            </span>
                            {matchDetails?.candidate?.experience && (
                              <span className="text-xs text-gray-500">
                                • {matchDetails.candidate.experience.length}{' '}
                                {matchDetails.candidate.experience.length === 1
                                  ? 'entry'
                                  : 'entries'}
                              </span>
                            )}
                          </div>
                          <div className="space-y-3 text-sm text-gray-700">
                            {(matchDetails?.candidate?.experience?.length ??
                              0) === 0 && (
                              <p className="text-xs text-gray-500">
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
                                    className="flex items-start justify-between gap-2"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">
                                        {exp.role || 'Role not specified'}
                                      </p>
                                      <p className="text-gray-600">
                                        {exp.company || 'Company not specified'}
                                      </p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
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
                      <div>
                        <div className="border-t border-gray-200" />
                        <div className="pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-gray-700">🎓</span>
                            <span className="font-semibold text-gray-900">
                              Education
                            </span>
                            {matchDetails?.candidate?.education && (
                              <span className="text-xs text-gray-500">
                                • {matchDetails.candidate.education.length}{' '}
                                {matchDetails.candidate.education.length === 1
                                  ? 'entry'
                                  : 'entries'}
                              </span>
                            )}
                          </div>
                          <div className="space-y-3 text-sm text-gray-700">
                            {(matchDetails?.candidate?.education?.length ??
                              0) === 0 && (
                              <p className="text-xs text-gray-500">
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
                                    className="flex items-start justify-between gap-2"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">
                                        {edu.degree || 'Education'}
                                      </p>
                                      <p className="text-gray-600">
                                        {edu.institution ||
                                          'Institution not specified'}
                                      </p>
                                      {edu.cgpa && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          CGPA: {edu.cgpa}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                      {yearRange}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      {/* Skill Analysis Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-gray-900">
                            Skill Analysis
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {/* Matched skills */}
                          {visibleMatchedSkills.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                Matched skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {visibleMatchedSkills.map((skill, idx) => (
                                  <div
                                    key={`matched-skill-${idx}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1"
                                    data-cy="ai-skill-matched"
                                  >
                                    <span className="text-green-600 text-xs">
                                      ✓
                                    </span>
                                    <span className="text-gray-800 text-xs">
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
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                Missing skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {visibleMissingSkills.map((skill, idx) => (
                                  <div
                                    key={`missing-skill-${idx}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1"
                                    data-cy="ai-skill-missing"
                                  >
                                    <span className="text-red-600 text-xs">
                                      !
                                    </span>
                                    <span className="text-gray-800 text-xs">
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
                            <div className="pt-1">
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                Strengths
                              </p>
                              <div className="space-y-1.5">
                                {visibleStrengths.map((item, idx) => (
                                  <div
                                    key={`strength-${idx}`}
                                    className="flex items-start gap-2"
                                    data-cy="ai-strength"
                                  >
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                                    <p className="text-xs text-gray-800">
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
                            <div className="pt-1">
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                Areas to review
                              </p>
                              <div className="space-y-1.5">
                                {visibleConcerns.map((item, idx) => (
                                  <div
                                    key={`concern-${idx}`}
                                    className="flex items-start gap-2"
                                    data-cy="ai-concern"
                                  >
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                                    <p className="text-xs text-gray-800">
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
