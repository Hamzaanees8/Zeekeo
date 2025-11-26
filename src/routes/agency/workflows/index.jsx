import SelectWorkflow from "./components/SelectWorkflow";
import { useAgencySettingsStore } from "../../stores/useAgencySettingsStore";

const AgencyWorkflows = () => {
  const { background, textColor } = useAgencySettingsStore();

  return (
    <div
      className=" w-full px-[30px] pt-[45px] pb-[70px]"
      style={{ backgroundColor: background || "#EFEFEF" }}
    >
      <h1
        className="text-[44px] font-[300] mb-[35px]"
        style={{ color: textColor || "#6D6D6D" }}
      >
        Workflows
      </h1>
      <SelectWorkflow />
    </div>
  );
};

export default AgencyWorkflows;
