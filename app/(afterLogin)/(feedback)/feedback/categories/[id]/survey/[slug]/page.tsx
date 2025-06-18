'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import {
  GraphType,
  useOrganizationalDevelopment,
} from '@/store/uistate/features/organizationalDevelopment';
import { Col, Row, Select, Skeleton, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import IndividualResponses from './_components/individualResponses';
import ActionPlans from './_components/actionPlans';
import CreateActionPlan from './_components/createActionPlan';
import Questions from './_components/questions';
import { useGetFormsByID } from '@/store/server/features/feedback/form/queries';
import { useRouter } from 'next/navigation';

const { Option } = Select;
interface Params {
  slug: string;
}
interface FormDetailProps {
  params: Params;
}
function Page({ params: { slug } }: FormDetailProps) {
  const { activeTab, setActiveTab, setOpen, setGraphType } =
    useOrganizationalDevelopment();

  const { data: formsData, isLoading: isFormDataLoading } =
    useGetFormsByID(slug);

  const router = useRouter();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="mt-4">
          <p className="font-semibold">Questions</p>
        </span>
      ),
      children: <Questions id={slug} />,
      className: 'text-gray-950 font-semibold ',
    },
    {
      key: '2',
      label: (
        <span className="mt-4">
          <p className="font-semibold">Responses</p>
        </span>
      ),
      children: <IndividualResponses id={slug} />,
      className: 'text-gray-950 font-semibold',
    },
    // {
    //   key: '3',
    //   label: (
    //     <span className="mt-4">
    //       <p className="font-semibold">Summary Responses</p>
    //     </span>
    //   ),
    //   children: <SummaryResponses id={slug} />,
    //   className: 'text-gray-950 font-semibold',
    // },
    {
      key: '4',
      label: (
        <span className="mt-4">
          <p className="font-semibold">Action Plans</p>
        </span>
      ),
      children: <ActionPlans id={slug} />,
      className: 'text-gray-950 font-semibold',
    },
  ];
  const handleChangeGraphType = (e: GraphType) => {
    setGraphType(e);
  };
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="flex flex-wrap justify-between items-center p-2">
      <div className="flex gap-4">
        <ArrowLeftOutlined
          className="cursor-pointer"
          onClick={() => router.back()}
        />
        <CustomBreadcrumb
          title={
            isFormDataLoading ? (
              <Skeleton.Input active size="small" />
            ) : (
              formsData?.name
            )
          }
          subtitle=""
          items={[
            { title: 'Home', href: '/' },
            {
              title: 'Tenants',
              href: '/tenant-manuser_typem"098765445676"/tenants',
            },
          ]}
        />
      </div>

      {activeTab === '4' && (
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <CustomButton
            title="Create New Action Plan"
            id="createUserButton"
            icon={<PlusOutlined className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <CreateActionPlan onClose={onClose} id={slug} />
        </div>
      )}
     
      <Row justify="center" style={{ width: '100%' }}>
        {/* {activeTab === '2' && (
          <Col span={8}>
            <Select
              id={`selectStatusChartType`}
              placeholder="All Users"
              loading={userLoading}
              onChange={handleUserChange}
              allowClear
              className="w-full h-[48px] my-4"
            >
              {employeeData?.items?.map((item: any) => (
                <Option key="active" value={item.id}>
                  <div className="flex space-x-3 p-1 rounded">
                    <img
                      src={`${item?.profileImage}`}
                      alt="pep"
                      className="rounded-full w-4 h-4 mt-2"
                    />
                    <span className="flex justify-center items-center">
                      {item?.firstName + ' ' + ' ' + item?.middleName}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>
        )} */}
        {activeTab === '3' && (
          <Col span={8}>
            <Select
              id={`selectStatusChartType`}
              placeholder="All Status"
              onChange={handleChangeGraphType}
              allowClear
              className="w-full h-[48px] my-4"
            >
              <Option key="active" value="barGraph">
                Bar graph
              </Option>
              <Option key="active" value="pieChart">
                Pie chart
              </Option>
            </Select>
          </Col>
        )}
      </Row>
      <div className="flex justify-between">
        <Tabs
          defaultActiveKey="1"
          className="w-[900px]"
          items={items}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

export default Page;
