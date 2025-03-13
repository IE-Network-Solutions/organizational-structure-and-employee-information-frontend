'use client';
import React, { useEffect } from 'react';
import { Input, Form, Upload } from 'antd';
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
            id="companyProfileImage"
            name="companyProfileImage"
            label="Company Profile"
            rules={[
              { required: true, message: 'Please Upload company profile!' },
            ]}
            className={'w-full font-bold text-4xl mt-4'}
          >
            <Form.Item
              label="Upload Company Profile Image"
              className="w-full font-normal text-xl mt-4"
            >
              <Form.Item
                name="dragger"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                noStyle
                className="mt-2 w-full font-normal text-xl"
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
                      <p className="ant-upload-text">Upload Company Profile</p>
                      <p className="ant-upload-hint">
                        or drag and drop it here
                      </p>
                      <p className="ant-upload-hint">Square 300 x 300 px</p>
                    </>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
          </Form.Item>
          <Form.Item
            name="companyName"
            label="Company Name"
            initialValue={companyName}
            className="h-12 w-full font-bold text-xl mt-4"
          >
            <Input
              disabled={true}
              size="large"
              className={'mt-2 w-full font-normal text-sm'}
              placeholder="Enter your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="companyDomainName"
            label="Company Domain Name"
            initialValue={companyDomainName}
            className="mt-8 w-full font-bold text-xl"
          >
            <Input
              disabled
              size="large"
              placeholder="Enter your company domain name"
              addonAfter={domainNameSuffix}
              className="mt-2 w-full font-normal text-sm"
              value={companyDomainName}
              onChange={(e) => setCompanyDomainName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            id="companyStamp"
            name="companyStamp"
            label="Company Stamp"
            className={'w-full font-bold text-4xl mt-4'}
          >
            <Form.Item
              label="Upload Company Stamp Image (Optional)"
              className="w-full font-normal text-xl mt-4"
            >
              <Form.Item
                name="dragger"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                noStyle
                className="mt-2 w-full font-normal text-xl"
              >
                <Upload.Dragger
                  name="files"
                  className="mt-2"
                  onChange={handleStampChange}
                  fileList={companyStamp ? [companyStamp] : []}
                  showUploadList={false}
                  accept="image/*"
                  maxCount={1}
                >
                  {companyStamp ? (
                    <div className="mt-4">
                      <Image
                        width={300}
                        height={300}
                        src={getImageUrl(companyStamp)}
                        alt="Uploaded Preview"
                        className="w-full h-auto max-h-64 object-cover rounded-xl"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-5xl flex justify-center text-primary">
                        <AiOutlineCloudUpload />
                      </p>
                      <p className="ant-upload-text">Upload Company stamp</p>
                      <p className="ant-upload-hint">
                        or drag and drop it here
                      </p>
                      <p className="ant-upload-hint">Square 300 x 300 px</p>
                    </>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
          </Form.Item>
          <div className="flex justify-start items-center gap-2 text-gray-400 mt-8">
            We will create a unique URL for you to log into Selamnew Workspace
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CompanyProfile;
