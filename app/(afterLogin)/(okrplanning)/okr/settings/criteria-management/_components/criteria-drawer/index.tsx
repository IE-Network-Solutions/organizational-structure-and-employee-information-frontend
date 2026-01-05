import React, { useEffect } from 'react';
import {
  Avatar,
  Button,
  Form,
  Input,
  notification,
  Select,
  Space,
  Spin,
} from 'antd';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CustomDrawerLayout from '@/components/common/customDrawer';
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
    if (selectedDepartment) {
      const allSelectedDepartmentUsers = selectedDepartment
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

    setWeights(
      scoringData.vpScoringCriterions.reduce(
        (acc: any, item: any) => ({
          ...acc,
          [item.vpCriteriaId]: item.weight,
        }),
        {},
      ),
    );
  };

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      resetState();
      closeDrawer();
    }
  }, [isCreateSuccess, isUpdateSuccess]);

  const resetState = () => {
    setWeights({});
    setSelectedCriteria([]);
    setSelectedDepartment([]);
    setFilteredUsers([]);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    try {
      const mappedUsers = values.users.map((userId: string) => {
        const existingUser = scoringData?.userVpScoring?.find(
          (item: any) => item.userId === userId,
        );

        const userMapping: Record<string, string> = { userId };
        if (existingUser?.id) {
          userMapping.id = existingUser.id;
        }
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
        payload.updatedBy = userId; // Add `updatedBy` if `currentId` exists
        updateScoring({ id: currentId, values: payload });
      } else {
        payload.createdBy = userId; // Add `createdBy` if `currentId` does not exist
        vpScoringMutate(payload);
      }
    } catch (error) {
      notification.error({
        message: 'Operation failed',
      });
    }
  };

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
      data-cy="okr-criteria-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        id="okr-criteria-drawer-form"
        data-cy="okr-criteria-drawer-form"
      >
        <Form.Item
          label="Name of the Scoring Configuration"
          name="name"
          rules={[{ required: true, message: 'Please enter the name' }]}
          id="okr-criteria-drawer-name-field"
          data-cy="okr-criteria-drawer-name-field"
        >
          <Input
            placeholder="Enter the name here"
            id="okr-criteria-drawer-name-input"
            data-cy="okr-criteria-drawer-name-input"
          />
        </Form.Item>

        <Form.Item
          label="Total Percentage"
          name="totalPercentage"
          rules={[
            { required: true, message: 'Please enter the total percentage' },
          ]}
          id="okr-criteria-drawer-total-percentage-field"
          data-cy="okr-criteria-drawer-total-percentage-field"
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Enter the total percentage"
            id="okr-criteria-drawer-total-percentage-input"
            data-cy="okr-criteria-drawer-total-percentage-input"
          />
        </Form.Item>

        <Form.Item
          label="Department"
          name="department"
          id="okr-criteria-drawer-department-field"
          data-cy="okr-criteria-drawer-department-field"
        >
          <Select
            mode="multiple"
            placeholder="Select Department"
            onChange={handleDepartmentChange}
            id="okr-criteria-drawer-department-select"
            data-cy="okr-criteria-drawer-department-select"
          >
            {departmentData?.map((dept: any) => (
              <Option
                key={dept.id}
                value={dept.id}
                id={`okr-criteria-drawer-department-option-${dept.id}`}
                data-cy={`okr-criteria-drawer-department-option-${dept.id}`}
              >
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="User Type Filter"
          id="okr-criteria-drawer-user-type-field"
          data-cy="okr-criteria-drawer-user-type-field"
        >
          <Select
            placeholder="Select User Type"
            onChange={handleUserTypeFilter}
            defaultActiveFirstOption
            id="okr-criteria-drawer-user-type-select"
            data-cy="okr-criteria-drawer-user-type-select"
          >
            <Option
              value="all"
              id="okr-criteria-drawer-user-type-option-all"
              data-cy="okr-criteria-drawer-user-type-option-all"
            >
              All
            </Option>
            <Option
              value="team leads"
              id="okr-criteria-drawer-user-type-option-leads"
              data-cy="okr-criteria-drawer-user-type-option-leads"
            >
              Team Leads
            </Option>
            <Option
              value="team members"
              id="okr-criteria-drawer-user-type-option-members"
              data-cy="okr-criteria-drawer-user-type-option-members"
            >
              Team Members
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Users"
          name="users"
          className="flex-1 min-h-12"
          rules={[{ required: true, message: 'Please select users' }]}
          id="okr-criteria-drawer-users-field"
          data-cy="okr-criteria-drawer-users-field"
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
          label="Choose Criteria"
          name="criteria"
          rules={[
            { required: true, message: 'Please select at least one criteria' },
          ]}
          id="okr-criteria-drawer-criteria-field"
          data-cy="okr-criteria-drawer-criteria-field"
        >
          <Select
            mode="multiple"
            placeholder="Select criteria"
            onChange={handleCriteriaChange}
            className="flex-1 min-h-12"
            id="okr-criteria-drawer-criteria-select"
            data-cy="okr-criteria-drawer-criteria-select"
          >
            {criteriaData?.items?.map((criteria: any) => (
              <Option
                key={criteria.id}
                value={criteria.name}
                id={`okr-criteria-drawer-criteria-option-${criteria.id}`}
                data-cy={`okr-criteria-drawer-criteria-option-${criteria.id}`}
              >
                {criteria.name}
              </Option>
            ))}
          </Select>
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
        ))}
      </Form>
    </CustomDrawerLayout>
  );
};

export default ScoringDrawer;
