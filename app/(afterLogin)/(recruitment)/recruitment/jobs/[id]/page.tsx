'use client';
/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useState } from 'react';
import { FaTimes, FaCheck, FaUserPlus } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';
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
import {
  Button,
  Tabs,
  notification,
  Progress,
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  InputNumber,
} from 'antd';
import { usePathname } from 'next/navigation';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmploymentType, LocationType } from '@/types/enumTypes';
import TextEditor from '@/components/form/textEditor';
import { IoHourglassOutline } from 'react-icons/io5';
import CustomBreadcrumb from '@/components/common/breadCramp';
import JobDetailHeaderCardSkeleton from './_components/jobDetailHeaderCardSkeleton';
import JobDetailInformationTabSkeleton from './_components/jobDetailInformationTabSkeleton';
import MyApprovalTable from './_components/myApprovalTable';
import DoneIcon from '@mui/icons-material/Done';
interface Params {
  id: string;
}

interface CandidateProps {
  params: Params;
}

const RADIO_GROUP_CLASS =
  'flex flex-nowrap w-full gap-2 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:!flex-1 [&_.ant-radio-wrapper]:!justify-center [&_.ant-radio-wrapper]:!whitespace-nowrap [&_.ant-radio-wrapper]:h-10 [&_.ant-radio-wrapper]:cursor-pointer [&_.ant-radio-wrapper]:select-none [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:gap-2 [&_.ant-radio-wrapper]:rounded-[8px] [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-solid [&_.ant-radio-wrapper]:border-[#D9D9D9] [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-3 [&_.ant-radio-wrapper]:shadow-none [&_.ant-radio-wrapper]:text-[14px] [&_.ant-radio-wrapper]:font-normal [&_.ant-radio-wrapper]:text-[rgba(0,0,0,0.7)] [&_.ant-radio-wrapper:hover]:!border-[#1677FF] [&_.ant-radio-wrapper-checked]:!border-[#1677FF]';

const INFO_FORM_LABEL_CLASS =
  '[&_.ant-form-item-label>label]:!text-[14px] [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:!text-[rgba(0,0,0,0.7)] [&_.ant-form-item-label]:!pb-2';

const formatCompensationDisplay = (val: unknown): string => {
  if (val == null || val === '') return '—';
  if (typeof val === 'string') {
    const t = val.trim();
    if (t === '') return '—';
    if (t.includes('-') || t.includes(',')) return t;
    const n = Number(t);
    if (!Number.isNaN(n)) return n.toLocaleString('en-US');
    return t;
  }
  if (typeof val === 'number' && !Number.isNaN(val)) {
    return val.toLocaleString('en-US');
  }
  return '—';
};

const EditPencilIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M6.45167 3.51167L6.98833 4.04833L1.70333 9.33333H1.16667V8.79667L6.45167 3.51167V3.51167ZM8.55167 0C8.40583 0 8.25417 0.0583333 8.14333 0.169167L7.07583 1.23667L9.26333 3.42417L10.3308 2.35667C10.5583 2.12917 10.5583 1.76167 10.3308 1.53417L8.96583 0.169167C8.84917 0.0525 8.70333 0 8.55167 0V0ZM6.45167 1.86083L0 8.3125V10.5H2.1875L8.63917 4.04833L6.45167 1.86083V1.86083Z"
      fill="#374151"
    />
  </svg>
);

