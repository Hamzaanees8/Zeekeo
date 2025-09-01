import React, { useState } from "react";
import { TooltipInfoIcon } from "../../../../components/Icons";

const LeaderBoard = ({ topAcceptanceRates, topReplyRates, text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="bg-white border border-[#7E7E7E] p-4 w-[280px] h-[290px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-medium text-[#454545]">
          Agency User Leaderboards{" "}
          <span className="text-[#00b4d8]">(30 days)</span>
        </h2>
        <div
          className="relative"
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
        >
          <TooltipInfoIcon />
          {visible && (
            <div className="absolute bottom-6 right-0 w-[200px] bg-black text-white text-xs px-2 py-1 rounded shadow z-10">
              {text}
            </div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <h3 className="text-[10px] font-bold text-[#454545] mb-1">
          Top Acceptance Rates
        </h3>
        <ul className="list-none p-0 m-0 space-y-1">
          {topAcceptanceRates.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="text-[#25C396] text-[10px] font-bold mr-2">
                •
              </span>
              <span className="font-bold text-[10px] text-[#25C396] mr-1">
                {item.percentage}
              </span>
              <span className="text-[10px] text-[#454545] font-normal">
                - {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[10px] font-bold text-[#454545] mb-1">
          Top Reply Rates
        </h3>
        <ul className="list-none p-0 m-0 space-y-1">
          {topReplyRates.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="text-[#25C396] text-[10px] font-bold mr-2">
                •
              </span>
              <span className="font-bold text-[10px] text-[#25C396] mr-1">
                {item.percentage}
              </span>
              <span className="text-[10px] text-[#454545] font-normal">
                - {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeaderBoard;
