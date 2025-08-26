// components/TooltipInfoIcon.jsx
import { useState } from "react";
import { TooltipInfoIcon } from "../../../components/Icons.jsx";

const TooltipInfo = ({ text = "Info", className = "" }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`inline-flex items-center cursor-pointer ${className}`}>
      {/* Icon */}
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        <TooltipInfoIcon />
      </div>

      {/* Tooltip */}
      {visible && (
        <div className="absolute w-[200px]  flex  bottom-6 right-0  bg-black text-white text-xs px-2 py-1 rounded shadow z-10 ">
          {text}
        </div>
      )}
    </div>
  );
};

export default TooltipInfo;
