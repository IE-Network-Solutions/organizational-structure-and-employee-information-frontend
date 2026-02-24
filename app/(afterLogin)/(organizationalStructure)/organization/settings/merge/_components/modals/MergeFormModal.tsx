'use client';
import React, { useMemo } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';
import { useGetAllUsersToGetTeamLeads } from '@/store/server/features/employees/employeeManagment/queries';
import { Department } from '../cards/TeamCard';

interface MergeFormModalProps {
  open: boolean;
  onNext: (formData: { teamLead: string; departmentName: string }) => void;
  onCancel: () => void;
  sourceTeam: Department | null;
  destinationTeam: Department | null;
}

const MergeFormModal: React.FC<MergeFormModalProps> = ({
  open,
  onNext,
  onCancel,
  sourceTeam,
  destinationTeam,
}) => {
  const [form] = Form.useForm();
  const { data: employeeData } = useGetAllUsersToGetTeamLeads();

  // Get employees from both teams
  const teamLeadOptions = useMemo(() => {
    if (!employeeData?.items || (!sourceTeam && !destinationTeam)) return [];

    const departmentIds = [sourceTeam?.id, destinationTeam?.id].filter(
      Boolean,
    ) as string[];

    return employeeData.items
      .filter((emp: any) =>
        emp?.employeeJobInformation?.some(
          (job: any) =>
            departmentIds.includes(job.departmentId) && job.isPositionActive,
        ),
      )
      .map((emp: any) => ({
        value: emp.id,
        label:
          `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim(),
      }));
  }, [employeeData, sourceTeam, destinationTeam]);

  const handleNext = () => {
    form
      .validateFields()
      .then((values) => {
        onNext({
          teamLead: values.teamLead,
          departmentName: values.departmentName,
        });
        form.resetFields();
      })
      .catch(() => {
        // Validation errors will be shown automatically
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title="Merge Department"
      closeIcon={<span className="text-gray-400">×</span>}
      footer={null}
      data-cy="merge-form-modal"
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="teamLead"
          label={
            <span>
              Team Lead <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: 'Please select team lead' }]}
        >
          <Select
            placeholder="Select team lead"
            size="large"
            showSearch
            optionFilterProp="label"
            options={teamLeadOptions}
          />
        </Form.Item>
        <Form.Item
          name="departmentName"
          label={
            <span>
              Name of Department <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: 'Please enter department name' }]}
        >
          <Input placeholder="Enter branch name" size="large" />
        </Form.Item>
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleCancel} className="border-gray-300">
            Cancel
          </Button>
          <Button type="primary" onClick={handleNext} className="bg-primary">
            Next
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default MergeFormModal;
