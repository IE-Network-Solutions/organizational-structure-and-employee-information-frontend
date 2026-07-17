/** Selamnew Workspace V2.0 file (Figma). */
export const COPILOT_FIGMA_FILE =
  'https://www.figma.com/design/Kc4DjXYhw1Sw35GiDNBaSU/Selamnew-Workspace-V2.0';

/**
 * Copilot float + popover (inspect in Figma Dev Mode). URL uses `9676-40510`; REST API uses `9676:40510`.
 */
export const COPILOT_FIGMA_NODE_FLOAT = `${COPILOT_FIGMA_FILE}?node-id=9676-40510`;

/**
 * Same node as `COPILOT_FIGMA_NODE_FLOAT`, for Figma’s embed player (`iframe src`, docs, Storybook).
 * Example: `<iframe title="Copilot Figma" src={COPILOT_FIGMA_EMBED_SRC} width={800} height={450} />`
 */
export const COPILOT_FIGMA_EMBED_SRC =
  'https://embed.figma.com/design/Kc4DjXYhw1Sw35GiDNBaSU/Selamnew-Workspace-V2.0?node-id=9676-40510&embed-host=share';

/**
 * Copilot UI tokens — keep in sync with `COPILOT_FIGMA_NODE_FLOAT` / dashboard reference.
 * Float: ~6px radius white tile, thin blue border, blue pencil + sparkle glyph (`#1E40AF`); label pill.
 */
export const COPILOT_THEME = {
  floatFabBg: '#FFFFFF',
  floatFabBorder: '#1e40af',
  floatFabBorderWidth: 1,
  floatFabIcon: '#1E40AF',
  floatFabRadius: 6,
  floatFabShadow:
    '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(30, 64, 175, 0.12)',
  /**
   * Expanded white launcher (pencil + chevron): soft #1e40af bloom, heavier toward
   * bottom-right and right edge (reference UI).
   */
  floatFabExpandedShadow: '3px 3px 8.9px 2px #1E40AFCC',
  /** Collapsed vertical tab shadow — #1e40af */
  floatFabCollapsedShadow: '0 4px 14px rgba(30, 64, 175, 0.45)',
  /** Popover pill — 265×46 */
  floatPopoverBorder: '#E5E7EB',
  floatPopoverText: '#374151',
  floatPopoverShadow: '0 4px 16px rgba(15, 23, 42, 0.1)',
  /** Viewport inset for float (Figma: tight to corner above calendar) */
  floatInset: 20,
  /** Primary actions (send, share, panel accents) — workspace blue */
  actionBlue: '#2A48B1',
  linkBlue: '#2563EB',
  linkBlueActive: '#1D4ED8',
  /** User message — report card (Figma: light blue card, softer border, blue type) */
  userReportCardBg: '#EFF6FF',
  userReportCardBorder: '#60A5FA',
  userReportCardAccent: '#3B82F6',
  userReportCardRadius: 8,
  userPromptBadgeBg: '#EFF6FF',
  userPromptBadgeBorder: '#2563EB',
  userPromptBadgeText: '#1D4ED8',
  /** Legacy bubble tokens (unused if badge layout) */
  userBubbleBg: '#E6F4FF',
  userBubbleBorder: '#3B82F6',
  /** Assistant bubble — white card, ~12–16px radius, ~24px padding */
  assistantBubbleBorder: '#E0E0E0',
  assistantBubbleRadius: 14,
  assistantText: '#333333',
  assistantMuted: '#9CA3AF',
  /** Figma: 48×48, pale gray circle + black outline AI glyph */
  assistantAvatarSize: 48,
  assistantAvatarOutlinedBg: '#F3F4F6',
  assistantAvatarOutlinedBorder: '#E5E7EB',
  assistantAvatarGlyph: '#111827',
  assistantAvatarBg: '#111827',
  /** User row avatar — grey circle + person glyph */
  userMessageAvatarSize: 32,
  userMessageAvatarBg: '#D1D5DB',
  userMessageAvatarIcon: '#6B7280',
  /** Surfaces */
  pageBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  hairline: '#E2E8F0',
  panelHeaderBg: '#F5F5F5',
  /** Type */
  textPrimary: '#111827',
  textBody: '#333333',
  textMuted: '#6B7280',
  placeholder: '#9CA3AF',
  /** Composer (drawer / with chips) */
  composerRadius: 16,
  /** Workspace composer — spans full chat column */
  composerMaxWidth: 980,
  composerHeightPx: 52,
  /** Rounded corners per design (~12px) */
  composerRadiusWorkspace: 12,
  /** Workspace send — solid blue when active */
  workspaceSendBlue: '#2A48B1',
  workspaceSendDisabledBg: '#EBEBEB',
  workspaceSendDisabledIcon: '#B0B0B0',
  composerChromeBorder: '#E5E5E5',
  sendButtonPx: 36,
  /** Main column + saved-chats rail (SelamNew Copilot page mockup) */
  workspaceMainBg: '#FFFFFF',
  workspaceRailBg: '#F9FAFB',
  workspaceRailBorder: '#E5E7EB',
  workspaceRailWidthPx: 348,
  workspaceRailRadiusPx: 8,
  workspaceRailGapPx: 14,
  workspaceRailPaddingPx: 16,
  /** Workspace user bubble (sent message) */
  workspaceUserBubbleBg: '#E8F0FE',
  workspaceUserBubbleText: '#2A48B1',
  workspaceUserBubbleTime: '#2A48B1',
  /** Landing title + chips */
  workspaceAccentBlue: '#2A48B1',
  workspaceSubtitle: '#8B8B8B',
  workspaceChipBg: '#F5F5F5',
  workspaceChipBorder: '#E5E5E5',
  workspaceChipText: '#333333',
} as const;
