'use client';

import {
  Upload,
  Form,
  Input,
  Select,
  Skeleton,
  notification,
  Button,
} from 'antd';
import { countries } from '@/utils/countries';
import { useEffect } from 'react';
import { useGetClientById } from '@/store/server/features/tenant-management/clients/queries';
import { useUpdateClient } from '@/store/server/features/tenant-management/clients/mutation';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import type { UpdateClientDto } from '@/store/server/features/tenant-management/clients/mutation';
import { useUpdateCompanyProfileWithStamp } from '@/store/server/features/organizationStructure/companyProfile/mutation';
import type { UploadFile } from 'antd/es/upload/interface';
import { useCompanyProfile } from '@/store/uistate/features/organizationStructure/companyProfile/useStore';

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
  const isLoading = useCompanyProfile((state) => state.isLoading);
  const setIsLoading = useCompanyProfile((state) => state.setIsLoading);
  const clientData = useCompanyProfile((state) => state.clientData);
  const setClientData = useCompanyProfile((state) => state.setClientData);
  const logoExists = useCompanyProfile((state) => state.logoExists);
  const setLogoExists = useCompanyProfile((state) => state.setLogoExists);
  const stampExists = useCompanyProfile((state) => state.stampExists);
  const setStampExists = useCompanyProfile((state) => state.setStampExists);

  // Fetch client data using the existing query hook
  const {
    data: client,
    isLoading: isClientLoading,
    error,
    refetch: refetchClient,
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
      } else {
        setLogoExists(false);
      }

      if (client.stamp) {
        checkImageExists(client.stamp).then(setStampExists);
      } else {
        setStampExists(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  useEffect(() => {
    if (client) {
      // Only update if the client data has actually changed
      const currentClientId = clientData?.id;
      if (currentClientId !== client.id || !clientData) {
        setClientData(client);
      }
      if (isLoading) {
        setIsLoading(false);
      }
    } else if (error) {
      notification.error({
        message: 'Error loading client data',
        description: 'Failed to load company profile information',
      });
      if (isLoading) {
        setIsLoading(false);
      }
    } else if (!isClientLoading && isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, error, isClientLoading]);

  const customRequest = ({ file, onSuccess, onError }: any) => {
    // Validate file
    if (!file) {
      onError(new Error('No file provided'));
      return;
    }

    // Ensure file is a File object
    const fileObj = file.originFileObj || file;

    if (!(fileObj instanceof File)) {
      onError(new Error('Invalid file type'));
      return;
    }

    // Simulate upload success (actual upload happens on form submit)
    setTimeout(() => {
      onSuccess('ok', fileObj);
    }, 0);
  };

  // Component with profile form
  const ProfileForm = ({
    onUpdateSuccess,
  }: {
    onUpdateSuccess: () => void;
  }) => {
    // Form initialization here is only when the component is actually rendered
    const [form] = Form.useForm();

    // Zustand store hooks for form state - using selectors to prevent unnecessary re-renders
    const submitting = useCompanyProfile((state) => state.submitting);
    const setSubmitting = useCompanyProfile((state) => state.setSubmitting);
    const logoFileList = useCompanyProfile((state) => state.logoFileList);
    const setLogoFileList = useCompanyProfile((state) => state.setLogoFileList);
    const stampFileList = useCompanyProfile((state) => state.stampFileList);
    const setStampFileList = useCompanyProfile(
      (state) => state.setStampFileList,
    );
    const logoPreview = useCompanyProfile((state) => state.logoPreview);
    const setLogoPreview = useCompanyProfile((state) => state.setLogoPreview);
    const stampPreview = useCompanyProfile((state) => state.stampPreview);
    const setStampPreview = useCompanyProfile((state) => state.setStampPreview);
    const resetAll = useCompanyProfile((state) => state.resetAll);
    const storeClientData = useCompanyProfile((state) => state.clientData);
    const dataVersion = useCompanyProfile((state) => state.dataVersion);
    const incrementDataVersion = useCompanyProfile(
      (state) => state.incrementDataVersion,
    );

    // Hook to update client data
    const updateClientMutation = useUpdateClient();
    const updateCompanyProfileMutation = useUpdateCompanyProfileWithStamp();

    // Note: We don't reset file lists on clientData change to avoid infinite loops
    // Files are only cleared after successful form submission

    // Filling the form with data when mounting the component
    useEffect(() => {
      if (storeClientData) {
        form.setFieldsValue({
          companyName: storeClientData.companyName,
          companyEmail: storeClientData.companyEmail,
          country: storeClientData.country,
          region: storeClientData.region,
          companyPhone: storeClientData.phoneNumber,
          contactPersonName: storeClientData.contactPersonName,
          personEmail: storeClientData.contactPersonEmail,
          personPhone: storeClientData.contactPersonPhoneNumber,
          billingEmail: storeClientData.billingEmail,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeClientData?.id]);

    const handleFormSubmit = async (values: any) => {
      if (!storeClientData?.id) {
        notification.error({
          message: 'Error',
          description: 'Client ID not found',
        });
        return;
      }

      setSubmitting(true);

      try {
        const updateData: UpdateClientDto = {
          id: storeClientData.id,
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

        const logoFile = logoFileList.length > 0 ? logoFileList[0] : null;
        const stampFile = stampFileList.length > 0 ? stampFileList[0] : null;

        // Check if files exist and have proper File objects
        const hasLogo = logoFile?.originFileObj instanceof File;
        const hasStamp = stampFile?.originFileObj instanceof File;

        if (hasLogo || hasStamp) {
          // Create CompanyProfileImage objects (omitting status and percent)
          const logoImage =
            hasLogo && logoFile
              ? {
                  uid: logoFile.uid,
                  name: logoFile.name,
                  size: logoFile.size,
                  type: logoFile.type,
                  originFileObj: logoFile.originFileObj as File,
                  thumbUrl: logoFile.thumbUrl,
                  url: logoFile.url,
                }
              : undefined;

          const stampImage =
            hasStamp && stampFile
              ? {
                  uid: stampFile.uid,
                  name: stampFile.name,
                  size: stampFile.size,
                  type: stampFile.type,
                  originFileObj: stampFile.originFileObj as File,
                  thumbUrl: stampFile.thumbUrl,
                  url: stampFile.url,
                }
              : undefined;

          // Wait for mutation to complete
          await updateCompanyProfileMutation.mutateAsync({
            id: storeClientData.id,
            updateClientDto: updateData,
            companyProfileImage: logoImage as any,
            companyStamp: stampImage as any,
          });
        } else {
          await updateClientMutation.mutateAsync({
            id: storeClientData.id,
            data: updateData,
          });
        }

        // Clear file lists and previews after successful submission
        resetAll();

        // Increment data version to bust image cache
        incrementDataVersion();

        notification.success({
          message: 'Success',
          description: 'Profile information updated successfully',
        });

        // Wait a bit for server to process images, then refetch
        // This ensures the server has time to process and save the images
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Refetch client data to get updated images
        await onUpdateSuccess();

        // Re-check image existence after refetch
        // This will be handled by the useEffect in the parent component
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

    const handleLogoChange = (info: any) => {
      const { fileList, file } = info;

      // Handle file removal
      if (fileList.length === 0) {
        if (logoPreview) {
          URL.revokeObjectURL(logoPreview);
        }
        setLogoFileList([]);
        setLogoPreview(undefined);
        return;
      }

      // Get the latest file from the list
      const latestFileItem = fileList[fileList.length - 1];

      // Extract the actual File object - check multiple possible locations
      let actualFile: File | undefined;

      if (file?.originFileObj instanceof File) {
        actualFile = file.originFileObj;
      } else if (file instanceof File) {
        actualFile = file;
      } else if (latestFileItem?.originFileObj instanceof File) {
        actualFile = latestFileItem.originFileObj;
      } else if (latestFileItem?.raw instanceof File) {
        actualFile = latestFileItem.raw;
      }

      // Create UploadFile object with proper structure
      const fileWithOrigin: UploadFile = {
        uid: latestFileItem.uid || `logo-${Date.now()}`,
        name: latestFileItem.name || actualFile?.name || 'logo',
        status: latestFileItem.status || 'done',
        ...latestFileItem,
        originFileObj: actualFile,
      };

      // Only keep the latest file (maxCount is 1)
      setLogoFileList([fileWithOrigin]);

      // Handle preview
      if (actualFile) {
        if (logoPreview) {
          URL.revokeObjectURL(logoPreview);
        }
        const previewUrl = URL.createObjectURL(actualFile);
        setLogoPreview(previewUrl);
      }
    };

    const handleStampChange = (info: any) => {
      const { fileList, file } = info;

      // Handle file removal
      if (fileList.length === 0) {
        if (stampPreview) {
          URL.revokeObjectURL(stampPreview);
        }
        setStampFileList([]);
        setStampPreview(undefined);
        return;
      }

      // Get the latest file from the list
      const latestFileItem = fileList[fileList.length - 1];

      // Extract the actual File object - check multiple possible locations
      let actualFile: File | undefined;

      if (file?.originFileObj instanceof File) {
        actualFile = file.originFileObj;
      } else if (file instanceof File) {
        actualFile = file;
      } else if (latestFileItem?.originFileObj instanceof File) {
        actualFile = latestFileItem.originFileObj;
      } else if (latestFileItem?.raw instanceof File) {
        actualFile = latestFileItem.raw;
      }

      // Create UploadFile object with proper structure
      const fileWithOrigin: UploadFile = {
        uid: latestFileItem.uid || `stamp-${Date.now()}`,
        name: latestFileItem.name || actualFile?.name || 'stamp',
        status: latestFileItem.status || 'done',
        ...latestFileItem,
        originFileObj: actualFile,
      };

      // Only keep the latest file (maxCount is 1)
      setStampFileList([fileWithOrigin]);

      // Handle preview
      if (actualFile) {
        if (stampPreview) {
          URL.revokeObjectURL(stampPreview);
        }
        const previewUrl = URL.createObjectURL(actualFile);
        setStampPreview(previewUrl);
      }
    };

    useEffect(() => {
      return () => {
        if (logoPreview) {
          URL.revokeObjectURL(logoPreview);
        }
        if (stampPreview) {
          URL.revokeObjectURL(stampPreview);
        }
      };
    }, [logoPreview, stampPreview]);

    return (
      <Form
        id="profile-form"
        data-cy="profile-form"
        form={form}
        layout="vertical"
        initialValues={{ prefix: '1' }}
        onFinish={handleFormSubmit}
      >
        <h2
          id="company-information-title"
          data-cy="company-information-title"
          className="text-2xl font-bold mb-6"
        >
          Company information
        </h2>

        <div
          id="logo-upload-label"
          data-cy="logo-upload-label"
          className="mb-4"
        >
          <span
            id="logo-upload-label-text"
            data-cy="logo-upload-label-text"
            className="text-sm font-medium"
          >
            Upload Company Logo
            <span
              className="text-red-500"
              id="logo-upload-label-text-asterisk"
              data-cy="logo-upload-label-text-asterisk"
            >
              *
            </span>
          </span>
        </div>

        <Dragger
          id="logo-upload"
          data-cy="logo-upload"
          name="logo"
          multiple={false}
          customRequest={customRequest}
          beforeUpload={() => false}
          onChange={handleLogoChange}
          fileList={logoFileList}
          accept="image/*"
          className="!h-[200px]"
        >
          <div
            id="logo-upload-content"
            data-cy="logo-upload-content"
            className="flex flex-col items-center justify-center gap-2"
          >
            {logoPreview ? (
              <img
                id="logo-preview"
                data-cy="logo-preview"

                src={logoPreview}
                alt="Company Logo"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : storeClientData?.logo && logoExists ? (
              <img
                src={`${storeClientData.logo}?v=${dataVersion}`}
                alt="Company Logo"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : (
              <img
                id="logo-placeholder"
                data-cy="logo-placeholder"

                src="/icons/gallery-add.svg"
                alt="Upload"
                width={40}
                height={40}
                className="mb-4"
              />
            )}
            <p
              id="logo-upload-text"
              data-cy="logo-upload-text"
              className="text-lg font-medium"
            >
              Upload Company Logo
            </p>
            <p
              id="logo-upload-hint"
              data-cy="logo-upload-hint"
              className="text-gray-500"
            >
              or drag and drop it here
            </p>
            <p
              id="logo-upload-size"
              data-cy="logo-upload-size"
              className="text-gray-500 text-sm"
            >
              Square 300 x 300 px
            </p>
          </div>
        </Dragger>

        <div
          id="company-information-fields"
          data-cy="company-information-fields"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6"
        >
          <Form.Item
            id="company-name-field"
            data-cy="company-name-field"
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input
              id="company-name-input"
              data-cy="company-name-input"
              placeholder="Enter company name"
            />
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
            <Input
              id="company-email-input"
              data-cy="company-email-input"
              placeholder="Enter company email"
            />
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
                <Option
                  key={country.code}
                  value={country.code}
                  id={`country-option-${country.code}`}
                  data-cy={`country-option-${country.code}`}
                >
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
            <Input
              id="region-input"
              data-cy="region-input"
              placeholder="Enter region"
            />
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
            <Input
              id="company-phone-input"
              data-cy="company-phone-input"
              placeholder="Enter company phone (e.g. +61-2-8765-4321)"
            />
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
            <Input
              id="billing-email-input"
              data-cy="billing-email-input"
              placeholder="Enter billing email"
            />
          </Form.Item>
        </div>

        <div
          id="stamp-upload-label"
          data-cy="stamp-upload-label"
          className="mb-4"
        >
          <span
            className="text-sm font-medium"
            id="stamp-upload-label-text"
            data-cy="stamp-upload-label-text"
          >
            Upload Company Stamp
            <span
              className="text-red-500"
              id="stamp-upload-label-text-asterisk"
              data-cy="stamp-upload-label-text-asterisk"
            >
              *
            </span>
          </span>
        </div>

        <Dragger
          id="stamp-upload"
          data-cy="stamp-upload"
          name="stamp"
          multiple={false}
          customRequest={customRequest}
          beforeUpload={() => false}
          onChange={handleStampChange}
          fileList={stampFileList}
          accept="image/*"
          className="!h-[200px]"
        >
          <div
            id="stamp-upload-content"
            data-cy="stamp-upload-content"
            className="flex flex-col items-center justify-center gap-2"
          >
            {stampPreview ? (
              <img
                id="stamp-preview"
                data-cy="stamp-preview"

                src={stampPreview}
                alt="Company Stamp"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : storeClientData?.stamp && stampExists ? (
              <img
                src={`${storeClientData.stamp}?v=${dataVersion}`}
                alt="Company Stamp"
                width={100}
                height={100}
                className="mb-4 rounded-full object-cover"
              />
            ) : (
              <img
                id="stamp-placeholder"
                data-cy="stamp-placeholder"

                src="/icons/gallery-add.svg"
                alt="Upload"
                width={40}
                height={40}
                className="mb-4"
              />
            )}
            <p
              id="stamp-upload-text"
              data-cy="stamp-upload-text"
              className="text-lg font-medium"
            >
              Upload Company Stamp
            </p>
            <p
              id="stamp-upload-hint"
              data-cy="stamp-upload-hint"
              className="text-gray-500"
            >
              or drag and drop it here
            </p>
            <p
              id="stamp-upload-size"
              data-cy="stamp-upload-size"
              className="text-gray-500 text-sm"
            >
              Square 300 x 300 px
            </p>
          </div>
        </Dragger>

        <h2
          id="contact-information-title"
          data-cy="contact-information-title"
          className="text-2xl font-bold mt-6 mb-6"
        >
          Contact information
        </h2>

        <div
          id="contact-information-fields"
          data-cy="contact-information-fields"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6"
        >
          <Form.Item
            id="contact-person-name-field"
            data-cy="contact-person-name-field"
            name="contactPersonName"
            label="Contact Person Name"
            rules={[{ required: true, message: 'Please enter person name' }]}
          >
            <Input
              id="contact-person-name-input"
              data-cy="contact-person-name-input"
              placeholder="Enter contact person name"
            />
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
            <Input
              id="person-email-input"
              data-cy="person-email-input"
              placeholder="Enter person email"
            />
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
            <Input
              id="person-phone-input"
              data-cy="person-phone-input"
              placeholder="Enter person phone (e.g. +61-2-8765-4321)"
            />
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
    <div
      id="admin-profile-page"
      data-cy="admin-profile-page"
      className="h-auto w-auto px-6 py-6"
    >
      <div
        id="admin-profile-container"
        data-cy="admin-profile-container"
        className="bg-white p-[25px_35px] mt-6 rounded-lg max-w-[800px]"
      >
        {isLoading || isClientLoading ? (
          <div
            id="admin-profile-loading"
            data-cy="admin-profile-loading"
            className="flex justify-center items-center max-w-[800px]"
            style={{ margin: '25px 35px' }}
          >
            <Skeleton
              active
              paragraph={{ rows: 10 }}
              data-cy="admin-profile-loading-skeleton"
            />
          </div>
        ) : (
          <>
            <ProfileForm
              data-cy="admin-profile-form"
              onUpdateSuccess={async () => {
                // Refetch and wait for it to complete
                const result = await refetchClient();
                // Update client data in store with fresh data
                if (result.data) {
                  setClientData(result.data);
                  // Re-check image existence with fresh URLs
                  if (result.data.logo) {
                    const checkImageExists = (
                      url: string,
                    ): Promise<boolean> => {
                      if (!isValidImageUrl(url)) return Promise.resolve(false);
                      return new Promise((resolve) => {
                        const img = new globalThis.Image();
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(false);
                        // Add cache busting to ensure fresh image
                        img.src = `${url}?t=${Date.now()}`;
                      });
                    };
                    checkImageExists(result.data.logo).then(setLogoExists);
                  } else {
                    setLogoExists(false);
                  }
                  if (result.data.stamp) {
                    const checkImageExists = (
                      url: string,
                    ): Promise<boolean> => {
                      if (!isValidImageUrl(url)) return Promise.resolve(false);
                      return new Promise((resolve) => {
                        const img = new globalThis.Image();
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(false);
                        // Add cache busting to ensure fresh image
                        img.src = `${url}?t=${Date.now()}`;
                      });
                    };
                    checkImageExists(result.data.stamp).then(setStampExists);
                  } else {
                    setStampExists(false);
                  }
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
