import React, { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import CustomNode from "./CustomNode";
import "@xyflow/react/dist/style.css";

import CustomEdge from "./CustomEdge";
import CustomControl from "./CustomControl";
import {
  CircledAdd,
  Invite,
  Message,
  View,
} from "../../../../components/Icons";

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

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef(null);

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

  const onLoad = useCallback(rfi => {
    reactFlowInstance.current = rfi;
    rfi.fitView({ padding: 0.2 });
  }, []);

  return (
    <div
      className="w-full h-screen bg-[#FFFFFF] border border-[#6D6D6D]"
      id="reactflow-wrapper"
    >
      <ReactFlow
        style={{ height: "100%", width: "100%" }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onLoad={onLoad}
      >
        <CustomControl />
        <Background variant="dots" gap={15} size={2} color="#EFEFEF" />
      </ReactFlow>
    </div>
  );
}
