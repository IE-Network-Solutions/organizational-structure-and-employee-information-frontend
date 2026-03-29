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
  floatFabBorder: '#2563EB',
  floatFabBorderWidth: 1,
  floatFabIcon: '#1E40AF',
  floatFabRadius: 6,
  floatFabShadow:
    '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(37, 99, 235, 0.12)',
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
  /** Workspace composer — spans chat column (wide); height 72px */
  composerMaxWidth: 1600,
  composerHeightPx: 72,
  /** ~pill shape for 72px-tall composer */
  composerRadiusWorkspace: 36,
  /** Workspace send — solid blue circle (Figma ref) */
  workspaceSendBlue: '#1D4ED8',
  composerChromeBorder: '#E5E7EB',
  sendButtonPx: 40,
  /** Main column + reports rail (SelamNew Copilot page mockup) */
  workspaceMainBg: '#FFFFFF',
  workspaceRailBg: '#F3F4F6',
  workspaceRailBorder: '#E5E7EB',
  /** Send / vibrant primary in workspace */
  workspaceAccentBlue: '#2563EB',
} as const;
