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
    data-cy="org-structure-export-menu"
    id="org-structure-export-menu"
  >
    <Menu.Item
      key="pdf"
      icon={<FaFilePdf size={24} />}
      className="font-semibold text-md px-2"
      style={{ display: 'inline-flex', alignItems: 'center' }}
      data-cy="org-structure-export-pdf-btn"
      id="org-structure-export-pdf-btn"
    >
      PDF
    </Menu.Item>
    <Menu.Item
      key="jpeg"
      icon={<FaFileImage size={24} />}
      className="font-semibold text-md"
      style={{ display: 'inline-flex', alignItems: 'center' }}
      data-cy="org-structure-export-jpeg-btn"
      id="org-structure-export-jpeg-btn"
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

export const showDrawer = (
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
  <Menu data-cy="org-structure-actions-menu" id="org-structure-actions-menu">
    <AccessGuard permissions={[Permissions.DeleteDepartment]}>
      <Menu.Item
        key="1"
        className="py-2 bg-white hover:bg-gray-200"
        style={{ paddingRight: '64px', backgroundColor: '#fff' }}
        onClick={() =>
          showDrawer('transfer', 'Transfer', 'Transfer Department')
        }
        data-cy="org-structure-transfer-menu-item"
        id="org-structure-transfer-menu-item"
      >
        Transfer
      </Menu.Item>
      <Menu.Item
        key="2"
        className="py-2 bg-white hover:bg-gray-200"
        style={{ paddingRight: '64px' }}
        onClick={() => showDrawer('merge', 'Merge', 'Merge Department')}
        data-cy="org-structure-merge-menu-item"
        id="org-structure-merge-menu-item"
      >
        Merge
      </Menu.Item>
      {/* <Menu.Item
      key="3"
      className="py-2"
      style={{ paddingRight: '64px' }}
      onClick={() => showDrawer('dissolve', 'Dissove', 'Dessolve Department')}
    >
      Dissolve
    </Menu.Item> */}
    </AccessGuard>
  </Menu>
);
