'use client';
import { useGrantObjectiveEditAccess } from '@/store/server/features/okrplanning/okr/editAccess/mutation';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import useObjectiveEditAccessStore from '@/store/uistate/features/okrplanning/okrSetting/editAccess';
import AccessGuard from '@/utils/permissionGuard';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Col, Input, Row } from 'antd';
import React from 'react';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { MdOutlineCancel } from 'react-icons/md';
import { Permissions } from '@/types/commons/permissionEnum';

const SearchEmployee: React.FC = () => {
  const { searchParams, setSearchParams, checked, setChecked } =
    useObjectiveEditAccessStore();

  const { data: activeFiscalYear } = useGetActiveFiscalYears();

  const { mutate: grantEditAccess } = useGrantObjectiveEditAccess();

  const handleSearchEmployee = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSearchChange = useDebounce(
    (params: { value: string; keyValue: keyof typeof searchParams }) =>
      handleSearchEmployee(params.value, params.keyValue),
    2000,
  );

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange({ value: trimmedValue, keyValue });
  };

  const activeSessionId =
    activeFiscalYear?.sessions?.find((item: any) => item?.active)?.id || '';

  const handleSubmit = () => {
    const formattedValue = {
      isClosed: !checked,
      sessionId: activeSessionId,
    };
    grantEditAccess(formattedValue);
  };

  return (
    <div>
      <Row gutter={[16, 24]} justify="space-between">
        <Col xl={14} md={14} lg={14} sm={24} xs={24}>
          <Input
            id={`inputEmployeeNames${searchParams.employee_name}`}
            placeholder="Search employee"
            onChange={(e) => handleSearchInput(e.target.value, 'employee_name')}
            className="w-full h-14"
            allowClear
          />
        </Col>
        <Col xl={6} md={6} lg={6} sm={24} xs={24}>
          {checked === false ? (
            <AccessGuard permissions={[Permissions.GrantAllOKRAccess]}>
              <Button
                type="primary"
                className="w-full h-14"
                icon={<MdOutlineCancel size={18} />}
                onClick={() => {
                  handleSubmit();
                  setChecked(true);
                }}
              >
                Revoke all access
              </Button>
            </AccessGuard>
          ) : (
            <AccessGuard permissions={[Permissions.GrantAllOKRAccess]}>
              <Button
                type="primary"
                className="w-full h-14"
                icon={<IoCheckmarkOutline size={18} />}
                onClick={() => {
                  handleSubmit();
                  setChecked(false);
                }}
              >
                Grant all access
              </Button>
            </AccessGuard>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SearchEmployee;
