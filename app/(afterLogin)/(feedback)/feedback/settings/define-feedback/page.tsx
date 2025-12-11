'use client';
import { Button, Card, Form, Input, Select, Tabs } from 'antd';
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
import CustomPagination from '@/components/customPagination';

const { TextArea } = Input;

const Page = () => {
  const [form] = Form.useForm();

  const {
    setActiveTab,
    activeTab,
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

  // const onCloseHandler = () => {
  //   form?.resetFields();
  //   setOpen(false);
  //   setSelectedFeedback(null);
  // };
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
    // Only set activeTab if it's not already set or if the current activeTab is not valid
    if (getAllFeedbackTypes?.items?.length > 0) {
      const isValidActiveTab = getAllFeedbackTypes.items.some(
        (item: FeedbackTypeItems) => item.id === activeTab,
      );
      if (!isValidActiveTab) {
        setActiveTab(getAllFeedbackTypes.items[0].id);
      }
    }
  }, [getAllFeedbackTypes, activeTab]);

  useEffect(() => {
    if (!editingItem?.id) {
      form.resetFields();
    }
  }, [editingItem]);

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category || '';

  // const modalHeader = (
  //   <div className="flex flex-col items-center justify-center text-xl font-extrabold text-gray-800 p-4">
  //     <p>
  //       {selectedFeedback === null
  //         ? `Add New ${activeTabName}`
  //         : `Edit New ${activeTabName}`}
  //     </p>
  //     <p>{variantType} type</p>
  //   </div>
  // );
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
          <div className="flex justify-end" data-cy="settings-define-feedback-perspective-actions" id="settingsDefineFeedbackPerspectiveActions">
            <Button
              type="primary"
              onClick={() => setAddPerspectiveModal(true)}
              className="text-xs"
              icon={<FaPlus className="text-xs" />}
              data-cy="settings-define-feedback-add-perspective-button"
              id="settingsDefineFeedbackAddPerspectiveButton"
            >
              <span className="hidden md:inline"> Add Perspective</span>
            </Button>
          </div>
          {paginatedData?.map((item: any) => (
            <Card className="mx-2 my-2" key={item.id} data-cy={`settings-define-feedback-perspective-card-${item.id}`} id={`settingsDefineFeedbackPerspectiveCard${item.id}`}>
              <div className="flex justify-between items-start" data-cy={`settings-define-feedback-perspective-card-content-${item.id}`} id={`settingsDefineFeedbackPerspectiveCardContent${item.id}`}>
                <div className="Grid gap-8" data-cy={`settings-define-feedback-perspective-card-info-${item.id}`} id={`settingsDefineFeedbackPerspectiveCardInfo${item.id}`}>
                  <div data-cy="settings-define-feedback-perspective-name-container" id="settingsDefineFeedbackPerspectiveNameContainer">
                    <p className="font-bold" data-cy={`settings-define-feedback-perspective-name-${item.id}`} id={`settingsDefineFeedbackPerspectiveName${item.id}`}>{item?.name}</p>
                  </div>
                  <div data-cy="settings-define-feedback-perspective-department-container" id="settingsDefineFeedbackPerspectiveDepartmentContainer">
                    <p className="text-gray-600" data-cy={`settings-define-feedback-perspective-department-${item.id}`} id={`settingsDefineFeedbackPerspectiveDepartment${item.id}`}>
                      {getDepartment(item?.departmentId)?.name}
                    </p>
                    <p className="text-xs text-gray-400" data-cy={`settings-define-feedback-perspective-date-${item.id}`} id={`settingsDefineFeedbackPerspectiveDate${item.id}`}>
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
                <div className="flex gap-2" data-cy={`settings-define-feedback-perspective-card-actions-${item.id}`} id={`settingsDefineFeedbackPerspectiveCardActions${item.id}`}>
                  <Button
                    size="small"
                    onClick={() => handleEdit(item)}
                    icon={<Edit2Icon className="w-4 h-4 text-xs" />}
                    type="primary"
                    data-cy={`settings-define-feedback-perspective-edit-button-${item.id}`}
                    id={`settingsDefineFeedbackPerspectiveEditButton${item.id}`}
                  />
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    onConfirm={() => handleDelete(item?.id)}
                    okText="Yes"
                    cancelText="No"
                    data-cy={`settings-define-feedback-perspective-delete-confirm-${item.id}`}
                    id={`settingsDefineFeedbackPerspectiveDeleteConfirm${item.id}`}
                  >
                    <Button
                      size="small"
                      icon={<MdDeleteOutline className="w-4 h-4" />}
                      danger
                      type="primary"
                      data-cy={`settings-define-feedback-perspective-delete-button-${item.id}`}
                      id={`settingsDefineFeedbackPerspectiveDeleteButton${item.id}`}
                    />
                  </Popconfirm>
                </div>
              </div>
            </Card>
          ))}
          <CustomPagination
            current={page}
            total={perspectiveData?.length || 0}
            pageSize={pageSize}
            onChange={(page, size) => {
              setPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            data-cy="settings-define-feedback-perspective-pagination"
          />
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
    <div className="p-5 rounded-2xl bg-white h-full" data-cy="settings-define-feedback-page" id="settingsDefineFeedbackPage">
      <div className="flex flex-col gap-10 " data-cy="settings-define-feedback-content" id="settingsDefineFeedbackContent">
        <span className="font-bold text-lg" data-cy="settings-define-feedback-title" id="settingsDefineFeedbackTitle">Feedback</span>

        <div className="mt-5" data-cy="settings-define-feedback-tabs-container" id="settingsDefineFeedbackTabsContainer">
          <Tabs
            defaultActiveKey={getAllFeedbackTypes?.items?.[0]?.id}
            items={items}
            onChange={onChange}
            data-cy="settings-define-feedback-tabs"
            id="settingsDefineFeedbackTabs"
          />
        </div>
      </div>

      {/* <CustomDrawerLayout
        open={open || selectedFeedback?.id}
        onClose={onCloseHandler}
        modalHeader={modalHeader}
        width="30%"
      > */}
      <CreateFeedback form={form} activeTabName={activeTabName} />
      {/* </CustomDrawerLayout> */}
      <CustomDrawerLayout
        open={addPerspectiveModal || editingItem?.id}
        onClose={() => handleCancel()}
        modalHeader={editingItem ? 'Edit Perspective' : perspectiveModalHeader}
        footer={
          <Form.Item data-cy="settings-define-feedback-perspective-form-footer" id="settingsDefineFeedbackPerspectiveFormFooter">
            <div className=" w-full bg-[#fff] absolute flex justify-center space-x-5 mt-5" data-cy="settings-define-feedback-perspective-form-actions" id="settingsDefineFeedbackPerspectiveFormActions">
              <Button
                onClick={() => {
                  form.resetFields();
                  handleCancel();
                }}
                data-cy="settings-define-feedback-perspective-cancel-button"
                id="settingsDefineFeedbackPerspectiveCancelButton"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={!editingItem ? createLoading : updateLoading}
                data-cy="settings-define-feedback-perspective-submit-button"
                id="settingsDefineFeedbackPerspectiveSubmitButton"
              >
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        }
        width="30%"
        data-cy="settings-define-feedback-perspective-drawer"
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
          data-cy="settings-define-feedback-perspective-form"
          id="settingsDefineFeedbackPerspectiveForm"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name!' }]}
            data-cy="settings-define-feedback-perspective-name-field"
            id="settingsDefineFeedbackPerspectiveNameField"
          >
            <Input placeholder="Enter perspective name" data-cy="settings-define-feedback-perspective-name-input" id="settingsDefineFeedbackPerspectiveNameInput" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
            data-cy="settings-define-feedback-perspective-description-field"
            id="settingsDefineFeedbackPerspectiveDescriptionField"
          >
            <TextArea
              placeholder="Enter perspective description"
              rows={4}
              maxLength={500}
              data-cy="settings-define-feedback-perspective-description-textarea"
              id="settingsDefineFeedbackPerspectiveDescriptionTextarea"
            />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Select Department"
            rules={[{ required: true, message: 'Please select a department' }]}
            data-cy="settings-define-feedback-perspective-department-field"
            id="settingsDefineFeedbackPerspectiveDepartmentField"
          >
            <Select placeholder="Select a department" data-cy="settings-define-feedback-perspective-department-select" id="settingsDefineFeedbackPerspectiveDepartmentSelect">
              {departments?.map((department: any) => (
                <Select.Option key={department.id} value={department.id} data-cy={`settings-define-feedback-perspective-department-select-option-${department.id}`} id={`settingsDefineFeedbackPerspectiveDepartmentSelectOption${department.id}`}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    </div>
  );
};

export default Page;
