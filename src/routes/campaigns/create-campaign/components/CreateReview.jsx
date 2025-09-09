import React, { useEffect, useState } from "react";
import {
  ClockIcon,
  PlusIcon,
  StepMessages,
} from "../../../../components/Icons";
import WorkflowBuilder from "../../../../components/workflow/WorkflowBuilder";
import Workflow from "../../../../components/workflow/Workflow";
import WorkflowReview, {
  initialNodes,
} from "../../../../components/workflow/WorkFlowReview";
import { useNodesState } from "@xyflow/react";
import { isValidActionType } from "../../../../utils/workflow-helpers";
import { templateNodeConfig } from "../../../../utils/campaign-helper";
import useCampaignStore from "../../../stores/useCampaignStore";

const CreateReview = () => {
  const { workflow, setWorkflow } = useCampaignStore();

  const [delay, setDelay] = useState({ hours: 0, days: 0 });
  const [maxPerDay, setMaxPerDay] = useState(50);
  const [stopOnReply, setStopOnReply] = useState(true);
  const [nodeTemplate, setNodeTemplate] = useState(false);

  const [selectedWorkflowNode, setSelectedWorkflowNode] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const isActionNode = isValidActionType(selectedWorkflowNode?.data?.type);

  const nodeType = selectedWorkflowNode?.data?.type;
  const isTemplateRequiredNode = templateNodeConfig[nodeType] !== undefined;

  useEffect(() => {
    if (selectedWorkflowNode) {
      const data = selectedWorkflowNode.data;
      //console.log('selected dta...', data)
      setDelay(data.delay || { days: 0, hours: 0 });
      setMaxPerDay(data.limit ?? 50);
      setStopOnReply(data.stop_on_reply ?? false);
      setNodeTemplate(data?.template ?? null);
    }
  }, [selectedWorkflowNode]);

  const updateNodeData = updates => {
    setSelectedWorkflowNode(prev => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        data: {
          ...prev.data,
          ...updates,
        },
      };

      // Update node in canvas
      setNodes(nodes =>
        nodes.map(n =>
          n.id === updated.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  ...updates,
                },
              }
            : n,
        ),
      );

      return updated;
    });
  };

  const handleUpdateNodeProperties = updates => {
    const updatedNodes = workflow.workflow.nodes.map(node => {
      if (node.id === selectedWorkflowNode.id) {
        return {
          ...node,
          properties: {
            ...node.properties,
            ...updates,
          },
        };
      }
      return node;
    });

    setWorkflow({
      ...workflow,
      workflow: {
        ...workflow.workflow,
        nodes: [...updatedNodes],
      },
    });
  };

  return (
    <div className="flex gap-6">
      <div className="flex flex-col border border-[#DADADA] w-[380px] font-urbanist gap-4">
        {!selectedWorkflowNode && (
          <div className="bg-[#EFEFEF] w-full h-[80px] flex items-center ">
            <div>Select a node first</div>
          </div>
        )}
        {selectedWorkflowNode && (
          <div className="bg-[#EFEFEF] w-full h-[80px] flex items-center ">
            {/* Left Icon */}
            <div
              className="flex w-[50px] items-center justify-center h-full rounded-[4px]"
              style={{ backgroundColor: selectedWorkflowNode.data.color }}
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
              {selectedWorkflowNode.data?.template?.name && (
                <div className="flex items-center gap-2 text-[16px] font-normal">
                  <PlusIcon className="w-4 h-4 border border-[#6D6D6D] fill-[#6D6D6D]" />
                  <span className="text-[#6D6D6D] font-normal">
                    {selectedWorkflowNode.data?.template?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Properties Box */}
        {selectedWorkflowNode && (
          <div className="bg-white px-3 py-4 text-sm space-y-5 border border-[#7E7E7E] review-properties rounded-[8px] shadow-md">
            <div className="text-[#6D6D6D] font-medium">
              Properties: {selectedWorkflowNode?.data?.title}
            </div>

            {/* Delay */}
            <div>
              <div className="text-[#6D6D6D] mb-1">Delay</div>
              <div className="flex gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-[#6D6D6D]">Days</label>
                  <input
                    type="number"
                    min={0}
                    className="w-16 border border-[#C7C7C7] p-1 text-center"
                    value={delay.days === null ? "" : delay.days}
                    onChange={e => {
                      const raw = e.target.value;

                      // Allow clearing the input
                      if (raw === "") {
                        const newDelay = { ...delay, days: null };
                        setDelay(newDelay);
                        handleUpdateNodeProperties({ delay: newDelay });
                        return;
                      }

                      const value = Number(raw);
                      if (!isNaN(value) && value >= 0) {
                        const newDelay = { ...delay, days: value };
                        setDelay(newDelay);
                        handleUpdateNodeProperties({ delay: newDelay });
                        return;
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-[#6D6D6D]">Hours</label>
                  <input
                    type="number"
                    className="w-16 border border-[#C7C7C7] p-1 text-center"
                    value={delay.hours === null ? "" : delay.hours}
                    min={0}
                    onChange={e => {
                      const raw = e.target.value;

                      // Allow empty input
                      if (raw === "") {
                        const newDelay = { ...delay, hours: null };
                        setDelay(newDelay);
                        handleUpdateNodeProperties({ delay: newDelay });
                        return;
                      }

                      const value = Number(raw);
                      if (!isNaN(value) && value >= 0) {
                        const newDelay = { ...delay, hours: value };
                        setDelay(newDelay);
                        handleUpdateNodeProperties({ delay: newDelay });
                        return;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {isActionNode && (
              <>
                <div>
                  <div className="text-[#6D6D6D] mb-1">
                    Max/Day <span className="text-xs">(Recommended 50)</span>
                    <span className="text-right float-right text-[#0387FF] font-medium">
                      {maxPerDay}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={maxPerDay}
                    onChange={e => {
                      const value = Number(e.target.value);
                      setMaxPerDay(value);
                      handleUpdateNodeProperties({ limit: value });
                      return;
                    }}
                    className="w-full appearance-none h-2 bg-[#E0E0E0] rounded relative slider-thumb-only "
                  />

                  {/* Scale Marks */}
                  <div className="flex justify-between mt-1 px-[2px]">
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                      (val, idx) => {
                        const isBold = val === 0 || val === 50 || val === 100;
                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center"
                            style={{ width: "1px" }}
                          >
                            <div
                              className="bg-[#6D6D6D]"
                              style={{
                                height: isBold ? "14px" : "8px",
                                width: "1px",
                                marginBottom: "2px",
                              }}
                            />
                            {isBold && (
                              <span className="text-[10px] text-[#6D6D6D] font-medium">
                                {val}
                              </span>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Stop Workflow */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={stopOnReply}
                    id="stop-on-reply"
                    onChange={e => {
                      const checked = e.target.checked;
                      setStopOnReply(checked);
                      handleUpdateNodeProperties({ stop_on_reply: checked });
                      return;
                    }}
                  />
                  <label
                    htmlFor="stop-on-reply"
                    className="text-[#6D6D6D] text-sm"
                  >
                    Stop Workflow if Profile Replies
                  </label>
                </div>
              </>
            )}

            {isActionNode && isTemplateRequiredNode && (
              <div className="text-[#6D6D6D] mt-2">
                <div className="font-medium">Message</div>
                <div className="text-sm">
                  {nodeTemplate?.subject && (
                    <div className="w-full border border-[#C7C7C7] bg-white p-2 text-[#6D6D6D] min-h-[30px] rounded-[4px]">
                      {nodeTemplate?.subject}
                    </div>
                  )}
                  <div className="w-full border border-[#C7C7C7] bg-white p-2 text-[#6D6D6D] min-h-[100px] rounded-[4px]">
                    {nodeTemplate.body}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel - Workflow Builder (no changes) */}
      <div className="flex-1 min-h-[400px] border border-[#DADADA] bg-[#F4F4F4] rounded-md">
        <div className="flex items-center justify-center text-gray-500 h-full">
          {/* <WorkflowReview
            onNodeSelect={setSelectedWorkflowNode}
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
          /> */}
          <WorkflowBuilder
            data={workflow}
            onNodeSelect={setSelectedWorkflowNode}
            viewMode
          />
        </div>
      </div>
    </div>
  );
};

export default CreateReview;
