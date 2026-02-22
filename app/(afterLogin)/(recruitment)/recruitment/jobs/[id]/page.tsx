'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React, { useEffect, useState } from 'react';
import { FaUserPlus, FaTimes, FaCheck } from 'react-icons/fa';
import { MdOutlineFileDownload, MdModeEdit } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import CreateCandidate from './_components/createCandidate';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import CandidateTable from './_components/candidateTable';
import WhatYouNeed from './_components/candidateSearch/whatYouNeed';
import SearchOptions from './_components/candidateSearch/candidateSearchOptions';
import {
  useGetJobsByID,
  downloadJobCandidatesExcel,
} from '@/store/server/features/recruitment/job/queries';
import { useUpdateJobs } from '@/store/server/features/recruitment/job/mutation';
import { useGetCandidates } from '@/store/server/features/recruitment/candidate/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { IoIosArrowBack, IoIosShareAlt } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, Tabs, notification, Progress, Form, Input, Select, Radio, DatePicker, InputNumber, Row, Col } from 'antd';
import { usePathname } from 'next/navigation';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmploymentType, LocationType } from '@/types/enumTypes';
import TextEditor from '@/components/form/textEditor';
import { IoHourglassOutline } from 'react-icons/io5';

interface Params {
  id: string;
}

interface CandidateProps {
  params: Params;
}

