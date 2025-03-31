'use client';

import Image from 'next/image';
import { Upload, Form, Input, Select, Skeleton, notification, Button } from 'antd';
import type { UploadProps } from 'antd';
import { countries } from '@/utils/countries';
import { useEffect, useState } from 'react';
import { useGetClientById } from '@/store/server/features/tenant-management/clients/queries';
import { useUpdateClient } from '@/store/server/features/tenant-management/clients/mutation';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { Tenant } from '@/types/tenant-management';
import type { UpdateClientDto } from '@/store/server/features/tenant-management/clients/mutation';

const { Dragger } = Upload;
const { Option } = Select;

// Updated regular for phone numbers with hyphenated format support
const phoneRegexUpdated = /^(\+\d{1,3})?[- ]?(\d{1,4}[- ]?){1,5}\d{1,4}$/;

// Function for checking the validity of the image URL
const isValidImageUrl = (url: string | undefined) => {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/) !== null;
};

const AdminProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientData, setClientData] = useState<Tenant | null>(null);
  const [logoExists, setLogoExists] = useState(false);
  const [stampExists, setStampExists] = useState(false);

  // Fetch client data using the existing query hook
  const { data: client, isLoading: isClientLoading, error } = useGetClientById(DEFAULT_TENANT_ID);
  
  // Checking the existence of images
  useEffect(() => {
    const checkImageExists = (url: string): Promise<boolean> => {
      if (!isValidImageUrl(url)) return Promise.resolve(false);
      
      return new Promise((resolve) => {
        const img = new globalThis.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };

    if (client) {
      if (client.logo) {
        checkImageExists(client.logo).then(setLogoExists);
      }
      
      if (client.stamp) {
        checkImageExists(client.stamp).then(setStampExists);
      }
    }
  }, [client]);

  useEffect(() => {
    if (client) {
      setClientData(client);
      setIsLoading(false);
    } else if (error) {
      notification.error({
        message: 'Error loading client data',
        description: 'Failed to load company profile information',
      });
      setIsLoading(false);
    }
  }, [client, error]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
      }
      if (status === 'done') {
      } else if (status === 'error') {
        // console.log(`${info.file.name} file upload failed.`)
      }
    },
    onDrop() {},
  };
  
  // Component with profile form
  const ProfileForm = () => {
    // Form initialization here is only when the component is actually rendered
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    
    // Hook to update client data
    const updateClientMutation = useUpdateClient();
    
    // Filling the form with data when mounting the component
    useEffect(() => {
      if (clientData) {
        form.setFieldsValue({
          companyName: clientData.companyName,
          companyEmail: clientData.companyEmail,
          country: clientData.country,
          region: clientData.region,
          companyPhone: clientData.phoneNumber,
          contactPersonName: clientData.contactPersonName,
          personEmail: clientData.contactPersonEmail,
          personPhone: clientData.contactPersonPhoneNumber,
        });
      }
    }, [form, clientData]);
    
    const handleFormSubmit = async (values: any) => {
      if (!clientData?.id) {
        notification.error({
          message: 'Error',
          description: 'Client ID not found',
        });
        return;
      }
      
      setSubmitting(true);
      
      try {
        const updateData: UpdateClientDto = {
          id: clientData.id,
          companyName: values.companyName,
          companyEmail: values.companyEmail,
          phoneNumber: values.companyPhone,
          country: values.country,
          region: values.region,
          contactPersonName: values.contactPersonName,
          contactPersonEmail: values.personEmail,
          contactPersonPhoneNumber: values.personPhone,
        };
        
        await updateClientMutation.mutateAsync({
          id: clientData.id,
          data: updateData
        });
        
        notification.success({
          message: 'Success',
          description: 'Profile information updated successfully',
        });
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error instanceof Error 
            ? error.message 
            : 'Failed to update profile information',
        });
      } finally {
        setSubmitting(false);
      }
    };
    
    return (
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ prefix: '1' }}
        onFinish={handleFormSubmit}
      >
        <h2 className="text-2xl font-bold mb-6">Company information</h2>

        <div className="mb-4">
          <span className="text-sm font-medium">
            Upload Company Logo
            <span className="text-red-500">*</span>
          </span>
        </div>

        <Dragger {...uploadProps} className="!h-[200px]">
          <div className="flex flex-col items-center justify-center gap-2">
            {clientData?.logo && logoExists ? (
              <Image
                src={clientData.logo}
                alt="Company Logo"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : (
              <Image
                src="/icons/gallery-add.svg"
                alt="Upload"
                width={40}
                height={40}
                className="mb-4"
              />
            )}
            <p className="text-lg font-medium">Upload Company Logo</p>
            <p className="text-gray-500">or drag and drop it here</p>
            <p className="text-gray-500 text-sm">Square 300 x 300 px</p>
          </div>
        </Dragger>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[
              { required: true, message: 'Please enter company name' },
            ]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            name="companyEmail"
            label="Company Email"
            rules={[
              { required: true, message: 'Please enter company email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter company email" />
          </Form.Item>

          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select country' }]}
          >
            <Select
              showSearch
              placeholder="Select country"
              optionFilterProp="children"
              filterOption={(input, option) => {
                if (option && option.children) {
                  return String(option.children)
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {countries.map((country) => (
                <Option key={country.code} value={country.code}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="region"
            label="Region"
            rules={[{ required: true, message: 'Please enter region' }]}
          >
            <Input placeholder="Enter region" />
          </Form.Item>

          <Form.Item
            name="companyPhone"
            label="Company Phone"
            rules={[
              { required: true, message: 'Please enter company phone' },
              {
                pattern: phoneRegexUpdated,
                message:
                  'Please enter a valid phone number (e.g. +61-2-8765-4321)',
              },
            ]}
          >
            <Input placeholder="Enter company phone (e.g. +61-2-8765-4321)" />
          </Form.Item>
        </div>

        <div className="mb-4">
          <span className="text-sm font-medium">
            Upload Company Stamp
            <span className="text-red-500">*</span>
          </span>
        </div>

        <Dragger {...uploadProps} className="!h-[200px]">
          <div className="flex flex-col items-center justify-center gap-2">
            {clientData?.stamp && stampExists ? (
              <Image
                src={clientData.stamp}
                alt="Company Stamp"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : (
              <Image
                src="/icons/gallery-add.svg"
                alt="Upload"
                width={40}
                height={40}
                className="mb-4"
              />
            )}
            <p className="text-lg font-medium">Upload Company Stamp</p>
            <p className="text-gray-500">or drag and drop it here</p>
            <p className="text-gray-500 text-sm">Square 300 x 300 px</p>
          </div>
        </Dragger>

        <h2 className="text-2xl font-bold mt-6 mb-6">
          Contact information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
          <Form.Item name="contactPersonName" label="Contact Person Name">
            <Input placeholder="Enter contact person name" />
          </Form.Item>

          <Form.Item
            name="personEmail"
            label="Person Email"
            rules={[
              { required: true, message: 'Please enter person email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter person email" />
          </Form.Item>

          <Form.Item
            name="personPhone"
            label="Contact Person Phone"
            rules={[
              { required: true, message: 'Please enter Person phone' },
              {
                pattern: phoneRegexUpdated,
                message:
                  'Please enter a valid phone number (e.g. +61-2-8765-4321)',
              },
            ]}
          >
            <Input placeholder="Enter person phone (e.g. +61-2-8765-4321)" />
          </Form.Item>
        </div>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all"
            loading={submitting}
            disabled={submitting}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className="h-auto w-auto px-6 py-6">
      <div className="bg-white p-[25px_35px] mt-6 rounded-lg max-w-[800px]">
        {isLoading || isClientLoading ? (
          <div
            className="flex justify-center items-center max-w-[800px]"
            style={{ margin: '25px 35px' }}
          >
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        ) : (
          <ProfileForm />
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
