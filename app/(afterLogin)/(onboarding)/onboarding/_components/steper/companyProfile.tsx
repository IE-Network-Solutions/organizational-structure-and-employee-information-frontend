'use client';
import React, { useEffect } from 'react';
import { Input, Form, Upload, Select, Slider } from 'antd';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { useCompanyProfile } from '@/store/uistate/features/organizationStructure/companyProfile/useStore';
import Image from 'next/image';
import { UploadFile } from 'antd/es/upload/interface';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';
import { FormInstance } from 'antd/lib';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const { Option } = Select;

interface CompanyProfileProps {
  form: FormInstance;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ form }) => {
  const {
    companyProfileImage,
    setCompanyStamp,
    setCompanyProfile,
    setCompanyName,
    setCompanyDomainName,
  } = useCompanyProfile();

  const handleFileChange = (info: any) => {
    const fileList = info.fileList as UploadFile<any>[];
    if (fileList.length > 0) {
      setCompanyProfile(fileList[0]);
    } else {
      setCompanyProfile(undefined);
    }
  };

  const getImageUrl = (file: UploadFile<any> | undefined) => {
    if (file) {
      if (file.url) {
        return file.url;
      }
      if (file.originFileObj) {
        return URL.createObjectURL(file.originFileObj);
      }
    }
    return '';
  };

  const tenantId = useAuthenticationStore.getState().tenantId;
  const { data: companyInfo } = useGetCompanyProfileByTenantId(tenantId);

  const businessSize: { [key: number]: string } = {
    0: '1-10',
    1: '11-50',
    2: '51-100',
    3: '101-200',
    4: '201-500',
    5: '500+',
  };

  const businessSizeArray = Object.entries(businessSize).map(
    ([key, value]) => ({
      key: Number(key),
      value,
    }),
  );

  const getBusinessSizeIndex = (value: string): number | undefined => {
    return businessSizeArray.find(({ value: v }) => v === value)?.key;
  };

  useEffect(() => {
    if (companyInfo) {
      const domainName = companyInfo.domainName?.replace('.selamnew.com', '');

      form.setFieldsValue({
        companyName: companyInfo.companyName,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.phoneNumber,
        companyCountry: companyInfo.country,
        companyRegion: companyInfo.region,
        contactPersonName: companyInfo.contactPersonName,
        contactPersonEmail: companyInfo.contactPersonEmail,
        contactPersonPhone: companyInfo.contactPersonPhoneNumber,
        companyDomainName: domainName,
        industry: companyInfo.industry,
        businessSize: getBusinessSizeIndex(companyInfo?.businessSize) ?? 0,
      });

      setCompanyName(companyInfo.companyName || '');
      setCompanyDomainName(domainName || '');

      if (companyInfo.logo) {
        setCompanyProfile({
          uid: '1',
          name: 'Company Logo',
          url: companyInfo.logo,
          status: 'done',
        });
      }

      if (companyInfo.stamp) {
        setCompanyStamp({
          uid: '2',
          name: 'Company Stamp',
          url: companyInfo.stamp,
          status: 'done',
        });
      }
    }
  }, [
    companyInfo,
    form,
    setCompanyName,
    setCompanyDomainName,
    setCompanyProfile,
    setCompanyStamp,
  ]);

  return (
    <div className="flex-1 bg-gray-50 p-8 rounded-lg h-full my-8 items-center">
      <div className="bg-white p-8 rounded-lg h-full">
        <Form form={form} layout="vertical">
          <Form.Item
            name="companyProfileImage"
            label="Upload Company Logo"
            rules={[{ required: true, message: 'Please Upload company logo!' }]}
          >
            <Upload.Dragger
              name="files"
              className="mt-2"
              onChange={handleFileChange}
              fileList={companyProfileImage ? [companyProfileImage] : []}
              showUploadList={false}
              accept="image/*"
              maxCount={1}
            >
              {companyProfileImage ? (
                <div className="mt-4">
                  <Image
                    width={300}
                    height={300}
                    src={getImageUrl(companyProfileImage)}
                    alt="Uploaded Preview"
                    className="w-full h-auto max-h-64 object-cover rounded-xl"
                  />
                </div>
              ) : (
                <>
                  <p className="text-5xl flex justify-center text-primary">
                    <AiOutlineCloudUpload />
                  </p>
                  <p className="ant-upload-text">Upload Your Logo</p>
                  <p className="ant-upload-hint">or drag and drop it here</p>
                </>
              )}
            </Upload.Dragger>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item
              name="companyDomainName"
              label="Company Domain name"
              rules={[{ required: true }]}
            >
              <Input
                addonAfter={'.selamnew.com'}
                placeholder="companydomain"
                disabled
              />
            </Form.Item>

            <Form.Item
              name="companyEmail"
              label="Company Email"
              rules={[{ required: true }]}
            >
              <Input placeholder="Company Email" />
            </Form.Item>

            <Form.Item
              name="companyPhone"
              label="Company Phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="Company Phone" />
            </Form.Item>

            <Form.Item
              name="companyCountry"
              label="Company Country"
              rules={[{ required: true }]}
            >
              <Input placeholder="Country" />
            </Form.Item>

            <Form.Item
              name="companyRegion"
              label="Company Region"
              rules={[{ required: true }]}
            >
              <Input placeholder="Region" />
            </Form.Item>

            <Form.Item
              name="contactPersonName"
              label="Contact Person Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Contact Name" />
            </Form.Item>

            <Form.Item
              name="contactPersonPhone"
              label="Contact Person Phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="Contact Phone" />
            </Form.Item>

            <Form.Item
              name="contactPersonEmail"
              label="Contact Person Email"
              rules={[{ required: true }]}
            >
              <Input placeholder="Contact Email" />
            </Form.Item>

            <Form.Item
              name="industry"
              label="Industry Type"
              rules={[
                { required: true, message: 'Please select an industry type' },
              ]}
            >
              <Select placeholder="Select industry type">
                <Option value="" disabled>
                  Please select an industry type
                </Option>
                <Option value="technology">Technology</Option>
                <Option value="finance">Finance</Option>
                <Option value="healthcare">Healthcare</Option>
                <Option value="education">Education</Option>
                <Option value="media">Media & Entertainment</Option>
                <Option value="ecommerce">E-commerce</Option>
                <Option value="government">Government</Option>
                <Option value="non-profit">Non-Profit & NGOs</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="businessSize"
            label="Size of Your Company"
            rules={[{ required: true, message: 'Please select company size' }]}
          >
            <Slider
              min={0}
              max={5}
              step={1}
              marks={businessSize}
              tooltip={{
                formatter: (value?: number) =>
                  value !== undefined ? businessSize[value] : '',
              }}
            />
          </Form.Item>

          <div className="flex justify-start items-center gap-2 text-gray-400 mt-8">
            We will create a unique company URL for you to log into Selamnew
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CompanyProfile;
