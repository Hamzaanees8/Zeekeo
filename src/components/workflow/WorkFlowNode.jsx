import React from "react";
import { Handle, Position } from "@xyflow/react";
import { CircleCross, CircleCheck, Clock, CircleCross2 } from "../Icons";

const WorkflowNode = ({
  id,
  data,
  deleteNode,
  setDelay,
  setMaxPerDay,
  setShow,
  setStopOnReply,
  setTitle,
  setSelectedNodes,
  setActiveNodeId,
  activeNodeId,
  setNodes,
}) => {
  const Icon = data.icon;
  const isCondition = data.category === "condition";
  const isStart = data.type === "start";
  const isActive = id === activeNodeId;

  console.log('reply', data.reply)

  if (isStart) {
    return (
      <div className="relative flex flex-col items-center justify-center">
        <div className="text-[#454545] text-base font-semibold">START</div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: "#0077B6", width: 8, height: 8, marginTop: 4 }}
        />
      </div>
    );
  }
  const handleClick = () => {
    setShow(true);
    setTitle(data.title);
    setMaxPerDay(data.limit);
    setDelay({ ...data.delay });
    setStopOnReply(data.reply);
    setActiveNodeId(id);
  };

  return (
    <div
      className={`relative min-w-[150px] h-[45px] flex items-center w-auto rounded-[4px] shadow-md cursor-pointer
    ${isActive ? "ring-2 ring-[#0387FF] bg-white" : "bg-[#EFEFEF]"}`}
      style={{ overflow: "visible" }}
      onClick={handleClick}
    >
      {/* Top-right delete icon */}
      {!data.isLast && !data.hideDelete &&  (
        <div
          className="absolute top-[3px] right-[3px] cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            deleteNode(id);
          }}
        >
          <CircleCross className="w-2 h-2 text-[#6D6D6D]" />
        </div>
      )}

      {/* Left colored icon bar */}
      <div
        className="flex w-[30px] items-center justify-center h-full rounded-tl-[4px] rounded-bl-[4px] shadow-md"
        style={{ backgroundColor: data.color }}
      >
        {Icon && <Icon className="w-4 h-4" />}
      </div>

      {/* Main content */}
      <div className="flex flex-col items-start gap-y-[4px] px-[6px] py-[8px] h-full w-full">
        {/* Title */}
        <div className="flex items-center gap-2 font-bold text-[9px] text-[#6D6D6D]">
          {data.title}
        </div>

        {/* Subtitle + Time */}
        <div className="flex items-center gap-1 text-[8px] font-bold">
          <Clock className="w-3 h-3 text-[#6D6D6D]" />
          <span className="text-[#454545]">{data.subtitle}</span>
          {data?.delay?.days === 0 && data?.delay?.hours === 0 ? (
            <span className="text-[#6D6D6D]">: Immediately</span>
          ) : (
            <span className="text-[#6D6D6D]">
              :{" "}
              {data?.delay?.days > 0 &&
                `${data.delay.days} day${data.delay.days > 1 ? "s" : ""}`}
              {data?.delay?.days > 0 && data?.delay?.hours > 0 && ", "}
              {data?.delay?.hours > 0 &&
                `${data.delay.hours} hour${data.delay.hours > 1 ? "s" : ""}`}
            </span>
          )}
        </div>
      </div>

      {/* Top input handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#0096C7", width: 8, height: 8, zIndex: -1 }}
      />

      {/* Bottom output handles */}
      {isCondition ? (
        <>
          {/* YES Handle with ✔️ icon */}
          <div
            className="absolute"
            style={{ left: "40%", bottom: -6, width: 10, height: 10 }}
          >
            <div
              className="relative w-full h-full"
              style={{ pointerEvents: "auto" }}
            >
              <Handle
                type="source"
                id="check"
                position={Position.Bottom}
                connectable={true}
                style={{
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  bottom: "auto",
                  top: "-50%",
                  position: "absolute",
                  zIndex: 1,
                  pointerEvents: "auto",
                }}
              />
              <CircleCheck className="w-full h-full text-[#0096C7] p-0" />
            </div>
          </div>

          {/* NO Handle with ❌ icon */}
          <div
            className="absolute"
            style={{ left: "60%", bottom: -6, width: 10, height: 10 }}
          >
            <div
              className="relative w-full h-full"
              style={{ pointerEvents: "auto" }}
            >
              <Handle
                type="source"
                id="cross"
                position={Position.Bottom}
                connectable={true}
                style={{
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  bottom: "auto",
                  top: "-50%",
                  position: "absolute",
                  zIndex: 1,
                  pointerEvents: "auto",
                }}
              />
              <CircleCross2 className="w-full h-full text-[#FF6B6B] p-0" />
            </div>
          </div>
        </>
      ) : (
        !data.isLast && (
          <Handle
            type="source"
            position={Position.Bottom}
            style={{
              background: "#0096C7",
              width: 8,
              height: 8,
              zIndex: -1,
            }}
          />
        )
      )}
    </div>
  );
};

export default WorkflowNode;
