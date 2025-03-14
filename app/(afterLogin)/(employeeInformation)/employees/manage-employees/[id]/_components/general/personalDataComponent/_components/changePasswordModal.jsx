import React from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import { useModalStore } from '@/store/uistate/features/authentication/changePasswordModal';

const ChangePasswordModal = () => {
  const {
    isModalOpen,
    closeModal,
    error,
    setError,
    success,
    setSuccess,
    loading,
    setLoading,
  } = useModalStore();
  const [form] = Form.useForm();

  const handleChangePassword = async (values) => {
    setError('');
    setSuccess('');
    setLoading(true); // Start loading

    const { currentPassword, newPassword, confirmNewPassword } = values;

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      setLoading(false); // Stop loading
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in.');

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully!');
      form.resetFields();
      setTimeout(() => {
        setSuccess(''); // Clear success message
        closeModal(); // Close the modal
      }, 1000); // Optional delay for UX
    } catch (err) {
      setError(err.message || 'An error occurred while changing the password.');
    } finally {
      setLoading(false); // Stop loading in both success and error cases
    }
  };

  return (
    <Modal
      title="Change Password"
      visible={isModalOpen}
      onCancel={() => {
        closeModal();
        form.resetFields(); // Reset form on cancel
        setError('');
        setSuccess('');
      }}
      footer={null}
    >
      {error && (
        <Alert
          message="Invalid Cridental"
          type="error"
          showIcon
          className="mb-4"
        />
      )}
      {success && (
        <Alert message={success} type="success" showIcon className="mb-4" />
      )}
      <Form form={form} layout="vertical" onFinish={handleChangePassword}>
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: 'Please enter your current password' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 6, message: 'Password must be at least 6 characters long' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmNewPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match'),
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                closeModal();
                form.resetFields(); // Clear form fields on cancel
                setError('');
                setSuccess('');
              }}
              style={{ marginRight: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading} // Button loading state
            >
              Change Password
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
