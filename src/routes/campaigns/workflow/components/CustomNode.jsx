import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  CircleCheck,
  CircleCross,
  CircleCross2,
  Clock,
} from "../../../../components/Icons";

export default function CustomNode({ data }) {
  const Icon = data.icon;
  const isDecisionNode = data.title === "Check if connected"; // or use data.isDecisionNode

  return (
    <div className="relative bg-[#EFEFEF] w-[175px] h-[45px] flex items-center">
      {/* Top-right delete icon */}
      {!data.isLast && (
        <div className="absolute top-0 right-0.5 cursor-pointer">
          <CircleCross className="w-2 h-2 text-[#6D6D6D]" />
        </div>
      )}

      {/* Left Icon */}
      <div
        className="flex w-[26px] items-center justify-center h-full"
        style={{ backgroundColor: data.color }}
      >
        {Icon && <Icon />}
      </div>

      {/* Main content */}
      <div className="flex flex-col items-start gap-y-[5px] px-[6px] py-[8px] h-full">
        <div className="flex items-center gap-2 font-bold text-[9px] text-[#6D6D6D]">
          {data.title}
        </div>
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

        {/* Top connection handle */}
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "#0096C7", width: 8, height: 8, zIndex: -1 }}
        />

        {/* Bottom handles */}
        {isDecisionNode ? (
          <>
            {/* YES Handle with ✔️ icon */}
            <div
              className="absolute"
              style={{ left: "40%", bottom: -6, width: 10, height: 10 }}
            >
              <div className="relative w-full h-full">
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
              <div className="relative w-full h-full">
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
    </div>
  );
}
