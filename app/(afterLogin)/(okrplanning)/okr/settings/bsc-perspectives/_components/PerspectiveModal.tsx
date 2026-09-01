'use client';

import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  useCreateBscPerspective,
  useUpdateBscPerspective,
} from '@/store/server/features/bsc/mutation';

const { TextArea } = Input;

export default function PerspectiveModal() {
  const [form] = Form.useForm();
  const {
    perspectiveModalOpen,
    editingPerspective,
    closePerspectiveModal,
  } = useBscUiStore();
  const createPerspective = useCreateBscPerspective();
  const updatePerspective = useUpdateBscPerspective();

  useEffect(() => {
    if (!perspectiveModalOpen) return;
    if (editingPerspective) {
      form.setFieldsValue({
        name: editingPerspective.name,
        description: editingPerspective.description || '',
      });
    } else {
      form.resetFields();
    }
  }, [perspectiveModalOpen, editingPerspective, form]);

  const handleClose = () => {
    form.resetFields();
    closePerspectiveModal();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
    };
    if (editingPerspective) {
      await updatePerspective.mutateAsync({
        id: editingPerspective.id,
        input: payload,
      });
    } else {
      await createPerspective.mutateAsync(payload);
    }
    handleClose();
  };

  const saving = createPerspective.isLoading || updatePerspective.isLoading;

  return (
    <Modal
      open={perspectiveModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={520}
      closeIcon={<CloseOutlined />}
      title={editingPerspective ? 'Edit Perspective' : 'Add Perspective'}
      destroyOnClose
      data-cy="bsc-perspective-modal"
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, whitespace: true, message: 'Name is required' },
          ]}
        >
          <Input
            placeholder="e.g. Customer"
            className="h-10"
            data-cy="bsc-perspective-name"
          />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="What this perspective covers"
            data-cy="bsc-perspective-description"
          />
        </Form.Item>
        <div className="flex justify-end gap-3 pt-2">
          <CustomButton
            type="default"
            title="Cancel"
            onClick={handleClose}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            title={editingPerspective ? 'Save' : 'Add Perspective'}
            onClick={handleSubmit}
            loading={saving}
            className="h-10 px-6 rounded-lg"
            data-cy="bsc-perspective-submit"
          />
        </div>
      </Form>
    </Modal>
  );
}
