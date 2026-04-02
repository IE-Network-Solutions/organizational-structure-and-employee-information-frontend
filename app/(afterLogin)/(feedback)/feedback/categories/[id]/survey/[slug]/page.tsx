'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React, { useLayoutEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  GraphType,
  useOrganizationalDevelopment,
} from '@/store/uistate/features/organizationalDevelopment';
import { Col, Row, Select, Skeleton, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Link from 'next/link';
import IndividualResponses from './_components/individualResponses';
import ActionPlans from './_components/actionPlans';
import CreateActionPlan from './_components/createActionPlan';
import Questions from './_components/questions';
import SurveyInsights from './_components/surveyInsights';
import { useGetFormsByID } from '@/store/server/features/feedback/form/queries';
import { useParams } from 'next/navigation';

const { Option } = Select;

function Page() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const categoryId = (params?.id as string) || '';

  const { data: formData, isLoading: isFormLoading } = useGetFormsByID(slug);

  const {
    activeTab,
    setActiveTab,
    setOpen,
    setGraphType,
    setSelectedEditActionPlan,
    setNumberOfActionPlan,
  } = useOrganizationalDevelopment();

  useLayoutEffect(() => {
    if (slug) setActiveTab('0');
  }, [slug, setActiveTab]);

  const categoryHref = categoryId
    ? `/feedback/categories/${categoryId}`
    : '/feedback/categories';

  const items: TabsProps['items'] = [
    {
      key: '0',
      label: (
        <span
          className="survey-detail-tab-label text-[16px] font-normal"
          data-cy="survey-detail-tab-text-insights"
        >
          Insights
        </span>
      ),
      children: (
        <div
          className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
          data-cy="survey-detail-tab-content-insights"
        >
          <SurveyInsights formId={slug} />
        </div>
      ),
    },
    {
      key: '1',
      label: (
        <span
          className="survey-detail-tab-label text-[16px] font-normal"
          data-cy="survey-detail-tab-text-questions"
        >
          Questions
        </span>
      ),
      children: (
        <div
          className="flex h-full min-h-0 flex-col overflow-hidden"
          data-cy="survey-detail-tab-content-questions"
        >
          <Questions id={slug} />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span
          className="survey-detail-tab-label text-[16px] font-normal"
          data-cy="survey-detail-tab-text-responses"
        >
          Responses
        </span>
      ),
      children: (
        <div
          className="h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
          data-cy="survey-detail-tab-content-responses"
        >
          <IndividualResponses id={slug} />
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <span
          className="survey-detail-tab-label text-[16px] font-normal"
          data-cy="survey-detail-tab-text-action-plans"
        >
          Action Plans
        </span>
      ),
      children: (
        <div
          className="h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
          data-cy="survey-detail-tab-content-action-plans"
        >
          <ActionPlans id={slug} />
        </div>
      ),
    },
  ];

  const handleChangeGraphType = (e: GraphType) => {
    setGraphType(e);
  };
  const showDrawer = () => {
    setSelectedEditActionPlan(null);
    setNumberOfActionPlan(1);
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div
      id="survey-detail-page-container"
      data-cy="survey-detail-page-container"
      className="box-border flex h-[calc(100dvh-74px)] w-full min-h-0 flex-col overflow-hidden bg-white pt-5 md:pt-6"
    >
      <div
        className="mb-4 w-full min-w-0 shrink-0 bg-white md:mb-6"
        data-cy="survey-detail-header-block"
      >
        <CustomBreadcrumb
          data-cy="survey-detail-breadcrumb"
          compact
          title="Survey"
          subtitle={
            <>
              <Link
                href="/feedback/categories"
                className="text-slate-500 hover:text-[#2D5BFF] transition-colors"
                data-cy="survey-breadcrumb-cfr"
              >
                CFR
              </Link>
              <span
                className="text-slate-500"
                data-cy="survey-breadcrumb-sep-1"
              >
                {' '}
                /{' '}
              </span>
              <Link
                href="/feedback/conversation"
                className="text-slate-500 hover:text-[#2D5BFF] transition-colors"
                data-cy="survey-breadcrumb-conversation"
              >
                Conversation
              </Link>
              <span
                className="text-slate-500"
                data-cy="survey-breadcrumb-sep-2"
              >
                {' '}
                /{' '}
              </span>
              <Link
                href={categoryHref}
                className="text-slate-500 hover:text-[#2D5BFF] transition-colors"
                data-cy="survey-breadcrumb-survey-link"
              >
                Survey
              </Link>
              <span
                className="text-slate-500"
                data-cy="survey-breadcrumb-sep-3"
              >
                {' '}
                /{' '}
              </span>
              {isFormLoading ? (
                <Skeleton.Input
                  active
                  size="small"
                  className="!inline-block align-middle"
                  data-cy="survey-breadcrumb-name-skeleton"
                />
              ) : (
                <span
                  className="text-[#000000B2] font-medium"
                  data-cy="survey-breadcrumb-survey-name"
                >
                  {formData?.name ?? '—'}
                </span>
              )}
            </>
          }
        />

        <Row
          id="survey-detail-filter-row"
          data-cy="survey-detail-filter-row"
          justify="center"
          style={{ width: '100%' }}
        >
          {activeTab === '3' && (
            <Col
              span={8}
              id="survey-detail-graph-select-column"
              data-cy="survey-detail-graph-select-column"
            >
              <Select
                id="selectStatusChartType"
                data-cy="selectStatusChartType"
                placeholder="All Status"
                onChange={handleChangeGraphType}
                allowClear
                className="w-full h-[48px] my-4"
              >
                <Option
                  id="survey-detail-graph-option-bar"
                  data-cy="survey-detail-graph-option-bar"
                  key="active"
                  value="barGraph"
                >
                  Bar graph
                </Option>
                <Option
                  id="survey-detail-graph-option-pie"
                  data-cy="survey-detail-graph-option-pie"
                  key="pie"
                  value="pieChart"
                >
                  Pie chart
                </Option>
              </Select>
            </Col>
          )}
        </Row>
      </div>

      <div
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-white pb-5 md:pb-6"
        data-cy="survey-detail-inner"
      >
        <Tabs
          id="survey-detail-tabs"
          data-cy="survey-detail-tabs"
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === '4' ? (
              <button
                type="button"
                id="survey-detail-create-action-button"
                data-cy="survey-detail-create-action-button"
                onClick={showDrawer}
                className="inline-flex items-center gap-2 rounded-md bg-[#1E40AF] px-4 py-2 text-sm font-semibold text-white shadow-none transition-colors hover:bg-[#1E3A8A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
              >
                <PlusOutlined
                  id="survey-detail-create-action-icon"
                  data-cy="survey-detail-create-action-icon"
                  className="text-base"
                />
                New Action Plan
              </button>
            ) : null
          }
          className="survey-detail-tabs mt-0 flex !h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white [&_.ant-tabs-content-holder]:!mt-0 [&_.ant-tabs-content-holder]:min-h-0 [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content-holder]:!px-0 [&_.ant-tabs-content-holder]:!pt-3 [&_.ant-tabs-content-holder]:overflow-hidden [&_.ant-tabs-content-holder]:scrollbar-hide [&_.ant-tabs-content]:!m-0 [&_.ant-tabs-content]:h-full [&_.ant-tabs-content]:min-h-0 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav]:shrink-0 [&_.ant-tabs-nav]:bg-white [&_.ant-tabs-nav]:before:border-slate-200 [&_.ant-tabs-nav]:!px-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-tab]:pb-2 [&_.ant-tabs-tab]:text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-[#1E40AF] [&_.ant-tabs-tab_.survey-detail-tab-label]:font-normal [&_.ant-tabs-tab-active_.survey-detail-tab-label]:font-bold [&_.ant-tabs-ink-bar]:bg-[#1E40AF] [&_.ant-tabs-tabpane]:!m-0 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:min-h-0 [&_.ant-tabs-tabpane]:!p-0 [&_.ant-tabs-tabpane]:overflow-hidden [&_.ant-tabs-tabpane]:scrollbar-hide"
          items={items}
        />
      </div>

      <CreateActionPlan
        onClose={onClose}
        id={slug}
        surveyContext={{
          title: formData?.name ?? formData?.title,
          description: formData?.description,
          updatedAt: formData?.updatedAt,
        }}
        data-cy="survey-detail-create-action-drawer"
      />
    </div>
  );
}

export default Page;
