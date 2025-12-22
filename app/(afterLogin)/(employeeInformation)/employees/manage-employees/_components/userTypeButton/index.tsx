import { Button } from 'antd';

const userTypeButton = (val: string) => {
  if (val === 'On Boarding') {
    return (
      <Button
        id="roleTypeOwner"
        data-cy="roleTypeOwner"
        className="text-[#41a9f0] text-xs font-medium w-[90px] px-[30px] bg-[#add5f0]"
      >
        ON BOARDING
      </Button>
    );
  } else if (val === 'Permanent') {
    return (
      <Button
        id="roleTypeAdmin"
        data-cy="roleTypeAdmin"
        className="text-[#5555f4] text-xs font-medium w-[90px] px-[30px]  bg-[#b2b2ff]"
      >
        Permanent
      </Button>
    );
  } else if (val === 'Probation') {
    return (
      <Button
        id="roleTypeSuper"
        data-cy="roleTypeProbation"
        className="text-[#9f7dff] text-xs font-medium w-[90px] px-[30px]  bg-[#f4f0ff]"
      >
        PROBATION
      </Button>
    );
  } else if (val === 'On Leave') {
    return (
      <Button
        id="roleTypeOnLeave" // Note: I changed this id because it's same with the above Button
        data-cy="roleTypeOnLeave"
        className="text-[#e86064] text-xs font-medium w-[90px] px-[30px] bg-[#ffedec]"
      >
        ON LEAVE
      </Button>
    );
  } else if (val === null || val === '') {
    return (
      <Button
        id="roleTypeNull"
        data-cy="roleTypeNull"
        className="text-white text-xs font-medium w-[90px] px-[30px] bg-sky-600"
      >
        Unknown
      </Button>
    );
  } else {
    return (
      <Button
        id="roleTypeOther"
        data-cy="roleTypeOther"
        className="bg-indigo-400 text-xs font-medium px-[30px]  text-white"
        title={val}
      >
        {val?.slice(0, 20)}
      </Button>
    );
  }
};

export default userTypeButton;
