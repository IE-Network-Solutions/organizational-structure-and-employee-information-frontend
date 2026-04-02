'use client';
import TalentPoolPage from '../talent-resource/talent-pool/_components/talentPoolpage';
import { useTalentResourceStore } from '@/store/uistate/features/recruitment/talent-resource';
import TalentRoasterPage from './talent-roaster/page';
import InternPage from './intern/page';
import { Breadcrumb, Button, Divider, Tabs } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Permissions } from '@/types/commons/permissionEnum';
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';
import { useTalentRoasterStore } from '@/store/uistate/features/recruitment/talent-resource/talent-roaster';
import { IoIosShareAlt } from 'react-icons/io';
import { PUBLIC_DOMAIN } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { message } from 'antd';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

const TalentResourcePage = () => {
  const { setActiveTab, activeTab } = useTalentResourceStore();
  const { setIsAddCandidateVisible } = useInternStore();
  const { isMobile } = useIsMobile();
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
    >
      <style data-cy="talent-acquisition-talent-resource-page-styles">{`
        @media (min-width: 640px) {
        .full-bleed-header-divider {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          min-width: calc(100% + 48px) !important;
        }
      }
      `}</style>
      <div
        data-cy="talent-acquisition-talent-resource-page-breadcrumb"
        className="pt-6"
      >
        <h3
          className="text-black text-2xl font-bold mb-0"
          data-cy="talent-acquisition-talent-resource-page-breadcrumb-title"
          id="talent-acquisition-talent-resource-page-breadcrumb-title"
        >
          Talent Resource
        </h3>

        <Breadcrumb
          data-cy="talent-acquisition-talent-resource-page-breadcrumb"
          items={[
            {
              title: (
                <span
                  className="text-sm font-normal"
                  data-cy="talent-acquisition-talent-resource-page-breadcrumb-item-title"
                >
                  Talent Aquistion
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm text-[#4d4d4d] font-normal"
                  data-cy="talent-acquisition-talent-resource-page-breadcrumb-item-link"
                >
                  Talent Resource
                </span>
              ),
            },
          ]}
        />
      </div>
      <Divider className="full-bleed-header-divider" />

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
                className="text-base"
              >
                Talent Pool
              </span>
            ),
            children: (
              <div
                id="talent-acquisition-talent-resource-page-div-content"
                data-cy="talent-acquisition-talent-resource-page-div-content"
                className="w-full h-auto rounded-lg border border-[#d9d9d9] mt-4"
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
                className="text-base"
              >
                Talent Roster
              </span>
            ),
            children: (
              <div
                id="talent-acquisition-talent-resource-page-div-content"
                data-cy="talent-acquisition-talent-resource-page-div-content"
                className="w-full h-auto rounded-lg border border-[#d9d9d9] mt-4"
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
                className="text-base"
              >
                Intern
              </span>
            ),
            children: (
              <div
                id="talent-acquisition-talent-resource-page-div-content"
                data-cy="talent-acquisition-talent-resource-page-div-content"
                className="w-full h-auto border-[1px] border-[#d9d9d9] rounded-lg mt-4"
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
                className="h-10 w-12 sm:w-auto font-normal"
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
                  <Button
                    type="primary"
                    id="createUserButton"
                    data-cy="talent-acquisition-talent-roaster-button-move-job"
                    icon={<IoIosShareAlt className="md:mr-0 ml-2" size={20} />}
                    onClick={handleMoveToJobPipeline}
                    className="h-8 w-12 sm:w-auto"
                  >
                    <span
                      data-cy="recruitment-talent-resource-talent-roaster-page-tsx-page-span-197"
                      className="hidden sm:inline text-sm font-normal"
                    >
                      Move to Job
                    </span>
                  </Button>
                </div>
              )}
              <Button
                type="default"
                id="copyLinkButton"
                data-cy="talent-acquisition-talent-roaster-button-copy-link"
                className="h-10 w-12 sm:w-auto border-[1px] border-[#d9d9d9] font-normal text-base"
                icon={<ContentCopyOutlinedIcon className="text-[#4d4d4d]" />}
                onClick={handleCopyLink}
                title="Copy public application link"
              >
                {!isMobile && 'Copy Link'}
              </Button>
              <Button
                type="primary"
                id="createUserButton"
                data-cy="talent-acquisition-talent-roaster-button-new"
                className="h-10 w-12 sm:w-auto font-normal"
                icon={<PersonAddOutlinedIcon />}
                onClick={handleCreate}
              >
                {!isMobile && 'Add Talent Roster'}
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
                className="h-10 w-12 sm:w-auto border-[1px] border-[#d9d9d9] rounded-md font-normal text-base "
                icon={<ContentCopyOutlinedIcon className="text-[#4d4d4d]" />}
                onClick={handleCopyLinkIntern}
                title="Copy public application link"
              >
                {!isMobile && 'Copy Link'}
              </Button>
              <Button
                type="primary"
                id="createUserButton"
                data-cy="talent-acquisition-intern-button-new"
                className="h-10 w-12 sm:w-auto font-normal"
                icon={<PersonAddOutlinedIcon />}
                onClick={handleCreateIntern}
              >
                {!isMobile && 'Add Intern'}
              </Button>
            </div>
          ) : null
        }
        className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:font-bold [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
      />
    </div>
  );
};

export default TalentResourcePage;
