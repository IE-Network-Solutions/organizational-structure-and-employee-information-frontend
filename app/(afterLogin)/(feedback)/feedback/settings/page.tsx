'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import { OrganizationalDevelopmentSettingsStore } from '@/store/uistate/features/feedback/settings';
import { Card, Col, Row, Typography } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import OrganizationalDevelopmentSettingsDrawer from './_components/settingsDrawer';
import ODQuestionsDisplay from './_components/ODQuestionsDisplay';
import { CalendarDays } from 'lucide-react';

const { Title } = Typography;

const OrganizationalDevelopmentSettings: React.FC = () => {
  const { setIsOpen } = OrganizationalDevelopmentSettingsStore();

  const showDrawer = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div className="bg-[#F5F5F5] px-2 h-auto min-h-screen w-full">
      <div className="flex gap-2 items-center mb-4">
        <CustomBreadcrumb
          title="Settings"
          subtitle="Organizational Development Settings"
        />
      </div>
      <Row gutter={[16, 24]}>
        <Col lg={8} md={10} xs={24}>
          <Card>
            <div className="bg-[#F5F5F5] p-4 rounded-md flex items-center justify-center gap-2">
              <CalendarDays size={18} color="#2f78ee" />
              <p className="text-sm font-semibold">Custom fields</p>
            </div>
          </Card>
        </Col>
        <Col lg={16} md={14} xs={24}>
          <Card>
            <div className="flex items-center justify-between">
              <Title level={5}>Custom Fields</Title>
              <CustomButton
                title="New Field"
                id="createUserButton"
                icon={<FaPlus size={13} className="mr-2" />}
                onClick={showDrawer}
                className="bg-blue-600 hover:bg-blue-700 h-12 py-5 text-medium font-semibold"
              />
              <OrganizationalDevelopmentSettingsDrawer onClose={onClose} />
            </div>
            <ODQuestionsDisplay />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrganizationalDevelopmentSettings;
