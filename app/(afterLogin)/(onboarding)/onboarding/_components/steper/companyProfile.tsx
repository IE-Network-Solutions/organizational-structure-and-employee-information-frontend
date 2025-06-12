'use client';
import React, { useEffect } from 'react';
import { Input, Form, Upload, Select } from 'antd';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { useCompanyProfile } from '@/store/uistate/features/organizationStructure/companyProfile/useStore';
import Image from 'next/image';
import { UploadFile } from 'antd/es/upload/interface';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';

import { FormInstance } from 'antd/lib';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface CompanyProfileProps {
  form: FormInstance;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ form }) => {
  const {
    companyProfileImage,
    companyName,
    companyDomainName,
    companyStamp,
    setCompanyStamp,
    setCompanyProfile,
    setCompanyName,
    setCompanyDomainName,
  } = useCompanyProfile();

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFileChange = (info: any) => {
    const fileList = info.fileList as UploadFile<any>[];
    if (fileList.length > 0) {
      setCompanyProfile(fileList[0]);
    } else {
      setCompanyProfile(undefined);
    }
  };
  const handleStampChange = (info: any) => {
    const fileList = info.fileList as UploadFile<any>[];
    if (fileList.length > 0) {
      setCompanyStamp(fileList[0]);
    } else {
      setCompanyStamp(undefined);
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

  const domainNameSuffix = (
    <Form.Item name="suffix" noStyle>
      <p style={{ width: 'auto' }}>.selamnew.com</p>
    </Form.Item>
  );

  const tenantId = useAuthenticationStore.getState().tenantId;

  const { data: companyInfo } = useGetCompanyProfileByTenantId(tenantId);

  useEffect(() => {
    if (companyInfo) {
      const domainName = companyInfo?.domainName?.replace('.selamnew.com', '');
      form.setFieldsValue({
        companyName: companyInfo?.companyName,
        companyDomainName: domainName,
      });
      setCompanyName(companyInfo?.companyName || '');
      setCompanyDomainName(domainName || '');
    }
  }, [companyInfo, form, setCompanyName, setCompanyDomainName]);

  useEffect(() => {
    const domainName = companyDomainName?.replace('.selamnew.com', '');
    form.setFieldsValue({
      companyName: companyName,
      companyDomainName: domainName,
    });
  }, [companyName, companyDomainName, form]);

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
            <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}> 
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item name="companyDomainName" label="Company Domain name" rules={[{ required: true }]}> 
              <Input addonAfter={domainNameSuffix} placeholder="companydomain" disabled />
            </Form.Item>

            <Form.Item name="companyEmail" label="Company Email" rules={[{ required: true }]}> 
              <Input placeholder="Company Email" />
            </Form.Item>

            <Form.Item name="companyPhone" label="Company Phone" rules={[{ required: true }]}> 
              <Input placeholder="Company Phone" />
            </Form.Item>

            <Form.Item name="companyCountry" label="Company Country" rules={[{ required: true }]}> 
              <Input placeholder="Country" />
            </Form.Item>

            <Form.Item name="companyRegion" label="Company Region" rules={[{ required: true }]}> 
              <Input placeholder="Region" />
            </Form.Item>

            <Form.Item name="contactPersonName" label="Contact Person Name" rules={[{ required: true }]}> 
              <Input placeholder="Contact Name" />
            </Form.Item>

            <Form.Item name="contactPersonPhone" label="Contact Person Phone" rules={[{ required: true }]}> 
              <Input placeholder="Contact Phone" />
            </Form.Item>

            <Form.Item name="contactPersonEmail" label="Contact Person Email" rules={[{ required: true }]}> 
              <Input placeholder="Contact Email" />
            </Form.Item>

            <Form.Item name="industry" label="Industry" rules={[{ required: true }]}> 
              <Select placeholder="Add or select your preferred industry" showSearch allowClear />
            </Form.Item>
          </div>

          <Form.Item name="companySize" label="Size of your company" rules={[{ required: true }]}> 
            <div className="mt-2 w-full">
              <p>Select the range of people you have in your company</p>
              {/* Use custom slider or radio group depending on design */}
            </div>
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
