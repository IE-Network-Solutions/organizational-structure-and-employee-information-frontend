import { useMoveToTalentPool } from '@/store/server/features/recruitment/candidate/mutation';
import {
  useGetCandidatesForMoveToTalentPool,
  useGetTalentPoolCategory,
} from '@/store/server/features/recruitment/candidate/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Button, Form, Modal, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useMemo, useState } from 'react';

const { Option } = Select;

const candidateIdKey = (id: unknown) => String(id);

const MoveToTalentPool: React.FC = () => {
  const [form] = Form.useForm();
  const [candidateSelectOpen, setCandidateSelectOpen] = useState(false);
  const [candidateSelectFocused, setCandidateSelectFocused] = useState(false);

  const { data: talentPool } = useGetTalentPoolCategory();

  const {
    moveToTalentPoolModal,
    setMoveToTalentPoolModal,
    selectedCandidate,
    setSelectedCandidate,
    setSelectedRowKeys,
  } = useCandidateState();

  const { data: candidatesForPool, isLoading: isCandidatesLoading } =
    useGetCandidatesForMoveToTalentPool(Boolean(moveToTalentPoolModal));

  const createdBy = useAuthenticationStore.getState().userId;

  const { mutate: moveToTalentPool, isLoading } = useMoveToTalentPool();

  const candidateOptionsSource = useMemo(() => {
    const apiItems = candidatesForPool?.items ?? [];
    const selectedArr = Array.isArray(selectedCandidate)
      ? selectedCandidate
      : [];
    const byId = new Map<string, any>();
    for (const item of apiItems) {
      if (item?.id != null) {
        byId.set(candidateIdKey(item.id), item);
      }
    }
    for (const item of selectedArr) {
      if (item?.id != null) {
        byId.set(candidateIdKey(item.id), item);
      }
    }
    return Array.from(byId.values()).sort((a, b) => {
      const an =
        a?.fullName ??
        a?.name ??
        [a?.firstName, a?.lastName].filter(Boolean).join(' ') ??
        '';
      const bn =
        b?.fullName ??
        b?.name ??
        [b?.firstName, b?.lastName].filter(Boolean).join(' ') ??
        '';
      return String(an).localeCompare(String(bn), undefined, {
        sensitivity: 'base',
      });
    });
  }, [candidatesForPool?.items, selectedCandidate]);
 console.log('candidateOptionsSource', candidateOptionsSource);
  useEffect(() => {
    const candidateArray = Array.isArray(selectedCandidate)
      ? selectedCandidate
      : [];
    if (candidateArray.length > 0) {
      form.setFieldsValue({
        jobCandidateInformationId: candidateArray.map((item: any) => item.id),
      });
    }
  }, [selectedCandidate]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((formValues) => {
        const candidateArray = Array.isArray(selectedCandidate)
          ? selectedCandidate
          : [];

        const formattedValues = {
          ...formValues,
          createdBy: createdBy,
          jobCandidateId: candidateArray
            .map((candidate: any) => candidate?.jobCandidate?.[0]?.id)
            .filter(Boolean),
          jobCandidateInformationId: candidateArray.map(
            (candidate: any) => candidate.id,
          ),
        };

        moveToTalentPool(formattedValues, {
          onSuccess: () => {
            form.resetFields();
            setSelectedCandidate([]);
            setSelectedRowKeys([]);
            setMoveToTalentPoolModal(false);
          },
        });
      })
      .catch(() => {
        // Validation errors are displayed by antd Form; no extra handling needed
      });
  };

  const candidateDisplayName = (item: any) =>
    item?.fullName ??
    item?.name ??
    [item?.firstName, item?.lastName].filter(Boolean).join(' ') ??
    String(item?.id ?? '');

  const handleChange = (values: (string | number)[]) => {
    const valueKeys = values.map((v) => candidateIdKey(v));
    const byId = new Map<string, any>();
    for (const item of candidatesForPool?.items ?? []) {
      if (item?.id != null) {
        byId.set(candidateIdKey(item.id), item);
      }
    }
    const prev = Array.isArray(selectedCandidate) ? selectedCandidate : [];
    for (const item of prev) {
      if (item?.id != null) {
        byId.set(candidateIdKey(item.id), item);
      }
    }
    const selectedOptions = valueKeys
      .map((k) => byId.get(k))
      .filter(Boolean);
    setSelectedCandidate(selectedOptions);
  };

  const removeCandidate = (id: unknown) => {
    const candidateArray = Array.isArray(selectedCandidate)
      ? selectedCandidate
      : [];
    const next = candidateArray.filter(
      (c: any) => candidateIdKey(c.id) !== candidateIdKey(id),
    );
    setSelectedCandidate(next);
    form.setFieldsValue({
      jobCandidateInformationId: next.map((c: any) => c.id),
    });
  };

  const handleCancel = () => {
    setMoveToTalentPoolModal(false);
    form.resetFields();
    setSelectedCandidate([]);
    setSelectedRowKeys([]);
  };

  return (
    moveToTalentPoolModal && (
      <Modal
        data-cy="talent-acquisition-move-talent-pool-modal"
        open={moveToTalentPoolModal}
        onCancel={handleCancel}
        footer={null}
        width={705}
        title={
          <div
            id="talent-acquisition-move-talent-pool-div-header"
            data-cy="talent-acquisition-move-talent-pool-div-header"
            className="flex flex-col"
          >
            <span
              className="text-lg font-bold text-gray-900"
              data-cy="talent-acquisition-move-talent-pool-modal-title"
            >
              Move to Talent Pool
            </span>
          </div>
        }
        maskClosable={false}
        destroyOnClose
        styles={{
          body: {
            backgroundColor: '#FFFFFF',
            padding: 32,
          },
        }}
        zIndex={10002}
      >
        <Form
          id="talent-acquisition-move-talent-pool-form"
          data-cy="talent-acquisition-move-talent-pool-form"
          form={form}
          layout="vertical"
          requiredMark={false}
          className="[&_.ant-form-item]:mb-4 [&_.ant-form-item:last-of-type]:mb-0"
        >
          <div
            id="talent-acquisition-move-talent-pool-div-form-container"
            data-cy="talent-acquisition-move-talent-pool-div-form-container"
            className="bg-white border border-[#D9D9D9] rounded-lg -mx-8 sm:mx-0"
          >
            <div
              className="px-3 sm:px-4 py-2"
              data-cy="talent-acquisition-move-talent-pool-form-inner"
            >
              <Form.Item
                id="jobCandidateInformationId"
                data-cy="talent-acquisition-move-talent-pool-form-item-candidates"
                name="jobCandidateInformationId"
                label={
                  <div
                    className="flex items-center justify-between"
                    data-cy="talent-acquisition-move-talent-pool-candidate-label"
                  >
                    <span
                      data-cy="talent-acquisition-move-talent-pool-candidate-label-text"
                      className="text-sm font-medium text-gray-700"
                    >
                      Candidate
                    </span>
                    <span
                      className="text-red-500"
                      aria-hidden
                      data-cy="talent-acquisition-move-talent-pool-candidate-required"
                    >
                      *
                    </span>
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please select at least one candidate',
                  },
                ]}
              >
                <div
                  className="move-talent-pool-candidate-field"
                  data-cy="talent-acquisition-move-talent-pool-candidate-field"
                >
                  <div
                    className="relative w-full"
                    data-cy="talent-acquisition-move-talent-pool-candidate-select-wrap"
                  >
                    <Select
                      id="talent-acquisition-move-talent-pool-select-candidates"
                      data-cy="talent-acquisition-move-talent-pool-select-candidates"
                      mode="multiple"
                      size="large"
                      className="w-full always-show-placeholder"
                      placeholder=""
                      popupClassName="org-structure-branch-select-dropdown"
                      loading={isCandidatesLoading}
                      showSearch
                      optionFilterProp="label"
                      maxTagCount={0}
                      maxTagPlaceholder={() => null}
                      options={candidateOptionsSource.map((item: any) => ({
                        value: item.id,
                        label:
                          candidateDisplayName(item) || candidateIdKey(item.id),
                      }))}
                      onChange={handleChange}
                      onOpenChange={setCandidateSelectOpen}
                      onFocus={() => setCandidateSelectFocused(true)}
                      onBlur={() => setCandidateSelectFocused(false)}
                    />
                    {!candidateSelectOpen && !candidateSelectFocused ? (
                      <span
                        className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-sm text-[#bfbfbf]"
                        data-cy="talent-acquisition-move-talent-pool-candidate-placeholder"
                      >
                        select candidate
                      </span>
                    ) : null}
                  </div>
                  <div
                    className="mt-2 flex flex-wrap gap-2"
                    data-cy="talent-acquisition-move-talent-pool-candidate-chips"
                  >
                    {(Array.isArray(selectedCandidate)
                      ? selectedCandidate
                      : []
                    ).map((item: any) => {
                      const id = item?.id;
                      if (id == null) return null;
                      return (
                        <span
                          key={candidateIdKey(id)}
                          id={`talent-acquisition-move-talent-pool-div-candidate-option-${candidateIdKey(id)}`}
                          data-cy={`talent-acquisition-move-talent-pool-chip-${candidateIdKey(id)}`}
                          className="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-sm text-gray-800"
                        >
                          <span
                            id={`talent-acquisition-move-talent-pool-div-candidate-info-${candidateIdKey(id)}`}
                            data-cy={`talent-acquisition-move-talent-pool-div-candidate-info-${candidateIdKey(id)}`}
                          >
                            {candidateDisplayName(item)}
                          </span>
                          <CloseOutlined
                            role="button"
                            tabIndex={0}
                            aria-label="Remove candidate"
                            className="cursor-pointer text-xs text-gray-400 hover:text-gray-600"
                            onClick={() => removeCandidate(id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                removeCandidate(id);
                              }
                            }}
                          />
                        </span>
                      );
                    })}
                  </div>
                  <style jsx global>{`
                    .move-talent-pool-candidate-field
                      .always-show-placeholder
                      .ant-select-selection-placeholder {
                      display: none !important;
                    }
                  `}</style>
                </div>
              </Form.Item>

              <Form.Item
                id="talentPoolCategoryId"
                data-cy="talent-acquisition-move-talent-pool-form-item-category"
                name="talentPoolCategoryId"
                label={
                  <div
                    className="flex items-center justify-between"
                    data-cy="talent-acquisition-move-talent-pool-category-label"
                  >
                    <span
                      data-cy="talent-acquisition-move-talent-pool-category-label-text"
                      className="text-sm font-medium text-gray-700"
                    >
                      Talent Pool Category
                    </span>
                    <span
                      className="text-red-500"
                      aria-hidden
                      data-cy="talent-acquisition-move-talent-pool-category-required"
                    >
                      *
                    </span>
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please select talent pool category',
                  },
                ]}
              >
                <Select
                  id="talent-acquisition-move-talent-pool-select-category"
                  data-cy="talent-acquisition-move-talent-pool-select-category"
                  size="large"
                  className="w-full"
                  placeholder="Select talent pool category"
                  popupClassName="org-structure-branch-select-dropdown"
                >
                  {talentPool?.items?.map((item: any) => (
                    <Option
                      key={item?.id}
                      value={item?.id}
                      id={`talent-acquisition-move-talent-pool-option-category-${item?.id}`}
                      data-cy={`talent-acquisition-move-talent-pool-option-category-${item?.id}`}
                    >
                      {item?.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                id="reason"
                data-cy="talent-acquisition-move-talent-pool-form-item-reason"
                name="reason"
                label={
                  <div
                    className="flex items-center justify-between"
                    data-cy="talent-acquisition-move-talent-pool-reason-label"
                  >
                    <span
                      data-cy="talent-acquisition-move-talent-pool-reason-label-text"
                      className="text-sm font-medium text-gray-700"
                    >
                      Reason
                    </span>
                    <span
                      className="text-red-500"
                      aria-hidden
                      data-cy="talent-acquisition-move-talent-pool-reason-required"
                    >
                      *
                    </span>
                  </div>
                }
                rules={[
                  { required: true, message: 'Please input your reason' },
                ]}
              >
                <TextArea
                  id="talent-acquisition-move-talent-pool-textarea-reason"
                  data-cy="talent-acquisition-move-talent-pool-textarea-reason"
                  rows={3}
                  placeholder="please provide your reason for moving to the talent pool"
                  className="text-sm"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <div
              id="talent-acquisition-move-talent-pool-div-footer"
              data-cy="talent-acquisition-move-talent-pool-div-footer"
              className="flex justify-end w-full bg-[#fff] px-0 pt-4 gap-3"
            >
              <Button
                id="talent-acquisition-move-talent-pool-button-cancel"
                data-cy="talent-acquisition-move-talent-pool-button-cancel"
                onClick={handleCancel}
                className="flex justify-center text-sm font-medium text-gray-800 bg-white px-3 h-8 hover:border-[#4096FF] border-gray-300 hover:text-[#4096FF]"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                id="talent-acquisition-move-talent-pool-button-continue"
                data-cy="talent-acquisition-move-talent-pool-button-continue"
                type="primary"
                className="flex justify-center text-sm font-medium text-white bg-primary px-3 h-8 border-none hover:bg-[#4096FF]"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
              >
                Continue
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default MoveToTalentPool;
