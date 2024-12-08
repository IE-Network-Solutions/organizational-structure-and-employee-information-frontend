import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, notification, Select } from 'antd';
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

const { Option } = Select;

interface Department {
  id: string;
  name: string;
  users: { firstName: string; lastName: string; id: string }[];
}

interface Criterion {
  id: string;
  name: string;
}

interface ScoringData {
  name: string;
  totalPercentage: string;
  userVpScoring: { userId: string }[];
  vpScoringCriterions: { vpCriteriaId: string; weight: string }[];
}

const ScoringDrawer: React.FC = () => {
  const { isDrawerVisible, closeDrawer, currentId } = useDrawerStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: criteriaData } = useGetCriteriaTargets();
  const [userIds, setUserIds] = useState<string[]>([]);
  const [criteriaIds, setCriteriaIds] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, string>>({});

  const {
    mutate: vpScoringMutate,
    isLoading,
    isSuccess,
  } = useCreateVpScoring();
  const {
    data: scoringData,
    isLoading: isFetchingScoring,
    error: fetchError,
  } = useFetchVpScoringById(currentId || '');
  const {
    mutate: updateScoring,
    isLoading: isUpdating,
    isSuccess: isUpdateSuccess,
  } = useUpdateVpScoring();

  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<
    { name: string; id: string }[]
  >([]);
  const [form] = Form.useForm();

  const usersByDepartment = useMemo(() => {
    const map: Record<string, { name: string; id: string }[]> = {};
    if (departmentData) {
      departmentData.forEach((department: Department) => {
        const { name, users } = department;
        map[name] = users.map((user) => ({
          name: `${user.firstName} ${user.lastName}`,
          id: user.id,
        }));
      });
    }
    return map;
  }, [departmentData]);

  useEffect(() => {
    if (scoringData) {
      console.log('--------------------scoringData--------', scoringData);
      form.setFieldsValue({
        name: scoringData.name,
        totalPercentage: scoringData.totalPercentage,
        users: scoringData.userVpScoring.map((user: any) => user.userId),
        criteria: scoringData.vpScoringCriterions.map(
          (criterion: any) => criterion.vpCriteriaId,
        ),
      });

      setUserIds(scoringData.userVpScoring.map((user: any) => user.userId));
      setCriteriaIds(
        scoringData.vpScoringCriterions.map(
          (criterion: any) => criterion.vpCriteriaId,
        ),
      );
      setWeights(
        scoringData.vpScoringCriterions.reduce((acc: any, criterion: any) => {
          acc[criterion.vpCriteriaId] = criterion.weight;
          return acc;
        }, {}),
      );

      // Set the criteria names as selectedCriteria
      const selectedCriteriaNames = scoringData.vpScoringCriterions
        .map((criterion: any) => {
          const criteria = criteriaData?.items?.find(
            (c: Criterion) => c.id === criterion.vpCriteriaId,
          );
          return criteria?.name;
        })
        .filter(Boolean);

      setSelectedCriteria(selectedCriteriaNames);
    }
  }, [scoringData, criteriaData, form]);

  useEffect(() => {
    const users = selectedDepartments
      .flatMap((dept) => usersByDepartment[dept] || [])
      .filter(
        (user, index, self) =>
          self.findIndex((u) => u.id === user.id) === index,
      );
    setAvailableUsers(users);
  }, [selectedDepartments, usersByDepartment]);

  const handleCriteriaChange = (values: string[]) => {
    setSelectedCriteria(values);
  };

  const onFinish = async (values: any) => {
    try {
      const criteriaIds = selectedCriteria
        .map((criteriaName) => {
          const criteria = criteriaData?.items?.find(
            (c: Criterion) => c.name === criteriaName,
          );
          return criteria ? criteria.id : null;
        })
        .filter(Boolean);

      const payload = {
        name: values.name,
        totalPercentage: parseFloat(values.totalPercentage),
        vpScoringCriteria: criteriaIds.map((criteriaId, index) => ({
          id: criteriaId.id,
          vpCriteriaId: criteriaId,
          weight: parseFloat(values[`${selectedCriteria[index]}_weight`]),
        })),
        createUserVpScoringDto: values.users.map((userId: string) => ({
          userId,
        })),
      };

      // Wrap the payload inside 'values' for update or create
      const finalPayload = {
        id: currentId || '', // Use currentId for updating or leave empty for create
        values: payload, // Wrap the actual data inside 'values'
      };

      // Handle creation or update
      if (currentId) {
        updateScoring(finalPayload); // Pass the structured object for update
      } else {
        vpScoringMutate(payload); // Pass the structured object for create
      }

      if (isSuccess || isUpdateSuccess) {
        form.resetFields();
        closeDrawer();
      }
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to save VP Scoring.',
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
                form.resetFields();
                closeDrawer();
              }}
            />
            <CustomButton
              loading={isLoading || isUpdating}
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
          <Input placeholder="Enter the name here" className="h-12" />
        </Form.Item>

        <Form.Item
          label="Total Percentage"
          name="totalPercentage"
          rules={[
            { required: true, message: 'Please enter the total percentage' },
          ]}
        >
          <Input placeholder="Enter the total percentage" className="h-12" />
        </Form.Item>

        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: 'Please select a department' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select Department"
            className="w-full h-12"
            onChange={(values) => setSelectedDepartments(values)}
          >
            {departmentData?.map((dept: Department) => (
              <Option key={dept.id} value={dept.name}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Users"
          name="users"
          rules={[{ required: true, message: 'Please select users' }]}
        >
          <Select
            mode="multiple"
            placeholder="Add Users"
            className="w-full h-12"
            disabled={!selectedDepartments.length}
          >
            {availableUsers.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
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
            className="flex-1 h-12"
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

        {selectedCriteria.map((criteriaName, index) => (
          <div key={criteriaName} className="flex items-center gap-4">
            <Form.Item className="flex-1">
              <Input value={criteriaName} disabled className="flex-1 h-12" />
            </Form.Item>
            <Form.Item
              className="flex-1"
              name={`${criteriaName}_weight`}
              initialValue={
                weights[
                  criteriaData?.items?.find(
                    (c: Criterion) => c.name === criteriaName,
                  )?.id
                ] || ''
              }
            >
              <Input
                type="number"
                className="flex-1 h-12"
                min={0}
                max={100}
                onChange={(e) => {
                  const criteriaId = criteriaData?.items?.find(
                    (c: Criterion) => c.name === criteriaName,
                  )?.id;
                  if (criteriaId) {
                    setWeights((prev) => ({
                      ...prev,
                      [criteriaId]: e.target.value,
                    }));
                  }
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
