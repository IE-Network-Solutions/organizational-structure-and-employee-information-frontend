'use client';
import { Button, Card, Form, Input, Select, Tabs, Pagination } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useEffect, useState } from 'react';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import FeedbackTypeDetail from './_components/feedbackTypeDetail';
import CreateFeedback from './_components/createFeedback';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { FaPlus } from 'react-icons/fa';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Department } from '@/types/dashboard/organization';
import {
  useCreatePerspective,
  useDeletePerspective,
  useUpdatePerspective,
} from '@/store/server/features/CFR/feedback/mutations';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import { Popconfirm } from 'antd';

const { TextArea } = Input;

const Page = () => {
  const [form] = Form.useForm();

  const {
    selectedFeedback,
    variantType,
    activeTab,
    setActiveTab,
    open,
    setOpen,
    setSelectedFeedback,
    editingItem,
    setEditingItem,
    pageSize,
    setPageSize,
    page,
    setPage,
  } = ConversationStore();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();
  const [addPerspectiveModal, setAddPerspectiveModal] = useState(false);
  const { data: departments } = useGetDepartments();
  const { mutate: addPerspective, isLoading: createLoading } =
    useCreatePerspective();
  const { mutate: deletePerspective } = useDeletePerspective();
  const { mutate: updatePerspective, isLoading: updateLoading } =
    useUpdatePerspective();

  const { data: perspectiveData } = useGetAllPerspectives();

  getAllFeedbackTypes;
  const onChange = (key: string) => {
    setActiveTab(key);
  };

  const perspectiveModalHeader = addPerspectiveModal ? (
    <div className="flex flex-col items-center justify-center text-xl font-extrabold text-gray-800 p-4">
      <p>Add New Perspective</p>
    </div>
  ) : null;
  const onCloseHandler = () => {
    form?.resetFields();
    setOpen(false);
    setSelectedFeedback(null);
  };
  const handleEdit = (item: any) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      departmentId: item.departmentId,
    });
  };

  const handleDelete = (id: string) => {
    deletePerspective(id);
  };
  const getDepartment = (id: string) => {
    return departments?.find((item: Department) => item.id === id);
  };
  useEffect(() => {
    setActiveTab(getAllFeedbackTypes?.items?.[0]?.id);
  }, [getAllFeedbackTypes]);

  useEffect(() => {
    if (!editingItem?.id) {
      form.resetFields();
    }
  }, [editingItem]);

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category || '';

  const modalHeader = (
    <div className="flex flex-col items-center justify-center text-xl font-extrabold text-gray-800 p-4">
      <p>
        {selectedFeedback === null
          ? `Add New ${activeTabName}`
          : `Edit New ${activeTabName}`}
      </p>
      <p>{variantType} type</p>
    </div>
  );
  const paginatedData = perspectiveData?.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const items: TabsProps['items'] = [
    ...(getAllFeedbackTypes?.items || []).map((item: FeedbackTypeItems) => ({
      key: item?.id,
      label: item?.category,
      children: <FeedbackTypeDetail feedbackTypeDetail={item} />,
    })),
    {
      key: 'perspective-list',
      label: (
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
        >
          Perspective List
        </div>
      ),
      children: (
        <div>
          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={() => setAddPerspectiveModal(true)}
              className="text-xs"
              icon={<FaPlus className="text-xs" />}
            >
              Add Perspective
            </Button>
          </div>
          {paginatedData?.map((item: any) => (
            <Card className="mx-2 my-2" key={item.id}>
              <div className="flex justify-between items-start">
                <div className="Grid gap-8">
                  <div>
                    <p className="font-bold">{item?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {getDepartment(item?.departmentId)?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item?.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    onClick={() => handleEdit(item)}
                    icon={<Edit2Icon className="w-4 h-4 text-xs" />}
                    type="primary"
                  />
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    onConfirm={() => handleDelete(item?.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      icon={<MdDeleteOutline className="w-4 h-4" />}
                      danger
                      type="primary"
                    />
                  </Popconfirm>
                </div>
              </div>
            </Card>
          ))}
          <div className="flex justify-end mt-4 mb-4">
            <Pagination
              current={page}
              total={perspectiveData?.length || 0}
              pageSize={pageSize}
              onChange={(page, size) => {
                setPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(current, size) => {
                setPageSize(size);
                setPage(1);
              }}
              showSizeChanger={true}
              showTotal={(total) => `Total ${total} items`}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        </div>
      ),
    },
  ];

  const handleCancel = () => {
    form.resetFields();
    setEditingItem(null);
    setAddPerspectiveModal(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await updatePerspective(
          {
            ...values,
            id: editingItem.id,
          },
          {
            onSuccess: () => {
              form.resetFields();
              setEditingItem(null);
              setAddPerspectiveModal(false);
            },
          },
        );
      } else {
        await addPerspective(values, {
          onSuccess: () => {
            form.resetFields();
            setEditingItem(null);
            setAddPerspectiveModal(false);
          },
        });
      }
    } catch (error) {
    } finally {
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-10">
        <span className="font-bold text-lg">Feedback</span>

        <div className="mt-5">
          <Tabs
            defaultActiveKey={getAllFeedbackTypes?.items?.[0]?.id}
            items={items}
            onChange={onChange}
          />
        </div>
      </div>

      <CustomDrawerLayout
        open={open || selectedFeedback?.id}
        onClose={onCloseHandler}
        modalHeader={modalHeader}
        width="30%"
      >
        <CreateFeedback form={form} />
      </CustomDrawerLayout>
      <CustomDrawerLayout
        open={addPerspectiveModal || editingItem?.id}
        onClose={() => handleCancel()}
        modalHeader={editingItem ? 'Edit Perspective' : perspectiveModalHeader}
        width="30%"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            id: editingItem?.id || undefined,
            name: editingItem?.name || '',
            description: editingItem?.description || '',
            departmentId: editingItem?.departmentId || null,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name!' }]}
          >
            <Input placeholder="Enter perspective name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
          >
            <TextArea
              placeholder="Enter perspective description"
              rows={4}
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Select Department"
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select placeholder="Select a department">
              {departments?.map((department: any) => (
                <Select.Option key={department.id} value={department.id}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="flex justify-center mx-10">
            <div className=" w-full bg-[#fff] absolute flex justify-center space-x-5 mt-56">
              <Button
                onClick={() => {
                  form.resetFields();
                  handleCancel();
                }}
                danger
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={!editingItem ? createLoading : updateLoading}
              >
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    </div>
  );
};

export default Page;
