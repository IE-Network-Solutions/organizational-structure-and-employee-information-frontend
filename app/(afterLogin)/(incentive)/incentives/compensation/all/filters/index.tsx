import { Col, Modal, Row, Select } from 'antd';
import React from 'react';
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
import { LuSettings2 } from 'react-icons/lu';
import { useIsMobile } from '@/hooks/useIsMobile';

const IncentiveFilter: React.FC = () => {
  const {
    searchParams,
    setSearchParams,
    selectedSessions,
    setSelectedSessions,
    currentPage,
    pageSize,
    selectedYear,
    setSelectedYear,
    showMobileFilter,
    setShowMobileFilter,
  } = useIncentiveStore();

  const { isMobile, isTablet } = useIsMobile();

  const { data: employeeData } = useGetAllUsers();
  const { data: allSessions } = useFetchIncentiveSessions();
  const { data: activeCalender } = useGetActiveFiscalYears();
  const { data: fiscalYear } = useGetAllFiscalYears(pageSize, currentPage);

  const activeFiscalYearName = activeCalender
    ? activeCalender?.name
    : 'Select Year';

  const handleSearchCategory = async (
    value: string | boolean | any,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSearchChange = useDebounce(handleSearchCategory, 2000);
  const onSelectChange = handleSearchCategory;

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value?.trim();
    onSearchChange(trimmedValue, keyValue);
  };

  const handleCreatedByMonth = (value: string) => {
    onSelectChange(value, 'byMonth');
  };
  const handleCreatedByYear = (yearId: string) => {
    setSelectedYear(yearId);

    const selectedFiscalYear = fiscalYear?.items?.find(
      (year: any) => year?.id === yearId,
    );

    if (selectedFiscalYear) {
      const sessionIds =
        selectedFiscalYear?.sessions?.map((session: any) => session?.id) || [];

      setSelectedSessions(sessionIds);
      onSelectChange(sessionIds, 'bySession');
    } else {
      setSelectedSessions([]);
      onSelectChange([], 'bySession');
    }

    onSelectChange(yearId, 'byYear');
  };

  const handleCreatedBySession = (value: any) => {
    const sessionIds = Array.isArray(value) ? value : [value];
    setSelectedSessions(sessionIds);
    onSelectChange(value, 'bySession');
  };

  const selectedSessionMonths = allSessions?.items
    ?.filter((session: CalendarData) => selectedSessions?.includes(session?.id))
    .flatMap((session: CalendarData) => session?.months);

  React.useEffect(() => {
    if (activeCalender?.sessions?.length) {
      const defaultSessionIds = activeCalender?.sessions?.map(
        (session: any) => session?.id,
      );
      setSelectedSessions(defaultSessionIds);
      onSelectChange(defaultSessionIds, 'bySession');
    }
    if (!selectedYear) {
      onSelectChange('', 'byMonth');
    }
  }, [activeCalender]);

  const Filters = (
    <>
      <Row gutter={[16, 10]} justify="space-between">
        {!(isMobile || isTablet) && (
          <Col xs={24} sm={24} md={24} lg={10} xl={10}>
            <Select
              onChange={(value) => handleSearchInput(value, 'employee_name')}
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
              {employeeData?.items?.map((items: any) => (
                <Select.Option key={items?.id} value={items?.id}>
                  {items?.firstName + ' ' + items?.middleName}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        <Col xs={24} sm={24} md={24} lg={14} xl={14}>
          <Row gutter={[8, 16]}>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Select
                allowClear
                placeholder={activeFiscalYearName}
                className="w-full h-14"
                onChange={handleCreatedByYear}
              >
                {fiscalYear?.items?.map((year: any) => (
                  <Select.Option key={year.id} value={year.id}>
                    {year?.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Select
                mode="multiple"
                allowClear
                placeholder="Select Session"
                className="w-full h-14"
                onChange={(value) =>
                  handleCreatedBySession(Array.isArray(value) ? value : [value])
                }
                disabled={!selectedYear}
              >
                {selectedYear &&
                  fiscalYear?.items
                    ?.find((year: any) => year.id === selectedYear)
                    ?.sessions?.map((session: any) => (
                      <Select.Option key={session.id} value={session.id}>
                        {session.name}
                      </Select.Option>
                    ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Select
                allowClear
                placeholder="Select Month "
                className="w-full h-14"
                onChange={handleCreatedByMonth}
                disabled={!selectedSessionMonths?.length}
              >
                {selectedSessionMonths?.map((month: any) => (
                  <Select.Option key={month?.id} value={month?.id}>
                    {month?.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );

  return (
    <div className="my-7 mx-1">
      {isMobile || isTablet ? (
        <div className="flex justify-end m-2 space-x-4">
          <Select
            onChange={(value) => handleSearchInput(value, 'employee_name')}
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
            {employeeData?.items?.map((items: any) => (
              <Select.Option key={items?.id} value={items?.id}>
                {items?.firstName + ' ' + items?.middleName}
              </Select.Option>
            ))}
          </Select>
          <div className="flex items-center justify-center rounded-lg border-[1px] border-gray-200 p-3">
            <LuSettings2
              onClick={() => setShowMobileFilter(true)}
              className="text-lg cursor-pointer"
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
            {Filters}
          </Modal>
        </div>
      ) : (
        Filters
      )}
    </div>
  );
};

export default IncentiveFilter;
