'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button, message } from 'antd';
import { FaCopy, FaPlus } from 'react-icons/fa';
import TalentRoasterTable from './_components/table';
import CreateTalentRoaster from './_components/drawer';
import { useTalentRoasterStore } from '@/store/uistate/features/recruitment/talent-resource/talent-roaster';
import CustomButton from '@/components/common/buttons/customButton';
import { IoIosShareAlt } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';
import AddToJobPipeline from './_components/modal';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PUBLIC_DOMAIN } from '@/utils/constants';

// Define the interface that matches the table data structure
interface TalentRoasterItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  CGPA: number;
  departmentId: string;
  createdAt: string;
  resumeUrl: string;
  documentName?: string;
  graduateYear: string;
  coverLetter?: string;
}

const TalentRoasterPage = () => {
  const {
    createTalentRoasterDrawer,
    setCreateTalentRoasterDrawer,
    setEditData,
    editData,
    selectedTalentRoaster,
    setMoveToJobPipelineModal,
    moveToJobPipelineModal,
    setSelectedTalentRoaster,
  } = useTalentRoasterStore();
  const { isMobile, isTablet } = useIsMobile();
  const { tenantId } = useAuthenticationStore();

  const handleEdit = (data: TalentRoasterItem) => {
    setCreateTalentRoasterDrawer(true);
    setEditData(data);
  };

  const handleCreate = () => {
    setCreateTalentRoasterDrawer(true);
    setEditData(null);
  };

  const onClose = () => {
    setCreateTalentRoasterDrawer(false);
    setEditData(null);
    return true;
  };

  const handleMoveToJobPipeline = () => {
    setMoveToJobPipelineModal(true);
    setSelectedTalentRoaster(selectedTalentRoaster);
  };

  const onCancel = () => {
    setMoveToJobPipelineModal(false);
  };

  const handleRemoveCandidate = (candidateId: string) => {
    const updatedCandidates =
      selectedTalentRoaster?.filter(
        (candidate: TalentRoasterItem) => candidate.id !== candidateId,
      ) || [];
    setSelectedTalentRoaster(updatedCandidates);
  };

  const handleCopyLink = () => {
    if (!tenantId) {
      message.error('Unable to generate link. Please try again.');
      return;
    }

    const publicLink = `${PUBLIC_DOMAIN}/talent-roster/${tenantId}`;

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
          title="Talent Roster"
          subtitle={
            <>
              <span className="text-xs sm:text-xs">
                Unassigned profiles for potential hiring.
              </span>
            </>
          }
        />
        <div className="flex justify-between items-center rounded-lg w-fit h-10 px-3 gap-4">
          {selectedTalentRoaster?.length > 0 && (
            <div className="mr-4">
              <CustomButton
                title={
                  !(isMobile || isTablet) && (
                    <span className="hidden sm:inline">Move to Job</span>
                  )
                }
                id="createUserButton"
                icon={<IoIosShareAlt className="md:mr-0 ml-2" size={20} />}
                onClick={handleMoveToJobPipeline}
                className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
              />
            </div>
          )}
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
            id="copyLinkButton"
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
        <TalentRoasterTable onEdit={handleEdit} />
        <CreateTalentRoaster
          open={createTalentRoasterDrawer}
          onClose={onClose}
          editData={editData}
          isEdit={!!editData}
        />
        <AddToJobPipeline
          open={moveToJobPipelineModal}
          onCancel={onCancel}
          selectedCandidates={selectedTalentRoaster}
          onRemoveCandidate={handleRemoveCandidate}
          availableJobs={[]}
          onSubmit={() => {}}
        />
      </div>
    </div>
  );
};

export default TalentRoasterPage;