const MoveToTalentPoolIcon = () => (
  <svg
    width="12"
    height="10"
    viewBox="0 0 12 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M6 1.94551V0.753009C6 0.0855087 6.81 -0.251991 7.2825 0.220509L11.475 4.41301C11.7675 4.70551 11.7675 5.17801 11.475 5.47051L7.2825 9.66301C6.81 10.1355 6 9.80551 6 9.13801V7.94551H0.75C0.3375 7.94551 0 7.60801 0 7.19551V2.69551C0 2.28301 0.3375 1.94551 0.75 1.94551H6Z"
      fill="white"
    />
  </svg>
);

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
  const { data: jobById, isLoading: isJobLoading } = useGetJobsByID(id);
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
  }, [pathname, setSelectedCandidate, setSelectedRowKeys]);

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
    headerForm
      .validateFields()
      .then((values) => {
        const payload = {
          id: jobById!.id,
          updatedBy,
          jobTitle: values.jobTitle,
          jobLocation: values.jobLocation,
          employmentType: values.employmentType,
          departmentId: values.department,
          jobStatus: values.jobStatus,
          description: jobById!.description,
          jobDeadline: jobById!.jobDeadline
            ? dayjs(jobById.jobDeadline).format('YYYY-MM-DD')
            : undefined,
          yearOfExperience: Number(jobById!.yearOfExperience) ?? 0,
          quantity: jobById!.quantity ?? 0,
          compensation: jobById!.compensation
            ? Number(jobById!.compensation)
            : 0,
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
      })
      .catch(() => {});
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
      jobDeadline: jobById!.jobDeadline
        ? dayjs(jobById.jobDeadline).format('YYYY-MM-DD')
        : undefined,
      yearOfExperience: Number(jobById!.yearOfExperience) ?? 0,
      quantity: jobById!.quantity ?? 0,
      compensation: jobById!.compensation ? Number(jobById!.compensation) : 0,
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
      jobDeadline: jobById?.jobDeadline
        ? dayjs(jobById.jobDeadline)
        : undefined,
      quantity: jobById?.quantity ?? 0,
      yearOfExperience: jobById?.yearOfExperience ?? 0,
      compensation: jobById?.compensation ? Number(jobById.compensation) : 0,
    });
  };

  const cancelInfoEdit = () => {
    setIsEditingInfo(false);
    infoForm.resetFields();
  };

  const saveInfoEdit = () => {
    infoForm
      .validateFields()
      .then((values) => {
        const payload = {
          id: jobById!.id,
          updatedBy,
          jobTitle: jobById!.jobTitle,
          jobLocation: jobById!.jobLocation,
          employmentType: jobById!.employmentType,
          departmentId: jobById!.departmentId,
          jobStatus: jobById!.jobStatus ?? jobById!.status ?? 'Open',
          description: jobById!.description,
          jobDeadline: values.jobDeadline
            ? dayjs(values.jobDeadline).format('YYYY-MM-DD')
            : undefined,
          yearOfExperience: Number(values.yearOfExperience) ?? 0,
          quantity: values.quantity ?? 0,
          compensation: values.compensation ? Number(values.compensation) : 0,
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
      })
      .catch(() => {});
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
  const totalDays =
    jobById?.jobDeadline && jobById?.createdAt
      ? dayjs(jobById.jobDeadline).diff(dayjs(jobById.createdAt), 'day')
      : 30; // Default to 30 days if not available
  const progressPercent =
    totalDays > 0 && daysRemaining !== null
      ? Math.round((daysRemaining / totalDays) * 100)
      : 0;

  return (
    <div
      id="talent-acquisition-job-detail-page-div-container"
      data-cy="talent-acquisition-job-detail-page-div-container"
      className="min-h-screen w-full bg-white font-['Calibri']"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .talent-acquisition-job-detail-page * { font-family: Calibri, sans-serif; }
          .talent-acquisition-job-detail-tabs .ant-tabs-nav { margin-bottom: 0; }
          .talent-acquisition-job-detail-tabs .ant-tabs-nav::before {
            border-bottom: 1px solid #E5E7EB;
          }
          .talent-acquisition-job-detail-tabs .ant-tabs-tab {
            padding: 10px 0 12px;
            margin: 0 28px 0 0;
            font-size: 16px;
            font-weight: 400;
          }
          .talent-acquisition-job-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #1E40AF !important;
            text-shadow: none;
          }
          .talent-acquisition-job-detail-tabs .ant-tabs-tab-btn {
            font-size: 16px;
            font-weight: 400;
          }
          .talent-acquisition-job-detail-tabs .ant-tabs-ink-bar {
            background: #1E40AF;
            height: 2px;
          }
          .talent-acquisition-job-detail-tabs .ant-tabs-tab:not(.ant-tabs-tab-active) .ant-tabs-tab-btn {
            color: rgba(0, 0, 0, 0.65);
          }
        `,
        }}
      />
      <div className="talent-acquisition-job-detail-page">
        <header className="w-full">
          <div className="px-4 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-center gap-3">
              <CustomBreadcrumb
                onBack={handleBackClick}
                data-cy="talent-acquisition-job-detail-breadcrumb"
                title={
                  <span data-cy="talent-acquisition-job-detail-title">
                    Job Details
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
                      Jobs
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
        </header>
        <div className="py-4">
          {/* Job information card */}
          <div
            id="talent-acquisition-job-detail-card"
            className={`relative mb-6 rounded-[8px] border border-solid border-[#D9D9D9] bg-white px-7 py-4 ${
              isEditingHeader || isJobLoading
                ? 'min-h-0'
                : 'min-h-[88px] sm:h-[122px]'
            }`}
            data-cy="talent-acquisition-job-detail-card"
          >
            {isEditingHeader ? (
              <Form
                form={headerForm}
                layout="vertical"
                className={`relative ${INFO_FORM_LABEL_CLASS} [&_.ant-form-item-label_label::before]:!hidden`}
                id="talent-acquisition-job-detail-header-form"
                data-cy="talent-acquisition-job-detail-header-form"
                requiredMark={(label, { required }) => (
                  <>
                    {label}
                    {required && <span className="ml-1 text-[#FF4D4F]">*</span>}
                  </>
                )}
              >
                <div
                  className="absolute top-0 right-0 flex items-center gap-2"
                  id="job-detail-edit-actions"
                  data-cy="job-detail-edit-actions"
                >
                  <Form.Item
                    name="jobStatus"
                    label={null}
                    rules={[{ required: true }]}
                    className="!mb-0"
                  >
                    <Select
                      id="job-detail-edit-status"
                      placeholder="Status"
                      className="!h-10 !min-w-[100px] [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-[8px] [&_.ant-select-selector]:!border-[#D9D9D9] [&_.ant-select-selector]:!px-3 [&_.ant-select-focused_.ant-select-selector]:!border-[#1677FF] [&_.ant-select-selection-item]:!text-[16px] [&_.ant-select-selection-item]:!font-normal [&_.ant-select-selection-item]:!leading-[40px] [&_.ant-select-selection-item]:!text-[rgba(0,0,0,0.7)] [&_.ant-select-selection-search]:!inset-y-0 [&_.ant-select-selection-search-input]:!h-full"
                      optionLabelProp="label"
                      data-cy="talent-acquisition-job-detail-edit-status"
                    >
                      <Select.Option value="Open" label="Open">
                        Open
                      </Select.Option>
                      <Select.Option value="Closed" label="Closed">
                        Closed
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <button
                    type="button"
                    id="job-detail-edit-cancel"
                    onClick={cancelHeaderEdit}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border border-solid border-[#FF4D4F] bg-white"
                    data-cy="talent-acquisition-job-detail-cancel-header"
                  >
                    <FaTimes
                      style={{
                        width: '8.17px',
                        height: '8.17px',
                        color: '#FF4D4F',
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    id="job-detail-edit-save"
                    onClick={saveHeaderEdit}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] !border-0 !bg-[#1E40AF]"
                    data-cy="talent-acquisition-job-detail-save-header"
                  >
                    <FaCheck
                      style={{
                        width: '8.17px',
                        height: '8.17px',
                        color: '#fff',
                      }}
                    />
                  </button>
                </div>
                {/* Job Name: right-padded to avoid overlap with the absolute status+buttons */}
                <div className="pr-[168px] sm:pr-52">
                  <Form.Item
                    name="jobTitle"
                    label="Job Name"
                    rules={[
                      { required: true, message: 'Please input the job name!' },
                    ]}
                  >
                    <Input
                      id="job-detail-edit-job-title"
                      placeholder="Job title"
                      className="!h-10 max-w-[280px] !rounded-[8px] !border-[#D9D9D9] !text-[16px] !font-normal !text-black"
                      data-cy="talent-acquisition-job-detail-edit-job-title"
                    />
                  </Form.Item>
                </div>
                {/* Department / Job Type / Location: at ≤1330px Location spans full row below Dept + Job Type */}
                <div className="grid gap-x-5 gap-y-4 max-[1330px]:grid-cols-2 min-[1331px]:grid-cols-[206px_auto_auto] min-[1331px]:justify-start min-[1331px]:gap-x-[52px]">
                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[
                      {
                        required: true,
                        message: 'Please select department!',
                      },
                    ]}
                    className="!mb-0 min-w-0"
                  >
                    <Select
                      id="job-detail-edit-department"
                      placeholder="Department"
                      className="w-full [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!rounded-[8px] [&_.ant-select-selector]:!border-[#D9D9D9] [&_.ant-select-selection-placeholder]:!text-[16px] [&_.ant-select-selection-item]:!text-[16px] [&_.ant-select-selection-item]:!font-normal [&_.ant-select-selection-item]:!text-[rgba(0,0,0,0.7)]"
                      allowClear
                      data-cy="talent-acquisition-job-detail-edit-department"
                    >
                      {departments?.map((dep: any) => (
                        <Select.Option key={dep?.id} value={dep?.id}>
                          {dep?.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="employmentType"
                    label="Job Type"
                    rules={[{ required: true }]}
                    className="!mb-0 min-w-0"
                  >
                    <Radio.Group
                      className={RADIO_GROUP_CLASS}
                      data-cy="talent-acquisition-job-detail-edit-job-type"
                    >
                      <Radio value={EmploymentType.FULLTIME}>Full-time</Radio>
                      <Radio value={EmploymentType.PARTTIME}>Part-time</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    name="jobLocation"
                    label="Location"
                    rules={[{ required: true }]}
                    className="!mb-0 min-w-0 max-[1330px]:col-span-2"
                  >
                    <Radio.Group
                      className={RADIO_GROUP_CLASS}
                      data-cy="talent-acquisition-job-detail-edit-location"
                    >
                      <Radio value={LocationType.ONSITE}>Onsite</Radio>
                      <Radio value={LocationType.REMOTE}>Remote</Radio>
                      <Radio value={LocationType.HYBRID}>Hybrid</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
              </Form>
            ) : isJobLoading ? (
              <JobDetailHeaderCardSkeleton />
            ) : (
              <>
                <div
                  className="absolute top-5 right-5 flex items-center gap-2"
                  id="job-detail-view-actions"
                  data-cy="job-detail-view-actions"
                >
                  <span
                    id="job-detail-status-badge"
                    className={`inline-flex items-center rounded-[4px] border border-solid px-3 py-1 text-[12px] font-normal ${
                      displayStatus === 'Closed'
                        ? 'border-gray-200 bg-gray-100 text-gray-600'
                        : 'border-[#B7EB8F] bg-[#F6FFED] text-[#52C41A]'
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
                      className="flex aspect-square shrink-0 items-center justify-center self-stretch rounded-[4px] border border-solid border-[#D9D9D9] bg-white px-1.5 hover:bg-gray-50"
                      data-cy="talent-acquisition-job-detail-edit-card"
                    >
                      <EditPencilIcon />
                    </button>
                  )}
                </div>
                <h2
                  id="job-detail-job-title"
                  className="mb-4 pr-24 text-[20px] font-bold leading-none text-black"
                  data-cy="talent-acquisition-job-detail-job-title"
                >
                  {jobById?.jobTitle ?? '—'}
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:max-w-6xl sm:flex-wrap sm:justify-between sm:gap-y-4">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                      Department
                    </span>
                    <span className="mt-0.5 text-[16px] font-normal text-black">
                      {getDepartmentName(jobById?.departmentId) ?? '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                      Employment type
                    </span>
                    <span className="mt-0.5 text-[16px] font-normal text-black">
                      {jobById?.employmentType ?? '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                      Location
                    </span>
                    <span className="mt-0.5 text-[16px] font-normal text-black">
                      {jobById?.jobLocation ?? '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                      Created at
                    </span>
                    <span className="mt-0.5 text-[16px] font-normal text-black">
                      {jobById?.createdAt
                        ? dayjs(jobById.createdAt).format('DD MMMM, YYYY')
                        : '—'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              className="talent-acquisition-job-detail-tabs"
              items={[
                {
                  key: 'candidates',
                  label: (
                    <span
                      className="inline-flex items-center gap-2"
                      data-cy="talent-acquisition-job-detail-tab-candidates"
                    >
                      Candidates
                      <span className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border border-solid border-[#1E40AF] px-1.5 text-[12px] font-normal text-[#1E40AF]">
                        {candidateCount}
                      </span>
                    </span>
                  ),
                  children: (
                    <div className="pt-0">
                      <div className="mt-7 rounded-[8px] border border-solid border-[#E5E7EB] bg-white pt-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 flex-1 sm:max-w-[299px]">
                              <WhatYouNeed
                                fullWidth
                                placeholder="Search Employee"
                              />
                            </div>
                            <div className="flex shrink-0 items-center justify-end">
                              <SearchOptions jobId={id} />
                            </div>
                          </div>
                          <CandidateTable
                            data-cy="talent-acquisition-job-detail-candidate-table"
                            jobId={id}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'information',
                  label: (
                    <span data-cy="talent-acquisition-job-detail-tab-information">
                      Information
                    </span>
                  ),
                  children: (
                    <div>
                      {isJobLoading ? (
                        <JobDetailInformationTabSkeleton />
                      ) : (
                        <div className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:items-stretch">
                          {/* Left Column: Job Description */}
                          <div
                            id="job-detail-description-section"
                            className="flex flex-col bg-white p-6 lg:col-span-2 lg:pr-8"
                            data-cy="job-detail-description-section"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-[16px] font-bold text-black">
                                Job Description
                              </h3>
                              {!isEditingDescription ? (
                                <button
                                  type="button"
                                  id="job-detail-edit-description-btn"
                                  onClick={startDescriptionEdit}
                                  className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white hover:bg-gray-50 shrink-0"
                                  data-cy="talent-acquisition-job-detail-edit-description"
                                >
                                  <EditPencilIcon />
                                </button>
                              ) : (
                                <div
                                  className="flex items-center gap-2"
                                  data-cy="job-detail-description-edit-actions"
                                >
                                  <button
                                    type="button"
                                    id="job-detail-description-cancel"
                                    onClick={cancelDescriptionEdit}
                                    className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-solid border-[#FF4D4F] bg-white shrink-0"
                                    data-cy="job-detail-description-cancel"
                                  >
                                    <FaTimes
                                      style={{
                                        width: '8.17px',
                                        height: '8.17px',
                                        color: '#FF4D4F',
                                      }}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    id="job-detail-description-save"
                                    onClick={() =>
                                      saveDescriptionEdit(descriptionDraft)
                                    }
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] !border-0 !bg-[#1E40AF]"
                                    data-cy="job-detail-description-save"
                                  >
                                    <FaCheck
                                      style={{
                                        width: '8.17px',
                                        height: '8.17px',
                                        color: '#fff',
                                      }}
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                            {isEditingDescription ? (
                              <div data-cy="job-detail-description-editor">
                                <span className="mb-2 block text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                                  Description{' '}
                                  <span className="text-[#FF4D4F]">*</span>
                                </span>
                                <TextEditor
                                  value={descriptionDraft}
                                  onChange={(html) => setDescriptionDraft(html)}
                                  placeholder="Enter job description"
                                  className="!rounded-[8px] !border !border-solid !border-[#91CAFF] [&_.border-gray-200]:!border-[#E5E7EB]"
                                />
                              </div>
                            ) : (
                              <div className="text-[16px] font-normal leading-relaxed text-black [&_p]:mb-3 [&_p:last-child]:mb-0">
                                {jobById?.description ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: jobById.description,
                                    }}
                                  />
                                ) : (
                                  <p className="text-gray-400 italic">
                                    No job description available.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right Column: Closing Date + Preferences */}
                          <div className="flex min-h-0 flex-col border-t border-solid border-[#E5E7EB] px-6 py-6 lg:border-l lg:border-t-0 lg:px-0 lg:pl-8">
                            {/* Job Vacancy Closing Date + Job Preference */}
                            <div
                              id="job-detail-closing-date-section"
                              className="bg-white p-0"
                              data-cy="job-detail-closing-date-section"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[16px] font-bold text-black">
                                  Job Vacancy Closing Date
                                </h3>
                                {!isEditingInfo ? (
                                  <button
                                    type="button"
                                    id="job-detail-edit-closing-date-btn"
                                    onClick={startInfoEdit}
                                    className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white hover:bg-gray-50 shrink-0"
                                    data-cy="talent-acquisition-job-detail-edit-closing-date"
                                  >
                                    <EditPencilIcon />
                                  </button>
                                ) : (
                                  <div
                                    className="flex items-center gap-2"
                                    data-cy="job-detail-info-edit-actions"
                                  >
                                    <button
                                      type="button"
                                      id="job-detail-info-cancel"
                                      onClick={cancelInfoEdit}
                                      className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-solid border-[#FF4D4F] bg-white shrink-0"
                                      data-cy="job-detail-info-cancel"
                                    >
                                      <FaTimes
                                        style={{
                                          width: '8.17px',
                                          height: '8.17px',
                                          color: '#FF4D4F',
                                        }}
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      id="job-detail-info-save"
                                      onClick={saveInfoEdit}
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] !border-0 !bg-[#1E40AF]"
                                      data-cy="job-detail-info-save"
                                    >
                                      <FaCheck
                                        style={{
                                          width: '8.17px',
                                          height: '8.17px',
                                          color: '#fff',
                                        }}
                                      />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {isEditingInfo ? (
                                <Form
                                  form={infoForm}
                                  layout="vertical"
                                  id="job-detail-info-form"
                                  data-cy="job-detail-info-form"
                                  requiredMark={(label, { required }) => (
                                    <>
                                      {label}
                                      {required && (
                                        <span className="ml-1 text-[#FF4D4F]">
                                          *
                                        </span>
                                      )}
                                    </>
                                  )}
                                  className={`${INFO_FORM_LABEL_CLASS} [&_.ant-form-item-label_label::before]:!hidden`}
                                >
                                  <Form.Item
                                    name="jobDeadline"
                                    label="Expected Closing Date"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please select date!',
                                      },
                                    ]}
                                  >
                                    <DatePicker
                                      id="job-detail-edit-deadline"
                                      placeholder="Select date"
                                      className="w-full !h-10 [&_.ant-picker]:!h-10 [&_.ant-picker]:!min-h-10 [&_.ant-picker]:!rounded-[8px] [&_.ant-picker]:!border-[#D9D9D9] [&_.ant-picker-input>input]:!text-[16px] [&_.ant-picker-input>input]:!font-normal [&_.ant-picker-input>input]:!text-black"
                                      getPopupContainer={() => document.body}
                                      data-cy="job-detail-edit-deadline"
                                    />
                                  </Form.Item>
                                  <h3 className="mb-3 mt-4 text-[16px] font-bold text-black">
                                    Job Preference
                                  </h3>
                                  <Form.Item
                                    name="quantity"
                                    label="Quantity"
                                    rules={[{ required: true }]}
                                  >
                                    <InputNumber
                                      id="job-detail-edit-quantity"
                                      className="w-full !h-10 !min-h-10 !rounded-[8px] !border-[#D9D9D9] [&_.ant-input-number-input]:!h-10 [&_.ant-input-number-input]:!text-[16px] [&_.ant-input-number-input]:!font-normal [&_.ant-input-number-input]:!text-black"
                                      controls={false}
                                      placeholder="0"
                                      min={0}
                                      data-cy="job-detail-edit-quantity"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    name="yearOfExperience"
                                    label="Years of experience"
                                    rules={[{ required: true }]}
                                  >
                                    <InputNumber
                                      id="job-detail-edit-years"
                                      className="w-full !h-10 !min-h-10 !rounded-[8px] !border-[#D9D9D9] [&_.ant-input-number-input]:!h-10 [&_.ant-input-number-input]:!text-[16px] [&_.ant-input-number-input]:!font-normal [&_.ant-input-number-input]:!text-black"
                                      controls={false}
                                      placeholder="0"
                                      min={0}
                                      data-cy="job-detail-edit-years"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    name="compensation"
                                    label="Compensation"
                                    rules={[{ required: true }]}
                                  >
                                    <InputNumber
                                      id="job-detail-edit-compensation"
                                      className="w-full !h-10 !min-h-10 !rounded-[8px] !border-[#D9D9D9] [&_.ant-input-number-input]:!h-10 [&_.ant-input-number-input]:!text-[16px] [&_.ant-input-number-input]:!font-normal [&_.ant-input-number-input]:!text-black"
                                      controls={false}
                                      placeholder="0"
                                      min={0}
                                      data-cy="job-detail-edit-compensation"
                                    />
                                  </Form.Item>
                                </Form>
                              ) : (
                                <>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                                        Closed Date
                                      </span>
                                      <span className="text-right text-[16px] font-normal text-black">
                                        {jobById?.jobDeadline
                                          ? dayjs(jobById.jobDeadline).format(
                                              'DD MMMM, YYYY',
                                            )
                                          : 'Not set'}
                                      </span>
                                    </div>
                                    {daysRemaining !== null &&
                                      jobById?.jobDeadline && (
                                        <div className="rounded-lg border border-solid border-[#E5E7EB] bg-white p-4">
                                          <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                                              Days Remaining
                                            </span>
                                            <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-normal text-[#1677FF]">
                                              <IoHourglassOutline
                                                className="shrink-0"
                                                style={{
                                                  width: 12,
                                                  height: 12,
                                                }}
                                              />
                                              {daysRemaining} Days to go
                                            </span>
                                          </div>
                                          <Progress
                                            percent={progressPercent}
                                            strokeColor="#1677FF"
                                            trailColor="#F0F0F0"
                                            showInfo={false}
                                            className="mb-0"
                                          />
                                        </div>
                                      )}
                                  </div>
                                  <div className="mt-6">
                                    <h3 className="text-[16px] font-bold text-black mb-4">
                                      Job Preference
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-3">
                                      <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                                        Quantity
                                      </span>
                                      <span className="text-[16px] font-normal text-black">
                                        {jobById?.quantity ?? '—'}
                                      </span>
                                      <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                                        Years of Experience
                                      </span>
                                      <span className="text-[16px] font-normal text-black">
                                        {jobById?.yearOfExperience != null &&
                                        jobById.yearOfExperience !== ''
                                          ? typeof jobById.yearOfExperience ===
                                            'string'
                                            ? jobById.yearOfExperience
                                            : String(jobById.yearOfExperience)
                                          : '—'}
                                      </span>
                                      <span className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]">
                                        Compensation
                                      </span>
                                      <span className="text-[16px] font-normal text-black">
                                        {formatCompensationDisplay(
                                          jobById?.compensation,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'myApprovals',
                  label: (
                    <span
                      className="inline-flex items-center gap-2"
                      data-cy="talent-acquisition-job-detail-tab-my-approvals"
                    >
                      My Approvals
                    </span>
                  ),
                  children: (
                    <div className="pt-0">
                      <div className="mt-6 rounded-[8px] border border-solid border-[#E5E7EB] ">
                        <MyApprovalTable
                          data-cy="talent-acquisition-job-detail-my-approval-table"
                          jobId={id}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
              tabBarExtraContent={
                activeTabKey === 'candidates' ? (
                  <div className="flex flex-wrap items-center gap-2 pb-2 pr-0">
                    {selectedCandidate?.length > 0 && (
                      <Button
                        type="primary"
                        icon={<MoveToTalentPoolIcon />}
                        onClick={handleMoveToTalentsPool}
                        className="!inline-flex !h-10 !items-center !rounded-[6px] !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-3 sm:!px-4 !text-[14px] !font-normal hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8]"
                        data-cy="talent-acquisition-job-detail-button-move-talent-pool"
                      >
                        <span className="hidden sm:inline">
                          Move to Talent Pool
                        </span>
                      </Button>
                    )}
                    <Button
                      type="default"
                      icon={
                        <MdOutlineFileDownload
                          size={18}
                          className="text-[rgba(0,0,0,0.45)]"
                        />
                      }
                      onClick={handleDownloadExcel}
                      loading={isDownloading}
                      className="!inline-flex !h-10 !items-center !rounded-[6px] !border !border-solid !border-[#D9D9D9] !bg-white !px-3 sm:!px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
                      data-cy="talent-acquisition-job-detail-button-download-excel"
                    >
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      type="primary"
                      icon={<FaUserPlus size={14} />}
                      onClick={showDrawer}
                      className="!inline-flex !h-10 !items-center !rounded-[6px] !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-3 sm:!px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8]"
                      data-cy="talent-acquisition-job-detail-button-add-candidate"
                    >
                      <span className="hidden sm:inline">Add Candidate</span>
                    </Button>
                  </div>
                ) : (
                  activeTabKey === 'myApprovals' &&
                  selectedCandidate?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pb-2 pr-0">
                      <Button
                        type="primary"
                        icon={<DoneIcon />}
                        className="!inline-flex !h-10 !items-center !rounded-[8px] !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-3 sm:!px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8]"
                        data-cy="talent-acquisition-job-detail-button-approve-all"
                      >
                        <span className="hidden sm:inline">Approve All</span>
                      </Button>
                      <Button
                        type="text"
                        onClick={() => {
                          setSelectedCandidate([]);
                          setSelectedRowKeys([]);
                        }}
                        className="!inline-flex !h-10 !items-center !px-3 sm:!px-4 !text-[16px] !font-normal !text-[#1E40AF]"
                        data-cy="talent-acquisition-job-detail-button-clear-selection"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )
                )
              }
            />
          </div>

          <CreateCandidate jobId={id} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default Candidates;
