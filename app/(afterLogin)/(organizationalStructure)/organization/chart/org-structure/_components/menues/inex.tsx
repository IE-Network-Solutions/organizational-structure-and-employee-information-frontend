import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { Menu } from 'antd';
import { FaFileImage, FaFilePdf } from 'react-icons/fa';

export const exportOrgStrucutreMenu = (
  chartRef: React.RefObject<HTMLDivElement>,
  exportToPDFOrJPEG: (
    chartRef: React.RefObject<HTMLDivElement>,
    isPdf: boolean,
  ) => void,
) => (
  <Menu
    mode="horizontal"
    onClick={({ key }) => {
      if (key === 'pdf') {
        exportToPDFOrJPEG(chartRef, true);
      } else {
        exportToPDFOrJPEG(chartRef, false);
      }
    }}
  >
    <Menu.Item
      key="pdf"
      icon={<FaFilePdf size={24} />}
      className="font-semibold text-md px-2"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      PDF
    </Menu.Item>
    <Menu.Item
      key="jpeg"
      icon={<FaFileImage size={24} />}
      className="font-semibold text-md"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      JPEG
    </Menu.Item>
  </Menu>
);

const {
  setDrawerVisible,
  setDrawerContent,
  setFooterButtonText,
  setDrawTitle,
} = useOrganizationStore.getState();
const showDrawer = (
  drawerContent: string,
  footerBtnText: string,
  title: string,
) => {
  setDrawerVisible(true);
  setDrawerContent(drawerContent);
  setFooterButtonText(footerBtnText);
  setDrawTitle(title);
};

export const orgComposeAndMergeMenues = (
  <Menu>
    <AccessGuard permissions={[Permissions.DeleteDepartment]}>
      <Menu.Item
        key="1"
        className="py-2"
        style={{ paddingRight: '64px' }}
        onClick={() => showDrawer('archive', 'Archive', 'Archive Level')}
      >
        Transfer
      </Menu.Item>
    </AccessGuard>
    <AccessGuard permissions={[Permissions.MergeDepartment]}>
      <Menu.Item
        key="2"
        className="py-2"
        style={{ paddingRight: '64px' }}
        onClick={() => showDrawer('merge', 'Merge', 'Merge Department')}
      >
        Merge
      </Menu.Item>
    </AccessGuard>
  </Menu>
);
