'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button, message } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { FaCopy } from 'react-icons/fa6';
import InternTable from './_components/table';
import CreateIntern from './_components/drawer';
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PUBLIC_DOMAIN } from '@/utils/constants';

const InternPage = () => {
  const {
    createInternDrawer,
    setCreateInternDrawer,
    setEditInternData,
    editInternData,
  } = useInternStore();
  const { tenantId } = useAuthenticationStore();

  const onClose = () => {
    setCreateInternDrawer(false);
    setEditInternData(null);
    return true;
  };

  const handleCreate = () => {
    setCreateInternDrawer(true);
    setEditInternData(null);
  };

  const handleEdit = (data: any) => {
    setCreateInternDrawer(true);
    setEditInternData(data);
  };

  const handleCopyLink = () => {
    if (!tenantId) {
      message.error('Unable to generate link. Please try again.');
      return;
    }

    const publicLink = `${PUBLIC_DOMAIN}/internship/${tenantId}`;

    navigator.clipboard
      .writeText(publicLink)
      .then(() => {
        message.success('Public application link copied to clipboard!');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = publicLink;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          message.success('Public application link copied to clipboard!');
        } catch (err) {
          message.error(
            'Failed to copy link. Please copy manually: ' + publicLink,
          );
        }
        document.body.removeChild(textArea);
      });
  };

  return (
    <div
      id="talent-acquisition-intern-page-div-container"
      data-cy="talent-acquisition-intern-page-div-container"
      className="h-auto w-full bg-white"
    >
      <div
        id="talent-acquisition-intern-page-div-header"
        data-cy="talent-acquisition-intern-page-div-header"
        className="flex flex-wrap justify-between items-center bg-white"
      >
        <CustomBreadcrumb
          data-cy="talent-acquisition-intern-page-breadcrumb"
          title="Intern"
          subtitle={
            <>
              <span className="text-xs sm:text-sm">
                Manage and review intern applicants.
              </span>
            </>
          }
        />
        <div
          id="talent-acquisition-intern-page-div-actions"
          data-cy="talent-acquisition-intern-page-div-actions"
          className="flex justify-between items-center rounded-lg w-fit h-10 px-3 gap-4"
        >
          <Button
            type="primary"
            id="createUserButton"
            data-cy="talent-acquisition-intern-button-new"
            className="h-10 w-10 sm:w-auto"
            icon={<FaPlus />}
            onClick={handleCreate}
          >
            <span className="hidden sm:inline">New</span>
          </Button>
          <Button
            type="primary"
            id="createUserButton"
            data-cy="talent-acquisition-intern-button-copy-link"
            className="h-10 w-10 sm:w-auto"
            icon={<FaCopy />}
            onClick={handleCopyLink}
            title="Copy public application link"
          >
            <span className="hidden sm:inline">Copy Link</span>
          </Button>
        </div>
      </div>

      <div
        id="talent-acquisition-intern-page-div-content"
        data-cy="talent-acquisition-intern-page-div-content"
      >
        <InternTable
          data-cy="talent-acquisition-intern-table"
          onEdit={handleEdit}
        />
        <CreateIntern
          open={createInternDrawer}
          onClose={onClose}
          editData={editInternData}
          isEdit={!!editInternData}
        />
      </div>
    </div>
  );
};

export default InternPage;
