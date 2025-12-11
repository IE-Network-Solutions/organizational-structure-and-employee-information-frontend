'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Empty,
  Spin,
  Tag,
  Button,
  Avatar,
} from 'antd';
// NOTE: Icons are intentionally not used here to avoid runtime issues with undefined icon components.
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
    minMatchScore,
    matchDetailsDrawerOpen,
    setMatchDetailsDrawerOpen,
    selectedCandidateId,
    setSelectedCandidateId,
  } = useAIJobMatchingStore();

  const [selectedCandidate, setSelectedCandidate] = useState<AIMatchedCandidate | null>(null);

  // Reset drawer state on page load or job change
  useEffect(() => {
    setMatchDetailsDrawerOpen(false);
    setSelectedCandidateId(null);
    setSelectedCandidate(null);
  }, [jobId, setMatchDetailsDrawerOpen, setSelectedCandidateId]);

  // Fetch ALL candidates from Azure
  const {
    data: matchResponse,
    isLoading: isMatchesLoading,
  } = useGetAIMatchedCandidates(
    jobId,
    {},
    Boolean(jobId),
  );

  // Fetch match details for selected candidate
  const {
    data: matchDetails,
    isLoading: isDetailsLoading,
  } = useGetAIMatchDetails(
    jobId,
    selectedCandidateId,
    matchDetailsDrawerOpen,
  );

  // Extract job details from Azure response
  const jobDetails = matchResponse ? {
    jobTitle: matchResponse.jobTitle,
    department: matchResponse.department || 'N/A',
    location: matchResponse.location || 'Remote',
    createdAt: matchResponse.analysisTimestamp,
  } : null;

  // Use all candidates returned from Azure for the UI
  const allCandidates = matchResponse?.matchedCandidates ?? [];
  const sortedCandidates = [...allCandidates].sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  const handleOpenDetails = (candidate: AIMatchedCandidate) => {
    setSelectedCandidate(candidate);
    setSelectedCandidateId(candidate.candidateId);
    setMatchDetailsDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setMatchDetailsDrawerOpen(false);
    // Delay clearing the selection to allow drawer animation
    setTimeout(() => {
      setSelectedCandidateId(null);
      setSelectedCandidate(null);
    }, 300);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            onClick={() => router.push('/recruitment/ai-job-matching')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">AI Job Matching</h1>
            <p className="text-sm text-gray-500">
              Match candidates to jobs using AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Job Info Card */}
        {jobDetails && (
          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {jobDetails.jobTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {jobDetails.location && <span>{jobDetails.location}</span>}
                  <span>•</span>
                  <span>Posted {dayjs(jobDetails.createdAt).format('DD MMM YYYY')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Tag color="green" className="text-sm px-3 py-1 rounded">
                  Active
                </Tag>
                <span className="text-xs text-gray-500">
                  Last Analyzed • {dayjs(matchResponse?.analysisTimestamp).fromNow()}
                </span>
              </div>
            </div>
            {/* No hard-coded description: job description can be added here once available from backend */}
          </Card>
        )}

        {/* Candidates + Detail layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Candidates List - Left */}
          <div className="flex-1 space-y-4">
            {sortedCandidates.length === 0 ? (
              <Empty description="No candidates available yet" />
            ) : (
              sortedCandidates.map((candidate, index) => {
                const isTopMatch = index === 0;
                const isSecondMatch = index === 1;
                const isSelected =
                  selectedCandidateId && selectedCandidateId === candidate.candidateId;

                const borderColor = isSelected
                  ? 'border-blue-500'
                  : isTopMatch
                  ? 'border-green-400'
                  : isSecondMatch
                  ? 'border-purple-400'
                  : 'border-gray-200';

                const bgColor = isSelected
                  ? 'bg-blue-50'
                  : isTopMatch
                  ? 'bg-green-50/30'
                  : isSecondMatch
                  ? 'bg-purple-50/30'
                  : 'bg-white';

                const scoreColor = isTopMatch
                  ? 'text-green-600'
                  : isSecondMatch
                  ? 'text-purple-600'
                  : 'text-gray-700';

                const primaryReason =
                  (candidate.matchReasons && candidate.matchReasons[0]) ||
                  'No summary available yet for this candidate.';

                const topMatchedSkills = candidate.matchedSkills?.slice(0, 5) ?? [];

                return (
                  <Card
                    key={candidate.candidateId}
                    className={`rounded-2xl border-2 ${borderColor} ${bgColor} cursor-pointer hover:shadow-lg transition-all`}
                    onClick={() => handleOpenDetails(candidate)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar
                        size={56}
                        className="bg-blue-500 flex-shrink-0"
                      />

                      {/* Candidate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {candidate.candidate.fullName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {candidate.candidate.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              {candidate.candidate.phone}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className={`text-3xl font-bold ${scoreColor}`}>
                              {candidate.matchScore}%
                            </div>
                          </div>
                        </div>

                        {/* Short summary from Azure matchReasons */}
                        <p className="text-sm text-gray-700 mb-4">
                          {primaryReason}
                        </p>

                        {/* Matched skills from Azure (up to 5) */}
                        {topMatchedSkills.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-2">
                              Matched skills
                            </div>
                            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Details Panel - Right (only when there are candidates) */}
          {sortedCandidates.length > 0 && (
            <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0">
              <Card className="rounded-2xl border border-gray-200 shadow-sm h-full">
                {!selectedCandidate || isDetailsLoading || !matchDetails ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  {isDetailsLoading ? (
                    <Spin size="large" />
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">
                        Select a candidate on the left to view AI match details
                      </p>
                      <p className="text-xs text-gray-500">
                        You can compare different candidates by clicking their cards.
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
                          className="bg-blue-500 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {selectedCandidate.candidate.fullName}
                          </h3>
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              selectedCandidate.matchScore >= 90
                                ? 'bg-green-50 text-green-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {selectedCandidate.matchScore}% Overall Match
                          </div>
                        </div>
                      </div>
                      {selectedCandidate.candidate.resumeUrl && (
                        <Button
                          type="primary"
                          className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                          href={selectedCandidate.candidate.resumeUrl}
                          target="_blank"
                        >
                          Resume
                        </Button>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      {selectedCandidate.candidate.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">@</span>
                          <span className="truncate">
                            {selectedCandidate.candidate.email}
                          </span>
                        </div>
                      )}
                      {selectedCandidate.candidate.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📞</span>
                          <span>{selectedCandidate.candidate.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto pt-4 space-y-6">
                    {/* Candidate Overview (from Azure data) */}
                    {(matchDetails?.candidate ||
                      selectedCandidate.jobCandidate?.applicantStatusStage) && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-gray-900">
                            Candidate overview
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                          {selectedCandidate.jobCandidate?.applicantStatusStage
                            ?.title && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-600">Stage</span>
                              <span className="font-medium">
                                {
                                  selectedCandidate.jobCandidate
                                    .applicantStatusStage.title
                                }
                              </span>
                            </div>
                          )}

                          {(matchDetails?.candidate?.city ||
                            matchDetails?.candidate?.country) && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-600">Location</span>
                              <span className="font-medium">
                                {[
                                  matchDetails?.candidate?.city,
                                  matchDetails?.candidate?.country,
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}

                          {matchDetails?.candidate?.CGPA != null && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-600">CGPA</span>
                              <span className="font-medium">
                                {matchDetails.candidate.CGPA}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Experience Section (from Azure blob data) */}
                    {(matchDetails?.candidate?.experience?.length ?? 0) > 0 && (
                      <>
                        <div className="border-t border-gray-200" />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold text-gray-900">
                              Experience
                            </span>
                          </div>
                          <div className="space-y-3 text-sm text-gray-700">
                            {matchDetails!.candidate!.experience!.map((exp, idx) => (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-2"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {exp.role || 'Role not specified'}
                                  </p>
                                  {exp.company && (
                                    <p className="text-gray-600">{exp.company}</p>
                                  )}
                                </div>
                                {(exp.startDate || exp.endDate) && (
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {[exp.startDate, exp.endDate]
                                      .filter(Boolean)
                                      .join(' - ')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Education Section (from Azure blob data) */}
                    {(matchDetails?.candidate?.education?.length ?? 0) > 0 && (
                      <>
                        <div className="border-t border-gray-200" />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold text-gray-900">
                              Education
                            </span>
                          </div>
                          <div className="space-y-3 text-sm text-gray-700">
                            {matchDetails!.candidate!.education!.map((edu, idx) => (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-2"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {edu.degree || 'Education'}
                                  </p>
                                  {edu.institution && (
                                    <p className="text-gray-600">{edu.institution}</p>
                                  )}
                                </div>
                                {(edu.startYear || edu.endYear) && (
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {[edu.startYear, edu.endYear]
                                      .filter(Boolean)
                                      .join(' - ')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="border-t border-gray-200" />

                    {/* Skill Analysis Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-gray-900">
                          Skill Analysis
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {/* Matched Skills / Reasons */}
                        {(selectedCandidate.matchReasons ?? []).length > 0 ? (
                          selectedCandidate.matchReasons!.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              <span className="text-gray-700">{reason}</span>
                            </div>
                          ))
                        ) : (
                          ['Typescript', 'Html', 'React', 'Front-end', 'Git', 'CSS'].map(
                            (skill) => (
                              <div key={skill} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-green-600 text-xs">✓</span>
                                </div>
                                <span className="text-gray-700">{skill}</span>
                              </div>
                            ),
                          )
                        )}

                        {/* Areas for improvement (from Azure blob data) */}
                        {(matchDetails?.concerns?.length ?? 0) > 0 && (
                          <>
                            {matchDetails!.concerns.map((concern, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-red-600 text-xs">!</span>
                                </div>
                                <span className="text-red-600">{concern}</span>
                              </div>
                            ))}
                          </>
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
