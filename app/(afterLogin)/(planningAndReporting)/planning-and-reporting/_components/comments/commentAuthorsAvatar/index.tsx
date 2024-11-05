import { useGetAllUsers } from "@/store/server/features/employees/employeeManagment/queries";
import { CommentsData } from "@/types/okr";
import { Avatar, Tooltip } from "antd";
import { FaUser } from "react-icons/fa";

const CommentAuthorsAvatars = (data: CommentsData[]) => {
    const { data: allUsers } = useGetAllUsers();
  
    const getUserDetail = (id: string) => {
      const user = allUsers?.items?.find((user: any) => id === user.id);
      return user
        ? {
            firstName: user.firstName || '-',
            lastName: user.lastName || '-',
            middleName: user.middleName || '-',
            profileImage: user.profileImage,
            role: user.role?.name || '-',
            fullName: `${user.firstName} ${user.middleName} ${user.lastName}`,
          }
        : {
            firstName: '-',
            lastName: '-',
            middleName: '-',
            profileImage: null,
            role: '-',
            fullName: '-',
          };
    };
  
    const maxDisplayCount = 10;
    const displayData = data?.slice(0, maxDisplayCount);
    const extraCount =
      data && data.length > maxDisplayCount ? data.length - maxDisplayCount : 0;
  
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {displayData?.map((commentData, index) => {
          const userDetail = getUserDetail(commentData.commentedBy);
          return (
            <Tooltip key={index} title={userDetail.fullName}>
              <Avatar
                src={userDetail.profileImage || undefined}
                icon={!userDetail.profileImage ? <FaUser /> : undefined}
                className="cursor-pointer"
                style={{
                  border: '2px solid white',
                  marginLeft: index > 0 ? -10 : 0, // Half-overlap effect
                  zIndex: maxDisplayCount - index, // Ensures proper stacking order
                }}
              />
            </Tooltip>
          );
        })}
        {extraCount > 0 && (
          <div
            style={{
              marginLeft: -10,
              padding: '0 10px',
              fontSize: '14px',
              background: '#f0f0f0',
              borderRadius: '50%',
            }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  };


  export default CommentAuthorsAvatars;