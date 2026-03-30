import React, { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Select } from 'antd';
import { useGetJobInformation } from '@/store/server/features/recruitment/jobs/query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';

interface TransferCandidateModalProps {
  selectedCandidate: any;
  visible: boolean;
  onConfirm: (value: any) => void;
  onCancel: () => void;
}

const TransferTalentPoolToCandidateModal: React.FC<
  TransferCandidateModalProps
> = ({ visible, onConfirm, onCancel, selectedCandidate }) => {
  const [form] = Form.useForm();

  const { data: jobInformations } = useGetJobInformation();
  const { userId } = useAuthenticationStore();
  const { data: EmployeeDepartment } = useEmployeeDepartments();

  const selectedJobInformationIds = Form.useWatch('jobInformations', form);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const removeJobInformation = (idToRemove: any) => {
    const current = Array.isArray(selectedJobInformationIds)
      ? selectedJobInformationIds
      : [];
    const next = current.filter((id: any) => String(id) !== String(idToRemove));
    form.setFieldValue('jobInformations', next);
  };

  const selectedJobInformationItems = (
    Array.isArray(selectedJobInformationIds) ? selectedJobInformationIds : []
  )
    .map((id: any) => {
      const match = jobInformations?.items?.find(
        (item: any) => String(item.id) === String(id),
      );
      if (!match) return null;
      return { id: match.id, jobTitle: match.jobTitle };
    })
    .filter(Boolean) as Array<{ id: any; jobTitle: string }>;

  const handleFinish = (values: any) => {
    const fullData = {
      ...values,
      jobCandidateInformationId: selectedCandidate?.jobCandidateInformationId,
      createdBy: userId,
    };
    onConfirm(fullData);
  };
  return (
    <Modal
      title={
        <span
          data-cy="talent-acquisition-talent-pool-modal-title-reonboard"
          className="text-xl font-bold text-black"
        >
          Add to Candidates
        </span>
      }
      data-cy="talent-acquisition-talent-pool-modal-reonboard"
      open={visible}
      onCancel={onCancel}
      footer={
        <div
          id="talent-acquisition-talent-pool-modal-footer-reonboard"
          data-cy="talent-acquisition-talent-pool-modal-footer-reonboard"
          className="flex justify-end gap-2 sm:px-6"
        >
          <Button
            type="default"
            id="talent-acquisition-talent-pool-button-reonboard-cancel"
            data-cy="talent-acquisition-talent-pool-button-reonboard-cancel"
            onClick={onCancel}
            className="h-8 border-[1px] border-[#d9d9d9] font-normal"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            id="talent-acquisition-talent-pool-button-reonboard-submit"
            data-cy="talent-acquisition-talent-pool-button-reonboard-submit"
            className="h-8 font-normal"
            onClick={() => form.submit()}
          >
            Add
          </Button>
        </div>
      }
      zIndex={10002}
      centered={true}
    >
      <div
        data-cy="talent-acquisition-talent-pool-modal-body"
        className="pt-6 sm:px-6"
      >
        <div
          data-cy="talent-acquisition-talent-pool-modal-body-form"
          className="border-[1px] border-[#d9d9d9] rounded-lg py-4 px-4"
        >
          <Form
            id="talent-acquisition-talent-pool-form-reonboard"
            data-cy="talent-acquisition-talent-pool-form-reonboard"
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
          >
            <Form.Item
              name="departmentId"
              label={
                <span
                  data-cy="talent-acquisition-talent-pool-form-label-department"
                  className="text-sm my-2 font-normal text-black"
                >
                  Select Department{' '}
                  <span className="text-error" data-cy="custom-label-required">
                    *
                  </span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select the department ',
                },
              ]}
            >
              <Select
                id="selectDepartment"
                data-cy="talent-acquisition-talent-pool-select-department-reonboard"
                placeholder="Select Department"
                allowClear
                className="w-full h-8"
              >
                {EmployeeDepartment &&
                  EmployeeDepartment?.map((item: any) => (
                    <Select.Option
                      key={item?.id}
                      value={item?.id}
                      id={`talent-acquisition-talent-pool-option-department-reonboard-${item?.id}`}
                      data-cy={`talent-acquisition-talent-pool-option-department-reonboard-${item?.id}`}
                    >
                      {item?.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="jobInformations"
              label={
                <span
                  data-cy="talent-acquisition-talent-pool-form-label-job-information"
                  className="text-sm my-2 font-normal text-black"
                >
                  Job Information{' '}
                  <span className="text-error" data-cy="custom-label-required">
                    *
                  </span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please input the job information IDs!',
                },
              ]}
            >
              <Select
                id="talent-acquisition-talent-pool-select-job-information"
                data-cy="talent-acquisition-talent-pool-select-job-information"
                mode="multiple"
                value={
                  Array.isArray(selectedJobInformationIds)
                    ? selectedJobInformationIds
                    : []
                }
                onChange={(value) =>
                  form.setFieldValue('jobInformations', value)
                }
                placeholder={
                  selectedJobInformationItems.length > 0
                    ? ''
                    : 'Select Job Information'
                }
                className="h-8"
                maxTagCount={0}
                maxTagPlaceholder={() => null}
                allowClear
              >
                {jobInformations?.items?.map((jobInformation: any) => (
                  <Select.Option
                    key={jobInformation.id}
                    value={jobInformation.id}
                    id={`talent-acquisition-talent-pool-option-job-${jobInformation.id}`}
                    data-cy={`talent-acquisition-talent-pool-option-job-${jobInformation.id}`}
                  >
                    {jobInformation.jobTitle}
                  </Select.Option>
                ))}
              </Select>

              {selectedJobInformationItems.length > 0 ? (
                <div
                  className="mt-2 flex flex-wrap gap-2"
                  data-cy="talent-acquisition-talent-pool-job-information-selected-chips"
                >
                  {selectedJobInformationItems.map((item) => (
                    <span
                      key={item.id}
                      id={`talent-acquisition-talent-pool-div-job-information-option-${item.id}`}
                      data-cy={`talent-acquisition-talent-pool-chip-job-information-${item.id}`}
                      className="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-sm text-gray-800"
                    >
                      <span
                        data-cy={`talent-acquisition-talent-pool-chip-job-information-text-${item.id}`}
                      >
                        {item.jobTitle}
                      </span>
                      <CloseOutlined
                        role="button"
                        tabIndex={0}
                        aria-label="Remove job information"
                        className="cursor-pointer text-xs text-gray-400 hover:text-gray-600"
                        onClick={() => removeJobInformation(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            removeJobInformation(item.id);
                          }
                        }}
                      />
                    </span>
                  ))}
                </div>
              ) : null}
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default TransferTalentPoolToCandidateModal;
