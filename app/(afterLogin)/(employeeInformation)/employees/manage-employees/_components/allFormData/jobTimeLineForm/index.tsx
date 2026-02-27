'use client';
import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
import {
  useGetDepartments,
  useGetDepartmentLead,
} from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { JobActionStatus } from '@/types/enumTypes';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { PlusOutlined } from '@ant-design/icons';
import { useCreatePosition } from '@/store/server/features/employees/positions/mutation';
import { useFetchAllowanceTypesByTypeAllowance } from '@/store/server/features/compensation/settings/queries';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import AllowanceTypeSideBar from '@/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/_components/allowanceTypeSidebar';
import { useParams } from 'next/navigation';
import { useGetEmployeeAllowances } from '@/store/server/features/payroll/payroll/queries';
import RolePermissionForm from '../rolePermisisonForm';
import WorkScheduleForm from '../workScheduleForm';

interface JobTimeLineFormProps {
  employeeData?: any;
  form?: any;
}

const JobTimeLineForm: React.FC<JobTimeLineFormProps> = ({
  employeeData,
  form: formProp,
}) => {
  const [form] = Form.useForm();
  const actualForm = formProp || form;
  const {
    selectedDepartmentId,
    setSwitchValue,
    setSelectedDepartmentId,
    tempAllowances,
    setTempAllowances,
    isAddEmployeeJobInfoModalVisible,
  } = useEmployeeManagementStore();
  const { data: departmentData, refetch: departmentsRefetch } =
    useGetDepartments();
  const { data: employementType, refetch: employmentTypeRefetch } =
    useGetEmployementTypes();
  const { data: branchOfficeData, refetch: branchOfficeRefetch } =
    useGetBranches();
  const { data: positions, refetch: positionRefetch } = useGetAllPositions();

  const { data: department } = useGetDepartmentLead(selectedDepartmentId);

  // const workSchedules = workSchedulesData?.items ?? [];
  // const basicGroupPermissionId =
  //   groupPermissionData?.items?.filter((item: any) => item.isBasic) ?? [];
  // const basicGroupPermissions = basicGroupPermissionId.flatMap(
  //   (item: any) => item.permissions ?? [],
  // );

  const {
    mutate: handleCreatePosition,
    isLoading,
    isSuccess,
  } = useCreatePosition();
  const { data: allowanceTypes, refetch: refetchAllowanceTypes } =
    useFetchAllowanceTypesByTypeAllowance();
  const params = useParams();
  const employeeIdFromParams = params?.id as string | undefined;
  const { data: employeeAllowances } =
    useGetEmployeeAllowances(employeeIdFromParams);
  const { setIsAllowanceOpen, isAllowanceOpen } = useCompensationSettingStore();
  const [contractType] = useState<string>('Permanent');
  const [wasAllowanceOpen, setWasAllowanceOpen] = useState<boolean>(false);

  // Populate employee allowances in form when modal opens
  useEffect(() => {
    if (isAddEmployeeJobInfoModalVisible && employeeAllowances && actualForm) {
      const allowancesArray = Array.isArray(employeeAllowances)
        ? employeeAllowances
        : employeeAllowances?.data || [];

      if (allowancesArray.length > 0) {
        // Transform allowances to match form structure
        const transformed = allowancesArray
          .map((allowance: any) => {
            const compensationItem = allowance.compensationItem || allowance;
            return {
              id:
                compensationItem.id ||
                allowance.compensationItemId ||
                allowance.id,
              name: compensationItem.name || allowance.name,
              description:
                compensationItem.description || allowance.description,
              isRate: compensationItem.isRate ?? allowance.isRate ?? false,
              defaultAmount:
                compensationItem.defaultAmount ||
                allowance.defaultAmount ||
                allowance.totalAmount ||
                allowance.amount,
              notTaxableAmount:
                compensationItem.notTaxableAmount || allowance.notTaxableAmount,
              type: compensationItem.type || allowance.type || 'ALLOWANCE',
            };
          })
          .filter((a: any) => a?.id && a?.name);

        if (transformed.length > 0) {
          const allowanceIds = transformed.map((a: any) => a.id);
          actualForm.setFieldValue('allowanceIds', allowanceIds);
          actualForm.setFieldValue('allowances', transformed);
        }
      }
    }
  }, [isAddEmployeeJobInfoModalVisible, employeeAllowances, actualForm]);

  // const handleContractTypeChange = (e: any) => {
  //   setContractType(e.target.value);
  // };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartmentId(value);
    setSwitchValue(false);
    actualForm.setFieldValue('departmentLeadOrNot', false);
  };

  // const handleTeamLeadChange = (checked: boolean) => {
  //   if (checked && department?.length > 0) {
  //     return;
  //   }
  //   setSwitchValue(checked);
  //   actualForm.setFieldValue('departmentLeadOrNot', checked);
  // };

  const handleTeamLeadConfirm = () => {
    setSwitchValue(true);
    actualForm.setFieldValue('departmentLeadOrNot', true);
  };

  const handleTeamLeadCancel = () => {
    setSwitchValue(false);
    actualForm.setFieldValue('departmentLeadOrNot', false);
  };

  // const onRoleChangeHandler = (value: string) => {
  //   const selectedRole = rolesWithPermission?.find(
  //     (role: any) => role.id === value,
  //   );
  //   setSelectedRoleOnList(selectedRole);
  //   setSelectedRoleOnOption(value);
  //   const rolePermissions =
  //     selectedRole?.permissions?.map((item: any) => item.id) || [];
  //   const newPermissions = Array.from(
  //     new Set([
  //       ...rolePermissions,
  //       ...(basicGroupPermissions?.map((perm: any) => perm.id) ?? []),
  //     ]),
  //   );
  //   setSelectedPermissions(newPermissions);
  // };

  useEffect(() => {
    if (department?.length > 0) {
      setSwitchValue(false);
      actualForm.setFieldValue('departmentLeadOrNot', false);
    }
  }, [department?.length, actualForm, setSwitchValue]);

  useEffect(() => {
    if (isSuccess) {
      positionRefetch();
    }
  }, [isSuccess, positionRefetch]);

  // Track modal state and refetch allowance types when modal closes
  useEffect(() => {
    if (wasAllowanceOpen && !isAllowanceOpen) {
      // Modal was just closed, refetch allowance types
      refetchAllowanceTypes();
    }
    setWasAllowanceOpen(isAllowanceOpen);
  }, [isAllowanceOpen, wasAllowanceOpen, refetchAllowanceTypes]);

  // Restore tempAllowances from form state on mount
  useEffect(() => {
    // Only restore if form has allowances and tempAllowances store is empty
    if (tempAllowances.length === 0) {
      const formAllowances = actualForm.getFieldValue('allowances') || [];
      const tempIds = formAllowances
        .filter((a: any) => a?.id && String(a.id).startsWith('temp-'))
        .map((a: any) => a.id);

      if (tempIds.length > 0) {
        // Restore temp allowances from form state
        const tempAllowancesFromForm = formAllowances.filter((a: any) =>
          tempIds.includes(a.id),
        );
        setTempAllowances(tempAllowancesFromForm);
      }
    }
  }, [actualForm, tempAllowances.length, setTempAllowances]);

  useEffect(() => {
    if (employeeData?.employeeJobInformation?.length > 0 && allowanceTypes) {
      const latestJobInfo =
        employeeData.employeeJobInformation[
          employeeData.employeeJobInformation.length - 1
        ];
      if (latestJobInfo?.allowanceIds) {
        const allowanceIds = Array.isArray(latestJobInfo.allowanceIds)
          ? latestJobInfo.allowanceIds
          : [latestJobInfo.allowanceIds];

        // Map IDs to full allowance objects
        const allowances = allowanceTypes
          .filter((type: any) => allowanceIds.includes(type.id))
          .map((type: any) => ({
            id: type.id,
            name: type.name,
            description: type.description,
            isRate: type.isRate,
            defaultAmount: type.defaultAmount,
            notTaxableAmount: type.notTaxableAmount,
            type: type.type,
          }));

        actualForm.setFieldValue('allowances', allowances);
        actualForm.setFieldValue('allowanceIds', allowanceIds);
      }
    }
  }, [employeeData, actualForm, allowanceTypes]);

  return (
    <div id="job-timeline-form" data-cy="job-timeline-form">
      {/* Effective Date + Basic Salary */}
      <Row
        gutter={16}
        id="job-timeline-effective-start-date-row"
        data-cy="job-timeline-effective-start-date-row"
      >
        <Col
          xs={24}
          sm={12}
          id="job-timeline-effective-start-date-col"
          data-cy="job-timeline-effective-start-date-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={'effectiveStartDate'}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="job-timeline-effective-start-date-label"
                data-cy="job-timeline-effective-start-date-label"
              >
                Effective Date
              </span>
            }
            id="joinedDate"
            data-cy="joinedDate"
            rules={[
              { required: true, message: 'Please select the effective date' },
            ]}
          >
            <DatePicker
              placeholder="Select date"
              id="job-timeline-effective-start-date-datepicker"
              data-cy="job-timeline-effective-start-date-datepicker"
              disabledDate={(current) => {
                const jobInformation = employeeData?.employeeJobInformation;
                if (!jobInformation || jobInformation.length === 0)
                  return false;

                const sortedJobs = [...jobInformation].sort((a, b) => {
                  const dateA = new Date(a.effectiveStartDate || 0).getTime();
                  const dateB = new Date(b.effectiveStartDate || 0).getTime();
                  return dateB - dateA;
                });

                const lastPositionDate = sortedJobs[0]?.effectiveStartDate;
                if (!lastPositionDate) return false;

                const lastPosition = dayjs(lastPositionDate);
                return current && current.isBefore(lastPosition, 'day');
              }}
              className="w-full"
            />
          </Form.Item>
          <div
            className="flex items-center justify-start space-x-1 -mt-4 mb-4"
            id="job-timeline-effective-start-date-info"
            data-cy="job-timeline-effective-start-date-info"
          >
            <IoInformationCircleOutline
              size={14}
              className="text-gray-500"
              id="job-timeline-effective-start-date-info-icon"
              data-cy="job-timeline-effective-start-date-info-icon"
            />
            <div
              className="text-xs text-gray-500 mt-2"
              id="job-timeline-effective-start-date-info-text"
              data-cy="job-timeline-effective-start-date-info-text"
            >
              The effective start date cannot be before the employee&apos;s last
              position start date.
            </div>
          </div>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="job-timeline-salary-col"
          data-cy="job-timeline-salary-col"
        >
          <Form.Item
            className="w-full font-semibold text-xs"
            name="basicSalary"
            id="basicSalary"
            data-cy="basicSalary"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="job-timeline-salary-label"
                data-cy="job-timeline-salary-label"
              >
                Basic Salary
              </span>
            }
            rules={[
              { required: true, message: 'Please enter basic salary' },
              { type: 'number', message: 'Basic salary must be a number' },
              {
                validator: (rule, value) => {
                  if (value === null || value === undefined || value === '') {
                    return Promise.reject('Salary is required');
                  }
                  if (isNaN(Number(value))) {
                    return Promise.reject('Salary must be a valid number');
                  }
                  const numValue = Number(value);
                  if (numValue <= 0) {
                    return Promise.reject('Salary must be greater than zero');
                  }
                  if (numValue > 100000000) {
                    return Promise.reject('Salary cannot exceed 100,000,000');
                  }
                  if (!Number.isInteger(numValue * 100)) {
                    return Promise.reject(
                      'Salary can have at most 2 decimal places',
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              className="w-full"
              placeholder="Add Basic Salary"
              min={0}
              max={100000000}
              step={1}
              precision={2}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value?.replace(/,/g, '') as any}
              onKeyPress={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              id="job-timeline-salary-input"
              data-cy="job-timeline-salary-input"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Work Schedule + Role */}
      <Row
        gutter={16}
        id="job-timeline-work-schedule-role-row"
        data-cy="job-timeline-work-schedule-role-row"
      >
        <Col
          xs={24}
          sm={12}
          id="job-timeline-work-schedule-col"
          data-cy="job-timeline-work-schedule-col"
        >
          {/* <Form.Item
            className="font-semibold text-xs"
            name="workScheduleId"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="job-timeline-work-schedule-label"
                data-cy="job-timeline-work-schedule-label"
              >
                Work Schedule
              </span>
            }
            rules={[
              { required: true, message: 'Please select work schedule' },
            ]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select Work Schedule"
              options={workSchedules?.map((schedule: any) => ({
                value: schedule?.id,
                label: schedule?.name ?? '',
              }))}
              id="job-timeline-work-schedule-select"
              data-cy="job-timeline-work-schedule-select"
            />
          </Form.Item> */}
          <WorkScheduleForm form={actualForm} />
        </Col>
        <Col
          xs={24}
          sm={12}
          id="job-timeline-role-col"
          data-cy="job-timeline-role-col"
        >
          {/* <Form.Item
            className="font-semibold text-xs"
            name="roleId"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="job-timeline-role-label"
                data-cy="job-timeline-role-label"
              >
                Role
              </span>
            }
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select Role"
              options={rolesWithPermission?.map((role: any) => ({
                value: role?.id,
                label: role?.name ?? '',
              }))}
              onChange={onRoleChangeHandler}
              id="job-timeline-role-select"
              data-cy="job-timeline-role-select"
            />
          </Form.Item> */}
          <RolePermissionForm
            form={actualForm}
            data-cy="user-sidebar-role-permission-form"
          />
        </Col>
      </Row>

      <Row
        gutter={16}
        id="job-timeline-position-row"
        data-cy="job-timeline-position-row"
      >
        <Col
          xs={24}
          sm={8}
          id="job-timeline-position-col"
          data-cy="job-timeline-position-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={'positionId'}
            id="jobTitle"
            data-cy="jobTitle"
            label={
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                id="job-timeline-position-label"
                data-cy="job-timeline-position-label"
              >
                <span
                  className="mb-1 font-semibold text-xs"
                  id="job-timeline-position-label-text"
                  data-cy="job-timeline-position-label-text"
                >
                  Position
                </span>
                <Button
                  type="text"
                  size="small"
                  onClick={() => {
                    positionRefetch();
                  }}
                />
              </div>
            }
            rules={[
              { required: true, message: 'Please select an position type' },
            ]}
          >
            <Select
              id="job-timeline-position-select"
              data-cy="job-timeline-position-select"
              showSearch
              optionFilterProp="label"
              placeholder="Select Employee Position"
              allowClear
              options={positions?.items?.map((positions: any) => ({
                value: positions?.id,
                label: `${positions?.name ? positions?.name : ''} `,
              }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{ margin: '8px 0' }}
                    data-cy="job-timeline-position-divider"
                  />
                  <Form
                    id="job-timeline-position-form"
                    data-cy="job-timeline-position-form"
                    form={form}
                    onFinish={(e) => {
                      handleCreatePosition(e);
                      form.resetFields();
                    }}
                  >
                    <Space
                      id="job-timeline-position-space"
                      data-cy="job-timeline-position-space"
                    >
                      <Form.Item
                        name="name"
                        rules={[{ required: true }]}
                        id="job-timeline-position-form-item"
                        data-cy="job-timeline-position-form-item"
                      >
                        <Input
                          placeholder="Position"
                          id="job-timeline-position-input"
                          data-cy="job-timeline-position-input"
                        />
                      </Form.Item>
                      <Form.Item
                        id="job-timeline-position-form-item-button"
                        data-cy="job-timeline-position-form-item-button"
                      >
                        <Button
                          loading={isLoading}
                          htmlType="submit"
                          type="link"
                          icon={<PlusOutlined />}
                          id="job-timeline-position-form-item-button-add"
                          data-cy="job-timeline-position-form-item-button-add"
                        >
                          Add
                        </Button>
                      </Form.Item>
                    </Space>
                  </Form>
                </>
              )}
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={8}
          id="job-timeline-employement-type-col"
          data-cy="job-timeline-employement-type-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={'employementTypeId'}
            id="employementTypeId"
            data-cy="employementTypeId"
            label={
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                id="job-timeline-employement-type-label"
                data-cy="job-timeline-employement-type-label"
              >
                <span
                  className="mb-1 font-semibold text-xs"
                  id="job-timeline-employement-type-label-text"
                  data-cy="job-timeline-employement-type-label-text"
                >
                  Employment Type
                </span>
                <Button
                  type="text"
                  size="small"
                  id="job-timeline-employement-type-reload-btn"
                  data-cy="job-timeline-employement-type-reload-btn"
                  onClick={() => {
                    employmentTypeRefetch();
                  }}
                />
              </div>
            }
            rules={[
              { required: true, message: 'Please select an employment type' },
            ]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select Employment Type"
              options={employementType?.items?.map((employementType: any) => ({
                value: employementType?.id,
                label: `${employementType?.name ? employementType?.name : ''} `,
              }))}
              id="job-timeline-employement-type-select"
              data-cy="job-timeline-employement-type-select"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={8}
          id="job-timeline-employement-type-col"
          data-cy="job-timeline-employement-type-col"
        >
          <Form.Item
            className="w-full font-semibold text-xs"
            name="jobAction"
            id="jobAction"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="job-timeline-status-label"
              >
                Status
              </span>
            }
            rules={[{ required: true, message: 'Please select Status' }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select Status"
              options={JobActionStatus?.map((status: any) => ({
                value: status?.id,
                label: `${status?.name ? status?.name : ''} `,
              }))}
              id="job-timeline-status-select"
              data-cy="job-timeline-status-select"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="job-timeline-department-row"
        data-cy="job-timeline-department-row"
        className="mb-2"
      >
        <Col
          xs={24}
          sm={12}
          id="job-timeline-department-col"
          data-cy="job-timeline-department-col"
        >
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'departmentId'}
            id="departmentId"
            data-cy="departmentId"
            label={
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                id="job-timeline-department-label"
                data-cy="job-timeline-department-label"
              >
                <span
                  className="mb-1 font-semibold text-xs"
                  id="job-timeline-department-label-text"
                  data-cy="job-timeline-department-label-text"
                >
                  Team
                </span>
                <Button
                  type="text"
                  size="small"
                  onClick={() => {
                    departmentsRefetch();
                  }}
                />
              </div>
            }
            rules={[{ required: true, message: 'Please select a Team' }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select a Team"
              onChange={handleDepartmentChange}
              options={departmentData?.map((department: any) => ({
                value: department?.id,
                label: `${department?.name ? department?.name : ''} `,
              }))}
              id="job-timeline-department-select"
              data-cy="job-timeline-department-select"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="job-timeline-member-col"
          data-cy="job-timeline-member-col"
        >
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
              {
                required: true,
                message: 'Please select if user is Team Lead or manager',
              },
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
                        <div
                          data-cy="job-timeline-member-confirm-description-text-department"
                          className="mb-2"
                        >
                          This department already has a team lead:
                        </div>
                        <div
                          data-cy="job-timeline-member-confirm-description-text-name"
                          className="font-medium text-blue-600 mb-2"
                        >
                          {department[0]?.firstName} {department[0]?.lastName}
                        </div>
                        <div data-cy="job-timeline-member-confirm-description-text">
                          Do you want to update the team lead to the current
                          employee?
                        </div>
                      </div>
                    ),
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk: () => {
                      handleTeamLeadConfirm();
                    },
                    onCancel: () => {
                      handleTeamLeadCancel();
                    },
                  });
                } else {
                  setSwitchValue(isLead);
                  actualForm.setFieldValue('departmentLeadOrNot', isLead);
                }
              }}
              id="job-timeline-member-select"
              data-cy="job-timeline-member-select"
            />
          </Form.Item>
          <div
            className="flex items-center justify-start space-x-1  mt-2"
            id="job-timeline-member-info"
            data-cy="job-timeline-member-info"
          >
            <IoInformationCircleOutline
              size={14}
              className="text-gray-500"
              id="job-timeline-member-info-icon"
              data-cy="job-timeline-member-info-icon"
            />
            <div
              className="text-xs text-gray-500"
              id="job-timeline-member-info-text"
              data-cy="job-timeline-member-info-text"
            >
              Select If the user is a team Lead or manager
            </div>
          </div>
        </Col>
      </Row>
      {/* Office + Allowance */}
      <Row
        gutter={16}
        id="job-timeline-office-allowance-row"
        data-cy="job-timeline-office-allowance-row"
      >
        <Col
          xs={24}
          sm={12}
          id="job-timeline-office-col"
          data-cy="job-timeline-office-col"
        >
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'branchId'}
            id="branchId"
            data-cy="branchId"
            label={
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                id="job-timeline-branch-label"
                data-cy="job-timeline-branch-label"
              >
                <span
                  className="mb-1 font-semibold text-xs"
                  id="job-timeline-branch-label-text"
                  data-cy="job-timeline-branch-label-text"
                >
                  Office
                </span>
                <Button
                  type="text"
                  size="small"
                  onClick={() => {
                    branchOfficeRefetch();
                  }}
                />
              </div>
            }
            rules={[{ required: true, message: 'Please select office' }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select"
              options={branchOfficeData?.items?.map((branch: any) => ({
                value: branch?.id,
                label: `${branch?.name ? branch?.name : ''} `,
              }))}
              id="job-timeline-branch-select"
              data-cy="job-timeline-branch-select"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="job-timeline-allowance-col"
          data-cy="job-timeline-allowance-col"
        >
          <Form.Item
            className="w-full font-semibold text-xs"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="job-timeline-allowance-label"
                data-cy="job-timeline-allowance-label"
              >
                Allowance
              </span>
            }
          >
            <div
              className="flex items-start gap-2"
              id="job-timeline-allowance-inline-wrapper"
              data-cy="job-timeline-allowance-inline-wrapper"
            >
              <Form.Item
                name="allowanceIds"
                className="flex-1 mb-0"
                id="job-timeline-allowance-ids-inline"
                data-cy="job-timeline-allowance-ids-inline"
              >
                <Form.Item
                  shouldUpdate
                  noStyle
                  id="job-timeline-allowance-ids-form-item-inline"
                  data-cy="job-timeline-allowance-ids-form-item-inline"
                >
                  {({ getFieldValue, setFieldValue }) => {
                    const selectedIds = getFieldValue('allowanceIds') || [];
                    const formAllowances = getFieldValue('allowances') || [];
                    const allAllowanceTypes = [
                      ...(allowanceTypes || []),
                      ...formAllowances,
                      ...tempAllowances,
                    ];
                    const uniqueAllowanceTypes = allAllowanceTypes.filter(
                      (type: any, index: number, self: any[]) =>
                        index ===
                        self.findIndex(
                          (t: any) => String(t.id) === String(type.id),
                        ),
                    );
                    const allOptions =
                      uniqueAllowanceTypes?.map((a: any) => ({
                        value: a.id,
                        label: a.name,
                      })) || [];
                    const dropdownOptions = allOptions.filter(
                      (opt: any) =>
                        !selectedIds.some(
                          (id: any) => String(id) === String(opt.value),
                        ),
                    );
                    return (
                      <Select
                        mode="multiple"
                        showSearch
                        allowClear
                        className="w-full"
                        placeholder="Select"
                        options={dropdownOptions}
                        value={selectedIds}
                        filterOption={(input, opt) =>
                          String(opt?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        maxTagCount={undefined}
                        tagRender={(props) => {
                          const { label, value, closable, onClose } = props;
                          const fullOption = allOptions.find(
                            (opt: any) => String(opt.value) === String(value),
                          );
                          return (
                            <span
                              style={{
                                marginRight: 3,
                                padding: '2px 8px',
                                background: '#f0f0f0',
                                borderRadius: 4,
                                display: 'inline-block',
                              }}
                              id="job-timeline-allowance-select-tag-inline"
                              data-cy="job-timeline-allowance-select-tag-inline"
                            >
                              {fullOption?.label || label}
                              {closable && (
                                <span
                                  onClick={onClose}
                                  style={{ marginLeft: 4, cursor: 'pointer' }}
                                  id="job-timeline-allowance-select-tag-close-inline"
                                  data-cy="job-timeline-allowance-select-tag-close-inline"
                                >
                                  ×
                                </span>
                              )}
                            </span>
                          );
                        }}
                        onChange={(newSelectedIds) => {
                          setFieldValue('allowanceIds', newSelectedIds);
                          const currentFormAllowances =
                            getFieldValue('allowances') || [];
                          const allAllowanceTypes = [
                            ...(allowanceTypes || []),
                            ...currentFormAllowances,
                            ...tempAllowances,
                          ];
                          const uniqueAllowanceTypes = allAllowanceTypes.filter(
                            (type: any, index: number, self: any[]) =>
                              index ===
                              self.findIndex(
                                (t: any) => String(t.id) === String(type.id),
                              ),
                          );
                          const allowances =
                            uniqueAllowanceTypes
                              ?.filter((type: any) =>
                                newSelectedIds.some(
                                  (id: any) => String(id) === String(type.id),
                                ),
                              )
                              .map((type: any) => ({
                                id: type.id,
                                name: type.name,
                                description: type.description,
                                isRate: type.isRate,
                                defaultAmount: type.defaultAmount,
                                notTaxableAmount: type.notTaxableAmount,
                                type: type.type,
                              })) || [];
                          setFieldValue('allowances', allowances);
                        }}
                        id="job-timeline-allowance-select-inline"
                        data-cy="job-timeline-allowance-select-inline"
                      />
                    );
                  }}
                </Form.Item>
              </Form.Item>
              <Form.Item name="allowances" hidden>
                <Input type="hidden" />
              </Form.Item>
              <Button
                type="primary"
                icon={
                  <PlusOutlined
                    id="job-timeline-allowance-add-btn-icon"
                    data-cy="job-timeline-allowance-add-btn-icon"
                  />
                }
                onClick={() => setIsAllowanceOpen(true)}
                // style={{
                //   height: '32px',
                //   alignSelf: 'flex-start',
                //   marginTop: 0,
                // }}
                id="job-timeline-allowance-add-btn"
                data-cy="job-timeline-allowance-add-btn"
                className="hover:bg-[#1D4ED8] bg-[#1e40af] text-white h-8"
              >
                Allowance
              </Button>
            </div>
          </Form.Item>
        </Col>
      </Row>

      {contractType === 'Contractual' && (
        <Row
          gutter={16}
          id="job-timeline-effective-end-date-row"
          data-cy="job-timeline-effective-end-date-row"
        >
          <Col
            xs={24}
            id="job-timeline-effective-end-date-col"
            data-cy="job-timeline-effective-end-date-col"
          >
            <Form.Item
              className="font-semibold text-xs"
              name={'effectiveEndDate'}
              id="effectiveEndDate"
              data-cy="effectiveEndDate"
              label="Effective End Date"
              rules={[
                {
                  required: true,
                  message: 'Please select the effective end date',
                },
              ]}
            >
              <DatePicker
                className="w-full"
                id="job-timeline-effective-end-date-datepicker"
                data-cy="job-timeline-effective-end-date-datepicker"
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Reuse AllowanceTypeSideBar component as centered modal */}
      <AllowanceTypeSideBar
        asModal={true}
        modalWidth={500}
        onAddToSelect={(allowanceData) => {
          // Add the temporary allowance to the store
          setTempAllowances([...tempAllowances, allowanceData]);

          // Get current selected IDs and add the new one
          const currentIds = actualForm.getFieldValue('allowanceIds') || [];
          const newIds = [...currentIds, allowanceData.id];
          actualForm.setFieldValue('allowanceIds', newIds);

          // Get current allowances and add the new one
          const currentAllowances =
            actualForm.getFieldValue('allowances') || [];
          const newAllowance = {
            id: allowanceData.id,
            name: allowanceData.name,
            description: allowanceData.description,
            isRate: allowanceData.isRate,
            defaultAmount: allowanceData.defaultAmount,
            notTaxableAmount: allowanceData.notTaxableAmount,
            type: allowanceData.type,
          };
          actualForm.setFieldValue('allowances', [
            ...currentAllowances,
            newAllowance,
          ]);
        }}
        data-cy="job-timeline-allowance-sidebar"
      />
    </div>
  );
};

export default JobTimeLineForm;
