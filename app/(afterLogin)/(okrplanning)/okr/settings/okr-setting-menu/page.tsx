'use client';
import { Menu } from 'antd';
import Link from 'next/link';

const OKRSettingMenu = () => {
  return (
    <div
      className="h-full p-4"
      id="okr-setting-menu-container-display-div"
      data-cy="okr-setting-menu-container-display-div"
    >
      <Menu
        mode="vertical"
        defaultSelectedKeys={['1']}
        style={{ width: 256 }}
        id="okr-setting-menu-menu-display-menu"
        data-cy="okr-setting-menu-menu-display-menu"
      >
        <Menu.Item
          key="1"
          id="okr-setting-menu-item-planning-period-display-item"
          data-cy="okr-setting-menu-item-planning-period-display-item"
        >
          <Link
            href="/monitoring-evaluation/settings/planning-period"
            id="okr-setting-menu-link-planning-period-display-link"
            data-cy="okr-setting-menu-link-planning-period-display-link"
          >
            Planning Period
          </Link>
        </Menu.Item>
        <Menu.Item
          key="2"
          id="okr-setting-menu-item-planning-assignation-display-item"
          data-cy="okr-setting-menu-item-planning-assignation-display-item"
        >
          <Link
            href="/planning-assignation"
            id="okr-setting-menu-link-planning-assignation-display-link"
            data-cy="okr-setting-menu-link-planning-assignation-display-link"
          >
            Planning Assignation
          </Link>
        </Menu.Item>
        <Menu.Item
          key="3"
          id="okr-setting-menu-item-define-appreciation-display-item"
          data-cy="okr-setting-menu-item-define-appreciation-display-item"
        >
          <Link
            href="/define-appreciation"
            id="okr-setting-menu-link-define-appreciation-display-link"
            data-cy="okr-setting-menu-link-define-appreciation-display-link"
          >
            Define Appreciation
          </Link>
        </Menu.Item>
        <Menu.Item
          key="4"
          id="okr-setting-menu-item-define-reprimand-display-item"
          data-cy="okr-setting-menu-item-define-reprimand-display-item"
        >
          <Link
            href="/define-reprimand"
            id="okr-setting-menu-link-define-reprimand-display-link"
            data-cy="okr-setting-menu-link-define-reprimand-display-link"
          >
            Define Reprimand
          </Link>
        </Menu.Item>
        <Menu.Item
          key="5"
          id="okr-setting-menu-item-define-okr-rule-display-item"
          data-cy="okr-setting-menu-item-define-okr-rule-display-item"
        >
          <Link
            href="/define-okr-rule"
            id="okr-setting-menu-link-define-okr-rule-display-link"
            data-cy="okr-setting-menu-link-define-okr-rule-display-link"
          >
            Define OKR Rule
          </Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default OKRSettingMenu;
