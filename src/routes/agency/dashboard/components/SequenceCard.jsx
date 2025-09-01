import React, { useState } from "react";
import { TooltipInfoIcon } from "../../../../components/Icons";

const SequenceCard = ({ data, text, title }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="bg-white border border-[#7E7E7E] p-4 w-[250px] h-[290px]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xs font-medium text-[#454545]">{title}</h2>
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
      <div className="space-y-4">
        {data.map((item, index) => (
          <div className="w-full" key={index}>
            <div className="flex justify-between text-xs text-[#636D79] mb-1 font-medium">
              <span>{item.label}</span>
              <span>
                {item.value} ({item.percentage})
              </span>
            </div>
            <div className="w-full bg-[#EFEFEF] rounded-full h-2.5">
              <div
                className="bg-[#0077B6] h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: item.percentage }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SequenceCard;
