'use client';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import TabLandingLayout from '@/components/tabLanding';
import { useCreateRecognition } from '@/store/server/features/CFR/recognition/mutation';
import {
  useGetAllRecognition,
  useGetAllRecognitionType,
} from '@/store/server/features/CFR/recognition/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  FiscalYear,
  Month,
  Session,
} from '@/store/server/features/organizationStructure/fiscalYear/interface';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { Card, Table, TableColumnsType, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { CiMedal } from 'react-icons/ci';
import { useRouter } from 'next/navigation';
function Page() {
  const {
    updateSearchValue,
    searchValue,
    selectedRecognitionType,
    setSelectedRecognitionType,
    current,
    pageSize,
  } = useRecongnitionStore();
  const { data: allUserData } = useGetAllUsers();
  const { data: recognitionType } = useGetAllRecognitionType();
  const { data: getAllRecognition } = useGetAllRecognition({
    searchValue,
    current,
    pageSize,
  });
  const { mutate: createRecognition } = useCreateRecognition();

  const { data: getActiveFisicalYear } = useGetActiveFiscalYears();
  const { data: getAllFisicalYear } = useGetAllFiscalYears();
  const navigate = useRouter();

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Recognition',
      dataIndex: 'recognition',
      render: (notused, record) => record.recognitionType?.name ?? '-',
    },
    {
      title: 'Employees',
      dataIndex: 'employee',
      render: (notused, record) =>
        record.recipientId
          ? `${getEmployeeData(record.recipientId)?.firstName ?? '-'} ${getEmployeeData(record.recipientId)?.lastName ?? '-'}`
          : '-',
    },
    {
      title: 'Criteria',
      dataIndex: 'criteria',
      render: (notused, record) =>
        record?.recognitionType?.criteria?.length ? (
          <div className="flex flex-wrap gap-2">
            {record?.recognitionType?.criteria.map(
              (criteria: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {criteria?.criterionKey}
                </span>
              ),
            )}
          </div>
        ) : (
          <span>-</span>
        ),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Date Issued',
      dataIndex: 'dateIssued',
      render: (notused, record) =>
        record?.dateIssued
          ? (dayjs(record?.dateIssued).format('YYYY-MM-DD') ?? '-')
          : '-',
    },
    {
      title: 'Issued By',
      dataIndex: 'createdBy',
      render: (notused, record) =>
        record.issuerId
          ? `${getEmployeeData(record.issuerId)?.firstName ?? '-'} ${getEmployeeData(record.issuerId)?.lastName ?? '-'}`
          : 'system',
    },
    {
      title: 'Details',
      dataIndex: 'description',
      render: (notused, record) => (
        <p>{record?.recognitionType?.description ?? '-'}</p>
      ),
    },
  ];
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'All',
      children: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((notused, index) => (
            <Card
              className="bg-gray-200 font-bold"
              key={`all-card-${index}`}
              style={{ width: '100%' }} // Full width in grid cells
            >
              <p className="flex justify-start items-center text-green-600 font-extrabold text-xl">
                <CiMedal />
              </p>
              <p>Total number of recognized employees</p>
              <p>010</p>
            </Card>
          ))}
        </div>
      ),
    },
    ...(recognitionType?.items?.map((item: any) => ({
      key: item.id,
      label: item.name,
    })) || []), // Fallback to an empty array if recognitionType?.items is undefined
  ];
  const searcFields = [
    {
      key: 'employeeId',
      placeholder: 'search by Employee',
      options:
        allUserData?.items?.map((item: any) => ({
          key: item?.id,
          value: `${item?.firstName} ${item?.lastName}`, // Correctly concatenating firstName and lastName
        })) ?? [],
      widthRatio: 0.4,
    },
    {
      key: 'yearId',
      placeholder: 'Filter by year',
      options:
        getAllFisicalYear?.items?.map((item: any) => ({
          key: item?.id,
          value: item?.name,
        })) ?? [],
      widthRatio: 0.2,
    },
    {
      key: 'sessionId',
      placeholder: 'Select by session',
      options:
        getAllFisicalYear?.items
          ?.find((item: FiscalYear) => item?.id === searchValue?.year)
          ?.sessions?.map((session: Session) => ({
            key: session?.id,
            value: session?.name,
          })) ?? [],
      widthRatio: 0.2,
    },
    {
      key: 'monthId',
      placeholder: 'Filter by month',
      options:
        getAllFisicalYear?.items
          ?.find((item: FiscalYear) => item?.id === searchValue?.year)
          ?.sessions?.find((item: Session) => item?.id === searchValue?.session)
          ?.months?.map((month: Month) => ({
            key: month?.id,
            value: month?.name,
          })) ?? [],
      widthRatio: 0.2,
    },
  ];
  const handleSearchChange = (key: string, value: string) => {
    updateSearchValue(value, key);
  };
  const handleRowClick = (record: any) => {
    navigate.push(`/feedback/recognition/${record.id}`);
  };
  return (
    <div>
      <Tabs
        className="ml-[3%] max-w-[90%]"
        defaultActiveKey="1"
        items={items}
        onChange={(key) => setSelectedRecognitionType(key)}
      />
      <>
        <TabLandingLayout
          id="conversationLayoutId"
          onClickHandler={() => {
            const fiscalActiveYearId = getActiveFisicalYear?.id;
            const activeSession = getActiveFisicalYear?.sessions?.find(
              (item: Session) => item.active,
            );

            if (activeSession) {
              const activeMonth = activeSession.months?.find(
                (item: Month) => item.active,
              );
              const recognitionTypeId = selectedRecognitionType;

              // Correcting how the object is passed
              fiscalActiveYearId &&
                activeMonth &&
                createRecognition({
                  recognitionTypeId,
                  calendarId: fiscalActiveYearId,
                  sessionId: activeSession?.id, // Assigning directly
                  monthId: activeMonth?.id, // Assigning directly
                });
            } else {
            }
          }}
          title="Recognition"
          subtitle="Manage Recognition"
          buttonTitle={
            selectedRecognitionType !== '1' ? 'Generate Recognition' : false
          }
          buttonIcon={<PlusIcon />}
        >
          <EmployeeSearchComponent
            fields={searcFields}
            onChange={handleSearchChange}
          />
          <Table<any>
            columns={columns}
            dataSource={getAllRecognition?.items ?? []}
            pagination={{
              total: getAllRecognition?.meta?.total ?? 0, // Total number of items
              current: getAllRecognition?.meta?.currentPage ?? 1, // Current page
              pageSize: getAllRecognition?.meta?.itemsPerPage ?? 10, // Items per page
            }}
            scroll={{ x: 800 }} // Enable horizontal scrolling
            className="cursor-pointer"
            onRow={(record) => ({
              onClick: () => handleRowClick(record), // Add click handler
            })}
          />
        </TabLandingLayout>
      </>
    </div>
  );
}

export default Page;
