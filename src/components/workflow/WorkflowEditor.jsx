import React, { useState, useEffect, use } from "react";
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

import {
  PencilIcon,
  CircleCross,
  Undo,
  Redo,
  DropArrowIcon,
  AttachFile,
} from "../Icons.jsx";

import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css"; // Import SunEditor CSS

import WorkflowNode from "./WorkFlowNode.jsx";
import CustomControl from "../../routes/campaigns/create-campaign/components/CustomControl.jsx";

// Dummy action and condition arrays (use real icons where needed)
import {
  actions,
  edgeTypes,
  conditions,
  nodeMeta,
  buildWorkflowOutput,
  rebuildFromWorkflow,
  TemplateDisplay,
} from "../../utils/workflow-helpers.jsx";
import toast from "react-hot-toast";
import {
  createTemplate,
  getTemplates,
  updateTemplate,
} from "../../services/templates.js";
import { getCurrentUser } from "../../utils/user-helpers.jsx";
import {
  variableOptions,
  insertTextAtCursor,
} from "../../utils/template-helpers.js";

const WorkflowEditor = ({ type, data, onCancel, onSave, onChange, settings }) => {
  const isABTestingEnabled = settings?.enable_ab_testing;
  const [workflowId, setWorkflowId] = useState(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBodyModal, setShowBodyModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpenA, setIsDropdownOpenA] = useState(false);
  const [isDropdownOpenB, setIsDropdownOpenB] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [agencyTemplates, setAgencyTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  // Inline template creation state
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [creatingForSlot, setCreatingForSlot] = useState(null); // 'a', 'b', or null for standard
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");

  // Temp limit for slider buffering
  const [tempLimit, setTempLimit] = useState(null);

  // Draggable properties panel state
  const [panelPosition, setPanelPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const dropdownRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const newTemplateBodyRef = React.useRef(null);

  // Refs to track initial mount and synced workflow to avoid loops
  const isInitialMount = React.useRef(true);
  const lastSyncedWorkflowRef = React.useRef(null);

  const [nodePositions, setNodePositions] = useState({});
  const nodeTypeToTemplateType = {
    "Send Message": "linkedin_message",
    "Send InMail": "linkedin_inmail",
    "Send Email": "email_message",
    "Invite to Connect": "linkedin_invite",
  };
  const user = getCurrentUser();
  const email = user?.accounts?.email;
  // Update node positions when nodes change
  useEffect(() => {
    const positions = {};
    nodes.forEach(node => {
      positions[node.id] = node.position;
    });
    setNodePositions(positions);
  }, [nodes]);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { templates, agencyTemplates } = await getTemplates();
        setTemplates(templates);
        setAgencyTemplates(agencyTemplates);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
    }
    fetchTemplates();
  }, []);
  const templateType = nodeTypeToTemplateType[title];
  const availableTemplates = templates.filter(t => t.type === templateType);
  const availableAgencyTemplates = agencyTemplates.filter(t => t.type === templateType);
  const allAvailableTemplates = [...availableTemplates, ...availableAgencyTemplates];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add this function before your component return statement
  const calculatePanelPosition = nodePosition => {
    if (!nodePosition) return { left: 0, top: 0 };

    const reactFlowWrapper = document.getElementById("reactflow-wrapper");
    if (!reactFlowWrapper)
      return { left: nodePosition.x + 250, top: nodePosition.y };

    const wrapperRect = reactFlowWrapper.getBoundingClientRect();
    const wrapperWidth = wrapperRect.width;
    const wrapperHeight = wrapperRect.height;

    const panelWidth = 560; // Width of your properties panel (doubled)
    const panelHeight = 500; // Estimated height of your properties panel

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
      // Enough space on the right - position further right
      left = nodePosition.x + 180;
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

  // Reset panel position and creation state when active node changes
  useEffect(() => {
    setPanelPosition(null);
    setIsCreatingTemplate(false);
    setCreatingForSlot(null);
    setNewTemplateName("");
    setNewTemplateSubject("");
    setNewTemplateBody("");
    setTempLimit(null);
  }, [activeNodeId]);

  // Handle variable insertion into the new template body textarea
  const handleNewTemplateVariableInsert = (variable) => {
    const updatedBody = insertTextAtCursor({
      fieldRef: newTemplateBodyRef,
      valueToInsert: variable,
      currentText: newTemplateBody,
    });
    if (updatedBody !== undefined) {
      setNewTemplateBody(updatedBody);
    }
  };

  // Draggable panel handlers
  const handlePanelMouseDown = e => {
    if (e.target.closest(".panel-drag-handle")) {
      setIsDragging(true);
      const panel = panelRef.current;
      if (panel) {
        const rect = panel.getBoundingClientRect();
        const wrapper = document.getElementById("reactflow-wrapper");
        const wrapperRect = wrapper?.getBoundingClientRect() || {
          left: 0,
          top: 0,
        };
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        // Initialize panel position if not set
        if (!panelPosition) {
          setPanelPosition({
            left: rect.left - wrapperRect.left,
            top: rect.top - wrapperRect.top,
          });
        }
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = e => {
      if (!isDragging) return;
      const wrapper = document.getElementById("reactflow-wrapper");
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const panelWidth = 560;
      const panelHeight = 500;

      let newLeft = e.clientX - wrapperRect.left - dragOffset.x;
      let newTop = e.clientY - wrapperRect.top - dragOffset.y;

      // Keep panel within bounds
      newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - panelWidth));
      newTop = Math.max(0, Math.min(newTop, wrapperRect.height - panelHeight));

      setPanelPosition({ left: newLeft, top: newTop });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
    setTags(data?.description || "");
    if (data?.workflow) {
      setWorkflowId(data?.workflow_id || null);
      const workflowData = data.workflow;

      // Skip rebuild if this data matches what we just synced (avoid feedback loop)
      const incomingWorkflowStr = JSON.stringify(workflowData);
      if (incomingWorkflowStr === lastSyncedWorkflowRef.current) {
        console.log("Skipping rebuild - data matches last synced workflow");
        return;
      }

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

  // Sync workflow changes to parent component
  React.useEffect(() => {
    // Skip initial mount to avoid unnecessary sync on load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Don't sync if onChange is not provided
    if (!onChange) return;

    // Only sync if we have meaningful nodes (more than just start node)
    if (nodes.length <= 1) return;

    // Build workflow output from current nodes and edges
    const output = buildWorkflowOutput(nodes, edges);
    const workflowData = { nodes: output };

    // Avoid duplicate syncs if data hasn't changed
    const currentWorkflowStr = JSON.stringify(workflowData);
    if (currentWorkflowStr === lastSyncedWorkflowRef.current) return;

    lastSyncedWorkflowRef.current = currentWorkflowStr;

    onChange({
      name,
      workflow: workflowData,
    });
  }, [nodes, edges, onChange, name]);

  // Helper function to update a node and immediately sync to parent
  const updateNodeAndSync = React.useCallback(
    (nodeId, dataUpdates) => {
      // Compute new nodes from current state directly
      const newNodes = nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...dataUpdates } }
          : node,
      );

      // Update local state
      setNodes(newNodes);

      // Immediately sync to parent
      if (onChange) {
        const output = buildWorkflowOutput(newNodes, edges);
        console.log("updateNodeAndSync: syncing to parent", {
          nodeId,
          dataUpdates,
          output,
        });
        onChange({
          name,
          workflow: { nodes: output },
        });
      }
    },
    [nodes, onChange, edges, name, setNodes],
  );

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
    const hasEmailStep = output.some(node => node.type === "email_message");
    if (hasEmailStep && !email) {
      toast.error("You must connect your email for this workflow!");
    }
    // onSave(output);
    onSave(
      {
        name,
        // description: tags,
        workflow: { nodes: output },
      },
      workflowId,
    );
  };
  const handleAddNode = (key, item, isCondition = false) => {
    // console.log('clicked...')
    // console.log(item);

    const meta = nodeMeta[key] || {
      subtitle: "Wait For",
      time: ": Immediately",
      color: isCondition ? "#0077B6" : "#038D65",
    };

    // console.log(meta);

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
    // console.log(list);

    return Object.entries(list).map(([key, item], idx) => {
      // console.log(item);

      return (
        <div
          key={idx}
          onClick={() => handleAddNode(key, item, category === "conditions")}
          className={`${
            isFullscreen
              ? "w-[140px] bg-[#04479C] text-white h-[70px]"
              : "h-[90px]"
          }  border border-[#7E7E7E] gap-2 bg-white flex flex-col items-center justify-center px-2 text-center cursor-pointer rounded-[4px] shadow-md`}
        >
          <item.icon
            className={`w-5 h-5 mb-1 ${
              category === "actions" ? "fill-[#038D65]" : "fill-[#0387FF]"
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
    setEdges(eds =>
      addEdge(
        {
          ...params,
          type: "custom",
          animated: false,
          style: { stroke: "#0096C7" },
        },
        eds,
      ),
    );
  };

  const nodeTypes = {
    workflow: ({ id, data }) => {
      console.log("node data", data);

      return (
        <WorkflowNode
          id={id}
          data={data}
          deleteNode={id => {
            setNodes(prevNodes => {
              const updatedNodes = prevNodes.filter(n => n.id !== id);
              setEdges(prevEdges =>
                prevEdges.filter(e => e.source !== id && e.target !== id),
              );
              if (id === activeNodeId) {
                setShow(false);
                setActiveNodeId(null);
              }
              setSelectedNodes(prev => prev.filter(n => n.id !== id));
              setHistory(prevHistory => {
                const sliced = prevHistory.slice(0, historyIndex + 1);
                const newEntry = { nodes: updatedNodes, edges };
                const updatedHistory = [...sliced, newEntry];
                setHistoryIndex(updatedHistory.length - 1);
                return updatedHistory;
              });

              return updatedNodes;
            });
          }}
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
  console.log("active node...", activeNode);
  const handleDuplicate = async () => {
    const template = allAvailableTemplates.find(
      t => t.template_id === activeNode?.data?.template_id,
    );
    if (!template) return;

    try {
      const newTemplate = {
        name: `${template.name} (Copy)`,
        body: templateBody,
        subject: templateSubject ?? null,
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
                  template_id: saved.template_id,
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
    const template = allAvailableTemplates.find(
      t => t.template_id === templateId,
    );

    if (!template) return;

    try {
      const updated = await updateTemplate(templateId, {
        ...template,
        body: templateBody, // ✅ use state instead of node directly
        subject: templateSubject,
      });
      toast.success("Template overwritten successfully");

      setTemplates(prev =>
        prev.map(t => (t.template_id === updated.template_id ? updated : t)),
      );

      // No need to update nodes since we're just storing template_id
      // The template content change will be reflected automatically

      setShowBodyModal(false);
    } catch (err) {
      console.error("Failed to overwrite template:", err);
    }
  };

  console.log("workflow data", data);
  console.log("selected nodes", selectedNodes);
  return (
    <div className=" w-full">
      {type !== "edit" && (
        <div className="flex justify-between">
          <div className="w-6/12">
            {/* Name with edit icon */}
            <div className="relative mb-2 h-[38px]">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Custom Workflow 1"
                className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3 pr-10 h-full w-full rounded-[4px]"
              />
              <span className="absolute right-2 top-0 h-full flex items-center justify-center cursor-pointer">
                <PencilIcon className="w-4 h-4 fill-[#12D7A8]" />
              </span>
            </div>
          </div>
          {/* Header Row */}
          <div className="flex justify-end mb-3 space-x-2">
            <button
              onClick={onCancel}
              className="text-[16px] bg-[#A1A1A1] text-white px-4 py-[6px] h-fit cursor-pointer rounded-[4px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-[16px] bg-[#0387FF] text-white px-4 py-[6px] h-fit cursor-pointer rounded-[4px]"
            >
              Save
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-4">
        {/* Tabs */}
        <div className="flex flex-col items-center gap-2  mb-4">
          {["Actions", "Conditions"].map(tab => (
            <button
              key={tab}
              className={`px-3 py-1 text-[14px] border border-[#C7C7C7] w-[129px] cursor-pointer rounded-[4px] ${
                activeTab === tab
                  ? "bg-[#7E7E7E] text-white"
                  : "bg-white text-[#7E7E7E]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mapped icons */}
        <div className="grid grid-cols-9 gap-2 mb-4">
          {activeTab === "Actions"
            ? renderOptions(actions, "actions")
            : renderOptions(conditions, "conditions")}
        </div>
      </div>
      {/* Builder placeholder */}
      <div
        id="reactflow-wrapper"
        className="h-[80vh] border border-[#6D6D6D] bg-[#FFFFFF] rounded-[8px] shadow-md  relative overflow-hidden"
      >
        {isFullscreen && (
          <div className="flex flex-col gap-4 absolute top-4 left-4 z-10">
            {/* Tabs */}
            <div className="flex flex-col items-center gap-2 mb-4">
              {["Actions", "Conditions"].map(tab => (
                <button
                  key={tab}
                  className={`px-3 py-1 text-[14px] border border-[#C7C7C7] w-[129px] cursor-pointer rounded-[4px] ${
                    activeTab === tab
                      ? "bg-[#7E7E7E] text-white"
                      : "bg-white text-[#7E7E7E]"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 mb-1">
              {activeTab === "Actions"
                ? renderOptions(actions, "actions")
                : renderOptions(conditions, "conditions")}
            </div>
          </div>
        )}
        {show && activeNodeId && (
          <div
            ref={panelRef}
            onMouseDown={handlePanelMouseDown}
            className={`bg-white w-[560px] px-4 py-4 text-sm space-y-4 rounded-[8px] shadow-2xl rounded-tl-[8px] border border-[#7E7E7E] review-properties absolute z-10 ${
              isDragging ? "select-none" : ""
            }`}
            style={
              panelPosition ||
              calculatePanelPosition(nodePositions[activeNodeId])
            }
          >
            <div className="flex items-center justify-between text-[#6D6D6D] font-medium w-full panel-drag-handle cursor-move">
              <p>Properties: {title}</p>
              <div onClick={() => setShow(false)} className="cursor-pointer">
                <CircleCross className="w-3 h-3 " />
              </div>
            </div>

            {/* Template Field */}
            {["Send Email", "Send Message", "Send InMail", "Invite to Connect"].includes(
              title,
            ) && (
              <div ref={dropdownRef}>
                {/* A/B Testing: Show dual dropdowns */}
                {isABTestingEnabled ? (
                  <div className="flex gap-3">
                    {/* Template A Dropdown */}
                    <div className="flex-1">
                      <label className="text-[#6D6D6D] mb-1 block">
                        Template A <span className="text-[#16A34A] font-medium">(Group A)</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpenA(prev => !prev);
                            setIsDropdownOpenB(false);
                          }}
                          className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-white flex justify-between items-center"
                        >
                          <span className={`line-clamp-1 ${isCreatingTemplate && creatingForSlot === 'a' ? 'text-[#16A34A] font-medium' : ''}`}>
                            {isCreatingTemplate && creatingForSlot === 'a'
                              ? "+ Create new template"
                              : activeNode?.data?.template_id_a
                                ? allAvailableTemplates.find(
                                    t => t.template_id === activeNode?.data?.template_id_a
                                  )?.name || (title === "Invite to Connect" ? "No template" : "Select template A")
                                : (title === "Invite to Connect" ? "No template" : "Select template A")}
                          </span>
                          <DropArrowIcon className="w-3 h-4 text-gray-500" />
                        </button>
                        {isDropdownOpenA && (
                          <div className="absolute mt-1 w-full max-h-60 overflow-y-auto border border-[#C7C7C7] bg-white rounded-[4px] z-10">
                            <div
                              key="reset-template-a"
                              onClick={() => {
                                updateNodeAndSync(activeNodeId, { template_id_a: null });
                                setIsDropdownOpenA(false);
                                setIsCreatingTemplate(false);
                                setCreatingForSlot(null);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                !activeNode?.data?.template_id_a && !isCreatingTemplate ? "bg-gray-100 font-medium" : ""
                              }`}
                            >
                              {title === "Invite to Connect" ? "No template" : "Select template A"}
                            </div>
                            {/* Create new template option for A */}
                            <div
                              key="create-template-a"
                              onClick={() => {
                                setIsCreatingTemplate(true);
                                setCreatingForSlot('a');
                                setIsDropdownOpenA(false);
                                setNewTemplateName("");
                                setNewTemplateSubject("");
                                setNewTemplateBody("");
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-[#16A34A] font-medium ${
                                isCreatingTemplate && creatingForSlot === 'a' ? 'bg-green-50' : ''
                              }`}
                            >
                              + Create new template
                            </div>
                            {availableTemplates.map(t => (
                              <div
                                key={t.template_id}
                                onClick={() => {
                                  updateNodeAndSync(activeNodeId, { template_id_a: t.template_id });
                                  setIsDropdownOpenA(false);
                                  setIsCreatingTemplate(false);
                                  setCreatingForSlot(null);
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 w-full line-clamp-2 ${
                                  activeNode?.data?.template_id_a === t.template_id
                                    ? "bg-gray-100 font-medium"
                                    : ""
                                }`}
                              >
                                {t.name || t.title}
                              </div>
                            ))}

                            {/* Agency Templates Section */}
                            {availableAgencyTemplates.length > 0 && (
                              <>
                                <div className="px-3 py-2 text-xs font-semibold text-[#7E7E7E] bg-gray-50 border-t border-b border-[#E0E0E0]">
                                  Agency Templates
                                </div>
                                {availableAgencyTemplates.map(t => (
                                  <div
                                    key={t.template_id}
                                    onClick={() => {
                                      updateNodeAndSync(activeNodeId, { template_id_a: t.template_id });
                                      setIsDropdownOpenA(false);
                                      setIsCreatingTemplate(false);
                                      setCreatingForSlot(null);
                                    }}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 w-full line-clamp-2 ${
                                      activeNode?.data?.template_id_a === t.template_id
                                        ? "bg-gray-100 font-medium"
                                        : ""
                                    }`}
                                  >
                                    {t.name || t.title}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Template B Dropdown */}
                    <div className="flex-1">
                      <label className="text-[#6D6D6D] mb-1 block">
                        Template B <span className="text-[#EF4444] font-medium">(Group B)</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpenB(prev => !prev);
                            setIsDropdownOpenA(false);
                          }}
                          className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-white flex justify-between items-center"
                        >
                          <span className={`line-clamp-1 ${isCreatingTemplate && creatingForSlot === 'b' ? 'text-[#EF4444] font-medium' : ''}`}>
                            {isCreatingTemplate && creatingForSlot === 'b'
                              ? "+ Create new template"
                              : activeNode?.data?.template_id_b
                                ? allAvailableTemplates.find(
                                    t => t.template_id === activeNode?.data?.template_id_b
                                  )?.name || (title === "Invite to Connect" ? "No template" : "Select template B")
                                : (title === "Invite to Connect" ? "No template" : "Select template B")}
                          </span>
                          <DropArrowIcon className="w-3 h-4 text-gray-500" />
                        </button>
                        {isDropdownOpenB && (
                          <div className="absolute mt-1 w-full max-h-60 overflow-y-auto border border-[#C7C7C7] bg-white rounded-[4px] z-10">
                            <div
                              key="reset-template-b"
                              onClick={() => {
                                updateNodeAndSync(activeNodeId, { template_id_b: null });
                                setIsDropdownOpenB(false);
                                setIsCreatingTemplate(false);
                                setCreatingForSlot(null);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                !activeNode?.data?.template_id_b && !isCreatingTemplate ? "bg-gray-100 font-medium" : ""
                              }`}
                            >
                              {title === "Invite to Connect" ? "No template" : "Select template B"}
                            </div>
                            {/* Create new template option for B */}
                            <div
                              key="create-template-b"
                              onClick={() => {
                                setIsCreatingTemplate(true);
                                setCreatingForSlot('b');
                                setIsDropdownOpenB(false);
                                setNewTemplateName("");
                                setNewTemplateSubject("");
                                setNewTemplateBody("");
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-[#EF4444] font-medium ${
                                isCreatingTemplate && creatingForSlot === 'b' ? 'bg-red-50' : ''
                              }`}
                            >
                              + Create new template
                            </div>
                            {availableTemplates.map(t => (
                              <div
                                key={t.template_id}
                                onClick={() => {
                                  updateNodeAndSync(activeNodeId, { template_id_b: t.template_id });
                                  setIsDropdownOpenB(false);
                                  setIsCreatingTemplate(false);
                                  setCreatingForSlot(null);
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 w-full line-clamp-2 ${
                                  activeNode?.data?.template_id_b === t.template_id
                                    ? "bg-gray-100 font-medium"
                                    : ""
                                }`}
                              >
                                {t.name || t.title}
                              </div>
                            ))}

                            {/* Agency Templates Section */}
                            {availableAgencyTemplates.length > 0 && (
                              <>
                                <div className="px-3 py-2 text-xs font-semibold text-[#7E7E7E] bg-gray-50 border-t border-b border-[#E0E0E0]">
                                  Agency Templates
                                </div>
                                {availableAgencyTemplates.map(t => (
                                  <div
                                    key={t.template_id}
                                    onClick={() => {
                                      updateNodeAndSync(activeNodeId, { template_id_b: t.template_id });
                                      setIsDropdownOpenB(false);
                                      setIsCreatingTemplate(false);
                                      setCreatingForSlot(null);
                                    }}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 w-full line-clamp-2 ${
                                      activeNode?.data?.template_id_b === t.template_id
                                        ? "bg-gray-100 font-medium"
                                        : ""
                                    }`}
                                  >
                                    {t.name || t.title}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard single template dropdown */
                  <>
                    <label className="text-[#6D6D6D] mb-1 block">Template</label>
                    <div className="relative">
                      {/* Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-white flex justify-between items-center"
                      >
                        <span className="line-clamp-1">
                          {
                            activeNode?.data?.template_id
                              ? allAvailableTemplates.find(
                                  t =>
                                    t.template_id ===
                                    activeNode?.data?.template_id,
                                )?.name || "Select a template"
                              : title === "Invite to Connect"
                              ? "No template"
                              : "Select a template"
                          }
                        </span>
                        <DropArrowIcon className="w-3 h-4 text-gray-500" />
                      </button>

                      {/* Dropdown Options */}
                      {isDropdownOpen && (
                        <div className="absolute mt-1 w-full max-h-60 overflow-y-auto border border-[#C7C7C7] bg-white rounded-[4px] z-10">
                          {/* Reset/Select option */}
                          <div
                            key="reset-template"
                            onClick={() => {
                              updateNodeAndSync(activeNodeId, {
                                template_id: null,
                              });
                              setIsDropdownOpen(false);
                              setSelectedTemplateId(null);
                              setIsCreatingTemplate(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                              !activeNode?.data?.template_id && !isCreatingTemplate
                                ? "bg-gray-100 font-medium"
                                : ""
                            }`}
                          >
                            {title === "Invite to Connect"
                              ? "No template"
                              : "Select a template"}
                          </div>

                          {/* Create new template option */}
                          <div
                            key="create-template"
                            onClick={() => {
                              setIsCreatingTemplate(true);
                              setIsDropdownOpen(false);
                              setNewTemplateName("");
                              setNewTemplateSubject("");
                              setNewTemplateBody("");
                            }}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-[#0387FF] font-medium"
                          >
                            + Create new template
                          </div>

                          {availableTemplates.map(t => (
                            <div
                              key={t.template_id}
                              onClick={() => {
                                updateNodeAndSync(activeNodeId, {
                                  template_id: t.template_id,
                                });
                                setIsDropdownOpen(false);
                                setSelectedTemplateId(t.template_id);
                                setIsCreatingTemplate(false);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 w-full line-clamp-2 ${
                                activeNode?.data?.template_id === t.template_id
                                  ? "bg-gray-100 font-medium"
                                  : ""
                              }`}
                            >
                              {t.name || t.title}
                            </div>
                          ))}

                          {/* Agency Templates Section */}
                          {availableAgencyTemplates.length > 0 && (
                            <>
                              <div className="px-3 py-2 text-xs font-semibold text-[#7E7E7E] bg-gray-50 border-t border-b border-[#E0E0E0]">
                                Agency Templates
                              </div>
                              {availableAgencyTemplates.map(t => (
                                <div
                                  key={t.template_id}
                                  onClick={() => {
                                    updateNodeAndSync(activeNodeId, {
                                      template_id: t.template_id,
                                    });
                                    setIsDropdownOpen(false);
                                    setSelectedTemplateId(t.template_id);
                                    setIsCreatingTemplate(false);
                                  }}
                                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 w-full line-clamp-2 ${
                                    activeNode?.data?.template_id === t.template_id
                                      ? "bg-gray-100 font-medium"
                                      : ""
                                  }`}
                                >
                                  {t.name || t.title}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Template Display or Inline Creation */}
            {["Send Email", "Send Message", "Send InMail", "Invite to Connect"].includes(
              title,
            ) && (
              <div>
                {isCreatingTemplate ? (
                  /* Inline Template Creation Form */
                  <div className={`space-y-3 border rounded-[4px] p-3 ${
                    creatingForSlot === 'a' ? 'border-[#16A34A] bg-green-50/30' :
                    creatingForSlot === 'b' ? 'border-[#EF4444] bg-red-50/30' :
                    'border-[#C7C7C7] bg-gray-50'
                  }`}>
                    <div className={`font-medium text-sm mb-2 ${
                      creatingForSlot === 'a' ? 'text-[#16A34A]' :
                      creatingForSlot === 'b' ? 'text-[#EF4444]' :
                      'text-[#0387FF]'
                    }`}>
                      Create New Template{creatingForSlot === 'a' ? ' for Group A' : creatingForSlot === 'b' ? ' for Group B' : ''}
                    </div>

                    {/* Template Name */}
                    <div>
                      <label className="text-[#6D6D6D] mb-1 block text-xs">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter template name"
                        className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-white focus:outline-none focus:border-[#0387FF]"
                        value={newTemplateName}
                        onChange={e => setNewTemplateName(e.target.value)}
                      />
                    </div>

                    {/* Subject (for Email and InMail) */}
                    {["Send Email", "Send InMail"].includes(title) && (
                      <div>
                        <label className="text-[#6D6D6D] mb-1 block text-xs">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Enter subject"
                          className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-white focus:outline-none focus:border-[#0387FF]"
                          value={newTemplateSubject}
                          onChange={e => setNewTemplateSubject(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Body */}
                    <div>
                      <label className="text-[#6D6D6D] mb-1 block text-xs">
                        Body *
                      </label>
                      <textarea
                        ref={newTemplateBodyRef}
                        rows={5}
                        placeholder="Enter template body..."
                        className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-white focus:outline-none focus:border-[#0387FF] resize-none"
                        value={newTemplateBody}
                        onChange={e => setNewTemplateBody(e.target.value)}
                      />
                    </div>

                    {/* Insert Variables */}
                    <div>
                      <div className="text-[#6D6D6D] text-xs font-medium mb-2">
                        Insert Variables
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {variableOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className="text-[12px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-2 py-0.5 rounded-[4px] cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleNewTemplateVariableInsert(opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        className={`px-4 py-2 text-[13px] text-white rounded cursor-pointer ${
                          creatingForSlot === 'a' ? 'bg-[#16A34A] hover:bg-[#15803D]' : creatingForSlot === 'b' ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-[#0387FF] hover:bg-[#0270d8]'
                        }`}
                        onClick={async () => {
                          if (!newTemplateName.trim()) {
                            toast.error("Please enter a template name");
                            return;
                          }
                          if (!newTemplateBody.trim()) {
                            toast.error("Please enter a template body");
                            return;
                          }
                          try {
                            const newTemplate = {
                              name: newTemplateName,
                              body: newTemplateBody,
                              subject: newTemplateSubject || null,
                              type: nodeTypeToTemplateType[title],
                            };
                            const saved = await createTemplate(newTemplate);
                            toast.success("Template created successfully");
                            setTemplates(prev => [...prev, saved]);
                            // Assign to correct slot based on creatingForSlot
                            if (creatingForSlot === 'a') {
                              updateNodeAndSync(activeNodeId, { template_id_a: saved.template_id });
                            } else if (creatingForSlot === 'b') {
                              updateNodeAndSync(activeNodeId, { template_id_b: saved.template_id });
                            } else {
                              updateNodeAndSync(activeNodeId, { template_id: saved.template_id });
                            }
                            setSelectedTemplateId(saved.template_id);
                            setIsCreatingTemplate(false);
                            setCreatingForSlot(null);
                            setNewTemplateName("");
                            setNewTemplateSubject("");
                            setNewTemplateBody("");
                          } catch (err) {
                            console.error("Failed to create template:", err);
                            toast.error("Failed to create template");
                          }
                        }}
                      >
                        Create and Assign{creatingForSlot === 'a' ? ' to A' : creatingForSlot === 'b' ? ' to B' : ''}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-[13px] bg-gray-200 text-[#7E7E7E] rounded hover:bg-gray-300 cursor-pointer"
                        onClick={() => {
                          setIsCreatingTemplate(false);
                          setCreatingForSlot(null);
                          setNewTemplateName("");
                          setNewTemplateSubject("");
                          setNewTemplateBody("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isABTestingEnabled ? (
                  /* A/B Testing: Show dual template previews */
                  <div className="flex gap-3">
                    {/* Template A Preview */}
                    <div className="flex-1 border border-[#16A34A] rounded-[4px] p-2 bg-green-50/30">
                      <div className="text-[#16A34A] font-medium text-xs mb-2">Template A Preview</div>
                      {["Send Email", "Send InMail"].includes(title) && (
                        <>
                          <label className="text-[#6D6D6D] mb-1 block text-xs">Subject</label>
                          <input
                            type="text"
                            className="w-full border border-[#C7C7C7] p-1.5 rounded-[4px] text-xs bg-gray-100 focus:outline-none mb-2"
                            value={
                              activeNode?.data?.template_id_a
                                ? allAvailableTemplates.find(t => t.template_id === activeNode?.data?.template_id_a)?.subject ?? ""
                                : ""
                            }
                            disabled
                          />
                        </>
                      )}
                      <label className="text-[#6D6D6D] mb-1 block text-xs">Body</label>
                      <div className="w-full border border-[#C7C7C7] p-1.5 rounded-[4px] text-xs bg-gray-100 min-h-[60px] max-h-[100px] overflow-y-auto">
                        {activeNode?.data?.template_id_a
                          ? allAvailableTemplates.find(t => t.template_id === activeNode?.data?.template_id_a)?.body ?? "No template selected"
                          : "No template selected"}
                      </div>
                    </div>

                    {/* Template B Preview */}
                    <div className="flex-1 border border-[#EF4444] rounded-[4px] p-2 bg-red-50/30">
                      <div className="text-[#EF4444] font-medium text-xs mb-2">Template B Preview</div>
                      {["Send Email", "Send InMail"].includes(title) && (
                        <>
                          <label className="text-[#6D6D6D] mb-1 block text-xs">Subject</label>
                          <input
                            type="text"
                            className="w-full border border-[#C7C7C7] p-1.5 rounded-[4px] text-xs bg-gray-100 focus:outline-none mb-2"
                            value={
                              activeNode?.data?.template_id_b
                                ? allAvailableTemplates.find(t => t.template_id === activeNode?.data?.template_id_b)?.subject ?? ""
                                : ""
                            }
                            disabled
                          />
                        </>
                      )}
                      <label className="text-[#6D6D6D] mb-1 block text-xs">Body</label>
                      <div className="w-full border border-[#C7C7C7] p-1.5 rounded-[4px] text-xs bg-gray-100 min-h-[60px] max-h-[100px] overflow-y-auto">
                        {activeNode?.data?.template_id_b
                          ? allAvailableTemplates.find(t => t.template_id === activeNode?.data?.template_id_b)?.body ?? "No template selected"
                          : "No template selected"}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard: Existing Template Display */
                  <>
                    {["Send Email", "Send InMail"].includes(title) && (
                      <>
                        <label className="text-[#6D6D6D] mb-1 block">
                          Subject
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#C7C7C7] p-2 rounded-[4px] text-sm bg-gray-100 focus:outline-none"
                          value={
                            activeNode?.data?.template_id
                              ? allAvailableTemplates.find(
                                  t =>
                                    t.template_id ===
                                    activeNode?.data?.template_id,
                                )?.subject ?? ""
                              : ""
                          }
                          disabled
                        />
                      </>
                    )}
                    <label className="text-[#6D6D6D] mb-1 block">Body</label>
                    {TemplateDisplay({ activeNode, availableTemplates: allAvailableTemplates })}
                    <div className="flex items-center justify-between gap-x-3 mt-2 relative">
                      {/* Only show Quick Edit when a template is selected */}
                      {activeNode?.data?.template_id && (
                        <button
                          type="button"
                          className="px-3 py-1 text-[13px] bg-[#0387FF] text-white rounded hover:bg-[#0270d8] cursor-pointer"
                          onClick={() => {
                            const template = allAvailableTemplates.find(
                              t =>
                                t.template_id === activeNode?.data?.template_id,
                            );
                            setTemplateBody(template?.body ?? "");
                            setTemplateSubject(template?.subject ?? "");
                            setShowBodyModal(true);
                          }}
                        >
                          <PencilIcon className="w-4 h-4 inline-block mr-1 text-white fill-white" />
                          Quick Edit
                        </button>
                      )}
                      {activeNode?.data?.template_id &&
                        (() => {
                          const template = allAvailableTemplates.find(
                            t =>
                              t.template_id === activeNode?.data?.template_id,
                          );
                          const attachments = template?.attachments || [];

                          if (attachments.length === 0) return null;

                          return (
                            <div className="relative group">
                              <button
                                type="button"
                                className="px-3 py-1 text-[13px] bg-gray-200 text-[#7E7E7E] rounded hover:bg-gray-300 cursor-pointer flex items-center gap-1"
                              >
                                <AttachFile className="w-4 h-4 fill-[#7E7E7E]" />
                                ({attachments.length})
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
                  </>
                )}
              </div>
            )}

            {showBodyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 m-0">
                <div className="bg-white  w-[800px] max-w-[90vw]  overflow-auto shadow-lg p-5 relative border border-[#7E7E7E] rounded-[6px]">
                  <div
                    onClick={() => setShowBodyModal(false)}
                    className="cursor-pointer absolute top-5 right-5"
                  >
                    <CircleCross className="w-3 h-3 " />
                  </div>
                  <h2 className="text-lg font-medium mb-2 text-[#6D6D6D]">
                    Quick Edit -{" "}
                    {activeNode?.data?.template_id
                      ? allAvailableTemplates.find(
                          t => t.template_id === activeNode?.data?.template_id,
                        )?.name ?? ""
                      : ""}
                  </h2>
                  <hr className="mb-4" />
                  {["Send Email", "Send InMail"].includes(title) && (
                    <>
                      <h2 className="mb-2  text-[#454545]">Subject:</h2>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 rounded text-sm text-[#454545] focus:outline-none"
                        value={templateSubject}
                        onChange={e => setTemplateSubject(e.target.value)}
                      />
                    </>
                  )}
                  <h2 className="mb-2  text-[#454545]">Body:</h2>
                  {["Send Email"].includes(title) ? (
                    <div className="w-full">
                      <style>
                        {`
                .sun-editor {
                  border: 1px solid #7E7E7E !important;
                  border-radius: 6px !important;
                  overflow: hidden;
                  font-family: inherit !important;
                }
                .sun-editor .se-toolbar {
                  background-color: #f9f9f9;
                  outline: none;
                }
                .sun-editor .se-wrapper .se-placeholder {
                   color: #6D6D6D !important;
                   font-family: inherit !important;
                   font-size: 0.875rem !important;
                }
                .sun-editor .se-wrapper .sun-editor-editable {
                   font-family: inherit !important;
                   font-size: 0.875rem !important;
                   color: #6D6D6D !important;
                }
              `}
                      </style>
                      <SunEditor
                        height="300px" // Set a height for the editor
                        setContents={templateBody}
                        onChange={setTemplateBody}
                        setOptions={{
                          mode: "classic",
                          rtl: false,
                          katex: "window.katex",
                          videoFileInput: false,
                          tabDisable: false,
                          buttonList: [
                            ["undo", "redo"],
                            ["formatBlock"], // Headers
                            ["bold", "underline", "italic", "strike"],
                            ["list", "align"],
                            ["link"],
                            ["removeFormat"],
                            ["fullScreen", "codeView"],
                          ],
                          minHeight: "200px",
                          height: "auto",
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      rows={6}
                      className="w-full border border-gray-300 p-2 rounded text-sm text-[#454545] focus:outline-none"
                      value={templateBody}
                      onChange={e => setTemplateBody(e.target.value)}
                    />
                  )}

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
                    onChange={e => {
                      const value = Math.max(0, Number(e.target.value));
                      updateNodeAndSync(activeNodeId, {
                        delay: { ...activeNode?.data?.delay, days: value },
                      });
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
                      updateNodeAndSync(activeNodeId, {
                        delay: { ...activeNode?.data?.delay, hours: value },
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Max/Day Slider - only for action nodes */}
            {activeNode?.data?.category !== "condition" && (
              <div>
                <div className="text-[#6D6D6D] mb-1">
                  Max/Day{" "}
                  <span className="text-xs">
                    (Recommended {activeNode?.data?.recommended ?? 50})
                  </span>
                  <span className="text-right float-right text-[#0387FF] font-medium">
                    {tempLimit !== null ? tempLimit : (activeNode?.data?.limit ?? 50)}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={tempLimit !== null ? tempLimit : (activeNode?.data?.limit ?? 50)}
                  onChange={e => {
                    setTempLimit(Number(e.target.value));
                  }}
                  onMouseUp={() => {
                    if (tempLimit !== null) {
                      updateNodeAndSync(activeNodeId, { limit: tempLimit });
                      setTempLimit(null);
                    }
                  }}
                  onTouchEnd={() => {
                    if (tempLimit !== null) {
                      updateNodeAndSync(activeNodeId, { limit: tempLimit });
                      setTempLimit(null);
                    }
                  }}
                  className="w-full appearance-none h-2 bg-[#E0E0E0] rounded relative slider-thumb-only"
                />
              </div>
            )}

            {/* Stop Workflow - only for action nodes */}
            {activeNode?.data?.category !== "condition" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stop-on-reply"
                  checked={activeNode?.data?.stop_on_reply ?? false}
                  onChange={e => {
                    const checked = e.target.checked;
                    updateNodeAndSync(activeNodeId, { stop_on_reply: checked });
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
            )}
          </div>
        )}

        <div className="flex float-end items-center gap-2.5 pr-7.5 pt-5 absolute right-0 z-10">
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="cursor-pointer"
          >
            <Undo />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="cursor-pointer"
          >
            <Redo />
          </button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgesConnectable={true}
          edgeTypes={edgeTypes}
          nodesConnectable={true}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onPaneClick={() => {
            setShow(false);
            setActiveNodeId(null);
          }}
        >
          <Background variant="dots" gap={15} size={2} color="#EFEFEF" />
          <CustomControl isFullscreen={isFullscreen} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowEditor;
