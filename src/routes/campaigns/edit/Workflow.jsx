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

export const Workflow = () => {
  const navigate = useNavigate();
  const { 
    nodes, 
    workflow, 
    editId, 
    setNodes, 
    setWorkflow, 
    editStatus 
  } = useEditContext();

  // Get setWorkflow from campaign store (for edit mode)
  const { setWorkflow: setCampaignWorkflow, workflow: campaignWorkflow } = useCampaignStore();

  const [step, setStep] = useState(0);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [areAllTemplatesAssigned, setAreAllTemplatesAssigned] = useState(false);

  // Check if all template-required nodes have templates assigned
  const checkTemplatesAssigned = (workflowData) => {
    if (!workflowData?.workflow?.nodes) return false;
    
    const templateNodeTypes = ['linkedin_message', 'linkedin_invite', 'email_message'];
    
    const templateNodes = workflowData.workflow.nodes.filter(node => 
      templateNodeTypes.includes(node.type)
    );
    
    if (templateNodes.length === 0) return true; // No template nodes, so technically "all" are assigned
    
    const allAssigned = templateNodes.every(node => 
      node.properties?.template_id || node.properties?.template?.body
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
      workflow: workflowToSave.workflow,
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

  const handleCancelEdit = () => {
    navigate("/campaigns");
  };

  const handleWorkflowSelect = selectedWorkflowData => {
    console.log("=== handleWorkflowSelect ===");
    console.log("Received from SelectWorkflow:", selectedWorkflowData);

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
    console.log("=== handleNextStep ===");
    console.log("Current step:", step);
    console.log("Selected workflow exists:", !!selectedWorkflow);

    if (step === 0) {
      if (!selectedWorkflow) {
        toast.error("Please select a workflow first");
        return;
      }
    }

    if (step === 1) {
      if (!areAllTemplatesAssigned) {
        toast.error("Please assign templates to all message nodes before proceeding");
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
        <WorkflowViewer
          data={{ workflow }}
          onCancel={handleCancelEdit}
          onSave={handleSaveWorkflow} // Use original handleSaveWorkflow
        />
      </div>
    );
  }

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
              onClick={() => handleSaveWorkflowEditMode({ workflow: selectedWorkflow })}
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
            onSave={() => handleSaveWorkflowEditMode({ workflow: selectedWorkflow })}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Show message if no workflow is selected but we're on steps 1 or 2 */}
        {(step === 1 || step === 2) && !selectedWorkflow && (
          <div className="text-center py-8">
            <p className="text-red-500">No workflow selected. Please go back and select a workflow.</p>
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