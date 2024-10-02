import { Form } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import Image from 'next/image';
import React from 'react';

const index = () => {
  return (
    <div>
      <div className="bg-white w-full rounded-lg px-32 py-8">
        <div className="text-center text-2xl font-bold text-primary py-4">
          Submit Application
        </div>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={() => {
            handleSubmit();
          }}
        >
          <Form.Item
            id="documentNameId"
            name="documentName"
            label={
              <span className="text-md font-semibold text-gray-700">
                Upload CV
              </span>
            }
            rules={[
              { required: true, message: 'Please choose the document type' },
            ]}
          >
            <Dragger
              name="documentName"
              fileList={documentFileList}
              onChange={handleDocumentChange}
              onRemove={handleDocumentRemove}
              customRequest={customRequest}
              listType="picture"
              accept="*/*"
            >
              <div className="flex items-center justify-center">
                <Image
                  className="flex items-center justify-center"
                  src={cvUpload.src}
                  alt="Loading"
                  width={30}
                  height={30}
                />
              </div>
              <div className="flex flex-col justify-center items-center text-md font-semibold text-gray-950">
                <p>Upload your CV</p>
                <p className="text-gray-400 text-sm font-normal">
                  or drag and drop it here
                </p>
              </div>
            </Dragger>
          </Form.Item>
          <div className="text-xs font-sm mb-5 ">
            Max file size : 5MB. File format : .pdf
          </div>
        </Form>
      </div>
    </div>
  );
};

export default index;
