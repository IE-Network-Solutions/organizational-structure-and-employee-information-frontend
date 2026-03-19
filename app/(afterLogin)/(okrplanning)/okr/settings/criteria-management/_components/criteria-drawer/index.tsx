import React, { useEffect } from 'react';
import { Form, Input, Select, Modal, Tooltip, Row, Col, message, Button } from 'antd';
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useFetchVpScoringById,
  useGetCriteriaTargets,
} from '@/store/server/features/okrplanning/okr/criteria/queries';
import {
  useCreateVpScoring,
  useUpdateVpScoring,
} from '@/store/server/features/okrplanning/okr/criteria/mutation';
import useCriteriaManagementStore from '@/store/uistate/features/okrplanning/okrSetting/criteriaManagmentStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';

const { Option } = Select;
export const EmployeeDetails = ({
  empId,
  fallbackProfileImage,
}: {
  empId: string;
  fallbackProfileImage?: string;
}) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading)
    return (
      <>
        <Spin
          data-cy={`okr-criteria-drawer-employee-details-loading-spin-${empId}`}
        />
      </>
    );

  if (error || !userDetails) return '-';

  const userName =
    `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
    '-';
  const profileImage = fallbackProfileImage;

  return (
    <Space
      size="small"
      id={`okr-criteria-drawer-employee-details-space-${empId}`}
      data-cy={`okr-criteria-drawer-employee-details-space-${empId}`}
    >
      <Avatar
        src={profileImage}
        className="h-5 w-5"
        data-cy={`okr-criteria-drawer-employee-details-avatar-${empId}`}
      />
      {userName}
    </Space>
  );
};

const ScoringDrawer: React.FC = () => {
  const {
    mutate: updateScoring,
    isLoading: isUpdatingLoading,
    isSuccess: isUpdateSuccess,
  } = useUpdateVpScoring();

  const {
    mutate: vpScoringMutate,
    isLoading: isCreateLoading,
    isSuccess: isCreateSuccess,
  } = useCreateVpScoring();

  const { isDrawerVisible, closeDrawer, currentId } = useDrawerStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: criteriaData } = useGetCriteriaTargets();
  const {
    weights,
    selectedCriteria,
    selectedDepartment,
    filteredUsers,
    userTypeFilter,
    setWeights,
    setSelectedCriteria,
    setSelectedDepartment,
    setFilteredUsers,
    setUserTypeFilter,
  } = useCriteriaManagementStore();
  const { userId } = useAuthenticationStore();

  const { data: scoringData } = useFetchVpScoringById(currentId || '');

  const [form] = Form.useForm();

  useEffect(() => {
    resetState();
    if (scoringData && criteriaData) {
      setFilteredUsers(
        scoringData.userVpScoring.map((item: any) => item.userId),
      );
      form.setFieldsValue({
        name: scoringData.name,
        totalPercentage: scoringData.totalPercentage,
        users: scoringData.userVpScoring.map((item: any) => item.userId),
        criteria: scoringData.vpScoringCriterions.map(
          (item: any) =>
            criteriaData.items?.find((c: any) => c.id === item.vpCriteriaId)
              ?.name,
        ),
      });

      setSelectedCriteria(
        scoringData.vpScoringCriterions.map((item: any) => {
          const criteria = criteriaData.items?.find(
            (c: any) => c.id === item.vpCriteriaId,
          );
          return {
            name: criteria?.name || '',
            vpCriteriaId: item.vpCriteriaId,
          };
        }),
      );

      setWeights(
        scoringData.vpScoringCriterions.reduce(
          (acc: any, item: any) => ({
            ...acc,
            [item.vpCriteriaId]: item.weight,
          }),
          {},
        ),
      );
    }
  }, [scoringData, criteriaData, form]);

  useEffect(() => {
    if (!departmentData) return;

    const allUsers =
      departmentData?.flatMap((dept: any) => dept.users || []) || [];

    const scoringUsers =
      currentId && scoringData
        ? scoringData.userVpScoring
          .map((item: any) =>
            allUsers.find((user: any) => user.id === item.userId),
          )
          .filter(Boolean)
        : [];

    if (watchedDepartments && watchedDepartments.length > 0) {
      const allSelectedDepartmentUsers = watchedDepartments
        .flatMap((deptId: string) => {
          const department = departmentData?.find(
            (dept: any) => dept.id === deptId,
          );

          return department?.users || [];
        })
        .filter((user: any) => {
          if (userTypeFilter === 'all') return true;
          if (userTypeFilter === 'team leads')
            return user?.employeeJobInformation?.find(
              (job: any) => job.isPositionActive,
            )?.departmentLeadOrNot;

          return !user?.employeeJobInformation?.find(
            (job: any) => job.isPositionActive,
          )?.departmentLeadOrNot;
        });
      setFilteredUsers(allSelectedDepartmentUsers);

      if (scoringData && criteriaData) {
        const existingUsers = form.getFieldValue('users') || [];
        form.setFieldsValue({
          users: [
            ...existingUsers,
            ...allSelectedDepartmentUsers.map((user: any) => user.id),
          ],
        });
      } else {
        form.setFieldsValue({
          users: allSelectedDepartmentUsers.map((user: any) => user.id),
        });
      }
    } else {
      setFilteredUsers([]);
    }
  }, [selectedDepartment, departmentData, userTypeFilter]);

  const handleDepartmentChange = (value: string[]) => {
    setSelectedDepartment(value);
  };

  const handleUserTypeFilter = (
    value: 'all' | 'team leads' | 'team members',
  ) => {
    setUserTypeFilter(value);
  };

  const handleCriteriaChange = (values: string[]) => {
    const newCriteria = values
      .filter(
        (value) =>
          !selectedCriteria.some((criteria) => criteria.name === value),
      )
      .map((criteriaName) => {
        const criteriaItem = criteriaData?.items?.find(
          (item: any) => item.name === criteriaName,
        );
        return {
          name: criteriaItem?.name || '',
          vpCriteriaId: criteriaItem?.id || '',
        };
      });

    const updatedCriteria = selectedCriteria.filter((criteria) =>
      values.includes(criteria.name),
    );

    setSelectedCriteria([...updatedCriteria, ...newCriteria]);
  };

  const onFinish = async (values: any) => {
    if (!values.users || values.users.length === 0) {
      message.error('Please select at least one user.');
      return;
    }

    const mappedUsers = values.users.map((userId: string) => {
      const existingUser = scoringData?.userVpScoring?.find(
        (item: any) => item.userId === userId,
      );
      const userMapping: Record<string, string> = { userId };
      if (existingUser?.id) userMapping.id = existingUser.id;
      return userMapping;
    });

      const mappedCriteria = selectedCriteria.map((criteria) => {
        const existingCriterion = scoringData?.vpScoringCriterions?.find(
          (item: any) => item.vpCriteriaId === criteria.vpCriteriaId,
        );

        const criteriaMapping: Record<string, string> = {
          vpCriteriaId: criteria.vpCriteriaId,
          weight:
            weights[criteria.vpCriteriaId] || existingCriterion?.weight || '0',
        };

        if (existingCriterion?.id) {
          criteriaMapping.id = existingCriterion.id;
        }
        return criteriaMapping;
      });

      const payload: Record<string, any> = {
        name: values.name,
        totalPercentage: parseFloat(values.totalPercentage),
        createUserVpScoringDto: mappedUsers,
        vpScoringCriteria: mappedCriteria,
      };

    if (currentId) {
      payload.id = currentId;
      payload.updatedBy = userId;
      updateScoring({ id: currentId, values: payload });
    } else {
      payload.createdBy = userId;
      vpScoringMutate(payload);
    }
  };

  const footer = (
    <div
      className="flex justify-end gap-3"
      data-cy="okr-criteria-modal-footer"
    >
      <Button
        type="default"
        onClick={handleModalClose}
        className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
        id="okr-criteria-modal-cancel-button"
        data-cy="okr-criteria-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => form.submit()}
        loading={isCreateLoading || isUpdatingLoading}
        className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
        id="okr-criteria-modal-submit-button"
        data-cy="okr-criteria-modal-submit-button"
      >
        {currentId ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span
          className="text-xl font-semibold"
          id="okr-criteria-drawer-header-title"
          data-cy="okr-criteria-drawer-header-title"
        >
          {currentId
            ? 'Edit Scoring Configuration'
            : 'Add Scoring Configuration'}
        </span>
      }
      width="30%"
      footer={
        <div
          className=" w-full bg-[#fff]  flex justify-center gap-5 py-3"
          id="okr-criteria-drawer-footer"
          data-cy="okr-criteria-drawer-footer"
        >
          <Button
            type="default"
            title="Cancel"
            onClick={() => {
              resetState();
              closeDrawer();
            }}
            className="h-10"
            id="okr-criteria-drawer-cancel-button"
            data-cy="okr-criteria-drawer-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={currentId ? isUpdatingLoading : isCreateLoading}
            onClick={() => form.submit()}
            className="h-10"
            id="okr-criteria-drawer-submit-button"
            data-cy="okr-criteria-drawer-submit-button"
          >
            {currentId ? 'Update' : 'Create'}
          </Button>
        </div>
      }
      className="okr-settings-modal"
      data-cy="okr-criteria-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className=""
        id="okr-criteria-modal-form"
        data-cy="okr-criteria-modal-form"
      >
        <Row gutter={[24, 16]} data-cy="okr-criteria-modal-name-row">
          <Col xs={24} sm={18} data-cy="okr-criteria-modal-name-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-criteria-modal-name-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-criteria-modal-name-label-text"
                  >
                    Name configuration
                  </span>
                  <Tooltip title="Enter a name for this scoring configuration.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-criteria-modal-name-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              name="name"
              required
              rules={[{ required: true, message: 'Please enter the name' }]}
              data-cy="okr-criteria-modal-name-field"
            >
              <Input
                placeholder="Update all UI screens"
                className="h-11"
                data-cy="okr-criteria-modal-name-input"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6} data-cy="okr-criteria-modal-percentage-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-criteria-modal-percentage-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626] truncate block"
                    title="Total Percentage"
                    data-cy="okr-criteria-modal-percentage-label-text"
                  >
                    Total Percentage
                  </span>
                  <Tooltip title="Enter the total percentage (0-100).">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-criteria-modal-percentage-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              name="totalPercentage"
              required
              rules={[{ required: true, message: 'Please enter percentage' }]}
              data-cy="okr-criteria-modal-percentage-field"
            >
              <Input
                type="number"
                placeholder="Input"
                className="h-11"
                data-cy="okr-criteria-modal-percentage-input"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-criteria-modal-department-label"
            >
              <span
                className="text-[14px] font-medium text-[#262626]"
                data-cy="okr-criteria-modal-department-label-text"
              >
                Department
              </span>
              <Tooltip title="Select departments to filter employees.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                  data-cy="okr-criteria-modal-department-tooltip"
                />
              </Tooltip>
            </div>
          }
          name="department"
          className="mb-2"
          required
          data-cy="okr-criteria-modal-department-field"
        >
          <div
            className="custom-centered-select-wrapper relative"
            data-cy="okr-criteria-modal-department-select-wrapper"
          >
            <Select
              mode="multiple"
              placeholder=""
              className="w-full h-11 custom-modal-select always-show-placeholder"
              maxTagCount={0}
              maxTagPlaceholder={() => null}
              value={watchedDepartments}
              onSelect={(val) => {
                const current = form.getFieldValue('department') || [];
                if (!current.includes(val))
                  form.setFieldsValue({ department: [...current, val] });
              }}
              onDeselect={(val) => {
                const current = form.getFieldValue('department') || [];
                form.setFieldsValue({
                  department: current.filter((v: any) => v !== val),
                });
              }}
              dropdownClassName="custom-assignee-dropdown"
              data-cy="okr-criteria-modal-department-select"
            >
              {departmentData?.map((dept: any) => (
                <Option
                  key={dept.id}
                  value={dept.id}
                  data-cy={`okr-criteria-modal-department-option-${dept.id}`}
                >
                  {dept.name}
                </Option>
              ))}
            </Select>
            {/* Always visible placeholder overlay */}
            <span
              className="absolute left-3 text-[#8c8c8c] font-normal pointer-events-none z-10"
              style={{ lineHeight: '44px' }}
              data-cy="okr-criteria-modal-department-placeholder"
            >
              Select Department
            </span>
          </div>
        </Form.Item>

        <div
          className="flex flex-wrap gap-2 mb-6"
          data-cy="okr-criteria-modal-department-tags-container"
        >
          {watchedDepartments?.map((id: string) => {
            const dept = departmentData?.find((d: any) => d.id === id);
            if (!dept) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2 bg-white border border-[#d9d9d9] px-3 py-1 rounded-[6px]"
                data-cy={`okr-criteria-modal-department-tag-${id}`}
              >
                <span
                  className="text-[14px] text-[#595959]"
                  data-cy={`okr-criteria-modal-department-tag-name-${id}`}
                >
                  {dept.name}
                </span>
                <CloseOutlined
                  className="text-[10px] text-[#8c8c8c] cursor-pointer hover:text-red-500"
                  onClick={() =>
                    form.setFieldsValue({
                      department: watchedDepartments.filter(
                        (v: any) => v !== id,
                      ),
                    })
                  }
                  data-cy={`okr-criteria-modal-department-tag-close-${id}`}
                />
              </div>
            );
          })}
        </div>

        <Row gutter={24} data-cy="okr-criteria-modal-users-row">
          <Col span={18} data-cy="okr-criteria-modal-users-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-criteria-modal-users-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-criteria-modal-users-label-text"
                  >
                    Users
                  </span>
                  <Tooltip title="Select specific users for this configuration.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-criteria-modal-users-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              name="users"
              className="mb-2"
              required
              rules={[{ required: true, message: 'Please select users' }]}
              data-cy="okr-criteria-modal-users-field"
            >
              <div
                className="custom-centered-select-wrapper relative"
                data-cy="okr-criteria-modal-users-select-wrapper"
              >
                <Select
                  mode="multiple"
                  placeholder=""
                  className="w-full h-11 custom-modal-select always-show-placeholder"
                  maxTagCount={0}
                  maxTagPlaceholder={() => null}
                  value={watchedUsers}
                  onSelect={(val) => {
                    const current = form.getFieldValue('users') || [];
                    if (!current.includes(val))
                      form.setFieldsValue({ users: [...current, val] });
                  }}
                  onDeselect={(val) => {
                    const current = form.getFieldValue('users') || [];
                    form.setFieldsValue({
                      users: current.filter((v: any) => v !== val),
                    });
                  }}
                  dropdownClassName="custom-assignee-dropdown"
                  data-cy="okr-criteria-modal-users-select"
                >
                  {filteredUsers?.map((user: any) => (
                    <Option
                      key={user.id}
                      value={user.id}
                      data-cy={`okr-criteria-modal-users-option-${user.id}`}
                    >
                      {user.firstName} {user.lastName}
                    </Option>
                  ))}
                </Select>
                {/* Always visible placeholder overlay */}
                <span
                  className="absolute left-3 text-[#8c8c8c] font-normal pointer-events-none z-10"
                  style={{ lineHeight: '44px' }}
                  data-cy="okr-criteria-modal-users-placeholder"
                >
                  Select Users
                </span>
              </div>
            </Form.Item>
          </Col>
          <Col span={6} data-cy="okr-criteria-modal-filter-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-criteria-modal-filter-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-criteria-modal-filter-label-text"
                  >
                    Filter
                  </span>
                  <Tooltip title="Filter users by type.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-criteria-modal-filter-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              data-cy="okr-criteria-modal-filter-field"
            >
              <Select
                value={userTypeFilter}
                onChange={setUserTypeFilter}
                className="h-11"
                placeholder="Select"
                data-cy="okr-criteria-modal-filter-select"
              >
                <Option
                  value="all"
                  data-cy="okr-criteria-modal-filter-option-all"
                >
                  All
                </Option>
                <Option
                  value="team leads"
                  data-cy="okr-criteria-modal-filter-option-team-leads"
                >
                  Team Leads
                </Option>
                <Option
                  value="team members"
                  data-cy="okr-criteria-modal-filter-option-team-members"
                >
                  Team Members
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div
          className="flex flex-wrap gap-2 mb-6"
          data-cy="okr-criteria-modal-users-tags-container"
        >
          <Select
            mode="multiple"
            placeholder="Add Users"
            className="w-full min-h-12"
            id="okr-criteria-drawer-users-select"
            data-cy="okr-criteria-drawer-users-select"
          >
            {filteredUsers.length > 0
              ? filteredUsers.map((user: any) => (
                  <Select.Option
                    data-cy={`okr-criteria-drawer-users-option-${user.id}`}
                    key={user.id}
                    value={user.id}
                  >
                    <EmployeeDetails
                      data-cy={`okr-criteria-drawer-users-option-employee-details-${user.id}`}
                      empId={user.id}
                    />
                  </Select.Option>
                ))
              : form.getFieldValue('users')?.map((empId: string) => (
                  <Select.Option
                    data-cy={`okr-criteria-drawer-users-option-${empId}`}
                    key={empId}
                    value={empId}
                  >
                    <EmployeeDetails
                      data-cy={`okr-criteria-drawer-users-option-employee-details-${empId}`}
                      empId={empId}
                    />
                  </Select.Option>
                ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-criteria-modal-criteria-label"
            >
              <span
                className="text-[14px] font-medium text-[#262626]"
                data-cy="okr-criteria-modal-criteria-label-text"
              >
                Chritaria
              </span>
              <Tooltip title="Select the criteria items.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                  data-cy="okr-criteria-modal-criteria-tooltip"
                />
              </Tooltip>
            </div>
          }
          name="criteria"
          className="mb-2"
          required
          rules={[{ required: true, message: 'Please select criteria' }]}
          data-cy="okr-criteria-modal-criteria-field"
        >
          <div
            className="custom-centered-select-wrapper relative"
            data-cy="okr-criteria-modal-criteria-select-wrapper"
          >
            <Select
              mode="multiple"
              placeholder=""
              className="w-full h-11 custom-modal-select always-show-placeholder"
              maxTagCount={0}
              maxTagPlaceholder={() => null}
              value={watchedCriteria}
              onSelect={(val) => {
                const current = form.getFieldValue('criteria') || [];
                if (!current.includes(val)) {
                  const newValues = [...current, val];
                  form.setFieldsValue({ criteria: newValues });
                  handleCriteriaChange(newValues);
                }
              }}
              onDeselect={(val) => {
                const current = form.getFieldValue('criteria') || [];
                const newValues = current.filter((v: any) => v !== val);
                form.setFieldsValue({ criteria: newValues });
                handleCriteriaChange(newValues);
              }}
              dropdownClassName="custom-assignee-dropdown"
              data-cy="okr-criteria-modal-criteria-select"
            >
              {criteriaData?.items?.map((c: any) => (
                <Option
                  key={c.id}
                  value={c.name}
                  data-cy={`okr-criteria-modal-criteria-option-${c.id}`}
                >
                  {c.name}
                </Option>
              ))}
            </Select>
            {/* Always visible placeholder overlay */}
            <span
              className="absolute left-3 text-[#8c8c8c] font-normal pointer-events-none z-10"
              style={{ lineHeight: '44px' }}
              data-cy="okr-criteria-modal-criteria-placeholder"
            >
              Select Criteria
            </span>
          </div>
        </Form.Item>

        <div
          className="flex mt-5"
          id="okr-criteria-drawer-weights-header"
          data-cy="okr-criteria-drawer-weights-header"
        >
          <span
            className="flex-1 h-12"
            id="okr-criteria-drawer-weights-header-name"
            data-cy="okr-criteria-drawer-weights-header-name"
          >
            Criteria Name
          </span>
          <span
            className="flex-1 h-12"
            id="okr-criteria-drawer-weights-header-value"
            data-cy="okr-criteria-drawer-weights-header-value"
          >
            Weight
          </span>
        </div>

        {selectedCriteria.map((criteria) => (
          <div
            key={criteria.vpCriteriaId}
            className="flex items-center gap-4"
            id={`okr-criteria-drawer-weight-row-${criteria.vpCriteriaId}`}
            data-cy={`okr-criteria-drawer-weight-row-${criteria.vpCriteriaId}`}
          >
            <Form.Item
              className="flex-1"
              id={`okr-criteria-drawer-weight-name-field-${criteria.vpCriteriaId}`}
              data-cy={`okr-criteria-drawer-weight-name-field-${criteria.vpCriteriaId}`}
            >
              <Input
                value={criteria.name}
                disabled
                className="flex-1 h-12"
                id={`okr-criteria-drawer-weight-name-input-${criteria.vpCriteriaId}`}
                data-cy={`okr-criteria-drawer-weight-name-input-${criteria.vpCriteriaId}`}
              />
            </Form.Item>
            <Form.Item
              className="flex-1"
              name={`${criteria.vpCriteriaId}_weight`}
              initialValue={weights[criteria.vpCriteriaId] || ''}
              id={`okr-criteria-drawer-weight-value-field-${criteria.vpCriteriaId}`}
              data-cy={`okr-criteria-drawer-weight-value-field-${criteria.vpCriteriaId}`}
            >
              <Input
                type="number"
                className="flex-1 h-12"
                min={0}
                max={100}
                onChange={(e) => {
                  const { weights, setWeights } =
                    useCriteriaManagementStore.getState();
                  const updatedWeights = {
                    ...weights,
                    [criteria.vpCriteriaId]: e.target.value,
                  };
                  setWeights(updatedWeights);
                }}
                id={`okr-criteria-drawer-weight-value-input-${criteria.vpCriteriaId}`}
                data-cy={`okr-criteria-drawer-weight-value-input-${criteria.vpCriteriaId}`}
              />
            </Form.Item>
          </div>
        )}

        <style jsx global data-cy="okr-criteria-modal-styles">{`
          .custom-centered-select-wrapper .ant-select-selector {
            display: flex !important;
            align-items: center !important;
            height: 44px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            position: relative !important;
          }
          .custom-centered-select-wrapper
            .always-show-placeholder
            .ant-select-selection-placeholder {
            display: none !important;
          }
          .custom-centered-select-wrapper
            .always-show-placeholder
            .ant-select-selection-item {
            display: none !important;
          }
          .custom-centered-select-wrapper
            .always-show-placeholder
            .ant-select-selection-search {
            display: none !important;
          }
          .custom-centered-select-wrapper
            .always-show-placeholder
            .ant-select-selection-overflow {
            display: none !important;
          }
          .custom-assignee-dropdown .ant-select-item-option-selected {
            background-color: #e6f7ff !important;
            font-weight: 500;
          }
          .custom-assignee-dropdown
            .ant-select-item-option-selected
            .ant-select-item-option-state {
            color: #1890ff;
          }
          .okr-settings-modal .ant-modal-header {
            padding: 20px 24px 16px 24px !important;
            border-bottom: none !important;
          }
          .okr-settings-modal .ant-modal-body {
            padding: 0px 24px 24px 24px !important;
          }
          .okr-settings-modal .ant-modal-footer {
            padding: 8px 24px 24px 24px !important;
            border-top: none !important;
          }
          .okr-settings-modal .ant-form-item-label > label {
            height: auto !important;
            line-height: 1.5 !important;
            padding-bottom: 4px !important;
          }
        `}</style>
      </Form>
    </CustomDrawerLayout>
  );
};

export default ScoringDrawer;
