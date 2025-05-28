import React from 'react';
import { Row, Avatar, Form, Input, Button } from 'antd';
import { FaUser } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Dummy users
const users = {
  u1: {
    fullName: 'Alice Johnson',
    profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  u2: {
    fullName: 'Bob Smith',
    profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  u3: {
    fullName: 'Charlie Kim',
    profileImage: '', // fallback to icon
  },
};

// Function to get user details
const getUserDetail = (userId: keyof typeof users) =>
  users[userId] || { fullName: 'Unknown', profileImage: '' };

// Dummy data
type UserId = keyof typeof users;

const data: {
  id: string;
  commentedBy: UserId;
  comment: string;
  createdAt: string;
}[] = [
  {
    id: 'cmt1',
    commentedBy: 'u1',
    comment:
      'This is a really helpful update, thanks! hdbfkhdsbfdshghbskhdsfbdskhj',
    createdAt: dayjs().subtract(2, 'hour').toISOString(),
  },
  {
    id: 'cmt2',
    commentedBy: 'u2',
    comment: 'Could we clarify the deadline again?',
    createdAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 'cmt3',
    commentedBy: 'u3',
    comment: 'I agree with the proposed changes.',
    createdAt: dayjs().subtract(30, 'minute').toISOString(),
  },
];

// Dummy variables
const isLoading = false;

// type CommentActionMenuProps = {
//   onEdit: () => void;
//   onDelete: () => void;
// };

// const CommentActionMenu: React.FC<CommentActionMenuProps> = ({
//   onEdit,
//   onDelete,
// }) => (
//   <div className="flex gap-2 text-xs">
//     <Button size="small" onClick={onEdit}>
//       Edit
//     </Button>
//     <Button size="small" danger onClick={onDelete}>
//       Delete
//     </Button>
//   </div>
// );

const CommentComponent = () => {
  const [form] = Form.useForm();

  // const handleSubmit = (values) => {
  //   console.log('Submitted Comment:', values);
  // };

  // const handleEdit = (comment) => {
  //   console.log('Edit:', comment);
  // };

  // const handleDelete = (id) => {
  //   console.log('Delete ID:', id);
  // };

  return (
    <div className="w-full">
      {data.map((commentData) => {
        const { fullName, profileImage } = getUserDetail(
          commentData.commentedBy,
        );

        return (
          <Row
            key={commentData.id}
            justify="space-between"
            align="middle"
            className="w-full py-2"
          >
            <div className="flex  items-center">
              <div className=" text-xs font-semibold flex items-center">
                <Avatar
                  src={profileImage || undefined}
                  icon={!profileImage ? <FaUser /> : undefined}
                  alt={fullName}
                />
                <div className="">
                  <span className="font-normal">{fullName}</span>
                  <span className="w-full text-gray-700  font-semibold ml-2">
                    {commentData.comment}
                  </span>
                  {/* <div className="text-gray-400 text-xs ml-2">
                  {dayjs(commentData.createdAt).fromNow()}
                </div> */}
                </div>
              </div>
            </div>
            {/* <Col hidden={commentData?.commentedBy !== userId}>
              <CommentActionMenu
                onEdit={() => handleEdit(commentData)}
                onDelete={() => handleDelete(commentData.id)}
              />
            </Col> */}
          </Row>
        );
      })}

      <Form
        form={form}
        layout="inline"
        className="w-full mt-4"
        // onFinish={handleSubmit}
      >
        <div className="w-full flex flex-col gap-2">
          <Form.Item
            name="comment"
            rules={[{ required: true, message: 'Please enter a comment' }]}
            className="w-full"
          >
            <Input.TextArea rows={3} placeholder="[[Comment by the person]]" />
          </Form.Item>

          <Form.Item className="flex  justify-end mr-0">
            <Button
              loading={isLoading}
              type="primary"
              htmlType="submit"
              className="w-24"
            >
              Send
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default CommentComponent;
