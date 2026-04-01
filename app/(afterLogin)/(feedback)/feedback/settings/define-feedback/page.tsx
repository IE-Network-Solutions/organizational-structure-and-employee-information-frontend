'use client';
import { useMemo } from 'react';
import { Tabs, Tag } from 'antd';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useFetchAllFeedbackTypesByVariant } from '@/store/server/features/feedback/feedbackType/queries';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import PerspectivesDetail from './_components/perspectivesDetail';
import FeedbackTypeDetail from './_components/feedbackTypeDetail';
import CreateFeedback from './_components/createFeedback';

const Page = () => {
  const { isMobile } = useIsMobile();
  const {
    setSettingActiveTab,
    settingActiveTab,
    page,
    searchAppreciationQuery,
    searchReprimandQuery,
    pageSize,
    setVariantType,
  } = ConversationStore();
  const { data: perspectiveData } = useGetAllPerspectives();
  const { data: getAppreciationFeedbackTypesByVariant } =
    useFetchAllFeedbackTypesByVariant(
      page,
      pageSize,
      'appreciation',
      searchAppreciationQuery,
    );
  const { data: getReprimandFeedbackTypesByVariant } =
    useFetchAllFeedbackTypesByVariant(
      page,
      pageSize,
      'reprimand',
      searchReprimandQuery,
    );

  const onChange = (key: string) => {
    setSettingActiveTab(key);
    if (key === 'appreciation' || key === 'reprimand') {
      setVariantType(key);
    }
  };

  const items = useMemo(
    () => [
      {
        key: 'appreciation',
        label: isMobile ? (
          <div
            className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 transition-colors ${
              settingActiveTab === 'appreciation'
                ? 'border-primary'
                : 'border-[#D9D9D9]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              viewBox="0 -960 960 960"
              width="22px"
              fill={settingActiveTab === 'appreciation' ? '#1E40AF' : '#6b7280'}
            >
              <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
            </svg>
            <span className="rounded-md border border-[#D9D9D9] bg-gray-50 px-2 py-0.5 text-xs font-medium tabular-nums text-gray-700">
              {getAppreciationFeedbackTypesByVariant?.meta?.totalItems ?? 0}
            </span>
          </div>
        ) : (
          <div
            className={`flex min-w-80 gap-4 rounded-lg border-[1px] p-3 transition-colors justify-between ${
              settingActiveTab === 'appreciation'
                ? 'text-primary ring-1 ring-inset ring-primary'
                : 'text-gray-700 ring-[#D9D9D9]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`ml-2 flex h-8 w-8 items-center justify-center rounded-lg border-[2px] ${
                  settingActiveTab === 'appreciation'
                    ? 'border-primary text-primary'
                    : 'border-[#D9D9D9] text-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18px"
                  viewBox="0 -960 960 960"
                  width="18px"
                  fill={
                    settingActiveTab === 'appreciation' ? '#1E40AF' : '#6b7280'
                  }
                >
                  <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base">Appreciation</span>
                <span
                  className={`text-xs ${
                    settingActiveTab === 'appreciation'
                      ? 'text-primary'
                      : 'text-gray-300'
                  }`}
                >
                  Define and manage Appreciation
                </span>
              </div>
            </div>
            <Tag className="h-[22px] w-[29px] flex items-center justify-center p-1 ">
              {getAppreciationFeedbackTypesByVariant?.meta?.totalItems}
            </Tag>
          </div>
        ),
        children: (
          <FeedbackTypeDetail
            feedbackTypeDetail={getAppreciationFeedbackTypesByVariant}
          />
        ),
      },
      {
        key: 'reprimand',
        label: isMobile ? (
          <div
            className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 transition-colors ${
              settingActiveTab === 'reprimand'
                ? 'border-primary'
                : 'border-[#D9D9D9]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              viewBox="0 -960 960 960"
              width="22px"
              fill={settingActiveTab === 'reprimand' ? '#1E40AF' : '#6b7280'}
              style={{ transform: 'scale(-1, -1)' }}
            >
              <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
            </svg>
            <span className="rounded-md border border-[#D9D9D9] bg-gray-50 px-2 py-0.5 text-xs font-medium tabular-nums text-gray-700">
              {getReprimandFeedbackTypesByVariant?.meta?.totalItems ?? 0}
            </span>
          </div>
        ) : (
          <div
            className={`flex min-w-80 gap-4 rounded-lg border-[1px] p-3 transition-colors justify-between ${
              settingActiveTab === 'reprimand'
                ? 'text-primary ring-1 ring-inset ring-primary'
                : 'text-gray-700 ring-[#D9D9D9]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 ml-2 flex items-center justify-center rounded-lg border-[2px]  ${
                  settingActiveTab === 'reprimand'
                    ? 'border-primary text-primary'
                    : 'border-[#D9D9D9] text-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18px"
                  viewBox="0 -960 960 960"
                  width="18px"
                  fill={
                    settingActiveTab === 'reprimand' ? '#1E40AF' : '#6b7280'
                  }
                >
                  <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base">Reprimand</span>
                <span
                  className={`text-xs ${
                    settingActiveTab === 'reprimand'
                      ? 'text-primary'
                      : 'text-gray-300'
                  }`}
                >
                  Define and manage Reprimand
                </span>
              </div>
            </div>
            <Tag className="h-[22px] w-[29px] flex items-center justify-center p-1 ">
              {getReprimandFeedbackTypesByVariant?.meta?.totalItems}
            </Tag>
          </div>
        ),
        children: (
          <FeedbackTypeDetail
            feedbackTypeDetail={getReprimandFeedbackTypesByVariant}
          />
        ),
      },
      {
        key: 'perspective',
        label: isMobile ? (
          <div
            className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 transition-colors ${
              settingActiveTab === 'perspective'
                ? 'border-primary'
                : 'border-[#D9D9D9]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              viewBox="0 -960 960 960"
              width="22px"
              fill={settingActiveTab === 'perspective' ? '#1E40AF' : '#6b7280'}
              style={{ transform: 'scale(-1, -1)' }}
            >
              <path d="m234-480-12-60q-12-5-22.5-10.5T178-564l-58 18-40-68 46-40q-2-13-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T222-820l12-60h80l12 60q12 5 22.5 10.5T370-796l58-18 40 68-46 40q2 13 2 26t-2 26l46 40-40 68-58-18q-11 8-21.5 13.5T326-540l-12 60h-80Zm96.5-143.5Q354-647 354-680t-23.5-56.5Q307-760 274-760t-56.5 23.5Q194-713 194-680t23.5 56.5Q241-600 274-600t56.5-23.5ZM592-40l-18-84q-17-6-31.5-14.5T514-158l-80 26-56-96 64-56q-2-18-2-36t2-36l-64-56 56-96 80 26q14-11 28.5-19.5T574-516l18-84h112l18 84q17 6 31.5 14.5T782-482l80-26 56 96-64 56q2 18 2 36t-2 36l64 56-56 96-80-26q-14 11-28.5 19.5T722-124l-18 84H592Zm56-160q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z" />
            </svg>
            <span className="rounded-md border border-[#D9D9D9] bg-gray-50 px-2 py-0.5 text-xs font-medium tabular-nums text-gray-700">
              {perspectiveData?.length ?? 0}
            </span>
          </div>
        ) : (
          <div
            className={`flex min-w-80 gap-4 rounded-lg border-[1px] p-3 transition-colors justify-between ${
              settingActiveTab === 'perspective'
                ? 'text-primary ring-1 ring-inset ring-primary'
                : 'text-gray-700 ring-[#D9D9D9]'
            }`}
          >
            <div className="flex items-center gap-2">
              {' '}
              <div
                className={`ml-2 flex h-8 w-8 items-center justify-center rounded-lg border-[2px] ${
                  settingActiveTab === 'perspective'
                    ? 'border-primary text-primary'
                    : 'border-[#D9D9D9] text-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18px"
                  viewBox="0 -960 960 960"
                  width="18px"
                  fill={
                    settingActiveTab === 'perspective' ? '#1E40AF' : '#6b7280'
                  }
                  style={{ transform: 'scale(-1, -1)' }}
                >
                  <path d="m234-480-12-60q-12-5-22.5-10.5T178-564l-58 18-40-68 46-40q-2-13-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T222-820l12-60h80l12 60q12 5 22.5 10.5T370-796l58-18 40 68-46 40q2 13 2 26t-2 26l46 40-40 68-58-18q-11 8-21.5 13.5T326-540l-12 60h-80Zm96.5-143.5Q354-647 354-680t-23.5-56.5Q307-760 274-760t-56.5 23.5Q194-713 194-680t23.5 56.5Q241-600 274-600t56.5-23.5ZM592-40l-18-84q-17-6-31.5-14.5T514-158l-80 26-56-96 64-56q-2-18-2-36t2-36l-64-56 56-96 80 26q14-11 28.5-19.5T574-516l18-84h112l18 84q17 6 31.5 14.5T782-482l80-26 56 96-64 56q2 18 2 36t-2 36l64 56-56 96-80-26q-14 11-28.5 19.5T722-124l-18 84H592Zm56-160q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base">Perspective</span>
                <span
                  className={`text-xs ${
                    settingActiveTab === 'perspective'
                      ? 'text-primary'
                      : 'text-gray-300'
                  }`}
                >
                  Define and manage Perspective
                </span>
              </div>
            </div>

            <Tag className="h-[22px] w-[29px] flex items-center justify-center p-1 ">
              {perspectiveData?.length}
            </Tag>
          </div>
        ),
        children: <PerspectivesDetail perspectivesDetail={perspectiveData} />,
      },
    ],
    [
      isMobile,
      settingActiveTab,
      getAppreciationFeedbackTypesByVariant?.meta?.totalItems,
      getReprimandFeedbackTypesByVariant?.meta?.totalItems,
      perspectiveData?.length,
    ],
  );

  return (
    <div
      data-cy="settings-define-feedback-page"
      id="settingsDefineFeedbackPage"
    >
      <Tabs
        activeKey={settingActiveTab}
        onChange={onChange}
        type="card"
        items={items}
        tabPosition={isMobile ? 'top' : 'left'}
        className={[
          '[&_.ant-tabs-tab]:border-none [&_.ant-tabs-tab]:bg-transparent [&_.ant-tabs-tab]:shadow-none [&_.ant-tabs-tab-active]:bg-transparent',
          '[&_.ant-tabs-nav]:rounded-lg [&_.ant-tabs-nav]:border [&_.ant-tabs-nav]:border-[#D9D9D9] [&_.ant-tabs-nav]:p-4',
          '[&_.ant-tabs-content-holder]:!ml-0 [&_.ant-tabs-content-holder]:!border-l-0',
          '[&_.ant-tabs]:gap-4',
          '[&_.ant-tabs-left_.ant-tabs-tabpane]:!pl-4',
          isMobile
            ? [
                '[&_.ant-tabs-nav]:mb-3',
                '[&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-nav-list]:gap-2',
                '[&_.ant-tabs-tab]:!m-0 [&_.ant-tabs-tab]:min-w-0 [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:rounded-lg [&_.ant-tabs-tab]:p-0',
                '[&_.ant-tabs-tab-btn]:!px-1 [&_.ant-tabs-tab-btn]:!py-0 [&_.ant-tabs-tab-btn]:w-full',
                '[&_.ant-tabs-ink-bar]:hidden',
                '[&_.ant-tabs-content-holder]:border-0 [&_.ant-tabs-content-holder]:pt-0',
              ].join(' ')
            : '',
        ].join(' ')}
      />
      <CreateFeedback />
    </div>
  );
};

export default Page;
