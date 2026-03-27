import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  Popconfirm,
  Modal,
  Steps,
  Row,
  Col,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useGetAllCriteria,
  useGetAllRecognitionTypeWithOutCriteria,
  useGetRecognitionTypeById,
} from '@/store/server/features/CFR/recognition/queries';
import { AggregateOperator, ConditionOperator } from '@/types/enumTypes';
import {
  useAddRecognitionType,
  useCreateRecognitionCriteria,
  useUpdateRecognitionWithCriteria,
  useUpdateCriteria,
  useDeleteCriteria,
} from '@/store/server/features/CFR/recognition/mutation';
import {
  useSetIncentiveFormula,
  useUpdateIncentiveFormula,
} from '@/store/server/features/incentive/other/mutation';
import { useIncentiveFormulaByRecognitionId } from '@/store/server/features/incentive/other/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { FaPlus } from 'react-icons/fa';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import cancelIcon from '../../../../../../../public/image/Button.svg';
import Image from 'next/image';
import { GoPencil } from 'react-icons/go';
import {
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

interface RecognitionFormValues {
  id: string;
  name: string;
  description: string;
  isMonetized: boolean;
  criteria?: string[];
  requiresCertification: boolean;
  certificationData?: {
    title: string;
    details: string;
  };
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  parentTypeId?: string | undefined;
  departmentId: string;
  incentiveAmountType?: 'Fixed' | 'Formula';
  incentiveFixedAmount?: number | string;
}

interface CriteriaFormValues {
  criteriaName: string;
  description: string;
}

type FormulaToken = { id: string; name: string; type: string };

const FORMULA_OPERAND_OPTIONS: FormulaToken[] = [
  { id: '1', name: '+', type: 'operand' },
  { id: '2', name: '-', type: 'operand' },
  { id: '3', name: '/', type: 'operand' },
  { id: '4', name: '*', type: 'operand' },
  { id: '5', name: '(', type: 'operand' },
  { id: '6', name: ')', type: 'operand' },
  { id: '7', name: 'Clear', type: 'operand' },
];

const { Option } = Select;
interface PropsData {
  createCategory?: boolean;
  onClose?: any;
}

const RecognitionForm: React.FC<PropsData> = ({
  createCategory = false,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [criteriaForm] = Form.useForm();
  const {
    openRecognitionType,
    setOpenRecognitionType,
    parentRecognitionTypeId,
    setSelectedRecognitionType,
    selectedRecognitionType,
    setTotalWeight,
    totalWeight,
    setOpen,
    open: openModal,
    setParentRecognitionTypeId,
    setOpenModal,
    editType,
    setEditType,
  } = ConversationStore();

  const { isModalVisible, setIsModalVisible } =
    useCustomQuestionTemplateStore();

  const { data: allDepartmentWithData } = useGetDepartmentsWithUsers();
  const { data: criteria } = useGetAllCriteria();
  const { data: recognitionTypeWithOutCriteria } =
    useGetAllRecognitionTypeWithOutCriteria();
  const { data: recognitionTypeById } = useGetRecognitionTypeById(
    selectedRecognitionType,
  );
  const { mutate: createRecognitionType, isLoading: createLoading } =
    useAddRecognitionType();
  // const { mutate: updateRecognitionType, isLoading: updateLoading } =
  //   useUpdateRecognitionType();
  const {
    mutate: updateRecognitionWithCriteria,
    isLoading: updateWithCriteriaLoading,
  } = useUpdateRecognitionWithCriteria();
  const {
    mutate: createRecognitionCriteria,
    isLoading: createCriteriaLoading,
  } = useCreateRecognitionCriteria();
  const { mutate: updateCriteria } = useUpdateCriteria();
  const { mutate: deleteCriteria } = useDeleteCriteria();
  const [selectedCriteria, setSelectedCriteria] = useState<any>([]);
  const { isMobile } = useIsMobile();
  const [pendingNewCriteriaId, setPendingNewCriteriaId] = useState<
    string | null
  >(null);
  const [editingCriteriaId, setEditingCriteriaId] = useState<string | null>(
    null,
  );
  const [editingCriteriaName, setEditingCriteriaName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  const [formulaTokens, setFormulaTokens] = useState<FormulaToken[]>([]);
  const [formulaError, setFormulaError] = useState('');
  const formulaTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const isMonetizedWatch = Form.useWatch('isMonetized', form);
  const isEditingRecognition = selectedRecognitionType !== '';
  const isRecognitionOnlyEdit =
    isEditingRecognition && editType === 'recognition';
  const isFormulaOnlyEdit = isEditingRecognition && editType === 'formula';
  const showFormulaStep =
    !createCategory &&
    (isFormulaOnlyEdit || (!isRecognitionOnlyEdit && !!isMonetizedWatch));

  const { data: formulaById, refetch: refetchFormulaById } =
    useIncentiveFormulaByRecognitionId(
      selectedRecognitionType ? selectedRecognitionType : undefined,
    );

  const { mutate: createIncentiveFormula, isLoading: createFormulaLoading } =
    useSetIncentiveFormula();
  const { mutate: updateIncentiveFormula, isLoading: updateFormulaLoading } =
    useUpdateIncentiveFormula();

  const isWizardOpen =
    openRecognitionType ||
    openModal ||
    parentRecognitionTypeId !== '' ||
    selectedRecognitionType !== '';

  const handleWizardClose = () => {
    form.resetFields();
    onClose?.();
    setOpenRecognitionType(false);
    setOpen(false);
    setParentRecognitionTypeId('');
    setSelectedRecognitionType('');
    setSelectedCriteria([]);
    setTotalWeight(0);
    setPendingNewCriteriaId(null);
    setEditingCriteriaId(null);
    setEditingCriteriaName('');
    setCurrentStep(0);
    setOpenModal(false);
    setFormulaTokens([]);
    setFormulaError('');
    setEditType('');
    form.setFieldsValue({
      incentiveAmountType: 'Fixed',
      incentiveFixedAmount: undefined,
    });
  };

  useEffect(() => {
    if (!isWizardOpen) return;
    setCurrentStep(isFormulaOnlyEdit ? 2 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWizardOpen, isFormulaOnlyEdit]);

  useEffect(() => {
    if (!showFormulaStep && currentStep === 2) {
      setCurrentStep(1);
    }
  }, [showFormulaStep, currentStep]);

  useEffect(() => {
    if (isWizardOpen && selectedRecognitionType) {
      refetchFormulaById();
    }
  }, [isWizardOpen, selectedRecognitionType, refetchFormulaById]);

  const modalHeader = (
    <div
      className="flex justify-start text-xl text-gray-800 p-4"
      data-cy="create-recognition-drawer-header"
      id="createRecognitionDrawerHeader"
    >
      <span data-cy="create-recognition-drawer-header-text">
        {selectedRecognitionType === ''
          ? 'Recognition Category'
          : 'Update Recognition Category'}
      </span>
    </div>
  );

  // This function will calculate the total weight of all criteria
  const calculateTotalWeight = (criteria: any[]) => {
    return criteria.reduce(
      (acc, criterion) => acc + (criterion.weight || 0),
      0,
    );
  };

  // Helper function to distribute weights evenly and ensure they sum to 1
  const distributeWeightsEvenly = (count: number) => {
    if (count === 0) return [];

    const baseWeight = 1 / count;
    const weights = [];
    let remainingWeight = 1;

    for (let i = 0; i < count; i++) {
      if (i === count - 1) {
        // Last item gets the remaining weight to ensure exact sum of 1
        weights.push(parseFloat(remainingWeight.toFixed(2)));
      } else {
        const weight = parseFloat(baseWeight.toFixed(2));
        weights.push(weight);
        remainingWeight -= weight;
      }
    }

    return weights;
  };

  const handleCriteriaChange = (value: Array<string | number>) => {
    const selectedIds = value.map((id) => String(id));
    const noCriterion = selectedIds.length;

    const updatedCriteria = selectedIds.map((id) => {
      const idStr = String(id);
      // Try to find the existing object in selectedCriteria
      const existing = selectedCriteria.find(
        (item: any) => String(item.criteriaId || item.id) === idStr,
      );
      if (existing) return { ...existing };

      // Otherwise, build a new object from the criteria list
      const criteriaObj = criteria.find(
        (item: any) => String(item.id) === idStr,
      );

      // If criteriaObj is not found (newly created criteria), try to get the name from pending criteria
      let criteriaName = criteriaObj?.criteriaName || '';

      // If this is a newly added criteria and we don't have the name yet,
      // we'll set a placeholder that will be updated when the criteria list refreshes
      if (!criteriaName && pendingNewCriteriaId === idStr) {
        criteriaName = 'New Criteria'; // Temporary placeholder
      }

      return {
        criterionKey: criteriaName,
        id: idStr,
        criteriaId: idStr,
        weight: 0, // Will be set below
        operator: null,
        condition: null,
        value: 0,
        active: true,
      };
    });

    // Distribute weights evenly among all criteria
    const weights = distributeWeightsEvenly(noCriterion);
    updatedCriteria.forEach((criterion: any, index: number) => {
      criterion.weight = weights[index];
    });

    setSelectedCriteria(updatedCriteria);

    const updatedTotalWeight = updatedCriteria.reduce(
      (sum, criteria) => sum + criteria.weight,
      0,
    );

    setTotalWeight(updatedTotalWeight);

    // Update form fields while preserving existing values
    form.setFieldsValue({
      recognitionCriteria: updatedCriteria,
      criteria: selectedIds,
    });
  };

  const handleWeightChange = (index: number, newWeight: number) => {
    const clampedWeight = Math.min(Math.max(newWeight, 0), 1); // Clamp the value between 0 and 1
    const updatedCriteria = [...selectedCriteria];
    updatedCriteria[index].weight = clampedWeight;

    // Update selected criteria and recalculate total weight
    setSelectedCriteria(updatedCriteria);
    setTotalWeight(calculateTotalWeight(updatedCriteria));
  };

  const handleEditCriteria = (criteriaItem: any) => {
    setEditingCriteriaId(String(criteriaItem.id));
    setEditingCriteriaName(criteriaItem.criteriaName);
  };

  const handleSaveEdit = (criteriaItem: any) => {
    updateCriteria(
      {
        id: criteriaItem.id,
        criteriaName: editingCriteriaName,
      },
      {
        onSuccess: () => {
          // Update the selectedCriteria to reflect the new name
          const updatedSelectedCriteria = selectedCriteria.map(
            (criteria: any) =>
              criteria.id === criteriaItem.id
                ? { ...criteria, criterionKey: editingCriteriaName }
                : criteria,
          );
          setSelectedCriteria(updatedSelectedCriteria);

          // Update form values
          form.setFieldsValue({
            recognitionCriteria: updatedSelectedCriteria,
          });

          // Reset editing state
          setEditingCriteriaId(null);
          setEditingCriteriaName('');
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setEditingCriteriaId(null);
    setEditingCriteriaName('');
  };

  const handleDeleteCriteria = (criteriaItem: any) => {
    // You can add a confirmation modal here if needed
    Modal.confirm({
      content: (
        <span
          className="text-sm text-gray-950 "
          data-cy="create-recognition-delete-confirm-message"
        >
          Are you sure you want to delete ?
        </span>
      ),
      okText: 'Confirm',
      okButtonProps: {
        className: 'bg-red-500 text-white',
      },
      cancelText: 'Cancel',
      centered: false,
      className: 'custom-delete-modal',
      width: isMobile ? undefined : '20vw',
      height: '10vh',
      style: isMobile
        ? {}
        : {
            top: '28vh',
            left: '64vw',
            right: 0,
            margin: 0,
            transform: 'none',
          },
      onOk() {
        // Delete the criteria from backend
        deleteCriteria(criteriaItem.id, {
          onSuccess: () => {
            // Remove the deleted criteria from selectedCriteria if it was selected
            const updatedSelectedCriteria = selectedCriteria.filter(
              (criteria: any) => criteria.id !== criteriaItem.id,
            );
            setSelectedCriteria(updatedSelectedCriteria);

            // Update form values to remove the deleted criteria
            const currentFormCriteria = form.getFieldValue('criteria') || [];
            const updatedFormCriteria = currentFormCriteria.filter(
              (id: string) => id !== criteriaItem.id,
            );

            // Recalculate total weight
            setTotalWeight(calculateTotalWeight(updatedSelectedCriteria));

            // Update form values
            form.setFieldsValue({
              criteria: updatedFormCriteria,
              recognitionCriteria: updatedSelectedCriteria,
            });
          },
        });
      },
    });
  };

  const commonClass = 'text-xs text-gray-950';
  const getLabel = (text: string) => (
    <span
      className="text-black text-sm "
      data-cy={`create-recognition-${text}-label`}
    >
      {text}
    </span>
  );
  const onFinish = (values: RecognitionFormValues) => {
    if (isFormulaOnlyEdit && selectedRecognitionType) {
      persistIncentiveFormula(selectedRecognitionType, handleWizardClose);
      return;
    }

    const { ...rest } = values;

    const filteredObj = Object.fromEntries(
      Object.entries(rest).filter(([key]) => key !== 'criteria'),
    );
    const finalValues = {
      ...filteredObj,
      parentTypeId:
        parentRecognitionTypeId && parentRecognitionTypeId.length !== 0
          ? parentRecognitionTypeId
          : undefined,
      recognitionCriteria: selectedCriteria.map((criteria: any) => ({
        criteriaId: criteria.criteriaId || criteria.id,
        weight: criteria.weight,
        operator:
          criteria.operator && criteria.operator !== ''
            ? criteria.operator
            : Object.values(AggregateOperator)[0],
        condition:
          criteria.condition && criteria.condition !== ''
            ? criteria.condition
            : Object.values(ConditionOperator)[0],
        value: criteria.value,
        active: criteria.active !== undefined ? criteria.active : true,
      })),
    };

    const handleClose = () => {
      form.resetFields();
      onClose();
      setOpenRecognitionType(false);
      setOpenModal(false);
      setOpen(false);
      setParentRecognitionTypeId('');
      setSelectedRecognitionType('');
      setSelectedCriteria([]);
      setTotalWeight(0);
      setPendingNewCriteriaId(null);
      setEditingCriteriaId(null);
      setEditingCriteriaName('');
    };

    const finishWizard = () => {
      setSelectedRecognitionType('');
      handleClose();
    };

    if (selectedRecognitionType === '') {
      createRecognitionType(finalValues, {
        onSuccess: (data: any) => {
          const newId = data?.id ?? data?.data?.id;
          if (values.isMonetized && newId) {
            persistIncentiveFormula(newId, finishWizard);
          } else {
            finishWizard();
          }
        },
      });
    } else {
      const { ...updatedValues } = finalValues;
      const recognitionId = selectedRecognitionType;
      updateRecognitionWithCriteria(
        {
          ...updatedValues,
          id: recognitionId,
          recognitionCriteria: finalValues.recognitionCriteria,
        },
        {
          onSuccess: () => {
            if (values.isMonetized && !isRecognitionOnlyEdit) {
              persistIncentiveFormula(recognitionId, finishWizard);
            } else {
              finishWizard();
            }
          },
        },
      );
    }
  };

  useEffect(() => {
    if (!recognitionTypeById) return; // Ensure data exists before setting fields

    const criteria = recognitionTypeById.recognitionCriteria || [];
    const totalWeight = criteria.reduce(
      (sum: number, criterion: any) => sum + (criterion.weight || 0),
      0,
    );
    setTotalWeight(totalWeight);
    const updatedData = criteria.map((item: any) => ({
      ...item,
      criterionKey: item.criteria?.criteriaName ?? null,
    }));
    setSelectedCriteria(updatedData);

    form.setFieldsValue({
      parentTypeId: recognitionTypeById.parentTypeId,
      name: recognitionTypeById.name || '',
      description: recognitionTypeById.description || '',
      criteria:
        recognitionTypeById.recognitionCriteria?.map((item: any) =>
          String(item.criteriaId),
        ) || [],
      isMonetized: recognitionTypeById.isMonetized ?? false,
      requiresCertification: recognitionTypeById.requiresCertification ?? false,
      frequency: recognitionTypeById.frequency || '',
      departmentId: recognitionTypeById.departmentId || null,
    });
  }, [recognitionTypeById]);

  useEffect(() => {
    if (!isWizardOpen || !formulaById || !selectedRecognitionType) return;

    const rc = recognitionTypeById?.recognitionCriteria;

    if (formulaById?.expression) {
      form.setFieldsValue({
        incentiveAmountType: 'Formula',
        incentiveFixedAmount: formulaById?.monetizedValue ?? undefined,
      });
    } else if (
      formulaById?.monetizedValue !== undefined &&
      formulaById?.monetizedValue !== null
    ) {
      form.setFieldsValue({
        incentiveAmountType: 'Fixed',
        incentiveFixedAmount: formulaById.monetizedValue,
      });
    }

    let parsedExpression: FormulaToken[] = [];
    if (formulaById?.expression) {
      try {
        if (typeof formulaById.expression === 'string') {
          const parsedString = JSON.parse(formulaById.expression);
          if (typeof parsedString === 'string') {
            const parts = parsedString.split(' ').filter(Boolean);
            parsedExpression = parts.map((part: string) => {
              const cleanPart = part.replace(/"/g, '');
              const matchingCriteria = rc?.find(
                (crit: any) => crit?.criteria?.id === cleanPart,
              );
              if (matchingCriteria) {
                return {
                  id: matchingCriteria.criteria.id,
                  name: matchingCriteria.criteria.criteriaName,
                  type: 'criteria',
                };
              }
              return {
                id: cleanPart,
                name: cleanPart,
                type: 'operand',
              };
            });
          } else {
            parsedExpression = parsedString;
          }
        } else if (Array.isArray(formulaById.expression)) {
          parsedExpression = formulaById.expression;
        }
      } catch {
        parsedExpression = [];
      }
      setFormulaTokens(parsedExpression);
    } else {
      setFormulaTokens([]);
      form.setFieldsValue({
        incentiveAmountType: 'Fixed',
        incentiveFixedAmount: undefined,
      });
    }
  }, [
    isWizardOpen,
    formulaById,
    selectedRecognitionType,
    recognitionTypeById,
    form,
  ]);

  const allowedCriteriaNames = useMemo(
    () =>
      selectedCriteria
        .map((c: any) => c.criterionKey)
        .filter((name: string) => !!name),
    [selectedCriteria],
  );

  const allowedOperands = ['+', '-', '*', '/', '(', ')'];

  const validateFormulaString = (formulaStr: string): string => {
    if (!formulaStr || !formulaStr.trim()) return 'Formula cannot be empty.';

    const criteriaPattern =
      allowedCriteriaNames?.length > 0
        ? allowedCriteriaNames
            .map((name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|')
        : '';

    const regexPattern = criteriaPattern
      ? `(\\b(?:${criteriaPattern})\\b|\\d+(?:\\.\\d+)?|[()+\\-*/])`
      : '(\\d+(?:\\.\\d+)?|[()+\\-*/])';

    const tokens = formulaStr.match(new RegExp(regexPattern, 'g'));

    if (!tokens || tokens.length === 0) return 'Formula cannot be empty.';

    let remainingFormula = formulaStr;

    if (allowedCriteriaNames && allowedCriteriaNames.length > 0) {
      allowedCriteriaNames.forEach((criteria: string) => {
        const criteriaRegex = new RegExp(
          criteria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'g',
        );
        remainingFormula = remainingFormula.replace(criteriaRegex, '');
      });
    }

    remainingFormula = remainingFormula.replace(/\d+(?:\.\d+)?/g, '');
    remainingFormula = remainingFormula.replace(/[()+\-*/]/g, '');
    remainingFormula = remainingFormula.replace(/\s+/g, '');

    if (remainingFormula.length > 0) {
      const allowedItems =
        allowedCriteriaNames?.length > 0
          ? `allowed criteria (${allowedCriteriaNames.join(', ')}), numbers, and operators (+, -, *, /, (, ))`
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
      } else if (allowedCriteriaNames?.includes(token)) {
        if (lastType === 'criteria')
          return 'Consecutive criteria are not allowed.';
        lastType = 'criteria';
      } else if (/^\d+(?:\.\d+)?$/.test(token)) {
        if (lastType === 'criteria')
          return 'Consecutive criteria/numbers are not allowed.';
        lastType = 'criteria';
      } else {
        return `Invalid token detected: ${token}`;
      }
    }

    if (balance !== 0) return 'Unbalanced parentheses.';

    return '';
  };

  const incentiveAmountTypeWatch = Form.useWatch('incentiveAmountType', form);

  useEffect(() => {
    if (incentiveAmountTypeWatch !== 'Formula') {
      return;
    }
    if (formulaTokens && formulaTokens.length > 0) {
      const formulaString = formulaTokens
        .map((item: FormulaToken) => item?.name || '')
        .join(' ');
      setFormulaError(validateFormulaString(formulaString));
    } else {
      setFormulaError('');
    }
  }, [formulaTokens, incentiveAmountTypeWatch, allowedCriteriaNames]);

  const getFormulaDisplayValue = () =>
    Array.isArray(formulaTokens)
      ? formulaTokens.map((item) => item?.name || '').join(' ')
      : '';

  const handleFormulaTextAreaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const raw = e.target.value.replace(/[\r\n]+/g, ' ');
    if (!raw.trim()) {
      setFormulaTokens([]);
      return;
    }

    const tokens = raw
      .split(/([+\-*/()])/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newFormula: FormulaToken[] = tokens.map((token) => {
      const crit = selectedCriteria.find((c: any) => c.criterionKey === token);
      if (crit) {
        const id = crit.criteriaId || crit.id;
        const name = crit.criterionKey;
        return { id, name, type: 'criteria' };
      }
      if (allowedOperands.includes(token)) {
        return { id: token, name: token, type: 'operand' };
      }
      if (!Number.isNaN(Number(token))) {
        return { id: token, name: token, type: 'operand' };
      }
      return { id: token, name: token, type: 'operand' };
    });

    setFormulaTokens(newFormula);
  };

  const handleFormulaOptionClick = (id: string, name: string, type: string) => {
    if (name === 'Clear') {
      setFormulaTokens([]);
      formulaTextAreaRef.current?.focus();
      return;
    }
    if (type === 'criteria' || type === 'operand') {
      setFormulaTokens((prev) => [...prev, { id, name, type }]);
      formulaTextAreaRef.current?.focus();
    }
  };

  const persistIncentiveFormula = (
    recognitionTypeId: string,
    onDone: () => void,
  ) => {
    const amountType = form.getFieldValue('incentiveAmountType') || 'Fixed';
    const fixedVal = form.getFieldValue('incentiveFixedAmount');

    const cleanedExpression =
      Array.isArray(formulaTokens) && formulaTokens.length > 0
        ? formulaTokens
            .map((item: FormulaToken) =>
              item?.type === 'criteria' ? `"${item?.id}"` : item?.name,
            )
            .join(' ')
        : '';

    const formdata = {
      recognitionTypeId,
      expression:
        amountType === 'Fixed' ? null : JSON.stringify(cleanedExpression),
      isComputed: amountType !== 'Fixed',
      monetizedValue: amountType === 'Fixed' ? fixedVal : 0,
    };

    const canUpdate =
      formulaById?.id &&
      (formulaById?.expression || formulaById?.monetizedValue) &&
      ((typeof formulaById?.expression === 'string' &&
        formulaById.expression.length > 0) ||
        !!formulaById?.monetizedValue);

    if (canUpdate) {
      updateIncentiveFormula(
        { id: formulaById.id, data: formdata },
        { onSuccess: onDone },
      );
    } else {
      createIncentiveFormula(formdata, {
        onSuccess: () => {
          setFormulaTokens([]);
          onDone();
        },
      });
    }
  };

  const handleWizardFinalSubmit = () => {
    const amountType = form.getFieldValue('incentiveAmountType') || 'Fixed';
    if (amountType === 'Formula') {
      if (!formulaTokens?.length) {
        setFormulaError('Formula cannot be empty.');
        return;
      }
      const formulaString = formulaTokens
        .map((item: FormulaToken) => item?.name || '')
        .join(' ');
      const err = validateFormulaString(formulaString);
      if (err) {
        setFormulaError(err);
        return;
      }
      setFormulaError('');
    } else {
      const fixed = form.getFieldValue('incentiveFixedAmount');
      if (fixed === undefined || fixed === '' || fixed === null) {
        setFormulaError('Please enter amount');
        return;
      }
      setFormulaError('');
    }

    if (isFormulaOnlyEdit && selectedRecognitionType) {
      persistIncentiveFormula(selectedRecognitionType, handleWizardClose);
      return;
    }

    form.submit();
  };

  const wizardStepItems = useMemo(() => {
    if (isFormulaOnlyEdit) return [];
    const items: { title: string }[] = [{ title: 'Recognition information' }];
    if (createCategory) return items;
    items.push({ title: 'Recognition Criteria' });
    if (isMonetizedWatch) {
      items.push({ title: 'Formula' });
    }
    return items;
  }, [createCategory, isMonetizedWatch, isFormulaOnlyEdit]);

  const isLastWizardStep = isFormulaOnlyEdit
    ? true
    : createCategory
      ? true
      : showFormulaStep
        ? currentStep === 2
        : currentStep === 1;

  const onFinishCriteria = (values: CriteriaFormValues) => {
    createRecognitionCriteria(
      { value: values },
      {
        onSuccess: (response) => {
          setIsModalVisible(false);
          criteriaForm.resetFields();
          const newCriteriaId = response?.id;
          if (newCriteriaId) {
            const newCriteriaIdStr = String(newCriteriaId);
            setPendingNewCriteriaId(newCriteriaIdStr);
            const currentCriteria = form.getFieldValue('criteria') || [];
            const updatedCriteria = [
              ...currentCriteria.map((c: any) => String(c)),
              newCriteriaIdStr,
            ];
            form.setFieldsValue({ criteria: updatedCriteria });

            if (selectedCriteria.length > 0) {
              const tempCriteria = {
                criterionKey: values.criteriaName,
                id: newCriteriaIdStr,
                criteriaId: newCriteriaIdStr,
                weight: 0, // Will be set below
                operator: null,
                condition: null,
                value: 0,
                active: true,
              };

              const updatedSelectedCriteria = [
                ...selectedCriteria,
                tempCriteria,
              ];

              const weights = distributeWeightsEvenly(
                updatedSelectedCriteria.length,
              );
              updatedSelectedCriteria.forEach(
                (criterion: any, index: number) => {
                  criterion.weight = weights[index];
                },
              );

              setSelectedCriteria(updatedSelectedCriteria);
              setTotalWeight(1);

              form.setFieldsValue({
                recognitionCriteria: updatedSelectedCriteria,
              });
            } else {
              handleCriteriaChange(updatedCriteria);
            }
          }
        },
      },
    );
  };

  useEffect(() => {
    if (
      pendingNewCriteriaId &&
      criteria?.some((c: any) => String(c.id) === String(pendingNewCriteriaId))
    ) {
      const currentCriteria = (form.getFieldValue('criteria') || []).map(
        (c: any) => String(c),
      );
      const pendingIdStr = String(pendingNewCriteriaId);
      if (currentCriteria.includes(pendingIdStr)) {
        const newCriteriaObj = criteria.find(
          (c: any) => String(c.id) === pendingIdStr,
        );

        if (newCriteriaObj) {
          const updatedSelectedCriteria = selectedCriteria.map(
            (criterion: any) => {
              if (
                String(criterion.criteriaId) === pendingIdStr ||
                String(criterion.id) === pendingIdStr
              ) {
                return {
                  ...criterion,
                  criterionKey: newCriteriaObj.criteriaName,
                };
              }
              return criterion;
            },
          );

          setSelectedCriteria(updatedSelectedCriteria);

          form.setFieldsValue({
            recognitionCriteria: updatedSelectedCriteria,
          });
        }

        setPendingNewCriteriaId(null); // Reset
      }
    }
  }, [criteria, pendingNewCriteriaId]);

  return (
    <div data-cy="create-recognition-container">
      <style data-cy="create-recognition-styles">{`
    .custom-delete-modal .ant-modal-confirm-btns {
      text-align: center !important;
      justify-content: center !important;
    }

    /* Hide scrollbar but keep scroll behavior */
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

    /* Make multi-select tags area scrollable (step 2) – about 1.5 lines */
    .create-recognition-criteria-select-scroll .ant-select-selector {
      max-height: 50px;
      overflow-y: auto;
    }
    .create-recognition-criteria-select-scroll .ant-select-selector::-webkit-scrollbar { display: none; }
    .create-recognition-criteria-select-scroll .ant-select-selector { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
      <Modal
        title={modalHeader}
        open={isWizardOpen}
        onCancel={handleWizardClose}
        footer={null}
        centered
        width={isMobile ? '100%' : '50%'}
        destroyOnClose
        styles={{
          body: {
            paddingTop: 0,
            maxHeight:
              currentStep === 0
                ? 583
                : showFormulaStep && currentStep === 2
                  ? 640
                  : 457,
            overflowY: showFormulaStep && currentStep === 2 ? 'auto' : 'hidden',
          },
          content: {
            borderRadius: 12,
          },
        }}
        data-cy="create-recognition-wizard-modal"
      >
        {!isFormulaOnlyEdit && (
          <div className="px-6 pb-4" data-cy="create-recognition-wizard-steps">
            <Steps
              size="small"
              current={currentStep}
              items={wizardStepItems}
              data-cy="create-recognition-wizard-steps-component"
            />
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="text-xs text-gray-950"
          initialValues={{
            isMonetized: false,
            requiresCertification: false,
            frequency: 'monthly',
            incentiveAmountType: 'Fixed',
          }}
          data-cy="create-recognition-form"
          id="createRecognitionForm"
        >
          <div
            className={currentStep === 0 ? 'block' : 'hidden'}
            data-cy="create-recognition-step-0"
          >
            <Form.Item
              label={
                <span
                  className="text-black text-sm "
                  data-cy="create-recognition-form-name-label"
                >
                  Name
                </span>
              }
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please enter the recognition name',
                },
              ]}
              data-cy="create-recognition-form-name-field"
              id="createRecognitionFormNameField"
            >
              <Input
                placeholder="Enter recognition type name"
                className="text-xs text-gray-950 h-10"
                data-cy="create-recognition-form-name-input"
                id="createRecognitionFormNameInput"
              />
            </Form.Item>

            <Form.Item
              className="text-xs text-gray-950"
              label={
                <span
                  className="text-black text-sm "
                  data-cy="create-recognition-form-description-label"
                >
                  Description
                </span>
              }
              name="description"
              rules={[
                { required: true, message: 'Please enter a description' },
              ]}
              data-cy="create-recognition-form-description-field"
              id="createRecognitionFormDescriptionField"
            >
              <Input.TextArea
                placeholder="Enter a detailed description"
                rows={4}
                className="text-xs text-gray-950"
                data-cy="create-recognition-form-description-textarea"
                id="createRecognitionFormDescriptionTextarea"
              />
            </Form.Item>
          </div>

          {!createCategory && (
            <div
              className={currentStep === 1 ? 'block' : 'hidden'}
              data-cy="create-recognition-step-1-criteria-select"
            >
              <Form.Item
                className="text-xs text-gray-950"
                label={
                  <span
                    className="text-black text-sm "
                    data-cy="create-recognition-form-criteria-label"
                  >
                    Recognition Criteria
                  </span>
                }
                name="criteria"
                rules={[
                  {
                    required: true,
                    message: 'Please select at least one criterion',
                  },
                ]}
                data-cy="create-recognition-form-criteria-field"
                id="createRecognitionFormCriteriaField"
              >
                <Select
                  mode="multiple"
                  placeholder="Select criteria"
                  className="text-xs text-gray-950 create-recognition-criteria-select-scroll"
                  onChange={(vals) => handleCriteriaChange(vals as any)}
                  data-cy="create-recognition-form-criteria-select"
                  id="createRecognitionFormCriteriaSelect"
                  optionRender={(option) => {
                    const criteriaItem = criteria?.find(
                      (c: any) => String(c.id) === String(option.value),
                    );
                    const isEditing =
                      String(editingCriteriaId) === String(criteriaItem?.id);

                    return (
                      <div
                        className="flex items-center justify-between w-full"
                        data-cy={`create-recognition-form-criteria-option-${criteriaItem?.id}`}
                        id={`createRecognitionFormCriteriaOption${criteriaItem?.id}`}
                      >
                        {isEditing ? (
                          <>
                            <Input
                              value={editingCriteriaName}
                              onChange={(e) =>
                                setEditingCriteriaName(e.target.value)
                              }
                              className="flex-1 mr-2"
                              size="small"
                              onPressEnter={() => handleSaveEdit(criteriaItem)}
                              autoFocus
                              data-cy={`create-recognition-form-criteria-edit-input-${criteriaItem?.id}`}
                              id={`createRecognitionFormCriteriaEditInput${criteriaItem?.id}`}
                            />
                            <div
                              className="flex gap-1"
                              data-cy={`create-recognition-form-criteria-edit-actions-${criteriaItem?.id}`}
                              id={`createRecognitionFormCriteriaEditActions${criteriaItem?.id}`}
                            >
                              <Button
                                icon={<CheckOutlined />}
                                size="small"
                                className="bg-green-500 text-white border-none rounded-md w-6 h-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit(criteriaItem);
                                }}
                                data-cy={`create-recognition-form-criteria-save-${criteriaItem?.id}`}
                                id={`createRecognitionFormCriteriaSave${criteriaItem?.id}`}
                              />
                              <Button
                                icon={<CloseOutlined />}
                                size="small"
                                className="bg-red-500 text-white border-none rounded-md w-6 h-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                data-cy={`create-recognition-form-criteria-cancel-${criteriaItem?.id}`}
                                id={`createRecognitionFormCriteriaCancel${criteriaItem?.id}`}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <span
                              className="flex-1"
                              data-cy={`create-recognition-form-criteria-name-${criteriaItem?.id}`}
                              id={`createRecognitionFormCriteriaName${criteriaItem?.id}`}
                            >
                              {criteriaItem?.criteriaName}
                            </span>
                            {criteriaItem?.criteriaType === 'Created' && (
                              <div
                                className="flex gap-2 ml-2"
                                data-cy={`create-recognition-form-criteria-actions-${criteriaItem?.id}`}
                                id={`createRecognitionFormCriteriaActions${criteriaItem?.id}`}
                              >
                                <Button
                                  icon={<GoPencil />}
                                  size="small"
                                  className="mr-2 bg-blue text-white border-none rounded-md w-5 h-5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCriteria(criteriaItem);
                                  }}
                                  data-cy={`create-recognition-form-criteria-edit-button-${criteriaItem?.id}`}
                                  id={`createRecognitionFormCriteriaEditButton${criteriaItem?.id}`}
                                />

                                <Button
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  className="mr-2 bg-red-500 text-white border-none rounded-md w-5 h-5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCriteria(criteriaItem);
                                  }}
                                  data-cy={`create-recognition-form-criteria-delete-button-${criteriaItem?.id}`}
                                  id={`createRecognitionFormCriteriaDeleteButton${criteriaItem?.id}`}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }}
                >
                  {criteria?.map((option: any) => (
                    <Select.Option
                      key={option.id}
                      value={option.id}
                      data-cy={`create-recognition-form-criteria-option-${option.id}`}
                      id={`createRecognitionFormCriteriaOption${option.id}`}
                    >
                      {option.criteriaName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          )}
          <div
            className={
              !createCategory && currentStep === 1 ? 'block' : 'hidden'
            }
            data-cy="create-recognition-step-1"
          >
            <div
              className="max-h-[180px] overflow-y-auto scrollbar-none pr-1"
              data-cy="create-recognition-criteria-items-scroll"
            >
              {selectedCriteria.map((criteria: any, index: number) => (
                <div
                  className="flex gap-1"
                  key={`recognition-criteria-${criteria.criterionKey}-${index}`}
                  data-cy={`create-recognition-form-criteria-item-${index}`}
                  id={`createRecognitionFormCriteriaItem${index}`}
                >
                  {selectedRecognitionType !== '' && (
                    <Form.Item
                      className="w-1/2 text-xs text-gray-950"
                      name={['recognitionCriteria', index, 'id']}
                      initialValue={criteria.id}
                      hidden
                      data-cy={`create-recognition-form-criteria-id-field-${index}`}
                      id={`createRecognitionFormCriteriaIdField${index}`}
                    ></Form.Item>
                  )}
                  <Form.Item
                    className="w-1/2 text-xs text-gray-950"
                    name={['recognitionCriteria', index, 'criteriaId']}
                    initialValue={criteria.id}
                    hidden
                    data-cy={`create-recognition-form-criteria-criteria-id-field-${index}`}
                    id={`createRecognitionFormCriteriaCriteriaIdField${index}`}
                  ></Form.Item>
                  <Form.Item
                    labelAlign="left"
                    className="w-1/2 text-xs text-gray-950"
                    label={getLabel('Criteria')}
                    name={['recognitionCriteria', index, 'criterionKey']}
                    initialValue={criteria.criterionKey}
                    rules={[
                      {
                        required: true,
                        message: 'Please select at least one criterion',
                      },
                    ]}
                    data-cy={`create-recognition-form-criteria-key-field-${index}`}
                    id={`createRecognitionFormCriteriaKeyField${index}`}
                  >
                    <Input
                      className={commonClass}
                      disabled
                      data-cy={`create-recognition-form-criteria-key-input-${index}`}
                      id={`createRecognitionFormCriteriaKeyInput${index}`}
                    />
                  </Form.Item>

                  <Form.Item
                    className="w-1/2 text-xs text-gray-950"
                    label={getLabel('Weight')}
                    name={['recognitionCriteria', index, 'weight']}
                    initialValue={criteria.weight}
                    rules={[
                      { required: true, message: 'Please enter weight' },
                      {
                        validator: (notused, value) => {
                          const weight = parseFloat(value || 0); // Default to 0 if value is invalid
                          if (weight < 0.1 || weight > 1) {
                            return Promise.reject(
                              'The weight should be between 0.1-1',
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    data-cy={`create-recognition-form-criteria-weight-field-${index}`}
                    id={`createRecognitionFormCriteriaWeightField${index}`}
                  >
                    <Input
                      type="number"
                      min={0.1} // Browser-level constraint
                      max={1} // Browser-level constraint
                      step={0.01}
                      placeholder="Enter weight (0.1-1)"
                      onChange={(e) => {
                        const value = parseFloat(e.target.value || '0');
                        handleWeightChange(index, value);
                      }}
                      data-cy={`create-recognition-form-criteria-weight-input-${index}`}
                      id={`createRecognitionFormCriteriaWeightInput${index}`}
                    />
                  </Form.Item>

                  <Form.Item
                    className="w-1/2 text-xs text-gray-950"
                    label={getLabel('Operator')}
                    name={['recognitionCriteria', index, 'operator']}
                    initialValue={criteria.operator}
                    rules={[
                      { required: true, message: 'Please enter operator' },
                    ]}
                    data-cy={`create-recognition-form-criteria-operator-field-${index}`}
                    id={`createRecognitionFormCriteriaOperatorField${index}`}
                  >
                    <Select
                      placeholder="Select operator"
                      className={commonClass}
                      onChange={(value) => {
                        const updated = [...selectedCriteria];
                        updated[index].operator = value;
                        setSelectedCriteria(updated);
                      }}
                      data-cy={`create-recognition-form-criteria-operator-select-${index}`}
                      id={`createRecognitionFormCriteriaOperatorSelect${index}`}
                    >
                      {Object.values(AggregateOperator).map(
                        (operator, opIndex) => (
                          <Select.Option
                            key={`operator-${operator}-${opIndex}`}
                            value={operator}
                            className={commonClass}
                            data-cy={`create-recognition-form-criteria-operator-option-${index}-${opIndex}`}
                            id={`createRecognitionFormCriteriaOperatorOption${index}${opIndex}`}
                          >
                            {operator}
                          </Select.Option>
                        ),
                      )}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    className="w-1/2 text-xs text-gray-950"
                    label={getLabel('Condition')}
                    name={['recognitionCriteria', index, 'condition']}
                    initialValue={criteria.condition}
                    rules={[
                      { required: true, message: 'Please enter condition' },
                    ]}
                    data-cy={`create-recognition-form-criteria-condition-field-${index}`}
                    id={`createRecognitionFormCriteriaConditionField${index}`}
                  >
                    <Select
                      placeholder="Select condition"
                      className={commonClass}
                      onChange={(value) => {
                        const updated = [...selectedCriteria];
                        updated[index].condition = value;
                        setSelectedCriteria(updated);
                      }}
                      data-cy={`create-recognition-form-criteria-condition-select-${index}`}
                      id={`createRecognitionFormCriteriaConditionSelect${index}`}
                    >
                      {Object.values(ConditionOperator).map(
                        (operator, condIndex) => (
                          <Select.Option
                            key={`condition-${operator}-${condIndex}`}
                            value={operator}
                            className={commonClass}
                            data-cy={`create-recognition-form-criteria-condition-option-${index}-${condIndex}`}
                            id={`createRecognitionFormCriteriaConditionOption${index}${condIndex}`}
                          >
                            {operator}
                          </Select.Option>
                        ),
                      )}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    className="w-1/2 text-xs text-gray-950"
                    label={getLabel('Value')}
                    name={['recognitionCriteria', index, 'value']}
                    initialValue={criteria.value}
                    rules={[{ required: true, message: 'Please enter value' }]}
                    data-cy={`create-recognition-form-criteria-value-field-${index}`}
                    id={`createRecognitionFormCriteriaValueField${index}`}
                  >
                    <Input
                      type="number"
                      placeholder="Enter value"
                      className={commonClass}
                      data-cy={`create-recognition-form-criteria-value-input-${index}`}
                      id={`createRecognitionFormCriteriaValueInput${index}`}
                    />
                  </Form.Item>
                  <Image
                    src={cancelIcon}
                    alt="remove"
                    width={16}
                    height={16}
                    onClick={() => {
                      const updatedCriteria = selectedCriteria.filter(
                        (nonUsed: any, i: number) => i !== index,
                      );
                      setSelectedCriteria(updatedCriteria);
                      setTotalWeight(calculateTotalWeight(updatedCriteria));
                      // Reset the form field for recognitionCriteria to avoid stale state
                      form.resetFields(['recognitionCriteria']);
                      form.setFieldsValue({
                        criteria: updatedCriteria.map(
                          (c: any) => c.criteriaId || c.id,
                        ),
                        recognitionCriteria: updatedCriteria,
                      });
                    }}
                    className="cursor-pointer"
                    data-cy={`create-recognition-form-criteria-remove-${index}`}
                    id={`createRecognitionFormCriteriaRemove${index}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {!createCategory &&
            currentStep === 1 &&
            selectedCriteria?.length > 0 && (
              <div
                className={`mt-2 text-xs ${
                  totalWeight !== 1 ? 'text-red-500' : 'text-gray-600'
                }`}
                data-cy="create-recognition-form-total-weight"
                id="createRecognitionFormTotalWeight"
              >
                Total Weight: {totalWeight}{' '}
                {totalWeight !== 1 && '(Must equal 1)'}
              </div>
            )}
          {!createCategory && (
            <>
              <Form.Item name="isMonetized" initialValue={false} hidden />
              <Form.Item
                name="requiresCertification"
                initialValue={false}
                hidden
              />

              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue, setFieldValue }) => {
                  const isMonetized = !!getFieldValue('isMonetized');
                  const requiresCertification = !!getFieldValue(
                    'requiresCertification',
                  );

                  const optionBase =
                    'flex items-start gap-3 w-full rounded-lg border px-4 py-3 cursor-pointer transition-colors';
                  const optionSelected = 'border-primary bg-[#F5F8FF]';
                  const optionUnselected =
                    'border-gray-200 bg-white hover:bg-gray-50';

                  const circleBase =
                    'mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center';
                  const circleSelected = 'border-primary';
                  const circleUnselected = 'border-gray-300';

                  const dot = 'h-2 w-2 rounded-full bg-primary';

                  return (
                    <div
                      className={
                        currentStep === 0 ? 'flex flex-col gap-3' : 'hidden'
                      }
                      data-cy="create-recognition-form-options"
                    >
                      <div
                        className={`${optionBase} ${
                          isMonetized ? optionSelected : optionUnselected
                        }`}
                        onClick={() =>
                          setFieldValue('isMonetized', !isMonetized)
                        }
                        data-cy="create-recognition-form-monetized-option"
                      >
                        <div
                          className={`${circleBase} ${
                            isMonetized ? circleSelected : circleUnselected
                          }`}
                          data-cy="create-recognition-form-monetized-circle"
                        >
                          {isMonetized ? (
                            <div
                              className={dot}
                              data-cy="create-recognition-form-monetized-dot"
                            />
                          ) : null}
                        </div>
                        <div
                          className="min-w-0"
                          data-cy="create-recognition-form-monetized-text"
                        >
                          <div className="text-sm  text-gray-900">Monetize</div>
                          <div className="text-xs text-gray-500">
                            People that are Eligible for payment under this
                            recognition
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${optionBase} ${
                          requiresCertification
                            ? optionSelected
                            : optionUnselected
                        }`}
                        onClick={() =>
                          setFieldValue(
                            'requiresCertification',
                            !requiresCertification,
                          )
                        }
                        data-cy="create-recognition-form-requires-certification-option"
                      >
                        <div
                          className={`${circleBase} ${
                            requiresCertification
                              ? circleSelected
                              : circleUnselected
                          }`}
                          data-cy="create-recognition-form-requires-certification-circle"
                        >
                          {requiresCertification ? (
                            <div
                              className={dot}
                              data-cy="create-recognition-form-requires-certification-dot"
                            />
                          ) : null}
                        </div>
                        <div
                          className="min-w-0"
                          data-cy="create-recognition-form-requires-certification-text"
                        >
                          <div className="text-sm  text-gray-900">
                            Requires Certificate
                          </div>
                          <div className="text-xs text-gray-500">
                            People that are Eligible for certificate under this
                            recognition
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </>
          )}
          {/* Certification Data */}
          {!createCategory && (
            <>
              {/* {currentStep === 0 && (
                <Form.Item>
                  {({ getFieldValue }) =>
                    getFieldValue('requiresCertification') && (
                      <Space
                        direction="vertical"
                        style={{ width: '100%' }}
                        data-cy="create-recognition-form-certification-data"
                        id="createRecognitionFormCertificationData"
                      >
                        <Form.Item
                          className="text-xs text-gray-950"
                          label={
                            <span
                              className="text-black text-xs "
                              data-cy="create-recognition-form-certification-title-label"
                            >
                              Certification Title
                            </span>
                          }
                          name={['certificationData', 'title']}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter certification title',
                            },
                          ]}
                          data-cy="create-recognition-form-certification-title-field"
                          id="createRecognitionFormCertificationTitleField"
                        >
                          <Input
                            placeholder="Enter certification title"
                            className="text-xs text-gray-950"
                            data-cy="create-recognition-form-certification-title-input"
                            id="createRecognitionFormCertificationTitleInput"
                          />
                        </Form.Item>
                        <Form.Item
                          className="text-xs text-gray-950"
                          label={
                            <span
                              className="text-black text-xs "
                              data-cy="create-recognition-form-certification-details-label"
                            >
                              Certification Details
                            </span>
                          }
                          name={['certificationData', 'details']}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter certification details',
                            },
                          ]}
                          data-cy="create-recognition-form-certification-details-field"
                          id="createRecognitionFormCertificationDetailsField"
                        >
                          <Input.TextArea
                            placeholder="Enter details for certification"
                            rows={3}
                            className="text-xs text-gray-950"
                            data-cy="create-recognition-form-certification-details-textarea"
                            id="createRecognitionFormCertificationDetailsTextarea"
                          />
                        </Form.Item>
                      </Space>
                    )
                  }
                </Form.Item>
              )} */}
              {/* Step 2 only */}
              <div
                className={
                  currentStep === 1 ? 'flex justify-center mb-3' : 'hidden'
                }
                data-cy="create-recognition-form-new-criteria-container"
                id="createRecognitionFormNewCriteriaContainer"
              >
                <Button
                  className="flex justify-end items-center px-5"
                  icon={<FaPlus />}
                  onClick={() => setIsModalVisible(true)}
                  type="primary"
                  data-cy="create-recognition-form-new-criteria-button"
                  id="createRecognitionFormNewCriteriaButton"
                >
                  New Criteria
                </Button>
              </div>
              {/* Step 1 only */}
              <div
                className={
                  currentStep === 0
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4 pt-2'
                    : 'hidden'
                }
                data-cy="create-recognition-form-frequency-department-row"
              >
                <Form.Item
                  className="text-xs text-gray-950"
                  label={
                    <span
                      className="text-black text-sm "
                      data-cy="create-recognition-form-frequency-label"
                    >
                      Frequency
                    </span>
                  }
                  name="frequency"
                  rules={[
                    { required: true, message: 'Please select a frequency' },
                  ]}
                  data-cy="create-recognition-form-frequency-field"
                  id="createRecognitionFormFrequencyField"
                >
                  <Select
                    className="text-xs text-gray-950 h-10"
                    data-cy="create-recognition-form-frequency-select"
                    id="createRecognitionFormFrequencySelect"
                  >
                    <Select.Option
                      value="weekly"
                      data-cy="create-recognition-form-frequency-option-weekly"
                      id="createRecognitionFormFrequencyOptionWeekly"
                    >
                      Weekly
                    </Select.Option>
                    <Select.Option
                      value="monthly"
                      data-cy="create-recognition-form-frequency-option-monthly"
                      id="createRecognitionFormFrequencyOptionMonthly"
                    >
                      Monthly
                    </Select.Option>
                    <Select.Option
                      value="quarterly"
                      data-cy="create-recognition-form-frequency-option-quarterly"
                      id="createRecognitionFormFrequencyOptionQuarterly"
                    >
                      Quarterly
                    </Select.Option>
                    <Select.Option
                      value="yearly"
                      data-cy="create-recognition-form-frequency-option-yearly"
                      id="createRecognitionFormFrequencyOptionYearly"
                    >
                      Yearly
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  className="text-xs text-gray-950"
                  label={
                    <span
                      className="text-black text-sm "
                      data-cy="create-recognition-form-department-label"
                    >
                      Department
                    </span>
                  }
                  name="departmentId"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a department',
                    },
                  ]}
                  data-cy="create-recognition-form-department-field"
                  id="createRecognitionFormDepartmentField"
                >
                  <Select
                    placeholder="Select a department"
                    className="text-black text-xs  h-10"
                    data-cy="create-recognition-form-department-select"
                    id="createRecognitionFormDepartmentSelect"
                  >
                    {allDepartmentWithData?.map((dep: any) => (
                      <Option
                        key={dep.id}
                        value={dep.id}
                        data-cy={`create-recognition-form-department-option-${dep.id}`}
                        id={`createRecognitionFormDepartmentOption${dep.id}`}
                      >
                        <span
                          className="text-sm  text-black"
                          data-cy="create-recognition-form-department-option-name"
                          id="createRecognitionFormDepartmentOptionName"
                        >
                          {dep?.name}
                        </span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </>
          )}

          {!createCategory && (
            <Form.Item
              className="text-xs text-gray-950"
              hidden
              label={
                <span
                  className="text-black text-sm "
                  data-cy="create-recognition-form-parent-type-label"
                >
                  Parent Type
                </span>
              }
              initialValue={parentRecognitionTypeId}
              name="parentTypeId"
              data-cy="create-recognition-form-parent-type-field"
              id="createRecognitionFormParentTypeField"
            >
              <Select
                className="text-xs text-gray-950"
                data-cy="create-recognition-form-parent-type-select"
                id="createRecognitionFormParentTypeSelect"
              >
                {recognitionTypeWithOutCriteria?.items?.map((item: any) => (
                  <Select.Option
                    key={item?.id}
                    value={item?.id}
                    data-cy={`create-recognition-form-parent-type-option-${item?.id}`}
                    id={`createRecognitionFormParentTypeOption${item?.id}`}
                  >
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {showFormulaStep && (
            <div
              className={currentStep === 2 ? 'block ' : 'hidden '}
              data-cy="create-recognition-step-2-formula"
            >
              <Form.Item name="incentiveAmountType" hidden>
                <Input />
              </Form.Item>

              <div className="flex gap-2 mb-4 ">
                <Form.Item shouldUpdate noStyle>
                  {() => {
                    const t =
                      form.getFieldValue('incentiveAmountType') || 'Fixed';
                    return (
                      <>
                        <Button
                          type={t === 'Fixed' ? 'primary' : 'default'}
                          className={
                            t === 'Fixed'
                              ? 'rounded-full px-6'
                              : 'rounded-full px-6 border-gray-300'
                          }
                          onClick={() => {
                            setFormulaError('');
                            form.setFieldsValue({
                              incentiveAmountType: 'Fixed',
                            });
                          }}
                          data-cy="create-recognition-formula-fixed-toggle"
                        >
                          Fixed Amount
                        </Button>
                        <Button
                          type={t === 'Formula' ? 'primary' : 'default'}
                          className={
                            t === 'Formula'
                              ? 'rounded-full px-6'
                              : 'rounded-full px-6 border-gray-300'
                          }
                          onClick={() => {
                            setFormulaError('');
                            form.setFieldsValue({
                              incentiveAmountType: 'Formula',
                            });
                          }}
                          data-cy="create-recognition-formula-formula-toggle"
                        >
                          Formula
                        </Button>
                      </>
                    );
                  }}
                </Form.Item>
              </div>

              {formulaError ? (
                <div
                  className="text-red-500 text-sm mb-2"
                  data-cy="create-recognition-formula-step-error"
                >
                  {formulaError}
                </div>
              ) : null}

              <Form.Item shouldUpdate noStyle>
                {() => {
                  const t =
                    form.getFieldValue('incentiveAmountType') || 'Fixed';
                  if (t !== 'Fixed') return null;
                  return (
                    <Form.Item
                      label={
                        <span className="text-black text-sm">
                          Amount <span className="text-red-500">*</span>
                        </span>
                      }
                      name="incentiveFixedAmount"
                      data-cy="create-recognition-formula-fixed-amount"
                    >
                      <Input
                        placeholder="Input"
                        className="text-xs text-gray-950 h-10"
                        data-cy="create-recognition-formula-fixed-amount-input"
                        onChange={() => setFormulaError('')}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Form.Item shouldUpdate noStyle>
                {() => {
                  const t =
                    form.getFieldValue('incentiveAmountType') || 'Fixed';
                  if (t !== 'Formula') return null;
                  return (
                    <Form.Item
                      label={
                        <span className="text-black text-sm font-semibold">
                          Formula <span className="text-red-500">*</span>
                        </span>
                      }
                      data-cy="create-recognition-formula-expression"
                    >
                      <TextArea
                        ref={formulaTextAreaRef}
                        value={getFormulaDisplayValue()}
                        onChange={handleFormulaTextAreaChange}
                        placeholder="Type numbers or click criteria and operands to build a formula"
                        className="mt-1"
                        rows={4}
                        data-cy="create-recognition-formula-textarea"
                      />
                      <div className="my-4">
                        <Row gutter={[16, 10]}>
                          <Col xs={12} sm={12} md={13} lg={13} xl={13}>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-sm">
                                Criteria
                                <span className="text-red-500">*</span>
                              </span>
                              <span className="flex flex-wrap my-1">
                                {selectedCriteria?.length ? (
                                  selectedCriteria.map(
                                    (option: any, idx: number) => {
                                      const cid =
                                        option?.criteriaId || option?.id;
                                      const cname = option?.criterionKey;
                                      if (!cname) return null;
                                      return (
                                        <Button
                                          key={`${cid}-${idx}`}
                                          onClick={() =>
                                            handleFormulaOptionClick(
                                              cid,
                                              cname,
                                              'criteria',
                                            )
                                          }
                                          className="bg-[#F8F8F8] text-[#111827] border-none text-sm font-normal m-1 rounded-2xl"
                                          data-cy={`create-recognition-formula-criteria-${cid}`}
                                        >
                                          {cname}
                                        </Button>
                                      );
                                    },
                                  )
                                ) : (
                                  <span className="text-sm text-gray-500 m-1">
                                    No Criterion
                                  </span>
                                )}
                              </span>
                            </div>
                          </Col>
                          <Col xs={12} sm={12} md={10} lg={10} xl={10}>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-sm">
                                Operators
                                <span className="text-red-500">*</span>
                              </span>
                              <span className="my-1 flex flex-wrap">
                                {FORMULA_OPERAND_OPTIONS.map((option) => (
                                  <Button
                                    key={option.id}
                                    onClick={() =>
                                      handleFormulaOptionClick(
                                        option.id,
                                        option.name,
                                        'operand',
                                      )
                                    }
                                    className="bg-primary text-white border-none text-sm font-normal m-1 rounded-2xl"
                                    data-cy={`create-recognition-formula-op-${option.name}`}
                                  >
                                    {option.name}
                                  </Button>
                                ))}
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </div>
          )}

          {/* department moved into the step-1 frequency/department row above */}

          <Modal
            centered
            width={isMobile ? undefined : '30vw'}
            title=""
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={
              <div
                className="flex justify-center items-center space-x-4"
                data-cy="create-recognition-criteria-modal-footer"
                id="createRecognitionCriteriaModalFooter"
              >
                <Button
                  type="default"
                  className="px-3"
                  onClick={() => setIsModalVisible(false)}
                  data-cy="create-recognition-criteria-modal-cancel-button"
                  id="createRecognitionCriteriaModalCancelButton"
                >
                  Cancel
                </Button>
                <Button
                  loading={createCriteriaLoading}
                  onClick={() => criteriaForm.submit()}
                  type="primary"
                  className="px-3"
                  data-cy="create-recognition-criteria-modal-create-button"
                  id="createRecognitionCriteriaModalCreateButton"
                >
                  Create
                </Button>
              </div>
            }
            data-cy="create-recognition-criteria-modal"
          >
            <Form
              form={criteriaForm}
              layout="vertical"
              onFinish={onFinishCriteria}
              data-cy="create-recognition-criteria-modal-form"
              id="createRecognitionCriteriaModalForm"
            >
              <Form.Item
                label="Criteria Name"
                name="criteriaName"
                rules={[
                  { required: true, message: 'Please enter criteria name' },
                ]}
                data-cy="create-recognition-criteria-modal-name-field"
                id="createRecognitionCriteriaModalNameField"
              >
                <Input
                  className="w-full h-[40px] mt-1"
                  placeholder="Enter criteria name"
                  type="text"
                  data-cy="create-recognition-criteria-modal-name-input"
                  id="createRecognitionCriteriaModalNameInput"
                />
              </Form.Item>

              <Form.Item
                className="text-xs text-gray-950"
                label={
                  <span
                    className="text-black text-sm  mb-1"
                    data-cy="create-recognition-criteria-modal-description-label"
                  >
                    Description
                  </span>
                }
                name="description"
                rules={[{ message: 'Please enter a description' }]}
                data-cy="create-recognition-criteria-modal-description-field"
                id="createRecognitionCriteriaModalDescriptionField"
              >
                <Input.TextArea
                  placeholder="Enter a detailed description"
                  rows={4}
                  className="text-xs text-gray-950"
                  data-cy="create-recognition-criteria-modal-description-textarea"
                  id="createRecognitionCriteriaModalDescriptionTextarea"
                />
              </Form.Item>
            </Form>
          </Modal>
          <div
            className="flex justify-end gap-3 pt-4"
            data-cy="create-recognition-wizard-footer"
          >
            <Button
              type="default"
              onClick={() => {
                if (currentStep === 0) {
                  handleWizardClose();
                } else {
                  setCurrentStep((s) => s - 1);
                }
              }}
              data-cy="create-recognition-wizard-back"
            >
              {currentStep === 0 || isFormulaOnlyEdit ? 'Cancel' : 'Back'}
            </Button>

            {!isLastWizardStep ? (
              <Button
                type="primary"
                disabled={
                  !createCategory &&
                  currentStep === 1 &&
                  showFormulaStep &&
                  selectedCriteria?.length > 0 &&
                  totalWeight !== 1
                }
                onClick={async () => {
                  if (createCategory) {
                    form.submit();
                    return;
                  }
                  if (currentStep === 0) {
                    await form.validateFields([
                      'name',
                      'description',
                      'frequency',
                      'departmentId',
                    ]);
                    setCurrentStep(1);
                    return;
                  }
                  if (currentStep === 1 && showFormulaStep) {
                    await form.validateFields();
                    setCurrentStep(2);
                  }
                }}
                data-cy="create-recognition-wizard-continue"
              >
                Continue
              </Button>
            ) : (
              <Button
                loading={
                  selectedRecognitionType !== ''
                    ? updateWithCriteriaLoading || updateFormulaLoading
                    : createLoading || createFormulaLoading
                }
                disabled={
                  (!createCategory &&
                    currentStep === 1 &&
                    !showFormulaStep &&
                    selectedCriteria?.length > 0 &&
                    totalWeight !== 1) ||
                  (showFormulaStep && currentStep === 2 && !!formulaError)
                }
                type="primary"
                onClick={() => {
                  if (showFormulaStep && currentStep === 2) {
                    handleWizardFinalSubmit();
                  } else {
                    form.submit();
                  }
                }}
                data-cy="create-recognition-wizard-submit"
              >
                {createCategory
                  ? 'Continue'
                  : selectedRecognitionType !== ''
                    ? 'Update'
                    : 'Create'}
              </Button>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RecognitionForm;
