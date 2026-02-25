'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import TalentPoolPage from '../talent-resource/talent-pool/_components/talentPoolpage';
import { useTalentResourceStore } from '@/store/uistate/features/recruitment/talent-resource';
import TalentRoasterPage from './talent-roaster/page';
import InternPage from './intern/page';
import { Breadcrumb, Button, Divider, Tabs } from 'antd';
import Link from 'next/link';
import AccessGuard from '@/utils/permissionGuard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Permissions } from '@/types/commons/permissionEnum';
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';
import { useTalentRoasterStore } from '@/store/uistate/features/recruitment/talent-resource/talent-roaster';
import CustomButton from '@/components/common/buttons/customButton';
import { IoIosShareAlt } from 'react-icons/io';
import { PUBLIC_DOMAIN } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { message } from 'antd';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

const TalentResourcePage = () => {
  const { setActiveTab, activeTab } = useTalentResourceStore();
  const { setIsAddCandidateVisible } = useInternStore();
  const { isMobile, isTablet } = useIsMobile();
  const { tenantId } = useAuthenticationStore();

  const {
    setCreateTalentRoasterDrawer,
    setEditData,
    selectedTalentRoaster,
    setMoveToJobPipelineModal,
    setSelectedTalentRoaster,
  } = useTalentRoasterStore();
  const { setCreateInternDrawer, setEditInternData } = useInternStore();
  const handleAdd = () => {
    setIsAddCandidateVisible(true);
  };

  const handleCreate = () => {
    setCreateTalentRoasterDrawer(true);
    setEditData(null);
  };

  const handleMoveToJobPipeline = () => {
    setMoveToJobPipelineModal(true);
    setSelectedTalentRoaster(selectedTalentRoaster);
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

  const handleCreateIntern = () => {
    setCreateInternDrawer(true);
    setEditInternData(null);
  };

  const handleCopyLinkIntern = () => {
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
      id="talent-acquisition-talent-resource-page-div-container"
      data-cy="talent-acquisition-talent-resource-page-div-container"
      className="h-auto w-full px-2 sm:px-6"
    >
      <CustomBreadcrumb
        title={
          <span
            className="text-xl"
            data-cy="talent-acquisition-talent-resource-page-breadcrumb-title"
          >
            Talent Resource
          </span>
        }
        subtitle={
          <Breadcrumb
            data-cy="talent-acquisition-talent-resource-page-breadcrumb"
            items={[
              {
                title: (
                  <span
                    className="text-xs"
                    data-cy="talent-acquisition-talent-resource-page-breadcrumb-item-title"
                  >
                    Talent Aquistion
                  </span>
                ),
              },
              {
                title: (
                  <Link
                    className="text-xs"
                    data-cy="talent-acquisition-talent-resource-page-breadcrumb-item-link"
                    href="/recruitment/talent-resource"
                  >
                    Talent Resource
                  </Link>
                ),
              },
            ]}
          />
        }
        data-cy="manage-employees-breadcrumb"
      />
      <Divider />

      <Tabs
        id="talent-acquisition-talent-resource-page-div-tabs"
        data-cy="talent-acquisition-talent-resource-page-div-tabs"
        activeKey={String(activeTab)}
        onChange={(key) => setActiveTab(Number(key))}
        items={[
          {
            key: '1',
            label: (
              <span
                id="talent-acquisition-talent-resource-tab-talent-pool"
                data-cy="talent-acquisition-talent-resource-tab-talent-pool"
                className="text-xs sm:text-sm text-nowrap"
              >
                Talent Pool
              </span>
            ),
            children: (
              <div
                id="talent-acquisition-talent-resource-page-div-content"
                data-cy="talent-acquisition-talent-resource-page-div-content"
                className="w-full h-auto rounded-md border border-[#d9d9d9]"
              >
                <TalentPoolPage />
              </div>
            ),
          },
          {
            key: '2',
            label: (
              <span
                id="talent-acquisition-talent-resource-page-tab-talent-roster-label"
                data-cy="talent-acquisition-talent-resource-tab-talent-roster"
                className="text-xs sm:text-sm text-nowrap"
              >
                Talent Roster
              </span>
            ),
            children: (
              <div
                id="talent-acquisition-talent-resource-page-div-content"
                data-cy="talent-acquisition-talent-resource-page-div-content"
                className="w-full h-auto bg-white rounded-md border border-[#d9d9d9]"
              >
                <TalentRoasterPage />
              </div>
            ),
          },
          {
            key: '3',
            label: (
              <span
                data-cy="talent-acquisition-talent-resource-tab-intern"
                className="text-xs sm:text-sm text-nowrap"
              >
                Intern
              </span>
            ),
            children: (
              <div
                id="talent-acquisition-talent-resource-page-div-content"
                data-cy="talent-acquisition-talent-resource-page-div-content"
                className="w-full h-auto border-2 border-[#d9d9d9] rounded-lg"
              >
                <InternPage />
              </div>
            ),
          },
        ]}
        tabBarExtraContent={
          activeTab === 1 ? (
            <AccessGuard permissions={[Permissions.TransferCandidate]}>
              <Button
                type="primary"
                id="createUserButton"
                data-cy="talent-acquisition-talent-pool-page-button-add"
                className="h-10"
                icon={<PersonAddOutlinedIcon />}
                onClick={handleAdd}
              >
                {!isMobile && 'Add Candidate'}
              </Button>
            </AccessGuard>
          ) : activeTab === 2 ? (
            <div
              id="talent-acquisition-talent-roaster-page-div-buttons"
              data-cy="talent-acquisition-talent-roaster-page-div-buttons"
              className="flex justify-between items-center rounded-lg w-fit h-10 px-3 gap-4"
            >
              {selectedTalentRoaster?.length > 0 && (
                <div
                  id="talent-acquisition-talent-roaster-page-div-button-move-job"
                  data-cy="talent-acquisition-talent-roaster-page-div-button-move-job"
                  className="mr-4"
                >
                  <CustomButton
                    title={
                      !(isMobile || isTablet) && (
                        <span
                          data-cy="recruitment-talent-resource-talent-roaster-page-tsx-page-span-197"
                          className="hidden sm:inline"
                        >
                          Move to Job
                        </span>
                      )
                    }
                    id="createUserButton"
                    data-cy="talent-acquisition-talent-roaster-button-move-job"
                    icon={<IoIosShareAlt className="md:mr-0 ml-2" size={20} />}
                    onClick={handleMoveToJobPipeline}
                    className="bg-blue-600 hover:bg-blue-700 w-5 sm:w-auto sm:px-5 !h-14 px-6 py-6 "
                  />
                </div>
              )}
              <Button
                id="copyLinkButton"
                data-cy="talent-acquisition-talent-roaster-button-copy-link"
                className="h-10 w-10 sm:w-auto border-1 border-[#d9d9d9] rounded-md"
                icon={<ContentCopyOutlinedIcon className="text-[#4d4d4d]" />}
                onClick={handleCopyLink}
                title="Copy public application link"
              >
                <span
                  data-cy="recruitment-talent-resource-talent-roaster-page-tsx-page-span-227"
                  className="hidden sm:inline text-sm text-[#4d4d4d]"
                >
                  Copy Link
                </span>
              </Button>
              <Button
                type="primary"
                id="createUserButton"
                data-cy="talent-acquisition-talent-roaster-button-new"
                className="h-10 w-10 sm:w-auto"
                icon={<PersonAddOutlinedIcon />}
                onClick={handleCreate}
              >
                <span
                  data-cy="recruitment-talent-resource-talent-roaster-page-tsx-page-span-216"
                  className="hidden sm:inline"
                >
                  Add Talent Roster
                </span>
              </Button>
            </div>
          ) : activeTab === 3 ? (
            <div
              id="talent-acquisition-intern-page-div-actions"
              data-cy="talent-acquisition-intern-page-div-actions"
              className="flex justify-between items-center rounded-lg w-fit h-10 px-3 gap-4"
            >
              <Button
                type="default"
                id="createUserButton"
                data-cy="talent-acquisition-intern-button-copy-link"
                className="h-10 w-10 sm:w-auto border-1 border-[#d9d9d9] rounded-md"
                icon={<ContentCopyOutlinedIcon className="text-[#4d4d4d]" />}
                onClick={handleCopyLinkIntern}
                title="Copy public application link"
              >
                <span
                  data-cy="recruitment-talent-resource-intern-page-tsx-page-span-115"
                  className="hidden sm:inline text-sm text-[#4d4d4d]"
                >
                  Copy Link
                </span>
              </Button>
              <Button
                type="primary"
                id="createUserButton"
                data-cy="talent-acquisition-intern-button-new"
                className="h-10 w-10 sm:w-auto"
                icon={<PersonAddOutlinedIcon />}
                onClick={handleCreateIntern}
              >
                <span
                  data-cy="recruitment-talent-resource-intern-page-tsx-page-span-104"
                  className="hidden sm:inline"
                >
                  Add Intern
                </span>
              </Button>
            </div>
          ) : null
        }
        className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
      />
    </div>
  );
};

export default TalentResourcePage;
