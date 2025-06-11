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
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {openRecognitionType || openModal
        ? 'Add New Recognition'
        : 'Update Recognition'}
    </div>
  );

  // This function will calculate the total weight of all criteria
  const calculateTotalWeight = (criteria: any[]) => {
    return criteria.reduce(
      (acc, criterion) => acc + (criterion.weight || 0),
      0,
    );
  };

  const handleCriteriaChange = (value: string[]) => {
    const noCriterion = value.length;

    const updatedCriteria = value.map((criterion) => {
      const existingCriterion = selectedCriteria.find(
        (item: any) => item.criterionKey === criterion,
      );
      const criteriaName = criteria.find(
        (item: any) => item.id === criterion,
      )?.criteriaName;
      const weight = parseFloat((1 / noCriterion).toFixed(2));

      return existingCriterion
        ? {
            ...existingCriterion,
            weight, // Update weight but preserve other values
          }
        : {
            criterionKey: criteriaName,
            id: criterion,
            weight,
            operator: null,
            condition: null,
            value: 0,
          };
    });

    setSelectedCriteria(updatedCriteria);

    const updatedTotalWeight = updatedCriteria.reduce(
      (sum, criteria) => sum + criteria.weight,
      0,
    );

    setTotalWeight(updatedTotalWeight);

    // Update form fields while preserving existing values
    form.setFieldsValue({
      recognitionCriteria: updatedCriteria.map((criteria) => ({
        criteriaId: criteria.id || null, // Ensure ID is preserved if present
        criterionKey: criteria.criterionKey,
        weight: criteria.weight,
        operator: criteria.operator, // Preserve operator
        condition: criteria.condition, // Preserve condition
        value: criteria.value, // Preserve value
      })),
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
    updateCriteria({
      id: criteriaItem.id,
      criteriaName: editingCriteriaName,
    }, {
      onSuccess: () => {
        // Update the selectedCriteria to reflect the new name
        const updatedSelectedCriteria = selectedCriteria.map((criteria: any) => 
          criteria.id === criteriaItem.id 
            ? { ...criteria, criterionKey: editingCriteriaName }
            : criteria
        );
        setSelectedCriteria(updatedSelectedCriteria);
        
        // Update form values
        form.setFieldsValue({
          recognitionCriteria: updatedSelectedCriteria
        });

        // Reset editing state
        setEditingCriteriaId(null);
        setEditingCriteriaName('');
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingCriteriaId(null);
    setEditingCriteriaName('');
  };

  const handleDeleteCriteria = (criteriaItem: any) => {
    // You can add a confirmation modal here if needed
    Modal.confirm({
      content: (
        <span className="text-xs text-gray-950 font-semibold">
          Are you sure you want to delete ?
        </span>
      ),
      okText: 'Confirm',
      okButtonProps: {
        className:
          'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600',
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
              (criteria: any) => criteria.id !== criteriaItem.id
            );
            setSelectedCriteria(updatedSelectedCriteria);
            
            // Update form values to remove the deleted criteria
            const currentFormCriteria = form.getFieldValue('criteria') || [];
            const updatedFormCriteria = currentFormCriteria.filter(
              (id: string) => id !== criteriaItem.id
            );
            
            // Recalculate total weight
            setTotalWeight(calculateTotalWeight(updatedSelectedCriteria));
            
            // Update form values
            form.setFieldsValue({
              criteria: updatedFormCriteria,
              recognitionCriteria: updatedSelectedCriteria
            });
          }
        });
      },
    });
  };

  const commonClass = 'text-xs text-gray-950';
  const getLabel = (text: string) => (
    <span className="text-black text-xs font-semibold">{text}</span>
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
    };

    const handleClose = () => {
      form.resetFields();
      onClose();
      setOpenRecognitionType(false);
      setOpenModal(false);
      setSelectedCriteria([]);
      setTotalWeight(0);
    };

    if (selectedRecognitionType === '') {
      createRecognitionType(finalValues, {
        onSuccess: () => {
          handleClose();
        },
      });
    } else {
      const { ...updatedValues } = finalValues;
      updateRecognitionWithCriteria(
        { ...updatedValues, id: selectedRecognitionType },
        {
          onSuccess: () => {
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
            // Set the form value immediately for UI feedback
            const currentCriteria = form.getFieldValue('criteria') || [];
            const updatedCriteria = [...currentCriteria, newCriteriaId];
            form.setFieldsValue({ criteria: updatedCriteria });
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
      // Now the new criteria is available in the list, so update the fields
      const currentCriteria = form.getFieldValue('criteria') || [];
      if (currentCriteria.includes(pendingNewCriteriaId)) {
        handleCriteriaChange(currentCriteria);
        setPendingNewCriteriaId(null); // Reset
      }
    }
  }, [criteria, pendingNewCriteriaId]);

  return (
    <>
      <style>{`
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
        }}
        open={
          openRecognitionType ||
          openModal ||
          parentRecognitionTypeId !== '' ||
          selectedRecognitionType !== ''
        }
        width="40%"
        footer={
          <Form.Item>
            <div className="flex justify-center space-x-5 bottom-8">
              <Popconfirm
                title="Are you sure you want to cancel?"
                onConfirm={() => {
                  form.resetFields();
                  setOpen(false);
                  setParentRecognitionTypeId('');
                  setSelectedRecognitionType('');
                  setOpenRecognitionType(false);
                }}
                okText="Yes"
                cancelText="No"
                placement="top"
              >
                <Button type="default" htmlType="button" className="text-xs">
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
              >
                {selectedRecognitionType !== '' ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        }
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
          >
            <Input
              placeholder="Enter recognition type name"
              className="text-xs text-gray-950 h-10"
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
          >
            <Input.TextArea
              placeholder="Enter a detailed description"
              rows={4}
              className="text-xs text-gray-950"
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
            >
              <Select
                mode="multiple"
                placeholder="Select criteria"
                className="text-xs text-gray-950 h-10"
                onChange={handleCriteriaChange}
                optionRender={(option) => {
                  const criteriaItem = criteria?.find(
                    (c: any) => c.id === option.value,
                  );
                  const isEditing = editingCriteriaId === criteriaItem?.id;

                  return (
                    <div className="flex items-center justify-between w-full">
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
                          />
                          <div className="flex gap-1">
                            <Button
                              icon={<CheckOutlined />}
                              size="small"
                              className="bg-green-500 text-white border-none rounded-md w-6 h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit(criteriaItem);
                              }}
                            />
                            <Button
                              icon={<CloseOutlined />}
                              size="small"
                              className="bg-red-500 text-white border-none rounded-md w-6 h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">
                            {criteriaItem?.criteriaName}
                          </span>
                          {criteriaItem?.criteriaType === 'Created' && (
                            <div className="flex gap-2 ml-2">
                              <Button
                                icon={<GoPencil />}
                                size="small"
                                className="mr-2 bg-blue text-white border-none rounded-md w-5 h-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCriteria(criteriaItem);
                                }}
                              />

                              <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                className="mr-2 bg-red-500 text-white border-none rounded-md w-5 h-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCriteria(criteriaItem);
                                }}
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
                  <Select.Option key={option.id} value={option.id}>
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
            >
              {selectedRecognitionType !== '' && (
                <Form.Item
                  className="w-1/2 text-xs text-gray-950"
                  name={['recognitionCriteria', index, 'id']}
                  initialValue={criteria.id}
                  hidden
                ></Form.Item>
              )}
              <Form.Item
                className="w-1/2 text-xs text-gray-950"
                name={['recognitionCriteria', index, 'criteriaId']}
                initialValue={criteria.id}
                hidden
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
              >
                <Input className={commonClass} disabled />
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
                />
              </Form.Item>

              <Form.Item
                className="w-1/2 text-xs text-gray-950"
                label={getLabel('Operator')}
                name={['recognitionCriteria', index, 'operator']}
                initialValue={criteria.operator}
                rules={[{ required: true, message: 'Please enter operator' }]}
              >
                <Select placeholder="Select operator" className={commonClass}>
                  {Object.values(AggregateOperator).map((operator, opIndex) => (
                    <Select.Option
                      key={`operator-${operator}-${opIndex}`}
                      value={operator}
                      className={commonClass}
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
              >
                <Select placeholder="Select condition" className={commonClass}>
                  {Object.values(ConditionOperator).map(
                    (operator, condIndex) => (
                      <Select.Option
                        key={`condition-${operator}-${condIndex}`}
                        value={operator}
                        className={commonClass}
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
              >
                <Input
                  type="number"
                  placeholder="Enter value"
                  className={commonClass}
                />
              </Form.Item>
              <Image
                src={cancelIcon}
                alt="remove"
                width={16}
                height={16}
                onClick={() => {
                  const updatedCriteria = selectedCriteria.filter(
                    /* eslint-disable @typescript-eslint/naming-convention */
                    (_: any, i: number) => i !== index,
                    /* eslint-enable @typescript-eslint/naming-convention */
                  );
                  setSelectedCriteria(updatedCriteria);
                  setTotalWeight(calculateTotalWeight(updatedCriteria));
                  form.setFieldsValue({
                    criteria: updatedCriteria.map((c: any) => c.id),
                    recognitionCriteria: updatedCriteria,
                  });
                }}
                className="cursor-pointer"
              />
            </div>
          ))}

          {!createCategory && (
            <div
              className={`mt-2 text-xs ${totalWeight !== 1 ? 'text-red-500' : 'text-gray-600'}`}
            >
              Total Weight: {totalWeight}{' '}
              {totalWeight !== 1 && '(Must equal 1)'}
            </div>
          )}
          {!createCategory && (
            <div className="flex">
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
              >
                <Switch />
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
              >
                <Switch />
              </Form.Item>
            </div>
          )}
          {/* Certification Data */}
          {!createCategory && (
            <>
              <Form.Item>
                {({ getFieldValue }) =>
                  getFieldValue('requiresCertification') && (
                    <Space direction="vertical" style={{ width: '100%' }}>
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
                      >
                        <Input
                          placeholder="Enter certification title"
                          className="text-xs text-gray-950"
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
                      >
                        <Input.TextArea
                          placeholder="Enter details for certification"
                          rows={3}
                          className="text-xs text-gray-950"
                        />
                      </Form.Item>
                    </Space>
                  )
                }
              </Form.Item>
              <div className="flex justify-center mb-3">
                <Button
                  className="flex justify-end items-center px-5"
                  icon={<FaPlus />}
                  onClick={() => setIsModalVisible(true)}
                  type="primary"
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
              >
                <Select className="text-xs text-gray-950 h-10">
                  <Select.Option value="weekly">Weekly</Select.Option>
                  <Select.Option value="monthly">Monthly</Select.Option>
                  <Select.Option value="quarterly">Quarterly</Select.Option>
                  <Select.Option value="yearly">Yearly</Select.Option>
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
            >
              <Select className="text-xs text-gray-950">
                {recognitionTypeWithOutCriteria?.items?.map((item: any) => (
                  <Select.Option key={item?.id} value={item?.id}>
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
            >
              <Select
                placeholder="Select a department"
                className="text-black text-xs font-semibold h-10"
              >
                {allDepartmentWithData?.map((dep: any) => (
                  <Option key={dep.id} value={dep.id}>
                    <span className="text-xs font-semibold text-black">
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
            <div className="flex justify-center items-center space-x-4">
              <Button
                type="default"
                className="px-3"
                onClick={() => setIsModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                loading={createCriteriaLoading}
                onClick={() => criteriaForm.submit()}
                type="primary"
                className="px-3"
              >
                Create
              </Button>
            </div>
          }
        >
          <Form
            form={criteriaForm}
            layout="vertical"
            onFinish={onFinishCriteria}
          >
            <Form.Item
              label="Criteria Name"
              name="criteriaName"
              rules={[
                { required: true, message: 'Please enter criteria name' },
              ]}
            >
              <Input
                className="w-full h-[40px] mt-1"
                placeholder="Enter criteria name"
                type="text"
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
            >
              <Input.TextArea
                placeholder="Enter a detailed description"
                rows={4}
                className="text-xs text-gray-950"
              />
            </Form.Item>
          </Form>
        </Modal>
      </CustomDrawerLayout>
    </>
  );
};

export default RecognitionForm;
