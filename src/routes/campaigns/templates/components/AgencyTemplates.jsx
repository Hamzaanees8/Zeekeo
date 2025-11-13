import { CopyIcon } from "../../../../components/Icons";
import { templateCategories } from "../../../../utils/template-helpers";

// Template categories mapping

const AgencyTemplates = ({ agencyTemplates }) => {
  // Using the dummy data directly

  const handleCopyTemplate = template => {
    // Logic to copy template would go here
    console.log("Copying template:", template);
    // You can implement copy functionality here
  };

  return (
    <div className="p-4">
      <div className="bg-white px-4 py-5 mb-4 rounded-[8px] border border-[#7E7E7E] shadow-md">
        <h2 className="text-lg font-semibold text-[#6D6D6D] mb-4 font-urbanist">
          Agency Workflow Templates
        </h2>

        {agencyTemplates.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No agency templates found
          </div>
        ) : (
          <div className="space-y-4">
            {agencyTemplates.map((template, index) => (
              <div
                key={template.template_id}
                className="py-3 border-b border-[#CCCCCC] last:border-b-0"
              >
                <div className="flex justify-between items-center px-2">
                  {/* Template Type and Category */}
                  <div className="flex items-center gap-2 w-[30%]">
                    <span className="text-sm font-medium text-[#6D6D6D] font-urbanist w-[200px]">
                      {templateCategories[template.type] || template.type}
                    </span>
                  </div>

                  {/* Template Name and Info */}
                  <div className="flex gap-2 items-start w-[60%]">
                    <div>
                      <span className="text-sm font-medium text-[#6D6D6D] font-urbanist block">
                        {template.name}
                      </span>
                      {template.folder && (
                        <span className="text-xs text-[#7E7E7E] font-urbanist">
                          Folder: {template.folder}
                        </span>
                      )}
                      {template.user_email && (
                        <span className="text-xs text-[#7E7E7E] font-urbanist block">
                          Created by: {template.user_email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-[20%] justify-end">
                    <button
                      onClick={() => handleCopyTemplate(template)}
                      title="Copy Template"
                      className="p-1 rounded-full border border-[#00B4D8] hover:bg-[#00B4D8] hover:bg-opacity-10 transition-colors"
                    >
                      <CopyIcon className="w-4 h-4 fill-[#00B4D8]" />
                    </button>
                  </div>
                </div>

                {/* Template Preview (optional) */}
                <div className="mt-2 px-2">
                  <p className="text-xs text-[#7E7E7E] font-urbanist line-clamp-2">
                    {template.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional information */}
      <div className="text-sm text-[#7E7E7E] font-urbanist text-center">
        {agencyTemplates.length} agency template(s) available
      </div>
    </div>
  );
};

export default AgencyTemplates;
