'use client';

import { Button } from 'antd';
import { ShieldAlert } from 'lucide-react';

/**
 * Fills the collaboration panel in place of the embed when the user is not a
 * member of the collaboration platform. The embedded app reports that (see
 * COLLABORATION_ACCESS_DENIED_MESSAGE_TYPE) instead of signing the user out,
 * which would sign them out of Workspace too.
 *
 * Carries its own Close button because the panel has no host bar — the embed's
 * header normally provides one, and the embed is gone here.
 */
export function CollaborationAccessDenied({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      data-cy="collaboration-access-denied"
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-white px-6 py-8 text-center"
    >
      <div
        data-cy="collaboration-access-denied-icon"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50"
      >
        <ShieldAlert className="h-7 w-7 text-red-600" aria-hidden />
      </div>
      <h2
        data-cy="collaboration-access-denied-title"
        className="m-0 text-xl font-semibold text-slate-900"
      >
        Access Denied
      </h2>
      <p
        data-cy="collaboration-access-denied-message"
        className="m-0 max-w-xs text-sm text-slate-500"
      >
        You don&apos;t have access to Collaboration. If you think this is a
        mistake, please contact your administrator.
      </p>
      <Button
        className="mt-2"
        data-cy="collaboration-access-denied-close"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
}
