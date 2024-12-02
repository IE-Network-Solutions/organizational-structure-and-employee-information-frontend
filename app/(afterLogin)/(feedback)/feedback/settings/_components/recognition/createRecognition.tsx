import React, { useState } from "react";
import { Form, Input, Switch, Select, Button, Space, InputNumber, Modal } from "antd";
import { v4 as uuidv4 } from "uuid";
import { useGetDepartmentsWithUsers } from "@/store/server/features/employees/employeeManagment/department/queries";
import { useGetAllRecognitionType } from "@/store/server/features/recognition/queries";
import { AggregateOperator, ConditionOperator } from "@/types/enumTypes";
import { useAddRecognitionType } from "@/store/server/features/recognition/mutation";

interface RecognitionFormValues {
  id: string;
  name: string;
  description: string;
  isMonetized: boolean;
  requiresCertification: boolean;
  certificationData?: {
    title: string;
    details: string;
  };
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  parentTypeId?: string;
  departmentId: string;
}
const { Option } = Select;

const RecognitionForm= () => {
  const [form] = Form.useForm();
  const { data: allDepartmentWithData } = useGetDepartmentsWithUsers();
  const { data: recognitionType } = useGetAllRecognitionType();
  const { mutate: createRecognitionType } = useAddRecognitionType();

  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  const handleCriteriaChange = (value: string[]) => {
    setSelectedCriteria(value);
  };
  const commonClass = "text-xs text-gray-950";
  const getLabel = (text:string) => (
    <span className="text-black text-xs font-semibold">{text}</span>
  );
console.log(recognitionType,"recognitionType")
  const onFinish = (values: RecognitionFormValues) => {
    createRecognitionType(values);
    // console.log("Form Submitted: ", values);
  };
// console.log(selectedCriteria,"selectedCriteria")
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="text-xs text-gray-950"
      initialValues={{
        isMonetized: false,
        requiresCertification: false,
        frequency: "monthly",
      }}
    >
      <Form.Item
        label={
            <span className="text-black text-xs font-semibold">
              Recognition Name
            </span>
         }  
        name="name"
        rules={[{ required: true, message: "Please enter the recognition name" }]}
      >
        <Input
          placeholder="Enter recognition type name"
          className="text-xs text-gray-950"
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
        rules={[{ required: true, message: "Please enter a description" }]}
      >
        <Input.TextArea
          placeholder="Enter a detailed description"
          rows={4}
          className="text-xs text-gray-950"
        />
      </Form.Item>
      <Form.Item
        className="text-xs text-gray-950"
        label={
          <span className="text-black text-xs font-semibold">
            Recognition Criteria
          </span>
        }
        name="criteria"
        rules={[
          { required: true, message: "Please select at least one criterion" },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select criteria"
          className="text-xs text-gray-950"
          onChange={handleCriteriaChange}
        >
          <Select.Option value="KPI">KPI</Select.Option>
          <Select.Option value="OKR">OKR Score</Select.Option>
          <Select.Option value="Attendance">Attendance</Select.Option>
          <Select.Option value="Certificate">Certificate</Select.Option>
        </Select>
      </Form.Item>
      {selectedCriteria?.map((criteria, index) => (
      <div className="flex gap-1" key={criteria}>
        {/* Criteria Name */}
        <Form.Item
          labelAlign="left"
          className="w-1/2 text-xs text-gray-950"
          label={getLabel("Criteria")}
          name={['recognitionCriteria', index, 'name']} // Scoped name
          initialValue={criteria}
          rules={[
            { required: true, message: "Please select at least one criterion" },
          ]}
        >
          <Input className={commonClass} disabled />
        </Form.Item>

        {/* Weight */}
        <Form.Item
          className="w-1/2 text-xs text-gray-950"
          label={getLabel("Weight")}
          name={['recognitionCriteria', index, 'weight']} // Scoped name
          rules={[{ required: true, message: "Please enter weight" }]}
        >
          <Input
            type="number"
            placeholder="Enter weight"
            className={commonClass}
          />
        </Form.Item>

        {/* Operator */}
        <Form.Item
          className="w-1/2 text-xs text-gray-950"
          label={getLabel("Operator")}
          name={['recognitionCriteria', index, 'operator']} // Scoped name
          rules={[{ required: true, message: "Please enter operator" }]}
        >
          <Select placeholder="Select operator" className={commonClass}>
            {Object.values(AggregateOperator)?.map((operator) => (
              <Select.Option key={operator} value={operator} className={commonClass}>
                {operator}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Condition */}
        <Form.Item
          className="w-1/2 text-xs text-gray-950"
          label={getLabel("Condition")}
          name={['recognitionCriteria', index, 'condition']} // Scoped name
          rules={[{ required: true, message: "Please enter condition" }]}
        >
          <Select placeholder="Select condition" className={commonClass}>
            {Object.values(ConditionOperator)?.map((operator) => (
              <Select.Option key={operator} value={operator} className={commonClass}>
                {operator}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Value */}
        <Form.Item
          className="w-1/2 text-xs text-gray-950"
          label={getLabel("Value")}
          name={['recognitionCriteria', index, 'value']} // Scoped name
          rules={[{ required: true, message: "Please enter value" }]}
        >
          <Input
            type="number"
            placeholder="Enter value"
            className={commonClass}
          />
        </Form.Item>
      </div>
    ))}


      <Form.Item 
      className="text-xs text-gray-950"
      label={
            <span className="text-black text-xs font-semibold">
            Monetized
            </span>
        } 
      name="isMonetized" 
      valuePropName="checked">
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
      >
        <Switch />
      </Form.Item>

      {/* Certification Data */}
      <Form.Item shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue("requiresCertification") && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Form.Item
                className="text-xs text-gray-950"
                label={
                    <span className="text-black text-xs font-semibold">
                      Certification Title
                    </span>
                 }
                name={["certificationData", "title"]}
                rules={[
                  {
                    required: true,
                    message: "Please enter certification title",
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
                name={["certificationData", "details"]}
                rules={[
                  {
                    required: true,
                    message: "Please enter certification details",
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

      <Form.Item
        className="text-xs text-gray-950"
        label={
            <span className="text-black text-xs font-semibold">
              Frequency
            </span>
         }
        name="frequency"
        rules={[{ required: true, message: "Please select a frequency" }]}
      >
        <Select className="text-xs text-gray-950">
          <Select.Option value="weekly">Weekly</Select.Option>
          <Select.Option value="monthly">Monthly</Select.Option>
          <Select.Option value="quarterly">Quarterly</Select.Option>
          <Select.Option value="yearly">Yearly</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item 
        className="text-xs text-gray-950"
        label={
            <span className="text-black text-xs font-semibold">
            Parent Type
            </span>
        }
            name="parentTypeId">
            <Input
                placeholder="Enter parent type ID (optional)"
                className="text-xs text-gray-950"
            />
      </Form.Item>

      <Form.Item
        className="text-xs text-gray-950"
        label={
            <span className="text-black text-xs font-semibold">
              Department
            </span>
         }
        name="departmentId"
        rules={[{ required: true, message: "Please enter the department ID" }]}
      >
       <Select
          placeholder="Select a department"
          className="text-black text-xs font-semibold"
        >
          {allDepartmentWithData?.map((dep:any) => (
            <Option key={dep.id} value={dep.id}>
              <span className="text-xs font-semibold text-black">
                {dep.name}
              </span>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="text-xs">
          Create Recognition Type
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RecognitionForm;
