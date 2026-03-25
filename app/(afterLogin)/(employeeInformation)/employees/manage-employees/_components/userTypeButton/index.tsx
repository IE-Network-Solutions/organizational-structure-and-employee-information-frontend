import { Button, Tag } from 'antd';

const userTypeButton = (val: string) => {
  if (val === 'On Boarding') {
    return (
      <Tag
        id="roleTypeOwner"
        data-cy="roleTypeOwner"
        className="text-sky-600 text-xs font-normal px-2 bg-white border border-sky-600 hover:bg-sky-50 h-[22px]"
      >
        ON BOARDING
      </Tag>
    );
  } else if (val === 'Permanent') {
    return (
      <Tag
        id="roleTypeAdmin"
        data-cy="roleTypeAdmin"
        className="text-[#4d4d4d] text-sm font-normal px-2 bg-white border border-[#d9d9d9] h-[22px]"
      >
        Permanent
      </Tag>
    );
  } else if (val === 'Probation') {
    return (
      <Tag
        id="roleTypeSuper"
        data-cy="roleTypeProbation"
        className="text-[#4d4d4d] text-sm font-normal px-2 bg-white border border-[#d9d9d9] h-[22px]"
      >
        PROBATION
      </Tag>
    );
  } else if (val === 'On Leave') {
    return (
      <Button
        id="roleTypeOnLeave" // Note: I changed this id because it's same with the above Button
        data-cy="roleTypeOnLeave"
        className="text-red-600 text-xs font-medium w-[90px] px-[30px] bg-white border border-red-600 hover:bg-red-50"
      >
        ON LEAVE
      </Button>
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
        className="text-[#1677ff] text-sm font-normal px-2 bg-[#e6f4ff] border border-[#91caff] h-[22px]"
      >
        Active
      </Tag>
    );
  } else if (val === 'InActive') {
    return (
      <Tag
        id="roleTypeInActive"
        data-cy="roleTypeInActive"
        className="text-[#ff4d4f] text-sm font-normal px-2 bg-[#fff1f0] border border-[#ffccc7] h-[22px]"
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

export default userTypeButton;
