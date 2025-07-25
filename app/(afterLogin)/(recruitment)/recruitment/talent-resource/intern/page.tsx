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
    <div className="h-auto w-full bg-white">
      <div className="flex flex-wrap justify-between items-center bg-white">
        <CustomBreadcrumb
          title="Intern"
          subtitle={
            <>
              <span className="text-xs sm:text-sm">
                Manage and review intern applicants.
              </span>
            </>
          }
        />
        <div className="flex justify-between items-center rounded-lg w-fit h-10 px-3 gap-4">
          <Button
            type="primary"
            id="createUserButton"
            className="h-10 w-10 sm:w-auto"
            icon={<FaPlus />}
            onClick={handleCreate}
          >
            <span className="hidden sm:inline">New</span>
          </Button>
          <Button
            type="primary"
            id="createUserButton"
            className="h-10 w-10 sm:w-auto"
            icon={<FaCopy />}
            onClick={handleCopyLink}
            title="Copy public application link"
          >
            <span className="hidden sm:inline">Copy Link</span>
          </Button>
        </div>
      </div>

      <div>
        <InternTable onEdit={handleEdit} />
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
