import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from "@xyflow/react";

import { PencilIcon, CircleCross, Undo, Redo } from "../Icons.jsx";

import WorkflowNode from "./WorkFlowNode.jsx";
import CustomControl from "../../routes/campaigns/create-campaign/components/CustomControl.jsx";

// Dummy action and condition arrays (use real icons where needed)
import {
  edgeTypes,
  nodeMeta,
  buildWorkflowOutput,
  rebuildFromWorkflow,
} from "../../utils/workflow-helpers.jsx";
import toast from "react-hot-toast";

const WorkflowViewer = ({ data, onCancel }) => {
  const [workflowId, setWorkflowId] = useState(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [history, setHistory] = React.useState([{ nodes: [], edges: [] }]);
  const [delay, setDelay] = useState({ hours: 0, days: 0 });
  const [maxPerDay, setMaxPerDay] = useState(50);
  const [show, setShow] = useState(false);
  const [stopOnReply, setStopOnReply] = useState(true);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [nodeId, setNodeId] = useState(1);
  const [activeTab, setActiveTab] = useState("Actions");
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);

  const activeNode = nodes.find(n => n.id === activeNodeId);

  useEffect(() => {
    setNodes([
      {
        id: "start",
        type: "workflow",
        data: {
          title: "START",
          category: "start",
          color: "#12D7A8",
          type: "start",
        },
        position: { x: 500, y: 30 },
        draggable: false,
      },
    ]);
  }, []);
  useEffect(() => {
    console.log("incoming...", data);

    setName(data?.name || "");
    if (data?.workflow) {
      setWorkflowId(data?.workflow_id || null);
      const workflowData = data.workflow;
      if (
        (Array.isArray(workflowData.nodes) && workflowData.nodes.length > 0) ||
        (Array.isArray(workflowData.edges) && workflowData.edges.length > 0)
      ) {
        const { nodes: newNodes, edges: newEdges } = rebuildFromWorkflow(
          data?.workflow,
        );
        console.log("nodes", newNodes);
        console.log("edges", newEdges);
        setNodes(newNodes);
        setEdges(newEdges);
      }
    }
  }, [data]);

  React.useEffect(() => {
    // When nodes or edges change, save to history
    const current = history[historyIndex];
    if (current?.nodes !== nodes || current?.edges !== edges) {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push({ nodes, edges });
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    }
  }, [nodes, edges]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
      setHistoryIndex(newIndex);
    }
  };
  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a workflow name first.");
      return;
    }

    console.log(nodes);
    const output = buildWorkflowOutput(nodes, edges);
    console.log("Generated Workflow:", output);

    //  onSave(output);
    onSave(
      {
        name,
        //  description: tags,
        workflow: { nodes: output },
      },
      workflowId,
    );
  };
  const handleAddNode = (key, item, isCondition = false) => {
    console.log(item);

    const meta = nodeMeta[key] || {
      subtitle: "Wait For",
      time: ": Immediately",
      color: isCondition ? "#0077B6" : "#038D65",
    };

    console.log(meta);

    const newNode = {
      id: uuidv4(),
      type: "workflow",
      data: {
        title: item.label,
        subtitle: meta.subtitle,
        time: meta.time,
        color: meta.color,
        icon: meta.icon,
        isLast: meta.isLast,
        stop_on_reply: meta.stop_on_reply,
        delay: meta.delay || { hours: 0, days: 0 },
        category: meta.category,
        type: meta.type,
        maxdelay: meta.maxdelay || 50,
        limit: meta.maxdelay || 50,
        recommended: meta.maxdelay || 50,
      },
      position: {
        x: 300 + Math.random() * 300,
        y: Math.random() * 300,
      },
    };

    setNodes(nds => [...nds, newNode]);
    setNodeId(prev => prev + 1);
  };

  const renderOptions = (list, category) => {
    console.log(list);

    return Object.entries(list).map(([key, item], idx) => {
      console.log(item);

      return (
        <div
          key={idx}
          onClick={() => handleAddNode(key, item, category === "conditions")}
          className="h-[90px] border border-[#7E7E7E] gap-2 bg-white flex flex-col items-center justify-center px-2 text-center cursor-pointer"
        >
          <item.icon
            className={`w-5 h-5 mb-1 ${
              category === "actions" ? "fill-[#038D65]" : "fill-[#0077B6]"
            }
        `}
          />
          <span className="text-[12px] text-[#7E7E7E] leading-[100%]">
            {item.label}
          </span>
        </div>
      );
    });
  };

  const handleConnect = params => {
    //console.log(params)
    setEdges(eds => addEdge({ ...params }, eds));
  };

  const nodeTypes = {
    workflow: ({ id, data }) => {
      console.log("node data", data);

      return (
        <WorkflowNode
          id={id}
          data={data}
          deleteNode={() => {}}
          setDelay={setDelay}
          setMaxPerDay={setMaxPerDay}
          setShow={setShow}
          setStopOnReply={setStopOnReply}
          setTitle={setTitle}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          setActiveNodeId={setActiveNodeId}
          activeNodeId={activeNodeId}
          setNodes={setNodes}
        />
      );
    },
  };
  console.log("workflow data", data);
  // console.log("selected nodes", selectedNodes);
  return (
    <div className=" w-full">
      {/* Builder placeholder */}
      <div
        id="reactflow-wrapper"
        className="h-[800px] border border-[#6D6D6D] bg-[#FFFFFF]  rounded-[8px] relative shadow-md"
      >
        {show && (
          <div className="bg-white w-[280px] px-3 py-4 text-sm space-y-5 border-r border-b border-[#7E7E7E] review-properties absolute left-0 z-10">
            <div className="flex items-center justify-between text-[#6D6D6D] font-medium w-full">
              <p>Properties: {title}</p>
              <div onClick={() => setShow(false)} className="cursor-pointer">
                <CircleCross className="w-3 h-3 " />
              </div>
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
                    disabled
                    className="w-16 border border-[#C7C7C7] p-1 text-center"
                    value={activeNode?.data?.delay?.days ?? 0}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-[#6D6D6D]">Hours</label>
                  <input
                    type="number"
                    min={0}
                    disabled
                    className="w-16 border border-[#C7C7C7] p-1 text-center"
                    value={activeNode?.data?.delay?.hours ?? 0}
                  />
                </div>
              </div>
            </div>

            {/* Max/Day Slider with No Fill Bar */}
            <div>
              <div className="text-[#6D6D6D] mb-1">
                Max/Day <span className="text-xs">(Recommended {activeNode?.data?.recommended ?? 50})</span>
                <span className="text-right float-right text-[#0387FF] font-medium">
                  {activeNode?.data?.limit ?? 50}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={activeNode?.data?.limit ?? 50}
                disabled
                className="w-full appearance-none h-2 bg-[#E0E0E0] rounded relative slider-thumb-only"
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
                id="stop-on-reply"
                disabled
                checked={activeNode?.data?.stop_on_reply ?? false}
                className="w-4 h-4"
              />
              <label for="stop-on-reply" className="text-[#6D6D6D] text-sm">
                Stop Workflow if Profile Replies
              </label>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes.map(n => ({
            ...n,
            data: { ...(n.data || {}), viewMode: true },
          }))}
          edges={edges.map(e => ({
            ...e,
            data: { ...(e.data || {}), viewMode: true },
          }))}
          nodeTypes={nodeTypes}
          edgesConnectable={false}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          panOnScroll={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background variant="dots" gap={15} size={2} color="#EFEFEF" />
          <CustomControl />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowViewer;
