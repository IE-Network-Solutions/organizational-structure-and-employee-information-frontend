'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Upload,
  notification,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { CheckOutlined, CloseOutlined, InboxOutlined } from '@ant-design/icons';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { countries } from '@/utils/countries';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { useGetClientById } from '@/store/server/features/tenant-management/clients/queries';
import {
  useUpdateClient,
  type UpdateClientDto,
} from '@/store/server/features/tenant-management/clients/mutation';
import { useUpdateCompanyProfileWithStamp } from '@/store/server/features/organizationStructure/companyProfile/mutation';

const { Dragger } = Upload;

/**
 * Input with addonBefore: 40px row + no clipped prefix.
 * Addon must not shrink in flex layout; affix/main field flexes with min-w-0.
 */
const profilePhoneInputGroupClassName =
  '[&_.ant-input-group]:!flex [&_.ant-input-group]:!items-stretch [&_.ant-input-group]:!w-full ' +
  '[&_.ant-input-group-addon]:!flex [&_.ant-input-group-addon]:!shrink-0 [&_.ant-input-group-addon]:!grow-0 ' +
  '[&_.ant-input-group-addon]:!items-center [&_.ant-input-group-addon]:!justify-center ' +
  '[&_.ant-input-group-addon]:!h-10 [&_.ant-input-group-addon]:!min-h-10 [&_.ant-input-group-addon]:!min-w-[3.5rem] ' +
  '[&_.ant-input-group-addon]:!px-3 [&_.ant-input-group-addon]:!box-border [&_.ant-input-group-addon]:!overflow-visible ' +
  '[&_.ant-input-affix-wrapper]:!min-h-10 [&_.ant-input-affix-wrapper]:!h-10 ' +
  '[&_.ant-input-affix-wrapper]:!min-w-0 [&_.ant-input-affix-wrapper]:!flex-1 ' +
  '[&_.ant-input-group_.ant-input]:!h-10 [&_.ant-input-group_.ant-input]:!min-w-0 [&_.ant-input-group_.ant-input]:!box-border';

const profileSelect40ClassName =
  '[&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selection-search-input]:!h-10 ' +
  '[&_.ant-select-selection-item]:!leading-10 [&_.ant-select-selection-placeholder]:!leading-10';

