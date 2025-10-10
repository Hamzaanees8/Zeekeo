import React, { useState, useEffect, useRef } from "react";
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

import {
  PencilIcon,
  CircleCross,
  Undo,
  Redo,
  DropArrowIcon,
  AttachFile,
} from "../Icons.jsx";

import WorkflowNode from "./WorkFlowNode.jsx";
import CustomControl from "../../routes/campaigns/create-campaign/components/CustomControl.jsx";

// Dummy action and condition arrays (use real icons where needed)
import {
  edgeTypes,
  nodeMeta,
  buildWorkflowOutput,
  rebuildFromWorkflow,
} from "../../utils/workflow-helpers.jsx";
import {
  createTemplate,
  getTemplates,
  updateTemplate,
} from "../../services/templates.js";
import toast from "react-hot-toast";
import { getCurrentUser } from "../../utils/user-helpers.jsx";

const WorkflowViewer = ({ data, onCancel, onSave }) => {
  const [workflowId, setWorkflowId] = useState(null);
  const [title, setTitle] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [history, setHistory] = React.useState([{ nodes: [], edges: [] }]);
  const [delay, setDelay] = useState({ hours: 0, days: 0 });
  const [limit, setLimit] = useState(50);
  const [show, setShow] = useState(false);
  const [stopOnReply, setStopOnReply] = useState(true);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [nodeId, setNodeId] = useState(1);
  const [activeTab, setActiveTab] = useState("Actions");
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [nodePositions, setNodePositions] = useState({});
  const [campaignName, setCampaignName] = useState(data?.name || "");
  const [showBodyModal, setShowBodyModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const dropdownRef = React.useRef(null);
  const user = getCurrentUser();
  const email = user?.accounts?.email;

  const hasShown = useRef(false);
  useEffect(() => {
    if (!data?.workflow?.nodes) return;
    if (hasShown.current) return; // prevent second run in strict mode

    const hasEmailStep = data.workflow.nodes.some(
      node => node.type === "email_message",
    );

    if (hasEmailStep && !email) {
      toast.error("You must connect your email for this workflow!");
      hasShown.current = true;
    }
  }, [data, email]);
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const nodeTypeToTemplateType = {
    "Send Message": "linkedin_message",
    "Send InMail": "linkedin_inmail",
    "Send Email": "email_message",
  };
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await getTemplates();
        setTemplates(res);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
    }
    fetchTemplates();
  }, []);
  const templateType = nodeTypeToTemplateType[title];
  const availableTemplates = templates.filter(t => t.type === templateType);
  // Update node positions when nodes change
  useEffect(() => {
    const positions = {};
    nodes.forEach(node => {
      positions[node.id] = node.position;
    });
    setNodePositions(positions);
  }, [nodes]);

  console.log("node data111", data);

  // Add this function before your component return statement
  const calculatePanelPosition = nodePosition => {
    if (!nodePosition) return { left: 0, top: 0 };

    const reactFlowWrapper = document.getElementById("reactflow-wrapper");
    if (!reactFlowWrapper)
      return { left: nodePosition.x + 180, top: nodePosition.y };

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
          setLimit={setLimit}
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
  const handleDuplicate = async () => {
    const template = availableTemplates.find(
      t => t.template_id === activeNode?.data?.template_id,
    );
    if (!template) return;

    try {
      const newTemplate = {
        name: `${template.name} (Copy)`,
        body: templateBody,
        subject: template.subject ?? null,
        type: nodeTypeToTemplateType[title],
      };
      const saved = await createTemplate(newTemplate);
      toast.success("Template duplicated successfully");
      setTemplates(prev => {
        const exists = prev.some(t => t.template_id === saved.template_id);
        if (exists) {
          return prev.map(t =>
            t.template_id === saved.template_id ? saved : t,
          );
        }
        return [...prev, saved];
      });

      setNodes(prev =>
        prev.map(node =>
          node.id === activeNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  template: saved,
                },
              }
            : node,
        ),
      );

      setShowBodyModal(false);
    } catch (err) {
      console.error("Failed to duplicate template:", err);
    }
  };
  const handleOverwrite = async () => {
    const templateId = activeNode?.data?.template_id;
    if (!templateId) return;
    const template = availableTemplates.find(
      t => t.template_id === templateId,
    );
    if (!template) return;

    try {
      const updated = await updateTemplate(selectedTemplateId, {
        ...template,
        body: templateBody, // ✅ use state instead of node directly
      });
      toast.success("Template overwritten successfully");

      setTemplates(prev =>
        prev.map(t => (t.template_id === updated.template_id ? updated : t)),
      );

      setNodes(prev =>
        prev.map(node =>
          node.id === activeNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  template_id: updated.template_id,
                },
              }
            : node,
        ),
      );

      setShowBodyModal(false);
    } catch (err) {
      console.error("Failed to overwrite template:", err);
    }
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
            {["Send Email", "Send Message", "Send InMail"].includes(title) && (
              <div ref={dropdownRef}>
                <label className="text-[#6D6D6D] mb-1 block">Template</label>
                <div className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(prev => !prev)} // toggle open
                    className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-white flex justify-between items-center"
                  >
                    <span>
                      {activeNode?.data?.template_id
                        ? availableTemplates.find(
                            t =>
                              t.template_id === activeNode?.data?.template_id,
                          )?.name || "Select a template"
                        : "Select a template"}
                    </span>
                    <DropArrowIcon className="w-3 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute mt-1 w-full border border-[#C7C7C7] bg-white rounded-[4px] z-10">
                      {availableTemplates.map(t => (
                        <div
                          key={t.template_id}
                          onClick={() => {
                            setNodes(prev =>
                              prev.map(node =>
                                node.id === activeNodeId
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        template_id: t.template_id,
                                      },
                                    }
                                  : node,
                              ),
                            );
                            setIsDropdownOpen(false);
                            setSelectedTemplateId(t.template_id); // ✅ store template_id
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                            activeNode?.data?.template_id === t.template_id
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
                        >
                          {t.name || t.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {["Send Email", "Send Message", "Send InMail"].includes(title) && (
              <div>
                <label className="text-[#6D6D6D] mb-1 block">Body</label>
                <textarea
                  rows={3}
                  className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-gray-100 focus:outline-none"
                  value={
                    activeNode?.data?.template_id
                      ? availableTemplates.find(
                          t => t.template_id === activeNode?.data?.template_id,
                        )?.body ?? ""
                      : ""
                  }
                  disabled
                />
                <div className="flex items-center justify-between gap-x-3 mt-2 relative">
                  <button
                    type="button"
                    className="px-3 py-1 text-[13px] bg-[#0387FF] text-white rounded hover:bg-[#0270d8] cursor-pointer"
                    onClick={() => {
                      const template = availableTemplates.find(
                        t => t.template_id === activeNode?.data?.template_id,
                      );
                      setTemplateBody(template?.body ?? "");
                      setShowBodyModal(true);
                    }}
                  >
                    <PencilIcon className="w-4 h-4 inline-block mr-1 text-white fill-white" />
                    Quick Edit
                  </button>
                  {activeNode?.data?.template_id &&
                    (() => {
                      const template = availableTemplates.find(
                        t => t.template_id === activeNode?.data?.template_id,
                      );
                      const attachments = template?.attachments || [];

                      if (attachments.length === 0) return null; // hide button if none

                      return (
                        <div className="relative group">
                          <button
                            type="button"
                            className="px-3 py-1 text-[13px] bg-gray-200 text-[#7E7E7E] rounded hover:bg-gray-300 cursor-pointer flex items-center gap-1"
                          >
                            <AttachFile className="w-4 h-4 fill-[#7E7E7E]" />(
                            {attachments.length})
                          </button>

                          <div className="absolute left-0 mt-1 w-56 bg-white border border-[#7E7E7E] rounded shadow-lg z-10 overflow-hidden hidden group-hover:block">
                            {attachments.map((file, idx) => (
                              <div
                                key={idx}
                                className="px-3 py-2 text-[13px] text-[#7E7E7E] hover:bg-gray-100 truncate"
                                title={file}
                              >
                                {file}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            )}

            {showBodyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 m-0">
                <div className="bg-white w-[450px] max-h-[90vh] overflow-auto shadow-lg p-5 relative border border-[#7E7E7E] rounded-[6px]">
                  <div
                    onClick={() => setShowBodyModal(false)}
                    className="cursor-pointer absolute top-5 right-5"
                  >
                    <CircleCross className="w-3 h-3 " />
                  </div>
                  <h2 className="text-lg font-medium mb-2 text-[#6D6D6D]">
                    Quick Edit -{" "}
                    {availableTemplates.find(
                      t => t.template_id === activeNode?.data?.template_id,
                    )?.name ?? ""}
                  </h2>
                  <hr className="mb-4" />
                  <h2 className="mb-2  text-[#454545]">Body:</h2>
                  <textarea
                    rows={6}
                    className="w-full border border-gray-300 p-2 rounded text-sm text-[#454545] focus:outline-none"
                    value={templateBody}
                    onChange={e => setTemplateBody(e.target.value)}
                  />

                  <div className="mt-3 flex justify-between gap-2">
                    <button
                      className="px-3 py-1 text-sm bg-[#0387FF] text-white rounded cursor-pointer"
                      onClick={handleOverwrite}
                    >
                      Save & Overwrite
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-[#0387FF] text-white rounded cursor-pointer"
                      onClick={handleDuplicate}
                    >
                      Save as Duplicate
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    value={activeNode?.data?.delay?.days ?? 0}
                    maxdelay
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
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowViewer;
