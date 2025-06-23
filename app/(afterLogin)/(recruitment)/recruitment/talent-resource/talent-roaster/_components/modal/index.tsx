import { Button, Modal, Form, Select, Input, Tag } from 'antd';
import { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface Candidate {
  id: string;
  fullName: string;
  phone?: string;
}

interface AddToJobPipelineProps {
  open: boolean;
  onCancel: () => void;
  selectedCandidates: Candidate[];
  onRemoveCandidate: (candidateId: string) => void;
  availableJobs: any[];
  onSubmit: (values: { jobId: string; reason: string }) => void;
}

const AddToJobPipeline: React.FC<AddToJobPipelineProps> = ({
  open,
  onCancel,
  selectedCandidates,
  onRemoveCandidate,
  availableJobs,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      centered
      width={600}
      footer={null}
      title={null}
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Add to Job Pipeline</h2>

        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {/* Selected Applicants Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selected Applicants <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedCandidates.map((candidate) => (
                <Tag
                  key={candidate.id}
                  closable
                  onClose={() => onRemoveCandidate(candidate.id)}
                  closeIcon={<CloseOutlined />}
                  className="flex items-center px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm"
                >
                  {candidate.fullName}
                </Tag>
              ))}
            </div>
          </div>

          {/* Select Job Section */}
          <Form.Item
            name="jobId"
            label={
              <span className="text-sm font-medium text-gray-700">
                Select Job <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please select a job',
              },
            ]}
          >
            <Select placeholder="Selection" className="w-full" size="large">
              {availableJobs?.map((job) => (
                <Option key={job.id} value={job.id}>
                  {job.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Reason Section */}
          <Form.Item
            name="reason"
            label={
              <span className="text-sm font-medium text-gray-700">
                Reason <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please provide a reason',
              },
            ]}
          >
            <TextArea
              placeholder="Reason for selection"
              rows={4}
              className="w-full"
            />
          </Form.Item>

          {/* Footer Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handleCancel}
              className="px-8 py-2 h-auto"
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="px-8 py-2 h-auto bg-blue-600 hover:bg-blue-700"
              size="large"
            >
              Add
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddToJobPipeline;
