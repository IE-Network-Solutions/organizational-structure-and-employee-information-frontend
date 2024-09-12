import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Col, Form, Input, InputNumber, Row } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';

const TnaCommitmentSidebar = () => {
  const {
    isShowCommitmentSidebar: isShow,
    setIsShowCommitmentSidebar: setIsShow,
  } = useTnaSettingsStore();
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      onClick: () => onClose(),
    },
  ];

  const onClose = () => {
    setIsShow(false);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            Add Commitment Rule
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form layout="vertical" requiredMark={CustomLabel}>
          <Form.Item
            name="title"
            label="Name"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input className="control" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input.TextArea
              className="control-tarea"
              rows={6}
              placeholder="Enter the Description of the commitment rule"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="min"
                label="Amount Min"
                rules={[{ required: true, message: 'Required' }]}
                className="form-item"
              >
                <InputNumber
                  min={0}
                  className="control-number"
                  placeholder="0.00"
                  suffix="$"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max"
                label="Amount Max"
                rules={[{ required: true, message: 'Required' }]}
                className="form-item"
              >
                <InputNumber
                  min={0}
                  className="control-number"
                  placeholder="0.00"
                  suffix="$"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="period "
            label="Commitment Period "
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <InputNumber
              min={0}
              className="control-number"
              placeholder="0.00"
              suffix="Days"
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TnaCommitmentSidebar;
