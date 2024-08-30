import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Col, DatePicker, Form, Input, Row, Select, Space, Upload } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { classNames } from '@/utils/classNames';
import { TbFileUpload } from 'react-icons/tb';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';

const NewLeaveRequestSidebar = () => {
  const { isShowNewLeaveRequestSidebar, setIsShowNewLeaveRequestSidebar } =
    useMyTimesheetStore();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShowNewLeaveRequestSidebar(false),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => setIsShowNewLeaveRequestSidebar(false),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';
  const customFieldsClass = classNames('', undefined, [
    'font-semibold',
    'text-sm',
    'text-gray-900',
    'h-[54px]',
    'rounded-lg',
    'border',
    'border-gray-200',
    'flex',
    'items-center',
    'justify-between',
    'hover:border-primary',
    'transition-colors',
    'duration-150',
    'px-[11px]',
    'cursor-pointer',
    'w-full',
  ]);

  return (
    isShowNewLeaveRequestSidebar && (
      <CustomDrawerLayout
        open={isShowNewLeaveRequestSidebar}
        onClose={() => setIsShowNewLeaveRequestSidebar(false)}
        modalHeader={
          <CustomDrawerHeader>Add New Leave Request</CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          name="new-leave-request"
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
        >
          <Space className="w-full" direction="vertical" size={12}>
            <Form.Item
              name="type"
              label="Leave Type"
              required
              className={itemClass}
            >
              <Select
                className={controlClass}
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' },
                ]}
                placeholder="Select Type"
              />
            </Form.Item>
            <Form.Item name="isHalfDay" className={itemClass}>
              <CustomRadio value="isHalf" label="Half Day" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date "
                  required
                  className={itemClass}
                >
                  <DatePicker className={controlClass} format="DD MMM YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  required
                  className={itemClass}
                >
                  <DatePicker className={controlClass} format="DD MMM YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="note" label="Note" className={itemClass}>
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              name="attachment"
              label="Attachment"
              className={itemClass}
            >
              <Upload className="w-full" accept=".pdf,.docx,.png,.jpeg">
                <button
                  className={classNames('mt-2.5', undefined, [
                    customFieldsClass,
                  ])}
                >
                  Upload attachment
                  <TbFileUpload size={18} className="text-gray-900" />
                </button>
              </Upload>
              <div className="text-xs font-medium text-gray-600 mt-6 text-center">
                Max file size : 5MB. File format : pdf, docx, png, and jpeg
              </div>
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default NewLeaveRequestSidebar;
