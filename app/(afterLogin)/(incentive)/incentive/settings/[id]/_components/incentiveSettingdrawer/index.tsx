import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetIncentiveFormula } from '@/store/server/features/incentive/other/mutation';
import { useIncentiveCriteria } from '@/store/server/features/incentive/other/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Button, Col, Form, Input, Radio, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { RadioChangeEvent } from 'antd/lib';
import { useParams } from 'next/navigation';
import React from 'react';

const plainOptions = ['Fixed', 'Formula'];

const IncentiveSettingsDrawer: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams();

  console.log(id, 'this is id ');
  const recognitionId = id;

  //   ===========> UI States <============

  const {
    formula,
    value,
    setValue,
    setFormula,
    openIncentiveDrawer,
    setOpenIncentiveDrawer,
  } = useIncentiveStore();

  //   ===========> HTTP Requests <============

  const { data: incentiveData, isLoading: incentiveResponseLoading } =
    useIncentiveCriteria();

  const { mutate: createFormula, isLoading: submitLoading } =
    useSetIncentiveFormula();

  //   ===========> Functions <============

  const handleClose = () => {
    setOpenIncentiveDrawer(false);
    setValue('');
    setFormula([]);
    form.resetFields();
  };

  const handleRadioChange = ({ target: { value } }: RadioChangeEvent) => {
    setValue(value);
  };

  const handleOptionClick = (value: string) => {
    if (value === 'Clear') {
      setFormula([]);
    } else {
      setFormula([...formula, value]);
    }
  };

  const handleSubmit = () => {
    const cleanedExpression = JSON.stringify(formula);

    const formattedData = {
      recognitionTypeId: recognitionId,
      expression: cleanedExpression.replace(/[\[\],]/g, ''),
    };

    createFormula(formattedData);
  };

  //   ===========> Static Data <============

  const options = {
    criteria: [
      'KPI',
      'Earned Schedule',
      'Budget',
      'Actual Time',
      'Other Criteria',
    ],
    operand: ['+', '-', '/', '*', '(', ')', 'Clear'],
  };
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'small',
      onClick: handleClose,
    },
    {
      label: <span>Create</span>,
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'small',
      onClick: () => form.submit(),
    },
  ];
  return (
    <CustomDrawerLayout
      open={openIncentiveDrawer}
      onClose={handleClose}
      modalHeader={
        <CustomDrawerHeader className="flex justify-center ">
          Rockstar of the week
        </CustomDrawerHeader>
      }
      footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
      width="600px"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          rules={[{ required: true, message: 'Please choose amount' }]}
          label={
            <span className="font-bold">
              Formula <span className="text-red-500">*</span>
            </span>
          }
          name="amountType"
        >
          <Radio.Group
            size="large"
            defaultValue="Fixed"
            options={plainOptions}
            onChange={handleRadioChange}
            value={value}
            className="text-md font-md my-2"
          />
        </Form.Item>
        {(value === null || value === 'Fixed') && (
          <Form.Item
            rules={[{ required: true, message: 'Please choose amount' }]}
            label={
              <span className="font-bold">
                Amount <span className="text-red-500">*</span>
              </span>
            }
            name="fixedAmount"
          >
            <Input
              placeholder="Enter Fixed amount"
              size="large"
              className="text-sm font-md"
            />
          </Form.Item>
        )}
        {value === 'Formula' && (
          <Form.Item
            name="formula"
            label={
              <span className="font-bold">
                Formula <span className="text-red-500">*</span>
              </span>
            }
          >
            <TextArea
              value={formula.join(' ')}
              readOnly
              placeholder="Click criteria and operands to build a formula"
              className="mt-2"
              rows={4}
            />
            <div className="my-5">
              <Row gutter={[16, 10]}>
                <Col xs={24} sm={24} md={13} lg={13} xl={13}>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">
                      Criteria<span className="text-red-500">*</span>
                    </span>
                    <span className="my-1">
                      {incentiveData?.map((option: any) => (
                        <Button
                          key={option?.id}
                          onClick={() => handleOptionClick(option?.name)}
                          className="bg-[#F8F8F8] text-[#111827] border-none text-sm font-normal m-1 rounded-2xl"
                        >
                          <div className="flex flex-wrap items-center justify-center">
                            <span className="text-md font-md ">
                              {option?.name}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </span>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">
                      Operands<span className="text-red-500">*</span>
                    </span>
                    <span className="my-1">
                      {options?.operand.map((option: any) => (
                        <Button
                          key={option}
                          onClick={() => handleOptionClick(option)}
                          className="bg-primary text-white border-none text-sm font-normal m-1 rounded-2xl"
                        >
                          {option}
                        </Button>
                      ))}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>
          </Form.Item>
        )}
      </Form>
    </CustomDrawerLayout>
  );
};

export default IncentiveSettingsDrawer;
