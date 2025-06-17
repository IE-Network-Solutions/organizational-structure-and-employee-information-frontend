import CustomBreadcrumb from "@/components/common/breadCramp";
import { Button } from "antd";
import { FaPlus } from "react-icons/fa";
import { FaCopy } from "react-icons/fa6";
import InternTable from "./_components/table";

  const InternPage = () => {
  return (
    <div className="h-auto w-full bg-white">
    <div className="flex flex-wrap justify-between items-center bg-white">
      <CustomBreadcrumb             
        title="Intern"
        subtitle={<>
          <span className="text-xs sm:text-sm">Manage and review intern applicants.</span>
          </>}
      />
      <div className="flex justify-between items-center rounded-lg w-fit h-10 px-3 gap-4">
      <Button
              type="primary"
              id="createUserButton"
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus />}
             
            >
              <span className="hidden sm:inline">
                New
              </span>
            </Button>
        <Button
              type="primary"
              id="createUserButton"
              className="h-10 w-10 sm:w-auto"
              icon={<FaCopy />}
             
            >
              <span className="hidden sm:inline">
                Copy Link
              </span>
            </Button>
       
      </div>
    </div>

    <div>
     <InternTable />
    </div>
</div>
  );
};

export default InternPage;