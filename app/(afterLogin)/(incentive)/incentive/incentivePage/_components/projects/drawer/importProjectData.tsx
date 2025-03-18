import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useFetchAllPayPeriod } from '@/store/server/features/incentive/project/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Button, Form, Select, Spin, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import React from 'react';
import { MdOutlineUploadFile } from 'react-icons/md';
import { useImportData } from '@/store/server/features/incentive/all/mutation';
import { useAllRecognition } from '@/store/server/features/incentive/other/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { IoInformationCircleOutline } from 'react-icons/io5';
import DownloadExcelButton from '../../dynamicRcoginition/_components/dowloadTemplateExcel';

const ImportProjectData: React.FC = () => {
  const [form] = Form.useForm();
  const { projectDrawer, setProjectDrawer, selectedRecognition } =
    useIncentiveStore();
  const { mutate: importData, isLoading: submitPending } = useImportData();
  const { data: recognitionData } = useAllRecognition();

  const { data: payPeriodData, isLoading: responseLoading } =
    useFetchAllPayPeriod();

  const handleClose = () => {
    setProjectDrawer(false);
  };

  const handleSubmit = async (values: any) => {
    const formValues = form.getFieldsValue();
    const userId = useAuthenticationStore.getState().userId;

    const formData = new FormData();
    formData.append('file', values?.fileName?.file?.originFileObj);
    // formData.append('fileName', file.fileName);
    // formData.append('fileType', values?.file?.type);
    formData.append('importDate', JSON.stringify(values?.importDate));

    formData.append(
      'recognitionTypeId',
      JSON.stringify(values?.recognitionTypeId) || '',
    ),
      formData.append('userId', JSON.stringify(userId) || '');
    // formData.append('source', values?.source || '');

    importData(formData);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: () => {
      // setFile(file);
      return false;
    },
    onRemove: () => {
      // setFile(null);
    },
  };

  return (
    <CustomDrawerLayout
      open={projectDrawer}
      onClose={handleClose}
      modalHeader={
        <CustomDrawerHeader className="flex justify-between">
          <span>Import {selectedRecognition?.name} Data</span>
          <div>
            <DownloadExcelButton />
          </div>
        </CustomDrawerHeader>
      }
      // footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
      footer={null}
      width="600px"
    >
      <div className="flex items-start justify-center space-x-2">
        <div>
          <IoInformationCircleOutline size={14} />
        </div>
        <div className="flex flex-wrap text-xs text-gray-500">
          Download the appropriate template for the selected recognition type by
          clicking the <strong>"Download Format" </strong> button above.
        </div>
      </div>

      <Form
        requiredMark={false}
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item name="fileName">
          <Upload.Dragger
            name="file"
            className="w-full p-6"
            showUploadList
            accept=".xlsx"
            maxCount={1}
          >
            <span className="flex flex-col gap-3 py-8">
              <p className="ant-upload-drag-icon flex items-center justify-center">
                <svg
                  width="54"
                  height="59"
                  viewBox="0 0 54 59"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M49.9669 33.5475L50.8783 31.1313L42.8137 29.1792L41.6011 31.6026L22.6576 27.5859L20.7169 32.7591L11.3359 30.4005L15.9811 50.76L40.2901 58.4979L53.0881 34.3173L49.9669 33.5475Z"
                    fill="#3636F0"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M23.4119 14.4129L21.8711 17.9886C21.8711 17.9886 26.9993 17.22 29.9036 17.8224C34.592 18.795 31.481 23.9241 31.481 23.9241L28.511 23.6151L31.3547 31.9851L39.4295 25.3926L36.1856 24.8337C36.1856 24.8337 39.248 20.4537 35.87 16.6182C32.0546 12.2853 23.4119 14.4129 23.4119 14.4129Z"
                    fill="#1D9BF0"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M49.6555 6.88037L42.3544 4.98047C42.3544 4.98047 37.5754 8.68457 40.2352 15.5564L46.9834 16.9784C46.9834 16.9784 44.1091 10.1804 49.6555 6.88037Z"
                    fill="white"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.910156 34.6404L7.03196 32.4062C7.03196 32.4062 9.76376 37.9331 11.1588 40.1679L5.90186 44.2647C5.90186 44.2647 3.57596 41.4279 0.910156 34.6404Z"
                    fill="white"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.6329 13.5312L13.5381 22.497C13.5381 22.497 2.8236 26.4723 1.5681 27.069C1.5681 27.069 0.678597 19.8504 0.968097 17.2696C0.968097 17.2705 8.2419 14.5017 13.6329 13.5312Z"
                    fill="white"
                  />
                  <path
                    d="M26.0428 6.98158C26.0428 6.98158 19.5517 10.8816 18.9127 11.3535C18.9127 11.3535 16.0093 6.51748 15.4258 4.94398C15.4258 4.94398 19.9156 2.18068 23.1382 1.11328L26.0428 6.98158Z"
                    fill="white"
                  />
                  <path
                    d="M26.1791 6.91681L23.2742 1.04882C23.2585 1.01609 23.2313 0.990276 23.1978 0.976284C23.1642 0.962292 23.1268 0.961093 23.0924 0.972915C19.8908 2.03342 15.3938 4.79011 15.3488 4.81801C15.3192 4.83619 15.2969 4.86407 15.2855 4.8969C15.2742 4.92972 15.2746 4.96546 15.2867 4.99801C15.8684 6.56641 18.6668 11.2347 18.7856 11.4327C18.7964 11.4507 18.8108 11.4661 18.8279 11.4782C18.845 11.4902 18.8644 11.4986 18.8849 11.5027C18.9054 11.5068 18.9265 11.5065 18.947 11.502C18.9674 11.4974 18.9866 11.4886 19.0034 11.4762C19.6292 11.0148 26.057 7.15111 26.1218 7.11211C26.1542 7.09273 26.178 7.06186 26.1887 7.02567C26.1993 6.98948 26.1959 6.95061 26.1791 6.91681ZM18.9608 11.1408C18.4973 10.3626 16.2098 6.49892 15.6125 5.00881C16.3025 4.59212 20.1794 2.28332 23.0633 1.29932L25.8488 6.92612C24.9857 7.44511 19.9958 10.4496 18.9608 11.1408Z"
                    fill="#111827"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.04716 25.914C2.04716 25.914 1.59716 19.524 1.74446 17.823C1.74446 17.823 9.32006 15.3165 12.8718 14.4219V21.8469L2.04716 25.914Z"
                    fill="#6666FF"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M19.15 9.96787C19.15 9.96787 16.9471 6.17737 16.5352 5.14387C16.5352 5.14387 20.7052 2.96137 22.7536 2.10547L25.0036 6.55297L19.15 9.96787Z"
                    fill="#6666FF"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.92188 23.977L4.31768 20.3023L7.30447 22.4113L10.3741 18.4492L12.8941 21.301L12.8701 21.8491L2.04668 25.9162L1.92188 23.977Z"
                    fill="#2B2BBD"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M19.1494 9.96709L18.4453 8.73919L19.0033 6.38029L21.6091 7.33429L22.3573 4.80469L24.7744 6.10129L25.0024 6.55129L19.1494 9.96709Z"
                    fill="#2B2BBD"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.12225 18.0352C4.32791 18.0551 4.51876 18.151 4.65762 18.304C4.79648 18.457 4.87341 18.6562 4.87341 18.8629C4.87341 19.0695 4.79648 19.2687 4.65762 19.4217C4.51876 19.5747 4.32791 19.6706 4.12225 19.6906C3.91659 19.6706 3.72574 19.5747 3.58688 19.4217C3.44802 19.2687 3.37109 19.0695 3.37109 18.8629C3.37109 18.6562 3.44802 18.457 3.58688 18.304C3.72574 18.151 3.91659 18.0551 4.12225 18.0352Z"
                    fill="#3636F0"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M18.149 5.05565C18.3002 5.04815 18.4503 5.08462 18.5812 5.16065C18.712 5.23668 18.8181 5.34901 18.8864 5.48405C19.0229 5.75795 18.914 6.01055 18.6437 6.04805C18.4926 6.0555 18.3425 6.01898 18.2117 5.94289C18.0808 5.8668 17.9749 5.75442 17.9066 5.61935C17.7701 5.34545 17.8787 5.09285 18.149 5.05565Z"
                    fill="#3636F0"
                  />
                  <path
                    d="M16.5818 25.4219L18.668 25.5962C18.2875 26.7846 18.3274 28.0678 18.7808 29.2304L17.1122 29.7299C17.1122 29.7299 16.1036 28.0952 16.5818 25.4219Z"
                    fill="#B2B2FF"
                  />
                  <path
                    d="M2.89579 6.10156C2.60737 6.757 2.36928 7.43346 2.18359 8.12506L5.14969 9.59116C5.44619 8.83873 5.80045 8.11035 6.20929 7.41256L2.89579 6.10156Z"
                    fill="#B2B2FF"
                  />
                  <path
                    d="M48.0391 25.0825C48.0391 25.0825 48.811 23.9245 49.6795 22.5664L51.6445 23.2318C51.174 24.0775 50.6517 24.8932 50.0806 25.6744L48.0391 25.0825Z"
                    fill="#B2B2FF"
                  />
                  <path
                    d="M38.8512 37.2689C38.8489 37.2374 38.8367 37.2075 38.8164 37.1834C38.7961 37.1593 38.7687 37.1421 38.7381 37.1345L11.3742 30.2546C11.3492 30.2483 11.3231 30.2485 11.2982 30.2552C11.2733 30.262 11.2506 30.2751 11.2322 30.2931C11.2139 30.3112 11.2005 30.3338 11.1933 30.3585C11.1862 30.3833 11.1856 30.4095 11.1915 30.4346L15.8367 50.7944C15.8425 50.8198 15.8548 50.8432 15.8725 50.8624C15.8901 50.8816 15.9124 50.8959 15.9372 50.9039C41.1891 58.9478 40.2552 58.6478 40.2912 58.6478C40.3119 58.6478 40.3324 58.6436 40.3513 58.6354C40.3703 58.6272 40.3873 58.6151 40.4014 58.6C40.4155 58.5849 40.4263 58.567 40.4332 58.5475C40.44 58.528 40.4428 58.5073 40.4412 58.4867L38.8512 37.2689ZM16.1112 50.6432L11.5383 30.6053L38.5587 37.3994L40.1256 58.2875L16.1112 50.6432Z"
                    fill="#111827"
                  />
                  <path
                    d="M31.2111 32.0359C31.2212 32.0656 31.2403 32.0914 31.2658 32.1096C31.2913 32.1279 31.3219 32.1376 31.3533 32.1376C31.4322 32.1376 31.236 32.2786 33.9912 30.028C34.022 30.0028 34.0416 29.9664 34.0457 29.9268C34.0497 29.8871 34.0378 29.8475 34.0126 29.8167C33.9874 29.7858 33.951 29.7662 33.9114 29.7622C33.8718 29.7581 33.8321 29.77 33.8013 29.7952L31.4259 31.7347L30.5385 29.1214C30.5257 29.0837 30.4984 29.0526 30.4627 29.035C30.4269 29.0174 30.3857 29.0147 30.348 29.0275C30.3103 29.0403 30.2792 29.0676 30.2616 29.1033C30.244 29.139 30.2413 29.1803 30.2541 29.218L31.2111 32.0359Z"
                    fill="#111827"
                  />
                  <path
                    d="M49.692 6.7346L42.3909 4.8332C42.3688 4.82724 42.3455 4.82652 42.323 4.8311C42.3005 4.83568 42.2794 4.84544 42.2613 4.8596C42.2124 4.8974 37.4247 8.71219 40.0941 15.6083C40.1031 15.6316 40.1178 15.6523 40.1368 15.6685C40.1558 15.6846 40.1786 15.6958 40.203 15.701L46.9512 17.1233C46.978 17.1289 47.0058 17.1271 47.0317 17.118C47.0575 17.1089 47.0804 17.0929 47.0978 17.0718C47.1152 17.0507 47.1264 17.0252 47.1304 16.9981C47.1343 16.971 47.1308 16.9433 47.1201 16.9181C47.0919 16.8515 44.3601 10.2047 49.7301 7.0085C49.7555 6.99341 49.7759 6.97116 49.7887 6.94455C49.8015 6.91794 49.8061 6.88814 49.802 6.85889C49.798 6.82964 49.7854 6.80225 49.7658 6.78014C49.7462 6.75803 49.7206 6.74218 49.692 6.7346ZM46.7454 16.7735L40.3446 15.4235C37.9746 9.18979 41.8719 5.5835 42.3897 5.1422L49.2789 6.9362C44.6742 9.94459 46.2987 15.5054 46.7454 16.7735Z"
                    fill="#111827"
                  />
                  <path
                    d="M42.5353 6.27498C47.9605 7.65648 47.6416 7.57668 47.6725 7.57668C47.7089 7.5765 47.744 7.56306 47.7713 7.53889C47.7985 7.51471 47.816 7.48143 47.8206 7.44528C47.8251 7.40913 47.8163 7.37257 47.7958 7.34243C47.7754 7.31228 47.7446 7.29062 47.7094 7.28148L42.6094 5.98428C42.5712 5.9755 42.5311 5.98203 42.4976 6.00245C42.4642 6.02287 42.44 6.05558 42.4304 6.09356C42.4208 6.13154 42.4264 6.17179 42.446 6.2057C42.4657 6.2396 42.4978 6.26447 42.5356 6.27498H42.5353Z"
                    fill="#111827"
                  />
                  <path
                    d="M46.9407 8.27588L41.7447 7.01048C41.7251 7.00449 41.7046 7.00257 41.6843 7.00482C41.664 7.00707 41.6443 7.01344 41.6266 7.02355C41.6088 7.03366 41.5933 7.04729 41.581 7.06361C41.5687 7.07993 41.5599 7.09859 41.555 7.11845C41.5502 7.1383 41.5495 7.15894 41.5529 7.17908C41.5563 7.19923 41.5638 7.21846 41.575 7.2356C41.5861 7.25274 41.6006 7.26742 41.6176 7.27875C41.6346 7.29008 41.6538 7.29781 41.6739 7.30148L46.8699 8.56688C46.8894 8.57286 46.91 8.57478 46.9303 8.57253C46.9506 8.57028 46.9702 8.56391 46.988 8.5538C47.0058 8.54369 47.0213 8.53006 47.0336 8.51374C47.0459 8.49742 47.0547 8.47876 47.0595 8.4589C47.0644 8.43905 47.0651 8.41841 47.0617 8.39827C47.0582 8.37812 47.0507 8.35889 47.0396 8.34175C47.0285 8.32461 47.014 8.30993 46.9969 8.2986C46.9799 8.28727 46.9608 8.27954 46.9407 8.27588Z"
                    fill="#111827"
                  />
                  <path
                    d="M46.2296 9.30278L41.0333 8.03768C41.0138 8.03177 40.9933 8.02991 40.973 8.0322C40.9528 8.03448 40.9332 8.04087 40.9155 8.05098C40.8978 8.06108 40.8823 8.07469 40.8701 8.09097C40.8578 8.10724 40.849 8.12585 40.8441 8.14565C40.8393 8.16545 40.8385 8.18603 40.8419 8.20613C40.8453 8.22622 40.8527 8.24543 40.8638 8.26255C40.8748 8.27968 40.8893 8.29438 40.9062 8.30575C40.9231 8.31712 40.9421 8.32492 40.9622 8.32868L46.1585 9.59408C46.1778 9.59945 46.1981 9.60088 46.218 9.59829C46.2379 9.59569 46.2571 9.58911 46.2745 9.57895C46.2918 9.56878 46.3069 9.55524 46.3189 9.53912C46.3309 9.523 46.3396 9.50464 46.3443 9.48511C46.3491 9.46559 46.3499 9.44531 46.3467 9.42548C46.3434 9.40564 46.3363 9.38665 46.3256 9.36965C46.3149 9.35264 46.3008 9.33796 46.2844 9.32647C46.2679 9.31498 46.2492 9.30693 46.2296 9.30278Z"
                    fill="#111827"
                  />
                  <path
                    d="M45.4867 11.717L40.2916 10.4519C40.272 10.4459 40.2515 10.444 40.2311 10.4462C40.2108 10.4485 40.1912 10.4548 40.1734 10.465C40.1557 10.4751 40.1402 10.4887 40.1279 10.505C40.1156 10.5213 40.1067 10.54 40.1019 10.5599C40.0971 10.5797 40.0964 10.6003 40.0998 10.6205C40.1032 10.6406 40.1107 10.6599 40.1219 10.677C40.133 10.6941 40.1475 10.7088 40.1645 10.7202C40.1815 10.7315 40.2007 10.7392 40.2208 10.7429L45.4168 12.0083C45.4362 12.0138 45.4565 12.0153 45.4765 12.0128C45.4965 12.0103 45.5158 12.0037 45.5333 11.9936C45.5507 11.9834 45.5659 11.9698 45.578 11.9536C45.59 11.9375 45.5987 11.919 45.6035 11.8994C45.6083 11.8798 45.609 11.8594 45.6057 11.8395C45.6024 11.8196 45.5952 11.8006 45.5843 11.7835C45.5735 11.7665 45.5594 11.7518 45.5427 11.7404C45.5261 11.729 45.5073 11.721 45.4876 11.717H45.4867Z"
                    fill="#111827"
                  />
                  <path
                    d="M45.4837 12.982L40.2886 11.7166C40.2692 11.7111 40.2489 11.7096 40.2289 11.7121C40.2088 11.7146 40.1895 11.7212 40.1721 11.7314C40.1547 11.7415 40.1395 11.7551 40.1274 11.7713C40.1153 11.7875 40.1067 11.8059 40.1019 11.8255C40.0971 11.8451 40.0964 11.8655 40.0997 11.8854C40.103 11.9053 40.1102 11.9244 40.1211 11.9414C40.1319 11.9584 40.146 11.9731 40.1627 11.9845C40.1793 11.996 40.1981 12.0039 40.2178 12.0079L45.4138 13.2733C45.4332 13.2789 45.4536 13.2804 45.4736 13.2779C45.4936 13.2753 45.5129 13.2688 45.5304 13.2586C45.5478 13.2485 45.563 13.2349 45.5751 13.2187C45.5871 13.2025 45.5958 13.1841 45.6006 13.1645C45.6053 13.1449 45.6061 13.1245 45.6028 13.1046C45.5995 13.0847 45.5922 13.0656 45.5814 13.0486C45.5706 13.0316 45.5564 13.0169 45.5398 13.0055C45.5232 12.994 45.5044 12.9861 45.4846 12.982H45.4837Z"
                    fill="#111827"
                  />
                  <path
                    d="M45.4837 14.2492L40.2886 12.9823C40.2692 12.9768 40.2489 12.9752 40.2289 12.9777C40.2088 12.9803 40.1895 12.9868 40.1721 12.997C40.1547 13.0071 40.1395 13.0207 40.1274 13.0369C40.1153 13.0531 40.1067 13.0715 40.1019 13.0911C40.0971 13.1107 40.0964 13.1311 40.0997 13.151C40.103 13.1709 40.1102 13.19 40.1211 13.207C40.1319 13.224 40.146 13.2387 40.1627 13.2502C40.1793 13.2616 40.1981 13.2696 40.2178 13.2736L45.4138 14.539C45.4332 14.5445 45.4536 14.546 45.4736 14.5435C45.4936 14.541 45.5129 14.5344 45.5304 14.5243C45.5478 14.5141 45.563 14.5005 45.5751 14.4843C45.5871 14.4682 45.5958 14.4497 45.6006 14.4301C45.6053 14.4105 45.6061 14.3901 45.6028 14.3702C45.5995 14.3503 45.5922 14.3313 45.5814 14.3142C45.5706 14.2972 45.5564 14.2825 45.5398 14.2711C45.5232 14.2596 45.5044 14.2517 45.4846 14.2477L45.4837 14.2492Z"
                    fill="#111827"
                  />
                  <path
                    d="M1.63403 27.2077C2.86793 26.6206 13.484 22.6807 13.5905 22.6408C13.619 22.6302 13.6435 22.6113 13.661 22.5865C13.6784 22.5617 13.688 22.5322 13.6883 22.5019L13.7831 13.5352C13.7835 13.513 13.7789 13.4911 13.7698 13.4709C13.7607 13.4508 13.7472 13.4329 13.7303 13.4185C13.7135 13.4042 13.6936 13.3938 13.6723 13.388C13.6509 13.3822 13.6285 13.3813 13.6067 13.3852C8.26373 14.3473 0.987825 17.1052 0.916725 17.1316C0.890897 17.1413 0.868267 17.158 0.851328 17.1798C0.83439 17.2017 0.8238 17.2277 0.820726 17.2552C0.533626 19.8244 1.38563 26.7952 1.42073 27.0898C1.42352 27.1134 1.43191 27.1361 1.44519 27.1558C1.45848 27.1756 1.47628 27.1919 1.49713 27.2034C1.51797 27.215 1.54126 27.2214 1.56507 27.2221C1.58887 27.2228 1.61251 27.2179 1.63403 27.2077ZM1.10933 17.3806C1.93433 17.0695 8.49982 14.6395 13.4813 13.714L13.3895 22.3957C12.2963 22.8016 3.47393 26.0806 1.69433 26.8519C1.55573 25.6795 0.878926 19.7395 1.10933 17.3806Z"
                    fill="#111827"
                  />
                  <path
                    d="M2.0986 26.0555L12.946 21.9881C12.9747 21.9774 12.9994 21.9581 13.0169 21.9329C13.0343 21.9077 13.0436 21.8778 13.0435 21.8471C13.0435 21.7772 13.0486 22.6595 12.9958 14.4221C12.9956 14.3994 12.9902 14.377 12.9801 14.3566C12.9699 14.3362 12.9553 14.3184 12.9373 14.3045C12.9192 14.2907 12.8983 14.2811 12.876 14.2765C12.8537 14.2719 12.8306 14.2725 12.8086 14.2781C9.2929 15.1631 1.771 17.6564 1.6954 17.6816C1.66754 17.6909 1.643 17.708 1.62481 17.7311C1.60663 17.7541 1.5956 17.782 1.5931 17.8112C1.4458 19.5041 1.8772 25.6643 1.8955 25.9256C1.8971 25.949 1.90416 25.9717 1.91611 25.9919C1.92807 26.012 1.94458 26.0291 1.96433 26.0417C1.98407 26.0544 2.00651 26.0622 2.02982 26.0646C2.05314 26.067 2.0767 26.0639 2.0986 26.0555ZM2.1817 25.7039C2.1613 25.4021 2.1217 24.7844 2.0746 24.0161L4.3576 20.5139L7.2175 22.5329C7.24896 22.5552 7.2878 22.5645 7.32596 22.559C7.36411 22.5534 7.39865 22.5333 7.4224 22.5029L10.381 18.6842L12.7426 21.3542V21.7442L2.1817 25.7039ZM1.8853 17.9339C2.7535 17.6471 9.3628 15.4784 12.7183 14.6144V20.8973L10.4857 18.3494C10.4711 18.3329 10.453 18.3198 10.4328 18.3111C10.4126 18.3024 10.3907 18.2982 10.3687 18.2989C10.3466 18.2996 10.325 18.3051 10.3054 18.3151C10.2857 18.3251 10.2685 18.3392 10.255 18.3566L7.2724 22.205L4.4026 20.1791C4.38612 20.1675 4.36746 20.1592 4.34773 20.1549C4.328 20.1506 4.30761 20.1504 4.28778 20.1542C4.26794 20.1579 4.24908 20.1657 4.23231 20.1769C4.21554 20.1882 4.20122 20.2027 4.1902 20.2196L2.044 23.5118C1.933 21.5762 1.8127 19.0034 1.8844 17.9351L1.8853 17.9339Z"
                    fill="#111827"
                  />
                  <path
                    d="M19.0213 10.041C19.0345 10.0637 19.0534 10.0826 19.0761 10.0957C19.0989 10.1088 19.1246 10.1157 19.1509 10.1157C19.2139 10.1157 18.8155 10.3281 25.0795 6.68011C25.1125 6.66089 25.137 6.62979 25.1478 6.59316C25.1587 6.55653 25.1552 6.51713 25.138 6.48301C20.6038 -2.49509 24.6256 5.46301 22.888 2.03551C22.8709 2.00167 22.8416 1.97555 22.8061 1.96241C22.7705 1.94928 22.7313 1.9501 22.6963 1.96471C20.6677 2.81341 16.5088 4.98721 16.4671 5.00821C16.4342 5.02546 16.4088 5.05431 16.396 5.08917C16.3831 5.12403 16.3837 5.16242 16.3975 5.19691C16.8085 6.22891 18.9313 9.88621 19.0213 10.041ZM19.2052 9.76051C19.1011 9.58051 18.8974 9.22621 18.6481 8.78791L19.0681 6.60031L21.4765 7.53031C21.4957 7.53778 21.5163 7.5412 21.5368 7.54038C21.5574 7.53955 21.5776 7.53449 21.5962 7.52551C21.6147 7.51653 21.6312 7.50382 21.6447 7.48818C21.6581 7.47255 21.6681 7.45431 21.6742 7.43461L22.4341 4.96501L24.7237 6.32551L24.8077 6.49171L19.2052 9.76051ZM22.6843 2.29591L24.4708 5.82751L22.423 4.61041C22.4035 4.59877 22.3816 4.59171 22.359 4.58977C22.3363 4.58783 22.3135 4.59105 22.2923 4.5992C22.2711 4.60735 22.2521 4.6202 22.2365 4.6368C22.221 4.6534 22.2095 4.6733 22.2028 4.69501L21.4339 7.19281L19.0078 6.25531C18.9873 6.24741 18.9653 6.24411 18.9434 6.24564C18.9215 6.24717 18.9002 6.25349 18.881 6.26417C18.8618 6.27484 18.8451 6.2896 18.8323 6.30741C18.8194 6.32521 18.8106 6.34563 18.8065 6.36721L18.4213 8.38471C17.7994 7.28401 17.02 5.87221 16.7296 5.21101C17.416 4.85311 20.8285 3.08821 22.6843 2.29591Z"
                    fill="#111827"
                  />
                  <path
                    d="M4.12091 19.8418C4.36662 19.8221 4.59589 19.7105 4.76306 19.5294C4.93024 19.3482 5.02307 19.1108 5.02307 18.8643C5.02307 18.6178 4.93024 18.3803 4.76306 18.1992C4.59589 18.018 4.36662 17.9065 4.12091 17.8867C3.8752 17.9065 3.64593 18.018 3.47876 18.1992C3.31158 18.3803 3.21875 18.6178 3.21875 18.8643C3.21875 19.1108 3.31158 19.3482 3.47876 19.5294C3.64593 19.7105 3.8752 19.8221 4.12091 19.8418ZM4.12091 18.1867C4.28693 18.2062 4.44002 18.286 4.55112 18.4109C4.66222 18.5358 4.72359 18.6971 4.72359 18.8643C4.72359 19.0314 4.66222 19.1928 4.55112 19.3177C4.44002 19.4426 4.28693 19.5223 4.12091 19.5418C3.95489 19.5223 3.8018 19.4426 3.6907 19.3177C3.5796 19.1928 3.51823 19.0314 3.51823 18.8643C3.51823 18.6971 3.5796 18.5358 3.6907 18.4109C3.8018 18.286 3.95489 18.2062 4.12091 18.1867Z"
                    fill="#111827"
                  />
                  <path
                    d="M19.0362 5.94516C19.2804 5.48226 18.6927 4.82706 18.1248 4.90476C18.0395 4.91542 17.9584 4.94772 17.8891 4.99859C17.8199 5.04946 17.7648 5.1172 17.7291 5.19538C17.6934 5.27356 17.6783 5.35957 17.6852 5.44523C17.6922 5.53089 17.7209 5.61335 17.7687 5.68476C18.0339 6.21636 18.7989 6.39366 19.0362 5.94516ZM18.0162 5.29446C18.1185 5.09976 18.5823 5.21316 18.7497 5.54916C18.8316 5.71266 18.8031 5.87196 18.621 5.89746C18.273 5.94636 17.898 5.51766 18.015 5.29446H18.0162Z"
                    fill="#111827"
                  />
                  <path
                    d="M6.98205 32.2669L0.860251 34.501C0.841475 34.5079 0.824259 34.5184 0.809615 34.532C0.794971 34.5457 0.783195 34.5621 0.774978 34.5803C0.766761 34.5985 0.762269 34.6182 0.761766 34.6382C0.761264 34.6581 0.76476 34.678 0.77205 34.6966C3.41595 41.4286 5.76435 44.3326 5.78775 44.3614C5.81258 44.3917 5.84825 44.411 5.88715 44.4154C5.92605 44.4197 5.96509 44.4086 5.99595 44.3845L11.2538 40.2874C11.283 40.2646 11.3028 40.2317 11.3092 40.1951C11.3157 40.1586 11.3083 40.1209 11.2886 40.0894C9.91245 37.8874 7.19535 32.3968 7.16805 32.3413C7.15167 32.3082 7.12362 32.2823 7.08929 32.2685C7.05496 32.2548 7.01677 32.2542 6.98205 32.2669ZM10.963 40.1335L5.92995 44.0554C5.48205 43.4638 3.41805 40.5754 1.10775 34.7299L6.95775 32.5948C7.36005 33.4021 9.67695 38.041 10.963 40.1335Z"
                    fill="#111827"
                  />
                  <path
                    d="M6.86125 33.7774L2.28325 35.7109C2.24657 35.7264 2.21753 35.7557 2.20251 35.7926C2.18749 35.8294 2.18772 35.8707 2.20315 35.9074C2.21859 35.9441 2.24796 35.9732 2.28481 35.9882C2.32167 36.0032 2.36297 36.003 2.39965 35.9875L6.97795 34.054C7.01463 34.0386 7.04366 34.0091 7.05866 33.9723C7.07365 33.9354 7.07338 33.8941 7.0579 33.8574C7.04243 33.8207 7.01302 33.7917 6.97614 33.7767C6.93926 33.7617 6.89793 33.762 6.86125 33.7774Z"
                    fill="#111827"
                  />
                  <path
                    d="M2.70596 37.0578C2.71444 37.0756 2.72634 37.0915 2.74099 37.1047C2.75564 37.1179 2.77275 37.1281 2.79133 37.1346C2.80992 37.1412 2.82961 37.1441 2.8493 37.143C2.86898 37.142 2.88827 37.1371 2.90606 37.1286L7.33856 35.0148C7.37152 34.996 7.39616 34.9655 7.40752 34.9293C7.41887 34.8931 7.41609 34.8539 7.39974 34.8197C7.38339 34.7855 7.35468 34.7587 7.31939 34.7448C7.28411 34.7309 7.24486 34.7309 7.20956 34.7448L2.77676 36.858C2.74089 36.8751 2.7133 36.9058 2.70002 36.9432C2.68675 36.9807 2.68888 37.0219 2.70596 37.0578Z"
                    fill="#111827"
                  />
                  <path
                    d="M3.20589 38.1606C3.22308 38.1964 3.25376 38.2239 3.29122 38.2371C3.32867 38.2503 3.36984 38.2481 3.40569 38.2311L7.92009 36.0738C7.9533 36.0551 7.97817 36.0245 7.98966 35.9882C8.00114 35.9519 7.99837 35.9125 7.98192 35.8782C7.96547 35.8438 7.93656 35.817 7.90107 35.8032C7.86557 35.7894 7.82615 35.7896 7.79079 35.8038L3.27579 37.9614C3.24024 37.9786 3.21296 38.0093 3.19987 38.0466C3.18678 38.0839 3.18894 38.1248 3.20589 38.1606Z"
                    fill="#111827"
                  />
                  <path
                    d="M4.12315 39.9018C4.14217 39.9368 4.17429 39.9627 4.21243 39.9739C4.25057 39.9852 4.29162 39.9808 4.32655 39.9618L8.62315 37.6197C8.65703 37.6002 8.68193 37.5681 8.69253 37.5305C8.70313 37.4928 8.69859 37.4525 8.67988 37.4181C8.66117 37.3838 8.62977 37.3581 8.59238 37.3465C8.55499 37.335 8.51458 37.3385 8.47975 37.3563L4.18285 39.6999C4.14838 39.719 4.1228 39.7509 4.11163 39.7887C4.10046 39.8264 4.10459 39.8671 4.12315 39.9018Z"
                    fill="#111827"
                  />
                  <path
                    d="M4.78127 41.1273C4.79176 41.144 4.80544 41.1584 4.82153 41.1698C4.83761 41.1812 4.85578 41.1894 4.87501 41.1937C4.89424 41.1981 4.91413 41.1986 4.93357 41.1953C4.95301 41.192 4.97159 41.1849 4.98827 41.1744L9.28127 38.4645C9.31493 38.4432 9.33877 38.4095 9.34755 38.3707C9.35632 38.3318 9.34932 38.2911 9.32807 38.2575C9.30683 38.2238 9.27309 38.2 9.23427 38.1912C9.19545 38.1824 9.15473 38.1894 9.12107 38.2107L4.82807 40.9197C4.81132 40.9302 4.79681 40.9439 4.78539 40.96C4.77396 40.9762 4.76583 40.9944 4.76148 41.0137C4.75714 41.033 4.75664 41.053 4.76004 41.0725C4.76344 41.092 4.77065 41.1106 4.78127 41.1273Z"
                    fill="#111827"
                  />
                  <path
                    d="M5.47199 42.0466C5.49312 42.0803 5.52676 42.1042 5.56552 42.1131C5.60428 42.122 5.64499 42.1151 5.67869 42.094L9.91979 39.4405C9.93735 39.4305 9.95271 39.417 9.96494 39.4009C9.97718 39.3848 9.98603 39.3664 9.99097 39.3468C9.99591 39.3272 9.99683 39.3068 9.99369 39.2868C9.99055 39.2669 9.9834 39.2477 9.97267 39.2306C9.96195 39.2134 9.94787 39.1987 9.93128 39.1871C9.9147 39.1755 9.89594 39.1674 9.87615 39.1633C9.85636 39.1592 9.83594 39.1591 9.81611 39.1631C9.79629 39.167 9.77747 39.175 9.76079 39.1864L5.52029 41.8396C5.50349 41.85 5.48892 41.8636 5.47739 41.8796C5.46587 41.8957 5.45763 41.9138 5.45314 41.933C5.44865 41.9523 5.44801 41.9722 5.45124 41.9917C5.45448 42.0112 5.46153 42.0298 5.47199 42.0466Z"
                    fill="#111827"
                  />
                  <path
                    d="M14.5894 52.7071C14.5856 52.6816 14.5754 52.6575 14.5596 52.6371C14.5439 52.6168 14.5231 52.6008 14.4994 52.5907C14.4757 52.5807 14.4498 52.5769 14.4242 52.5798C14.3986 52.5827 14.3742 52.5921 14.3533 52.6072L12.0133 54.2905C11.9809 54.3137 11.9591 54.3489 11.9527 54.3882C11.9463 54.4274 11.9557 54.4677 11.9789 54.5C12.0022 54.5324 12.0373 54.5542 12.0766 54.5606C12.1159 54.5671 12.1561 54.5576 12.1885 54.5344L14.1889 53.0959C13.8682 54.0052 12.769 56.4133 10.0924 56.5321C9.51169 56.575 8.93168 56.4405 8.42919 56.1463C7.92671 55.8521 7.52548 55.4122 7.27868 54.8848C10.9783 54.5068 10.5298 51.3067 8.28998 51.4423C6.82868 51.5212 6.35708 53.173 6.84158 54.6088C6.18355 54.6302 5.52503 54.5854 4.87598 54.475C3.37778 54.2326 2.30558 53.575 1.68968 52.5226C0.339677 50.2147 1.59668 46.7251 1.60958 46.6903C1.62334 46.6529 1.6217 46.6116 1.60502 46.5755C1.58834 46.5393 1.55798 46.5113 1.52063 46.4975C1.48327 46.4838 1.44198 46.4854 1.40583 46.5021C1.36968 46.5188 1.34164 46.5491 1.32788 46.5865C1.27328 46.7347 0.00937665 50.242 1.43018 52.6732C2.09348 53.8078 3.23678 54.5137 4.82828 54.7708C5.53132 54.8926 6.24536 54.9392 6.95828 54.9097C7.20497 55.4909 7.62003 55.985 8.15 56.3283C8.67997 56.6715 9.30058 56.8483 9.93188 56.8357C12.07 56.8357 13.6141 55.3831 14.3908 53.4091L14.6758 55.3273C14.6822 55.3661 14.7036 55.4009 14.7354 55.424C14.7672 55.4472 14.8069 55.457 14.8458 55.4512C14.8847 55.4454 14.9198 55.4245 14.9435 55.3931C14.9672 55.3617 14.9776 55.3222 14.9725 55.2832L14.5894 52.7071ZM8.40938 51.7393C9.54757 51.7393 10.0537 52.744 9.47828 53.5633C9.07118 54.1426 8.25098 54.4933 7.15178 54.589C6.67958 53.3008 7.05548 51.7393 8.40968 51.7393H8.40938Z"
                    fill="#111827"
                  />
                </svg>
              </p>
              <p className="text-lg font-semibold">
                Drag & Drop here to upload
              </p>
              <p className="text-gray-500">Or select file from your computer</p>
              <span className="flex items-center justify-center my-3">
                <Button className="gap-3 bg-primary w-fit border-none rounded-lg">
                  <MdOutlineUploadFile fill="white" />
                  <span className=" flex items-center justify-center text-md font-normal text-white">
                    Upload file
                  </span>
                </Button>
              </span>
            </span>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={
            <span className="text-normal font-medium">
              Recognition Type <span style={{ color: 'red' }}>*</span>
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please select a recognition type!',
            },
          ]}
          className="py-1"
          name="recognitionTypeId"
        >
          <Select
            size="large"
            className="my-1 h-12 text-sm font-normal"
            placeholder="Select recognition type"
            allowClear
          >
            {responseLoading ? (
              <Spin size="small" />
            ) : (
              recognitionData?.items?.map((recognition: any) => (
                <Select.Option key={recognition.id} value={recognition.id}>
                  {recognition?.recognitionType?.name}
                </Select.Option>
              ))
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <span className="text-normal font-medium">
              Select Pay Period <span style={{ color: 'red' }}>*</span>
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please select a pay period!',
            },
          ]}
          className="py-1"
          name="importDate"
        >
          <Select
            size="large"
            className="my-1 h-12 text-sm font-normal"
            placeholder="Select pay period"
            allowClear
          >
            {responseLoading ? (
              <Spin size="small" />
            ) : (
              payPeriodData?.map((payPeriod: any) => (
                <Select.Option key={payPeriod?.id} value={payPeriod?.id}>
                  {`${dayjs(payPeriod?.startDate).format('YYYY-MM-DD')} — ${dayjs(payPeriod?.endDate).format('YYYY-MM-DD')}`}
                </Select.Option>
              ))
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <span className="text-normal font-medium">
              Other Necessary Information
            </span>
          }
          name="source"
        >
          <TextArea
            rows={2}
            size="large"
            placeholder="Insert other necessary information"
            allowClear
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full gap-3 rounded-lg bg-primary text-white h-14"
          >
            Create
          </Button>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default ImportProjectData;
