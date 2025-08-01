import { Col, Modal, Row, Select } from 'antd';
import React, { useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/utils/useDebounce';
import {
  CalendarData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchIncentiveSessions } from '@/store/server/features/incentive/project/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useMediaQuery } from 'react-responsive';
import { IoMdSwitch } from 'react-icons/io';
import { useRecognitionByParentId } from '@/store/server/features/incentive/other/queries';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const DynamicIncentiveFilter: React.FC = () => {
  const {
    currentPage,
    pageSize,
    showMobileFilter,
    setShowMobileFilter,
    setSearchParams,
  } = useIncentiveStore();

  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract search parameters directly
  // const activeKey = searchParams.get('tab') || '';
  // const user = searchParams.get('user') || '';
  // const recognition = searchParams.get('recognition') || '';
  // const year = searchParams.get('year') || '';
  // const session = searchParams.getAll('session');
  // const month = searchParams.get('month') || '';
  const activeKey = searchParams.get('tab') || '';
  const user = searchParams.get('user') || '';
  const recognition = searchParams.get('recognition') || '';
  const year = searchParams.get('year') || '';
  const session = searchParams.getAll('session');
  const month = searchParams.get('month') || '';
  const { data: employeeData } = useGetAllUsers();
  const { data: allSessions } = useFetchIncentiveSessions();
  const { data: activeCalender } = useGetActiveFiscalYears();
  const { data: fiscalYear } = useGetAllFiscalYears(pageSize, currentPage);
  const { data: parentRecognition } = useRecognitionByParentId(activeKey);

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(paramsToUpdate)) {
        if (value === null || (Array.isArray(value) && value.length === 0)) {
          params.delete(name);
        } else if (Array.isArray(value)) {
          params.delete(name);
          value.forEach((val) => params.append(name, val));
        } else {
          params.set(name, value);
        }
      }
      return params.toString();
    },
    [searchParams],
  );

  const updateUrl = useCallback(
    (paramsToUpdate: Record<string, string | string[] | null>) => {
      const queryString = createQueryString(paramsToUpdate);
      router.push(`${pathname}?${queryString}`);
    },
    [createQueryString, pathname, router],
  );

  const debouncedUpdateUrl = useDebounce(updateUrl, 500);

  const handleSearchInput = (value: string | null) => {
    debouncedUpdateUrl({ user: value || '' });
    setSearchParams('employee_name', value || '');
  };

  const handleRecognitionChange = (value: string | null) => {
    debouncedUpdateUrl({ recognition: value || '' });
    setSearchParams('byRecognition', value || '');
  };

  const handleCreatedByYear = (yearId: string | null) => {
    updateUrl({ year: yearId || '', session: null, month: null });
    setSearchParams('byYear', yearId || '');
  };

  const handleCreatedBySession = (sessionIds: string[] | null) => {
    updateUrl({ session: sessionIds || [] });
    setSearchParams('bySession', sessionIds || []);
  };

  const handleCreatedByMonth = (value: string | null) => {
    updateUrl({ month: value || '' });
    setSearchParams('byMonth', value || '');
  };

  const selectedSessionMonths = useMemo(() => {
    return (
      allSessions?.items
        ?.filter((s: CalendarData) => session.includes(s?.id))
        .flatMap((s: CalendarData) => s?.months) || []
    );
  }, [allSessions, session]);

  useEffect(() => {
    if (activeCalender?.id && !year) {
      updateUrl({ year: activeCalender.id });
    }
  }, [activeCalender, year, updateUrl]);

  // useEffect(() => {
  //   setSearchParams('employee_name', user);
  //   setSearchParams('byRecognition', recognition);
  //   setSearchParams('byYear', year);
  //   setSearchParams('bySession', session);
  //   setSearchParams('byMonth', month);
  // }, [user, recognition, year, session, month, setSearchParams]);

  // Sync URL to Zustand state ONCE
  useEffect(() => {
    setSearchParams('employee_name', user || '');
    setSearchParams('byRecognition', recognition || '');
    setSearchParams('byYear', year || '');
    setSearchParams('bySession', session || []);
    setSearchParams('byMonth', month || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition]);
  const FilterForm = (
    <Row gutter={[16, 10]} justify="space-between">
      <Col xs={24} sm={24} md={24} lg={10} xl={10}>
        <Select
          onChange={handleSearchInput}
          value={user || undefined}
          placeholder="Search Employee"
          allowClear
          showSearch
          className="w-full h-14"
          optionFilterProp="children"
          filterOption={(input: any, option: any) =>
            option?.children
              ?.toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {employeeData?.items?.map((emp: any) => (
            <Select.Option key={emp?.id} value={emp?.id}>
              {emp?.firstName + ' ' + emp?.middleName}
            </Select.Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={24} md={24} lg={14} xl={14}>
        <Row gutter={[8, 16]}>
          <Col span={6}>
            <Select
              allowClear
              placeholder="Select Recognition"
              className="w-full h-14"
              onChange={handleRecognitionChange}
              value={recognition || undefined}
              disabled={!activeKey}
            >
              {parentRecognition?.map((rec: any) => (
                <Select.Option key={rec?.id} value={rec?.id}>
                  {rec?.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              allowClear
              placeholder="Select Fiscal Year"
              className="w-full h-14"
              onChange={handleCreatedByYear}
              value={year || undefined}
            >
              {fiscalYear?.items?.map((y: any) => (
                <Select.Option key={y.id} value={y.id}>
                  {y?.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              mode="multiple"
              allowClear
              placeholder="Select Session"
              className="w-full h-14"
              onChange={handleCreatedBySession}
              value={session}
              disabled={!year}
            >
              {year &&
                fiscalYear?.items
                  ?.find((y: any) => y.id === year)
                  ?.sessions?.map((s: any) => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.name}
                    </Select.Option>
                  ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              allowClear
              placeholder="Select Month"
              className="w-full h-14"
              onChange={handleCreatedByMonth}
              value={month || undefined}
              disabled={!selectedSessionMonths.length}
            >
              {selectedSessionMonths?.map((m: any) => (
                <Select.Option key={m?.id} value={m?.id}>
                  {m?.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  return (
    <div className="my-7 mx-1">
      {isSmallScreen ? (
        <div className="flex justify-end m-2 space-x-4">
          <div className="flex items-center justify-center rounded-lg border border-gray-200 p-3">
            <IoMdSwitch
              onClick={() => setShowMobileFilter(true)}
              className="text-xl cursor-pointer"
            />
          </div>
          <Modal
            centered
            title="Filter"
            open={showMobileFilter}
            onCancel={() => setShowMobileFilter(false)}
            modalRender={(modal) => (
              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {modal}
              </div>
            )}
            footer={null}
          >
            {FilterForm}
          </Modal>
        </div>
      ) : (
        FilterForm
      )}
    </div>
  );
};

export default DynamicIncentiveFilter;
