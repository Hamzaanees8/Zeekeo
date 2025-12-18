import React, { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  PencilIcon,
  CopyIcon,
  DeleteIcon,
  StepReview,
} from "../Icons.jsx";
import WorkflowEditor from "./WorkflowEditor.jsx";
import WorkflowBuilder from "./WorkflowBuilder.jsx";
import { ReactFlowProvider } from "@xyflow/react";
import {
  createWorkflow,
  fetchWorkflows,
  updateWorkflow,
  deleteWorkflow,
  fetchGlobalWorkflows,
  fetchAgencyWorkflows,
} from "../../services/workflows.js";
import toast from "react-hot-toast";
import ActionPopup from "../../routes/campaigns/templates/components/ActionPopup.jsx";
import { getCurrentUser } from "../../utils/user-helpers.jsx";

const BASE_TABS = ["High Impact", "Library", "My Workflows"];

const SelectWorkflow = ({
  onSelect,
  onCreate,
  autoSelectFirst = true,
  initialWorkflow = null,
  onSaveCampaignWorkflow,
  onProceed,
}) => {
  const user = getCurrentUser();
  const email = user?.accounts?.email;
  // Email (Nylas) status check - only "connected" is valid
  const isEmailConnected = email?.status === "connected";
  const hasFetched = useRef(false);
  const [customWorkflows, setCustomWorkflows] = useState([]);
  const [builtInWorkflows, setBuiltInWorkflows] = useState([]);
  const [AgencyWorkflows, setAgencyWorkflows] = useState([]);

  const TABS = user?.agency_username
    ? [...BASE_TABS, "Agency Workflows"]
    : BASE_TABS;

  const [activeTab, setActiveTab] = useState("High Impact");
  const [searchTerm, setSearchTerm] = useState("");
  const [workflow, setWorkflow] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null); // null means not editing
  const [hoveredWorkflow, setHoveredWorkflow] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);

  const loadCustomWorkflows = async () => {
    try {
      const workflows = await fetchWorkflows();
      setCustomWorkflows(workflows);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to fetch custom workflows.");
      }
    }
  };

  const loadGlobalWorkflows = async () => {
    try {
      const workflows = await fetchGlobalWorkflows();
      setBuiltInWorkflows(workflows);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to fetch global workflows.");
      }
    }
  };

  const loadAgencyWorkflows = async () => {
    if (!user?.agency_username) return;
    try {
      const workflows = await fetchAgencyWorkflows();
      setAgencyWorkflows(workflows);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to fetch agency workflows.");
      }
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadGlobalWorkflows();
    loadCustomWorkflows();
    loadAgencyWorkflows();
  }, []);

  useEffect(() => {
    if (!autoSelectFirst) return;

    let workflowToSelect = null;

    if (activeTab === "My Workflows" && customWorkflows.length > 0) {
      workflowToSelect = customWorkflows[0];
    } else if (activeTab === "High Impact" && builtInWorkflows.length > 0) {
      workflowToSelect = builtInWorkflows?.find(
        workflow => workflow.popular && workflow.popular == true,
      );
    } else if (
      activeTab === "Agency Workflows" &&
      AgencyWorkflows.length > 0
    ) {
      workflowToSelect = AgencyWorkflows[0];
    } else if (
      activeTab !== "My Workflows" &&
      activeTab !== "Agency Workflows" &&
      builtInWorkflows.length > 0
    ) {
      workflowToSelect = builtInWorkflows[0];
    }

    if (workflowToSelect) {
      setHoveredWorkflow(workflowToSelect);
      if (onSelect) onSelect(workflowToSelect);
    }
  }, [
    activeTab,
    builtInWorkflows,
    customWorkflows,
    AgencyWorkflows,
    autoSelectFirst,
  ]);

  useEffect(() => {
    if (initialWorkflow) {
      setHoveredWorkflow(initialWorkflow);
    }
  }, [initialWorkflow]);

  const getFilteredWorkflows = () => {
    let flows = [];

    if (activeTab === "High Impact") {
      flows = builtInWorkflows?.filter(workflow => workflow.popular == true);
    } else if (activeTab === "My Workflows") {
      flows = customWorkflows;
    } else if (activeTab === "Agency Workflows") {
      flows = AgencyWorkflows;
    } else {
      flows = [...builtInWorkflows, ...customWorkflows];
    }

    return flows.filter(flow =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const confirmDeleteWorkflow = workflowId => {
    setWorkflowToDelete(workflowId);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteWorkflow(workflowToDelete);
      toast.success("Workflow deleted successfully");

      const updatedWorkflows = await fetchWorkflows();
      setCustomWorkflows(updatedWorkflows);
    } catch (err) {
      console.error("Failed to delete workflow:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to delete workflow");
      }
    } finally {
      setShowDeletePopup(false);
      setWorkflowToDelete(null);
    }
  };

  const handleEditWorkflow = wf => {
    setEditingWorkflow(wf);
    setIsEditing(true);
  };

  const handleCopyWorkflow = wf => {
    setEditingWorkflow({ workflow: wf.workflow });
    setIsEditing(true);
  };

  const handleCreateWorkflow = () => {
    if (typeof onCreate === "function") {
      onCreate({});
    }
    setEditingWorkflow({ name: "", description: "" });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingWorkflow(null);
    setIsEditing(false);
  };

  const handleSelectWorkflow = wf => {
    const hasEmailStep = wf?.workflow?.nodes?.some(
      node => node.type === "email_message",
    );

    if (hasEmailStep && !isEmailConnected) {
      toast.error("You must connect your email to run this workflow!");
      return; // Don't proceed if email is required but not connected
    }

    if (onSelect) onSelect(wf);
    if (onProceed) onProceed(wf);
  };

  const handleSaveWorkflow = async (data, workflowId) => {
    let workflow = {};
    try {
      if (editingWorkflow?.isCampaignWorkflow) {
        if (onSaveCampaignWorkflow) {
          await onSaveCampaignWorkflow(data);
        }
      } else {
        if (workflowId) {
          workflow = await updateWorkflow(data, workflowId);
          toast.success("Workflow updated successfully");
        } else {
          workflow = await createWorkflow(data);
          toast.success("Workflow created successfully");
        }

        // Refresh the workflows list
        await loadCustomWorkflows();
        setWorkflow(workflow);

        // Set the newly created/updated workflow for preview
        setHoveredWorkflow(workflow);

        // If there's an onSelect callback, call it with the new workflow
        if (onSelect) {
          onSelect(workflow);
        }
      }
      setEditingWorkflow(null);
      setIsEditing(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save workflow.";
      if (err?.response?.status !== 401) {
        toast.error(msg);
      }
    }
  };
  return (
    <div className="">
      {showDeletePopup && (
        <ActionPopup
          title="Delete Workflow"
          confirmMessage="Are you sure you want to delete this workflow?"
          onClose={() => setShowDeletePopup(false)}
          onSave={handleConfirmDelete}
          isDelete
        />
      )}
      {/* Workflow List and Right Panel */}
      {editingWorkflow ? (
        <ReactFlowProvider>
          <WorkflowEditor
            data={editingWorkflow}
            onCancel={handleCancelEdit}
            onSave={handleSaveWorkflow}
          />
        </ReactFlowProvider>
      ) : (
        <div className="flex flex-col gap-y-6">
          <div className="grid grid-cols-2 w-[363px] gap-2">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`px-2 py-1 text-[16px] border border-[#0387FF] transition-all duration-150 cursor-pointer rounded-[4px]  ${
                  activeTab === tab
                    ? "bg-[#0387FF] text-white"
                    : "bg-[#FFFFFF] text-[#0387FF] "
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border border-[#7E7E7E] text-sm pl-8 pr-2 py-1 bg-white focus:outline-none rounded-[4px] w-[363px] h-[40px]"
              />
            </div>
            <div className="flex items-center space-x-4 justify-end">
              {initialWorkflow && initialWorkflow.isCampaignWorkflow && (
                <button
                  title="Edit"
                  onClick={() => {
                    setEditingWorkflow(initialWorkflow);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 bg-[#0387FF] text-white px-3 py-1 text-[14px] rounded-[4px] cursor-pointer"
                >
                  <PencilIcon className="w-4 h-4 fill-white" />
                  Edit Workflow
                </button>
              )}
              {activeTab === "My Workflows" && (
                <button
                  onClick={handleCreateWorkflow}
                  className="px-2 py-1 text-[16px] border border-[#7E7E7E] bg-[#FFFFFF] text-[#7E7E7E] cursor-pointer rounded-[4px] h-[40px]"
                >
                  + Create Workflow
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-6 h-[calc(100vh-480px)]">
            <div className="w-[363px]">
              <p className="text-[14px] text-[#7E7E7E] font-medium mb-3 ml-1">
                Click on a workflow to proceed
              </p>
              <div className="bg-white rounded-[8px] shadow-md border border-[#7E7E7E] overflow-y-auto h-[calc(100%-35px)] custom-scroll1">
                {getFilteredWorkflows().map(wf => (
                  <div
                    key={wf.workflow_id}
                    className={`border-b border-[#CCCCCC] py-3 hover:bg-[#E8F4FF] transition-colors duration-150 cursor-pointer ${
                      hoveredWorkflow?.workflow_id === wf.workflow_id ? "bg-[#E8F4FF]" : ""
                    }`}
                    onClick={() => handleSelectWorkflow(wf)}
                    onMouseEnter={() => setHoveredWorkflow(wf)}
                  >
                    <div className="flex items-center justify-between px-2">
                      <div className="text-[#6D6D6D]">
                        <span className="font-urbanist font-medium text-[16px]">
                          {wf.name}
                        </span>
                      </div>
                      <div
                        className="flex items-center space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        {(activeTab === "My Workflows" ||
                          wf.user_email == user?.email) && (
                          <button
                            title="Edit"
                            onClick={() => handleEditWorkflow(wf)}
                          >
                            <PencilIcon className="w-5 h-5 p-[2px] border border-[#12D7A8] fill-[#12D7A8] cursor-pointer rounded-full" />
                          </button>
                        )}
                        <button
                          title="Copy"
                          onClick={() => handleCopyWorkflow(wf)}
                        >
                          <CopyIcon className="w-5 h-5 p-[2px] border border-[#00B4D8] fill-[#00B4D8] cursor-pointer rounded-full" />
                        </button>
                        {(activeTab === "My Workflows" ||
                          wf.user_email == user?.email) && (
                          <button
                            title="Delete"
                            onClick={() =>
                              confirmDeleteWorkflow(wf.workflow_id)
                            }
                          >
                            <DeleteIcon className="w-5 h-5 p-[2px] border border-[#D80039] cursor-pointer rounded-full" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[16px] text-[#6D6D6D]">
                      {wf.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Builder or Editor */}
            <div className="flex-1 min-h-[400px]  bg-[#DEDEDE] rounded-md">
              <div className="flex items-center justify-center text-gray-500 h-full">
                <WorkflowBuilder data={hoveredWorkflow} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectWorkflow;