const AdminProfile = () => {
  const [form] = Form.useForm();
  const [logoForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);

  const {
    data: client,
    isLoading,
    refetch,
  } = useGetClientById(DEFAULT_TENANT_ID);
  const updateClientMutation = useUpdateClient();
  const updateCompanyProfileMutation = useUpdateCompanyProfileWithStamp();

  const profile = useMemo(
    () => ({
      id: client?.id ?? '',
      companyName: client?.companyName ?? '',
      companyDomain: client?.domainName ?? client?.domainUrl ?? '',
      logo: client?.logo ?? '',
      country: client?.country ?? '',
      industry: client?.industry ?? client?.region ?? '',
      fullName: client?.contactPersonName ?? '',
      phone: client?.phoneNumber ?? '',
      email: client?.contactPersonEmail ?? client?.billingEmail ?? '',
    }),
    [client],
  );

  useEffect(() => {
    form.setFieldsValue({
      country: profile.country,
      industry: profile.industry,
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
    });
    logoForm.setFieldsValue({ companyName: profile.companyName });
  }, [profile, form, logoForm]);

  const closeLogoModal = () => {
    setLogoModalOpen(false);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(undefined);
    setLogoFileList([]);
    logoForm.setFieldsValue({ companyName: profile.companyName });
  };

  const handleSaveProfile = async (values: any) => {
    if (!profile.id) return;
    try {
      const payload: UpdateClientDto = {
        country: values.country,
        industry: values.industry,
        contactPersonName: values.fullName,
        phoneNumber: values.phone,
        contactPersonEmail: values.email,
        billingEmail: values.email,
      };
      await updateClientMutation.mutateAsync({ id: profile.id, data: payload });
      setIsEditing(false);
      await refetch();
      notification.success({
        message: 'Updated',
        description: 'Company profile updated successfully.',
      });
    } catch (error) {
      notification.error({
        message: 'Update Failed',
        description:
          error instanceof Error ? error.message : 'Failed to update profile.',
      });
    }
  };

  const handleUpdateLogo = async () => {
    if (!profile.id) return;
    const values = await logoForm.validateFields();
    const logoFile = logoFileList[0]?.originFileObj;

    try {
      if (logoFile instanceof File) {
        await updateCompanyProfileMutation.mutateAsync({
          id: profile.id,
          updateClientDto: { companyName: values.companyName },
          companyProfileImage: { originFileObj: logoFile } as any,
        });
      } else {
        await updateClientMutation.mutateAsync({
          id: profile.id,
          data: { companyName: values.companyName },
        });
      }
      await refetch();
      closeLogoModal();
      notification.success({
        message: 'Updated',
        description: 'Company profile updated successfully.',
      });
    } catch (error) {
      notification.error({
        message: 'Update Failed',
        description:
          error instanceof Error ? error.message : 'Failed to update logo.',
      });
    }
  };

  const logoNode =
    logoPreview || profile.logo ? (
      <img
        data-cy="-afterlogin-admin-profile-page-tsx-page-img-140"
        src={logoPreview || profile.logo}
        alt="Company"
        className="h-24 w-24 rounded object-cover "
      />
    ) : (
      <div
        data-cy="-afterlogin-admin-profile-page-tsx-page-div-146"
        className="h-16 w-16 rounded bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center font-semibold"
      >
        {profile.companyName?.slice(0, 2).toUpperCase() || 'CO'}
      </div>
    );
  const modalLogoPreview = logoPreview || profile.logo || '';

  return (
    <div
      data-cy="-afterlogin-admin-profile-page-tsx-page-div-153"
      className="w-full max-w-[1100px]"
    >
      <div
        data-cy="-afterlogin-admin-profile-page-tsx-page-div-154"
        className="rounded-lg border border-gray-200 bg-white"
      >
        {isLoading ? (
          <div
            data-cy="-afterlogin-admin-profile-page-tsx-page-div-156"
            className="p-6"
          >
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : (
          <>
            <div
              data-cy="-afterlogin-admin-profile-page-tsx-page-div-161"
              className="px-4 py-3 flex items-center justify-between"
            >
              <div
                data-cy="-afterlogin-admin-profile-page-tsx-page-div-162"
                className="flex items-center gap-3"
              >
                <div
                  data-cy="-afterlogin-admin-profile-page-tsx-page-div-163"
                  className="relative shrink-0"
                >
                  {logoNode}
                  <button
                    type="button"
                    onClick={() => setLogoModalOpen(true)}
                    className="absolute -right-2 -bottom-1 h-5 w-5 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-primary shadow-sm transition-colors flex items-center justify-center"
                    data-cy="company-profile-open-logo-modal"
                  >
                    <MdOutlineModeEditOutline size={14} />
                  </button>
                </div>
                <div data-cy="-afterlogin-admin-profile-page-tsx-page-div-174">
                  <div
                    data-cy="-afterlogin-admin-profile-page-tsx-page-div-175"
                    className="text-sm font-medium text-gray-900"
                  >
                    {profile.companyName}
                  </div>
                  <div
                    data-cy="-afterlogin-admin-profile-page-tsx-page-div-178"
                    className="text-xs text-gray-500"
                  >
                    {profile.companyDomain || '__'}
                  </div>
                </div>
              </div>
            </div>
            <div
              data-cy="company-profile-header-divider"
              className="mx-4 border-b border-gray-200"
              aria-hidden
            />

            <Form
              form={form}
              layout="vertical"
              className={
                isEditing
                  ? '[&_.ant-form-item-label]:!pb-3'
                  : '[&_.ant-form-item-label]:!pb-1'
              }
              requiredMark={
                isEditing
                  ? (label: ReactNode, info: { required: boolean }) => (
                      <span
                        data-cy="-afterlogin-admin-profile-page-tsx-page-span-192"
                        className="inline-flex items-center gap-1"
                      >
                        <span data-cy="-afterlogin-admin-profile-page-tsx-page-span-193">
                          {label}
                        </span>
                        {info.required ? (
                          <span
                            data-cy="-afterlogin-admin-profile-page-tsx-page-span-195"
                            className="text-[#FF4D4F]"
                            aria-hidden
                          >
                            *
                          </span>
                        ) : null}
                      </span>
                    )
                  : false
              }
              onFinish={handleSaveProfile}
            >
              <div
                data-cy="-afterlogin-admin-profile-page-tsx-page-div-205"
                className="px-4 py-4"
              >
                <div
                  data-cy="-afterlogin-admin-profile-page-tsx-page-div-206"
                  className="flex justify-end mb-2"
                >
                  {isEditing ? (
                    <div
                      data-cy="-afterlogin-admin-profile-page-tsx-page-div-208"
                      className="flex items-center gap-2"
                    >
                      <Button
                        icon={<CloseOutlined className="text-[#FF4D4F]" />}
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({
                            country: profile.country,
                            industry: profile.industry,
                            fullName: profile.fullName,
                            phone: profile.phone,
                            email: profile.email,
                          });
                          setIsEditing(false);
                        }}
                        data-cy="company-profile-cancel-edit"
                      />
                      <Button
                        icon={<CheckOutlined />}
                        size="small"
                        type="primary"
                        loading={updateClientMutation.isLoading}
                        onClick={() => form.submit()}
                        data-cy="company-profile-save-edit"
                      />
                    </div>
                  ) : (
                    <Button
                      icon={<MdOutlineModeEditOutline />}
                      size="small"
                      onClick={() => setIsEditing(true)}
                      data-cy="company-profile-start-edit"
                    />
                  )}
                </div>
                <div
                  data-cy="-afterlogin-admin-profile-page-tsx-page-div-242"
                  className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3"
                >
                  <Form.Item
                    label={
                      <span
                        data-cy="-afterlogin-admin-profile-page-tsx-page-span-245"
                        className="text-sm font-medium text-[#030712]"
                      >
                        Country
                      </span>
                    }
                    name="country"
                    rules={[{ required: true, message: 'Country is required' }]}
                    className="mb-0"
                  >
                    {isEditing ? (
                      <Select
                        className={profileSelect40ClassName}
                        placeholder="Select"
                        classNames={{
                          popup: {
                            root:
                              '[&_.ant-select-item-option-selected:not(.ant-select-item-option-disabled)]:!bg-[#E6F4FF]',
                          },
                        }}
                        options={countries.map((c) => ({
                          label: c.name,
                          value: c.name,
                        }))}
                      />
                    ) : (
                      <div
                        data-cy="-afterlogin-admin-profile-page-tsx-page-div-263"
                        className="text-base text-gray-800"
                      >
                        {profile.country || '—'}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        data-cy="-afterlogin-admin-profile-page-tsx-page-span-271"
                        className="text-sm font-medium text-[#030712]"
                      >
                        Industry
                      </span>
                    }
                    name="industry"
                    rules={[
                      { required: true, message: 'Industry is required' },
                    ]}
                    className="mb-0"
                  >
                    {isEditing ? (
                      <Input
                        placeholder="Select"
                        styles={{ input: { height: 40 } }}
                        rootClassName="!min-h-10"
                      />
                    ) : (
                      <div
                        data-cy="-afterlogin-admin-profile-page-tsx-page-div-284"
                        className="text-base text-gray-800"
                      >
                        {profile.industry || '—'}
                      </div>
                    )}
                  </Form.Item>

                  <div data-cy="-afterlogin-admin-profile-page-tsx-page-div-290" />

                  <Form.Item
                    label={
                      <span
                        data-cy="-afterlogin-admin-profile-page-tsx-page-span-294"
                        className="text-sm font-medium text-[#030712]"
                      >
                        Full Name
                      </span>
                    }
                    name="fullName"
                    rules={[
                      { required: true, message: 'Full name is required' },
                    ]}
                    className="mb-0"
                  >
                    {isEditing ? (
                      <Input
                        placeholder="Name"
                        styles={{ input: { height: 40 } }}
                        rootClassName="!min-h-10"
                      />
                    ) : (
                      <div
                        data-cy="-afterlogin-admin-profile-page-tsx-page-div-307"
                        className="text-base text-gray-800"
                      >
                        {profile.fullName || '—'}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        data-cy="-afterlogin-admin-profile-page-tsx-page-span-315"
                        className="text-sm font-medium text-[#030712]"
                      >
                        Phone Number
                      </span>
                    }
                    name="phone"
                    rules={[
                      { required: true, message: 'Phone number is required' },
                    ]}
                    className="mb-0 [&_.ant-form-item-control-input-content]:!overflow-visible"
                  >
                    {isEditing ? (
                      <Input
                        addonBefore="+251"
                        placeholder="9876543"
                        styles={{ input: { height: 40 } }}
                        rootClassName={profilePhoneInputGroupClassName}
                      />
                    ) : (
                      <div
                        data-cy="-afterlogin-admin-profile-page-tsx-page-div-332"
                        className="text-base text-gray-800"
                      >
                        {profile.phone || '—'}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        data-cy="-afterlogin-admin-profile-page-tsx-page-span-340"
                        className="text-sm font-medium text-[#030712]"
                      >
                        Email
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Invalid email address' },
                    ]}
                    className="mb-0"
                  >
                    {isEditing ? (
                      <Input
                        placeholder="example.mail.com"
                        styles={{ input: { height: 40 } }}
                        rootClassName="!min-h-10"
                      />
                    ) : (
                      <div
                        data-cy="-afterlogin-admin-profile-page-tsx-page-div-354"
                        className="text-base text-gray-800"
                      >
                        {profile.email || '—'}
                      </div>
                    )}
                  </Form.Item>
                </div>
              </div>
            </Form>
          </>
        )}
      </div>

      <Modal
        open={logoModalOpen}
        onCancel={closeLogoModal}
        footer={null}
        title="Update Logo"
        destroyOnClose
        width={520}
      >
        <div
          data-cy="-afterlogin-admin-profile-page-tsx-page-div-374"
          className="pt-2"
        >
          <Dragger
            multiple={false}
            accept="image/*"
            beforeUpload={() => false}
            fileList={logoFileList}
            onChange={(info) => {
              const fileList = info.fileList.slice(-1);
              setLogoFileList(fileList);
              const file = fileList[0]?.originFileObj;
              if (file instanceof File) {
                if (logoPreview) URL.revokeObjectURL(logoPreview);
                setLogoPreview(URL.createObjectURL(file));
              }
            }}
            className="!rounded-md"
          >
            {modalLogoPreview ? (
              <img
                data-cy="-afterlogin-admin-profile-page-tsx-page-img-392"
                src={modalLogoPreview}
                alt="Current company logo"
                className="mx-auto mb-3 h-16 w-16 rounded object-cover border border-gray-200"
              />
            ) : (
              <InboxOutlined className="text-[44px] text-[#1E40AF] mb-2" />
            )}
            <p
              data-cy="-afterlogin-admin-profile-page-tsx-page-p-400"
              className="text-base text-gray-700 mb-1"
            >
              Click or drag file to this area to upload
            </p>
            <p
              data-cy="-afterlogin-admin-profile-page-tsx-page-p-403"
              className="text-sm text-gray-400"
            >
              Support for a single or bulk upload.
            </p>
          </Dragger>

          <Form
            form={logoForm}
            layout="vertical"
            className="mt-4 [&_.ant-form-item-label]:!pb-3"
            requiredMark={(label: ReactNode, info: { required: boolean }) => (
              <span
                data-cy="-afterlogin-admin-profile-logo-modal-required-wrap"
                className="inline-flex items-center gap-1"
              >
                <span data-cy="-afterlogin-admin-profile-logo-modal-label">
                  {label}
                </span>
                {info.required ? (
                  <span
                    data-cy="-afterlogin-admin-profile-logo-modal-asterisk"
                    className="text-[#FF4D4F]"
                    aria-hidden
                  >
                    *
                  </span>
                ) : null}
              </span>
            )}
          >
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={[{ required: true, message: 'Company name is required' }]}
              className="mb-0"
            >
              <Input
                placeholder="Name"
                rootClassName="[&_.ant-input-affix-wrapper]:!min-h-10"
                styles={{ input: { height: 40 } }}
              />
            </Form.Item>
          </Form>

          <div
            data-cy="-afterlogin-admin-profile-page-tsx-page-div-418"
            className="flex justify-end gap-2 font-normal mt-3"
          >
            <Button
              onClick={closeLogoModal}
              className="font-normal text-[#4d4d4d]"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={updateCompanyProfileMutation.isLoading}
              onClick={handleUpdateLogo}
              data-cy="company-profile-update-logo-submit"
              className="font-normal"
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProfile;
