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


  return (
    <div className="pt-[40px]">
      <WorkflowViewer data={{ workflow }} onCancel={handleCancelEdit} onSave={handleSaveWorkflow} />
    </div>
  );
};
