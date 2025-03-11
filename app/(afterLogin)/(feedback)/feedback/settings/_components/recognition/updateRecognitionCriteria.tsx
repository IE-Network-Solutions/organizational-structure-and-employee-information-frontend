// import React, { useEffect } from 'react';
// import { Modal, Form, Select, Input, Switch } from 'antd';
// import { AggregateOperator, ConditionOperator } from '@/types/enumTypes';
// import { ConversationStore } from '@/store/uistate/features/conversation';

// const RecognitionCriteriaModal = ({
//   isOpen,
//   onClose,
//   data,
//   text,
//   onSubmit,
// }: {
//   isOpen: boolean;
//   onClose: any;
//   data?: any;
//   text: string;
//   onSubmit: any;
// }) => {
//   const [form] = Form.useForm();
//   const { recognitionTypeId } = ConversationStore();

//   useEffect(() => {
//     {
//       text === 'Update' &&
//         form.setFieldsValue({
//           recognitionTypeId: data?.recognitionTypeId,
//           id: data?.id,
//           criterionKey: data?.criterionKey,
//           weight: data?.weight,
//           value: data?.value,
//           condition: data?.condition,
//           operator: data?.operator,
//           active: data?.active,
//         });
//     }
//   }, [data, form]);

//   const commonClass = 'text-xs text-gray-950';
//   const getLabel = (text: string) => (
//     <span className="text-black text-xs font-semibold">{text}</span>
//   );
//   const handleAction = () => {
//     form
//       .validateFields()
//       .then((values) => {
//         onSubmit(values);
//         form.resetFields();
//         onClose();
//       })
//       .catch(() => {});
//   };

//   return (
//     <Modal
//       title={`${text} Recognition Criteria`}
//       visible={isOpen}
//       onCancel={onClose}
//       onOk={handleAction}
//       okText={text}
//       cancelText="Cancel"
//     >
//       <Form form={form} layout="vertical" initialValues={data}>
//         <Form.Item
//           name="recognitionTypeId"
//           hidden
//           initialValue={recognitionTypeId}
//         >
//           <Input hidden />
//         </Form.Item>
//         {text === 'Update' && (
//           <Form.Item name="id" hidden>
//             <Input hidden />
//           </Form.Item>
//         )}

//         <Form.Item
//           className="text-xs text-gray-950"
//           label={
//             <span className="text-black text-xs font-semibold">
//               Recognition Criteria
//             </span>
//           }
//           name="criterionKey"
//           rules={[
//             { required: true, message: 'Please select at least one criterion' },
//           ]}
//         >
//           <Select
//             // mode="multiple"
//             placeholder="Select criteria"
//             className="text-xs text-gray-950"
//           >
//             <Select.Option value="KPI">KPI</Select.Option>
//             <Select.Option value="OKR">OKR Score</Select.Option>
//             <Select.Option value="Attendance">Attendance</Select.Option>
//             <Select.Option value="Certificate">Certificate</Select.Option>
//           </Select>
//         </Form.Item>

//         {/* Weight */}
//         <Form.Item
//           label="Weight"
//           name="weight"
//           rules={[{ required: true, message: 'Please enter weight' }]}
//         >
//           <Input type="number" placeholder="Enter weight" />
//         </Form.Item>

//         <Form.Item
//           className="text-xs text-gray-950"
//           label={getLabel('Operator')}
//           name={'operator'}
//           rules={[{ required: true, message: 'Please enter operator' }]}
//         >
//           <Select placeholder="Select operator" className={commonClass}>
//             {Object.values(AggregateOperator).map((operator) => (
//               <Select.Option
//                 key={operator}
//                 value={operator}
//                 className={commonClass}
//               >
//                 {operator}
//               </Select.Option>
//             ))}
//           </Select>
//         </Form.Item>

//         {/* Condition */}
//         <Form.Item
//           className="text-xs text-gray-950"
//           label={getLabel('Condition')}
//           name={'condition'}
//           rules={[{ required: true, message: 'Please enter condition' }]}
//         >
//           <Select placeholder="Select condition" className={commonClass}>
//             {Object.values(ConditionOperator).map((operator) => (
//               <Select.Option
//                 key={operator}
//                 value={operator}
//                 className={commonClass}
//               >
//                 {operator}
//               </Select.Option>
//             ))}
//           </Select>
//         </Form.Item>

//         {/* Value */}
//         <Form.Item
//           label="Value"
//           name="value"
//           rules={[{ required: true, message: 'Please enter value' }]}
//         >
//           <Input type="number" placeholder="Enter value" />
//         </Form.Item>

//         <div className="flex justify-start">
//           <Form.Item
//             className="w-1/2 text-xs text-gray-950"
//             label={
//               <span className="text-black text-xs font-semibold">IsActive</span>
//             }
//             name="active"
//           >
//             <Switch />
//           </Form.Item>
//         </div>
//       </Form>
//     </Modal>
//   );
// };

// export default RecognitionCriteriaModal;
