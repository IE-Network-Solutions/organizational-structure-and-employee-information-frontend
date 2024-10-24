import { Card, Col, Row } from 'antd';
import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

const IssuedAppreciation: React.FC = () => {
  return (
    <div>
      <Card>
        <div className="text-md gap-4 flex justify-start mb-2">
          <svg
            width="40"
            height="41"
            viewBox="0 0 40 41"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              y="0.730957"
              width="40"
              height="40"
              rx="20"
              fill="#7152F3"
              fill-opacity="0.05"
            />
            <mask id="path-2-inside-1_7606_452769" fill="white">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M19.9996 13.231C17.0079 13.231 14.5829 15.656 14.5829 18.6476C14.5829 20.8993 15.9571 22.8306 17.9125 23.6476H17.9167V23.6493C18.5769 23.9238 19.285 24.0648 20 24.0643C20.7151 24.0647 21.4231 23.9235 22.0833 23.6489V23.6476H22.0867C24.0421 22.8306 25.4163 20.8993 25.4163 18.6476C25.4163 15.656 22.9913 13.231 19.9996 13.231ZM22.9167 24.1768C24.8987 23.1281 26.25 21.0456 26.25 18.6476C26.25 15.196 23.4517 12.3976 20 12.3976C16.5483 12.3976 13.75 15.196 13.75 18.6476C13.75 21.046 15.1012 23.1293 17.0837 24.1768V28.6476C17.0837 28.7231 17.1042 28.7971 17.143 28.8618C17.1817 28.9265 17.2373 28.9795 17.3038 29.0151C17.3704 29.0507 17.4453 29.0675 17.5206 29.0639C17.596 29.0602 17.6689 29.0362 17.7317 28.9943L20 27.4818L22.2687 28.9943C22.3315 29.0362 22.4044 29.0602 22.4798 29.0639C22.5551 29.0675 22.6301 29.0507 22.6966 29.0151C22.7631 28.9795 22.8187 28.9265 22.8574 28.8618C22.8962 28.7971 22.9167 28.7231 22.9167 28.6476V24.1768ZM22.0833 24.5418C21.4141 24.7778 20.7096 24.8982 20 24.8976C19.2696 24.8976 18.5687 24.7726 17.9171 24.5422V27.8693L19.7692 26.6343C19.8376 26.5886 19.9181 26.5642 20.0004 26.5642C20.0827 26.5642 20.1632 26.5886 20.2317 26.6343L22.0833 27.8693V24.5418ZM20 15.731C19.617 15.731 19.2377 15.8064 18.8838 15.953C18.53 16.0996 18.2084 16.3144 17.9376 16.5852C17.6668 16.8561 17.4519 17.1776 17.3054 17.5315C17.1588 17.8854 17.0833 18.2646 17.0833 18.6476C17.0833 19.0307 17.1588 19.4099 17.3054 19.7638C17.4519 20.1177 17.6668 20.4392 17.9376 20.71C18.2084 20.9809 18.53 21.1957 18.8838 21.3423C19.2377 21.4889 19.617 21.5643 20 21.5643C20.7735 21.5643 21.5154 21.257 22.0624 20.71C22.6094 20.1631 22.9167 19.4212 22.9167 18.6476C22.9167 17.8741 22.6094 17.1322 22.0624 16.5852C21.5154 16.0383 20.7735 15.731 20 15.731ZM16.25 18.6476C16.25 17.6531 16.6451 16.6993 17.3483 15.996C18.0516 15.2927 19.0054 14.8976 20 14.8976C20.9946 14.8976 21.9484 15.2927 22.6516 15.996C23.3549 16.6993 23.75 17.6531 23.75 18.6476C23.75 19.6422 23.3549 20.596 22.6516 21.2993C21.9484 22.0026 20.9946 22.3976 20 22.3976C19.0054 22.3976 18.0516 22.0026 17.3483 21.2993C16.6451 20.596 16.25 19.6422 16.25 18.6476Z"
              />
            </mask>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M19.9996 13.231C17.0079 13.231 14.5829 15.656 14.5829 18.6476C14.5829 20.8993 15.9571 22.8306 17.9125 23.6476H17.9167V23.6493C18.5769 23.9238 19.285 24.0648 20 24.0643C20.7151 24.0647 21.4231 23.9235 22.0833 23.6489V23.6476H22.0867C24.0421 22.8306 25.4163 20.8993 25.4163 18.6476C25.4163 15.656 22.9913 13.231 19.9996 13.231ZM22.9167 24.1768C24.8987 23.1281 26.25 21.0456 26.25 18.6476C26.25 15.196 23.4517 12.3976 20 12.3976C16.5483 12.3976 13.75 15.196 13.75 18.6476C13.75 21.046 15.1012 23.1293 17.0837 24.1768V28.6476C17.0837 28.7231 17.1042 28.7971 17.143 28.8618C17.1817 28.9265 17.2373 28.9795 17.3038 29.0151C17.3704 29.0507 17.4453 29.0675 17.5206 29.0639C17.596 29.0602 17.6689 29.0362 17.7317 28.9943L20 27.4818L22.2687 28.9943C22.3315 29.0362 22.4044 29.0602 22.4798 29.0639C22.5551 29.0675 22.6301 29.0507 22.6966 29.0151C22.7631 28.9795 22.8187 28.9265 22.8574 28.8618C22.8962 28.7971 22.9167 28.7231 22.9167 28.6476V24.1768ZM22.0833 24.5418C21.4141 24.7778 20.7096 24.8982 20 24.8976C19.2696 24.8976 18.5687 24.7726 17.9171 24.5422V27.8693L19.7692 26.6343C19.8376 26.5886 19.9181 26.5642 20.0004 26.5642C20.0827 26.5642 20.1632 26.5886 20.2317 26.6343L22.0833 27.8693V24.5418ZM20 15.731C19.617 15.731 19.2377 15.8064 18.8838 15.953C18.53 16.0996 18.2084 16.3144 17.9376 16.5852C17.6668 16.8561 17.4519 17.1776 17.3054 17.5315C17.1588 17.8854 17.0833 18.2646 17.0833 18.6476C17.0833 19.0307 17.1588 19.4099 17.3054 19.7638C17.4519 20.1177 17.6668 20.4392 17.9376 20.71C18.2084 20.9809 18.53 21.1957 18.8838 21.3423C19.2377 21.4889 19.617 21.5643 20 21.5643C20.7735 21.5643 21.5154 21.257 22.0624 20.71C22.6094 20.1631 22.9167 19.4212 22.9167 18.6476C22.9167 17.8741 22.6094 17.1322 22.0624 16.5852C21.5154 16.0383 20.7735 15.731 20 15.731ZM16.25 18.6476C16.25 17.6531 16.6451 16.6993 17.3483 15.996C18.0516 15.2927 19.0054 14.8976 20 14.8976C20.9946 14.8976 21.9484 15.2927 22.6516 15.996C23.3549 16.6993 23.75 17.6531 23.75 18.6476C23.75 19.6422 23.3549 20.596 22.6516 21.2993C21.9484 22.0026 20.9946 22.3976 20 22.3976C19.0054 22.3976 18.0516 22.0026 17.3483 21.2993C16.6451 20.596 16.25 19.6422 16.25 18.6476Z"
              fill="#0BA259"
            />
            <path
              d="M17.9125 23.6476L17.3342 25.0317L17.6117 25.1476H17.9125V23.6476ZM17.9167 23.6476H19.4167V22.1476H17.9167V23.6476ZM17.9167 23.6493H16.4167V24.6502L17.3409 25.0344L17.9167 23.6493ZM20 24.0643L20.0008 22.5643L19.9989 22.5643L20 24.0643ZM22.0833 23.6489L22.6594 25.0339L23.5833 24.6495V23.6489H22.0833ZM22.0833 23.6476V22.1476H20.5833V23.6476H22.0833ZM22.0867 23.6476V25.1476H22.3875L22.665 25.0317L22.0867 23.6476ZM22.9167 24.1768L22.2151 22.851L21.4167 23.2735V24.1768H22.9167ZM17.0837 24.1768H18.5837V23.2729L17.7845 22.8506L17.0837 24.1768ZM17.0837 28.6476L18.5837 28.6479V28.6476H17.0837ZM17.7317 28.9943L16.8995 27.7463L16.8992 27.7465L17.7317 28.9943ZM20 27.4818L20.8321 26.2337L19.9999 25.679L19.1678 26.2338L20 27.4818ZM22.2687 28.9943L23.1012 27.7465L23.1008 27.7462L22.2687 28.9943ZM22.9167 28.6476H21.4167V28.6479L22.9167 28.6476ZM22.0833 24.5418H23.5833V22.4222L21.5844 23.1272L22.0833 24.5418ZM20 24.8976L20.0011 23.3976H20V24.8976ZM17.9171 24.5422L18.4171 23.128L16.4171 22.4209V24.5422H17.9171ZM17.9171 27.8693H16.4171V30.6724L18.7493 29.1173L17.9171 27.8693ZM19.7692 26.6343L20.6013 27.8823L20.6017 27.8821L19.7692 26.6343ZM20.2317 26.6343L19.3992 27.8821L19.3994 27.8822L20.2317 26.6343ZM22.0833 27.8693L21.251 29.1172L23.5833 30.6728V27.8693H22.0833ZM20 15.731V17.231V15.731ZM17.0833 18.6476H15.5833H17.0833ZM20 21.5643V20.0643V21.5643ZM22.9167 18.6476H21.4167H22.9167ZM20 14.8976V13.3976V14.8976ZM19.9996 11.731C16.1795 11.731 13.0829 14.8276 13.0829 18.6476H16.0829C16.0829 16.4844 17.8363 14.731 19.9996 14.731V11.731ZM13.0829 18.6476C13.0829 21.5252 14.84 23.9895 17.3342 25.0317L18.4908 22.2636C17.0741 21.6716 16.0829 20.2734 16.0829 18.6476H13.0829ZM17.9125 25.1476H17.9167V22.1476H17.9125V25.1476ZM16.4167 23.6476V23.6493H19.4167V23.6476H16.4167ZM17.3409 25.0344C18.1839 25.3849 19.0881 25.565 20.0011 25.5643L19.9989 22.5643C19.4819 22.5647 18.9699 22.4627 18.4925 22.2642L17.3409 25.0344ZM19.9992 25.5643C20.9122 25.5648 21.8164 25.3845 22.6594 25.0339L21.5072 22.2639C21.0299 22.4625 20.5179 22.5646 20.0008 22.5643L19.9992 25.5643ZM23.5833 23.6489V23.6476H20.5833V23.6489H23.5833ZM22.0833 25.1476H22.0867V22.1476H22.0833V25.1476ZM22.665 25.0317C25.1591 23.9895 26.9163 21.5252 26.9163 18.6476H23.9163C23.9163 20.2734 22.925 21.6716 21.5083 22.2636L22.665 25.0317ZM26.9163 18.6476C26.9163 14.8276 23.8197 11.731 19.9996 11.731V14.731C22.1628 14.731 23.9163 16.4844 23.9163 18.6476H26.9163ZM23.6182 25.5027C26.0714 24.2046 27.75 21.6236 27.75 18.6476H24.75C24.75 20.4675 23.7261 22.0515 22.2151 22.851L23.6182 25.5027ZM27.75 18.6476C27.75 14.3676 24.2801 10.8976 20 10.8976V13.8976C22.6232 13.8976 24.75 16.0244 24.75 18.6476H27.75ZM20 10.8976C15.7199 10.8976 12.25 14.3676 12.25 18.6476H15.25C15.25 16.0244 17.3768 13.8976 20 13.8976V10.8976ZM12.25 18.6476C12.25 21.6237 13.9283 24.2061 16.383 25.5031L17.7845 22.8506C16.2742 22.0526 15.25 20.4683 15.25 18.6476H12.25ZM15.5837 24.1768V28.6476H18.5837V24.1768H15.5837ZM15.5837 28.6474C15.5837 28.9944 15.6779 29.3349 15.8562 29.6326L18.4298 28.091C18.5306 28.2593 18.5838 28.4517 18.5837 28.6479L15.5837 28.6474ZM15.8562 29.6326C16.0345 29.9303 16.2902 30.174 16.5962 30.3377L18.0115 27.6925C18.1844 27.785 18.329 27.9228 18.4298 28.091L15.8562 29.6326ZM16.5962 30.3377C16.9021 30.5014 17.2468 30.579 17.5934 30.5621L17.4479 27.5656C17.6438 27.5561 17.8386 27.6 18.0115 27.6925L16.5962 30.3377ZM17.5934 30.5621C17.94 30.5453 18.2755 30.4347 18.5642 30.2421L16.8992 27.7465C17.0623 27.6377 17.252 27.5752 17.4479 27.5656L17.5934 30.5621ZM18.5638 30.2423L20.8322 28.7298L19.1678 26.2338L16.8995 27.7463L18.5638 30.2423ZM19.1679 28.7299L21.4367 30.2424L23.1008 27.7462L20.8321 26.2337L19.1679 28.7299ZM21.4362 30.2421C21.7249 30.4347 22.0604 30.5453 22.407 30.5621L22.5526 27.5656C22.7485 27.5752 22.9381 27.6377 23.1012 27.7465L21.4362 30.2421ZM22.407 30.5621C22.7536 30.579 23.0983 30.5014 23.4042 30.3377L21.9889 27.6925C22.1618 27.6 22.3567 27.5561 22.5526 27.5656L22.407 30.5621ZM23.4042 30.3377C23.7102 30.174 23.966 29.9303 24.1443 29.6326L21.5706 28.091C21.6714 27.9228 21.816 27.785 21.9889 27.6925L23.4042 30.3377ZM24.1443 29.6326C24.3226 29.3349 24.4167 28.9944 24.4167 28.6474L21.4167 28.6479C21.4166 28.4517 21.4699 28.2593 21.5706 28.091L24.1443 29.6326ZM24.4167 28.6476V24.1768H21.4167V28.6476H24.4167ZM21.5844 23.1272C21.0758 23.3066 20.5404 23.398 20.0011 23.3976L19.9989 26.3976C20.8788 26.3983 21.7524 26.2491 22.5822 25.9564L21.5844 23.1272ZM20 23.3976C19.4419 23.3976 18.91 23.3023 18.4171 23.128L17.417 25.9564C18.2275 26.243 19.0973 26.3976 20 26.3976V23.3976ZM16.4171 24.5422V27.8693H19.4171V24.5422H16.4171ZM18.7493 29.1173L20.6013 27.8823L18.937 25.3863L17.0849 26.6213L18.7493 29.1173ZM20.6017 27.8821C20.4236 28.0009 20.2144 28.0642 20.0004 28.0642V25.0642C19.6218 25.0642 19.2516 25.1764 18.9367 25.3865L20.6017 27.8821ZM20.0004 28.0642C19.7864 28.0642 19.5772 28.0009 19.3992 27.8821L21.0642 25.3865C20.7492 25.1764 20.379 25.0642 20.0004 25.0642V28.0642ZM19.3994 27.8822L21.251 29.1172L22.9156 26.6214L21.064 25.3864L19.3994 27.8822ZM23.5833 27.8693V24.5418H20.5833V27.8693H23.5833ZM20 14.231C19.42 14.231 18.8457 14.3452 18.3098 14.5672L19.4579 17.3388C19.6297 17.2676 19.814 17.231 20 17.231V14.231ZM18.3098 14.5672C17.774 14.7891 17.2871 15.1145 16.8769 15.5246L18.9983 17.6459C19.1298 17.5144 19.286 17.41 19.4579 17.3388L18.3098 14.5672ZM16.8769 15.5246C16.4668 15.9347 16.1415 16.4216 15.9195 16.9575L18.6912 18.1055C18.7624 17.9336 18.8667 17.7775 18.9983 17.6459L16.8769 15.5246ZM15.9195 16.9575C15.6976 17.4933 15.5833 18.0676 15.5833 18.6476H18.5833C18.5833 18.4616 18.62 18.2774 18.6912 18.1055L15.9195 16.9575ZM15.5833 18.6476C15.5833 19.2276 15.6976 19.802 15.9195 20.3378L18.6912 19.1898C18.62 19.0179 18.5833 18.8337 18.5833 18.6476H15.5833ZM15.9195 20.3378C16.1415 20.8737 16.4668 21.3606 16.8769 21.7707L18.9983 19.6494C18.8667 19.5178 18.7624 19.3617 18.6912 19.1898L15.9195 20.3378ZM16.8769 21.7707C17.2871 22.1808 17.774 22.5062 18.3098 22.7281L19.4579 19.9565C19.286 19.8853 19.1298 19.7809 18.9983 19.6494L16.8769 21.7707ZM18.3098 22.7281C18.8457 22.9501 19.42 23.0643 20 23.0643V20.0643C19.814 20.0643 19.6297 20.0277 19.4579 19.9565L18.3098 22.7281ZM20 23.0643C21.1714 23.0643 22.2948 22.599 23.1231 21.7707L21.0017 19.6494C20.7361 19.9151 20.3757 20.0643 20 20.0643V23.0643ZM23.1231 21.7707C23.9513 20.9424 24.4167 19.819 24.4167 18.6476H21.4167C21.4167 19.0234 21.2674 19.3837 21.0017 19.6494L23.1231 21.7707ZM24.4167 18.6476C24.4167 17.4763 23.9513 16.3529 23.1231 15.5246L21.0017 17.6459C21.2674 17.9116 21.4167 18.2719 21.4167 18.6476H24.4167ZM23.1231 15.5246C22.2948 14.6963 21.1714 14.231 20 14.231V17.231C20.3757 17.231 20.7361 17.3802 21.0017 17.6459L23.1231 15.5246ZM17.75 18.6476C17.75 18.0509 17.9871 17.4786 18.409 17.0567L16.2877 14.9353C15.3031 15.9199 14.75 17.2553 14.75 18.6476H17.75ZM18.409 17.0567C18.831 16.6347 19.4033 16.3976 20 16.3976V13.3976C18.6076 13.3976 17.2723 13.9508 16.2877 14.9353L18.409 17.0567ZM20 16.3976C20.5967 16.3976 21.169 16.6347 21.591 17.0567L23.7123 14.9353C22.7277 13.9508 21.3924 13.3976 20 13.3976V16.3976ZM21.591 17.0567C22.0129 17.4786 22.25 18.0509 22.25 18.6476H25.25C25.25 17.2553 24.6969 15.9199 23.7123 14.9353L21.591 17.0567ZM22.25 18.6476C22.25 19.2444 22.0129 19.8167 21.591 20.2386L23.7123 22.36C24.6969 21.3754 25.25 20.04 25.25 18.6476H22.25ZM21.591 20.2386C21.169 20.6606 20.5967 20.8976 20 20.8976V23.8976C21.3924 23.8976 22.7277 23.3445 23.7123 22.36L21.591 20.2386ZM20 20.8976C19.4033 20.8976 18.831 20.6606 18.409 20.2386L16.2877 22.36C17.2723 23.3445 18.6076 23.8976 20 23.8976V20.8976ZM18.409 20.2386C17.9871 19.8167 17.75 19.2444 17.75 18.6476H14.75C14.75 20.04 15.3031 21.3754 16.2877 22.36L18.409 20.2386Z"
              fill="#0BA259"
              mask="url(#path-2-inside-1_7606_452769)"
            />
          </svg>
          <div className="flex flex-col items-start justify-start">
            <div className="flex items-center justify-start">
              Issued Appreciation
            </div>
            <div className="flex gap-1 items-center justify-end">
              <h3>56.02</h3>
              <h5>%</h5>
            </div>
          </div>
          <div className="flex flex-col justify-between ">
            <div className="flex items-center justify-end gap-[2px]">
              <span className="text-green-500 font-light">12.7</span>
              <FaArrowUp className="text-green-500 font-light" />
            </div>
            <span className="text-xs font-normal">
              Updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IssuedAppreciation;
