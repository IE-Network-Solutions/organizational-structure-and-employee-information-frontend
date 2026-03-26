'use client';

import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { Form, Input, Modal } from 'antd';
import React from 'react';

const createSurvayCategory = () => {
  const {
    openSurveyCategoryModal,
    setOpenSurveyCategoryModal,
    surveyCategoryEditId,
    setSurveyCategoryEditId,
  } = EmployeeSurveyStore();
  return (
    <Modal
      title={
        surveyCategoryEditId ? 'Edit Survey Category' : 'Create Survey Category'
      }
      open={openSurveyCategoryModal}
      onCancel={() => {
        setOpenSurveyCategoryModal(false);
        setSurveyCategoryEditId(null);
      }}
    >
      <Form>
        <Form.Item label="Name" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default createSurvayCategory;
