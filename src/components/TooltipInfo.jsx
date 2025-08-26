import { useState } from "react";
import { TooltipInfoIcon } from "./Icons.jsx";

const TooltipInfo = ({ text = "Info", className = "", isLast = false }) => {
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
        <div
          className={`absolute w-[150px] min-h-[50px] bottom-6 ${
            isLast ? "right-0" : "left-[-70px]"
          } bg-black text-white text-xs px-2 py-1 rounded shadow z-10`}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default TooltipInfo;
