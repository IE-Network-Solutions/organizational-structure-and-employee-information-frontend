import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Card, Col, Progress, Row } from 'antd';
import React from 'react';

const ObjectiveKeyResult: React.FC = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { data: OKRData } = useGetUserObjectiveDashboard(userId);
  return (
    <div className=" w-full my-3">
      <Row gutter={[16, 16]} className="w-full max-w-screen-xl">
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Card>
            <div className="text-md gap-2 flex flex-col justify-center mb-2">
              <div className="flex items-center justify-between">
                <div className="bg-[#7152F30D] flex items-center justify-between p-2 rounded-lg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.1705 6.75002H18.3095L13.7435 11.314C13.9008 11.7148 13.9152 12.1575 13.7845 12.5677C13.6537 12.9779 13.3857 13.3306 13.0255 13.5664C12.6653 13.8022 12.2348 13.9068 11.8066 13.8626C11.3783 13.8184 10.9783 13.6281 10.6739 13.3237C10.3694 13.0192 10.1791 12.6192 10.1349 12.191C10.0907 11.7627 10.1953 11.3323 10.4311 10.9721C10.6669 10.6119 11.0196 10.3438 11.4298 10.2131C11.84 10.0823 12.2827 10.0968 12.6835 10.254L17.2485 5.68902V3.82802C17.2486 3.579 17.3475 3.34019 17.5235 3.16402L19.2535 1.43402C19.2855 1.4018 19.3257 1.37891 19.3698 1.36781C19.4138 1.35671 19.4601 1.35782 19.5035 1.37102C19.5925 1.39702 19.6585 1.47102 19.6765 1.56202L20.1365 3.86302L22.4365 4.32302C22.5265 4.34102 22.6005 4.40702 22.6265 4.49602C22.6396 4.53925 22.6408 4.58524 22.6299 4.62908C22.619 4.67293 22.5964 4.71299 22.5645 4.74502L20.8335 6.47502C20.6576 6.65078 20.4192 6.74966 20.1705 6.75002Z"
                      fill="#3636F0"
                    />
                    <path
                      d="M2.625 12C2.625 14.4864 3.61272 16.871 5.37087 18.6291C7.12903 20.3873 9.5136 21.375 12 21.375C13.2311 21.375 14.4502 21.1325 15.5877 20.6614C16.7251 20.1902 17.7586 19.4997 18.6291 18.6291C19.4997 17.7586 20.1902 16.7251 20.6614 15.5877C21.1325 14.4502 21.375 13.2311 21.375 12C21.375 11.102 21.249 10.234 21.014 9.413C20.9673 9.22449 20.9955 9.02521 21.0928 8.85709C21.19 8.68898 21.3487 8.56514 21.5353 8.51163C21.722 8.45812 21.9222 8.47912 22.0937 8.57021C22.2653 8.66129 22.3948 8.81536 22.455 9C22.729 9.954 22.875 10.96 22.875 12C22.875 18.006 18.006 22.875 12 22.875C5.994 22.875 1.125 18.006 1.125 12C1.125 5.994 5.994 1.125 12 1.125C13.015 1.124 14.024 1.265 15 1.544C15.0952 1.57069 15.1841 1.61593 15.2617 1.67712C15.3393 1.7383 15.4041 1.81423 15.4523 1.90052C15.5005 1.98682 15.5311 2.08179 15.5425 2.17997C15.5538 2.27815 15.5457 2.37761 15.5184 2.47263C15.4912 2.56764 15.4455 2.65634 15.3839 2.73363C15.3223 2.81091 15.246 2.87526 15.1595 2.92297C15.0729 2.97067 14.9778 3.0008 14.8795 3.01162C14.7813 3.02244 14.6819 3.01373 14.587 2.986C13.7457 2.74585 12.8749 2.62435 12 2.625C9.5136 2.625 7.12903 3.61272 5.37087 5.37087C3.61272 7.12902 2.625 9.51359 2.625 12Z"
                      fill="#3636F0"
                    />
                    <path
                      d="M7.12376 12C7.12656 12.6623 7.26431 13.3171 7.52861 13.9244C7.79292 14.5317 8.17823 15.0788 8.66101 15.5322C9.1438 15.9856 9.71394 16.3359 10.3366 16.5616C10.9593 16.7874 11.6214 16.8838 12.2826 16.8451C12.9438 16.8064 13.5902 16.6333 14.1823 16.3364C14.7744 16.0396 15.2997 15.6252 15.7263 15.1185C16.1529 14.6118 16.4717 14.0235 16.6633 13.3895C16.8549 12.7555 16.9153 12.0891 16.8408 11.431C16.8198 11.2977 16.8352 11.1612 16.8855 11.036C16.9357 10.9108 17.0189 10.8015 17.1262 10.7197C17.2335 10.6379 17.361 10.5866 17.495 10.5714C17.6291 10.5561 17.7648 10.5774 17.8878 10.633C18.1388 10.745 18.3078 10.984 18.3298 11.258C18.485 12.5732 18.2267 13.9042 17.5907 15.0658C16.9546 16.2275 15.9725 17.1621 14.7807 17.7398C13.589 18.3175 12.2469 18.5096 10.941 18.2894C9.63502 18.0692 8.43013 17.4476 7.49376 16.511C6.55766 15.5754 5.93589 14.3717 5.71469 13.0668C5.49349 11.762 5.68382 10.4206 6.25929 9.22881C6.83475 8.037 7.76683 7.05379 8.92625 6.41556C10.0857 5.77733 11.415 5.5157 12.7298 5.66697C12.8292 5.6762 12.9257 5.70517 13.0138 5.75219C13.1018 5.79921 13.1796 5.86334 13.2425 5.94081C13.3055 6.01828 13.3523 6.10754 13.3804 6.20335C13.4084 6.29917 13.417 6.39961 13.4056 6.49879C13.3943 6.59796 13.3633 6.69389 13.3145 6.78093C13.2656 6.86797 13.1998 6.94438 13.1211 7.00568C13.0423 7.06699 12.952 7.11194 12.8557 7.13792C12.7593 7.1639 12.6587 7.17038 12.5598 7.15697C11.8768 7.07801 11.1848 7.14438 10.5293 7.35171C9.87382 7.55904 9.26956 7.90266 8.75621 8.36C8.24287 8.81735 7.83205 9.37808 7.55071 10.0054C7.26937 10.6327 7.12387 11.3125 7.12376 12Z"
                      fill="#3636F0"
                    />
                  </svg>
                </div>
                {/* <div className="flex items-center justify-center gap-[2px]">
                  <span className="text-green-500 font-light">12.7</span>
                  <FaArrowUp className="text-green-500 font-light" />
                </div> */}
              </div>
              <div className="flex gap-1 items-center">
                <h2>{Number(OKRData?.userOkr).toLocaleString() ?? 0}</h2>
                <h5>%</h5>
              </div>
              <div className="text-gray-700 mb-3">
                <div className="text-md font-normal">Average OKR Score</div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs font-normal">
                Updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Card className="bg-[#E9E9FF]">
            <div className="text-md gap-2 flex flex-col justify-center mb-2">
              <div className="flex items-center justify-between">
                <div className="bg-[#7152F30D] flex items-center justify-between p-2 rounded-lg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.06641 7.353C5.68727 7.353 5.36681 7.22247 5.10501 6.9614C4.84321 6.70033 4.71231 6.37987 4.71231 6C4.71231 5.62013 4.84321 5.29967 5.10501 5.0386C5.36681 4.77753 5.68727 4.64663 6.06641 4.6459C6.44554 4.64517 6.76601 4.77607 7.02781 5.0386C7.28961 5.30113 7.42051 5.6216 7.42051 6C7.42051 6.3784 7.28961 6.69887 7.02781 6.9614C6.76601 7.22393 6.44554 7.35483 6.06641 7.3541M6.06641 11.5C4.54327 11.5 3.24601 10.9643 2.17461 9.8929C1.10321 8.8215 0.56714 7.52387 0.566407 6C0.565674 4.47613 1.10174 3.17887 2.17461 2.1082C3.24747 1.03753 4.54474 0.501467 6.06641 0.5C7.19574 0.5 8.21434 0.806167 9.12221 1.4185C10.0301 2.0301 10.6926 2.82393 11.1099 3.8H21.2343L23.4343 6L19.922 9.4694L18.0388 8.0526L16.0511 9.5112L14.0942 8.2H11.1099C10.6919 9.16213 10.0293 9.95267 9.12221 10.5716C8.21507 11.1905 7.19647 11.5 6.06641 11.5ZM6.06641 10.4C7.14954 10.4 8.07354 10.074 8.83841 9.4221C9.60327 8.77017 10.0931 7.99613 10.308 7.1H14.444L16.017 8.1637L18.0608 6.6974L19.8439 8.0416L21.8855 6L20.7855 4.9H10.308C10.0939 4.00313 9.60401 3.2291 8.83841 2.5779C8.07281 1.9267 7.14881 1.60073 6.06641 1.6C4.85641 1.6 3.82057 2.03083 2.95891 2.8925C2.09724 3.75417 1.66641 4.79 1.66641 6C1.66641 7.21 2.09724 8.24583 2.95891 9.1075C3.82057 9.96917 4.85641 10.4 6.06641 10.4Z"
                      fill="#3636F0"
                    />
                  </svg>
                </div>
                {/* <div className="flex items-center justify-center gap-[2px]">
                  <span className="text-green-500 font-light">12.7</span>
                  <FaArrowUp className="text-green-500 font-light" />
                </div> */}
              </div>
              <div className="flex gap-1 items-center justify-between">
                <h2>{OKRData?.okrCompleted ?? 0}</h2>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-primary text-xs font-normal">
                      {OKRData?.keyResultCount ?? 0}
                    </span>
                    <span className="font-light text-xs ">
                      Key Results achieved
                    </span>
                  </div>
                  <Progress
                    // percent={isNaN(success) ? 0 : success * 100}
                    showInfo={false}
                    size={{ height: 10 }}
                    className="w-[100%]"
                  />
                </div>
              </div>
              <div className="text-gray-700 mb-3">
                <div className="text-md font-normal">
                  <div className="text-md font-normal">Total Key Result</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs font-normal">
                Updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Card className="bg-[#E9E9FF]">
            <div className="text-md gap-2 flex flex-col justify-center mb-2">
              <div className="flex items-center justify-between">
                <div className="bg-[#7152F30D] flex items-center justify-between p-2 rounded-lg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.1705 6.75002H18.3095L13.7435 11.314C13.9008 11.7148 13.9152 12.1575 13.7845 12.5677C13.6537 12.9779 13.3857 13.3306 13.0255 13.5664C12.6653 13.8022 12.2348 13.9068 11.8066 13.8626C11.3783 13.8184 10.9783 13.6281 10.6739 13.3237C10.3694 13.0192 10.1791 12.6192 10.1349 12.191C10.0907 11.7627 10.1953 11.3323 10.4311 10.9721C10.6669 10.6119 11.0196 10.3438 11.4298 10.2131C11.84 10.0823 12.2827 10.0968 12.6835 10.254L17.2485 5.68902V3.82802C17.2486 3.579 17.3475 3.34019 17.5235 3.16402L19.2535 1.43402C19.2855 1.4018 19.3257 1.37891 19.3698 1.36781C19.4138 1.35671 19.4601 1.35782 19.5035 1.37102C19.5925 1.39702 19.6585 1.47102 19.6765 1.56202L20.1365 3.86302L22.4365 4.32302C22.5265 4.34102 22.6005 4.40702 22.6265 4.49602C22.6396 4.53925 22.6408 4.58524 22.6299 4.62908C22.619 4.67293 22.5964 4.71299 22.5645 4.74502L20.8335 6.47502C20.6576 6.65078 20.4192 6.74966 20.1705 6.75002Z"
                      fill="#3636F0"
                    />
                    <path
                      d="M2.625 12C2.625 14.4864 3.61272 16.871 5.37087 18.6291C7.12903 20.3873 9.5136 21.375 12 21.375C13.2311 21.375 14.4502 21.1325 15.5877 20.6614C16.7251 20.1902 17.7586 19.4997 18.6291 18.6291C19.4997 17.7586 20.1902 16.7251 20.6614 15.5877C21.1325 14.4502 21.375 13.2311 21.375 12C21.375 11.102 21.249 10.234 21.014 9.413C20.9673 9.22449 20.9955 9.02521 21.0928 8.85709C21.19 8.68898 21.3487 8.56514 21.5353 8.51163C21.722 8.45812 21.9222 8.47912 22.0937 8.57021C22.2653 8.66129 22.3948 8.81536 22.455 9C22.729 9.954 22.875 10.96 22.875 12C22.875 18.006 18.006 22.875 12 22.875C5.994 22.875 1.125 18.006 1.125 12C1.125 5.994 5.994 1.125 12 1.125C13.015 1.124 14.024 1.265 15 1.544C15.0952 1.57069 15.1841 1.61593 15.2617 1.67712C15.3393 1.7383 15.4041 1.81423 15.4523 1.90052C15.5005 1.98682 15.5311 2.08179 15.5425 2.17997C15.5538 2.27815 15.5457 2.37761 15.5184 2.47263C15.4912 2.56764 15.4455 2.65634 15.3839 2.73363C15.3223 2.81091 15.246 2.87526 15.1595 2.92297C15.0729 2.97067 14.9778 3.0008 14.8795 3.01162C14.7813 3.02244 14.6819 3.01373 14.587 2.986C13.7457 2.74585 12.8749 2.62435 12 2.625C9.5136 2.625 7.12903 3.61272 5.37087 5.37087C3.61272 7.12902 2.625 9.51359 2.625 12Z"
                      fill="#3636F0"
                    />
                    <path
                      d="M7.12376 12C7.12656 12.6623 7.26431 13.3171 7.52861 13.9244C7.79292 14.5317 8.17823 15.0788 8.66101 15.5322C9.1438 15.9856 9.71394 16.3359 10.3366 16.5616C10.9593 16.7874 11.6214 16.8838 12.2826 16.8451C12.9438 16.8064 13.5902 16.6333 14.1823 16.3364C14.7744 16.0396 15.2997 15.6252 15.7263 15.1185C16.1529 14.6118 16.4717 14.0235 16.6633 13.3895C16.8549 12.7555 16.9153 12.0891 16.8408 11.431C16.8198 11.2977 16.8352 11.1612 16.8855 11.036C16.9357 10.9108 17.0189 10.8015 17.1262 10.7197C17.2335 10.6379 17.361 10.5866 17.495 10.5714C17.6291 10.5561 17.7648 10.5774 17.8878 10.633C18.1388 10.745 18.3078 10.984 18.3298 11.258C18.485 12.5732 18.2267 13.9042 17.5907 15.0658C16.9546 16.2275 15.9725 17.1621 14.7807 17.7398C13.589 18.3175 12.2469 18.5096 10.941 18.2894C9.63502 18.0692 8.43013 17.4476 7.49376 16.511C6.55766 15.5754 5.93589 14.3717 5.71469 13.0668C5.49349 11.762 5.68382 10.4206 6.25929 9.22881C6.83475 8.037 7.76683 7.05379 8.92625 6.41556C10.0857 5.77733 11.415 5.5157 12.7298 5.66697C12.8292 5.6762 12.9257 5.70517 13.0138 5.75219C13.1018 5.79921 13.1796 5.86334 13.2425 5.94081C13.3055 6.01828 13.3523 6.10754 13.3804 6.20335C13.4084 6.29917 13.417 6.39961 13.4056 6.49879C13.3943 6.59796 13.3633 6.69389 13.3145 6.78093C13.2656 6.86797 13.1998 6.94438 13.1211 7.00568C13.0423 7.06699 12.952 7.11194 12.8557 7.13792C12.7593 7.1639 12.6587 7.17038 12.5598 7.15697C11.8768 7.07801 11.1848 7.14438 10.5293 7.35171C9.87382 7.55904 9.26956 7.90266 8.75621 8.36C8.24287 8.81735 7.83205 9.37808 7.55071 10.0054C7.26937 10.6327 7.12387 11.3125 7.12376 12Z"
                      fill="#3636F0"
                    />
                  </svg>
                </div>
                {/* <div className="flex items-center justify-center gap-[2px]">
                  <span className="text-green-500 font-light">12.7</span>
                  <FaArrowUp className="text-green-500 font-light" />
                </div> */}
              </div>
              <div className="flex gap-1 items-center">
                <h2>{OKRData?.supervisorOkr ?? 0}</h2>
                <h5>%</h5>
              </div>
              <div className="text-gray-700 mb-3">
                <div className="text-md font-normal">Supervisor OKR Score</div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs font-normal">
                Updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ObjectiveKeyResult;
