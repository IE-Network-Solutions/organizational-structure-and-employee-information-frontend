'use client';

import { useEffect, useMemo, useState } from 'react';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  collaborationQueryKeys,
  isCollabAdminRole,
  mergeMembersIntoCatalogSpaces,
  useAddCollabSpaceMembers,
  useCollaborationBootstrap,
  useCollaborationCatalog,
  useCollaborationMentionNotifications,
  useMarkCollabMentionsRead,
} from '@/store/server/features/collaboration';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';
import AddMembersModal from './AddMembersModal';
import { collaborationColors } from './collaborationColors';
import ChannelPostsView from './ChannelPostsView';
import ChannelThreadsView from './ChannelThreadsView';
import { EditChannelModal, EditSpaceModal } from './CreateSpaceChannelModals';
import SpacesSidebar, {
  SelectSpaceEmptyState,
  type SelectedChannelTarget,
} from './SpacesSidebar';
import {
  useAvailableOrgMembers,
  useCollaborationMemberLookup,
} from './useCollaborationMemberLookup';
import type { CollaborationSpace } from './mockAnnouncementService';
import { useQueryClient } from 'react-query';

const AnnouncementWorkspace = () => {
  const bootstrapQuery = useCollaborationBootstrap();
  const queryClient = useQueryClient();
  const memberLookup = useCollaborationMemberLookup();
  const {
    data: spaces = [],
    isLoading: catalogLoading,
    isError: catalogError,
  } = useCollaborationCatalog(memberLookup, bootstrapQuery.isSuccess);
  const isLoading = bootstrapQuery.isLoading || catalogLoading;
  const isError = bootstrapQuery.isError || catalogError;

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
  const addSpaceMembersMutation = useAddCollabSpaceMembers();
  const { data: mentionNotifications = [] } =
    useCollaborationMentionNotifications();
  const markMentionsReadMutation = useMarkCollabMentionsRead();

  const integratedMentionNotifications = useMemo(() => {
    const integratedChannelIds = new Set(enabledChannelIds);
    return mentionNotifications.filter(
      (notification) =>
        notification.channelId &&
        integratedChannelIds.has(notification.channelId),
    );
  }, [enabledChannelIds, mentionNotifications]);
  const mentionChannelIds = useMemo(
    () =>
      new Set(
        integratedMentionNotifications
          .map((notification) => notification.channelId)
          .filter((channelId): channelId is string => Boolean(channelId)),
      ),
    [integratedMentionNotifications],
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

  const selectedSpace = selected
    ? findSpaceById(spaces, selected.spaceId)
    : undefined;
  const selectedChannel =
    selected && selectedSpace
      ? findChannel(spaces, selected.spaceId, selected.channelId)
      : undefined;
  const selectedIsEnabled =
    !!selected && enabledChannelIds.includes(selected.channelId);

  const addMembersSpace = addMembersSpaceId
    ? findSpaceById(spaces, addMembersSpaceId)
    : undefined;
  const editSpace = editSpaceId
    ? findSpaceById(spaces, editSpaceId)
    : undefined;
  const editChannel = editChannelTarget
    ? findChannel(
        spaces,
        editChannelTarget.spaceId,
        editChannelTarget.channelId,
      )
    : undefined;

  const existingMemberIds = useMemo(
    () => new Set(addMembersSpace?.members.map((member) => member.id) ?? []),
    [addMembersSpace],
  );
  const { members: availableOrgMembers, isLoading: orgMembersLoading } =
    useAvailableOrgMembers(existingMemberIds);

  useEffect(() => {
    if (selected && !selectedIsEnabled) {
      setSelected(null);
    }
  }, [selected, selectedIsEnabled]);

  const handleSelectChannel = (target: SelectedChannelTarget) => {
    setSelected(target);
    setExpandedSpaceKeys([target.spaceId]);

    const notificationIds = integratedMentionNotifications
      .filter((notification) => notification.channelId === target.channelId)
      .map((notification) => notification.notificationId)
      .filter(Boolean);
    if (notificationIds.length > 0) {
      markMentionsReadMutation.mutate({ notificationIds });
    }
  };

  const handleAddSpaceMembers = async (memberIds: string[]) => {
    if (!addMembersSpaceId || !addMembersSpace) return;
    if (!isCollabAdminRole(addMembersSpace.currentUserRole)) {
      NotificationMessage.error({
        message: 'Admin access required',
        description: 'Only a space owner or admin can add members.',
      });
      setAddMembersSpaceId(null);
      return;
    }

    try {
      // Docs: POST /space-members only. Public channels inherit space members.
      const addedIds = await addSpaceMembersMutation.mutateAsync({
        spaceId: addMembersSpaceId,
        memberIds,
      });

      queryClient.setQueriesData(
        collaborationQueryKeys.catalog,
        (prev: CollaborationSpace[] | undefined) =>
          mergeMembersIntoCatalogSpaces(
            prev,
            addMembersSpaceId,
            addedIds,
            memberLookup,
          ),
      );
      void queryClient.invalidateQueries(collaborationQueryKeys.catalog);
      void queryClient.invalidateQueries(collaborationQueryKeys.channelMembers);

      NotificationMessage.success({
        message: 'Members added',
        description: `${addedIds.length} member${
          addedIds.length === 1 ? '' : 's'
        } added to ${addMembersSpace.name}.`,
      });
      setAddMembersSpaceId(null);
    } catch (error) {
      void queryClient.invalidateQueries(collaborationQueryKeys.catalog);
      void queryClient.invalidateQueries(collaborationQueryKeys.channelMembers);
      NotificationMessage.error({
        message: 'Could not add members',
        description:
          error instanceof Error
            ? error.message
            : 'Check Collaboration permissions and try again.',
      });
    }
  };

  const showChannel = Boolean(
    selected && selectedSpace && selectedChannel && selectedIsEnabled,
  );

  if (isLoading) {
    return (
      <div
        className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-white"
        data-cy="announcement-workspace-loading"
      >
        <p
          className="text-sm text-gray-500"
          data-cy="announcement-workspace-loading-text"
        >
          Loading collaboration spaces…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-white px-4"
        data-cy="announcement-workspace-error"
      >
        <p
          className="text-center text-sm text-gray-500"
          data-cy="announcement-workspace-error-text"
        >
          Could not load collaboration spaces. Check your connection and try
          again.
        </p>
      </div>
    );
  }

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
          mentionChannelIds={mentionChannelIds}
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
          selectedChannel.channelType === 'threads' ? (
            <ChannelThreadsView
              space={selectedSpace}
              channel={selectedChannel}
              onBack={() => setSelected(null)}
            />
          ) : (
            <ChannelPostsView
              space={selectedSpace}
              channel={selectedChannel}
              onBack={() => setSelected(null)}
            />
          )
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
            Choose people from the organization directory (org-and-emp) to add
            to{' '}
            <strong data-cy="announcement-space-member-target-name">
              {addMembersSpace?.name}
            </strong>
            .
          </>
        }
        members={availableOrgMembers}
        loading={orgMembersLoading}
        emptyText="Everyone in the organization directory is already in this space."
        onClose={() => setAddMembersSpaceId(null)}
        onAdd={(memberIds) => void handleAddSpaceMembers(memberIds)}
      />
    </div>
  );
};

export default AnnouncementWorkspace;
