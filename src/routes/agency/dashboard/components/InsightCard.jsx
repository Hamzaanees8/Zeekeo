import React, { useState } from "react";
import {
  LeftNavigate,
  RightNavigate,
  TooltipInfoIcon,
} from "../../../../components/Icons";

const InsightCard = ({ title, data, text }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [visible, setVisible] = useState(false);
  const handleNext = () => {
    if ((page + 1) * rowsPerPage < data.length) {
      setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const startIndex = page * rowsPerPage;
  const visibleData = data.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div
      className="bg-white p-3"
      style={{
        width: "355px",
        border: "1px solid #7E7E7E",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-normal text-[#1E1D1D]">{title}</h2>
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

      <div
        style={{
          borderBottom: "1px solid #7E7E7E",
          marginTop: "8px",
          marginBottom: "8px",
        }}
      />

      {/* Data rows */}
      <div className="flex-1 overflow-y-auto">
        {visibleData.map((item, index) => (
          <div
            key={index}
            className="flex items-center py-3 border-b border-gray-200 last:border-b-0"
          >
            <span className="text-[#0387FF] font-medium text-[20px] font-urbanist basis-1/6">
              {item.value}
            </span>
            <div className="flex flex-col">
              <span className="text-[#454545] text-xs">{item.campaign}</span>
              {item.type && (
                <span className="text-[#454545] text-xs">{item.type}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center justify-end mt-2 gap-2.5">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="disabled:opacity-50 cursor-pointer"
        >
          <LeftNavigate className="text-[#6D6D6D]" />
        </button>
        <p className="text-[#6D6D6D] text-xs">Next</p>
        <button
          onClick={handleNext}
          disabled={(page + 1) * rowsPerPage >= data.length}
          className="disabled:opacity-50 cursor-pointer"
        >
          <RightNavigate className="text-[#6D6D6D]" />
        </button>
      </div>
    </div>
  );
};

export default InsightCard;
