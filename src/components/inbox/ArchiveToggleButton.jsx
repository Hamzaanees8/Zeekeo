import useInboxStore from "../../routes/stores/useInboxStore";
import { ArchiveIcon } from "../Icons";


const ArchiveToggleButton = () => {
  const { filters, setFilters, resetFilters } = useInboxStore();

  const handleToggle = () => {
    // reset other filters but keep archive toggle
    resetFilters();
    setFilters("archived", !filters.archived);
  };

  return (
    <div
      onClick={handleToggle}
      className="relative cursor-pointer h-[35px] w-[159px] gap-x-2.5 flex items-center justify-between border border-[#7E7E7E] px-3.5 py-2 text-base font-medium bg-white text-[#7E7E7E]"
    >
      <ArchiveIcon className="stroke-[#7E7E7E]" />
      {filters.archived ? "Go to Active" : "Go to Archive"}
    </div>
  );
};

export default ArchiveToggleButton;
