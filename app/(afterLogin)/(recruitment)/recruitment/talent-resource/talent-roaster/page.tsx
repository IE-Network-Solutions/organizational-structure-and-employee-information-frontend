import BlockWrapper from "@/components/common/blockWrapper/blockWrapper";
import CustomBreadcrumb from "@/components/common/breadCramp";
import { Button } from "antd";
import { FaCopy, FaPlus } from "react-icons/fa";
import TalentRoasterTable from "./_components/table";
import SearchOptions from "../../jobs/[id]/_components/candidateSearch/candidateSearchOptions";

const TalentRoasterPage = () => {

    return(
   <div className="h-auto w-full bg-white">
    <div className="flex flex-wrap justify-between items-center bg-white">
      <CustomBreadcrumb             
        title="Talent Roaster"
        subtitle={<>
        <span className="text-xs sm:text-sm text-nowrap">profiles for potential hiring.</span>
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
     <TalentRoasterTable />
    </div>
</div>
);
};

export default TalentRoasterPage;