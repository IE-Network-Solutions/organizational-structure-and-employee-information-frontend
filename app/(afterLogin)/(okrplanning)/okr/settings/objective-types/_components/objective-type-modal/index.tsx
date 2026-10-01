'use client';

import CustomButton from '@/components/common/buttons/customButton';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  ObjectiveType,
  useObjectiveTypesStore,
} from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';
import { CloseOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal } from 'antd';
import React, { useEffect, useMemo } from 'react';

interface ObjectiveTypeModalProps {
  open: boolean;
  onClose: () => void;
  objectiveType?: ObjectiveType | null;
}

interface TypeRow {
  name?: string;
  weight?: number | null;
}

const ObjectiveTypeModal: React.FC<ObjectiveTypeModalProps> = ({
  open,
  onClose,
  objectiveType,
}) => {
  const { setSelectedType, addTypes, updateType, types } =
    useObjectiveTypesStore();
  const [form] = Form.useForm();
  const isEdit = Boolean(objectiveType);
  const watchedRows = Form.useWatch('rows', form) as TypeRow[] | undefined;
  const watchedWeight = Form.useWatch('weight', form);

  const existingTotal = useMemo(
    () =>
      types.reduce(
        (sum, t) =>
          objectiveType?.id && t.id === objectiveType.id
            ? sum
            : sum + Number(t.weight || 0),
        0,
      ),
    [types, objectiveType?.id],
  );

  const draftTotal = isEdit
    ? Number(watchedWeight || 0)
    : (watchedRows || []).reduce(
        (sum, row) => sum + Number(row?.weight || 0),
        0,
      );

  const projectedTotal = existingTotal + draftTotal;
  const remaining = Math.max(0, 100 - existingTotal);

  const handleModalClose = () => {
    form.resetFields();
    onClose();
    setSelectedType(null);
  };

  const onFinish = (values: {
    name?: string;
    weight?: number;
    rows?: TypeRow[];
  }) => {
    if (isEdit && objectiveType) {
      const result = updateType(objectiveType.id, {
        name: String(values.name || '').trim(),
        weight: Number(values.weight),
      });

      if (!result.ok) {
        NotificationMessage.warning({
          message: result.message || 'Unable to update objective type',
        });
        return;
      }

      NotificationMessage.success({ message: 'Objective type updated' });
      handleModalClose();
      return;
    }

    const rows = (values.rows || [])
      .map((row) => ({
        name: String(row?.name || '').trim(),
        weight: Number(row?.weight || 0),
      }))
      .filter((row) => row.name || row.weight);

    const result = addTypes(rows);
    if (!result.ok) {
      NotificationMessage.warning({
        message: result.message || 'Unable to save objective types',
      });
      return;
    }

    const nextTotal = existingTotal + rows.reduce((s, r) => s + r.weight, 0);
    NotificationMessage.success({
      message:
        nextTotal === 100
          ? 'Objective types saved — weights total 100%'
          : `Objective types saved — ${100 - nextTotal}% still remaining`,
    });
    handleModalClose();
  };

  useEffect(() => {
    if (!open) return;
    if (objectiveType) {
      form.setFieldsValue({
        name: objectiveType.name,
        weight: objectiveType.weight,
        rows: undefined,
      });
    } else {
      form.setFieldsValue({
        name: undefined,
        weight: undefined,
        rows: [{ name: '', weight: null }],
      });
    }
  }, [objectiveType, form, open]);

  const footer = (
    <div
      className="flex justify-end gap-3 mt-4"
      id="okr-objective-type-modal-footer"
      data-cy="okr-objective-type-modal-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleModalClose}
        className="h-10 px-6 rounded-lg"
        id="okr-objective-type-modal-cancel-button"
        data-cy="okr-objective-type-modal-cancel-button"
      />
      <CustomButton
        title={isEdit ? 'Update' : 'Save'}
        type="primary"
        onClick={() => form.submit()}
        className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2]"
        id="okr-objective-type-modal-submit-button"
        data-cy="okr-objective-type-modal-submit-button"
      />
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      title={
        <span
          className="text-[20px] font-bold text-[#262626]"
          id="okr-objective-type-modal-title"
          data-cy="okr-objective-type-modal-title"
        >
          {isEdit ? 'Edit Objective Type' : 'Add Objective Types'}
        </span>
      }
      footer={footer}
      width={640}
      centered
      destroyOnClose
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="okr-objective-type-modal-close-icon"
        />
      }
      data-cy="okr-objective-type-modal"
      className="okr-settings-modal"
    >
      <Form
        form={form}
        name="objectiveTypeForm"
        layout="vertical"
        onFinish={onFinish}
        id="okr-objective-type-modal-form"
        data-cy="okr-objective-type-modal-form"
      >
        {isEdit ? (
          <>
            <Form.Item
              label="Objective Type"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please enter objective type name',
                },
              ]}
              data-cy="okr-objective-type-modal-name-field"
            >
              <Input
                placeholder="Enter objective type name"
                data-cy="okr-objective-type-modal-name-input"
              />
            </Form.Item>
            <Form.Item
              label="Weight (%)"
              name="weight"
              className="w-full"
              rules={[
                { required: true, message: 'Please enter weight' },
                {
                  type: 'number',
                  min: 1,
                  max: Math.max(remaining, 1),
                  message: `Weight must be between 1 and ${Math.max(remaining, 1)}`,
                },
              ]}
              data-cy="okr-objective-type-modal-weight-field"
            >
              <InputNumber
                className="w-full"
                min={1}
                max={Math.max(remaining, 1)}
                placeholder="Enter weight (%)"
                data-cy="okr-objective-type-modal-weight-input"
              />
            </Form.Item>
          </>
        ) : (
          <Form.List name="rows">
            {(fields, { add, remove }) => (
              <div
                className="flex flex-col gap-3"
                data-cy="okr-objective-type-modal-rows"
              >
                {fields.map(({ key, name, ...restField }, index) => (
                  <div
                    key={key}
                    className="flex gap-2 items-start"
                    data-cy={`okr-objective-type-modal-row-${index}`}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label={index === 0 ? 'Objective Type' : undefined}
                      className="flex-1 mb-0"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter objective type name',
                        },
                      ]}
                      data-cy={`okr-objective-type-modal-row-name-field-${index}`}
                    >
                      <Input
                        placeholder="Enter objective type name"
                        data-cy={`okr-objective-type-modal-row-name-input-${index}`}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'weight']}
                      label={index === 0 ? 'Weight (%)' : undefined}
                      className="w-[120px] mb-0"
                      rules={[
                        { required: true, message: 'Required' },
                        {
                          type: 'number',
                          min: 1,
                          message: 'Min 1',
                        },
                      ]}
                      data-cy={`okr-objective-type-modal-row-weight-field-${index}`}
                    >
                      <InputNumber
                        className="w-full"
                        min={1}
                        max={100}
                        placeholder="%"
                        data-cy={`okr-objective-type-modal-row-weight-input-${index}`}
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        className={index === 0 ? 'mt-7' : 'mt-1'}
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        data-cy={`okr-objective-type-modal-row-remove-${index}`}
                      />
                    )}
                  </div>
                ))}

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ name: '', weight: null })}
                  disabled={projectedTotal >= 100}
                  className="w-full"
                  data-cy="okr-objective-type-modal-add-row-button"
                >
                  Add another type
                </Button>
              </div>
            )}
          </Form.List>
        )}

        <div
          className="mt-4 flex items-center justify-end"
          id="okr-objective-type-modal-info"
          data-cy="okr-objective-type-modal-info"
        >
          <span
            className="whitespace-nowrap text-[12px] tabular-nums text-[#475569] md:text-sm"
            data-cy="okr-objective-type-modal-weight-total"
          >
            <span
              className={`text-[18px] font-extrabold md:text-[20px] ${
                projectedTotal === 100
                  ? 'text-[#059669]'
                  : projectedTotal > 100
                    ? 'text-[#DC2626]'
                    : 'text-[#D97706]'
              }`}
              data-cy="okr-objective-type-modal-weight-value"
            >
              {projectedTotal}
            </span>
            <span
              className="text-[13px] font-medium text-[#94A3B8] md:text-[14px]"
              data-cy="okr-objective-type-modal-weight-max"
            >
              {' '}
              / 100
            </span>
          </span>
        </div>
      </Form>
    </Modal>
  );
};

export default ObjectiveTypeModal;
