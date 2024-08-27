'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import LeaveManagementTable from './_components/leaveManagementTable';
import { Button, Col, Input, Popover, Row, Space } from 'antd';
import { IoSearchOutline } from 'react-icons/io5';
import CustomButton from '@/components/common/buttons/customButton';
import { TbFileDownload, TbLayoutList } from 'react-icons/tb';
import React from 'react';
import { LuBookmark } from 'react-icons/lu';

const LeaveManagement = () => {
  const buttonClass = 'text-xs font-bold w-full h-[29px] min-w-[125px]';

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <BlockWrapper>
        <PageHeader title="Leave Management">
          <Space size={20}>
            <Input
              placeholder="Search employee"
              className="h-14 text-gray-900 w-[300px]"
              suffix={<IoSearchOutline size={20} className="text-gray-900" />}
            />

            <Popover
              trigger="click"
              placement="bottomRight"
              title={
                <div className="text-base text-gray-900 font-bold">
                  What file you want to export?
                </div>
              }
              content={
                <div className="pt-4">
                  <Row gutter={20}>
                    <Col span={12}>
                      <Button
                        size="small"
                        className={buttonClass}
                        type="primary"
                        icon={<TbLayoutList size={16} />}
                      >
                        Excel
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        size="small"
                        className={buttonClass}
                        type="primary"
                        icon={<LuBookmark size={16} />}
                      >
                        PDF
                      </Button>
                    </Col>
                  </Row>
                </div>
              }
            >
              <CustomButton
                title="Download CSV"
                icon={<TbFileDownload size={20} />}
              />
            </Popover>
          </Space>
        </PageHeader>
        <LeaveManagementTable />
      </BlockWrapper>
    </div>
  );
};

export default LeaveManagement;
