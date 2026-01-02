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
import { AiOutlineSearch } from 'react-icons/ai';

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
      isClosed: checked,
      sessionId: activeSessionId,
    };
    grantEditAccess(formattedValue);
  };

  return (
    <div
      id="okr-edit-access-search-container"
      data-cy="okr-edit-access-search-container"
    >
      <Row
        gutter={[16, 24]}
        justify="space-between"
        id="okr-edit-access-search-row"
        data-cy="okr-edit-access-search-row"
      >
        <Col
          xl={12}
          md={24}
          lg={12}
          sm={24}
          xs={24}
          id="okr-edit-access-search-input-col"
          data-cy="okr-edit-access-search-input-col"
        >
          <Input
            id={`inputEmployeeNames${searchParams.employee_name}`}
            placeholder="Search employee"
            onChange={(e) => handleSearchInput(e.target.value, 'employee_name')}
            className="w-full h-12"
            allowClear
            suffix={
              <AiOutlineSearch
                className="text-gray-400"
                data-cy="okr-edit-access-search-input-suffix-icon"
              />
            }
            data-cy="okr-edit-access-search-input"
          />
        </Col>
        <Col
          xl={5}
          md={24}
          lg={5}
          sm={24}
          xs={24}
          id="okr-edit-access-search-button-col"
          data-cy="okr-edit-access-search-button-col"
        >
          {checked === false ? (
            <AccessGuard permissions={[Permissions.GrantAllOKRAccess]}>
              <Button
                type="primary"
                className="w-full h-12"
                icon={
                  <IoCheckmarkOutline
                    size={20}
                    data-cy="okr-edit-access-grant-all-button-icon-display-button"
                  />
                }
                onClick={() => {
                  setChecked(true);
                  handleSubmit();
                }}
                id="okr-edit-access-grant-all-button"
                data-cy="okr-edit-access-grant-all-button"
              >
                Grant all access
              </Button>
            </AccessGuard>
          ) : (
            <AccessGuard
              data-cy="okr-edit-access-revoke-all-button-access-guard-display-guard"
              permissions={[Permissions.GrantAllOKRAccess]}
            >
              <Button
                type="primary"
                className="w-full h-12"
                icon={
                  <MdOutlineCancel
                    size={20}
                    data-cy="okr-edit-access-revoke-all-button-icon-display-button"
                  />
                }
                onClick={() => {
                  setChecked(false);
                  handleSubmit();
                }}
                id="okr-edit-access-revoke-all-button"
                data-cy="okr-edit-access-revoke-all-button"
              >
                Revoke all access
              </Button>
            </AccessGuard>
          )}

          {/* <AccessGuard permissions={[Permissions.GrantAllOKRAccess]}>
            <div className="w-full h-10 flex justify-around items-center">
              <span className="text-base font-medium hidden lg:inline">
                {checked ? 'Revoke all access' : 'Grant all access'}
              </span>
              <Switch
                checked={checked}
                className="mt-2"
                onChange={(checked) => {
                  setChecked(checked);
                  handleSubmit();
                }}
                checkedChildren={<IoCheckmarkOutline size={20} />}
                unCheckedChildren={<MdOutlineCancel size={20} />}
              />
            </div>
          </AccessGuard> */}
        </Col>
      </Row>
    </div>
  );
};

export default SearchEmployee;
