import React, { useEffect } from 'react';
import { Avatar, Form, Input, notification, Select, Space, Spin } from 'antd';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomButton from '@/components/common/buttons/customButton';
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
        <Spin />
      </>
    );

  if (error || !userDetails) return '-';

  const userName = `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` || '-';
  const profileImage = fallbackProfileImage;

  return (
    <Space size="small">
      <Avatar src={profileImage} className="h-5 w-5" />
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

      form.setFieldsValue({
        users: allSelectedDepartmentUsers.map((user: any) => user.id),
      });
    } else {
      setFilteredUsers([]);
    }
  }, [selectedDepartment, departmentData, userTypeFilter, form]);

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
        <span className="text-xl font-semibold">
          {currentId
            ? 'Edit Scoring Configuration'
            : 'Add New Scoring Configuration'}
        </span>
      }
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton
              type="default"
              title="Cancel"
              onClick={() => {
                resetState();
                closeDrawer();
              }}
            />
            <CustomButton
              loading={currentId ? isUpdatingLoading : isCreateLoading}
              title={currentId ? 'Update' : 'Add'}
              onClick={() => form.submit()}
            />
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name of the Scoring Configuration"
          name="name"
          rules={[{ required: true, message: 'Please enter the name' }]}
        >
          <Input placeholder="Enter the name here" />
        </Form.Item>

        <Form.Item
          label="Total Percentage"
          name="totalPercentage"
          rules={[
            { required: true, message: 'Please enter the total percentage' },
          ]}
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Enter the total percentage"
          />
        </Form.Item>

        <Form.Item label="Department" name="department">
          <Select
            mode="multiple"
            placeholder="Select Department"
            onChange={handleDepartmentChange}
          >
            {departmentData?.map((dept: any) => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="User Type Filter">
          <Select
            placeholder="Select User Type"
            onChange={handleUserTypeFilter}
            defaultActiveFirstOption
          >
            <Option value="all">All</Option>
            <Option value="team leads">Team Leads</Option>
            <Option value="team members">Team Members</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Users"
          name="users"
          className="flex-1 min-h-12"
          rules={[{ required: true, message: 'Please select users' }]}
        >
          <Select
            mode="multiple"
            placeholder="Add Users"
            className="w-full min-h-12"
          >
            {filteredUsers.length > 0
              ? filteredUsers.map((user: any) => (
                  <Select.Option key={user.id} value={user.id}>
                    <EmployeeDetails empId={user.id} />
                  </Select.Option>
                ))
              : form.getFieldValue('users')?.map((empId: string) => (
                  <Select.Option key={empId} value={empId}>
                    <EmployeeDetails empId={empId} />
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
        >
          <Select
            mode="multiple"
            placeholder="Select criteria"
            onChange={handleCriteriaChange}
            className="flex-1 min-h-12"
          >
            {criteriaData?.items?.map((criteria: any) => (
              <Option key={criteria.id} value={criteria.name}>
                {criteria.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div className="flex mt-5">
          <span className="flex-1 h-12">Criteria Name</span>
          <span className="flex-1 h-12">Weight</span>
        </div>

        {selectedCriteria.map((criteria) => (
          <div key={criteria.vpCriteriaId} className="flex items-center gap-4">
            <Form.Item className="flex-1">
              <Input value={criteria.name} disabled className="flex-1 h-12" />
            </Form.Item>
            <Form.Item
              className="flex-1"
              name={`${criteria.vpCriteriaId}_weight`}
              initialValue={weights[criteria.vpCriteriaId] || ''}
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
              />
            </Form.Item>
          </div>
        ))}
      </Form>
    </CustomDrawerLayout>
  );
};

export default ScoringDrawer;
