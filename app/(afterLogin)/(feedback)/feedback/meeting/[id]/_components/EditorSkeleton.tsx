import React from 'react';

export default function EditorSkeleton() {
  return (
    <div className="border rounded animate-pulse" data-cy="feedback-meeting-components-editorskeleton" id="feedback-meeting-components-editorskeleton">
      <div className="px-4 flex gap-6 flex-wrap border-b border-b-gray-300 py-2" data-cy="feedback-meeting-components-editorskeleton-toolbar" id="feedback-meeting-components-editorskeleton-toolbar">
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-1" id="feedback-meeting-components-editorskeleton-toolbar-button-1"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-2" id="feedback-meeting-components-editorskeleton-toolbar-button-2"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-3" id="feedback-meeting-components-editorskeleton-toolbar-button-3"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-4" id="feedback-meeting-components-editorskeleton-toolbar-button-4"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-5" id="feedback-meeting-components-editorskeleton-toolbar-button-5"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-6" id="feedback-meeting-components-editorskeleton-toolbar-button-6"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-7" id="feedback-meeting-components-editorskeleton-toolbar-button-7"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-8" id="feedback-meeting-components-editorskeleton-toolbar-button-8"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-9" id="feedback-meeting-components-editorskeleton-toolbar-button-9"></div>
        <div className="h-6 w-6 bg-gray-200 rounded" data-cy="feedback-meeting-components-editorskeleton-toolbar-button-10" id="feedback-meeting-components-editorskeleton-toolbar-button-10"></div>
      </div>
      <div className="h-80 bg-gray-200 rounded px-4 py-2" data-cy="feedback-meeting-components-editorskeleton-body" id="feedback-meeting-components-editorskeleton-body"></div>
    </div>
  );
}
