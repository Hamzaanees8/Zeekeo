import React, { useCallback } from "react";
import WorkflowEditor from "../../../../components/workflow/WorkflowEditor";
import toast from "react-hot-toast";
import useCampaignStore from "../../../stores/useCampaignStore";

const CreateMessages = ({
  selectedActions,
  onAddAction,
  isEditing,
  setIsEditing,
}) => {
  const { workflow, setWorkflow, settings } = useCampaignStore();

  // Sync workflow changes when user assigns templates
  const handleWorkflowChange = useCallback(
    newWorkflowData => {
      console.log("handleWorkflowChange: received", newWorkflowData);

      if (!newWorkflowData?.workflow?.nodes) {
        console.log("handleWorkflowChange: no nodes found, returning early");
        return;
      }

      const workflowNodes = newWorkflowData.workflow.nodes;

      // Get current workflow state directly from store to avoid stale closures
      const currentWorkflow = useCampaignStore.getState().workflow;

      const newWorkflow = {
        ...currentWorkflow,
        workflow: {
          ...currentWorkflow?.workflow,
          nodes: workflowNodes,
        },
      };

      console.log("handleWorkflowChange: setting workflow", newWorkflow);
      setWorkflow(newWorkflow);

      // Verify the store was updated
      setTimeout(() => {
        const updatedWorkflow = useCampaignStore.getState().workflow;
        console.log("handleWorkflowChange: store after update", updatedWorkflow);
      }, 0);
    },
    [setWorkflow],
  );

  // For explicit save (shows toast)
  const handleSaveWorkflow = newWorkflowData => {
    console.log("Workflow data received from editor:", newWorkflowData);

    const workflowOutput = newWorkflowData.workflow.nodes;

    setWorkflow({
      ...workflow,
      workflow: {
        ...workflow.workflow,
        nodes: workflowOutput,
      },
    });

    toast.success("Workflow updated successfully!");
  };

  const handleCancelWorkflowEdit = () => {
    toast("Workflow editing canceled.");
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="w-full min-h-[500px] border border-[#DADADA] bg-[#F4F4F4] rounded-md">
        <div className="flex items-top justify-center text-gray-500 h-full">
          <div className="p-3 w-full">
            <WorkflowEditor
              type="edit"
              data={workflow}
              onCancel={handleCancelWorkflowEdit}
              onSave={handleSaveWorkflow}
              onChange={handleWorkflowChange}
              settings={settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMessages;
