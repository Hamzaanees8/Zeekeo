import toast from "react-hot-toast";
import WorkflowEditor from "../../../components/workflow/WorkflowEditor";
import { useEditContext } from "./Context/EditContext";
import { updateCampaign } from "../../../services/campaigns";
import { useNavigate } from "react-router-dom";
import WorkflowViewer from "../../../components/workflow/WorkflowViewer";

export const Workflow = () => {
  const navigate = useNavigate();
  const { nodes, workflow, editId, setNodes, setWorkflow } = useEditContext();

  console.log("campaign nodes..", nodes);
  const handleCancelEdit = () => {
    navigate("/campaigns");
  };
  const handleSaveWorkflow = async (data, workflowId) => {

    setNodes(data.workflow);
    setWorkflow(data.workflow);
    const payload = {
      workflow: data.workflow,
    };
    try {
      await updateCampaign(editId, payload);
      toast.success("Workflow updated successfully");
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to update Workflow:", error);
    }
  };

  return (
    <div className="pt-[90px]">
      <WorkflowViewer
        data={{workflow}}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};
