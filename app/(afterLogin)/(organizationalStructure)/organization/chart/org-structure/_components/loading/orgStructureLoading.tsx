'use client';
import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';

interface OrgChartSkeletonProps {
  loading: boolean;
}

const OrgChartSkeleton: React.FC<OrgChartSkeletonProps> = ({ loading }) => {
  if (!loading) return null;
  /* eslint-disable @typescript-eslint/naming-convention */
  return (
    <div className="w-full flex justify-center items-center py-7 overflow-x-auto" data-cy="org-structure-loading-container" id="org-structure-loading-container">
      <div className="p-4 sm:p-2 md:p-6 lg:p-8" data-cy="org-org-structure-components-loading-orgstructureloading-div-1" id="org-org-structure-components-loading-orgstructureloading-div-1">
        <Tree
          label={
            <div className="bg-gray-200 h-12 w-32 text-center rounded-md inline-block border animate-pulse" data-cy="org-structure-loading-label" id="org-structure-loading-label" />
          }
          lineWidth={'2px'}
          lineColor={'#e5e7eb'}
          lineBorderRadius={'10px'}
         data-cy="org-org-structure-components-loading-orgstructureloading-tree-1">
          {[...Array(3)].map((_, index) => (
            <TreeNode
              key={index}
              label={
                <div className="bg-gray-200 h-10 w-24 rounded-md animate-pulse inline-block border" data-cy="org-structure-loading-label" id="org-structure-loading-label" />
              }
             data-cy="org-org-structure-components-loading-orgstructureloading-treenode-1">
              {[...Array(2)].map((_, grandchildIndex) => (
                <TreeNode
                  key={grandchildIndex}
                  label={
                    <div className="bg-gray-200 h-8 w-20 rounded-md animate-pulse" data-cy="org-structure-loading-label" id="org-structure-loading-label" />
                  }
                 data-cy="org-org-structure-components-loading-orgstructureloading-treenode-2"/>
              ))}
            </TreeNode>
          ))}
        </Tree>
      </div>
    </div>
  );
  /* eslint-enable @typescript-eslint/naming-convention */
};

export default OrgChartSkeleton;
