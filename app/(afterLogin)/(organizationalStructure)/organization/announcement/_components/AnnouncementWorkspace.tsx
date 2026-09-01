'use client';

import { useEffect, useMemo, useState } from 'react';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';
import { MOCK_ORG_DIRECTORY } from './mockAnnouncementService';
import AddMembersModal from './AddMembersModal';
import { collaborationColors } from './collaborationColors';
import ChannelPostsView from './ChannelPostsView';
import { EditChannelModal, EditSpaceModal } from './CreateSpaceChannelModals';
import SpacesSidebar, {
  SelectSpaceEmptyState,
  type SelectedChannelTarget,
} from './SpacesSidebar';

const AnnouncementWorkspace = () => {
  const spaces = useAnnouncementChannelsStore((state) => state.spaces);
  const enabledChannelIds = useAnnouncementChannelsStore(
    (state) => state.enabledChannelIds,
  );
  const sidebarSpaceIds = useAnnouncementChannelsStore(
    (state) => state.sidebarSpaceIds,
  );
  const findSpaceById = useAnnouncementChannelsStore(
    (state) => state.findSpaceById,
  );
  const findChannel = useAnnouncementChannelsStore(
    (state) => state.findChannel,
  );
  const addSpaceMembers = useAnnouncementChannelsStore(
    (state) => state.addSpaceMembers,
  );

  const sidebarSpaces = useMemo(
    () =>
      spaces
        .map((space) => ({
          ...space,
          channels: space.channels.filter((channel) =>
            enabledChannelIds.includes(channel.id),
          ),
        }))
        .filter(
          (space) =>
            space.channels.length > 0 || sidebarSpaceIds.includes(space.id),
        ),
    [spaces, enabledChannelIds, sidebarSpaceIds],
  );

  const [expandedSpaceKeys, setExpandedSpaceKeys] = useState<string[]>([]);
  const [selected, setSelected] = useState<SelectedChannelTarget | null>(null);
  const [addMembersSpaceId, setAddMembersSpaceId] = useState<string | null>(
    null,
  );
  const [editSpaceId, setEditSpaceId] = useState<string | null>(null);
  const [editChannelTarget, setEditChannelTarget] =
    useState<SelectedChannelTarget | null>(null);

  const selectedSpace = selected ? findSpaceById(selected.spaceId) : undefined;
  const selectedChannel =
    selected && selectedSpace
      ? findChannel(selected.spaceId, selected.channelId)
      : undefined;
  const selectedIsEnabled =
    !!selected && enabledChannelIds.includes(selected.channelId);

  const addMembersSpace = addMembersSpaceId
    ? findSpaceById(addMembersSpaceId)
    : undefined;
  const editSpace = editSpaceId ? findSpaceById(editSpaceId) : undefined;
  const editChannel = editChannelTarget
    ? findChannel(editChannelTarget.spaceId, editChannelTarget.channelId)
    : undefined;

  const availableOrgMembers = useMemo(() => {
    if (!addMembersSpace) return [];
    const existingIds = new Set(
      addMembersSpace.members.map((member) => member.id),
    );
    return MOCK_ORG_DIRECTORY.filter((member) => !existingIds.has(member.id));
  }, [addMembersSpace]);

  useEffect(() => {
    if (selected && !selectedIsEnabled) {
      setSelected(null);
    }
  }, [selected, selectedIsEnabled]);

  const handleSelectChannel = (target: SelectedChannelTarget) => {
    setSelected(target);
    setExpandedSpaceKeys([target.spaceId]);
  };

  const handleAddSpaceMembers = (memberIds: string[]) => {
    if (!addMembersSpaceId) return;
    addSpaceMembers(addMembersSpaceId, memberIds);
    NotificationMessage.success({
      message: 'Members added',
      description: `${memberIds.length} member${
        memberIds.length === 1 ? '' : 's'
      } added to ${addMembersSpace?.name ?? 'space'}.`,
    });
    setAddMembersSpaceId(null);
  };

  const showChannel = Boolean(
    selected && selectedSpace && selectedChannel && selectedIsEnabled,
  );

  return (
    <div
      className="flex min-h-[calc(100vh-10rem)] overflow-hidden"
      style={{ background: collaborationColors.canvas }}
      data-cy="announcement-workspace"
    >
      <div
        className={`w-full shrink-0 md:w-[280px] ${
          showChannel ? 'hidden md:block' : 'block'
        }`}
        data-cy="announcement-workspace-sidebar"
      >
        <SpacesSidebar
          spaces={sidebarSpaces}
          selected={selected}
          expandedSpaceKeys={expandedSpaceKeys}
          onExpandedChange={setExpandedSpaceKeys}
          onSelectChannel={handleSelectChannel}
          onAddSpaceMembers={setAddMembersSpaceId}
          onEditSpace={setEditSpaceId}
          onEditChannel={setEditChannelTarget}
        />
      </div>

      <main
        className={`min-w-0 flex-1 flex-col ${
          showChannel ? 'flex' : 'hidden md:flex'
        }`}
        style={{ background: '#FFFFFF' }}
        data-cy="announcement-workspace-main"
      >
        {showChannel && selected && selectedSpace && selectedChannel ? (
          <ChannelPostsView
            space={selectedSpace}
            channel={selectedChannel}
            onBack={() => setSelected(null)}
          />
        ) : (
          <SelectSpaceEmptyState
            hasIntegratedChannels={sidebarSpaces.length > 0}
          />
        )}
      </main>

      <EditSpaceModal
        open={Boolean(editSpaceId && editSpace)}
        space={editSpace}
        onClose={() => setEditSpaceId(null)}
      />
      <EditChannelModal
        open={Boolean(editChannelTarget && editChannel)}
        spaceId={editChannelTarget?.spaceId}
        channel={editChannel}
        onClose={() => setEditChannelTarget(null)}
      />
      <AddMembersModal
        open={Boolean(addMembersSpaceId && addMembersSpace)}
        title={`Add members to ${addMembersSpace?.name ?? 'space'}`}
        description={
          <>
            Choose people from the organization to add to{' '}
            <strong data-cy="organization-announcement-components-announcementworkspace-tsx-announcementworkspace-strong-171">
              {addMembersSpace?.name}
            </strong>
            .
          </>
        }
        members={availableOrgMembers}
        emptyText="Everyone in the directory is already in this space."
        onClose={() => setAddMembersSpaceId(null)}
        onAdd={handleAddSpaceMembers}
      />
    </div>
  );
};

export default AnnouncementWorkspace;