const RADIO_GROUP_CLASS =
  'flex flex-wrap gap-2 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-8 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:rounded-lg [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-gray-300 [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-3 [&_.ant-radio-wrapper]:shadow-none [&_.ant-radio-wrapper-checked]:!border-[#6366F1] [&_.ant-radio-wrapper-checked]:!bg-[#6366F1] [&_.ant-radio-wrapper-checked]:!text-white';

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
  const updatedBy = useAuthenticationStore((s) => s.userId);
  const { mutate: updateJob } = useUpdateJobs();
  const [headerForm] = Form.useForm();
  const [infoForm] = Form.useForm();
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [activeTabKey, setActiveTabKey] = useState('candidates');
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
      setIsEditingHeader(true);
      headerForm.setFieldsValue({
        jobTitle: jobById.jobTitle,
        department: jobById.departmentId,
        employmentType: jobById.employmentType ?? EmploymentType.FULLTIME,
        jobLocation: jobById.jobLocation ?? LocationType.ONSITE,
        jobStatus: jobById.jobStatus ?? jobById.status ?? 'Open',
      });
    }
  };

  const cancelHeaderEdit = () => {
    setIsEditingHeader(false);
    headerForm.resetFields();
  };

  const saveHeaderEdit = () => {
    headerForm.validateFields().then((values) => {
      const payload = {
        id: jobById!.id,
        updatedBy,
        jobTitle: values.jobTitle,
        jobLocation: values.jobLocation,
        employmentType: values.employmentType,
        departmentId: values.department,
        jobStatus: values.jobStatus,
        description: jobById!.description,
        jobDeadline: jobById!.jobDeadline ? dayjs(jobById.jobDeadline).format('YYYY-MM-DD') : undefined,
        yearOfExperience: Number(jobById!.yearOfExperience) ?? 0,
        quantity: jobById!.quantity ?? 0,
        compensation: jobById!.compensation ?? '',
      };
      updateJob(
        { data: payload, id },
        {
          onSuccess: () => {
            setIsEditingHeader(false);
            headerForm.resetFields();
          },
        },
      );
    }).catch(() => {});
  };

  const startDescriptionEdit = () => {
    setDescriptionDraft(jobById?.description ?? '');
    setIsEditingDescription(true);
  };

  const cancelDescriptionEdit = () => {
    setIsEditingDescription(false);
    setDescriptionDraft('');
  };

  const saveDescriptionEdit = (html: string) => {
    const payload = {
      id: jobById!.id,
      updatedBy,
      jobTitle: jobById!.jobTitle,
      jobLocation: jobById!.jobLocation,
      employmentType: jobById!.employmentType,
      departmentId: jobById!.departmentId,
      jobStatus: jobById!.jobStatus ?? jobById!.status ?? 'Open',
      description: html,
      jobDeadline: jobById!.jobDeadline ? dayjs(jobById.jobDeadline).format('YYYY-MM-DD') : undefined,
      yearOfExperience: Number(jobById!.yearOfExperience) ?? 0,
      quantity: jobById!.quantity ?? 0,
      compensation: jobById!.compensation ?? '',
    };
    updateJob(
      { data: payload, id },
      {
        onSuccess: () => {
          setIsEditingDescription(false);
          setDescriptionDraft('');
        },
      },
    );
  };

  const startInfoEdit = () => {
    setIsEditingInfo(true);
    infoForm.setFieldsValue({
      jobDeadline: jobById?.jobDeadline ? dayjs(jobById.jobDeadline) : undefined,
      quantity: jobById?.quantity ?? 0,
      yearOfExperience: jobById?.yearOfExperience ?? 0,
      compensation: jobById?.compensation ?? '',
    });
  };

  const cancelInfoEdit = () => {
    setIsEditingInfo(false);
    infoForm.resetFields();
  };

  const saveInfoEdit = () => {
    infoForm.validateFields().then((values) => {
      const payload = {
        id: jobById!.id,
        updatedBy,
        jobTitle: jobById!.jobTitle,
        jobLocation: jobById!.jobLocation,
        employmentType: jobById!.employmentType,
        departmentId: jobById!.departmentId,
        jobStatus: jobById!.jobStatus ?? jobById!.status ?? 'Open',
        description: jobById!.description,
        jobDeadline: values.jobDeadline ? dayjs(values.jobDeadline).format('YYYY-MM-DD') : undefined,
        yearOfExperience: Number(values.yearOfExperience) ?? 0,
        quantity: values.quantity ?? 0,
        compensation: values.compensation ?? '',
      };
      updateJob(
        { data: payload, id },
        {
          onSuccess: () => {
            setIsEditingInfo(false);
            infoForm.resetFields();
          },
        },
      );
    }).catch(() => {});
  };

  const jobStatus = jobById?.status ?? jobById?.jobStatus ?? 'Open';
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
        id="talent-acquisition-job-detail-card"
        className="bg-white rounded-lg border border-gray-200 p-5 mb-6 relative"
        data-cy="talent-acquisition-job-detail-card"
      >
        {isEditingHeader ? (
          <Form
            form={headerForm}
            layout="vertical"
            className="relative"
            id="talent-acquisition-job-detail-header-form"
            data-cy="talent-acquisition-job-detail-header-form"
          >
            <div className="absolute top-0 right-0 flex items-center gap-2" id="job-detail-edit-actions" data-cy="job-detail-edit-actions">
              <Form.Item name="jobStatus" label={null} rules={[{ required: true }]} className="!mb-0">
                <Select
                  id="job-detail-edit-status"
                  placeholder="Status"
                  className="!min-w-[100px] !rounded-lg [&.ant-select-focused]:!border-[#6366F1] [&.ant-select-selector]:!border-gray-300 [&.ant-select-selection-item]:!text-[#4F46E5]"
                  optionLabelProp="label"
                  data-cy="talent-acquisition-job-detail-edit-status"
                >
                  <Select.Option value="Open" label="Open">Open</Select.Option>
                  <Select.Option value="Closed" label="Closed">Closed</Select.Option>
                </Select>
              </Form.Item>
              <button
                type="button"
                id="job-detail-edit-cancel"
                onClick={cancelHeaderEdit}
                className="flex items-center justify-center w-8 h-8 rounded border border-red-500 bg-white text-red-500 hover:bg-red-50 shrink-0"
                data-cy="talent-acquisition-job-detail-cancel-header"
              >
                <FaTimes className="w-3 h-3" />
              </button>
              <button
                type="button"
                id="job-detail-edit-save"
                onClick={saveHeaderEdit}
                className="flex items-center justify-center w-8 h-8 rounded border-0 bg-[#6366F1] text-white hover:bg-[#4F46E5] shrink-0"
                data-cy="talent-acquisition-job-detail-save-header"
              >
                <FaCheck className="w-3 h-3" />
              </button>
            </div>
            <div className="pr-52">
              <Form.Item name="jobTitle" label="Job Name *" rules={[{ required: true, message: 'Please input the job name!' }]}>
                <Input
                  id="job-detail-edit-job-title"
                  placeholder="Job title"
                  size="small"
                  className="!rounded-lg !border-gray-300 !h-8 max-w-[200px]"
                  data-cy="talent-acquisition-job-detail-edit-job-title"
                />
              </Form.Item>
              <Row gutter={[16, 0]} className="!flex !flex-wrap">
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item name="department" label="Department *" rules={[{ required: true, message: 'Please select department!' }]} className="!mb-0">
                    <Select
                      id="job-detail-edit-department"
                      placeholder="Department"
                      size="small"
                      className="!rounded-lg w-full !border-gray-300 !h-8"
                      allowClear
                      data-cy="talent-acquisition-job-detail-edit-department"
                    >
                      {departments?.map((dep: any) => (
                        <Select.Option key={dep?.id} value={dep?.id}>{dep?.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item name="employmentType" label="Job Type *" rules={[{ required: true }]} className="!mb-0">
                    <Radio.Group size="small" className={RADIO_GROUP_CLASS} data-cy="talent-acquisition-job-detail-edit-job-type">
                      <Radio value={EmploymentType.FULLTIME}>Full-time</Radio>
                      <Radio value={EmploymentType.PARTTIME}>Part-time</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item name="jobLocation" label="Location *" rules={[{ required: true }]} className="!mb-0">
                    <Radio.Group size="small" className={RADIO_GROUP_CLASS} data-cy="talent-acquisition-job-detail-edit-location">
                      <Radio value={LocationType.ONSITE}>Onsite</Radio>
                      <Radio value={LocationType.REMOTE}>Remote</Radio>
                      <Radio value={LocationType.HYBRID}>Hybrid</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        ) : (
          <>
            <div className="absolute top-5 right-5 flex items-center gap-2" id="job-detail-view-actions" data-cy="job-detail-view-actions">
              <span
                id="job-detail-status-badge"
                className={`inline-flex items-center text-xs font-medium rounded-md px-3 py-1 ${
                  displayStatus === 'Closed'
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
                data-cy="talent-acquisition-job-detail-status"
              >
                {displayStatus}
              </span>
              {activeTabKey === 'information' && (
                <button
                  type="button"
                  id="job-detail-edit-card"
                  onClick={handleEditJob}
                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
                  data-cy="talent-acquisition-job-detail-edit-card"
                >
                  <MdModeEdit className="w-4 h-4" />
                </button>
              )}
            </div>
            <h2 id="job-detail-job-title" className="text-xl font-bold text-gray-900 pr-24 mb-4" data-cy="talent-acquisition-job-detail-job-title">
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
          </>
        )}
      </div>

      {/* Tabs + action buttons */}
      <div className="mb-4">
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          className="talent-acquisition-job-detail-tabs"
          tabBarExtraContent={
            <div className="flex items-center gap-2">
              <Button
                type="default"
                icon={<MdOutlineFileDownload size={18} className="text-gray-600 opacity-90" />}
                onClick={handleDownloadExcel}
                loading={isDownloading}
                className="!h-11 !rounded-lg !bg-white !border-gray-300 !text-gray-700 hover:!border-gray-400 hover:!text-gray-800"
                data-cy="talent-acquisition-job-detail-button-download-excel"
              >
                Download
              </Button>
              <Button
                type="primary"
                icon={<FaUserPlus size={12} />}
                onClick={showDrawer}
                className="!h-11 !rounded-lg !bg-[#6366F1] hover:!bg-[#4F46E5] !border-0 !text-white"
                data-cy="talent-acquisition-job-detail-button-add-candidate"
              >
                Add Candidate
              </Button>
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
                    <div id="job-detail-description-section" className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6" data-cy="job-detail-description-section">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
                        {!isEditingDescription ? (
                          <button
                            type="button"
                            id="job-detail-edit-description-btn"
                            onClick={startDescriptionEdit}
                            className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
                            data-cy="talent-acquisition-job-detail-edit-description"
                          >
                            <MdModeEdit className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2" data-cy="job-detail-description-edit-actions">
                            <button
                              type="button"
                              id="job-detail-description-cancel"
                              onClick={cancelDescriptionEdit}
                              className="flex items-center justify-center w-8 h-8 rounded border border-red-500 bg-white text-red-500 hover:bg-red-50 shrink-0"
                              data-cy="job-detail-description-cancel"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              id="job-detail-description-save"
                              onClick={() => saveDescriptionEdit(descriptionDraft)}
                              className="flex items-center justify-center w-8 h-8 rounded border-0 bg-[#6366F1] text-white hover:bg-[#4F46E5] shrink-0"
                              data-cy="job-detail-description-save"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditingDescription ? (
                        <div data-cy="job-detail-description-editor">
                          <span className="text-sm text-gray-600 block mb-2">Description *</span>
                          <TextEditor
                            value={descriptionDraft}
                            onChange={(html) => setDescriptionDraft(html)}
                            placeholder="Enter job description"
                          />
                        </div>
                      ) : (
                        <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {jobById?.description ? (
                            <div dangerouslySetInnerHTML={{ __html: jobById.description }} />
                          ) : (
                            <p className="text-gray-400 italic">No job description available.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Closing Date + Preferences */}
                    <div className="space-y-6">
                      {/* Job Vacancy Closing Date + Job Preference */}
                      <div id="job-detail-closing-date-section" className="bg-white rounded-lg border border-gray-200 p-6" data-cy="job-detail-closing-date-section">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Job Vacancy Closing Date</h3>
                          {!isEditingInfo ? (
                            <button
                              type="button"
                              id="job-detail-edit-closing-date-btn"
                              onClick={startInfoEdit}
                              className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
                              data-cy="talent-acquisition-job-detail-edit-closing-date"
                            >
                              <MdModeEdit className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2" data-cy="job-detail-info-edit-actions">
                              <button
                                type="button"
                                id="job-detail-info-cancel"
                                onClick={cancelInfoEdit}
                                className="flex items-center justify-center w-8 h-8 rounded border border-red-500 bg-white text-red-500 hover:bg-red-50 shrink-0"
                                data-cy="job-detail-info-cancel"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                id="job-detail-info-save"
                                onClick={saveInfoEdit}
                                className="flex items-center justify-center w-8 h-8 rounded border-0 bg-[#6366F1] text-white hover:bg-[#4F46E5] shrink-0"
                                data-cy="job-detail-info-save"
                              >
                                <FaCheck className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditingInfo ? (
                          <Form form={infoForm} layout="vertical" id="job-detail-info-form" data-cy="job-detail-info-form">
                            <Form.Item name="jobDeadline" label="Expected Closing Date *" rules={[{ required: true, message: 'Please select date!' }]}>
                              <DatePicker id="job-detail-edit-deadline" className="w-full !rounded-lg" data-cy="job-detail-edit-deadline" />
                            </Form.Item>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-4">Job Preference</h3>
                            <Form.Item name="quantity" label="Quantity *" rules={[{ required: true }]}>
                              <InputNumber id="job-detail-edit-quantity" className="w-full !rounded-lg" placeholder="0" min={0} data-cy="job-detail-edit-quantity" />
                            </Form.Item>
                            <Form.Item name="yearOfExperience" label="Years of experience *" rules={[{ required: true }]}>
                              <InputNumber id="job-detail-edit-years" className="w-full !rounded-lg" placeholder="0" min={0} data-cy="job-detail-edit-years" />
                            </Form.Item>
                            <Form.Item name="compensation" label="Compensation *" rules={[{ required: true }]}>
                              <Input id="job-detail-edit-compensation" className="!rounded-lg" placeholder="e.g. 10,000 - 12,000" data-cy="job-detail-edit-compensation" />
                            </Form.Item>
                          </Form>
                        ) : (
                          <>
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
                            <div className="mt-6">
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
                          </>
                        )}
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
    </div>
  );
};

export default Candidates;
