import { Button } from 'antd';

const userTypeButton = (val: string) => {
  if (val === 'Owner') {
    return (
      <Button
        id="roleTypeOwner"
        className="text-white text-xs w-[40px] bg-indigo-600 px-[30px]"
      >
        Owner
      </Button>
    );
  } else if (val === 'Admin') {
    return (
      <Button
        id="roleTypeAdmin"
        className="text-white text-xs w-[40px] px-[30px] bg-sky-600"
      >
        Admin
      </Button>
    );
  } else if (val === 'Super') {
    return (
      <Button
        id="roleTypeSuper"
        className="text-white text-xs w-[40px] px-[30px] bg-sky-600"
      >
        Admin
      </Button>
    );
  } else if (val === null || val === '') {
    return (
      <Button
        id="roleTypeNull"
        className="text-white text-xs w-[40px] px-[30px] bg-sky-600"
      >
        --
      </Button>
    );
  } else {
    return (
      <Button
        id="roleTypeOther"
        className="bg-indigo-400 text-xs w-[40px] px-[30px] text-white"
        title={val}
      >
        {val?.slice(0, 8)}
      </Button>
    );
  }
};

export default userTypeButton;
