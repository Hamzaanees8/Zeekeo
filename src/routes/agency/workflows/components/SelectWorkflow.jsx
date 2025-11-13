import { useState, useEffect, useRef } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import toast from "react-hot-toast";
import {
  CopyIcon,
  DeleteIcon,
  PencilIcon,
  StepReview,
} from "../../../../components/Icons.jsx";
import {
  createWorkflow,
  deleteWorkflow,
  fetchGlobalWorkflows,
  fetchWorkflows,
  updateWorkflow,
} from "../../../../services/agency.js";
import { getCurrentUser } from "../../../../utils/user-helpers.jsx";
import ActionPopup from "../../templates/components/ActionPopup.jsx";
import WorkflowEditor from "./WorkflowEditor.jsx";
import WorkflowBuilder from "./WorkflowBuilder.jsx";
const TABS = ["High Impact", "Library", "Agency Workflows"];

// const builtInWorkflows = [
//   { name: "Simple", description: "View, Connect, Message" },
//   {
//     name: "Simple Enhanced",
//     description: "View, Connect, Like Post, Send Message",
//   },
//   {
//     name: "Advanced",
//     description:
//       "View, Connect, Like Post, Send Message. If not connect in 2 weeks send InMail",
//   },
// ];

// const customWorkflows = [
//   { name: "Custom 1", description: "#invite #GDS" },
//   { name: "Custom 2", description: "#invite #GDS" },
// ];

const SelectWorkflow = ({
  onSelect,
  onCreate,
  autoSelectFirst = true,
  initialWorkflow = null,
  onSaveCampaignWorkflow,
}) => {
  const user = getCurrentUser();
  const email = user?.accounts?.email;
  const hasFetched = useRef(false);
  const [customWorkflows, setCustomWorkflows] = useState([]);
  const [builtInWorkflows, setBuiltInWorkflows] = useState([]);

  const [activeTab, setActiveTab] = useState("High Impact");
  const [searchTerm, setSearchTerm] = useState("");
  const [workflow, setWorkflow] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null); // null means not editing
  const [selectedWorkflow, setSelectedWorkflow] = useState({});
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

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadGlobalWorkflows();
    loadCustomWorkflows();
  }, []);

  useEffect(() => {
    if (!autoSelectFirst) return;
    if (activeTab === "Agency Workflows" && customWorkflows.length > 0) {
      setSelectedWorkflow(customWorkflows[0]);
    } else if (activeTab === "High Impact" && builtInWorkflows.length > 0) {
      const popularWorkFlows = builtInWorkflows?.find(
        workflow => workflow.popular && workflow.popular == true,
      );
      setSelectedWorkflow(popularWorkFlows);
    } else if (
      activeTab !== "Agency Workflows" &&
      builtInWorkflows.length > 0
    ) {
      setSelectedWorkflow(builtInWorkflows[0]);
    }
  }, [activeTab, builtInWorkflows, customWorkflows, autoSelectFirst]);

  useEffect(() => {
    if (initialWorkflow) {
      setSelectedWorkflow(initialWorkflow);
    }
  }, [initialWorkflow]);

  const getFilteredWorkflows = () => {
    let flows = [];
    if (activeTab === "High Impact")
      flows = builtInWorkflows?.filter(workflow => workflow.popular == true);
    else if (activeTab === "Agency Workflows") flows = customWorkflows;
    else flows = [...builtInWorkflows, ...customWorkflows];
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

    if (hasEmailStep && !email) {
      toast.error("You must connect your email to run this workflow!");
    }

    setSelectedWorkflow({
      name: wf.name,
      id: wf.workflow_id,
      workflow: wf.workflow,
    });

    if (onSelect) onSelect(wf);
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

        // Set the newly created/updated workflow as selected
        setSelectedWorkflow(workflow);

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
  console.log("selectedWorkflow dfvdfv...", selectedWorkflow);
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
          <div className="flex gap-2">
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
                >
                  <PencilIcon className="w-8 h-8 p-[2px] border border-[#12D7A8] fill-[#12D7A8] cursor-pointer rounded-full" />
                </button>
              )}
              {activeTab === "Agency Workflows" && (
                <button
                  onClick={handleCreateWorkflow}
                  className="px-2 py-1 text-[16px] border border-[#7E7E7E] bg-[#FFFFFF] text-[#7E7E7E] cursor-pointer rounded-[4px] h-[40px]"
                >
                  + Create Workflow
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-6 h-[110vh]">
            <div className="w-[363px]">
              <div className="bg-white rounded-[8px] shadow-md border border-[#7E7E7E] overflow-y-auto h-full custom-scroll1">
                {getFilteredWorkflows().map(wf => (
                  <div
                    key={wf.workflow_id}
                    className="border-b border-[#CCCCCC] py-3"
                  >
                    <div className="flex items-center justify-between px-2">
                      <div
                        onClick={() => handleSelectWorkflow(wf)}
                        className={
                          selectedWorkflow.name == wf.name
                            ? "text-[#0387FF]"
                            : "text-[#6D6D6D]"
                        }
                      >
                        <span className="font-urbanist font-medium text-[16px] cursor-pointer">
                          {wf.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(activeTab === "Agency Workflows" ||
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
                        {(activeTab === "Agency Workflows" ||
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
                <WorkflowBuilder data={selectedWorkflow} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectWorkflow;
