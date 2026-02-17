import dayjs from 'dayjs';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Table,
  Modal,
  Select,
  Switch,
  TimePicker,
  Dropdown,
  MenuProps,
  InputNumber,
  Input,
} from 'antd';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import WorkScheduleComponent from './workSchedule';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { CreateEmployeeJobInformation } from './addEmployeeJobInfrmation';
import { MoreOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import DownloadJobInformation from './downloadJobInformation';
import BasicSalary from './basicSalary';
import { LuPencil } from 'react-icons/lu';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import React from 'react';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useUpdateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import { useUpdateEmployeeJobInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
import { useGetDepartmentLead, useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { JobActionStatus } from '@/types/enumTypes';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useUpdateBasicSalary } from '@/store/server/features/payroll/payroll/mutation';

function Job({ id }: { id: string }) {
  const params = useParams();
  const userId = params.id as string;
  const { userId: loggedInUserId } = useAuthenticationStore();
  const { isLoading, data: employeeData, refetch } = useGetEmployee(userId);
  const { setIsAddEmployeeJobInfoModalVisible, selectedDepartmentId } = useEmployeeManagementStore();

  // API queries for form options
  const { data: departmentData } = useGetDepartments();
  const { data: employementType } = useGetEmployementTypes();
  const { data: branchOfficeData } = useGetBranches();
  const { data: positions } = useGetAllPositions();
  const { data: workSchedules } = useGetWorkSchedules();
  const { data: basicSalaryData } = useGetBasicSalaryById(userId);
  const { data: department } = useGetDepartmentLead(selectedDepartmentId);


  // Sort job information with active jobs at the top
  const sortedJobInformation = useMemo(() => {
    if (!employeeData?.employeeJobInformation) return [];

    return [...employeeData.employeeJobInformation].sort((a, b) => {
      // First sort by active status (active jobs first)
      if (a.isPositionActive && !b.isPositionActive) return -1;
      if (!a.isPositionActive && b.isPositionActive) return 1;

      // Then sort by effective start date (newest first)
      const dateA = new Date(a.effectiveStartDate || 0).getTime();
      const dateB = new Date(b.effectiveStartDate || 0).getTime();
      return dateB - dateA;
    });
  }, [employeeData?.employeeJobInformation]);

  const handleAddEmployeeJobInformation = () => {
    setIsAddEmployeeJobInfoModalVisible(true);
  };

  // Callback to refresh job information data
  const handleJobInfoUpdated = () => {
    refetch();
  };
  const { mutate: updateEmployeeInformation } = useUpdateEmployee();
  const { mutate: updateEmployeeJobInformation, isLoading: isUpdating } =
    useUpdateEmployeeJobInformation();
    const { mutate: updateBasicSalary, isLoading: updateLoading } =
    useUpdateBasicSalary();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isJobHistoryModalVisible, setIsJobHistoryModalVisible] = useState(false);
  const [selectedJobRecord, setSelectedJobRecord] = useState<any>(null);
  const [selectedWorkSchedule, setSelectedWorkSchedule] = useState<any>(null);
  const downloadJobInfoRef = React.useRef<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleEditClick = () => {
    form.setFieldsValue({
      joinedDate: dayjs(employeeData?.employeeInformation?.joinedDate),
    });
    setIsEditing((isEditing) => !isEditing);
  };

  const handleJobEditClick = (record: any) => {
    setSelectedJobRecord(record);
    setSelectedWorkSchedule(record.workSchedule);
    
    // Find the matching basic salary for this job record
    const matchingSalary = basicSalaryData?.find(
      (salary: any) => salary.jobInfoId === record.id
    );
    const currentSalary = matchingSalary?.basicSalary || null;
    
    editForm.setFieldsValue({
      effectiveStartDate: dayjs(record.effectiveStartDate),
      positionId: record.positionId,
      title: record.position?.name || '',
      employementTypeId: record.employementTypeId,
      departmentId: record.departmentId,
      branchId: record.branchId,
      workScheduleId: record.workScheduleId,
      departmentLeadOrNot: record.departmentLeadOrNot,
      basicSalary: currentSalary ? Number(currentSalary) : null,
      jobAction: record.jobAction || null,
      managerId: record.reportingToId || record.delegatedToId || null,
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedJobRecord(null);
    setSelectedWorkSchedule(null);
    editForm.resetFields();
  };

  const editJoinedDate = (values: any) => {
    updateEmployeeInformation(
      {
        id: employeeData?.employeeInformation?.id,
        values,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          handleJobInfoUpdated(); // Refresh data after successful update
        },
      },
    );
  };

  const editJobInformation = (values: any) => {
    if (!selectedJobRecord) return;

    const updatedValues = {
      effectiveStartDate: values.effectiveStartDate?.format('YYYY-MM-DD'),
      positionId: values.positionId,
      employementTypeId: values.employementTypeId,
      departmentId: values.departmentId,
      branchId: values.branchId,
      workScheduleId: values.workScheduleId,
      departmentLeadOrNot: values.departmentLeadOrNot || false,
      jobAction: values.jobAction,
      reportingToId: values.managerId,
    };

    // Find the basic salary record for this job (same as basicSalaryModal uses jobInfoId)
    const matchingSalary = Array.isArray(basicSalaryData)
      ? basicSalaryData.find(
          (salary: any) => salary.jobInfoId === selectedJobRecord.id
        )
      : null;

    const runBasicSalaryUpdate = () => {
      if (!matchingSalary || values.basicSalary == null) {
        handleEditModalClose();
        handleJobInfoUpdated();
        return;
      }
      const formattedValues = {
        id: matchingSalary.id,
        basicSalary: Number(values.basicSalary),
        userId: matchingSalary.userId,
        jobInfoId: matchingSalary.jobInfoId,
        allowanceIds: values.allowanceIds || [],
        allowances: values.allowances || [],
      };
      updateBasicSalary(
        {
          values: formattedValues,
          changeMakerUserId: loggedInUserId,
        },
        {
          onSuccess: () => {
            handleEditModalClose();
            handleJobInfoUpdated();
          },
        }
      );
    };

    updateEmployeeJobInformation(
      {
        id: selectedJobRecord.id,
        values: updatedValues,
        changeMakerUserId: loggedInUserId,
      },
      {
        onSuccess: () => {
          runBasicSalaryUpdate();
        },
      },
    );
  };

  const handleWorkScheduleChange = (value: string) => {
    const selectedValue = workSchedules?.items?.find(
      (schedule) => schedule.id === value,
    );
    setSelectedWorkSchedule(selectedValue || null);
  };

  // Function to disable dates before creation date
  const disabledDate = (current: dayjs.Dayjs) => {
    // Use the main employee record's createdAt, not nested objects
    const createdAt = employeeData?.createdAt;
    if (!createdAt) return false;

    // Disable dates before the creation date (exact day, month, year)
    const creationDate = dayjs(createdAt);
    return current && current.isBefore(creationDate, 'day');
  };

  const handleViewJobHistory = () => {
    setIsJobHistoryModalVisible(true);
  };

  const handleEditJobInformation = () => {
    const activeJob = sortedJobInformation.find((job: any) => job.isPositionActive);
    if (activeJob) {
      handleJobEditClick(activeJob);
    }
  };

  const handleDownloadJobInformation = () => {
    // Trigger download by clicking the download button
    const downloadBtn = document.querySelector('[data-cy="job-download-btn"]') as HTMLElement;
    if (downloadBtn) {
      downloadBtn.click();
    }
  };


  const columns = [
    {
      title: 'Date',
      dataIndex: 'effectiveStartDate',
      key: 'effectiveStartDate',
      render: (text: string) => (text ? text.slice(0, 10) : '-'),
      width: 100,
    },
    {
      title: 'Job Title',
      dataIndex: 'position',
      key: 'position',
      render: (ruleData: any, record: any) => (
        <>{record?.position?.name ?? '-'}</>
      ),
    },
    {
      title: 'Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      render: (basicSalary: string, record: any) => {
        // Find the matching basic salary record by jobInfoId
        const matchingSalary = basicSalaryData?.find(
          (salary: any) => salary.jobInfoId === record.id
        );
        const salaryValue = matchingSalary?.basicSalary;
        return (
          <>{salaryValue ? Number(salaryValue).toLocaleString() : '-'}</>
        );
      },
    },
    
   
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (ruleData: any, record: any) => (
        <>{record?.department?.name ?? '-'}</>
      ),
    },
    
    {
      title: 'Job Status',
      dataIndex: 'jobAction',
      key: 'jobAction',
      render: (text: string) => (text ? text : '-'),
    },
   
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: 'add',
      label: 'Add Job Information',
      icon: <AddIcon fontSize="small" />,
      onClick: handleAddEmployeeJobInformation,
    },
    {
      key: 'view',
      label: 'View Job History',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: handleViewJobHistory,
    },
    {
      key: 'edit',
      label: 'Edit Job Information',
      icon: <EditIcon fontSize="small" />,
      onClick: handleEditJobInformation,
    },
    {
      type: 'divider',
    },
    {
      key: 'download',
      label: 'Download Job Information',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadJobInformation,
    },
  ];

  return (
    <>
    <Row gutter={16}>
      <Col lg={12} sm={24} xs={24}>
      <Card
        loading={isLoading}
        title={<span className="text-base font-bold text-gray-900">Employment Information</span>}
        extra={
          <button
            type="button"
            onClick={handleEditClick}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
            id="job-employment-edit-btn"
            data-cy="job-employment-edit-btn"
          >
            <LuPencil className="text-gray-700" />
          </button>
        }
        className="employment-information-card rounded-lg border border-gray-200 my-6 mt-0"
        id="job-employment-card"
        data-cy="job-employment-card"
        headStyle={{ borderBottom: 'none' }}
      >
        {isEditing ? (
          <Form
            onFinish={editJoinedDate}
            form={form}
            layout="inline"
            id="job-joined-date-form"
            data-cy="job-joined-date-form"
          >
            <Form.Item
              name="joinedDate"
              id="job-joined-date-form-item"
              data-cy="job-joined-date-form-item"
              rules={[
                { required: true, message: 'Please select a date!' },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                id="job-joined-date-datepicker"
                data-cy="job-joined-date-datepicker"
              />
            </Form.Item>
            <Form.Item
              id="job-joined-date-submit-form-item"
              data-cy="job-joined-date-submit-form-item"
            >
              <Button
                type="primary"
                htmlType="submit"
                id="job-joined-date-submit-btn"
                data-cy="job-joined-date-submit-btn"
              >
                Save
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Row
            gutter={[24, 0]}
            id="job-employment-row"
            data-cy="job-employment-row"
          >
            <Col lg={12} id="job-employment-col-left" data-cy="job-employment-col-left" className="flex flex-col">
              <div className="mb-5" id="job-employment-service-year" data-cy="job-employment-service-year">
                <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Service Year</p>
                <p className="text-base font-semibold text-gray-500 m-0">
                  {employeeData?.employeeInformation?.joinedDate ? (() => {
                    const months = dayjs().diff(
                      dayjs(employeeData?.employeeInformation?.joinedDate),
                      'months',
                    );
                    const years = Math.floor(months / 12);
                    const remainingMonths = months % 12;
                    const parts = [];
                    if (years > 0) {
                      parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
                    }
                    if (remainingMonths > 0) {
                      parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'Month' : 'Months'}`);
                    }
                    return parts.length > 0 ? parts.join(', ') : '-';
                  })() : '-'}
                </p>
              </div>
            </Col>
            <Col lg={12} id="job-employment-col-right" data-cy="job-employment-col-right" className="flex flex-col">
              <div className="mb-5" id="job-employment-joined-date" data-cy="job-employment-joined-date">
                <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">Joined Date</p>
                <p className="text-base font-semibold text-gray-500 m-0">
                  {dayjs(employeeData?.employeeInformation?.joinedDate)?.format(
                    'DD MMMM, YYYY',
                  ) || '-'}
                </p>
              </div>
            </Col>
          </Row>
        )}
      </Card>
      <WorkScheduleComponent data-cy="job-work-schedule" />
      </Col>
      <Col lg={12} sm={24} xs={24}>

      <Card
        loading={isLoading}
        className="job-information-card rounded-lg border border-gray-200 my-6 mt-0"
        title={
          isEditModalVisible ? (
            <div className="flex items-center justify-between w-full pr-0">
              <span className="text-base font-bold text-gray-900">Job Information</span>
              <div className="flex gap-2">
                <Button
                  type="text"
                  icon={<CloseIcon className="text-red-500" />}
                  onClick={handleEditModalClose}
                  className="border border-red-500 bg-white rounded-lg p-2 h-8 w-8 flex items-center justify-center hover:bg-red-50"
                  id="job-edit-inline-close-btn"
                  data-cy="job-edit-inline-close-btn"
                />
                <Button
                  type="text"
                  icon={<CheckIcon className="text-white" />}
                  onClick={() => editForm.submit()}
                  className=" bg-[#1d4ed8] rounded-lg p-2 h-8 w-8 flex items-center justify-center hover:bg-blue-50"
                  loading={isUpdating || updateLoading}
                  id="job-edit-inline-save-btn"
                  data-cy="job-edit-inline-save-btn"
                />
              </div>
            </div>
          ) : (
            <span className="text-base font-bold text-gray-900">Job Information</span>
          )
        }
        extra={
          !isEditModalVisible ? (
            <div
              className="flex justify-center items-center gap-3"
              id="job-information-extra"
              data-cy="job-information-extra"
            >
              <AccessGuard
                permissions={[Permissions.UpdateEmployeeJobInformation]}
                id="job-information-add-guard"
                data-cy="job-information-add-guard"
              >
                <div id="job-information-dropdown" data-cy="job-information-dropdown">
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                      id="job-information-menu-btn"
                      data-cy="job-information-menu-btn"
                    >
                      <MoreOutlined className="text-black" />
                    </button>
                  </Dropdown>
                </div>
              </AccessGuard>
            </div>
          ) : null
        }
        id="job-information-card"
        data-cy="job-information-card"
        headStyle={{ borderBottom: 'none' }}
      >
        {isEditModalVisible && selectedJobRecord ? (
          <Form
            form={editForm}
            onFinish={editJobInformation}
            layout="vertical"
            id="job-edit-form"
            data-cy="job-edit-form"
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="title"
                  id="job-edit-title-form-item"
                  data-cy="job-edit-title-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Title *</span>}
                  rules={[{ required: true, message: 'Please enter title' }]}
                >
                  <Input placeholder="Enter title" id="job-edit-title-input" data-cy="job-edit-title-input" readOnly />
                </Form.Item>
                <Form.Item
                  className="font-semibold text-xs"
                  name="basicSalary"
                  id="job-edit-salary-form-item"
                  data-cy="job-edit-salary-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Salary *</span>}
                  rules={[
                    { required: true, message: 'Please enter salary' },
                    { type: 'number', min: 0, message: 'Salary must be a positive number' },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    placeholder="Enter salary"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                    id="job-edit-salary-input"
                    data-cy="job-edit-salary-input"
                  />
                </Form.Item>
                <Form.Item
                  className="font-semibold text-xs"
                  name="employementTypeId"
                  id="job-edit-type-form-item"
                  data-cy="job-edit-type-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Type *</span>}
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select"
                    id="job-edit-type-select"
                    data-cy="job-edit-type-select"
                    options={employementType?.items?.map((type: any) => ({ value: type?.id, label: type?.name || '' }))}
                  />
                </Form.Item>
                <Form.Item
                  className="font-semibold text-xs"
                  name="jobAction"
                  id="job-edit-status-form-item"
                  data-cy="job-edit-status-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Status *</span>}
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select"
                    id="job-edit-status-select"
                    data-cy="job-edit-status-select"
                    options={JobActionStatus?.map((status: any) => ({ value: status?.id, label: status?.name || '' }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="effectiveStartDate"
                  id="job-edit-joined-date-form-item"
                  data-cy="job-edit-joined-date-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Joined Date *</span>}
                  rules={[{ required: true, message: 'Please select joined date' }]}
                >
                  <DatePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    disabledDate={disabledDate}
                    id="job-edit-joined-date-datepicker"
                    data-cy="job-edit-joined-date-datepicker"
                  />
                </Form.Item>
                <Form.Item
                  className="font-semibold text-xs"
                  name="positionId"
                  id="job-edit-position-form-item"
                  data-cy="job-edit-position-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Position *</span>}
                  rules={[{ required: true, message: 'Please select position' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select"
                    allowClear
                    id="job-edit-position-select"
                    data-cy="job-edit-position-select"
                    onChange={(value) => {
                      const selectedPosition = positions?.items?.find((pos: any) => pos.id === value);
                      if (selectedPosition) editForm.setFieldValue('title', selectedPosition.name);
                    }}
                    options={positions?.items?.map((position: any) => ({ value: position?.id, label: position?.name || '' }))}
                  />
                </Form.Item>
                <Form.Item
                  className="w-full font-semibold text-xs"
                  name="departmentLeadOrNot"
                  id="job-edit-member-form-item"
                  data-cy="job-edit-member-form-item"
                  initialValue={false}
                  label={<span className="mb-1 font-semibold text-xs">Member</span>}
                  rules={[{ required: true, message: 'Please select if user is Team Lead or manager' }]}
                >
                  <Select
                    allowClear
                    placeholder="Select"
                    options={[
                      { value: false, label: 'Member' },
                      { value: true, label: 'Team Lead' },
                    ]}
                    onChange={(value) => {
                      const isLead = value === true;
                      if (isLead && department?.length > 0) {
                        Modal.confirm({
                          title: <div className="font-semibold" data-cy="job-timeline-member-confirm-title">Team Lead Confirmation</div>,
                          content: (
                            <div className="text-xs sm:text-sm leading-relaxed" data-cy="job-timeline-member-confirm-description">
                              <div className="mb-2">This department already has a team lead:</div>
                              <div className="font-medium text-blue-600 mb-2">{department[0]?.firstName} {department[0]?.lastName}</div>
                              <div>Do you want to update the team lead to the current employee?</div>
                            </div>
                          ),
                          okText: 'Yes',
                          cancelText: 'No',
                        });
                      }
                    }}
                    id="job-edit-member-select"
                    data-cy="job-edit-member-select"
                  />
                </Form.Item>
                <Form.Item
                  className="font-semibold text-xs"
                  name="departmentId"
                  id="job-edit-department-form-item"
                  data-cy="job-edit-department-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Department *</span>}
                  rules={[{ required: true, message: 'Please select department' }]}
                >
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select"
                    id="job-edit-department-select"
                    data-cy="job-edit-department-select"
                    options={departmentData?.map((department: any) => ({ value: department?.id, label: department?.name || '' }))}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} id="job-edit-branch-row" data-cy="job-edit-branch-row">
              <Col xs={12} sm={12} id="job-edit-branch-col" data-cy="job-edit-branch-col">
                <Form.Item
                  className="w-full font-semibold text-xs"
                  name="branchId"
                  id="job-edit-branch-form-item"
                  data-cy="job-edit-branch-form-item"
                  label={<span className="mb-1 font-semibold text-xs">Branch Office *</span>}
                  rules={[{ required: true, message: 'Please select a branch office' }]}
                >
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select a branch office"
                    id="job-edit-branch-select"
                    data-cy="job-edit-branch-select"
                    options={branchOfficeData?.items?.map((branch: any) => ({ value: branch?.id, label: branch?.name || '' }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        ) : (
        (() => {
          const activeJob = sortedJobInformation.find((job: any) => job.isPositionActive);
          if (!activeJob) {
            return (
              <div className="text-center text-gray-500 py-8">
                No active job information available
              </div>
            );
          }

          // Find the matching basic salary for the active job
          const matchingSalary = basicSalaryData?.find(
            (salary: any) => salary.jobInfoId === activeJob.id
          );
          const currentSalary = matchingSalary?.basicSalary || null;
          const manager = employeeData?.reportingTo || employeeData?.delegatedTo;
          const managerName = manager
            ? `${manager.firstName || ''} ${manager.middleName || ''} ${manager.lastName || ''}`.trim()
            : '-';

          const FieldBlock = ({ label, value, dataCy }: { label: string; value: string; dataCy: string }) => (
            <div className="mb-5" id={dataCy} data-cy={dataCy}>
              <p className="text-xs text-gray-500 font-medium m-0 mb-0.5">{label}</p>
              <p className="text-base font-semibold text-gray-500 m-0">{value}</p>
            </div>
          );

          return (
            <Row gutter={[24, 0]} id="job-information-display-row" data-cy="job-information-display-row">
              <Col
                lg={12}
                xs={12}
                sm={12}
                id="job-information-display-col-left"
                data-cy="job-information-display-col-left"
                className="flex flex-col"
              >
                <FieldBlock
                  label="Title"
                  value={activeJob?.position?.name || '-'}
                  dataCy="job-information-title"
                />
                <FieldBlock
                  label="Salary"
                  value={currentSalary ? Number(currentSalary).toLocaleString() : '-'}
                  dataCy="job-information-salary"
                />
                <FieldBlock
                  label="Type"
                  value={activeJob?.employementType?.name || '-'}
                  dataCy="job-information-type"
                />
                <FieldBlock
                  label="Status"
                  value={activeJob?.jobAction || '-'}
                  dataCy="job-information-status"
                />
                <FieldBlock
                  label="Office"
                  value={activeJob?.branch?.name || '-'}
                  dataCy="job-information-office"
                />
              </Col>
              <Col
                lg={12}
                xs={12}
                sm={12}
                id="job-information-display-col-right"
                data-cy="job-information-display-col-right"
                className="flex flex-col"
              >
                <FieldBlock
                  label="Effective Date"
                  value={activeJob?.effectiveStartDate
                    ? dayjs(activeJob.effectiveStartDate).format('DD MMM YYYY')
                    : '-'}
                  dataCy="job-information-effective-date"
                />
                <FieldBlock
                  label="Position"
                  value={activeJob?.position?.name || '-'}
                  dataCy="job-information-position"
                />
                <FieldBlock
                  label="Manager"
                  value={managerName}
                  dataCy="job-information-manager"
                />
                <FieldBlock
                  label="Department"
                  value={activeJob?.department?.name || '-'}
                  dataCy="job-information-department"
                />
              </Col>
            </Row>
          );
        })() )}
      </Card>
      {/* <BasicSalary id={userId} data-cy="job-basic-salary" /> */}
      </Col>
      </Row>

      <CreateEmployeeJobInformation
        id={userId}
        onJobInfoUpdated={handleJobInfoUpdated}
        data-cy="job-create-job-info"
      />
      <DownloadJobInformation
                id={id}
                data-cy="job-information-download"
              />

      {/* Edit Job Information Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <span className="text-lg font-semibold">Job Information</span>
            <div className="flex gap-2">
              <Button
                type="text"
                icon={<CloseIcon className="text-red-500" />}
                onClick={handleEditModalClose}
                className="border border-red-500 bg-white rounded-lg p-2 h-8 w-8 flex items-center justify-center hover:bg-red-50"
                id="job-edit-modal-close-btn"
                data-cy="job-edit-modal-close-btn"
              />
              <Button
                type="text"
                icon={<CheckIcon className="text-blue-500" />}
                onClick={() => editForm.submit()}
                className="border border-blue-500 bg-white rounded-lg p-2 h-8 w-8 flex items-center justify-center hover:bg-blue-50"
                loading={isUpdating || updateLoading}
                id="job-edit-modal-save-btn"
                data-cy="job-edit-modal-save-btn"
              />
            </div>
          </div>
        }
        centered
        open={false}
        onCancel={handleEditModalClose}
        footer={false}
        destroyOnClose
        width={800}
        data-cy="job-edit-modal"
      >
        <Form
          form={editForm}
          onFinish={editJobInformation}
          layout="vertical"
          id="job-edit-form"
          data-cy="job-edit-form"
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} sm={12}>
              {/* Title */}
              <Form.Item
                className="font-semibold text-xs"
                name="title"
                id="job-edit-title-form-item"
                data-cy="job-edit-title-form-item"
                label={
                  <span className="mb-1 font-semibold text-xs">
                    Title
                  </span>
                }
                rules={[
                  { required: true, message: 'Please enter title' },
                ]}
              >
                <Input
                  placeholder="Enter title"
                  id="job-edit-title-input"
                  data-cy="job-edit-title-input"
                  readOnly
                />
              </Form.Item>

              {/* Salary */}
              <Form.Item
                className="font-semibold text-xs"
                name="basicSalary"
                id="job-edit-salary-form-item"
                data-cy="job-edit-salary-form-item"
                label={
                  <span className="mb-1 font-semibold text-xs">
                    Salary
                  </span>
                }
                rules={[
                  { required: true, message: 'Please enter salary' },
                  { type: 'number', min: 0, message: 'Salary must be a positive number' },
                ]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="Enter salary"
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value?.replace(/,/g, '') as any}
                  id="job-edit-salary-input"
                  data-cy="job-edit-salary-input"
                />
              </Form.Item>

              {/* Type */}
              <Form.Item
                className="font-semibold text-xs"
                name="employementTypeId"
                id="job-edit-type-form-item"
                data-cy="job-edit-type-form-item"
                label={
                  <span className="mb-1 font-semibold text-xs">
                    Type *
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select type' },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select"
                  id="job-edit-type-select"
                  data-cy="job-edit-type-select"
                  options={employementType?.items?.map((type: any) => ({
                    value: type?.id,
                    label: type?.name || '',
                  }))}
                />
              </Form.Item>

              {/* Status */}
              <Form.Item
                className="font-semibold text-xs"
                name="jobAction"
                id="job-edit-status-form-item"
                data-cy="job-edit-status-form-item"
                label={
                  <span className="mb-1 font-semibold text-xs">
                    Status *
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select status' },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select"
                  id="job-edit-status-select"
                  data-cy="job-edit-status-select"
                  options={JobActionStatus?.map((status: any) => ({
                    value: status?.id,
                    label: status?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>

            {/* Right Column */}
            <Col xs={24} sm={12}>
              {/* Joined Date */}
              <Form.Item
                className="font-semibold text-xs"
                name="effectiveStartDate"
                id="job-edit-joined-date-form-item"
                data-cy="job-edit-joined-date-form-item"
                label={
                  <span className="mb-1 font-semibold text-xs">
                    Joined Date
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select joined date' },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  disabledDate={disabledDate}
                  id="job-edit-joined-date-datepicker"
                  data-cy="job-edit-joined-date-datepicker"
                />
              </Form.Item>

              {/* Position */}
              <Form.Item
                className="font-semibold text-xs"
                name="positionId"
                id="job-edit-position-form-item"
                data-cy="job-edit-position-form-item"
                label={
                  <span className="mb-1 font-semibold text-xs">
                    Position
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select position' },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select"
                  allowClear
                  id="job-edit-position-select"
                  data-cy="job-edit-position-select"
                  onChange={(value) => {
                    const selectedPosition = positions?.items?.find(
                      (pos: any) => pos.id === value
                    );
                    if (selectedPosition) {
                      editForm.setFieldValue('title', selectedPosition.name);
                    }
                  }}
                  options={positions?.items?.map((position: any) => ({
                    value: position?.id,
                    label: position?.name || '',
                  }))}
                />
              </Form.Item>

              {/* Manager */}
              <Form.Item
            className="w-full font-semibold text-xs"
            name="departmentLeadOrNot"
            id="memberType"
            data-cy="memberType"
            initialValue={false}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="job-timeline-member-label"
                data-cy="job-timeline-member-label"
              >
                Member
              </span>
            }
            rules={[
              { required: true, message: 'Please select if user is Team Lead or manager' },
            ]}
          >
            <Select
              allowClear
              placeholder="Select"
              options={[
                { value: false, label: 'Member' },
                { value: true, label: 'Team Lead' },
              ]}
              onChange={(value) => {
                const isLead = value === true;
                if (isLead && department?.length > 0) {
                  Modal.confirm({
                    title: (
                      <div
                        className="font-semibold"
                        data-cy="job-timeline-member-confirm-title"
                      >
                        Team Lead Confirmation
                      </div>
                    ),
                    content: (
                      <div
                        className="text-xs sm:text-sm leading-relaxed"
                        data-cy="job-timeline-member-confirm-description"
                      >
                        <div className="mb-2">
                          This department already has a team lead:
                        </div>
                        <div className="font-medium text-blue-600 mb-2">
                          {department[0]?.firstName} {department[0]?.lastName}
                        </div>
                        <div>
                          Do you want to update the team lead to the current
                          employee?
                        </div>
                      </div>
                    ),
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk: () => {
                      // handleTeamLeadConfirm();
                    },
                    onCancel: () => {
                      // handleTeamLeadCancel();
                    },
                  });
                } else {
                  // setSwitchValue(isLead);
                  // actualForm.setFieldValue('departmentLeadOrNot', isLead);
                }
              }}
              id="job-timeline-member-select"
              data-cy="job-timeline-member-select"
            />
          </Form.Item>

              {/* Department */}
              <Form.Item
                className="font-semibold text-xs"
                name="departmentId"
                id="job-edit-department-form-item"
                data-cy="job-edit-department-form-item"
                label={
                  <span className="mb-1 font-semibold text-xs">
                    Department
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select department' },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select"
                  id="job-edit-department-select"
                  data-cy="job-edit-department-select"
                  options={departmentData?.map((department: any) => ({
                    value: department?.id,
                    label: department?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Branch Office */}
          <Row
            gutter={16}
            id="job-edit-branch-row"
            data-cy="job-edit-branch-row"
          >
            <Col xs={12} sm={12} id="job-edit-branch-col" data-cy="job-edit-branch-col">
              <Form.Item
                className="w-full font-semibold text-xs"
                name={'branchId'}
                id="job-edit-branch-form-item"
                data-cy="job-edit-branch-form-item"
                label={
                  <span
                    className="mb-1 font-semibold text-xs"
                    data-cy="job-edit-branch-label"
                  >
                    Branch Office
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a branch office' },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select a branch office"
                  id="job-edit-branch-select"
                  data-cy="job-edit-branch-select"
                  options={branchOfficeData?.items?.map((branch: any) => ({
                    value: branch?.id,
                    label: branch?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
            
          </Row>
        </Form>
      </Modal>

      {/* Job History Modal */}
      <div id="job-history-modal" data-cy="job-history-modal">
        <Modal
          title="Job History"
          open={isJobHistoryModalVisible}
          onCancel={() => setIsJobHistoryModalVisible(false)}
          footer={null}
          width={700}
        >
        <Table
          dataSource={sortedJobInformation}
          columns={columns}
          className="w-full overflow-auto"
          pagination={{ hideOnSinglePage: true }}
          rowKey="id"
          id="job-history-table"
          data-cy="job-history-table"
        />
        </Modal>
      </div>
    </>
  );
}

export default Job;
