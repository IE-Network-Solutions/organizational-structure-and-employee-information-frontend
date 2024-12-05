import React, { useEffect, useState } from "react";
import { Form, Input, Switch, Select, Button, Space, InputNumber, Modal } from "antd";
import { v4 as uuidv4 } from "uuid";
import { useGetDepartmentsWithUsers } from "@/store/server/features/employees/employeeManagment/department/queries";
import { useGetAllRecognitionType, useGetAllRecognitionTypeWithOutCriteria, useGetRecognitionTypeById } from "@/store/server/features/CFR/recognition/queries";
import { AggregateOperator, ConditionOperator } from "@/types/enumTypes";
import { useAddRecognitionType, useUpdateRecognitionType } from "@/store/server/features/CFR/recognition/mutation";
import { ConversationStore } from "@/store/uistate/features/conversation";
import { VscRepoFetch } from "react-icons/vsc";

interface RecognitionFormValues {
  id: string;
  name: string;
  description: string;
  isMonetized: boolean;
  criteria?:string[];
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
interface PropsData{
  createCategory?:boolean
}
const RecognitionForm:React.FC<PropsData>= ({createCategory=false}) => {
  const [form] = Form.useForm();
  const {setOpenRecognitionType,parentRecognitionTypeId,setSelectedRecognitionType,selectedRecognitionType,recognitionTypeId } = ConversationStore();

  const { data: allDepartmentWithData } = useGetDepartmentsWithUsers();
  const { data: recognitionTypeWithOutCriteria } = useGetAllRecognitionTypeWithOutCriteria();
  const { data: recognitionTypeById } = useGetRecognitionTypeById(selectedRecognitionType);

  const { mutate: createRecognitionType,isLoading:createLoading } = useAddRecognitionType();
  const { mutate: updateRecognitionType ,isLoading:updateLoading} = useUpdateRecognitionType();


  const [selectedCriteria, setSelectedCriteria] = useState<any>([]);
  const handleCriteriaChange = (value: string[]) => {
    const updatedCriteria = value.map((criterion) => {
      const existingCriterion = selectedCriteria.find((item:any) => item.criterionKey === criterion);
      return existingCriterion || { criterionKey: criterion, weight: 0, operator: null, condition: null, value: 0 };
    });
    setSelectedCriteria(updatedCriteria);
  };


  console.log(parentRecognitionTypeId,"recognitionTypeWithOutCriteria")
  const commonClass = "text-xs text-gray-950";
  const getLabel = (text:string) => (
    <span className="text-black text-xs font-semibold">{text}</span>
  );
  const onFinish = (values: RecognitionFormValues) => {
    console.log("Form Submitted: ", values);
    if(selectedRecognitionType===''){
      createRecognitionType(values,{
        onSuccess:()=>{
          // setSelectedRecognitionType('');
          setOpenRecognitionType(false);
        }
      });
    }
    else{
      const { criteria, ...updatedValues } = values; // Destructure to omit 'criteriaKey'
      updateRecognitionType(
        {...updatedValues,
           id:selectedRecognitionType
        },{
        onSuccess:()=>{
          setSelectedRecognitionType('');
          setOpenRecognitionType(false);
        }
      });
    }


  };
  useEffect(() => {
    // Update the `parentTypeId` field first
    form.setFieldsValue({       
      parentTypeId: parentRecognitionTypeId,
    });
  
    if (selectedRecognitionType && recognitionTypeById) {
      // Update form fields with `recognitionTypeById` values
      form.setFieldsValue({
        name: recognitionTypeById.name || '', // Fallback to empty string
        description: recognitionTypeById.description || '',
        // Uncomment and map criteria keys if needed
        // criteria: recognitionTypeById.recognitionCriteria?.map((item: any) => item?.criterionKey) || [],
        isMonetized: recognitionTypeById.isMonetized ?? false, // Default to false
        requiresCertification: recognitionTypeById.requiresCertification ?? false,
        frequency: recognitionTypeById.frequency || '', // Fallback to empty string
        departmentId: recognitionTypeById.departmentId || null, // Default to null
        parentTypeId: recognitionTypeById.parentTypeId || parentRecognitionTypeId, // Fallback to parentTypeId
      });
    }
  }, [recognitionTypeById, parentRecognitionTypeId, form, selectedRecognitionType]);
  
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
     {(!createCategory && !selectedRecognitionType) && 
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
      }
       {selectedCriteria.map((criteria:any, index:number) => (
          <div className="flex gap-1" key={criteria.criterionKey}>
           {selectedRecognitionType!=='' &&
            <Form.Item
              labelAlign="left"
              className="w-1/2 text-xs text-gray-950"
              label={getLabel("Criteria")}
              name={['recognitionCriteria', index, 'id']}
              initialValue={criteria.id ?? ''}
              hidden
              rules={[
                { required: true, message: "Please select at least one criterion" },
              ]}
              
            >
              <Input hidden className={commonClass} disabled />
            </Form.Item>}
            {/* Criteria Name */}
            <Form.Item
              labelAlign="left"
              className="w-1/2 text-xs text-gray-950"
              label={getLabel("Criteria")}
              name={['recognitionCriteria', index, 'criterionKey']}
              initialValue={criteria.criterionKey}
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
              name={['recognitionCriteria', index, 'weight']}
              initialValue={criteria.weight}
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
              name={['recognitionCriteria', index, 'operator']}
              initialValue={criteria.operator}
              rules={[{ required: true, message: "Please enter operator" }]}
            >
              <Select placeholder="Select operator" className={commonClass}>
                {Object.values(AggregateOperator).map((operator) => (
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
              name={['recognitionCriteria', index, 'condition']}
              initialValue={criteria.condition}
              rules={[{ required: true, message: "Please enter condition" }]}
            >
              <Select placeholder="Select condition" className={commonClass}>
                {Object.values(ConditionOperator).map((operator) => (
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
              name={['recognitionCriteria', index, 'value']}
              initialValue={criteria.value}
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
          initialValue={false}
        >
          <Switch />
        </Form.Item>
      </div>
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

      {!createCategory&&
      <Form.Item 
        className="text-xs text-gray-950"
        label={
            <span className="text-black text-xs font-semibold">
            Parent Type
            </span>
        }
        initialValue={parentRecognitionTypeId}
        name="parentTypeId">
              <Select className="text-xs text-gray-950">
                {recognitionTypeWithOutCriteria?.items?.map((item:any)=>(
                  <Select.Option value={item?.id}>{item?.name}</Select.Option>
                ))}
              </Select>
            {/* <Input
                placeholder="Enter parent type ID (optional)"
                className="text-xs text-gray-950"
            /> */}
      </Form.Item>
       }
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
                {dep?.name}
              </span>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item >
        <div className="flex justify-center gap-4">
        <Button  type="primary" htmlType="submit" className="text-xs">
          {selectedRecognitionType!=='' ? "Update":"Create"}
        </Button>
        <Button  onClick={()=>setSelectedRecognitionType('')} type="primary" htmlType="button" className="text-xs">
          Cancel
        </Button>
        </div> 
      </Form.Item>
    </Form>
  );
};

export default RecognitionForm;
