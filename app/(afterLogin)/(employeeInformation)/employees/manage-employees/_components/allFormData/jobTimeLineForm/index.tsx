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
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { PlusOutlined } from '@ant-design/icons';
import { useCreatePosition } from '@/store/server/features/employees/positions/mutation';
import { useFetchAllowanceTypesByTypeAllowance } from '@/store/server/features/compensation/settings/queries';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import AllowanceTypeSideBar from '@/app/(afterLogin)/(compensation)/compensationSetting/allowanceType/_components/allowanceTypeSidebar';
import { useParams } from 'next/navigation';
import { useGetEmployeeAllowances } from '@/store/server/features/payroll/payroll/queries';

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
    switchValue,
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

  const {
    mutate: handleCreatePosition,
    isLoading,
    isSuccess,
  } = useCreatePosition();
  const { data: allowanceTypes, refetch: refetchAllowanceTypes } =
    useFetchAllowanceTypesByTypeAllowance();
  const params = useParams();
  const employeeIdFromParams = params?.id as string | undefined;
  const { data: employeeAllowances } = useGetEmployeeAllowances(employeeIdFromParams);
  const { setIsAllowanceOpen, isAllowanceOpen } = useCompensationSettingStore();
  const [contractType, setContractType] = useState<string>('Permanent');
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
              id: compensationItem.id || allowance.compensationItemId || allowance.id,
              name: compensationItem.name || allowance.name,
              description: compensationItem.description || allowance.description,
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

  const handleContractTypeChange = (e: any) => {
    setContractType(e.target.value);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartmentId(value);
    setSwitchValue(false);
    actualForm.setFieldValue('departmentLeadOrNot', false);
  };

  const handleTeamLeadChange = (checked: boolean) => {
    if (checked && department?.length > 0) {
      return;
    }
    setSwitchValue(checked);
    actualForm.setFieldValue('departmentLeadOrNot', checked);
  };

  const handleTeamLeadConfirm = () => {
    setSwitchValue(true);
    actualForm.setFieldValue('departmentLeadOrNot', true);
  };

  const handleTeamLeadCancel = () => {
    setSwitchValue(false);
    actualForm.setFieldValue('departmentLeadOrNot', false);
  };

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
      <div
        className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2"
        id="job-timeline-title"
        data-cy="job-timeline-title"
      >
        Job Timeline
      </div>
      <Row
        gutter={16}
        id="job-timeline-effective-start-date-row"
        data-cy="job-timeline-effective-start-date-row"
      >
        <Col
          xs={24}
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
                Effective Start Date
              </span>
            }
            id="joinedDate"
            data-cy="joinedDate"
            rules={[
              { required: true, message: 'Please select the joined date' },
            ]}
          >
            <DatePicker
              id="job-timeline-effective-start-date-datepicker"
              data-cy="job-timeline-effective-start-date-datepicker"
              disabledDate={(current) => {
                // Get the last position's effective start date
                const jobInformation = employeeData?.employeeJobInformation;

                if (!jobInformation || jobInformation.length === 0)
                  return false;

                // Sort by effectiveStartDate to get the most recent position
                const sortedJobs = [...jobInformation].sort((a, b) => {
                  const dateA = new Date(a.effectiveStartDate || 0).getTime();
                  const dateB = new Date(b.effectiveStartDate || 0).getTime();
                  return dateB - dateA; // Sort in descending order (newest first)
                });

                const lastPositionDate = sortedJobs[0]?.effectiveStartDate;
                if (!lastPositionDate) return false;

                // Disable dates before the last position's effective start date
                const lastPosition = dayjs(lastPositionDate);
                return current && current.isBefore(lastPosition, 'day');
              }}
              className="w-full"
            />
          </Form.Item>
          <div
            className="flex items-center justify-start space-x-1 mb-5 mt-0"
            id="job-timeline-effective-start-date-info"
            data-cy="job-timeline-effective-start-date-info"
          >
            <div
              id="job-timeline-effective-start-date-info-icon-wrapper"
              data-cy="job-timeline-effective-start-date-info-icon-wrapper"
            >
              <IoInformationCircleOutline
                size={14}
                id="job-timeline-effective-start-date-info-icon"
                data-cy="job-timeline-effective-start-date-info-icon"
              />
            </div>
            <div
              className="text-xs text-gray-500"
              id="job-timeline-effective-start-date-info-text"
              data-cy="job-timeline-effective-start-date-info-text"
            >
              The effective start date cannot be before the employee&apos;s last
              position start date.
            </div>
          </div>
        </Col>
      </Row>

      <Row
        gutter={16}
        id="job-timeline-position-row"
        data-cy="job-timeline-position-row"
      >
        <Col
          xs={12}
          sm={12}
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
                  icon={
                    <AiOutlineReload
                      size={14}
                      className="text-gray-600"
                      id="job-timeline-position-reload-btn"
                      data-cy="job-timeline-position-reload-btn"
                    />
                  }
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
              placeholder="Select position type"
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
          xs={12}
          sm={12}
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
                  icon={
                    <AiOutlineReload
                      size={14}
                      className="text-gray-600"
                      id="job-timeline-employement-type-reload-btn"
                      data-cy="job-timeline-employement-type-reload-btn"
                    />
                  }
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
              placeholder="Select an employment type"
              options={employementType?.items?.map((employementType: any) => ({
                value: employementType?.id,
                label: `${employementType?.name ? employementType?.name : ''} `,
              }))}
              id="job-timeline-employement-type-select"
              data-cy="job-timeline-employement-type-select"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="job-timeline-department-row"
        data-cy="job-timeline-department-row"
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
                  icon={
                    <AiOutlineReload
                      size={14}
                      className="text-gray-600"
                      id="job-timeline-department-reload-btn"
                      data-cy="job-timeline-department-reload-btn"
                    />
                  }
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
          id="job-timeline-branch-col"
          data-cy="job-timeline-branch-col"
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
                  Branch Office
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={
                    <AiOutlineReload
                      size={14}
                      className="text-gray-600"
                      id="job-timeline-branch-reload-btn"
                      data-cy="job-timeline-branch-reload-btn"
                    />
                  }
                  onClick={() => {
                    branchOfficeRefetch();
                  }}
                />
              </div>
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
              options={branchOfficeData?.items?.map((branch: any) => ({
                value: branch?.id,
                label: `${branch?.name ? branch?.name : ''} `,
              }))}
              id="job-timeline-branch-select"
              data-cy="job-timeline-branch-select"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="job-timeline-row-status-salary"
        data-cy="job-timeline-row-status-salary"
      >
        <Col
          xs={24}
          sm={12}
          id="job-timeline-status-col"
          data-cy="job-timeline-status-col"
        >
          <Form.Item
            className="w-full font-semibold text-xs"
            name="jobAction"
            id="jobAction"
            label={<span className="mb-1 font-semibold text-xs">Status</span>}
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
                /*  eslint-disable-next-line @typescript-eslint/naming-convention */
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
              placeholder="Enter basic salary"
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
      <Row
        gutter={16}
        id="job-timeline-row-allowance"
        data-cy="job-timeline-row-allowance"
      >
        <Col xs={24}>
          <div
            className="font-semibold text-xs mb-1"
            id="job-timeline-allowance-title"
            data-cy="job-timeline-allowance-title"
          >
            Allowance Type
          </div>
          <div
            className="flex items-start gap-2"
            id="job-timeline-allowance-wrapper"
            data-cy="job-timeline-allowance-wrapper"
          >
            <Form.Item
              name="allowanceIds"
              className="flex-1"
              id="job-timeline-allowance-ids"
              data-cy="job-timeline-allowance-ids"
            >
              <Form.Item
                shouldUpdate
                noStyle
                id="job-timeline-allowance-ids-form-item"
                data-cy="job-timeline-allowance-ids-form-item"
              >
                {({ getFieldValue, setFieldValue }) => {
                  const selectedIds = getFieldValue('allowanceIds') || [];
                  
                  // Get employee allowances from form (already populated)
                  const formAllowances = getFieldValue('allowances') || [];

                  // Combine fetched allowance types, employee allowances, and temporary ones
                  const allAllowanceTypes = [
                    ...(allowanceTypes || []),
                    ...formAllowances, // Include employee allowances so they can be removed
                    ...tempAllowances,
                  ];
                  
                  // Remove duplicates by id
                  const uniqueAllowanceTypes = allAllowanceTypes.filter(
                    (type: any, index: number, self: any[]) =>
                      index === self.findIndex((t: any) => String(t.id) === String(type.id))
                  );

                  const allOptions =
                    uniqueAllowanceTypes?.map((a: any) => ({
                      value: a.id,
                      label: a.name,
                    })) || [];

                  // For tagRender, we need all options (including selected ones) to display labels
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
                      placeholder="Select allowance type"
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
                            id="job-timeline-allowance-select-tag"
                            data-cy="job-timeline-allowance-select-tag"
                          >
                            {fullOption?.label || label}
                            {closable && (
                              <span
                                onClick={onClose}
                                style={{ marginLeft: 4, cursor: 'pointer' }}
                                id="job-timeline-allowance-select-tag-close"
                                data-cy="job-timeline-allowance-select-tag-close"
                              >
                                ×
                              </span>
                            )}
                          </span>
                        );
                      }}
                      onChange={(newSelectedIds) => {
                        setFieldValue('allowanceIds', newSelectedIds);

                        // Combine fetched allowance types, employee allowances, and temporary ones
                        const currentFormAllowances = getFieldValue('allowances') || [];
                        const allAllowanceTypes = [
                          ...(allowanceTypes || []),
                          ...currentFormAllowances, // Include employee allowances
                          ...tempAllowances,
                        ];
                        
                        // Remove duplicates by id
                        const uniqueAllowanceTypes = allAllowanceTypes.filter(
                          (type: any, index: number, self: any[]) =>
                            index === self.findIndex((t: any) => String(t.id) === String(type.id))
                        );

                        // Sync allowances array with selected IDs
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
                        // Note: Don't remove tempAllowances from store when deselected
                        // They should remain available in dropdown even after being removed
                        // They'll only be cleared on form cancel or successful submit
                      }}
                      id="job-timeline-allowance-select"
                      data-cy="job-timeline-allowance-select"
                    />
                  );
                }}
              </Form.Item>
            </Form.Item>
            <Form.Item
              name="allowances"
              hidden
              id="job-timeline-allowances-hidden-form-item"
              data-cy="job-timeline-allowances-hidden-form-item"
            >
              <Input
                type="hidden"
                id="job-timeline-allowances-hidden-input"
                data-cy="job-timeline-allowances-hidden-input"
              />
            </Form.Item>

            <Button
              type="primary"
              icon={
                <PlusOutlined
                  id="job-timeline-allowance-add-btn-icon"
                  data-cy="job-timeline-allowance-add-btn-icon"
                />
              }
              onClick={() => {
                setIsAllowanceOpen(true);
              }}
              style={{
                height: '32px',
                alignSelf: 'flex-start',
                marginTop: 0,
              }}
              id="job-timeline-allowance-add-btn"
              data-cy="job-timeline-allowance-add-btn"
            />
          </div>
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
      <Row
        gutter={16}
        id="job-timeline-row-team-lead"
        data-cy="job-timeline-row-team-lead"
      >
        <Col
          xs={16}
          sm={8}
          id="job-timeline-team-lead-col"
          data-cy="job-timeline-team-lead-col"
        >
          <div
            className="font-semibold text-sm"
            id="job-timeline-team-lead-label"
            data-cy="job-timeline-team-lead-label"
          >
            Team Lead
          </div>
        </Col>
        <Col
          xs={8}
          sm={16}
          id="job-timeline-team-lead-switch-col"
          data-cy="job-timeline-team-lead-switch-col"
        >
          <Form.Item
            name="departmentLeadOrNot"
            valuePropName="checked"
            id="departmentLeadOrNot"
            data-cy="departmentLeadOrNot"
          >
            {department?.length > 0 ? (
              <Popconfirm
                title={
                  <div className="text-sm sm:text-base">
                    <div className="font-semibold mb-2">
                      Team Lead Confirmation
                    </div>
                  </div>
                }
                description={
                  <div className="text-xs sm:text-sm leading-relaxed">
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
                }
                onConfirm={handleTeamLeadConfirm}
                onCancel={handleTeamLeadCancel}
                okText="Yes"
                cancelText="No"
                placement="topRight"
                overlayClassName="team-lead-confirm-popup"
                id="job-timeline-team-lead-popconfirm"
                data-cy="job-timeline-team-lead-popconfirm"
              >
                <Switch
                  checked={switchValue}
                  onChange={handleTeamLeadChange}
                  id="job-timeline-team-lead-switch"
                  data-cy="job-timeline-team-lead-switch"
                />
              </Popconfirm>
            ) : (
              <Switch
                checked={switchValue}
                onChange={handleTeamLeadChange}
                id="job-timeline-team-lead-switch"
                data-cy="job-timeline-team-lead-switch"
              />
            )}
          </Form.Item>
        </Col>
      </Row>

      <Row
        gutter={16}
        className="flex justify-center items-center"
        id="job-timeline-row-contract-type"
        data-cy="job-timeline-row-contract-type"
      >
        <Col
          xs={24}
          className="flex justify-center items-center mt-2"
          id="job-timeline-contract-type-col"
          data-cy="job-timeline-contract-type-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            // label=" "
            id="employmentContractType"
            name={'employmentContractType'}
            rules={[{ required: true, message: 'Please select a job type' }]}
            initialValue="Permanent"
            data-cy="employmentContractType"
          >
            <Radio.Group
              onChange={handleContractTypeChange}
              id="job-timeline-contract-type-group"
              data-cy="job-timeline-contract-type-group"
            >
              <Row
                id="job-timeline-contract-type-group-row"
                data-cy="job-timeline-contract-type-group-row"
              >
                <Col
                  xs={12}
                  sm={12}
                  id="job-timeline-contract-type-permanent-col"
                  data-cy="job-timeline-contract-type-permanent-col"
                >
                  <Radio
                    value="Permanent"
                    id="job-timeline-contract-type-permanent"
                    data-cy="job-timeline-contract-type-permanent"
                  >
                    Permanent
                  </Radio>
                </Col>
                <Col
                  xs={12}
                  sm={12}
                  id="job-timeline-contract-type-contractual-col"
                  data-cy="job-timeline-contract-type-contractual-col"
                >
                  <Radio
                    value="Contractual"
                    id="job-timeline-contract-type-contractual"
                    data-cy="job-timeline-contract-type-contractual"
                  >
                    Contractual
                  </Radio>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

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
