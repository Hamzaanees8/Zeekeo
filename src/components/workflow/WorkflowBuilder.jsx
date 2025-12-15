import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
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

const nodeTypes = (activeNodeId, highlightActive) => ({
  workflow: ({ id, data }) => (
    <CustomNode
      id={id}
      data={data}
      activeNodeId={activeNodeId}
      highlightActive={highlightActive}
    />
  ),
});

function WorkflowContent({
  data,
  onNodeSelect,
  activeNodeId = null,
  highlightActive = false,
}) {
  const [workflowId, setWorkflowId] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useNodesState([]);
  const reactFlowInstance = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);
  const hasInitializedViewport = useRef(false);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (data?.workflow) {
      setWorkflowId(data?.workflow_id || null);

      const { nodes: newNodes, edges: newEdges } = rebuildFromWorkflow(
        data?.workflow,
      );
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data]);

  // Adjust viewport only once on initial mount - don't reset on workflow changes
  useEffect(() => {
    if (rfInstance && nodes.length > 0 && !hasInitializedViewport.current) {
      hasInitializedViewport.current = true;
      // Small delay to ensure nodes are rendered
      setTimeout(() => {
        rfInstance.fitView({ padding: 0.1, maxZoom: 1 });

        // After fitting, adjust to position at top
        setTimeout(() => {
          const viewport = rfInstance.getViewport();
          const minY = Math.min(...nodes.map(n => n.position.y));
          rfInstance.setViewport({
            x: viewport.x,
            y: -minY * viewport.zoom + 50,
            zoom: viewport.zoom,
          });
        }, 50);
      }, 10);
    }
  }, [rfInstance, nodes]);

  const onInit = useCallback(rfi => {
    setRfInstance(rfi);
  }, []);

  /*   useEffect(() => {
    fitView({ padding: 0.5 });
  }, [fitView, nodes, edges]); */
  // const onLoad = useCallback(rfi => {
  //   reactFlowInstance.current = rfi;
  //   rfi.fitView({ padding: 0.1 });
  //   const currentZoom = rfi.getZoom();
  //   if (currentZoom > 1) {
  //     rfi.setViewport({ x: 0, y: 0, zoom: 1 });
  //   }
  // }, []);

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

  console.log(activeNodeId);

  return (
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
      nodeTypes={nodeTypes(activeNodeId, highlightActive)}
      edgeTypes={edgeTypes}
      onInit={onInit}
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
  );
}

export default function WorkflowBuilder(props) {
  return (
    <div className="w-full h-full bg-[#FFFFFF] border border-[#6D6D6D] rounded-[8px] shadow-md">
      <ReactFlowProvider>
        <WorkflowContent {...props} />
      </ReactFlowProvider>
    </div>
  );
}
