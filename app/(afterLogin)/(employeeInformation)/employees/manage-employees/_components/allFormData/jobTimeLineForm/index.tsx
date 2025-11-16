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
  const { setIsAllowanceOpen, isAllowanceOpen } = useCompensationSettingStore();
  const [contractType, setContractType] = useState<string>('Permanent');
  const [wasAllowanceOpen, setWasAllowanceOpen] = useState<boolean>(false);

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
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Job Timeline
      </div>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            className="font-semibold text-xs"
            name={'effectiveStartDate'}
            label={
              <span className="mb-1 font-semibold text-xs">
                Effective Start Date
              </span>
            }
            id="joinedDate"
            rules={[
              { required: true, message: 'Please select the joined date' },
            ]}
          >
            <DatePicker
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
          <div className="flex items-center justify-start space-x-1 mb-5 mt-0">
            <div>
              <IoInformationCircleOutline size={14} />
            </div>
            <div className="text-xs text-gray-500">
              The effective start date cannot be before the employee&apos;s last
              position start date.
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={12} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'positionId'}
            id="jobTitle"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="mb-1 font-semibold text-xs">Position</span>
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
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
                  <Divider style={{ margin: '8px 0' }} />
                  <Form
                    form={form}
                    onFinish={(e) => {
                      handleCreatePosition(e);
                      form.resetFields();
                    }}
                  >
                    <Space>
                      <Form.Item name="name" rules={[{ required: true }]}>
                        <Input placeholder="Position" />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          loading={isLoading}
                          htmlType="submit"
                          type="link"
                          icon={<PlusOutlined />}
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
        <Col xs={12} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'employementTypeId'}
            id="employementTypeId"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="mb-1 font-semibold text-xs">
                  Employment Type
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
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
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'departmentId'}
            id="departmentId"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="mb-1 font-semibold text-xs">Team</span>
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
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
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'branchId'}
            id="branchId"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="mb-1 font-semibold text-xs">
                  Branch Office
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
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
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
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
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name="basicSalary"
            id="basicSalary"
            label={
              <span className="mb-1 font-semibold text-xs">Basic Salary</span>
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
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24}>
          <div className="font-semibold text-xs mb-1">Allowance Type</div>
          <div className="flex items-start gap-2">
            <Form.Item
              name="allowanceIds"
              rules={[
                { required: true, message: 'Please select allowance type' },
              ]}
              className="flex-1"
            >
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue, setFieldValue }) => {
                  const selectedIds = getFieldValue('allowanceIds') || [];

                  // Combine fetched allowance types with temporary ones
                  const allAllowanceTypes = [
                    ...(allowanceTypes || []),
                    ...tempAllowances,
                  ];

                  const allOptions =
                    allAllowanceTypes?.map((a: any) => ({
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
                          >
                            {fullOption?.label || label}
                            {closable && (
                              <span
                                onClick={onClose}
                                style={{ marginLeft: 4, cursor: 'pointer' }}
                              >
                                ×
                              </span>
                            )}
                          </span>
                        );
                      }}
                      onChange={(newSelectedIds) => {
                        setFieldValue('allowanceIds', newSelectedIds);

                        // Combine fetched allowance types with temporary ones
                        const allAllowanceTypes = [
                          ...(allowanceTypes || []),
                          ...tempAllowances,
                        ];

                        // Sync allowances array with selected IDs
                        const allowances =
                          allAllowanceTypes
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
              icon={<PlusOutlined />}
              onClick={() => {
                setIsAllowanceOpen(true);
              }}
              style={{
                height: '32px',
                alignSelf: 'flex-start',
                marginTop: 0,
              }}
            />
          </div>
        </Col>
      </Row>

      {contractType === 'Contractual' && (
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              className="font-semibold text-xs"
              name={'effectiveEndDate'}
              id="effectiveEndDate"
              label="Effective End Date"
              rules={[
                {
                  required: true,
                  message: 'Please select the effective end date',
                },
              ]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col xs={16} sm={8}>
          <div className="font-semibold text-sm">Team Lead</div>
        </Col>
        <Col xs={8} sm={16}>
          <Form.Item
            name="departmentLeadOrNot"
            valuePropName="checked"
            id="departmentLeadOrNot"
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
              >
                <Switch checked={switchValue} onChange={handleTeamLeadChange} />
              </Popconfirm>
            ) : (
              <Switch checked={switchValue} onChange={handleTeamLeadChange} />
            )}
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} className="flex justify-center items-center">
        <Col xs={24} className="flex justify-center items-center mt-2">
          <Form.Item
            className="font-semibold text-xs"
            // label=" "
            id="employmentContractType"
            name={'employmentContractType'}
            rules={[{ required: true, message: 'Please select a job type' }]}
            initialValue="Permanent"
          >
            <Radio.Group onChange={handleContractTypeChange}>
              <Row>
                <Col xs={12} sm={12}>
                  <Radio value="Permanent">Permanent</Radio>
                </Col>
                <Col xs={12} sm={12}>
                  <Radio value="Contractual">Contractual</Radio>
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
      />
    </div>
  );
};

export default JobTimeLineForm;
