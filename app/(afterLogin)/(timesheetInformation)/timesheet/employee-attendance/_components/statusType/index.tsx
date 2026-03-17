import { Button, Tag } from 'antd';

const statusType = (val: string) => {
  if (val === 'present') {
    return (
      <Tag
        id="roleTypeOwner"
        data-cy="roleTypeOwner"
        className="bg-[#e6f4ff] text-[#1677ff] text-xs font-medium py-1 px-2  border border-[#91caff] hover:bg-sky-50"
      >
        PRESENT
      </Tag>
    );
  } else if (val === 'absent') {
    return (
      <Tag
        id="roleTypeAdmin"
        data-cy="roleTypeAdmin"
        className="text-[#4d4d4d] text-sm font-normal py-1 px-2 bg-white border border-[#d9d9d9]"
      >
        ABSENT
      </Tag>
    );
  } else if (val === 'late') {
    return (
      <Tag
        id="roleTypeSuper"
        data-cy="roleTypeProbation"
        className="text-[#f5222d] text-sm font-normal py-1 px-2 bg-[#fff1f0] border border-[#ffa39e]"
      >
        LATE
      </Tag>
    );
  } else if (val === 'early') {
    return (
      <Tag
        id="roleTypeOnLeave" // Note: I changed this id because it's same with the above Button
        data-cy="roleTypeOnLeave"
        className="text-green-600 text-xs font-medium py-1 px-2 bg-white border border-green-600 hover:bg-green-50"
      >
        EARLY
      </Tag>
    );
  } else if (val === null || val === '') {
    return (
      <Button
        id="roleTypeNull"
        data-cy="roleTypeNull"
        className="text-sky-600 text-xs font-medium w-[90px] px-[30px] bg-white border border-sky-600 hover:bg-sky-50"
      >
        Unknown
      </Button>
    );
  } else if (val === 'Active') {
    return (
      <Tag
        id="roleTypeActive"
        data-cy="roleTypeActive"
        className="text-[#1677ff] text-xs font-medium py-1 px-2 bg-[#e6f4ff] border border-[#91caff]"
      >
        Active
      </Tag>
    );
  } else if (val === 'InActive') {
    return (
      <Tag
        id="roleTypeInActive"
        data-cy="roleTypeInActive"
        className="text-[#ff4d4f] text-xs font-medium py-1 px-2 bg-[#fff1f0] border border-[#ffccc7]"
      >
        InActive
      </Tag>
    );
  } else {
    return (
      <Button
        id="roleTypeOther"
        data-cy="roleTypeOther"
        className="bg-white text-indigo-600 text-xs font-medium px-[30px] border border-indigo-600 hover:bg-indigo-50"
        title={val}
      >
        {val?.slice(0, 20)}
      </Button>
    );
  }
};

export default statusType;
