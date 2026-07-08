'use client';
import React, { useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  Modal,
  Tooltip,
  Row,
  Col,
  message,
  Button,
} from 'antd';
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useFetchVpScoringById,
  useGetCriteriaTargets,
  useVpScoringAssignedUsers,
} from '@/store/server/features/okrplanning/okr/criteria/queries';
import {
  useCreateVpScoring,
  useUpdateVpScoring,
  extractVpScoringFailedAssignments,
  VpScoringFailedAssignment,
  VpScoringMutationResponse,
} from '@/store/server/features/okrplanning/okr/criteria/mutation';
import useCriteriaManagementStore from '@/store/uistate/features/okrplanning/okrSetting/criteriaManagmentStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import FailedAssignmentModal from '../failed-assignment-modal';

const { Option } = Select;

const ScoringModal: React.FC = () => {
  const { mutate: updateScoring, isLoading: isUpdatingLoading } =
    useUpdateVpScoring();

  const { mutate: vpScoringMutate, isLoading: isCreateLoading } =
    useCreateVpScoring();

  const { isDrawerVisible, closeDrawer, currentId } = useDrawerStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: criteriaData } = useGetCriteriaTargets();
  const {
    weights,
    selectedCriteria,
    filteredUsers,
    userTypeFilter,
    setWeights,
    setSelectedCriteria,
    setSelectedDepartment,
    setFilteredUsers,
    setUserTypeFilter,
    failedAssignments,
    isFailedAssignmentModalVisible,
    showFailedAssignments,
    closeFailedAssignmentModal,
  } = useCriteriaManagementStore();
  const { userId } = useAuthenticationStore();

  const { data: scoringData } = useFetchVpScoringById(currentId || '');
  const { assignedMap: vpScoringAssignedMap } =
    useVpScoringAssignedUsers(isDrawerVisible);

  const [form] = Form.useForm();

  const allDepartmentUsers = useMemo(
    () => departmentData?.flatMap((dept: any) => dept.users || []) || [],
    [departmentData],
  );

  const getEmployeeName = (employeeUserId: string) => {
    const user = allDepartmentUsers.find(
      (departmentUser: any) =>
        String(departmentUser.id) === String(employeeUserId),
    );
    return user
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'Unknown Employee';
  };

  const getUserAssignmentConflict = (employeeUserId: string) => {
    const assignment = vpScoringAssignedMap.get(String(employeeUserId));
    if (!assignment) return null;
    if (currentId && String(assignment.vpScoringId) === String(currentId)) {
      return null;
    }
    return assignment;
  };

  const collectAssignmentConflicts = (
    userIds: string[],
  ): VpScoringFailedAssignment[] =>
    userIds
      .map((userId) => {
        const conflict = getUserAssignmentConflict(userId);
        if (!conflict) return null;
        return {
          userId: String(userId),
          vpScoringId: conflict.vpScoringId,
          vpScoringName: conflict.vpScoringName,
        };
      })
      .filter((item): item is VpScoringFailedAssignment => item != null);

  const showFailedAssignmentModal = (failed: VpScoringFailedAssignment[]) => {
    if (failed.length === 0) return;
    showFailedAssignmentModal(failed);
  };

  const handleMutationSuccess = (response: VpScoringMutationResponse) => {
    handleModalClose();

    const failed = extractVpScoringFailedAssignments(response);
    showFailedAssignmentModal(failed);
  };

  // Watchers for tags display
  const watchedDepartments = Form.useWatch('department', form);
  const watchedUsers = Form.useWatch('users', form);
  const watchedCriteria = Form.useWatch('criteria', form);

  useEffect(() => {
    if (scoringData && criteriaData && departmentData) {
      const allUsers =
        departmentData?.flatMap((dept: any) => dept.users || []) || [];

      const preSelectedUsers = scoringData.userVpScoring
        .map((item: any) =>
          allUsers.find((user: any) => user.id === item.userId),
        )
        .filter(Boolean);

      setFilteredUsers(preSelectedUsers);
      form.setFieldsValue({
        name: scoringData.name,
        totalPercentage: scoringData.totalPercentage,
        department: scoringData.userVpScoring
          ?.map((u: any) => {
            const user = departmentData
              ?.flatMap((d: any) => d.users)
              ?.find((emp: any) => emp.id === u.userId);
            return user?.departmentId;
          })
          .filter((v: any, i: any, a: any) => v && a.indexOf(v) === i),
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
  }, [scoringData, criteriaData, form, departmentData]);

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

      const mergedUsers = [...allSelectedDepartmentUsers];
      scoringUsers.forEach((su: any) => {
        if (!mergedUsers.some((u: any) => u.id === su.id)) {
          mergedUsers.push(su);
        }
      });

      setFilteredUsers(mergedUsers);
    } else if (scoringUsers.length > 0) {
      // No departments selected but we are editing; at least show the existing users
      setFilteredUsers(scoringUsers as any[]);
    } else {
      setFilteredUsers([]);
    }
  }, [
    watchedDepartments,
    departmentData,
    userTypeFilter,
    currentId,
    scoringData,
  ]);

  const handleModalClose = () => {
    form.resetFields();
    setWeights({});
    setSelectedCriteria([]);
    setSelectedDepartment([]);
    setFilteredUsers([]);
    closeFailedAssignmentModal();
    closeDrawer();
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

    const clientConflicts = collectAssignmentConflicts(values.users);
    if (clientConflicts.length > 0) {
      showFailedAssignments(clientConflicts);
      message.error(
        'Some selected employees are already assigned to another VP scoring configuration.',
      );
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
      if (existingCriterion?.id) criteriaMapping.id = existingCriterion.id;
      return criteriaMapping;
    });

    const payload: any = {
      name: values.name,
      totalPercentage: parseFloat(values.totalPercentage),
      createUserVpScoringDto: mappedUsers,
      vpScoringCriteria: mappedCriteria,
    };

    if (currentId) {
      payload.id = currentId;
      payload.updatedBy = userId;
      updateScoring(
        { id: currentId, values: payload },
        { onSuccess: handleMutationSuccess },
      );
    } else {
      payload.createdBy = userId;
      vpScoringMutate(payload, { onSuccess: handleMutationSuccess });
    }
  };

  const footer = (
    <div className="flex justify-end gap-3" data-cy="okr-criteria-modal-footer">
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
    <>
      <Modal
        open={isDrawerVisible}
        onCancel={handleModalClose}
        title={
          <span
            className="text-[20px] font-bold text-[#262626]"
            data-cy="okr-criteria-modal-title"
          >
            {currentId
              ? 'Edit Scoring Configuration'
              : 'Add Scoring Configuration'}
          </span>
        }
        footer={footer}
        width={1000}
        centered
        closeIcon={
          <CloseOutlined
            className="text-[#8c8c8c]"
            data-cy="okr-criteria-modal-close-icon"
          />
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
                      const conflict = getUserAssignmentConflict(String(val));
                      if (conflict) {
                        message.warning(
                          `${getEmployeeName(String(val))} is already assigned to "${conflict.vpScoringName}".`,
                        );
                        return;
                      }
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
                    {filteredUsers?.map((user: any) => {
                      const conflict = getUserAssignmentConflict(user.id);
                      const isBlocked = Boolean(conflict);
                      return (
                        <Option
                          key={user.id}
                          value={user.id}
                          disabled={isBlocked}
                          data-cy={`okr-criteria-modal-users-option-${user.id}`}
                        >
                          {user.firstName} {user.lastName}
                          {isBlocked
                            ? ` (assigned to ${conflict?.vpScoringName})`
                            : ''}
                        </Option>
                      );
                    })}
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
            {watchedUsers?.map((id: string) => {
              const user = filteredUsers?.find((u: any) => u.id === id);
              if (!user) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 bg-white border border-[#d9d9d9] px-3 py-1 rounded-[6px]"
                  data-cy={`okr-criteria-modal-users-tag-${id}`}
                >
                  <span
                    className="text-[14px] text-[#595959]"
                    data-cy={`okr-criteria-modal-users-tag-name-${id}`}
                  >
                    {user.firstName}
                  </span>
                  <CloseOutlined
                    className="text-[10px] text-[#8c8c8c] cursor-pointer hover:text-red-500"
                    onClick={() =>
                      form.setFieldsValue({
                        users: watchedUsers.filter((v: any) => v !== id),
                      })
                    }
                    data-cy={`okr-criteria-modal-users-tag-close-${id}`}
                  />
                </div>
              );
            })}
          </div>

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
            className="flex flex-wrap gap-2 mb-6"
            data-cy="okr-criteria-modal-criteria-tags-container"
          >
            {watchedCriteria?.map((name: string) => (
              <div
                key={name}
                className="flex items-center gap-2 bg-white border border-[#d9d9d9] px-3 py-1 rounded-[6px]"
                data-cy={`okr-criteria-modal-criteria-tag-${name}`}
              >
                <span
                  className="text-[14px] text-[#595959]"
                  data-cy={`okr-criteria-modal-criteria-tag-name-${name}`}
                >
                  {name}
                </span>
                <CloseOutlined
                  className="text-[10px] text-[#8c8c8c] cursor-pointer hover:text-red-500"
                  onClick={() => {
                    const newValues = watchedCriteria.filter(
                      (v: any) => v !== name,
                    );
                    form.setFieldsValue({ criteria: newValues });
                    handleCriteriaChange(newValues);
                  }}
                  data-cy={`okr-criteria-modal-criteria-tag-close-${name}`}
                />
              </div>
            ))}
          </div>

          {selectedCriteria.length > 0 && (
            <div
              className="mt-6 border-t pt-4"
              data-cy="okr-criteria-modal-weights-section"
            >
              <div
                className="flex font-semibold text-[#262626] mb-3"
                data-cy="okr-criteria-modal-weights-header"
              >
                <span
                  className="flex-1"
                  data-cy="okr-criteria-modal-weights-header-name"
                >
                  Criteria Name
                </span>
                <span
                  className="flex-1"
                  data-cy="okr-criteria-modal-weights-header-weight"
                >
                  Weight
                </span>
              </div>
              {selectedCriteria.map((criteria) => (
                <div
                  key={criteria.vpCriteriaId}
                  className="flex gap-4 mb-3"
                  data-cy={`okr-criteria-modal-weight-row-${criteria.vpCriteriaId}`}
                >
                  <Input
                    value={criteria.name}
                    disabled
                    className="flex-1 h-11"
                    data-cy={`okr-criteria-modal-weight-name-input-${criteria.vpCriteriaId}`}
                  />
                  <Input
                    type="number"
                    value={weights[criteria.vpCriteriaId] || ''}
                    className="flex-1 h-11"
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        [criteria.vpCriteriaId]: e.target.value,
                      })
                    }
                    data-cy={`okr-criteria-modal-weight-input-${criteria.vpCriteriaId}`}
                  />
                </div>
              ))}
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
            .okr-settings-modal .ant-modal-content {
              padding: 0 !important;
              border-radius: 8px !important;
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
      </Modal>

      <FailedAssignmentModal
        open={isFailedAssignmentModalVisible}
        failedAssignments={failedAssignments}
        getEmployeeName={getEmployeeName}
        onClose={closeFailedAssignmentModal}
      />
    </>
  );
};

export default ScoringModal;
