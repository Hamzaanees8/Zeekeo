import React, { useState, useEffect, useRef } from "react";
import {
  createTemplate,
  deleteTemplate,
  getTemplates,
  updateTemplate,
} from "../../../../services/templates.js";
import {
  groupTemplatesByType,
  insertTextAtCursor,
  variableOptions,
} from "../../../../utils/template-helpers.js";
import {
  PlusIcon,
  PencilIcon,
  CopyIcon,
  DeleteIcon,
} from "../../../../components/Icons.jsx";
import toast from "react-hot-toast";
import ActionPopup from "../../templates/components/ActionPopup.jsx";
import { getCampaigns } from "../../../../services/campaigns.js";

const SavedMessages = ({
  selectedTemplateId = null,
  type = "linkedin_message",
  onAssignTemplate,
}) => {
  const addTemplateBodyRef = useRef(null);
  const editTemplateBodyRef = useRef(null);

  const [openIndex, setOpenIndex] = useState(0);
  const [openInnerSteps, setOpenInnerSteps] = useState({});
  const [groupedTemplates, setGroupedTemplates] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const getNonArchivedCampaignsUsingTemplate = async templateId => {
    if (!templateId) return [];

    // Always fetch fresh campaigns to ensure we have latest data
    try {
      const campaignsData = await getCampaigns();

      // Filter campaigns that are NOT archived (archived !== true)
      const nonArchivedCampaigns = campaignsData.filter(
        campaign => campaign.archived !== true,
      );

      // Find campaigns using this template
      const campaignsUsingTemplate = nonArchivedCampaigns.filter(campaign => {
        if (campaign.workflow?.nodes) {
          return campaign.workflow.nodes.some(
            node => node.properties?.template_id === templateId,
          );
        }
        return false;
      });

      return campaignsUsingTemplate;
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      return null;
    }
  };
  useEffect(() => {
    const fetchTemplates = async () => {
      const { templates } = await getTemplates();
      const grouped = groupTemplatesByType(templates);
      setGroupedTemplates(grouped);
      setSelectedType(type);
      console.log(grouped);
    };

    fetchTemplates();
    setNewTemplate({
      name: "",
      subject: "",
      body: "",
      type,
    });
  }, []);

  //console.log(type)
  // useEffect(() => {
  //   setOpenIndex(0); // open first item by default on tab change
  //   const hasSteps = list[0]?.steps?.length > 0;
  //   setOpenInnerSteps(hasSteps ? { 0: 0 } : {});
  // }, [type]);

  const handleAssignTemplate = template => {
    if (typeof onAssignTemplate === "function") {
      onAssignTemplate(template);
    }
  };

  const handleVariableInsert = (
    variable,
    fieldRef,
    fieldVal,
    mode = "new",
  ) => {
    //console.log(fieldVal)
    //console.log(mode)

    const updatedMessage = insertTextAtCursor({
      fieldRef,
      valueToInsert: variable,
      currentText: fieldVal,
    });

    if (mode == "edit") {
      setEditingTemplate({ ...editingTemplate, body: updatedMessage });
    } else {
      setNewTemplate({ ...newTemplate, body: updatedMessage });
    }
  };

  const toggleMainItem = index => {
    setEditingTemplate(null);
    setOpenIndex(prev => {
      const isSame = prev === index;
      return isSame ? null : index;
    });
  };

  const toggleInnerStep = (mainIdx, stepIdx) => {
    setOpenInnerSteps(prev => ({
      ...prev,
      [mainIdx]: prev[mainIdx] === stepIdx ? null : stepIdx,
    }));
  };

  const handleEditTemplate = template => {
    toggleMainItem(null);
    setEditingTemplate(template);
  };

  const handleCopyTemplate = template => {
    setEditingTemplate(null);
    toggleMainItem(null);
    setNewTemplate({
      name: template.name,
      subject: template?.subject,
      body: template.body,
      type: template.type,
    });
  };

  const handleConfirmDeleteTemplate = async () => {
    if (!deleteTarget) return;

    const templateId = deleteTarget.data.template_id;

    // Check if template is used in non-archived campaigns
    const campaignsUsingTemplate = await getNonArchivedCampaignsUsingTemplate(
      templateId,
    );
    console.log("campaignsUsingTemplate", campaignsUsingTemplate);
    // If fetch failed, cancel deletion
    if (
      campaignsUsingTemplate === null ||
      campaignsUsingTemplate === undefined
    ) {
      toast.error(
        "Unable to verify template usage. Deletion cancelled for safety.",
      );
      setDeleteTarget(null);
      return;
    }

    if (campaignsUsingTemplate.length > 0) {
      toast.error(
        `Cannot delete template. It is being used in ${campaignsUsingTemplate.length} campaigns.`,
        { duration: 5000 },
      );
      setDeleteTarget(null);
      return;
    }

    try {
      await deleteTemplate(templateId);
      toast.success("Template deleted successfully");
      const { templates } = await getTemplates();
      setGroupedTemplates(groupTemplatesByType(templates));
    } catch (err) {
      console.error("Failed to delete template:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to delete template");
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate({
      name: "",
      subject: "",
      body: "",
      type,
    });
    setNewTemplate(true);
  };

  const handleSaveTemplate = async template => {
    try {
      let updatedTemplate = {};
      if (template?.template_id) {
        updatedTemplate = await updateTemplate(template.template_id, template);
      } else {
        updatedTemplate = await createTemplate({ ...template, type: type });
      }
      toast.success("Template saved successfully");
      const { templates } = await getTemplates();
      setGroupedTemplates(groupTemplatesByType(templates));
      handleAssignTemplate(updatedTemplate);
      setEditingTemplate(null);
      setNewTemplate({
        name: "",
        subject: "",
        body: "",
        type,
      });
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  return (
    <div className="space-y-2">
      {/* <div className="flex items-center justify-end">
        <button className="text-[16px] border border-[#7E7E7E] bg-white text-[#7E7E7E] px-3 py-1 cursor-pointer">
          + Create {type.replace(" Sequences", "")}
        </button>
      </div> */}

      {type && (
        <div className="pt-2 text-[18px] text-[#454545] py-2 font-medium border-b border-b-[#7E7E7E]">
          <span>Templates</span>
        </div>
      )}
      {type && groupedTemplates[type]?.length > 0 ? (
        groupedTemplates[type].map((template, idx) => (
          <div key={idx} className="m-0">
            {/* Main Title */}
            <div className="flex items-center justify-between py-2 ">
              <span
                className={`font-urbanist text-[16px] cursor-pointer ${
                  template.template_id === selectedTemplateId
                    ? "text-[#0387FF]"
                    : "text-[#6D6D6D]"
                }`}
                onClick={() => toggleMainItem(template.template_id)}
              >
                {template.name}
              </span>
              <div className="flex items-center space-x-2">
                <span onClick={() => handleAssignTemplate(template)}>
                  <PlusIcon className="w-5 h-5 p-[2px] border border-[#0387FF] fill-[#0387FF] cursor-pointer rounded-full" />
                </span>
                <span onClick={() => handleEditTemplate(template)}>
                  <PencilIcon className="w-5 h-5 p-[2px] border border-[#12D7A8] fill-[#12D7A8] cursor-pointer rounded-full" />
                </span>
                <span onClick={() => handleCopyTemplate(template)}>
                  <CopyIcon className="w-5 h-5 p-[2px] border border-[#00B4D8] fill-[#00B4D8] cursor-pointer rounded-full" />
                </span>
                <span
                  onClick={() => {
                    setDeleteTarget({
                      type: "message",
                      data: template,
                    });
                  }}
                >
                  <DeleteIcon className="w-5 h-5 p-[2px] border border-[#D80039] cursor-pointer rounded-full" />
                </span>
              </div>
            </div>

            {/* Expanded Content */}
            {openIndex === template.template_id && (
              <div className="space-y-4 p-3">
                {template?.subject && (
                  <div className="w-full border border-[#C7C7C7] bg-white p-2 text-[#6D6D6D] min-h-[30px]">
                    {template.subject}
                  </div>
                )}
                <div className="w-full border border-[#C7C7C7] bg-white p-2 text-[#6D6D6D] min-h-[100px]">
                  {template.body}
                </div>
                {template?.attachments?.length > 0 && (
                  <div>
                    <div className="font-medium text-[#454545] text-base">
                      Attachments:
                    </div>
                    {template.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="text-[13px] text-[#7E7E7E] truncate bg-[white] border border-[#7E7E7E] px-2 py-1 rounded-[4px] w-fit mt-1"
                        title={file}
                      >
                        {file}
                      </div>
                    ))}
                  </div>
                )}
                {/* Inner Sequence Steps */}
                {/* {template.steps && (
                  <div className="ml-4 space-y-4">
                    {template.steps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className=""
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[15.35px] text-[#6D6D6D] font-urbanist">
                            {step.label}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleInnerStep(idx, sIdx)}
                              className="text-xs border border-[#0387FF] text-[#0387FF] px-1 cursor-pointer"
                            >
                              + Add Message
                            </button>
                            <PencilIcon className="w-4 h-4 p-[1px] border border-[#12D7A8] fill-[#12D7A8] cursor-pointer" />
                            <DeleteIcon className="w-4 h-4 p-[1px] border border-[#D80039] cursor-pointer" />
                          </div>
                        </div>

                        {openInnerSteps[idx] === sIdx && (
                          <textarea
                            placeholder="Message"
                            className="w-full border border-[#C7C7C7] bg-white p-2 text-[#6D6D6D] min-h-[80px] mt-2"
                            defaultValue={step.message || ""}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )} */}

                {/* <div className="flex items-center justify-end">
                  <button className="text-white bg-[#0387FF] text-sm px-3 py-1">
                    Add to Workflow
                  </button>
                </div> */}
              </div>
            )}

            {editingTemplate?.template_id === template.template_id ? (
              <div className=" p-3 mt-2 space-y-2">
                {(type == "linkedin_inmail" || type == "email_message") && (
                  <input
                    className="w-full border border-[#C7C7C7] bg-white p-2 text-[#6D6D6D] rounded-[4px]"
                    placeholder="Subject"
                    value={editingTemplate.subject}
                    onChange={e =>
                      setEditingTemplate({
                        ...editingTemplate,
                        subject: e.target.value,
                      })
                    }
                  />
                )}
                <textarea
                  className="w-full border border-[#C7C7C7] bg-white p-2 text-[#6D6D6D] min-h-[100px] rounded-[4px]"
                  placeholder="Message"
                  ref={editTemplateBodyRef}
                  value={editingTemplate.body}
                  onChange={e =>
                    setEditingTemplate({
                      ...editingTemplate,
                      body: e.target.value,
                    })
                  }
                />
                {editingTemplate?.attachments?.length > 0 && (
                  <div>
                    <div className="font-medium text-[#454545] text-base">
                      Attachments:
                    </div>
                    {editingTemplate.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between w-full gap-2 text-[13px] text-[#7E7E7E] truncate bg-white border border-[#7E7E7E] px-2 py-1 rounded-[4px] mt-1"
                        title={file}
                      >
                        <span>{file}</span>
                        <button
                          className="text-red-500 text-xs cursor-pointer"
                          onClick={() => {
                            const updatedAttachments =
                              editingTemplate.attachments.filter(
                                (_, i) => i !== idx,
                              );
                            setEditingTemplate({
                              ...editingTemplate,
                              attachments: updatedAttachments,
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Insert Variables */}
                <div>
                  <div className="font-medium mb-1 text-sm">
                    Insert Variables
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variableOptions.map(opt => (
                      <button
                        key={opt.value}
                        className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3  rounded-[4px]"
                        onClick={() =>
                          handleVariableInsert(
                            opt.value,
                            editTemplateBodyRef,
                            editingTemplate.body,
                            "edit",
                          )
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-6 py-1 bg-[#0387FF] text-white text-base rounded-[4px] cursor-pointer"
                    onClick={() => handleSaveTemplate(editingTemplate)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-400 text-white px-4 py-1 rounded-[4px] cursor-pointer"
                    onClick={() => {
                      setEditingTemplate(null);
                      setNewTemplate(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))
      ) : (
        <div className="text-[#6D6D6D]">
          <p>No templates available.</p>
        </div>
      )}

      {type && newTemplate && (
        <div className="space-y-4">
          <div className="pt-2 text-[16px] text-[#454545] py-2 font-medium border-b border-b-[#7E7E7E]">
            <span>Add Template</span>
          </div>
          <input
            type="text"
            placeholder="Title"
            value={newTemplate.name}
            className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3 pr-10 py-1 h-full w-full  rounded-[4px]"
            onChange={e =>
              setNewTemplate({ ...newTemplate, name: e.target.value })
            }
          />
          {(type == "linkedin_inmail" || type == "email_message") && (
            <input
              className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3 pr-10 py-1 h-full w-full  rounded-[4px]"
              placeholder="Subject"
              value={newTemplate.subject}
              onChange={e =>
                setNewTemplate({ ...newTemplate, subject: e.target.value })
              }
            />
          )}
          <textarea
            placeholder="Message"
            ref={addTemplateBodyRef}
            value={newTemplate.body}
            className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3 pr-10 py-1 w-full h-24  rounded-[6px]"
            onChange={e =>
              setNewTemplate({ ...newTemplate, body: e.target.value })
            }
          />

          {/* Insert Variables */}
          <div>
            <div className="font-medium mb-1 text-sm">Insert Variables</div>
            <div className="flex flex-wrap gap-2">
              {variableOptions.map(opt => (
                <button
                  key={opt.value}
                  className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3 rounded-[4px] "
                  onClick={() =>
                    handleVariableInsert(
                      opt.value,
                      addTemplateBodyRef,
                      newTemplate.body,
                    )
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-1 bg-[#0387FF] text-white rounded-[4px]"
              onClick={() => handleSaveTemplate(newTemplate)}
            >
              Create & Assign
            </button>
          </div>
        </div>
      )}
      {deleteTarget?.type === "message" && (
        <ActionPopup
          title="Delete Message"
          confirmMessage="Are you sure you would like to delete this Message? It cannot be undone"
          onClose={() => setDeleteTarget(null)}
          onSave={handleConfirmDeleteTemplate}
          isDelete={true} // ✅ For red styling
        />
      )}
    </div>
  );
};

export default SavedMessages;
