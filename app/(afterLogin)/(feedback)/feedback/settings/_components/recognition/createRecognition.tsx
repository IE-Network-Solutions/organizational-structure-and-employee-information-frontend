import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  Popconfirm,
  Modal,
} from 'antd';
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
import { ConversationStore } from '@/store/uistate/features/conversation';
import CustomDrawerLayout from '@/components/common/customDrawer';
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
}

interface CriteriaFormValues {
  criteriaName: string;
  description: string;
}

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

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      data-cy="create-recognition-drawer-header"
      id="createRecognitionDrawerHeader"
    >
      <span data-cy="create-recognition-drawer-header-text">
        {selectedRecognitionType === ''
          ? 'Add New Recognition'
          : 'Update Recognition'}
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

  const handleCriteriaChange = (value: string[]) => {
    const noCriterion = value.length;

    const updatedCriteria = value.map((id) => {
      // Try to find the existing object in selectedCriteria
      const existing = selectedCriteria.find(
        (item: any) => (item.criteriaId || item.id) === id,
      );
      if (existing) return { ...existing };

      // Otherwise, build a new object from the criteria list
      const criteriaObj = criteria.find((item: any) => item.id === id);

      // If criteriaObj is not found (newly created criteria), try to get the name from pending criteria
      let criteriaName = criteriaObj?.criteriaName || '';

      // If this is a newly added criteria and we don't have the name yet,
      // we'll set a placeholder that will be updated when the criteria list refreshes
      if (!criteriaName && pendingNewCriteriaId === id) {
        criteriaName = 'New Criteria'; // Temporary placeholder
      }

      return {
        criterionKey: criteriaName,
        id,
        criteriaId: id,
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
    setEditingCriteriaId(criteriaItem.id);
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
          className="text-xs text-gray-950 font-semibold"
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
      className="text-black text-xs font-semibold"
      data-cy={`create-recognition-${text}-label`}
    >
      {text}
    </span>
  );
  const onFinish = (values: RecognitionFormValues) => {
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

    if (selectedRecognitionType === '') {
      createRecognitionType(finalValues, {
        onSuccess: () => {
          // Reset state immediately to prevent switching to update mode
          setSelectedRecognitionType('');
          handleClose();
        },
      });
    } else {
      const { ...updatedValues } = finalValues;
      updateRecognitionWithCriteria(
        {
          ...updatedValues,
          id: selectedRecognitionType,
          recognitionCriteria: finalValues.recognitionCriteria,
        },
        {
          onSuccess: () => {
            // Reset state immediately to prevent switching to update mode
            setSelectedRecognitionType('');
            handleClose();
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
        recognitionTypeById.recognitionCriteria?.map(
          (item: any) => item.criteriaId,
        ) || [],
      isMonetized: recognitionTypeById.isMonetized ?? false,
      requiresCertification: recognitionTypeById.requiresCertification ?? false,
      frequency: recognitionTypeById.frequency || '',
      departmentId: recognitionTypeById.departmentId || null,
    });
  }, [recognitionTypeById]);

  const onFinishCriteria = (values: CriteriaFormValues) => {
    createRecognitionCriteria(
      { value: values },
      {
        onSuccess: (response) => {
          setIsModalVisible(false);
          criteriaForm.resetFields();
          const newCriteriaId = response?.id;
          if (newCriteriaId) {
            setPendingNewCriteriaId(newCriteriaId);
            const currentCriteria = form.getFieldValue('criteria') || [];
            const updatedCriteria = [...currentCriteria, newCriteriaId];
            form.setFieldsValue({ criteria: updatedCriteria });

            if (selectedCriteria.length > 0) {
              const tempCriteria = {
                criterionKey: values.criteriaName,
                id: newCriteriaId,
                criteriaId: newCriteriaId,
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
      criteria?.some((c: any) => c.id === pendingNewCriteriaId)
    ) {
      const currentCriteria = form.getFieldValue('criteria') || [];
      if (currentCriteria.includes(pendingNewCriteriaId)) {
        const newCriteriaObj = criteria.find(
          (c: any) => c.id === pendingNewCriteriaId,
        );

        if (newCriteriaObj) {
          const updatedSelectedCriteria = selectedCriteria.map(
            (criterion: any) => {
              if (
                criterion.criteriaId === pendingNewCriteriaId ||
                criterion.id === pendingNewCriteriaId
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
  `}</style>
      <CustomDrawerLayout
        modalHeader={modalHeader}
        onClose={() => {
          form.resetFields();
          setOpenRecognitionType(false);
          setOpen(false);
          setParentRecognitionTypeId('');
          setSelectedRecognitionType('');
          setSelectedCriteria([]);
          setTotalWeight(0);
          setPendingNewCriteriaId(null);
          setEditingCriteriaId(null);
          setEditingCriteriaName('');
        }}
        open={
          openRecognitionType ||
          openModal ||
          parentRecognitionTypeId !== '' ||
          selectedRecognitionType !== ''
        }
        width="40%"
        footer={
          <Form.Item
            data-cy="create-recognition-form-footer"
            id="createRecognitionFormFooter"
          >
            <div
              className="flex justify-center space-x-5 bottom-8"
              data-cy="create-recognition-form-actions"
              id="createRecognitionFormActions"
            >
              <Popconfirm
                title="Are you sure you want to cancel?"
                onConfirm={() => {
                  form.resetFields();
                  setOpen(false);
                  setParentRecognitionTypeId('');
                  setSelectedRecognitionType('');
                  setOpenRecognitionType(false);
                  setSelectedCriteria([]);
                  setTotalWeight(0);
                  setPendingNewCriteriaId(null);
                  setEditingCriteriaId(null);
                  setEditingCriteriaName('');
                }}
                okText="Yes"
                cancelText="No"
                placement="top"
                data-cy="create-recognition-form-cancel-confirm"
                id="createRecognitionFormCancelConfirm"
              >
                <Button
                  type="default"
                  htmlType="button"
                  className="text-xs"
                  data-cy="create-recognition-form-cancel-button"
                  id="createRecognitionFormCancelButton"
                >
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                loading={
                  selectedRecognitionType !== ''
                    ? updateWithCriteriaLoading
                    : createLoading
                }
                disabled={selectedCriteria?.length > 0 && totalWeight !== 1}
                type="primary"
                onClick={() => form.submit()}
                className="text-xs"
                data-cy="create-recognition-form-submit-button"
                id="createRecognitionFormSubmitButton"
              >
                {selectedRecognitionType !== '' ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        }
        data-cy="create-recognition-drawer"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="text-xs text-gray-950"
          initialValues={{
            isMonetized: false,
            requiresCertification: false,
            frequency: 'monthly',
          }}
          data-cy="create-recognition-form"
          id="createRecognitionForm"
        >
          <Form.Item
            label={
              <span className="text-black text-xs font-semibold">
                Recognition Name
              </span>
            }
            name="name"
            rules={[
              { required: true, message: 'Please enter the recognition name' },
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
              <span className="text-black text-xs font-semibold">
                Description
              </span>
            }
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
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
          {!createCategory && (
            <Form.Item
              className="text-xs text-gray-950"
              label={
                <span className="text-black text-xs font-semibold">
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
                className="text-xs text-gray-950 h-10"
                onChange={handleCriteriaChange}
                data-cy="create-recognition-form-criteria-select"
                id="createRecognitionFormCriteriaSelect"
                optionRender={(option) => {
                  const criteriaItem = criteria?.find(
                    (c: any) => c.id === option.value,
                  );
                  const isEditing = editingCriteriaId === criteriaItem?.id;

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
          )}
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
                rules={[{ required: true, message: 'Please enter operator' }]}
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
                  {Object.values(AggregateOperator).map((operator, opIndex) => (
                    <Select.Option
                      key={`operator-${operator}-${opIndex}`}
                      value={operator}
                      className={commonClass}
                      data-cy={`create-recognition-form-criteria-operator-option-${index}-${opIndex}`}
                      id={`createRecognitionFormCriteriaOperatorOption${index}${opIndex}`}
                    >
                      {operator}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                className="w-1/2 text-xs text-gray-950"
                label={getLabel('Condition')}
                name={['recognitionCriteria', index, 'condition']}
                initialValue={criteria.condition}
                rules={[{ required: true, message: 'Please enter condition' }]}
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

          {!createCategory && (
            <div
              className={`mt-2 text-xs ${totalWeight !== 1 ? 'text-red-500' : 'text-gray-600'}`}
              data-cy="create-recognition-form-total-weight"
              id="createRecognitionFormTotalWeight"
            >
              Total Weight: {totalWeight}{' '}
              {totalWeight !== 1 && '(Must equal 1)'}
            </div>
          )}
          {!createCategory && (
            <div
              className="flex"
              data-cy="create-recognition-form-switches-container"
              id="createRecognitionFormSwitchesContainer"
            >
              <Form.Item
                className="text-xs text-gray-950"
                label={
                  <span className="text-black text-xs font-semibold">
                    Monetized
                  </span>
                }
                initialValue={false}
                name="isMonetized"
                valuePropName="checked"
                data-cy="create-recognition-form-monetized-field"
                id="createRecognitionFormMonetizedField"
              >
                <Switch
                  data-cy="create-recognition-form-monetized-switch"
                  id="createRecognitionFormMonetizedSwitch"
                />
              </Form.Item>

              <Form.Item
                className="text-xs text-gray-950"
                label={
                  <span className="text-black text-xs font-semibold">
                    Requires Certification
                  </span>
                }
                name="requiresCertification"
                valuePropName="checked"
                initialValue={false}
                data-cy="create-recognition-form-requires-certification-field"
                id="createRecognitionFormRequiresCertificationField"
              >
                <Switch
                  data-cy="create-recognition-form-requires-certification-switch"
                  id="createRecognitionFormRequiresCertificationSwitch"
                />
              </Form.Item>
            </div>
          )}
          {/* Certification Data */}
          {!createCategory && (
            <>
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
                          <span className="text-black text-xs font-semibold">
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
                          <span className="text-black text-xs font-semibold">
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
              <div
                className="flex justify-center mb-3"
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

              <Form.Item
                className="text-xs text-gray-950"
                label={
                  <span className="text-black text-xs font-semibold">
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
            </>
          )}

          {!createCategory && (
            <Form.Item
              className="text-xs text-gray-950"
              hidden
              label={
                <span className="text-black text-xs font-semibold">
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
          {!createCategory && (
            <Form.Item
              className="text-xs text-gray-950"
              label={
                <span className="text-black text-xs font-semibold">
                  Department
                </span>
              }
              name="departmentId"
              rules={[
                { required: true, message: 'Please enter the department ID' },
              ]}
              data-cy="create-recognition-form-department-field"
              id="createRecognitionFormDepartmentField"
            >
              <Select
                placeholder="Select a department"
                className="text-black text-xs font-semibold h-10"
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
                      className="text-xs font-semibold text-black"
                      data-cy="create-recognition-form-department-option-name"
                      id="createRecognitionFormDepartmentOptionName"
                    >
                      {dep?.name}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
        <Modal
          centered={false}
          width={isMobile ? undefined : '30vw'}
          style={
            isMobile
              ? {}
              : {
                  top: '20vh',
                  left: '64vw',
                  right: 0,
                  margin: 0,
                  transform: 'none',
                }
          }
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
                <span className="text-black text-xs font-semibold mb-1">
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
      </CustomDrawerLayout>
    </div>
  );
};

export default RecognitionForm;
