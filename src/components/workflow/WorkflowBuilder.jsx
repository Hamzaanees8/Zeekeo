import React, { useCallback, useRef, useState, useEffect } from "react";
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
import CustomControl from "../../routes/campaigns/create-campaign/components/CustomControl";
import {
  initialEdges,
  initialNodes,
  rebuildFromWorkflow,
  edgeTypes,
} from "../../utils/workflow-helpers";

const nodeTypes = {
  workflow: ({ id, data }) => {
    //  console.log(data)
    return <CustomNode id={id} data={data} />;
  },
};

export default function WorkflowBuilder({ data, onNodeSelect }) {
  const [workflowId, setWorkflowId] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useNodesState([]);
  const reactFlowInstance = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    if (data?.workflow) {
      console.log("before rebuld..", data?.workflow);
      setWorkflowId(data?.workflow_id || null);

      const { nodes: newNodes, edges: newEdges } = rebuildFromWorkflow(
        data?.workflow,
      );
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data]);

  const onLoad = useCallback(rfi => {
    reactFlowInstance.current = rfi;
    rfi.fitView({ padding: 0.2 });
  }, []);

  const onNodeClick = useCallback(
    (event, node) => {
      if (!onNodeSelect) return;

      //  const allowedTypes = ["linkedin_invite", "linkedin_inmail", "linkedin_message", "email_message"];

      //  if (allowedTypes.includes(node.data?.type)) {
      onNodeSelect?.(node); // send full node to parent
      // } else {
      //    onNodeSelect?.(null);
      //  }
    },
    [onNodeSelect],
  );

  return (
    <div
      className="w-full h-screen bg-[#FFFFFF] border border-[#6D6D6D] rounded-[8px] shadow-md"
      id="reactflow-wrapper"
    >
      <ReactFlow
        nodes={nodes.map(n => ({
          ...n,
          data: { ...(n.data || {}), viewMode: true },
        }))}
        edges={edges.map(e => ({
          ...e,
          data: { ...(e.data || {}), viewMode: true },
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onLoad={onLoad}
        onNodeClick={onNodeClick}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <CustomControl />
        <Background variant="dots" gap={15} size={2} color="#EFEFEF" />
      </ReactFlow>
    </div>
  );
}
