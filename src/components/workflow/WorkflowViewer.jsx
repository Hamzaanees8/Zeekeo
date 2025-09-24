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
  useReactFlow,
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

const WorkflowViewer = ({ data, onCancel, onSave }) => {
  const [workflowId, setWorkflowId] = useState(null);
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
  const [nodePositions, setNodePositions] = useState({});
  const [campaignName, setCampaignName] = useState(data?.name || "");

  

  // Update node positions when nodes change
    useEffect(() => {
      const positions = {};
      nodes.forEach(node => {
        positions[node.id] = node.position;
      });
      setNodePositions(positions);
    }, [nodes]);

    console.log('node data111', data);

  // Add this function before your component return statement
  const calculatePanelPosition = (nodePosition) => {
    if (!nodePosition) return { left: 0, top: 0 };
    
    const reactFlowWrapper = document.getElementById('reactflow-wrapper');
    if (!reactFlowWrapper) return { left: nodePosition.x + 180, top: nodePosition.y };
    
    const wrapperRect = reactFlowWrapper.getBoundingClientRect();
    const wrapperWidth = wrapperRect.width;
    const wrapperHeight = wrapperRect.height;
    
    const panelWidth = 280; // Width of your properties panel
    const panelHeight = 527; // Estimated height of your properties panel
    
    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate the node's position relative to the viewport
    const nodeX = wrapperRect.left + nodePosition.x;
    const nodeY = wrapperRect.top + nodePosition.y;
    
    // Check available space in all directions
    const spaceRight = viewportWidth - nodeX - 200; // 200 is node width + some padding
    const spaceLeft = nodeX - 200;
    const spaceBottom = viewportHeight - nodeY - 100; // 100 is node height + some padding
    const spaceTop = nodeY - 180;
    
    let left, top;
    
    // Determine the best position based on available space
    if (spaceRight >= panelWidth) {
      // Enough space on the right
      left = nodePosition.x + 80;
    } else if (spaceLeft >= panelWidth) {
      // Enough space on the left
      left = nodePosition.x - panelWidth - 20;
    } else {
      // Not enough space on either side, position at the edge
      left = Math.max(10, wrapperWidth - panelWidth - 10);
    }
    
    if (spaceBottom >= panelHeight) {
      // Enough space below
      top = nodePosition.y + 50;
    } else if (spaceTop >= panelHeight) {
      // Enough space above
      top = nodePosition.y - panelHeight;
    } else {
      // Not enough space above or below, position in the middle
      top = Math.max(10, (wrapperHeight - panelHeight) / 2);
    }
    
    // Ensure the panel stays within the container bounds
    left = Math.max(10, Math.min(left, wrapperWidth - panelWidth - 10));
    top = Math.max(10, Math.min(top, wrapperHeight - panelHeight - 10));
    
    return { left, top };
  };

  function FitViewOnInit({ nodes, edges }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    fitView({ padding: 0.5 });
  }, [fitView, nodes, edges]);

  return null;
}

  const activeNode = nodes.find(n => n.id === activeNodeId);
  console.log("active node", activeNode);

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

    // setName(data?.name || "");
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
    
    console.log(nodes);
    const output = buildWorkflowOutput(nodes, edges);
    console.log("Generated Workflow:", output);

    //  onSave(output);
    onSave(
      {
        // name,
        //  description: tags,
        name: campaignName,
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
        template: { name: "", body: "" },
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
          data={{ ...data, hideDelete: true }}
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
        {show && activeNodeId && (
          <div 
            className="bg-white w-[280px] px-3 py-4 text-sm space-y-5 rounded-[8px] shadow-2xl rounded-tl-[8px] border border-[#7E7E7E] review-properties absolute z-10"
            style={calculatePanelPosition(nodePositions[activeNodeId])}
          >
          <div className="flex items-center justify-between text-[#6D6D6D] font-medium w-full">
            <p>Properties: {title}</p>
            <div onClick={() => setShow(false)} className="cursor-pointer">
              <CircleCross className="w-3 h-3 " />
            </div>
          </div>

          
          {/* Template Field */}
          <div>
            <label className="text-[#6D6D6D] mb-1 block">Template</label>
            <input
              type="text"
              className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm"
              value={activeNode?.data?.template?.name ?? ""}
              onChange={e => {
                const value = e.target.value;
                setNodes(prev =>
                  prev.map(node =>
                    node.id === activeNodeId
                      ? { 
                          ...node, 
                          data: { 
                            ...node.data, 
                            template: { 
                              ...(node.data.template || {}), 
                              name: value 
                            } 
                          } 
                        }
                      : node,
                  ),
                );
              }}
            />

          </div>

          {/* Body Field */}
          <div>
            <label className="text-[#6D6D6D] mb-1 block">Body</label>
            <textarea
              rows={3}
              className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm"
              value={activeNode?.data?.template?.body ?? ""}
              onChange={e => {
                const value = e.target.value;
                setNodes(prev =>
                  prev.map(node =>
                    node.id === activeNodeId
                      ? { 
                          ...node, 
                          data: { 
                            ...node.data, 
                            template: { 
                              ...(node.data.template || {}), 
                              body: value 
                            } 
                          } 
                        }
                      : node,
                  ),
                );
              }}
            />

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
                  value={activeNode?.data?.delay?.days ?? 0}maxdelay
                  onChange={e => {
                    const value = Math.max(0, Number(e.target.value));
                    setNodes(prev =>
                      prev.map(node =>
                        node.id === activeNodeId
                          ? {
                              ...node,
                              data: {
                                ...node.data,
                                delay: { ...node.data.delay, days: value },
                              },
                            }
                          : node,
                      ),
                    );
                  }}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-[#6D6D6D]">Hours</label>
                <input
                  type="number"
                  min={0}
                  className="w-16 border border-[#C7C7C7] p-1 text-center"
                  value={activeNode?.data?.delay?.hours ?? 0}
                  onChange={e => {
                    const value = Math.max(0, Number(e.target.value));
                    setNodes(prev =>
                      prev.map(node =>
                        node.id === activeNodeId
                          ? {
                              ...node,
                              data: {
                                ...node.data,
                                delay: { ...node.data.delay, hours: value },
                              },
                            }
                          : node,
                      ),
                    );
                  }}
                />
              </div>
            </div>
          </div>

          {/* Max/Day Slider */}
          <div>
            <div className="text-[#6D6D6D] mb-1">
              Max/Day{" "}
              <span className="text-xs">
                (Recommended {activeNode?.data?.recommended ?? 50})
              </span>
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
              onChange={e => {
                const value = Number(e.target.value);
                setNodes(prev =>
                  prev.map(node =>
                    node.id === activeNodeId
                      ? { ...node, data: { ...node.data, limit: value } }
                      : node,
                  ),
                );
              }}
              className="w-full appearance-none h-2 bg-[#E0E0E0] rounded relative slider-thumb-only"
            />
          </div>

          {/* Stop Workflow */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="stop-on-reply"
              checked={activeNode?.data?.stop_on_reply ?? false}
              onChange={e => {
                const checked = e.target.checked;
                setNodes(prev =>
                  prev.map(node =>
                    node.id === activeNodeId
                      ? {
                          ...node,
                          data: { ...node.data, stop_on_reply: checked },
                        }
                      : node,
                  ),
                );
              }}
              className="w-4 h-4"
            />
            <label
              htmlFor="stop-on-reply"
              className="text-[#6D6D6D] text-sm"
            >
              Stop Workflow if Profile Replies
            </label>
          </div>
          {/* ✅ Save Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                handleSave();
                setShow(false); // close panel
              }}
              className="w-full bg-[#038D65] text-white py-2 rounded-[6px] hover:bg-[#027A57] transition"
            >
              Save
            </button>
          </div>
        </div>
        )}
        <ReactFlowProvider>
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
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background variant="dots" gap={15} size={2} color="#EFEFEF" />
          <CustomControl />
          <FitViewOnInit nodes={nodes} edges={edges} />
        </ReactFlow></ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowViewer;
