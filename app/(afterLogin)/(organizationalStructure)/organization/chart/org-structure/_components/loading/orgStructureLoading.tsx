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
    <div
      className="w-full flex justify-center items-center py-7 overflow-hidden"
      data-cy="org-structure-loading-container"
      id="org-structure-loading-container"
    >
      <div
        className="w-full max-w-full sm:max-w-4xl px-2 sm:px-6 md:px-8 lg:px-10 flex justify-center"
        data-cy="org-org-structure-components-loading-orgstructureloading-div-1"
        id="org-org-structure-components-loading-orgstructureloading-div-1"
      >
        <div
          className="origin-top scale-60 sm:scale-90 md:scale-95"
          data-cy="org-structure-loading-tree-wrapper"
        >
          <Tree
            label={
              <div
                className="bg-gray-200 h-12 w-40 sm:h-14 sm:w-48 text-center rounded-md inline-block border animate-pulse"
                data-cy="org-structure-loading-label"
                id="org-structure-loading-label"
              />
            }
            lineWidth={'2px'}
            lineColor={'#e5e7eb'}
            lineBorderRadius={'10px'}
            data-cy="org-org-structure-components-loading-orgstructureloading-tree-1"
          >
            {/* Level 1 branches – 5 siblings like main org chart */}
            {[...Array(5)].map((_, index) => (
              <TreeNode
                key={index}
                label={
                  <div
                    className="bg-gray-200 h-9 w-28 sm:h-10 sm:w-32 rounded-md animate-pulse inline-block border"
                    data-cy="org-structure-loading-label"
                    id="org-structure-loading-label"
                  />
                }
                data-cy="org-org-structure-components-loading-orgstructureloading-treenode-1"
              >
                {/* Level 2 branches – more leaves for the two middle nodes */}
                {[...Array(index === 2 || index === 3 ? 4 : 2)].map(
                  (_, grandchildIndex) => (
                    <TreeNode
                      key={grandchildIndex}
                      label={
                        <div
                          className="bg-gray-200 h-7 w-20 sm:h-8 sm:w-24 rounded-md animate-pulse inline-block border"
                          data-cy="org-structure-loading-label"
                          id="org-structure-loading-label"
                        />
                      }
                      data-cy="org-org-structure-components-loading-orgstructureloading-treenode-2"
                    />
                  ),
                )}
              </TreeNode>
            ))}
          </Tree>
        </div>
      </div>
    </div>
  );
  /* eslint-enable @typescript-eslint/naming-convention */
};

export default OrgChartSkeleton;
