import SelectWorkflow from "./components/SelectWorkflow";

const AgencyWorkflows = () => {
  return (
    <div className=" w-full px-[30px] pt-[45px] pb-[70px] bg-[#EFEFEF]">
      <h1 className="text-[#6D6D6D] text-[44px] font-[300] mb-[35px]">
        Workflows
      </h1>
      <SelectWorkflow />
    </div>
  );
};

export default AgencyWorkflows;
