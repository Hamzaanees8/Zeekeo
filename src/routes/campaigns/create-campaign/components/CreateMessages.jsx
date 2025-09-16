import React, { useState, useEffect } from "react";
import WorkflowBuilder from "../../../../components/workflow/WorkflowBuilder";
import {
  PencilIcon,
  StepReview,
  StepMessages,
  ClockIcon,
  WebsiteIcon,
  InstaIcon,
  FacebookIcon,
  TwitterIcon,
  PlusIcon,
  PlusIcon2,
} from "../../../../components/Icons";
import SavedMessages from "./SavedMessages";
import Workflow from "../../../../components/workflow/Workflow";
import { div } from "framer-motion/client";
import toast from "react-hot-toast";
import { templateNodeConfig } from "../../../../utils/campaign-helper";
import { variableOptions } from "../../../../utils/template-helpers";
import useCampaignStore from "../../../stores/useCampaignStore";
import { rebuildFromWorkflow } from "../../../../utils/workflow-helpers";

const CreateMessages = ({
  selectedActions,
  onAddAction,
  isEditing,
  setIsEditing,
}) => {
  const { workflow, setWorkflow } = useCampaignStore();

  const [selectedWorkflowNode, setSelectedWorkflowNode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const nodeType = selectedWorkflowNode?.data?.type;
  const isTemplateRequiredNode = templateNodeConfig[nodeType] !== undefined;

  const hasTemplate =
    selectedWorkflowNode?.data?.template &&
    Object.keys(selectedWorkflowNode?.data?.template).length > 0;

  const nodeBgColor =
    isTemplateRequiredNode && !hasTemplate
      ? "#6B7280"
      : selectedWorkflowNode?.data?.color;

  useEffect(() => {
    if (workflow?.workflow?.nodes?.length > 0 && !selectedWorkflowNode) {
      const { nodes } = rebuildFromWorkflow(workflow.workflow);
      // Find the first node that requires a template
      const firstTemplateNode = nodes.find(
        node => templateNodeConfig[node.data?.type] !== undefined,
      );

      if (firstTemplateNode) {
        setSelectedWorkflowNode(firstTemplateNode);
      }
    }
  }, [workflow, selectedWorkflowNode]);

  useEffect(() => {
    setSelectedTemplate(
      selectedWorkflowNode?.data?.template
        ? selectedWorkflowNode?.data?.template
        : null,
    );
  }, [selectedWorkflowNode]);

  const handleAssignTemplateToNode = template => {
    // console.log('current workflow', workflow);
    // console.log("assigning template", template);

    const minimalTemplate = {
      template_id: template.template_id,
      name: template.name,
      ...(template?.subject ? { subject: template?.subject } : {}),
      ...(template.body ? { body: template.body } : {}),
    };

    const updatedNodes = workflow.workflow.nodes.map(node => {
      if (node.id === selectedWorkflowNode.id) {
        return {
          ...node,
          properties: {
            ...node.properties,
            template: minimalTemplate,
          },
        };
      }
      return node;
    });

    //  console.log('updated nodes', updatedNodes)

    const updatedNode = updatedNodes.find(
      node => node.id === selectedWorkflowNode.id,
    );

    console.log("selected  node", selectedWorkflowNode);
    console.log("filtered node", updatedNode);

    setSelectedWorkflowNode({
      ...selectedWorkflowNode,
      data: {
        ...selectedWorkflowNode.data,
        template: updatedNode?.properties?.template,
      },
    });

    setWorkflow({
      ...workflow,
      workflow: {
        ...workflow.workflow,
        nodes: [...updatedNodes],
      },
    });

    toast.success("Template assigned successfully");
  };

  console.log("assigned workflow with node ", selectedWorkflowNode);

  const selectedTemplateId = selectedWorkflowNode?.data?.template?.template_id;

  return (
    <div className="flex gap-6">
      {/* Left Panel */}
      <div className="w-[380px]">
        {/* Top Tabs */}
        <div className="flex flex-wrap gap-2 mb-3 ">
          {(!selectedWorkflowNode || !isTemplateRequiredNode) && (
            <div className="text-[16px] text-[#1E1D1D] font-normal ">
              <div>
                Select an action node (Send Message, Send Email, Invite). Once
                selected, you can assign a message or add a template to it.
              </div>
            </div>
          )}

          {selectedWorkflowNode && isTemplateRequiredNode && (
            <div className="bg-[#EFEFEF] w-[280px] h-[80px] flex items-center ">
              {/* Left Icon */}
              <div
                className="flex w-[50px] items-center justify-center h-full  rounded-[4px]"
                style={{ backgroundColor: nodeBgColor }}
              >
                {selectedWorkflowNode.data.icon && (
                  <selectedWorkflowNode.data.icon className="w-7 h-7 text-white" />
                )}
              </div>

              {/* Main content */}
              <div className="flex flex-col items-start gap-y-[5px] px-[10px] h-full">
                <div className="flex items-center gap-2 font-normal text-[18px] text-[#6D6D6D]">
                  {selectedWorkflowNode.data.title}
                </div>
                <div className="flex items-center gap-1 text-[16px] font-normal">
                  <ClockIcon className="w-4 h-4 text-[#6D6D6D]" />
                  <span className="text-[#454545] font-medium">
                    {selectedWorkflowNode.data.subtitle}
                  </span>
                  {selectedWorkflowNode.data?.delay?.days === 0 &&
                  selectedWorkflowNode.data?.delay?.hours === 0 ? (
                    <span className="text-[#6D6D6D]">: Immediately</span>
                  ) : (
                    <span className="text-[#6D6D6D]">
                      :{" "}
                      {selectedWorkflowNode.data?.delay?.days > 0 &&
                        `${selectedWorkflowNode.data.delay.days} day${
                          selectedWorkflowNode.data.delay.days > 1 ? "s" : ""
                        }`}
                      {selectedWorkflowNode.data?.delay?.days > 0 &&
                        selectedWorkflowNode.data?.delay?.hours > 0 &&
                        ", "}
                      {selectedWorkflowNode.data?.delay?.hours > 0 &&
                        `${selectedWorkflowNode.data.delay.hours} hour${
                          selectedWorkflowNode.data.delay.hours > 1 ? "s" : ""
                        }`}
                    </span>
                  )}
                </div>
                {selectedWorkflowNode?.data?.template?.template_id && (
                  <div className="flex items-center gap-2 text-[16px] font-normal">
                    <PlusIcon className="w-4 h-4 border border-[#6D6D6D] fill-[#6D6D6D]" />
                    <span className="text-[#6D6D6D] font-normal">
                      {selectedWorkflowNode?.data?.template?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedWorkflowNode && isTemplateRequiredNode && (
            <SavedMessages
              selectedTemplateId={selectedTemplateId}
              type={selectedWorkflowNode?.data?.type}
              onAssignTemplate={handleAssignTemplateToNode}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Workflow Builder (no changes) */}
      <div className="flex-1 min-h-[400px] border border-[#DADADA] bg-[#F4F4F4] rounded-md">
        <div className="flex items-top justify-center text-gray-500 h-full">
          <WorkflowBuilder
            data={workflow}
            onNodeSelect={setSelectedWorkflowNode}
            activeNodeId={selectedWorkflowNode?.id || null}
            highlightActive={true} 
          />
        </div>
      </div>
    </div>
  );
};

export default CreateMessages;
