// pages/login.js
'use client';
import React, { useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    setLoading(true);
    try {
    } catch (error) {}
  };

  return (
    <div style={{ maxWidth: 300, margin: '0 auto', padding: '50px 0' }}>
      <h2>Login</h2>
      <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
