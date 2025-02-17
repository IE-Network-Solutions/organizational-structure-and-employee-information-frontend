'use client';
import TabLandingLayout from '@/components/tabLanding';
import React, { useEffect } from 'react';
import { Button, Card, Col, Row, Skeleton, Tabs } from 'antd';
import CollapsibleCardList from './_components/collapsableCard';
import ActionPlans from './_components/actionPlans';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useGetAllConversationInstancesById } from '@/store/server/features/CFR/conversation/conversation-instance/queries';
import ConversationInstanceDetail from './_components/biWeeklyDetail';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';
import CreateActionPlans from './_components/createActionPlans';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useAddActionPlan } from '@/store/server/features/CFR/conversation/action-plan/mutation';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
interface Params {
  slug: string;
}
interface ConversationInstanceDetailProps {
  params: Params;
}
const Index = ({ params: { slug } }: ConversationInstanceDetailProps) => {
  const { setOpen, open } = useOrganizationalDevelopment();
  const { selectedUserId, setActiveTab, activeTab } = ConversationStore();

  const { data: conversationInstance, isLoading } =
    useGetAllConversationInstancesById(slug);
  const { data: allUserData } = useGetAllUsers();
  const { mutate: addActionPlan } = useAddActionPlan();
  const router = useRouter();

  useEffect(() => {
    if (selectedUserId !== null && selectedUserId !== '') {
      setActiveTab('2');
    }
  }, [selectedUserId]);
  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };

  const getQuestionResponse = (questionId: string) => {
    const questionResponse = conversationInstance?.conversationResponse?.find(
      (response: any) =>
        response?.questionId === questionId &&
        (selectedUserId ? response?.userId === selectedUserId : true),
    );
    if (questionResponse) {
      const employeeData = getEmployeeData(questionResponse?.userId);

      return {
        ...questionResponse,
        employeeDetail:
          `${employeeData?.firstName || ''} ${employeeData?.middleName || ''} ${employeeData?.lastName || ''}`.trim(),
      };
    }

    return {}; // Return an empty object if no match is found
  };

  const filteredData =
    conversationInstance?.questionSet?.conversationsQuestions?.map(
      (conversationQuestion: any) => ({
        id: conversationQuestion?.id,
        questionTitle: conversationQuestion,
        responseData: getQuestionResponse(conversationQuestion?.id),
      }),
    );
  const handleRedirectback = () => {
    router.back();
  };

  const handleCreateActionPlan = (values: any) => {
    const updatedData = {
      ...values,
      deadline: values.deadline
        ? dayjs(values.deadline).format('YYYY-MM-DD')
        : null,
    };
    addActionPlan(updatedData, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const items = [
    {
      key: '1',
      label: 'All',
      children: (
        <CollapsibleCardList
          isLoading={isLoading}
          filteredData={filteredData}
        />
      ),
    },
    {
      key: '2',
      label: 'Individual',
      children: (
        <CollapsibleCardList
          isLoading={isLoading}
          filteredData={filteredData}
        />
      ),
    },
    {
      key: '3',
      label: 'Action Plans',
      children: <ActionPlans slug={slug} />,
    },
  ];

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add Action Plan
    </div>
  );

  return (
    <TabLandingLayout
      buttonTitle="Add Action Plan"
      id="conversationLayoutId"
      onClickHandler={() => setOpen(true)}
      title={
        <div>
          {' '}
          <Button type="link" onClick={() => handleRedirectback()}>
            ←
          </Button>{' '}
          <span>Details</span>
        </div>
      }
      subtitle=""
    >
      <Row gutter={[16, 24]}>
        <Col lg={8} md={10} xs={24}>
          {isLoading ? (
            /* eslint-disable @typescript-eslint/naming-convention */
            Array.from({ length: 2 }).map(
              (
                _ /* eslint-disable @typescript-eslint/naming-convention */,
                index,
              ) => (
                <Skeleton key={index} active paragraph={{ rows: 4 }} avatar />
              ),
            )
          ) : (
            /* eslint-enable @typescript-eslint/naming-convention */
            <ConversationInstanceDetail
              conversationInstance={conversationInstance}
            />
          )}
        </Col>
        <Col lg={16} md={14} xs={24}>
          <Card>
            <Tabs
              items={items}
              activeKey={activeTab}
              tabBarGutter={16}
              size="small"
              onChange={(active: string) => setActiveTab(active)}
              tabBarStyle={{ textAlign: 'center' }}
            />
          </Card>
        </Col>
      </Row>
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="40%"
      >
        <CreateActionPlans
          slug={slug}
          onFinish={(values) => handleCreateActionPlan(values)}
        />
      </CustomDrawerLayout>
    </TabLandingLayout>
  );
};

export default Index;
