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
  Avatar,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { FaMapMarkerAlt, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter, useParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useAIJobMatchingStore } from '@/store/uistate/features/recruitment/ai-job-matching';
import {
  useGetAIMatchedCandidates,
  useGetAIMatchDetails,
} from '@/store/server/features/recruitment/ai-job-matching/queries';

dayjs.extend(relativeTime);

const JOB_CANDIDATES_PER_PAGE = 5;

// Custom styles for modern UI
const modernStyles = `
  .modern-modal .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
  }

  .modern-modal .ant-modal-header {
    border-radius: 16px 16px 0 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .modern-modal .ant-modal-title {
    color: white !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = modernStyles;
  document.head.appendChild(styleSheet);
}
const TABLE_PAGE_SIZE = 10;

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
    location: matchResponse.location || 'Remote',
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
      title={
        <div className="flex items-center gap-3">
          <TrophyOutlined style={{ color: '#4F46E5' }} />
          <span>AI Match Analysis</span>
        </div>
      }
      open={matchDetailsDrawerOpen}
      onCancel={handleCloseDetails}
      footer={null}
      width={720}
      centered
      className="modern-modal"
    >
      {isDetailsLoading && (
        <div className="flex items-center justify-center h-40">
          <Spin size="large" />
        </div>
      )}
      {!isDetailsLoading && !matchDetails && (
        <Empty description="No analysis available" />
      )}
      {!isDetailsLoading && matchDetails && (
        <div className="space-y-6">
          {/* Candidate Info Header */}
          {matchDetails.candidate && (
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <div className="flex items-center gap-4">
                <Avatar size={64} icon={<UserOutlined />} className="bg-indigo-500" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {matchDetails.candidate.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    {matchDetails.candidate.email && (
                      <span className="flex items-center gap-1">
                        <MailOutlined /> {matchDetails.candidate.email}
                      </span>
                    )}
                    {matchDetails.candidate.phone && (
                      <span className="flex items-center gap-1">
                        <PhoneOutlined /> {matchDetails.candidate.phone}
                      </span>
                    )}
                    {(matchDetails.candidate.city || matchDetails.candidate.country) && (
                      <span className="flex items-center gap-1">
                        <GlobalOutlined /> {[matchDetails.candidate.city, matchDetails.candidate.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                  {matchDetails.candidate.resumeUrl && (
                    <div className="mt-3">
                      <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        href={matchDetails.candidate.resumeUrl}
                        target="_blank"
                        size="small"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        View Resume
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Match Score */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Overall Match Score</p>
            <div className="flex items-center gap-4">
              <Progress
                type="circle"
                percent={matchDetails.matchScore}
                width={80}
                strokeColor="#4F46E5"
                strokeWidth={8}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{matchDetails.matchScore}%</span>
                  <Tag color={matchDetails.matchScore >= 80 ? 'success' : matchDetails.matchScore >= 65 ? 'warning' : 'error'}>
                    {matchDetails.matchScore >= 80 ? 'Excellent Match' : matchDetails.matchScore >= 65 ? 'Good Match' : 'Needs Review'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-600">
                  Candidate is a strong match for this role based on skills, experience, education, and location.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  <ClockCircleOutlined className="mr-1" />
                  Last analyzed: {dayjs(matchDetails.analysisTimestamp).format('DD MMM YYYY, HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-4">Detailed Score Breakdown</p>
            <div className="grid grid-cols-2 gap-4">
              <Card size="small" className="text-center border-indigo-200 bg-indigo-50/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaBriefcase className="text-indigo-600" />
                  <span className="font-medium text-indigo-900">Skills</span>
                </div>
                <Progress
                  percent={matchDetails.detailedAnalysis?.skillsMatch?.score ?? matchDetails.matchScore}
                  size="small"
                  strokeColor="#4F46E5"
                  showInfo={false}
                />
                <p className="text-sm font-semibold text-indigo-900 mt-2">
                  {matchDetails.detailedAnalysis?.skillsMatch?.score ?? matchDetails.matchScore}%
                </p>
              </Card>
              <Card size="small" className="text-center border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ClockCircleOutlined className="text-emerald-600" />
                  <span className="font-medium text-emerald-900">Experience</span>
                </div>
                <Progress
                  percent={matchDetails.detailedAnalysis?.experienceMatch?.score ?? matchDetails.matchScore}
                  size="small"
                  strokeColor="#10B981"
                  showInfo={false}
                />
                <p className="text-sm font-semibold text-emerald-900 mt-2">
                  {matchDetails.detailedAnalysis?.experienceMatch?.score ?? matchDetails.matchScore}%
                </p>
              </Card>
              <Card size="small" className="text-center border-sky-200 bg-sky-50/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaGraduationCap className="text-sky-600" />
                  <span className="font-medium text-sky-900">Education</span>
                </div>
                <Progress
                  percent={matchDetails.detailedAnalysis?.educationMatch?.score ?? matchDetails.matchScore}
                  size="small"
                  strokeColor="#0EA5E9"
                  showInfo={false}
                />
                <p className="text-sm font-semibold text-sky-900 mt-2">
                  {matchDetails.detailedAnalysis?.educationMatch?.score ?? matchDetails.matchScore}%
                </p>
              </Card>
              <Card size="small" className="text-center border-amber-200 bg-amber-50/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-amber-600" />
                  <span className="font-medium text-amber-900">Location</span>
                </div>
                <Progress
                  percent={matchDetails.detailedAnalysis?.locationMatch?.score ?? matchDetails.matchScore}
                  size="small"
                  strokeColor="#F59E0B"
                  showInfo={false}
                />
                <p className="text-sm font-semibold text-amber-900 mt-2">
                  {matchDetails.detailedAnalysis?.locationMatch?.score ?? matchDetails.matchScore}%
                </p>
              </Card>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleOutlined className="text-green-600" />
              <p className="text-sm font-medium text-gray-700">Recommended Next Steps</p>
            </div>
            <div className="space-y-2">
              {(matchDetails.recommendations || []).map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircleOutlined className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths and Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrophyOutlined className="text-blue-600" />
                <p className="text-sm font-medium text-gray-700">Strengths</p>
              </div>
              <div className="space-y-2">
                {(matchDetails.strengths || []).map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClockCircleOutlined className="text-orange-600" />
                <p className="text-sm font-medium text-gray-700">Areas for Consideration</p>
              </div>
              <div className="space-y-2">
                {(matchDetails.concerns || []).map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
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

      <div className="space-y-6">
        {/* Job Header Card */}
        <Card className="rounded-2xl border border-gray-100 shadow-lg bg-gradient-to-r from-white to-indigo-50/30">
            {isJobLoading ? (
              <div className="flex items-center justify-center h-40">
                <Spin size="large" />
              </div>
            ) : !jobDetails ? (
              <Empty description="Job details not found" />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-100 rounded-xl">
                        <FaBriefcase className="text-indigo-600 text-xl" />
                      </div>
                      <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                          {jobDetails.jobTitle}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                          {jobDetails.department?.name || 'Department not specified'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                          <span className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-400" />
                            {jobDetails.jobLocation || jobDetails.location || 'Location not specified'}
                          </span>
                          {jobDetails.createdAt && (
                            <span className="flex items-center gap-2">
                              <MdOutlineAccessTime className="text-gray-400" />
                              Posted {dayjs(jobDetails.createdAt).format('DD MMM YYYY')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Tag
                      color={
                        jobDetails.jobStatus?.toLowerCase() === 'active'
                          ? 'success'
                          : jobDetails.jobStatus?.toLowerCase() === 'closed'
                          ? 'error'
                          : 'default'
                      }
                      className="text-sm px-3 py-1"
                      icon={jobDetails.jobStatus?.toLowerCase() === 'active' ? <CheckCircleOutlined /> : undefined}
                    >
                      {jobDetails.jobStatus || 'Draft'}
                    </Tag>
                  </div>
                </div>

                {matchResponse && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card size="small" className="rounded-xl border-indigo-200 bg-indigo-50/50 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrophyOutlined className="text-indigo-600" />
                        <span className="text-xs font-medium text-indigo-900">AI Matches</span>
                      </div>
                      <p className="text-2xl font-bold text-indigo-600">
                        {matchResponse.totalMatches}
                      </p>
                      <p className="text-xs text-indigo-700">Qualified candidates</p>
                    </Card>
                    <Card size="small" className="rounded-xl border-emerald-200 bg-emerald-50/50 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <UserOutlined className="text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-900">Total Candidates</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">
                        {matchResponse.matchedCandidates?.length || 0}
                      </p>
                      <p className="text-xs text-emerald-700">Applied for this role</p>
                    </Card>
                    <Card size="small" className="rounded-xl border-blue-200 bg-blue-50/50 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <ClockCircleOutlined className="text-blue-600" />
                        <span className="text-xs font-medium text-blue-900">Last Analyzed</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-900">
                        {matchResponse.analysisTimestamp
                          ? dayjs(matchResponse.analysisTimestamp).fromNow()
                          : 'Never'}
                      </p>
                      <p className="text-xs text-blue-700">
                        {matchResponse.analysisTimestamp
                          ? dayjs(matchResponse.analysisTimestamp).format('DD MMM YYYY')
                          : 'No analysis yet'}
                      </p>
                    </Card>
                  </div>
                )}

                {/* Match Score Filter */}
                <Card className="border-gray-200 bg-gray-50/50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TrophyOutlined className="text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Match Score Filter</p>
                        <p className="text-xs text-gray-500">Adjust threshold to see more or fewer candidates</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={minMatchScore}
                        onChange={(e) => setMinMatchScore(Number(e.target.value))}
                        className="w-full accent-indigo-600 h-2 rounded-lg"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">0% (Show All)</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                            {minMatchScore}% minimum
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">100% (Perfect Match)</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
        </Card>

        {/* AI Matched Candidates Section */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrophyOutlined className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI Matched Candidates
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Top-ranked candidates based on AI analysis of skills, experience, and job fit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {matchedCandidates.length} candidates
                  </p>
                  <p className="text-xs text-gray-500">
                    Above {minMatchScore}% match threshold
                  </p>
                </div>
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
                      'Pending';
                    const location =
                      [candidate.candidate.city, candidate.candidate.country]
                        .filter(Boolean)
                        .join(', ') || 'Location not specified';
                    const score = candidate.matchScore;

                    return (
                      <Card
                        key={candidate.candidateId}
                        className="rounded-2xl border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 bg-gradient-to-r from-white to-indigo-50/20"
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <Avatar
                                size={48}
                                icon={<UserOutlined />}
                                className="bg-indigo-500 shadow-sm"
                              >
                                {candidate.candidate.fullName?.charAt(0)?.toUpperCase()}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                  {candidate.candidate.fullName || 'Unknown Candidate'}
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                  <GlobalOutlined className="text-gray-400" />
                                  {location}
                                </p>
                                {candidate.candidate.email && (
                                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                    <MailOutlined className="text-gray-400" />
                                    {candidate.candidate.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Tag
                                color={
                                  stage.toLowerCase().includes('hired') || stage.toLowerCase().includes('completed')
                                    ? 'success'
                                    : stage.toLowerCase().includes('interview')
                                    ? 'processing'
                                    : 'default'
                                }
                                className="text-xs"
                                icon={
                                  stage.toLowerCase().includes('hired')
                                    ? <CheckCircleOutlined />
                                    : undefined
                                }
                              >
                                {stage}
                              </Tag>
                            </div>
                          </div>

                          {/* Match Score */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrophyOutlined className="text-indigo-600" />
                                <span className="text-sm font-medium text-gray-700">Match Score</span>
                              </div>
                              <span className="text-xl font-bold text-indigo-600">{score}%</span>
                            </div>
                            <Progress
                              percent={score}
                              showInfo={false}
                              strokeColor={
                                score >= 80
                                  ? '#22c55e'
                                  : score >= 65
                                    ? '#4f46e5'
                                    : '#f59e0b'
                              }
                              strokeWidth={6}
                              className="mb-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Poor Match</span>
                              <span className={`font-medium ${
                                score >= 80 ? 'text-green-600' :
                                score >= 65 ? 'text-indigo-600' : 'text-orange-600'
                              }`}>
                                {score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : 'Fair'}
                              </span>
                              <span>Perfect Match</span>
                            </div>
                          </div>

                          {/* Match Reasons */}
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-2">Key Match Factors</p>
                            <div className="flex flex-wrap gap-1">
                              {(candidate.matchReasons || [])
                                .slice(0, 3)
                                .map((reason, idx) => (
                                  <Tag
                                    key={idx}
                                    color="blue"
                                    className="text-xs"
                                    style={{ margin: 0 }}
                                  >
                                    {reason.length > 25 ? `${reason.substring(0, 25)}...` : reason}
                                  </Tag>
                                ))}
                              {(candidate.matchReasons || []).length > 3 && (
                                <Tag className="text-xs" style={{ margin: 0 }}>
                                  +{(candidate.matchReasons || []).length - 3} more
                                </Tag>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              {candidate.candidate.resumeUrl && (
                                <Button
                                  type="text"
                                  icon={<FileTextOutlined />}
                                  size="small"
                                  href={candidate.candidate.resumeUrl}
                                  target="_blank"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Resume
                                </Button>
                              )}
                              <Button
                                type="text"
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => handleOpenDetails(candidate.candidateId)}
                                className="text-indigo-600 hover:text-indigo-700"
                              >
                                Details
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500">
                              {candidate.candidate.CGPA && (
                                <span className="flex items-center gap-1">
                                  <FaGraduationCap className="text-blue-500" />
                                  CGPA: {candidate.candidate.CGPA}
                                </span>
                              )}
                            </div>
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
      </div>

      {renderDetailsModal()}
    </div>
  );
};

export default AIJobMatchingJobDetailPage;


