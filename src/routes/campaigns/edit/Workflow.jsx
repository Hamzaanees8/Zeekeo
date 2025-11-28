import toast from "react-hot-toast";
import WorkflowEditor from "../../../components/workflow/WorkflowEditor";
import { useEditContext } from "./Context/EditContext";
import { updateCampaign } from "../../../services/campaigns";
import { useNavigate } from "react-router-dom";
import WorkflowViewer from "../../../components/workflow/WorkflowViewer";
import { useState, useEffect } from "react";
import SelectWorkflow from "../../../components/workflow/SelectWorkflow";
import CreateMessages from "../create-campaign/components/CreateMessages";
import CreateReview from "../create-campaign/components/CreateReview";
import useCampaignStore from "../../stores/useCampaignStore";
import { createWorkflow } from "../../../services/workflows";
import SaveWorkflowModal from "../../../components/workflow/SaveWorkflowModal";

export const Workflow = () => {
  const navigate = useNavigate();
  const {
    nodes,
    workflow,
    editId,
    setNodes,
    setWorkflow,
    editStatus,
    campaignName,
  } = useEditContext();

  // Get setWorkflow from campaign store (for edit mode)
  const { setWorkflow: setCampaignWorkflow, workflow: campaignWorkflow } =
    useCampaignStore();

  const [step, setStep] = useState(0);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [areAllTemplatesAssigned, setAreAllTemplatesAssigned] =
    useState(false);
  // State for the new modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create campaign workflow object from nodes - do this once
  useEffect(() => {
    if (nodes && Object.keys(nodes).length > 0) {
      const campaignWorkflow = {
        name: `${campaignName} Campaign Workflow`,
        workflow_id: `campaign-${editId || Date.now()}`,
        workflow: nodes, // This is the key - use nodes directly
        isCampaignWorkflow: true,
      };

      setSelectedWorkflow(campaignWorkflow);
      setCampaignWorkflow(campaignWorkflow);
    }
  }, [nodes, editId, setCampaignWorkflow]);

  // Check if all template-required nodes have templates assigned
  const checkTemplatesAssigned = workflowData => {
    if (!workflowData?.workflow?.nodes) return false;

    const templateNodeTypes = ["linkedin_message", "email_message"];

    const templateNodes = workflowData.workflow.nodes.filter(node =>
      templateNodeTypes.includes(node.type),
    );

    if (templateNodes.length === 0) return true;

    const allAssigned = templateNodes.every(
      node => node.properties?.template_id || node.properties?.template?.body,
    );

    return allAssigned;
  };

  // Check templates when campaign workflow changes
  useEffect(() => {
    if (campaignWorkflow) {
      const allAssigned = checkTemplatesAssigned(campaignWorkflow);
      setAreAllTemplatesAssigned(allAssigned);
    }
  }, [campaignWorkflow]);

  // Original handleSaveWorkflow for non-edit mode
  const handleSaveWorkflow = async (data, workflowId) => {
    setNodes(data.workflow);
    setWorkflow(data.workflow);
    const payload = {
      workflow: data.workflow,
    };

    console.log("payload data", data);
    try {
      await updateCampaign(editId, payload);
      toast.success("Workflow updated successfully");
    } catch (err) {
      console.log("error", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update Workflow:", err);
      }
    }
  };

  // New handleSaveWorkflow for edit mode
  const handleSaveWorkflowEditMode = async (data, workflowId) => {
    console.log("Saving workflow:", data);
    const workflowToSave = selectedWorkflow || workflow;
    const payload = {
      workflow: workflowToSave.workflow, // This will be consistent now
    };

    console.log("Final payload:", payload);
    try {
      await updateCampaign(editId, payload);
      toast.success("Workflow updated successfully");
    } catch (err) {
      console.log("error", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update Workflow:", err);
      }
    }
  };

  // **New API call handler for "Save as Workflow"**
  const handleSaveAsWorkflow = async name => {
    // The workflow data to be saved is the current selectedWorkflow's structure
    const workflowToSave = selectedWorkflow?.workflow;

    if (!workflowToSave) {
      toast.error("No workflow data available to save.");
      setIsModalOpen(false);
      return;
    }

    //  console.log("Saving as new workflow:", name, { workflow: workflowToSave });

    try {
      await createWorkflow({ name, workflow: workflowToSave });
      toast.success(`Workflow "${name}" created successfully!`);
      setIsModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save workflow.";
      if (err?.response?.status !== 401) {
        toast.error(msg);
      }
      setIsModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    navigate("/campaigns");
  };

  const handleWorkflowSelect = selectedWorkflowData => {
    if (!selectedWorkflowData) {
      console.error("No workflow data received!");
      return;
    }
    setSelectedWorkflow(selectedWorkflowData);
    setWorkflow(selectedWorkflowData);
    setCampaignWorkflow(selectedWorkflowData);

    console.log("Workflow set successfully in all stores");
  };

  const handleNextStep = () => {
    if (step === 0) {
      if (!selectedWorkflow) {
        toast.error("Please select a workflow first");
        return;
      }
    }

    if (step === 1) {
      if (!areAllTemplatesAssigned) {
        toast.error(
          "Please assign templates to all message nodes before proceeding",
        );
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  // If editStatus is false, show original WorkflowViewer (read-only mode)
  if (!editStatus) {
    return (
      <div className="pt-[40px]">
        {/* Container for the button and viewer */}
        <div className="px-1 mb-4 flex justify-end">
          <button
            className="px-6 py-2 text-[16px] cursor-pointer rounded-[6px] border-[#0387FF] bg-[#0387FF] text-white"
            onClick={() => setIsModalOpen(true)} // Open the modal
          >
            Save as Workflow
          </button>
        </div>

        {/* Workflow Viewer */}
        <WorkflowViewer
          data={{ workflow }}
          onCancel={handleCancelEdit}
          onSave={handleSaveWorkflow}
        />

        {/* **Modal Component** - Must be rendered regardless of the current view if it floats above */}
        <SaveWorkflowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAsWorkflow}
        />
      </div>
    );
  }
  const handleSaveCampaignWorkflow = async data => {
   // console.log("handleSaveCampaignWorkflow data...", data);
    const updatedWorkflow = {
      ...selectedWorkflow,
      workflow: data.workflow,
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflow(updatedWorkflow);
    setCampaignWorkflow(updatedWorkflow);

    const payload = {
      workflow: updatedWorkflow.workflow, // This will be consistent now
    };

   // console.log("Final payload:", payload);
    try {
      await updateCampaign(editId, payload);
      toast.success("Workflow updated successfully");
    } catch (err) {
      console.log("error", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update Workflow:", err);
      }
    }
  };

  console.log("selectedWorkflow...", selectedWorkflow);
  // If editStatus is true, show the workflow editing flow with steps
  return (
    <div className="pt-[40px]">
      {/* Step Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center ${
              step >= 0 ? "text-[#0387FF]" : "text-[#7E7E7E]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                step >= 0
                  ? "bg-[#0387FF] text-white border-[#0387FF]"
                  : "bg-white border-[#7E7E7E] text-[#7E7E7E]"
              }`}
            >
              1
            </div>
            <span className="ml-2">Select Workflow</span>
          </div>

          <div className="w-12 h-0.5 bg-[#7E7E7E]"></div>

          <div
            className={`flex items-center ${
              step >= 1 ? "text-[#0387FF]" : "text-[#7E7E7E]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                step >= 1
                  ? "bg-[#0387FF] text-white border-[#0387FF]"
                  : "bg-white border-[#7E7E7E] text-[#7E7E7E]"
              }`}
            >
              2
            </div>
            <span className="ml-2">Create Messages</span>
          </div>

          <div className="w-12 h-0.5 bg-[#7E7E7E]"></div>

          <div
            className={`flex items-center ${
              step >= 2 ? "text-[#0387FF]" : "text-[#7E7E7E]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                step >= 2
                  ? "bg-[#0387FF] text-white border-[#0387FF]"
                  : "bg-white border-[#7E7E7E] text-[#7E7E7E]"
              }`}
            >
              3
            </div>
            <span className="ml-2">Review</span>
          </div>
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="flex justify-between mb-6 px-6">
        {/* Back Button - Always visible and enabled except step 0 */}
        <button
          className={`px-6 py-2 text-[16px] rounded-[6px] ${
            step === 0 ? "invisible" : "bg-[#7E7E7E] text-white cursor-pointer"
          }`}
          onClick={handleBackStep}
        >
          Back
        </button>

        {/* Next/Save Buttons - Always visible and enabled, validation happens in click handler */}
        {step === 0 && (
          <div className="ml-auto">
            <button
              className="px-6 py-2 text-[16px] bg-[#0387FF] text-white cursor-pointer rounded-[6px]"
              onClick={handleNextStep}
            >
              Next
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="ml-auto">
            <button
              className="px-6 py-2 text-[16px] bg-[#0387FF] text-white cursor-pointer rounded-[6px]"
              onClick={handleNextStep}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="ml-auto">
            <button
              className="px-6 py-2 text-[16px] bg-[#0387FF] text-white cursor-pointer rounded-[6px]"
              onClick={() =>
                handleSaveWorkflowEditMode({ workflow: selectedWorkflow })
              }
            >
              Save Workflow
            </button>
          </div>
        )}
      </div>
      {/* Step Content */}
      <div className="px-6">
        {step === 0 && (
          <SelectWorkflow
            onSelect={handleWorkflowSelect}
            onCreate={handleWorkflowSelect}
            autoSelectFirst={false}
            initialWorkflow={selectedWorkflow}
            onSaveCampaignWorkflow={handleSaveCampaignWorkflow}
          />
        )}

        {step === 1 && selectedWorkflow && (
          <CreateMessages
            selectedActions={[]}
            onAddAction={() => {}}
            isEditing={true}
            setIsEditing={() => {}}
          />
        )}

        {step === 2 && selectedWorkflow && (
          <CreateReview
            onSave={() =>
              handleSaveWorkflowEditMode({ workflow: selectedWorkflow })
            }
            onCancel={handleCancelEdit}
          />
        )}

        {/* Show message if no workflow is selected but we're on steps 1 or 2 */}
        {(step === 1 || step === 2) && !selectedWorkflow && (
          <div className="text-center py-8">
            <p className="text-red-500">
              No workflow selected. Please go back and select a workflow.
            </p>
            <button
              className="px-6 py-2 text-[16px] bg-[#7E7E7E] text-white cursor-pointer rounded-[6px] mt-4"
              onClick={() => setStep(0)}
            >
              Back to Select Workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
