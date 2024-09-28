import { Button, Col, Form, FormInstance, Row, Tree, TreeDataNode } from 'antd';
import React from 'react';
import { CiCircleInfo } from 'react-icons/ci';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import DynamicJobForm from './dynamicJobForm';
import { useCreateJobs } from '@/store/server/features/recruitment/job/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { v4 as uuidv4 } from 'uuid';

const treeData: TreeDataNode[] = [
  {
    title: 'Choose your custom template',
    key: '0',
    children: [
      {
        title: 'child 1',
        key: '0-0',
        disabled: false,
        className: 'py-2',
      },
      {
        title: 'child 2',
        key: '0-1',
        disableCheckbox: false,
        className: 'py-2',
      },
    ],
  },
];

const staticField = [
  { key: '1', name: 'Full Name Input Field' },
  { key: '2', name: 'CV Upload File' },
  { key: '3', name: 'CGPA' },
  { key: '4', name: 'Email' },
  { key: '5', name: 'Phone Number' },
];
interface ApplicationFormProps {
  stepChange: (value: number) => void;
  form: FormInstance;
}
const CreateApplicationForm: React.FC<ApplicationFormProps> = ({
  stepChange,
  form,
}) => {
  const { expandedKeys, setExpandedKeys, questions, setAddNewDrawer } =
    useJobState();
  const { mutate: createJob } = useCreateJobs();
  const onExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys);
  };

  const handlePublish = async () => {
    try {
      const createNewJobFormValues = form.getFieldsValue();
      console.log(createNewJobFormValues, 'createNewJobFormValues');
      // const formattedValues = {
      //   questions: [
      //     createNewJobFormValues?.map((e: any) => {
      //       return {
      //         ...e,
      //         field: e?.questions?.field?.map((field: any) => ({
      //           key: uuidv4(),
      //           value: field,
      //         })),
      //       };
      //     }),
      //   ],
      // };
      // const combinedValues = {
      //   createNewJobFormValues,
      //   // formattedValues,
      // };

      createJob(createNewJobFormValues);
      setAddNewDrawer(false);
    } catch {
      NotificationMessage.error({
        message: 'Publish Failed',
        description: 'There was an error publishing Add new Job.',
      });
    }
  };
  return (
    <div>
      <>
        <div className="flex items-center justify-start gap-1">
          <span className="text-md font-medium">Choose your Custom field</span>
          <span className="text-red-500">*</span>
        </div>
        <div className="rounded-md border border-gray-200 p-2 m-2">
          <Tree
            checkable
            defaultSelectedKeys={['0-1']}
            // defaultExpandAll
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            treeData={treeData}
            blockNode
          />
        </div>
      </>
      <div className="my-4">
        <div className="text-md font-semibold">Existing Fields</div>
        <div className="flex items-center justify-start text-[10px] text-gray-400 font-normal gap-1 my-1">
          <CiCircleInfo />
          These fields are automatically created for you-no need to set them up
          again. Effortlessly integrated and ready to use!
        </div>
        <div>
          <Row gutter={16}>
            {staticField?.map((item: any) => (
              <Col xs={24} sm={24} lg={12} md={12} xl={12}>
                <div className="w-full rounded-md border-gray-200 border p-4 bg-gray-100 my-2 text-sm font-normal">
                  {item?.name}
                </div>
              </Col>
            ))}
          </Row>
        </div>
        <DynamicJobForm form={form} />
      </div>
      <Form.Item>
        <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-6">
          <Button
            onClick={() => stepChange(0)}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
          >
            Back
          </Button>
          <Button
            onClick={handlePublish}
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
          >
            Publish
          </Button>
        </div>
      </Form.Item>
    </div>
  );
};

export default CreateApplicationForm;
