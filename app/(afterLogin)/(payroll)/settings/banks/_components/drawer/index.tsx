import React from 'react';
import { Form, Input } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomButton from '@/components/common/buttons/customButton';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';

const Drawer: React.FC = () => {
  const { isDrawerVisible, closeDrawer } = useDrawerStore();

  const onFinish = async () => {};

  return (
      <CustomDrawerLayout
      data-cy="payroll-bank-drawer-view-component"
        open={isDrawerVisible}
        onClose={closeDrawer}
        modalHeader={
          <span
            id="payroll-bank-drawer-header-view-text"
            data-cy="payroll-bank-drawer-header-view-text"
            className="text-xl font-semibold"
          >
            New Bank Information
          </span>
        }
        width="700px"
        footer={
          <div
            id="payroll-bank-drawer-footer-view-container"
            data-cy="payroll-bank-drawer-footer-view-container"
            className="flex justify-center items-center w-full h-full"
          >
            <div
              id="payroll-bank-drawer-footer-actions-view-container"
              data-cy="payroll-bank-drawer-footer-actions-view-container"
              className="flex justify-between items-center gap-4"
            >
              <CustomButton
                id="payroll-bank-drawer-cancel-click-button"
                data-cy="payroll-bank-drawer-cancel-click-button"
                type="default"
                title="Cancel"
                onClick={() => {
                  closeDrawer();
                }}
              />
              <CustomButton
                id="payroll-bank-drawer-create-click-button"
                data-cy="payroll-bank-drawer-create-click-button"
                title="Create"
                onClick={() => {
                  // form.submit()
                }}
              />
            </div>
          </div>
        }
      >
        <Form
          id="payroll-bank-drawer-form-submit-form"
          data-cy="payroll-bank-drawer-form-submit-form"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            id="payroll-bank-drawer-fullname-view-formitem"
            data-cy="payroll-bank-drawer-fullname-view-formitem"
            label="Full Name"
            name="name"
          >
            <Input
              id="payroll-bank-drawer-fullname-view-input"
              data-cy="payroll-bank-drawer-fullname-view-input"
              placeholder="Abraham Dulla"
              className="h-12"
            />
          </Form.Item>

          <Form.Item
            id="payroll-bank-drawer-shortform-view-formitem"
            data-cy="payroll-bank-drawer-shortform-view-formitem"
            label="Short Form"
            name="short-form"
          >
            <Input
              id="payroll-bank-drawer-shortform-view-input"
              data-cy="payroll-bank-drawer-shortform-view-input"
              type="text"
              placeholder="short form"
              className="h-12"
            />
          </Form.Item>

          <Form.Item
            id="payroll-bank-drawer-contact-branch-view-formitem"
            data-cy="payroll-bank-drawer-contact-branch-view-formitem"
            label="Contact Branch"
            name="contact-branch"
          >
            <Input
              id="payroll-bank-drawer-contact-branch-view-input"
              data-cy="payroll-bank-drawer-contact-branch-view-input"
              type="text"
              placeholder="Contact Branch"
              className="h-12"
            />
          </Form.Item>

          <Form.Item
            id="payroll-bank-drawer-address-view-formitem"
            data-cy="payroll-bank-drawer-address-view-formitem"
            label="Address"
            name="address"
          >
            <Input
              id="payroll-bank-drawer-address-view-input"
              data-cy="payroll-bank-drawer-address-view-input"
              type="text"
              placeholder="10"
              className="w-full h-12"
            ></Input>
          </Form.Item>
          <Form.Item
            id="payroll-bank-drawer-email-view-formitem"
            data-cy="payroll-bank-drawer-email-view-formitem"
            label="Email"
            name="email"
          >
            <Input
              id="payroll-bank-drawer-email-view-input"
              data-cy="payroll-bank-drawer-email-view-input"
              type="email"
              placeholder="10"
              className="w-full h-12"
            ></Input>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
  );
};

export default Drawer;
