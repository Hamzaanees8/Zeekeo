import { CopyIcon } from "../../../../components/Icons";
import { templateCategories } from "../../../../utils/template-helpers";

// Template categories mapping

const AgencyTemplates = ({ agencyTemplates, showAddTemplate }) => {
  return (
    <div className="p-4">
      <div className="bg-white px-4 py-5 mb-4 rounded-[8px] border border-[#7E7E7E] shadow-md">
        <h2 className="text-lg font-semibold text-[#6D6D6D] mb-4 font-urbanist">
          Agency Templates
        </h2>

        {agencyTemplates.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No agency templates found
          </div>
        ) : (
          <div>
            {agencyTemplates.map(template => (
              <div
                key={template.template_id}
                className="py-3 border-b border-[#CCCCCC] last:border-b-0"
              >
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-2 w-[40%]">
                    <span className="text-sm font-medium text-[#6D6D6D] font-urbanist w-[200px]">
                      {templateCategories[template.type] || template.type}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#6D6D6D] font-urbanist flex w-[40%]">
                    {template.name}
                  </span>
                  <div className="flex gap-2 w-[20%] justify-end">
                    <button
                      onClick={() => showAddTemplate(template)}
                      title="Copy Template"
                    >
                      <CopyIcon className="w-6 h-6 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8] cursor-pointer" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyTemplates;
