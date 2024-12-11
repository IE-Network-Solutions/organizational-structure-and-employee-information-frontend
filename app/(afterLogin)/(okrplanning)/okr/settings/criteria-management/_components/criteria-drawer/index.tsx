import React, { useState, useEffect } from 'react';
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

const ScoringDrawer: React.FC = () => {
  const { mutate: updateScoring, isLoading: isUpdating } = useUpdateVpScoring();

  const { mutate: vpScoringMutate, isLoading } = useCreateVpScoring();

  const { isDrawerVisible, closeDrawer, currentId } = useDrawerStore();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: criteriaData } = useGetCriteriaTargets();
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [selectedCriteria, setSelectedCriteria] = useState<
    { name: string; vpCriteriaId: string }[]
  >([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const { data: scoringData } = useFetchVpScoringById(currentId || '');

  const [form] = Form.useForm();

  useEffect(() => {
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
      const department = departmentData?.find(
        (dept: any) => dept.id === selectedDepartment,
      );
      setFilteredUsers(department?.users || []);
    } else {
      setFilteredUsers([]);
    }
  }, [selectedDepartment, departmentData]);

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
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

    const removedCriteriaIds = selectedCriteria
      .filter((criteria) => !values.includes(criteria.name))
      .map((criteria) => criteria.vpCriteriaId);

    setSelectedCriteria([...updatedCriteria, ...newCriteria]);

    setWeights((prev) => {
      const updatedWeights = { ...prev };
      removedCriteriaIds.forEach((id) => delete updatedWeights[id]);
      return updatedWeights;
    });
  };

  const resetState = () => {
    setWeights({});
    setSelectedCriteria([]);
    setSelectedDepartment(null);
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
        await updateScoring({ id: currentId, values: payload });
      } else {
        await vpScoringMutate(payload);
      }

      resetState();
      closeDrawer();
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
              loading={isUpdating || isLoading}
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
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Enter the total percentage"
            className="h-12"
          />
        </Form.Item>

        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: 'Please select a department' }]}
        >
          <Select
            placeholder="Select Department"
            onChange={handleDepartmentChange}
            className="w-full h-12"
          >
            {departmentData?.map((dept: any) => (
              <Option key={dept.id} value={dept.id}>
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
            options={filteredUsers.map((user: any) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName}`,
            }))}
          />
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
                  setWeights((prev) => ({
                    ...prev,
                    [criteria.vpCriteriaId]: e.target.value,
                  }));
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
