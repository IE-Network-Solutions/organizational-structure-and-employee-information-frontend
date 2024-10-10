import React, { useEffect } from 'react';
import { Button, Input, Form } from 'antd';
import './styles.css';
import { useStep2Store } from '@/store/uistate/features/organizationStructure/comanyInfo/useStore';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';
import { FormInstance, RadioChangeEvent } from 'antd/lib';
import useStepStore from '@/store/uistate/features/organizationStructure/steper/useStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import RadioButtonGroup from '../radioGroup';

interface IndustrySelectProps {
  form: FormInstance;
}

const IndustrySelect: React.FC<IndustrySelectProps> = ({ form }) => {
  const { companyInfo, setCompanyInfo } = useStep2Store();

  const domainNameSuffix = (
    <Form.Item name="suffix" noStyle>
      <p style={{ width: 'auto' }}>.selamnew.com</p>
    </Form.Item>
  );
  const tenantId = useAuthenticationStore.getState().tenantId;

  const { data: companyProfile } = useGetCompanyProfileByTenantId(tenantId);
  useEffect(() => {
    const domainName = companyProfile?.domainName?.replace('.selamnew.com', '');
    form.setFieldsValue({
      domainName: domainName,
    });
  }, [form, companyProfile]);
  const handleInputChange = (field: string, value: any) => {
    const updatedInfo = { ...companyInfo, [field]: value };
    setCompanyInfo(updatedInfo);
  };

  const { nextStep } = useStepStore();

  const radioOptionsCompanySize = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-100', label: '51-100' },
    { value: '101-200', label: '101-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' },
  ];
  const radioOptionsForIndustry = [
    { value: 'IT Company', label: 'IT Company' },
    { value: 'E-Commerce', label: 'E-Commerce' },
    { value: 'Fintech', label: 'Fintech' },
    { value: 'Health Tech', label: 'Health Tech' },
    { value: 'Software Outsourcing', label: 'Software Outsourcing' },
    { value: 'Other', label: 'Other' },
  ];
  return (
    <div className="flex-1 bg-gray-50 p-8 rounded-lg h-full my-8 items-center">
      <div className="bg-white p-8 rounded-lg h-full">
        <Form form={form} layout="vertical" initialValues={companyInfo}>
          <Form.Item
            id="domainName"
            name="domainName"
            label="Domain Name"
            className={'font-bold text-xl mt-4 sm:text-sm'}
            initialValue="ienetworksolutions.selamnew.com"
          >
            <Input
              disabled={true}
              size="large"
              addonAfter={domainNameSuffix}
              className={'h-12 w-full font-normal text-sm mt-2'}
              placeholder="Company Domain Name"
            />
          </Form.Item>

          <Form.Item
            name="businessSize"
            label="What is the size of your company?"
            className={'font-bold text-xl mt-4'}
            rules={[
              { required: true, message: 'Please select your company size!' },
            ]}
          >
            <RadioButtonGroup
              options={radioOptionsCompanySize}
              value={companyInfo.businessSize}
              onChange={(e: RadioChangeEvent) =>
                handleInputChange('businessSize', e.target.value)
              }
            />
          </Form.Item>
          <Form.Item
            name="industry"
            label="What is your industry?"
            className={'font-bold text-xl'}
            rules={[
              { required: true, message: 'Please select your industry!' },
            ]}
          >
            <RadioButtonGroup
              options={radioOptionsForIndustry}
              value={companyInfo.industry}
              onChange={(e: RadioChangeEvent) =>
                handleInputChange('industry', e.target.value)
              }
            />
          </Form.Item>
          {companyInfo.industry == 'Other' && (
            <Form.Item
              name="preferredIndustry"
              label="Input Your Preferred Industry"
              className={'font-bold text-xl mt-4'}
            >
              <Input
                className={'h-12 font-normal text-sm mt-2'}
                size="large"
                placeholder="Enter your preferred industry"
                onChange={(e) =>
                  handleInputChange('preferredIndustry', e.target.value)
                }
              />
            </Form.Item>
          )}

          <div className="text-center">
            <Button
              onClick={() => nextStep()}
              name="skipButton"
              type="link"
              htmlType="button"
            >
              Skip
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default IndustrySelect;
