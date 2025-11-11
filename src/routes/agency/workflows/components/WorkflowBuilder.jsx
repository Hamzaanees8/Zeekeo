import { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  edgeTypes,
  rebuildFromWorkflow,
} from "../../../../utils/workflow-helpers";
import CustomControl from "./CustomControl";
import CustomNode from "./CustomNode";

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
  const { fitView } = useReactFlow();
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
  useEffect(() => {
    fitView({ padding: 0.5 });
  }, [fitView, nodes, edges]);
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
      //onInit={onLoad}
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
