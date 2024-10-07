import { Menu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import Link from 'next/link';

const OKRSettingMenu = () => {
  return (
    <div className="h-full p-4">
      <Menu mode="vertical" defaultSelectedKeys={['1']} style={{ width: 256 }}>
        <Menu.Item key="1" icon={<AppstoreOutlined />}>
          <Link href="/monitoring-evaluation/settings/planning-period">
            Planning Period
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link href="/planning-assignation">Planning Assignation</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link href="/define-appreciation">Define Appreciation</Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link href="/define-reprimand">Define Reprimand</Link>
        </Menu.Item>
        <Menu.Item key="5">
          <Link href="/define-okr-rule">Define OKR Rule</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default OKRSettingMenu;
