import { Button } from 'antd';

const userTypeButton = (val: string) => {
  if (val === 'On Boarding') {
    return (
      <Button
        id="roleTypeOwner"
        data-cy="roleTypeOwner"
        className="text-sky-600 text-xs font-medium w-[90px] px-[30px] bg-white border border-sky-600 hover:bg-sky-50"
      >
        ON BOARDING
      </Button>
    );
  } else if (val === 'Permanent') {
    return (
      <Button
        id="roleTypeAdmin"
        data-cy="roleTypeAdmin"
        className="text-indigo-700 text-xs font-medium w-[90px] px-[30px] bg-white border border-indigo-700 hover:bg-indigo-50"
      >
        Permanent
      </Button>
    );
  } else if (val === 'Probation') {
    return (
      <Button
        id="roleTypeSuper"
        data-cy="roleTypeProbation"
        className="text-violet-600 text-xs font-medium w-[90px] px-[30px] bg-white border border-violet-600 hover:bg-violet-50"
      >
        PROBATION
      </Button>
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
