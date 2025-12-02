'use client';

import Image from 'next/image';
import {
  Upload,
  Form,
  Input,
  Select,
  Skeleton,
  notification,
  Button,
} from 'antd';
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
  const {
    data: client,
    isLoading: isClientLoading,
    error,
  } = useGetClientById(DEFAULT_TENANT_ID);

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
          billingEmail: clientData.billingEmail,
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
          billingEmail: values.billingEmail,
        };

        await updateClientMutation.mutateAsync({
          id: clientData.id,
          data: updateData,
        });

        notification.success({
          message: 'Success',
          description: 'Profile information updated successfully',
        });
      } catch (error) {
        notification.error({
          message: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update profile information',
        });
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <Form
        id="profile-form"
        data-cy="profile-form"
        form={form}
        layout="vertical"
        initialValues={{ prefix: '1' }}
        onFinish={handleFormSubmit}
      >
        <h2 id="company-information-title" data-cy="company-information-title" className="text-2xl font-bold mb-6">Company information</h2>

        <div id="logo-upload-label" data-cy="logo-upload-label" className="mb-4">
          <span id="logo-upload-label-text" data-cy="logo-upload-label-text" className="text-sm font-medium">
            Upload Company Logo
            <span className="text-red-500" id="logo-upload-label-text-asterisk" data-cy="logo-upload-label-text-asterisk">*</span>
          </span>
        </div>

        <Dragger id="logo-upload" data-cy="logo-upload" {...uploadProps} className="!h-[200px]">
          <div id="logo-upload-content" data-cy="logo-upload-content" className="flex flex-col items-center justify-center gap-2">
            {clientData?.logo && logoExists ? (
              <Image
                id="logo-preview"
                data-cy="logo-preview"
                src={clientData.logo}
                alt="Company Logo"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : (
              <Image
                id="logo-placeholder"
                data-cy="logo-placeholder"
                src="/icons/gallery-add.svg"
                alt="Upload"
                width={40}
                height={40}
                className="mb-4"
              />
            )}
            <p id="logo-upload-text" data-cy="logo-upload-text" className="text-lg font-medium">Upload Company Logo</p>
            <p id="logo-upload-hint" data-cy="logo-upload-hint" className="text-gray-500">or drag and drop it here</p>
            <p id="logo-upload-size" data-cy="logo-upload-size" className="text-gray-500 text-sm">Square 300 x 300 px</p>
          </div>
        </Dragger>

        <div id="company-information-fields" data-cy="company-information-fields" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
          <Form.Item
            id="company-name-field"
            data-cy="company-name-field"
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input id="company-name-input" data-cy="company-name-input" placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            id="company-email-field"
            data-cy="company-email-field"
            name="companyEmail"
            label="Company Email"
            rules={[
              { required: true, message: 'Please enter company email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input id="company-email-input" data-cy="company-email-input" placeholder="Enter company email" />
          </Form.Item>

          <Form.Item
            id="country-field"
            data-cy="country-field"
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select country' }]}
          >
            <Select
              id="country-select"
              data-cy="country-select"
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
                <Option key={country.code} value={country.code} id={`country-option-${country.code}`} data-cy={`country-option-${country.code}`}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            id="region-field"
            data-cy="region-field"
            name="region"
            label="Region"
            rules={[{ required: true, message: 'Please enter region' }]}
          >
            <Input id="region-input" data-cy="region-input" placeholder="Enter region" />
          </Form.Item>

          <Form.Item
            id="company-phone-field"
            data-cy="company-phone-field"
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
            <Input id="company-phone-input" data-cy="company-phone-input" placeholder="Enter company phone (e.g. +61-2-8765-4321)" />
          </Form.Item>

          <Form.Item
            id="billing-email-field"
            data-cy="billing-email-field"
            name="billingEmail"
            label="Billing Email"
            rules={[
              { required: true, message: 'Please enter billing email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input id="billing-email-input" data-cy="billing-email-input" placeholder="Enter billing email" />
          </Form.Item>
        </div>

        <div id="stamp-upload-label" data-cy="stamp-upload-label" className="mb-4">
          <span className="text-sm font-medium" id="stamp-upload-label-text" data-cy="stamp-upload-label-text">
            Upload Company Stamp
            <span className="text-red-500" id="stamp-upload-label-text-asterisk" data-cy="stamp-upload-label-text-asterisk">*</span>
          </span>
        </div>

        <Dragger id="stamp-upload" data-cy="stamp-upload" {...uploadProps} className="!h-[200px]">
          <div id="stamp-upload-content" data-cy="stamp-upload-content" className="flex flex-col items-center justify-center gap-2">
            {clientData?.stamp && stampExists ? (
              <Image
                id="stamp-preview"
                data-cy="stamp-preview"
                src={clientData.stamp}
                alt="Company Stamp"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : (
              <Image
                id="stamp-placeholder"
                data-cy="stamp-placeholder"
                src="/icons/gallery-add.svg"
                alt="Upload"
                width={40}
                height={40}
                className="mb-4"
              />
            )}
            <p id="stamp-upload-text" data-cy="stamp-upload-text" className="text-lg font-medium">Upload Company Stamp</p>
            <p id="stamp-upload-hint" data-cy="stamp-upload-hint" className="text-gray-500">or drag and drop it here</p>
            <p id="stamp-upload-size" data-cy="stamp-upload-size" className="text-gray-500 text-sm">Square 300 x 300 px</p>
          </div>
        </Dragger>

        <h2 id="contact-information-title" data-cy="contact-information-title" className="text-2xl font-bold mt-6 mb-6">Contact information</h2>

        <div id="contact-information-fields" data-cy="contact-information-fields" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
          <Form.Item id="contact-person-name-field" data-cy="contact-person-name-field" name="contactPersonName" label="Contact Person Name">
            <Input id="contact-person-name-input" data-cy="contact-person-name-input" placeholder="Enter contact person name" />
          </Form.Item>

          <Form.Item
            id="person-email-field"
            data-cy="person-email-field"
            name="personEmail"
            label="Person Email"
            rules={[
              { required: true, message: 'Please enter person email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input id="person-email-input" data-cy="person-email-input" placeholder="Enter person email" />
          </Form.Item>

          <Form.Item
            id="person-phone-field"
            data-cy="person-phone-field"
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
            <Input id="person-phone-input" data-cy="person-phone-input" placeholder="Enter person phone (e.g. +61-2-8765-4321)" />
          </Form.Item>
        </div>

        <Form.Item id="save-button-field" data-cy="save-button-field">
          <Button
            id="save-changes-button"
            data-cy="save-changes-button"
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
    <div id="admin-profile-page" data-cy="admin-profile-page" className="h-auto w-auto px-6 py-6">
      <div id="admin-profile-container" data-cy="admin-profile-container" className="bg-white p-[25px_35px] mt-6 rounded-lg max-w-[800px]">
        {isLoading || isClientLoading ? (
          <div
            id="admin-profile-loading"
            data-cy="admin-profile-loading"
            className="flex justify-center items-center max-w-[800px]"
            style={{ margin: '25px 35px' }}
          >
            <Skeleton active paragraph={{ rows: 10 }} data-cy="admin-profile-loading-skeleton" />
          </div>
        ) : (
          <>
            <ProfileForm data-cy="admin-profile-form" />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
