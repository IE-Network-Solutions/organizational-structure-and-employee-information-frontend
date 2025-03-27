import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import {
  useSetIncentiveFormula,
  useUpdateIncentiveFormula,
} from '@/store/server/features/incentive/other/mutation';
import {
  useIncentiveCriteria,
  useIncentiveFormulaByRecognitionId,
} from '@/store/server/features/incentive/other/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Button, Col, Form, Input, Radio, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { RadioChangeEvent } from 'antd/lib';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

const plainOptions = ['Fixed', 'Formula'];
type Params = {
  id: string;
};

interface IncentiveSettingsDrawerProps {
  recognitionData: any;
}

const IncentiveSettingsDrawer: React.FC<IncentiveSettingsDrawerProps> = ({
  recognitionData,
}) => {
  const [form] = Form.useForm();
  const { id } = useParams<Params>();

  const recognitionId = id;

  //   ===========> UI States <============

  const {
    formula,
    value,
    setValue,
    setFormula,
    openIncentiveDrawer,
    setIncentiveId,
    incentiveId,
    setOpenIncentiveDrawer,
  } = useIncentiveStore();

  //   ===========> HTTP Requests <============

  const { data: incentiveData } = useIncentiveCriteria();
  const { mutate: updateIncentiveFormula } = useUpdateIncentiveFormula();

  const { mutate: createFormula } = useSetIncentiveFormula();

  const { data: formulaById } =
    useIncentiveFormulaByRecognitionId(recognitionId);

  //   ===========> Functions <============

  const handleClose = () => {
    setOpenIncentiveDrawer(false);
    setValue('');
    setIncentiveId('');
    form.resetFields();
  };

  const handleRadioChange = ({ target: { value } }: RadioChangeEvent) => {
    setValue(value);
  };

  useEffect(() => {
    if (formulaById) {
      setFormula(formulaById?.expression);
    }
  }, [formulaById, form]);

  const handleOptionClick = (id: string, name: string, type: string) => {
    if (name === 'Clear') {
      setFormula([]);
      return;
    }
    if (type === 'criteria' || type === 'operand') {
      setFormula([...formula, { id, name, type }]);
    }
  };

  const handleSubmit = () => {
    const formValues = form.getFieldsValue();

    const cleanedExpression = formula
      .map((item: any) =>
        item.type === 'criteria' ? `"${item.id}"` : item.name,
      )
      .join(' ');

    const formdata = {
      recognitionTypeId: recognitionId,
      expression: value === 'Fixed' ? null : JSON.stringify(cleanedExpression),
      isComputed: value === 'Fixed' ? false : true,
      monetizedValue: value === 'Fixed' ? formValues?.fixedAmount : 0,
    };

    if (
      incentiveId &&
      formulaById !== null &&
      (formulaById?.expression || formulaById?.monetizedValue) &&
      (formulaById?.expression?.length || formulaById?.monetizedValue) > 0
    ) {
      updateIncentiveFormula(
        {
          id: formulaById?.id,
          data: formdata,
        },
        {
          onSuccess: () => {
            setOpenIncentiveDrawer(false);
          },
        },
      );
    } else {
      createFormula(formdata, {
        onSuccess: () => {
          setOpenIncentiveDrawer(false);
          setFormula([]);
        },
      });
    }
  };

  //   ===========> Static Data <============

  const options = {
    operand: [
      { id: 1, name: '+' },
      { id: 2, name: '-' },
      { id: 3, name: '/' },
      { id: 4, name: '*' },
      { id: 5, name: '(' },
      { id: 6, name: ')' },
      { id: 7, name: 'Clear' },
    ],
  };

  useEffect(() => {
    if (openIncentiveDrawer) {
      form.setFieldsValue({ fixedAmount: formulaById?.monetizedValue || '' });
    }
  }, [openIncentiveDrawer, formulaById]);
  useEffect(() => {
    setValue(value);
  }, [value]);
  return (
    <CustomDrawerLayout
      open={openIncentiveDrawer}
      onClose={handleClose}
      modalHeader={
        <CustomDrawerHeader className="flex justify-center ">
          {recognitionData?.recognitionType?.name || '-'}
        </CustomDrawerHeader>
      }
      footer={null}
      width="600px"
    >
      <Form
        requiredMark={false}
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
      >
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
        {(value === null || value === '' || value === 'Fixed') && (
          <Form.Item
            rules={[{ required: true, message: 'Please enter amount' }]}
            label={
              <span className="font-bold">
                Amount <span className="text-red-500">*</span>
              </span>
            }
            name="fixedAmount"
            initialValue={formulaById?.monetizedValue}
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
              value={
                formula && formula.length > 0
                  ? typeof formula === 'string'
                    ? JSON.parse(formula)
                    : Array.isArray(formula)
                      ? formula?.map((item: any) => item?.name).join(' ')
                      : ''
                  : ''
              }
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
                    <span className="flex flex-wrap my-1">
                      {incentiveData?.items ? (
                        incentiveData?.items?.map((option: any) => (
                          <div key={option?.id}>
                            {option?.criterionKey && (
                              <Button
                                onClick={() =>
                                  handleOptionClick(
                                    option?.id,
                                    option?.criterionKey,
                                    'criteria',
                                  )
                                }
                                className="bg-[#F8F8F8] text-[#111827] border-none text-sm font-normal m-1 rounded-2xl"
                              >
                                <div className="flex flex-wrap items-center justify-center">
                                  <span className="text-md font-md">
                                    {option?.criterionKey}
                                  </span>
                                </div>
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 m-1">
                          No Criterion
                        </span>
                      )}
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
                          key={option?.id}
                          onClick={() =>
                            handleOptionClick(
                              option?.id,
                              option?.name,
                              'operand',
                            )
                          }
                          className="bg-primary text-white border-none text-sm font-normal m-1 rounded-2xl"
                        >
                          {option?.name}
                        </Button>
                      ))}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>
          </Form.Item>
        )}

        <Form.Item className="">
          <div className="flex justify-center  w-full px-6 py-6 gap-6 my-3">
            <Button
              onClick={handleClose}
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
            >
              Cancel
            </Button>

            <Button
              htmlType="submit"
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12  border-none"
            >
              {formulaById?.expression === null ? (
                <span>Create</span>
              ) : (
                <span>Edit</span>
              )}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default IncentiveSettingsDrawer;
