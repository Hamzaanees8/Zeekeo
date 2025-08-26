import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { CircleCross, CircleCross2 } from "../Icons";

export default function WorkFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data = {}
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { setEdges } = useReactFlow();
  const onEdgeClick = () => {
    setEdges(edges => edges.filter(edge => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: "#0077B6", strokeWidth: 1 }}
      />
       {!data?.viewMode && (
      <EdgeLabelRenderer>
        <div
          className="absolute z-[1000] pointer-events-auto "
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <button
            className="bg-white border flex items-center justify-center border-white rounded-full w-[12px] h-[12px] cursor-pointer "
            onClick={onEdgeClick}
          >
            <CircleCross2 />
          </button>
        </div>
      </EdgeLabelRenderer>
      )}
    </>
  );
}
