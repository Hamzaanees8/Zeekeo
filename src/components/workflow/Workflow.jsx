import React, { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import {
  CircledAdd,
  Invite,
  Message,
  View,
} from "../Icons";
import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import CustomControl from "../../routes/campaigns/create-campaign/components/CustomControl";

const nodeTypes = { custom: CustomNode };
const edgeTypes = {
  custom: CustomEdge,
};
const initialNodes = [
  {
    id: "start",
    type: "input", // or leave default
    position: { x: 300, y: 0 },
    data: {
      label: (
        <div className="text-[16px] text-[#454545] font-[600]">START</div>
      ),
    },
    style: {
      background: "transparent",
      border: "none",
      boxShadow: "none",
    },
  },
  {
    id: "1",
    type: "custom",
    position: { x: 288, y: 120 },
    data: {
      title: "If Connected",
      subtitle: "Check For",
      time: ": Immediately",
      color: "#0077B6",
      delay: { hours: 0, days: 0 },
      icon: CircledAdd,
    },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 375, y: 240 },
    data: {
      title: "View",
      subtitle: "Wait For",
      time: ": Immediately",
      color: "#038D65",
      icon: View,
      delay: { hours: 0, days: 0 },
    },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 375, y: 360 },
    data: {
      title: "Invite",
      subtitle: "Wait For",
      time: ": 1 Hour",
      color: "#038D65",
      icon: Invite,
      delay: { hours: 1, days: 0 },
    },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 375, y: 480 },
    data: {
      title: "If Connected",
      subtitle: "Check For",
      time: ": 5 Days",
      color: "#0077B6",
      icon: CircledAdd,
      delay: { hours: 0, days: 5 },
    },
  },
  {
    id: "5",
    type: "custom",
    position: { x: 125, y: 450 },
    data: {
      id: "5",
      title: "Send Message",
      isLast: true,
      subtitle: "Wait For",
      time: ": Immediately",
      color: "#038D65",
      icon: Message,
      delay: { hours: 0, days: 0 },
    },
  },
];

const initialEdges = [
  {
    id: "e-start-1",
    source: "start",
    target: "1",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e1-2",
    source: "1",
    sourceHandle: "check", // ✅ Explicitly use 'check'
    target: "2",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e4-5",
    source: "4",
    sourceHandle: "cross", // ✅ Explicitly use 'cross'
    target: "5",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
];

export default function Workflow({ onNodeSelect }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isSendMessageSelected, setIsSendMessageSelected] = useState(false);

  const onConnect = useCallback(
    params => {
      const sourceNode = nodes.find(n => n.id === params.source);

      const isDecisionNode = sourceNode?.data?.title === "If Connected";
      const isFromCheckOrCross =
        params.sourceHandle === "check" || params.sourceHandle === "cross";

      if (isDecisionNode && isFromCheckOrCross) {
        const alreadyConnected = edges.some(
          e =>
            e.source === params.source &&
            (e.sourceHandle === "check" || e.sourceHandle === "cross"),
        );

        if (alreadyConnected) {
          alert("Only one of ✔️ (check) or ❌ (cross) can be connected.");
          return;
        }
      }

      setEdges(eds =>
        addEdge(
          {
            ...params,
            animated: false,
            style: { stroke: "#0096C7" },
          },
          eds,
        ),
      );
    },
    [nodes, edges, setEdges],
  );
  const onNodeClick = useCallback(
    (event, node) => {
      const allowedTitles = ["Send Message", "Send Email", "Send InMail"]; // add more titles here

      if (allowedTitles.includes(node.data?.title)) {
        setIsSendMessageSelected(true);
        setSelectedNodeId(node.id);
        onNodeSelect?.(node); // send full node to parent
      } else {
        setIsSendMessageSelected(false);
        setSelectedNodeId(null);
        onNodeSelect?.(null);
      }
    },
    [onNodeSelect],
  );
  const onLoad = useCallback(rfi => {
    reactFlowInstance.current = rfi;
    rfi.fitView({ padding: 0.2 });
  }, []);

  return (
    <div
      id="reactflow-wrapper"
      className="w-full h-screen relative bg-[#FFFFFF] border border-[#6D6D6D]"
    >
      <ReactFlow
        nodes={nodes.map(node => {
          if (node.id === "5" && isSendMessageSelected) {
            return {
              ...node,
              style: {
                ...node.style,
                border: `2px solid ${node.data.color}`,
              },
            };
          }
          return node;
        })}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onLoad={onLoad}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNodeId(null)}
      >
        <CustomControl />
        <Background variant="dots" gap={15} size={2} color="#EFEFEF" />
      </ReactFlow>
    </div>
  );
}
