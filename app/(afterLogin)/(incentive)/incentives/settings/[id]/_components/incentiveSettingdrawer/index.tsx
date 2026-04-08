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
import React, { useEffect, useRef } from 'react';

const plainOptions = ['Fixed', 'Formula'];

interface IncentiveSettingsDrawerProps {
  recognitionData: any;
}

const IncentiveSettingsDrawer: React.FC<IncentiveSettingsDrawerProps> = ({
  recognitionData,
}) => {
  const [form] = Form.useForm();
  const params = useParams();
  const idParam = params?.['id'];
  const recognitionId = Array.isArray(idParam) ? idParam[0] : idParam;


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
    formulaError,
    setFormulaError,
  } = useIncentiveStore();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  //   ===========> HTTP Requests <============

  const { data: incentiveData } = useIncentiveCriteria();
  const { mutate: updateIncentiveFormula, isLoading: updateLoading } =
    useUpdateIncentiveFormula();
  const { mutate: createFormula, isLoading: createLoading } =
    useSetIncentiveFormula();

  const fallbackRecognitionId = recognitionData?.id;

  const {
    data: formulaById,
    isFetching,
    refetch,
  } = useIncentiveFormulaByRecognitionId(
    recognitionId || fallbackRecognitionId,
  );

  //   ===========> Functions <============

  const handleClose = (shouldClear = false) => {
    setOpenIncentiveDrawer(false);
    if (shouldClear) {
      setValue('');
      setIncentiveId('');
      setFormula([]);
      setFormulaError('');
      form.resetFields();
    }
  };

  const handleRadioChange = ({ target: { value } }: RadioChangeEvent) => {
    setValue(value);
  };

  useEffect(() => {
    if (formulaById && (recognitionId || fallbackRecognitionId)) {
      let parsedExpression = [];

      if (formulaById?.expression) {
        try {
          // If expression is a JSON string, parse it
          if (typeof formulaById.expression === 'string') {
            const parsedString = JSON.parse(formulaById.expression);

            // Convert the parsed string back to formula array format
            if (typeof parsedString === 'string') {
              // Split the parsed string and convert to array format
              const parts = parsedString.split(' ').filter(Boolean);

              parsedExpression = parts.map((part: string) => {
                // Remove quotes from criteria IDs
                const cleanPart = part.replace(/"/g, '');

                // Check if it's a criteria ID by finding matching criteria
                const matchingCriteria =
                  recognitionData?.recognitionCriteria?.find(
                    (crit: any) => crit?.criteria?.id === cleanPart,
                  );

                if (matchingCriteria) {
                  return {
                    id: matchingCriteria.criteria.id,
                    name: matchingCriteria.criteria.criteriaName,
                    type: 'criteria',
                  };
                } else {
                  // It's an operand or number
                  return {
                    id: cleanPart,
                    name: cleanPart,
                    type: 'operand',
                  };
                }
              });
            } else {
              parsedExpression = parsedString;
            }
          } else if (Array.isArray(formulaById.expression)) {
            // If it's already an array, use it as is
            parsedExpression = formulaById.expression;
          }
        } catch (error) {
          parsedExpression = [];
        }
      }

      setFormula(parsedExpression);
    } else {
      setFormula([]);
    }
  }, [formulaById, recognitionId, fallbackRecognitionId, recognitionData]);

  const handleOptionClick = (id: string, name: string, type: string) => {
    if (name === 'Clear') {
      setFormula([]);
      if (textAreaRef.current) textAreaRef.current.focus();
      return;
    }
    if (type === 'criteria' || type === 'operand') {
      setFormula([...formula, { id, name, type }]);
      if (textAreaRef.current) textAreaRef.current.focus();
    }
  };

  const handleSubmit = () => {
    // Validate formula if Formula type is selected
    if (value === 'Formula') {
      if (!formula || formula.length === 0) {
        setFormulaError('Formula cannot be empty.');
        return;
      }

      // Convert formula array to string for validation
      const formulaString = Array.isArray(formula)
        ? formula.map((item: any) => item?.name || '').join(' ')
        : '';

      const validationError = validateFormula(formulaString);
      if (validationError) {
        setFormulaError(validationError);
        return;
      }
    }

    // Prevent submission if there are validation errors
    if (formulaError) {
      return;
    }

    const formValues = form.getFieldsValue();

    const cleanedExpression =
      Array.isArray(formula) && formula.length > 0
        ? formula
            .map((item: any) =>
              item?.type === 'criteria' ? `"${item?.id}"` : item?.name,
            )
            .join(' ')
        : '';
    const formdata = {
      recognitionTypeId: recognitionId ?? recognitionData?.id,
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
    if (openIncentiveDrawer && recognitionId) {
      refetch();
    }
  }, [openIncentiveDrawer, recognitionId, refetch]);

  useEffect(() => {
    if (openIncentiveDrawer && !isFetching && formulaById && recognitionId) {
      // Set value and form fields as before
      form.setFieldsValue({ fixedAmount: formulaById?.monetizedValue || '' });
      if (formulaById?.expression) {
        setValue('Formula');
        form.setFieldsValue({ amountType: 'Formula' });
      } else if (formulaById?.monetizedValue) {
        setValue('Fixed');
        form.setFieldsValue({ amountType: 'Fixed' });
      } else {
        setValue('Fixed');
        form.setFieldsValue({ amountType: 'Fixed' });
      }

      // NEW: Set formula from API when opening
      let parsedExpression = [];
      if (formulaById && formulaById?.expression) {
        try {
          if (typeof formulaById.expression === 'string') {
            const parsedString = JSON.parse(formulaById.expression);
            if (typeof parsedString === 'string') {
              const parts = parsedString.split(' ').filter(Boolean);
              parsedExpression = parts.map((part: string) => {
                const cleanPart = part.replace(/"/g, '');
                const matchingCriteria =
                  recognitionData?.recognitionCriteria?.find(
                    (crit: any) => crit?.criteria?.id === cleanPart,
                  );
                if (matchingCriteria) {
                  return {
                    id: matchingCriteria.criteria.id,
                    name: matchingCriteria.criteria.criteriaName,
                    type: 'criteria',
                  };
                } else {
                  return {
                    id: cleanPart,
                    name: cleanPart,
                    type: 'operand',
                  };
                }
              });
            } else {
              parsedExpression = parsedString;
            }
          } else if (Array.isArray(formulaById.expression)) {
            parsedExpression = formulaById.expression;
          }
        } catch (error) {
          parsedExpression = [];
        }
      }
      setFormula(parsedExpression);
    }
  }, [
    openIncentiveDrawer,
    isFetching,
    formulaById,
    recognitionData,
    recognitionId,
  ]);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const allowedOperands = ['+', '-', '*', '/', '(', ')'];
  const allowedCriteria =
    recognitionData?.recognitionCriteria
      ?.map((item: any) => item?.criteria?.criteriaName)
      ?.filter((name: string) => name) || [];

  const validateFormula = (formula: string): string => {
    if (!formula || !formula.trim()) return 'Formula cannot be empty.';

    // Create regex pattern using dynamic criteria names
    const criteriaPattern =
      allowedCriteria?.length > 0
        ? allowedCriteria
            .map((name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|')
        : '';

    const regexPattern = criteriaPattern
      ? `(\\b(?:${criteriaPattern})\\b|\\d+(?:\\.\\d+)?|[()+\\-*/])`
      : '(\\d+(?:\\.\\d+)?|[()+\\-*/])';

    const tokens = formula.match(new RegExp(regexPattern, 'g'));

    if (!tokens || tokens.length === 0) return 'Formula cannot be empty.';

    // Check for invalid characters by removing all valid tokens and seeing if anything remains
    let remainingFormula = formula;

    // Remove all valid criteria
    if (allowedCriteria && allowedCriteria.length > 0) {
      allowedCriteria.forEach((criteria: string) => {
        const criteriaRegex = new RegExp(
          criteria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g',
        );
        remainingFormula = remainingFormula.replace(criteriaRegex, '');
      });
    }

    // Remove all numbers and operators
    remainingFormula = remainingFormula.replace(/\d+(?:\.\d+)?/g, ''); // Remove numbers
    remainingFormula = remainingFormula.replace(/[()+\-*/]/g, ''); // Remove operators
    remainingFormula = remainingFormula.replace(/\s+/g, ''); // Remove all spaces

    // If anything remains, it's invalid
    if (remainingFormula.length > 0) {
      const allowedItems =
        allowedCriteria?.length > 0
          ? `allowed criteria (${allowedCriteria.join(', ')}), numbers, and operators (+, -, *, /, (, ))`
          : 'numbers and operators (+, -, *, /, (, ))';
      return `Formula can only contain ${allowedItems}.`;
    }

    let lastType: 'operand' | 'criteria' | 'open' | 'close' | null = null;
    let balance = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === '(') {
        balance++;
        lastType = 'open';
      } else if (token === ')') {
        balance--;
        if (balance < 0) return 'Unbalanced parentheses.';
        lastType = 'close';
      } else if (
        allowedOperands.includes(token) &&
        token !== '(' &&
        token !== ')'
      ) {
        if (i === 0 || i === tokens.length - 1)
          return 'Formula cannot start or end with an operand.';
        if (lastType === 'operand')
          return 'Consecutive operands are not allowed.';
        lastType = 'operand';
      } else if (allowedCriteria?.includes(token)) {
        if (lastType === 'criteria')
          return 'Consecutive criteria are not allowed.';
        lastType = 'criteria';
      } else if (/^\d+(?:\.\d+)?$/.test(token)) {
        // Handle numbers (integers and decimals)
        if (lastType === 'criteria')
          return 'Consecutive criteria/numbers are not allowed.';
        lastType = 'criteria'; // Treat numbers like criteria for validation purposes
      } else {
        return `Invalid token detected: ${token}`;
      }
    }

    if (balance !== 0) return 'Unbalanced parentheses.';

    return ''; // Valid
  };

  // Live validation effect
  useEffect(() => {
    if (value === 'Formula') {
      if (formula && formula.length > 0) {
        // Convert formula array to string for validation
        const formulaString = Array.isArray(formula)
          ? formula.map((item: any) => item?.name || '').join(' ')
          : '';

        const validationError = validateFormula(formulaString);
        if (validationError) {
          setFormulaError(validationError);
        } else {
          setFormulaError('');
        }
      } else {
        setFormulaError('');
      }
    } else {
      setFormulaError('');
    }
  }, [formula, value, setFormulaError]);

  const operators = ['+', '-', '*', '/', '(', ')'];

  function handleTextAreaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value.replace(/[\r\n]+/g, ' ');
    if (!value.trim()) {
      setFormula([]);
      return;
    }

    // Split by space and operators, keep operators as tokens
    const tokens = value
      .split(/([+\-*/()])/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newFormula = tokens.map((token) => {
      // Check if token matches a criteria name
      const crit = recognitionData?.recognitionCriteria?.find(
        (c: any) => c?.criteria?.criteriaName === token,
      );
      if (crit) {
        return {
          id: crit.criteria.id,
          name: crit.criteria.criteriaName,
          type: 'criteria',
        };
      }
      // If it's an operator
      if (operators.includes(token)) {
        return { id: token, name: token, type: 'operand' };
      }
      // If it's a number
      if (!isNaN(Number(token))) {
        return { id: token, name: token, type: 'operand' };
      }
      // Otherwise, treat as plain text (or ignore)
      return { id: token, name: token, type: 'operand' };
    });

    setFormula(newFormula);
  }

  const getDisplayValue = () => {
    // If formula is a string, return it directly without quotes
    if (typeof formula === 'string') {
      return formula.replace(/"/g, '');
    }

    // If formula is an array, process it
    if (Array.isArray(formula)) {
      return formula
        .map((item: any) => {
          if (item?.type === 'criteria') {
            return item?.name;
          }
          return item?.name;
        })
        .join(' ');
    }

    // If formula is neither string nor array, return empty string
    return '';
  };
  /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const uuidRegex =
    /*  eslint-enable-next-line @typescript-eslint/no-unused-vars */

    /"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/gi;

  /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const uuidNoQuotesRegex =
    /*  eslint-enable-next-line @typescript-eslint/no-unused-vars */

    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

  // 1. Extract all UUIDs (with or without quotes)
  /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
  function extractIds(input: string) {
    /*  eslint-enable-next-line @typescript-eslint/no-unused-vars */

    return input.match(uuidNoQuotesRegex) || [];
  }

  // 2. Clean display text
  /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
  function cleanCriteriaText(input: string) {
    /*  eslint-enable-next-line @typescript-eslint/no-unused-vars */

    // Replace quoted UUIDs with nothing
    let text = input.replace(
      /"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/gi,
      '',
    );
    // Replace unquoted UUIDs followed by a label (e.g., uuid of company) with just the label
    text = text.replace(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\s+([a-zA-Z][^\\s)]*)/gi,
      '$2',
    );
    // Remove any remaining UUIDs
    text = text.replace(uuidNoQuotesRegex, '');
    // Clean up extra spaces and slashes
    text = text.replace(/\s{2,}/g, ' ').trim();
    return text;
  }

  return (
    <CustomDrawerLayout
      data-cy="incentive-settings-drawer"
      open={openIncentiveDrawer}
      onClose={() => handleClose(false)}
      modalHeader={
        <CustomDrawerHeader
          data-cy="incentive-settings-drawer-header"
          className="flex justify-center "
        >
          <span
            id="incentive-settings-drawer-header-text"
            data-cy="incentive-settings-drawer-header-text"
          >
            {recognitionData?.name || '-'}
          </span>
        </CustomDrawerHeader>
      }
      footer={
        <div
          id="incentive-settings-drawer-footer"
          data-cy="incentive-settings-drawer-footer"
          className="flex justify-center  w-full p-4 gap-6"
        >
          <Button
            id="incentive-settings-drawer-cancel-button"
            data-cy="incentive-settings-drawer-cancel-button"
            type="default"
            onClick={() => handleClose(true)}
            className=" p-4 px-10 h-10 "
          >
            Cancel
          </Button>

          <Button
            id="incentive-settings-drawer-submit-button"
            data-cy="incentive-settings-drawer-submit-button"
            htmlType="submit"
            type="primary"
            className="p-4 px-10 h-10"
            onClick={handleSubmit}
            loading={updateLoading || createLoading}
            disabled={formulaError ? true : false}
          >
            {!formulaById ? (
              <span
                id="incentive-settings-drawer-create-text"
                data-cy="incentive-settings-drawer-create-text"
              >
                Create
              </span>
            ) : (
              <span
                id="incentive-settings-drawer-edit-text"
                data-cy="incentive-settings-drawer-edit-text"
              >
                Edit
              </span>
            )}
          </Button>
        </div>
      }
      width="600px"
      customMobileHeight={value === 'Formula' ? '70vh' : '45vh'}
    >
      <Form
        id="incentive-settings-drawer-form"
        data-cy="incentive-settings-drawer-form"
        requiredMark={false}
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          id="incentive-settings-drawer-form-amount-type"
          data-cy="incentive-settings-drawer-form-amount-type"
          rules={[{ required: true, message: 'Please choose type' }]}
          label={
            <span
              id="incentive-settings-drawer-form-amount-type-label"
              data-cy="incentive-settings-drawer-form-amount-type-label"
              className="font-bold mb-2"
            >
              Formula{' '}
              <span
                id="incentive-settings-drawer-form-amount-type-required"
                data-cy="incentive-settings-drawer-form-amount-type-required"
                className="text-red-500"
              >
                *
              </span>
            </span>
          }
          name="amountType"
        >
          <Radio.Group
            id="incentive-settings-drawer-form-amount-type-radio-group"
            data-cy="incentive-settings-drawer-form-amount-type-radio-group"
            size="large"
            defaultValue="Fixed"
            options={plainOptions}
            onChange={handleRadioChange}
            value={value}
            className="text-md font-md "
          />
        </Form.Item>
        {(value === null || value === '' || value === 'Fixed') && (
          <Form.Item
            id="incentive-settings-drawer-form-fixed-amount"
            data-cy="incentive-settings-drawer-form-fixed-amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
            label={
              <span
                id="incentive-settings-drawer-form-fixed-amount-label"
                data-cy="incentive-settings-drawer-form-fixed-amount-label"
                className="font-medium text-sm mb-2"
              >
                Amount{' '}
                <span
                  id="incentive-settings-drawer-form-fixed-amount-required"
                  data-cy="incentive-settings-drawer-form-fixed-amount-required"
                  className="text-red-500"
                >
                  *
                </span>
              </span>
            }
            name="fixedAmount"
            initialValue={formulaById?.monetizedValue}
          >
            <Input
              id="incentive-settings-drawer-form-fixed-amount-input"
              data-cy="incentive-settings-drawer-form-fixed-amount-input"
              placeholder="Enter Fixed amount"
              className="text-sm font-md h-10"
            />
          </Form.Item>
        )}
        {value === 'Formula' && (
          <Form.Item
            id="incentive-settings-drawer-form-formula"
            data-cy="incentive-settings-drawer-form-formula"
            name="formula"
            label={
              <span
                id="incentive-settings-drawer-form-formula-label"
                data-cy="incentive-settings-drawer-form-formula-label"
                className="font-bold"
              >
                Formula{' '}
                <span
                  id="incentive-settings-drawer-form-formula-required"
                  data-cy="incentive-settings-drawer-form-formula-required"
                  className="text-red-500"
                >
                  *
                </span>
              </span>
            }
          >
            <TextArea
              id="incentive-settings-drawer-form-formula-textarea"
              data-cy="incentive-settings-drawer-form-formula-textarea"
              ref={textAreaRef}
              value={getDisplayValue()}
              onChange={handleTextAreaChange}
              placeholder="Type numbers or click criteria and operands to build a formula"
              className="mt-2"
              rows={4}
            />
            {formulaError && (
              <div
                id="incentive-settings-drawer-form-formula-error"
                data-cy="incentive-settings-drawer-form-formula-error"
                style={{ color: 'red', marginTop: 4 }}
              >
                {formulaError}
              </div>
            )}
            <div
              id="incentive-settings-drawer-form-formula-options"
              data-cy="incentive-settings-drawer-form-formula-options"
              className="my-5"
            >
              <Row
                id="incentive-settings-drawer-form-formula-options-row"
                data-cy="incentive-settings-drawer-form-formula-options-row"
                gutter={[16, 10]}
              >
                <Col
                  id="incentive-settings-drawer-form-formula-options-criteria-col"
                  data-cy="incentive-settings-drawer-form-formula-options-criteria-col"
                  xs={12}
                  sm={12}
                  md={13}
                  lg={13}
                  xl={13}
                >
                  <div
                    id="incentive-settings-drawer-form-formula-options-criteria-wrapper"
                    data-cy="incentive-settings-drawer-form-formula-options-criteria-wrapper"
                    className="flex flex-col gap-1"
                  >
                    <span
                      id="incentive-settings-drawer-form-formula-options-criteria-label"
                      data-cy="incentive-settings-drawer-form-formula-options-criteria-label"
                      className="font-bold"
                    >
                      Criteria
                      <span
                        id="incentive-settings-drawer-form-formula-options-criteria-required"
                        data-cy="incentive-settings-drawer-form-formula-options-criteria-required"
                        className="text-red-500"
                      >
                        *
                      </span>
                    </span>
                    <span
                      id="incentive-settings-drawer-form-formula-options-criteria-buttons"
                      data-cy="incentive-settings-drawer-form-formula-options-criteria-buttons"
                      className="flex flex-wrap my-1"
                    >
                      {incentiveData?.items ? (
                        recognitionData?.recognitionCriteria?.map(
                          (option: any) => (
                            <div
                              id={`incentive-settings-drawer-form-formula-options-criteria-item-${option?.id}`}
                              data-cy={`incentive-settings-drawer-form-formula-options-criteria-item-${option?.id}`}
                              key={option?.id}
                            >
                              {option?.criteria?.criteriaName && (
                                <Button
                                  id={`incentive-settings-drawer-form-formula-options-criteria-button-${option?.criteria?.id}`}
                                  data-cy={`incentive-settings-drawer-form-formula-options-criteria-button-${option?.criteria?.id}`}
                                  onClick={() =>
                                    handleOptionClick(
                                      option?.criteria?.id,
                                      option?.criteria?.criteriaName,
                                      'criteria',
                                    )
                                  }
                                  className="bg-[#F8F8F8] text-[#111827] border-none text-sm font-normal m-1 rounded-2xl"
                                >
                                  <div
                                    id={`incentive-settings-drawer-form-formula-options-criteria-button-content-${option?.criteria?.id}`}
                                    data-cy={`incentive-settings-drawer-form-formula-options-criteria-button-content-${option?.criteria?.id}`}
                                    className="flex flex-wrap items-center justify-center"
                                  >
                                    <span
                                      id={`incentive-settings-drawer-form-formula-options-criteria-button-text-${option?.criteria?.id}`}
                                      data-cy={`incentive-settings-drawer-form-formula-options-criteria-button-text-${option?.criteria?.id}`}
                                      className="text-md font-md"
                                    >
                                      {option?.criteria?.criteriaName}
                                    </span>
                                  </div>
                                </Button>
                              )}
                            </div>
                          ),
                        )
                      ) : (
                        <span
                          id="incentive-settings-drawer-form-formula-options-criteria-empty"
                          data-cy="incentive-settings-drawer-form-formula-options-criteria-empty"
                          className="text-sm text-gray-500 m-1"
                        >
                          No Criterion
                        </span>
                      )}
                    </span>
                  </div>
                </Col>
                <Col
                  id="incentive-settings-drawer-form-formula-options-operands-col"
                  data-cy="incentive-settings-drawer-form-formula-options-operands-col"
                  xs={12}
                  sm={12}
                  md={10}
                  lg={10}
                  xl={10}
                >
                  <div
                    id="incentive-settings-drawer-form-formula-options-operands-wrapper"
                    data-cy="incentive-settings-drawer-form-formula-options-operands-wrapper"
                    className="flex flex-col gap-1"
                  >
                    <span
                      id="incentive-settings-drawer-form-formula-options-operands-label"
                      data-cy="incentive-settings-drawer-form-formula-options-operands-label"
                      className="font-bold"
                    >
                      Operands
                      <span
                        id="incentive-settings-drawer-form-formula-options-operands-required"
                        data-cy="incentive-settings-drawer-form-formula-options-operands-required"
                        className="text-red-500"
                      >
                        *
                      </span>
                    </span>
                    <span
                      id="incentive-settings-drawer-form-formula-options-operands-buttons"
                      data-cy="incentive-settings-drawer-form-formula-options-operands-buttons"
                      className="my-1"
                    >
                      {options?.operand.map((option: any) => (
                        <Button
                          id={`incentive-settings-drawer-form-formula-options-operands-button-${option?.id}`}
                          data-cy={`incentive-settings-drawer-form-formula-options-operands-button-${option?.id}`}
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
      </Form>
    </CustomDrawerLayout>
  );
};

export default IncentiveSettingsDrawer;
